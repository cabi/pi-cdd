#!/usr/bin/env node
// r3-findings — the per-axis R3 findings wiring: the loop law's R3 review
// point carries one findings path per axis (findingsStandards /
// findingsSpec) and rule 2a renders both; the store mirror cdd/rules.md
// carries the same wording; the tasks Close scaffold and its instruction
// name two per-axis code-review tasks; each R3 brief names only its own
// findings file; the cdd-code-review charter names both paths; the
// proposal scaffold carries a ## Capabilities section whose placeholder is
// draft-blocking. Red until the law, mirror, briefs, charter, and
// scaffold land.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const tpl = await import(path.join(REPO, "lib", "templates.mjs"));
const law = await import(path.join(REPO, "lib", "loop-law.mjs"));
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
const includes = (haystack, needle, what) =>
  assert(String(haystack).includes(needle), `${what} missing "${needle}"`);
const excludes = (haystack, needle, what) =>
  assert(!String(haystack).includes(needle), `${what} must not contain "${needle}"`);

const STANDARDS = "reviews/r3-standards-code-review.md";
const SPEC = "reviews/r3-spec-code-review.md";
const OLD = "reviews/r3-code-review.md";

/** Extract one numbered rule block ("2a. **" up to the next "\n<N>. **"). */
function ruleBlock(md, num) {
  const start = md.indexOf(`${num}. **`);
  assert(start !== -1, `rule ${num} not found`);
  const rest = md.slice(start + 1);
  const m = rest.match(/\n\d[a-z]?\. \*\*/);
  const end = m ? start + 1 + m.index : md.length;
  return md.slice(start, end);
}

// --- the module and the law -------------------------------------------------

check("RF1", "the R3 review point carries one findings path per axis", () => {
  const r3 = law.reviewPoint("R3");
  assert(r3.findingsStandards === STANDARDS, `R3 findingsStandards diverges: ${r3.findingsStandards}`);
  assert(r3.findingsSpec === SPEC, `R3 findingsSpec diverges: ${r3.findingsSpec}`);
  assert(r3.findings === undefined, "R3 still carries a single findings field");
  const r1 = law.reviewPoint("R1");
  const r2 = law.reviewPoint("R2");
  const adr = law.reviewPoint("ADR");
  assert(r1.findings === "reviews/r1-proposal-review.md", "R1 findings diverge");
  assert(r2.findings === "reviews/r2-change-review.md", "R2 findings diverge");
  assert(adr.findings === "reviews/adr-review.md", "ADR findings diverge");
});

check("RF2", "rule 2a renders both per-axis paths and drops the shared one", () => {
  const r2a = ruleBlock(tpl.RULES_MD, "2a");
  includes(r2a, STANDARDS, "rule 2a");
  includes(r2a, SPEC, "rule 2a");
  excludes(r2a, OLD, "rule 2a");
  excludes(tpl.RULES_MD, OLD, "RULES_MD");
});

check("RF3", "the store mirror cdd/rules.md carries the per-axis paths", () => {
  const store = fs.readFileSync(path.join(REPO, "cdd", "rules.md"), "utf8");
  includes(store, STANDARDS, "cdd/rules.md");
  includes(store, SPEC, "cdd/rules.md");
  excludes(store, OLD, "cdd/rules.md");
});

// --- the tasks scaffold -----------------------------------------------------

check("RF4", "the Close section scaffolds two per-axis code-review tasks", () => {
  const t = tpl.tasksTemplate("demo");
  const close = t.slice(t.indexOf("## 4. Close"));
  const items = [...close.matchAll(/^- \[ \] (4\.\d+) (.*$)/gm)].map((m) => `${m[1]} ${m[2]}`);
  assert(items.length >= 3, `expected at least 3 Close items, found ${items.length}`);
  includes(items[0], "cdd-code-review", "Close 4.1");
  includes(items[0], "standards", "Close 4.1");
  includes(items[0], STANDARDS, "Close 4.1");
  includes(items[1], "cdd-code-review", "Close 4.2");
  includes(items[1], "spec", "Close 4.2");
  includes(items[1], SPEC, "Close 4.2");
  includes(items[2], "cdd-adr-review", "Close 4.3");
  includes(items[2], "reviews/adr-review.md", "Close 4.3");
  excludes(t, OLD, "tasks scaffold");
});

