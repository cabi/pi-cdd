#!/usr/bin/env node
// guard-adr-remedies — the drift guard's A1 and A2 findings teach executable
// remedies: A1 names the adrs reverse-lookup command, A2 names the reconfirm
// command, on synthetic git repositories where each check fires in isolation.
// Pins: ADDED "A-check findings name their remedy op" scenarios (gherkin delta).

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
async function check(id, name, fn) {
  try {
    await fn();
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
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-gr-"));
  sandboxes.push(root);
  const git = (...a) => execFileSync("git", ["-C", root, ...a], { stdio: "pipe", encoding: "utf8" });
  git("init", "-q");
  git("config", "user.email", "t@t");
  git("config", "user.name", "t");
  lib.initStore(root, REPO, {});
  return { root, git };
}
function runScan(root) {
  try {
    const out = execFileSync("node", [path.join(root, "cdd", "scripts", "spec-drift.mjs")], {
      encoding: "utf8",
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout ?? "") + (e.stderr ?? "") };
  }
}

await check("GR1", "an A1 finding names the reverse-lookup command", async () => {
  const { root, git } = gitRepo();
  fs.mkdirSync(path.join(root, "cdd", "decisions"), { recursive: true });
  fs.writeFileSync(path.join(root, "cdd", "decisions", "0001-alpha.md"), "---\nstatus: accepted\ncode: src/thing.mjs\n---\n# Alpha\n\nBody.\n");
  const dir = path.join(root, "cdd", "changes", "fix-thing", "specs", "cap");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "spec.md"),
    "## ADDED Requirements\n\n### Requirement: Probe\n\n```gherkin\nFeature: Probe\n\nScenario: Probe\n  Given a fixture delta\n  When it runs\n  Then it works\n  # Verified by: tests/acceptance/cap.test.js\n```\n\nCode: src/thing.mjs\n"
  );
  fs.writeFileSync(path.join(root, "cdd", "changes", "fix-thing", "proposal.md"), "# fix-thing\n\nWhy: fixture. No ADR citations.\n");
  fs.mkdirSync(path.join(root, "src"), { recursive: true });
  fs.writeFileSync(path.join(root, "src", "thing.mjs"), "export const thing = 1;\n");
  fs.mkdirSync(path.join(root, "tests", "acceptance"), { recursive: true });
  fs.writeFileSync(path.join(root, "tests", "acceptance", "cap.test.js"), "// pin target\n");
  git("add", ".");
  git("commit", "-qm", "init");
  fs.symlinkSync(path.join(REPO, "node_modules"), path.join(root, "node_modules"), "dir");
  const r = runScan(root);
  const a1 = r.out.split("\n").filter((l) => l.includes("[A1]"));
  assert(r.code !== 0, `the scan must stay red on the uncited overlap: ${r.out}`);
  assert(a1.length === 1, `exactly 1 A1 finding, got ${a1.length}: ${JSON.stringify(a1)}`);
  assert(a1[0].includes("ADR-0001"), `the finding names the governing ADR: ${a1[0]}`);
  assert(a1[0].includes("cdd adrs --code"), `the finding names the reverse-lookup command: ${a1[0]}`);
});

await check("GR2", "an A2 finding names the reconfirm command", async () => {
  const { root, git } = gitRepo();
  fs.mkdirSync(path.join(root, "cdd", "decisions"), { recursive: true });
  fs.writeFileSync(path.join(root, "cdd", "decisions", "0001-alpha.md"), "---\nstatus: accepted\ncode: src/thing.mjs\n---\n# Alpha\n\nBody.\n");
  fs.mkdirSync(path.join(root, "src"), { recursive: true });
  fs.writeFileSync(path.join(root, "src", "thing.mjs"), "export const thing = 1;\n");
  git("add", ".");
  git("commit", "-qm", "init");
  // the governed file moves after the ADR file's last commit, unclaimed by any open change
  fs.writeFileSync(path.join(root, "src", "thing.mjs"), "export const thing = 2;\n");
  git("add", "src/thing.mjs");
  git("commit", "-qm", "code moves");
  fs.symlinkSync(path.join(REPO, "node_modules"), path.join(root, "node_modules"), "dir");
  const r = runScan(root);
  const a2 = r.out.split("\n").filter((l) => l.includes("[A2]"));
  assert(r.code !== 0, `the scan must stay red on silent rot: ${r.out}`);
  assert(a2.length === 1, `exactly 1 A2 finding, got ${a2.length}: ${JSON.stringify(a2)}`);
  assert(a2[0].includes("ADR-0001"), `the finding names the ADR: ${a2[0]}`);
  assert(a2[0].includes("cdd reconfirm"), `the finding names the reconfirm command: ${a2[0]}`);
});

for (const d of sandboxes) fs.rmSync(d, { recursive: true, force: true });
console.log(`\nguard-adr-remedies: ${pass} passed, ${fail} failed`);
if (failures.length) {
  for (const f of failures) console.error(`  ${f}`);
  process.exitCode = 1;
}
