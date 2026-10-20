#!/usr/bin/env node
// extension-door1 — the extension surface contract (change one-pass-one-close):
// ops dispatch and render while the library behaves (R1 pins tests/tools.mjs),
// one evaluation answers both dials, and archiving is one library call that
// gates, merges, and moves — callers never gate themselves.
// Pins: R2/R3 scenarios in the extension delta.

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

const PIN_FILE = "tests/acceptance/ext-pin.test.js";
const REQ = "Thin ops requirement";

// A store with exactly 1 ADDED requirement and its pin file on disk.
// `ticked` chooses the strict-only defect (unticked task), `why` chooses
// a draft-level defect (proposal missing "## Why").
function extensionStore({ ticked = false, why = true } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-ext-"));
  lib.initStore(root, REPO, {});
  lib.createChange(root, "t-ext", ["ext"]);
  fs.mkdirSync(path.join(root, "tests", "acceptance"), { recursive: true });
  fs.writeFileSync(path.join(root, PIN_FILE), "// pin\n");
  const whySection = why ? "## Why\n\nFixture.\n\n" : "";
  fs.writeFileSync(
    path.join(root, "cdd", "changes", "t-ext", "proposal.md"),
    `${whySection}## What Changes\n\nFixture.\n\n## Solutions Considered\n\nFixture.\n\n## Non-Goals\n\nFixture.\n\nDone-When: fixture passes\nCode: lib/none.mjs\n`
  );
  fs.writeFileSync(
    path.join(root, "cdd", "changes", "t-ext", "tasks.md"),
    `## 1. Context\n\n- [x] 1.1 Fixture\n\n## 2. Design\n\n- [x] 2.1 Fixture\n\n## 3. Implementation\n\n- ${ticked ? "[x]" : "[ ]"} 3.1 Fixture — verify by ${PIN_FILE}\n\n## Done When Traceability\n\n| criterion | task ids |\n|---|---|\n| fixture | 3.1 |\n\n## 4. Close\n\n- [ ] 4.1 Fixture\n`
  );
  fs.writeFileSync(
    path.join(root, "cdd", "changes", "t-ext", "specs", "ext", "spec.md"),
    `## ADDED Requirements\n\n### Requirement: ${REQ}\n\nRequirement prose stays outside the fence.\n\n\`\`\`gherkin\nFeature: ${REQ}\n\nScenario: First case\n  Given a fixture\n  When it runs\n  Then it works\n  # Verified by: ${PIN_FILE}\n\nScenario: Second case\n  Given a fixture\n  When it runs again\n  Then it still works\n  # Verified by: ${PIN_FILE}\n\`\`\`\n`
  );
  return root;
}

// --- R2: One verdict pair per change --------------------------------------------

check("E1", "one evaluation returns both verdicts", () => {
  const root = extensionStore(); // exactly 1 strict-only defect: unticked task
  const pair = val.validateBoth(root, "t-ext");
  assert(Object.keys(pair).length === 2, `pair must hold exactly 2 verdicts: ${Object.keys(pair)}`);
  assert(pair.draft.ok, `draft must be ok: ${JSON.stringify(pair.draft.errors)}`);
  assert(!pair.strict.ok, "strict must be red on a strict-only defect");
  assert(pair.strict.errors.length === 1, `fixture holds exactly 1 strict error: ${JSON.stringify(pair.strict.errors)}`);
  assert(/unchecked task/.test(pair.strict.errors[0]), "the strict error must be the unchecked-task gate");
});

check("E2", "draft errors are a subset of strict errors", () => {
  const root = extensionStore({ why: false }); // 1 draft defect + 1 strict-only defect
  const pair = val.validateBoth(root, "t-ext");
  assert(pair.draft.errors.length === 1, `fixture must hold exactly 1 draft error: ${JSON.stringify(pair.draft.errors)}`);
  assert(pair.strict.errors.length === 2, `fixture must hold exactly 2 strict errors: ${JSON.stringify(pair.strict.errors)}`);
  for (const d of pair.draft.errors) {
    assert(pair.strict.errors.includes(d), `draft error missing from strict: ${d}`);
  }
});

// --- R3: The close loop is one call ---------------------------------------------

check("E3", "the close refuses a red change itself", () => {
  const root = extensionStore(); // strict red: unticked task
  const r = lib.archiveChange(root, "t-ext");
  assert(r.ok === false && r.stage === "strict-validation", `staged refusal expected: ${JSON.stringify(r).slice(0, 200)}`);
  assert(r.validation && r.validation.ok === false, "refusal must carry the strict verdict");
  assert(fs.existsSync(path.join(root, "cdd", "changes", "t-ext")), "a red change must stay in place");
  assert(!fs.existsSync(path.join(root, "cdd", "specs", "ext", "spec.md")), "nothing must merge into the living spec");
});

check("E4", "the close moves a green change atomically", () => {
  const root = extensionStore({ ticked: true });
  assert(val.validateChange(root, "t-ext", "strict").ok, "fixture must be strict green");
  const r = lib.archiveChange(root, "t-ext");
  assert(r.ok, `archive failed: ${JSON.stringify(r)}`);
  const living = fs.readFileSync(path.join(root, "cdd", "specs", "ext", "spec.md"), "utf8");
  assert(living.includes(`### Requirement: ${REQ}`), "ADDED requirement must merge into the living spec");
  assert(!fs.existsSync(path.join(root, "cdd", "changes", "t-ext")), "change folder must move");
  const archived = fs.readdirSync(path.join(root, "cdd", "archive"));
  assert(archived.some((d) => /-t-ext$/.test(d)), `no archived dir: ${archived}`);
});

console.log(fail === 0 ? `\nPASS ${pass}` : `\nFAIL ${pass} passed, ${fail} failed`);
failures.forEach((f) => console.log(`  ${f}`));
process.exitCode = fail === 0 ? 0 : 1;
