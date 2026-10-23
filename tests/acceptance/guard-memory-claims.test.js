#!/usr/bin/env node
// guard-memory-claims — PF-19's pin at the root: a Code line claims
// implementation surface, never decision memory. Decision memory
// (cdd/decisions/**) answers to the guard's A-checks unconditionally, so no
// travel door may bind it — which is what made staged ADR reconfirmations
// unlawful (the staged-pair check demanded a spec travel with the ADR). The
// full scan owns the law: an open-delta memory claim reds unconditionally, a
// living claim reds unless the same capability's open change is correcting
// that very requirement with a clean restated Code line — then one
// informational skip line, never silent.

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

// Base store: capability `app`, living R1 (clean claim), all committed.
function memFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-mc-"));
  fs.mkdirSync(path.join(root, "tests", "acceptance"), { recursive: true });
  const git = (...a) => execFileSync("git", a, { cwd: root, encoding: "utf8" });
  git("init", "-q");
  git("config", "user.email", "t@t");
  git("config", "user.name", "t");
  lib.initStore(root, REPO, {});
  fs.symlinkSync(path.join(REPO, "node_modules"), path.join(root, "node_modules"), "dir");
  const w = (rel, t) => fs.writeFileSync(path.join(root, rel), t);
  fs.mkdirSync(path.join(root, "cdd", "specs", "app"), { recursive: true });
  fs.mkdirSync(path.join(root, "src"), { recursive: true });

  const r1 = (extraCode = "") => `### Requirement: R1\n\nThe app greets.\n\n\`\`\`gherkin\nFeature: R1\n\nScenario: greeting\n  Given the app runs\n  When it starts\n  Then it prints a greeting\n  # Verified by: tests/acceptance/app-r1.test.js\n\`\`\`\n\nCode: src/app.js${extraCode}\n`;
  const commitSpec = (blocks) => {
    w("cdd/specs/app/spec.md", `# app — living spec\n\n## Requirements\n\n${blocks}`);
    git("add", "-A");
    git("commit", "-qm", "spec sync");
  };
  w("src/app.js", "export const greet = () => 'hello';\n");
  w("tests/acceptance/app-r1.test.js", "// pin\n");
  commitSpec(r1());

  // a living requirement that claims decision memory, plus its tracked prey
  const addMemoryR2 = () => {
    fs.mkdirSync(path.join(root, "cdd", "decisions"), { recursive: true });
    w("cdd/decisions/0001-note.md", "---\nstatus: accepted\n---\n\nA decision.\n");
    w("tests/acceptance/app-r2.test.js", "// pin\n");
    commitSpec(
      r1() +
        "\n" +
        `### Requirement: R2\n\nThe app remembers.\n\n\`\`\`gherkin\nFeature: R2\n\nScenario: remembering\n  Given the app runs\n  When it recalls\n  Then it uses the decisions\n  # Verified by: tests/acceptance/app-r2.test.js\n\`\`\`\n\nCode: src/app.js, cdd/decisions/*.md\n`
    );
  };

  // an open change of `app` with a delta spec; mode shapes the delta body
  const openChange = (name, mode) => {
    const dir = path.join(root, "cdd", "changes", name, "specs", "app");
    fs.mkdirSync(dir, { recursive: true });
    const proposal = `# ${name}\n\n## Why\n\nFix R2.\n\n## What Changes\n\n- fix\n\n## Solutions Considered\n\n- fix\n\n## Non-Goals\n\n- none\n\nDone-When: r2 fixed\nCode: src/app.js\n`;
    const tasks = `# Tasks — ${name}\n\n## 1. Context\n\n- [x] 1.1 read\n\n## 2. Design\n\n- [x] 2.1 gate\n\n## 3. Implementation\n\n- [x] 3.1 fix — verify by tests/acceptance/app-r2.test.js\n\n## 4. Close\n\n- [ ] 4.1 archive\n`;
    const r2Body = (codeLine, heading = "R2") =>
      `### Requirement: ${heading}\n\nThe app remembers.\n\n\`\`\`gherkin\nFeature: R2\n\nScenario: remembering\n  Given the app runs\n  When it recalls\n  Then it uses the decisions\n  # Verified by: tests/acceptance/app-r2.test.js\n\`\`\`\n\nCode: ${codeLine}\n`;
    const r9Body = `### Requirement: R9\n\nThe app forgets.\n\n\`\`\`gherkin\nFeature: R9\n\nScenario: forgetting\n  Given the app runs\n  When it drops state\n  Then it forgets\n  # Verified by: tests/acceptance/app-r9.test.js\n\`\`\`\n\nCode: cdd/decisions/*.md\n`;
    w(`cdd/changes/${name}/proposal.md`, proposal);
    w(`cdd/changes/${name}/tasks.md`, tasks);
    if (mode === "add-bad") fs.writeFileSync(path.join(root, "tests", "acceptance", "app-r9.test.js"), "// pin\n");
    let delta = "";
    if (mode === "modify-clean") delta = `## MODIFIED Requirements\n\n${r2Body("src/app.js, src/r2.js")}`;
    else if (mode === "modify-bad") delta = `## MODIFIED Requirements\n\n${r2Body("src/app.js, cdd/decisions/*.md")}`;
    else if (mode === "modify-renamed") delta = `## MODIFIED Requirements\n\n${r2Body("src/app.js, src/r2.js", "R2-corrected")}`;
    else if (mode === "add-bad") delta = `## ADDED Requirements\n\n${r9Body}`;
    w(`cdd/changes/${name}/specs/app/spec.md`, delta + "\n");
  };

  const run = (args) => {
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
  const scan = () => run([]);
  const l4Lines = (r) => r.out.split("\n").filter((l) => l.includes("[L4]"));
  const skipLines = (r) => r.out.split("\n").filter((l) => l.includes("[L4-skip]"));

  return { root, git, w, addMemoryR2, openChange, scan, run, l4Lines, skipLines };
}

