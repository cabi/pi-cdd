#!/usr/bin/env node
// pi-cdd smoke suite — red/green against the real libs and the real guard,
// in throwaway sandboxes. No model calls here; the isolated-pi loop test
// lives at the end behind RUN_PI_LOOP=1 (it spends tokens by design).

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lib = await import(path.join(REPO, "lib", "store.mjs"));
const val = await import(path.join(REPO, "lib", "validate.mjs"));
const ctx = await import(path.join(REPO, "lib", "context.mjs"));

let pass = 0;
let fail = 0;
const failures = [];
function check(id, name, fn) {
  try {
    fn();
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
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "pi-cdd-"));
  return { root: d, dispose: () => fs.rmSync(d, { recursive: true, force: true }) };
}
function git(root, ...args) {
  return execFileSync("git", ["-C", root, ...args], { encoding: "utf8" });
}

// --- shared sandboxes ---------------------------------------------------------

const sb = sandbox();
const { initStore, createChange, archiveChange, listChanges } = lib;
const { validateChange, validateStore, formatVerdict } = val;

const init = initStore(sb.root, REPO, { ci: "both", hooks: true });
check("S1", "init scaffolds the full store", () => {
  assert(init.ok, JSON.stringify(init));
  for (const f of [
    "cdd/rules.md",
    "cdd/changes/.gitkeep",
    "cdd/specs/.gitkeep",
    "cdd/decisions/.gitkeep",
    "cdd/scripts/spec-drift.mjs",
    "cdd/scripts/spec-extract.mjs",
    "cdd/scripts/arch-extract.mjs",
    ".githooks/pre-commit",
    ".github/workflows/cdd.yml",
    ".gitlab-ci.yml",
  ]) assert(fs.existsSync(path.join(sb.root, f)), `missing ${f}`);
  const mode = fs.statSync(path.join(sb.root, ".githooks", "pre-commit")).mode;
  assert(mode & 0o111, "pre-commit not executable");
});

check("S2", "init is idempotent-refusing", () => {
  const again = initStore(sb.root, REPO, {});
  assert(!again.ok && /already has a store/.test(again.error), JSON.stringify(again));
});

const created = createChange(sb.root, "add-greeting", ["greeting"]);
check("S3", "createChange scaffolds artifacts", () => {
  assert(created.ok, JSON.stringify(created));
  for (const f of ["cdd/changes/add-greeting/proposal.md", "cdd/changes/add-greeting/tasks.md", "cdd/changes/add-greeting/specs/greeting/spec.md"]) {
    assert(fs.existsSync(path.join(sb.root, f)), `missing ${f}`);
  }
});

check("S4", "fresh scaffold is draft-RED (placeholders count as unfilled)", () => {
  const v = validateChange(sb.root, "add-greeting", "draft");
  assert(!v.ok, "scaffold should be red until filled");
  assert(v.errors.some((e) => /placeholders still unfilled/.test(e)), formatVerdict(v));
});

// fill the change properly
const fill = (rel, text) => fs.writeFileSync(path.join(sb.root, rel), text);
fill("cdd/changes/add-greeting/proposal.md", `# add-greeting

## Why

The CLI says nothing today; users need a greeting on startup.

## What Changes

- The CLI prints a greeting on startup

Done-When: node cli.js prints a greeting line
Code: cli.js
`);
fill("cdd/changes/add-greeting/specs/greeting/spec.md", `## ADDED Requirements

### Requirement: Startup greeting

The CLI greets the user on startup.

#### Scenario: prints greeting

When the CLI starts, it prints a greeting line.
Verified by: tests/acceptance/greeting-prints.test.js
`);
fill("cdd/changes/add-greeting/tasks.md", `# Tasks — add-greeting

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

- [x] 2.1 Design gate: single scenario, one task — no split needed

## 3. Implementation

- [ ] 3.1 write cli.js greeting — verify by tests/acceptance/greeting-prints.test.js

## 4. Close

- [ ] 4.1 cdd_validate strict green, guard green
- [ ] 4.2 Archive — pair-commit: feature commit, then archive commit
`);

check("S5", "filled change: draft green, strict red (pin missing)", () => {
  const d = validateChange(sb.root, "add-greeting", "draft");
  assert(d.ok, formatVerdict(d));
  const s = validateChange(sb.root, "add-greeting", "strict");
  assert(!s.ok && s.errors.some((e) => /pins .* does not exist/.test(e)), formatVerdict(s));
});

