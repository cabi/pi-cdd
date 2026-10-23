# R3 spec-axis code review — guard-glob-fix

- **Review point:** R3 (Close, before archive)
- **Axis:** Spec — does the implementation match the change's spec delta, completely and exactly? Nothing missing, nothing unsponsored.
- **Mode:** cold, first-class subagent session; model `opencode-zen/deepseek-v4-pro` (provider `opencode-zen`); not the author of any reviewed artifact; non-zai family (author family: zai)
- **Date:** 2026-10-23
- **Range:** branch `guard-glob-fix` @ base `24fc6f829bffc4c04fffa081a05a7071a29c5995`; working tree = the change under review. Modified: `scripts/spec-drift.mjs`, `cdd/scripts/spec-drift.mjs` (byte-identical). Untracked: `cdd/changes/guard-glob-fix/`, `tests/acceptance/guard-glob-claims.test.js`, `tests/acceptance/guard-memory-claims.test.js`. Findings are **advisory**; the author disposes. No verdicts.

## Verdict

The implementation matches the spec delta completely and exactly. All 5 glob-compilation scenarios (GGC1–5) and all 9 memory-claim scenarios (MC1–9) are implemented and pinned to real checks that exercise them; both test files pass. The 8 corrected Code lines (7 gherkin + 1 adr) match design.md's fallout inventory exactly — every one names enforcement pins, never `cdd/decisions/**`. All 5 Done-When lines hold against the working tree. Nothing is unsponsored. Three note-level coverage observations follow; none is a spec violation.

## Findings

| severity | finding | evidence | disposition |
|---|---|---|---|
| note | The compiled-claim detection branch of `globClaimsMemory` is sponsored by the spec prose ("by `cdd/decisions/` prefix or by compiled claim") but is not exercised by any of the 9 MC scenarios — every scenario uses `cdd/decisions/*.md`, which is caught by the prefix branch. A glob that claims decision memory without the literal prefix (e.g. `cdd/**` or `**/decisions/*.md`) is only caught by the compiled-claim branch, which no pin drives. | scripts/spec-drift.mjs:361-363 (`globClaimsMemory`); specs/gherkin/spec.md ADDED "Code lines claim implementation surface, never decision memory" prose vs its 9 scenarios | FIXED — MC10 added (tests/acceptance/guard-memory-claims.test.js): living R2 with `Code: cdd/**` (no prefix) + tracked decision file → scan reds with exactly 1 [L4] naming the glob and the living spec. Delta scenario "A compiled claim with no decisions prefix reds" sponsors it; suite now 11/11. |
| note | `globToRe` treats an empty class span (`[]` or `[!]`) as literal text (`body.replace(/^!/, '').length === 0` → `\\[`), but the glob-compilation contract only specifies "an unterminated `[` is literal text". The extension is defensible (an empty class matches nothing, so literal is the non-silent reading) but is beyond the spec's literal wording and is not pinned by any GGC scenario. | scripts/spec-drift.mjs:232-234; specs/gherkin/spec.md ADDED "Code globs compile to precise file claims" | FIXED — contract prose extended ("an unterminated `[` or an empty class span (`[]`, `[!]`) is literal text — an empty class would match nothing, and a silent no-match glob is the failure this law kills") and GGC6 added: `cfg/[].mjs`/`cfg/[!].mjs` claim the literally-named files, staging one reds naming it. Delta scenario "An empty class span is literal text"; suites 6/6 and 11/11. |
| note | The travel-door exemption in `exemptMemoryGlobs` uses a "fully corrected" predicate — a glob is exempt from topology L2 and the staged-pair check only if EVERY requirement carrying it is corrected — which is stricter than the per-requirement L4 skip. This is consistent with design.md's "same under-correction predicate" (a claim is under correction only when every requirement holding it is), but no MC scenario places the same memory glob in two requirements, so this branch is unpinned. | scripts/spec-drift.mjs:412-421 (`exemptMemoryGlobs`); design.md FS boundary | FIXED — MC11 added: R2 and R3 both carry `Code: src/app.js, cdd/decisions/*.md`; an open change corrects R2 only → scan = exactly 1 skip (R2) + exactly 1 finding naming R3, and a staged ADR edit reds the commit-msg door ("no spec of app is in this commit"). Prose gained the all-or-nothing sentence ("The travel-door half of the exemption is all-or-nothing"); delta scenario "A half-corrected spec exempts nothing". |

