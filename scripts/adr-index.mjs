#!/usr/bin/env node
// adr-index — the ADR claims index: the single source for the decision
// frontmatter shape (id, file, status, supersedes, title, code globs), the
// glob matcher that turns a code glob into exactly the files it claims, and
// the ADR status vocabulary. The drift guard (spec-drift.mjs) and the tool
// ops (lib/adr-ops.mjs) import from here; no consumer re-states the parsing,
// the matcher, or the vocabulary — tool and door agree by construction.
// This module travels byte-identical into adopting stores as
// cdd/scripts/adr-index.mjs (refreshed by cdd init alongside grammar-law.mjs
// and spec-drift.mjs) and depends on nothing outside that law pair.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ADR_STATUSES, parseDecisionFrontmatter } from './grammar-law.mjs';

export { ADR_STATUSES };

// Refuse silent direct execution: run as a command, this module prints its
// usage and exits 2 — it is a library behind the doors and the cdd tool.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.error(
    'adr-index.mjs is the claims-index library behind the doors and the tool, not a command — the guard runs it in-process (node cdd/scripts/spec-drift.mjs); discovery and reconfirmation run through the cdd tool\'s adrs and reconfirm operations'
  );
  process.exit(2);
}

export function globToRe(glob) {
  // Translate, never double-escape. A `[...]` span passes through as a
  // character class (leading `!` negates), a single `*` becomes `[^/]*`, every
  // other regex metacharacter is escaped so literals stay literal, and an
  // unterminated or empty `[` is literal text — a compiled claim is exactly
  // the files the glob names, never silently zero.
  const partToRe = (part) => {
    let out = '';
    for (let i = 0; i < part.length; i++) {
      const c = part[i];
      if (c === '*') out += '[^/]*';
      else if (c === '[') {
        const end = part.indexOf(']', i + 1);
        const body = end === -1 ? null : part.slice(i + 1, end);
        if (body === null || body.replace(/^!/, '').length === 0) out += '\\[';
        else {
          out += body.startsWith('!') ? `[^${body.slice(1)}]` : `[${body}]`;
          i = end;
        }
      } else out += c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    return out;
  };
  const re = glob.split('**').map(partToRe).join('.*');
  return new RegExp(`^${re}$`);
}

/**
 * The claims index: every decision file parsed into
 * { id, fileRel, status, supersedes, title, globs } — the exact shape the
 * guard's A-checks and the adrs op answer from. Files that do not match the
 * four-digit naming are not decisions and are skipped. `supersedes` stays null
 * unless the frontmatter carries the key; `title` is the first `# ` heading.
 */
export function buildAdrIndex(root) {
  const dir = path.join(root, 'cdd', 'decisions');
  const adrs = [];
  if (!fs.existsSync(dir)) return adrs;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isFile() || !e.name.endsWith('.md')) continue;
    const num = e.name.match(/^(\d{4})-/);
    if (!num) continue;
    const fileRel = `cdd/decisions/${e.name}`;
    const text = fs.readFileSync(path.join(root, fileRel), 'utf8');
    const { header, status } = parseDecisionFrontmatter(text);
    const title = (text.split('\n').find((l) => l.startsWith('# ')) ?? '').slice(2);
    adrs.push({
      id: `ADR-${num[1]}`,
      fileRel,
      status,
      supersedes: header.supersedes ?? null,
      title,
      globs: (header.code ?? '').split(/[,\s]+/).filter(Boolean).map((g) => g.replace(/`/g, '')),
    });
  }
  return adrs;
}

/**
 * The claim map: which Code: globs claim which files, derived exactly once
 * for both doors. Pure over parsed inputs — spec models (grammar-law.mjs
 * parseSpecModel), an ADR index (buildAdrIndex), and the tracked file list —
 * never reading disk itself. Every set iterates in tracked order (ADR sets in
 * index order), so every derived list is deterministic:
 *
 * - `filesOfGlob`   — glob string -> Set of tracked files it claims
 * - `filesOfSpec`   — spec rel -> Set of tracked files its Code: globs claim
 * - `filesOfChange` — open change -> Set of tracked files its delta specs
 *                     claim together (non-empty only; a change is the union)
 * - `filesOfAdr`    — ADR id -> Set of tracked files its globs govern
 * - `filesOfGlobs`  — (globs) -> the tracked files any glob in the list
 *                     claims, in tracked order (the capability-level union)
 * - `governingFor`  — (path) -> the accepted index entries whose globs govern
 *                     that path, in index order: the per-path query the adrs
 *                     op's --code branch answers with, tracked and untracked
 *                     paths alike
 *
 * The claiming loop — a compiled glob tested against files — lives here and
 * only here; consumers read the sets and the queries, never re-derive.
 */
export function buildClaimMap({ specs = [], adrIndex = [], tracked = [] }) {
  const filesOfGlob = new Map();
  const filesOf = (glob) => {
    if (!filesOfGlob.has(glob)) {
      const re = globToRe(glob);
      const set = new Set();
      for (const f of tracked) if (re.test(f)) set.add(f);
      filesOfGlob.set(glob, set);
    }
    return filesOfGlob.get(glob);
  };
  const unionOf = (globs) => {
    const u = new Set();
    for (const g of globs) for (const f of filesOf(g)) u.add(f);
    return tracked.filter((f) => u.has(f)); // tracked order, like every set here
  };

  const filesOfSpec = new Map();
  const changeGlobs = new Map(); // open change -> [globs], first-seen order
  for (const { rel, model } of specs) {
    const globs = model.codeGlobs.map((c) => c.glob);
    filesOfSpec.set(rel, new Set(unionOf(globs)));
    if (rel.startsWith('cdd/changes/')) {
      const change = rel.split('/')[2];
      if (!changeGlobs.has(change)) changeGlobs.set(change, []);
      changeGlobs.get(change).push(...globs);
    }
  }
  const filesOfChange = new Map();
  for (const [change, globs] of changeGlobs) {
    const set = new Set(unionOf(globs));
    if (set.size) filesOfChange.set(change, set);
  }

  const filesOfAdr = new Map();
  for (const a of adrIndex) filesOfAdr.set(a.id, new Set(unionOf(a.globs)));

  const compiled = adrIndex.map((a) => ({ a, res: a.globs.map(globToRe) }));
  const governingFor = (p) =>
    compiled.filter(({ a, res }) => a.status === 'accepted' && res.some((re) => re.test(p))).map(({ a }) => a);

  return {
    filesOfGlob,
    filesOfSpec,
    filesOfChange,
    filesOfAdr,
    filesOfGlobs: unionOf,
    governingFor,
  };
}
