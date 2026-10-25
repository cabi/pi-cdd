#!/usr/bin/env node
// Acceptance pin — 20261025-stale-lib-guard: a long-lived cdd tool
// process that outlived edits to the extension's own source must refuse
// mutation and warn on verdicts. The harness is hermetic: a scratch copy of
// the extension surface (index.ts + lib + scripts + vendor) lives in one
// scratch tree, the target store in another, and the tool is loaded from the
// scratch surface through the same jiti setup pi uses (tests/pi-jiti.mjs).
// Edits land on the scratch surface mid-process, exactly like a dev checkout.

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const { loadViaPi } = await import(path.join(REPO, "tests", "pi-jiti.mjs"));

// --- harness --------------------------------------------------------------------

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

function scratch() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "pf36-"));
  const ext = path.join(base, "ext");
  const proj = path.join(base, "proj");
  fs.mkdirSync(ext, { recursive: true });
  fs.copyFileSync(path.join(REPO, "index.ts"), path.join(ext, "index.ts"));
  for (const d of ["lib", "scripts", "vendor"]) {
    fs.cpSync(path.join(REPO, d), path.join(ext, d), { recursive: true });
  }
  fs.mkdirSync(proj, { recursive: true });
  return { base, ext, proj, dispose: () => fs.rmSync(base, { recursive: true, force: true }) };
}

async function loadTool(ext) {
  const mod = (await loadViaPi(path.join(ext, "index.ts"))) ?? (await import(pathToFileURL(path.join(ext, "index.ts")).href));
  const api = fakeApi();
  mod.default(api);
  return api;
}

// A hand-authored strictly-green change, the tests/tools.mjs T3 fixture shape.
function greenFixture(root, name) {
  const dir = path.join(root, "cdd", "changes", name);
  fs.rmSync(dir, { recursive: true, force: true }); // own the dir — no scaffold placeholders remain
  fs.mkdirSync(path.join(dir, "specs", "cap"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, "proposal.md"),
    `# ${name}

## Why

Need ${name}.

## What Changes

- ${name}

## Solutions Considered

- stdlib covers it

## Non-Goals

- none beyond scope

Done-When: ${name} works
Code: cli.js
`,
  );
  fs.writeFileSync(
    path.join(dir, "specs", "cap", "spec.md"),
    `## ADDED Requirements

### Requirement: ${name} prints

${name}.

\`\`\`gherkin
Feature: ${name} prints

Scenario: ${name} prints
Given ${name}
When ${name} runs
Then y is printed
  # Verified by: tests/acceptance/${name}-pin.test.js
\`\`\`
`,
  );
  fs.writeFileSync(
    path.join(dir, "tasks.md"),
    `# Tasks — ${name}

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

- [x] 2.1 Design gate: single scenario, one task — no split needed

## 3. Implementation

- [x] 3.1 write ${name} — verify by tests/acceptance/${name}-pin.test.js

## Done When Traceability

| d | 3.1 |

## 4. Close

- [ ] 4.1 cdd validate strict green, guard green
- [ ] 4.2 Archive — pair-commit: feature commit, then archive commit
`,
  );
  const pinDir = path.join(root, "tests", "acceptance");
  fs.mkdirSync(pinDir, { recursive: true });
  fs.writeFileSync(path.join(pinDir, `${name}-pin.test.js`), "// pin\n");
}

const OPS_MJS = path.join("lib", "ops.mjs");

// --- shared stale context -------------------------------------------------------

const A = scratch();
const apiA = await loadTool(A.ext);
const call = (args) => apiA.tools[0].execute(1, args, undefined, undefined, { cwd: A.proj });
const textOf = (r) => r.content[0].text;
const command = (name) => apiA.commands.find(([n]) => n === name)[1];