// --- MC1: an open delta claiming decision memory reds ----------------------------

await check("MC1", "an open delta's Code: cdd/decisions/*.md reds the full scan", async () => {
  const fx = memFixture();
  fx.openChange("fix-mem", "add-bad");
  const r = fx.scan();
  assert(r.code !== 0, `full scan must red an open delta claiming decision memory:\n${r.out.trim()}`);
  const ls = fx.l4Lines(r);
  assert(ls.length === 1, `expected exactly 1 [L4] line, got ${ls.length}:\n${r.out.trim()}`);
  assert(ls[0].includes("cdd/changes/fix-mem/specs/app/spec.md"), `must name the delta spec: ${ls[0]}`);
  assert(ls[0].includes("cdd/decisions/*.md"), `must name the claim: ${ls[0]}`);
  assert(/A-checks/.test(ls[0]), `must name the lawful surface (A-checks): ${ls[0]}`);
});

// --- MC2: a living claim with no correction reds ---------------------------------

await check("MC2", "a living spec's memory claim with no open correction reds", async () => {
  const fx = memFixture();
  fx.addMemoryR2();
  const r = fx.scan();
  assert(r.code !== 0, `full scan must red a living memory claim:\n${r.out.trim()}`);
  const ls = fx.l4Lines(r);
  assert(ls.length === 1, `expected exactly 1 [L4] line, got ${ls.length}:\n${r.out.trim()}`);
  assert(ls[0].includes("cdd/specs/app/spec.md"), `must name the living spec: ${ls[0]}`);
  assert(ls[0].includes("cdd/decisions/*.md"), `must name the claim: ${ls[0]}`);
});

// --- MC3: a living claim under correction skips with one line --------------------

