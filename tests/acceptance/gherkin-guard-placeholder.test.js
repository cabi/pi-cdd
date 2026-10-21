#!/usr/bin/env node
// Door 3 scaffold-placeholder tolerance — the guard treats placeholder pins in
// OPEN deltas as template text (a skip line, never silent), keeps living specs
// strict, refuses unrecognized marker shapes, and the store copies travel
// byte-identical with the law sources.

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
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-ph-"));
  sandboxes.push(root);
  fs.mkdirSync(path.join(root, "tests", "acceptance"), { recursive: true });
  const git = (...a) => execFileSync("git", a, { cwd: root, encoding: "utf8" });
  git("init", "-q");
  git("config", "user.email", "t@t");
  git("config", "user.name", "t");
  lib.initStore(root, REPO, {});
  git("add", ".");
  git("commit", "-qm", "init");
  // door 3's G pass re-parses fences with @cucumber/gherkin — make it
  // resolvable (symlink AFTER commit so the base stays committed-clean)
  fs.symlinkSync(path.join(REPO, "node_modules"), path.join(root, "node_modules"), "dir");
  return root;
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
const deltaWithPin = (pin) =>
  `## ADDED Requirements\n\n### Requirement: Probe\n\n\`\`\`gherkin\nFeature: Probe\n\nScenario: Probe\n  Given a fixture delta\n  When the door 3 full scan runs\n  Then the probe pin is judged\n  # Verified by: ${pin}\n\`\`\`\n`;
const livingWithPin = (pin) =>
  `### Requirement: Probe\n\n\`\`\`gherkin\nFeature: Probe\n\nScenario: Probe\n  Given a fixture living spec\n  When the door 3 full scan runs\n  Then the probe pin is judged\n  # Verified by: ${pin}\n\`\`\`\n`;
const skipLines = (out) => out.split("\n").filter((l) => /placeholder pin\(s\) skipped in open delta/.test(l));
const l1Lines = (out) => out.split("\n").filter((l) => l.includes("[L1]"));
const writeDelta = (root, name, pin) => {
  const dir = path.join(root, "cdd", "changes", name, "specs", "cap");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "spec.md"), deltaWithPin(pin));
};

// --- P1: placeholder pin in an open delta stays green with a skip line -------

await check("P1", "placeholder pin in an open delta stays green with a skip line", () => {
  const root = gitRepo();
  writeDelta(root, "t-skip", "tests/acceptance/probe-<scenario>.test.js");
  const r = runScan(root);
  assert(r.code === 0, `scan must exit 0, got ${r.code}:\n${r.out}`);
  const skips = skipLines(r.out);
  assert(skips.length === 1, `expected exactly 1 skip line, got ${skips.length}: ${JSON.stringify(skips)}`);
  assert(/(^|\s)1 placeholder pin\(s\) skipped/.test(skips[0]), `skip line must report 1 pin: ${skips[0]}`);
  assert(skips[0].includes("t-skip"), `skip line must name the open delta: ${skips[0]}`);
});

// --- P2: placeholder pin in a living spec stays red ---------------------------

await check("P2", "placeholder pin in a living spec stays red", () => {
  const root = gitRepo();
  fs.mkdirSync(path.join(root, "cdd", "specs", "cap"), { recursive: true });
  fs.writeFileSync(path.join(root, "cdd", "specs", "cap", "spec.md"), livingWithPin("tests/acceptance/probe-<scenario>.test.js"));
  const r = runScan(root);
  assert(r.code !== 0, "scan must exit non-zero on an unresolvable living pin");
  const l1 = l1Lines(r.out);
  assert(l1.length === 1, `expected exactly 1 pin-resolution issue, got ${l1.length}: ${JSON.stringify(l1)}`);
  assert(l1[0].includes("cdd/specs/cap/spec.md"), `issue must name the living spec: ${l1[0]}`);
  assert(skipLines(r.out).length === 0, "living specs never produce skip lines");
});

// --- P3: resolved pin in an open delta prints no skip line -------------------

await check("P3", "resolved pin in an open delta prints no skip line", () => {
  const root = gitRepo();
  fs.writeFileSync(path.join(root, "tests", "acceptance", "probe-resolved.test.js"), "// probe pin target\n");
  writeDelta(root, "t-res", "tests/acceptance/probe-resolved.test.js");
  const r = runScan(root);
  assert(r.code === 0, `scan must exit 0, got ${r.code}:\n${r.out}`);
  assert(skipLines(r.out).length === 0, "a resolved pin must not report a skip");
  assert(l1Lines(r.out).length === 0, "a resolved pin must not report an issue");
});

// --- P4: unrecognized marker shape in an open delta stays red -----------------

await check("P4", "unrecognized marker shape in an open delta stays red", () => {
  const root = gitRepo();
  writeDelta(root, "t-fla", "tests/acceptance/probe-<flavor>.test.js");
  const r = runScan(root);
  assert(r.code !== 0, "scan must exit non-zero — the guard never greens an unrecognized token");
  const l1 = l1Lines(r.out);
  assert(l1.length === 1, `expected exactly 1 pin-resolution issue, got ${l1.length}: ${JSON.stringify(l1)}`);
  assert(l1[0].includes("cdd/changes/t-fla/specs/cap/spec.md"), `issue must name the delta spec: ${l1[0]}`);
  assert(skipLines(r.out).length === 0, "an unrecognized shape is not a placeholder — no skip line");
});

// --- P5: store copies stay byte-identical to the law sources ------------------

await check("P5", "store copies stay byte-identical to the law sources", () => {
  const pairs = [
    ["cdd/scripts/law.mjs", "scripts/law.mjs"],
    ["cdd/scripts/spec-drift.mjs", "scripts/spec-drift.mjs"],
  ];
  for (const [storeCopy, source] of pairs) {
    const a = fs.readFileSync(path.join(REPO, storeCopy));
    const b = fs.readFileSync(path.join(REPO, source));
    assert(a.equals(b), `${storeCopy} must be byte-identical to ${source}`);
  }
  const law = fs.readFileSync(path.join(REPO, "scripts", "law.mjs"), "utf8");
  assert(/LAW_VERSION = 2/.test(law), "the law must report LAW_VERSION 2");
});

// --- teardown -----------------------------------------------------------------

for (const d of sandboxes) fs.rmSync(d, { recursive: true, force: true });
console.log(`\n${pass} passed, ${fail} failed`);
if (failures.length) console.log(failures.join("\n"));
process.exit(fail ? 1 : 0);
