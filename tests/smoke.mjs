#!/usr/bin/env node
// pi-cdd smoke suite — red/green against the real libs and the real guard,
// in throwaway sandboxes. No model calls here; the isolated-pi loop test
// lives at the end behind RUN_PI_LOOP=1 (it spends tokens by design).

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lib = await import(path.join(REPO, "lib", "store.mjs"));
const val = await import(path.join(REPO, "lib", "validate.mjs"));
const ctx = await import(path.join(REPO, "lib", "context.mjs"));
const { status, statusTable } = await import(path.join(REPO, "lib", "status.mjs"));
const { helpText, renderHelp } = await import(path.join(REPO, "lib", "help.mjs"));
// status-ui.ts imports @earendil-works/pi-tui, so it must load the way pi loads
// extensions (jiti + install aliases). Discover the managed install; skip when absent.
const { loadViaPi } = await import(path.join(REPO, "tests", "pi-jiti.mjs"));
const statusUiMod = await loadViaPi(path.join(REPO, "lib", "status-ui.ts"));
const CddStatusView = statusUiMod?.CddStatusView ?? null;

const { tasksTemplate } = await import(path.join(REPO, "lib", "templates.mjs"));
const law = await import(path.join(REPO, "scripts", "grammar-law.mjs"));
const loopLaw = await import(path.join(REPO, "lib", "loop-law.mjs"));
const { STATUSES: BACKLOG_STATUSES } = await import(path.join(REPO, "lib", "backlog.mjs"));
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

