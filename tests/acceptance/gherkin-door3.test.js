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
    "```gherkin",
    "Feature: Living requirement",
    "",
    "Scenario: Broken living scenario",
    "Given a living spec",
    "This prose line breaks the parse",
    "When the scan runs",
    "Then it fails",
    "  # Verified by: tests/acceptance/gherkin-door3.test.js",
    "```",
    "",
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
      "```gherkin",
      "Feature: Delta requirement",
      "",
      "Scenario: Broken delta scenario",
      "Given an open delta",
      "This prose line breaks the parse",
      "When the scan runs",
      "Then it fails",
      "  # Verified by: tests/acceptance/gherkin-door3.test.js",
      "```",
      "",
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
      "```gherkin",
      "Feature: Living requirement",
      "",
      "Scenario: Clean living scenario",
      "Given a living spec",
      "When the scan runs",
      "Then it passes",
      "  # Verified by: tests/acceptance/gherkin-door3.test.js",
      "```",
      "",
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
  fs.copyFileSync(path.join(root, "cdd", "scripts", "grammar-law.mjs"), path.join(iso, "grammar-law.mjs"));
  const r = runScan(root, path.join(iso, "spec-drift.mjs"));
  assert(r.code !== 0, `expected non-zero exit, got 0:\n${r.out}`);
  const lines = r.out.split("\n").filter((l) => /npm install --save-dev @cucumber\/gherkin/.test(l));
  assert(lines.length === 1, `expected exactly 1 message with the install command, got ${lines.length}:\n${r.out}`);
  fs.rmSync(iso, { recursive: true, force: true });
});

// --- D5: staged door never imports the parser --------------------------------

check("D5", "--staged runs without a resolvable parser", () => {
  const root = gitRepo();
  const iso = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-d3-iso-"));
  fs.copyFileSync(path.join(root, "cdd", "scripts", "spec-drift.mjs"), path.join(iso, "spec-drift.mjs"));
  fs.copyFileSync(path.join(root, "cdd", "scripts", "grammar-law.mjs"), path.join(iso, "grammar-law.mjs"));
  fs.writeFileSync(path.join(root, "touch.txt"), "x");
  execFileSync("git", ["-C", root, "add", "touch.txt"]);
  const r = runScan(root, path.join(iso, "spec-drift.mjs"), ["--staged"]);
  assert(r.code === 0, `--staged must not need the parser, got ${r.code}:\n${r.out}`);
  fs.rmSync(iso, { recursive: true, force: true });
});

// --- D6: door 3 enforces the subset; the commit door stays parser-free ----------

check("D6", "two-When fence: full scan red with the subset law, --staged green", () => {
  const root = gitRepo();
  const specDir = path.join(root, "cdd", "specs", "cap");
  fs.mkdirSync(specDir, { recursive: true });
  fs.writeFileSync(
    path.join(specDir, "spec.md"),
    [
      "### Requirement: Living requirement",
      "",
      "```gherkin",
      "Feature: Living requirement",
      "",
      "Scenario: Two whens",
      "Given a living spec",
      "When the scan runs",
      "When it runs again",
      "Then it fails",
      "  # Verified by: tests/acceptance/gherkin-door3.test.js",
      "```",
      "",
      "",
    ].join("\n")
  );
  const r = runScan(root);
  assert(r.code !== 0, `expected non-zero exit, got 0:\n${r.out}`);
  const g = r.out.split("\n").filter((l) => l.includes("[G]"));
  assert(g.length === 1 && g[0].includes("cdd/specs/cap/spec.md") && g[0].includes("exactly one When step"), `expected exactly 1 [G] finding naming the spec file and the defect:\n${r.out}`);
  // the commit door is parser-free by contract (ADR-0005): the same fence,
  // staged scan stays green — door 2 never imports the parser
  fs.writeFileSync(path.join(root, "touch.txt"), "x");
  execFileSync("git", ["-C", root, "add", "touch.txt"]);
  const staged = runScan(root, path.join(root, "cdd", "scripts", "spec-drift.mjs"), ["--staged"]);
  assert(staged.code === 0, `--staged must stay parser-free:\n${staged.out}`);
});

