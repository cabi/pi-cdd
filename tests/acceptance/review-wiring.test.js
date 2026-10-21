#!/usr/bin/env node
// review-wiring — the three review points (R1/R2/R3 + conditional ADR review)
// are named by every statement of the loop with triggers, skills, modes, and
// findings paths, and reviews are advisory findings, never verdicts (ADR-0008).
// Red until templates.mjs, instructions.mjs, context.mjs, help.mjs, the store
// copy cdd/rules.md, README.md, smoke.mjs, and cdd/decisions/ carry the wiring.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const tpl = await import(path.join(REPO, "lib", "templates.mjs"));
const ctx = await import(path.join(REPO, "lib", "context.mjs"));
const storeMod = await import(path.join(REPO, "lib", "store.mjs"));
const helpMod = await import(path.join(REPO, "lib", "help.mjs"));
const lawMod = await import(path.join(REPO, "lib", "loop-law.mjs"));
const lawPath = path.join(REPO, "scripts", "grammar-law.mjs");
const law = fs.existsSync(lawPath) ? await import(lawPath) : null;

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
  assert(haystack.includes(needle), `${what} lacks "${needle}"`);

// --- the loop law (RULES_MD and its store copy say the same thing) ----------

const rule2a = (text) => {
  const m = text.match(/^2a\..*$/m);
  assert(m, "no rule 2a in the loop law");
  return m[0];
};

const ruleBlock = (text, id) => {
  const start = text.match(new RegExp(`^${id}\\.`, "m"));
  assert(start, `no rule ${id} in the loop law`);
  const from = start.index;
  const next = text.slice(from + 1).match(/^\d+[a-z]?\./m);
  const block = next ? text.slice(from, from + 1 + next.index) : text.slice(from);
  return block.replace(/\s+/g, " ");
};

check("RW1", "rule 2a names R1, R2, R3 and the ADR review with skills, modes, findings paths", () => {
    const r = ruleBlock(tpl.RULES_MD, "2a");
  includes(r, "R1", "rule 2a");
  includes(r, "T1 or T2 YES", "rule 2a");
  includes(r, "cdd-spec-review", "rule 2a");
  includes(r, "proposal mode", "rule 2a");
  includes(r, "r1-proposal-review.md", "rule 2a");
  includes(r, "R2", "rule 2a");
  includes(r, "draft-green", "rule 2a");
  includes(r, "package mode", "rule 2a");
  includes(r, "r2-change-review.md", "rule 2a");
  includes(r, "R3", "rule 2a");
  includes(r, "cdd-code-review", "rule 2a");
  includes(r, "r3-code-review.md", "rule 2a");
  includes(r, "cdd-adr-review", "rule 2a");
  includes(r, "adr-review.md", "rule 2a");
  includes(r, "decision content", "rule 2a");
  includes(r, "Reconfirmed-by", "rule 2a");
});

check("RW2", "rule 2a states the advisory-findings grammar, never verdicts", () => {
    const r = ruleBlock(tpl.RULES_MD, "2a");
  for (const tok of ["blocker", "should", "note", "fixed:", "open", "won't-fix:"]) includes(r, tok, "rule 2a");
  includes(r, "never red or green verdicts", "rule 2a");
  includes(r, "validators", "rule 2a");
  includes(r, "human", "rule 2a");
});

check("RW3", "the rule 2 loop chain places R1 after the proposal, R2 at draft-green, R3 before archive", () => {
  const line = ruleBlock(tpl.RULES_MD, "2");
  includes(line, "R1 after the proposal", "rule 2");
  includes(line, "R2 at draft-green", "rule 2");
  includes(line, "R3 before archive", "rule 2");
});
check("RW4", "rule 2 states the T1–T5 record lands in tasks §2 as the gate runs, before the proposal", () => {
  const line = ruleBlock(tpl.RULES_MD, "2");
  includes(line, "tasks §2", "rule 2");
  includes(line, "as the gate runs", "rule 2");
  includes(line, "before the proposal is drafted", "rule 2");
});

check("RW5", "a fresh store renders the review-aware law and this repo's store copy mirrors it", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rw-"));
  storeMod.initStore(tmp, REPO, { ci: "none", hooks: false });
  const rendered = fs.readFileSync(path.join(tmp, "cdd", "rules.md"), "utf8");
  rule2a(rendered);
  includes(ruleBlock(rendered, "2"), "R2 at draft-green", "rendered store rule 2");
  const repo = fs.readFileSync(path.join(REPO, "cdd", "rules.md"), "utf8");
  rule2a(repo);
  includes(ruleBlock(repo, "2"), "R2 at draft-green", "repo store copy rule 2");
});

// --- ambience: the ambient block and /cdd-help match the law -----------------

check("RW6", "the ambient block names R1, R2, R3 with their triggers and points at the review-points rule", () => {
  const block = ctx.buildAmbientBlock(REPO);
  for (const tok of ["R1", "R2", "R3", "rule 2a", "draft-green"]) includes(block, tok, "ambient block");
  // triggers, not just names — a trigger regression must go red
  includes(block, "R1 after the proposal", "ambient block");
  includes(block, "T1 or T2 YES", "ambient block");
  includes(block, "at draft-green", "ambient block");
  includes(block, "before archive", "ambient block");
});

