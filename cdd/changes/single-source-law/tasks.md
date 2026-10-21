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

# Tasks — single-source-law

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

The single-source mechanism, decided at the gate:

- **One lib-only module, `lib/loop-law.mjs`, holds the canonical facts**: the loop chain steps and the four review points (R1, R2, R3, and the conditional ADR review) as data — id, trigger phrases (normative long form for the law and instructions, compact form for ambient and help), skill, mode, findings path — plus the advisory-findings grammar tokens. Zero new dependencies (ADR-0001).
- **Every surface derives, none restates**: `RULES_MD` rules 2/2a compose from the module's normative phrases — the rendered law text stays byte-identical, so the `cdd/rules.md` mirror and RW1–RW5 keep holding unchanged; `PROPOSAL_INSTRUCTION` and `TASKS_INSTRUCTION` interpolate the fact constants into their clauses; the ambient line and the `/cdd-help` review tip are rendered by module functions. The only wording shifts are where a surface paraphrased a fact (help's "T1/T2" becomes the canonical trigger phrase); RW6–RW11 and RW15 keep holding.
- **README is the pointer exception** (markdown cannot import): its review-points row reduces to the trigger summary plus a pointer to `cdd/rules.md` rule 2a; RW14 and the living-spec scenario that pins the README restatement are MODIFIED to pin the pointer form.
- **`scripts/law.mjs` stays grammar-only**: door scripts never render prose; adopting stores keep receiving rendered artifacts through the existing mechanisms (`cdd init` writes `rules.md`; `new` embeds instructions). The law.mjs "defined exactly once" precedent is the pattern, not the location.
- **The invariant is pinned RED-first** by `tests/acceptance/single-source-law.test.js`: every review-point fact (skill, mode, findings path, trigger) a statement surface names must equal the module's canonical value — a fact edited in one surface without the module goes red.

- **ADR judgement (four-criterion test, director steer of 2026-10-21): PASSES → ADR-0009 drafted by task 3.6.** Hard to reverse — moderate for lib (revert = re-inline prose in 5 surfaces), high for the ecosystem: after archive every law edit flows through the module and adopting stores receive it via lib. Surprising without context — hand-editing `RULES_MD` stops working; the law's editable home becomes a non-obvious module (byte-identity tests fail mysteriously otherwise). A real trade-off — mirror, generator, and pointer-only alternatives carry documented costs. Crosses capability boundaries — one module feeds files owned by different Code: lines within the gherkin capability (templates/instructions vs context/help) plus README and the store copy. Run-1 precedent: T2 YES with a real trade-off shipped ADR-0008.
- [x] 2.1 Design gate — T1 cross-cutting YES (the loop law is stated in five surfaces — `lib/templates.mjs` RULES_MD, `lib/instructions.mjs`, `lib/context.mjs`, `lib/help.mjs`, `README.md` — plus the store mirror and the tests pinning them; the change touches them all at once); T2 architecture bet YES (commits the extension to canonical-facts-plus-renderers with a pointer README, over pointer-only-everywhere and generated files; reversing later means re-duplicating or rebuilding machinery); T3 shared seam YES (`lib/loop-law.mjs` is a new seam every statement surface imports); T4 invariant risk YES (the all-statements-agree invariant already drifted once; the derivation must not weaken the RW pins or the RULES_MD↔cdd/rules.md byte mirror); T5 parallel work NO (one author, sequential edits: module → surfaces → README → tests; no parallel streams), verify by this line naming all five answers

## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
- [x] 3.2 Author `tests/acceptance/single-source-law.test.js` RED-first — it imports `lib/loop-law.mjs`; asserts every statement surface's named review-point facts (trigger, skill, mode, findings path) equal the module's canonical values; that `RULES_MD` rules 2/2a rendered from the module are byte-identical to `cdd/rules.md`; that the README row's trigger phrases equal the module's normative phrases; and that ADR-0009 holds status draft or accepted with the guard clean on it — verify by node --test tests/acceptance/single-source-law.test.js exiting 1 (RED) before any implementation: first as a module-resolution error on the absent `lib/loop-law.mjs` (task 3.3 creates it), then — after 3.3 but before 3.4–3.6 — on the surface-wiring assertions
- [x] 3.3 Create `lib/loop-law.mjs` — canonical facts (loop chain; R1/R2/R3 + conditional ADR review: id, normative and compact trigger phrases, skill, mode, findings path; advisory-findings grammar tokens) and renderers (law rules 2/2a fragments, ambient line, help tip) — and rewire `RULES_MD` to compose from it — verify by node --test tests/acceptance/review-wiring.test.js green (RW1–RW5 byte-identity hold)
- [x] 3.4 Rewire the remaining surfaces — `PROPOSAL_INSTRUCTION` and `TASKS_INSTRUCTION` interpolate the fact constants; the ambient block and the `/cdd-help` review tip render from the module (help's compact "T1/T2" becomes the canonical trigger phrase, so RW7's pinned phrases are realigned to the canonical ones) — verify by node --test tests/acceptance/review-wiring.test.js and node --test tests/acceptance/single-source-law.test.js green
- [x] 3.5 Reduce the README review-points row to trigger summary + pointer to `cdd/rules.md` rule 2a; modify RW14 to pin the pointer form and phrase equality — verify by node --test tests/acceptance/review-wiring.test.js green
- [x] 3.6 Draft `cdd/decisions/0009-single-source-the-loop-law.md` (status: draft) recording the four-criterion judgement and the rejected alternatives — verify by the file present with frontmatter status draft
- [x] 3.7 Full suite green — verify by npm test exiting 0


## Done When Traceability

| criterion | task ids |
|---|---|
| DW1 facts in exactly 1 module, every surface renders them | 3.2, 3.3, 3.4 |
| DW2 law text byte-identical, RW1–RW5 hold | 3.3 |
| DW3 README pointer form, trigger phrases equal module's | 3.2, 3.5 |
| DW4 npm test and guard full scan exit 0 | 3.7, 4.3 |
| DW5 ADR-0009 drafted with status draft | 3.6 |

## 4. Close

- [x] 4.1 Change code review — run skill `cdd-code-review` over the diff since the change branched; findings at `reviews/r3-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-code-review.md holding no open blocker
- [x] 4.2 ADR review — if this change drafted or amended ADRs under `cdd/decisions/`, run skill `cdd-adr-review` on them (findings at `reviews/adr-review.md` per that skill); if none, record the skip on this line, verify by reviews/adr-review.md holding no open blocker or a skip recorded on this line
- [x] 4.3 cdd validate strict green, guard green — verify by cdd validate strict exiting 0 and node scripts/spec-drift.mjs exiting 0
- [x] 4.4 Archive — pair-commit: feature commit, then archive commit — verify by git log -2 --oneline showing the feature commit then the archive commit and git status --porcelain empty
