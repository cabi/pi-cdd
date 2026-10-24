#!/usr/bin/env node
// spec-drift — the drift guard. Code is the truth, the spec is the index;
// this script keeps the index honest. One script, three doors, nearest to
// where drift starts:
//   1. apply preflight  — the schema's apply instruction runs it before archive
//   2. commit door      — .githooks/pre-commit runs it with --staged
//                         (message-independent checks); .githooks/commit-msg
//                         runs it with --commit-msg "$1" (message-carried
//                         exemptions and staged integrity)
//
// Check families (the Checks line below is the complete, pinned tag set):
//   L — pin traceability, spec staleness, task-list scale, memory-claim placement
//   M — a mechanical-marked commit leaves specs and acceptance tests untouched
//   O — every file is claimed by at most one spec's Code: globs
//   A — decision records: lifecycle, citation on touch, staleness, placement
//   G/H — grammar-law verdict pins and decision-header hygiene
//
// Checks: A0 A1 A2 G H L1 L2 L3 L4 L4-skip M O
//
// Structure: one gather pass (gatherMode/gatherFacts) collects every fact the
// laws need — files on disk, the one parse per spec, resolved pins, git state,
// and the shared claim map (adr-index.mjs buildClaimMap: which Code: globs
// claim which files, living specs and open deltas alike) — then each law is a
// pure function of that snapshot
// (the ===== pure checks region holds no I/O); the runner alone maps findings
// to the report.
//
// exit 0 = no drift · 1 = drift found · 2 = usage/setup error

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MECH_GREP, TASK_LIMIT, checkFenceBody, isPlaceholderPin, parseSpecModel, splitTaskSections } from './grammar-law.mjs';
import { ADR_STATUSES, buildAdrIndex, buildClaimMap } from './adr-index.mjs';

// --- the runner: mode → root → facts → laws → report ----------------------------

async function main() {
  const base = gatherMode(process.argv.slice(2));
  if (base.unknown.length || (base.msgIdx !== -1 && !base.msgFile)) {
    console.error(`usage: spec-drift.mjs [--staged | --commit-msg <file>]  (unknown args: ${base.unknown.join(' ')})`);
    process.exit(2);
  }
  const mode = { ...base, mechanical: gatherMechanical(base.msgFile) };
  const root = findRoot(process.cwd());
  if (!root) {
    console.error('spec-drift: no cdd/ directory found upward from cwd');
    process.exit(2);
  }
  const facts = await gatherFacts(root, mode);
  report(facts, runLaws(facts));
}

function runLaws(facts) {
  const l1 = checkL1(facts);
  const h = checkH(facts);
  const l4 = checkL4(facts);
  const l2 = checkL2(facts);
  const m = checkM(facts);
  // the G position: a missing parser is fatal — findings from earlier laws are discarded
  if (facts.gherkin.scope && facts.gherkin.missing) {
    console.error('spec-drift: door 3 re-parses scenario fences with @cucumber/gherkin, which is not installed in this repository.');
    console.error('spec-drift: npm install --save-dev @cucumber/gherkin');
    process.exit(1);
  }
  const g = checkG(facts);
  const o = checkO(facts);
  const l3 = checkL3(facts);
  const a0 = checkA0(facts);
  const a1 = checkA1(facts);
  const a2 = checkA2(facts);
  const issues = [
    ...l1.issues, ...h.issues, ...l4.issues, ...l2.issues, ...m.issues,
    ...g.issues, ...o.issues, ...l3.issues, ...a0.issues, ...a1.issues, ...a2.issues,
  ];
  return { issues, placeholderSkips: l1.placeholderSkips, l2StaleFiles: l2.l2StaleFiles, l4Skips: l4.l4Skips };
}

// ===== gather — the only filesystem/git seam above the laws =====================

// argv carries the door identity: --staged (pre-commit) sees the index but
// never the message — it runs only message-independent checks. --commit-msg
// <file> (commit-msg hook) sees both: it runs the message-dependent ones — the
// L2 travel check, with the mechanical exemption, and the M integrity check on
function gatherMode(argv) {
  const msgIdx = argv.indexOf('--commit-msg');
  const msgFile = msgIdx !== -1 ? argv[msgIdx + 1] : null;
  const preCommit = argv.includes('--staged');
  const staged = preCommit || msgFile !== null;
  const unknown = argv.filter((a, i) => a !== '--staged' && a !== '--commit-msg' && argv[i - 1] !== '--commit-msg');
  return { msgIdx, msgFile, preCommit, staged, unknown };
}

