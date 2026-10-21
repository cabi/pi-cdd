# Tasks — runner-ergonomics

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

- [x] 2.1 Design gate — answer the five triage triggers (T1 cross-cutting, T2 architecture bet, T3 shared seam, T4 invariant risk, T5 parallel work): any YES needs a short design above; all NO is recorded here as the skip record, verify by this line naming all five answers

Answers: **T1 NO, T2 NO, T3 YES, T4 YES, T5 NO.** Short design follows (required for T3/T4). Consequence for review points: R1 does not fire (law fires it only when T1 or T2 is YES).

- T1 NO — one capability: every code/test/doc file touched (scripts/grammar-law.mjs, scripts/spec-drift.mjs, lib/validate.mjs, lib/loop-law.mjs, cdd/rules.md via its gherkin-owned glob, tests/smoke.mjs family, tests/acceptance/*) sits in the gherkin capability's Code: globs. Same shape as pin-law-rename (single capability, many files → NO).
- T2 NO — no new seam or dependency: trap 5 adds a grammar predicate where grammar lives (ADR-0007: validate.mjs narrows PLACEHOLDER_PIN application by masking code spans, same family as the existing fence masking); traps 1–3 are local output changes. No unstated-behavior bet; both directions of the trap-5 exemption are RED-pinned before implementation.
- T3 YES — two shared seams must move atomically. (a) Loop-law single source: the reworded trigger lives in `lib/loop-law.mjs` (trigger + triggerCompact), is carried into `lawRule2a()` (the hand-embedded phrase is replaced by the interpolated trigger field, so the law text can no longer drift from it), renders into `RULES_MD`, is byte-mirrored to `cdd/rules.md` (SSL3), is restated by the tasks scaffold's 4.2 line in `lib/templates.mjs` (reworded with the law; its `4.2 ADR review` prefix and Close-section shape stay, keeping smoke needles intact), is interpolated by `lib/instructions.mjs`, and is exact-string-pinned by SSL1 — all move in one commit or none. (b) DOOR_SCRIPTS verbatim copy: the trap-1 direct-execution check is authored inside each script (no shared helper — door scripts must run standalone from the store copy and `scripts/grammar-law.mjs` is import-free by design), so `scripts/` and the regenerated `cdd/scripts/` copy must behave identically; the store set is regenerated through the real door (`initStore` refresh path) and byte-compared.
- T4 YES — invariant risks, each RED-pinned: (a) the placeholder invariant must survive the code-span exemption — a bare token in delta spec text still fails draft, and the fence-masked scaffold pins stay untouched so "The scaffold passes its own doors" keeps its exact draft-error count (3); (b) the trap-3 hint must never fire when no open change's delta explains the L2 red — hint adds information, never suppresses an issue; (c) the guard clean-line reword must not break existing needles (verified: no test pins the current "acceptance tests" phrasing; only the guard's own comments carry it).
- T5 NO — `cdd/changes/` held only this change at gate time.

Design Notes (per-item shape, director-confirmed at handshake):

- **Item 1 (silent exit-0).** Direct-execution check `import.meta.url === pathToFileURL(process.argv[1]).href` (node:url builtin; ADR-0001 zero-dep holds) at the top of `lib/validate.mjs` and `scripts/grammar-law.mjs`: prints one usage line to stderr and exits 2 — spec-drift's existing usage-error convention (`scripts/spec-drift.mjs:75`) — pointing at the real invocations (the `cdd` tool's validate op via index.ts; door commands spec-drift/spec-extract/arch-extract). Library imports stay silent (check is argv-based, never runs on import). spec-extract/arch-extract already have real mains — untouched.
- **Item 2 (guard wording).** Clean summary says "acceptance test file(s)" — `accRel` is a file list.
- **Item 3 (L2 hint).** After issue collection: if any `[L2]` issues exist AND some open change's delta Code: globs (the `codeGlobs`/`globToRe` machinery already in spec-drift.mjs) match an L2-affected file, print one info line (the existing `placeholderSkips` info-line pattern) saying the L2 lines are expected mid-Close for the open change and clear at the archive pair-commit. Fires never when no open change explains the red.
- **Item 4 (ADR trigger precision).** Reword loop-law trigger/triggerCompact + rule 2a: decision-content changes (drafting an ADR, Amended-by) fire cdd-adr-review; Reconfirmed-by paragraphs and typo fixes do not; same breath states root `decisions/` (0001–0007, product ADRs) vs `cdd/decisions/` (0008+, loop ADRs). The tasks scaffold's 4.2 line (`lib/templates.mjs`) hand-restates the trigger and is reworded with the law (position, `4.2 ADR review` prefix, skip mechanics unchanged — smoke's Close-section needles hold). Regen `cdd/rules.md` byte-identical. Pins move in the same feature commit: SSL1 exact strings; RW1 extended to assert rule 2a's decision-content trigger phrase; new RW16 asserts the scaffold 4.2 line's decision-content wording and its Reconfirmed-by exclusion; new SSL check asserts the rendered rule 2a states the decisions-directory split. The delta MODIFIES both "Loop law names three review points" and "Tasks template scaffolds review tasks".
- **Item 5 (placeholder tokens).** Director-blessed option (a): in `lib/validate.mjs` checkRequirement, strip inline-code spans (backtick runs) from requirement/fence-external text before `PLACEHOLDER_PIN.test`, making backticks the deliberate-quoting escape hatch. Both directions RED-pinned: token inside a code span in delta spec text → draft passes; bare token in the same artifact → still flagged. This change's own delta still uses oblique wording (draft-green at R2 precedes implementation).

## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
- [x] 3.2 Library-contract pins are RED — author `tests/acceptance/library-usage.test.js`: running `node lib/validate.mjs`, `node scripts/grammar-law.mjs`, and `node cdd/scripts/grammar-law.mjs` each prints a usage line naming the real invocations to stderr and exits 2; importing both modules as libraries prints nothing and exits 0; a delta spec requirement quoting the angle-bracket scenario token inside an inline-code span passes draft validation; the same token bare in another requirement's description is still flagged "template placeholders still unfilled"; the scaffold's own draft-error count stays exactly 3, verify by node --test tests/acceptance/library-usage.test.js failing before 3.5/3.7 land and passing after
- [x] 3.3 Guard pins are RED — extend `tests/acceptance/gherkin-guard-placeholder.test.js` (same sandbox/fixture pattern): the clean summary counts "acceptance test file(s)"; an L2 red whose affected file matches an open change's delta Code: glob yields exactly one expected-mid-Close hint line; the same L2 red with no matching open change yields no hint; issues and exit codes are unchanged by the hint, verify by node --test tests/acceptance/gherkin-guard-placeholder.test.js failing before 3.6 lands and passing after
- [x] 3.4 Loop-law trigger pins are RED — update `tests/acceptance/single-source-law.test.js` SSL1 exact strings to the reworded trigger/triggerCompact, add an SSL assertion that the rendered rule 2a states the decision-content vs reconfirmation distinction and the two decisions directories; extend `tests/acceptance/review-wiring.test.js` RW1 to assert rule 2a names the decision-content trigger phrase and add RW16 asserting the scaffold 4.2 line names decision content and its Reconfirmed-by exclusion, verify by node --test tests/acceptance/single-source-law.test.js and tests/acceptance/review-wiring.test.js failing before 3.8 lands and passing after
- [x] 3.5 Direct execution prints usage — add the import.meta.url main-check to `lib/validate.mjs` and `scripts/grammar-law.mjs` (stderr usage line, exit 2), regenerate the store door scripts through `initStore` and byte-compare all four DOOR_SCRIPTS pairs, verify by node --test tests/acceptance/library-usage.test.js green and npm test green
- [x] 3.6 Guard counts files and hints expected L2 — `scripts/spec-drift.mjs`: clean line says "acceptance test file(s)"; L2 info hint per design note item 3; regenerate + byte-compare store copies, verify by node --test tests/acceptance/gherkin-guard-placeholder.test.js green and npm test green
- [x] 3.7 Code spans exempt spec-text placeholder tokens — `lib/validate.mjs`: mask inline-code spans before PLACEHOLDER_PIN in spec-text checks (fence-masked scaffold pins untouched), verify by node --test tests/acceptance/library-usage.test.js green and npm test green
- [x] 3.8 Loop law states the precise ADR-review trigger — reword `lib/loop-law.mjs` trigger/triggerCompact + `lawRule2a()` (interpolate the trigger field), reword the tasks-scaffold 4.2 line in `lib/templates.mjs` to match, re-mirror `cdd/rules.md` byte-identical (SSL3), verify by node --test tests/acceptance/single-source-law.test.js and review-wiring.test.js green, tests/smoke.mjs green, cdd/rules.md === RULES_MD

## Done When Traceability

| criterion | task ids |
|---|---|
| Direct execution of validate/grammar-law prints usage and exits 2; library imports stay silent | 3.2, 3.5 |
| Guard clean summary says acceptance test file(s) | 3.3, 3.6 |
| Guard hints expected mid-Close L2 only when an open change's delta explains it | 3.3, 3.6 |
| Rule 2a + trigger state decision-content vs reconfirmation and the decisions split; pins + mirror move together | 3.4, 3.8 |
| Code-span placeholder tokens pass draft; bare tokens still fail | 3.2, 3.7 |

## 4. Close

- [x] 4.1 Change code review — run skill `cdd-code-review` over the diff since the change branched; findings at `reviews/r3-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-code-review.md holding no open blocker
- [x] 4.2 ADR review — this change rewords law text only and drafts/amends no ADR beyond citation (ADR-0007 is cited, not amended): skip recorded on this line per the reworded trigger (a decision-content change would fire; this is not one), verify by reviews/adr-review.md holding no open blocker or a skip recorded on this line
- [ ] 4.3 cdd validate strict green, guard green
- [ ] 4.4 Archive — pair-commit: feature commit, then archive commit

<!-- split-considered: kept whole because the five traps are one ergonomics batch through one loop — the 14 boxes are the design-gate record (2), RED pin authoring (4), implementation (8, reusing the pin files), and Close (4) of a single scoped change; splitting would split the trap batch the mission scoped together -->
