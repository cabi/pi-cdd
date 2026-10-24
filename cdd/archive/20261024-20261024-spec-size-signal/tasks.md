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

# Tasks — 20261024-spec-size-signal

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

- [x] 2.1 Design gate — answer the five triage triggers (T1 cross-cutting, T2 architecture bet, T3 shared seam, T4 invariant risk, T5 parallel work): any YES needs a short design above; a T2 or T4 YES instead carries `design.md` at the change root (rule 2c: four sections, one C4 flowchart) — the record names the chosen shape and, for design.md, the C4 level and why; all NO is recorded here as the skip record, verify by this line naming all five answers, the chosen shape, and the C4 level
  - Gate record: **T1 cross-cutting NO** — every edit lands inside the gherkin capability's claimed surface: lib/validate.mjs (claimed by the living spec's Code: globs) and the new acceptance pin tests/acceptance/spec-size-signal.test.js (claimed by this change's own delta Code: line); no other capability's spec or code moves. The signal's *effect* is store-wide (any capability's delta validation passes through validateDelta), but the change surface is single-capability — same T1 shape as 20261024-scaffold-honesty, which also edited lib/validate.mjs under gherkin.
  - **T2 architecture bet NO** — no structural choice is made: the signal reuses the warning tier this validator already has (validateTasks' SPLIT_SIGNAL warning at lib/validate.mjs:165-167) at delta scope, and warnings ride `warnings[]`, which `project()` copies verbatim into both draft and strict verdicts — "both modes" is the existing mechanism, not a new one. Threshold values are data-justified constants, one-line reversible. **Thresholds 12 requirements per living spec / 8 scenarios per requirement**, mirroring rule 6's TASK_LIMIT=12 / SPLIT_SIGNAL=8 (the task law's own pair), justified against the empirically gathered corpus (commands in the M1 report): requirement counts acceptance 2 / adr 3 / extension 7 / gherkin 50 — 12 leaves three capabilities silent with headroom and fires gherkin alone (the PF-6 accretion surface, as intended); scenario tail per requirement extension 22, adr 15/10, gherkin 11/11/9/8 vs mode 2 — 8 catches the whole fat tail including gherkin's four. **Warning budget reasoned** (director point at pass): standing lines per validate run are held to ONE aggregated fat-requirement line per spec (naming the over-8 requirements) plus one req-count line where a spec crosses 12 — gherkin-touching change: 2 lines (50 ≥ 12; four requirements over 8: 11/11/9/8), adr-touching: 1 (15 and 10 named; 3 reqs < 12 silent), extension-touching: 1 (the 22; 7 reqs < 12 silent), acceptance: 0. Four standing lines store-wide reads as navigation signal; per-requirement granularity (7 lines) would read as alarm fatigue. Alternative scenario thresholds weighed: ≥12/req fires only extension 22 and adr 15, blinding the signal to gherkin's 11/11/9/8 tail — exactly the per-requirement split surface PF-32 names; separate severities per axis rejected — one warning channel exists, wording carries the distinction, a severity ladder is the harden-on-recurrence headroom PF-32 reserves. **Threshold home: local constants in lib/validate.mjs** — grammar-law.mjs is the module laws every door enforces share via byte-identical copies (ADR-0007; the guard imports TASK_LIMIT at scripts/spec-drift.mjs:34); spec-size is advisory-only with exactly one consumer (lib/validate.mjs), so an entry there would force the cdd/scripts byte-identity sync (PF-28 copy-drift surface) with no reader behind any door. SPLIT_SIGNAL's residence in grammar-law despite no guard import is rule 6's pair-cohesion — it rides TASK_LIMIT's door consumer; the spec-size pair has no such rider. If recurrence hardens the signal into a door, the constants move to grammar-law.mjs beside the task pair in that same change.
  - **T3 shared seam NO** — no seam moves or is created: validateDelta's callers (runValidation → validateChange/validateBoth/validateStore) all want the same verdict from the same function; the living-spec read extends from strict-only to both modes for the size signal — additive to every caller, no signature change.
  - **T4 invariant risk NO** — the boundary invariants hold by construction: draft ⊆ strict (warnings are never mode-filtered; no new errors are added at either mode); warnings never block (`ok` derives from errors only); the scaffold round-trip stays green (a scaffolded store holds no over-threshold spec — fresh-scaffold specs are tiny — and no delta ADDED block reaches 8 scenarios, so S-series verdicts are unchanged); this change's own delta self-applies Tier B (gherkin at 50 ≥ 12 plus an ADDED entry) and satisfies it by carrying `split-considered:` in the delta — draft-green stays reachable with the warning present, which the M2/M3 record observes firing before satisfaction (red-records.md).
  - **T5 parallel work NO** — no other open change exists (cdd status: openChanges [] at scaffold time, this session) and no file collision.
  - **Chosen shape: skip record + this short design note (no design.md). C4 level: N/A — no design document.** R1 skipped as lawful (rule 2a: T1 and T2 both NO)

## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
- [x] 3.2 RED-first acceptance pin — author tests/acceptance/spec-size-signal.test.js importing the real lib/validate.mjs against fixture changes (over-threshold spec, fat requirements, grown delta blocks, split-considered demand and satisfaction, warnings-never-block), run it and observe RED, record the red output in reviews/red-records.md, verify by node --test tests/acceptance/spec-size-signal.test.js exiting non-zero pre-implementation with the output recorded in reviews/red-records.md
- [x] 3.3 Tier A signals — extend validateDelta (lib/validate.mjs) to read the touched capability's living spec in both modes and emit: 1 aggregated warning at ≥ 12 requirements naming the count, 1 aggregated warning naming the living spec's requirements holding ≥ 8 scenarios, and 1 warning per delta ADDED or MODIFIED requirement block holding ≥ 8 scenarios; thresholds live as named local constants (SPEC_REQ_SIGNAL=12, SCENARIO_SIGNAL=8) in lib/validate.mjs, verify by node --test --test-name-pattern="Tier A" tests/acceptance/spec-size-signal.test.js green — expected partial red: the Tier B subtests stay red until 3.4, this scoped run is the group-local check, not a red check to fix (R2-F003) — and by `grep -rn "SPEC_REQ_SIGNAL\|SCENARIO_SIGNAL" scripts/grammar-law.mjs cdd/scripts/grammar-law.mjs` exiting 1: no entry in either law copy (R2-F001, DW5)
- [x] 3.4 Tier B split-considered demand — warn exactly once when a delta holds any ADDED entry for a capability whose living spec holds ≥ 12 requirements and the delta file carries no split-considered line; silent with the line, verify by node --test tests/acceptance/spec-size-signal.test.js fully green
- [x] 3.5 Self-application observation (fresh-node per PF-35) — with the implementation in, run fresh-node validate on this change's own delta (which ADDEDs into gherkin at 50 requirements and carries no split-considered line yet): observe the Tier B warning fire and record it; then add the split-considered line to the delta — placed at the delta's TOP, above `## ADDED Requirements`, where the archive merge drops it (a tail placement would be absorbed into the live requirement block and leak into the living spec, R2-F002's trace; Tier B scans the raw delta text, an HTML-comment placement also satisfies it) — re-run fresh-node: observe silence and record it; note the Tier A standing warnings on the same runs, verify by reviews/red-records.md holding all four observations (Tier B fire, Tier B silent, Tier A present both runs) from fresh node -e processes

## Done When Traceability

| criterion | task ids |
|---|---|
| DW1: ≥ 12-requirement living spec touched by a delta → exactly 1 requirement-count warning in BOTH modes (fixture-pinned; live-fired on own gherkin delta) | 3.2, 3.3, 3.5 |
| DW2: living spec's ≥ 8-scenario requirements → exactly 1 aggregated warning naming them; specs with none stay silent | 3.2, 3.3 |
| DW3: delta ADDED or MODIFIED block holding ≥ 8 scenarios → 1 warning naming that block | 3.2, 3.3 |
| DW4: ADDED into ≥ 12-requirement spec without `split-considered:` → 1 warning; with the line → none; observed live on own delta, recorded in red-records.md | 3.2, 3.4, 3.5 |
| DW5: warnings never affect `ok` in either mode; thresholds live as named constants in lib/validate.mjs, none in scripts/grammar-law.mjs or cdd/scripts/ | 3.2, 3.3, 3.4 |

## 4. Close

- [x] 4.1 Standards-axis change code review — run skill `cdd-code-review` with the standards-axis brief (brief-r3-standards.md) over the diff since the change branched, in its own cold session; findings at `reviews/r3-standards-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-standards-code-review.md holding no open blocker
- [x] 4.2 Spec-axis change code review — run skill `cdd-code-review` with the spec-axis brief (brief-r3-spec.md) over the same diff, in a second cold session; findings at `reviews/r3-spec-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-spec-code-review.md holding no open blocker
- [x] 4.3 ADR review — skipped: no ADR drafted, none amended; reconfirmations ride the archive commit. if this change drafted an ADR under `cdd/decisions/` or amended one's decision content (a Reconfirmed-by paragraph or a typo fix does not count), run skill `cdd-adr-review` on them (findings at `reviews/adr-review.md` per that skill); if none, record the skip on this line, verify by reviews/adr-review.md holding no open blocker or a skip recorded on this line
- [x] 4.4 cdd validate strict green, guard green
- [x] 4.5 Archive — pair-commit: feature commit, then archive commit
