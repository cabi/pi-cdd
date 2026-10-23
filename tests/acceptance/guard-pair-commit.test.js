#!/usr/bin/env node
// guard-pair-commit — the archive pair-commit's second commit (the archive
// move plus the merged living spec, no code files, exactly what the real
// archiveChange stages) passes the pre-commit staged scan; the door 3 full
// scan still owns committed-history topology L2 and fires exactly once at
// the mid-pair tip; completing the pair turns the full scan green again.

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

// Sandbox: a git store whose capability `app` claims src/app.js; change
// add-y lands a second requirement on the same Code glob through the
// real pre-commit door, then the real archiveChange stages the pair's
// second commit.
async function pairFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-pc-"));
  fs.mkdirSync(path.join(root, "tests", "acceptance"), { recursive: true });
  const git = (...a) => execFileSync("git", a, { cwd: root, encoding: "utf8" });
  git("init", "-q");
  git("config", "user.email", "t@t");
  git("config", "user.name", "t");
  lib.initStore(root, REPO, {});
  fs.symlinkSync(path.join(REPO, "node_modules"), path.join(root, "node_modules"), "dir");
  const w = (rel, t) => fs.writeFileSync(path.join(root, rel), t);
  const door = (args) => {
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
  };

  // commit 1: living spec app/R1 claiming src/app.js, the code, the pin
  fs.mkdirSync(path.join(root, "cdd", "specs", "app"), { recursive: true });
  fs.mkdirSync(path.join(root, "src"), { recursive: true });
  w("cdd/specs/app/spec.md", `# app — living spec\n\n## Requirements\n\n### Requirement: R1\n\nThe app greets.\n\n\`\`\`gherkin\nFeature: R1\n\nScenario: greeting\n  Given the app runs\n  When it starts\n  Then it prints a greeting\n  # Verified by: tests/acceptance/app-r1.test.js\n\`\`\`\n\nCode: src/app.js\n`);
  w("src/app.js", "export const greet = () => 'hello';\n");
  w("tests/acceptance/app-r1.test.js", "// pin\n");
  git("add", ".");
  git("commit", "-qm", "initial: spec + code + pin in sync");

  // open change add-y: delta ADDED Y1 on the same capability and Code glob
  const chDir = path.join(root, "cdd", "changes", "add-y", "specs", "app");
  fs.mkdirSync(chDir, { recursive: true });
  w("cdd/changes/add-y/proposal.md", `# add-y\n\n## Why\n\nNeed y.\n\n## What Changes\n\n- y\n\n## Solutions Considered\n\n- stdlib covers it\n\n## Non-Goals\n\n- none beyond scope\n\nDone-When: y\nCode: src/app.js\n`);
  w("cdd/changes/add-y/specs/app/spec.md", `## ADDED Requirements\n\n### Requirement: Y1\n\nThe app also farewells.\n\n\`\`\`gherkin\nFeature: Y1\n\nScenario: farewell\n  Given the app runs\n  When it stops\n  Then it prints a farewell\n  # Verified by: tests/acceptance/app-y.test.js\n\`\`\`\n\nCode: src/app.js\n`);
  w("cdd/changes/add-y/tasks.md", `# Tasks — add-y\n\n## 1. Context\n\n- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs\n\n## 2. Design\n\n- [x] 2.1 Design gate: single scenario, one task — no split needed\n\n## 3. Implementation\n\n- [x] 3.1 write y — verify by tests/acceptance/app-y.test.js\n\n## Done When Traceability\n\n| y | 3.1 |\n\n## 4. Close\n\n- [ ] 4.1 cdd validate strict green, guard green\n\n- [ ] 4.2 Archive — pair-commit: feature commit, then archive commit\n`);

  // feature commit: code + delta + pin, judged by the real pre-commit door
  w("src/app.js", "export const greet = () => 'hello';\nexport const bye = () => 'bye';\n");
  w("tests/acceptance/app-y.test.js", "// pin\n");
  git("add", "-A");
  return { root, git, door, w };
}

// --- GPC1: the feature commit passes the pre-commit door ----------------------

await check("GPC1", "feature commit (code + delta + pin staged) passes the pre-commit door", async () => {
  const fx = await pairFixture();
  const r = fx.door(["--staged"]);
  assert(r.code === 0, `pre-commit door refused the feature commit (${r.code}):\n${r.out.trim()}`);
  fx.git("commit", "-qm", "feat(app): add farewell (change add-y)");
  const mid = fx.door([]);
  assert(mid.code === 0, `full scan between the pair must stay green (open delta explains):\n${mid.out.trim()}`);
});

