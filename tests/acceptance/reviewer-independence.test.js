#!/usr/bin/env node
// reviewer-independence — the loop law states reviewer independence as rule
// 2b (the reviewer is not the author of the artifacts under review; cold
// sub-agent reviews, same-session re-read as the recorded fallback), the
// module owns the facts, every statement surface renders them from it, the
// three bundled skills cite rule 2b and carry the procedure, and ADR-0010
// records the decision with ADR-0008/0009 reconfirm notes. Red until the
// law, surfaces, skills, and ADRs carry the change.

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const tpl = await import(path.join(REPO, "lib", "templates.mjs"));
const ins = await import(path.join(REPO, "lib", "instructions.mjs"));
const ctx = await import(path.join(REPO, "lib", "context.mjs"));
const helpMod = await import(path.join(REPO, "lib", "help.mjs"));
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

const slice2b = (text) => {
  const s = text.indexOf("2b. **");
  assert(s >= 0, "no rule 2b block");
  const re = /^\d+[a-z]?\. \*\*/gm;
  re.lastIndex = s + 4;
  const m = re.exec(text);
  return (m ? text.slice(s, m.index) : text.slice(s)).trim();
};

const skillsDir = path.join(REPO, "skills");
const readSkill = (name) => fs.readFileSync(path.join(skillsDir, name, "SKILL.md"), "utf8");
const readAdr = (prefix) => {
  const dir = path.join(REPO, "cdd", "decisions");
  const files = fs.readdirSync(dir).filter((f) => f.startsWith(prefix));
  assert(files.length === 1, `expected exactly 1 ADR-${prefix} file, found ${files.length}`);
  return fs.readFileSync(path.join(dir, files[0]), "utf8");
};

// --- Requirement: Reviews run cold ------------------------------------------------

check("RI1", "rule 2b states the independence law in the store copy", () => {
  const store = fs.readFileSync(path.join(REPO, "cdd", "rules.md"), "utf8");
  const r = ruleBlock(store, "2b");
  includes(r, norm(law.REVIEWER_INDEPENDENCE.principle), "rule 2b");
  includes(r, law.REVIEWER_INDEPENDENCE.coldForm, "rule 2b");
  includes(r, law.REVIEWER_INDEPENDENCE.fallbackForm, "rule 2b");
  includes(r, "cold sub-agent session", "rule 2b");
  includes(r, "lawful but weaker", "rule 2b");
  includes(r, norm(law.REVIEWER_INDEPENDENCE.recording), "rule 2b");
  includes(tpl.RULES_MD, law.lawRule2b(), "RULES_MD");
});

check("RI2", "the 4 statement surfaces render the independence fact from the module", () => {
  includes(ins.PROPOSAL_INSTRUCTION, law.proposalIndependence(), "proposal instruction");
  includes(ins.TASKS_INSTRUCTION, law.tasksIndependence(), "tasks instruction");
  includes(ctx.buildAmbientBlock(REPO), law.ambientIndependence(), "ambient block");
  includes(helpMod.helpText(), law.helpIndependenceLine(), "help text");
  const row = helpMod.HELP_LINES.find((l) => Array.isArray(l[1]) && l[1][0] === "reviews");
  assert(row, "no reviews tip row in HELP_LINES");
  includes(row[1].join("\n"), law.helpIndependenceLine(), "help reviews tip");
  for (const [what, surface] of [
    ["proposal instruction", ins.PROPOSAL_INSTRUCTION],
    ["tasks instruction", ins.TASKS_INSTRUCTION],
    ["ambient block", ctx.buildAmbientBlock(REPO)],
    ["help text", helpMod.helpText()],
  ]) {
    assert(
      !norm(surface).includes(norm(law.lawRule2b())),
      `${what} restates the rule 2b law text independently`
    );
  }
});

check("RI3", "the skills cite rule 2b and carry the procedure", () => {
  const cold = law.FINDINGS_GRAMMAR.reviewerForms[0];
  for (const name of ["cdd-spec-review", "cdd-code-review", "cdd-adr-review"]) {
    const s = readSkill(name);
    includes(s, "rule 2b", `${name}`);
    includes(s, cold, `${name}`);
    includes(s, "from disk", `${name}`);
    includes(s, "never curated content", `${name}`);
    includes(s, "findings file header", `${name}`);
    includes(s, "justification", `${name}`);
    assert(!norm(s).includes(norm(law.lawRule2b())), `${name} restates the rule 2b law text`);
  }
  includes(readSkill("cdd-code-review"), "both axis sub-agents run cold", "cdd-code-review");
});

check("RI4", "the findings grammar names the 2 reviewer forms", () => {
  const forms = law.FINDINGS_GRAMMAR.reviewerForms;
  assert(Array.isArray(forms), "FINDINGS_GRAMMAR.reviewerForms is not an array");
  assert(forms.length === 2, `expected 2 reviewer forms, found ${forms.length}`);
  assert(forms.join(",") === "cold sub-agent,same-session re-read", `reviewer forms diverge: ${forms.join(",")}`);
  for (const f of forms) includes(norm(law.lawRule2b()), norm(f), "rule 2b render");
});

check("RI5", "rule 2b rendered from the module is byte-identical to the store copy slice", () => {
  const store = fs.readFileSync(path.join(REPO, "cdd", "rules.md"), "utf8");
  const rendered = law.lawRule2b().trim();
  assert(slice2b(tpl.RULES_MD) === rendered, "RULES_MD's rule 2b slice is not the module's render");
  assert(slice2b(store) === rendered, "cdd/rules.md's rule 2b slice is not the module's render");
});

// --- Requirement: Reviewer-independence ADR is drafted -----------------------------

check("RI6", "ADR-0010 states the reviewer-independence decision", () => {
  const body = readAdr("0010");
  assert(/^status:\s*(draft|accepted)\s*$/m.test(body), "ADR-0010 frontmatter status is neither draft nor accepted");
  const lower = norm(body.toLowerCase());
  includes(lower, "rule 2b", "ADR-0010 body");
  includes(lower, "loop law", "ADR-0010 body");
  includes(lower, norm(law.REVIEWER_INDEPENDENCE.principle), "ADR-0010 body");
  includes(lower, "skills-only guidance", "ADR-0010 body");
  includes(lower, "validator enforcement", "ADR-0010 body");
  includes(lower, "hard-ban", "ADR-0010 body");
});

check("RI7", "ADR-0008 and ADR-0009 carry reconfirm notes", () => {
  for (const prefix of ["0008", "0009"]) {
    const lower = readAdr(prefix).toLowerCase();
    includes(lower, "reconfirm", `ADR-${prefix} body`);
    includes(lower, "reviewer-not-author", `ADR-${prefix} body`);
  }
});

check("RI8", "the drift guard holds no violation naming ADR-0010", () => {
  readAdr("0010"); // Given: ADR-0010 exists with frontmatter status draft or accepted
  const r = spawnSync(process.execPath, [path.join(REPO, "scripts", "spec-drift.mjs")], {
    cwd: REPO,
    encoding: "utf8",
  });
  const out = `${r.stdout || ""}\n${r.stderr || ""}`;
  assert(!/\[A[012]\][^\n]*0010/.test(out), `guard flags ADR-0010:\n${out.match(/\[A[012]\][^\n]*0010[^\n]*/g)?.join("\n")}`);
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) {
  console.log(failures.join("\n"));
  process.exit(1);
}
