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
The split: read the traceability table (the split map), cut into N
proposals each with its Done-When subset and its own delta, record
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

# Tasks — backlog-revalidate

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs — cdd/specs/gherkin/spec.md (skill-bundling, process-findings requirements), cdd/specs/extension/spec.md (backlog-op requirement), skills/cdd-backlog-triage/SKILL.md, lib/backlog.mjs, lib/templates.mjs, index.ts, tests/smoke.mjs (S37), tests/tools.mjs (T3h), tests/acceptance/backlog-op.test.js, cdd/backlog.md (all open PF lines), verify by this line naming what was read

## 2. Design

- [x] 2.1 Design gate — T1 cross-cutting **YES** (one change touches the triage skill, the backlog op, and the loop-law rule 13 text: gherkin ×2 + extension ×1 requirements); T2 architecture bet **NO** (the premise evaluator is a closed three-form micro-grammar inside the existing EXPECT-chain parser — no new paradigm); T3 shared seam **NO** (lib/backlog.mjs stays the single owner; no new module others depend on); T4 invariant risk **NO** (rule 13's ungated-backlog invariant is preserved verbatim — revalidate is an action of the op, never a door; validate and the guard stay untouched); T5 parallel work **NO** (no other open change). Chosen shape: T1 short design below; no design.md (T2/T4 NO, C4 level N/A).

Short design (T1):

- **Premise micro-form** — a closed grammar the tool evaluates itself, in-process, with zero shell and zero regex: `exists:<relpath>` | `absent:<relpath>` | `grep:<literal>@<relpath>=<n>` where `n` is the exact count of lines containing `literal` as a plain substring. Delimiters `@` and `=` are reserved out of pattern/path, `|` and newlines are already impossible (segment grammar), paths are store-root-relative with no `..` component. Literal-substring + exact count over any pattern engine: no metacharacters exist to escape, so the glob-translation escaping disease cannot occur by construction; in-process fs + string scan over shelling out to test/grep: a data file must never become an exec vector.
- **Segment grammar** — the EXPECT chain extends to source → change → note → premise → verified (each at most once, in that order; the parts cap moves 4 → 6). `premise:` is syntax-checked at parse time through the existing off-grammar refusal path; `verified:` holds strictly-increasing ISO dates and is machine-written (only revalidate stamps it; add may carry a premise, resolve never touches premise or verified).
- **revalidate** — a new action of the existing backlog op (no new op; the backlog op's action enum in OPS_DOC gains revalidate, derived from the exported ACTIONS table): evaluates every premise-bearing item whose status is open, watch, or seeded-into-change; verdicts hold / ROTTED / NOT-MECHANICAL / ANCHOR-GONE; stamps today's date into `verified` (same-day rerun idempotent); a 3rd distinct verified date appends a force-a-disposition flag to that item's report line. It never writes status, summary, premise, change, or note — dispositions stay the triager's call (stale ≠ done).
- **list staleness** — item lines render verbatim; a trailing staleness block lists every active item as never-verified or verified YYYY-MM-DD (N days old), and marks a vanished grep anchor.
- **Enumeration single-sourcing** — lib/backlog.mjs exports `ACTIONS`; index.ts's unknown-action refusal, the library's silent-exec message, and the backlog op's action enum in OPS_DOC all derive from it. Rule 13's parenthetical becomes non-enumerative ("its actions are listed by the tool's help") in lib/templates.mjs RULES_MD, mirrored byte-for-byte into cdd/rules.md.
- **Dogfood** — premise backfills as freehand line edits for PF-1, PF-10, PF-11, PF-12, PF-21, PF-22 (PF-12 also gains the non-exhaustive-proxy note); `revalidate` then runs over the live ledger — PF-10/PF-11 are expected ROTTEN (their fixing archives exist) and resolve done with archive evidence; the full output is saved in the change folder.

## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
- [x] 3.2 The item grammar carries optional premise and verified segments — acceptance tests first (RED), then lib/backlog.mjs: parseLine walks the extended EXPECT chain, validates premise micro-form syntax and verified ISO dates at parse time, render appends both segments, addBacklogItem accepts and validates a premise, refusals name the malformed segment, verify by node tests/acceptance/backlog-revalidate.test.js grammar scenarios green
- [x] 3.3 The backlog op gains action revalidate — acceptance tests first (RED), then lib/backlog.mjs revalidateBacklog + index.ts wiring: per-item verdicts hold/ROTTED/NOT-MECHANICAL/ANCHOR-GONE over active items, verified stamping append-only and same-day idempotent, three-distinct-dates force-a-disposition flag, dispositions byte-untouched, unknown-action message derived from the exported ACTIONS table (silent-exec message included), verify by node tests/acceptance/backlog-revalidate.test.js revalidate scenarios green
- [x] 3.4 list annotates staleness — acceptance tests first (RED), then listBacklog: item lines verbatim plus a staleness block (never-verified or verified date + age in days, vanished grep anchors marked) over active items, verify by node tests/acceptance/backlog-revalidate.test.js list scenarios green
- [x] 3.5 Rule 13 names no action enumeration — the parenthetical in lib/templates.mjs RULES_MD becomes non-enumerative, mirrored byte-for-byte into cdd/rules.md, and backlog-op.test.js BO10 pins the new letter in both sources (RED first), verify by node tests/acceptance/backlog-op.test.js green
- [x] 3.6 Existing pins track the extended grammar — backlog-op.test.js GRAMMAR regex accepts the two new segments and its live-store scenario stays green; tests/tools.mjs T3h round-trip and refusal regex cover revalidate and the premise option, verify by node tests/acceptance/backlog-op.test.js and node tests/tools.mjs green
- [x] 3.7 The triage skill teaches the revalidation law — smoke pins first (RED: S37 asserts revalidation-before-dispatch, three-strikes with watch items, and stale-never-auto-closes), then skills/cdd-backlog-triage/SKILL.md gains the three law sections plus the premise freehand-edit exception, verify by node tests/smoke.mjs green
- [x] 3.8 Dogfood on the live ledger — premise backfills for PF-1, PF-10, PF-11, PF-12, PF-21, PF-22 plus the PF-12 non-exhaustive-proxy note and the header conventions line naming the premise grammar; `cdd backlog revalidate` runs over the live ledger, full output saved at reviews/dogfood-revalidate.md; PF-10/PF-11 resolve done with archive evidence, verify by reviews/dogfood-revalidate.md holding the run output and the live cdd/backlog.md reflecting the dispositions
- [x] 3.9 Full suite and doors green — node tests/smoke.mjs, node tests/tools.mjs, every tests/acceptance/*.test.js, cdd validate strict, and the drift guard all green, verify by each command exiting 0

## Done When Traceability

| criterion | task ids |
|---|---|
| node tests/acceptance/backlog-revalidate.test.js exits 0 (premise/verified grammar, revalidate verdicts + stamping + dispositions untouched, list staleness) | 3.2, 3.3, 3.4, 3.9 |
| node tests/acceptance/backlog-op.test.js and node tests/smoke.mjs exit 0 after the rule-13 non-enumerative edit, the grammar extension, and the three new skill laws | 3.5, 3.6, 3.7, 3.9 |
| cdd backlog revalidate over the live ledger reports PF-10 and PF-11 ROTTEN, output saved in the change folder, both resolved done with archive evidence | 3.8 |
| cdd validate strict green and the drift guard green | 3.9 |

## 4. Close

- [x] 4.1 Standards-axis change code review — run skill `cdd-code-review` with the standards-axis brief (brief-r3-standards.md) over the diff since the change branched, in its own cold session; findings at `reviews/r3-standards-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-standards-code-review.md holding no open blocker
- [x] 4.2 Spec-axis change code review — run skill `cdd-code-review` with the spec-axis brief (brief-r3-spec.md) over the same diff, in a second cold session; findings at `reviews/r3-spec-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-spec-code-review.md holding no open blocker
- [x] 4.3 ADR review — skipped: this change drafted no ADR under `cdd/decisions/` and amended no decision content (the proposal's "## Decisions Followed" section only cites existing decisions), verify by reviews/adr-review.md holding no open blocker or a skip recorded on this line
- [x] 4.4 cdd validate strict green, guard green — re-verified post-review-fixes: `cdd validate backlog-revalidate --strict` → PASS; `node cdd/scripts/spec-drift.mjs` → clean (6 specs, 29 acceptance test files, full scan); node --test 29/29, tools 16/16, backlog-revalidate 14/14, backlog-op 12/12, smoke 36/36
- [x] 4.5 Archive — pair-commit: feature commit, then archive commit
