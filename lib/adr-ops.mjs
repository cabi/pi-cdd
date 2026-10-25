#!/usr/bin/env node
// adr-ops — the adrs discovery op and the reconfirm op, dispatched thin from
// index.ts the way lib/backlog.mjs serves the backlog op. Everything these
// ops know about ADRs — the claims index, the claim map, the status
// vocabulary — comes from scripts/adr-index.mjs, the same single
// source the drift guard reads; nothing here re-states parsing, matching, or
// vocabulary.
// Library, not a command: direct execution is refused (exit 2, the shared
// convention of lib/backlog.mjs and scripts/grammar-law.mjs).

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { ADR_STATUSES, buildAdrIndex, buildClaimMap } from "../scripts/adr-index.mjs";
import { MECH_GREP, parseSpecModel } from "../scripts/grammar-law.mjs";
import { archivedBasename } from "./store.mjs";

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.error(
    "lib/adr-ops.mjs is a library, not a command — run the adrs/reconfirm ops via the cdd tool (op: adrs, op: reconfirm)"
  );
  process.exit(2);
}

const todayISO = () => new Date().toISOString().slice(0, 10);

// MECH_GREP comes from grammar-law.mjs — the ops and the guard agree on which
// commits are mechanical by construction, not by copy.

const git = (root, args) => {
  try {
    return execFileSync("git", ["-C", root, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch {
    return null;
  }
};

// Last non-mechanical commit date (yyyy-mm-dd) touching a file, or null.
const lastCommitDate = (root, rel) => {
  const out = git(root, ["log", "-1", `--format=%ad`, "--date=short", "--extended-regexp", "--grep", MECH_GREP, "--invert-grep", "--", rel]);
  return out ? out.trim() : null;
};

const trackedFiles = (root) => {
  const out = git(root, ["ls-files"]);
  return out ? out.split("\n").filter(Boolean) : [];
};

const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
const accepted = (adrs) => adrs.filter((a) => a.status === "accepted");

// --- the status-vocabulary hint (Levenshtein ≤ 2 OR unambiguous prefix;
// an ambiguous tie lists the candidates and hints nothing) -----------------

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

export function statusRefusal(value, vocab = ADR_STATUSES) {
  const near = vocab.filter((v) => levenshtein(value, v) <= 2);
  const pref = vocab.filter((v) => v.startsWith(value));
  const pool = [...new Set([...near, ...pref])];
  let tail = "";
  if (pool.length === 1) tail = ` — did you mean: --status ${pool[0]}`;
  else if (pool.length > 1) tail = ` — ambiguous: ${pool.join(", ")}`;
  return `unknown status ${JSON.stringify(value)} (allowed: ${vocab.join(", ")})${tail}`;
}

// --- path normalization -----------------------------------------------------

function normalizeCode(root, raw) {
  let p = String(raw);
  while (p.startsWith("./")) p = p.slice(2);
  if (path.isAbsolute(p)) {
    const rel = path.relative(root, p);
    if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) {
      return { ok: false, error: `path ${JSON.stringify(raw)} is outside the store root — query a path inside the store` };
    }
    p = rel.split(path.sep).join("/");
  }
  const norm = path.posix.normalize(p);
  if (norm === ".." || norm.startsWith("../") || path.posix.isAbsolute(norm)) {
    return { ok: false, error: `path ${JSON.stringify(raw)} is outside the store root — query a path inside the store` };
  }
  return { ok: true, value: norm };
}

// --- the adrs op ------------------------------------------------------------

const row = (a) => `${a.id}  ${a.title}  [${a.status}]  ${a.globs.length ? a.globs.join(", ") : "-"}`;
const EMPTY_HINT = "run `cdd adrs` to see all claims";

export function adrsOp(root, opts = {}) {
  const adrs = buildAdrIndex(root).sort(byId);

  if (opts.status !== undefined && !ADR_STATUSES.includes(opts.status)) {
    return { ok: false, error: statusRefusal(opts.status) };
  }

  if (opts.code !== undefined) {
    const norm = normalizeCode(root, opts.code);
    if (!norm.ok) return { ok: false, error: norm.error };
    const p = norm.value;
    // The per-path governing query comes from the shared claim map
    // (scripts/adr-index.mjs) — tracked and untracked paths alike; the op
    // holds no glob translation and no claiming loop of its own.
    const tracked = trackedFiles(root);
    const map = buildClaimMap({ adrIndex: adrs, tracked });
    const dir = fs.existsSync(path.join(root, p)) && fs.statSync(path.join(root, p)).isDirectory();
    let governing;
    let head;
    if (dir) {
      const under = tracked.filter((f) => f === p || f.startsWith(`${p}/`));
      const set = new Map();
      for (const f of under) for (const a of map.governingFor(f)) set.set(a.id, a);
      governing = [...set.values()].sort(byId);
      head = `${governing.length} ADR(s) govern any claimed file under ${p} (a directory matches any claimed file under it, in id order):`;
    } else {
      governing = map.governingFor(p);
      head = `${governing.length} ADR(s) govern ${p} (in id order):`;
    }
    if (!governing.length) {
      return { ok: true, text: `no ADR governs ${p} — ${EMPTY_HINT}` };
    }
    return { ok: true, text: `${head}\n${governing.map(row).join("\n")}` };
  }

  const filtered = opts.status !== undefined ? adrs.filter((a) => a.status === opts.status) : adrs;
  const head =
    opts.status !== undefined
      ? `${filtered.length} of ${adrs.length} ADR(s) with status ${opts.status}:`
      : `${adrs.length} ADR(s) in cdd/decisions/ (in id order):`;
  const body = filtered.map(row).join("\n");
  const tail = opts.status === undefined ? `\nFilter: --status <value> (${ADR_STATUSES.join(", ")}); reverse lookup: --code <path>.` : "";
  return { ok: true, text: `${head}\n${body}${tail}` };
}

// --- the reconfirm op --------------------------------------------------------

const RECONFIRM_LINE = /^- Reconfirmed by (.+?) on (\d{4}-\d{2}-\d{2}): (.+)$/;
const EPOCH = "1970-01-01";

const openChanges = (root) => {
  const dir = path.join(root, "cdd", "changes");
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith("."))
      .map((d) => d.name)
      .sort();
  } catch {
    return [];
  }
};

