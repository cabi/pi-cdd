#!/usr/bin/env node
// Acceptance pin for the spec-size signal: Tier A existence warnings and the
// Tier B split-considered demand. Runs the real lib/validate.mjs (imported
// from the repo, never re-implemented) against fixture stores built in tmp
// dirs. Colon discipline: every "fires" fixture delta is colon-free in its
// own raw text — Tier B scans the delta with an unanchored substring test
// (/split-considered:/i over the delta file), so a prose mention of the
// line-kind would satisfy the scan and defeat the test.

import { describe, test, after } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const { validateChange, validateBoth } = await import(path.join(REPO, "lib", "validate.mjs"));

const ROOTS = [];
const makeRoot = () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-sss-"));
  ROOTS.push(root);
  fs.writeFileSync(path.join(root, "pin-target.txt"), "fixture pin target\n");
  return root;
};

// one requirement block with k pinned scenarios (fence-faithful: scenarios
// live inside the gherkin fence, pins are comments inside it)
const reqBlock = (name, k) =>
  `### Requirement: ${name}\n\n\`\`\`gherkin\nFeature: ${name}\n\n${Array.from(
    { length: k },
    (_, i) =>
      `Scenario: ${name} s${i + 1}\n  Given a fixture store\n  When validate runs\n  Then the scenario is counted\n  # Verified by: pin-target.txt`,
  ).join("\n\n")}\n\`\`\`\n`;

const living = (n, fat = {}) =>
  Array.from({ length: n }, (_, i) => reqBlock(`R${i + 1}`, fat[`R${i + 1}`] ?? 1)).join("\n");

const TASKS = `## 1. Context

- [x] 1.1 fixture — verify by pin-target.txt

## 2. Design

## 3. Implementation

- [x] 3.1 fixture — verify by pin-target.txt

## 4. Close

## Done When Traceability

- Done-When: fixture passes → 3.1
`;

// delta file text; splitLine puts the decision line at the TOP of the delta
// file (above "## ADDED Requirements"), where the archive merge drops it
const deltaAdded = (name, k, { splitLine = false, modified = false } = {}) =>
  (splitLine ? "split-considered: fixture — one requirement, one law\n\n" : "") +
  (modified
    ? `## MODIFIED Requirements\n\n${reqBlock(name, k)}`
    : `## ADDED Requirements\n\n${reqBlock(name, k)}`);

const writeStore = (root, { cap = "cap", livingReqs = 2, livingFat = {}, delta, change = "ch" }) => {
  fs.mkdirSync(path.join(root, "cdd", "specs", cap), { recursive: true });
  fs.writeFileSync(path.join(root, "cdd", "specs", cap, "spec.md"), living(livingReqs, livingFat));
  fs.mkdirSync(path.join(root, "cdd", "changes", change, "specs", cap), { recursive: true });
  fs.writeFileSync(path.join(root, "cdd", "changes", change, "specs", cap, "spec.md"), delta);
  fs.writeFileSync(
    path.join(root, "cdd", "changes", change, "proposal.md"),
    "## Why\nfixture\n\n## What Changes\n- fixture\n\n## Solutions Considered\n- fixture\n\n## Non-Goals\n- fixture\n\nDone-When: fixture passes\n\nCode: lib/none.mjs\n",
  );
  fs.writeFileSync(path.join(root, "cdd", "changes", change, "tasks.md"), TASKS);
  return root;
};

const signalWarnings = (v) => v.warnings.filter((w) => w.startsWith("spec-size:"));

