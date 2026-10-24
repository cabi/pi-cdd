#!/usr/bin/env node
// Acceptance pins — one check per scenario. Fixture A: git store, 3 path
// commits, 7-layout reviews fixture, red-records present. Fixture B: non-git
// store, lying declared-counts file, zero-severity file. Fixture C: read-only
// pre-existing metrics.md forces a total stamp failure. Fixture D: git store
// with exactly 1 path commit (the elapsed boundary). All checks are observed
// red before the stamp module exists; the red outputs live in the change
// folder's red-records file.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const lib = await import(path.join(REPO, "lib", "store.mjs"));
const val = await import(path.join(REPO, "lib", "validate.mjs"));
let metricsMod = null;
try {
  metricsMod = await import(path.join(REPO, "lib", "metrics.mjs"));
} catch {
  metricsMod = null; // RED phase: the module does not exist yet
}

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
const rmAll = (root) => {
  try { fs.chmodSync(root, 0o755); } catch {}
  fs.rmSync(root, { recursive: true, force: true });
};

const proposalText = () => `# stamp-me

## Why

fixture change for the metrics stamp.

Done-When: it archives — verify tests/acceptance/fixture-pin.test.js
Done-When: it counts — verify tests/acceptance/fixture-pin.test.js

## What Changes

- a fixture delta and reviews folder

## Solutions Considered

- stdlib covers it

## Non-Goals

- one declined thing
- another declined thing
- a third declined thing

## Capabilities

- cap

Code: fixture.js
`;

const deltaText = () => `## ADDED Requirements

### Requirement: Fixture requirement

Fixture.

\`\`\`gherkin
Feature: Fixture requirement

Scenario: One
  Given a fixture store
  When the fixture runs
  Then it works
  # Verified by: tests/acceptance/fixture-pin.test.js

Scenario: Two
  Given a fixture store
  When the fixture counts
  Then it counts
  # Verified by: tests/acceptance/fixture-pin.test.js

Scenario: Three
  Given a fixture store
  When the fixture merges
  Then it merges
  # Verified by: tests/acceptance/fixture-pin.test.js

Scenario: Four
  Given a fixture store
  When the fixture stamps
  Then it stamps
  # Verified by: tests/acceptance/fixture-pin.test.js
\`\`\`
`;

const tasksText = (tick31) => `# T

## 1. Context

- [x] 1.1 c

## 2. Design

- [x] 2.1 d

## 3. Implementation

- [${tick31 ? "x" : " "}] 3.1 impl — verify by tests/acceptance/fixture-pin.test.js
- [x] 3.2 more — verify by tests/acceptance/fixture-pin.test.js

## Done When Traceability

| it archives | 3.1 |
| it counts | 3.2 |

## 4. Close

- [ ] 4.1 c
`;

// The seven findings layouts observed in the archive corpus (phase 0,
// research/2026-10-24-archive-metrics.md Method) — one file each.
const LAYOUTS = {
  "r2-change-review.md": `# r2
|severity|finding|evidence|disposition|
|---|---|---|---|
|blocker|a|p:1|fixed: done|
|should|b|p:2|open|

## Counts

1 blocker, 1 should, 0 note
`,
  "r1-proposal-review.md": `# r1

### F1 — should — the why is vague

### F2 — note — typo in evidence
`,
  "r3-standards-code-review.md": `# r3 standards
|severity|finding|evidence|disposition|
|---|---|---|---|
|should|s|p:3|fixed: done|

**Counts:** 0 blocker, 1 should, 0 note
`,
  "r3-spec-code-review.md": `# r3 spec

### [blocker] F1 — scenario not implemented
`,
  "r3-code-review.md": `# r3 combined era-1

### 1. Heading drift — should

### 2. Stale comment — note
`,
  "adr-review.md": `# adr

### should — ADR-0007 missing trade-off — DISPOSED fixed
`,
  "r2-voided-run1.md": `# r2 voided run

- **note** — superseded by the live run — Disposition: won't-fix: voided.
`,
};

