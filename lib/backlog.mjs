#!/usr/bin/env node
/**
 * backlog — the process-finding backlog: one flat list, one line per
 * item, written only through this module (list is read-only).
 *
 * Item grammar (one line, ids strictly increasing):
 *   - PF-n [status] summary | source: ref [| change: name] [| note: text]
 *                  [| premise: micro-form] [| verified: dates]
 * status: open | watch | done | won't-do | seeded-into-change
 * premise micro-form: exists:<path> | absent:<path> | grep:<literal>@<path>=<count>
 * verified: machine-written ISO dates (yyyy-mm-dd), strictly increasing —
 * revalidate appends one date per run-day, so the count is the item's
 * revalidation age; three dates demand a disposition.
 *
 * Premises evaluate in-process (fs + substring scan only — never shell,
 * never regex); revalidate reports verdicts per active item (open, watch,
 * seeded-into-change) but never rewrites a disposition, and list annotates
 * staleness. The file is living triage data, not spec: nothing here
 * validates its content against the specs, and the drift guard never
 * claims it.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

export const ACTIONS = ["list", "add", "resolve", "revalidate"];

export const STATUSES = ["open", "watch", "done", "won't-do", "seeded-into-change"];
/** statuses revalidate reports on — done, won't-do are settled dispositions */
export const ACTIVE_STATUSES = ["open", "watch", "seeded-into-change"];
const ITEM_RE = new RegExp(`^- PF-(\\d+) \\[(${STATUSES.join("|")})\\] (.+)$`);
const GRAMMAR_DOC = `"- PF-n [status] summary | source: ref [| change: name] [| note: text] [| premise: micro-form] [| verified: dates]" (status: ${STATUSES.join(" | ")})`;
export const PREMISE_FORMS_DOC = "exists:<path> | absent:<path> | grep:<literal>@<path>=<count>";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Refuse silent direct execution: run as a command this module would print
// nothing and exit 0 — the shared usage-error convention (validate.mjs,
// grammar-law.mjs, index.ts): one stderr line, exit 2.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.error(
    `backlog.mjs is a library, not a command — the backlog is maintained through the cdd tool's backlog operation (actions: ${ACTIONS.join(", ")})`
  );
  process.exit(2);
}

const HEADER_LINES = [
  "# backlog — process findings",
  "",
  "Conventions: a steer is believed only when an on-disk artifact backs it;",
  "milestone and Close reports cite PF-n ids, never prose; an item may carry",
  "a premise micro-form (exists:/absent:/grep:) that action revalidate",
  "checks against the store, stamping a verified date per run-day.",
  "",
];

const backlogPath = (root) => path.join(root, "cdd", "backlog.md");

/** A premise path must be store-relative, non-empty, and free of empty or
 * parent-hopping segments — premises read inside the store, never outside. */
const pathBad = (p) => {
  if (!p) return "path is empty";
  if (p.startsWith("/")) return `path must be store-relative (no leading /): ${p}`;
  if (p.split("/").some((seg) => seg === "" || seg === "..")) return `path must not hold empty or ".." segments: ${p}`;
  return null;
};

/** Parse one premise micro-form. Syntax only — evaluation is revalidate's
 * job. grep splits on the single @ and the first = after it; the literal
 * may hold spaces, the count must be a non-negative integer. */
export function parsePremise(text) {
  if (typeof text !== "string") return { error: `premise must be a string: ${text}` };
  for (const kind of ["exists", "absent"]) {
    if (!text.startsWith(`${kind}:`)) continue;
    const p = text.slice(kind.length + 1);
    const bad = pathBad(p);
    if (bad) return { error: `premise ${JSON.stringify(text)}: ${bad}` };
    return { premise: { kind, path: p } };
  }
  if (text.startsWith("grep:")) {
    const body = text.slice("grep:".length);
    const at = body.indexOf("@");
    if (at < 1) return { error: `premise ${JSON.stringify(text)}: expected ${PREMISE_FORMS_DOC}` };
    if (body.indexOf("@", at + 1) !== -1)
      return { error: `premise ${JSON.stringify(text)}: "@" separates literal from path and may appear once` };
    const tail = body.slice(at + 1);
    const eq = tail.indexOf("=");
    if (eq < 1) return { error: `premise ${JSON.stringify(text)}: expected ${PREMISE_FORMS_DOC}` };
    const literal = body.slice(0, at);
    const p = tail.slice(0, eq);
    const count = tail.slice(eq + 1);
    const bad = pathBad(p);
    if (bad) return { error: `premise ${JSON.stringify(text)}: ${bad}` };
    if (!/^\d+$/.test(count))
      return { error: `premise ${JSON.stringify(text)}: count must be a non-negative integer: ${count}` };
    return { premise: { kind: "grep", literal, path: p, count: Number(count) } };
  }
  return { error: `premise ${JSON.stringify(text)} is not one of the micro-forms (${PREMISE_FORMS_DOC})` };
}

