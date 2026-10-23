#!/usr/bin/env node
// comment-shape — the accepted decision record for the comment law exists
// with its settled rule words, and the drift guard holds no violation
// naming it (mirroring the single-source decision's pin form).

import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
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
const includes = (hay, needle, where) => {
  assert(hay.includes(needle), `${where} does not mention "${needle}"`);
};

// --- checks -------------------------------------------------------------------
check("CSA1", "the comment-shape decision record exists as accepted with its settled rule words", () => {
  const dir = path.join(REPO, "cdd", "decisions");
  const files = fs.readdirSync(dir).filter((f) => f.startsWith("0012"));
  assert(files.length === 1, `expected exactly 1 decision file, found ${files.length}`);
  const body = fs.readFileSync(path.join(dir, files[0]), "utf8");
  assert(/^status:\s*accepted\s*$/m.test(body), "decision frontmatter status is not accepted");
  const lower = body.toLowerCase();
  includes(lower, "shape-of-code", "decision body");
  includes(lower, "jsdoc", "decision body");
  includes(lower, "check-id", "decision body");
  includes(lower, "corpus routing", "decision body");
  includes(lower, "hand-maintained", "decision body");
  includes(lower, "[g]", "decision body");
  includes(lower, "[h]", "decision body");
});

check("CSA2", "the drift guard holds no violation naming the comment-shape decision", () => {
  const r = spawnSync(process.execPath, [path.join(REPO, "scripts", "spec-drift.mjs")], {
    cwd: REPO,
    encoding: "utf8",
  });
  const out = `${r.stdout || ""}\n${r.stderr || ""}`;
  assert(!/\[A[012]\][^\n]*0012/.test(out), `guard flags the comment-shape decision:\n${out.match(/\[A[012]\][^\n]*0012[^\n]*/g)?.join("\n")}`);
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) {
  process.exit(1);
}
