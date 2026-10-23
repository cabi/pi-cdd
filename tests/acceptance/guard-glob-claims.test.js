#!/usr/bin/env node
// guard-glob-claims — PF-20's pin: a Code glob compiles to exactly the files
// it names. Every probe stages one file against a sandbox spec whose Code
// line claims it and asks the real commit-msg door: a claimed file with no
// spec of its capability staged must red the staged-pair check; an unclaimed
// file must stay green. Pre-fix, every single-star and character-class glob
// compiled to a pattern demanding a literal "[" (the escape pass ate the
// star's translation), so the claimed-file probes passed the door silently —
// these are the probes that caught PF-20, kept red-first honest.

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

// A sandbox git store whose capability `app` claims exactly `globs`; every
// name in `files` is committed. The door is the store's own guard copy.
function globFixture(globs, files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-gg-"));
  fs.mkdirSync(path.join(root, "tests", "acceptance"), { recursive: true });
  const git = (...a) => execFileSync("git", a, { cwd: root, encoding: "utf8" });
  git("init", "-q");
  git("config", "user.email", "t@t");
  git("config", "user.name", "t");
  lib.initStore(root, REPO, {});
  fs.symlinkSync(path.join(REPO, "node_modules"), path.join(root, "node_modules"), "dir");
  const w = (rel, t) => fs.writeFileSync(path.join(root, rel), t);
  fs.mkdirSync(path.join(root, "cdd", "specs", "app"), { recursive: true });
  const spec = `# app — living spec\n\n## Requirements\n\n### Requirement: R1\n\nThe app greets.\n\n\`\`\`gherkin\nFeature: R1\n\nScenario: greeting\n  Given the app runs\n  When it starts\n  Then it prints a greeting\n  # Verified by: tests/acceptance/app-r1.test.js\n\`\`\`\n\nCode: ${globs.join(", ")}\n`;
  w("cdd/specs/app/spec.md", spec);
  w("tests/acceptance/app-r1.test.js", "// pin\n");
  for (const f of files) {
    fs.mkdirSync(path.join(root, path.dirname(f)), { recursive: true });
    w(f, `// ${f}\n`);
  }
  git("add", ".");
  git("commit", "-qm", "initial: spec + code + pin in sync");

  const msgFile = path.join(root, "COMMIT_MSG_PROBE");
  const door = (rel) => {
    fs.writeFileSync(msgFile, "feat(app): stage a file with no spec of app\n");
    try {
      const out = execFileSync("node", [path.join(root, "cdd", "scripts", "spec-drift.mjs"), "--commit-msg", msgFile], {
        encoding: "utf8",
        cwd: root,
        stdio: ["ignore", "pipe", "pipe"],
      });
      return { code: 0, out };
    } catch (e) {
      return { code: e.status ?? 1, out: (e.stdout ?? "") + (e.stderr ?? "") };
    }
  };
  // stage exactly one committed file (a content edit), run the door, unstage
  const stage = (rel) => {
    fs.appendFileSync(path.join(root, rel), "// probe edit\n");
    git("add", rel);
    const r = door(rel);
    git("restore", "--staged", rel);
    git("checkout", "--", rel);
    return r;
  };
  return { root, git, stage, door };
}

// --- GGC1: a single star claims within one directory ---------------------------

await check("GGC1", "src/*.mjs claims src/app.mjs but neither src/app.js nor src/sub/app.mjs", async () => {
  const fx = globFixture(["src/*.mjs"], ["src/app.mjs", "src/app.js", "src/sub/app.mjs"]);
  const claimed = fx.stage("src/app.mjs");
  assert(claimed.code !== 0, `staged src/app.mjs (claimed by src/*.mjs) must red the door — PF-20 shape if green`);
  assert(claimed.out.includes("src/app.mjs"), `red must name src/app.mjs:\n${claimed.out.trim()}`);
  for (const unclaimed of ["src/app.js", "src/sub/app.mjs"]) {
    const r = fx.stage(unclaimed);
    assert(r.code === 0, `staged ${unclaimed} is claimed by no glob — door must stay green:\n${r.out.trim()}`);
    assert(/spec-drift: clean/.test(r.out), `expected the clean summary, got:\n${r.out.trim()}`);
  }
});

