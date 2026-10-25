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

# Tasks — 20261025-archive-stamp-name

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

- Design note (T3 seam, one law): `archivedBasename(name)` — strip at most one leading `^\d{8}-` date segment — is the single helper; the archive compose and its reported path (lib/store.mjs:294/:297) and the reconfirm query normalization (lib/adr-ops.mjs:251/:308) all consume it; listArchived's split stays as-is (correct for single-date folders).
- [x] 2.1 Design gate — T1 cross-cutting YES: TWO capabilities (gherkin + adr) — the naming law lives in gherkin, the reconfirm name-acceptance it feeds lives in adr (re-answered per the director's M1 ruling on the R1 blocker; multi-capability delta is lawful store mechanics, PF-6's split design depends on it; law-unity lives in the seam — one archivedBasename helper — not in spec topology). T2 architecture bet YES: one naming law chosen among five M0-weighed shapes (compose-only, strip-at-name, drop-the-stamp, stop-date-prefixing, name-validation — all rejected, design.md Alternatives carries each) — the bet is that strip-at-compose plus query normalization keeps dated names resolvable without encoding datedness in the folder. T3 shared seam YES: the helper is a shared seam consumed at three sites — subsumed by the design.md this T2 YES carries. T4 invariant risk NO: the touched invariant (S10's archive-folder shape) is re-pinned in the same change by a new S-series fixture and the acceptance pin, and no door premise weakens (guard globs cdd/archive/** unchanged). T5 parallel work NO: cdd/changes/ holds exactly this change and `cdd status` openChanges is [] (fresh disk reads, 2026-10-25; the R1 note could not see this from its fenced paths — evidence recorded in the findings file). Chosen shape: design.md at C4 Component level — the bet lives inside the store container, in how three of its components agree on one folder-name law; verify by this line naming all five answers, the chosen shape, and the C4 level. [re-tick: re-verified after R1 and after the director's M1 ruling — T1 re-answered YES (two capabilities: gherkin + adr), T5 evidence added]

## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
- [x] 3.2 Acceptance pin for the archive folder-name law — tests/acceptance/archive-folder-name.test.js pins the dated-name strip (exactly one leading date segment), the bare-name append, the never-doubled folder, and reported-path equality, written before the implementation — verify by tests/acceptance/archive-folder-name.test.js (RED run recorded in reviews/red-records.md before 3.4 lands, green after)
- [x] 3.3 Acceptance pin for the reconfirm dated-query law — tests/acceptance/adr-reconfirm.test.js gains the dated-query resolution case and the unknown-after-normalization refusal case, written before the implementation — verify by tests/acceptance/adr-reconfirm.test.js (RED run recorded in reviews/red-records.md before 3.5 lands, green after)
- [x] 3.4 archivedBasename consumed at both compose points — lib/store.mjs exports `archivedBasename(name)` (strip at most one leading `^\d{8}-` date segment) and both the rename target and the reported `archivedTo` path compose through it — verify by tests/acceptance/archive-folder-name.test.js green
- [x] 3.5 Reconfirm query normalization through the single helper — lib/adr-ops.mjs imports `archivedBasename` from lib/store.mjs and both matching sites (reconfirmOp, checkOp) match verbatim first, then the query stripped of at most one leading date segment — verify by tests/acceptance/adr-reconfirm.test.js green
- [x] 3.6 S-series re-pin — tests/smoke.mjs gains a dated-name archive round-trip asserting the single-date folder and archivedTo agreement (S10 keeps the bare-name law) — verify by npm test exiting 0


## Done When Traceability

| criterion | task ids |
|---|---|
| dated name archives to exactly one date prefix, archivedTo equals the folder | 3.2, 3.4 |
| bare name appends verbatim (S10 law holds) | 3.4, 3.6 |
| post-archive reconfirm resolves a dated query and records it | 3.3, 3.5 |
| this change's own Close folder carries exactly one date (self-application) | 3.4, 4.5 |

## 4. Close

- [x] 4.1 Standards-axis change code review — run skill `cdd-code-review` with the standards-axis brief (brief-r3-standards.md) over the diff since the change branched, in its own cold session; findings at `reviews/r3-standards-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-standards-code-review.md holding no open blocker
- [x] 4.2 Spec-axis change code review — run skill `cdd-code-review` with the spec-axis brief (brief-r3-spec.md) over the same diff, in a second cold session; findings at `reviews/r3-spec-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-spec-code-review.md holding no open blocker
- [x] 4.3 ADR review — skip recorded on this line: this change drafted no ADR and amended no decision content (reconfirmations only — a Reconfirmed-by paragraph does not count); verify by reviews/adr-review.md holding no open blocker or a skip recorded on this line
- [x] 4.4 cdd validate strict green, guard green
- [x] 4.5 Archive — pair-commit: feature commit, then archive commit
