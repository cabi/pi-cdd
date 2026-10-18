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

const mod = await import(path.join(REPO, "index.ts"));
const api = fakeApi();
mod.default(api);

// --- T1: the declaration ------------------------------------------------------

await check("T1", "one lean `cdd` tool registered at load; list cannot change mid-session", () => {
  assert(api.tools.length === 1, `expected exactly 1 tool, got ${api.tools.length}: ${api.tools.map((t) => t.name)}`);
  const t = api.tools[0];
  assert(t.name === "cdd", `tool name: ${t.name}`);
  assert(typeof t.prepareArguments === "function", "prepareArguments missing");
  assert(t.parameters.properties.op.enum.length === 6, "op enum must list all six ops");
  assert(JSON.stringify(t.parameters.required) === '["op"]', "only op is required");
  assert(api.commands.length === 5, `expected 5 commands, got ${api.commands.length}`);
  assert(api.events["before_agent_start"], "ambient hook not registered");
  assert(api.setActiveToolsCalls === 0, "extension must never call setActiveTools");
  // lean budget: name + description + parameters ≤ 700 chars (~175 tok)
  const chars = t.name.length + t.description.length + JSON.stringify(t.parameters).length;
  assert(chars <= 700, `declaration is ${chars} chars (budget 700)`);
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

#### Scenario: x prints

When x, then y.
Verified by: tests/acceptance/x-prints.test.js
`);
w("cdd/changes/add-x/tasks.md", `# Tasks — add-x

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design gate

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

await check("T3e", "op status reports open changes as JSON", async () => {
  const r = await call({ op: "status" }, sb.root);
  assert(!r.isError && /add-x/.test(textOf(r)) && /openChanges/.test(textOf(r)), textOf(r));
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
  for (const op of ["init", "new", "validate", "status", "archive"]) {
    assert(doc[op] && doc[op].description && doc[op].parameters, `help details missing op ${op}`);
  }
  assert(/options JSON string/.test(t), "help must say how to pass the parameters");
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

await check("T4b", "archive refuses while strict is red", async () => {
  await call({ op: "new", name: "half-done" }, sb.root);
  const r = await call({ op: "archive", name: "half-done" }, sb.root);
  assert(r.isError && /archive refused — strict validation failed/.test(textOf(r)), textOf(r));
});

sb.dispose();
ctrl.dispose();

// --- summary -------------------------------------------------------------------

console.log(`\n${pass} passed, ${fail} failed (tool tests)`);
if (fail > 0) {
  console.log(failures.join("\n"));
  process.exit(1);
}
