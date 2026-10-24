#!/usr/bin/env node
// scaffold-honesty — rule 7's scaffold-pin sentence on both law surfaces:
// the RULES_MD source and the rendered store copy.

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const tpl = await import(path.join(REPO, "lib", "templates.mjs"));

const SENTENCE =
  "The scaffold itself is pinned behavior: a change that legitimately edits what a scaffold emits edits the scaffold's smoke pins in the same change (this repo: the S-series round-trip checks in tests/smoke.mjs).";

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
// The law wraps prose at ~75 columns: compare the sentence modulo wrapping.
// Whole-file byte identity between RULES_MD and cdd/rules.md is SSL3's
// contract in tests/acceptance/single-source-law.test.js; this pin only
// asserts the sentence rides rule 7 on both surfaces.
const norm = (s) => s.replace(/\s+/g, " ");

const ruleBlock = (text, id) => {
  const start = text.match(new RegExp(`^${id}\\.`, "m"));
  assert(start, `no rule ${id} in the loop law`);
  const from = start.index;
  const next = text.slice(from + 1).match(/^\d+[a-z]?\./m);
  const block = next ? text.slice(from, from + 1 + next.index) : text.slice(from);
  return block;
};

check("SH1", "rule 7 of the loop law carries the scaffold-pin sentence (source surface)", () => {
  const block = ruleBlock(tpl.RULES_MD, "7");
  assert(norm(block).includes(norm(SENTENCE)), "rule 7 in RULES_MD lacks the scaffold-pin sentence");
});

check("SH2", "the store copy cdd/rules.md carries the same rule-7 block byte-identically", () => {
  const store = fs.readFileSync(path.join(REPO, "cdd", "rules.md"), "utf8");
  assert(ruleBlock(store, "7") === ruleBlock(tpl.RULES_MD, "7"), "rule 7 in cdd/rules.md differs from RULES_MD");
});

console.log(`\nscaffold-honesty: ${pass} pass, ${fail} fail`);
if (fail > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