// clean-process store preparation: store, one green open change, one backlog item
assert(!(await call({ op: "init" })).isError, "fixture init failed");
assert(!(await call({ op: "new", name: "guard-fx" })).isError, "fixture new failed");
greenFixture(A.proj, "guard-fx");
assert(!(await call({ op: "validate", options: '{"change":"guard-fx","mode":"strict"}' })).isError, "fixture not strict-green");
assert(
  !(await call({ op: "backlog", options: JSON.stringify({ action: "add", summary: "fixture finding", source: "acceptance stale-lib-guard", premise: "exists:cdd/backlog.md" }) })).isError,
  "fixture backlog add failed",
);

// make the loaded process stale: one post-load edit on the surface
const opsOriginal = fs.readFileSync(path.join(A.ext, OPS_MJS));
fs.appendFileSync(path.join(A.ext, OPS_MJS), "\n// stale-probe edit — digest must change\n");

const refusals = {}; // op → fresh-node command, collected from real refusals for scenario 9

// remaining mutating refusals for scenario 9's command table
{
  const r1 = await call({ op: "init" });
  refusals.init = r1.details?.freshCommand;
  const r2 = await call({ op: "new", name: "x" });
  refusals.new = r2.details?.freshCommand;
  const r3 = await call({ op: "backlog", options: JSON.stringify({ action: "resolve", id: "PF-1", status: "done" }) });
  refusals["backlog resolve"] = r3.details?.freshCommand;
  const r4 = await call({ op: "backlog", options: '{"action":"revalidate"}' });
  refusals["backlog revalidate"] = r4.details?.freshCommand;
  const r5 = await call({ op: "reconfirm", options: '{"id":"ADR-0001","evidence":"fixture"}' });
  refusals.reconfirm = r5.details?.freshCommand;
}

// scenario 6 needs a process whose snapshot matches disk: a fresh scratch
// surface (a different path, so the module cache cannot serve the old load)
const B = scratch();
const apiB = await loadTool(B.ext);
const callB = (args) => apiB.tools[0].execute(1, args, undefined, undefined, { cwd: B.proj });
assert(!(await callB({ op: "init" })).isError, "fixture init B failed");
assert(!(await callB({ op: "new", name: "guard-fx" })).isError, "fixture new B failed");
greenFixture(B.proj, "guard-fx");

// --- scenarios 1–8 ----------------------------------------------------------------

