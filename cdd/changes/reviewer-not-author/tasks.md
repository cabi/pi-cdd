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
at reviews/r3-code-review.md) and, if the change drafted or amended ADRs,
cdd-adr-review (findings at reviews/adr-review.md).
A review reports advisory findings (severity blocker/should/note + disposition), never
verdicts: it ticks only when no blocker is open, and the
deterministic validators keep gate authority.

Anti-scope-creep: no task may exist without a spec requirement or Done-When
criterion that needs it. Improvements no criterion demands go back to the
proposal as Non-Goals or a future change.
-->

# Tasks — reviewer-not-author

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

Reviewer independence as law, decided at the gate:

- **New law rule 2b, not a longer 2a.** Rule 2a states what reviews produce (advisory findings, grammar, gate authority); independence is a distinct principle — who runs the review. A separate rule keeps each law statement single-purpose, keeps the RW/SSL pins on 2a's exact tokens intact, and the guard/tests' `ruleBlock` regex (`^\d+[a-z]?\.`) already delimits 2a from a following 2b.
- **The canonical fact lives in `lib/loop-law.mjs`** (ADR-0009 mechanism, adopted unchanged): a `REVIEWER_INDEPENDENCE` fact family — the principle sentence ("the reviewer is not the author of the artifacts under review"), the lawful form (a cold sub-agent: a session that is not the authoring session), the lawful-but-weaker fallback (a same-session separate re-read pass), and the recording requirement (a non-cold reviewer records the fallback and its justification in the findings file header). `lawRule2b()` renders the rule; `RULES_MD` composes it; `cdd/rules.md` stays the byte mirror (RW5/SSL3); the proposal/tasks instructions interpolate the normative phrases; ambient and help render a compact phrase pinned to the normative one. Reviewer forms join `FINDINGS_GRAMMAR` so the header grammar is one fact family.
- **Law carries the requirement, skills carry the procedure.** Each of the three bundled skills upgrades its "Run cold" guidance to a normative statement citing the law (rule 2b), and keeps the procedure: fresh sub-agent session, brief = charter + paths read from disk, never curated content; fallback = separate re-read pass recorded in the findings header with justification. `cdd-code-review` gains the statement it never had (both axis sub-agents run cold; same-session fallback runs both axes as separate passes, recorded) plus its fallback path.
- **Independence is door-1 law, not machine-checked.** No validator or guard change: a findings header can claim cold regardless of truth, so machine-checking provenance adds forgeable ceremony, not independence. The law statement + findings-file recording make the fallback visible to the human sponsor. (Validator enforcement is a Non-Goal, not a future promise.)
- **Model-family diversity stays guidance.** The law requires reviewer ≠ author (fresh session); preferring a different model family is strengthening procedure in the skills' text, not law — a same-family cold reviewer is still lawfully cold.
- **README review-points row unchanged.** ADR-0009 scoped the row to a trigger summary + pointer to rule 2a; independence is law content, not a review-point trigger, and SSL7 bans restating law detail in the row.
- **ADR judgement (four-criterion test): PASSES → ADR-0010 drafted in implementation.** Hard to reverse — after archive, rule 2b + spec scenarios + skills cite the principle; relaxing it means a coordinated law/spec/skills edit (same class as ADR-0008). Surprising without context — why a fresh session is required and why same-session review is "weaker" (the author curated what the reviewer sees; memory of drafting biases disposal) is not reconstructible from the artifacts. A real trade-off — cold spawns cost context re-reads, latency, and brief plumbing; the law buys independence and codifies a documented fallback instead of banning it. Crosses capability boundaries — one principle binds the law module and law text (gherkin loop-law requirements), three skill artifacts, the findings grammar, and the instruction/ambient/help surfaces. Follows ADR-0008 (advisory findings unchanged) and ADR-0009 (facts single-sourced) — both cited in the proposal per guard A1; A2 reconfirm notes for both ride in the feature commit (same-commit touch).
- [x] 2.1 Design gate — T1 cross-cutting YES (the requirement must reach the law module, the law text + store mirror, both scaffold instructions, ambient, help, and three skill files at once — six-plus surfaces in two artifact families); T2 architecture bet NO (adopts the existing ADR-0009 canonical-facts-plus-renderers architecture unchanged; adds one fact family and one rule, no new seam or mechanism — the bet-shaped question "is independence law?" is the ADR-0010 call recorded above, not an architecture bet); T3 shared seam YES (`lib/loop-law.mjs` is the seam every statement surface imports; the new fact family extends it and must not fork a second law home); T4 invariant risk YES (the `RULES_MD`↔`cdd/rules.md` byte mirror (SSL3/RW5), the every-surface-renders-from-module invariant (SSL4–SSL6), and the RW1–RW3 pins on rule 2a's tokens must all survive inserting rule 2b and editing the skills); T5 parallel work NO (one author, sequential edits: module → surfaces → mirror → skills → tests; no parallel streams), verify by this line naming all five answers

## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
- [x] 3.2 The acceptance suite names every delta scenario — author `tests/acceptance/reviewer-independence.test.js` with one test per delta scenario (8 scenarios), run before any implementation lands, verify by npm test reporting the new suite red with 8 failing scenarios and the pre-existing suites green
- [x] 3.3 The law module owns the independence facts — extend `lib/loop-law.mjs` with the `REVIEWER_INDEPENDENCE` family, `lawRule2b()`, and the 2 reviewer forms in `FINDINGS_GRAMMAR`; compose rule 2b into `RULES_MD` and re-mirror `cdd/rules.md`, verify by node importing the module and asserting the rendered rule is byte-identical to the store copy's rule 2b slice
- [x] 3.4 Every statement surface renders the independence fact — the proposal and tasks scaffold instructions interpolate the normative phrases; the ambient block and the help review tip render the compact phrase, verify by node importing each surface and asserting every independence token traces to `lib/loop-law.mjs`
- [x] 3.5 The three skills cite rule 2b and carry the procedure — each skill states the requirement citing rule 2b, keeps the cold-reviewer spawn procedure (fresh session, brief = charter + paths from disk, never curated content), and states the fallback recording, verify by grep finding rule 2b, the spawn procedure, and the fallback recording in skills/cdd-spec-review/SKILL.md, skills/cdd-code-review/SKILL.md, and skills/cdd-adr-review/SKILL.md
- [x] 3.6 ADR-0010 is drafted and 0008/0009 carry reconfirm notes — draft `cdd/decisions/0010-*.md` (status draft) recording rule 2b chosen over skills-only guidance, validator enforcement, and hard-ban alternatives; add same-commit A2 reconfirm notes naming this change to ADR-0008 and ADR-0009, verify by the acceptance suite's ADR scenarios passing and grep finding a reconfirm note naming reviewer-not-author in cdd/decisions/0008-*.md and 0009-*.md and "status: draft" in 0010-*.md
- [x] 3.7 The deterministic gates are green end to end — run the full acceptance suite and the drift guard over the whole repository, verify by npm test exiting 0 and node cdd/scripts/spec-drift.mjs exiting 0

## Done When Traceability

| criterion | task ids |
|---|---|
| rule 2b rendered from lib/loop-law.mjs, composed into RULES_MD, byte-mirrored into cdd/rules.md | 3.2, 3.3, 3.7 |
| every statement surface carries the independence fact (proposal + tasks instructions, ambient block, help tip) | 3.2, 3.4, 3.7 |
| the three skills state the requirement citing rule 2b and carry the procedure incl. fallback recording | 3.2, 3.5, 3.7 |
| deterministic gates green (npm test, spec-drift) | 3.7 |
| ADR-0010 drafted + ADR-0008/0009 reconfirm notes | 3.2, 3.6, 3.7 |

## 4. Close

- [x] 4.1 Change code review — run skill `cdd-code-review` over the diff since the change branched; findings at `reviews/r3-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-code-review.md holding no open blocker
- [x] 4.2 ADR review — if this change drafted or amended ADRs under `cdd/decisions/`, run skill `cdd-adr-review` on them (findings at `reviews/adr-review.md` per that skill); if none, record the skip on this line, verify by reviews/adr-review.md holding no open blocker or a skip recorded on this line
- [x] 4.3 cdd validate strict green, guard green
- [ ] 4.4 Archive — pair-commit: feature commit, then archive commit
