# R2 package review — 20261025-archive-stamp-name

## Change identity

- Change: `cdd/changes/20261025-archive-stamp-name/`
- Artifacts under review: the whole package — `proposal.md`, `design.md` (the design gate answered T2 YES, rule 2c), `tasks.md`, and both deltas `specs/gherkin/spec.md` + `specs/adr/spec.md` — at draft-green (validate draft passes, no implementation task ticked yet; the design-section ticks are expected at draft-green)
- Review point: R2 (package), always at draft-green

## Independence record

The author ran as zai/glm-5.3 (family zai, from PI_MODEL). Any reviewer outside
the zai family (family = same provider or model lineage) satisfies rule 2b's
family-difference requirement — record your own actual model + family in the
findings header from your runtime metadata. If you cannot establish that the
families differ, say so in your findings header and stop.

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the
  paths below, from disk at the pinned state. Loop law rule 2b — the reviewer
  is not the author of the artifacts under review.
- Skill: run `cdd-spec-review` in **package mode** (its SKILL.md lives at
  /home/carsten/Projects/pi-extensions/pi-cdd/skills/cdd-spec-review/SKILL.md — read it first).
- Mid-change state: the change folder is uncommitted work on top of the pinned
  commit — normal. No implementation exists yet: the acceptance pin files
  named by the scenarios do not exist on disk by design (RED-first writing is
  tasks 3.2/3.3, which fire only after this review); draft mode does not
  require pin files to exist.
- Known context you should weigh, not flag as new: the delta is TWO capability
  files because the director ruled the R1 blocker fixed by split (recorded in
  `cdd/changes/20261025-archive-stamp-name/reviews/r1-proposal-review.md` and
  the tasks §2.1 re-tick); the spec-size warnings below are the standing
  Tier A size signals, ruled budget-unchanged at the director's M0 — each
  delta carries its own split-considered line.

## Inputs (paths, pinned state)

- Repository at commit 5667775c2efb86bf42b6ed9b76b4436f134caadb (working tree
  if the change is uncommitted — state that in your findings header).
- `cdd/changes/20261025-archive-stamp-name/proposal.md`
- `cdd/changes/20261025-archive-stamp-name/design.md`
- `cdd/changes/20261025-archive-stamp-name/tasks.md`
- `cdd/changes/20261025-archive-stamp-name/specs/gherkin/spec.md` (delta, ADDED)
- `cdd/changes/20261025-archive-stamp-name/specs/adr/spec.md` (delta, MODIFIED)
- `cdd/specs/gherkin/spec.md` (living spec touched)
- `cdd/specs/adr/spec.md` (living spec touched — the MODIFIED must restate
  its "The reconfirm op records decision reconfirmation" requirement complete,
  scenarios at ~line 110-208)
- `cdd/rules.md` — the loop law (delta shape, MODIFIED/REMOVED rules, pin form)
- `cdd/changes/20261025-archive-stamp-name/reviews/r1-proposal-review.md` —
  context for the gate re-tick and the split ruling (read input, not under review)

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
   check: the diagram's boxes map to real capabilities or modules, the level
   claim matches the stated risk, and design ↔ proposal ↔ delta hold no
   contradictions.
4. **MODIFIED/REMOVED legality** — every MODIFIED requirement restates EVERY
   scenario the living spec already has (silently dropping one is a
   finding); every REMOVED, where present, carries a `Reason:` line.
5. **Verify-by runnable as written** — each task's verify-by names a command
   or check that exists and would actually fail before / pass after the
   task; each scenario's `# Verified by:` pin names a real acceptance test
   path (the pin FILES need not exist yet — they are written RED-first in
   tasks 3.2/3.3 after this review; judge the path's plausibility against
   `tests/acceptance/`).

## Findings grammar (advisory — no fixes, no verdicts)

Each finding: severity `blocker` | `should` | `note`, the finding, evidence
(path:line). You report every finding with disposition `open`; the author
later sets `fixed:` or `won't-fix:` when disposing.
Never red/green verdicts; gate authority stays with the deterministic validators and the human.

## Output

Write your findings to `cdd/changes/20261025-archive-stamp-name/reviews/r2-change-review.md`
(output path per `reviewPoint("R2").findings` in `lib/loop-law.mjs`). Header
records your reviewer form (cold sub-agent / same-session re-read) and your
model family vs. the author's. End with one line: VERDICT: PROCEED or
VERDICT: HOLD (HOLD only if an open blocker exists).
