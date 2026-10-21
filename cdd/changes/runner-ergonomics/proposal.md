# runner-ergonomics

## Why

Five first-runner traps each bit a live participant this session — the silent-exit-0 trap bit this runner again during recon for this very change (three probes, three silent exit-0s): `node lib/validate.mjs` / `node scripts/grammar-law.mjs` run as commands print nothing and exit 0 (read as success); the guard's clean line says "N acceptance tests" while counting test files (misread as scenario count → false process finding); the guard goes L2-red by design between archive-merge and the pair-commit with no hint that this is expected; the ADR-review trigger "drafted or amended ADRs" is silent on Reconfirmed-by paragraphs (which must not fire it) while Amended-by content changes do; and spec authors cannot quote the literal angle-bracket template tokens even when explaining them, forcing oblique prose. First-run friction corrupts the loop's own record — wrong exits, false findings, confusing laws.

## What Changes

- Direct execution of `lib/validate.mjs` and `scripts/grammar-law.mjs` (both the `scripts/` source and the verbatim `cdd/scripts/` copy) prints a one-line usage pointer to the real invocations on stderr and exits 2; importing either as a library stays silent.
- The guard's clean summary counts "acceptance test file(s)".
- The guard prints exactly one informational hint line when L2 findings exist and an open change's delta Code: globs match an affected file — expected mid-Close, cleared by the archive pair-commit; never fires when no open change explains the red.
- Loop law rule 2a and its trigger fields state precisely: decision-content changes (drafting an ADR, Amended-by paragraphs) fire cdd-adr-review; Reconfirmed-by paragraphs and typo fixes do not; root `decisions/` (0001–0007, product ADRs) vs `cdd/decisions/` (0008+, loop ADRs) stated in the same breath. The tasks scaffold's 4.2 line (`lib/templates.mjs`) restates the trigger and is reworded with the law. SSL1 exact-string pins, RW1's new trigger assertion, and the `cdd/rules.md` mirror move in the same commit.
- Draft validation exempts angle-bracket placeholder tokens inside inline-code spans in delta spec text (backticks become the deliberate-quoting escape hatch); bare tokens in the same artifact still fail "template placeholders still unfilled"; fence-masked scaffold pins are untouched.

Cites ADR-0007 (files in its code: globs are modified; the one grammar module behind every door keeps owning the predicates changed here), ADR-0009 (the loop-law rewording renders from loop-law.mjs through every surface — rules text, scaffold instructions, ambient block, /cdd-help — none hand-embedded; the rules.md mirror is rewritten deliberately since an existing store keeps its rules.md), ADR-0008 (the review points stay advisory findings, never verdicts; only the trigger's wording is made precise), and ADR-0010 (the reworded rule 2a keeps cold reviewers the norm — R3 stays two cold sessions; the law text carries the requirement, the citations follow it).

## Solutions Considered

- gherkin: spec-drift's existing usage-error convention (`scripts/spec-drift.mjs:75`, stderr + exit 2) — adopted for trap 1's exit shape; a shebang/CLI wrapper or new bin module — rejected (bigger surface than a 3-line argv check; door scripts must stay verbatim-copiable and standalone).
- gherkin: a shared direct-execution helper module — rejected: DOOR_SCRIPTS copies four scripts verbatim, a lib/ helper would not travel with the store copy, and `scripts/grammar-law.mjs` is import-free by design; the check is duplicated in the two scripts like spec-drift's own usage block.
- gherkin: the existing fence-masking family in grammar-law/validate (fence bodies keep pin comments) — adopted as the pattern for code-span masking (trap 5): same masking idea, one new context.
- gherkin: the existing `codeGlobs`/`globToRe` delta-glob machinery in spec-drift.mjs — adopted for the trap-3 hint; no new matching code.
- gherkin: loop-law single-source render (`lib/loop-law.mjs` → `lawRule2a()` → `RULES_MD` → `cdd/rules.md`) — adopted for trap 4: reword once at the source, regenerate the mirror. The delta's MODIFIED Code lines restate each requirement's inherited ownership (every file implementing the requirement, edited or not), so they legitimately name files absent from this proposal's edit-surface Code: line.
- gherkin (item 5 gate): option (b) codify the oblique-wording convention in law text — rejected at the director-blessed handshake in favor of option (a) the code-span exemption, which removes the trap class instead of documenting it; searched `cdd/specs/` for existing exemption machinery — none beyond fence masking.

## Non-Goals

- No behavior changes beyond the five traps; no renaming; no new modules or dependencies (ADR-0001 zero-dep holds; node:url builtin only).
- No scaffold structural changes: the tasks template's 4.2 line keeps its position, `4.2 ADR review` prefix, and skip mechanics — only its trigger clause rewords with the law; proposal/tasks comment scaffolds untouched.
- L2 semantics unchanged: the hint adds an informational line, never suppresses or reclassifies an issue; exit codes unchanged.
- Proposal/tasks placeholder checks (Done-When `<...>` templates) keep flagging bare tokens everywhere — the exemption applies to delta spec text only.
- No CLI surface for spec-extract/arch-extract (already have real mains) and no making validate.mjs a general-purpose CLI.
- The decisions/ split is stated in law text; no ADR is drafted, amended, or moved by this change.

Done-When: `node lib/validate.mjs`, `node scripts/grammar-law.mjs`, and `node cdd/scripts/grammar-law.mjs` each print a usage line to stderr and exit 2, while importing both modules prints nothing (pinned by tests/acceptance/library-usage.test.js)
Done-When: the guard's clean summary says "acceptance test file(s)" (pinned by tests/acceptance/gherkin-guard-placeholder.test.js)
Done-When: the guard prints one expected-mid-Close L2 hint line iff an open change's delta Code: globs match an L2-affected file, and none otherwise (pinned by tests/acceptance/gherkin-guard-placeholder.test.js)
Done-When: rule 2a and the loop-law trigger fields name decision-content changes as the cdd-adr-review trigger and state the root `decisions/` vs `cdd/decisions/` split, with cdd/rules.md byte-identical to RULES_MD (pinned by tests/acceptance/single-source-law.test.js)
Done-When: a delta spec quoting a placeholder token inside an inline-code span passes draft validation while the bare token in the same artifact still fails (pinned by tests/acceptance/library-usage.test.js)
Code: scripts/grammar-law.mjs, scripts/spec-drift.mjs, cdd/scripts/**, lib/validate.mjs, lib/loop-law.mjs, lib/templates.mjs, cdd/rules.md, tests/acceptance/library-usage.test.js, tests/acceptance/gherkin-guard-placeholder.test.js, tests/acceptance/single-source-law.test.js, tests/acceptance/review-wiring.test.js
