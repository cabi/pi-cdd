# R2 package review — r3-findings

## Change identity

- Change: `cdd/changes/r3-findings/`
- Artifacts under review: the whole package — `proposal.md`, `tasks.md`, and the delta `specs/gherkin/spec.md` — at draft-green (validate draft passes, no implementation task ticked yet)
- Review point: R2 (package), always at draft-green

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the paths below, from disk at the pinned state. Loop law rule 2b — the reviewer is not the author of the artifacts under review.
- Your model family must differ from the author's model family (family = same provider or model lineage). The author's family is **zai** (glm-5.3). Verify your own family from your runtime environment (e.g. `PI_PROVIDER`) — never accept the author's statement of your family as settled fact. If you cannot establish that the families differ, say so in your findings header and stop.

## Inputs (paths, pinned state)

- Repository at commit `2c34772` (branch `r3-findings`) — the change artifacts are **uncommitted working tree**; state that in your findings header.
- `cdd/changes/r3-findings/proposal.md`
- `cdd/changes/r3-findings/tasks.md`
- `cdd/changes/r3-findings/specs/gherkin/spec.md` (the delta)
- `cdd/specs/gherkin/spec.md` (the living spec the delta touches)
- `cdd/rules.md` — the loop law (delta shape, MODIFIED/REMOVED rules, pin form)

## Scope fence

- In scope: the drafted package — cross-artifact coherence, coverage, sponsorship, delta↔living-spec fit, verify-by realism.
- Out of scope: implementation (none exists yet), proposing redesigns, any fix. You report findings; you do not edit files.

## MUST-DELIVER checklist (the charter)

1. **Coverage** — every Done-When line maps to ≥1 delta requirement, and every requirement maps to ≥1 task. A Done-When with no requirement, or a requirement with no task, is a finding.
2. **Sponsorship** — no orphan tasks (no requirement or Done-When needs them) and no orphan requirements (no Done-When sponsors them).
3. **Same-change coherence (car/garden/rocket)** — proposal, delta, and tasks describe the same change; each artifact alone is well-formed but the three together must be about one thing. No `design.md` exists (gate all-NO, prose shape) — skip design checks.
4. **MODIFIED/REMOVED legality** — every MODIFIED requirement restates EVERY scenario the living spec already has (silently dropping one is a finding); every REMOVED, where present, carries a `Reason:` line.
5. **Verify-by runnable as written** — each task's verify-by names a command or check that exists and would actually fail before / pass after the task; each scenario's `# Verified by:` pin names a real acceptance test path (a pin naming a test that does not exist yet because its task creates it is expected at R2 — flag only if no task creates it).

## Findings grammar (advisory — no fixes, no verdicts)

Each finding: severity `blocker` | `should` | `note`, the finding, evidence (path:line). You report every finding with disposition `open`; the author later sets `fixed:` or `won't-fix:` when disposing.
Never red/green verdicts; gate authority stays with the deterministic validators and the human.

## Output

Write your findings to `cdd/changes/r3-findings/reviews/r2-change-review.md` (output path per `reviewPoint("R2").findings` in `lib/loop-law.mjs`). Header records your reviewer form (cold sub-agent) and your model family vs. the author's (zai/glm-5.3).
