#!/usr/bin/env node
// pi-cdd tool tests — the merged `cdd` dispatcher against the real libs.
// A fake ExtensionAPI captures what the factory registers, so these checks
// pin the declaration itself (one tool, static list, lean budget) plus the
// fill-in logic and every op's round-trip. No model calls; RUN_PI_LOOP=1 in
// smoke.mjs covers the live harness.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let pass = 0;
let fail = 0;
const failures = [];
async function check(id, name, fn) {
  try {
    await fn();
    pass++;
    console.log(`  ok   ${id}  ${name}`);
  } catch (e) {
    fail++;
    failures.push(`${id}: ${e.message}`);
    console.log(`  FAIL ${id}  ${name}\n       ${e.message}`);
  }
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

function sandbox() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "pi-cdd-tools-"));
  return { root: d, dispose: () => fs.rmSync(d, { recursive: true, force: true }) };
}

// --- capture what the extension registers -------------------------------------

function fakeApi() {
  const api = {
    tools: [],
    commands: [],
    events: {},
    setActiveToolsCalls: 0,
    registerTool: (def) => api.tools.push(def),
    registerCommand: (name, def) => api.commands.push([name, def]),
    on: (ev, fn) => {
      api.events[ev] = fn;
    },
    setActiveTools: () => {
      api.setActiveToolsCalls++;
    },
  };
  return api;
}

const { loadViaPi } = await import(path.join(REPO, "tests", "pi-jiti.mjs"));
const { snapshotSources, staleEntries, gradeOp, refusalFor, freshNodeCommand } = await import(path.join(REPO, "lib", "stale.mjs"));
// index.ts imports lib/status-ui.ts, which needs the pi-tui alias — load it
// through the same jiti setup pi uses (tests/pi-jiti.mjs), plain import as fallback.
const mod = (await loadViaPi(path.join(REPO, "index.ts"))) ?? (await import(path.join(REPO, "index.ts")));
const api = fakeApi();
mod.default(api);

// --- T1: the declaration ------------------------------------------------------

await check("T1", "one lean `cdd` tool registered at load; list cannot change mid-session", () => {
  assert(api.tools.length === 1, `expected exactly 1 tool, got ${api.tools.length}: ${api.tools.map((t) => t.name)}`);
  const t = api.tools[0];
  assert(t.name === "cdd", `tool name: ${t.name}`);
  assert(typeof t.prepareArguments === "function", "prepareArguments missing");
  assert(t.parameters.properties.op.enum.length === 9, "op enum must list all nine ops");
  assert(JSON.stringify(t.parameters.required) === '["op"]', "only op is required");
  assert(api.commands.length === 5, `expected 5 commands, got ${api.commands.length}`);
  assert(api.events["before_agent_start"], "ambient hook not registered");
  assert(api.setActiveToolsCalls === 0, "extension must never call setActiveTools");
  // lean budget: name + description + parameters ≤ 900 chars (~225 tok, nine ops)
  const chars = t.name.length + t.description.length + JSON.stringify(t.parameters).length;
  assert(chars <= 900, `declaration is ${chars} chars (budget 900, nine ops)`);
  // no emphasis shouting, no prose that only OPS_DOC should carry
  assert(!/MUST|NEVER|[A-Z]{4,}/.test(t.description), `description has shouting/duplication: ${t.description}`);
  for (const dup of ["drift guard", "ADDED appends", "github", "PASS or FAIL"]) {
    assert(!t.description.includes(dup), `description duplicates OPS_DOC content: "${dup}"`);
  }
});

// --- T2: prepareArguments fill-ins --------------------------------------------

const fill = (args) => api.tools[0].prepareArguments(structuredClone(args));

await check("T2a", "fill-ins: legacy tool names map to ops", () => {
  assert(fill({ op: "cdd_init" }).op === "init", "cdd_init");
  assert(fill({ op: "cdd_new_change" }).op === "new", "cdd_new_change");
  assert(fill({ op: "cdd_validate" }).op === "validate", "cdd_validate");
  assert(fill({ op: "cdd_status" }).op === "status", "cdd_status");
  assert(fill({ op: "cdd_archive" }).op === "archive", "cdd_archive");
});