// --- D7: one pin dialect at the extractors --------------------------------------

check("D7", "markdown Verified-by outside a fence pins nothing; the strict fence pin does", () => {
  const root = gitRepo();
  const specDir = path.join(root, "cdd", "specs", "cap");
  fs.mkdirSync(specDir, { recursive: true });
  fs.writeFileSync(
    path.join(specDir, "spec.md"),
    [
      "### Requirement: Living requirement",
      "",
      "```gherkin",
      "Feature: Living requirement",
      "",
      "Scenario: Strictly pinned scenario",
      "Given a living spec",
      "When the extractor runs",
      "Then only the strict fence pin counts",
      "  # Verified by: tests/acceptance/pin-strict.test.js",
      "```",
      "",
      "Verified by: tests/acceptance/pin-loose.test.js",
      "",
      "",
    ].join("\n")
  );
  fs.writeFileSync(path.join(root, "tests", "acceptance", "pin-strict.test.js"), "// strict-pinned\n");
  fs.writeFileSync(path.join(root, "tests", "acceptance", "pin-loose.test.js"), "// loose markdown pin\n");
  execFileSync("git", ["-C", root, "add", "."]);
  execFileSync("git", ["-C", root, "commit", "-qm", "spec + tests"]);
  const r = runScan(root, path.join(root, "cdd", "scripts", "spec-extract.mjs"), ["--json"]);
  assert(r.code === 0, `expected exit 0, got ${r.code}:\n${r.out}`);
  const report = JSON.parse(r.out);
  assert(
    report.extractionCandidates.includes("tests/acceptance/pin-loose.test.js"),
    `the markdown line outside the fence must pin nothing:\n${r.out}`
  );
  assert(
    !report.extractionCandidates.includes("tests/acceptance/pin-strict.test.js"),
    `the strict fence pin must pin its test:\n${r.out}`
  );
});

// --- D8: init refreshes an existing store's door scripts --------------------------

check("D8", "cdd init on an existing store re-copies door scripts and lists them", () => {
  const root = gitRepo();
  const drift = path.join(root, "cdd", "scripts", "spec-drift.mjs");
  fs.writeFileSync(drift, "// stale local edit\n");
  const r = lib.initStore(root, REPO, {});
  assert(r.ok, JSON.stringify(r));
  assert(Array.isArray(r.refreshed) && r.refreshed.includes("cdd/scripts/spec-drift.mjs"), `refreshed list must name the door scripts: ${JSON.stringify(r)}`);
  assert(fs.readFileSync(drift, "utf8") === fs.readFileSync(path.join(REPO, "scripts", "spec-drift.mjs"), "utf8"), "door scripts must match the extension after refresh");
  assert(fs.existsSync(path.join(root, "cdd", "rules.md")), "rules.md must survive a refresh");
});

// --- D9: hook-health advice names a command that works on existing stores ----------

check("D9", "[H] fires on a half-upgraded scaffold and cdd_init heals it", () => {
  const root = gitRepo();
  fs.rmSync(path.join(root, ".githooks", "commit-msg"));
  const pre = path.join(root, ".githooks", "pre-commit");
  const localHook = "#!/bin/sh\n# local edit\n";
  fs.writeFileSync(pre, localHook, { mode: 0o755 });
  const red = runScan(root);
  assert(red.code !== 0 && /\[H\]/.test(red.out), `expected [H] red:\n${red.out}`);
  assert(/cdd_init/.test(red.out), `advice must name the working command:\n${red.out}`);
  const r = lib.initStore(root, REPO, {});
  assert(r.ok, JSON.stringify(r));
  assert(fs.existsSync(path.join(root, ".githooks", "commit-msg")), "refresh must install the missing hook");
  assert(fs.readFileSync(pre, "utf8") === localHook, "refresh must never overwrite an existing hook");
});

console.log(fail === 0 ? `\nPASS ${pass}` : `\nFAIL ${pass} passed, ${fail} failed`);
failures.forEach((f) => console.log(`  ${f}`));
process.exitCode = fail === 0 ? 0 : 1;
