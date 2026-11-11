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
The Close review tasks run before archive: cdd-code-review — two
axes, two cold sessions: the standards axis (findings at
reviews/r3-standards-code-review.md) and the spec axis (findings at
reviews/r3-spec-code-review.md) — and, if the change drafted an ADR or amended one's decision content — a Reconfirmed-by paragraph or a typo fix does not count,
cdd-adr-review (findings at reviews/adr-review.md).
A review reports advisory findings (severity blocker/should/note + disposition), never
verdicts: it ticks only when no blocker is open, and the
deterministic validators keep gate authority. Reviews run cold (rule 2b): the reviewer is not the author of the artifacts under review — every model-run review (R2, R3, ADR) is a fresh cold sub-agent session briefed from paths on disk; a same-session re-read is the weaker fallback and records its form and justification in the findings file header.

Anti-scope-creep: no task may exist without a spec requirement or Done-When
criterion that needs it. Improvements no criterion demands go back to the
proposal as Non-Goals or a future change.
-->

# Tasks — fix-l3-implementation-count

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

- [x] 2.1 Design gate — answer the five triage triggers (T1 cross-cutting, T2 architecture bet, T3 shared seam, T4 invariant risk, T5 parallel work): any YES needs a short design above; a T2 or T4 YES instead carries `design.md` at the change root (rule 2c: four sections, one C4 flowchart) — the record names the chosen shape and, for design.md, the C4 level and why; all NO is recorded here as the skip record, verify by this line naming all five answers, the chosen shape, and the C4 level — skip record: T1 NO (one capability: gherkin owns the guard source, its store copy, and the pin; no cross-capability files — GLOSSARY.md is a store-root documentation file no capability claims, carried as the task-only criterion DW5), T2 NO (no architecture bet — one check narrows its input), T3 NO (no new seam — `splitTaskSections` already returns the named skeleton sections), T4 NO (same-verdict is strengthened, not risked: the guard adopts the validator's existing count; no invariant newly at risk), T5 NO (no open change claims gherkin guard law); shape: skip record, no design.md, no C4 level

## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
- [x] 3.2 Acceptance pin runs the real doors and is red on the unfixed guard — `tests/acceptance/guard-l3-scope.test.js` covers the delta's four scenarios through the real guard entry point and the real strict validator (no copied fragments), verify by node --test tests/acceptance/guard-l3-scope.test.js reporting the pre-fix red: scaffold-overhead scenario fails (L3 fires on 13 tracked), agreement scenario fails (guard counts 13, validator counts 9), scoped-message scenario fails ("tracked tasks" wording), split-considered scenario already passes
- [x] 3.3 Guard task-scale law counts implementation subtasks only — `scripts/spec-drift.mjs` checkL3 selects the `## 3. Implementation` section's items instead of summing all four sections, and its issue line and header comment say "implementation subtasks", verify by node --test tests/acceptance/guard-l3-scope.test.js green against the guard source scripts/spec-drift.mjs (store-copy refresh and the full sweep belong to 3.4)
- [x] 3.4 Store copy refreshed byte-identical and sweep re-green — `cdd/scripts/spec-drift.mjs` is re-copied from `scripts/spec-drift.mjs`, verify by cmp scripts/spec-drift.mjs cdd/scripts/spec-drift.mjs reporting no difference and node --test tests/ reporting 58 passed, 0 failed
- [x] 3.5 Glossary pins the two count terms — `GLOSSARY.md` gains the implementation subtask and tracked task entries with Avoid lists, and the design-gate entry's "more than 8 tasks" becomes "more than 8 implementation subtasks", verify by grep -c "^\*\*implementation subtask\*\*\|^\*\*tracked task\*\*\|more than 8 implementation subtasks" GLOSSARY.md returning 3

## Done When Traceability

| criterion | task ids |
|---|---|
| 9 implementation subtasks + 4 non-implementation tracked tasks pass the guard with no L3 issue | 3.2, 3.3 |
| 13 implementation subtasks fail with exactly 1 L3 issue naming "13 implementation subtasks (> 12)"; split-considered line passes | 3.2, 3.3 |
| guard count equals strict validator count (9) on the same tasks file | 3.2, 3.3 |
| `cdd/scripts/spec-drift.mjs` byte-identical to `scripts/spec-drift.mjs` | 3.4 |
| GLOSSARY.md defines both terms; design-gate entry names 8 implementation subtasks | 3.5 (task-only: no spec or delta claims GLOSSARY.md — store-root documentation outside every capability; archive-stamp-name precedent) |

## 4. Close

- [ ] 4.1 Standards-axis change code review — run skill `cdd-code-review` with the standards-axis brief (brief-r3-standards.md) over the diff since the change branched, in its own cold session; findings at `reviews/r3-standards-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-standards-code-review.md holding no open blocker
- [ ] 4.2 Spec-axis change code review — run skill `cdd-code-review` with the spec-axis brief (brief-r3-spec.md) over the same diff, in a second cold session; findings at `reviews/r3-spec-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-spec-code-review.md holding no open blocker
- [ ] 4.3 ADR review — if this change drafted an ADR under `cdd/decisions/` or amended one's decision content (a Reconfirmed-by paragraph or a typo fix does not count), run skill `cdd-adr-review` on them (findings at `reviews/adr-review.md` per that skill); if none, record the skip on this line, verify by reviews/adr-review.md holding no open blocker or a skip recorded on this line
- [ ] 4.4 cdd validate strict green, guard green
- [ ] 4.5 Archive — pair-commit: feature commit, then archive commit; the archive commit also re-points PF-6's premise in `cdd/backlog.md` (gherkin 53→54, mirroring 91fe446), verify by grep -c "premise: grep:### Requirement:@cdd/specs/gherkin/spec.md=54" cdd/backlog.md returning 1 && git log --oneline -2
