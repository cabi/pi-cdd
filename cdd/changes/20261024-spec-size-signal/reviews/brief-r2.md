# R2 package review — 20261024-spec-size-signal

## Change identity

- Change: `cdd/changes/20261024-spec-size-signal/`
- Artifact package under review: `proposal.md` + the spec delta (`specs/gherkin/spec.md`, one ADDED requirement "Spec-size signal", 6 scenarios) + `tasks.md` (gate record §2.1 ticked with the skip record + warning-budget and threshold-home reasoning; implementation groups unticked). No `design.md` — the design gate answered all five triggers NO (skip record).
- Review point: R2 (package), at draft-green — draft-mode `cdd validate` PASSED for this change before this review was dispatched (run it yourself to confirm). Implementation has not started: `tests/acceptance/spec-size-signal.test.js` does not exist yet, so strict mode would report pin-not-on-disk findings — that red is the RED-first order, not a package defect.
- R1 was skipped lawfully (rule 2a: the design gate answered T1 and T2 both NO); there is no R1 findings file — check the skip's lawfulness against the gate record in `tasks.md` §2.1.
- Charter: the loop's R2 package review (skill `cdd-spec-review`, package mode) — you may read `skills/cdd-spec-review/SKILL.md` for the review method.

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the paths below, from disk at the pinned state. Loop law rule 2b — the reviewer is not the author of the artifacts under review.
- Your model family must differ from the author's model family. The brief states the author's family (`zai` / `glm-5.3`), never yours as settled fact. If you cannot establish that the families differ, say so in your findings header and stop.
- Report advisory findings (severity blocker / should / note), never verdicts. You do not edit any file except your findings file.

## Inputs (paths, pinned state)