describe("spec-size-signal.test.js — spec-size signal pin (real lib/validate.mjs)", () => {
  test('Tier A — over-threshold requirement count warns once in both modes', () => {
    const root = writeStore(makeRoot(), {
      livingReqs: 12,
      delta: deltaAdded("new-req", 3), // colon-free fires text
    });
    const { draft, strict } = validateBoth(root, "ch");
    assert.equal(draft.ok, true, `draft must stay ok, errors: ${JSON.stringify(draft.errors)}`);
    assert.equal(strict.ok, true, `strict must stay ok, errors: ${JSON.stringify(strict.errors)}`);
    const dw = signalWarnings(draft).filter((w) => w.includes("holds 12 requirements"));
    const sw = signalWarnings(strict).filter((w) => w.includes("holds 12 requirements"));
    assert.equal(dw.length, 1, `draft wants exactly 1 count warning, got ${JSON.stringify(draft.warnings)}`);
    assert.equal(sw.length, 1, `strict wants exactly 1 count warning, got ${JSON.stringify(strict.warnings)}`);
    // below the threshold: silent
    const quiet = writeStore(makeRoot(), { livingReqs: 11, delta: deltaAdded("new-req", 3) });
    assert.equal(signalWarnings(validateChange(quiet, "ch", "draft")).length, 0, "11 requirements must stay silent");
  });

  test("Tier A — fat requirements aggregate into one warning line", () => {
    const root = writeStore(makeRoot(), {
      livingReqs: 3,
      livingFat: { R1: 11, R2: 8 }, // fat under living names R1/R2
      delta: deltaAdded("new-req", 2),
    });
    const v = validateChange(root, "ch", "draft");
    assert.equal(v.ok, true, `draft must stay ok, errors: ${JSON.stringify(v.errors)}`);
    const fat = signalWarnings(v).filter((w) => w.includes("scenarios"));
    assert.equal(fat.length, 1, `exactly 1 aggregated fat line, got ${JSON.stringify(v.warnings)}`);
    assert.ok(fat[0].includes("R1, R2"), `the line names the fat requirements, got "${fat[0]}"`);
    // no fat requirement: silent
    const quiet = writeStore(makeRoot(), { livingReqs: 3, livingFat: { R1: 7, R2: 7 }, delta: deltaAdded("new-req", 2) });
    assert.equal(signalWarnings(validateChange(quiet, "ch", "draft")).length, 0, "no fat requirement must stay silent");
  });

  test("Tier A — a delta block grown past the scenario threshold warns", () => {
    // fixture constraint: living spec below 12 requirements with no fat
    // requirement, so the block warning is the only spec-size line
    const grown = writeStore(makeRoot(), { livingReqs: 3, delta: deltaAdded("grown", 8) });
    const v = validateChange(grown, "ch", "draft");
    const sig = signalWarnings(v);
    assert.equal(sig.length, 1, `exactly the block warning, got ${JSON.stringify(v.warnings)}`);
    assert.ok(sig[0].includes('delta requirement "grown" holds 8 scenarios'), `names the block, got "${sig[0]}"`);
    assert.ok(!sig[0].includes("split-considered"), "block warning is not a growth demand");
    // seven scenarios: silent
    const quiet = writeStore(makeRoot(), { livingReqs: 3, delta: deltaAdded("grown", 7) });
    assert.equal(signalWarnings(validateChange(quiet, "ch", "draft")).length, 0, "7 scenarios must stay silent");
    // a MODIFIED block grown past the threshold warns too
    const mod = writeStore(makeRoot(), { livingReqs: 3, delta: deltaAdded("R1", 8, { modified: true }) });
    const mv = validateChange(mod, "ch", "strict");
    assert.equal(
      signalWarnings(mv).filter((w) => w.includes('delta requirement "R1" holds 8 scenarios')).length,
      1,
      `MODIFIED block warns, got ${JSON.stringify(mv.warnings)}`,
    );
    // one delta holding BOTH a grown ADDED and a grown MODIFIED block:
    // one block warning per block (the scenario as written)
    const both = writeStore(makeRoot(), {
      livingReqs: 3,
      delta: `## ADDED Requirements\n\n${reqBlock("grown-b", 8)}\n## MODIFIED Requirements\n\n${reqBlock("R1", 8)}`,
    });
    const bv = validateChange(both, "ch", "strict");
    const blocks = signalWarnings(bv).filter((w) => w.includes("holds 8 scenarios"));
    assert.equal(blocks.length, 2, `both blocks warn in one delta, got ${JSON.stringify(bv.warnings)}`);
    assert.ok(blocks.some((w) => w.includes('"grown-b"')) && blocks.some((w) => w.includes('"R1"')), `each warning names its block, got ${JSON.stringify(blocks)}`);
  });

  test("Tier B — growth into an over-threshold spec demands split consideration", () => {
    const root = writeStore(makeRoot(), { livingReqs: 12, delta: deltaAdded("new-req", 3) }); // colon-free
    const { draft, strict } = validateBoth(root, "ch");
    assert.equal(draft.ok, true, `draft stays ok, errors: ${JSON.stringify(draft.errors)}`);
    assert.equal(strict.ok, true, `strict stays ok, errors: ${JSON.stringify(strict.errors)}`);
    assert.equal(signalWarnings(draft).filter((w) => w.includes("split-considered")).length, 1, `draft sees the demand too, got ${JSON.stringify(draft.warnings)}`);
    const demand = signalWarnings(strict).filter((w) => w.includes("split-considered"));
    assert.equal(demand.length, 1, `exactly 1 demand warning, got ${JSON.stringify(strict.warnings)}`);
    assert.ok(demand[0].includes('ADDED "new-req"'), `names the growth entry, got "${demand[0]}"`);
    // multiple ADDED entries in one delta: still exactly one demand line,
    // naming the count (the demand is per delta, not per entry)
    const multi = writeStore(makeRoot(), {
      livingReqs: 12,
      delta: `## ADDED Requirements\n\n${reqBlock("alpha", 3)}\n${reqBlock("beta", 3)}`,
    });
    const mv = validateBoth(multi, "ch");
    const md = signalWarnings(mv.strict).filter((w) => w.includes("split-considered"));
    assert.equal(md.length, 1, `multi-ADDED delta gets exactly 1 demand warning, got ${JSON.stringify(mv.strict.warnings)}`);
    assert.ok(md[0].includes("2 ADDED requirements grow"), `names the count, got "${md[0]}"`);
    assert.equal(signalWarnings(mv.draft).filter((w) => w.includes("split-considered")).length, 1, `draft too, got ${JSON.stringify(mv.draft.warnings)}`);
  });

  test("Tier B — a split-considered line satisfies the demand", () => {
    const root = writeStore(makeRoot(), {
      livingReqs: 12,
      delta: deltaAdded("new-req", 3, { splitLine: true }), // decision line at delta TOP
    });
    const { draft, strict } = validateBoth(root, "ch");
    assert.equal(draft.ok, true, `draft stays ok, errors: ${JSON.stringify(draft.errors)}`);
    assert.equal(strict.ok, true, `strict stays ok, errors: ${JSON.stringify(strict.errors)}`);
    assert.equal(
      signalWarnings(strict).filter((w) => w.includes("split-considered")).length,
      0,
      `no demand warning with the line, got ${JSON.stringify(strict.warnings)}`,
    );
    assert.equal(
      signalWarnings(draft).filter((w) => w.includes("split-considered")).length,
      0,
      `draft too: no demand warning with the line, got ${JSON.stringify(draft.warnings)}`,
    );
    assert.equal(signalWarnings(strict).length, 1, `only the count line remains, got ${JSON.stringify(strict.warnings)}`);
  });

  test("Never blocks — all four signal warnings leave ok true in both modes", () => {
    const root = writeStore(makeRoot(), {
      livingReqs: 12,
      livingFat: { R1: 11 },
      delta: deltaAdded("big", 8), // colon-free: count + fat + block + growth
    });
    const { draft, strict } = validateBoth(root, "ch");
    assert.equal(draft.ok, true, `draft ok with 4 standing warnings, errors: ${JSON.stringify(draft.errors)}`);
    assert.equal(strict.ok, true, `strict ok with 4 standing warnings, errors: ${JSON.stringify(strict.errors)}`);
    assert.equal(signalWarnings(draft).length, 4, `draft sees all four, got ${JSON.stringify(draft.warnings)}`);
    assert.equal(signalWarnings(strict).length, 4, `strict sees all four, got ${JSON.stringify(strict.warnings)}`);
    assert.equal(strict.errors.filter((e) => e.includes("spec-size")).length, 0, "no signal error anywhere");
  });
});

after(() => {
  for (const r of ROOTS) fs.rmSync(r, { recursive: true, force: true });
});
