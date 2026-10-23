#!/usr/bin/env node
// design-docs — the design-document wiring: rule 2c (trigger, shape choice,
// four sections, one diagram, level convention, ADR layering) is defined
// once in lib/loop-law.mjs and rendered through RULES_MD into the store
// mirror cdd/rules.md; the design.md scaffold (designTemplate) pins the
// four-section contract with exactly one kind-carrying mermaid flowchart;
// the tasks scaffold's design-gate line carries the T2/T4 shape clause; the
// R1/R2 briefs and the cdd-spec-review SKILL.md carry design.md in their
// review objects. Red until lawRule2c/designTemplate exist, the clause and
// object lines land, and the mirror is regenerated.

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const tpl = await import(path.join(REPO, "lib", "templates.mjs"));
// The module under test. At RED time lawRule2c does not exist yet: the
// typeof check below IS the first red stage (task 3.3 adds the rule).
const law = await import(path.join(REPO, "lib", "loop-law.mjs"));

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
const includes = (haystack, needle, what) =>
  assert(String(haystack).includes(needle), `${what} missing "${needle}"`);
const flat = (s) => String(s).replace(/\s+/g, " ");
const excludes = (haystack, needle, what) =>
  assert(!String(haystack).includes(needle), `${what} must not contain "${needle}"`);

// --- rule 2c: the law ------------------------------------------------------

const rule2c = typeof law.lawRule2c === "function" ? law.lawRule2c() : null;

check("DD1", "lawRule2c is exported from lib/loop-law.mjs", () => {
  assert(typeof law.lawRule2c === "function", "lawRule2c is not exported");
  assert(rule2c && rule2c.startsWith("2c. **"), "rule 2c does not start with its heading");
});

check("DD2", "rule 2c states the trigger and the shape choice", () => {
  includes(flat(rule2c), "T2 (architecture bet)", "rule 2c");
  includes(flat(rule2c), "T4 (invariant risk)", "rule 2c");
  includes(flat(rule2c), "design.md", "rule 2c");
  includes(flat(rule2c), "sibling of the proposal", "rule 2c");
  includes(flat(rule2c), "keeps the short design note above the tick in the tasks file", "rule 2c");
});

check("DD3", "rule 2c names the four mandatory sections", () => {
  for (const s of ["Level", "Diagram", "Boundaries", "Alternatives"]) {
    includes(flat(rule2c), s, "rule 2c");
  }
});

check("DD4", "rule 2c pins exactly one diagram with C4-in-flowchart conventions", () => {
  includes(flat(rule2c), "exactly 1 mermaid flowchart", "rule 2c");
  includes(flat(rule2c), "flowchart syntax", "rule 2c");
  includes(flat(rule2c), "element kind", "rule 2c");
  includes(flat(rule2c), "never a native C4 diagram type", "rule 2c");
});

check("DD5", "rule 2c states the level convention and bans the Code level", () => {
  includes(flat(rule2c), "Context, Container, or Component", "rule 2c");
  includes(flat(rule2c), "Code level is banned", "rule 2c");
});

check("DD6", "rule 2c states the ADR layering", () => {
  includes(flat(rule2c), "ADR", "rule 2c");
  includes(flat(rule2c), "archived with the change", "rule 2c");
  includes(flat(rule2c), "no diagram copy", "rule 2c");
});

check("DD7", "rule 2c stays adopter-generic (C4 vocabulary only)", () => {
  for (const banned of ["cdd/", "pi-cdd", "zai", "spec-drift"]) {
    excludes(rule2c, banned, "rule 2c");
  }
});

check("DD8", "RULES_MD renders rule 2c after 2b and before rule 3", () => {
  includes(tpl.RULES_MD, "2c. **", "RULES_MD");
  const i2a = tpl.RULES_MD.indexOf("2a. **");
  const i2b = tpl.RULES_MD.indexOf("2b. **");
  const i2c = tpl.RULES_MD.indexOf("2c. **");
  const i3 = tpl.RULES_MD.indexOf("\n3. **");
  assert(i2a !== -1 && i2b !== -1 && i2c !== -1 && i3 !== -1, "rule headings not all present");
  assert(i2a < i2b && i2b < i2c && i2c < i3, "rule 2c is not between 2b and 3");
  assert(tpl.RULES_MD.includes(rule2c), "RULES_MD does not render lawRule2c() verbatim");
});