// --- GPC2: the archive pair-commit's second commit passes the door ------------

await check("GPC2", "real archiveChange staged set (archive move + merged living spec, no code) passes the pre-commit door", async () => {
  const fx = await pairFixture();
  assert(fx.door(["--staged"]).code === 0, "fixture: feature commit must pass the door first");
  fx.git("commit", "-qm", "feat(app): add farewell (change add-y)");
  const arch = lib.archiveChange(fx.root, "add-y");
  assert(arch.ok, `fixture: archiveChange failed: ${JSON.stringify(arch)}`);
  fx.git("add", "-A");
  const staged = fx.git("diff", "--cached", "--name-only").trim().split("\n");
  assert(staged.some((f) => f.startsWith("cdd/archive/")), "fixture: archive move not staged");
  assert(staged.includes("cdd/specs/app/spec.md"), "fixture: merged living spec not staged");
  assert(!staged.includes("src/app.js"), "fixture: code file unexpectedly staged for the archive commit");
  const r = fx.door(["--staged"]);
  assert(r.code === 0, `pre-commit door deadlocked the archive pair-commit (${r.code}):\n${r.out.trim()}`);
  assert(/spec-drift: clean/.test(r.out), `expected the clean summary, got:\n${r.out.trim()}`);
});

// --- GPC3: the full scan still owns topology L2 at the mid-pair tip -----------

await check("GPC3", "full scan at the mid-pair tip fires exactly 1 L2 naming the out-committing code", async () => {
  const fx = await pairFixture();
  fx.git("commit", "-qm", "feat(app): add farewell (change add-y)"); // fixture: door checked in GPC1
  const arch = lib.archiveChange(fx.root, "add-y");
  assert(arch.ok, `fixture: archiveChange failed: ${JSON.stringify(arch)}`);
  fx.git("add", "-A");
  const r = fx.door([]);
  assert(r.code !== 0, "full scan must stay red at the mid-pair tip (code out-commits the committed spec)");
  const l2 = r.out.split("\n").filter((l) => l.includes("[L2]"));
  assert(l2.length === 1, `expected exactly 1 L2 line, got ${l2.length}:\n${r.out.trim()}`);
  assert(l2[0].includes("src/app.js"), `L2 line must name src/app.js: ${l2[0]}`);
});

// --- GPC4: completing the pair turns the full scan green again ----------------

await check("GPC4", "the archive commit completes the pair and the full scan goes green", async () => {
  const fx = await pairFixture();
  fx.git("commit", "-qm", "feat(app): add farewell (change add-y)");
  const arch = lib.archiveChange(fx.root, "add-y");
  assert(arch.ok, `fixture: archiveChange failed: ${JSON.stringify(arch)}`);
  fx.git("add", "-A");
  assert(fx.door(["--staged"]).code === 0, "fixture: archive staged set must pass the pre-commit door (GPC2)");
  fx.git("commit", "-qm", "chore(cdd): archive add-y (pair commit 2/2)");
  const r = fx.door([]);
  assert(r.code === 0, `full scan must be green after the pair completes:\n${r.out.trim()}`);
  assert(/spec-drift: clean/.test(r.out), `expected the clean summary, got:\n${r.out.trim()}`);
});

// --- GPC5: the commit-msg door polices staged pairs in the mid-pair window ----

await check("GPC5", "bare staged code (delta unstaged) turns the commit-msg door red with the staged-pair L2", async () => {
  const fx = await pairFixture();
  // keep only the code staged — the delta and its pin stay out of the commit
  fx.git("restore", "--staged", "cdd/changes/add-y", "tests/acceptance/app-y.test.js");
  const msg = path.join(fx.root, "COMMIT_MSG_PROBE");
  fs.writeFileSync(msg, "feat(app): sneaky code-only commit\n");
  const r = fx.door(["--commit-msg", msg]);
  assert(r.code !== 0, "commit-msg door must refuse bare staged code (staged-pair check)");
  const l2 = r.out.split("\n").filter((l) => l.includes("[L2]"));
  assert(l2.length === 1, `expected exactly 1 L2 line, got ${l2.length}:\n${r.out.trim()}`);
  assert(l2[0].includes("no spec of app is in this commit"), `expected the staged-pair L2, got: ${l2[0]}`);
});

// --- summary ------------------------------------------------------------------

console.log(`\nguard-pair-commit: ${pass} pass, ${fail} fail`);
if (failures.length) {
  console.log(failures.map((f) => `  ${f}`).join("\n"));
  process.exit(1);
}
