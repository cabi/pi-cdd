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
  "| <criterion> | task ids that verify it> |". If a criterion has no task,
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
reviews/r3-spec-code-review.md) — and, if this change drafted an ADR or amended one's decision content — a Reconfirmed-by paragraph or a typo fix does not count,
cdd-adr-review (findings at reviews/adr-review.md).
A review reports advisory findings (severity blocker/should/note + disposition), never
verdicts: it ticks only when no blocker is open, and the
deterministic validators keep gate authority. Reviews run cold (rule 2b): the reviewer is not the author of the artifacts under review — every model-run review (R2, R3, ADR) is a fresh cold sub-agent session briefed from paths on disk; a same-session re-read is the weaker fallback and records its form and justification in the findings file header.

Anti-scope-creep: no task may exist without a spec requirement or Done-When
criterion that needs it. Improvements no criterion demands go back to the
proposal as Non-Goals or a future change.
-->

# Tasks — comments-are-shape-only

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs. (Done 2026-10-23 before the gate, on main @ dcda8d4: gherkin living spec + index.ts, all lib/*.{mjs,ts}, all scripts/*.mjs, cdd/scripts/ copies (byte-identity confirmed by cmp), .githooks/*, and the tests/ comment census — 21 corpus-id comment lines in lib/scripts/index/.githooks, 18 ADR/PF-citing comment lines in tests/, 20 spec-heading-citation banners in tests/; the spec-drift.mjs header was found already drifting: it documents no [G] and no [H] tag the script emits.)

## 2. Design

- [x] 2.1 Design gate — T1 NO (the contract change lands in one capability: the two ADDED requirements merge into the single gherkin living spec, and every swept file is behavior-preserving comment text claimed by that same spec; no second capability's contract moves); T2 NO (no new module, seam, or dependency — the enforcement is two acceptance pins reading existing surfaces, and the decision is policy (ADR-0012), not an architecture bet); T3 NO (no shared seam created or moved — the pins read files directly and the sweep edits none of the existing seams' interfaces); T4 NO (the one invariant-carrying edit is scripts/spec-drift.mjs and its byte-identical door copy — comment-only edits cannot change guard behavior, byte-identity is already pinned by gherkin-guard-placeholder P5, the copy regenerates through writeDoorScripts in the same commit, and the two NEW invariants this change creates are themselves pinned red-first before the sweep lands); T5 NO (one sequential runner; the pins must exist before the sweep turns them green, so the halves are not parallelizable) — all NO, short prose form, no design.md. R1 lawfully skipped (fires only on a T1 or T2 YES). Chosen shape: ADR-0012 records the comment law; a behavior-preserving comment sweep enacts it; two red-first acceptance pins enforce it (a comment scanner over index.ts/lib/scripts/.githooks banning corpus ids, and a header↔emitted-tags set-equality pin on scripts/spec-drift.mjs). C4 level: N/A (no design document).

## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open:/won't-fix:) and record dispositions — ticks only when no blocker is open, (Done 2026-10-23: cold sub-agent comments-shape-r2, opencode-zen/deepseek-v4-pro, family differs from author zai/glm-5.3; 5 findings — 2 should + 3 note, 0 blockers; 4 fixed, 1 won't-fix with rationale, dispositions recorded in the findings table) — verify by reviews/r2-change-review.md holding no open blocker
- [x] 3.2 Draft ADR-0012 — cdd/decisions/0012-comments-are-shape-only.md, status accepted (user-settled before the loop; director holds delegated authority): comments are shape-of-code documentation only; banned in comments: corpus routing (ADR/PF/spec/change/commit ids), WHY-prose, WHAT-restating, hand-maintained indexes; allowances: JSDoc one-liners on exports, test-local check-ids; the G/H header drift recorded as the live rot proof (Done 2026-10-23; pin CSA1 green) — verify by cdd/decisions/0012-comments-are-shape-only.md existing with status: accepted and carrying the rule, both allowances, and the drift evidence
- [x] 3.3 Comment-law pin, RED first — tests/acceptance/comment-law.test.js: a character scanner (code/string/template/comment states) extracts comment text from index.ts, lib/*.mjs, lib/*.ts, scripts/*.mjs, .githooks/* and reports every banned pattern (ADR-\d{1,4}, PF-\d+, 7–40-hex commit ids, cdd/(specs|changes|decisions|archive|backlog\.md) paths, (Requirement|Scenario): citations); tests/ and cdd/scripts/ copies stay out of scope (check-id allowance; byte-identity pinned by P5); the test commits a synthetic violating fixture and asserts the report names the file, the line, and the banned pattern and exits non-zero — a scanner that cannot fail is a phantom — run against the current tree and record the red — verify by tests/acceptance/comment-law.test.js (Done 2026-10-23 RED recorded: CL1 fails with 39 real hits — the audit's sites plus lib/backlog.mjs:2,76, lib/store.mjs:88,250, scripts/spec-drift.mjs:28,43,48,167,355,357,482,636, scripts/arch-extract.mjs:14, lib/gherkin.mjs:6, scripts/grammar-law.mjs:275 — CL2/CL3/CL4 synthetic failure-path checks green, exit 1)
- [x] 3.4 Guard header-index pin, RED first — tests/acceptance/guard-header-index.test.js: parses scripts/spec-drift.mjs, collects the check tags it emits (issues.push(`[X]`) lines, the [L4]-building arrow helper, and the [L4-skip] informational line) and asserts exact set equality with the header's machine-readable `// Checks:` line, both directions; the test commits a synthetic exercise (a spec-drift-shaped snippet emitting an unindexed tag) and asserts the report names the undocumented tag and exits non-zero — run against the current header (no Checks line; prose already missing G and H) and record the red — verify by tests/acceptance/guard-header-index.test.js (Done 2026-10-23 RED recorded: GHI1 fails "no `// Checks:` header line"; GHI2 synthetic checks green, exit 1)
- [x] 3.5 Comment sweep — index.ts, lib/*.{mjs,ts}, scripts/*.mjs, .githooks/*: delete pointer comments and corpus-id citations, compress file-header WHY-banners to shape-only one/two-liners, compress the three silent-exec guards to bare behavior (what prints, exit code), delete the lesson-rationale blocks in lib/validate.mjs and lib/store.mjs (keep index.ts's fill-in rewrite rationale — observed caller behavior), rewrite the spec-drift.mjs header banner shape-only plus the `// Checks:` line, sweep the PRE_COMMIT/COMMIT_MSG template strings in lib/templates.mjs in lockstep with .githooks, regenerate the door copies through writeDoorScripts — verify by tests/acceptance/comment-law.test.js and tests/acceptance/guard-header-index.test.js green and the P5 byte-identity checks in tests/acceptance/gherkin-guard-placeholder.test.js green, and cmp scripts/arch-extract.mjs cdd/scripts/arch-extract.mjs && cmp scripts/spec-extract.mjs cdd/scripts/spec-extract.mjs silent (all four door copies identical) (Done 2026-10-23: comment-law CL1-4 all green, GHI1-2 green, P5 green, all four cmp silent; PRE_COMMIT/COMMIT_MSG strings verified byte-equal to .githooks before and after — no lockstep edit needed; the three silent-exec guards compressed; spec-drift header rewritten shape-only with `// Checks: A0 A1 A2 G H L1 L2 L3 L4 L4-skip M O`; .githooks door comments kept — bare behavior, no corpus routing)
- [x] 3.6 Test-comment sweep — strip the spec-heading-citation banners and the corpus-id/lesson prose from comments in tests/ (tests/*.mjs and tests/acceptance/*.test.js), keeping every check-id name (MC/BO/DD/S/RF/LDW/P-style) and every fixture string — verify by grep -rn -E '^\s*//.*(Requirement:|Scenario:)' tests/ exiting with no matches and npm test exiting 0 (Done 2026-10-23: 9 banner lines deleted across loop-law-hardening/reviewer-independence/single-source-law/review-wiring; headers rewritten shape-only in 12 test files (single-source-law, guard-memory-claims, review-wiring, law-done-when, gherkin-door3, reviewer-independence, guard-glob-claims, guard-pair-commit, gherkin-parse-gate, gherkin-subset, loop-law-hardening, gherkin-style-guidance) dropping ADR/PF/change-name/incident-history prose while keeping every check-id and fixture string; grep exits 1 (no matches); check-id strings inside check() names untouched by design)
- [x] 3.7 Whole suite and guard green — npm test (node --test sweep) and the full-scan guard clean, A1 citations disposed (the proposal's Decisions-followed section carries ADR-0001/0002/0003/0006/0007/0008/0009/0010/0011), door copies byte-identical — verify by npm test exiting 0 and node cdd/scripts/spec-drift.mjs exiting 0 (Done 2026-10-23: npm test "fail 0"; guard "spec-drift: clean (7 specs, 28 acceptance test files, full scan)" exit 0; ADR-0010 citation added to Decisions-followed when the sweep of lib/loop-law.mjs widened the A1 overlap set (RI8 red→green); delta restructured for capability ownership — req 1's Code narrowed to gherkin-owned files, new specs/extension/spec.md delta claims index.ts + lib/status-ui.ts, new specs/adr/spec.md delta MODIFIES the decisions-home count requirement (eleven→twelve, 0001–0012) with tests/acceptance/decisions-home.test.js updated to 12; all four door-copy cmp silent)
- [x] 3.8 ADR pin — tests/acceptance/comment-shape-adr.test.js asserts cdd/decisions/0012-comments-are-shape-only.md exists with status: accepted and a body carrying the comment law, both allowances (JSDoc one-liners, test-local check-ids), and the header-rot evidence, and that the drift guard holds no violation naming ADR-0012 (an existence pin in the SSL8/SSL9 family, not red-first — it guards deletion or demotion of a decision already on disk) — verify by node --test tests/acceptance/comment-shape-adr.test.js exiting 0 (Done 2026-10-23: CSA1/CSA2 green; guard full scan holds no violation naming ADR-0012)

## Done When Traceability

| criterion | task ids |
|---|---|
| comment-law pin green: 0 corpus-id hits in comments of index.ts, lib/, scripts/, .githooks | 3.3, 3.5 |
| guard-header-index pin green: header Checks line set-equal to emitted check tags | 3.4, 3.5 |
| ADR-0012 on disk, status accepted, carrying rule + both allowances + drift evidence | 3.2, 3.8 |
| npm test 0 failures and full-scan guard clean, door copies byte-identical | 3.5, 3.6, 3.7 |

## 4. Close

- [x] 4.1 Standards-axis change code review — run skill `cdd-code-review` with the standards-axis brief (brief-r3-standards.md) over the diff since the change branched, in its own cold session; findings at `reviews/r3-standards-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-standards-code-review.md holding no open blocker — DONE: cold session comments-shape-r3-standards (opencode-zen/deepseek-v4-pro, family differs from zai author), 0 blocker / 2 should / 1 note; F001 duplicate header line + F002 stray `/**` opener fixed post-review (npm test 28 pass / 0 fail, guard clean after), F003 emission-shape contract won't-fix with reason; dispositions recorded in the findings file
- [x] 4.2 Spec-axis change code review — run skill `cdd-code-review` with the spec-axis brief (brief-r3-spec.md) over the same diff, in a second cold session; findings at `reviews/r3-spec-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-spec-code-review.md holding no open blocker — DONE: cold session comments-shape-r3-spec (opencode-zen/deepseek-v4-pro, family differs), 0 blocker / 1 should / 1 note, both fixed: corpus-path pin extended to cdd/rules.md with a biting fixture case (cdd/scripts/ kept legal — door-copy shape), lib/backlog.mjs claimed by the extension delta (its living-spec owner); dispositions recorded in the findings file
- [x] 4.3 ADR review — if this change drafted an ADR under `cdd/decisions/` or amended one's decision content (a Reconfirmed-by paragraph or a typo fix does not count), run skill `cdd-adr-review` on them (findings at `reviews/adr-review.md` per that skill); if none, record the skip on this line, verify by reviews/adr-review.md holding no open blocker or a skip recorded on this line — DONE: cold session comments-shape-r3-adr (opencode-zen/deepseek-v4-pro), 2 notes, both won't-fix with reasons recorded in the findings file (hard-to-reverse argued via A2+pin in the ADR's own text; accepted-before-loop provenance deliberately transparent in Resolved); four-criterion test passed, no missing/undeserved ADR
- [x] 4.4 cdd validate strict green, guard green — DONE: `cdd validate comments-are-shape-only --mode strict` → PASS; `node scripts/spec-drift.mjs` → "spec-drift: clean (7 specs, 28 acceptance test files, full scan)" exit 0; `npm test` → 28 pass / 0 fail (PF-14: commands + outcomes cited)
- [ ] 4.5 Archive — pair-commit: feature commit, then archive commit
- [x] 4.6 Backlog — PF-22 (ADR-0004 stale code glob, minted from this change's handshake audit) stays open: its fix is a corpus-index cleanup this change's Non-Goals fences out; record the disposition on this line before the feature commit — DONE: PF-22 remains open (status open in cdd/backlog.md); the stale `lib/context.ts` glob cleanup is corpus-index work this change's Non-Goals explicitly fences out, so no further action here
