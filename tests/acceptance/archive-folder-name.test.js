#!/usr/bin/env node
// archive-folder-name — the archive folder name end to end through the real
// door (lib/store.mjs archiveChange over sandbox stores): dated and bare
// change names, the reported archivedTo path, the stamped metrics file.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const lib = await import(path.join(REPO, "lib", "store.mjs"));

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

const stamp8 = () => new Date().toISOString().slice(0, 10).replace(/-/g, "");
const sandboxes = [];
function store() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-afn-"));
  sandboxes.push(root);
  lib.initStore(root, REPO, { ci: "none", hooks: false });
  return root;
}
const rmAll = () => {
  for (const r of sandboxes) fs.rmSync(r, { recursive: true, force: true });
};

// one closable change under a sandbox store, named `name`
function closable(root, name) {
  lib.createChange(root, name, ["cap"]);
  const fill = (rel, text) => fs.writeFileSync(path.join(root, rel), text);
  fill(`cdd/changes/${name}/proposal.md`, `# ${name}

## Why

fixture.

## What Changes

- a fixture change closes and archives

## Solutions Considered

- stdlib covers it

## Non-Goals

- none beyond scope

Done-When: it archives — verify tests/acceptance/fixture-pin.test.js
Code: fixture.js
`);
  fill(`cdd/changes/${name}/specs/cap/spec.md`, `## ADDED Requirements

### Requirement: Fixture requirement

Fixture.

\`\`\`gherkin
Feature: Fixture requirement

Scenario: Fixture
  Given a fixture store
  When the fixture runs
  Then it works
  # Verified by: tests/acceptance/fixture-pin.test.js
\`\`\`
`);
  fill(`cdd/changes/${name}/tasks.md`, `# Tasks — ${name}

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

- [x] 2.1 Design gate: single scenario, one task — no split needed

## 3. Implementation

- [x] 3.1 fixture — verify by tests/acceptance/fixture-pin.test.js

## Done When Traceability

| it archives | 3.1 |

## 4. Close

- [ ] 4.1 cdd validate strict green, guard green
- [ ] 4.2 Archive — pair-commit: feature commit, then archive commit
`);
  fill("tests/acceptance/fixture-pin.test.js", "// pin target\n");
}

// exactly one leading yyyymmdd- date prefix, and the slug after it starts with no date
const singleDated = (folder) => /^\d{8}-(?!\d{8}-)/.test(folder);

check("AF1", "a dated change name strips exactly one leading date segment", () => {
  const root = store();
  closable(root, "20200101-legacy-thing");
  const r = lib.archiveChange(root, "20200101-legacy-thing");
  assert(r.ok, JSON.stringify(r));
  const folders = fs.readdirSync(path.join(root, "cdd", "archive"));
  assert(folders.length === 1 && folders[0] === `${stamp8()}-legacy-thing`, `folder must be <stamp>-legacy-thing, got ${JSON.stringify(folders)}`);
  assert(singleDated(folders[0]), `exactly 1 date prefix: ${folders[0]}`);
  assert(r.archivedTo === `cdd/archive/${stamp8()}-legacy-thing/`, `archivedTo must name it: ${r.archivedTo}`);
});

check("AF2", "a bare change name appends unchanged", () => {
  const root = store();
  closable(root, "plain-bare-name");
  const r = lib.archiveChange(root, "plain-bare-name");
  assert(r.ok, JSON.stringify(r));
  const folders = fs.readdirSync(path.join(root, "cdd", "archive"));
  assert(folders.length === 1 && folders[0] === `${stamp8()}-plain-bare-name`, `folder must be <stamp>-plain-bare-name, got ${JSON.stringify(folders)}`);
  assert(r.archivedTo === `cdd/archive/${stamp8()}-plain-bare-name/`, `archivedTo must name it: ${r.archivedTo}`);
});

check("AF3", "the archived folder never carries a doubled date prefix (name date = stamp date)", () => {
  const root = store();
  closable(root, `${stamp8()}-same-day-thing`);
  const r = lib.archiveChange(root, `${stamp8()}-same-day-thing`);
  assert(r.ok, JSON.stringify(r));
  const folders = fs.readdirSync(path.join(root, "cdd", "archive"));
  assert(folders.length === 1 && folders[0] === `${stamp8()}-same-day-thing`, `one date prefix total, got ${JSON.stringify(folders)}`);
  assert(singleDated(folders[0]), `exactly 1 date prefix: ${folders[0]}`);
  assert(fs.existsSync(path.join(root, r.archivedTo)), `reported path names the on-disk folder: ${r.archivedTo}`);
});

check("AF4", "the reported archive path locates the stamped metrics file", () => {
  const root = store();
  closable(root, "20200101-metrics-thing");
  const r = lib.archiveChange(root, "20200101-metrics-thing");
  assert(r.ok, JSON.stringify(r));
  const folders = fs.readdirSync(path.join(root, "cdd", "archive"));
  assert(folders.length === 1, `exactly 1 archived folder: ${JSON.stringify(folders)}`);
  const metricsPath = path.join(root, r.archivedTo, "metrics.md");
  assert(fs.existsSync(metricsPath), `metrics.md readable through archivedTo: ${r.archivedTo}`);
  const text = fs.readFileSync(metricsPath, "utf8");
  assert(text.startsWith("# metrics — "), `stamped metrics file: ${text.slice(0, 40)}`);
});

rmAll();
console.log(`\narchive-folder-name: ${pass} passed, ${fail} failed`);
if (failures.length) {
  for (const f of failures) console.error(`  ${f}`);
  process.exitCode = 1;
}