await check("MC3", "a corrected requirement earns exactly 1 skip line and a green scan", async () => {
  const fx = memFixture();
  fx.addMemoryR2();
  fx.openChange("fix-r2", "modify-clean");
  const r = fx.scan();
  assert(r.code === 0, `scan must stay green while the correction is open:\n${r.out.trim()}`);
  const skips = fx.skipLines(r);
  assert(skips.length === 1, `expected exactly 1 skip line, got ${skips.length}:\n${r.out.trim()}`);
  assert(skips[0].includes("cdd/decisions/*.md"), `skip must name the claim: ${skips[0]}`);
  assert(skips[0].includes("fix-r2"), `skip must name the open change: ${skips[0]}`);
  assert(fx.l4Lines(r).length === 0, `no finding may accompany the skip:\n${r.out.trim()}`);
});

// --- MC4: an added claim corrects nothing -----------------------------------------

await check("MC4", "an ADDED delta claim reds alongside the uncorrected living claim", async () => {
  const fx = memFixture();
  fx.addMemoryR2();
  fx.openChange("add-r9", "add-bad");
  const r = fx.scan();
  assert(r.code !== 0, `added claims correct nothing:\n${r.out.trim()}`);
  const ls = fx.l4Lines(r);
  assert(ls.length === 2, `expected exactly 2 [L4] lines (added + living), got ${ls.length}:\n${r.out.trim()}`);
  assert(ls.some((l) => l.includes("cdd/changes/add-r9/specs/app/spec.md")), `one line must name the delta: ${ls.join(" | ")}`);
  assert(ls.some((l) => l.includes("cdd/specs/app/spec.md")), `one line must name the living spec: ${ls.join(" | ")}`);
  assert(fx.skipLines(r).length === 0, `no skip may be granted:\n${r.out.trim()}`);
});

// --- MC5: a second open change gets no cover ---------------------------------------

await check("MC5", "another change's correction never launders a second change's claim", async () => {
  const fx = memFixture();
  fx.addMemoryR2();
  fx.openChange("fix-r2", "modify-clean");
  fx.openChange("sneaky", "add-bad");
  const r = fx.scan();
  assert(r.code !== 0, `the second change's claim must red:\n${r.out.trim()}`);
  assert(fx.skipLines(r).length === 1, `exactly 1 skip (fix-r2's correction), got:\n${r.out.trim()}`);
  const ls = fx.l4Lines(r);
  assert(ls.length === 1, `exactly 1 finding (sneaky's claim), got ${ls.length}:\n${r.out.trim()}`);
  assert(ls[0].includes("cdd/changes/sneaky/specs/app/spec.md"), `the finding must name sneaky's delta: ${ls[0]}`);
});

// --- MC6: a renamed heading breaks the match ---------------------------------------

await check("MC6", "a correction restated under a renamed heading exempts nothing", async () => {
  const fx = memFixture();
  fx.addMemoryR2();
  fx.openChange("fix-r2", "modify-renamed");
  const r = fx.scan();
  assert(r.code !== 0, `the living claim must red — the heading no longer matches:\n${r.out.trim()}`);
  const ls = fx.l4Lines(r);
  assert(ls.length === 1, `exactly 1 finding (the living claim), got ${ls.length}:\n${r.out.trim()}`);
  assert(ls[0].includes("cdd/specs/app/spec.md"), `the finding must name the living spec: ${ls[0]}`);
  assert(fx.skipLines(r).length === 0, `no fuzzy-match skip:\n${r.out.trim()}`);
});

// --- MC7: a correction that keeps the claim reds both -------------------------------

await check("MC7", "a MODIFIED block whose restated Code line keeps the claim reds both lines", async () => {
  const fx = memFixture();
  fx.addMemoryR2();
  fx.openChange("fix-r2", "modify-bad");
  const r = fx.scan();
  assert(r.code !== 0, `a correction that re-claims memory corrects nothing:\n${r.out.trim()}`);
  const ls = fx.l4Lines(r);
  assert(ls.length === 2, `expected exactly 2 [L4] lines (living + delta), got ${ls.length}:\n${r.out.trim()}`);
  assert(ls.some((l) => l.includes("cdd/specs/app/spec.md")), `one line must name the living spec: ${ls.join(" | ")}`);
  assert(ls.some((l) => l.includes("cdd/changes/fix-r2/specs/app/spec.md")), `one line must name the delta: ${ls.join(" | ")}`);
  assert(fx.skipLines(r).length === 0, `no skip for a non-correction:\n${r.out.trim()}`);
});