check("RF5", "the tasks instruction names both per-axis findings paths", () => {
  const t = tpl.tasksTemplate("demo");
  const comment = t.slice(0, t.indexOf("-->"));
  includes(comment, STANDARDS, "tasks instruction");
  includes(comment, SPEC, "tasks instruction");
  excludes(comment, OLD, "tasks instruction");
});

// --- the briefs and the charter ---------------------------------------------

check("RF6", "brief-r3-standards.md names only its own findings file", () => {
  const b = fs.readFileSync(path.join(REPO, "skills", "cdd-code-review", "brief-r3-standards.md"), "utf8");
  includes(b, STANDARDS, "brief-r3-standards.md");
  excludes(b, SPEC, "brief-r3-standards.md");
  excludes(b, OLD, "brief-r3-standards.md");
});

check("RF7", "brief-r3-spec.md names only its own findings file", () => {
  const b = fs.readFileSync(path.join(REPO, "skills", "cdd-code-review", "brief-r3-spec.md"), "utf8");
  includes(b, SPEC, "brief-r3-spec.md");
  excludes(b, STANDARDS, "brief-r3-spec.md");
  excludes(b, OLD, "brief-r3-spec.md");
});

check("RF8", "the cdd-code-review charter names both findings paths, one per axis", () => {
  const s = fs.readFileSync(path.join(REPO, "skills", "cdd-code-review", "SKILL.md"), "utf8");
  includes(s, STANDARDS, "SKILL.md");
  includes(s, SPEC, "SKILL.md");
  excludes(s, OLD, "SKILL.md");
});

// --- the proposal scaffold's Capabilities section -----------------------------

check("RF9", "the proposal scaffold carries a ## Capabilities section with its placeholder", () => {
  const p = tpl.proposalTemplate("demo");
  const h = p.indexOf("## Capabilities\n");
  assert(h !== -1, "proposal scaffold missing \"## Capabilities\" heading");
  const ng = p.indexOf("## Non-Goals");
  const dw = p.indexOf("Done-When: <");
  assert(ng !== -1 && ng < h, "## Capabilities must come after ## Non-Goals");
  assert(dw === -1 || h < dw, "## Capabilities must come before the Done-When line");
  includes(p, "<capability>: <spec paths created or modified>", "proposal scaffold Capabilities placeholder");
  includes(p.slice(0, p.indexOf("-->")), "Capabilities:", "proposal instruction");
});

check("RF10", "a kept Capabilities placeholder blocks draft green", () => {
  const fill = (keep) => {
    let p = tpl.proposalTemplate("demo").replace(/<!--[\s\S]*?-->\n\n/, "");
    p = p
      .replace("<One paragraph: the pressure this change answers. If you cannot name the pressure, there is no change.>", "Pressure.")
      .replace("- <What the system will promise differently, as bullets>", "- Promise A.")
      .replace("- <capability>: <solution evaluated — what it covers, why adopted/rejected>", "- gherkin: the existing law render — covers the render loop; adopted.")
      .replace("- <What this change explicitly will NOT do — the scope fence>", "- Nothing else.")
      .replace("Done-When: <one measurable line — how you know the change landed>", "Done-When: node --test x.test.js exits 0")
      .replace("Code: <glob>, <glob>", "Code: lib/foo.mjs");
    if (!keep) p = p.replace("- <capability>: <spec paths created or modified>", "- gherkin: cdd/specs/gherkin/spec.md MODIFY — per-axis paths.");
    return p;
  };
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "r3f-"));
  const dir = path.join(root, "cdd", "changes", "cap-demo");
  fs.mkdirSync(dir, { recursive: true });
  const run = (text) => {
    fs.writeFileSync(path.join(dir, "proposal.md"), text);
    return val.validateChange(root, "cap-demo", "draft");
  };
  const keep = run(fill(true));
  assert(
    keep.errors.some((e) => e === "cap-demo/proposal.md: template placeholders still unfilled"),
    "kept Capabilities placeholder must trigger the placeholder error"
  );
  const filled = run(fill(false));
  assert(
    !filled.errors.some((e) => e.includes("proposal.md: template placeholders still unfilled")),
    "filled Capabilities placeholder must not trigger the placeholder error"
  );
});

// ---------------------------------------------------------------------------

console.log("=".repeat(74));
if (fail > 0) {
  console.log(`${pass} passed, ${fail} failed`);
  process.exit(1);
} else {
  console.log(`${pass}/${pass} passed`);
}
