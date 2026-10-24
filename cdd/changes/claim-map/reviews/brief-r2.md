# R2 package review — claim-map

## Change identity

- Change: `cdd/changes/claim-map/`
- Artifact package under review: `proposal.md` + `design.md` (design gate answered T2 YES) + the spec delta (`specs/gherkin/spec.md`, `specs/adr/spec.md`) + `tasks.md` (all groups)
- Review point: R2 (package), at draft-green — `cdd validate` draft mode passed for the change before this review was dispatched; implementation has not started (task 3.2 onward unticked; the acceptance test file does not exist yet, so the guard currently reports exactly 1 expected `[L1]` pin-not-on-disk finding for this change — that red is the RED-first order, not a package defect)

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the paths below, from disk at the pinned state. Loop law rule 2b — the reviewer is not the author of the artifacts under review.
- Your model family must differ from the author's model family. The brief states the author's family (`zai` / `glm-5.3`), never yours as settled fact. If you cannot establish that the families differ, say so in your findings header and stop.

## Inputs (paths, pinned state)

- Repository: the working tree is **uncommitted** on branch `claim-map`, HEAD `0bd33cdc81521e6e299a8c8eeafe0dc6eacb0583` (= main) — state that in your findings header.
- `cdd/changes/claim-map/proposal.md` — Done-When lines, Capabilities, Solutions Considered, Non-Goals, Decisions followed.
- `cdd/changes/claim-map/design.md` — the design-gate artifact (C4 Component).
- `cdd/changes/claim-map/specs/gherkin/spec.md`, `cdd/changes/claim-map/specs/adr/spec.md` — the delta.
- `cdd/changes/claim-map/tasks.md` — the task list with the Done-When traceability table.
- `cdd/specs/gherkin/spec.md`, `cdd/specs/adr/spec.md`, `cdd/specs/acceptance/spec.md`, `cdd/specs/extension/spec.md` — living specs, for delta↔living-spec fit.
- `cdd/rules.md` — the loop law (delta format: MODIFIED restates every scenario; every scenario ends `# Verified by: tests/acceptance/<path>`).
- `cdd/archive/` — merged changes for reuse-first honesty (esp. `20261024-spec-model`, `20261024-guard-pure-checks`, `20261024-adr-ops`, `20261024-adr-index-single-source` if present).
- `cdd/decisions/` — ADRs the proposal cites (ADR-0001, ADR-0006, ADR-0007, ADR-0012) and the planned ADR-0013.
- `lib/adr-ops.mjs`, `scripts/spec-drift.mjs`, `scripts/adr-index.mjs`, `scripts/grammar-law.mjs` — the code the package describes, at the pre-implementation state.
- `tests/acceptance/adr-index-agreement.test.js` — the existing territory holder the new pin extends (AG2/AG3).
- `cdd/changes/claim-map/reviews/r1-proposal-review.md` — R1's disposed findings, for continuity (all `fixed:`; check the fixes landed in the artifacts you review, not just in the dispositions).

## Scope fence

- In scope: the package as a whole — the Done-When → requirement → task chain, delta↔living-spec fit (MODIFIED requirements restate every scenario verbatim plus their change; new scenarios carry `Verified by:` pins that name real acceptance paths), reuse-first honesty, design-gate credibility, verify-by realism of every task's verification clause, traceability table completeness (every proposal criterion covered by ≥1 task, every task sponsored by a criterion or requirement).
- Out of scope: implementation (none exists), proposing redesigns, any fix. You report findings; you do not edit files.

## MUST-DELIVER checklist (the charter)

1. **The chain is closed** — every Done-When line maps to ≥1 task in the traceability table; every task maps to a Done-When line or a spec requirement; no orphan in either direction.
2. **Delta fits the living spec** — each MODIFIED requirement's restatement matches the living spec's current scenario set (no silently dropped or renamed scenario), the modifications are exactly what What Changes announces, and the new scenario's pin path (`tests/acceptance/claim-map.test.js`) is claimed by exactly the one requirement that should own it (no cross-capability double claim on the new test file).
3. **Scenarios verify-by realism** — every scenario's `Verified by:` names an acceptance path; the new scenario's verification is actually reachable by the named test (a scan of sources + a real-door op run).
4. **Byte-identity contract is well-formed** — the worktree proof task and the op-answer proof task capture stdout/stderr/exit and before/after answers such that a runner following them cannot prove the wrong thing (e.g. comparing against a stale baseline, or forgetting a surface the What Changes names).
5. **Reuse-first honesty** — Solutions Considered names real, opened candidates (parseSpecModel, guard-pure structure, PF-27 recipe, SM2 pattern, AG2/AG3 relation); the claim that the new test EXTENDS rather than re-pins AG2/AG3 holds against `tests/acceptance/adr-index-agreement.test.js`.
6. **Fence integrity** — no task or delta line expands beyond the mission fence: no new door script, no DOOR_SCRIPTS change, no store-format change, no new ops, no behavior change beyond the byte-identity contracts, no test deletions; the spec-extract.mjs third derivation stays a named Non-Goal.
7. **Design-gate credibility** — design.md's boundaries still match the delta's claims after R1's fixes (the builder's inputs/outputs, consumers, and the "exactly once" law the new scenario pins).

## Findings grammar (advisory — no fixes, no verdicts)

Each finding: severity `blocker` | `should` | `note`, the finding, evidence (path:line). You report every finding with disposition `open`; the author later sets `fixed:` or `won't-fix:` when disposing.
Never red/green verdicts; gate authority stays with the deterministic validators and the human.

## Output

Write your findings to `cdd/changes/claim-map/reviews/r2-change-review.md`
(output path per `reviewPoint("R2").findings` in `lib/loop-law.mjs`). Header
records your reviewer form (cold sub-agent / same-session re-read) and your
model family vs. the author's. End your run with a one-line summary of
blocker/should/note counts as your final message.