// Archived change names: the archive dir's <yyyymmdd>-<name> folders → <name>.
const archivedChanges = (root) => {
  const dir = path.join(root, "cdd", "archive");
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && /^\d{8}-.+/.test(d.name))
      .map((d) => d.name.slice(9))
      .sort();
  } catch {
    return [];
  }
};

// Every change name a reconfirmation may lawfully ride: open or archived.
const knownChanges = (root) => [...new Set([...openChanges(root), ...archivedChanges(root)])];

// The open changes' delta specs, parsed with the shared spec parse
// (grammar-law.mjs) — the claim derivation itself happens once, in the shared
// claim map (scripts/adr-index.mjs), the same surface the guard's A1 reads.
const openDeltaSpecs = (root, changes) => {
  const specs = [];
  for (const name of changes) {
    const specsDir = path.join(root, "cdd", "changes", name, "specs");
    let caps = [];
    try {
      caps = fs.readdirSync(specsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
    } catch {
      continue;
    }
    for (const cap of caps) {
      let text = "";
      try {
        text = fs.readFileSync(path.join(specsDir, cap, "spec.md"), "utf8");
      } catch {
        continue;
      }
      specs.push({ rel: `cdd/changes/${name}/specs/${cap}/spec.md`, model: parseSpecModel(text) });
    }
  }
  return specs;
};

const reconfirmDates = (text) =>
  [...text.matchAll(new RegExp(RECONFIRM_LINE.source, "gm"))].map((m) => m[2]).sort().at(-1) ?? null;

export function reconfirmOp(root, opts = {}) {
  if (opts.check === true) return checkOp(root, opts.change);

  const adrs = buildAdrIndex(root).sort(byId);
  const raw = opts.id;
  if (!raw) {
    return { ok: false, error: 'reconfirm requires an ADR id — pass id: "ADR-0008" (run `cdd adrs` to see every decision)' };
  }
  const m = /^ADR-(\d{4})$/i.exec(String(raw).trim()) ?? /^(\d{4})$/.exec(String(raw).trim());
  const adr = m ? adrs.find((a) => a.id === `ADR-${m[1]}`) : undefined;
  if (!adr) {
    return { ok: false, error: `unknown ADR id ${JSON.stringify(String(raw))} — run \`cdd adrs\` to see every decision` };
  }
  if (adr.status === "superseded") {
    return {
      ok: false,
      error: `${adr.id} is superseded — a superseded decision is not reconfirmed; follow the supersede path instead: write a new ADR that records the change and marks ${adr.id} superseded`,
    };
  }

  let change = opts.change;
  if (!change) {
    const opens = openChanges(root);
    if (opens.length === 0) {
      return {
        ok: false,
        error: "no open change to reconfirm for — pass --change <name> (the post-archive path, lawful after Close) or open a change first",
      };
    }
    if (opens.length > 1) {
      return { ok: false, error: `multiple open changes (${opens.join(", ")}) — pass --change <name> to pick one` };
    }
    change = opens[0];
  }
  if (typeof change !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(change)) {
    return { ok: false, error: `change name ${JSON.stringify(change)} is not kebab-case — pass --change <name>` };
  }
  const known = knownChanges(root);
  if (!known.includes(change) && !known.includes(archivedBasename(change))) {
    const opens = openChanges(root);
    const hint = opens.length ? `open: ${opens.join(", ")}` : "no open change";
    return {
      ok: false,
      error: `unknown change ${JSON.stringify(change)} — ${hint}; archived changes live under cdd/archive/<date>-<name>`,
    };
  }

  const evidence = opts.evidence;
  if (!evidence || !String(evidence).trim()) {
    return { ok: false, error: "--evidence is required — one line saying why the decision still holds (it rides the ADR as the reconfirmation record)" };
  }
  if (/[\r\n]/.test(String(evidence))) {
    return { ok: false, error: "evidence must be one line — newlines would break the pinned reconfirmation-line grammar" };
  }

  const file = path.join(root, adr.fileRel);
  let text = "";
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    return { ok: false, error: `cannot read ${adr.fileRel}` };
  }
  const existing = text
    .split("\n")
    .find((l) => RECONFIRM_LINE.test(l) && l.startsWith(`- Reconfirmed by ${change} on `));
  if (existing) {
    return {
      ok: false,
      error: `${change} already reconfirmed ${adr.id} ("${existing}") — one reconfirmation per change per ADR; the existing line stays the record`,
    };
  }

  const line = `- Reconfirmed by ${change} on ${todayISO()}: ${String(evidence).trim()}`;
  const lines = text.split("\n");
  let at = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (/^- Reconfirmed by .+ on \d{4}-\d{2}-\d{2}:/.test(lines[i])) {
      at = i;
      break;
    }
  }
  if (at >= 0) {
    lines.splice(at + 1, 0, line);
    fs.writeFileSync(file, lines.join("\n"));
  } else {
    fs.writeFileSync(file, text.replace(/\n*$/, "\n") + "\n" + line + "\n");
  }
  return { ok: true, text: `reconfirmed ${adr.id} for ${change}:\n${line}` };
}

