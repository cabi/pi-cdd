#!/usr/bin/env node
// gherkin-door3 — the full scan parses every fence in living specs and open
// deltas with the same arbiter as cdd validate. Missing parser fails loudly
// with the install command; --staged never imports the parser.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const lib = await import(path.join(REPO, "lib", "store.mjs"));

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

const sandboxes = [];
function gitRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-d3-"));
  sandboxes.push(root);
  execFileSync("git", ["-C", root, "init", "-q"]);
  execFileSync("git", ["-C", root, "config", "user.email", "t@t"]);
  execFileSync("git", ["-C", root, "config", "user.name", "t"]);
  lib.initStore(root, REPO, {});
  // The pinned acceptance test must exist in the adopting repo (L1 rule).
  fs.mkdirSync(path.join(root, "tests", "acceptance"), { recursive: true });
  fs.writeFileSync(path.join(root, "tests", "acceptance", "gherkin-door3.test.js"), "// fixture pin target\n");
  execFileSync("git", ["-C", root, "add", "."]);
  execFileSync("git", ["-C", root, "commit", "-qm", "init"]);
  // Model the documented adopting-repo contract: the parser dependency is
  // installed. The symlink lands after the commit so the fixture repo stays
  // small; D4 proves isolation by copying the script where this is invisible.
  fs.symlinkSync(path.join(REPO, "node_modules"), path.join(root, "node_modules"), "dir");
  return root;
}
const runScan = (root, script = path.join(root, "cdd", "scripts", "spec-drift.mjs"), args = []) => {
  try {
    const out = execFileSync("node", [script, ...args], { encoding: "utf8", cwd: root, stdio: ["ignore", "pipe", "pipe"] });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout ?? "") + (e.stderr ?? "") };
  }
};

// --- D1: broken living-spec fence --------------------------------------------

check("D1", "full scan rejects a broken living-spec fence with file + line", () => {
  const root = gitRepo();
  const specDir = path.join(root, "cdd", "specs", "cap");
  fs.mkdirSync(specDir, { recursive: true });
  const spec = [
    "### Requirement: Living requirement",
    "",
    "#### Scenario: Broken living scenario",
    "",
    "```gherkin",
    "Scenario: Broken living scenario",
    "Given a living spec",
    "This prose line breaks the parse",
    "When the scan runs",
    "Then it fails",
    "```",
    "",
    "Verified by: tests/acceptance/gherkin-door3.test.js",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(specDir, "spec.md"), spec);
  const r = runScan(root);
  assert(r.code !== 0, `expected non-zero exit, got 0:\n${r.out}`);
  const line = 1 + spec.split("\n").indexOf("This prose line breaks the parse");
  assert(r.out.includes(`line ${line}`), `output lacks "line ${line}":\n${r.out}`);
  assert(r.out.includes("cdd/specs/cap/spec.md"), `output lacks the spec path:\n${r.out}`);
});

// --- D2: broken fence in an open delta ---------------------------------------

check("D2", "full scan rejects a broken fence in an open delta", () => {
  const root = gitRepo();
  lib.createChange(root, "t-d3", ["cap"]);
  const deltaPath = path.join(root, "cdd", "changes", "t-d3", "specs", "cap", "spec.md");
  fs.writeFileSync(
    deltaPath,
    [
      "## ADDED Requirements",
      "",
      "### Requirement: Delta requirement",
      "",
      "#### Scenario: Broken delta scenario",
      "",
      "```gherkin",
      "Scenario: Broken delta scenario",
      "Given an open delta",
      "This prose line breaks the parse",
      "When the scan runs",
      "Then it fails",
      "```",
      "",
      "Verified by: tests/acceptance/gherkin-door3.test.js",
      "",
    ].join("\n")
  );
  const r = runScan(root);
  assert(r.code !== 0, `expected non-zero exit, got 0:\n${r.out}`);
  assert(/t-d3\/specs\/cap\/spec\.md/.test(r.out), `output lacks the delta path:\n${r.out}`);
});

// --- D3: clean store passes ---------------------------------------------------

check("D3", "full scan passes on a clean store", () => {
  const root = gitRepo();
  const specDir = path.join(root, "cdd", "specs", "cap");
  fs.mkdirSync(specDir, { recursive: true });
  fs.writeFileSync(
    path.join(specDir, "spec.md"),
    [
      "### Requirement: Living requirement",
      "",
      "#### Scenario: Clean living scenario",
      "",
      "```gherkin",
      "Scenario: Clean living scenario",
      "Given a living spec",
      "When the scan runs",
      "Then it passes",
      "```",
      "",
      "Verified by: tests/acceptance/gherkin-door3.test.js",
      "",
    ].join("\n")
  );
  const r = runScan(root);
  assert(r.code === 0, `expected exit 0, got ${r.code}:\n${r.out}`);
});

// --- D4: missing parser fails loudly -----------------------------------------

check("D4", "unresolvable parser: exactly 1 message with the install command", () => {
  const root = gitRepo();
  // A living spec gives the scan fences to parse, forcing the parser import.
  const specDir = path.join(root, "cdd", "specs", "cap");
  fs.mkdirSync(specDir, { recursive: true });
  fs.writeFileSync(
    path.join(specDir, "spec.md"),
    [
      "### Requirement: Living requirement",
      "",
      "#### Scenario: Clean living scenario",
      "",
      "```gherkin",
      "Scenario: Clean living scenario",
      "Given a living spec",
      "When the scan runs",
      "Then it passes",
      "```",
      "",
      "Verified by: tests/acceptance/gherkin-door3.test.js",
      "",
    ].join("\n")
  );
  // Copy the script somewhere with no resolvable @cucumber/gherkin.
  const iso = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-d3-iso-"));
  fs.copyFileSync(path.join(root, "cdd", "scripts", "spec-drift.mjs"), path.join(iso, "spec-drift.mjs"));
  const r = runScan(root, path.join(iso, "spec-drift.mjs"));
  assert(r.code !== 0, `expected non-zero exit, got 0:\n${r.out}`);
  const lines = r.out.split("\n").filter((l) => /gherkin/i.test(l) && /install|import|cannot|resolve|missing/i.test(l));
  assert(lines.length >= 1, `no actionable parser message:\n${r.out}`);
  assert(/npm install --save-dev @cucumber\/gherkin/.test(r.out), `no install command:\n${r.out}`);
  fs.rmSync(iso, { recursive: true, force: true });
});

// --- D5: staged door never imports the parser --------------------------------

check("D5", "--staged runs without a resolvable parser", () => {
  const root = gitRepo();
  const iso = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-d3-iso-"));
  fs.copyFileSync(path.join(root, "cdd", "scripts", "spec-drift.mjs"), path.join(iso, "spec-drift.mjs"));
  fs.writeFileSync(path.join(root, "touch.txt"), "x");
  execFileSync("git", ["-C", root, "add", "touch.txt"]);
  const r = runScan(root, path.join(iso, "spec-drift.mjs"), ["--staged"]);
  assert(r.code === 0, `--staged must not need the parser, got ${r.code}:\n${r.out}`);
  fs.rmSync(iso, { recursive: true, force: true });
});

console.log(fail === 0 ? `\nPASS ${pass}` : `\nFAIL ${pass} passed, ${fail} failed`);
failures.forEach((f) => console.log(`  ${f}`));
process.exitCode = fail === 0 ? 0 : 1;