- Repository: working tree **uncommitted** on branch `spec-size-signal`, HEAD `6057a6e` (= main); every artifact under review is an untracked file — state that in your findings header.
- `cdd/changes/20261024-spec-size-signal/proposal.md` — Why (PF-32: gherkin accreted 26→48→50 requirements with zero validate signal; premise `grep -n "threshold" lib/validate.mjs` → 0 matches), What Changes (Tier A existence + authoring, Tier B split-considered demand, thresholds 12/8, fresh-node pin), Solutions Considered (5), Non-Goals (4), 5 Done-When lines, Code: globs.
- `cdd/changes/20261024-spec-size-signal/specs/gherkin/spec.md` — the delta: one ADDED requirement "Spec-size signal" with 6 scenarios, all pinned `# Verified by: tests/acceptance/spec-size-signal.test.js`. **Deliberate state**: the delta carries NO `split-considered:` line yet — the change's own tasks 3.5 requires observing Tier B FIRE on this delta before the line is added (self-application proof, director-instructed); the line lands with the implementation. Judge the package on its final intended shape (What Changes bullet "Self-application").
- `cdd/changes/20261024-spec-size-signal/tasks.md` — gate record §2.1 (five T's, warning budget, threshold home), tasks 3.1–3.5, Done-When traceability table, Close group 4.1–4.5.
- `cdd/changes/20261024-spec-size-signal/reviews/red-records.md` — seeded pre-implementation observations (premise grep=0; Tier B cannot fire yet — draft-green silent, the BEFORE half).
- `cdd/changes/20261024-spec-size-signal/reviews/mission-brief.md` — the director's mission brief (context for scope; the boundary it names is part of the charter; note it predates the corpus correction — gherkin is at 50, not 48).
- `cdd/rules.md` — the loop law (delta format law incl. ADR-0006 fence grammar; rule 2a review points; rule 2b cold reviews; rule 6 — the task-side 8/12 split signal this change mirrors, never edits).
- `cdd/specs/gherkin/spec.md` — living spec, 50 requirements; fit-check the ADDED requirement against neighbors that already claim `lib/validate.mjs`: "Proposal scaffold passes its own doors" area (~line 1596 `Code: lib/validate.mjs, tests/smoke.mjs`), "Scaffold instruction text is not proposal content" (~line 1596 area, scaffold-honesty), "Validate counts a capability's requirements" neighbors — no re-pinning, no overlap with what proposal/tasks checks already own.
- `cdd/backlog.md` — PF-32 (line 38, the mission), PF-6 (gherkin split, out of scope), PF-33/PF-34 (out of scope), PF-35 (fresh-node instrument law, minted tonight).
- `lib/validate.mjs` — `validateDelta` (~lines 105–150: per-capability living-spec read currently strict-only, the extension point both-modes), `validateTasks` (~lines 160–175: the `SPLIT_SIGNAL`/`split-considered` precedent at task scope), `project()` (warnings copied verbatim into both verdicts — the both-modes mechanism), `checkRequirement` (scenarioTexts per block), `parseDelta`/`parseLivingSpec` in `lib/store.mjs` (block carrier for counting).
- `scripts/grammar-law.mjs` — `SPLIT_SIGNAL = 8` (line 31), `TASK_LIMIT = 12` (line 34): the rule-6 pair the thresholds mirror; `scripts/spec-drift.mjs:34` imports TASK_LIMIT (the door-consumer argument for the threshold home).
- `tests/acceptance/gherkin-subset.test.js`, `tests/acceptance/scaffold-honesty.test.js` — precedent shapes for a fixture-store acceptance pin importing the real validator.

## Scope fence

- In scope: the package as a whole — the Done-When → requirement → task chain, delta↔living-spec fit (the ADDED requirement doesn't re-pin or contradict neighbors), reuse-first honesty, design-gate credibility (five reasoned answers; the warning-budget and threshold-home calls), verify-by realism of every task's verification clause, traceability table completeness, threshold values (12/8) against the corpus the gate record cites, the deliberate no-split-considered-yet state's honesty, and the RED-first shape (pin red before implementation, fresh-node law from PF-35).
- Out of scope: implementation (none exists), proposing redesigns, the PF-6 gherkin split itself, PF-33 metrics, PF-34's skill-doc half, any task-law (rule 6) text change. You report findings; you do not edit files (except your findings file).

## MUST-DELIVER checklist (the charter)

1. **The chain is closed** — every Done-When line maps to ≥1 task in the traceability table; every task maps to a Done-When line or a spec requirement; no orphan in either direction.
2. **Delta fits the living spec** — one ADDED requirement, exactly one behavior set, one gherkin fence (ADR-0006 grammar: Feature name = heading, exactly one When per scenario, ≥1 Then, And/But continuation-only, last line the `# Verified by:` pin comment, no banned constructs); every scenario's pin names a real acceptance path; no re-pinning of scenarios existing gherkin requirements already own; Code: globs (`lib/validate.mjs, tests/acceptance/spec-size-signal.test.js`) point at files gherkin lawfully owns (check the living spec's own Code: lines for the file).
3. **Scenario verify-by realism** — each scenario is actually reachable by the named pin: a fixture store with a synthetic over-threshold spec can drive `validateDelta`/`validateChange` from `tests/acceptance/spec-size-signal.test.js` (read how `gherkin-subset.test.js` / `scaffold-honesty.test.js` build fixture stores).
4. **RED-first realism** — task 3.2 pins the signal before it exists (RED against the current validator); task 3.5's fire-then-satisfy self-application is specified well enough that a runner cannot fake it; the fresh-node law (PF-35) is correctly woven into the observation task.
5. **Reuse-first honesty** — Solutions Considered names real, opened candidates (validateTasks' SPLIT_SIGNAL pattern, grammar-law residence, per-capability scoping at lib/validate.mjs:125–133, parseLivingSpec block carrier, ≥12/req alternative); each characterization is checked against the actual code.
6. **Scope honesty** — What Changes and the delta promise no more than PF-32's two-tier warning signal; Non-Goals fence the boundary (no hard fail, no door/guard change, no rules.md edit, no PF-6/33/34); the mission brief's out-of-scope list is respected; thresholds are gate-justified, not inherited.

## Output protocol

- Write findings to `cdd/changes/20261024-spec-size-signal/reviews/r2-change-review.md` — header: your model id and family, the pinned state (branch, HEAD, untracked files), the draft-validate output you observed; then findings numbered with severity (blocker / should / note), each with the exact path:line evidence and a concrete fix suggestion; end with counts.
- Advisory only: findings never gate on their own; the deterministic validators keep gate authority.
