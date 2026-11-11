#!/usr/bin/env node
// guard-file-universe — the guard's claim universe follows the scan mode.
// Working-tree scans see index files plus non-ignored untracked files;
// staged doors stay index-limited; gitignored files are never claim
// material; untracked claimants carry no commits and fire no history
// law. Every probe runs the store's own guard copy on a sandbox git
// store where exactly one law can fire.
// Pins: ADDED "The claim universe follows the scan mode" scenarios
// (gherkin delta).

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
function store() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-fu-"));
  sandboxes.push(root);
  const git = (...a) => execFileSync("git", ["-C", root, ...a], { stdio: "pipe", encoding: "utf8" });
  git("init", "-q");
  git("config", "user.email", "t@t");
  git("config", "user.name", "t");
  lib.initStore(root, REPO, {});
  fs.symlinkSync(path.join(REPO, "node_modules"), path.join(root, "node_modules"), "dir");
  const w = (rel, t) => {
    fs.mkdirSync(path.join(root, path.dirname(rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), t);
  };
  return { root, git, w };
}

// The guard copy the store scaffolds — full scan is door 3, --staged is
// the pre-commit door.
function door(root, args = []) {
  try {
    const out = execFileSync("node", [path.join(root, "cdd", "scripts", "spec-drift.mjs"), ...args], {
      encoding: "utf8",
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout ?? "") + (e.stderr ?? "") };
  }
}

const specWithCode = (pin, code) =>
  `# cap — living spec\n\n## Requirements\n\n### Requirement: R1\n\nIt works.\n\n\`\`\`gherkin\nFeature: R1\n\nScenario: working\n  Given the capability runs\n  When it runs\n  Then it works\n  # Verified by: tests/acceptance/${pin}\n\`\`\`\n\nCode: ${code}\n`;

// The shared sandbox of scenarios 1/2/3/6: capability a claims
// src/shared/*.mjs, capability b claims src/shared/util.mjs, base.mjs is
// committed, util.mjs lives in the working tree only.
function sharedFixture({ gitignore = false } = {}) {
  const { root, git, w } = store();
  w("cdd/specs/a/spec.md", specWithCode("a-ra.test.js", "src/shared/*.mjs"));
  w("cdd/specs/b/spec.md", specWithCode("b-rb.test.js", "src/shared/util.mjs"));
  w("tests/acceptance/a-ra.test.js", "// pin\n");
  w("tests/acceptance/b-rb.test.js", "// pin\n");
  w("src/shared/base.mjs", "export const base = 1;\n");
  if (gitignore) w(".gitignore", "src/shared/util.mjs\n");
  git("add", ".");
  git("commit", "-qm", "initial: two specs, base.mjs, pins in sync");
  w("src/shared/util.mjs", "export const util = 1;\n"); // never added to the index
  return { root, git };
}

const linesWith = (out, tag) => out.split("\n").filter((l) => l.includes(tag));

// --- UF1: an untracked ownership conflict reds the full scan -------------------

await check("UF1", "untracked util.mjs double-claimed reds the full scan with exactly 1 O finding", async () => {
  const { root } = sharedFixture();
  const r = door(root);
  const o = linesWith(r.out, "[O]");
  assert(r.code !== 0, `the scan must red on the untracked overlap, got exit 0:\n${r.out.trim()}`);
  assert(o.length === 1, `exactly 1 O finding, got ${o.length}: ${JSON.stringify(o)}`);
  assert(o[0].includes("src/shared/util.mjs"), `the O finding names src/shared/util.mjs:\n${o[0]}`);
});

// --- UF2: a staged scan stays index-limited ------------------------------------

await check("UF2", "the staged doors print no O finding for the untracked file", async () => {
  const { root } = sharedFixture();
  const msg = path.join(root, "commit-msg.txt");
  fs.writeFileSync(msg, "fixture: plain message, no mechanical marker\n");
  for (const [name, r] of [
    ["pre-commit door", door(root, ["--staged"])],
    ["commit-msg door", door(root, ["--commit-msg", msg])],
  ]) {
    const o = linesWith(r.out, "[O]").filter((l) => l.includes("src/shared/util.mjs"));
    assert(o.length === 0, `${name}: staged scans read the index alone — no O finding may name the untracked file:\n${o.join("\n")}`);
  }
});

// --- UF3: a gitignored file is never claim material ----------------------------