function buildStore({ git }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-stamp-"));
  sandboxes.push(root);
  fs.mkdirSync(path.join(root, "tests", "acceptance"), { recursive: true });
  fs.writeFileSync(path.join(root, "tests", "acceptance", "fixture-pin.test.js"), "// pin\n");
  if (git) {
    const g = (...a) => execFileSync("git", a, { cwd: root, encoding: "utf8" });
    g("init", "-q");
    g("config", "user.email", "t@t");
    g("config", "user.name", "t");
    lib.initStore(root, REPO, { ci: "none", hooks: false });
  } else {
    lib.initStore(root, REPO, { ci: "none", hooks: false });
  }
  lib.createChange(root, "stamp-me", ["cap"]);
  const dir = path.join(root, "cdd", "changes", "stamp-me");
  fs.writeFileSync(path.join(dir, "proposal.md"), proposalText());
  fs.writeFileSync(path.join(dir, "specs", "cap", "spec.md"), deltaText());
  fs.writeFileSync(path.join(dir, "tasks.md"), tasksText(true));
  const commit = (msg) => {
    execFileSync("git", ["add", "-A"], { cwd: root });
    execFileSync("git", ["commit", "-qm", msg], { cwd: root });
  };
  return { root, dir, commit };
}

// --- fixture A: git store, 3 path commits, 7 layouts, red-records -----------

const A = buildStore({ git: true });
const AReviews = path.join(A.dir, "reviews");
fs.mkdirSync(AReviews, { recursive: true });
for (const [name, body] of Object.entries(LAYOUTS)) fs.writeFileSync(path.join(AReviews, name), body);
fs.writeFileSync(path.join(AReviews, "red-records.md"), "# red records\n\nM1 FAIL stamp absent\n");
A.commit("c1 change complete"); // first commit: change folder complete, impl tasks ticked
fs.writeFileSync(path.join(AReviews, "r1-proposal-review.md"), LAYOUTS["r1-proposal-review.md"] + "\n(extra prose)");
A.commit("c2 review touch");
fs.writeFileSync(path.join(A.dir, "tasks.md"), tasksText(false));
A.commit("c3 untick 3.1");
fs.writeFileSync(path.join(A.dir, "tasks.md"), tasksText(true)); // re-tick on disk, uncommitted

const readStamp = (root, archivedTo) => {
  try {
    return fs.readFileSync(path.join(root, archivedTo, "metrics.md"), "utf8");
  } catch {
    return null; // RED phase: the stamp does not exist yet
  }
};
const vA = val.validateChange(A.root, "stamp-me", "strict");
assert(vA.ok, "fixture A must be strict-valid: " + val.formatVerdict(vA));
const rA = lib.archiveChange(A.root, "stamp-me");
const stampA = readStamp(A.root, rA.archivedTo);

// --- fixture B: non-git store, lying declared counts, zero-severity file ----

const B = buildStore({ git: false });
const BReviews = path.join(B.dir, "reviews");
fs.mkdirSync(BReviews, { recursive: true });
fs.writeFileSync(
  path.join(BReviews, "r2-change-review.md"),
  `# r2
|severity|finding|evidence|disposition|
|---|---|---|---|
|blocker|a|p:1|fixed: done|
|should|b|p:2|open|
|should|c|p:3|won't-fix: nah|

**Counts:** 0 blocker, 0 should, 0 note
`,
);
fs.writeFileSync(path.join(BReviews, "r1-proposal-review.md"), "# r1\n\nNo findings this run.\n");
const vB = val.validateChange(B.root, "stamp-me", "strict");
assert(vB.ok, "fixture B must be strict-valid: " + val.formatVerdict(vB));
const rB = lib.archiveChange(B.root, "stamp-me");
const stampB = readStamp(B.root, rB.archivedTo);

// --- fixture C: total stamp failure (read-only pre-existing metrics.md) -----

const C = buildStore({ git: false });
fs.writeFileSync(path.join(C.dir, "metrics.md"), "stale\n");
fs.chmodSync(path.join(C.dir, "metrics.md"), 0o444);
const vC = val.validateChange(C.root, "stamp-me", "strict");
assert(vC.ok, "fixture C must be strict-valid: " + val.formatVerdict(vC));
const rC = lib.archiveChange(C.root, "stamp-me");

// --- fixture D: git store with exactly 1 path commit (elapsed boundary) -----

const D = buildStore({ git: true });
D.commit("c1 only");
const vD = val.validateChange(D.root, "stamp-me", "strict");
assert(vD.ok, "fixture D must be strict-valid: " + val.formatVerdict(vD));
const rD = lib.archiveChange(D.root, "stamp-me");
const stampD = readStamp(D.root, rD.archivedTo);

// --- M1: the stamp lands in the archive folder ------------------------------

