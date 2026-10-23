#!/usr/bin/env node
// loop-law-hardening — the loop law gains the author-family clause and the
// two-axes-two-sessions clause as rule 2b law (with rule 2a cross-referencing
// the two-sessions requirement where it names R3), the re-tick rule 11a and
// the pin-realism sentence in the test-first rule, ADR-0010 carries the dated
// amendment recording both 2b clauses, the five reviewer brief templates live
// next to their skills with the common skeleton and their MUST-DELIVER
// checklists, and the review-wiring suite holds no dead law reads. Red until
// the law text, mirrors, ADR amendment, briefs, and cleanup land.

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const tpl = await import(path.join(REPO, "lib", "templates.mjs"));
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
  const rest = text.slice(from + start[0].length);
  const next = rest.match(/^\d+[a-z]?\./m);
  const block = next ? text.slice(from, from + start[0].length + next.index) : text.slice(from);
  return block.replace(/\s+/g, " ");
};

const storeRules = () => fs.readFileSync(path.join(REPO, "cdd", "rules.md"), "utf8");
const readAdr = (prefix) => {
  const dir = path.join(REPO, "cdd", "decisions");
  const files = fs.readdirSync(dir).filter((f) => f.startsWith(prefix));
  assert(files.length === 1, `expected exactly 1 ADR-${prefix} file, found ${files.length}`);
  return fs.readFileSync(path.join(dir, files[0]), "utf8");
};

// --- Requirement: Loop law names three review points (modified) ------------------

check("LLH1", "rule 2a cross-references the two-sessions rule where it names R3", () => {
  const r = ruleBlock(storeRules(), "2a");
  includes(r, "two separate cold sessions", "rule 2a");
  includes(norm(r), "rule 2b governs both axes", "rule 2a cross-ref");
  includes(ruleBlock(tpl.RULES_MD, "2a"), "two separate cold sessions", "RULES_MD rule 2a");
  includes(norm(ruleBlock(tpl.RULES_MD, "2a")), "rule 2b governs both axes", "RULES_MD rule 2a cross-ref");
});

// --- Requirement: Reviews run cold (modified) ------------------------------------

check("LLH2", "rule 2b separates author and reviewer families and R3's two axes", () => {
  const store = storeRules();
  const r = ruleBlock(store, "2b");
  includes(r, "same provider or model lineage", "rule 2b");
  includes(r, "stops and asks", "rule 2b");
  includes(r, "rather than silently degrading", "rule 2b");
  includes(r, "two separate cold sessions, each with its own brief", "rule 2b");
  assert(!r.toLowerCase().includes("zai"), "rule 2b names a vendor (must be relative wording)");
  assert(!r.toLowerCase().includes("glm"), "rule 2b names a model (must be relative wording)");
  includes(tpl.RULES_MD, law.lawRule2b(), "RULES_MD");
  includes(store, law.lawRule2b().trim(), "store copy");
});

// --- Requirement: Reviewer-independence ADR is drafted (modified) ----------------

check("LLH3", "ADR-0010 carries the dated rule-2b amendment", () => {
  const adr = readAdr("0010");
  const a = norm(adr).toLowerCase();
  includes(a, "amendment", "ADR-0010");
  includes(a, "family", "ADR-0010");
  includes(a, "two separate cold sessions", "ADR-0010");
  includes(a, "amend", "ADR-0010");
  includes(a, "supersede", "ADR-0010");
  includes(a, "silence", "ADR-0010");
});

// --- Requirement: Re-tick law makes ticks claims, not history --------------------

check("LLH4", "rule 11a states the re-tick duty, door refusal, and archive blocker", () => {
  const store = storeRules();
  const r = ruleBlock(store, "11a");
  includes(r, "Ticks are claims, not history", "rule 11a");
  includes(r, "re-verified after", "rule 11a");
  includes(r, "voids affected ticks the same way", "rule 11a");
  includes(r, "blocker at archive", "rule 11a");
  includes(ruleBlock(tpl.RULES_MD, "11a"), "Ticks are claims, not history", "RULES_MD rule 11a");
});

// --- Requirement: Acceptance pins invoke the real door ---------------------------

check("LLH5", "the test-first rule states the pin-realism clause", () => {
  const r = ruleBlock(storeRules(), "7");
  includes(r, "real door entry point", "rule 7");
  includes(r, "real module import", "rule 7");
  includes(r, "child-process run", "rule 7");
  includes(r, "never a copied fragment", "rule 7");
  includes(r, "sandbox-only pin is a note-level finding at R3", "rule 7");
});

// --- Requirement: Reviewer briefs live next to their skills ----------------------