await check("T2b", "fill-ins: legacy top-level params fold into options as JSON", () => {
  let a = fill({ op: "validate", change: "add-x" });
  assert(a.name === "add-x" && a.options === "{}", JSON.stringify(a));
  a = fill({ op: "new", name: "add-x", capabilities: ["greeting"] });
  assert(a.options === '{"capabilities":["greeting"]}', JSON.stringify(a));
  a = fill({ op: "new", name: "add-x", capabilities: "greeting" });
  assert(a.options === '{"capabilities":["greeting"]}', `string capability not arrayed: ${a.options}`);
  a = fill({ op: "validate", mode: "strict" });
  assert(a.options === '{"mode":"strict"}', JSON.stringify(a));
  a = fill({ op: "init", ci: "none", hooks: false });
  assert(a.options === '{"ci":"none","hooks":false}', JSON.stringify(a));
});

await check("T2c", "fill-ins: options object becomes its JSON string; empty becomes {}", () => {
  assert(fill({ op: "validate", options: { mode: "strict" } }).options === '{"mode":"strict"}', "object options");
  assert(fill({ op: "status", options: "" }).options === "{}", "empty options");
});

await check("T2d", "fill-ins don't misfire: unfixable shapes pass through untouched", () => {
  // invalid JSON stays invalid (execute must report it), numbers stay numbers
  let a = fill({ op: "validate", options: "not json" });
  assert(a.options === "not json", JSON.stringify(a));
  a = fill({ op: "status", options: 5 });
  assert(a.options === 5, JSON.stringify(a));
  // both name and change present: canonical name wins, change dropped — no guess
  a = fill({ op: "validate", name: "a", change: "b" });
  assert(a.name === "a" && a.options === "{}", JSON.stringify(a));
  // a non-object arg is returned as-is
  assert(fill(undefined) === undefined && fill(null) === null, "non-object args");
  // un-mutated input: the original object is not modified
  const src = { op: "validate", mode: "strict" };
  fill(src);
  assert(src.mode === "strict" && src.options === undefined, "input mutated");
});

// --- T3: every op round-trips through the real libs ----------------------------

const call = async (args, cwd) => api.tools[0].execute(1, args, undefined, undefined, { cwd });
const textOf = (r) => r.content[0].text;

await check("T3a", "op init scaffolds the store (options honored)", async () => {
  const full = sandbox();
  const r = await call({ op: "init" }, full.root);
  assert(!r.isError && /cdd store initialized/.test(textOf(r)), textOf(r));
  assert(fs.existsSync(path.join(full.root, "cdd", "rules.md")), "no store");
  full.dispose();
  const lean = sandbox();
  const r2 = await call({ op: "init", options: '{"ci":"none","hooks":false}' }, lean.root);
  assert(!r2.isError, textOf(r2));
  assert(!fs.existsSync(path.join(lean.root, ".github", "workflows", "cdd.yml")), "ci:none still wrote workflows");
  assert(!fs.existsSync(path.join(lean.root, ".githooks", "pre-commit")), "hooks:false still wrote hooks");
  lean.dispose();
});

const sb = sandbox();
const ctrl = sandbox(); // no store — for the whole-store error path
await call({ op: "init" }, sb.root);
await call({ op: "new", name: "add-x", options: '{"capabilities":["x"]}' }, sb.root);
fs.mkdirSync(path.join(sb.root, "tests", "acceptance"), { recursive: true });

await check("T3b", "op new scaffolds the change folder", () => {
  for (const f of ["cdd/changes/add-x/proposal.md", "cdd/changes/add-x/tasks.md", "cdd/changes/add-x/specs/x/spec.md"]) {
    assert(fs.existsSync(path.join(sb.root, f)), `missing ${f}`);
  }
});

