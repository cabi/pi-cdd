#!/usr/bin/env node
// claim-map — pins the single derivation of the file-claim map: the per-file
// claiming loop lives exactly once, in scripts/adr-index.mjs, and both
// consumers (the drift guard's gather pass and lib/adr-ops.mjs) answer from
// the shared map — the op's --code answers equal the map's per-path governing
// query for tracked and untracked paths alike.

import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

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

// the real extension, loaded the way pi loads it (tests/pi-jiti.mjs)
function fakeApi() {
  const api = {
    tools: [],
    commands: [],
    events: {},
    setActiveToolsCalls: 0,
    registerTool: (def) => api.tools.push(def),
    registerCommand: (name, def) => api.commands.push([name, def]),
    on: (ev, fn) => {
      api.events[ev] = fn;
    },
    setActiveTools: () => {
      api.setActiveToolsCalls++;
    },
  };
  return api;
}
const { loadViaPi } = await import(path.join(REPO, "tests", "pi-jiti.mjs"));
const mod = (await loadViaPi(path.join(REPO, "index.ts"))) ?? (await import(path.join(REPO, "index.ts")));
const api = fakeApi();
mod.default(api);
const call = async (args, cwd) => api.tools[0].execute(1, args, undefined, undefined, { cwd });

const idsIn = (text) => (text.match(/ADR-\d{4}/g) ?? []);

// --- CM1: the claim map is derived exactly once -------------------------------------

await check("CM1", "the claiming loop appears exactly once, in scripts/adr-index.mjs; no consumer re-derives", async () => {
  const read = (p) => fs.readFileSync(path.join(REPO, p), "utf8");
  const indexSrc = read("scripts/adr-index.mjs");
  const guardSrc = read("scripts/spec-drift.mjs");
  const opsSrc = read("lib/adr-ops.mjs");
  const lawSrc = read("scripts/grammar-law.mjs");
  const corpus = {
    "scripts/adr-index.mjs": indexSrc,
    "scripts/spec-drift.mjs": guardSrc,
    "lib/adr-ops.mjs": opsSrc,
    "scripts/grammar-law.mjs": lawSrc,
  };
  // The deleted derivation sites must stay deleted:
  // guard — gather topology, filesClaimedByChange, globClaimsMemory, checkL2,
  // checkO, checkA1, checkA2; op — governs, the private claiming loop, the
  // CODE_LINE scan. A private re-derivation needs either the glob translation
  // (globToRe) or a compiled-glob claiming test (re.test( — both banned
  // outside the shared module; grammar-law's shared parse may compile globs,
  // never claim files.
  assert(
    !/globToRe/.test(guardSrc),
    "the guard translates no globs — gather topology, filesClaimedByChange, globClaimsMemory, checkL2, checkO, checkA1, and checkA2 read the shared claim map"
  );
  assert(
    !/re\.test\(/.test(guardSrc),
    "the guard claims no files itself — the claiming loop lives in scripts/adr-index.mjs"
  );
  assert(
    !/globToRe/.test(opsSrc),
    "the ops library translates no globs — governs and the private claiming loop are deleted"
  );
  assert(
    !/re\.test\(/.test(opsSrc),
    "the ops library claims no files itself — it answers from the shared claim map"
  );
  assert(
    !/re\.test\(/.test(lawSrc),
    "the shared parse compiles globs but claims no files — no compiled-glob test in grammar-law"
  );
  assert(
    !/CODE_LINE/.test(opsSrc) && !/Code:/.test(opsSrc),
    "the ops library re-states no Code-line scan — open-delta specs are read with the shared spec parse"
  );
  assert(/parseSpecModel/.test(opsSrc), "the ops library reads the shared spec parse");
  const claiming = Object.entries(corpus)
    .filter(([, src]) => /re\.test\(/.test(src))
    .map(([p]) => p);
  assert(
    JSON.stringify(claiming) === JSON.stringify(["scripts/adr-index.mjs"]),
    `the claiming loop appears exactly once, in scripts/adr-index.mjs — found ${JSON.stringify(claiming)}`
  );
  assert(/function buildClaimMap/.test(indexSrc), "the claim map builder is defined in scripts/adr-index.mjs");
  assert(/buildClaimMap/.test(guardSrc) && /buildClaimMap/.test(opsSrc), "both consumers call the shared builder");
});

// --- CM2: the op answers from the shared claim map -----------------------------------

await check("CM2", "adrs --code answers equal the claim map's per-path governing query, tracked and untracked alike", async () => {
  const adrIndexMod = await import(path.join(REPO, "scripts", "adr-index.mjs"));
  assert(typeof adrIndexMod.buildClaimMap === "function", "scripts/adr-index.mjs exports buildClaimMap");
  const adrIndex = adrIndexMod.buildAdrIndex(REPO);
  const tracked = execFileSync("git", ["ls-files"], { cwd: REPO, encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
  const map = adrIndexMod.buildClaimMap({ specs: [], adrIndex, tracked });
  assert(typeof map.governingFor === "function", "the claim map exposes a per-path governing query");

  const opIds = async (code) => {
    const r = await call({ op: "adrs", options: JSON.stringify({ code }) }, REPO);
    assert(!r.isError, `adrs --code ${code} must answer, got: ${r.content[0].text}`);
    return idsIn(r.content[0].text);
  };
  // a tracked, claimed path and an untracked path that still matches a
  // governing ADR glob — the single-path query semantics must hold for both.
  for (const probe of ["lib/templates.mjs", "lib/zz-untracked.mjs"]) {
    const fromOp = await opIds(probe);
    const fromMap = map.governingFor(probe).map((a) => a.id);
    assert(
      JSON.stringify(fromOp) === JSON.stringify(fromMap),
      `op and map must agree on ${probe}: op=${JSON.stringify(fromOp)} map=${JSON.stringify(fromMap)}`
    );
  }
  const untracked = map.governingFor("lib/zz-untracked.mjs");
  assert(untracked.length > 0, `the untracked probe must exercise a non-empty governing set, got ${JSON.stringify(untracked)}`);
});

// --- report -------------------------------------------------------------------------

console.log(`\nclaim-map: ${pass} ok, ${fail} FAIL`);
if (fail) for (const f of failures) console.error(f);
process.exit(fail ? 1 : 0);