const BRIEFS = [
  ["cdd-spec-review", "brief-r1.md", "R1", null],
  ["cdd-spec-review", "brief-r2.md", "R2", null],
  ["cdd-code-review", "brief-r3-standards.md", "R3", "standards"],
  ["cdd-code-review", "brief-r3-spec.md", "R3", "spec"],
  ["cdd-adr-review", "brief-adr.md", "ADR", null],
];
const readBrief = (skill, file) =>
  fs.readFileSync(path.join(REPO, "skills", skill, file), "utf8");

check("LLH6", "the five briefs carry the common skeleton", () => {
  for (const [skill, file, point, axis] of BRIEFS) {
    const b = readBrief(skill, file);
    includes(b, "Reviewer session requirements", `${file}`);
    includes(b, "family", `${file}`);
    includes(b, "PI_PROVIDER", `${file}`);
    includes(norm(b), "cold session", `${file} cold-session rule`);
    includes(norm(b), "must differ from the author's model family", `${file} family sentence`);
    includes(b, "pinned", `${file}`);
    includes(b.toLowerCase(), "scope fence", `${file}`);
    includes(b, "blocker", `${file}`);
    includes(b, "won't-fix:", `${file}`);
    includes(b, "advisory", `${file}`);
    const rp = law.reviewPoint(point);
    const outputs = axis === "standards" ? [rp.findingsStandards] : axis === "spec" ? [rp.findingsSpec] : [rp.findings];
    for (const f of outputs) includes(b, f, `${file}`);
  }
  for (const file of ["brief-r3-standards.md", "brief-r3-spec.md"]) {
    includes(norm(readBrief("cdd-code-review", file)), "two separate cold sessions", `${file}`);
  }
});

check("LLH7", "each brief carries its MUST-DELIVER checklist", () => {
  const r1 = readBrief("cdd-spec-review", "brief-r1.md");
  includes(r1, "design gate", "brief-r1");
  includes(r1, "reuse", "brief-r1");
  includes(r1, "Done-When", "brief-r1");
  includes(r1, "Scope fence sane", "brief-r1");
  includes(r1, "capabilit", "brief-r1");
  const r2 = readBrief("cdd-spec-review", "brief-r2.md");
  includes(r2, "coverage", "brief-r2");
  includes(r2, "sponsor", "brief-r2");
  includes(r2, "MODIFIED", "brief-r2");
  includes(r2, "REMOVED", "brief-r2");
  includes(r2, "verify", "brief-r2");
  const std = readBrief("cdd-code-review", "brief-r3-standards.md");
  includes(std, "convention", "brief-r3-standards");
  includes(std, "ADR-governed", "brief-r3-standards");
  includes(std, "smell", "brief-r3-standards");
  includes(std, "guard", "brief-r3-standards");
  const spec = readBrief("cdd-code-review", "brief-r3-spec.md");
  includes(spec, "scenario", "brief-r3-spec");
  includes(spec, "pin", "brief-r3-spec");
  includes(spec, "unsponsored", "brief-r3-spec");
  const adr = readBrief("cdd-adr-review", "brief-adr.md");
  includes(adr, "four-criterion", "brief-adr");
  includes(adr, "form", "brief-adr");
  includes(adr, "amend", "brief-adr");
});

check("LLH8", "the skills point at their briefs", () => {
  for (const skill of ["cdd-spec-review", "cdd-code-review", "cdd-adr-review"]) {
    const s = fs.readFileSync(path.join(REPO, "skills", skill, "SKILL.md"), "utf8");
    assert(s.includes("brief-"), `${skill}/SKILL.md does not point at its briefs`);
  }
});

// --- Requirement: Review wiring holds no dead law reads --------------------------

check("LLH9", "review-wiring holds no dead law binding and stays green", () => {
  const src = fs.readFileSync(path.join(REPO, "tests", "acceptance", "review-wiring.test.js"), "utf8");
  assert(!/\bconst law\b/.test(src), "review-wiring.test.js still declares a `law` binding");
  assert(!src.includes("lawPath"), "review-wiring.test.js still reads lawPath");
  const r = spawnSync(process.execPath, [path.join(REPO, "tests", "acceptance", "review-wiring.test.js")], {
    cwd: REPO,
    encoding: "utf8",
  });
  assert(r.status === 0, `review-wiring suite fails:\n${r.stdout || ""}\n${r.stderr || ""}`);
});

check("LLH10", "ADR-0011 records the rule-11a and pin-realism decisions", () => {
  const adr = readAdr("0011");
  const a = norm(adr).toLowerCase();
  includes(a, "rule 11a", "ADR-0011 decision");
  includes(a, "real door", "ADR-0011 decision");
  includes(a, "re-verified after", "ADR-0011 decision");
  includes(a, "alternatives considered", "ADR-0011 why");
  includes(a, "fragility is the signal", "ADR-0011 form");
  assert(/status: (draft|accepted)/.test(adr), "ADR-0011 status must be draft or accepted");
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) {
  console.log(failures.join("\n"));
  process.exit(1);
}
