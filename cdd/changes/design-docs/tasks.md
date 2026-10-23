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

Review tasks: task 3.1 (Change review) runs cdd-spec-review
in package mode at draft-green — the package drafted, validate draft green,
before the first implementation task ticks — findings at reviews/r2-change-review.md.
The Close review tasks run before archive: cdd-code-review (findings
at reviews/r3-code-review.md) and, if the change drafted an ADR or amended one's decision content — a Reconfirmed-by paragraph or a typo fix does not count,
cdd-adr-review (findings at reviews/adr-review.md).
A review reports advisory findings (severity blocker/should/note + disposition), never
verdicts: it ticks only when no blocker is open, and the
deterministic validators keep gate authority. Reviews run cold (rule 2b): the reviewer is not the author of the artifacts under review — every model-run review (R2, R3, ADR) is a fresh cold sub-agent session briefed from paths on disk; a same-session re-read is the weaker fallback and records its form and justification in the findings file header.

Anti-scope-creep: no task may exist without a spec requirement or Done-When
criterion that needs it. Improvements no criterion demands go back to the
proposal as Non-Goals or a future change.
-->

# Tasks — design-docs

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

- [x] 2.1 Design gate — T1 NO (every edit lands inside the loop-law capability's own files; no other capability's scenarios move), T2 YES (bets the design phase itself gains a structured, reviewable artifact: gate → shape → diagram → reviews), T3 NO (no new shared seam — designTemplate is a scaffold export consumed only by the pinning suite), T4 NO (the byte-pinned law↔mirror identity is an existing invariant guarded by the untouched single-source suite), T5 NO (one sequential implementation path) — T2 YES ⇒ shape: `design.md` at the change root, the first live instance of the artifact this change ships; C4 level: Container, because the risk lives in the artifact pipeline (which artifacts exist, who writes and reads them), not in any single module's internals — recorded in design.md — verify by this line naming all five answers, the chosen shape, and the C4 level; and design.md on disk with exactly the sections Level, Diagram, Boundaries, Alternatives and exactly 1 mermaid flowchart (the dogfood instance)

## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
- [x] 3.2 Acceptance suite RED — tests/acceptance/design-docs.test.js pins the tasks-scaffold gate clause, designTemplate's four-section contract, the brief-r1/brief-r2/SKILL.md object lines, and the design-doc rule in lib/loop-law.mjs and cdd/rules.md — verify by node tests/acceptance/design-docs.test.js failing on the untouched tree (RED); RED run: 4 passed (DD7 vacuous + DD16–18 briefs landed pre-R2 per the approved bootstrap order), 14 failed (DD1–DD9 law, DD10–DD15 scaffold)
- [x] 3.3 Loop law rule — lib/loop-law.mjs defines the design-doc rule (trigger, shape choice, four sections, one diagram, level convention, ADR layering) and renders it as rule 2c directly after rule 2b in the law text — verify by node tests/acceptance/design-docs.test.js law cases green (DD1–DD9)
- [x] 3.4 Design template — lib/templates.mjs exports designTemplate() beside the other artifact scaffolds (exactly four sections, one kind-carrying mermaid flowchart) and the tasks scaffold's design-gate line carries the T2-or-T4 shape clause — verify by node tests/acceptance/design-docs.test.js template cases green (DD10–DD15)
- [x] 3.5 Briefs and skill charter — brief-r1.md's review object grows to proposal.md + design.md when the gate produced one, brief-r2.md's package object includes design.md with one design-alignment check, and cdd-spec-review SKILL.md's object lines name design.md — verify by node tests/acceptance/design-docs.test.js brief cases green (DD16–DD18); edits landed before R2 per the director-approved bootstrap order, pinned green here
- [x] 3.6 Store mirror — cdd/rules.md regenerated with the explicit mirror write, byte-identical to the rendered law text — verify by node tests/acceptance/single-source-law.test.js and node tests/acceptance/design-docs.test.js exiting 0 (SSL 10/10, DD9, cmp-identical)

## Done When Traceability

| criterion | task ids |
|---|---|
| design.md exists with the four mandatory sections and exactly one mermaid flowchart (dogfood instance) | 2.1 |
| node tests/acceptance/design-docs.test.js exits 0 pinning gate clause, designTemplate contract, brief/SKILL object lines, law rule in module and mirror | 3.2, 3.3, 3.4, 3.5, 3.6 |
| cdd validate strict green and node cdd/scripts/spec-drift.mjs exits 0 on the change | 4.3 |

## 4. Close

- [x] 4.1 Change code review — run skill `cdd-code-review` over the diff since the change branched; findings at `reviews/r3-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-code-review.md holding no open blocker — both axes cold (deepseek-v4-pro vs author zai/glm-5.3), Standards COMPLETE (2 notes), Spec COMPLETE (4 advisory); zero blockers; dispositions appended in-file (2 fixed via SKILL.md proposal-mode line + DD2/DD18 pin strengthening + design.md station relabels, 4 won't-fix with rationale); PF-8 clobber hit a second time, Spec section reconstructed from the reviewer's report in-file
- [x] 4.2 ADR review — skip: this change drafted no ADR under `cdd/decisions/` and amended no decision content beyond tick notes (sponsor pre-settled no new ADR; the four-criterion resolution lives in proposal Solutions Considered), so the cdd-adr-review trigger does not fire, verify by this skip record (no reviews/adr-review.md needed)
- [x] 4.3 cdd validate strict green, guard green — cdd validate design-docs --mode strict PASS; node cdd/scripts/spec-drift.mjs full scan clean (5 specs, 19 acceptance test files, zero findings); npm test 19/19, smoke 35/35, single-source-law 10/10 after the R3 fixes
- [ ] 4.4 Archive — pair-commit: feature commit, then archive commit
