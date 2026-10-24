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
