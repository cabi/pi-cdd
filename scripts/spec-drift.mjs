#!/usr/bin/env node
// spec-drift — the lean-verified drift guard (C5 companion).
//
// Premise: code is the truth, the spec is the index. This script keeps the
// index honest. Same script, three doors, nearest to where drift starts:
//   1. apply preflight  — the schema's apply instruction runs it before `/cdd-archive`
//   2. commit door      — .githooks/pre-commit runs it with --staged
//                         (message-independent checks); .githooks/commit-msg
//                         runs it with --commit-msg "$1" (L2 travel with the
//                         mechanical exemption, staged-M integrity). The
//                         trailer is visible only to the second hook, so a
//                         mechanical commit never needs --no-verify.
//
// L1 traceability (always, no git needed):
//   - every `Verified by <path>` pin in every spec resolves to an existing file
//   - every file under tests/acceptance/ (or test/acceptance/) is pinned by some spec
//
// L2 staleness (living specs with git history):
//   - a requirement may carry `Code: <glob>` lines; if a matching file was
//     committed after the spec file last changed, the spec is stale — the code
//     and the spec must travel together.
//     and the spec must travel together. Commits marked mechanical (a
//     `Mechanical-Change: <reason>` trailer or a `[mechanical]` subject —
//     lint --fix sweeps, codemods, framework updates) do not advance the
//     clock: they carry no contract information.
//
// M mechanical integrity (full scan): a commit claiming to be mechanical
//     must not touch cdd/specs/ or the acceptance tests. Behavior
//     change? Not mechanical — contract travels with code, through the loop.
//
// O single owner: a file claimed by two specs' Code: globs is an unowned
//     helper — narrow the globs, or give the helper its own capability.
//
// --staged scopes the checks to the current index (the commit door):
//   staged acceptance-test deletions, staged orphan acceptance tests, or staged
//   code matching Code: globs fail unless the spec is updated in the same commit.
// L3 scale (living changes): a task list past 12 tracked tasks is a
//     decomposition signal, not a work plan — long checklists are where
//     model execution stops being reliable (mid-list skips, phantom
//     ticks). The split procedure lives in the schema's tasks
//     instruction. A recorded `split-considered:` decision passes;
//
// A architectural decisions (cdd/decisions/, full scan) — memory beside
//     the contract, created only when a decision is hard to reverse,
//     surprising without context, a real trade-off, and crosses capability
//     boundaries:
//   A0 lifecycle — status is valid, supersedes resolves, and a superseded
//     target actually flipped its status in the same commit
//   A1 citation on touch — an open change whose code overlaps an accepted
//     decision's `code:` globs must cite that ADR (follow it) or supersede it
//   A2 staleness — code under a decision's globs moving past the decision is
//     silent rot: reconfirm (touch the decision in the same commit) or
//     supersede it with a new ADR
//     archived changes are frozen history and are never nagged.
//
//
// exit 0 = no drift · 1 = drift found · 2 = usage/setup error

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ADR_STATUSES, CODE_LINE, PIN_COMMENT, TASK_LIMIT, checkFenceBody, extractFences, isPlaceholderPin, parseDecisionFrontmatter, splitTaskSections } from './grammar-law.mjs';

const argv = process.argv.slice(2);
const msgIdx = argv.indexOf('--commit-msg');
const msgFile = msgIdx !== -1 ? argv[msgIdx + 1] : null;
const preCommit = argv.includes('--staged');
// --staged (pre-commit) sees the index but never the message: it runs only
// message-independent checks. --commit-msg <file> (commit-msg hook) sees both:
// it runs the message-dependent ones — the L2 travel check, with the
// mechanical exemption, and the M integrity check on the staged set.
const staged = preCommit || msgFile !== null;
const unknown = argv.filter((a, i) => a !== '--staged' && a !== '--commit-msg' && argv[i - 1] !== '--commit-msg');
if (unknown.length || (msgIdx !== -1 && !msgFile)) {
  console.error(`usage: spec-drift.mjs [--staged | --commit-msg <file>]  (unknown args: ${unknown.join(' ')})`);
  process.exit(2);
}
const mechanical = msgFile
  ? /^Mechanical-Change:|^\[mechanical\]/m.test(fs.readFileSync(msgFile, 'utf8'))
  : false;

