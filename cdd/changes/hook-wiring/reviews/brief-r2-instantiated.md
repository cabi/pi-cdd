# R2 package review — hook-wiring

## Change identity

- Change: `cdd/changes/hook-wiring/`
- Artifacts under review: the whole package — `proposal.md`, `tasks.md`, and the delta `specs/gherkin/spec.md` — at draft-green (validate draft passes; no implementation task ticked yet; context and design-section ticks are expected at draft-green)
- Review point: R2 (package), always at draft-green

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the paths below, from disk at the pinned state. Loop law rule 2b — the reviewer is not the author of the artifacts under review.
- Your model family must differ from the author's model family (family = same provider or model lineage). Verify your own family from your runtime environment (e.g. `PI_PROVIDER`) — the author's family is `zai` (glm-5.3); the brief states the author's family, never yours as settled fact. If you cannot establish that the families differ, say so in your findings header and stop.

## Inputs (paths, pinned state)

- Repository at uncommitted working tree at commit `51fb3b2` (branch `hook-wiring`); the change folder `cdd/changes/hook-wiring/` is untracked — state that in your findings header.
- `cdd/changes/hook-wiring/proposal.md`
- `cdd/changes/hook-wiring/tasks.md`
- `cdd/changes/hook-wiring/specs/gherkin/spec.md` (the delta; no `design.md` exists — the design gate answered all five triggers NO, prose shape, rule 2c)
- `cdd/specs/gherkin/spec.md` (the living spec the delta touches)
- `cdd/rules.md` — the loop law (delta shape, MODIFIED/REMOVED rules, pin form)

## Scope fence

- In scope: the drafted package — cross-artifact coherence, coverage, sponsorship, delta↔living-spec fit, verify-by realism.
- Out of scope: implementation (none exists yet), proposing redesigns, any fix. You report findings; you do not edit files.

## MUST-DELIVER checklist (the charter)

1. **Coverage** — every Done-When line maps to ≥1 delta requirement, and every requirement maps to ≥1 task. A Done-When with no requirement, or a requirement with no task, is a finding.
2. **Sponsorship** — no orphan tasks (no requirement or Done-When needs them) and no orphan requirements (no Done-When sponsors them).
3. **Same-change coherence (car/garden/rocket)** — proposal, delta, and tasks describe the same change; each artifact alone is well-formed but the three together must be about one thing.
4. **MODIFIED/REMOVED legality** — every MODIFIED requirement restates EVERY scenario the living spec already has (silently dropping one is a finding); every REMOVED, where present, carries a `Reason:` line. (This delta is ADDED-only; check ADDED does not duplicate a living requirement.)
5. **Verify-by runnable as written** — each task's verify-by names a command or check that exists and would actually fail before / pass after the task; each scenario's `# Verified by:` pin names a real acceptance test path.

## Findings grammar (advisory — no fixes, no verdicts)

Each finding: severity `blocker` | `should` | `note`, the finding, evidence (path:line). You report every finding with disposition `open`; the author later sets `fixed:` or `won't-fix:` when disposing. Never red/green verdicts; gate authority stays with the deterministic validators and the human.

## Output

Write your findings to `cdd/changes/hook-wiring/reviews/r2-change-review.md` (output path per `reviewPoint("R2").findings` in `lib/loop-law.mjs`). Header records your reviewer form (cold sub-agent / same-session re-read) and your model family vs. the author's.
