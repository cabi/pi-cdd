# R2 package review — guard-pure-checks

## Change identity

- Change: `cdd/changes/guard-pure-checks/`
- Artifacts under review: the whole package — `proposal.md`, `design.md`
  (the design gate answered T2 and T4 YES, so rule 2c produced one),
  `tasks.md`, and every delta `specs/*/spec.md` — at draft-green
  (validate draft passes; tasks 1.1 and 2.1 carry design-section ticks,
  which are expected at draft-green; no implementation task is ticked)
- Review point: R2 (package), always at draft-green

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the
  paths below, from disk at the pinned state. Loop law rule 2b — the reviewer
  is not the author of the artifacts under review.
- Your model family must differ from the author's model family (family = same
  provider or model lineage). Verify your own family from your runtime
  environment (e.g. `PI_PROVIDER` / `PI_MODEL`) — the brief states the
  author's family (zai, glm-5.3 lineage), never yours as settled fact. If you
  cannot establish that the families differ, say so in your findings header
  and stop.
- Record your runtime `PI_PROVIDER` and `PI_MODEL` values verbatim in the
  findings header.

## Inputs (paths, pinned state)

- Repository: working tree uncommitted on branch `guard-pure-checks`
  (HEAD `3f484a5b549d7f2460f2d30a1183ebc127736517`; the entire change rides
  untracked under `cdd/changes/guard-pure-checks/`).
- `cdd/changes/guard-pure-checks/proposal.md`
- `cdd/changes/guard-pure-checks/design.md`
- `cdd/changes/guard-pure-checks/tasks.md`
- `cdd/changes/guard-pure-checks/specs/gherkin/spec.md` (the one delta)
- `cdd/specs/gherkin/spec.md` (the living spec the delta touches)
- `cdd/rules.md` — the loop law (delta shape, MODIFIED/REMOVED rules, pin form)
- Context, read-only: `scripts/spec-drift.mjs` and
  `cdd/archive/20261024-spec-model/` (the immediately preceding change whose
  conventions this one follows) — for judging verify-by realism only.

## Scope fence

- In scope: the drafted package — cross-artifact coherence, coverage,
  sponsorship, delta↔living-spec fit, verify-by realism.
- Out of scope: implementation (none exists yet), proposing redesigns, any
  fix. You report findings; you do not edit files.

## MUST-DELIVER checklist (the charter)

1. **Coverage** — every Done-When line maps to ≥1 delta requirement, and
   every requirement maps to ≥1 task. A Done-When with no requirement, or a
   requirement with no task, is a finding.
2. **Sponsorship** — no orphan tasks (no requirement or Done-When needs
   them) and no orphan requirements (no Done-When sponsors them).
3. **Same-change coherence (car/garden/rocket)** — proposal, delta, and
   tasks describe the same change; each artifact alone is well-formed but
   the three together must be about one thing. The `design.md` joins the
   check: the diagram's boxes map to real capabilities or modules, the
   level claim matches the stated risk, and design ↔ proposal ↔ delta hold
   no contradictions.
4. **MODIFIED/REMOVED legality** — every MODIFIED requirement restates EVERY
   scenario the living spec already has (silently dropping one is a
   finding); every REMOVED, where present, carries a `Reason:` line. This
   delta is ADDED-only; check the ADDED requirement does not already live
   in the living spec.
5. **Verify-by runnable as written** — each task's verify-by names a command
   or check that exists and would actually fail before / pass after the
   task; each scenario's `# Verified by:` pin names a real acceptance test
   path.

## Findings grammar (advisory — no fixes, no verdicts)

Each finding: severity `blocker` | `should` | `note`, the finding, evidence
(path:line). You report every finding with disposition `open`; the author
later sets `fixed:` or `won't-fix:` when disposing.
Never red/green verdicts; gate authority stays with the deterministic
validators and the human.

## Output

Write your findings to `cdd/changes/guard-pure-checks/reviews/r2-change-review.md`
(output path per `reviewPoint("R2").findings` in `lib/loop-law.mjs`). Header
records your reviewer form (cold sub-agent / same-session re-read) and your
model family vs. the author's (zai / glm-5.3 lineage).
