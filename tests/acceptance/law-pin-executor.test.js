#!/usr/bin/env node
// law-pin-executor.test.js — pins the loop law's executor sentence
// (delta: gherkin capability, change acceptance-wiring): rule 7 (test-first)
// names the executor of Verified-by pins — `npm test`, whose `node --test`
// sweep executes every tests/acceptance/*.test.js suite, the same entrypoint
// CI runs. The sentence is authored once in lib/templates.mjs's RULES_MD and
// carried identically by the store copy cdd/rules.md. Red until the law
// carries the sentence. (File-level byte-identity of the whole law is SSL3's
// contract in single-source-law.test.js.)

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const tpl = await import(path.join(REPO, "lib", "templates.mjs"));
const store = fs.readFileSync(path.join(REPO, "cdd", "rules.md"), "utf8");

// The sentence, exact wording (tasks §2 design point 2). Line wrapping in the
// law is irrelevant: both surfaces are whitespace-normalized before matching.
const SENTENCE =
  "Pins run with the project's tests: `npm test` runs the `node --test` sweep, " +
  "which executes every `tests/acceptance/*.test.js` suite, and CI runs the same " +
  "entrypoint — a subtask is verified by that command green.";

const norm = (s) => s.replace(/\s+/g, " ");
const ruleBlock = (text, id) => {
  const start = text.match(new RegExp(`^${id}\\.`, "m"));
  if (!start) return null;
  const from = start.index;
  const next = text.slice(from + 1).match(/^\d+[a-z]?\./m);
  return norm(next ? text.slice(from, from + 1 + next.index) : text.slice(from));
};

let failed = 0;
const check = (id, name, ok, detail = "") => {
  console.log(`${ok ? "ok  " : "FAIL"} ${id} ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failed++;
};

const srcRule = ruleBlock(tpl.RULES_MD, "7");
const storeRule = ruleBlock(store, "7");

// LAW1: rule 7 of the law source names the executor
check(
  "LAW1",
  "RULES_MD rule 7 carries the executor sentence",
  srcRule !== null && srcRule.includes(norm(SENTENCE)),
  srcRule === null ? "no rule 7 in RULES_MD" : "sentence absent from rule 7"
);

// LAW2: the store copy carries it with identical wording
check(
  "LAW2",
  "cdd/rules.md rule 7 carries the same sentence",
  storeRule !== null && storeRule.includes(norm(SENTENCE)),
  storeRule === null ? "no rule 7 in cdd/rules.md" : "sentence absent from rule 7"
);

// LAW3: exactly 1 home — the sentence occurs once per surface, not duplicated
const count = (text) => norm(text).split(norm(SENTENCE)).length - 1;
check(
  "LAW3",
  "the sentence appears exactly once in each surface",
  count(tpl.RULES_MD) === 1 && count(store) === 1,
  `RULES_MD ×${count(tpl.RULES_MD)}, cdd/rules.md ×${count(store)}`
);

process.exit(failed ? 1 : 0);