/** Parse a verified segment: ISO dates separated by single spaces, distinct
 * and strictly increasing — an append-only history. */
function parseVerified(text) {
  const dates = text.split(" ").filter(Boolean);
  if (!dates.length || dates.some((d) => !DATE_RE.test(d)))
    return { error: `verified must hold ISO dates (yyyy-mm-dd) separated by single spaces: ${text}` };
  for (let i = 1; i < dates.length; i++)
    if (!(dates[i] > dates[i - 1]))
      return { error: `verified dates must be distinct and strictly increasing (append-only history): ${text}` };
  return { dates };
}

function parseLine(line, no) {
  const m = line.match(ITEM_RE);
  if (!m) return { error: `cdd/backlog.md line ${no}: not grammar ${GRAMMAR_DOC}: ${line}` };
  const [, id, status, rest] = m;
  const parts = rest.split(" | ");
  if (parts.length < 2 || parts.length > 6)
    return { error: `cdd/backlog.md line ${no}: expected "summary | source: <ref>" plus optional change/note/premise/verified segments: ${line}` };
  const EXPECT = [
    ["source", /^source: \S/],
    ["change", /^change: \S/],
    ["note", /^note: /],
    ["premise", /^premise: (exists|absent|grep):/],
    ["verified", /^verified: \S/],
  ];
  const seg = {};
  let si = 0;
  for (const part of parts.slice(1)) {
    while (si < EXPECT.length && !EXPECT[si][1].test(part)) si++;
    if (si >= EXPECT.length)
      return { error: `cdd/backlog.md line ${no}: segments after the summary must be source:, change:, note:, premise:, verified: (in that order, each at most once): ${line}` };
    seg[EXPECT[si][0]] = part.slice(EXPECT[si][0].length + 2);
    si++;
  }
  if (seg.source === undefined) return { error: `cdd/backlog.md line ${no}: the second segment must be "source: <ref>": ${line}` };
  if (seg.premise !== undefined) {
    const p = parsePremise(seg.premise);
    if (p.error) return { error: `cdd/backlog.md line ${no}: ${p.error}: ${line}` };
  }
  if (seg.verified !== undefined) {
    const v = parseVerified(seg.verified);
    if (v.error) return { error: `cdd/backlog.md line ${no}: ${v.error}: ${line}` };
  }
  return {
    item: {
      id: `PF-${id}`,
      n: Number(id),
      status,
      summary: parts[0],
      source: seg.source,
      change: seg.change,
      note: seg.note,
      premise: seg.premise,
      verified: seg.verified,
    },
  };
}

/** Parse the backlog file: header (# lines) + items; refuse any off-grammar
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
  (it.note !== undefined ? ` | note: ${it.note}` : "") +
  (it.premise !== undefined ? ` | premise: ${it.premise}` : "") +
  (it.verified !== undefined ? ` | verified: ${it.verified}` : "");

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

/** Evaluate one parsed premise against the store — in-process only: exists
 * stats a path, absent negates it, grep counts lines holding the literal
 * and a vanished target is an anchor gone, not a verdict. */
function evaluatePremise(root, premise) {
  const target = path.join(root, premise.path);
  if (premise.kind === "exists") return { holds: fs.existsSync(target) };
  if (premise.kind === "absent") return { holds: !fs.existsSync(target) };
  if (!fs.existsSync(target)) return { anchorGone: true, path: premise.path };
  const n = fs.readFileSync(target, "utf8").split("\n").filter((l) => l.includes(premise.literal)).length;
  return { holds: n === premise.count };
}

const todayISO = () => new Date().toISOString().slice(0, 10);

/** list (the default action): render every item line with id and status,
 * then annotate staleness for active items — verified age (or never) and
 * vanished grep anchors. */