// --- MC8: the lawful reconfirm path passes both doors -------------------------------

await check("MC8", "a staged ADR edit with nothing claiming it passes both commit doors", async () => {
  const fx = memFixture();
  fx.w("cdd/decisions/0001-note.md", "---\nstatus: accepted\n---\n\nA decision to reconfirm.\n");
  fx.git("add", "cdd/decisions/0001-note.md");
  const staged = fx.run(["--staged"]);
  assert(staged.code === 0, `pre-commit door must pass a reconfirm-only staged set:\n${staged.out.trim()}`);
  assert(/spec-drift: clean/.test(staged.out), `expected the clean summary, got:\n${staged.out.trim()}`);
  const msgFile = path.join(fx.root, "COMMIT_MSG_PROBE");
  fs.writeFileSync(msgFile, "docs(decisions): reconfirm ADR-0001\n");
  const msg = fx.run(["--commit-msg", msgFile]);
  assert(msg.code === 0, `commit-msg door must pass the reconfirm commit:\n${msg.out.trim()}`);
  assert(/spec-drift: clean/.test(msg.out), `expected the clean summary, got:\n${msg.out.trim()}`);
});

// --- MC9: the archive-window door path ---------------------------------------------

await check("MC9", "a staged ADR edit claimed only under correction passes both doors", async () => {
  const fx = memFixture();
  fx.addMemoryR2();
  fx.openChange("fix-r2", "modify-clean");
  fx.w("cdd/decisions/0001-note.md", "---\nstatus: accepted\n---\n\nA decision to reconfirm.\n");
  fx.git("add", "cdd/decisions/0001-note.md");
  const staged = fx.run(["--staged"]);
  assert(staged.code === 0, `pre-commit door must pass while the claim's correction is open:\n${staged.out.trim()}`);
  const msgFile = path.join(fx.root, "COMMIT_MSG_PROBE");
  fs.writeFileSync(msgFile, "docs(decisions): reconfirm ADR-0001\n");
  const msg = fx.run(["--commit-msg", msgFile]);
  assert(msg.code === 0, `commit-msg door must pass the reconfirm commit:\n${msg.out.trim()}`);
});

// --- MC10: a compiled claim with no decisions prefix still reds ---------------------

await check("MC10", "Code: cdd/** claims decision memory through the compiled glob alone", async () => {
  const fx = memFixture();
  fs.mkdirSync(path.join(fx.root, "cdd", "decisions"), { recursive: true });
  fx.w("cdd/decisions/0001-note.md", "---\nstatus: accepted\n---\n\nA decision.\n");
  fx.w("tests/acceptance/app-r2.test.js", "// pin\n");
  const r1 = `### Requirement: R1\n\nThe app greets.\n\n\`\`\`gherkin\nFeature: R1\n\nScenario: greeting\n  Given the app runs\n  When it starts\n  Then it prints a greeting\n  # Verified by: tests/acceptance/app-r1.test.js\n\`\`\`\n\nCode: src/app.js\n`;
  const r2 = `### Requirement: R2\n\nThe app remembers.\n\n\`\`\`gherkin\nFeature: R2\n\nScenario: remembering\n  Given the app runs\n  When it recalls\n  Then it uses the decisions\n  # Verified by: tests/acceptance/app-r2.test.js\n\`\`\`\n\nCode: cdd/**\n`;
  fx.w("cdd/specs/app/spec.md", `# app — living spec\n\n## Requirements\n\n${r1}\n${r2}`);
  fx.git("add", "-A");
  fx.git("commit", "-qm", "spec sync");
  const r = fx.scan();
  assert(r.code !== 0, `a glob with no decisions prefix still claims memory once compiled:\n${r.out.trim()}`);
  const ls = fx.l4Lines(r);
  assert(ls.length === 1, `expected exactly 1 [L4] line, got ${ls.length}:\n${r.out.trim()}`);
  assert(ls[0].includes("cdd/**"), `must name the compiled claim: ${ls[0]}`);
  assert(ls[0].includes("cdd/specs/app/spec.md"), `must name the living spec: ${ls[0]}`);
});

