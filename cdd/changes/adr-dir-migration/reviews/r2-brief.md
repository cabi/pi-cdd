# R2 package review — adr-dir-migration

## Change identity

- Change: `cdd/changes/adr-dir-migration/`
- Artifacts under review: the whole package — `proposal.md`, `tasks.md`, and
  every delta `specs/*/spec.md` — at draft-green (validate draft passes, no
  implementation task ticked yet; design-section ticks are expected at draft-green)
- Review point: R2 (package), always at draft-green

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the
  paths below, from disk at the pinned state. Loop law rule 2b — the reviewer
  is not the author of the artifacts under review.
- Your model family must differ from the author's model family (family = same
  provider or model lineage). The author's family is **zai** (zai/glm-5.3).
  Verify your own family from your runtime environment (e.g. `PI_PROVIDER`)
  — if you cannot establish that the families differ, say so in your findings
  header and stop.
- Two R3 axes will later run with separate findings files; that concern does
  not apply to you — you own the single R2 findings file named below.

## Inputs (paths, pinned state)

- Repository working tree on branch `adr-migration` (HEAD `6ce22d1`, the
  change folder uncommitted) — state that in your findings header.
- `cdd/changes/adr-dir-migration/proposal.md`
- `cdd/changes/adr-dir-migration/tasks.md`
- `cdd/changes/adr-dir-migration/specs/adr/spec.md` (new capability, ADDED)
- `cdd/changes/adr-dir-migration/specs/gherkin/spec.md` (MODIFIED ×2)
- `cdd/specs/gherkin/spec.md` (the living spec the gherkin delta touches; the
  adr capability has no living spec yet — it is new)
- `cdd/rules.md` — the loop law (delta shape, MODIFIED/REMOVED rules, pin form)

## Scope fence

- In scope: the drafted package — cross-artifact coherence, coverage,
  sponsorship, delta↔living-spec fit, verify-by realism.
- Out of scope: implementation (none exists yet), proposing redesigns, any
  fix. You report findings; you do not edit files.
- Note: the change's own commit-M relocation has not run yet — ADRs
  0001–0007 still sit at the repository root. Judge the package as drafted,
  not as applied.

## MUST-DELIVER checklist (the charter)

1. **Coverage** — every Done-When line maps to ≥1 delta requirement, and
   every requirement maps to ≥1 task. A Done-When with no requirement, or a
   requirement with no task, is a finding.
2. **Sponsorship** — no orphan tasks (no requirement or Done-When needs
   them) and no orphan requirements (no Done-When sponsors them).
3. **Same-change coherence (car/garden/rocket)** — proposal, delta, and
   tasks describe the same change; each artifact alone is well-formed but
   the three together must be about one thing.
4. **MODIFIED/REMOVED legality** — every MODIFIED requirement restates EVERY
   scenario the living spec already has (silently dropping one is a
   finding); every REMOVED, where present, carries a `Reason:` line.
5. **Verify-by runnable as written** — each task's verify-by names a command
   or check that exists and would actually fail before / pass after the
   task; each scenario's `# Verified by:` pin names a real acceptance test
   path. (For pins to tests that this change itself will create —
   `tests/acceptance/decisions-home.test.js` — the pin is legal if the
   package contains the task that creates it; strict-validate enforcement of
   pin existence happens only after that task runs.)

## Findings grammar (advisory — no fixes, no verdicts)

Each finding: severity `blocker` | `should` | `note`, the finding, evidence
(path:line). You report every finding with disposition `open`; the author
later sets `fixed:` or `won't-fix:` when disposing.
Never red/green verdicts; gate authority stays with the deterministic validators and the human.

## Output

Write your findings to `cdd/changes/adr-dir-migration/reviews/r2-change-review.md`
(output path per `reviewPoint("R2").findings` in `lib/loop-law.mjs`). Header
records your reviewer form (cold sub-agent / same-session re-read) and your
model family vs. the author's.