// --- locate the project root (the dir that owns cdd/) --------------------
function findRoot(start) {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, 'cdd'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}
const root = findRoot(process.cwd());
if (!root) {
  console.error('spec-drift: no cdd/ directory found upward from cwd');
  process.exit(2);
}

// --- git helpers ----------------------------------------------------------------
function git(args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}
const isRepo = git(['rev-parse', '--is-inside-work-tree']) === 'true';

// commits marked mechanical (lint sweeps, codemods, framework updates) carry
// no contract information — they advance neither side of the staleness clock
const MECH_GREP = '^Mechanical-Change:|^\\[mechanical\\]';

function lastCommit(file) {
  return (
    git([
      'log', '-1', '--format=%H',
      '--extended-regexp', '--grep', MECH_GREP, '--invert-grep',
      '--', file,
    ]) || null
  );
}

// --- collect specs: pins + code globs -------------------------------------------
const issues = [];
const pinRe = new RegExp(PIN_COMMENT.source, 'gm'); // the one pin dialect (grammar-law.mjs)

function specsIn(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) specsIn(p, acc);
    else if (e.name === 'spec.md') acc.push(p);
  }
  return acc;
}
const rel = (p) => path.relative(root, p).split(path.sep).join('/');
const livingSpecs = specsIn(path.join(root, 'cdd', 'specs')).map(rel);
const deltaSpecs = specsIn(path.join(root, 'cdd', 'changes'))
  .map(rel)
  .filter((r) => !r.startsWith('cdd/archive/')); // archive = frozen history, never a claimant
const allSpecs = [...livingSpecs, ...deltaSpecs];

/** Resolve a pin the way pi-cdd layouts work: project root first (living
 *  specs), then the change dir the spec belongs to (in-flight changes). */