// --- MC11: a half-corrected spec keeps one skip, one red, and a shut door ------------

await check("MC11", "correcting one of two requirements holding the claim exempts nothing", async () => {
  const fx = memFixture();
  fs.mkdirSync(path.join(fx.root, "cdd", "decisions"), { recursive: true });
  fx.w("cdd/decisions/0001-note.md", "---\nstatus: accepted\n---\n\nA decision.\n");
  fx.w("tests/acceptance/app-r2.test.js", "// pin\n");
  fx.w("tests/acceptance/app-r3.test.js", "// pin\n");
  const r1 = `### Requirement: R1\n\nThe app greets.\n\n\`\`\`gherkin\nFeature: R1\n\nScenario: greeting\n  Given the app runs\n  When it starts\n  Then it prints a greeting\n  # Verified by: tests/acceptance/app-r1.test.js\n\`\`\`\n\nCode: src/app.js\n`;
  const r2 = `### Requirement: R2\n\nThe app remembers.\n\n\`\`\`gherkin\nFeature: R2\n\nScenario: remembering\n  Given the app runs\n  When it recalls\n  Then it uses the decisions\n  # Verified by: tests/acceptance/app-r2.test.js\n\`\`\`\n\nCode: src/app.js, cdd/decisions/*.md\n`;
  const r3 = `### Requirement: R3\n\nThe app archives.\n\n\`\`\`gherkin\nFeature: R3\n\nScenario: archiving\n  Given the app runs\n  When it archives\n  Then it keeps the decisions\n  # Verified by: tests/acceptance/app-r3.test.js\n\`\`\`\n\nCode: src/app.js, cdd/decisions/*.md\n`;
  fx.w("cdd/specs/app/spec.md", `# app — living spec\n\n## Requirements\n\n${r1}\n${r2}\n${r3}`);
  fx.git("add", "-A");
  fx.git("commit", "-qm", "spec sync");
  fx.openChange("fix-r2", "modify-clean"); // corrects R2 only; R3 still holds the claim
  const r = fx.scan();
  assert(r.code !== 0, `the uncorrected requirement must red:\n${r.out.trim()}`);
  assert(fx.skipLines(r).length === 1, `exactly 1 skip (R2's correction), got:\n${r.out.trim()}`);
  const ls = fx.l4Lines(r);
  assert(ls.length === 1, `exactly 1 finding, got ${ls.length}:\n${r.out.trim()}`);
  assert(ls[0].includes('"R3"'), `the finding must name R3: ${ls[0]}`);
  fx.w("cdd/decisions/0001-note.md", "---\nstatus: accepted\n---\n\nA decision to reconfirm.\n");
  fx.git("add", "cdd/decisions/0001-note.md");
  const msgFile = path.join(fx.root, "COMMIT_MSG_PROBE");
  fs.writeFileSync(msgFile, "docs(decisions): reconfirm ADR-0001\n");
  const msg = fx.run(["--commit-msg", msgFile]);
  assert(msg.code !== 0, `a claim held by an uncorrected requirement is still code to the doors:\n${msg.out.trim()}`);
  assert(/no spec of app is in this commit/.test(msg.out), `the staged-pair check must fire:\n${msg.out.trim()}`);
});

// --- summary ------------------------------------------------------------------------

console.log(`\nguard-memory-claims: ${pass} pass, ${fail} fail`);
if (failures.length) {
  console.log(failures.map((f) => `  ${f}`).join("\n"));
  process.exit(1);
}
