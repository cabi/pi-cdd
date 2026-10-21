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

Review tasks: task 3.1 (Change review) runs cdd-spec-review in package
mode at draft-green — the package drafted, validate draft green, before
the first implementation task ticks; the Close review tasks run before
archive. A review reports advisory findings (severity + disposition),
never verdicts: it ticks only when no blocker is open, and the
deterministic validators keep gate authority.

Anti-scope-creep: no task may exist without a spec requirement or Done-When
criterion that needs it. Improvements no criterion demands go back to the
proposal as Non-Goals or a future change.
-->

# Tasks — run-acceptance-suites

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

- [x] 2.1 Design gate — T1 cross-cutting NO (single concern: the test entrypoint), T2 architecture bet NO (node --test vs enumerated scripts vs runner script is a reversible one-line choice, verified locally), T3 shared seam NO (npm test seam is extended additively — suites added, no consumer changes), T4 invariant risk NO (no living requirement pins npm test contents), T5 parallel work NO (no open changes) — skip record, no design section needed, verify by this line naming all five answers

## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
- [x] 3.2 Acceptance pin suite exists and is red — tests/acceptance/run-acceptance.test.js proves by TAP probe that the npm test sweep executes every tests/acceptance/*.test.js suite (self-guarded against recursion), that node --test fails on a failing suite, and that the CI workflow runs npm test as a step, verify by tests/acceptance/run-acceptance.test.js
- [x] 3.3 Test entrypoint runs the acceptance sweep — package.json "test" gains `&& node --test` (bare invocation, node-20-compatible; directory and glob arguments rejected), verify by npm test exiting 0

## Done When Traceability

| criterion | task ids |
|---|---|
| `npm test` in a clean checkout executes every `tests/acceptance/*.test.js` suite and exits nonzero when any of them fails | 3.2, 3.3 |

## 4. Close

- [x] 4.1 Change code review — run skill `cdd-code-review` over the diff since the change branched; findings at `reviews/r3-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-code-review.md holding no open blocker
- [x] 4.2 ADR review — skipped: this change drafted or amended no ADRs under cdd/decisions/ (the node --test invocation choice is reversible, unspectacular, single-capability — fails the four-criterion test), verify by reviews/adr-review.md holding no open blocker or a skip recorded on this line
- [x] 4.3 cdd validate strict green, guard green strict green, guard green
- [x] 4.4 Archive — pair-commit: feature commit, then archive commit