const w = (rel, t) => fs.writeFileSync(path.join(sb.root, rel), t);
w("cdd/changes/add-x/proposal.md", `# add-x

## Why

Need x.

## What Changes

- x

## Solutions Considered

- stdlib covers it

## Non-Goals

- none beyond scope

Done-When: x
Code: cli.js
`);
w("cdd/changes/add-x/specs/x/spec.md", `## ADDED Requirements

### Requirement: X1

X.

\`\`\`gherkin
Feature: X1

Scenario: x prints
Given x
When x runs
Then y is printed
  # Verified by: tests/acceptance/x-prints.test.js
\`\`\`
`);
w("cdd/changes/add-x/tasks.md", `# Tasks — add-x

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

- [x] 2.1 Design gate: single scenario, one task — no split needed

## 3. Implementation

- [x] 3.1 write x — verify by tests/acceptance/x-prints.test.js

## Done When Traceability

| d | 3.1 |

## 4. Close

- [ ] 4.1 cdd validate strict green, guard green
- [ ] 4.2 Archive — pair-commit: feature commit, then archive commit
`);

await check("T3c", "op validate: draft green, strict red without the pin, strict green with it", async () => {
  const draft = await call({ op: "validate", options: '{"change":"add-x"}' }, sb.root);
  assert(!draft.isError && /PASS/.test(textOf(draft)), textOf(draft));
  const strict = await call({ op: "validate", name: "add-x", options: '{"mode":"strict"}' }, sb.root);
  assert(strict.isError, "strict should be red while the pin file is missing");
  w("tests/acceptance/x-prints.test.js", "// pin\n");
  const strict2 = await call({ op: "validate", options: '{"change":"add-x","mode":"strict"}' }, sb.root);
  assert(!strict2.isError && /PASS/.test(textOf(strict2)), textOf(strict2));
});

await check("T3d", "op validate without a name validates the whole store", async () => {
  const r = await call({ op: "validate" }, sb.root);
  assert(!r.isError, textOf(r));
  const none = await call({ op: "validate" }, ctrl.root);
  assert(none.isError && /no cdd store/.test(textOf(none)), textOf(none));
});

