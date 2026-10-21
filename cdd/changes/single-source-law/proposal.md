# single-source-law

## Why

The loop + review-point law is stated by hand in five places — `lib/templates.mjs` `RULES_MD` (mirrored byte-exact into `cdd/rules.md`), the instruction tails in `lib/instructions.mjs`, the ambient block in `lib/context.mjs`, the `/cdd-help` tips in `lib/help.mjs`, and the README driving table — and they already drifted once before `wire-review-points` caught up the stragglers; a later task brief even misattributed the source. Every future law edit must find and re-edit ~6 files by memory, so the drift will recur.

## What Changes

- New lib-only module `lib/loop-law.mjs` — the single canonical definition of the loop-law facts: the loop chain, the four review points (R1, R2, R3, and the conditional ADR review) as data (id, normative trigger phrases, skill, mode, findings path), and the advisory-findings grammar. Zero new dependencies (ADR-0001).
- `RULES_MD` rules 2/2a compose from the module's normative phrases; the rendered law text is byte-identical, so the store copy `cdd/rules.md` and RW1–RW5 hold unchanged.
- `PROPOSAL_INSTRUCTION` and `TASKS_INSTRUCTION` interpolate the fact constants; the ambient line (`lib/context.mjs`) and the `/cdd-help` review tip (`lib/help.mjs`) are rendered by module functions from the module's compact trigger forms (defined beside the normative ones) — the only wording shift is the compact "T1/T2" becoming the module's compact "T1 or T2 YES".
- README's review-points row drops the restated skills/modes/findings paths and points at `cdd/rules.md` rule 2a: the law document stays the authoritative statement; README keeps a trigger summary whose phrases the acceptance test pins to the module's canonical values.
- Living spec: MODIFIED requirement "Loop law names three review points" (README scenario repinned to the pointer form; ambient/help scenario repinned to the derived form), ADDED requirement "The loop law is single-sourced" pinning the one-module invariant.
- New acceptance test `tests/acceptance/single-source-law.test.js`, authored RED before implementation; RW14 is modified to pin the README pointer form.
- ADR-0009 (draft) records the four-criterion judgement and the single-source decision — canonical facts + renderers over mirror, generator, and pointer-only; resolved by the human at Close, where task 4.2 runs `cdd-adr-review` on it.

## Capabilities

- gherkin — one delta `specs/gherkin/spec.md` in this change: MODIFIED "Loop law names three review points" (README + ambient/help scenarios), ADDED "The loop law is single-sourced" pinning the module, the derivation, and the README pointer.

## Solutions Considered

- law-module: `scripts/law.mjs` — "the one law behind every door … a grammar defined here is defined exactly once". Covers the pattern (one definition, every consumer adapts, LAW_VERSION + init refresh for adopting copies). Adopted as the architectural pattern; rejected as the home for the prose facts: door scripts never render prose, and putting lib prose into `cdd/scripts/` copies would ship it to every adopting store unused.
- mirror: the existing `RULES_MD`↔`cdd/rules.md` byte mirror (RW5). Covers exactly that pair — a copy plus a pinned check. Adopted unchanged for the store copy; rejected as the mechanism for the other surfaces: a mirror is copy-then-verify, so N surfaces still carry N hand-edited texts that a test must walk; it detects drift, it does not remove the source of drift.
- generator: generate README (and other markdown) sections from the module at build/check time with marker fences. Covers markdown, which cannot import. Rejected: adds a generation step and marker blocks to hand-edited docs for one table row; a pointer achieves the single readable statement with zero machinery.
- pointer-only: reduce every derived surface (ambient, help, instructions) to a link to `cdd/rules.md`. Covers maximal de-duplication. Rejected: ambient and help are runtime-rendered UX with token budgets and theming — a compact summary rendered from the canonical data serves both; a bare pointer forces a round-trip to the law on every request or leaves the agent uninformed.
- existing spec: the living requirement "Loop law names three review points" (RW1–RW7) already pins cross-surface agreement. Adopted as the base this change modifies; it detects disagreement after the fact but leaves the duplication in place — detection is not sourcing.

## Non-Goals

- `skills/*/SKILL.md` trigger phrasing: skill files are self-contained dispatch documents for cold agents; their descriptions restate triggers so a cold reader can route. The law, not the skill text, drives when reviews fire; reducing them to pointers would hurt discovery for no drift risk they own.
- `scripts/law.mjs` grammar chapters: machine law stays where it is; no prose moves into door scripts.
- README's bundled-skills row (`cdd-spec-review (R1/R2)`, `cdd-adr-review`): it names skills as inventory, not law statements; the pointer form is scoped to the driving-table row.
- `GLOSSARY.md`, `PRODUCT.md`, `MAINTENANCE.md`: they reference the loop by name without stating review-point triggers; nothing to single-source.
- Changing the law's content: the law text itself is untouched — this change only re-sources it. A future rule edit lands in one module and every surface follows.

Done-When: the review-point facts and trigger phrases are defined in exactly 1 module (`lib/loop-law.mjs`), and every statement surface — `RULES_MD` rules 2/2a, `PROPOSAL_INSTRUCTION`, `TASKS_INSTRUCTION`, the ambient block, the `/cdd-help` review tip — renders them from that module — pinned by tests/acceptance/single-source-law.test.js
Done-When: the law text is unchanged by the re-sourcing (`RULES_MD` rules 2/2a byte-identical; store copy `cdd/rules.md` untouched; RW1–RW5 pass) — pinned by tests/acceptance/review-wiring.test.js
Done-When: the README review-points row names the triggers and points at `cdd/rules.md` rule 2a, naming no skill, mode, or findings path; its trigger phrases equal the module's normative phrases — pinned by tests/acceptance/review-wiring.test.js (RW14, modified)
Done-When: the deterministic gates are green — npm test exits 0 and node scripts/spec-drift.mjs full scan exits 0
Done-When: cdd/decisions/0009-*.md records the single-source decision (canonical facts + renderers over mirror, generator, and pointer-only) with frontmatter status draft for the human sponsor to resolve at Close — pinned by tests/acceptance/single-source-law.test.js
Code: lib/loop-law.mjs, lib/templates.mjs, lib/instructions.mjs, lib/context.mjs, lib/help.mjs, README.md, cdd/decisions/0009-*.md, tests/acceptance/single-source-law.test.js, tests/acceptance/review-wiring.test.js
