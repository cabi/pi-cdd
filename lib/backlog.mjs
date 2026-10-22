#!/usr/bin/env node
/**
 * backlog — the process-finding backlog (cdd/backlog.md): one flat list, one
 * line per item, written only through this module (list is read-only).
 *
 * Item grammar (one line, ids strictly increasing PF-1..):
 *   - PF-n [status] summary | source: ref [| change: name] [| note: text]
 * status: open | watch | done | won't-do | seeded-into-change
 *
 * The file is living triage data, not spec: nothing here validates its
 * content against cdd/specs/ and the drift guard never claims it.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

// Refuse silent direct execution: run as a command this module would print
// nothing and exit 0 — the shared usage-error convention (validate.mjs,
// grammar-law.mjs, index.ts): one stderr line, exit 2.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.error(
    "backlog.mjs is a library, not a command — the backlog is maintained through the cdd tool's backlog operation (actions: list, add, resolve)"
  );
  process.exit(2);
}

export const STATUSES = ["open", "watch", "done", "won't-do", "seeded-into-change"];
const ITEM_RE = new RegExp(`^- PF-(\\d+) \\[(${STATUSES.join("|")})\\] (.+)$`);
const GRAMMAR_DOC = `"- PF-n [status] summary | source: ref [| change: name] [| note: text]" (status: ${STATUSES.join(" | ")})`;

const HEADER_LINES = [
  "# backlog — process findings",
  "",
  "Conventions: a steer is believed only when an on-disk artifact backs it;",
  "milestone and Close reports cite PF-n ids, never prose.",
  "",
];

const backlogPath = (root) => path.join(root, "cdd", "backlog.md");

function parseLine(line, no) {
  const m = line.match(ITEM_RE);
  if (!m) return { error: `cdd/backlog.md line ${no}: not grammar ${GRAMMAR_DOC}: ${line}` };
  const [, id, status, rest] = m;
  const parts = rest.split(" | ");
  if (parts.length < 2 || parts.length > 4)
    return { error: `cdd/backlog.md line ${no}: expected "summary | source: <ref>" plus optional change/note segments: ${line}` };
  const EXPECT = [
    ["source", /^source: \S/],
    ["change", /^change: \S/],
    ["note", /^note: /],
  ];
  const seg = {};
  let si = 0;
  for (const part of parts.slice(1)) {
    while (si < EXPECT.length && !EXPECT[si][1].test(part)) si++;
    if (si >= EXPECT.length)
      return { error: `cdd/backlog.md line ${no}: segments after the summary must be source:, change:, note: (in that order, each at most once): ${line}` };
    seg[EXPECT[si][0]] = part.slice(EXPECT[si][0].length + 2);
    si++;
  }
  if (seg.source === undefined) return { error: `cdd/backlog.md line ${no}: the second segment must be "source: <ref>": ${line}` };
  return {
    item: {
      id: `PF-${id}`,
      n: Number(id),
      status,
      summary: parts[0],
      source: seg.source,
      change: seg.change,
      note: seg.note,
    },
  };
}

/** Parse cdd/backlog.md: header (# lines) + items; refuse any off-grammar
 * line and any id sequence break. Absent file → default header, no items. */
export function readBacklog(root) {
  const file = backlogPath(root);
  if (!fs.existsSync(file)) return { header: [...HEADER_LINES], items: [] };
  const lines = fs.readFileSync(file, "utf8").split("\n");
  const header = [];
  const items = [];
  let sawItem = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === "") continue;
    if (!line.startsWith("- ")) {
          if (sawItem) return { error: `cdd/backlog.md line ${i + 1}: only item lines may follow the first item — ${GRAMMAR_DOC}: ${line}` };
      header.push(line);
      continue;
    }
    sawItem = true;
    const p = parseLine(line, i + 1);
    if (p.error) return { error: p.error };
    items.push(p.item);
  }
  for (let i = 0; i < items.length; i++) {
    if (items[i].n !== i + 1)
      return { error: `cdd/backlog.md: ids must run PF-1..PF-${items.length} in order — ${items[i].id} breaks the sequence` };
  }
  return { header, items };
}

const render = (it) =>
  `- ${it.id} [${it.status}] ${it.summary} | source: ${it.source}` +
  (it.change !== undefined ? ` | change: ${it.change}` : "") +
  (it.note !== undefined ? ` | note: ${it.note}` : "");