fill("tests/acceptance/greeting-prints.test.js", `import test from "node:test";\nimport assert from "node:assert";\ntest("greeting", () => assert.ok(true));\n`);
check("S6", "pin file exists -> strict green", () => {
  const s = validateChange(sb.root, "add-greeting", "strict");
  assert(s.ok, formatVerdict(s));
});

// bad fixtures
const sb2 = sandbox();
initStore(sb2.root, REPO, { ci: "none", hooks: false });
createChange(sb2.root, "bad-pin", ["x"]);
fill2("proposal.md", `# bad-pin\n\n## Why\n\np\n\n## What Changes\n\n- b\n\nDone-When: d\nCode: x.js\n`);
fill2("specs/x/spec.md", `## ADDED Requirements\n\n### Requirement: R\n\nP.\n\n#### Scenario: S\n\nProse.\n`);
fill2("tasks.md", `# T\n\n## 1. Context\n\n- [ ] 1.1 c\n\n## 2. Design\n\n- [ ] 2.1 d\n\n## 3. Implementation\n\n- [ ] 3.1 t\n\n## 4. Close\n\n- [ ] 4.1 c\n`);
function fill2(rel, text) {
  fs.writeFileSync(path.join(sb2.root, "cdd", "changes", "bad-pin", rel), text);
}
check("S7", "scenario without Verified-by pin -> red with exact error", () => {
  const v = validateChange(sb2.root, "bad-pin", "draft");
  assert(!v.ok && v.errors.some((e) => /scenario "S" does not end with/.test(e)), formatVerdict(v));
});
check("S8", "implementation task without verify-by -> red", () => {
  const v = validateChange(sb2.root, "bad-pin", "draft");
  assert(v.errors.some((e) => /carries no "verify by/.test(e)), formatVerdict(v));
});

const sb3 = sandbox();
initStore(sb3.root, REPO, { ci: "none", hooks: false });
createChange(sb3.root, "many-tasks", ["x"]);
const tasks = [`# T`, ``, `## 1. Context`, ``, `- [ ] 1.1 c`, ``, `## 2. Design`, ``, `- [ ] 2.1 d`, ``, `## 3. Implementation`, ``];
for (let i = 1; i <= 9; i++) tasks.push(`- [ ] 3.${i} t${i} — verify by tests/acceptance/t${i}.js`);
tasks.push(``, `## 4. Close`, ``, `- [ ] 4.1 c`);
fs.writeFileSync(path.join(sb3.root, "cdd", "changes", "many-tasks", "tasks.md"), tasks.join("\n"));
fs.writeFileSync(path.join(sb3.root, "cdd", "changes", "many-tasks", "proposal.md"), `# many-tasks\n\n## Why\n\np\n\n## What Changes\n\n- b\n\nDone-When: d\nCode: x.js\n`);
check("S9", ">8 implementation subtasks -> split warning", () => {
  const v = validateChange(sb3.root, "many-tasks", "draft");
  assert(v.warnings.some((w) => /split signal/.test(w)), formatVerdict(v));
});
sb3.dispose();

// --- archive flow on sb -------------------------------------------------------

check("S10", "archive merges ADDED into living spec and moves folder", () => {
  const r = archiveChange(sb.root, "add-greeting");
  assert(r.ok, JSON.stringify(r));
  const living = fs.readFileSync(path.join(sb.root, "cdd", "specs", "greeting", "spec.md"), "utf8");
  assert(/### Requirement: Startup greeting/.test(living), "living spec missing requirement");
  assert(/Verified by: tests\/acceptance\/greeting-prints.test.js/.test(living), "living spec missing pin");
  assert(!fs.existsSync(path.join(sb.root, "cdd", "changes", "add-greeting")), "change folder still open");
  assert(fs.readdirSync(path.join(sb.root, "cdd", "archive"))[0].endsWith("-add-greeting"), "archive folder missing");
});

// second change: MODIFIED
createChange(sb.root, "louder-greeting", ["greeting"]);
fs.writeFileSync(path.join(sb.root, "cdd", "changes", "louder-greeting", "proposal.md"), `# louder-greeting\n\n## Why\n\np\n\n## What Changes\n\n- louder\n\nDone-When: d\nCode: cli.js\n`);
fs.writeFileSync(
  path.join(sb.root, "cdd", "changes", "louder-greeting", "specs", "greeting", "spec.md"),
  `## MODIFIED Requirements\n\n### Requirement: Startup greeting\n\nLouder.\n\n#### Scenario: shouts greeting\n\nShouts.\nVerified by: tests/acceptance/greeting-prints.test.js\n`,
);
fs.writeFileSync(
  path.join(sb.root, "cdd", "changes", "louder-greeting", "tasks.md"),
  `# T\n\n## 1. Context\n\n- [x] 1.1 c\n\n## 2. Design\n\n- [x] 2.1 d\n\n## 3. Implementation\n\n- [ ] 3.1 louder — verify by tests/acceptance/greeting-prints.test.js\n\n## 4. Close\n\n- [ ] 4.1 c\n`,
);
check("S11", "MODIFIED replaces the living requirement", () => {
  const v = validateChange(sb.root, "louder-greeting", "strict");
  assert(v.ok, formatVerdict(v));
  const r = archiveChange(sb.root, "louder-greeting");
  assert(r.ok, JSON.stringify(r));
  const living = fs.readFileSync(path.join(sb.root, "cdd", "specs", "greeting", "spec.md"), "utf8");
  assert(/Louder\./.test(living) && !/The CLI greets the user/.test(living), "MODIFIED did not replace");
  assert((living.match(/### Requirement: Startup greeting/g) ?? []).length === 1, "requirement duplicated");
});

// third change: REMOVED
createChange(sb.root, "drop-greeting", ["greeting"]);
fs.writeFileSync(path.join(sb.root, "cdd", "changes", "drop-greeting", "proposal.md"), `# drop-greeting\n\n## Why\n\np\n\n## What Changes\n\n- drop\n\nDone-When: d\nCode: cli.js\n`);
fs.writeFileSync(
  path.join(sb.root, "cdd", "changes", "drop-greeting", "specs", "greeting", "spec.md"),
  `## REMOVED Requirements\n\n### Requirement: Startup greeting\n\nRemoval marker.\n`,
);
fs.writeFileSync(
  path.join(sb.root, "cdd", "changes", "drop-greeting", "tasks.md"),
  `# T\n\n## 1. Context\n\n- [x] 1.1 c\n\n## 2. Design\n\n- [x] 2.1 d\n\n## 3. Implementation\n\n- [ ] 3.1 drop — verify by tests/acceptance/greeting-prints.test.js\n\n## 4. Close\n\n- [ ] 4.1 c\n`,
);
check("S12", "REMOVED deletes the living requirement", () => {
  const v = validateChange(sb.root, "drop-greeting", "strict");
  assert(v.ok, formatVerdict(v));
  const r = archiveChange(sb.root, "drop-greeting");
  assert(r.ok, JSON.stringify(r));
  const living = fs.readFileSync(path.join(sb.root, "cdd", "specs", "greeting", "spec.md"), "utf8");
  assert(!/### Requirement:/.test(living), "requirement not removed");
});

// --- guard (doors 2/3) against a real git repo --------------------------------

const g = sandbox();
initStore(g.root, REPO, { ci: "none", hooks: true });
git(g.root, "init", "-q");
git(g.root, "config", "user.email", "t@t");
git(g.root, "config", "user.name", "t");
createChange(g.root, "add-cap", ["cap"]);
const w = (rel, t) => { fs.mkdirSync(path.dirname(path.join(g.root, rel)), { recursive: true }); fs.writeFileSync(path.join(g.root, rel), t); };
w("cdd/changes/add-cap/proposal.md", `# add-cap\n\n## Why\n\np\n\n## What Changes\n\n- b\n\nDone-When: d\nCode: src/**\n`);
w(
  "cdd/changes/add-cap/specs/cap/spec.md",
  `## ADDED Requirements\n\n### Requirement: R1\n\nP.\n\nCode: src/**\n\n#### Scenario: S1\n\nProse.\nVerified by: tests/acceptance/cap-s1.test.js\n`,
);
w(
  "cdd/changes/add-cap/tasks.md",
  `# T\n\n## 1. Context\n\n- [x] 1.1 c\n\n## 2. Design\n\n- [x] 2.1 d\n\n## 3. Implementation\n\n- [ ] 3.1 impl — verify by tests/acceptance/cap-s1.test.js\n\n## 4. Close\n\n- [ ] 4.1 c\n`,
);
w("tests/acceptance/cap-s1.test.js", "// pin\n");
w("src/impl.js", "export const x = 1;\n");
git(g.root, "add", "-A");
git(g.root, "commit", "-qm", "feat: add-cap with spec and pin");

const guard = (args = []) => {
  try {
    return { code: 0, out: execFileSync("node", [path.join(g.root, "cdd", "scripts", "spec-drift.mjs"), ...args], { encoding: "utf8", cwd: g.root }) };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout ?? "") + (e.stderr ?? "") };
  }
};

check("S13", "guard green on a coherent repo (door 3)", () => {
  const r = guard();
  assert(r.code === 0, `guard said ${r.code}:\n${r.out}`);
});

check("S14", "guard L1 red: orphan acceptance test", () => {
  w("tests/acceptance/orphan.test.js", "// orphan\n");
  const r = guard();
  assert(r.code !== 0 && /\[L1\].*orphan/.test(r.out), `expected L1 orphan:\n${r.out}`);
  fs.rmSync(path.join(g.root, "tests", "acceptance", "orphan.test.js"));
});

check("S15", "guard L2 red: code out-commits its spec", () => {
  w("src/impl.js", "export const x = 2;\n");
  git(g.root, "add", "-A");
  git(g.root, "commit", "-qm", "feat: change impl without spec");
  const r = guard();
  assert(r.code !== 0 && /\[L2\]/.test(r.out), `expected L2:\n${r.out}`);
  // heal: spec and code travel together in one commit
  w("cdd/changes/add-cap/specs/cap/spec.md", `## ADDED Requirements

### Requirement: R1

P. v2.

Code: src/**

#### Scenario: S1

Prose.
Verified by: tests/acceptance/cap-s1.test.js
`);
  git(g.root, "add", "-A");
  git(g.root, "commit", "-qm", "feat: change impl with spec");
  const healed = guard();
  assert(healed.code === 0, `heal failed:\n${healed.out}`);
});

check("S16", "mechanical trailer passes L2, but M red when it touches specs", () => {
  w("src/impl.js", "export const x = 3; // format\n");
  git(g.root, "add", "-A");
  git(g.root, "commit", "-qm", "chore: reformat\n\nMechanical-Change: lint sweep");
  const okCode = guard();
  assert(okCode.code === 0, `mechanical over code should pass:\n${okCode.out}`);
  w("cdd/specs/cap/spec.md", "# touched\n");
  const before = fs.readFileSync(path.join(g.root, "cdd", "changes", "add-cap", "specs", "cap", "spec.md"), "utf8");
  git(g.root, "add", "-A");
  git(g.root, "commit", "-qm", "chore: touch spec\n\nMechanical-Change: sneaky");
  const bad = guard();
  assert(bad.code !== 0 && /\[M\]/.test(bad.out), `expected M:\n${bad.out}`);
  // restore: drop the sneaky spec file, keep the change delta as it was
  git(g.root, "rm", "-qf", "cdd/specs/cap/spec.md");
  w("cdd/changes/add-cap/specs/cap/spec.md", before);
  git(g.root, "add", "-A");
  git(g.root, "commit", "-qm", "revert: drop sneaky spec");
});

// --- ambient context -----------------------------------------------------------

check("S17", "ambient block lists open changes and points at rules", () => {
  const block = ctx.buildAmbientBlock(g.root);
  assert(block && /cdd\/rules\.md/.test(block), "no rules pointer");
  assert(/add-cap/.test(block), "open change not listed");
  const none = ctx.buildAmbientBlock(sandbox().root);
  assert(none === null, "block without store must be null");
});

check("S18", "validateStore aggregates per-change verdicts", () => {
  const v = validateStore(g.root, "draft");
  assert(v.ok && v.changes.includes("add-cap"), JSON.stringify(v.errors));
});

// --- the isolated-pi loop (spends tokens; opt-in) ------------------------------

if (process.env.RUN_PI_LOOP === "1") {
  check("S19", "isolated pi via CLI: tools registered and callable headless", () => {
    const out = execFileSync(
      "pi",
      ["--print", "--extension", REPO, "-p", "Call the cdd_status tool and reply with exactly the JSON it returned."],
      { encoding: "utf8", cwd: g.root, timeout: 300_000 },
    );
    assert(/openChanges/.test(out) && /add-cap/.test(out), `unexpected output:\n${out.slice(0, 800)}`);
  });
}

// --- report ---------------------------------------------------------------------

sb.dispose();
sb2.dispose();
g.dispose();
console.log("=".repeat(74));
if (fail) {
  console.log(`${fail} FAILED, ${pass} passed`);
  process.exit(1);
} else {
  console.log(`${pass}/${pass} passed${process.env.RUN_PI_LOOP === "1" ? "" : " (RUN_PI_LOOP=1 adds the isolated-pi check)"}`);
}
