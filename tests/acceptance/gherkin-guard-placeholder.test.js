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

// --- runner-ergonomics pins: clean line counts files; expected-L2 hint --------

const l2Lines = (out) => out.split("\n").filter((l) => l.includes("[L2]"));
const hintLines = (out) =>
  out.split("\n").filter((l) => !l.includes("[L2]") && /expected mid-Close/.test(l));

function l2Repo(deltaCode, stale = true) {
  const root = gitRepo();
  fs.writeFileSync(path.join(root, "tests", "acceptance", "cap.test.js"), "// cap pin target\n");
  fs.mkdirSync(path.join(root, "cdd", "specs", "cap"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "cdd", "specs", "cap", "spec.md"),
    livingWithPin("tests/acceptance/cap.test.js") + "\nCode: src/thing.mjs\n"
  );
  fs.mkdirSync(path.join(root, "src"), { recursive: true });
  fs.writeFileSync(path.join(root, "src", "thing.mjs"), "export const thing = 1;\n");
  const git = (...a) => execFileSync("git", a, { cwd: root, encoding: "utf8" });
  git("add", ".");
  git("commit", "-qm", "spec and code in sync");
  // code out-commits the spec — exactly one L2 staleness finding
  if (stale) {
    fs.writeFileSync(path.join(root, "src", "thing.mjs"), "export const thing = 2;\n");
    git("add", "src/thing.mjs");
    git("commit", "-qm", "code-only change");
  }
  if (deltaCode) {
    const dir = path.join(root, "cdd", "changes", "fix-thing", "specs", "cap");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "spec.md"),
      `## ADDED Requirements\n\n### Requirement: Probe\n\n\`\`\`gherkin\nFeature: Probe\n\nScenario: Probe\n  Given a fixture delta\n  When the door 3 full scan runs\n  Then the probe pin is judged\n  # Verified by: tests/acceptance/cap.test.js\n\`\`\`\n\nCode: ${deltaCode}\n`
    );
  }
  return root;
}

await check("W1", "the clean summary counts acceptance test files", () => {
  const root = l2Repo(null, false); // spec, code, and pinned test all in sync
  const r = runScan(root);
  assert(r.code === 0, `scan must exit 0, got ${r.code}:\n${r.out}`);
  assert(/1 acceptance test file,/.test(r.out), `clean line must count test FILES: ${JSON.stringify(r.out.split("\n").find((l) => l.includes("acceptance test")) || "")}`);
});

await check("H1", "an L2 red explained by an open change yields exactly one expected-mid-Close hint", () => {
  const root = l2Repo("src/thing.mjs");
  const r = runScan(root);
  assert(r.code !== 0, "the L2 red must keep the scan red — a hint never greens it");
  const l2 = l2Lines(r.out);
  assert(l2.length === 1, `expected exactly 1 L2 line, got ${l2.length}: ${JSON.stringify(l2)}`);
  const hints = hintLines(r.out);
  assert(hints.length === 1, `expected exactly 1 hint line, got ${hints.length}: ${JSON.stringify(hints)}`);
  assert(hints[0].includes("fix-thing"), `hint must name the open change: ${hints[0]}`);
  assert(/archive pair-commit/.test(hints[0]), `hint must name the archive pair-commit as the clearing point: ${hints[0]}`);
});

await check("H2", "an L2 red with no matching open change yields no hint", () => {
  const root = l2Repo("src/other.mjs");
  const r = runScan(root);
  assert(r.code !== 0, "the L2 red must stay red");
  assert(l2Lines(r.out).length === 1, `expected exactly 1 L2 line, got ${JSON.stringify(l2Lines(r.out))}`);
  assert(hintLines(r.out).length === 0, `no hint may fire when no open change explains the red: ${JSON.stringify(hintLines(r.out))}`);
});

// --- P5: store copies stay byte-identical to the law sources ------------------

await check("P5", "store copies stay byte-identical to the law sources", () => {
  const pairs = [
    ["cdd/scripts/grammar-law.mjs", "scripts/grammar-law.mjs"],
    ["cdd/scripts/spec-drift.mjs", "scripts/spec-drift.mjs"],
  ];
  for (const [storeCopy, source] of pairs) {
    const a = fs.readFileSync(path.join(REPO, storeCopy));
    const b = fs.readFileSync(path.join(REPO, source));
    assert(a.equals(b), `${storeCopy} must be byte-identical to ${source}`);
  }
  const law = fs.readFileSync(path.join(REPO, "scripts", "grammar-law.mjs"), "utf8");
  assert(/LAW_VERSION = 2/.test(law), "the law must report LAW_VERSION 2");
});

// --- teardown -----------------------------------------------------------------

for (const d of sandboxes) fs.rmSync(d, { recursive: true, force: true });
console.log(`\n${pass} passed, ${fail} failed`);
if (failures.length) console.log(failures.join("\n"));
process.exit(fail ? 1 : 0);
