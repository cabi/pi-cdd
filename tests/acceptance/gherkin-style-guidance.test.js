#!/usr/bin/env node
// gherkin-style-guidance — declarative style is door-1 law in the corpus, and
// the validator carries exactly 0 style heuristics. Red until
// templates.mjs, instructions.mjs, and rules.md carry the clauses.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const lib = await import(path.join(REPO, "lib", "store.mjs"));
const val = await import(path.join(REPO, "lib", "validate.mjs"));
const tpl = await import(path.join(REPO, "lib", "templates.mjs"));
const insMod = await import(path.join(REPO, "lib", "instructions.mjs"));
const ghPath = path.join(REPO, "lib", "gherkin.mjs");
const gh = fs.existsSync(ghPath) ? await import(ghPath) : null;

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

// --- 1. the three corpus surfaces teach the format ---------------------------

check("T1", "delta template scaffolds a Feature fence with the pin inside as a comment", () => {
  const t = tpl.deltaTemplate("style");
  assert(t.includes("```gherkin"), "template lacks a ```gherkin fence");
  assert(/^Feature: /m.test(t), "template fence lacks a Feature: line");
  const fenceStart = t.indexOf("```gherkin");
  const fenceEnd = t.indexOf("```", fenceStart + 3);
  const pinIdx = t.indexOf("# Verified by:");
  assert(pinIdx > fenceStart && pinIdx < fenceEnd, "pin comment is not inside the fence");
  assert(!/^#### Scenario:/m.test(t), "template still scaffolds #### Scenario headings");
  assert(!/^Verified by:/m.test(t), "template still carries a markdown pin outside the fence");
});

check("T2", "DELTA_INSTRUCTION names the fence, pin placement, declarative clause", () => {
  const src = fs.readFileSync(path.join(REPO, "lib", "instructions.mjs"), "utf8");
  const text = src + "\n" + insMod.DELTA_INSTRUCTION;
  assert(text.includes("```gherkin"), "no fenced-gherkin mention");
  assert(text.includes("# Verified by:"), "no pin-inside-fence clause");
  assert(/no other comments/.test(text), "no comment-law clause");
  assert(/declarative/i.test(text), "no declarative-style clause");
  assert(/keystrokes|widgets|selectors|interaction mechanics/.test(text), "no interaction-mechanics ban");
});

check("T3", "RULES_MD rule 4 carries the fence law and declarative clause", () => {
  const rules = tpl.RULES_MD ?? fs.readFileSync(path.join(REPO, "cdd", "rules.md"), "utf8");
  assert(/```gherkin/.test(rules), "rules.md lacks fenced-gherkin law");
  assert(/# Verified by:/.test(rules), "rules.md lacks pin-inside-fence law");
  assert(/declarative/i.test(rules), "rules.md lacks declarative clause");
});

// --- 2. version 0.4.1 -----------------------------------------------------------

check("T4", "package.json is at 0.4.1", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO, "package.json"), "utf8"));
  assert(pkg.version === "0.4.1", `expected 0.4.1, got ${pkg.version}`);
});

// --- 3. style is never machine-checked ----------------------------------------

const IMPERATIVE_BODY = `Feature: Style requirement

Scenario: Imperative scenario
  Given the settings page is open
  When the user clicks the Save button and types esc into the search field
  Then the toast widget shows 1 confirmation
  # Verified by: tests/acceptance/gherkin-style-guidance.test.js`;

check("T5", "imperative step prose stays green — style is door-1 judgment", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-sty-"));
  lib.initStore(root, REPO, {});
  lib.createChange(root, "t-sty", ["sty"]);
  const fillDir = path.join(root, "cdd", "changes", "t-sty");
  fs.writeFileSync(path.join(fillDir, "proposal.md"), "## Why\n\nFixture.\n\n## What Changes\n\nFixture.\n\n## Solutions Considered\n\nFixture.\n\n## Non-Goals\n\nFixture.\n\nDone-When: fixture passes\nCode: lib/none.mjs\n");
  fs.writeFileSync(path.join(fillDir, "tasks.md"), "## 1. Context\n\n- [x] 1.1 Fixture\n\n## 2. Design\n\n- [x] 2.1 Fixture\n\n## 3. Implementation\n\n- [x] 3.1 Fixture — verify by tests/acceptance/fixture.test.js\n\n## 4. Close\n\n## Done When Traceability\n\n| criterion | task ids |\n|---|---|\n| fixture | 3.1 |\n");
  const dir = path.join(root, "cdd", "changes", "t-sty", "specs", "sty");
  fs.writeFileSync(
    path.join(dir, "spec.md"),
    [
      "## ADDED Requirements",
      "",
      "### Requirement: Style requirement",
      "",
      "Prose stays outside the fence.",
      "",
      "```gherkin",
      IMPERATIVE_BODY,
      "```",
      "",
    ].join("\n")
  );
  const v = val.validateChange(root, "t-sty", "draft");
  assert(v.ok, `style leaked into the machine gate:\n${v.errors.join("\n")}`);
  fs.rmSync(root, { recursive: true, force: true });
});

check("T6", "lib/gherkin.mjs exports no style-checking surface", () => {
  assert(fs.existsSync(ghPath), "lib/gherkin.mjs missing");
  assert(gh && JSON.stringify(Object.keys(gh).sort()) === JSON.stringify(["checkFence", "extractFences"]), `unexpected export surface: ${gh ? Object.keys(gh).sort() : "module missing"}`);
  const src = fs.readFileSync(ghPath, "utf8");
  assert(!/STYLE_LEXICON|checkStyle|styleCheck|IMPERATIVE_|imperative\(/i.test(src), "style machinery found in lib/gherkin.mjs");
  const { errors } = gh.checkFence(IMPERATIVE_BODY);
  assert(errors.length === 0, `checkFence flagged prose style:\n${errors.map((e) => e.message).join("\n")}`);
});

console.log(fail === 0 ? `\nPASS ${pass}` : `\nFAIL ${pass} passed, ${fail} failed`);
failures.forEach((f) => console.log(`  ${f}`));
process.exitCode = fail === 0 ? 0 : 1;
