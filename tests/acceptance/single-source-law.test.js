#!/usr/bin/env node
// single-source-law — the loop-law facts (review points with triggers,
// skills, modes, findings paths, and the advisory-findings grammar) are
// defined in exactly 1 module, lib/loop-law.mjs; every statement surface
// renders them from it; the README row carries the canonical triggers plus
// a pointer to rule 2a; ADR-0009 records the decision. Red until the module
// exists (module-resolution error) and until every surface derives from it.

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const tpl = await import(path.join(REPO, "lib", "templates.mjs"));
const ins = await import(path.join(REPO, "lib", "instructions.mjs"));
const ctx = await import(path.join(REPO, "lib", "context.mjs"));
const helpMod = await import(path.join(REPO, "lib", "help.mjs"));
// The module under test. At RED time it does not exist yet: the resolution
// error below IS the first red stage (task 3.3 creates the module).
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
  assert(haystack.includes(needle), `${what} lacks "${needle}"`);
const norm = (s) => s.replace(/\s+/g, " ");

const ruleBlock = (text, id) => {
  const start = text.match(new RegExp(`^${id}\\.`, "m"));
  assert(start, `no rule ${id} in the loop law`);
  const from = start.index;
  const next = text.slice(from + 1).match(/^\d+[a-z]?\./m);
  const block = next ? text.slice(from, from + 1 + next.index) : text.slice(from);
  return block.replace(/\s+/g, " ");
};

const rp = (id) => {
  const r = law.REVIEW_POINTS.find((p) => p.id === id);
  assert(r, `no review point ${id} in the module`);
  return r;
};

// --- the module holds the canonical facts --------------------------------------

check("SSL1", "the module defines exactly the 4 canonical review points and the findings grammar", () => {
  assert(Array.isArray(law.REVIEW_POINTS), "REVIEW_POINTS is not an array");
  assert(law.REVIEW_POINTS.length === 4, `expected 4 review points, found ${law.REVIEW_POINTS.length}`);
  assert(law.REVIEW_POINTS.map((p) => p.id).join(",") === "R1,R2,R3,ADR", "review-point ids are not R1,R2,R3,ADR");
  const r1 = rp("R1"), r2 = rp("R2"), r3 = rp("R3"), adr = rp("ADR");
  assert(r1.skill === "cdd-spec-review" && r1.mode === "proposal" && r1.findings === "reviews/r1-proposal-review.md", "R1 facts diverge");
  assert(r2.skill === "cdd-spec-review" && r2.mode === "package" && r2.findings === "reviews/r2-change-review.md", "R2 facts diverge");
  assert(r3.skill === "cdd-code-review" && r3.findingsStandards === "reviews/r3-standards-code-review.md" && r3.findingsSpec === "reviews/r3-spec-code-review.md" && !("findings" in r3), "R3 facts diverge");
  assert(adr.skill === "cdd-adr-review" && adr.findings === "reviews/adr-review.md", "ADR facts diverge");
  assert(norm(r1.trigger) === "after the proposal, if the design gate answered T1 or T2 YES", `R1 trigger diverges: ${r1.trigger}`);
  assert(norm(r2.trigger) === "always, at draft-green, before the first implementation task", `R2 trigger diverges: ${r2.trigger}`);
  assert(norm(r3.trigger) === "at Close before archive", `R3 trigger diverges: ${r3.trigger}`);
  assert(norm(adr.trigger) === "if the change drafted an ADR or amended one's decision content — a Reconfirmed-by paragraph or a typo fix does not count", `ADR trigger diverges: ${adr.trigger}`);
  const g = law.FINDINGS_GRAMMAR;
  assert(Array.isArray(g.severities) && g.severities.join(",") === "blocker,should,note", "severities diverge");
  assert(Array.isArray(g.dispositions) && g.dispositions.join(",") === "fixed:,open,won't-fix:", "dispositions diverge");
  assert(norm(r1.triggerCompact) === "after the proposal, if T1 or T2 YES", `R1 compact trigger diverges: ${r1.triggerCompact}`);
  assert(norm(r2.triggerCompact) === "always, at draft-green", `R2 compact trigger diverges: ${r2.triggerCompact}`);
  assert(norm(r3.triggerCompact) === "at Close before archive", `R3 compact trigger diverges: ${r3.triggerCompact}`);
  assert(norm(adr.triggerCompact) === "if ADR decision content was drafted or amended", `ADR compact trigger diverges: ${adr.triggerCompact}`);
  assert(norm(r1.trigger).endsWith("T1 or T2 YES") && norm(r1.triggerCompact).endsWith("T1 or T2 YES"), "R1 compact trigger loses the T1 or T2 anchor");
  assert(norm(r2.trigger).startsWith(norm(r2.triggerCompact)), "R2 compact trigger is not a prefix of the normative trigger");
  assert(r3.triggerCompact === r3.trigger, "R3 compact trigger diverges from the normative trigger");
});

