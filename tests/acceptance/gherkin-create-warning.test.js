#!/usr/bin/env node
// createChange reports the store verdict at start — it runs the door 3 full
// scan before writing any artifact and returns preexistingRed: the guard's
// stderr issue lines verbatim when red, [] when green, and a single
// could-not-complete / could-not-run entry when the guard itself fails.
// The scaffold always proceeds; the verdict is a warning, never a gate.

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
function gitRepo({ parser = true } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-w-"));
  sandboxes.push(root);
  fs.mkdirSync(path.join(root, "tests", "acceptance"), { recursive: true });
  const git = (...a) => execFileSync("git", a, { cwd: root, encoding: "utf8" });
  git("init", "-q");
  git("config", "user.email", "t@t");
  git("config", "user.name", "t");
  lib.initStore(root, REPO, {});
  git("add", ".");
  git("commit", "-qm", "init");
  if (parser) fs.symlinkSync(path.join(REPO, "node_modules"), path.join(root, "node_modules"), "dir");
  return root;
}
// a living spec whose scan prints exactly `n` issue lines on stderr:
// n scenarios pinning n distinct missing acceptance-test files
const redLiving = (n) => {
  const scenarios = Array.from(
    { length: n },
    (_, i) =>
      `Scenario: Probe ${String.fromCharCode(97 + i)}\n  Given a fixture living spec\n  When the door 3 full scan runs\n  Then the probe pin is judged\n  # Verified by: tests/acceptance/missing-${String.fromCharCode(97 + i)}.test.js`,
  ).join("\n\n");
  return `### Requirement: Probe\n\n\`\`\`gherkin\nFeature: Probe\n\n${scenarios}\n\`\`\`\n`;
};
const writeLiving = (root, text) => {
  fs.mkdirSync(path.join(root, "cdd", "specs", "cap"), { recursive: true });
  fs.writeFileSync(path.join(root, "cdd", "specs", "cap", "spec.md"), text);
};

// --- W1: a red store yields the findings and still scaffolds ------------------

await check("W1", "a red store yields the findings and still scaffolds", () => {
  const root = gitRepo();
  writeLiving(root, redLiving(2));
  const r = lib.createChange(root, "t-w1", ["cap"]);
  assert(r.ok === true, `the scaffold must proceed on a red store, got ${JSON.stringify(r)}`);
  assert(Array.isArray(r.preexistingRed), `preexistingRed must be a list, got ${JSON.stringify(r.preexistingRed)}`);
  assert(r.preexistingRed.length === 2, `expected exactly 2 findings, got ${r.preexistingRed.length}: ${JSON.stringify(r.preexistingRed)}`);
  for (const [i, want] of ["missing-a.test.js", "missing-b.test.js"].entries()) {
    const e = r.preexistingRed[i];
    assert(e.startsWith("  [L1]"), `entry ${i} must be the guard's issue line verbatim (indented, bracket-tagged), got ${JSON.stringify(e)}`);
    assert(e.includes(want), `entry ${i} must carry finding ${want}, got ${JSON.stringify(e)}`);
  }
  assert(fs.existsSync(path.join(root, "cdd", "changes", "t-w1", "proposal.md")), "the scaffold must exist");
});

// --- W2: a green store yields an empty warning --------------------------------

await check("W2", "a green store yields an empty warning", () => {
  const root = gitRepo();
  const r = lib.createChange(root, "t-w2", ["cap"]);
  assert(r.ok === true, `scaffold failed: ${JSON.stringify(r)}`);
  assert(Array.isArray(r.preexistingRed), `preexistingRed must be a list, got ${JSON.stringify(r.preexistingRed)}`);
  assert(r.preexistingRed.length === 0, `green store must yield an empty list, got ${JSON.stringify(r.preexistingRed)}`);
});

// --- W3: a guard abort without issue lines is a could-not-complete finding ----

await check("W3", "a guard abort without issue lines is a could-not-complete finding", () => {
  const root = gitRepo({ parser: false }); // @cucumber/gherkin unresolvable → abort
  fs.writeFileSync(path.join(root, "tests", "acceptance", "probe-w3.test.js"), "// probe pin target\n");
  writeLiving(
    root,
    `### Requirement: Probe\n\n\`\`\`gherkin\nFeature: Probe\n\nScenario: Probe\n  Given a fixture living spec\n  When the door 3 full scan runs\n  Then the probe pin is judged\n  # Verified by: tests/acceptance/probe-w3.test.js\n\`\`\`\n`,
  );
  const r = lib.createChange(root, "t-w3", ["cap"]);
  assert(r.ok === true, `the scaffold must proceed even when the guard aborts, got ${JSON.stringify(r)}`);
  assert(r.preexistingRed.length === 1, `expected exactly 1 entry, got ${JSON.stringify(r.preexistingRed)}`);
  assert(r.preexistingRed[0].includes("guard could not complete"), `entry must state the guard could not complete, got ${JSON.stringify(r.preexistingRed[0])}`);
  assert(r.preexistingRed[0].includes("@cucumber/gherkin"), `entry must carry the guard's abort message, got ${JSON.stringify(r.preexistingRed[0])}`);
});

// --- W4: a missing guard script yields a could-not-run finding ----------------

await check("W4", "a missing guard script yields a could-not-run finding", () => {
  const root = gitRepo();
  fs.rmSync(path.join(root, "cdd", "scripts", "spec-drift.mjs"));
  const r = lib.createChange(root, "t-w4", ["cap"]);
  assert(r.ok === true, `the scaffold must proceed even when the guard is missing, got ${JSON.stringify(r)}`);
  assert(r.preexistingRed.length === 1, `expected exactly 1 entry, got ${JSON.stringify(r.preexistingRed)}`);
  assert(r.preexistingRed[0].includes("guard could not run"), `entry must state the guard could not run, got ${JSON.stringify(r.preexistingRed[0])}`);
  assert(fs.existsSync(path.join(root, "cdd", "changes", "t-w4", "proposal.md")), "the scaffold must exist");
});

// --- teardown -----------------------------------------------------------------

for (const d of sandboxes) fs.rmSync(d, { recursive: true, force: true });
console.log(`\n${pass} passed, ${fail} failed`);
if (failures.length) console.log(failures.join("\n"));
process.exit(fail ? 1 : 0);