function writeBacklog(root, header, items) {
  const file = backlogPath(root);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const head = header.length ? [...header, ""] : [...HEADER_LINES];
  fs.writeFileSync(file, [...head, ...items.map(render)].join("\n") + "\n");
}

const noPipe = (label, v) =>
  typeof v === "string" && v.includes("|")
    ? { error: `${label} must not contain "|" (the item segment separator): ${v}` }
    : null;

/** shared field checks — one message per failure, identical across actions */
const pipes = (fields) => {
  for (const [label, v] of fields) {
    if (v === undefined) continue;
    const bad = noPipe(label, v);
    if (bad) return bad.error;
  }
  return null;
};
const badStatus = (st) =>
  STATUSES.includes(st)
    ? null
    : `unknown status ${JSON.stringify(st)} (allowed: ${STATUSES.join(", ")})`;
/** list (the default action): render every item line with id and status. */
export function listBacklog(root) {
  const r = readBacklog(root);
  if (r.error) return { ok: false, error: r.error };
  if (!r.items.length)
    return { ok: true, items: [], text: "cdd/backlog.md holds no items yet — add one with action add (summary + source)." };
  return { ok: true, items: r.items, text: r.items.map(render).join("\n") };
}

/** add: append the next id on a grammar-conforming line; create the file
 * (with its header) on first write. */
export function addBacklogItem(root, { summary, source, note, change, status } = {}) {
  if (summary === undefined || summary === null || String(summary).trim() === "")
    return { ok: false, error: 'action add requires "summary" (one line, no "|")' };
  if (source === undefined || source === null || String(source).trim() === "")
    return { ok: false, error: 'action add requires "source" (the run, review, or archived change that raised it)' };
  const pipe = pipes([
    ["summary", summary],
    ["source", source],
    ["change", change],
    ["note", note],
  ]);
  if (pipe) return { ok: false, error: pipe };
  const st = status ?? "open";
  const bad = badStatus(st);
  if (bad) return { ok: false, error: bad };
  const r = readBacklog(root);
  if (r.error) return { ok: false, error: r.error };
  const n = r.items.length + 1;
  const item = { id: `PF-${n}`, n, status: st, summary: String(summary), source: String(source), change: change === undefined ? undefined : String(change), note: note === undefined ? undefined : String(note) };
  writeBacklog(root, r.header, [...r.items, item]);
  return { ok: true, id: item.id, text: `added ${item.id}:\n${render(item)}` };
}

/** resolve: rewrite one item's status; merge change/note (keep the existing
 * segment when not supplied). Resolving to open refuses — open is the
 * starting status, not a resolution. */
export function resolveBacklogItem(root, { id, status, change, note } = {}) {
  if (status === undefined || status === null || String(status).trim() === "")
    return { ok: false, error: `action resolve requires "status" (allowed: ${STATUSES.join(", ")})` };
  const bad = badStatus(status);
  if (bad) return { ok: false, error: bad };
  if (status === "open") return { ok: false, error: "resolving to open refuses — open is the starting status; resolve to done, won't-do, watch, or seeded-into-change" };
  if (status === "seeded-into-change" && (change === undefined || String(change).trim() === ""))
    return { ok: false, error: 'seeded-into-change requires the adopting change name ("change": "<name>")' };
  const pipe = pipes([
    ["change", change],
    ["note", note],
  ]);
  if (pipe) return { ok: false, error: pipe };
  if (id === undefined || id === null || String(id).trim() === "") return { ok: false, error: 'action resolve requires "id" (e.g. PF-1)' };
  const r = readBacklog(root);
  if (r.error) return { ok: false, error: r.error };
  const norm = String(id).replace(/^PF-/i, "");
  const idx = r.items.findIndex((it) => it.n === Number(norm));
  if (idx === -1)
    return { ok: false, error: `unknown id ${id} — the backlog holds ${r.items.length ? `PF-1..PF-${r.items.length}` : "no items"}` };
  const it = r.items[idx];
  const merged = {
    ...it,
    status,
    change: change !== undefined ? String(change) : it.change,
    note: note !== undefined ? String(note) : it.note,
  };
  const items = [...r.items];
  items[idx] = merged;
  writeBacklog(root, r.header, items);
  return { ok: true, id: merged.id, text: `resolved ${merged.id}:\n${render(merged)}` };
}