// the mechanical marker (MECH_GREP, grammar-law.mjs); the message-file read is gathering
function gatherMechanical(msgFile) {
  return msgFile
    ? new RegExp(MECH_GREP, 'm').test(fs.readFileSync(msgFile, 'utf8'))
    : false;
}

function findRoot(start) {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, 'cdd'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

async function gatherFacts(root, mode) {
  const git = (args) => {
    try {
      return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
    } catch {
      return null;
    }
  };
  const isRepo = git(['rev-parse', '--is-inside-work-tree']) === 'true';
  const lastCommit = (file) =>
    git([
      'log', '-1', '--format=%H',
      '--extended-regexp', '--grep', MECH_GREP, '--invert-grep',
      '--', file,
    ]) || null;

  // --- collect specs: pins + code globs --------------------------------------
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
   * specs), then the change dir the spec belongs to (in-flight changes). */
  const pinResolve = (pin, specRel) => {
    for (const c of pinCandidates(pin, specRel)) {
      if (fs.existsSync(path.join(root, c))) return c;
    }
    return null;
  };
  const models = new Map(); // specRel -> the one parse (grammar-law.mjs parseSpecModel)
  const pinsOf = new Map(); // specRel -> [{ pin, resolved }]
  const codeGlobs = new Map(); // specRel -> [globs]
  for (const specRel of allSpecs) {
    // One parse per spec file (grammar-law.mjs): pins, Code globs, fences,
    // and the requirement blocks; the mask keeps only gherkin-fence interiors.
    const model = parseSpecModel(fs.readFileSync(path.join(root, specRel), 'utf8'));
    models.set(specRel, model);
    pinsOf.set(specRel, model.pins.map((pin) => ({ pin, resolved: pinResolve(pin, specRel) })));
    codeGlobs.set(specRel, model.codeGlobs.map((c) => c.glob));
  }
  const pinnedAbs = new Set(
    allSpecs.flatMap((s) => pinsOf.get(s).map((p) => p.resolved)).filter(Boolean)
  );

  // --- acceptance-test dirs (convention) ---------------------------------------
  const accDirRels = ['tests/acceptance', 'test/acceptance']
    .filter((d) => fs.existsSync(path.join(root, d)));
  function accFiles(dir, acc = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) accFiles(p, acc);
      else acc.push(p);
    }
    return acc;
  }
  const accRel = accDirRels.flatMap((d) => accFiles(path.join(root, d)).map(rel));

  // --- git state: the staged/pre-commit distinction, tracked files, history ----
  const stagedSet = new Set(
    mode.staged && isRepo ? (git(['diff', '--cached', '--name-only']) ?? '').split('\n').filter(Boolean) : []
  );
  const stagedAdds = mode.preCommit && isRepo
    ? (git(['diff', '--cached', '--name-only', '--diff-filter=A']) ?? '').split('\n').filter(Boolean)
    : [];
  const stagedDels = mode.preCommit && isRepo
    ? (git(['diff', '--cached', '--name-only', '--diff-filter=D']) ?? '').split('\n').filter(Boolean)
    : [];
  const tracked = isRepo ? (git(['ls-files']) ?? '').split('\n').filter(Boolean) : [];
  const hooksHalfUpgraded =
    isRepo &&
    fs.existsSync(path.join(root, '.githooks', 'pre-commit')) &&
    !fs.existsSync(path.join(root, '.githooks', 'commit-msg'));
  const mechLog = isRepo && !mode.staged
    ? git(['log', '-n', '1000', '--extended-regexp', '--grep', MECH_GREP, '--format=%h', '--name-only'])
    : null;

  // --- open-change claims: task texts, ADR index, change docs ------------------
  const tasksTexts = new Map(); // change -> { rel, text }
  const changesDir = path.join(root, 'cdd', 'changes');
  if (fs.existsSync(changesDir)) {
    for (const e of fs.readdirSync(changesDir, { withFileTypes: true })) {
      if (!e.isDirectory() || e.name === 'archive') continue;
      const tasksRel = `cdd/changes/${e.name}/tasks.md`;
      if (!fs.existsSync(path.join(root, tasksRel))) continue;
      tasksTexts.set(e.name, { rel: tasksRel, text: fs.readFileSync(path.join(root, tasksRel), 'utf8') });
    }
  }
  const adrIndex = buildAdrIndex(root);
  const changeDocs = new Map(); // open change (its delta claims surface) -> joined md text
  for (const specRel of deltaSpecs) {
    if (!(codeGlobs.get(specRel) ?? []).length) continue;
    const change = specRel.split('/')[2];
    if (changeDocs.has(change)) continue;
    const cdir = path.join(root, 'cdd', 'changes', change);
    changeDocs.set(
      change,
      fs
        .readdirSync(cdir, { withFileTypes: true })
        .filter((e) => e.isFile() && e.name.endsWith('.md'))
        .map((e) => fs.readFileSync(path.join(cdir, e.name), 'utf8'))
        .join('\n')
    );
  }

  // --- G (door 3 only): the official parser — doors 1-2 stay zero-dependency ----
  let gherkin = { scope: false, missing: false, mkParse: null };
  if (isRepo && !mode.staged && !mode.msgFile && allSpecs.length) {
    gherkin.scope = true;
    try {
      const Gherkin = await import('@cucumber/gherkin');
      const mkParser = () =>
        new Gherkin.Parser(new Gherkin.AstBuilder(() => 'cdd'), new Gherkin.GherkinClassicTokenMatcher());
      gherkin.mkParse = (b) => mkParser().parse(b);
    } catch {
      gherkin.missing = true;
    }
  }

  // --- topology answers for L2/A2, asked once: last meaningful commit per file,
  // and is-ancestor for exactly the pairs those laws will compare (derived with
  // the same pure helpers the laws use, so question set and verdict walk match).
  // The shared claim map (scripts/adr-index.mjs): the one derivation of which
  // Code: globs claim which files — living specs, open deltas, and ADR globs.
  const claimMap = buildClaimMap({
    specs: allSpecs.map((rel) => ({ rel, model: models.get(rel) })),
    adrIndex,
    tracked,
  });
  const facts = {
    root, isRepo,
    preCommit: mode.preCommit, msgFile: mode.msgFile, staged: mode.staged, mechanical: mode.mechanical,
    livingSpecs, deltaSpecs, allSpecs, models, pinsOf, codeGlobs, pinnedAbs,
    accDirRels, accRel, stagedSet, stagedAdds, stagedDels, tracked,
    hooksHalfUpgraded, mechLog, tasksTexts, adrIndex, changeDocs, gherkin, claimMap,
    topology: null,
  };
  if (isRepo && !mode.preCommit) {
    const lastCommitOf = new Map();
    for (const f of new Set([...allSpecs, ...tracked, ...adrIndex.map((a) => a.fileRel)])) {
      lastCommitOf.set(f, lastCommit(f));
    }
    const ancestorOf = new Map();
    const ask = (a, b) => {
      const k = `${a}|${b}`;
      if (!ancestorOf.has(k)) ancestorOf.set(k, git(['merge-base', '--is-ancestor', a, b]) === '');
    };
    for (const { specRels, globs } of capsIndex(facts).values()) {
      if (!globs.length) continue;
      const matches = claimMap.filesOfGlobs(globs);
      if (!matches.length) continue;
      const specCs = specRels.map((s) => lastCommitOf.get(s)).filter(Boolean);
      for (const codeC of matches.map((f) => lastCommitOf.get(f)).filter(Boolean)) {
        for (const specC of specCs) {
          if (specC !== codeC) ask(specC, codeC);
        }
      }
    }
    for (const a of acceptedAdrsOf(facts)) {
      const adrC = lastCommitOf.get(a.fileRel);
      if (!adrC) continue;
      for (const f of facts.claimMap.filesOfAdr.get(a.id) ?? []) {
        const codeC = lastCommitOf.get(f);
        if (codeC && codeC !== adrC) ask(adrC, codeC);
      }
    }
    facts.topology = { lastCommitOf, ancestorOf };
  }
  return facts;
}

