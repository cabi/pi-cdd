#!/usr/bin/env node
// decisions-home — every ADR lives in cdd/decisions/ (0001–0007 the
// product decisions relocated from the repository root with history
// intact, 0008 and later the loop decisions); the drift guard's A-checks
// therefore govern all ADRs in the home; and no live artifact documents a
// second ADR home — root-path references survive only as history in
// PRODUCT.md and the 0001 body.

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const HOME = path.join(REPO, "cdd", "decisions");

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
const run = (cmd) =>
  spawnSync(cmd[0], cmd.slice(1), { cwd: REPO, encoding: "utf8" });

const ADR_STATUSES = ["accepted", "superseded", "draft", "proposed"];

check("DH1", "the repository root holds no decisions directory", () => {
  assert(!fs.existsSync(path.join(REPO, "decisions")), "a decisions directory still exists at the repository root");
});

check("DH2", "the decisions home holds exactly ADRs 0001 through 0012", () => {
  const ids = fs
    .readdirSync(HOME)
    .filter((f) => /^\d{4}-.*\.md$/.test(f))
    .map((f) => Number(f.slice(0, 4)))
    .sort((a, b) => a - b);
  assert(
    ids.join(",") === Array.from({ length: 12 }, (_, i) => i + 1).join(","),
    `expected exactly ADRs 1..12, found: ${ids.join(",")}`,
  );
});

check("DH3", "every ADR status sits in the guard's enum", () => {
  for (const f of fs.readdirSync(HOME).filter((x) => /^\d{4}-/.test(x)).sort()) {
    const m = fs.readFileSync(path.join(HOME, f), "utf8").match(/^status:\s*(.+)$/m);
    assert(m, `${f} has no status line`);
    const status = m[1].trim();
    assert(ADR_STATUSES.includes(status), `${f} has status "${status}" — use ${ADR_STATUSES.join(", ")}`);
  }
});

check("DH4", "the relocated 0001 keeps its history through the move", () => {
  const r = run(["git", "log", "--follow", "--oneline", "--", "cdd/decisions/0001-zero-dependency-node-tooling.md"]);
  assert(r.status === 0, `git log --follow failed: ${r.stderr}`);
  const commits = (r.stdout || "").trim().split("\n").filter(Boolean);
  assert(commits.length >= 2, `git log --follow lists ${commits.length} commits — history did not walk through the move`);
});

check("DH5", "root-path ADR references survive only as history", () => {
  const ls = run(["git", "ls-files"]);
  assert(ls.status === 0, "git ls-files failed");
  const exempt = (f) =>
    f.startsWith("cdd/archive/") ||
    f.startsWith("cdd/changes/") ||
    f === "PRODUCT.md" ||
    f === "cdd/decisions/0001-zero-dependency-node-tooling.md" ||
    f === "tests/acceptance/decisions-home.test.js";
  const offenders = [];
  for (const f of (ls.stdout || "").split("\n").filter(Boolean)) {
    if (exempt(f)) continue;
    const lines = fs.readFileSync(path.join(REPO, f), "utf8").split("\n");
    lines.forEach((line, i) => {
      if (line.includes("decisions/") && !line.includes("cdd/decisions/")) {
        offenders.push(`${f}:${i + 1}: ${line.trim()}`);
      }
    });
  }
  assert(offenders.length === 0, `live root-path references remain:\n  ${offenders.join("\n  ")}`);
});

check("DH6", "the door 3 full scan governs all twelve ADRs and exits 0", () => {
  const r = run(["node", path.join("cdd", "scripts", "spec-drift.mjs")]);
  const out = `${r.stdout || ""}\n${r.stderr || ""}`;
  assert(r.status === 0, `full scan exited ${r.status}:\n${out.trim()}`);
  assert(!/\[A[012]\]/.test(out), `A-check finding against a decisions-home ADR:\n${out.match(/\[A[012]\][^\n]*/g)?.join("\n")}`);
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) {
  console.log(failures.join("\n"));
  process.exit(1);
}
