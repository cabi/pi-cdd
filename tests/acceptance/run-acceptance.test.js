#!/usr/bin/env node
// run-acceptance.test.js — pins the acceptance-sweep wiring
// (delta: acceptance capability, change run-acceptance-suites).
//
// Recursion guard: the RA2 probe spawns the sweep over this very directory.
// When this file runs as a child of that probe (ACCEPTANCE_PIN_CHILD=1), it
// reports the guard and exits 0 instead of probing again.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

if (process.env.ACCEPTANCE_PIN_CHILD === "1") {
  console.log("pin child: self-guard active");
  process.exit(0);
}

let failed = 0;
const check = (id, name, ok, detail = "") => {
  console.log(`${ok ? "ok  " : "FAIL"} ${id} ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failed++;
};

// RA1: the npm test script runs the sweep over tests/acceptance/
const pkg = JSON.parse(fs.readFileSync(path.join(REPO, "package.json"), "utf8"));
check(
  "RA1",
  "npm test script runs the bare node --test sweep",
  (pkg.scripts?.test ?? "").split("&&").some((cmd) => /^node\s+--test\s*$/.test(cmd.trim())),
  pkg.scripts?.test ?? "(no test script)"
);

// RA2: observable sweep — every suite file executes under node --test (TAP probe)
const dir = path.join(REPO, "tests/acceptance");
const suites = fs.readdirSync(dir).filter((f) => f.endsWith(".test.js"));
const probeEnv = () => {
  const env = { ...process.env, ACCEPTANCE_PIN_CHILD: "1" };
  delete env.NODE_TEST_CONTEXT; // do not leak the runner's child mode into the probe
  return env;
};
const probe = spawnSync(
  "node",
  ["--test", "--test-reporter=tap"],
  { cwd: REPO, env: probeEnv(), encoding: "utf8" }
);
const tap = `${probe.stdout ?? ""}\n${probe.stderr ?? ""}`;
for (const s of suites) {
  check(`RA2`, `sweep executes ${s}`, tap.includes(s), probe.status === 0 ? "" : `probe exit ${probe.status}`);
}

// RA3: a failing suite fails the sweep (mechanism probe on a temp copy)
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-pin-"));
fs.writeFileSync(path.join(tmp, "broken.test.js"), "process.exitCode = 1;\n");
const broken = spawnSync("node", ["--test", path.join(tmp, "broken.test.js")], { encoding: "utf8", env: probeEnv() });
check("RA3", "node --test exits nonzero on a failing suite", broken.status !== 0, `exit ${broken.status}`);
fs.rmSync(tmp, { recursive: true, force: true });

// RA4: CI runs the project test entrypoint (both workflow files)
const ciFiles = [".github/workflows/cdd.yml", ".gitlab-ci.yml"];
for (const ci of ciFiles) {
  const workflow = fs.readFileSync(path.join(REPO, ci), "utf8");
  check(`RA4`, `${ci} runs npm test as a step`, /npm test/.test(workflow));
}

process.exitCode = failed ? 1 : 0;
console.log(failed ? `${failed} failed` : "all pin checks passed");