check("DD9", "the store mirror cdd/rules.md carries the same rule 2c", () => {
  const store = fs.readFileSync(path.join(REPO, "cdd", "rules.md"), "utf8");
  includes(store, "2c. **", "cdd/rules.md");
  assert(store.includes(rule2c), "cdd/rules.md does not carry rule 2c verbatim — regenerate the mirror from RULES_MD");
});

// --- the scaffold ----------------------------------------------------------

check("DD10", "tasks scaffold's design-gate line carries the T2/T4 shape clause", () => {
  const t = tpl.tasksTemplate("demo");
  for (const trigger of ["T1 cross-cutting", "T2 architecture bet", "T3 shared seam", "T4 invariant risk", "T5 parallel work"]) {
    includes(t, trigger, "tasks scaffold");
  }
  includes(t, "`design.md` at the change root (rule 2c", "tasks scaffold");
  includes(t, "rule 2c", "tasks scaffold");
  includes(t, "C4 level", "tasks scaffold");
});

check("DD11", "designTemplate renders exactly the four sections in order", () => {
  assert(typeof tpl.designTemplate === "function", "designTemplate is not exported");
  const d = tpl.designTemplate("demo");
  const headings = [...d.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  assert(
    JSON.stringify(headings) === JSON.stringify(["Level", "Diagram", "Boundaries", "Alternatives"]),
    `section headings are ${JSON.stringify(headings)}`
  );
});

check("DD12", "the Diagram section carries exactly one kind-carrying flowchart", () => {
  const d = tpl.designTemplate("demo");
  const fences = [...d.matchAll(/```mermaid/g)].length;
  assert(fences === 1, `found ${fences} mermaid fences, expected exactly 1`);
  includes(d, "flowchart TD", "designTemplate");
  includes(d, "Container: ", "designTemplate");
  includes(d, "Component: ", "designTemplate");
  for (const native of ["C4Context", "C4Container", "C4Component", "C4Dynamic"]) {
    excludes(d, native, "designTemplate");
  }
});

check("DD13", "the Level section states the level contract and bans Code", () => {
  const d = tpl.designTemplate("demo");
  includes(d, "Context, Container, or Component", "designTemplate");
  includes(d, "banned", "designTemplate");
  includes(d, "rots", "designTemplate");
});

check("DD14", "Boundaries and Alternatives carry their contracts", () => {
  const d = tpl.designTemplate("demo");
  includes(d, "must not know", "designTemplate");
  includes(d, "why not", "designTemplate");
});

check("DD15", "designTemplate stays adopter-generic", () => {
  const d = tpl.designTemplate("demo");
  for (const banned of ["cdd/", "pi-cdd", "zai"]) {
    excludes(d, banned, "designTemplate");
  }
});

// --- the briefs and the skill ---------------------------------------------

check("DD16", "brief-r1.md names the proposal + design.md as the review object", () => {
  const b = fs.readFileSync(path.join(REPO, "skills", "cdd-spec-review", "brief-r1.md"), "utf8");
  includes(b, "proposal.md` + `cdd/changes/<change-name>/design.md`", "brief-r1.md");
  includes(b, "when the design gate produced one", "brief-r1.md");
});

check("DD17", "brief-r2.md includes design.md with the design-alignment check", () => {
  const b = fs.readFileSync(path.join(REPO, "skills", "cdd-spec-review", "brief-r2.md"), "utf8");
  includes(b, "`proposal.md`, `design.md`", "brief-r2.md");
  includes(b, "boxes map to real", "brief-r2.md");
  includes(b, "level claim matches the stated risk", "brief-r2.md");
  includes(b, "hold no contradictions", "brief-r2.md");
});

check("DD18", "cdd-spec-review SKILL.md names design.md in its object lines", () => {
  const s = fs.readFileSync(path.join(REPO, "skills", "cdd-spec-review", "SKILL.md"), "utf8");
  includes(s, "proposal, design.md (when the design gate produced one), spec delta, tasks", "SKILL.md description");
  includes(s, "`proposal.md`, `design.md` (when the gate produced one), `tasks.md`", "SKILL.md package-mode read line");
  includes(s, "`cdd/changes/<name>/proposal.md` and `design.md` (when the gate produced one)", "SKILL.md proposal-mode read line");
});

// ---------------------------------------------------------------------------

console.log("=".repeat(74));
if (fail > 0) {
  console.log(`${pass} passed, ${fail} failed`);
  process.exit(1);
} else {
  console.log(`${pass}/${pass} passed`);
}
