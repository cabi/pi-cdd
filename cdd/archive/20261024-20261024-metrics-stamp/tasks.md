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

# Tasks — 20261024-metrics-stamp

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

Gate record — answered 2026-10-24 before any artifact; M0 director rulings accepted (intercom session 01a16f41):
- T1 cross-cutting: NO — one capability: the delta is ADDED-only under the gherkin store-ops spec (precedent: "A new change reports the store verdict at start" claims lib/store.mjs), and lib/metrics.mjs rides that capability's Code line; no second spec ages.
- T2 architecture bet: YES — three bets: (1) seam placement: derivation in a new pure lib/metrics.mjs consumed by archiveChange, not inline in lib/store.mjs; (2) stamp-time freeze: every git fact is labeled as-of-stamp — the archive commit never exists for the stamp (beyond-2-norm omitted-with-reason; feature→archive gap recorded not-derivable-at-stamp), an intentional information freeze vs the phase-0 post-hoc columns; (3) trust model: a mechanical declared-counts cross-check plus a format-version line replace author self-report (PF-14/PF-26/PF-33 lesson).
- T3 shared seam: NO — consumes the existing single-parse seam: imports parseSpecModel/splitTaskSections/TASK_ITEM from canonical scripts/grammar-law.mjs (the import lib/store.mjs:16 already makes; NOT the byte-identical cdd/scripts consumer copy — PF-28 discipline) and FINDINGS_GRAMMAR from lib/loop-law.mjs:68; modifies no seam other code shares.
- T4 invariant risk: NO — additive best-effort write inserted between existing archive steps (strict validation → merge → auto-tick → stamp → rename); never gates archive (pinned by scenario); archive folders already hold non-spec files (red-records.md in 4 archives), and guard tolerance is door 2/3 evidence at Close.
- T5 parallel work: NO — cdd/changes/ holds exactly this folder (fresh read); the phase-2 session-token join is held by PF-33 and consumes stamps read-only.
- Chosen shape: design.md at the change root (rule 2c), C4 Component level — the bets are intra-tool seams (who derives, who parses, what trusts what), visible only at Component zoom.

- [x] 2.1 Design gate — record above answers all five triage triggers (T1 NO, T2 YES, T3 NO, T4 NO, T5 NO) with evidence; chosen shape design.md, C4 Component level, verify by this line naming all five answers, the chosen shape, and the C4 level
## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
- [x] 3.2 Acceptance pins RED — write tests/acceptance/archive-metrics-stamp.test.js pinning all 7 delta scenarios (fixture change with 2 done-whens / 3 non-goals / 1 ADDED req with 4 scenarios / 5 task checkboxes; 7-layout reviews fixture incl. the lying-declared-Counts file; 3-commit git store; non-git store; throwing derivation), run it against the unimplemented stamp, record the red output — verify by reviews/red-records.md quoting the failing run of every scenario pin before any implementation tick
- [x] 3.3 lib/metrics.mjs — pure deriveStamp(changeDir, {headSha, git}) exporting the stamp text and a structured {stamped, reason?} result: spec-strength via the single parse (parseSpecModel + splitTaskSections/TASK_ITEM from canonical scripts/grammar-law.mjs; FINDINGS_GRAMMAR vocabulary), review-yield with the 7-layout findings parser, 1 format-version line, declared-counts cross-check with mismatch lines, convergence as-of-stamp, honest-gaps, not-derivable: <reason> for failing fields — verify by node --test tests/acceptance/archive-metrics-stamp.test.js green on the derivation unit checks
- [x] 3.4 archiveChange call point — call deriveStamp between the Close auto-tick and the rename, wrapped so a total stamp failure never gates the archive and the archive result carries the stamp outcome — verify by node --test tests/acceptance/archive-metrics-stamp.test.js green on the archive-flow checks and node tests/smoke.mjs exiting 0
- [x] 3.5 Full sweep — all 7 scenario pins green end to end, npm test exiting 0, fresh-node validateChange green after the lib edits (PF-35), node cdd/scripts/spec-drift.mjs green — verify by this run's output tails recorded in the Close report
## Done When Traceability

| criterion | task ids |
|---|---|
| DW-83 stamp fields mechanical / not-derivable: <reason>, never estimated | 3.2, 3.3, 3.5 |
| DW-84 spec-strength counts equal grep-truth; delta counts import the single parse | 3.2, 3.3, 3.5 |
| DW-85 declared-Counts contradiction → stamped mismatch line, never silent trust | 3.2, 3.3, 3.5 |
| DW-86 as-of-stamp labels, beyond-2-norm omitted-with-reason, feature→archive gap in honest-gaps | 3.2, 3.3, 3.5 |
| DW-87 stamp failure never blocks archive; result carries stamp outcome; non-git store stamps git fields not-derivable | 3.2, 3.3, 3.4, 3.5 |

## 4. Close

- [x] 4.1 Standards-axis change code review — run skill `cdd-code-review` with the standards-axis brief (brief-r3-standards.md) over the diff since the change branched, in its own cold session; findings at `reviews/r3-standards-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-standards-code-review.md holding no open blocker
- [x] 4.2 Spec-axis change code review — run skill `cdd-code-review` with the spec-axis brief (brief-r3-spec.md) over the same diff, in a second cold session; findings at `reviews/r3-spec-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-spec-code-review.md holding no open blocker
- [x] 4.3 ADR review — none run: this change drafted no ADR and amended no decision content (ADR-0012's file saw comment hygiene and the Reconfirmed-by paragraphs, neither counts); skip recorded on this line, verify by this skip line
- [x] 4.4 cdd validate strict green, guard green
- [x] 4.5 Archive — pair-commit: feature commit, then archive commit
