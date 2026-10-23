#!/usr/bin/env node
// hook-wiring — contributor clones self-wire the doors: the root
// package.json carries a `prepare` script (`[ -d .git ] && git config
// core.hooksPath .githooks || true`) that npm runs at the end of every
// `npm install`/`npm ci`, wiring fresh clones to .githooks without manual
// setup. The script text is pinned against the real package.json and
// executed in two sandbox regimes: a real git repository (core.hooksPath
// reads .githooks afterwards) and a plain directory without .git (exit 0,
// nothing configured, nothing created). Red until the prepare script
// lands in package.json.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import * as cp from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

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

const EXPECTED_PREPARE = "[ -d .git ] && git config core.hooksPath .githooks || true";

let prepareScript;
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO, "package.json"), "utf8"));
  prepareScript = pkg.scripts && pkg.scripts.prepare;
} catch (e) {
  prepareScript = undefined; // unreadable package.json is as red as a missing script
}

check("HW1", "package.json carries the exact prepare wiring script", () => {
  assert(prepareScript !== undefined, "package.json scripts.prepare is missing");
  assert(
    prepareScript === EXPECTED_PREPARE,
    `scripts.prepare diverges:\n       expected: ${EXPECTED_PREPARE}\n       found:    ${prepareScript}`
  );
});

/** Run the script text in `dir` the way npm's shell would, returning the exit status. */
function runScript(dir) {
  const r = cp.spawnSync("sh", ["-c", prepareScript], { cwd: dir, encoding: "utf8" });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

check("HW2", "a fresh clone wires the doors: git repo → core.hooksPath .githooks, exit 0", () => {
  assert(prepareScript !== undefined, "cannot exercise a missing script");
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "hook-wiring-git-"));
  try {
    const init = cp.spawnSync("git", ["init"], { cwd: sandbox, encoding: "utf8" });
    assert(init.status === 0, `git init failed: ${init.stderr.trim()}`);
    assert(fs.existsSync(path.join(sandbox, ".git")), "sandbox .git missing after git init");
    const before = cp.spawnSync("git", ["config", "--get", "core.hooksPath"], {
      cwd: sandbox,
      encoding: "utf8",
    });
    assert(before.status !== 0, `core.hooksPath already set before the script ran: ${before.stdout.trim()}`);

    const run = runScript(sandbox);
    assert(run.status === 0, `script exited ${run.status} in a git repo: ${run.stderr.trim()}`);

    const after = cp.spawnSync("git", ["config", "--get", "core.hooksPath"], {
      cwd: sandbox,
      encoding: "utf8",
    });
    assert(after.status === 0, `core.hooksPath unset after the script ran: ${after.stderr.trim()}`);
    assert(
      after.stdout.trim() === ".githooks",
      `core.hooksPath is "${after.stdout.trim()}", expected ".githooks"`
    );
  } finally {
    fs.rmSync(sandbox, { recursive: true, force: true });
  }
});

check("HW3", "without .git the script is a silent no-op: exit 0, nothing configured, nothing created", () => {
  assert(prepareScript !== undefined, "cannot exercise a missing script");
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "hook-wiring-nogit-"));
  try {
    assert(!fs.existsSync(path.join(sandbox, ".git")), "sandbox must start without .git");
    const run = runScript(sandbox);
    assert(run.status === 0, `script exited ${run.status} without .git: ${run.stderr.trim()}`);
    assert(!fs.existsSync(path.join(sandbox, ".git")), "script must not create a .git directory");
    const probe = cp.spawnSync("git", ["config", "--get", "core.hooksPath"], {
      cwd: sandbox,
      encoding: "utf8",
    });
    assert(probe.status !== 0, `core.hooksPath resolved outside a repo: ${probe.stdout.trim()}`);
  } finally {
    fs.rmSync(sandbox, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------

console.log("=".repeat(74));
if (fail > 0) {
  console.log(`${pass} passed, ${fail} failed`);
  process.exit(1);
} else {
  console.log(`${pass}/${pass} passed`);
}
