#!/usr/bin/env node
// gherkin-subset — the cdd Gherkin subset laws: English
// Given/When/Then/And/But only, exactly one When, at least one Then,
// no Background/Rule/tags/outlines/tables/doc strings, prose stays outside
// the fence, and the only comment is the "# Verified by:" pin.

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

function freshStore() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-sub-"));
  lib.initStore(root, REPO, {});
  lib.createChange(root, "t-sub", ["sub"]);
  fs.writeFileSync(
    path.join(root, "cdd", "changes", "t-sub", "proposal.md"),
    "## Why\n\nFixture.\n\n## What Changes\n\nFixture.\n\n## Solutions Considered\n\nFixture.\n\n## Non-Goals\n\nFixture.\n\nDone-When: fixture passes\nCode: lib/none.mjs\n"
  );
  fs.writeFileSync(
    path.join(root, "cdd", "changes", "t-sub", "tasks.md"),
    "## 1. Context\n\n- [x] 1.1 Fixture\n\n## 2. Design\n\n- [x] 2.1 Fixture\n\n## 3. Implementation\n\n- [x] 3.1 Fixture — verify by tests/acceptance/fixture.test.js\n\n## 4. Close\n\n## Done When Traceability\n\n| criterion | task ids |\n|---|---|\n| fixture | 3.1 |\n"
  );
  return root;
}

const PIN = "tests/acceptance/gherkin-subset.test.js";
const REQ = "Subset requirement";

// One-requirement delta whose fence body is `featureBody`.
function deltaWith(featureBody) {
  const root = freshStore();
  const dir = path.join(root, "cdd", "changes", "t-sub", "specs", "sub");
  fs.writeFileSync(
    path.join(dir, "spec.md"),
    `## ADDED Requirements\n\n### Requirement: ${REQ}\n\nRequirement prose stays outside the fence.\n\n\`\`\`gherkin\n${featureBody.trimEnd()}\n\`\`\`\n`
  );
  return val.validateChange(root, "t-sub", "draft");
}

const scenario = (name, { given = "a change delta", when = "cdd validate runs", then = "the verdict is red", extra = "", pin = PIN } = {}) =>
  [`Scenario: ${name}`, `  Given ${given}`, `  When ${when}`, `  Then ${then}`, ...(extra ? [extra] : []), ...(pin ? [`  # Verified by: ${pin}`] : [])].join("\n");

const baseline = [`Feature: ${REQ}`, "", scenario("First case"), "", scenario("Second case")].join("\n");

// --- baseline -----------------------------------------------------------------

check("S1", "a two-scenario Feature with pins on both passes", () => {
  const v = deltaWith(baseline);
  assert(v.ok, `expected ok:\n${v.errors.join("\n")}`);
});

// --- step-shape laws -----------------------------------------------------------

check("S2", "two When steps fail", () => {
  const v = deltaWith([`Feature: ${REQ}`, "", scenario("Double when", { extra: "  When cdd validate runs twice" })].join("\n"));
  assert(!v.ok && v.errors.some((e) => e.includes("exactly one When step — found 2")), `missing When error:\n${v.errors.join("\n")}`);
});

check("S3", "zero Then steps fails", () => {
  const body = [`Feature: ${REQ}`, "", "Scenario: No then", "  Given a change delta", "  When cdd validate runs", `  # Verified by: ${PIN}`].join("\n");
  const v = deltaWith(body);
  assert(!v.ok && v.errors.some((e) => e.includes("at least 1 Then step")), `missing Then error:\n${v.errors.join("\n")}`);
});

check("S4", "a scenario starting with And fails", () => {
  const body = [`Feature: ${REQ}`, "", "Scenario: Starts with And", "  And a prior step that does not exist", "  When cdd validate runs", "  Then the verdict is red", `  # Verified by: ${PIN}`].join("\n");
  const v = deltaWith(body);
  assert(!v.ok && v.errors.some((e) => e.includes("cannot start with And")), `missing start error:\n${v.errors.join("\n")}`);
});

check("S5b", "a localized (non-English) keyword line is rejected, named in the error", () => {
  const body = [`Feature: ${REQ}`, "", "Scenario: Lokalisiert", "  Angenommen eine Änderung", "  When cdd validate runs", "  Then the verdict is red", `  # Verified by: ${PIN}`].join("\n");
  const v = deltaWith(body);
  assert(!v.ok && v.errors.some((e) => e.includes('prose between Scenario and its steps ("Angenommen eine Änderung")')), `missing localized-keyword rejection:\n${v.errors.join("\n")}`);
});

check("S5", "a * step is outside the subset", () => {
  const v = deltaWith([`Feature: ${REQ}`, "", scenario("Star step", { given: "a change delta", extra: "  * a step in asterisk form" })].join("\n"));
  assert(!v.ok && v.errors.some((e) => e.includes(`keyword "*" is outside the cdd subset`)), `missing keyword error:\n${v.errors.join("\n")}`);
});

// --- document-shape laws ---------------------------------------------------------

check("S6", "Background is outside the subset", () => {
  const body = [`Feature: ${REQ}`, "", "Background:", "  Given shared context", "", scenario("With background")].join("\n");
  const v = deltaWith(body);
  assert(!v.ok && v.errors.some((e) => e.includes("Background is outside the cdd subset")), `missing Background error:\n${v.errors.join("\n")}`);
});

check("S7", "Rule blocks are outside the subset", () => {
  const body = [`Feature: ${REQ}`, "", "Rule: Grouping", "", "  Scenario: Inside a rule", "    Given a change delta", "    When cdd validate runs", "    Then the verdict is red", `    # Verified by: ${PIN}`].join("\n");
  const v = deltaWith(body);
  assert(!v.ok && v.errors.some((e) => e.includes("Rule is outside the cdd subset")), `missing Rule error:\n${v.errors.join("\n")}`);
});