export function listBacklog(root) {
  const r = readBacklog(root);
  if (r.error) return { ok: false, error: r.error };
  if (!r.items.length)
    return { ok: true, items: [], text: "cdd/backlog.md holds no items yet — add one with action add (summary + source)." };
  const staleness = [];
  for (const it of r.items) {
    if (!ACTIVE_STATUSES.includes(it.status)) continue;
    const bits = [];
    if (it.verified !== undefined) {
      const last = it.verified.split(" ").filter(Boolean).pop();
      const days = Math.floor((Date.parse(todayISO()) - Date.parse(last)) / 86400000);
      bits.push(`verified ${last} (${days} day${days === 1 ? "" : "s"} ago)`);
    } else bits.push("never verified");
    if (it.premise !== undefined && it.premise.startsWith("grep:")) {
      const p = parsePremise(it.premise);
      if (p.premise && !fs.existsSync(path.join(root, p.premise.path))) bits.push(`anchor gone: ${p.premise.path}`);
    }
    staleness.push(`${it.id} [${it.status}] ${bits.join("; ")}`);
  }
  const text = r.items.map(render).join("\n") + (staleness.length ? `\n\nstaleness:\n${staleness.join("\n")}` : "");
  return { ok: true, items: r.items, text };
}

/** add: append the next id on a grammar-conforming line; create the file
 * (with its header) on first write. */
export function addBacklogItem(root, { summary, source, note, change, status, premise } = {}) {
  if (summary === undefined || summary === null || String(summary).trim() === "")
    return { ok: false, error: 'action add requires "summary" (one line, no "|")' };
  if (source === undefined || source === null || String(source).trim() === "")
    return { ok: false, error: 'action add requires "source" (the run, review, or archived change that raised it)' };
  const pipe = pipes([
    ["summary", summary],
    ["source", source],
    ["change", change],
    ["note", note],
    ["premise", premise],
  ]);
  if (pipe) return { ok: false, error: pipe };
  const st = status ?? "open";
  const bad = badStatus(st);
  if (bad) return { ok: false, error: bad };
  if (premise !== undefined) {
    const p = parsePremise(String(premise));
    if (p.error) return { ok: false, error: `action add requires a valid premise (${PREMISE_FORMS_DOC}): ${premise}` };
  }
  const r = readBacklog(root);
  if (r.error) return { ok: false, error: r.error };
  const n = r.items.length + 1;
  const item = { id: `PF-${n}`, n, status: st, summary: String(summary), source: String(source), change: change === undefined ? undefined : String(change), note: note === undefined ? undefined : String(note), premise: premise === undefined ? undefined : String(premise) };
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

/** revalidate: re-check every premise-bearing active item against the
 * store, answer one verdict per active item, and stamp today's date on the
 * verified history (append-only, idempotent within a day). Three or more
 * dates flag the item for forced disposition. It reports — it never
 * rewrites a status, summary, or any other segment. */
export function revalidateBacklog(root) {
  const r = readBacklog(root);
  if (r.error) return { ok: false, error: r.error };
  const today = todayISO();
  const lines = [];
  let changed = false;
  const items = r.items.map((it) => {
    if (!ACTIVE_STATUSES.includes(it.status)) return it;
    if (it.premise === undefined) {
      lines.push(`${it.id} [${it.status}] NOT-MECHANICAL — no premise on the item`);
      return it;
    }
    const p = parsePremise(it.premise);
    if (p.error) return it; // unreachable: readBacklog already refused the line
    const ev = evaluatePremise(root, p.premise);
    let verdict;
    if (ev.anchorGone) verdict = `${it.id} [${it.status}] ANCHOR-GONE — grep anchor ${ev.path} is gone`;
    else if (ev.holds) verdict = `${it.id} [${it.status}] hold — premise holds: ${it.premise}`;
    else verdict = `${it.id} [${it.status}] ROTTED — premise now false: ${it.premise}`;
    const dates = it.verified !== undefined ? it.verified.split(" ").filter(Boolean) : [];
    const stamped = dates[dates.length - 1] === today ? dates : [...dates, today];
    if (stamped.length !== dates.length) changed = true;
    if (stamped.length >= 3)
      verdict += ` — ${stamped.length} verified dates, no disposition change — force a disposition (fix via change, won't-do with reason, or superseded-by)`;
    lines.push(verdict);
    return stamped.length === dates.length ? it : { ...it, verified: stamped.join(" ") };
  });
  if (changed) writeBacklog(root, r.header, items);
  return { ok: true, items, text: lines.length ? lines.join("\n") : "no active items — nothing to revalidate" };
}
