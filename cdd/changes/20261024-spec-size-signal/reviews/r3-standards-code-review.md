# R3 Standards-Axis Code Review — 20261024-spec-size-signal

## Reviewer and pinned state

- Cold reviewer: model `gpt-6-luna`, GPT family (`PI_PROVIDER=opencode-zen`); thinking level `high` (`PI_REASONING_LEVEL=high`). Author family per brief: `zai`; reviewer family differs.
- Pin verified: branch `spec-size-signal`, HEAD `6057a6e`.
- `git status --porcelain`:
  ```text
   M lib/validate.mjs
  ?? cdd/changes/20261024-spec-size-signal/
  ?? tests/acceptance/spec-size-signal.test.js
  ```
- Scope fence: `git diff HEAD -- lib/validate.mjs`, `tests/acceptance/spec-size-signal.test.js`, and files under `cdd/changes/20261024-spec-size-signal/`. Review is standards-axis only; other tree content is pinned context. No files other than this findings file were changed by the reviewer.

## Findings

| ID | Severity | Finding | Evidence | Suggested disposition |
|---|---|---|---|---|
| R3S-001 | should | Added source comments route readers to corpus/law identifiers instead of documenting only code shape. The new validator comments point to “rule 6” and the `grammar-law.mjs` law location; the acceptance test comments include the process-finding ID `PF-32`, “rule 6,” and decision ID `ADR-0006`. This conflicts with the comment law, and the acceptance test's comments are not part of the comment-law scanner surface. | `lib/validate.mjs:119-123`: `// Spec-size signal thresholds: the living-spec mirror of rule 6's` and `// the constants move beside TASK_LIMIT in scripts/grammar-law.mjs.`; `tests/acceptance/spec-size-signal.test.js:2-7`: `// Acceptance pin for the spec-size signal (PF-32): ...` and `// its own raw text — Tier B mirrors rule 6's unanchored substring scan`; `tests/acceptance/spec-size-signal.test.js:28-29`: `// one requirement block with k pinned scenarios (fence-faithful: scenarios` / `// live inside the gherkin fence, pins are comments inside it — ADR-0006)`. | open — Rewrite these as shape-of-code descriptions; remove corpus IDs and law-routing references from comments. |

## MUST-item findings

1. **Comment law — R3S-001.** The cited comments include corpus/law identifiers rather than only code-shape documentation.
2. **Threshold home / ADR-0007 one-law-behind-every-door — PASS.** `SPEC_REQ_SIGNAL` and `SCENARIO_SIGNAL` are declared only in `lib/validate.mjs:124-125`. `rg -n 'SPEC_REQ_SIGNAL|SCENARIO_SIGNAL|split-considered:|SPLIT_SIGNAL|TASK_LIMIT' lib/validate.mjs scripts/grammar-law.mjs cdd/scripts/grammar-law.mjs` showed the new constants only in `lib/validate.mjs`; the two `grammar-law.mjs` copies have the same SHA-256 (`f2b34ac948b2775b108362cf6e2f3fc77f88c9d257f3fa35870bf696cc3b89b4`).
3. **Warning/error channel convention — PASS.** The signal emits through `warnings.push(...)` at `lib/validate.mjs:165-178`; no signal error is added. The strict run below returned `PASS` with the two standing `spec-size:` warnings.
4. **Rule-6 mirror fidelity — PASS.** The Tier B check at `lib/validate.mjs:177` uses `!/split-considered:/i.test(text)` on the raw delta text, matching the existing unanchored scan at `lib/validate.mjs:201-205`.
5. **Acceptance-test idioms — R3S-001.** The file is named `tests/acceptance/spec-size-signal.test.js`, imports `describe`, `test`, and `after` from `node:test`, and is discovered by the `node --test` sweep. The comments still violate the comment-law portion of this item. The repository's sweep pin is `tests/acceptance/run-acceptance.test.js` (not `run-acceptance.mjs`).
6. **Naming/readability — PASS.** The constants and `countScenarios` helper are grouped immediately before `validateDelta` (`lib/validate.mjs:124-129`); emitted signal messages consistently use the `spec-size:` prefix (`lib/validate.mjs:166-178`).

## Independent verification

All checks below ran in fresh Node processes. The acceptance suite entry is `node --test tests/acceptance/*.test.js`; the successful output tail was:

```text
all pin checks passed
✔ spec-size-signal.test.js — spec-size signal pin (real lib/validate.mjs)
ℹ tests 46
ℹ pass 46
ℹ fail 0
```

Guard command: `node cdd/scripts/spec-drift.mjs`. Output:

```text
spec-drift: clean (5 specs, 41 acceptance test files, full scan)
```

Strict change verdict command:

```sh
node --input-type=module -e 'import { validateChange, formatVerdict } from "./lib/validate.mjs"; const v = validateChange(process.cwd(), "20261024-spec-size-signal", "strict"); console.log(formatVerdict(v)); process.exitCode = v.ok ? 0 : 1'
```

Output tail:

```text
PASS
  warning: spec-size: living spec "gherkin" holds 50 requirements (>= 12) — split signal: consider splitting the spec
  warning: spec-size: living spec "gherkin" requirements at or over 8 scenarios: Gherkin subset limits, Loop law names three review points, Code lines claim implementation surface, never decision memory, The ADR claims index is single-sourced — split signal: consider splitting these requirements
```

`git diff --check HEAD` produced no output.

**Finding counts:** blocker 0, should 1, note 0.

## Dispositions (author, 2026-10-24)

- **R3S-001 (should): fixed** — all cited comments rewritten shape-only: the threshold comment in lib/validate.mjs now states the warn-never-error semantics and the door-escalation move without naming the rule, the law module, or its path; the pin file's header documents the tiers, the real-validator import, and the colon discipline without corpus ids; the fixture comment drops its decision-id citation. The why-context (rule-6 mirror, escalation path, decision citations) lives in the gate record, proposal, delta text, and red-records.md — its lawful homes. Comment-law re-run green (CL1-CL4), full sweep 46/46.