// ===== pure checks — every law below is a pure function of the facts ============
// (no filesystem, no git, no console — gatherFacts collects, report writes)

const changeOf = (specRel) => (specRel.match(/^cdd\/changes\/([^/]+)\//) ?? [])[1] ?? '';
const capOf = (specRel) =>
  specRel
    .replace(/^cdd\/specs\//, '')
    .replace(/^cdd\/changes\/[^/]+\/specs\//, '')
    .replace(/\/spec\.md$/, '');

function pinCandidates(pin, specRel) {
  const out = [pin];
  const m = specRel.match(/^cdd\/changes\/[^/]+\//);
  if (m) out.push(m[0] + pin);
  return out;
}

const isAcceptancePath = (f, facts) =>
  facts.accDirRels.some((d) => f.startsWith(d + '/'));

// One matching pass, two readers: the A1 citation check and the L2
// expected-mid-Close hint both ask "which of these files does each open
// change's delta Code: globs claim?" — answer it from the shared claim map
// (the claiming happened once, in adr-index.mjs), as a map of open change
// name -> Set of matched files, in the caller's file order.
const filesClaimedByChange = (files, facts) => {
  const claims = new Map();
  for (const [change, set] of facts.claimMap.filesOfChange) {
    const matched = files.filter((f) => set.has(f));
    if (matched.length) claims.set(change, new Set(matched));
  }
  return claims;
};

// L4's memory-claim derivations — pure over the snapshot, shared by the L4
// verdict and the L2 capability index (both must see the same exemptions).
const globClaimsMemory = (glob, facts) =>
  glob.startsWith('cdd/decisions/') ||
  [...(facts.claimMap.filesOfGlob.get(glob) ?? [])].some((f) => f.startsWith('cdd/decisions/'));
const memoryClaimsOf = (specRel, facts) => {
  const claims = [];
  for (const r of facts.models.get(specRel).requirements) {
    for (const glob of r.codeGlobs) {
      if (globClaimsMemory(glob, facts)) claims.push({ heading: r.requirement, glob });
    }
  }
  return claims;
};
// open corrections: per capability, heading -> [change names], built from
// MODIFIED blocks whose restated Code line names real surface and claims no
// memory. A correction earns the skip, never silence; the exemption is
// per-requirement and heading-matched exactly — no fuzzy matching, no
// cross-change cover.
function correctionsByCap(facts) {
  const out = new Map();
  for (const specRel of facts.deltaSpecs) {
    const cap = capOf(specRel);
    const change = changeOf(specRel);
    for (const o of facts.models.get(specRel).ops) {
      if (o.op !== 'MODIFIED') continue;
      const globs = o.codeGlobs;
      if (!globs.length || globs.some((g) => globClaimsMemory(g, facts))) continue;
      if (!out.has(cap)) out.set(cap, new Map());
      const byHeading = out.get(cap);
      if (!byHeading.has(o.requirement)) byHeading.set(o.requirement, []);
      byHeading.get(o.requirement).push(change);
    }
  }
  return out;
}
// living memory globs under correction, per spec — every requirement of the
// spec carrying the glob must be under correction, or the glob stays policed
function exemptMemoryGlobs(facts) {
  const corrections = correctionsByCap(facts);
  const out = new Map(); // living specRel -> Set(glob)
  for (const specRel of facts.livingSpecs) {
    const byGlob = new Map(); // glob -> fully corrected?
    for (const { heading, glob } of memoryClaimsOf(specRel, facts)) {
      const fixed = (corrections.get(capOf(specRel))?.get(heading) ?? []).length > 0;
      if (!byGlob.has(glob)) byGlob.set(glob, true);
      if (!fixed) byGlob.set(glob, false);
    }
    const exempt = new Set([...byGlob].filter(([, ok]) => ok).map(([g]) => g));
    if (exempt.size) out.set(specRel, exempt);
  }
  return out;
}

// capability model: a living spec plus its open deltas are ONE spec line. The
// index is the L2 walk itself: per capability, its spec files and its
// (exemption-filtered) code globs, in allSpecs order.
function capsIndex(facts) {
  const caps = new Map(); // cap -> { specRels: [], globs: [] }
  const exemptBySpec = exemptMemoryGlobs(facts);
  for (const specRel of facts.allSpecs) {
    const cap = capOf(specRel);
    if (!caps.has(cap)) caps.set(cap, { specRels: [], globs: [] });
    const c = caps.get(cap);
    c.specRels.push(specRel);
    const exempt = exemptBySpec.get(specRel);
    c.globs.push(...(facts.codeGlobs.get(specRel) ?? []).filter((g) => !exempt?.has(g)));
  }
  return caps;
}

const acceptedAdrsOf = (facts) =>
  facts.adrIndex.filter((a) => a.status === 'accepted' && a.globs.length);

// ==============================================================================
// L1 — forward: every pin resolves (staged mode: only specs staged in this commit)
// + reverse: every acceptance test is pinned somewhere (staged mode: only files
// newly added to tests/acceptance/) + the commit door: staged deletions of
// pinned tests. A placeholder pin (scaffold marker, grammar-law.mjs) inside an
// OPEN delta is template text, not a claim: skip it here and report the skip
// after the verdict — a skip is never silent. Living specs (and archive =
// frozen history, already excluded from deltaSpecs) keep full strictness, and
// an unrecognized marker shape fails L1 everywhere.
// ==============================================================================
function checkL1(facts) {
  const issues = [];
  const placeholderSkips = new Map(); // open change name -> skipped pin count
  const specsToCheck = facts.preCommit ? facts.allSpecs.filter((s) => facts.stagedSet.has(s)) : facts.allSpecs;
  for (const specRel of specsToCheck) {
    const openChange = specRel.match(/^cdd\/changes\/([^/]+)\//)?.[1] ?? null;
    for (const { pin, resolved } of facts.pinsOf.get(specRel)) {
      if (!resolved) {
        if (openChange && isPlaceholderPin(pin)) {
          placeholderSkips.set(openChange, (placeholderSkips.get(openChange) ?? 0) + 1);
          continue;
        }
        issues.push(`[L1] ${specRel} pins "${pin}" but that file does not exist — restore the acceptance test or update the Verified by line`);
      }
    }
  }
  if (facts.preCommit && facts.isRepo) {
    for (const f of facts.stagedAdds) {
      if (isAcceptancePath(f, facts) && !facts.pinnedAbs.has(f)) {
        issues.push(`[L1] new acceptance test ${f} is pinned by no spec — add a "Verified by" scenario or move it out of tests/acceptance/`);
      }
    }
  } else {
    for (const f of facts.accRel) {
      if (!facts.pinnedAbs.has(f)) {
        issues.push(`[L1] orphan acceptance test ${f} — pinned by no spec; update the spec's scenarios or delete the test`);
      }
    }
  }
  if (facts.preCommit && facts.isRepo) {
    for (const f of facts.stagedDels) {
      for (const specRel of facts.allSpecs) {
        const hit = facts.pinsOf
          .get(specRel)
          .some((p) => p.resolved === f || pinCandidates(p.pin, specRel).includes(f));
        if (hit && !facts.stagedSet.has(specRel)) {
          issues.push(`[L1] staged deletion of ${f} but ${specRel} still pins it — update the spec in this same commit`);
        }
      }
    }
  }
  return { issues, placeholderSkips };
}

// ==============================================================================
// H — hook health: this script knows --commit-msg. If the repo still runs the
// old single-hook scaffold, upgrading the script alone would silently drop
// the L2 travel check from the commit door (and without CI, from anywhere).
// ==============================================================================
function checkH(facts) {
  const issues = [];
  if (facts.hooksHalfUpgraded) {
    issues.push(`[H] .githooks has pre-commit but no commit-msg — the guard is newer than its hooks; re-run cdd_init (it refreshes an existing store and installs missing hooks) so code-and-spec travel and the mechanical lane stay enforced`);
  }
  return { issues };
}

// ==============================================================================
// L4 — decision memory is not implementation surface: no Code line may claim
// the decisions directory. ADRs answer to the A-checks unconditionally, so
// binding them to a capability's travel doors double-governs them — and makes
// a staged ADR reconfirmation unlawful. The full scan owns this law. An open delta's
// claim reds unconditionally; a living claim reds unless an open change of the
// same capability is correcting that very requirement (heading-matched) with a
// clean restated Code line — then one informational skip line, never silent.
// The same under-correction predicate exempts the claim from the travel doors
// (L2 topology + staged-pair): the correction clears it at the archive
// pair-commit, so demanding spec travel on it mid-Close is transition noise.
// ==============================================================================
function checkL4(facts) {
  const issues = [];
  const l4Skips = [];
  const l4Issue = (specRel, heading, glob) => `[L4] ${specRel} requirement "${heading}" claims decision memory in Code line "${glob}" — decision memory answers to the A-checks (A0/A1/A2 govern cdd/decisions/ unconditionally); a Code line claims implementation surface (name the enforcing acceptance test instead)`;
  if (facts.isRepo && !facts.staged) {
    for (const specRel of facts.deltaSpecs) {
      for (const { heading, glob } of memoryClaimsOf(specRel, facts)) {
        issues.push(l4Issue(specRel, heading, glob));
      }
    }
    for (const specRel of facts.livingSpecs) {
      for (const { heading, glob } of memoryClaimsOf(specRel, facts)) {
        const fixers = correctionsByCap(facts).get(capOf(specRel))?.get(heading) ?? [];
        if (fixers.length) {
          l4Skips.push(`living Code line "${glob}" in ${specRel} (requirement "${heading}") claims decision memory but is being corrected by open change ${fixers.join(', ')} — clears at the archive pair-commit`);
        } else {
          issues.push(l4Issue(specRel, heading, glob));
        }
      }
    }
  }
  return { issues, l4Skips };
}

// ==============================================================================
// L2 — staleness: code matching Code: globs must not out-commit its spec.
// Applied specs must own real files (open deltas may point at future files);
// staleness is per CAPABILITY: the tip is the newest commit of the living
// spec or any open delta. Code may out-commit older parts of the line
// freely — that is what an in-flight change is. At the commit-msg door the
// staged pair is policed directly; topology staleness is committed-history
// law: lastCommit() cannot see this commit's staged spec merge, so in
// pre-commit mode it can only fire on the commit being made (the archive
// pair-commit's second commit stages the merged spec without code —
// unreachable red here). The commit-msg door polices staged pairs
// mid-commit; the full scan (door 3) owns topology here and at every
// checkpoint.
// ==============================================================================
function checkL2(facts) {
  const issues = [];
  const l2StaleFiles = []; // staleness-flagged files, for the expected-mid-Close hint — see filesClaimedByChange
  if (!facts.isRepo) return { issues, l2StaleFiles };
  for (const specRel of facts.livingSpecs) {
    const globs = facts.codeGlobs.get(specRel);
    if (!globs.length) continue;
    if (!globs.some((g) => facts.claimMap.filesOfGlob.get(g)?.size)) {
      issues.push(`[L2] ${specRel} declares Code: ${globs.join(', ')} but no tracked file matches — fix the glob or remove the line`);
    }
  }
  for (const [cap, { specRels, globs }] of capsIndex(facts)) {
    if (!globs.length) continue;
    const matches = facts.claimMap.filesOfGlobs(globs);
    if (!matches.length) continue;
    if (facts.msgFile && !facts.mechanical) {
      const stagedCode = matches.filter((f) => facts.stagedSet.has(f));
      if (stagedCode.length && !specRels.some((s) => facts.stagedSet.has(s))) {
        issues.push(`[L2] staged code ${stagedCode.join(', ')} but no spec of ${cap} is in this commit — spec and code travel together (update the living spec or the change's delta)`);
      }
    } else if (!facts.preCommit && facts.topology) {
      const specCs = specRels.map((s) => facts.topology.lastCommitOf.get(s)).filter(Boolean);
      if (!specCs.length) continue; // nothing committed yet — nothing to compare
      for (const f of matches) {
        const codeC = facts.topology.lastCommitOf.get(f);
        // stale = EVERY spec of the capability predates the code commit
        // (topology, not wall-clock: timestamps have second resolution)
        if (codeC && specCs.every((specC) => codeC !== specC && facts.topology.ancestorOf.get(`${specC}|${codeC}`))) {
          issues.push(`[L2] ${f} changed after every spec of ${cap} last changed — update the spec (scenario or Code line) and commit them together`);
          l2StaleFiles.push(f);
        }
      }
    }
  }
  return { issues, l2StaleFiles };
}

// ==============================================================================
// M — mechanical integrity: a commit marked mechanical must not touch the
// contract layer (specs, acceptance tests). Otherwise "mechanical" becomes a
// smuggling route past the commit door. (History check — full scan only; at
// the commit door the message doesn't exist yet, CI re-checks the tip.)
// M at the commit door: with --commit-msg the trailer is finally visible, so
// the mechanical claim is policed on the staged set — not only in history.
// ==============================================================================
function checkM(facts) {
  const issues = [];
  if (facts.msgFile && facts.mechanical && facts.stagedSet.size) {
    const contract = [...facts.stagedSet].filter(
      (f) => f.startsWith('cdd/specs/') || isAcceptancePath(f, facts)
    );
    if (contract.length) {
      issues.push(
        `[M] commit claims Mechanical-Change: but stages contract-layer files (${contract.join(', ')}) — split it: a behavior change goes through the change loop, contract and code together`
      );
    }
  }
  if (facts.mechLog) {
    let hash = '';
    for (const line of facts.mechLog.split('\n')) {
      if (!line) continue;
      if (/^[0-9a-f]{7,40}$/.test(line)) {
        hash = line;
        continue;
      }
      const isContract = line.startsWith('cdd/specs/') || isAcceptancePath(line, facts);
      if (isContract) {
        issues.push(`[M] mechanical commit ${hash} touches the contract (${line}) — split it: a behavior change goes through the change loop, contract and code together`);
      }
    }
  }
  return { issues };
}

// ==============================================================================
// G — gherkin fences: door 3 (full scan) re-parses every scenario fence with
// the official parser and enforces the full cdd subset — the same law and the
// same wording as `cdd validate` (grammar-law.mjs). Doors 1-2 (staged/commit-msg)
// stay zero-dependency: they never import it.
// ==============================================================================
function checkG(facts) {
  const issues = [];
  if (!facts.gherkin.scope || facts.gherkin.missing) return { issues };
  for (const specRel of facts.allSpecs) {
    for (const f of facts.models.get(specRel).fences) {
      if (!f.closed) {
        issues.push(`[G] ${specRel}: line ${f.line}: unterminated gherkin fence`);
        continue;
      }
      if (/^\s*Verified by[*:]/m.test(f.body)) {
        issues.push(`[G] ${specRel}: line ${f.line}: markdown "Verified by:" pins are gone (ADR-0006) — the pin is a "# Verified by:" comment on the scenario's last line`);
        continue;
      }
      const res = checkFenceBody(f.body, facts.gherkin.mkParse);
      for (const fe of res.errors.slice(0, 3)) {
        issues.push(`[G] ${specRel}: line ${f.line + fe.line - 1}: ${fe.message}`);
      }
    }
  }
  return { issues };
}

// ==============================================================================
// O — single owner, capability-aware: a file claimed by two capabilities'
// Code: globs is an unowned helper. A living spec and its own open delta
// overlapping is the mechanism (in-flight update), not drift. Two open
// changes claiming one capability collide at apply — merge or serialize
// with "Depends on:". archive/ is frozen history and never a claimant.
// ==============================================================================
function checkO(facts) {
  const issues = [];
  if (!facts.isRepo) return { issues };
  const owner = new Map(); // file -> Map(cap -> Set(changeId | ''))
  for (const specRel of facts.allSpecs) {
    const claimed = facts.claimMap.filesOfSpec.get(specRel);
    if (!claimed || !claimed.size) continue;
    for (const f of claimed) {
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
  return { issues };
}

// ==============================================================================
// L3 — scale: a living change's task list past 12 tracked tasks. The design
// gate (T5) fires at >8 as foresight; this is the backstop for when the gate
// was skipped or wrong. The exception is explicit, not silent: a recorded
// split-considered decision passes, matching the skip-record pattern.
// ==============================================================================
function checkL3(facts) {
  const issues = [];
  for (const { rel, text } of facts.tasksTexts.values()) {
    if (facts.staged && !facts.stagedSet.has(rel)) continue;
    const n = splitTaskSections(text).reduce((a, s) => a + s.items.length, 0);
    if (n > TASK_LIMIT && !/split-considered:/i.test(text)) {
      issues.push(`[L3] ${rel} holds ${n} tracked tasks (> ${TASK_LIMIT}) — a long task file is a decomposition signal, not a work plan; split the proposal (the Done When Traceability table shows the cut lines) or record "<!-- split-considered: kept whole because <reason> -->"`);
    }
  }
  return { issues };
}

// ==============================================================================
// A — architectural decisions (the decisions directory): the memory that replaces
// osmosis. Beside the contract tree in form, visible to the guard in fact.
// ==============================================================================

// A0 — lifecycle integrity
function checkA0(facts) {
  const issues = [];
  if (!facts.adrIndex.length) return { issues };
  const adrByNum = new Map(facts.adrIndex.map((a) => [a.id.replace(/^ADR-/, ''), a]));
  for (const a of facts.adrIndex) {
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
  return { issues };
}

// A1 — citation on touch: follow it or supersede it, never drift past it
function checkA1(facts) {
  const issues = [];
  if (facts.staged || !facts.adrIndex.length) return { issues };
  const acceptedAdrs = acceptedAdrsOf(facts);
  const changeFiles = filesClaimedByChange(facts.tracked, facts);
  for (const [change, files] of changeFiles) {
    const docs = facts.changeDocs.get(change) ?? '';
    for (const a of acceptedAdrs) {
      const governed = facts.claimMap.filesOfAdr.get(a.id) ?? new Set();
      const overlap = [...files].filter((f) => governed.has(f));
      if (!overlap.length) continue;
      if (!docs.includes(a.id)) {
        issues.push(`[A1] change ${change} touches code governed by ${a.id} (${a.fileRel}; e.g. ${overlap[0]}) — run \`cdd adrs --code ${overlap[0]}\` to find every governing ADR, then cite "${a.id}" in the proposal (follow it) or supersede the decision first`);
      }
    }
  }
  return { issues };
}

// A2 — staleness: silent rot detection. Same topology trick as L2: the
// decision is stale when the code commit is a descendant of the decision's
// last commit. Reconfirming = touching the decision in the same commit.
function checkA2(facts) {
  const issues = [];
  if (!facts.isRepo || facts.staged || !facts.topology) return { issues };
  for (const a of acceptedAdrsOf(facts)) {
    const adrC = facts.topology.lastCommitOf.get(a.fileRel);
    if (!adrC) continue; // decision not committed yet — nothing to compare
    for (const f of facts.claimMap.filesOfAdr.get(a.id) ?? []) {
      const codeC = facts.topology.lastCommitOf.get(f);
      if (codeC && adrC !== codeC && facts.topology.ancestorOf.get(`${adrC}|${codeC}`)) {
        issues.push(`[A2] ${f} moved after ${a.id} was last touched — silent rot: run \`cdd reconfirm ${a.id} --evidence "<one line>"\` to record the reconfirmation (update ${a.fileRel} in this commit) or supersede it with a new ADR that marks this one superseded`);
        break; // one finding per decision is enough to ring the bell
      }
    }
  }
  return { issues };
}

// ===== report — the runner alone writes findings and exits ======================

// Between a change's spec updates landing in the working tree and the archive
// pair-commit, the guard is L2-red BY DESIGN (specs updated, code committed,
// the pair not yet). When an open change's delta Code: globs claim one of the
// L2-affected files, that change explains the red — say so, once, as an
// informational line. Never fires without a matching open change, and never
// suppresses, reclassifies, or greens anything.
function report(facts, outcome) {
  const { issues, l2StaleFiles, l4Skips, placeholderSkips } = outcome;
  if (l2StaleFiles.length) {
    const openOwners = filesClaimedByChange(l2StaleFiles, facts);
    if (openOwners.size) {
      const names = [...openOwners.keys()];
      const claimed = [...openOwners.values()].reduce((n, s) => n + s.size, 0);
      console.log(`spec-drift: ${claimed} L2 line(s) are expected mid-Close for open change ${names.join(', ')} (its delta claims the affected code) — they clear at the archive pair-commit`);
    }
  }
  // informational, never silent: living memory claims under open correction
  for (const s of l4Skips) {
    console.log(`spec-drift: [L4-skip] ${s}`);
  }
  if (issues.length) {
    console.error(`spec-drift: ${issues.length} issue(s) in ${path.basename(facts.root)} — the spec, its acceptance tests, and the code must travel together:`);
    for (const i of issues) console.error(`  ${i}`);
    process.exit(1);
  }
  console.log(
    facts.allSpecs.length
      ? `spec-drift: clean (${facts.allSpecs.length} spec${facts.allSpecs.length > 1 ? 's' : ''}, ${facts.accRel.length} acceptance test file${facts.accRel.length === 1 ? '' : 's'}, ${facts.staged ? 'staged' : 'full'} scan)`
      : 'spec-drift: no specs found — nothing to guard'
  );
  // informational, never silent: skipped scaffold placeholders in open deltas
  for (const [change, n] of placeholderSkips) {
    console.log(`spec-drift: ${n} placeholder pin(s) skipped in open delta ${change} — expected until implementation`);
  }
}

const runningAsScript =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (runningAsScript) await main();

export {
  gatherFacts,
  checkA0, checkA1, checkA2,
  checkG, checkH,
  checkL1, checkL2, checkL3, checkL4,
  checkM, checkO,
};
