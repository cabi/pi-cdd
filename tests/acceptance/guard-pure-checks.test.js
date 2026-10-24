#!/usr/bin/env node
// guard-pure-checks — pins the guard's structure law: one gather pass collects
// everything the laws need (files on disk, per-spec models, resolved pins, git
// state, open-change claims) into a single facts snapshot; every law is a pure
// function of that snapshot; the runner alone maps findings to the report.
// Two legs: a static seam scan (the pure-check region holds no filesystem, git,
// or console access) and a behavioral direct call (L1 on an in-memory snapshot
// in an empty directory with no git repository on disk).

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const GUARD = path.join(REPO, "scripts", "spec-drift.mjs");

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

const LAWS = [
  "checkA0", "checkA1", "checkA2", "checkG", "checkH",
  "checkL1", "checkL2", "checkL3", "checkL4", "checkM", "checkO",
];

const src = fs.readFileSync(GUARD, "utf8");

await check("GPC1", "gathering is the only I/O seam — the pure-check region holds no filesystem, git, or console access", () => {
  const gatherStart = src.indexOf("function gatherFacts");
  const pureStart = src.indexOf("===== pure checks —");
  const reportStart = src.indexOf("===== report —");
  assert(gatherStart !== -1, "scripts/spec-drift.mjs has no gatherFacts() — the gather pass is the one I/O seam");
  assert(pureStart !== -1, "scripts/spec-drift.mjs has no '===== pure checks' region marker");
  assert(reportStart !== -1, "scripts/spec-drift.mjs has no '===== report' region marker");
  assert(gatherStart < pureStart && pureStart < reportStart, "region markers out of order: gather pass must precede the pure checks, the report must follow them");

  const region = src.slice(pureStart, reportStart);
  for (const re of [/\bfs\./, /node:fs/, /node:child_process/, /\bexecFileSync\b/, /\bexecSync\b/, /\bspawnSync\b/, /\bspawn\b/, /\bgit\(/, /\bconsole\./, /\bprocess\.(?:exit|stdout|stderr)\b/]) {
    const hit = re.exec(region);
    if (hit !== null) {
      throw new Error(`pure-check region contains I/O (${re}) at ...${region.slice(Math.max(0, hit.index - 40), hit.index + 40)}... — gathering must collect it instead`);
    }
  }
  for (const law of LAWS) {
    assert(region.includes(`function ${law}(`), `pure-check region does not define ${law}()`);
  }
  const gatherRegion = src.slice(gatherStart, pureStart);
  assert(gatherRegion.includes("execFileSync"), "the gather pass no longer talks to git — the git helper belongs in the gather region");
});

await check("GPC2", "a pure check runs on facts alone — L1 on an in-memory snapshot, no repository on disk", async () => {
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), "guard-pure-"));
  assert(!fs.existsSync(path.join(empty, ".git")), "the scratch directory must not be a git repository");
  const before = process.cwd();
  process.chdir(empty); // any stray relative read or git call now hits an empty, repo-less directory
  let out;
  try {
    const mod = await import(pathToFileURL(GUARD).href); // importing the guard must run nothing
    for (const law of LAWS) {
      assert(typeof mod[law] === "function", `the guard does not export ${law}`);
    }
    const specRel = "cdd/specs/widget/spec.md";
    const facts = {
      isRepo: false,
      preCommit: false,
      specsToCheck: [specRel],
      allSpecs: [specRel],
      pinsOf: new Map([[specRel, [{ pin: "tests/acceptance/missing.test.js", resolved: null }]]]),
      accRel: [],
      stagedSet: new Set(),
      stagedAdds: [],
      stagedDels: [],
    };
    out = mod.checkL1(facts);
  } finally {
    process.chdir(before);
    fs.rmSync(empty, { recursive: true, force: true });
  }
  assert(out && Array.isArray(out.issues), "checkL1 must return { issues, ... }");
  assert(out.issues.length === 1, `expected exactly 1 forward-pin finding, got ${out.issues.length}: ${JSON.stringify(out.issues)}`);
  assert(
    out.issues[0] === `[L1] ${"cdd/specs/widget/spec.md"} pins "tests/acceptance/missing.test.js" but that file does not exist — restore the acceptance test or update the Verified by line`,
    `finding does not name the spec and the pin verbatim: ${JSON.stringify(out.issues[0])}`,
  );
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) {
  process.exit(1);
}