check("S8", "@tags are outside the subset", () => {
  const body = [`Feature: ${REQ}`, "", "@smoke", scenario("Tagged")].join("\n");
  const v = deltaWith(body);
  assert(!v.ok && v.errors.some((e) => e.includes(`tag "@smoke" is outside the cdd subset`)), `missing tag error:\n${v.errors.join("\n")}`);
});

check("S9", "Scenario Outline with Examples is outside the subset", () => {
  const body = [
    `Feature: ${REQ}`,
    "",
    "Scenario Outline: Outlined",
    "  Given a <thing> delta",
    "  When cdd validate runs",
    "  Then the verdict is red",
    `  # Verified by: ${PIN}`,
    "Examples:",
    "  | thing |",
    "  | small |",
  ].join("\n");
  const v = deltaWith(body);
  assert(!v.ok && v.errors.some((e) => e.includes("Scenario Outline/Examples are outside the cdd subset")), `missing Outline error:\n${v.errors.join("\n")}`);
});

check("S10", "data tables are outside the subset", () => {
  const body = [`Feature: ${REQ}`, "", "Scenario: Tabular", "  Given a change delta:", "    | col |", "    | 1 |", "  When cdd validate runs", "  Then the verdict is red", `  # Verified by: ${PIN}`].join("\n");
  const v = deltaWith(body);
  assert(!v.ok && v.errors.some((e) => e.includes("doc strings and data tables are outside the cdd subset")), `missing table error:\n${v.errors.join("\n")}`);
});

check("S10b", "doc strings are outside the subset", () => {
  const body = [`Feature: ${REQ}`, "", "Scenario: Documented", "  Given a change delta", "    \"\"\"", "    some doc string", "    \"\"\"", "  When cdd validate runs", "  Then the verdict is red", `  # Verified by: ${PIN}`].join("\n");
  const v = deltaWith(body);
  assert(!v.ok && v.errors.some((e) => e.includes("doc strings and data tables are outside the cdd subset")), `missing doc-string error:\n${v.errors.join("\n")}`);
});

// --- prose placement -------------------------------------------------------------

check("S11", "prose between Feature and the first Scenario fails", () => {
  const body = [`Feature: ${REQ}`, "This prose explains the feature.", "", scenario("First case")].join("\n");
  const v = deltaWith(body);
  assert(!v.ok && v.errors.some((e) => e.includes("prose between Feature and the first Scenario")), `missing prose error:\n${v.errors.join("\n")}`);
});

check("S12", "prose between Scenario and its steps fails", () => {
  const body = [`Feature: ${REQ}`, "", "Scenario: Explained", "This prose explains the scenario.", "  Given a change delta", "  When cdd validate runs", "  Then the verdict is red", `  # Verified by: ${PIN}`].join("\n");
  const v = deltaWith(body);
  assert(!v.ok && v.errors.some((e) => e.includes("prose between Scenario and its steps")), `missing prose error:\n${v.errors.join("\n")}`);
});

// --- comment law -------------------------------------------------------------------

check("S13", "comments other than the pin fail", () => {
  const v = deltaWith([`Feature: ${REQ}`, "", scenario("Commented", { extra: "  # TODO revisit this" })].join("\n"));
  assert(!v.ok && v.errors.some((e) => e.includes("the only legal comment is the scenario's")), `missing comment error:\n${v.errors.join("\n")}`);
});

check("S14", "a scenario without a pin fails by name", () => {
  const v = deltaWith([`Feature: ${REQ}`, "", scenario("First case"), "", scenario("Unpinned case", { pin: null })].join("\n"));
  assert(!v.ok && v.errors.some((e) => e.includes('scenario "Unpinned case" does not end with a "# Verified by: <path>" pin comment')), `missing pin error:\n${v.errors.join("\n")}`);
});

check("S15", "two pins on one scenario fail", () => {
  const v = deltaWith([`Feature: ${REQ}`, "", scenario("Double pin", { extra: `  # Verified by: ${PIN}` })].join("\n"));
  assert(!v.ok && v.errors.some((e) => e.includes("carries 2 pin comments — exactly one")), `missing double-pin error:\n${v.errors.join("\n")}`);
});

// --- requirement-level laws ----------------------------------------------------------

check("S16", "duplicate scenario names within a requirement fail", () => {
  const v = deltaWith([`Feature: ${REQ}`, "", scenario("Same name"), "", scenario("Same name")].join("\n"));
  assert(!v.ok && v.errors.some((e) => e.includes('scenario name "Same name" must be unique within the requirement')), `missing uniqueness error:\n${v.errors.join("\n")}`);
});

check("S17", "two fences in one requirement fail", () => {
  const root = freshStore();
  const dir = path.join(root, "cdd", "changes", "t-sub", "specs", "sub");
  fs.writeFileSync(
    path.join(dir, "spec.md"),
    `## ADDED Requirements\n\n### Requirement: ${REQ}\n\nProse.\n\n\`\`\`gherkin\nFeature: ${REQ}\n\n${scenario("First case")}\n\`\`\`\n\n\`\`\`gherkin\nFeature: ${REQ}\n\n${scenario("Second case")}\n\`\`\`\n`
  );
  const v = val.validateChange(root, "t-sub", "draft");
  assert(!v.ok && v.errors.some((e) => e.includes("holds 2 gherkin fences — exactly one Feature document per requirement")), `missing fence-count error:\n${v.errors.join("\n")}`);
});

console.log(fail === 0 ? `\nPASS ${pass}` : `\nFAIL ${pass} passed, ${fail} failed`);
failures.forEach((f) => console.log(`  ${f}`));
process.exitCode = fail === 0 ? 0 : 1;