await check("T3e", "op status reports open changes as JSON ≡ the view payload", async () => {
  const r = await call({ op: "status" }, sb.root);
  assert(!r.isError && /add-x/.test(textOf(r)) && /openChanges/.test(textOf(r)), textOf(r));
  const parsed = JSON.parse(textOf(r));
  assert(JSON.stringify(parsed) === JSON.stringify(r.details), "JSON payload must equal the view payload exactly");
  // exactly 1 status() call: both payloads must come from one call, pinned on the handler source
  const src = fs.readFileSync(path.join(REPO, "index.ts"), "utf8");
  const opCase = src.split('case "status":')[1].split('case "')[0];
  const calls = [...opCase.matchAll(/\bstatus\(/g)].length;
  assert(calls === 1, `op status must call status() exactly once (found ${calls})`);
});

await check("T3f", "op archive merges deltas and moves the folder", async () => {
  const r = await call({ op: "archive", name: "add-x" }, sb.root);
  assert(!r.isError && /archived/.test(textOf(r)), textOf(r));
  const arch = fs.readdirSync(path.join(sb.root, "cdd", "archive"));
  assert(arch.some((d) => /-add-x$/.test(d)), `no archived dir: ${arch}`);
  assert(fs.existsSync(path.join(sb.root, "cdd", "specs", "x", "spec.md")), "living spec not merged");
});

await check("T3g", "op help returns the full per-op parameters (nothing trimmed away)", async () => {
  const r = await call({ op: "help" }, sb.root);
  const t = textOf(r);
  for (const was of ["cdd_init", "cdd_new_change", "cdd_validate", "cdd_status", "cdd_archive"]) {
    assert(t.includes(was), `help missing original tool ${was}`);
  }
  for (const frag of ['"enum"', '"github"', '"gitlab"', '"draft"', '"strict"', '"required"', "Verified-by pin"]) {
    assert(t.includes(frag), `help missing parameter fragment: ${frag}`);
  }
  const doc = r.details;
  for (const op of ["init", "new", "validate", "status", "archive", "backlog", "adrs", "reconfirm"]) {
    assert(doc[op] && doc[op].description && doc[op].parameters, `help details missing op ${op}`);
  }
  assert(/options JSON string/.test(t), "help must say how to pass the parameters");
});

await check("T3h", "op backlog add/list/resolve round-trips through the library", async () => {
  const bo = sandbox();
  let r = await call({ op: "backlog", options: JSON.stringify({ action: "add", summary: "fixture finding", source: "tools T3h", premise: "exists:cdd/backlog.md" }) }, bo.root);
  assert(!r.isError && /PF-1/.test(textOf(r)), textOf(r));
  r = await call({ op: "backlog" }, bo.root);
  assert(!r.isError && /PF-1 \[open\]/.test(textOf(r)), textOf(r));
  r = await call({ op: "backlog", options: JSON.stringify({ action: "revalidate" }) }, bo.root);
  assert(!r.isError && /PF-1 \[open\] hold/.test(textOf(r)), textOf(r));
  r = await call({ op: "backlog", options: JSON.stringify({ action: "resolve", id: "PF-1", status: "done" }) }, bo.root);
  assert(!r.isError && /PF-1 \[done\]/.test(textOf(r)), textOf(r));
  r = await call({ op: "backlog", options: '{"action":"revalidate"}' }, bo.root);
  assert(!r.isError && /no active items/.test(textOf(r)), textOf(r));
  r = await call({ op: "backlog", options: '{"action":"purge"}' }, bo.root);
  assert(r.isError && /unknown action.*allowed: list, add, resolve, revalidate/.test(textOf(r)), textOf(r));
  bo.dispose();
});

await check("T3i", "op adrs round-trips through the library (typo hint included)", async () => {
  let r = await call({ op: "adrs" }, sb.root);
  assert(!r.isError, textOf(r));
  r = await call({ op: "adrs", options: '{"status":"drafed"}' }, sb.root);
  assert(r.isError && /did you mean: --status draft/.test(textOf(r)), textOf(r));
  assert(/allowed: accepted, superseded, draft, proposed/.test(textOf(r)), textOf(r));
});

await check("T3j", "op reconfirm round-trips through the library; tie rule pinned on a synthetic vocabulary", async () => {
  let r = await call({ op: "reconfirm", options: '{"id":"ADR-0001","evidence":"fixture"}' }, sb.root);
  assert(r.isError && /unknown ADR id \"ADR-0001\"/.test(textOf(r)), textOf(r));
  const rc = sandbox();
  await call({ op: "init" }, rc.root);
  await call({ op: "new", name: "rc-op" }, rc.root);
  r = await call({ op: "reconfirm", options: '{"check":true}' }, rc.root);
  assert(!r.isError, textOf(r));
  rc.dispose();
  const { statusRefusal } = await import(path.join(REPO, "lib", "adr-ops.mjs"));
  // synthetic vocabulary: the hint rule must not depend on the real ADR_STATUSES
  const near = statusRefusal("xeta", ["beta", "gamma"]);
  assert(/did you mean: --status beta/.test(near) && !/ambiguous/.test(near), near);
  const tie = statusRefusal("cd", ["ad", "bd"]);
  assert(/ambiguous: ad, bd/.test(tie) && !/did you mean/.test(tie), tie);
  assert(/^unknown status "cd" \(allowed: ad, bd\)/.test(tie), tie);
});

// --- T4: clear errors for ambiguous calls --------------------------------------

await check("T4a", "missing name, unknown options, bad JSON, duplicate names → clear errors", async () => {
  let r = await call({ op: "new" }, sb.root);
  assert(r.isError && /requires "name"/.test(textOf(r)), textOf(r));
  r = await call({ op: "validate", options: '{"mde":"strict"}' }, sb.root);
  assert(r.isError && /unknown option mde.*allowed: change, mode/.test(textOf(r)), textOf(r));
  r = await call({ op: "validate", options: "not json" }, sb.root);
  assert(r.isError && /not valid JSON/.test(textOf(r)), textOf(r));
  r = await call({ op: "validate", name: "a", options: '{"change":"b"}' }, sb.root);
  assert(r.isError && /both "name" and options "change"/.test(textOf(r)), textOf(r));
  r = await call({ op: "bogus" }, sb.root);
  assert(r.isError && /unknown op/.test(textOf(r)), textOf(r));
});

await check("T4b", "archive refuses while strict is red: staged verdict, nothing moves", async () => {
  await call({ op: "new", name: "half-done" }, sb.root);
  const r = await call({ op: "archive", name: "half-done" }, sb.root);
  assert(r.isError && /archive refused — strict validation failed/.test(textOf(r)), textOf(r));
  assert(r.details?.stage === "strict-validation", `staged refusal expected: ${JSON.stringify(r.details)}`);
  assert(r.details?.validation?.ok === false, "refusal must carry the strict verdict");
  assert(fs.existsSync(path.join(sb.root, "cdd", "changes", "half-done")), "a red change must not move");
});

await check("T4c", "op archive on a missing change refuses with the same shape and text", async () => {
  const r = await call({ op: "archive", name: "no-such-change" }, sb.root);
  assert(r.isError, "must be an error");
  assert(/archive refused — strict validation failed:/.test(textOf(r)), textOf(r));
  assert(/change "no-such-change" not found/.test(textOf(r)), textOf(r));
  assert(r.details?.stage === "strict-validation" && r.details?.validation?.ok === false, JSON.stringify(r.details));
});

sb.dispose();
ctrl.dispose();

// --- T5: staleness guard units ----------------------------------------------------

await check("T5a", "surface walk + diff: membership and digest decide, metadata never gates", () => {
  const d = sandbox();
  const ext = path.join(d.root, "ext");
  for (const [p, t] of [
    ["lib", null],
    ["scripts", null],
    ["vendor/x", null],
  ]) {
    fs.mkdirSync(path.join(ext, p), { recursive: true });
  }
  fs.writeFileSync(path.join(ext, "index.ts"), "// entry\n");
  fs.writeFileSync(path.join(ext, "lib", "a.mjs"), "export const a = 1;\n");
  fs.writeFileSync(path.join(ext, "scripts", "b.mjs"), "// b\n");
  fs.writeFileSync(path.join(ext, "scripts", "c.txt"), "not on surface\n");
  fs.writeFileSync(path.join(ext, "vendor", "x", "d.txt"), "vendor file\n");
  const snap = snapshotSources(ext);
  const names = [...snap.keys()].sort();
  assert(JSON.stringify(names) === JSON.stringify(["index.ts", "lib/a.mjs", "scripts/b.mjs", "vendor/x/d.txt"]), `surface wrong: ${names}`);
  assert(staleEntries(ext, snap).length === 0, "clean surface must be non-stale");
  const f = path.join(ext, "lib", "a.mjs");
  const stamp = new Date(); // align mtime to whole ms so the restore compares equal
  fs.utimesSync(f, stamp, stamp);
  const st = fs.statSync(f);
  fs.writeFileSync(f, "export const a = 2;\n");
  fs.utimesSync(f, st.atimeMs / 1000, st.mtimeMs / 1000);
  const after = fs.statSync(f);
  // stat and utimes disagree at sub-ms on this filesystem, so compare with 2ms
  // tolerance — invisible to any real metadata-based detector either way
  assert(after.size === st.size && Math.abs(after.mtimeMs - st.mtimeMs) < 2, "fixture: metadata preserved — only the digest can see this");
  let diff = staleEntries(ext, snap);
  assert(diff.length === 1 && diff[0].path === "lib/a.mjs" && diff[0].kind === "changed", `digest must catch: ${JSON.stringify(diff)}`);
  fs.writeFileSync(path.join(ext, "lib", "zz.mjs"), "// new\n");
  fs.rmSync(path.join(ext, "scripts", "b.mjs"));
  diff = staleEntries(ext, snap);
  assert(
    JSON.stringify(diff) === JSON.stringify([
      { path: "lib/a.mjs", kind: "changed" },
      { path: "lib/zz.mjs", kind: "added" },
      { path: "scripts/b.mjs", kind: "removed" },
    ]),
    `diff kinds wrong: ${JSON.stringify(diff)}`,
  );
  d.dispose();
});

await check("T5b", "grading table: known ops split, unknown and unknown backlog actions grade mutating", () => {
  for (const [op, want] of [
    ["init", "mutating"],
    ["new", "mutating"],
    ["archive", "mutating"],
    ["reconfirm", "mutating"],
    ["validate", "read"],
    ["status", "read"],
    ["adrs", "read"],
    ["help", "read"],
  ]) {
    assert(gradeOp(op) === want, `${op} must grade ${want}`);
  }
  assert(gradeOp("backlog", "list") === "read", "backlog list grades read");
  for (const a of ["add", "resolve", "revalidate", "purge", "unknown"]) {
    assert(gradeOp("backlog", a) === "mutating", `backlog ${a} must grade mutating`);
  }
  assert(gradeOp("backlog", undefined) === "read", "absent backlog action is the list default — read");
  assert(gradeOp("bogus") === "mutating" && gradeOp(undefined) === "mutating", "unknown ops grade mutating");
});

await check("T5c", "refusal names files and a bash-safe fresh-node command; a clean dispatch carries no guard data", async () => {
  const d = sandbox();
  const ext = path.join(d.root, "ext");
  fs.mkdirSync(path.join(ext, "lib"), { recursive: true });
  fs.writeFileSync(path.join(ext, "lib", "a.mjs"), "export const a = 1;\n");
  fs.writeFileSync(path.join(ext, "lib", "ignored.txt"), "asset\n");
  const snap = snapshotSources(ext);
  assert(snap.has("lib/ignored.txt"), `every file under lib/ is on the surface, not just .mjs: ${[...snap.keys()].join(", ")}`);
  fs.writeFileSync(path.join(ext, "lib", "a.mjs"), "export const a = 2;\n");
  const rf = refusalFor("archive", staleEntries(ext, snap), ext, d.root);
  assert(rf.text.includes("lib/a.mjs") && rf.text.includes("refusing archive"), `refusal must name file and op: ${rf.text}`);
  const cmd = rf.data.freshCommand;
  assert(cmd.startsWith("node -e '") && cmd.includes(`-- '${ext}' '${d.root}'`), `command must be a single-quoted node -e with explicit ext and root args: ${cmd}`);
  const payload = cmd.slice("node -e '".length, cmd.indexOf("' -- "));
  assert(!payload.includes("'"), `payload must stay single-quote-free so the wrapper quotes cannot break: ${payload}`);
  const initCmd = freshNodeCommand("init", ext, d.root);
  assert(initCmd.includes(`'${d.root}'`) && initCmd.includes(`'${ext}'`), `init command must pass root and ext dir explicitly: ${initCmd}`);
  // clean-process integration: the dispatcher this file loaded is the repo's own, clean mid-run
  const t5 = sandbox();
  await call({ op: "init" }, t5.root);
  const h = await call({ op: "help" }, t5.root);
  assert(!h.details?.staleWarning && !/staleness warning/.test(textOf(h)), `clean dispatch must carry no guard data: ${textOf(h)}`);
  t5.dispose();
  d.dispose();
});

// --- summary -------------------------------------------------------------------

console.log(`\n${pass} passed, ${fail} failed (tool tests)`);
if (fail > 0) {
  console.log(failures.join("\n"));
  process.exit(1);
}