check("RW7", "the help tip row renders the module's canonical review-point triggers", () => {
  const row = helpMod.HELP_LINES.find((l) => l[0] === "tip" && l[1][0] === "reviews");
  assert(row, "reviews tip row exists");
  assert(JSON.stringify(row[1]) === JSON.stringify(lawMod.helpReviewTip()), "help tip row equals the module render");
  for (const tok of ["R1", "R2", "R3"]) includes(row[1][1], tok, "help tip");
});


// --- templates and instructions ----------------------------------------------

check("RW8", "the proposal scaffold carries the R1 review tail", () => {
  const p = tpl.proposalTemplate("sample-change");
  includes(p, "cdd-spec-review", "proposal scaffold");
  includes(p, "proposal mode", "proposal scaffold");
  includes(p, "r1-proposal-review.md", "proposal scaffold");
  includes(p, "T1 or T2", "proposal scaffold");
  includes(p, "before drafting the delta", "proposal scaffold");
});

check("RW9", "the tasks scaffold places 3.1 Change review before the placeholder implementation task", () => {
  const t = tpl.tasksTemplate("sample-change");
  const review = t.indexOf("3.1 Change review");
  assert(review >= 0, "no 3.1 Change review task in the scaffold");
  const placeholder = t.indexOf("<task>");
  assert(placeholder > review, "placeholder implementation task does not follow 3.1 Change review");
  includes(t, "package mode", "tasks scaffold");
  includes(t, "r2-change-review.md", "tasks scaffold");
  includes(t, "no blocker is open", "tasks scaffold");
});

check("RW16", "the scaffold's 4.2 line states the precise ADR-review trigger", () => {
  const t = tpl.tasksTemplate("sample-change");
  const line = t.split("\n").find((l) => l.includes("4.2 ADR review"));
  assert(line, "no 4.2 ADR review line in the tasks scaffold");
  includes(line, "decision content", "scaffold 4.2");
  includes(line, "Reconfirmed-by", "scaffold 4.2");
});

check("RW10", "the Close scaffold gates archive on disposed R3 and ADR reviews", () => {
  const t = tpl.tasksTemplate("sample-change");
  const close = t.indexOf("## 4. Close");
  assert(close >= 0, "no Close section in the scaffold");
  const tail = t.slice(close);
  const codeReview = tail.indexOf("cdd-code-review");
  const adrReview = tail.indexOf("cdd-adr-review");
  const validate = tail.indexOf("cdd validate strict green");
  const archive = tail.indexOf("Archive");
  assert(codeReview >= 0 && adrReview >= 0, "Close lacks the review tasks");
  includes(tail, "r3-code-review.md", "Close section");
  includes(tail, "adr-review.md", "Close section");
  assert(codeReview < validate && adrReview < validate, "review tasks must precede validate-and-guard");
  assert(validate < archive, "validate-and-guard must precede archive");
});

check("RW11", "the tasks instruction explains the review clauses and the advisory rule", () => {
  const t = tpl.tasksTemplate("sample-change");
  includes(t, "advisory findings", "tasks scaffold instruction");
  includes(t, "verdict", "tasks scaffold instruction");
  includes(t, "draft-green", "tasks scaffold instruction");
});

// --- ADR-0008 and the guard's acceptance of the draft status ------------------

check("RW12", "ADR-0008 exists with a resolved status stating the advisory-findings decision", () => {
  const dir = path.join(REPO, "cdd", "decisions");
  const files = fs.readdirSync(dir).filter((f) => f.startsWith("0008"));
  assert(files.length === 1, `expected exactly 1 ADR-0008 file, found ${files.length}`);
  const body = fs.readFileSync(path.join(dir, files[0]), "utf8");
  assert(/^status:\s*accepted$/m.test(body), "ADR-0008 frontmatter status is not accepted (resolved by the human sponsor at Close)");
  includes(body.toLowerCase(), "advisory findings", "ADR-0008 body");
  includes(body.toLowerCase(), "never verdicts", "ADR-0008 body");
});

check("RW13", "the drift guard holds no violation naming ADR-0008 for its draft status", () => {
  const r = spawnSync(process.execPath, [path.join(REPO, "scripts", "spec-drift.mjs")], {
    cwd: REPO,
    encoding: "utf8",
  });
  const out = `${r.stdout || ""}\n${r.stderr || ""}`;
  assert(!/\[A[012]\][^\n]*0008/.test(out), `guard flags ADR-0008:\n${out.match(/\[A[012]\][^\n]*0008[^\n]*/g)?.join("\n")}`);
});

// --- README and smoke ---------------------------------------------------------

check("RW14", "the README driving-the-loop table names R1, R2, R3 with their triggers", () => {
  const readme = fs.readFileSync(path.join(REPO, "README.md"), "utf8");
  for (const tok of ["R1", "R2", "R3"]) includes(readme, tok, "README");
  includes(readme, "after the proposal", "README");
  includes(readme, "T1 or T2 YES", "README");
  includes(readme, "at draft-green", "README");
  includes(readme, "before archive", "README");
});

check("RW15", "the smoke suite pins the review scaffolds (S34)", () => {
  const smoke = fs.readFileSync(path.join(REPO, "tests", "smoke.mjs"), "utf8");
  includes(smoke, '"S34"', "smoke suite");
  includes(smoke, "3.1 Change review", "smoke suite");
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) {
  console.log(failures.join("\n"));
  process.exit(1);
}
