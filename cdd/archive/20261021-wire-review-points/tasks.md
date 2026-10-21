<!--
TASKS — how to fill and work this file (verified checklist traced to Done-When)

Before writing tasks, re-read the proposal's Done-When lines. If any
criterion is not observable as written, resolve it with the user first.

Format:
- Group tracked tasks under ## numbered headings; every tracked task is a
  checkbox "- [ ] X.Y Task" and MUST end with its verification:
  "verify by <command, test, or observable check>". A task without a
  verification is a wish, not a task.
- Phrase each task as the interface it establishes ("Reporter emits a CSV
  header row"), never as an activity ("implement reporting"). Work each
  task red-green-refactor: write the failing unit test that names that
  interface, implement the smallest code that turns it green, refactor
  freely. Unit tests are engineering artifacts born during apply — they
  churn with the design and are never pinned in the spec.
- Order by dependency. Keep each task small enough to finish in one session.
- Turn the design gate's open questions into early tasks. Keep a
  "## Design Notes" section only for decisions the design gate did not cover.
- Follow the implementation steps with "## Done When Traceability": a table row per proposal criterion —
  "| <criterion> | <task ids that verify it> |". If a criterion has no task,
  add the task or fix the criterion.

Scale rule: more than 8 implementation subtasks is the split signal — run
the split procedure at the design gate; more than 12 fails strict validation.
The split: read the traceability table (it is the split map), cut into N
proposals each with its own Done-When subset and its own delta, record
"Depends on:", supersede the original (never delete it). A genuinely atomic
change that must exceed 12 records a "split-considered: kept whole because
<reason>" line in this file instead.

Apply protocol: work strictly top-to-bottom, one task at a time. Tick a box
only after its verification passes ("checked" means "its verification
passed", never "I am done looking at it"); re-read this file after each
tick. If a verification fails, uncheck and fix — never continue on a red
check. Group-local testing: each group lands the unit tests its own work
calls for; a final group runs the scenarios' acceptance tests end to end.

Anti-scope-creep: no task may exist without a spec requirement or Done-When
criterion that needs it. Improvements no criterion demands go back to the
proposal as Non-Goals or a future change.
-->

# Tasks — wire-review-points

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

- [x] 2.1 Design gate — T1 cross-cutting YES: the loop law is stated in five places (RULES_MD mirrored into the store copy cdd/rules.md, the ambient block, /cdd-help, the per-artifact instructions, the README driving table) and this change updates all of them in one stroke; T2 architecture bet YES: "reviews are advisory findings, never verdicts; deterministic validators and the human keep gate authority" is a method-level bet → ADR-0008 drafted (status: draft, human resolves) into cdd/decisions/; T3 shared seam NO: extends the existing corpus seam (instructions + templates; the skills are already bundled); T4 invariant risk NO: deterministic doors unchanged — review points add law lines and scaffolded tasks only, no validator/guard logic changes; T5 parallel work NO: cdd/changes/ held only this change at gate time — verify by this line naming all five answers

Short design (T1/T2 = YES):

- Loop law: RULES_MD rule 2 gains the three review points, new rule 2a states the advisory-findings grammar and gate authority; mirrored by hand into the store copy cdd/rules.md (init never rewrites an existing store). The design-gate record timing is stated in the law: the T1–T5 answers land in tasks §2 as the gate runs, before the proposal is drafted.
- Templates: tasksTemplate scaffolds 3.1 Change review before the first implementation task; Close gains the R3 code-review task and the conditional ADR-review task; PROPOSAL_INSTRUCTION gains the R1 tail; TASKS_INSTRUCTION carries the matching clauses.
- Ambience: lib/context.mjs loop line, lib/help.mjs steps, README driving table carry the same review points in the same change.
- ADR-0008 drafted with status draft (ADR_STATUSES accepts it — scripts/law.mjs:245) for the human to resolve; resolved accepted by the sponsor at Close (adr-review).

## 3. Implementation

- [x] 3.1 Change review — at draft-green run skill cdd-spec-review in package mode over the whole change package (proposal, delta, tasks); findings at reviews/r2-change-review.md; dispose every blocker with recorded dispositions, verify by reviews/r2-change-review.md holding no open blocker
- [x] 3.2 Author the acceptance pin red — tests/acceptance/review-wiring.test.js with checks for all 7 loop statements, the tasks scaffold shape, ADR-0008, and the smoke needle, every wiring check failing against the current tree (only the pre-existing guard check RW13 may be green), verify by node tests/acceptance/review-wiring.test.js exiting 1 with 14 of 15 checks red at this point
- [x] 3.3 Loop law — lib/templates.mjs RULES_MD: rule 2 states the T1–T5 record lands in tasks §2 as the gate runs before the proposal, places R1/R2/R3 in the chain, and new rule 2a states skills, modes, findings paths, and the advisory-findings grammar; mirror every change into the store copy cdd/rules.md (catching up its stale rule 4 to the ADR-0006 fence form), verify by node tests/acceptance/review-wiring.test.js reporting RW1–RW5 ok
- [x] 3.4 Templates and instructions — lib/templates.mjs tasksTemplate scaffolds 3.1 Change review before the placeholder implementation task and Close review items before validate/archive; lib/instructions.mjs PROPOSAL_INSTRUCTION gains the R1 tail and TASKS_INSTRUCTION the matching clauses, verify by node tests/acceptance/review-wiring.test.js reporting RW8–RW11 ok
- [x] 3.5 Ambience — lib/context.mjs ambient loop line, lib/help.mjs help steps, and the README driving-the-loop table name R1/R2/R3 with triggers and findings paths, verify by node tests/acceptance/review-wiring.test.js reporting RW6, RW7, and RW14 ok
- [x] 3.6 ADR-0008 — draft cdd/decisions/0008-model-run-reviews-are-advisory-findings.md with status draft following the ADR form, verify by node tests/acceptance/review-wiring.test.js reporting RW12 and RW13 ok
- [x] 3.7 Smoke S34 — tests/smoke.mjs gains exactly 1 check pinning the review scaffolds, verify by npm test


## Done When Traceability

| criterion | task ids |
|---|---|
| exactly 7 loop statements name R1, R2, R3 with triggers and findings paths, pinned by review-wiring.test.js | 3.2, 3.3, 3.4, 3.5 |
| scaffolded tasks.md holds 3.1 Change review before the first implementation task and Close review tasks before archive, pinned by review-wiring.test.js | 3.2, 3.4 |
| cdd/decisions/ holds ADR-0008 with a guard-accepted status (accepted at Close) | 3.2, 3.6 |
| npm test exits 0 | 3.7 |
| node scripts/spec-drift.mjs full scan exits 0 | 3.2, 3.3, 3.4, 3.5, 3.6, 3.7 |

## 4. Close

- [x] 4.1 Change code review — run skill cdd-code-review over the feature diff; findings at reviews/r3-code-review.md; dispose every blocker with recorded dispositions, verify by reviews/r3-code-review.md holding no open blocker
- [x] 4.2 ADR review — this change drafted ADR-0008, so run skill cdd-adr-review on it; findings at reviews/adr-review.md per that skill; dispose every blocker, verify by reviews/adr-review.md holding no open blocker
- [x] 4.3 cdd validate strict green, guard green
- [x] 4.4 Archive — pair-commit: feature commit, then archive commit
