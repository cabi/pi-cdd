#!/usr/bin/env node
// library-usage — the validator library and the grammar module refuse silent
// direct execution (exactly one stderr usage line naming the real
// invocations, exit 2) while staying silent for library importers; draft
// validation exempts angle-bracket template tokens inside inline-code spans
// (backticks are the deliberate-quoting escape hatch) while bare tokens
// still fail; the scaffold keeps its exact 3 door errors.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const lib = await import(path.join(REPO, "lib", "store.mjs"));
const { validateChange } = await import(path.join(REPO, "lib", "validate.mjs"));

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

const run = (file, args = []) =>
  spawnSync("node", [file, ...args], { encoding: "utf8", cwd: REPO });

const PLACEHOLDER_ERROR = "template placeholders still unfilled";

// --- sandbox: draft-validation behavior ---------------------------------------
const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-lu-"));
lib.initStore(root, REPO, {});
lib.createChange(root, "scaffold-count", ["gherkin"]);
lib.createChange(root, "tok-quote", ["gherkin"]);
fs.writeFileSync(
  path.join(root, "cdd", "changes", "tok-quote", "specs", "gherkin", "spec.md"),
  `## ADDED Requirements

### Requirement: Code span quotes the template token

The description quotes the scenario-naming token inside an inline-code span — \`<scenario>\` — and draft validation must exempt it as deliberate quoting.

\`\`\`gherkin
Feature: Code span quotes the template token

Scenario: Quoting in prose passes
  Given a change whose delta description quotes the token in a code span
  When draft validation runs
  Then no unfilled-placeholder error names this requirement
  # Verified by: tests/acceptance/library-usage.test.js
\`\`\`

### Requirement: Bare token still fails

This description contains the bare token <scenario> outside any code span and must stay flagged.

\`\`\`gherkin
Feature: Bare token still fails

Scenario: Bare prose fails
  Given the same change
  When draft validation runs
  Then this requirement is flagged as unfilled
  # Verified by: tests/acceptance/library-usage.test.js
\`\`\`

Code: lib/validate.mjs, tests/acceptance/library-usage.test.js
`
);

const tok = validateChange(root, "tok-quote", "draft");
const tokDeltaPh = tok.errors.filter(
  (e) => e.includes("specs/gherkin/spec.md") && e.includes(PLACEHOLDER_ERROR)
);
const tokScaffoldPh = tok.errors.filter(
  (e) => !e.includes("specs/gherkin/spec.md") && e.includes(PLACEHOLDER_ERROR)
);

// --- direct execution refuses silent exit-0 -----------------------------------
check("LU1", "direct execution of lib/validate.mjs prints one usage line and exits 2", () => {
  const r = run(path.join(REPO, "lib", "validate.mjs"));
  assert(r.status === 2, `expected exit 2, got ${r.status}`);
  const lines = r.stderr.trim().split("\n");
  assert(lines.length === 1 && lines[0].length > 0, `expected exactly one stderr line, got ${JSON.stringify(r.stderr)}`);
  assert(/cdd/.test(lines[0]) && /validate/.test(lines[0]), `usage line must name the cdd tool's validate operation: ${lines[0]}`);
  assert((r.stdout ?? "").trim() === "", "usage must not write to stdout");
});

check("LU2", "direct execution of grammar-law prints the same usage line in both locations", () => {
  const lines = [];
  for (const file of [path.join(REPO, "scripts", "grammar-law.mjs"), path.join(REPO, "cdd", "scripts", "grammar-law.mjs")]) {
    const r = run(file);
    assert(r.status === 2, `${file}: expected exit 2, got ${r.status}`);
    const ls = r.stderr.trim().split("\n");
    assert(ls.length === 1 && ls[0].length > 0, `${file}: expected exactly one stderr line, got ${JSON.stringify(r.stderr)}`);
    for (const door of ["spec-drift", "spec-extract", "arch-extract"]) {
      assert(ls[0].includes(door), `${file}: usage line must name ${door}: ${ls[0]}`);
    }
    assert((r.stdout ?? "").trim() === "", `${file}: usage must not write to stdout`);
    lines.push(ls[0]);
  }
  assert(lines[0] === lines[1], "the two locations must print the same usage line");
});

check("LU3", "importing both modules as libraries stays silent and exits 0", () => {
  for (const rel of ["lib/validate.mjs", "scripts/grammar-law.mjs"]) {
    const r = spawnSync(
      "node",
      ["-e", `import(${JSON.stringify(path.join(REPO, rel))}).then(() => process.exit(0), (e) => { console.error(String(e)); process.exit(1); })`],
      { encoding: "utf8", cwd: REPO }
    );
    assert(r.status === 0, `${rel}: library import must exit 0, got ${r.status} (${r.stderr})`);
    assert((r.stdout ?? "").trim() === "" && (r.stderr ?? "").trim() === "", `${rel}: library import must print nothing`);
  }
});

// --- code spans exempt template tokens in spec text ---------------------------
check("LU4", "a token inside an inline-code span passes draft validation", () => {
  assert(tokDeltaPh.length === 1, `expected exactly 1 delta placeholder error (the bare token), found ${tokDeltaPh.length}: ${tokDeltaPh.join(" | ")}`);
});

check("LU5", "a bare token outside any code span is still flagged", () => {
  assert(tokDeltaPh.length >= 1, "the bare-token requirement must be flagged");
  assert(tokScaffoldPh.length === 2, `the scaffold's proposal/tasks placeholder errors must persist, found ${tokScaffoldPh.length}`);
});

check("LU6", "an untouched scaffold keeps its exact 3 draft errors", () => {
  const s = validateChange(root, "scaffold-count", "draft");
  assert(s.errors.length === 3, `expected exactly 3 scaffold errors, got ${s.errors.length}: ${s.errors.join(" | ")}`);
  assert(s.errors.every((e) => e.includes(PLACEHOLDER_ERROR)), "all 3 scaffold errors are unfilled-placeholder errors");
  for (const artifact of ["proposal.md", "tasks.md", "specs/gherkin/spec.md"]) {
    assert(s.errors.some((e) => e.includes(artifact)), `one error must name ${artifact}`);
  }
});

console.log(`\nlibrary-usage: ${pass} passed, ${fail} failed`);
if (failures.length) {
  for (const f of failures) console.error(`  ${f}`);
  process.exitCode = 1;
}