function pinCandidates(pin, specRel) {
  const out = [pin];
  const m = specRel.match(/^cdd\/changes\/[^/]+\//);
  if (m) out.push(m[0] + pin);
  return out;
}
function pinResolve(pin, specRel) {
  for (const c of pinCandidates(pin, specRel)) {
    if (fs.existsSync(path.join(root, c))) return c;
  }
  return null;
}

const pinsOf = new Map(); // specRel -> [{ pin, resolved }]
const codeGlobs = new Map(); // specRel -> [globs]
for (const specRel of allSpecs) {
  const text = fs.readFileSync(path.join(root, specRel), 'utf8');
  // Pins live inside the gherkin fences as "# Verified by:" comments
  // (ADR-0006); markdown outside fences is blanked so a quoted phrase
  // cannot pose as a pin.
  let inFence = false;
  const masked = text
    .split('\n')
    .map((l) => {
      if (!inFence && /^\s*```\s*gherkin\s*$/.test(l)) {
        inFence = true;
        return '';
      }
      if (inFence) {
        if (/^\s*```\s*$/.test(l)) inFence = false;
        return l;
      }
      return '';
    })
    .join('\n');
  pinsOf.set(
    specRel,
    [...masked.matchAll(pinRe)].map((m) => ({ pin: m[1], resolved: null }))
  );
  for (const p of pinsOf.get(specRel)) p.resolved = pinResolve(p.pin, specRel);
  codeGlobs.set(
    specRel,
    [...text.matchAll(CODE_LINE)].flatMap((m) =>
      m[1]
        .split(/[,\s]+/)
        .filter(Boolean)
        .map((g) => g.replace(/`/g, ''))
    )
  );
}

// --- capability model: a living spec plus its open deltas are ONE spec line ---
const changeOf = (specRel) => (specRel.match(/^cdd\/changes\/([^/]+)\//) ?? [])[1] ?? '';
const capOf = (specRel) =>
  specRel
    .replace(/^cdd\/specs\//, '')
    .replace(/^cdd\/changes\/[^/]+\/specs\//, '')
    .replace(/\/spec\.md$/, '');
const pinnedAbs = new Set(
  allSpecs.flatMap((s) => pinsOf.get(s).map((p) => p.resolved)).filter(Boolean)
);

// --- acceptance-test dirs (convention) ------------------------------------------
const accDirs = ['tests/acceptance', 'test/acceptance']
  .map((d) => path.join(root, d))
  .filter((d) => fs.existsSync(d));
function accFiles(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) accFiles(p, acc);
    else acc.push(p);
  }
  return acc;
}
const accRel = accDirs.flatMap((d) => accFiles(d).map(rel));

function globToRe(glob) {
  const re = glob
    .split('**')
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*'))
    .join('.*');
  return new RegExp(`^${re}$`);
}

// ==============================================================================
// L1 — forward: every pin resolves (staged mode: only specs staged in this commit)
// ==============================================================================
const stagedSet = new Set(
  staged && isRepo ? (git(['diff', '--cached', '--name-only']) ?? '').split('\n').filter(Boolean) : []
);
const specsToCheck = preCommit ? allSpecs.filter((s) => stagedSet.has(s)) : allSpecs;
// A placeholder pin (scaffold marker, grammar-law.mjs) inside an OPEN delta is
// template text, not a claim: skip it here and report the skip after the
// verdict — a skip is never silent. Living specs (and archive = frozen
// history, already excluded from deltaSpecs) keep full strictness, and an
// unrecognized marker shape fails L1 everywhere.
const l2StaleFiles = []; // staleness-flagged files, for the expected-mid-Close hint — see filesClaimedByChange
// One matching pass, two readers: the A1 citation check and the L2
// expected-mid-Close hint both ask "which of these files does each open
// change's delta Code: globs claim?" — answer it once, as a map of open
// change name -> Set of matched files.
const filesClaimedByChange = (files) => {
  const claims = new Map();
  for (const specRel of deltaSpecs) {
    const globs = codeGlobs.get(specRel) ?? [];
    if (!globs.length) continue;
    const res = globs.map(globToRe);
    const change = specRel.split('/')[2];
    for (const f of files) {
      if (res.some((re) => re.test(f))) {
        if (!claims.has(change)) claims.set(change, new Set());
        claims.get(change).add(f);
      }
    }
  }
  return claims;
};
const placeholderSkips = new Map(); // open change name -> skipped pin count
for (const specRel of specsToCheck) {
  const openChange = specRel.match(/^cdd\/changes\/([^/]+)\//)?.[1] ?? null;
  for (const { pin, resolved } of pinsOf.get(specRel)) {
    if (!resolved) {
      if (openChange && isPlaceholderPin(pin)) {
        placeholderSkips.set(openChange, (placeholderSkips.get(openChange) ?? 0) + 1);
        continue;
      }
      issues.push(`[L1] ${specRel} pins "${pin}" but that file does not exist — restore the acceptance test or update the Verified by line`);
    }
  }
}

// ==============================================================================
// L1 — reverse: every acceptance test is pinned somewhere
// (staged mode: only files newly added to tests/acceptance/)
// ==============================================================================
if (preCommit && isRepo) {
  const stagedAdds = (git(['diff', '--cached', '--name-only', '--diff-filter=A']) ?? '')
    .split('\n')
    .filter(Boolean);
  for (const f of stagedAdds) {
    if (accDirs.some((d) => path.join(root, f).startsWith(d + path.sep)) && !pinnedAbs.has(f)) {
      issues.push(`[L1] new acceptance test ${f} is pinned by no spec — add a "Verified by" scenario or move it out of tests/acceptance/`);
    }
  }
} else {
  for (const f of accRel) {
    if (!pinnedAbs.has(f)) {
      issues.push(`[L1] orphan acceptance test ${f} — pinned by no spec; update the spec's scenarios or delete the test`);
    }
  }
}

// ==============================================================================
// L1 — the commit door: staged deletions of pinned tests
// ==============================================================================
if (preCommit && isRepo) {
  const stagedDels = (git(['diff', '--cached', '--name-only', '--diff-filter=D']) ?? '')
    .split('\n')
    .filter(Boolean);
  for (const f of stagedDels) {
    for (const specRel of allSpecs) {
      const hit = pinsOf
        .get(specRel)
        .some((p) => p.resolved === f || pinCandidates(p.pin, specRel).includes(f));
      if (hit && !stagedSet.has(specRel)) {
        issues.push(`[L1] staged deletion of ${f} but ${specRel} still pins it — update the spec in this same commit`);
      }
    }
  }
}

// ==============================================================================
// L2 — staleness: code matching Code: globs must not out-commit its spec
// ==============================================================================
// ==============================================================================
// H — hook health: this script knows --commit-msg. If the repo still runs the
// old single-hook scaffold, upgrading the script alone would silently drop
// the L2 travel check from the commit door (and without CI, from anywhere).
// ==============================================================================
if (isRepo && fs.existsSync(path.join(root, '.githooks', 'pre-commit')) && !fs.existsSync(path.join(root, '.githooks', 'commit-msg'))) {
  issues.push(`[H] .githooks has pre-commit but no commit-msg — the guard is newer than its hooks; re-run cdd_init (it refreshes an existing store and installs missing hooks) so code-and-spec travel and the mechanical lane stay enforced`);
}

const tracked = isRepo ? (git(['ls-files']) ?? '').split('\n').filter(Boolean) : [];

if (isRepo) {
  // applied specs must own real files (open deltas may point at future files)
  for (const specRel of livingSpecs) {
    const globs = codeGlobs.get(specRel);
    if (!globs.length) continue;
    const res = globs.map(globToRe);
    if (!tracked.some((f) => res.some((re) => re.test(f)))) {
      issues.push(`[L2] ${specRel} declares Code: ${globs.join(', ')} but no tracked file matches — fix the glob or remove the line`);
    }
  }
  // staleness is per CAPABILITY: the tip is the newest commit of the living
  // spec or any open delta. Code may out-commit older parts of the line
  // freely — that is what an in-flight change is.
  const caps = new Map(); // cap -> { specRels: [], globs: [] }
  for (const specRel of allSpecs) {
    const cap = capOf(specRel);
    if (!caps.has(cap)) caps.set(cap, { specRels: [], globs: [] });
    const c = caps.get(cap);
    c.specRels.push(specRel);
    c.globs.push(...(codeGlobs.get(specRel) ?? []));
  }
  for (const [cap, { specRels, globs }] of caps) {
    if (!globs.length) continue;
    const res = globs.map(globToRe);
    const matches = tracked.filter((f) => res.some((re) => re.test(f)));
    if (!matches.length) continue;
    if (msgFile && !mechanical) {
      const stagedCode = matches.filter((f) => stagedSet.has(f));
      if (stagedCode.length && !specRels.some((s) => stagedSet.has(s))) {
        issues.push(`[L2] staged code ${stagedCode.join(', ')} but no spec of ${cap} is in this commit — spec and code travel together (update the living spec or the change's delta)`);
      }
    } else if (!preCommit) {
      // topology L2 is committed-history law: lastCommit() cannot see this
      // commit's staged spec merge, so in pre-commit mode it can only fire
      // on the commit being made (the archive pair-commit's second commit
      // stages the merged spec without code — unreachable red, the PF-18
      // deadlock). The commit-msg door polices staged pairs mid-commit; the
      // full scan (door 3) owns topology here and at every checkpoint.
      const specCs = specRels.map(lastCommit).filter(Boolean);
      if (!specCs.length) continue; // nothing committed yet — nothing to compare
      for (const f of matches) {
        const codeC = lastCommit(f);
        // stale = EVERY spec of the capability predates the code commit
        // (topology, not wall-clock: git timestamps have second resolution)
        if (codeC && specCs.every((specC) => codeC !== specC && git(['merge-base', '--is-ancestor', specC, codeC]) === '')) {
          issues.push(`[L2] ${f} changed after every spec of ${cap} last changed — update the spec (scenario or Code line) and commit them together`);
          l2StaleFiles.push(f);
        }
      }
    }
  }
}

// ==============================================================================
// M — mechanical integrity: a commit marked mechanical must not touch the
// contract layer (specs, acceptance tests). Otherwise "mechanical" becomes a
// smuggling route past the commit door. (History check — full scan only; at
// the commit door the message doesn't exist yet, CI re-checks the tip.)
// ==============================================================================
// M at the commit door: with --commit-msg the trailer is finally visible, so
// the mechanical claim is policed on the staged set — not only in history.
if (msgFile && mechanical && stagedSet.size) {
  const contract = [...stagedSet].filter(
    (f) =>
      f.startsWith('cdd/specs/') ||
      accDirs.some((d) => path.join(root, f).startsWith(d + path.sep))
  );
  if (contract.length) {
    issues.push(
      `[M] commit claims Mechanical-Change: but stages contract-layer files (${contract.join(', ')}) — split it: a behavior change goes through the change loop, contract and code together`
    );
  }
}
if (isRepo && !staged) {
  const mechLog = git([
    'log', '-n', '1000', '--extended-regexp', '--grep', MECH_GREP,
    '--format=%h', '--name-only',
  ]);
  if (mechLog) {
    let hash = '';
    for (const line of mechLog.split('\n')) {
      if (!line) continue;
      if (/^[0-9a-f]{7,40}$/.test(line)) {
        hash = line;
        continue;
      }
      const isContract =
        line.startsWith('cdd/specs/') ||
        accDirs.some((d) => path.join(root, line).startsWith(d + path.sep));
      if (isContract) {
        issues.push(`[M] mechanical commit ${hash} touches the contract (${line}) — split it: a behavior change goes through the change loop, contract and code together`);
      }
    }
  }
}

// ==============================================================================
// G — gherkin fences: door 3 (full scan) re-parses every scenario fence with
// the official parser and enforces the full cdd subset — the same law and the
// same wording as `cdd validate` (grammar-law.mjs). Doors 1-2 (staged/commit-msg)
// stay zero-dependency: they never import it.
// ==============================================================================

if (isRepo && !staged && !msgFile && allSpecs.length) {
  let Gherkin;
  try {
    Gherkin = await import('@cucumber/gherkin');
  } catch {
    console.error('spec-drift: door 3 re-parses scenario fences with @cucumber/gherkin, which is not installed in this repository.');
    console.error('spec-drift: npm install --save-dev @cucumber/gherkin');
    process.exit(1);
  }
  const mkParser = () =>
    new Gherkin.Parser(new Gherkin.AstBuilder(() => 'cdd'), new Gherkin.GherkinClassicTokenMatcher());
  for (const specRel of allSpecs) {
    const text = fs.readFileSync(path.join(root, specRel), 'utf8');
    for (const f of extractFences(text)) {
      if (!f.closed) {
        issues.push(`[G] ${specRel}: line ${f.line}: unterminated gherkin fence`);
        continue;
      }
      if (/^\s*Verified by[*:]/m.test(f.body)) {
        issues.push(`[G] ${specRel}: line ${f.line}: markdown "Verified by:" pins are gone (ADR-0006) — the pin is a "# Verified by:" comment on the scenario's last line`);
        continue;
      }
      const res = checkFenceBody(f.body, (b) => mkParser().parse(b));
      for (const fe of res.errors.slice(0, 3)) {
        issues.push(`[G] ${specRel}: line ${f.line + fe.line - 1}: ${fe.message}`);
      }
    }
  }
}

// ==============================================================================
// O — single owner, capability-aware: a file claimed by two capabilities'
// Code: globs is an unowned helper. A living spec and its own open delta
// overlapping is the mechanism (in-flight update), not drift. Two open
// changes claiming one capability collide at apply — merge or serialize
// with "Depends on:". archive/ is frozen history and never a claimant.
// ==============================================================================
if (isRepo) {
  const owner = new Map(); // file -> Map(cap -> Set(changeId | ''))
  for (const specRel of allSpecs) {
    const res = (codeGlobs.get(specRel) ?? []).map(globToRe);
    if (!res.length) continue;
    for (const f of tracked) {
      if (!res.some((re) => re.test(f))) continue;
      if (!owner.has(f)) owner.set(f, new Map());
      const byCap = owner.get(f);
      const cap = capOf(specRel);
      if (!byCap.has(cap)) byCap.set(cap, new Set());
      byCap.get(cap).add(changeOf(specRel));
    }
  }
  for (const [f, byCap] of owner) {
    if (byCap.size > 1) {
      issues.push(`[O] ${f} is claimed by ${byCap.size} capabilities (${[...byCap.keys()].join(', ')}) — one capability owns a file; narrow the Code: globs or give the shared helper its own capability`);
    } else {
      const [cap, changes] = [...byCap][0];
      const open = [...changes].filter(Boolean);
      if (open.length > 1) {
        issues.push(`[O] ${f}: open changes ${open.join(', ')} claim capability ${cap} in parallel — merge them, or record "Depends on:" and land the follower after; overlapping open changes collide at apply`);
      }
    }
  }
}

// ==============================================================================
// L3 — scale: a living change's task list past 12 tracked tasks. The design
// gate (T5) fires at >8 as foresight; this is the backstop for when the gate
// was skipped or wrong. The exception is explicit, not silent: a recorded
// split-considered decision passes, matching the skip-record pattern.
// ==============================================================================
const changesDir = path.join(root, 'cdd', 'changes');
if (fs.existsSync(changesDir)) {
  for (const e of fs.readdirSync(changesDir, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name === 'archive') continue;
    const tasksRel = `cdd/changes/${e.name}/tasks.md`;
    if (!fs.existsSync(path.join(root, tasksRel))) continue;
    if (staged && !stagedSet.has(tasksRel)) continue;
    const text = fs.readFileSync(path.join(root, tasksRel), 'utf8');
    const n = splitTaskSections(text).reduce((a, s) => a + s.items.length, 0);
    if (n > TASK_LIMIT && !/split-considered:/i.test(text)) {
      issues.push(`[L3] ${tasksRel} holds ${n} tracked tasks (> ${TASK_LIMIT}) — a long task file is a decomposition signal, not a work plan; split the proposal (the Done When Traceability table shows the cut lines) or record "<!-- split-considered: kept whole because <reason> -->"`);
    }
  }
}

// ==============================================================================
// A — architectural decisions (cdd/decisions/): the memory that replaces
// osmosis. Beside the contract tree in form, visible to the guard in fact.
// ==============================================================================
const decisionsDir = path.join(root, 'cdd', 'decisions');
const adrs = [];
if (fs.existsSync(decisionsDir)) {
  for (const e of fs.readdirSync(decisionsDir, { withFileTypes: true })) {
    if (!e.isFile() || !e.name.endsWith('.md')) continue;
    const num = e.name.match(/^(\d{4})-/);
    if (!num) continue;
    const fileRel = `cdd/decisions/${e.name}`;
    const text = fs.readFileSync(path.join(root, fileRel), 'utf8');
    const { header, status } = parseDecisionFrontmatter(text);
    adrs.push({
      id: `ADR-${num[1]}`,
      fileRel,
      status,
      supersedes: header.supersedes ?? null,
      globs: (header.code ?? '').split(/[,\s]+/).filter(Boolean).map((g) => g.replace(/`/g, '')),
    });
  }
}
const adrByNum = new Map(adrs.map((a) => [a.id.replace(/^ADR-/, ''), a]));

if (adrs.length) {
  // A0 — lifecycle integrity
  for (const a of adrs) {
    if (!ADR_STATUSES.includes(a.status)) {
      issues.push(`[A0] ${a.fileRel} has unknown status "${a.status}" — use accepted, superseded, draft, or proposed`);
    }
    if (a.supersedes) {
      const target = adrByNum.get(a.supersedes.replace(/^ADR-/, ''));
      if (!target) {
        issues.push(`[A0] ${a.fileRel} supersedes ${a.supersedes} but no such decision exists`);
      } else if (target.status === 'accepted') {
        issues.push(`[A0] ${a.fileRel} supersedes ${target.id} but ${target.id} is still accepted — flip its status to superseded in the same commit`);
      }
    }
  }

  const acceptedAdrs = adrs.filter((a) => a.status === 'accepted' && a.globs.length);
  const filesOf = (globs) => {
    const res = globs.map(globToRe);
    return tracked.filter((f) => res.some((re) => re.test(f)));
  };


  // A1 — citation on touch: follow it or supersede it, never drift past it
  if (!staged) {
    const changeFiles = filesClaimedByChange(tracked);
    for (const [change, files] of changeFiles) {
      const cdir = path.join(root, 'cdd', 'changes', change);
      const docs = fs
        .readdirSync(cdir, { withFileTypes: true })
        .filter((e) => e.isFile() && e.name.endsWith('.md'))
        .map((e) => fs.readFileSync(path.join(cdir, e.name), 'utf8'))
        .join('\n');
      for (const a of acceptedAdrs) {
        const governed = new Set(filesOf(a.globs));
        const overlap = [...files].filter((f) => governed.has(f));
        if (!overlap.length) continue;
        if (!docs.includes(a.id)) {
          issues.push(`[A1] change ${change} touches code governed by ${a.id} (${a.fileRel}; e.g. ${overlap[0]}) — cite "${a.id}" in the proposal (follow it) or supersede the decision first`);
        }
      }
    }
  }

  // A2 — staleness: silent rot detection. Same topology trick as L2: the
  // decision is stale when the code commit is a descendant of the decision's
  // last commit. Reconfirming = touching the decision in the same commit.
  if (isRepo && !staged) {
    for (const a of acceptedAdrs) {
      const adrC = lastCommit(a.fileRel);
      if (!adrC) continue; // decision not committed yet — nothing to compare
      for (const f of filesOf(a.globs)) {
        const codeC = lastCommit(f);
        if (codeC && adrC !== codeC && git(['merge-base', '--is-ancestor', adrC, codeC]) === '') {
          issues.push(`[A2] ${f} moved after ${a.id} was last touched — silent rot: reconfirm the decision (update ${a.fileRel} in this commit) or supersede it with a new ADR that marks this one superseded`);
          break; // one finding per decision is enough to ring the bell
        }
      }
    }
  }
}

// --- L2 expected-mid-Close hint -----------------------------------------------
// Between a change's spec updates landing in the working tree and the archive
// pair-commit, the guard is L2-red BY DESIGN (specs updated, code committed,
// the pair not yet). When an open change's delta Code: globs claim one of the
// L2-affected files, that change explains the red — say so, once, as an
// informational line. Never fires without a matching open change, and never
// suppresses, reclassifies, or greens anything.
if (l2StaleFiles.length) {
  const openOwners = filesClaimedByChange(l2StaleFiles);
  if (openOwners.size) {
    const names = [...openOwners.keys()];
    const claimed = [...openOwners.values()].reduce((n, s) => n + s.size, 0);
    console.log(`spec-drift: ${claimed} L2 line(s) are expected mid-Close for open change ${names.join(', ')} (its delta claims the affected code) — they clear at the archive pair-commit`);
  }
}

// --- report --------------------------------------------------------------------
if (issues.length) {
  console.error(`spec-drift: ${issues.length} issue(s) in ${path.basename(root)} — the spec, its acceptance tests, and the code must travel together:`);
  for (const i of issues) console.error(`  ${i}`);
  process.exit(1);
}
console.log(
  allSpecs.length
    ? `spec-drift: clean (${allSpecs.length} spec${allSpecs.length > 1 ? 's' : ''}, ${accRel.length} acceptance test file${accRel.length === 1 ? '' : 's'}, ${staged ? 'staged' : 'full'} scan)`
    : 'spec-drift: no specs found — nothing to guard'
);
// informational, never silent: skipped scaffold placeholders in open deltas
for (const [change, n] of placeholderSkips) {
  console.log(`spec-drift: ${n} placeholder pin(s) skipped in open delta ${change} — expected until implementation`);
}
