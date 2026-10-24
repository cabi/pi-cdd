# R2 package review — ops-registry

## Change identity

- Change: `cdd/changes/ops-registry/`
- Artifacts under review: the whole package — `proposal.md`, `design.md`
  (the design gate answered T4 YES, so rule 2c produced it), `tasks.md`,
  and both deltas `specs/extension/spec.md` and `specs/gherkin/spec.md` —
  at draft-green (validate draft passes, no implementation task ticked
  yet; design-section ticks are expected at draft-green)
- Review point: R2 (package), always at draft-green

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the
  paths below, from disk at the pinned state. Loop law rule 2b — the reviewer
  is not the author of the artifacts under review.
- Your model family must differ from the author's model family (family = same
  provider or model lineage). The author's family is **zai/glm-5.3**. Verify
  your own family from your runtime environment if you can — if you cannot
  establish it, say so in your findings header and proceed, reporting what
  you know.
- One-shot invocation context: you were launched as `pi -p --no-session` with
  model `opencode-zen/deepseek-v4.1-flash`; report that invocation id in your
  findings header as your family evidence.

## Inputs (paths, pinned state)

- Repository working tree at branch `ops-registry`, HEAD `4afb08b` plus this
  change's uncommitted artifacts (state that in your findings header).
- `cdd/changes/ops-registry/proposal.md`
- `cdd/changes/ops-registry/design.md`
- `cdd/changes/ops-registry/tasks.md`
- `cdd/changes/ops-registry/specs/extension/spec.md` (delta)
- `cdd/changes/ops-registry/specs/gherkin/spec.md` (delta)
- `cdd/specs/extension/spec.md` (living spec touched)
- `cdd/specs/gherkin/spec.md` (living spec touched)
- `cdd/rules.md` — the loop law (delta shape, MODIFIED/REMOVED rules, pin form)

## Scope fence

- In scope: the drafted package — cross-artifact coherence, coverage,
  sponsorship, delta↔living-spec fit, verify-by realism.
- Out of scope: implementation (none exists yet), proposing redesigns, any
  fix. You report findings; you do not edit files.
- Note the R1 record exists at `cdd/changes/ops-registry/reviews/r1-proposal-review.md`
  with dispositions — reading it is allowed for continuity, but R2 judges the
  package as it stands on disk.

## MUST-DELIVER checklist (the charter)

1. **Coverage** — every Done-When line maps to ≥1 delta requirement, and
   every requirement maps to ≥1 task. A Done-When with no requirement, or a
   requirement with no task, is a finding.
2. **Sponsorship** — no orphan tasks (no requirement or Done-When needs
   them) and no orphan requirements (no Done-When sponsors them).
3. **Same-change coherence (car/garden/rocket)** — proposal, design.md,
   delta, and tasks describe the same change; the diagram's boxes map to
   real modules, the level claim matches the stated risk, and
   design ↔ proposal ↔ delta hold no contradictions.
4. **MODIFIED/REMOVED legality** — every MODIFIED requirement restates EVERY
   scenario the living spec already has (silently dropping one is a
   finding); REMOVED, where present, carries a `Reason:` line. ADDED
   requirements must not already live in the spec.
5. **Verify-by runnable as written** — each task's verify-by names a command
   or check that exists and would actually fail before / pass after the
   task; each scenario's `# Verified by:` pin names a real acceptance test
   path.

## Findings grammar (advisory — no fixes, no verdicts)

Each finding: severity `blocker` | `should` | `note`, the finding, evidence
(path:line). You report every finding with disposition `open`; the author
later sets `fixed:` or `won't-fix:` when disposing.
Never red/green verdicts; gate authority stays with the deterministic validators and the human.

## Output

Write your findings to `cdd/changes/ops-registry/reviews/r2-change-review.md`
Header records your reviewer form (cold sub-agent) and your model family
vs. the author's.