// --- --check: the pre-flight ------------------------------------------------

function checkOp(root, change) {
  let scope;
  if (change !== undefined) {
    const known = knownChanges(root);
    if (!known.includes(change) && !known.includes(archivedBasename(change))) {
      const opens = openChanges(root);
      const hint = opens.length ? `open: ${opens.join(", ")}` : "no open change";
      return {
        ok: false,
        error: `unknown change ${JSON.stringify(change)} — ${hint}; archived changes live under cdd/archive/<date>-<name>`,
      };
    }
    scope = [change];
  } else {
    const opens = openChanges(root);
    if (!opens.length) {
      return { ok: false, error: "no open change to check — --check pre-flights the open change's claims before the feature commit (post-archive: pass --change <name>)" };
    }
    if (opens.length > 1) {
      return { ok: false, error: `multiple open changes (${opens.join(", ")}) — pass --change <name> to narrow the pre-flight to one change's claims` };
    }
    scope = opens;
  }
  const adrs = buildAdrIndex(root).sort(byId);
  const tracked = trackedFiles(root);
  const claimMap = buildClaimMap({ specs: openDeltaSpecs(root, scope), adrIndex: adrs, tracked });
  const claimed = new Set();
  for (const set of claimMap.filesOfSpec.values()) for (const f of set) claimed.add(f);
  const findings = [];
  for (const a of accepted(adrs)) {
    const governedSet = claimMap.filesOfAdr.get(a.id) ?? new Set();
    const governed = [...claimed].filter((f) => governedSet.has(f)).sort();
    if (!governed.length) continue;
    const text = fs.readFileSync(path.join(root, a.fileRel), "utf8");
    const reconfirmedAt = reconfirmDates(text);
    const baseline = reconfirmedAt ?? lastCommitDate(root, a.fileRel) ?? EPOCH;
    for (const f of governed) {
      const moved = lastCommitDate(root, f);
      if (moved && moved > baseline) {
        findings.push(`${a.id}  ${f} moved ${moved} — ${reconfirmedAt ? `last reconfirmed ${reconfirmedAt}` : `ADR file last touched ${baseline}`}: run \`cdd reconfirm ${a.id} --evidence <one line>\``);
      }
    }
  }
  if (!findings.length) {
    return { ok: true, text: `--check: ${scope.join(", ")} claims no file that moved past its ADR's latest reconfirmation — every governing ADR is current` };
  }
  return {
    ok: true,
    text: `--check: ${findings.length} claim(s) moved past their ADR's latest reconfirmation — reconfirm before the feature commit:\n${findings.join("\n")}`,
  };
}