await check("M1", "archive writes metrics.md with the spec-strength block", () => {
  assert(rA.ok, "archive failed: " + JSON.stringify(rA));
  assert(rA.metrics && rA.metrics.stamped === true, "archive result missing stamp outcome: " + JSON.stringify(rA.metrics ?? null));
  assert(fs.existsSync(path.join(A.root, rA.archivedTo, "metrics.md")), "metrics.md not in archive folder");
  assert(/^done-whens: 2$/m.test(stampA), "done-whens not 2:\n" + stampA);
  assert(/^non-goals: 3$/m.test(stampA), "non-goals not 3:\n" + stampA);
  assert(/^delta-requirements: added 1 \/ modified 0 \/ removed 0$/m.test(stampA), "delta-requirements wrong:\n" + stampA);
  assert(/^delta-scenarios: 4$/m.test(stampA), "delta-scenarios not 4:\n" + stampA);
  assert(/^subtasks: 5$/m.test(stampA), "subtasks not 5:\n" + stampA);
});

// --- M2: counts equal direct counts; single parse import ---------------------

await check("M2", "stamped counts equal direct counts and ride the single parse", () => {
  const proposal = proposalText();
  const delta = deltaText();
  const tasks = tasksText(true);
  const direct = {
    doneWhens: (proposal.match(/^Done-When:/gm) ?? []).length,
    nonGoals: (proposal.split("## Non-Goals")[1].split("##")[0].match(/^- /gm) ?? []).length,
    reqs: (delta.match(/^### Requirement:/gm) ?? []).length,
    scenarios: (delta.match(/^Scenario:/gm) ?? []).length,
    subtasks: (tasks.match(/^- \[[ x]\]/gm) ?? []).length,
  };
  assert(direct.doneWhens === 2 && direct.nonGoals === 3 && direct.reqs === 1 && direct.scenarios === 4 && direct.subtasks === 5,
    "fixture ground truth drifted: " + JSON.stringify(direct));
  assert(/^done-whens: 2$/m.test(stampA) && /^non-goals: 3$/m.test(stampA), "count drift vs direct counts:\n" + stampA);
  const src = fs.readFileSync(path.join(REPO, "lib", "metrics.mjs"), "utf8");
  assert(/from "\.\.\/scripts\/grammar-law\.mjs"/.test(src), "lib/metrics.mjs does not import the canonical grammar-law single parse");
  assert(typeof metricsMod?.deriveStamp === "function", "lib/metrics.mjs does not export deriveStamp");
});

// --- M3: review yield counts every observed layout ---------------------------

await check("M3", "all 7 findings layouts counted, one format-version line, zero-row file is 0", () => {
  const line = (f) => stampA.split("\n").find((l) => l.startsWith(f)) ?? "";
  assert(/blocker 1 \/ should 1 \/ note 0 .*fixed 1 \/ open 1 \/ won't-fix 0/.test(line("r2-change-review.md:")), "r2 table row wrong: " + line("r2-change-review.md:"));
  assert(/blocker 0 \/ should 1 \/ note 1 .*fixed 0 \/ open 0 \/ won't-fix 0/.test(line("r1-proposal-review.md:")), "r1 heading layout wrong: " + line("r1-proposal-review.md:"));
  assert(/blocker 0 \/ should 1 \/ note 0 .*fixed 1 \/ open 0 \/ won't-fix 0/.test(line("r3-standards-code-review.md:")), "standards table wrong: " + line("r3-standards-code-review.md:"));
  assert(/blocker 1 \/ should 0 \/ note 0 .*fixed 0 \/ open 0 \/ won't-fix 0/.test(line("r3-spec-code-review.md:")), "bracketed heading wrong: " + line("r3-spec-code-review.md:"));
  assert(/blocker 0 \/ should 1 \/ note 1 .*fixed 0 \/ open 0 \/ won't-fix 0/.test(line("r3-code-review.md:")), "numbered-title layout wrong: " + line("r3-code-review.md:"));
  assert(/blocker 0 \/ should 1 \/ note 0 .*fixed 1 \/ open 0 \/ won't-fix 0/.test(line("adr-review.md:")), "DISPOSED heading wrong: " + line("adr-review.md:"));
  assert(/blocker 0 \/ should 0 \/ note 1 .*fixed 0 \/ open 0 \/ won't-fix 1/.test(line("r2-voided-run1.md:")), "bullet layout wrong: " + line("r2-voided-run1.md:"));
  assert((stampA.match(/^findings-format-version:/gm) ?? []).length === 1, "not exactly 1 format-version line:\n" + stampA);
  assert(/^red-records: present$/m.test(stampA), "red-records presence not stamped");
  assert(/r1-proposal-review\.md:.*0 findings/.test(stampB) || /blocker 0 \/ should 0 \/ note 0/.test(stampB.split("\n").find((l) => l.startsWith("r1-proposal-review.md:")) ?? ""),
    "zero-severity file did not contribute 0 in fixture B:\n" + stampB);
});

// --- M4: a declared count that lies is stamped as a mismatch -----------------

await check("M4", "lying declared counts yield exactly 1 mismatch line; parsed numbers win", () => {
  const mismatches = stampB.split("\n").filter((l) => /^declared-counts-mismatch:/.test(l));
  assert(mismatches.length === 1, "not exactly 1 mismatch line:\n" + stampB);
  assert(/r2-change-review\.md/.test(mismatches[0]), "mismatch line does not name the file");
  assert(/0 blocker, 0 should, 0 note/.test(mismatches[0]) && /1 blocker, 2 should, 0 note/.test(mismatches[0]),
    "mismatch line does not carry declared vs parsed numbers: " + mismatches[0]);
  assert(/r2-change-review\.md:.*blocker 1 \/ should 2 \/ note 0.*fixed 1 \/ open 1 \/ won't-fix 1/.test(stampB), "review-yield did not use parsed numbers:\n" + stampB);
});

// --- M5: git facts carry their as-of-stamp label -----------------------------

await check("M5", "3 labeled derivable git facts, beyond-2-norm omitted-with-reason, honest gaps named", () => {
  assert(/^commits-before-archive: 3 \(as-of-stamp\)$/m.test(stampA), "commits-before-archive not 3 as-of-stamp:\n" + stampA);
  assert(/^elapsed-so-far: .+ \(as-of-stamp\)$/m.test(stampA), "elapsed-so-far missing or unlabeled:\n" + stampA);
  assert(/^re-ticks-commit-visible: 1 \(as-of-stamp\)$/m.test(stampA), "re-ticks not 1 as-of-stamp:\n" + stampA);
  assert(/^beyond-2-norm: omitted-with-reason: /m.test(stampA), "beyond-2-norm not omitted-with-reason:\n" + stampA);
  // the <2-commit boundary: elapsed is not-derivable with a reason, never guessed
  assert(/^commits-before-archive: 1 \(as-of-stamp\)$/m.test(stampD), "1-commit store did not stamp commits-before-archive 1:\n" + stampD);
  assert(/^elapsed-so-far: not-derivable: /m.test(stampD) && /fewer than 2 commits/.test(stampD),
    "elapsed below 2 commits is not not-derivable-with-reason:\n" + stampD);
  const gaps = stampA.split("# honest gaps")[1] ?? "";
  assert(/feature→archive gap|feature-to-archive gap/.test(gaps), "honest gaps missing feature→archive gap: " + gaps);
  assert(/agent-only time/.test(gaps), "honest gaps missing agent-only time");
  assert(/session-token cost/.test(gaps), "honest gaps missing session-token cost");
});

// --- M6: an underivable field states its reason ------------------------------

await check("M6", "non-git store stamps git fields not-derivable, never estimated", () => {
  assert(rB.ok, "non-git archive failed: " + JSON.stringify(rB));
  assert(/^commits-before-archive: not-derivable: /m.test(stampB), "commits not stamped not-derivable:\n" + stampB);
  assert(/^elapsed-so-far: not-derivable: /m.test(stampB), "elapsed not stamped not-derivable");
  assert(/^re-ticks-commit-visible: not-derivable: /m.test(stampB), "re-ticks not stamped not-derivable");
  const conv = stampB.split("# convergence")[1].split("#")[0];
  assert(!/\d+ second|\d+ commit/.test(conv.replace(/not-derivable: no git store/g, "")), "convergence block carries an estimated value:\n" + conv);
  assert(/^done-whens: 2$/m.test(stampB), "spec-strength lost its numbers in the non-git store:\n" + stampB);
  assert(/r2-change-review\.md:/.test(stampB), "review yield lost its numbers in the non-git store");
});

// --- M7: a total stamp failure never gates the archive ------------------------

await check("M7", "total stamp failure archives anyway with stamped:false + reason", () => {
  assert(rC.ok, "archive failed under stamp failure: " + JSON.stringify(rC));
  assert(fs.readdirSync(path.join(C.root, "cdd", "archive"))[0].endsWith("-stamp-me"), "archive folder missing after stamp failure");
  assert(rC.metrics && rC.metrics.stamped === false, "result missing stamped:false: " + JSON.stringify(rC.metrics ?? null));
  assert(typeof rC.metrics?.reason === "string" && rC.metrics.reason.length > 0, "stamp failure reason missing");
});

for (const s of sandboxes) rmAll(s);
console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) {
  console.log(failures.join("\n"));
  process.exit(1);
}
