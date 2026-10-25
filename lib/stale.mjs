// Staleness guard: a long-lived process that outlived edits to the
// extension's own source must not mutate a store with pre-edit code. The
// dispatcher snapshots the extension source surface at load and re-globs +
// re-digests it on every dispatch; the diff decides on membership plus
// per-file content digests, so a changed file counts as changed even when
// its modification time and size are unchanged. Mutating ops are refused
// with the fresh-node command that runs the same op; verdict and read ops
// answer with one staleness warning. Pure functions, read-only filesystem
// access, no store knowledge — the library stays usable standalone.

import * as fs from "node:fs";
import * as path from "node:path";
import { createHash } from "node:crypto";

const digestOf = (abs) => createHash("sha256").update(fs.readFileSync(abs)).digest("hex");

function walk(dir, filter, out, relPrefix) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const rel = relPrefix ? `${relPrefix}/${e.name}` : e.name;
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) walk(abs, filter, out, rel);
    else if (e.isFile() && filter(e.name)) out.push([rel, abs]);
  }
}

// The extension source surface: the entry, the library, the door scripts,
// and the vendored tree. Never the adopting project's cdd/ store — store
// writes are ordinary op results, not staleness.
export function surfaceFiles(extDir) {
  const files = [];
  const entry = path.join(extDir, "index.ts");
  if (fs.existsSync(entry)) files.push(["index.ts", entry]);
  walk(path.join(extDir, "lib"), () => true, files, "lib");
  walk(path.join(extDir, "scripts"), (n) => n.endsWith(".mjs"), files, "scripts");
  walk(path.join(extDir, "vendor"), () => true, files, "vendor");
  return files;
}

export function snapshotSources(extDir) {
  const snap = new Map();
  for (const [rel, abs] of surfaceFiles(extDir)) snap.set(rel, { digest: digestOf(abs) });
  return snap;
}

// Diff decides on membership + digest only.
export function staleEntries(extDir, snapshot) {
  const current = new Map();
  for (const [rel, abs] of surfaceFiles(extDir)) current.set(rel, { digest: digestOf(abs) });
  const stale = [];
  for (const [rel, cur] of current) {
    const was = snapshot.get(rel);
    if (!was) stale.push({ path: rel, kind: "added" });
    else if (was.digest !== cur.digest) stale.push({ path: rel, kind: "changed" });
  }
  for (const rel of snapshot.keys()) if (!current.has(rel)) stale.push({ path: rel, kind: "removed" });
  return stale.sort((a, b) => a.path.localeCompare(b.path));
}

const MUTATING_OPS = new Set(["init", "new", "archive", "reconfirm"]);
const READ_OPS = new Set(["validate", "status", "adrs", "help"]);

// Unknown ops and unknown backlog actions grade mutating: the conservative
// side is refusal, never a silent mutation.
export function gradeOp(op, backlogAction = "list") {
  if (op === "backlog") return backlogAction === "list" ? "read" : "mutating";
  if (MUTATING_OPS.has(op)) return "mutating";
  if (READ_OPS.has(op)) return "read";
  return "mutating";
}

// The lawful fresh-node path per mutating op: the payload reads the extension
// dir and the target project root from argv (never interpolated into the
// shell string), imports the extension library by absolute file URL, and
// works with the extension and the target project in different trees. The
// whole payload sits in shell single quotes and carries no single quote
// itself; the two path arguments are single-quoted for the shell, so nothing
// is subject to shell expansion. Model-facing placeholders: <name>, <pf-id>,
// <adr-id>, <summary>, <source>, <premise>, <evidence>.
export function freshNodeCommand(opKey, extDir, root) {
  const sq = (s) => `'${String(s).replace(/'/g, "'\\''")}'`;
  const lib = (m, expr) =>
    `node -e 'const [extDir, root] = process.argv.slice(1); const { pathToFileURL } = require("node:url"); import(pathToFileURL(extDir + "/${m}").href).then((m) => console.log(JSON.stringify(${expr}))).catch((e) => { console.error(String(e)); process.exit(1); })' -- ${sq(extDir)} ${sq(root)}`;
  switch (opKey) {
    case "init":
      return lib("lib/store.mjs", `m.initStore(root, extDir, { ci: "both", hooks: true })`);
    case "new":
      return lib("lib/store.mjs", `m.createChange(root, "<name>")`);
    case "archive":
      return lib("lib/store.mjs", `m.archiveChange(root, "<name>")`);
    case "backlog add":
      return lib("lib/backlog.mjs", `m.addBacklogItem(root, { summary: "<summary>", source: "<source>", premise: "<premise>" })`);
    case "backlog resolve":
      return lib("lib/backlog.mjs", `m.resolveBacklogItem(root, { id: "<pf-id>", status: "done" })`);
    case "backlog revalidate":
      return lib("lib/backlog.mjs", `m.revalidateBacklog(root)`);
    case "reconfirm":
      return lib("lib/adr-ops.mjs", `m.reconfirmOp(root, { id: "<adr-id>", change: "<name>", evidence: "<evidence>" })`);
    default:
      return lib("lib/store.mjs", `m.hasStore(root)`);
  }
}

const listStale = (stale) => stale.map((s) => `${s.path} (${s.kind})`).join(", ");

export function refusalFor(opKey, stale, extDir, root) {
  const cmd = freshNodeCommand(opKey, extDir, root);
  const text = `cdd: refusing ${opKey} — this process holds pre-edit extension code; changed since load: ${listStale(
    stale,
  )}. Run the op in a fresh node instead:\n  ${cmd}\n(substitute the <name>, <pf-id>, <adr-id>, <summary>, <source>, <premise>, <evidence> placeholders; then reload the extension so future dispatches are clean)`;
  return { text, data: { ok: false, error: text, stale, freshCommand: cmd, op: opKey } };
}

export function warningFor(stale) {
  const text = `staleness warning: extension code changed since this process loaded (${listStale(
    stale,
  )}) — this answer comes from pre-edit code; rerun the op in a fresh node for authority`;
  return { text, data: { stale, staleWarning: text } };
}