check("S2", "init on an existing store refreshes door scripts, never hooks or rules", () => {
  const rules = fs.readFileSync(path.join(sb.root, "cdd", "rules.md"), "utf8");
  const driftPath = path.join(sb.root, "cdd", "scripts", "spec-drift.mjs");
  fs.writeFileSync(driftPath, "// stale local edit\n");
  const hookPath = path.join(sb.root, ".githooks", "pre-commit");
  const hookOrig = fs.readFileSync(hookPath, "utf8");
  fs.writeFileSync(hookPath, "#!/bin/sh\n# local hook edit\n", { mode: 0o755 });
  const again = initStore(sb.root, REPO, {});
  assert(again.ok, JSON.stringify(again));
  assert(Array.isArray(again.refreshed) && again.refreshed.includes("cdd/scripts/spec-drift.mjs"), `refreshed list must name the door scripts: ${JSON.stringify(again)}`);
  assert(fs.readFileSync(driftPath, "utf8") === fs.readFileSync(path.join(REPO, "scripts", "spec-drift.mjs"), "utf8"), "door scripts must re-copy from the extension");
  assert(fs.readFileSync(hookPath, "utf8").includes("local hook edit"), "existing hooks must never be overwritten");
  assert(again.written.length === 0, `both hooks exist, nothing to install: ${JSON.stringify(again.written)}`);
  assert(fs.readFileSync(path.join(sb.root, "cdd", "rules.md"), "utf8") === rules, "rules.md must survive a refresh");
  fs.writeFileSync(hookPath, hookOrig, { mode: 0o755 });
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
// minimal-valid proposal shared by validator fixtures (dedup only — the scaffold contract is S32's job)
const fixtureProposal = (name, what = "b", code = "x.js") => `# ${name}

## Why

p

## What Changes

- ${what}

## Solutions Considered

- stdlib covers it

## Non-Goals

- none beyond scope

Done-When: d
Code: ${code}
`;
fill("cdd/changes/add-greeting/proposal.md", `# add-greeting

## Why

The CLI says nothing today; users need a greeting on startup.

## What Changes

- The CLI prints a greeting on startup

## Solutions Considered

- stdlib covers it

## Non-Goals

- none beyond scope

Done-When: node cli.js prints a greeting line
Code: cli.js
`);
fill("cdd/changes/add-greeting/specs/greeting/spec.md", `## ADDED Requirements

### Requirement: Startup greeting

The CLI greets the user on startup.

\`\`\`gherkin
Feature: Startup greeting

Scenario: prints greeting
Given the CLI is started
When the CLI starts
Then it prints a greeting line
  # Verified by: tests/acceptance/greeting-prints.test.js
\`\`\`

`);
fill("cdd/changes/add-greeting/tasks.md", `# Tasks — add-greeting

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

- [x] 2.1 Design gate: single scenario, one task — no split needed

## 3. Implementation

- [x] 3.1 write cli.js greeting — verify by tests/acceptance/greeting-prints.test.js

## Done When Traceability

| d | 3.1 |

## 4. Close

- [ ] 4.1 cdd validate strict green, guard green
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
fill2("proposal.md", fixtureProposal("bad-pin"));
fill2("specs/x/spec.md", `## ADDED Requirements\n\n### Requirement: R\n\n\`\`\`gherkin\nFeature: R\n\nScenario: S\nGiven a fixture\nWhen it runs\nThen it works\n\`\`\`\n`);
fill2("tasks.md", `# T\n\n## 1. Context\n\n- [ ] 1.1 c\n\n## 2. Design\n\n- [ ] 2.1 d\n\n## 3. Implementation\n\n- [ ] 3.1 t\n\n## Done When Traceability\n\n| d | 3.1 |\n\n## 4. Close\n\n- [ ] 4.1 c\n`);
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
fs.writeFileSync(path.join(sb3.root, "cdd", "changes", "many-tasks", "proposal.md"), fixtureProposal("many-tasks"));
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
fs.writeFileSync(path.join(sb.root, "cdd", "changes", "louder-greeting", "proposal.md"), fixtureProposal("louder-greeting", "louder", "cli.js"));
fs.writeFileSync(
  path.join(sb.root, "cdd", "changes", "louder-greeting", "specs", "greeting", "spec.md"),
  `## MODIFIED Requirements\n\n### Requirement: Startup greeting\n\nLouder.\n\`\`\`gherkin\nFeature: Startup greeting\n\nScenario: shouts greeting\nGiven the CLI is started\nWhen the CLI starts\nThen it shouts the greeting\n  # Verified by: tests/acceptance/greeting-prints.test.js\n\`\`\`\n`,
);
fs.writeFileSync(
  path.join(sb.root, "cdd", "changes", "louder-greeting", "tasks.md"),
  `# T\n\n## 1. Context\n\n- [x] 1.1 c\n\n## 2. Design\n\n- [x] 2.1 d\n\n## 3. Implementation\n\n- [x] 3.1 louder — verify by tests/acceptance/greeting-prints.test.js\n\n## Done When Traceability\n\n| d | 3.1 |\n\n## 4. Close\n\n- [ ] 4.1 c\n`,
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
fs.writeFileSync(path.join(sb.root, "cdd", "changes", "drop-greeting", "proposal.md"), fixtureProposal("drop-greeting", "drop", "cli.js"));
fs.writeFileSync(
  path.join(sb.root, "cdd", "changes", "drop-greeting", "specs", "greeting", "spec.md"),
  `## REMOVED Requirements\n\n### Requirement: Startup greeting\n\nRemoval marker.\nReason: the greeting was removed from the product.\n`,
);
fs.writeFileSync(
  path.join(sb.root, "cdd", "changes", "drop-greeting", "tasks.md"),
  `# T\n\n## 1. Context\n\n- [x] 1.1 c\n\n## 2. Design\n\n- [x] 2.1 d\n\n## 3. Implementation\n\n- [x] 3.1 drop — verify by tests/acceptance/greeting-prints.test.js\n\n## Done When Traceability\n\n| d | 3.1 |\n\n## 4. Close\n\n- [ ] 4.1 c\n`,
);
check("S12", "REMOVED deletes the living requirement", () => {
  const v = validateChange(sb.root, "drop-greeting", "strict");
  assert(v.ok, formatVerdict(v));
  const r = archiveChange(sb.root, "drop-greeting");
  assert(r.ok, JSON.stringify(r));
  const living = fs.readFileSync(path.join(sb.root, "cdd", "specs", "greeting", "spec.md"), "utf8");
  assert(!/### Requirement:/.test(living), "requirement not removed");
});


const sb4 = sandbox();
initStore(sb4.root, REPO, { ci: "none", hooks: false });
createChange(sb4.root, "close-tick", ["x"]);
const f4 = (rel, t) => fs.writeFileSync(path.join(sb4.root, "cdd", "changes", "close-tick", rel), t);
f4("proposal.md", fixtureProposal("close-tick"));
f4("specs/x/spec.md", `## ADDED Requirements\n\n### Requirement: R\n\nP.\n\`\`\`gherkin\nFeature: R\n\nScenario: S\nGiven a fixture\nWhen it runs\nThen it works\n  # Verified by: tests/acceptance/close-tick.test.js\n\`\`\`\n`);
fs.writeFileSync(path.join(sb4.root, "tests", "acceptance", "close-tick.test.js"), "// pin\n");
check("S20", "strict blocks unchecked work; archive auto-ticks the Close section", () => {
  f4("tasks.md", `# T\n\n## 1. Context\n\n- [x] 1.1 c\n\n## 2. Design\n\n- [x] 2.1 d\n\n## 3. Implementation\n\n- [ ] 3.1 impl — verify by tests/acceptance/close-tick.test.js\n\n## Done When Traceability\n\n| d | 3.1 |\n\n## 4. Close\n\n- [ ] 4.1 c\n`);
  const red = validateChange(sb4.root, "close-tick", "strict");
  assert(!red.ok && red.errors.some((e) => /unchecked task/.test(e)), formatVerdict(red));
  f4("tasks.md", `# T\n\n## 1. Context\n\n- [x] 1.1 c\n\n## 2. Design\n\n- [x] 2.1 d\n\n## 3. Implementation\n\n- [x] 3.1 impl — verify by tests/acceptance/close-tick.test.js\n\n## Done When Traceability\n\n| d | 3.1 |\n\n## 4. Close\n\n- [ ] 4.1 c\n`);
  const green = validateChange(sb4.root, "close-tick", "strict");
  assert(green.ok, formatVerdict(green));
  const r = archiveChange(sb4.root, "close-tick");
  assert(r.ok && r.autoTicked >= 1, JSON.stringify(r));
  const archived = fs.readFileSync(path.join(sb4.root, r.archivedTo, "tasks.md"), "utf8");
  assert(!/- \[ \]/.test(archived), "archived tasks.md still has unchecked boxes");
  // S20b: status table shows open + archived with verdicts (the /cdd-status view)
  createChange(sb4.root, "fresh-change", ["x"]);
  const st = status(sb4.root);
  assert(st.archived.some((a) => a.name === "close-tick"), JSON.stringify(st.archived));
  assert(st.openChanges.some((c) => c.name === "fresh-change" && c.next.startsWith("author:")), JSON.stringify(st.openChanges));
  const tbl = statusTable(st);
  assert(/Change\s+│/.test(tbl) && /archived \d{8}/.test(tbl) && /frozen history/.test(tbl) && /fresh-change/.test(tbl), tbl);
  // S20c: rows carry the TUI fields — state machine, recency, archived caps
  const fresh = st.openChanges.find((c) => c.name === "fresh-change");
  assert(fresh && fresh.state === "authoring" && typeof fresh.updated === "number" && fresh.updated > 0, JSON.stringify(fresh));
  assert(st.archived.every((a) => typeof a.caps === "number" && a.caps >= 1), JSON.stringify(st.archived));
});
sb4.dispose();

// --- S21: /cdd-help content (README documents the same workflow) ----------------
check("S21", "/cdd-help renders the driving workflow (prompts, gates, commands)", () => {
  // helpText/renderHelp imported at module top (S21 uses them directly)
  const txt = helpText();
  for (const needle of ['"New change: <what and why>"', '"implement <change>"', "Done-When", "draft green", "/cdd-status", "agent tool: cdd — ops: init · new · validate · status · archive · backlog · help", "Mechanical-Change", "no spec markers", "arch-extract", "spec-extract", "four-criterion test"]) {
    assert(txt.includes(needle), `help text missing: ${needle}\n${txt}`);
  }
  assert(!txt.includes("\x1b["), "helpText must stay plain (no ANSI)");
  // themed rendering: passthrough theme must reproduce the same visible content
  const fake = { style: (t) => t, fg: (_c, t) => t, bg: (_c, t) => t };
  const themed = renderHelp(fake);
  for (const needle of ['"New change: <what and why>"', "Done-When", "/cdd-help"]) assert(themed.includes(needle), `themed missing: ${needle}`);
});
// --- S22–S25: the restored schema instructions are enforced ----------------------
check("S22", "proposal requires Solutions Considered + Non-Goals; Done-When capped at 5", () => {
  const sb = sandbox().root;
  initStore(sb, REPO, { ci: "none", hooks: false });
  createChange(sb, "c3", ["cap"]);
  const w = (p, t) => fs.writeFileSync(path.join(sb, "cdd", "changes", "c3", p), t);
  const good = "# c3\n\n## Why\n\np\n\n## What Changes\n\n- b\n\n## Solutions Considered\n\n- stdlib\n\n## Non-Goals\n\n- none\n\nDone-When: d\nCode: x.js\n";
  w("proposal.md", good);
  w("tasks.md", "# T\n\n## 1. Context\n\n- [ ] 1.1 c\n\n## 2. Design\n\n- [ ] 2.1 d\n\n## 3. Implementation\n\n- [ ] 3.1 t — verify by tests/acceptance/cap.test.js\n\n## Done When Traceability\n\n| d | 3.1 |\n\n## 4. Close\n\n- [ ] 4.1 c\n");
  w("specs/cap/spec.md", "## ADDED Requirements\n\n### Requirement: r\n\np\n\`\`\`gherkin\nFeature: r\n\nScenario: s\nGiven a fixture\nWhen it runs\nThen it works\n  # Verified by: tests/acceptance/cap.test.js\n\`\`\`\n");
  let v = validateChange(sb, "c3", "draft");
  assert(!v.errors.some((e) => /proposal/.test(e)), formatVerdict(v));
  w("proposal.md", "# c3\n\n## Why\n\np\n\n## What Changes\n\n- b\n\nDone-When: d\nCode: x.js\n");
  v = validateChange(sb, "c3", "draft");
  assert(v.errors.some((e) => /Solutions Considered/.test(e)), formatVerdict(v));
  assert(v.errors.some((e) => /Non-Goals/.test(e)), formatVerdict(v));
  w("proposal.md", good.replace("Done-When: d", Array.from({ length: 6 }, () => "Done-When: d").join("\n")));
  v = validateChange(sb, "c3", "draft");
  assert(v.errors.some((e) => /max 5/.test(e)), formatVerdict(v));
});

check("S23", "REMOVED requires Reason; vague comparatives warn (C2)", () => {
  const sb = sandbox().root;
  initStore(sb, REPO, { ci: "none", hooks: false });
  createChange(sb, "c4", ["cap"]);
  const w = (p, t) => fs.writeFileSync(path.join(sb, "cdd", "changes", "c4", p), t);
  w("proposal.md", "# c4\n\n## Why\n\np\n\n## What Changes\n\n- b\n\n## Solutions Considered\n\n- s\n\n## Non-Goals\n\n- n\n\nDone-When: d\nCode: x.js\n");
  w("tasks.md", "# T\n\n## 1. Context\n\n- [ ] 1.1 c\n\n## 2. Design\n\n- [ ] 2.1 d\n\n## 3. Implementation\n\n- [ ] 3.1 t — verify by tests/acceptance/cap.test.js\n\n## Done When Traceability\n\n| d | 3.1 |\n\n## 4. Close\n\n- [ ] 4.1 c\n");
  w("specs/cap/spec.md", "## REMOVED Requirements\n\n### Requirement: ghost\n\nbye\n");
  let v = validateChange(sb, "c4", "draft");
  assert(v.errors.some((e) => /REMOVED "ghost" carries no "Reason:"/.test(e)), formatVerdict(v));
  w("specs/cap/spec.md", "## ADDED Requirements\n\n### Requirement: r\n\np\n\`\`\`gherkin\nFeature: r\n\nScenario: fast-response\nGiven the service is up\nWhen it is polled\nThen it responds fast\n  # Verified by: tests/acceptance/cap.test.js\n\`\`\`\n");
  v = validateChange(sb, "c4", "draft");
  assert(v.warnings.some((x) => /quantify it \(C2 rule\)/.test(x)), formatVerdict(v));
});

check("S24", "tasks require the Done When Traceability section", () => {
  const sb = sandbox().root;
  initStore(sb, REPO, { ci: "none", hooks: false });
  createChange(sb, "c5", ["cap"]);
  const w = (p, t) => fs.writeFileSync(path.join(sb, "cdd", "changes", "c5", p), t);
  w("proposal.md", "# c5\n\n## Why\n\np\n\n## What Changes\n\n- b\n\n## Solutions Considered\n\n- s\n\n## Non-Goals\n\n- n\n\nDone-When: d\nCode: x.js\n");
  w("tasks.md", "# T\n\n## 1. Context\n\n- [ ] 1.1 c\n\n## 2. Design\n\n- [ ] 2.1 d\n\n## 3. Implementation\n\n- [ ] 3.1 t — verify by tests/acceptance/cap.test.js\n\n## 4. Close\n\n- [ ] 4.1 c\n");
  w("specs/cap/spec.md", "## ADDED Requirements\n\n### Requirement: r\n\np\n\`\`\`gherkin\nFeature: r\n\nScenario: s\nGiven a fixture\nWhen it runs\nThen it works\n  # Verified by: tests/acceptance/cap.test.js\n\`\`\`\n");
  const v = validateChange(sb, "c5", "draft");
  assert(v.errors.some((e) => /Done When Traceability/.test(e)), formatVerdict(v));
});

check("S25", ">12 implementation subtasks fails strict unless split-considered", () => {
  const sb = sandbox().root;
  initStore(sb, REPO, { ci: "none", hooks: false });
  createChange(sb, "c6", ["cap"]);
  const w = (p, t) => fs.writeFileSync(path.join(sb, "cdd", "changes", "c6", p), t);
  w("proposal.md", "# c6\n\n## Why\n\np\n\n## What Changes\n\n- b\n\n## Solutions Considered\n\n- s\n\n## Non-Goals\n\n- n\n\nDone-When: d\nCode: x.js\n");
  const tasks = ["# T", "", "## 1. Context", "", "- [x] 1.1 c", "", "## 2. Design", "", "- [x] 2.1 d", "", "## 3. Implementation", ""];
  for (let i = 1; i <= 13; i++) tasks.push(`- [x] 3.${i} t — verify by tests/acceptance/cap.test.js`, "");
  tasks.push("## Done When Traceability", "", "| d | 3.1 |", "", "## 4. Close", "", "- [ ] 4.1 c", "");
  w("tasks.md", tasks.join("\n"));
  w("specs/cap/spec.md", "## ADDED Requirements\n\n### Requirement: r\n\np\n\`\`\`gherkin\nFeature: r\n\nScenario: s\nGiven a fixture\nWhen it runs\nThen it works\n  # Verified by: tests/acceptance/cap.test.js\n\`\`\`\n");
  fs.mkdirSync(path.join(sb, "tests", "acceptance"), { recursive: true });
  fs.writeFileSync(path.join(sb, "tests", "acceptance", "cap.test.js"), "test();\n");
  let v = validateChange(sb, "c6", "strict");
  assert(v.errors.some((e) => /> 12/.test(e)), formatVerdict(v));
  w("tasks.md", tasks.join("\n").replace("## Done When Traceability", "split-considered: kept whole — atomic migration\n\n## Done When Traceability"));
  v = validateChange(sb, "c6", "strict");
  assert(!v.errors.some((e) => /> 12/.test(e)), formatVerdict(v));
});

check("S30", "grammar-law.mjs owns the tasks grammar: template parses, duplicates fail, primitives shared", () => {
  // template ↔ parser pin: the scaffolded tasks.md parses as the canonical shape
  const t = lib.parseTasks(tasksTemplate("x"));
  assert(JSON.stringify(t.sections.map((s) => s.num)) === "[1,2,3,4]", `skeleton wrong: ${JSON.stringify(t.sections.map((s) => s.num))}`);
  assert(t.close && t.close.items.length === 5 && t.close.items.every((i) => i.box === " "), "Close section must hold the five unticked closing boxes (standards code review, spec code review, ADR review, validate, archive)");
  assert(t.implementation && t.implementation.items.length === 2, "scaffolded implementation: task 3.1 Change review plus one placeholder task");
  // regression: the old template's duplicated Close header now fails validation
  const dup = tasksTemplate("x").replace("## Done When Traceability\n\n| criterion |", "## 4. Close\n\n## Done When Traceability\n\n| criterion |");
  assert(lib.parseTasks(dup).sections.filter((s) => s.num === 4).length === 2, "fixture must carry the duplicate Close");
  const sbd = sandbox().root;
  initStore(sbd, REPO, { ci: "none", hooks: false });
  createChange(sbd, "dup-close", ["cap"]);
  fs.writeFileSync(path.join(sbd, "cdd", "changes", "dup-close", "tasks.md"), dup);
  const v = validateChange(sbd, "dup-close", "draft");
  assert(v.errors.some((e) => /four-step skeleton/.test(e)), formatVerdict(v));
  // primitives: ids parsed, X counts as done, limits live in the law
  const p = lib.parseTasks(`# T\n\n## 1. Context\n\n- [X] 1.1 c\n\n## 3. Implementation\n\n- [ ] 3.1 t — verify by x.js\n\n## Done When Traceability\n\n| d | 3.1 |\n\n## 4. Close\n\n- [ ] 4.1 c\n`);
  assert(p.implementation.items[0].text.startsWith("3.1 ") && p.itemsBeforeClose.length === 2 && p.itemsBeforeClose[0].box === "X", JSON.stringify(p));
  assert(law.TASK_LIMIT === 12 && law.SPLIT_SIGNAL === 8, "limits must live in grammar-law.mjs");
});

check("S26", "unqualified scenario counts warn; qualified ones stay silent (strictness dial)", () => {
  const sb = sandbox().root;
  initStore(sb, REPO, { ci: "none", hooks: false });
  createChange(sb, "c7", ["cap"]);
  const w = (p, t) => fs.writeFileSync(path.join(sb, "cdd", "changes", "c7", p), t);
  w("proposal.md", "# c7\n\n## Why\n\np\n\n## What Changes\n\n- b\n\n## Solutions Considered\n\n- s\n\n## Non-Goals\n\n- n\n\nDone-When: d\nCode: x.js\n");
  w("tasks.md", "# T\n\n## 1. Context\n\n- [x] 1.1 c\n\n## Done When Traceability\n\n| d | 1.1 |\n");
  w("specs/cap/spec.md", `## ADDED Requirements

### Requirement: r

p

\`\`\`gherkin
Feature: r

Scenario: bare
Given a filled catalog
When the catalog is listed
Then the output contains 9 products
  # Verified by: tests/acceptance/cap.test.js

Scenario: floor
Given a filled catalog
When the catalog is listed
Then the output contains at least 9 products
  # Verified by: tests/acceptance/cap.test.js

Scenario: exact
Given a filled catalog
When the catalog is listed
Then the output contains exactly 9 products
  # Verified by: tests/acceptance/cap.test.js
\`\`\`





`);
  const v = validateChange(sb, "c7", "draft");
  const bare = v.warnings.some((x) => /exactness qualifier/.test(x) && /bare/.test(x));
  const others = v.warnings.some((x) => /exactness qualifier/.test(x) && !/bare/.test(x));
  assert(bare && !others, JSON.stringify(v.warnings));
});

// --- guard (doors 2/3) against a real git repo --------------------------------

const g = sandbox();
initStore(g.root, REPO, { ci: "none", hooks: true });
fs.writeFileSync(path.join(g.root, ".gitignore"), "node_modules\n");
// door 3 re-parses fences with @cucumber/gherkin — model the installed dependency
fs.symlinkSync(path.join(REPO, "node_modules"), path.join(g.root, "node_modules"), "dir");
git(g.root, "init", "-q");
git(g.root, "config", "user.email", "t@t");
git(g.root, "config", "user.name", "t");
createChange(g.root, "add-cap", ["cap"]);
const w = (rel, t) => { fs.mkdirSync(path.dirname(path.join(g.root, rel)), { recursive: true }); fs.writeFileSync(path.join(g.root, rel), t); };
w("cdd/changes/add-cap/proposal.md", fixtureProposal("add-cap", "b", "src/**"));
w(
  "cdd/changes/add-cap/specs/cap/spec.md",
  `## ADDED Requirements\n\n### Requirement: R1\n\nP.\n\nCode: src/**\n\`\`\`gherkin\nFeature: R1\n\nScenario: S1\nGiven a fixture\nWhen it runs\nThen it works\n  # Verified by: tests/acceptance/cap-s1.test.js\n\`\`\`\n`,
);
w(
  "cdd/changes/add-cap/tasks.md",
  `# T\n\n## 1. Context\n\n- [x] 1.1 c\n\n## 2. Design\n\n- [x] 2.1 d\n\n## 3. Implementation\n\n- [ ] 3.1 impl — verify by tests/acceptance/cap-s1.test.js\n\n## Done When Traceability\n\n| d | 3.1 |\n\n## 4. Close\n\n- [ ] 4.1 c\n`,
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

\`\`\`gherkin
Feature: R1

Scenario: S1
Given a fixture
When it runs
Then it works
  # Verified by: tests/acceptance/cap-s1.test.js
\`\`\`

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

check("S31", "validateBoth: one evaluation, draft ⊆ strict by construction", () => {
  // fixture state: task 3.1 unticked → strict-only defect, draft otherwise green
  const { draft, strict } = val.validateBoth(g.root, "add-cap");
  assert(draft.ok && !strict.ok, JSON.stringify({ draft: draft.errors, strict: strict.errors }));
  assert(strict.errors.some((e) => /unchecked task/.test(e)), "strict verdict must name the unchecked task");
  assert(!draft.errors.some((e) => /unchecked task/.test(e)), "draft dial stays silent about strict-only gates");
  for (const d of draft.errors) assert(strict.errors.includes(d), `draft error missing from strict: ${d}`);
  // flip the defect: tick the task, break the pin — the dials split the other way
  const tasksPath = path.join(g.root, "cdd", "changes", "add-cap", "tasks.md");
  const deltaPath = path.join(g.root, "cdd", "changes", "add-cap", "specs", "cap", "spec.md");
  const tasksRaw = fs.readFileSync(tasksPath, "utf8");
  const deltaRaw = fs.readFileSync(deltaPath, "utf8");
  try {
    fs.writeFileSync(tasksPath, tasksRaw.replace("- [ ] 3.1", "- [x] 3.1"));
    fs.writeFileSync(deltaPath, deltaRaw.replace("# Verified by: tests/acceptance/cap-s1.test.js", "# Verified by: tests/definitely-missing-pin.test.js"));
    const again = val.validateBoth(g.root, "add-cap");
    assert(!again.strict.ok && again.draft.ok, `strict-only gate leaked into draft: ${JSON.stringify(again.draft.errors)}`);
    assert(again.strict.errors.some((e) => e.includes("definitely-missing-pin")), "strict verdict must name the missing pin");
  } finally {
    fs.writeFileSync(tasksPath, tasksRaw);
    fs.writeFileSync(deltaPath, deltaRaw);
  }
});

check("S32", "the scaffold round-trips: what the harness emits, the harness accepts", () => {
  const s = sandbox();
  initStore(s.root, REPO, { ci: "none", hooks: false });
  createChange(s.root, "rt", ["gherkin"]);
  const dir = path.join(s.root, "cdd", "changes", "rt");
  const read = (f) => fs.readFileSync(path.join(dir, f), "utf8");
  const put = (f, t) => fs.writeFileSync(path.join(dir, f), t);
  // leg 1 — a fresh scaffold is draft-red on placeholders only (never structure)
  const d0 = val.validateChange(s.root, "rt", "draft");
  assert(!d0.ok && d0.errors.length === 3 && d0.errors.every((e) => /placeholders still unfilled/.test(e)), JSON.stringify(d0.errors));
  // leg 2 — minimal fill, as in-place edits relative to the template output
  const fillPlaceholders = (t) => t.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>\n]+>/g, "x");
  put("proposal.md", fillPlaceholders(read("proposal.md")));
  put("tasks.md", fillPlaceholders(read("tasks.md")).replace(/- \[ \]/g, "- [x]"));
  put("specs/gherkin/spec.md", fillPlaceholders(read("specs/gherkin/spec.md")));
  fs.mkdirSync(path.join(s.root, "tests", "acceptance"), { recursive: true });
  fs.writeFileSync(path.join(s.root, "tests", "acceptance", "gherkin-x.test.js"), "// pin\n");
  const s1 = val.validateChange(s.root, "rt", "strict");
  assert(s1.ok, formatVerdict(s1));
  // leg 3 — the one-call close merges the requirement and moves the folder
  const a = archiveChange(s.root, "rt");
  assert(a.ok, JSON.stringify(a));
  const living = fs.readFileSync(path.join(s.root, "cdd", "specs", "gherkin", "spec.md"), "utf8");
  assert(/### Requirement: x/.test(living), "living spec must hold the scaffolded requirement");
  assert(!fs.existsSync(dir), "change folder must move");
  assert(fs.readdirSync(path.join(s.root, "cdd", "archive")).some((d) => d.endsWith("-rt")), "archive folder must exist");
});

// --- the isolated-pi loop (spends tokens; opt-in) ------------------------------

if (process.env.RUN_PI_LOOP === "1") {
  check("S19", "isolated pi via CLI: tools registered and callable headless", () => {
    const out = execFileSync(
      "pi",
      ["--print", "--no-extensions", "--extension", REPO, "-p", "Call the cdd tool with op status and reply with exactly the JSON it returned."],
      { encoding: "utf8", cwd: g.root, timeout: 300_000 },
    );
    assert(/openChanges/.test(out) && /add-cap/.test(out), `unexpected output:\n${out.slice(0, 800)}`);
  });
  check("S19b", "isolated pi via CLI: ambient block injected into context (transcripts cannot show it)", () => {
    const out = execFileSync(
      "pi",
      ["--print", "--no-extensions", "--extension", REPO, "-p", "Without calling any tools: quote the exact heading of the contract-driven-development block in your context, and the open changes it lists."],
      { encoding: "utf8", cwd: g.root, timeout: 300_000 },
    );
    assert(out.includes("## cdd — contract-driven development"), `ambient block not in context:\n${out.slice(0, 800)}`);
    assert(/add-cap/.test(out), `open change not listed in ambient block:\n${out.slice(0, 800)}`);
  });
}

check("S27", "commit-msg door: mechanical passes honestly, bare code fails with a remedy, M polices the claim", () => {
  const s = sandbox();
  initStore(s.root, REPO, { ci: "none", hooks: true });
  git(s.root, "init", "-q");
  git(s.root, "config", "user.email", "t@t");
  git(s.root, "config", "user.name", "t");
  const wf = (rel, t) => fs.writeFileSync(path.join(s.root, rel), t);
  fs.mkdirSync(path.join(s.root, "cdd", "specs", "cap"), { recursive: true });
  wf("cdd/specs/cap/spec.md", "### Requirement: R1\n\nP.\n\nCode: src/**\n\n```gherkin\nFeature: R1\n\nScenario: S1\nGiven a fixture\nWhen it runs\nThen it works\n  # Verified by: tests/acceptance/cap.test.js\n```\n\n");
  fs.mkdirSync(path.join(s.root, "tests", "acceptance"), { recursive: true });
  wf("tests/acceptance/cap.test.js", "// pin\n");
  fs.mkdirSync(path.join(s.root, "src"), { recursive: true });
  wf("src/impl.js", "export const x = 1;\n");
  git(s.root, "add", "-A");
  git(s.root, "commit", "-qm", "feat: cap");
  const run = (args) => {
    try {
      return { code: 0, out: execFileSync("node", [path.join(s.root, "cdd", "scripts", "spec-drift.mjs"), ...args], { encoding: "utf8", cwd: s.root }) };
    } catch (e) {
      return { code: e.status ?? 1, out: (e.stdout ?? "") + (e.stderr ?? "") };
    }
  };
  const msg = (t) => {
    const p = path.join(s.root, "MSGFILE");
    fs.writeFileSync(p, t);
    return p;
  };
  // (a) bare code change without its spec -> commit-msg red, remedy, never a bypass hint
  wf("src/impl.js", "export const x = 2;\n");
  git(s.root, "add", "-A");
  const bare = run(["--commit-msg", msg("feat: change impl\n")]);
  assert(bare.code !== 0 && /\[L2\]/.test(bare.out), `expected L2 at the commit-msg door:\n${bare.out}`);
  assert(!/no-verify/.test(bare.out), "a red door must teach the remedy, never the bypass");
  // (b) the same staged change with the Mechanical-Change: trailer -> passes honestly
  const mech = run(["--commit-msg", msg("chore: codestyle sweep\n\nMechanical-Change: lint --fix over src\n")]);
  assert(mech.code === 0, `mechanical commit must pass the commit-msg door:\n${mech.out}`);
  // (c) mechanical claim but stages the contract layer -> M red with the split remedy
  wf("cdd/specs/cap/spec.md", "### Requirement: R1\n\nP. changed.\n\nCode: src/**\n\n```gherkin\nFeature: R1\n\nScenario: S1\nGiven a fixture\nWhen it runs\nThen it works\n  # Verified by: tests/acceptance/cap.test.js\n```\n\n");
  git(s.root, "add", "-A");
  const smuggle = run(["--commit-msg", msg("chore: sweep\n\nMechanical-Change: rename\n")]);
  assert(smuggle.code !== 0 && /\[M\]/.test(smuggle.out), `expected M smuggling rejection:\n${smuggle.out}`);
  // (d) both hooks installed, and neither hook teaches the bypass
  assert(fs.existsSync(path.join(s.root, ".githooks", "commit-msg")), "commit-msg hook not scaffolded");
  assert(fs.existsSync(path.join(s.root, ".githooks", "pre-commit")), "pre-commit hook not scaffolded");
  for (const h of ["pre-commit", "commit-msg"]) {
    const hook = fs.readFileSync(path.join(s.root, ".githooks", h), "utf8");
    assert(!/--no-verify/.test(hook), `${h} hook must not mention --no-verify`);
  }
  git(s.root, "commit", "-qm", "chore: codestyle sweep\n\nMechanical-Change: lint --fix over src");
  s.dispose();
});
check("S28", "hook health: half-upgraded scaffold goes red, hooks:false stays silent", () => {
  const s = sandbox();
  initStore(s.root, REPO, { ci: "none", hooks: true });
  git(s.root, "init", "-q");
  git(s.root, "config", "user.email", "t@t");
  git(s.root, "config", "user.name", "t");
  const run = () => {
    try {
      return { code: 0, out: execFileSync("node", [path.join(s.root, "cdd", "scripts", "spec-drift.mjs")], { encoding: "utf8", cwd: s.root }) };
    } catch (e) {
      return { code: e.status ?? 1, out: (e.stdout ?? "") + (e.stderr ?? "") };
    }
  };
  // complete scaffold: silent
  let r = run();
  assert(r.code === 0, `complete scaffold must be silent:\n${r.out}`);
  // half-upgrade simulation: new script, old hook set
  fs.rmSync(path.join(s.root, ".githooks", "commit-msg"));
  r = run();
  assert(r.code !== 0 && /\[H\]/.test(r.out), `expected [H] hook-health red:\n${r.out}`);
  // deliberate no-hooks project: silent
  fs.rmSync(path.join(s.root, ".githooks", "pre-commit"));
  r = run();
  assert(r.code === 0 && !/\[H\]/.test(r.out), `hooks:false project must not warn:\n${r.out}`);
  s.dispose();
});

// --- S29: /cdd-status TUI window (status-ui.ts, loaded like pi loads it) --------
if (CddStatusView) {
  check("S29", "status TUI: tabs, newest first, in-process highlighted, sortable, esc closes", () => {
    const s = sandbox();
    initStore(s.root, REPO, { ci: "none", hooks: false });
    createChange(s.root, "older", ["a"]);
    createChange(s.root, "newer", ["b"]);
    const now = Date.now();
    fs.utimesSync(path.join(s.root, "cdd", "changes", "older", "tasks.md"), new Date(now - 3600e3), new Date(now - 3600e3));
    fs.utimesSync(path.join(s.root, "cdd", "changes", "newer", "tasks.md"), new Date(now), new Date(now));
    const events = [];
    // passthrough theme: records tokens as text so assertions can grep them
    const theme = {
      style: (t, o) => `<${[o.fg, o.bg, o.bold && "b", o.underline && "u"].filter(Boolean).join(",")}>${t}</>`,
      fg: (c, t) => `<fg:${c}>${t}</>`,
      bg: (c, t) => `<bg:${c}>${t}</>`,
    };
    const plain = (view, w = 110) => view.render(w).map((l) => l.replace(/\x1b\[[0-9;]*m/g, ""));
    const view = new CddStatusView(status(s.root), { requestRender: () => events.push("render") }, theme, () => events.push("closed"));
    let lines = plain(view);
    assert(lines.some((l) => /Open \(2\)/.test(l) && /Archived \(0\)/.test(l)), "tab bar shows both tabs");
    assert(lines.findIndex((l) => /newer/.test(l)) < lines.findIndex((l) => /older/.test(l)), "newest change on top");
    assert(lines.some((l) => /Updated ↓/.test(l)), "default sort marker on Updated column");
    // in-process highlight: every cell of the row carries selectedBg
    const data = status(s.root);
    data.openChanges[0].state = "in-process";
    const v2 = new CddStatusView(data, { requestRender() {} }, theme, () => {});
    const raw = v2.render(300).join("\n");
    const row = raw.split("\n").find((l) => /newer/.test(l));
    const stateLine = raw.split("\n").find((l) => />in-process</.test(l) || /in-process\s*</.test(l));
    assert(row && stateLine && row.includes("newer"), `in-process row missing: ${row}`);
    assert(stateLine && /selectedBg/.test(stateLine) && stateLine.split("selectedBg").length >= 7, `in-process row not fully highlighted: ${stateLine}`);
    // keyboard: tab switches to archived, enter re-sorts, esc closes
    view.handleInput("\t");
    lines = plain(view);
    assert(lines.some((l) => /Archived \(0\)/.test(l)) && !lines.join("\n").includes("Updated ↓"), "second tab shows archived table");
    view.handleInput("\t"); // back to open tab
    view.handleInput("\r");
    assert(plain(view).some((l) => /Updated ↑/.test(l)), "enter flips sort direction");
    view.handleInput("\x1b[D"); // ← switches tab
    assert(plain(view).some((l) => /Archived \(0\)/.test(l)), "left arrow switches to archived tab");
    view.handleInput("\x1b[C"); // → switches back
    assert(plain(view).some((l) => /Updated ↑/.test(l)), "right arrow switches to open tab");
    view.handleInput("1"); // sort by first column (Change)
    assert(plain(view).some((l) => /Change ↑/.test(l)), "digit 1 sorts by Change column");
    view.handleInput("1"); // same digit again flips direction
    assert(plain(view).some((l) => /Change ↓/.test(l)), "pressing the digit again flips direction");
    view.handleInput("\x1b");
    assert(events.includes("closed"), "esc closes the window");
    const max = Math.max(...plain(view, 40).map((l) => l.length), 0);
    assert(max <= 40, `rendered line exceeds width: ${max}`);
    s.dispose();
  });
} else {
  console.log("  skip S29 (no pi install found — status-ui.ts not loadable)");
}

// --- S33: bundled review skills are loadable pi skills ---------------------------
check("S33", "skills/ holds the three review skills, frontmatter valid, manifest registered", () => {
  const skills = ["cdd-code-review", "cdd-spec-review", "cdd-adr-review"];
  for (const s of skills) {
    const file = path.join(REPO, "skills", s, "SKILL.md");
    assert(fs.existsSync(file), `skills/${s}/SKILL.md missing`);
    const text = fs.readFileSync(file, "utf8");
    const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
    assert(fm, `skills/${s}: no frontmatter block`);
    const name = fm[1].match(/^name:\s*(\S+)$/m);
    assert(name?.[1] === s, `skills/${s}: frontmatter name "${name?.[1]}" must match the directory (portable form)`);
    const desc = fm[1].match(/^description:\s*"([\s\S]*)"\s*$/m);
    assert(desc && desc[1].length > 20 && desc[1].length <= 1024, `skills/${s}: description missing or out of spec bounds`);
    assert(/cdd/.test(desc[1]), `skills/${s}: description must scope routing to cdd projects`);
    // the findings grammar travels in every review skill
    assert(/severity/.test(text) && /disposition/.test(text) && /blocker/.test(text), `skills/${s}: findings grammar (severity/disposition/blocker) missing`);
  }
  const spec = JSON.parse(fs.readFileSync(path.join(REPO, "package.json"), "utf8"));
  assert(Array.isArray(spec.pi?.skills) && spec.pi.skills.includes("./skills"), "package.json pi.manifest must register ./skills");
});

// --- S34: the loop law scaffolds its review points -------------------------------
check("S34", "tasks template wires the review points into the scaffold", () => {
  const t = tasksTemplate("x");
  // R2: the Change review task precedes the first implementation placeholder
  const r2 = t.indexOf("3.1 Change review");
  assert(r2 !== -1 && r2 < t.indexOf("- [ ] 3.2 <task>"), "task 3.1 Change review must sit before the first implementation task");
  assert(/package mode/.test(t) && /r2-change-review\.md/.test(t) && /no blocker is open/.test(t), "3.1 must run cdd-spec-review in package mode with a checkable no-blocker condition");
  // R3 + ADR review: Close gates archive
  const closeAt = t.indexOf("## 4. Close");
  const stdAt = t.indexOf("4.1 Standards-axis change code review");
  const specAt = t.indexOf("4.2 Spec-axis change code review");
  const adrAt = t.indexOf("4.3 ADR review");
  const validateAt = t.indexOf("4.4 cdd validate strict green");
  const archiveAt = t.indexOf("4.5 Archive");
  assert(closeAt !== -1 && stdAt > closeAt && specAt > stdAt && adrAt > specAt && validateAt > adrAt && archiveAt > validateAt, "Close must order both code-review axes and the ADR review before validate and archive");
  assert(/r3-standards-code-review\.md/.test(t) && /r3-spec-code-review\.md/.test(t) && /adr-review\.md/.test(t), "Close review tasks must name their findings files");
});
// --- S35: the extension entry refuses silent direct execution ---------------------
check("S35", "node index.ts never exits silently (no silent exit-0); usage + exit 2 where node can run TS", () => {
  const r = spawnSync("node", [path.join(REPO, "index.ts")], { encoding: "utf8", cwd: REPO });
  assert(r.status !== 0, `expected a nonzero exit (never a silent exit-0), got ${r.status}`);
  assert(r.stderr.trim().length > 0, "direct execution must fail loudly, not silently");
  // CI matrix spans node 20 (cannot execute .ts at all: ERR_UNKNOWN_FILE_EXTENSION,
  // node's own refusal fires before the guard can print its usage line) and node 24
  // (type stripping default: the guard prints exactly one usage line and exits 2).
  // Probe this node's regime with a real .ts file and assert the full invariant
  // only where it applies.
  const probeDir = fs.mkdtempSync(path.join(os.tmpdir(), "pi-cdd-s35-"));
  const probeFile = path.join(probeDir, "probe.ts");
  fs.writeFileSync(probeFile, "const x: number = 1;\n");
  const pr = spawnSync("node", [probeFile], { encoding: "utf8" });
  fs.rmSync(probeDir, { recursive: true, force: true });
  if (pr.status === 0) {
    assert(r.status === 2, `strip-capable node: expected exit 2, got ${r.status}`);
    const lines = r.stderr.trim().split("\n");
    assert(lines.length === 1, `expected exactly one stderr line, got ${lines.length}`);
    assert(/not a command/.test(r.stderr) && /pi --extension/.test(r.stderr) && /spec-drift\.mjs/.test(r.stderr), "usage line must name pi --extension and the door commands");
  }
});


// --- S36: the reviewer brief templates live next to their skills ------------------
check("S36", "five reviewer briefs pin law citations, grammar, and output filenames", () => {
  const briefs = [
    ["cdd-spec-review", "brief-r1.md", "R1", null],
    ["cdd-spec-review", "brief-r2.md", "R2", null],
    ["cdd-code-review", "brief-r3-standards.md", "R3", "standards"],
    ["cdd-code-review", "brief-r3-spec.md", "R3", "spec"],
    ["cdd-adr-review", "brief-adr.md", "ADR", null],
  ];
  for (const [skill, file, point, axis] of briefs) {
    const p = path.join(REPO, "skills", skill, file);
    assert(fs.existsSync(p), `missing brief ${skill}/${file}`);
    const b = fs.readFileSync(p, "utf8");
    assert(/rule 2b/.test(b), `${file} must cite rule 2b`);
    assert(/family/.test(b), `${file} must state the author-family rule`);
    assert(/blocker/.test(b) && /won't-fix:/.test(b), `${file} must carry the findings grammar`);
    const rp = loopLaw.reviewPoint(point);
    const outputs = axis === "standards" ? [rp.findingsStandards] : axis === "spec" ? [rp.findingsSpec] : [rp.findings];
    for (const f of outputs) assert(b.includes(f), `${file} must name its output file per reviewPoint()`);
    if (axis === "standards") assert(!b.includes(rp.findingsSpec), "the standards brief must not name the spec-axis findings file");
    if (axis === "spec") assert(!b.includes(rp.findingsStandards), "the spec brief must not name the standards-axis findings file");
  }
});

// --- S37: the bundled triage skill carries the backlog triage rubric --------------
check("S37", "skills/ holds the cdd-backlog-triage skill, frontmatter valid, rubric anchors present", () => {
  const s = "cdd-backlog-triage";
  const file = path.join(REPO, "skills", s, "SKILL.md");
  assert(fs.existsSync(file), `skills/${s}/SKILL.md missing`);
  const text = fs.readFileSync(file, "utf8");
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
  assert(fm, `skills/${s}: no frontmatter block`);
  const name = fm[1].match(/^name:\s*(\S+)$/m);
  assert(name?.[1] === s, `skills/${s}: frontmatter name "${name?.[1]}" must match the directory (portable form)`);
  const desc = fm[1].match(/^description:\s*"([\s\S]*)"\s*$/m);
  assert(desc && desc[1].length > 20 && desc[1].length <= 1024, `skills/${s}: description missing or out of spec bounds`);
  assert(/cdd/.test(desc[1]), `skills/${s}: description must scope routing to cdd projects`);
  // cites rule 13 (the backlog's place in the loop) without restating the law
  assert(/rule 13/.test(text), `skills/${s}: must cite loop law rule 13`);
  // the rubric: every grammar status of the backlog op, single-sourced from lib/backlog.mjs
  for (const st of BACKLOG_STATUSES) assert(text.includes(st), `skills/${s}: grammar status "${st}" missing`);
  // and the taxonomy teaches exactly those statuses — no stray sixth
  const tax = text.split(/^## /m).find((sec) => sec.startsWith("The status taxonomy"));
  assert(tax, `skills/${s}: status taxonomy section missing`);
  const taught = [...tax.matchAll(/^- `([a-z'-]+)`/gm)].map((m) => m[1]);
  assert(taught.length === BACKLOG_STATUSES.length && taught.every((st) => BACKLOG_STATUSES.includes(st)), `skills/${s}: taxonomy must list exactly the ${BACKLOG_STATUSES.length} grammar statuses, got: ${taught.join(", ")}`);
  // evaluate-on-recurrence is taught as a note pattern, never a grammar status
  assert(/evaluate on recurrence[^.]*is not a grammar status/i.test(text), `skills/${s}: evaluate-on-recurrence must be marked not a grammar status`);
  // the item grammar line, as the backlog op enforces it
  assert(text.includes("- PF-n [status] summary | source: ref"), `skills/${s}: item grammar line missing`);
  // both inviolable conventions
  assert(/on-disk artifact/.test(text), `skills/${s}: steer-believed-only-with-on-disk-artifact convention missing`);
  assert(/PF-n ids/.test(text), `skills/${s}: reports-cite-PF-n-ids convention missing`);
  // the change-worthy rule against record-only
  assert(/two independent recurrences|two recurrences/.test(text) && /structural fix/.test(text) && /record-only/.test(text), `skills/${s}: change-worthy rule missing`);
  // op-only minting with the exactly-one freehand note-edit exception
  assert(/backlog op/.test(text), `skills/${s}: cdd-backlog-op minting rule missing`);
  assert(/note/.test(text) && /freehand|direct note edit/.test(text), `skills/${s}: the note-edit freehand exception missing`);
});
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
