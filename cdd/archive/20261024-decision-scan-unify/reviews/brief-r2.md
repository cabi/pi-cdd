# R2 package review — decision-scan-unify

## Change identity

- Change: `cdd/changes/decision-scan-unify/`
- Artifact package under review: `proposal.md` + `design.md` (design gate answered T4 YES → design document required) + the spec delta (`specs/gherkin/spec.md`, one MODIFIED requirement) + `tasks.md` (all groups)
- Review point: R2 (package), at draft-green — draft-mode `cdd validate` PASSED for the change before this review was dispatched; implementation has not started (tasks 3.2 onward unticked; the acceptance test file does not exist yet, so the drift guard reports the expected `[L1]` pin-not-on-disk findings for `tests/acceptance/decision-scan.test.js` — that red is the RED-first order, not a package defect)
- R1 was skipped lawfully (rule 2a: the design gate answered T1 and T2 both NO); there is no R1 findings file — check the skip's lawfulness against the gate record in `tasks.md` §2.1

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the paths below, from disk at the pinned state. Loop law rule 2b — the reviewer is not the author of the artifacts under review.
- Your model family must differ from the author's model family. The brief states the author's family (`zai` / `glm-5.3`), never yours as settled fact. If you cannot establish that the families differ, say so in your findings header and stop.

## Inputs (paths, pinned state)

- Repository: the working tree is **uncommitted** on branch `decision-scan-unify`, HEAD `f76f12f72fe205462d077cf79d7a71e1faccad3e` (= main); every artifact under review is an uncommitted file — state that in your findings header.
- `cdd/changes/decision-scan-unify/proposal.md` — Done-When lines, Capabilities, Solutions Considered, Non-Goals, Decisions followed.
- `cdd/changes/decision-scan-unify/design.md` — the design-gate artifact (C4 Component).
- `cdd/changes/decision-scan-unify/specs/gherkin/spec.md` — the delta (one MODIFIED requirement).
- `cdd/changes/decision-scan-unify/tasks.md` — gate record §2.1, task list, Done-When traceability table, Close group.
- `cdd/specs/gherkin/spec.md` — living spec; the MODIFIED requirement restates the living requirement `### Requirement: The ADR claims index is single-sourced` (near line 1404) — fit is checked against that block; note also the requirement near line 149 whose `Code:` line claims `scripts/arch-extract.mjs` and `cdd/scripts/**`.
- `cdd/rules.md` — the loop law (delta format: MODIFIED restates every scenario; every scenario ends `# Verified by: tests/acceptance/<path>`; rule 2a review points; rule 2b cold reviews; rule 2c design documents).
- `cdd/archive/` — merged changes for reuse-first honesty (esp. `20261024-claim-map`, `20261024-spec-model`, and `20261024-adr-index-single-source` if present).
- `cdd/decisions/` — ADRs the proposal cites (ADR-0001, ADR-0007, ADR-0012, ADR-0013).
- `scripts/adr-index.mjs`, `scripts/arch-extract.mjs`, `scripts/grammar-law.mjs`, `scripts/spec-drift.mjs`, `lib/adr-ops.mjs`, `lib/templates.mjs` — the code the package describes, at the pre-implementation state (`scanDecisionFiles` does not exist yet; arch-extract still holds its private `scanDecisions`).
- `tests/acceptance/adr-index-agreement.test.js`, `tests/acceptance/claim-map.test.js` — existing territory holders the new pin must not re-pin.

## Scope fence

- In scope: the package as a whole — the Done-When → requirement → task chain, delta↔living-spec fit (the MODIFIED requirement restates every scenario verbatim plus its change; new scenarios carry `Verified by:` pins that name real acceptance paths), reuse-first honesty, design-gate credibility, verify-by realism of every task's verification clause, traceability table completeness.
- Out of scope: implementation (none exists), proposing redesigns, any fix. You report findings; you do not edit files (except your findings file).

## MUST-DELIVER checklist (the charter)

1. **The chain is closed** — every Done-When line maps to ≥1 task in the traceability table; every task maps to a Done-When line or a spec requirement; no orphan in either direction.
2. **Delta fits the living spec** — the MODIFIED requirement's restatement matches the living spec's current scenario set for "The ADR claims index is single-sourced" (no silently dropped or renamed scenario; all five current scenarios present verbatim), the modifications are exactly what What Changes announces, and the new pin path (`tests/acceptance/decision-scan.test.js`) is claimed by exactly the one requirement that should own it (`scripts/arch-extract.mjs` must NOT be added to this requirement's `Code:` line — it stays owned by the door-1-law requirement near line 149).
3. **Scenario verify-by realism** — every scenario's `Verified by:` names an acceptance path; each new scenario's verification is actually reachable by the named test (a source scan; synthetic-tree flag answers; golden-row equivalence).
4. **Behavior-preservation contracts are well-formed** — the fence says both surfaces stay unchanged: the guard/adrs/reconfirm side (existing suites + PF-27 cmp proofs) and the extractor side (equivalence probe: same input tree → same location/status/code/title rows before vs after). Check a runner following tasks 3.4/3.5 cannot prove the wrong thing (e.g. comparing against a baseline captured from the wrong code, a before/after tree mismatch, or forgetting a surface What Changes names — the report lines AND the `--json` `derived.decisions`).
5. **Reuse-first honesty** — Solutions Considered names real, opened candidates (claim-map's MODIFIED precedent, the exactly-once scan-pin pattern, PF-27 recipe, ADR-0013's law home); the relation to the existing territory holders (adr-index-agreement, claim-map) is stated and holds.
6. **Fence integrity** — no task or delta line expands beyond the mission fence: no new door script, no DOOR_SCRIPTS change, no store-format change, no new op, LAW_VERSION untouched, no behavior change beyond what the flags preserve; the title-law divergence (tab-indented heading edge case) is honestly scoped as a Non-Goal rather than hidden.
7. **Design-gate credibility** — the gate record (tasks §2.1) names all five T-answers, the chosen shape, and the C4 level; design.md's four sections and one C4-Component flowchart match rule 2c; the `numberedOnly` third-flag decision and the two preserving flag combinations are coherent across gate record, design, proposal, and delta scenarios.

## Findings grammar (advisory — no fixes, no verdicts)

Each finding: severity `blocker` | `should` | `note`, the finding, evidence (path:line). You report every finding with disposition `open`; the author later sets `fixed:` or `won't-fix:` when disposing.
Never red/green verdicts; gate authority stays with the deterministic validators and the human.

## Output

Write your findings to `cdd/changes/decision-scan-unify/reviews/r2-change-review.md`
(output path per the change's review tasks). Header records your reviewer
form (cold sub-agent / same-session re-read) and your model family vs. the
author's. End your run with a one-line summary of blocker/should/note
counts as your final message.
