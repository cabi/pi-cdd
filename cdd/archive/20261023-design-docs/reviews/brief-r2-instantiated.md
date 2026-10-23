<!--
INSTANTIATED — R2 package review brief for change `design-docs`.

Instantiated from the NEW brief-r2.md template (it carries this change's
task-3.5 deliverable: design.md in the object line + the design-alignment
check). BOOTSTRAP ORDER (director-approved): the brief/SKILL template edits
landed before R2 so this brief instantiates from the new template — treat
skills/cdd-spec-review/brief-r1.md, brief-r2.md, and SKILL.md as part of
the change's own deliverables (they implement the delta requirement
"Reviewer briefs live next to their skills"), not pre-existing
infrastructure. No other implementation task is ticked: the acceptance
suite, loop-law rule 2c, designTemplate(), and the cdd/rules.md mirror do
not exist yet (hence guard L1 pins on tests/acceptance/design-docs.test.js
are expected, not findings).

Author family: zai (glm-5.3). Reviewer must be another family.
-->

# R2 package review — design-docs

## Change identity

- Change: `cdd/changes/design-docs/`
- Artifacts under review: the whole package — `proposal.md`, `design.md`
  when the design gate produced one (T2 or T4 YES, rule 2c), `tasks.md`,
  and every delta `specs/*/spec.md` — at draft-green (validate draft passes, no
  implementation task ticked yet; design-section ticks are expected at draft-green)
- Review point: R2 (package), always at draft-green

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the
  paths below, from disk at the pinned state. Loop law rule 2b — the reviewer
  is not the author of the artifacts under review.
- Your model family must differ from the author's model family (family = same
  provider or model lineage). Verify your own family from your runtime
  environment (e.g. `PI_PROVIDER`) — the brief states the author's family,
  never yours as settled fact. If you cannot establish that the families
  differ, say so in your findings header and stop.

## Inputs (paths, pinned state)

- Repository at commit `28423ec` — but read the WORKING TREE (the change is
  uncommitted — state that in your findings header).
- `cdd/changes/design-docs/proposal.md`
- `cdd/changes/design-docs/design.md` — when the design gate produced one; skip when absent (rule 2c: prose-shaped changes carry none).
- `cdd/changes/design-docs/tasks.md`
- `cdd/changes/design-docs/specs/gherkin/spec.md` (every delta)
- `cdd/specs/gherkin/spec.md` (every living spec the delta touches)
- `cdd/rules.md` — the loop law (delta shape, MODIFIED/REMOVED rules, pin form)

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
   the three together must be about one thing. When a `design.md` exists
   (rule 2c), it joins the check: the diagram's boxes map to real
   capabilities or modules, the level claim matches the stated risk, and
   design ↔ proposal ↔ delta hold no contradictions.
4. **MODIFIED/REMOVED legality** — every MODIFIED requirement restates EVERY
   scenario the living spec already has (silently dropping one is a
   finding); every REMOVED, where present, carries a `Reason:` line.
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

Write your findings to `cdd/changes/design-docs/reviews/r2-change-review.md`
(output path per `reviewPoint("R2").findings` in `lib/loop-law.mjs`). Header
records your reviewer form (cold sub-agent / same-session re-read) and your
model family vs. the author's.
