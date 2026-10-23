#!/usr/bin/env node
// guard-header-index — the drift guard's header documents its check tags on
// one machine-readable `// Checks:` line; the pin extracts the tags the
// script actually emits (issue pushes, tag-producing helpers, tagged
// informational lines) and asserts the documented set equals the emitted
// set in both directions, naming every difference; the synthetic cases
// prove a new undocumented tag and a stale documented tag both fail.

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const GUARD = path.join(REPO, "scripts", "spec-drift.mjs");

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

// --- the index diff -----------------------------------------------------------
// a check tag: one or two capitals, optional digits, optional -suffix
const TAG = "([A-Z]{1,2}[0-9]*(?:-[a-z]+)?)";

export function documentedTags(src) {
  const line = /^\/\/ Checks: (.+)$/m.exec(src);
  if (!line) return null;
  return new Set(line[1].trim().split(/\s+/));
}

export function emittedTags(src) {
  const tags = new Set();
  const patterns = [
    new RegExp(`issues\\.push\\(\\\`\\[${TAG}\\]`, "g"), // a pushed check
    new RegExp(`=>\\s*\\\`\\[${TAG}\\]`, "g"), // a helper that builds a check line
    new RegExp(`console\\.log\\(\\\`[^\\\`\\n]*\\[${TAG}\\]`, "g"), // an informational tagged line
  ];
  for (const re of patterns) {
    for (const m of src.matchAll(re)) tags.add(m[1]);
  }
  return tags;
}

export function indexDiff(src) {
  const doc = documentedTags(src);
  if (doc === null) return ["spec-drift.mjs has no `// Checks:` header line documenting its tags"];
  const emit = emittedTags(src);
  const problems = [];
  for (const t of [...emit].sort()) {
    if (!doc.has(t)) problems.push(`guard emits [${t}] but the Checks line does not list it`);
  }
  for (const t of [...doc].sort()) {
    if (!emit.has(t)) problems.push(`Checks line lists [${t}] but the guard never emits it`);
  }
  return problems;
}

const exitCode = (problems) => (problems.length ? 1 : 0);

// --- checks -------------------------------------------------------------------
check("GHI1", "the guard's documented Checks set equals the tags it emits", () => {
  const problems = indexDiff(fs.readFileSync(GUARD, "utf8"));
  assert(problems.length === 0, `header/emission drift:\n  ${problems.join("\n  ")}`);
  assert(exitCode(problems) === 0, "drift present but exit code not failing");
});

check("GHI2", "an undocumented emitted tag and a stale documented tag both fail by name", () => {
  const missing = indexDiff(["// Checks: A0 b-not-a-tag", "issues.push(`[Z9] evidence`);", ""].join("\n"));
  assert(missing.some((p) => p.includes("[Z9]") && p.includes("does not list")), `an undocumented tag is not named:\n  ${missing.join("\n  ")}`);
  assert(exitCode(missing) === 1, "undocumented tag present but exit code not failing");

  const stale = indexDiff(["// Checks: A0 B1", "issues.push(`[A0] fine`);", ""].join("\n"));
  assert(stale.some((p) => p.includes("[B1]") && p.includes("never emits")), `a stale tag is not named:\n  ${stale.join("\n  ")}`);
  assert(exitCode(stale) === 1, "stale tag present but exit code not failing");

  const none = indexDiff(["// Checks: A0", "issues.push(`[A0] fine`);", ""].join("\n"));
  assert(none.length === 0, `an aligned index reports drift:\n  ${none.join("\n  ")}`);
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) {
  process.exit(1);
}