## Coverage and verification

Read: `proposal.md` (5 Done-When lines), `design.md` (boundaries + fallout inventory of the 8 Code lines), `specs/gherkin/spec.md` (2 ADDED + 7 MODIFIED), `specs/adr/spec.md` (1 MODIFIED), `tasks.md` (Done When Traceability), `scripts/spec-drift.mjs` (globToRe:220-243, L4 check:345-440, caps filter:453-461, L4-skip print:729-733), both test files, and the living `cdd/specs/gherkin/spec.md` + `cdd/specs/adr/spec.md` Code lines.

Commands run (read-only; tests write only to `/tmp` sandboxes):
- `node tests/acceptance/guard-glob-claims.test.js` → `guard-glob-claims: 5 pass, 0 fail` (exit 0)
- `node tests/acceptance/guard-memory-claims.test.js` → `guard-memory-claims: 9 pass, 0 fail` (exit 0)
- `node cdd/scripts/spec-drift.mjs` → exit 0, `clean (6 specs, 25 acceptance test files, full scan)`, with 10 `[L4-skip]` lines (the 8 legacy Code lines, 10 globs — Reviewer-independence carries 3) all naming `guard-glob-fix` as the correcting change
- `cmp scripts/spec-drift.mjs cdd/scripts/spec-drift.mjs` → identical
- `npm test` → 25 pass, 0 fail (exit 0)

Scenario-by-scenario pin resolution: every `# Verified by:` in both deltas resolves to a real file. GGC1–5 → `tests/acceptance/guard-glob-claims.test.js` (exists, 5 checks). MC1–9 → `tests/acceptance/guard-memory-claims.test.js` (exists, 9 checks). The 7+1 MODIFIED requirements' pins (`review-wiring`, `single-source-law`, `loop-law-hardening`, `r3-findings`, `design-docs`, `reviewer-independence`, `decisions-home`, `smoke.mjs`) all pre-exist and resolve.

Corrected Code lines vs fallout inventory (all 8 match, name pins not ADR memory): Loop law / Tasks template / Design gate / Advisory-findings drop `0008-*.md`; Single-source `0009-*.md` → `tests/acceptance/single-source-law.test.js`; Reviewer-independence `0010/0008/0009-*.md` → `tests/acceptance/reviewer-independence.test.js, tests/acceptance/loop-law-hardening.test.js` (loop-law-hardening stays, reviewer-independence added — the living line under-claimed); Re-tick `0011-…md` → `tests/acceptance/loop-law-hardening.test.js`; adr `000[1-7]-*.md` → `tests/acceptance/decisions-home.test.js`.

Done-When lines: DW1 (GGC1/GGC3 red the commit-msg door naming the claimed file) ✓; DW2 (MC2 reds a living memory claim naming spec + A-checks) ✓; DW3 (MC8 passes `--staged` and `--commit-msg` green) ✓; DW4 (8 corrected Code lines name implementation surface only) ✓; DW5 (full scan exits 0 at tip) ✓.

Post-archive expectation: after the archive pair-commit merges the corrected Code lines into the living specs and moves the delta to `cdd/archive/` (excluded from `deltaSpecs`), no living spec claims decision memory and no open delta exists — so `memoryClaimsOf` returns nothing, `correctionsByCap`/`exemptMemoryGlobs` are empty, and the scan is clean with zero `[L4-skip]` lines. Verified by inspection of the delta's corrected Code lines (none contains `cdd/decisions/`).

Not run: `cdd validate` (standards/mechanical axis, not this review's scope).
