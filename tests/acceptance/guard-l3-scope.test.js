#!/usr/bin/env node
// L3 scope — the task-scale law counts implementation subtasks only (rule 6):
// the checkbox items under `## 3. Implementation`, the section the strict
// validator counts. Context, design, and close tasks stay outside the limit;
// the issue line names implementation subtasks. The scenarios mirror
// cdd/changes/fix-l3-implementation-count/specs/gherkin/spec.md and run both
// real doors: the guard scan (sandbox store copy) and lib/validate.mjs.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const lib = await import(path.join(REPO, "lib", "store.mjs"));
const val = await import(path.join(REPO, "lib", "validate.mjs"));

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
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-l3-"));
  sandboxes.push(root);
  fs.mkdirSync(path.join(root, "tests", "acceptance"), { recursive: true });
  const git = (...a) => execFileSync("git", a, { cwd: root, encoding: "utf8" });
  git("init", "-q");
  git("config", "user.email", "t@t");
  git("config", "user.name", "t");
  lib.initStore(root, REPO, {});
  git("add", ".");
  git("commit", "-qm", "init");
  // a resolved probe spec so the scan runs its full law set (an empty store
  // exits early and every scenario would pass vacuously); door 3's G pass
  // re-parses fences with @cucumber/gherkin — resolvable via symlink AFTER
  // the commit so the base stays committed-clean
  fs.writeFileSync(path.join(root, "tests", "acceptance", "probe.test.js"), "// probe pin target\n");
  fs.mkdirSync(path.join(root, "cdd", "specs", "probe"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "cdd", "specs", "probe", "spec.md"),
    "### Requirement: Probe\n\n```gherkin\nFeature: Probe\n\nScenario: Probe\n  Given a fixture store\n  When the drift guard runs\n  Then the probe pin resolves\n  # Verified by: tests/acceptance/probe.test.js\n```\n"
  );
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
const l3Lines = (out) => out.split("\n").filter((l) => l.includes("[L3]"));

// A living change's tasks file on the four-step skeleton. Non-implementation
// sections carry their own items — exactly the scaffold overhead rule 6 keeps
// outside the task-scale law.
function writeTasks(root, name, { impl, context = 0, design = 0, close = 0, splitLine = false }) {
  const lines = ["# Tasks", ""];
  const section = (num, title, count) => {
    lines.push(`## ${num}. ${title}`, "");
    for (let i = 1; i <= count; i++) {
      lines.push(`- [ ] ${num}.${i} ${title.toLowerCase()} probe verify by tests/acceptance/probe.test.js`);
    }
    lines.push("");
  };
  section(1, "Context", context);
  section(2, "Design", design);
  section(3, "Implementation", impl);
  section(4, "Close", close);
  lines.push("## Done When Traceability", "", "| criterion | task ids |", "|---|---|");
  if (splitLine) lines.push("<!-- split-considered: kept whole because probe -->");
  const dir = path.join(root, "cdd", "changes", name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "tasks.md"), lines.join("\n") + "\n");
}

// --- S1: scaffold overhead does not reach the limit -----------------------------

await check("S1", "Scaffold overhead does not reach the limit", () => {
  const root = gitRepo();
  // 9 implementation subtasks + 4 non-implementation tracked tasks = 13 tracked
  writeTasks(root, "t-scaffold", { impl: 9, context: 2, design: 1, close: 1 });
  const r = runScan(root);
  assert(r.code === 0, `scan must exit 0 — context/design/close items are not implementation subtasks:\n${r.out}`);
  assert(l3Lines(r.out).length === 0, `no L3 issue may fire on 9 implementation subtasks: ${JSON.stringify(l3Lines(r.out))}`);
});

// --- S2: thirteen implementation subtasks fail with the scoped message ----------

await check("S2", "Thirteen implementation subtasks fail with the scoped message", () => {
  const root = gitRepo();
  writeTasks(root, "t-limit", { impl: 13 });
  const r = runScan(root);
  assert(r.code !== 0, "scan must exit non-zero on 13 implementation subtasks with no split-considered line");
  const l3 = l3Lines(r.out);
  assert(l3.length === 1, `expected exactly 1 L3 issue, got ${l3.length}: ${JSON.stringify(l3)}`);
  assert(
    l3[0].includes("13 implementation subtasks (> 12)"),
    `the issue must name "13 implementation subtasks (> 12)": ${l3[0]}`
  );
});

// --- S3: a split-considered line passes the limit --------------------------------

await check("S3", "A split-considered line passes the limit", () => {
  const root = gitRepo();
  writeTasks(root, "t-split", { impl: 13, splitLine: true });
  const r = runScan(root);
  assert(r.code === 0, `scan must exit 0 — the exception is explicit, not silent:\n${r.out}`);
  assert(l3Lines(r.out).length === 0, `no L3 issue may fire past a recorded decision: ${JSON.stringify(l3Lines(r.out))}`);
});

// --- S4: the guard agrees with the strict validator's counter -------------------

await check("S4", "The guard agrees with the strict validator's counter", () => {
  const root = gitRepo();
  // 9 implementation subtasks + 4 non-implementation tracked tasks = 13 tracked
  writeTasks(root, "t-agree", { impl: 9, context: 2, design: 1, close: 1 });

  // door: the guard scan — its clean summary carries the implementation-subtask count
  const r = runScan(root);
  assert(r.code === 0, `scan must exit 0 on 9 implementation subtasks:\n${r.out}`);
  const summary = r.out.split("\n").find((l) => /spec-drift: clean/.test(l));
  assert(summary !== undefined, `expected the clean summary, got:\n${r.out.trim()}`);
  const guardMatch = summary.match(/(\d+) implementation subtasks/);
  assert(guardMatch !== null, `the clean summary must carry the implementation-subtask count: ${summary}`);
  const guardCount = Number(guardMatch[1]);

  // door: the strict validator — its split-signal warning carries the same count
  const v = val.validateChange(root, "t-agree", "strict");
  const warn = (v.warnings ?? []).find((w) => /implementation subtasks/.test(w));
  assert(warn !== undefined, `strict validation must surface its implementation-subtask count (9 > 8 split signal): ${JSON.stringify(v.warnings)}`);
  const valMatch = warn.match(/(\d+) implementation subtasks/);
  const valCount = Number(valMatch[1]);

  assert(guardCount === 9, `guard counted ${guardCount} implementation subtasks, expected 9`);
  assert(valCount === 9, `strict validator counted ${valCount} implementation subtasks, expected 9`);
});

// --- teardown -------------------------------------------------------------------

for (const d of sandboxes) fs.rmSync(d, { recursive: true, force: true });
console.log(`\n${pass} passed, ${fail} failed`);
if (failures.length) console.log(failures.join("\n"));
process.exit(fail ? 1 : 0);
