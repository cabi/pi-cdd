# R3 Spec-Axis Code Review — law-guard-fixes

**Reviewer form:** cold sub-agent (fresh session, not the author's).
**Reviewer model family:** opencode-zen (`opencode-zen/deepseek-v4.1-flash`, DeepSeek lineage) vs author family: zai (`zai/glm-5.3`, GLM lineage) — families differ ✓ (verified from `PI_PROVIDER`/`PI_MODEL`).
**Review point:** R3 (code review, at Close), Spec axis only. The Standards axis runs in a separate cold session; its findings file is untouched by this run.
**Fixed point:** `HEAD` = 26f3467 (branch `law-guard-fixes` from `main`); the change is the uncommitted working tree.

## Inputs read

- `git diff HEAD` (5 tracked files, 25 insertions / 7 deletions) — `cdd/rules.md`, `scripts/spec-drift.mjs`, `cdd/scripts/spec-drift.mjs`, `lib/loop-law.mjs`, `lib/templates.mjs`.
- Untracked, read whole from disk: `cdd/changes/law-guard-fixes/{proposal.md,tasks.md,design.md,specs/gherkin/spec.md}`, `tests/acceptance/law-done-when.test.js`, `tests/acceptance/guard-pair-commit.test.js`.
- Code touched by the diff plus the pins it must satisfy: `lib/loop-law.mjs`, `lib/templates.mjs`, `lib/store.mjs`, `lib/validate.mjs`, `lib/instructions.mjs`, `tests/acceptance/single-source-law.test.js`, `tests/smoke.mjs`.

## Findings

### F1 — `should` — disposition: open

**The pin the delta names for the mirror clause ("byte-identically") does not assert byte-identity; it normalizes whitespace and stays green under a whitespace-only drift of `cdd/rules.md` rule 3 — a drift that violates the scenario's stated THEN.**

- Scenario THEN: "the store copy `cdd/rules.md` carries the same rule-3 fragment **byte-identically**" — `cdd/changes/law-guard-fixes/specs/gherkin/spec.md:21` (and its `# Verified by:` names `tests/acceptance/law-done-when.test.js` at `spec.md:22`).
- The pin's own name claims byte-identity — `tests/acceptance/law-done-when.test.js:62` — but the assertion compares normalized text: `assert(norm(r3store) === norm(r3render), ...)` at `tests/acceptance/law-done-when.test.js:66`, with `norm` = `s.replace(/\s+/g, " ")` at `tests/acceptance/law-done-when.test.js:38`; `ruleBlock()` normalizes again before returning (`tests/acceptance/law-done-when.test.js:40-46`, normalization at `:46`).
- Scratch-run evidence (copy of the tree, mirror rule 3 re-wrapped with extra spaces + a tab, module untouched): `node --test tests/acceptance/law-done-when.test.js` → **LDW1 ok, LDW2 ok, LDW3 ok — 3 pass, 0 fail**.
- The repo's established mirror pin uses strict equality — `assert(store === tpl.RULES_MD, ...)` at `tests/acceptance/single-source-law.test.js:117-119` — and that pin **does** catch the same drift (scratch run: SSL3 failed, 9 passed / 1 failed), so the gate is not open; only the named pin's claim is.
- Suggested disposition shape: make LDW2 compare the raw rule blocks byte-for-byte, or drop "byte-identically" from the pin name and the scenario THEN and defer to SSL3.

### F2 — `note` — disposition: open

**Requirement 1's agreement clause ("the same bounds the proposal scaffold instruction states and the validate door enforces") has no pin comparing the three surfaces; the pins assert literal substrings in the law text only, so a future edit to the instruction or the door bound leaves the law text stale with every pin green.**

- Requirement prose: `cdd/changes/law-guard-fixes/specs/gherkin/spec.md:5` — "the same bounds the proposal scaffold instruction states and the validate door enforces".
- Surfaces that agree today: instruction `lib/instructions.mjs:35-37` ("1-5 completion criteria, each … an observable check"); door `lib/validate.mjs:34-36` (`doneWhen.length === 0` → missing / `> 5` → max 5); law `lib/loop-law.mjs:160-164`.
- The pins assert only literals against the law text — `tests/acceptance/law-done-when.test.js:55-57` (rendered), `:66-68` (mirror), `:77-81` (module) — nothing couples rule 3 to `PROPOSAL_INSTRUCTION` or `validateProposal`.
- Not a blocker for this delta (the scenario THEN does not require the coupling); advisory: a pin asserting the shared bound would close the drift risk the Requirement names.

### F3 — `note` — disposition: open

**Requirement 2 leans on the commit-msg door's staged-pair check as the compensating control now that the pre-commit door no longer runs topology, but no scenario or pin in this delta exercises it — the guarantee is pinned only pre-existing, in `tests/smoke.mjs`.**

- Requirement prose: `cdd/changes/law-guard-fixes/specs/gherkin/spec.md:29` — "the commit being made is policed by the commit-msg door's staged-pair check (staged code without a staged spec of the capability)"; the delta's two scenarios pin only the pre-commit pass and the full-scan L2 firing, both `# Verified by: tests/acceptance/guard-pair-commit.test.js` (`spec.md:38`, `spec.md:44`).
- The compensating control is in fact enforced and pinned: `tests/smoke.mjs:662` (S27) stages a bare code change and runs the real door with `--commit-msg`, asserting `[L2]` red at `tests/smoke.mjs:691-693`; the check itself is `scripts/spec-drift.mjs:355-359` (the L2 push at `:358`).
- No gap found — the note is traceability only: this delta's own pins would not go red if the commit-msg travel check regressed.

### No unsponsored hunks found

Every hunk in the diff maps to a delta requirement / task verify-by: `lib/loop-law.mjs:160-164` (`lawRule3()`) and `lib/templates.mjs:7,20` (import + interpolation) ← Requirement 1 + task 3.3; `cdd/rules.md:61-63` (mirror) ← Requirement 1; `scripts/spec-drift.mjs:360` and `cdd/scripts/spec-drift.mjs:360` (`} else if (!preCommit) {` plus the ownership rationale comment) ← Requirement 2 + task 3.5. Both deltas' `Code:` lines cover every diffed file (`spec.md:25`, `spec.md:47`). No dead code, speculative hook, or drive-by refactor. GPC1 (`tests/acceptance/guard-pair-commit.test.js:90-99`) and GPC4 (`:134-146`) assert the Given's precondition and the proposal's stated end state (Non-Goals bullet 3, `proposal.md:23`) rather than a scenario THEN; read as fixture/end-state guards, not unsponsored behavior — no finding raised.

## Verification log (evidence)

Scenario-to-code traceability, both scenarios of both Requirements: implemented as stated. Law text present in module (`lib/loop-law.mjs:160-164`), interpolated verbatim (`lib/templates.mjs:7,20`) and mirrored (`cdd/rules.md:61-63`); the old wording survives nowhere in the law/store (`grep -rn 'one \`Done-When:\` line'` → only `cdd/changes/law-guard-fixes/proposal.md:5` (the narrative), `cdd/archive/20261023-hook-wiring/reviews/r2-change-review.md:28` (frozen history), and the test constant `tests/acceptance/law-done-when.test.js:49`). Guard gate skips topology for `--staged` and only for `--staged` (`scripts/spec-drift.mjs:360-378`; `preCommit` defined `:67` as `argv.includes('--staged')`, `staged` `:72`); `--commit-msg` non-mechanical takes the staged-pair branch `:355-359`, mechanical and full scan keep topology.

Pins actually pin (scratch copy of the tree; mutations applied only there, the reviewed tree was not modified):

| mutation | expected red | observed |
|---|---|---|
| revert the gate: `} else if (!preCommit) {` → `} else {` (pre-fix state) | GPC2 (and GPC4 via the same deadlock) | GPC2 FAIL, GPC4 FAIL — 2 pass / 2 fail |
| kill the full-scan topology branch: `} else if (!preCommit && false) {` | GPC3 | GPC3 FAIL — 3 pass / 1 fail |
| regress `lawRule3()` to the old "one `Done-When:` line" wording (module only) | LDW1, LDW2, LDW3 | 0 pass / 3 fail |
| whitespace-only re-wrap of rule 3 in `cdd/rules.md` (module untouched) | (scenario claims byte-identity) | LDW1/LDW2/LDW3 all ok; SSL3 in `tests/acceptance/single-source-law.test.js` FAILED |

Door-pin clause (rule 7), judged as the brief directs: `tests/acceptance/guard-pair-commit.test.js` builds a sandbox store with the real `lib.initStore` (`:49`) and `lib.archiveChange` (`:105`) and runs the real door script as a child process (helper `:52-63`); `writeDoorScripts` copies the extension's `scripts/spec-drift.mjs` into the sandbox (`lib/templates.mjs:250-258`), so the pinned code path is the reviewed one — confirmed by the first mutation above. Real door entry point, not a copied fragment; no finding.

Pins green at the pinned state: `node --test tests/acceptance/law-done-when.test.js` → 3 pass / 0 fail; `node tests/acceptance/guard-pair-commit.test.js` → 4 pass / 0 fail; `npm test` → 23 tests / 23 pass / 0 fail (both new pins are in the corpus). `cmp scripts/spec-drift.mjs cdd/scripts/spec-drift.mjs` → byte-identical.

Advisory only: no fixes applied, no verdicts — gate authority stays with the deterministic validators and the human. All findings above are `open` for the author to dispose as `fixed:` or `won't-fix:`.

## Dispositions (author, 2026-10-23)

- F1 (LDW2 normalized comparison) — **fixed:** ruleBlock() now returns the raw slice and LDW2 asserts `r3store === r3render` byte-exact; the scratch mutation from this review (whitespace re-wrap of rule 3 in the mirror) now fails LDW2 directly.
- F2 (no pin couples the three surfaces) — **fixed:** new LDW4 asserts the scaffold instruction still states "Done-When: 1-5 completion criteria" and exercises the real `validateChange` door on a scratch change: 6 Done-When lines trip "Done-When criteria (max 5", 5 lines do not. Mutation-verified: sed-ing the instruction bound to 1-6 turns LDW4 red.
- F3 (commit-msg compensating control pinned only pre-existing) — **fixed:** new GPC5 stages bare code (delta unstaged) and runs the real door with --commit-msg, asserting exit non-zero with exactly one "[L2] … no spec of app is in this commit". Mutation-verified: disabling the staged-pair branch turns GPC5 red.

## Post-Close addendum 2026-10-23 (post-approval, director-authorized)

The Close pair-commit surfaced an A2 staleness debt (six ADRs vs the
change's governed files). A director-authorized bypass was withdrawn after
the runner probe-isolated the door red and found a lawful amend shape
(reconfirmations ride the archive commit, which alone carries a
living-spec merge to pair a literally-claimed ADR file); the six
reconfirmation paragraphs landed via the authorized amend of the unpushed
archive commit through both wired doors. PF-19 (corrected) and PF-20
(globToRe star-escape) are recorded in cdd/backlog.md. No finding above is
affected; this addendum is store history, not a review verdict.