// --- the law text renders from the module and stays byte-identical --------------

check("SSL2b", "rule 2a states the precise ADR trigger and the one decisions home", () => {
  const r = ruleBlock(tpl.RULES_MD, "2a");
  includes(r, "decision content", "rule 2a");
  includes(r, "Reconfirmed-by paragraph", "rule 2a");
  includes(r, "typo fix does not count", "rule 2a");
  includes(r, "Every ADR lives in `cdd/decisions/` — 0001–0007 the product decisions, 0008 and later the loop decisions — there is no second decisions directory", "rule 2a");
  assert(!r.includes("root decisions"), "rule 2a still names the root decisions directory");
  assert(!r.includes("two decisions directories"), "rule 2a still describes the split");
});

check("SSL2", "RULES_MD rules 2/2a are the module's rendered fragments verbatim", () => {
  includes(tpl.RULES_MD, law.lawRule2(), "RULES_MD");
  includes(tpl.RULES_MD, law.lawRule2a(), "RULES_MD");
  const r = ruleBlock(tpl.RULES_MD, "2a");
  for (const p of law.REVIEW_POINTS) {
    includes(r, p.skill, "rule 2a");
    const files = p.findings ? [p.findings] : [p.findingsStandards, p.findingsSpec];
    for (const f of files) includes(r, path.basename(f), "rule 2a");
    if (p.mode) includes(r, `${p.mode} mode`, "rule 2a");
  }
  includes(r, norm(rp("R1").trigger), "rule 2a");
  includes(r, "always, at draft-green", "rule 2a");
  includes(r, "before the first implementation task", "rule 2a");
  includes(r, norm(rp("R3").trigger), "rule 2a");
  includes(r, norm(rp("ADR").trigger), "rule 2a");
  includes(r, law.FINDINGS_GRAMMAR.dispositions.join("/"), "rule 2a");
  includes(r, norm(law.FINDINGS_GRAMMAR.neverVerdicts), "rule 2a");
});

check("SSL3", "the law text is byte-identical to the store copy cdd/rules.md", () => {
  const store = fs.readFileSync(path.join(REPO, "cdd", "rules.md"), "utf8");
  assert(store === tpl.RULES_MD, "cdd/rules.md is not byte-identical to RULES_MD");
});

// --- every other surface renders the module's facts -----------------------------

check("SSL4", "the proposal and tasks instructions interpolate the module's facts", () => {
  const p = ins.PROPOSAL_INSTRUCTION;
  const r1 = rp("R1");
  includes(p, r1.skill, "proposal instruction");
  includes(p, `in ${r1.mode} mode`, "proposal instruction");
  includes(p, path.basename(r1.findings), "proposal instruction");
  includes(p, "answered T1 or T2 YES", "proposal instruction");
  includes(p, "advisory findings, never verdicts", "proposal instruction");
  const t = ins.TASKS_INSTRUCTION;
  for (const p2 of [rp("R2"), rp("R3"), rp("ADR")]) {
    includes(t, p2.skill, "tasks instruction");
    const files = p2.findings ? [p2.findings] : [p2.findingsStandards, p2.findingsSpec];
    for (const f of files) includes(t, path.basename(f), "tasks instruction");
  }
  includes(t, `in ${rp("R2").mode} mode`, "tasks instruction");
  includes(t, "before the first implementation task", "tasks instruction");
  includes(t, "before archive", "tasks instruction");
});

