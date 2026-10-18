// templates.mjs — the form of every artifact. Ambient carries the method,
// these files carry the form (ADR-0004). Zero dependencies by ADR-0001.

import * as fs from "node:fs";
import * as path from "node:path";

export const RULES_MD = `# cdd rules — the contract of this repository

Code is the truth, the spec is the index. This file is the method's law;
the guard (cdd/scripts/spec-drift.mjs) enforces the machine-checkable parts.

1. **The store** — everything contractual lives in cdd/ as plain markdown:
   changes in flight, living specs, archive history, decisions.
2. **The change loop** — design gate → proposal → delta → tasks →
   implement with acceptance tests → archive. One change folder per change.
3. **Proposal** — ## Why, ## What Changes, one \`Done-When:\` line, one
   \`Code: <globs>\` line naming the implementation surface.
4. **Delta** — \`## ADDED | MODIFIED | REMOVED Requirements\` →
   \`### Requirement: <name>\` → \`#### Scenario: <name>\`; every scenario
   ends with \`Verified by: tests/acceptance/<path>\`.
5. **MODIFIED and REMOVED** only name requirements that exist in the
   living spec. ADDED must not duplicate a living requirement.
6. **Tasks** — four steps (context → design → implementation → close);
   every implementation subtask carries \`verify by <test>\`; more than 8
   implementation subtasks is the split signal — split at the design gate,
   record \`split-considered:\` if you keep it whole.
7. **Test-first** — the acceptance test a subtask names exists before the
   subtask is checked. A scenario without a committed pin is a wish.
8. **Mechanical changes** — behavior-preserving sweeps declare
   \`Mechanical-Change: <reason>\` in the commit message; they age no spec
   and never touch cdd/specs/ or acceptance tests.
9. **Doors** — door 1 is this loop (human + agent judgment), door 2 is the
   pre-commit guard, door 3 is CI running the same guard, full scan.
10. **No spec markers in source code** — traceability lives in the cdd/
    tree only; code↔spec correlation is Code: globs plus git history.
11. **Archive** — strict validation green (every task outside Close ticked;
    the archive ticks the Close section itself) and guard green; deltas merge
    into the living spec; feature commit and archive commit travel as a pair.
12. **Decisions** — hard to reverse, surprising without context, a real
    trade-off, crossing capabilities → cdd/decisions/ (A0/A1/A2 rules in
    cdd/scripts/arch-extract.mjs).
`;

export function proposalTemplate(name) {
  return `# ${name}

## Why

<One paragraph: the pressure this change answers. If you cannot name the pressure, there is no change.>

## What Changes

- <What the system will promise differently, as bullets>

Done-When: <one measurable line — how you know the change landed>
Code: <glob>, <glob>
`;
}

export function deltaTemplate(capability) {
  return `## ADDED Requirements

### Requirement: <name>

<One or two sentences: the promise, in user-visible terms.>

#### Scenario: <name>

<Concrete Given/When/Then prose. One behavior per scenario.>
Verified by: tests/acceptance/${capability}-<scenario>.test.js
`;
}

export function tasksTemplate(name) {
  return `# Tasks — ${name}

## 1. Context

- [ ] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

- [ ] 2.1 Design gate: model the change before writing artifacts; if it needs more than 8 implementation subtasks, split now

## 3. Implementation

- [ ] 3.1 <task> — verify by tests/acceptance/<pin>.test.js

## 4. Close

- [ ] 4.1 cdd_validate strict green, guard green
- [ ] 4.2 Archive — pair-commit: feature commit, then archive commit
`;
}

export const PRE_COMMIT = `#!/bin/sh
# door 2 — the drift guard on every commit (staged scan)
node cdd/scripts/spec-drift.mjs --staged
`;

export const CI_GITHUB = `name: cdd
on:
  push:
  pull_request:
jobs:
  guard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      # door 3 — full scan: the same guard the pre-commit hook runs
      - run: node cdd/scripts/spec-drift.mjs
      # the project's own tests (adjust to your runner)
      - run: npm test --if-present
`;

export const CI_GITLAB = `stages: [verify]

cdd:guard:
  stage: verify
  image: node:20
  # door 3 — full scan: the same guard the pre-commit hook runs
  script:
    - node cdd/scripts/spec-drift.mjs
    # the project's own tests (adjust to your runner)
    - npm test --if-present
`;

/** The scripts every adopting project gets at cdd/scripts/. */
export const DOOR_SCRIPTS = ["spec-drift.mjs", "spec-extract.mjs", "arch-extract.mjs"];

/** Copy the zero-dependency door scripts from the extension tree into the store. */
export function writeDoorScripts(root, extDir) {
  const dstDir = path.join(root, "cdd", "scripts");
  fs.mkdirSync(dstDir, { recursive: true });
  for (const s of DOOR_SCRIPTS) {
    fs.copyFileSync(path.join(extDir, "scripts", s), path.join(dstDir, s));
  }
  return dstDir;
}
