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

# Tasks — triage-skill

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs — read: cdd/specs/gherkin/spec.md (full requirement inventory; owning requirements "Reviews run cold" :448, "Reviewer briefs live next to their skills" :790, "Process findings land in the backlog" :881), cdd/specs/extension/spec.md ("The backlog op triages findings on disk"), tests/smoke.mjs (S33–S36 + suite entry), skills/{cdd-code-review,cdd-spec-review,cdd-adr-review}/, lib/backlog.mjs (grammar authority), cdd/backlog.md (PF-1..20), cdd/rules.md, /tmp/backlog-conventions.md; skills/cdd-backlog-triage/SKILL.md is the surface being created

## 2. Design

- [x] 2.1 Design gate — answer the five triage triggers (T1 cross-cutting, T2 architecture bet, T3 shared seam, T4 invariant risk, T5 parallel work): any YES needs a short design above; a T2 or T4 YES instead carries `design.md` at the change root (rule 2c: four sections, one C4 flowchart) — the record names the chosen shape and, for design.md, the C4 level and why; all NO is recorded here as the skip record, verify by this line naming all five answers, the chosen shape, and the C4 level
  - Gate record: **T1 cross-cutting NO** — every edit lands in one capability (gherkin owns the skills/ + tests/smoke.mjs surface); **T2 architecture bet NO** — the change follows the established bundled-skill pattern (three review skills, S33/S36 pins), no structural choice is made; **T3 shared seam NO** — no code seam moves: the skill references the cdd backlog op read-only, lib/backlog.mjs untouched; **T4 invariant risk NO** — no door, guard, or validator behavior changes; rule 13's "the backlog is living triage data, never spec-checked" is taught, not altered; **T5 parallel work NO** — no other open change exists, no file collision. **Chosen shape: skip record (no design.md, note-form design not triggered). C4 level: N/A — no design document.**
  - Shape decision the gate did cover: the smoke pin is a new S37 following S33's structural pattern, not an S33 extension — S33's contract is the three review skills and their findings grammar, which a triage skill does not carry; the delta sponsors S37 through its scenario pin.

## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
- [x] 3.2 S37 smoke check authored red-first — add check S37 to tests/smoke.mjs following S33's structural pattern (frontmatter name matches the directory, quoted description within the 20 to 1024 character bounds, cdd-scoped routing) plus the rubric anchors: the 5 grammar statuses, the evaluate-on-recurrence pattern marked not a grammar status, the item grammar line, both inviolable conventions, the change-worthy rule, backlog-op-only writes with the note-edit exception, and the rule 13 citation, verify by node tests/smoke.mjs run while the skill is absent reporting exactly 1 failure at check S37 naming the missing skills/cdd-backlog-triage/SKILL.md (the red observation recorded in this task's note)
  - Note: RED observed 2026-10-23 before the skill landed — `node tests/smoke.mjs` → "FAIL S37 … skills/cdd-backlog-triage/SKILL.md missing", "1 FAILED, 35 passed", exit 1 — exactly the red 3.2's verify names.
- [x] 3.3 Author skills/cdd-backlog-triage/SKILL.md — the triage rubric per the proposal: when to record at all, the status taxonomy with one-line definitions and live-ledger examples (PF-14, PF-16, PF-18/19/20 among them), the item grammar, both inviolable conventions, the change-worthy rule, backlog-op-only minting with the note-edit freehand exception framed as note-field edits on existing items only — neither minting nor resolving, the two paths rule 13's op list names — so the exception reads as no contradiction of rule 13, findings-file hygiene (change folder, PF-9); sources: /tmp/backlog-conventions.md (the maintainer policy draft), cdd/backlog.md, lib/backlog.mjs, rule 13, verify by node tests/smoke.mjs exiting 0 with S37 green and no other check regressed
  - Note: GREEN — `node tests/smoke.mjs` → "36/36 passed (RUN_PI_LOOP=1 adds the isolated-pi check)", exit 0; S37 green, no other check regressed. One rewrap during red→green: "not a grammar status" crossed a line break and the pin regex is line-scoped — rewrapped the skill line, kept the pin strict.
- [x] 3.4 Dogfood the rubric — mint at least 1 process finding this run raises, decided through the skill's rubric (record/change-worthy call) and written through the cdd backlog op, then record the live exercise in the Close section's process line, verify by the cdd backlog op listing the new PF-n item and the Close section process line naming it with its rubric decision

## Done When Traceability

| criterion | task ids |
|---|---|
| S37 smoke check green pinning the skill's frontmatter structure and rubric anchors | 3.2, 3.3 |
| cdd validate strict green and node cdd/scripts/spec-drift.mjs exit 0 with the change open | 4.4 |
| Close section records the skill exercised live with at least 1 minted PF-n decision | 3.4 |

## 4. Close

Process — the skill exercised live (Done-When 3, task 3.4): the rubric decided three friction events from this run. (1) A delta-fence structural slip while drafting (scenario 2 outside the gherkin fence) — one-off stumble fixed in place, no structural residue: not recorded, per When-to-record-at-all. (2) Stale-anchor refusals from guessing edit anchors — operator error, PF-5's declined class: not recorded. (3) The validate-invocation detour (four failed shell probes before the cdd tool's validate op) — one occurrence with a known structural fix: change-worthy per the rubric; minted as PF-21 [open] through the cdd backlog op with the fix shape in its note (PF-12/PF-17 pattern).
- [x] 4.1 Standards-axis change code review — run skill `cdd-code-review` with the standards-axis brief (brief-r3-standards.md) over the diff since the change branched, in its own cold session; findings at `reviews/r3-standards-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-standards-code-review.md holding no open blocker
- [x] 4.2 Spec-axis change code review — run skill `cdd-code-review` with the spec-axis brief (brief-r3-spec.md) over the same diff, in a second cold session; findings at `reviews/r3-spec-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-spec-code-review.md holding no open blocker
- [x] 4.3 ADR review — skipped: no ADR drafted or amended (the change is a skill, a smoke check, a backlog line, and change artifacts; the standards reviewer confirmed no ADR `code:` glob claims a touched file) — if this change drafted an ADR under `cdd/decisions/` or amended one's decision content (a Reconfirmed-by paragraph or a typo fix does not count), run skill `cdd-adr-review` on them (findings at `reviews/adr-review.md` per that skill); if none, record the skip on this line, verify by reviews/adr-review.md holding no open blocker or a skip recorded on this line
- [x] 4.4 cdd validate strict green, guard green
- [x] 4.5 Archive — pair-commit: feature commit, then archive commit