check("SSL5", "the ambient block renders the module's review-points sentence", () => {
  const block = ctx.buildAmbientBlock(REPO);
  includes(block, law.ambientLoopLine(), "ambient block");
  includes(block, law.ambientReviewPoints(), "ambient block");
  for (const p of [rp("R1"), rp("R2"), rp("R3")]) includes(norm(block), norm(p.triggerCompact), "ambient block");
});

check("SSL6", "the help tip renders the module's canonical triggers", () => {
  const tip = law.helpReviewTip();
  assert(Array.isArray(tip) && tip.length === 3, "helpReviewTip does not return the 3 tip cells");
  const row = helpMod.HELP_LINES.find((l) => Array.isArray(l[1]) && l[1][0] === "reviews");
  assert(row, "no reviews tip row in HELP_LINES");
  assert(row[1].join("\n") === tip.join("\n"), "help tip row is not the module's rendered tip");
  const text = helpMod.helpText();
  for (const p of [rp("R1"), rp("R2"), rp("R3")]) includes(norm(text), norm(p.triggerCompact), "help text");
});

check("SSL7", "the README review-points row names the canonical triggers and points at rule 2a only", () => {
  const readme = fs.readFileSync(path.join(REPO, "README.md"), "utf8");
  const row = readme.split("\n").find((l) => l.startsWith("|") && l.includes("review points"));
  assert(row, "no review-points row in the README driving table");
  for (const tok of ["R1", "R2", "R3", "cdd/rules.md", "rule 2a"]) includes(row, tok, "README review-points row");
  for (const p of [rp("R1"), rp("R2"), rp("R3")]) includes(norm(row), norm(p.trigger), "README review-points row");
  for (const banned of ["cdd-spec-review", "cdd-code-review", "cdd-adr-review", "proposal mode", "package mode", "reviews/"]) {
    assert(!row.includes(banned), `README review-points row restates "${banned}" — pointer form broken`);
  }
});

// --- ADR-0009 and the guard ------------------------------------------------------

check("SSL8", "ADR-0009 records the single-source decision with status draft or accepted", () => {
  const dir = path.join(REPO, "cdd", "decisions");
  const files = fs.readdirSync(dir).filter((f) => f.startsWith("0009"));
  assert(files.length === 1, `expected exactly 1 ADR-0009 file, found ${files.length}`);
  const body = fs.readFileSync(path.join(dir, files[0]), "utf8");
  assert(/^status:\s*(draft|accepted)\s*$/m.test(body), "ADR-0009 frontmatter status is neither draft nor accepted");
  const lower = body.toLowerCase();
  includes(lower, "loop-law.mjs", "ADR-0009 body");
  includes(lower, "single-sourc", "ADR-0009 body");
  includes(lower, "mirror", "ADR-0009 body");
  includes(lower, "generator", "ADR-0009 body");
  includes(lower, "pointer-only", "ADR-0009 body");
});

check("SSL9", "the drift guard holds no violation naming ADR-0009", () => {
  const r = spawnSync(process.execPath, [path.join(REPO, "scripts", "spec-drift.mjs")], {
    cwd: REPO,
    encoding: "utf8",
  });
  const out = `${r.stdout || ""}\n${r.stderr || ""}`;
  assert(!/\[A[012]\][^\n]*0009/.test(out), `guard flags ADR-0009:\n${out.match(/\[A[012]\][^\n]*0009[^\n]*/g)?.join("\n")}`);
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) {
  console.log(failures.join("\n"));
  process.exit(1);
}