describe("stale-lib-guard.test.js — the dispatch guard refuses mutation and warns verdicts on stale lib code", () => {

test("scenario 1: a stale process refuses a mutating op (archive)", async () => {
  const r = await call({ op: "archive", name: "guard-fx" });
  assert.equal(r.isError, true, "archive must be refused on a stale process");
  assert.equal((textOf(r).match(/refusing/g) ?? []).length, 1, `exactly 1 refusal line: ${textOf(r)}`);
  assert.ok(textOf(r).includes(OPS_MJS), `error must name the changed file: ${textOf(r)}`);
  assert.ok(r.details?.stale?.some((s) => s.path === OPS_MJS), `details.stale must carry the file: ${JSON.stringify(r.details)}`);
  assert.ok(typeof r.details?.freshCommand === "string" && r.details.freshCommand.startsWith("node -e "), "refusal must carry the fresh-node command");
  refusals.archive = r.details.freshCommand;
  assert(fs.existsSync(path.join(A.proj, "cdd", "changes", "guard-fx")), "the open change must not move");
  const arch = path.join(A.proj, "cdd", "archive");
  assert(!fs.existsSync(arch) || fs.readdirSync(arch).length === 0, "no archive folder may appear");
});

test("scenario 2: a stale process warns on a verdict op (validate)", async () => {
  const r = await call({ op: "validate", options: '{"change":"guard-fx"}' });
  assert.ok(!r.isError, `the verdict itself must still answer: ${textOf(r)}`);
  assert.match(textOf(r), /PASS/, "the change's verdict must be present");
  assert.equal((textOf(r).match(/staleness warning/g) ?? []).length, 1, `exactly 1 staleness warning: ${textOf(r)}`);
  assert.ok(textOf(r).includes(OPS_MJS), "the warning must name the changed file");
  assert.ok(Array.isArray(r.details?.stale) && r.details.stale.length === 1, "warning details must carry the stale entries");
});

test("scenario 3: an added file counts as changed", async () => {
  fs.copyFileSync(path.join(A.ext, OPS_MJS), path.join(A.ext, OPS_MJS) + ".bak");
  fs.writeFileSync(path.join(A.ext, OPS_MJS), opsOriginal); // clean again
  const added = path.join("lib", "zz-added-probe.mjs");
  fs.writeFileSync(path.join(A.ext, added), "// added after load\n");
  try {
    const r = await call({ op: "archive", name: "guard-fx" });
    assert.equal(r.isError, true, "archive must be refused when a file was added");
    assert.ok(textOf(r).includes(added), `error must name the added file: ${textOf(r)}`);
    assert.ok(r.details?.stale?.some((s) => s.path === added && s.kind === "added"), `details must mark it added: ${JSON.stringify(r.details)}`);
  } finally {
    fs.rmSync(path.join(A.ext, added));
    fs.renameSync(path.join(A.ext, OPS_MJS) + ".bak", path.join(A.ext, OPS_MJS));
    fs.appendFileSync(path.join(A.ext, OPS_MJS), "\n// stale-probe edit — digest must change\n");
  }
});

test("scenario 4: a removed file counts as changed", async () => {
  fs.copyFileSync(path.join(A.ext, OPS_MJS), path.join(A.ext, OPS_MJS) + ".bak");
  fs.writeFileSync(path.join(A.ext, OPS_MJS), opsOriginal); // clean again
  const removed = path.join("lib", "help.mjs");
  const helpOriginal = fs.readFileSync(path.join(A.ext, removed));
  fs.rmSync(path.join(A.ext, removed));
  try {
    const r = await call({ op: "archive", name: "guard-fx" });
    assert.equal(r.isError, true, "archive must be refused when a file was removed");
    assert.ok(textOf(r).includes(removed), `error must name the removed file: ${textOf(r)}`);
    assert.ok(r.details?.stale?.some((s) => s.path === removed && s.kind === "removed"), `details must mark it removed: ${JSON.stringify(r.details)}`);
  } finally {
    fs.writeFileSync(path.join(A.ext, removed), helpOriginal);
    fs.renameSync(path.join(A.ext, OPS_MJS) + ".bak", path.join(A.ext, OPS_MJS));
    fs.appendFileSync(path.join(A.ext, OPS_MJS), "\n// stale-probe edit — digest must change\n");
  }
});

test("scenario 5: backlog actions grade by their action", async () => {
  const list = await call({ op: "backlog" });
  assert.ok(!list.isError, `list must still answer: ${textOf(list)}`);
  assert.match(textOf(list), /PF-1/, "the backlog item must be listed");
  assert.equal((textOf(list).match(/staleness warning/g) ?? []).length, 1, "list carries exactly 1 staleness warning");
  const add = await call({ op: "backlog", options: JSON.stringify({ action: "add", summary: "another finding", source: "acceptance stale-lib-guard" }) });
  assert.equal(add.isError, true, "backlog add must be refused on a stale process");
  assert.ok(typeof add.details?.freshCommand === "string" && add.details.freshCommand.startsWith("node -e "), "add refusal must carry its own fresh-node command");
  refusals["backlog add"] = add.details.freshCommand;
});

test("scenario 7: every mutating door-1 command consults the same guard", async () => {
  const capture = [];
  const orig = console.log;
  console.log = (...a) => capture.push(a.map(String).join(" "));
  try {
    await command("cdd-init").handler("", { cwd: A.proj, hasUI: false });
    await command("cdd-new").handler("door-new", { cwd: A.proj, hasUI: false });
    await command("cdd-archive").handler("guard-fx", { cwd: A.proj, hasUI: false });
  } finally {
    console.log = orig;
  }
  assert.equal(capture.length, 3, `each command answers exactly once: ${JSON.stringify(capture)}`);
  for (const [i, out] of capture.entries()) {
    assert.equal((out.match(/refusing/g) ?? []).length, 1, `command ${i}: exactly 1 refusal line: ${out}`);
    assert.ok(out.includes(OPS_MJS), `command ${i} must name the changed file: ${out}`);
    assert.ok(/node -e /.test(out), `command ${i} must name a fresh-node command: ${out}`);
  }
  assert(!fs.existsSync(path.join(A.proj, "cdd", "changes", "door-new")), "cdd-new must not have scaffolded");
});

test("scenario 8: a same-length rewrite with the original modification time is detected", async () => {
  fs.copyFileSync(path.join(A.ext, OPS_MJS), path.join(A.ext, OPS_MJS) + ".bak");
  const file = path.join(A.ext, OPS_MJS);
  const stamp = new Date(); // align mtime to whole ms so the restore compares equal
  fs.utimesSync(file, stamp, stamp);
  const before = fs.statSync(file);
  const swapped = fs.readFileSync(file, "utf8").replace("export", "exporT"); // same byte length as the file just stat'ed, digest changes
  fs.writeFileSync(file, swapped);
  fs.utimesSync(file, before.atimeMs / 1000, before.mtimeMs / 1000); // seconds floats keep sub-ms precision
  const after = fs.statSync(file);
  assert.equal(after.size, before.size, "fixture: same length");
  assert.equal(after.size, before.size, "fixture: same size");
  // stat and utimes disagree at sub-ms on this filesystem; 2ms tolerance — invisible to metadata detectors
  assert(Math.abs(after.mtimeMs - before.mtimeMs) < 2, "fixture: same mtime — only the digest can catch this");
  try {
    const r = await call({ op: "archive", name: "guard-fx" });
    assert.equal(r.isError, true, "same-length/same-mtime rewrite must still be refused");
    assert.ok(textOf(r).includes(OPS_MJS), `error must name the rewritten file: ${textOf(r)}`);
  } finally {
    fs.renameSync(path.join(A.ext, OPS_MJS) + ".bak", path.join(A.ext, OPS_MJS));
    fs.appendFileSync(path.join(A.ext, OPS_MJS), "\n// stale-probe edit — digest must change\n");
  }
});

// --- scenarios 1–8 ----------------------------------------------------------------

test("scenario 6: a clean process is unaffected", async () => {
  for (const args of [{ op: "validate", options: '{"change":"guard-fx"}' }, { op: "status" }, { op: "help" }]) {
    const r = await callB(args);
    assert.ok(!r.isError, `${args.op} must answer normally: ${textOf(r)}`);
    assert.ok(!/staleness warning|refusing/i.test(textOf(r)), `${args.op} text must carry no staleness notice: ${textOf(r)}`);
    assert.ok(!r.details?.stale && !r.details?.staleWarning, `${args.op} details must carry no staleness data: ${JSON.stringify(r.details)}`);
  }
});

// --- scenario 9: every refusal command runs its op ---------------------------------

const substitute = (cmd, map) =>
  Object.entries(map).reduce((c, [k, v]) => c.split(k).join(v), cmd).replace(/<(name|pf-id|adr-id|summary|source|evidence)>/g, (m) => {
    throw new Error(`unsubstituted placeholder ${m} in command`);
  });

const runFresh = (cmd, store, map = {}) => JSON.parse(execFileSync("bash", ["-c", substitute(cmd.split(A.proj).join(store), map)], { cwd: store, encoding: "utf8" }));

test("scenario 9: every refusal command runs its op", () => {
  for (const key of ["init", "new", "archive", "backlog add", "backlog resolve", "backlog revalidate", "reconfirm"]) {
    assert.ok(typeof refusals[key] === "string" && refusals[key].startsWith("node -e "), `no fresh-node command captured for ${key}`);
  }

  const dirs = {};
  const proj = (k) => {
    dirs[k] = path.join(A.base, `proj-${k}`);
    fs.mkdirSync(dirs[k], { recursive: true });
    return dirs[k];
  };

  // init: the store is initialized
  const pInit = proj("init");
  const rInit = runFresh(refusals.init, pInit);
  assert.equal(rInit.ok, true, `init command failed: ${JSON.stringify(rInit)}`);
  assert.ok(fs.existsSync(path.join(pInit, "cdd", "rules.md")), "init command must scaffold the store");

  // new: the change is created
  const pNew = proj("new");
  runFresh(refusals.init, pNew);
  const rNew = runFresh(refusals.new, pNew, { "<name>": "cmd-fx" });
  assert.equal(rNew.ok, true, `new command failed: ${JSON.stringify(rNew)}`);
  assert.ok(fs.existsSync(path.join(pNew, "cdd", "changes", "cmd-fx", "proposal.md")), "new command must scaffold the change");

  // backlog: the item is added, resolved, and revalidated
  const pBl = proj("backlog");
  runFresh(refusals.init, pBl);
  const rAdd = runFresh(refusals["backlog add"], pBl, { "<summary>": "fresh-node legality probe", "<source>": "acceptance stale-lib-guard" });
  assert.equal(rAdd.ok, true, `backlog add command failed: ${JSON.stringify(rAdd)}`);
  assert.match(fs.readFileSync(path.join(pBl, "cdd", "backlog.md"), "utf8"), /PF-1/, "add command must write the PF line");
  const rResolve = runFresh(refusals["backlog resolve"], pBl, { "<pf-id>": "PF-1" });
  assert.equal(rResolve.ok, true, `backlog resolve command failed: ${JSON.stringify(rResolve)}`);
  assert.match(fs.readFileSync(path.join(pBl, "cdd", "backlog.md"), "utf8"), /PF-1 \[done\]/, "resolve command must mark it done");
  const rReval = runFresh(refusals["backlog revalidate"], pBl);
  assert.equal(rReval.ok, true, `backlog revalidate command failed: ${JSON.stringify(rReval)}`);

  // reconfirm: the reconfirmation is written into the ADR
  const pRc = proj("reconfirm");
  runFresh(refusals.init, pRc);
  runFresh(refusals.new, pRc, { "<name>": "cmd-fx" });
  fs.mkdirSync(path.join(pRc, "cdd", "decisions"), { recursive: true });
  fs.copyFileSync(path.join(REPO, "cdd", "decisions", "0001-zero-dependency-node-tooling.md"), path.join(pRc, "cdd", "decisions", "0001-zero-dependency-node-tooling.md"));
  const adrText = () => fs.readFileSync(path.join(pRc, "cdd", "decisions", "0001-zero-dependency-node-tooling.md"), "utf8");
  const rRc = runFresh(refusals.reconfirm, pRc, { "<adr-id>": "ADR-0001", "<name>": "cmd-fx", "<evidence>": "fresh-node legality probe still holds" });
  assert.equal(rRc.ok, true, `reconfirm command failed: ${JSON.stringify(rRc)}`);
  assert.match(adrText(), /Reconfirmed by cmd-fx on /, "reconfirm command must write the reconfirmation line");

  // archive: the change is archived
  const pAr = proj("archive");
  runFresh(refusals.init, pAr);
  runFresh(refusals.new, pAr, { "<name>": "cmd-fx" });
  greenFixture(pAr, "cmd-fx");
  const rAr = runFresh(refusals.archive, pAr, { "<name>": "cmd-fx" });
  assert.equal(rAr.ok, true, `archive command failed: ${JSON.stringify(rAr)}`);
  const archived = fs.readdirSync(path.join(pAr, "cdd", "archive"));
  assert.ok(archived.some((d) => /-cmd-fx$/.test(d)), `archive command must move the change: ${archived}`);
  assert.ok(fs.existsSync(path.join(pAr, "cdd", "archive", archived.find((d) => /-cmd-fx$/.test(d)), "metrics.md")), "archive command must write metrics.md");
});

// --- teardown ----------------------------------------------------------------------

test.after?.(() => {
  A.dispose();
  B.dispose();
});

}); // describe

process.on("exit", () => {
  try {
    A.dispose();
    B.dispose();
  } catch {}
});
