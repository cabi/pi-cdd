#!/usr/bin/env node
// gherkin-parse-gate — the @cucumber/gherkin parser is the arbiter of every
// scenario fence in a delta. Red until lib/gherkin.mjs lands and validate.mjs
// wires it in. Pins: gherkin-parse-gate scenarios in the gherkin-specs delta.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const lib = await import(path.join(REPO, "lib", "store.mjs"));
const val = await import(path.join(REPO, "lib", "validate.mjs"));

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

const sandboxes = [];
function freshStore() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-gh-"));
  sandboxes.push(root);
  lib.initStore(root, REPO, {});
  return root;
}

// Replace the scaffolded proposal/tasks (placeholders) with minimal valid ones.
function fillScaffolding(root) {
  const dir = path.join(root, "cdd", "changes", "t-gate");
  fs.writeFileSync(path.join(dir, "proposal.md"), "## Why\n\nFixture.\n\n## What Changes\n\nFixture.\n\n## Solutions Considered\n\nFixture.\n\n## Non-Goals\n\nFixture.\n\nDone-When: fixture passes\nCode: lib/none.mjs\n");
  fs.writeFileSync(path.join(dir, "tasks.md"), "## 1. Context\n\n- [x] 1.1 Fixture\n\n## 2. Design\n\n- [x] 2.1 Fixture\n\n## 3. Implementation\n\n- [x] 3.1 Fixture — verify by tests/acceptance/fixture.test.js\n\n## 4. Close\n\n## Done When Traceability\n\n| criterion | task ids |\n|---|---|\n| fixture | 3.1 |\n");
}
// Write a one-requirement delta into a fresh store; returns {root, text}.
function deltaWith(scenarioBody, { heading = "Fence gate", cap = "gate" } = {}) {
  const root = freshStore();
  lib.createChange(root, "t-gate", [cap]);
  fillScaffolding(root);
  const dir = path.join(root, "cdd", "changes", "t-gate", "specs", cap);
  const text = [
    "## ADDED Requirements",
    "",
    `### Requirement: ${heading} requirement`,
    "",
    `#### Scenario: ${heading}`,
    "",
    "```gherkin",
    scenarioBody.trimEnd(),
    "```",
    "",
    "Verified by: tests/acceptance/gherkin-parse-gate.test.js",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(dir, "spec.md"), text);
  return { root, text };
}
const lineOf = (text, needle) => 1 + text.split("\n").indexOf(needle); // 1-based

// --- 1. parseable fence passes ----------------------------------------------

check("G1", "parseable fence passes the gate", () => {
  const { root } = deltaWith(`Scenario: Fence gate
Given a change delta with one fenced scenario
When cdd validate runs in draft mode
Then the verdict is green with exactly 0 errors`);
  const v = val.validateChange(root, "t-gate", "draft");
  assert(v.ok, `expected ok, got errors:\n${(v.errors ?? []).join("\n")}`);
});

// --- 2. stray prose line is a parse error with file+scenario+line -----------

check("G2", "stray prose inside the fence fails naming file, scenario, line", () => {
  const { root, text } = deltaWith(`Scenario: Fence gate
Given a change delta with one fenced scenario
This line is not a step
When cdd validate runs in draft mode
Then the verdict is red`);
  const v = val.validateChange(root, "t-gate", "draft");
  assert(!v.ok, "expected red, got ok");
  const stray = lineOf(text, "This line is not a step");
  const hit = v.errors.find((e) => e.includes(`line ${stray}`));
  assert(hit, `no error names line ${stray}; got:\n${v.errors.join("\n")}`);
  assert(hit.includes("t-gate/specs/gate/spec.md"), `error lacks delta path: ${hit}`);
  assert(hit.includes("Fence gate"), `error lacks scenario name: ${hit}`);
});

// --- 3. pin inside the fence: exactly the actionable pin error --------------

check("G3", "pin inside the fence yields exactly 1 pin error", () => {
  const { root } = deltaWith(`Scenario: Fence gate
Given a change delta with one fenced scenario
Verified by: tests/acceptance/gherkin-parse-gate.test.js
When cdd validate runs in draft mode
Then the verdict is red`);
  const v = val.validateChange(root, "t-gate", "draft");
  assert(!v.ok, "expected red, got ok");
  const pinErrors = v.errors.filter((e) => /outside the fence/.test(e));
  assert(pinErrors.length === 1, `expected exactly 1 "outside the fence" error, got ${pinErrors.length}:\n${v.errors.join("\n")}`);
});

// --- 4. missing fence entirely ----------------------------------------------

check("G4", "scenario without a fence fails", () => {
  const root = freshStore();
  lib.createChange(root, "t-gate", ["gate"]);
  fillScaffolding(root);
  const dir = path.join(root, "cdd", "changes", "t-gate", "specs", "gate");
  fs.writeFileSync(
    path.join(dir, "spec.md"),
    "## ADDED Requirements\n\n### Requirement: Bare requirement\n\n#### Scenario: Bare scenario\n\nGiven prose only\nWhen no fence\nThen no fence\n\nVerified by: tests/acceptance/gherkin-parse-gate.test.js\n"
  );
  const v = val.validateChange(root, "t-gate", "draft");
  assert(!v.ok, "expected red, got ok");
  assert(v.errors.some((e) => /fence/i.test(e)), `no fence error:\n${v.errors.join("\n")}`);
});

// --- 5. extraction seam (unit-level, for line mapping) ----------------------

{
  const ghPath = path.join(REPO, "lib", "gherkin.mjs");
  const gh = fs.existsSync(ghPath) ? await import(ghPath) : null;
  check("G5", "extractFences maps fence text to 1-based markdown lines", () => {
    assert(gh, "lib/gherkin.mjs missing");
    const text = "#### Scenario: S\n\n```gherkin\nScenario: S\nGiven x\n```\n";
    const fences = gh.extractFences(text);
    assert(fences.length === 1, `expected 1 fence, got ${fences.length}`);
    assert(fences[0].body.startsWith("Scenario: S"), "body extraction wrong");
    assert(fences[0].line === 4, `fence line expected 4, got ${fences[0].line}`);
  });
}

console.log(fail === 0 ? `\nPASS ${pass}` : `\nFAIL ${pass} passed, ${fail} failed`);
failures.forEach((f) => console.log(`  ${f}`));
process.exitCode = fail === 0 ? 0 : 1;