// --- GGC2: a double star claims across directories -----------------------------

await check("GGC2", "src/** claims src/app.js and src/deep/b.js alike", async () => {
  const fx = globFixture(["src/**"], ["src/app.js", "src/deep/b.js"]);
  for (const f of ["src/app.js", "src/deep/b.js"]) {
    const r = fx.stage(f);
    assert(r.code !== 0, `staged ${f} (claimed by src/**, across separators) must red the door`);
    assert(r.out.includes(f), `red must name ${f}:\n${r.out.trim()}`);
  }
});

// --- GGC3: a character class claims its members and only them ------------------

await check("GGC3", "cfg/[ab].mjs claims cfg/a.mjs and cfg/b.mjs; cfg/[!ab].mjs claims cfg/c.mjs", async () => {
  const fx = globFixture(["cfg/[ab].mjs", "cfg/[!ab].mjs"], ["cfg/a.mjs", "cfg/b.mjs", "cfg/c.mjs"]);
  for (const member of ["cfg/a.mjs", "cfg/b.mjs"]) {
    const r = fx.stage(member);
    assert(r.code !== 0, `staged ${member} (member of [ab]) must red the door — PF-20 shape if green`);
    assert(r.out.includes(member), `red must name ${member}:\n${r.out.trim()}`);
  }
  const negated = fx.stage("cfg/c.mjs");
  assert(negated.code !== 0, `staged cfg/c.mjs (matched by [!ab], not by [ab]) must red the door`);
  assert(negated.out.includes("cfg/c.mjs"), `red must name cfg/c.mjs:\n${negated.out.trim()}`);
});

// --- GGC4: a literal dot stays literal ------------------------------------------

await check("GGC4", "cfg/v1.2.mjs does not claim cfg/v1X2.mjs", async () => {
  const fx = globFixture(["cfg/v1.2.mjs"], ["cfg/v1.2.mjs", "cfg/v1X2.mjs"]);
  const r = fx.stage("cfg/v1X2.mjs");
  assert(r.code === 0, `staged cfg/v1X2.mjs is claimed by no glob — the dot is a dot, not any character:\n${r.out.trim()}`);
  assert(/spec-drift: clean/.test(r.out), `expected the clean summary, got:\n${r.out.trim()}`);
});

// --- GGC5: an unterminated class span is literal text ---------------------------

await check("GGC5", "cfg/[ab.mjs claims the file literally named cfg/[ab.mjs", async () => {
  const fx = globFixture(["cfg/[ab.mjs"], ["cfg/[ab.mjs"]);
  const r = fx.stage("cfg/[ab.mjs");
  assert(r.code !== 0, `staged cfg/[ab.mjs (literal bracket, unterminated span) must red the door`);
  assert(r.out.includes("cfg/[ab.mjs"), `red must name cfg/[ab.mjs:\n${r.out.trim()}`);
});

// --- GGC6: an empty class span is literal text -----------------------------------

await check("GGC6", "cfg/[].mjs and cfg/[!].mjs claim the literal file, not nothing", async () => {
  const fx = globFixture(["cfg/[].mjs", "cfg/[!].mjs"], ["cfg/[].mjs", "cfg/[!].mjs"]);
  for (const f of ["cfg/[].mjs", "cfg/[!].mjs"]) {
    const r = fx.stage(f);
    assert(r.code !== 0, `staged ${f} (empty class = literal bracket, never a silent no-match) must red the door`);
    assert(r.out.includes(f), `red must name ${f}:\n${r.out.trim()}`);
  }
});

// --- summary --------------------------------------------------------------------

console.log(`\nguard-glob-claims: ${pass} pass, ${fail} fail`);
if (failures.length) {
  console.log(failures.map((f) => `  ${f}`).join("\n"));
  process.exit(1);
}
