#!/usr/bin/env node
// law-done-when — rule 3 of the loop law states the Done-When contract the
// proposal scaffold instruction and the validate door already carry:
// Done-When lines of 1-5 completion criteria, each an observable check.
// Red until lawRule3() exists in lib/loop-law.mjs, until the rendered law
// text interpolates it, and until the store mirror cdd/rules.md carries the
// same rule-3 text (PF-17: the law said "one Done-When: line" while the
// door enforces 1..5).

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const tpl = await import(path.join(REPO, "lib", "templates.mjs"));
// The single source for the rule-3 text. At RED time the export does not
// exist yet: the missing-export failure below IS the first red stage
// (task 3.3 adds lawRule3 to the module).
const law = await import(path.join(REPO, "lib", "loop-law.mjs"));

let pass = 0;
let fail = 0;
const failures = [];
async function check(id, name, fn) {
  try {
    await fn();
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
const norm = (s) => s.replace(/\s+/g, " ");

const ruleBlock = (text, id) => {
  const start = text.match(new RegExp(`^${id}\\.`, "m"));
  assert(start, `no rule ${id} in the text`);
  const from = start.index;
  const next = text.slice(from + 1).match(/^\d+[a-z]?\./m);
  const block = next ? text.slice(from, from + 1 + next.index) : text.slice(from);
  // raw on purpose: LDW2 pins the mirror slice byte-identically (R3 spec F1)
  return block;
};

const OLD_WORDING = "one `Done-When:` line";

// --- LDW1: the rendered law text states the 1-5 contract ----------------------

await check("LDW1", "rendered rule 3 states Done-When lines of 1-5 observable criteria", () => {
  const r3 = norm(ruleBlock(tpl.RULES_MD, "3"));
  assert(r3.includes("1-5 completion criteria"), `rule 3 lacks the 1-5 bound: ${r3}`);
  assert(r3.includes("observable check"), `rule 3 lacks the observable-check phrasing: ${r3}`);
  assert(!r3.includes(OLD_WORDING), `rule 3 still carries the old wording "${OLD_WORDING}": ${r3}`);
});

// --- LDW2: the store mirror carries the identical contract --------------------

await check("LDW2", "store copy cdd/rules.md carries the same rule-3 text byte-identically", () => {
  const store = fs.readFileSync(path.join(REPO, "cdd", "rules.md"), "utf8");
  const r3render = ruleBlock(tpl.RULES_MD, "3");
  const r3store = ruleBlock(store, "3");
  assert(r3store === r3render, "cdd/rules.md rule 3 differs from the rendered rule 3 (byte-identical slice)");
  const n = norm(r3store);
  assert(n.includes("1-5 completion criteria"), "cdd/rules.md rule 3 lacks the 1-5 bound");
  assert(!n.includes(OLD_WORDING), `cdd/rules.md rule 3 still carries the old wording`);
});

// --- LDW4: the law, the scaffold instruction, and the door agree on the bound --

await check("LDW4", "instruction and validate door carry the same 1-5 bound as rule 3", async () => {
  const instr = await import(path.join(REPO, "lib", "instructions.mjs"));
  assert(
    String(instr.PROPOSAL_INSTRUCTION).includes("Done-When: 1-5 completion criteria"),
    "the scaffold instruction no longer states the 1-5 completion-criteria bound"
  );
  // the real door on a scratch change: 6 Done-When lines trip the cap, 5 do not
  const val = await import(path.join(REPO, "lib", "validate.mjs"));
  const storeLib = await import(path.join(REPO, "lib", "store.mjs"));
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-ldw4-"));
  fs.symlinkSync(path.join(REPO, "node_modules"), path.join(root, "node_modules"), "dir");
  storeLib.initStore(root, REPO, {});
  fs.mkdirSync(path.join(root, "cdd", "changes", "add-dw", "specs", "x"), { recursive: true });
  fs.mkdirSync(path.join(root, "tests", "acceptance"), { recursive: true });
  fs.writeFileSync(path.join(root, "tests", "acceptance", "dw-x.test.js"), "// pin\n");
  const proposal = (n) =>
    `# add-dw\n\n## Why\n\nNeed x.\n\n## What Changes\n\n- x\n\n## Solutions Considered\n\n- stdlib covers it\n\n## Non-Goals\n\n- none beyond scope\n\n${Array.from({ length: n }, (_, i) => `Done-When: criterion ${i + 1} is observable`).join("\n")}\nCode: dw.js\n`;
  fs.writeFileSync(
    path.join(root, "cdd", "changes", "add-dw", "specs", "x", "spec.md"),
    `## ADDED Requirements\n\n### Requirement: DW1\n\nX.\n\n\`\`\`gherkin\nFeature: DW1\n\nScenario: dw prints\n  Given dw\n  When dw runs\n  Then y is printed\n  # Verified by: tests/acceptance/dw-x.test.js\n\`\`\`\n`
  );
  fs.writeFileSync(
    path.join(root, "cdd", "changes", "add-dw", "tasks.md"),
    `# Tasks — add-dw\n\n## 1. Context\n\n- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs\n\n## 2. Design\n\n- [x] 2.1 Design gate: single scenario, one task — no split needed\n\n## 3. Implementation\n\n- [x] 3.1 write x — verify by tests/acceptance/dw-x.test.js\n\n## Done When Traceability\n\n| d | 3.1 |\n\n## 4. Close\n\n- [ ] 4.1 cdd validate strict green, guard green\n\n- [ ] 4.2 Archive — pair-commit: feature commit, then archive commit\n`
  );
  fs.writeFileSync(path.join(root, "cdd", "changes", "add-dw", "proposal.md"), proposal(6));
  const six = val.validateChange(root, "add-dw", "draft");
  assert(
    six.errors.some((e) => e.includes("Done-When criteria (max 5")),
    `6 Done-When lines did not trip the door cap: ${JSON.stringify(six.errors)}`
  );
  fs.writeFileSync(path.join(root, "cdd", "changes", "add-dw", "proposal.md"), proposal(5));
  const five = val.validateChange(root, "add-dw", "draft");
  assert(
    !five.errors.some((e) => e.includes("Done-When criteria (max 5") || e.includes('missing "Done-When:"')),
    `5 Done-When lines must satisfy the bound: ${JSON.stringify(five.errors)}`
  );
});

// --- LDW3: the text renders from the loop-law module --------------------------

await check("LDW3", "rule 3 renders verbatim from lawRule3() in lib/loop-law.mjs", () => {
  assert(typeof law.lawRule3 === "function", "lib/loop-law.mjs does not export lawRule3()");
  const frag = law.lawRule3();
  assert(typeof frag === "string" && frag.length > 0, "lawRule3() returns no text");
  assert(tpl.RULES_MD.includes(frag), "the law text does not interpolate lawRule3() verbatim");
  const n = norm(frag);
  assert(n.includes("1-5 completion criteria"), `lawRule3() lacks the 1-5 bound: ${n}`);
  assert(n.includes("observable check"), `lawRule3() lacks the observable-check phrasing: ${n}`);
  assert(!n.includes(OLD_WORDING), `lawRule3() still carries the old wording`);
});

// --- summary ------------------------------------------------------------------

console.log(`\nlaw-done-when: ${pass} pass, ${fail} fail`);
if (failures.length) {
  console.log(failures.map((f) => `  ${f}`).join("\n"));
  process.exit(1);
}
