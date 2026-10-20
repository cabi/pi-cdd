// templates.mjs — the form of every artifact. Ambient carries the method,
// these files carry the form (ADR-0004). Zero dependencies by ADR-0001.

import * as fs from "node:fs";
import * as path from "node:path";
import { PROPOSAL_INSTRUCTION, DELTA_INSTRUCTION, TASKS_INSTRUCTION } from "./instructions.mjs";

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
   \`### Requirement: <name>\` + prose, then exactly one \`\`\`gherkin fence
   holding one complete Gherkin document (ADR-0006): \`Feature: <name>\`
   equal to the heading, every \`Scenario: <name>\` with exactly one When,
   at least one Then, And/But continuation-only, and each scenario's last
   line a \`# Verified by: tests/acceptance/<path>\` pin comment — the only
   comment allowed inside a fence. No \`#### Scenario:\` markdown headings,
   no Background/Rule/tags/Outline/Examples/tables. Scenarios are
   declarative: observable outcomes and value, not interaction mechanics
   (keystrokes, widgets, selectors) — phrasing law is door-1 judgment,
   parse law is the validator. Quantify: intervals, limits, and thresholds
   carry numbers and units ("every 14 days", "p95 under 200 ms") —
   unquantified comparatives are warnings. Count verbs carry an exactness
   qualifier: "contains exactly N" detects drift, "at least N" sets a
   floor — unqualified counts warn. REMOVED carries a \`Reason:\` line.
5. **MODIFIED and REMOVED** only name requirements that exist in the
   living spec. ADDED must not duplicate a living requirement.
6. **Tasks** — four steps (context → design → implementation → close);
   every implementation subtask carries \`verify by <test>\`; the
   \`## Done When Traceability\` table (criterion → task ids) follows the
   implementation steps, before the Close section. More than 8
   implementation subtasks is the split signal — split at the design gate,
   more than 12 fails strict; record \`split-considered:\` if kept whole.
7. **Test-first** — the acceptance test a subtask names exists before the
   subtask is checked. A scenario without a committed pin is a wish.
8. **Mechanical changes** — behavior-preserving sweeps declare
   \`Mechanical-Change: <reason>\` in the commit message; they age no spec
   and never touch cdd/specs/ or acceptance tests.
9. **Doors** — door 1 is this loop (human + agent judgment), door 2 is the
   pre-commit and commit-msg guards, door 3 is CI running the same guard,
   full scan.
9a. **No hook bypass** — a red door is a fact, not an obstacle: git's
    \`--no-verify\` is never used. A behavior-preserving sweep declares the
    \`Mechanical-Change:\` trailer and passes the commit-msg guard honestly;
    anything else that blocks belongs in the change loop.
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
  return `${PROPOSAL_INSTRUCTION}

# ${name}

## Why

<One paragraph: the pressure this change answers. If you cannot name the pressure, there is no change.>

## What Changes

- <What the system will promise differently, as bullets>

## Solutions Considered

- <capability>: <solution evaluated — what it covers, why adopted/rejected>

## Non-Goals

- <What this change explicitly will NOT do — the scope fence>

Done-When: <one measurable line — how you know the change landed>
Code: <glob>, <glob>
`;
}

export function deltaTemplate(capability) {
  return `${DELTA_INSTRUCTION}

## ADDED Requirements

### Requirement: <name>

<One or two sentences: the promise, in user-visible terms.>

\`\`\`gherkin
Feature: <name>

Scenario: <name>
  Given <one exact starting state>
  When <one exact input or trigger>
  Then <the exactly observable outcome>
  # Verified by: tests/acceptance/${capability}-<scenario>.test.js
\`\`\`

Code: src/${capability}/**
`;
}

export function tasksTemplate(name) {
  return `${TASKS_INSTRUCTION}

# Tasks — ${name}

## 1. Context

- [ ] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

- [ ] 2.1 Design gate — answer the five triage triggers (T1 cross-cutting, T2 architecture bet, T3 shared seam, T4 invariant risk, T5 parallel work): any YES needs a short design above; all NO is recorded here as the skip record, verify by this line naming all five answers

## 3. Implementation

- [ ] 3.1 <task> — verify by tests/acceptance/<pin>.test.js


## Done When Traceability

| criterion | task ids |
|---|---|
| <Done-When line> | 3.1 |

## 4. Close

- [ ] 4.1 cdd validate strict green, guard green
- [ ] 4.2 Archive — pair-commit: feature commit, then archive commit
`;
}

export const PRE_COMMIT = `#!/bin/sh
# door 2a — the drift guard on every commit (message-independent checks)
node cdd/scripts/spec-drift.mjs --staged
`;

export const COMMIT_MSG = `#!/bin/sh
# door 2b — the drift guard on the composed commit message (this hook can
# see the Mechanical-Change: trailer, so mechanical commits pass honestly)
node cdd/scripts/spec-drift.mjs --commit-msg "$1"
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
export const DOOR_SCRIPTS = ["law.mjs", "spec-drift.mjs", "spec-extract.mjs", "arch-extract.mjs"];

/** Copy the zero-dependency door scripts from the extension tree into the store. */
export function writeDoorScripts(root, extDir) {
  const dstDir = path.join(root, "cdd", "scripts");
  fs.mkdirSync(dstDir, { recursive: true });
  const written = DOOR_SCRIPTS.map((s) => {
    fs.copyFileSync(path.join(extDir, "scripts", s), path.join(dstDir, s));
    return `cdd/scripts/${s}`;
  });
  return written;
}
