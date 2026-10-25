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

# Tasks — 20261024-scaffold-honesty

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

- [x] 2.1 Design gate — answer the five triage triggers (T1 cross-cutting, T2 architecture bet, T3 shared seam, T4 invariant risk, T5 parallel work): any YES needs a short design above; a T2 or T4 YES instead carries `design.md` at the change root (rule 2c: four sections, one C4 flowchart) — the record names the chosen shape and, for design.md, the C4 level and why; all NO is recorded here as the skip record, verify by this line naming all five answers, the chosen shape, and the C4 level
  - Gate record: **T1 cross-cutting NO** — every edit lands inside the gherkin capability's own surface (lib/validate.mjs, lib/templates.mjs, cdd/rules.md, tests/smoke.mjs all claimed by gherkin's living spec; the new acceptance test lands in tests/acceptance/scaffold-honesty.test.js); no other capability's spec or scenarios move. **T2 architecture bet NO** — no structural choice is made: the comment mask follows maskCodeSpans' established blanking shape at proposal scope (lib/validate.mjs's own precedent for "text that is not content"), and the rule-7 sentence is a law-text edit riding the existing single-source seam (RULES_MD → cdd/rules.md byte-identity, SSL3-pinned). **T3 shared seam NO** — no seam moves or is created: validateProposal's existing callers (S31 validateBoth, archive's strict gate) all want the same verdict from the same function. **T4 invariant risk NO** — the two invariants at the boundary are held by existing pins and stay green by construction: the fresh scaffold's exactly-3 placeholder errors (S32 leg 1) survive because the carve-out masks comment text only, and the scaffold instruction text verbatim (LDW4) survives because no scaffold wording is edited; an unclosed `<!--` stays unstripped and still flags. **T5 parallel work NO** — no other open change exists, no file collision. **Chosen shape: skip record (no design.md; no short design note triggered). C4 level: N/A — no design document.** R1 skipped as lawful (rule 2a: T1 and T2 both NO)

## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
- [x] 3.2 Author the acceptance pin tests/acceptance/scaffold-honesty.test.js asserting the rule-7 scaffold-pin sentence in the law source (lib/templates.mjs RULES_MD) and the same sentence in the store copy cdd/rules.md; observe it RED before the sentence exists (record the red output), verify by node --test tests/acceptance/scaffold-honesty.test.js observed red, then green after task 3.5
- [x] 3.3 Author smoke check S39 in tests/smoke.mjs pinning the comment-kept verdicts — full in-place fill with instruction comment retained and 5 author-written Done-When lines reports no proposal error, the instruction's own phrases never trip the placeholder check, and an unclosed `<!--` opener still flags — and edit S32 leg 2 so the round-trip fill keeps the proposal instruction comment; observe both RED against the current validator (record the red outputs), verify by node tests/smoke.mjs observed red on S39 and S32, then green after task 3.4
- [x] 3.4 Implement the comment mask in validateProposal (lib/validate.mjs): mask closed HTML comment blocks before the Done-When count and the placeholder check only — section-presence and Code: checks stay on raw text, unclosed `<!--` unmasked — following maskCodeSpans' blanking shape as a maskHtmlComments helper, verify by npm test exiting 0 (S39, S32, LDW1-LDW4, RF10, S4, S31 all green)
- [x] 3.5 Add the scaffold-pin sentence to rule 7 in RULES_MD (lib/templates.mjs) and regenerate the store copy cdd/rules.md byte-identically, verify by node tests/acceptance/single-source-law.test.js and node tests/acceptance/scaffold-honesty.test.js both exiting 0

## Done When Traceability

| criterion | task ids |
|---|---|
| comment-kept fill (instruction retained, 5 real Done-When lines) passes draft with zero proposal errors, red on main — S39 | 3.3, 3.4 |
| fresh scaffold still fails draft on body placeholders; S32 round-trip fill keeps the proposal comment and stays strict-green end to end | 3.3, 3.4 |
| cdd/rules.md rule 7 states the scaffold↔pins sentence, single-sourced from RULES_MD, byte-identical — tests/acceptance/scaffold-honesty.test.js | 3.2, 3.5 |
| unclosed `<!--` opener is not masked and still flags (M1 advisory folded) | 3.3, 3.4 |

## 4. Close

- [x] 4.1 Standards-axis change code review — run skill `cdd-code-review` with the standards-axis brief (brief-r3-standards.md) over the diff since the change branched, in its own cold session; findings at `reviews/r3-standards-findings.md` (filename corrected from the drafted r3-standards-code-review.md); cold session `scaffold-honesty-r3-standards`, model opencode-zen/gpt-6-luna (family opencode-zen ≠ author zai), thinking high; 0 blocker / 2 should / 1 note, all disposed fixed (dispositions section in the findings file), verify by reviews/r3-standards-findings.md holding no open blocker
- [x] 4.2 Spec-axis change code review — run skill `cdd-code-review` with the spec-axis brief (brief-r3-spec.md) over the same diff, in a second cold session; findings at `reviews/r3-spec-findings.md` (filename corrected from the drafted r3-spec-code-review.md); cold session `scaffold-honesty-r3-spec`, model opencode-zen/gpt-6-luna (family opencode-zen ≠ author zai), thinking high; 0 blocker / 1 should / 0 note, disposed fixed (SH2 strengthened to exact rule-7 block equality; dispositions section in the findings file), verify by reviews/r3-spec-findings.md holding no open blocker
- [x] 4.3 ADR review — skipped lawfully: this change drafted no ADR under `cdd/decisions/` and amended no ADR decision content (the proposal's Governing-decisions block cites existing ADRs 0006-0012 verbatim by reference only), verify by this line recording the skip
- [x] 4.4 cdd validate strict green, guard green — executed at Close after the R3 disposition fixes: `cdd validate 20261024-scaffold-honesty --mode strict` → `PASS`; `node cdd/scripts/spec-drift.mjs` → `spec-drift: clean (5 specs, 40 acceptance test files, full scan)` exit 0; full sweep `npm test` exit 0 (40/40 acceptance suites), `node tests/smoke.mjs` 38/38
- [x] 4.5 Archive — pair-commit: feature commit 50fc60b, then archive commit. Reconfirmations: pre-Close `reconfirm --check` demanded ADR-0010 (cdd/rules.md moved 2026-10-24, last reconfirmed 2026-10-23) — reconfirmed before the feature commit; the post-feature full-scan guard then armed [A2] on every ADR claiming lib/templates.mjs or cdd/rules.md (0006, 0007, 0008, 0009, 0011, 0012), each reconfirmed with one evidence line; all seven reconfirmation lines ride the archive commit; post-pair guard rerun recorded in the M4 report
