#!/usr/bin/env node
// gherkin-subset — the cdd dialect is a closed subset of Gherkin. Exactly one
// When, at least 1 Then, English keywords, no Background/Rule/tags, fence name
// equals heading, names unique per requirement. Red until the ruleset layer
// lands in lib/gherkin.mjs + lib/validate.mjs.

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
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-sub-"));
  sandboxes.push(root);
  lib.initStore(root, REPO, {});
  return root;
}

function fillScaffolding(root) {
  const dir = path.join(root, "cdd", "changes", "t-sub");
  fs.writeFileSync(path.join(dir, "proposal.md"), "## Why\n\nFixture.\n\n## What Changes\n\nFixture.\n\n## Solutions Considered\n\nFixture.\n\n## Non-Goals\n\nFixture.\n\nDone-When: fixture passes\nCode: lib/none.mjs\n");
  fs.writeFileSync(path.join(dir, "tasks.md"), "## 1. Context\n\n- [x] 1.1 Fixture\n\n## 2. Design\n\n- [x] 2.1 Fixture\n\n## 3. Implementation\n\n- [x] 3.1 Fixture — verify by tests/acceptance/fixture.test.js\n\n## 4. Close\n\n## Done When Traceability\n\n| criterion | task ids |\n|---|---|\n| fixture | 3.1 |\n");
}

// One requirement, one scenario with the given fenced body (heading "Sub case").
function oneScenario(body, { heading = "Sub case" } = {}) {
  const root = freshStore();
  lib.createChange(root, "t-sub", ["sub"]);
  fillScaffolding(root);
  const dir = path.join(root, "cdd", "changes", "t-sub", "specs", "sub");
  const text = [
    "## ADDED Requirements",
    "",
    "### Requirement: Subset requirement",
    "",
    `#### Scenario: ${heading}`,
    "",
    "```gherkin",
    body.trimEnd(),
    "```",
    "",
    "Verified by: tests/acceptance/gherkin-subset.test.js",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(dir, "spec.md"), text);
  return { root, text };
}
const validate = (root) => val.validateChange(root, "t-sub", "draft");

// --- legal core: the full allowed grammar passes -----------------------------

check("U1", "outline + Examples + data table + And/But pass untouched", () => {
  const { root } = oneScenario(`Scenario Outline: Sub case
Given a delta with a scenario using <construct>
When cdd validate runs in draft mode
Then the verdict is green
And exactly 0 errors are raised
But no warnings appear

Examples:
  | construct |
  | table     |`);
  const v = validate(root);
  assert(v.ok, `expected ok, got:\n${v.errors.join("\n")}`);
});

// --- rejected constructs ------------------------------------------------------

const rejects = [
  ["Background", `Scenario: Sub case
Given x
When y
Then z

Background:
Given a shared given`],
  ["Rule", `Scenario: Sub case
Given x
When y
Then z

Rule: no rules here`],
  ["@", `@wip
Scenario: Sub case
Given x
When y
Then z`],
  ["Gegeben", `Scenario: Sub case
Gegeben ein Delta

Wenn validiert wird
Dann rot`],
];
for (const [construct, body] of rejects) {
  check(`U2:${construct}`, `"${construct}" fails naming the construct`, () => {
    const { root } = oneScenario(body);
    const v = validate(root);
    assert(!v.ok, "expected red, got ok");
    const hit = v.errors.find((e) => e.toLowerCase().includes(construct.toLowerCase()));
    assert(hit, `no error names "${construct}":\n${v.errors.join("\n")}`);
  });
}

// --- step-count rules ---------------------------------------------------------

check("U3", "second When fails with exactly-one-When error", () => {
  const { root } = oneScenario(`Scenario: Sub case
Given a delta
When cdd validate runs
When it validates again
Then the verdict is red`);
  const v = validate(root);
  assert(!v.ok, "expected red, got ok");
  assert(v.errors.some((e) => /exactly one When/i.test(e)), `no exactly-one-When error:\n${v.errors.join("\n")}`);
});

check("U4", "missing Then fails with at-least-one-Then error", () => {
  const { root } = oneScenario(`Scenario: Sub case
Given a delta
When cdd validate runs`);
  const v = validate(root);
  assert(!v.ok, "expected red, got ok");
  assert(v.errors.some((e) => /at least 1 Then/i.test(e)), `no at-least-one-Then error:\n${v.errors.join("\n")}`);
});

check("U5", "fence name differing from heading fails naming both", () => {
  const { root } = oneScenario(`Scenario: A different name
Given a delta
When cdd validate runs
Then the verdict is red`);
  const v = validate(root);
  assert(!v.ok, "expected red, got ok");
  const hit = v.errors.find((e) => e.includes("Sub case") && /A different name|fence/i.test(e));
  assert(hit, `no heading-vs-fence error naming both:\n${v.errors.join("\n")}`);
});

check("U6", "duplicate scenario names within one requirement fail", () => {
  const root = freshStore();
  lib.createChange(root, "t-sub", ["sub"]);
  fillScaffolding(root);
  const dir = path.join(root, "cdd", "changes", "t-sub", "specs", "sub");
  const scenario = (n) => [
    `#### Scenario: ${n}`,
    "",
    "```gherkin",
    `Scenario: ${n}`,
    "Given a delta",
    "When cdd validate runs",
    "Then the verdict is red",
    "```",
    "",
    "Verified by: tests/acceptance/gherkin-subset.test.js",
    "",
  ].join("\n");
  fs.writeFileSync(
    path.join(dir, "spec.md"),
    ["## ADDED Requirements", "", "### Requirement: Subset requirement", "", scenario("Twice"), scenario("Twice")].join("\n")
  );
  const v = validate(root);
  assert(!v.ok, "expected red, got ok");
  assert(v.errors.some((e) => /unique|duplicate/i.test(e)), `no uniqueness error:\n${v.errors.join("\n")}`);
});

console.log(fail === 0 ? `\nPASS ${pass}` : `\nFAIL ${pass} passed, ${fail} failed`);
failures.forEach((f) => console.log(`  ${f}`));
process.exitCode = fail === 0 ? 0 : 1;
