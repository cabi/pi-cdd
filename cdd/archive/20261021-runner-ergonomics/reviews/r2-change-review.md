# r2-change-review — runner-ergonomics — 2026-10-21 — reviewer: cold sub-agent

Package-mode (R2) review of the `runner-ergonomics` change package, run cold from disk
(proposal.md, tasks.md, specs/gherkin/spec.md delta, cdd/specs/gherkin/spec.md living spec,
cdd/rules.md). Repository /home/carsten/Projects/pi-extensions/pi-cdd, branch `ergonomics`,
HEAD 9df6c73; change artifacts uncommitted under cdd/changes/runner-ergonomics/.

## Design-gate honesty check (director-requested, applied hard)

T1 answer "NO — one capability" was checked file-by-file against the living capabilities'
Code: globs. Every file named in the proposal's `Code:` line and in the delta's five
`Code:` lines is claimed by the **gherkin** capability (`cdd/specs/gherkin/spec.md`), and
none is claimed by the `extension` or `acceptance` capabilities:

- `scripts/grammar-law.mjs`, `scripts/spec-drift.mjs`, `cdd/scripts/**`, `lib/validate.mjs`,
  `lib/templates.mjs`, `lib/instructions.mjs` — gherkin spec.md:149 (Gherkin subset limits)
  and :507 (Guard tolerates scaffold placeholders).
- `lib/loop-law.mjs` — gherkin spec.md:367 (The loop law is single-sourced) and :436
  (Reviews run cold).
- `lib/context.mjs`, `lib/help.mjs`, `README.md`, `cdd/rules.md`, `cdd/decisions/0008-*.md`,
  `tests/acceptance/review-wiring.test.js` — gherkin spec.md:255/:345/:436.
- `tests/acceptance/single-source-law.test.js` — gherkin spec.md:367.
- `tests/acceptance/gherkin-guard-placeholder.test.js` — gherkin spec.md:507.
- `tests/acceptance/library-usage.test.js` — new file, claimed by the delta's own
  requirements 1 and 4 (genuinely being created).

The `extension` capability claims only `index.ts`, `lib/status*.mjs/ts`, `tests/tools.mjs`,
`tests/acceptance/extension-*.test.js`; the `acceptance` capability claims only
`.github/workflows/cdd.yml` and `tests/acceptance/ci-node-matrix.test.js`. Neither overlaps
the touched set. **T1 NO is honest** — the gherkin capability is genuinely broad (it owns
the loop law, the doors, the guard, and the scaffolds), and this change stays inside it.

## Findings

| severity | finding | evidence | disposition |
|---|---|---|---|
| should | Proposal `Code:` line and the delta's MODIFIED requirement `Code:` line disagree about the implementation surface. The proposal omits `lib/instructions.mjs`, `lib/context.mjs`, `lib/help.mjs`, `README.md`, `cdd/decisions/0008-*.md`, `tests/acceptance/review-wiring.test.js` — all claimed by the delta's MODIFIED "Loop law names three review points" requirement — while including `lib/templates.mjs`, which the design note (tasks §2 item 4) says stays as-is. | proposal.md:40 `Code:` vs delta specs/gherkin/spec.md:151 `Code:`; tasks.md §2 item 4 "Scaffold instruction lines … stay as-is" | fixed: proposal Code line now names the true edit surface — `lib/templates.mjs` kept (the tasks-scaffold 4.2 line hand-restates the trigger and is reworded with the law; tasks §2 item 4 note corrected) and `tests/acceptance/review-wiring.test.js` added (RW1 extension + RW16). The delta's MODIFIED Code line restates the requirement's inherited ownership — files implementing it whether or not edited — documented in the proposal's Solutions Considered |
| should | The MODIFIED scenario "Rule 2a states all three review points and the ADR review" adds the decision-content vs reconfirmation precision ("decision-content changes … not for Reconfirmed-by paragraphs or typo fixes") but is pinned to `tests/acceptance/review-wiring.test.js`, whose RW1 check asserts only `cdd-adr-review` and `adr-review.md` substrings — it never asserts the new trigger precision. The assertion that actually verifies the new wording is added to `tests/acceptance/single-source-law.test.js` (task 3.4), which is pinned to a *different* scenario ("Rule 2a states the two decisions directories"). The modified scenario's new content is therefore not verified by its own pin. | delta specs/gherkin/spec.md:151 scenario pin `# Verified by: tests/acceptance/review-wiring.test.js`; tests/acceptance/review-wiring.test.js:60-75 (RW1); tasks.md §3.4 | fixed: task 3.4 now extends RW1 (the pinned scenario's own suite) to assert rule 2a's decision-content trigger phrase, so the scenario's new content is verified by its pin; the directories scenario gets a matching SSL rendered-rule assertion |
| note | The Done-When traceability table carries a duplicated header row (`\| criterion \| task ids \|` appears twice with two separator rows), which renders as a malformed markdown table. | tasks.md "## Done When Traceability" table | fixed: duplicate header rows removed from the Done When Traceability table |

## Coverage and verification

- Read proposal.md, tasks.md, the delta (specs/gherkin/spec.md), the living spec
  (cdd/specs/gherkin/spec.md), and cdd/rules.md in full.
- Enumerated all `Code:` lines in `cdd/specs/*/spec.md` and in the change's proposal/delta
  via grep; cross-checked every touched file against the three capabilities' globs.
- Verified the chain both directions: all 5 Done-When criteria have ≥1 requirement and ≥1
  task (traceability table rows map 1→3.2/3.5, 2→3.3/3.6, 3→3.3/3.6, 4→3.4/3.8, 5→3.2/3.7);
  no orphan requirement or implementation task (3.2–3.8 all trace to a criterion).
- Verified the MODIFIED requirement restates all 5 living scenarios (1 modified + 4
  unchanged) and adds 1 new scenario ("Rule 2a states the two decisions directories") — no
  scenario silently dropped; ADDED requirements do not duplicate living requirements; no
  REMOVED block.
- Verified design-gate T3/T4 YES answers carry short designs and RED pins; 7 implementation
  subtasks (< 8) so no split decision is required.
- Inspected tests/acceptance/review-wiring.test.js and single-source-law.test.js to confirm
  the pin-misalignment finding (RW1 asserts only skill/path substrings; SSL1 pins the exact
  trigger strings at single-source-law.test.js:73,80).
- No blockers found; the two `should` findings are advisory and do not stop the loop.
