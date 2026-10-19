#!/usr/bin/env node
// gherkin-parse-gate — the @cucumber/gherkin parser is the arbiter of every
// Feature fence in a delta (ADR-0006). Pins: gherkin-parse-gate scenarios
// in the gherkin-feature-blocks delta.

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

const PIN = "tests/acceptance/gherkin-parse-gate.test.js";
const REQ = "Fence gate";

// Write a one-requirement delta whose fence body is `featureBody`.
function deltaWith(featureBody, { heading = REQ, cap = "gate" } = {}) {
  const root = freshStore();
  lib.createChange(root, "t-gate", [cap]);
  fillScaffolding(root);
  const dir = path.join(root, "cdd", "changes", "t-gate", "specs", cap);
  const text = [
    "## ADDED Requirements",
    "",
    `### Requirement: ${heading}`,
    "",
    "The fence gate requirement prose.",
    "",
    "```gherkin",
    featureBody.trimEnd(),
    "```",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(dir, "spec.md"), text);
  return { root, text };
}

const validBody = (name = "Green path") => `Feature: ${REQ}

Scenario: ${name}
  Given a change delta with one fenced Feature document
  When cdd validate runs in draft mode
  Then the verdict is green with exactly 0 errors
  # Verified by: ${PIN}`;

const lineOf = (text, needle) => 1 + text.split("\n").indexOf(needle); // 1-based

// --- 1. parseable Feature document passes -----------------------------------

check("G1", "parseable Feature fence passes the gate", () => {
  const { root } = deltaWith(validBody());
  const v = val.validateChange(root, "t-gate", "draft");
  assert(v.ok, `expected ok, got errors:\n${(v.errors ?? []).join("\n")}`);
});

// --- 2. stray prose line is a parse error with file+requirement+line ---------

check("G2", "stray prose inside the fence fails naming file, requirement, line", () => {
  const body = validBody().replace("  When cdd validate runs in draft mode", "This line is not a step\n  When cdd validate runs in draft mode");
  const { root, text } = deltaWith(body);
  const v = val.validateChange(root, "t-gate", "draft");
  assert(!v.ok, "expected red, got ok");
  const stray = lineOf(text, "This line is not a step");
  const hit = v.errors.find((e) => e.includes(`line ${stray}`));
  assert(hit, `no error names line ${stray}; got:\n${v.errors.join("\n")}`);
  assert(hit.includes("t-gate/specs/gate/spec.md"), `error lacks delta path: ${hit}`);
  assert(hit.includes(REQ), `error lacks requirement name: ${hit}`);
});

// --- 3. Feature name must echo the requirement heading ------------------------

check("G3", "Feature name mismatch with the heading fails", () => {
  const { root } = deltaWith(validBody().replace(`Feature: ${REQ}`, "Feature: Something else"));
  const v = val.validateChange(root, "t-gate", "draft");
  assert(!v.ok, "expected red, got ok");
  const hit = v.errors.find((e) => /must equal the requirement heading/.test(e));
  assert(hit, `no Feature-name error:\n${v.errors.join("\n")}`);
});

// --- 4. missing fence entirely ------------------------------------------------

check("G4", "requirement without a fence fails", () => {
  const root = freshStore();
  lib.createChange(root, "t-gate", ["gate"]);
  fillScaffolding(root);
  const dir = path.join(root, "cdd", "changes", "t-gate", "specs", "gate");
  fs.writeFileSync(
    path.join(dir, "spec.md"),
    `## ADDED Requirements\n\n### Requirement: Bare requirement\n\nGiven prose only, no fence at all.\n`
  );
  const v = val.validateChange(root, "t-gate", "draft");
  assert(!v.ok, "expected red, got ok");
  assert(v.errors.some((e) => /no fenced gherkin Feature block/i.test(e)), `no fence error:\n${v.errors.join("\n")}`);
});

// --- 5. old-format residue is loud --------------------------------------------

check("G5", "markdown #### Scenario headings and markdown pins are old-format residue", () => {
  const root = freshStore();
  lib.createChange(root, "t-gate", ["gate"]);
  fillScaffolding(root);
  const dir = path.join(root, "cdd", "changes", "t-gate", "specs", "gate");
  fs.writeFileSync(
    path.join(dir, "spec.md"),
    `## ADDED Requirements\n\n### Requirement: Old format\n\nProse.\n\n#### Scenario: Old\n\n\`\`\`gherkin\nFeature: Old format\n\nScenario: Old\n  Given an old-format delta\n  When cdd validate runs in draft mode\n  Then the verdict is red\n\`\`\`\n\nVerified by: ${PIN}\n`
  );
  const v = val.validateChange(root, "t-gate", "draft");
  assert(!v.ok, "expected red, got ok");
  assert(v.errors.some((e) => e.includes('"#### Scenario:" markdown headings are gone')), `no heading-residue error:\n${v.errors.join("\n")}`);
  assert(v.errors.some((e) => e.includes("pin now lives inside the fence")), `no pin-residue error:\n${v.errors.join("\n")}`);
});

// --- 6. strict mode: pin existence ---------------------------------------------

check("G6", "strict flags a pin whose file does not exist", () => {
  const { root } = deltaWith(validBody().replace(PIN, "tests/acceptance/missing.test.js"));
  const draft = val.validateChange(root, "t-gate", "draft");
  assert(draft.ok, `draft should pass, got:\n${draft.errors.join("\n")}`);
  const strict = val.validateChange(root, "t-gate", "strict");
  assert(!strict.ok, "expected strict red, got ok");
  assert(strict.errors.some((e) => /pins "tests\/acceptance\/missing.test.js" but that file does not exist/.test(e)), `no pin-existence error:\n${strict.errors.join("\n")}`);
});

// --- 7. extraction seam (unit-level, for line mapping) -------------------------

{
  const ghPath = path.join(REPO, "lib", "gherkin.mjs");
  const gh = fs.existsSync(ghPath) ? await import(ghPath) : null;
  check("G7", "extractFences maps fence text to 1-based markdown lines", () => {
    assert(gh, "lib/gherkin.mjs missing");
    const text = "### Requirement: R\n\n```gherkin\nFeature: R\nScenario: S\n  Given x\n```\n";
    const fences = gh.extractFences(text);
    assert(fences.length === 1, `expected 1 fence, got ${fences.length}`);
    assert(fences[0].body.startsWith("Feature: R"), "body extraction wrong");
    assert(fences[0].line === 4, `fence line expected 4, got ${fences[0].line}`);
  });
}

console.log(fail === 0 ? `\nPASS ${pass}` : `\nFAIL ${pass} passed, ${fail} failed`);
failures.forEach((f) => console.log(`  ${f}`));
process.exitCode = fail === 0 ? 0 : 1;