await check("UF3", "a gitignored claim is an L2 dead glob with the frozen wording, never an O finding", async () => {
  const { root } = sharedFixture({ gitignore: true });
  const r = door(root);
  const l2 = linesWith(r.out, "[L2]");
  const o = linesWith(r.out, "[O]");
  assert(r.code !== 0, `the scan must red on the dead glob, got exit 0:\n${r.out.trim()}`);
  assert(l2.length === 1, `exactly 1 L2 finding, got ${l2.length}: ${JSON.stringify(l2)}`);
  assert(
    l2[0].includes("cdd/specs/b/spec.md declares Code: src/shared/util.mjs but no tracked file matches"),
    `the L2 finding names capability b's claim with its frozen wording:\n${l2[0]}`
  );
  assert(o.length === 0, `an ignored file enters no claim set — no O finding may fire:\n${JSON.stringify(o)}`);
});

// --- UF4: an untracked delta claim under a governing ADR fires A1 --------------

await check("UF4", "an untracked file claimed by an open delta under an accepted ADR fires exactly 1 A1", async () => {
  const { root, git, w } = store();
  w("cdd/decisions/0001-claims.md", "---\nstatus: accepted\ncode: src/claimed/*.mjs\n---\n# Claims\n\nBody.\n");
  w("src/claimed/old.mjs", "export const old = 1;\n");
  w("cdd/changes/universe-a1/proposal.md", "# universe-a1\n\nWhy: fixture. No ADR citations.\n");
  w(
    "cdd/changes/universe-a1/specs/claimed/spec.md",
    "## ADDED Requirements\n\n### Requirement: R-new\n\nThe new file lands.\n\n```gherkin\nFeature: R-new\n\nScenario: landing\n  Given an untracked claimed file\n  When the full scan runs\n  Then the guard sees it\n  # Verified by: tests/acceptance/claimed-rnew.test.js\n```\n\nCode: src/claimed/new.mjs\n"
  );
  w("tests/acceptance/claimed-rnew.test.js", "// pin\n");
  git("add", ".");
  git("commit", "-qm", "init: ADR + anchor + open change, new.mjs untracked");
  w("src/claimed/new.mjs", "export const nu = 1;\n"); // never added to the index
  const r = door(root);
  const a1 = linesWith(r.out, "[A1]");
  assert(r.code !== 0, `the scan must red on the uncited untracked claim, got exit 0:\n${r.out.trim()}`);
  assert(a1.length === 1, `exactly 1 A1 finding, got ${a1.length}: ${JSON.stringify(a1)}`);
  assert(a1[0].includes("ADR-0001"), `the finding names the governing ADR:\n${a1[0]}`);
  assert(a1[0].includes("universe-a1"), `the finding names the change:\n${a1[0]}`);
  assert(a1[0].includes("src/claimed/new.mjs"), `the finding names the untracked file:\n${a1[0]}`);
});

// --- UF5: an untracked claimant cannot fire history laws -----------------------

await check("UF5", "an untracked claimed file fires neither L2 staleness nor A2 — the scan stays clean", async () => {
  const { root, git, w } = store();
  w("cdd/specs/hist/spec.md", specWithCode("hist-r1.test.js", "src/hist/*.mjs"));
  w("tests/acceptance/hist-r1.test.js", "// pin\n");
  w("cdd/decisions/0001-hist.md", "---\nstatus: accepted\ncode: src/hist/*.mjs\n---\n# Hist\n\nBody.\n");
  w("src/hist/old.mjs", "export const old = 1;\n");
  git("add", ".");
  git("commit", "-qm", "init: spec + old.mjs + ADR in one commit — no file out-commits anything");
  w("src/hist/new.mjs", "export const nu = 1;\n"); // never added to the index
  const r = door(root);
  assert(r.code === 0, `an untracked file carries no commit and can fire no history law:\n${r.out.trim()}`);
  assert(/spec-drift: clean/.test(r.out), `expected the clean summary, got:\n${r.out.trim()}`);
});

// --- UF6: an index file conflicts in every scan mode ---------------------------

await check("UF6", "a staged util.mjs conflicts in the full scan and the pre-commit door alike", async () => {
  const { root, git } = sharedFixture();
  git("add", "src/shared/util.mjs");
  const full = door(root);
  const staged = door(root, ["--staged"]);
  for (const [name, r] of [
    ["full scan", full],
    ["--staged door", staged],
  ]) {
    const o = linesWith(r.out, "[O]").filter((l) => l.includes("src/shared/util.mjs"));
    assert(o.length === 1, `${name}: the working-tree universe adds files, it never removes index files — expected the O finding:\n${r.out.trim()}`);
  }
});

for (const d of sandboxes) fs.rmSync(d, { recursive: true, force: true });
console.log(`\nguard-file-universe: ${pass} passed, ${fail} failed`);
if (failures.length) {
  for (const f of failures) console.error(`  ${f}`);
  process.exitCode = 1;
}
