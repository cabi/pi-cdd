# fix-l3-implementation-count

## Why

The drift guard's L3 scale law counts every tracked task in a change's tasks file, while rule 6, the law constants' own doc comments (`scripts/grammar-law.mjs`), and door 1's validator scope the 8/12 thresholds to implementation subtasks. The scaffold alone puts 7 non-implementation items on the file — 1 context, 1 design, 5 close — plus the mandated change-review subtask inside section 3, so a change with 8 work subtasks reaches 16 counted items and door 2 rejects what door 1 accepts; the reporting project observed the same failure as 8 implementation subtasks counted as 15 tracked tasks on their file. Under the narrowed law the section-3 review subtask still counts, so 8 work subtasks read as 9 — above the 8 split signal, far under the 12 limit. The acceptance fixture trims this to 9 implementation subtasks plus 4 non-implementation tracked tasks (13 tracked): over 12 pre-fix, 9 counted post-fix — the discrimination is identical on any file shape.

## What Changes

- `scripts/spec-drift.mjs` checkL3 counts only the tracked checkbox items under `## 3. Implementation` — the same section door 1's validator counts — instead of summing all four skeleton sections.
- The L3 issue line and its header comment say "implementation subtasks", retiring "tracked tasks" from the guard.
- `GLOSSARY.md` pins the two terms (implementation subtask, tracked task) and corrects the design-gate entry, which says the gate "emits the split signal at more than 8 tasks" instead of "8 implementation subtasks".
- New acceptance pin `tests/acceptance/guard-l3-scope.test.js`: scaffold overhead does not reach the limit; 13 implementation subtasks fail with the scoped message; a split-considered line passes; the guard's count equals the strict validator's count on the same file.

## Solutions Considered

- gherkin: `splitTaskSections` in `scripts/grammar-law.mjs` (read) — already returns the named skeleton sections; adopted: the guard selects section 3 instead of summing, no new parsing.
- gherkin: `lib/validate.mjs` `validateTasks` (read) — door 1's counter over `t.implementation.items`; adopted as the shared semantics both doors count, restoring same-verdict.
- gherkin: store-configurable thresholds (`cdd/config.json`, defaults 8/12) — rejected: no adopting store has demonstrated chronic need for different numbers; `split-considered:` is the designed per-change relief valve; the fixed numbers are method vocabulary across rules.md, templates, instructions, and the glossary.
- gherkin: keep the total count, reword rule 6 to all tracked tasks — rejected: L3 would become a different law from strict validation (two doors, two limits), and the law constants' doc comments already promise implementation subtasks.

## Non-Goals

- No configurable thresholds — `SPLIT_SIGNAL` 8 and `TASK_LIMIT` 12 stay constants in `scripts/grammar-law.mjs` (smoke pins S9/S25 untouched); revisit only on demonstrated chronic need.
- No change to door 1's counting, thresholds, or messages (already correct and pinned by smoke S9/S25).
- No change to the spec-size signals (`SPEC_REQ_SIGNAL`/`SCENARIO_SIGNAL`) or any other guard law.
- The staged-index workaround mentioned in the originating report is a different finding, if real; not addressed here.

## Decision alignment

- **ADR-0001 (zero-dependency):** a pure-JS narrowing of one check; no dependency enters.
- **ADR-0006:** fences and pins untouched.
- **ADR-0007 (the law behind every door):** L3 aligns with the validator's counter through the law module's own `splitTaskSections`; no grammar restated, `LAW_VERSION` stays 2; store copies refresh via `cdd init`.
- **ADR-0012 (comments are shape-only):** the rewritten L3 comment describes the counted section only — no decision ids or finding ids.
- **ADR-0013 (one claim map):** L3 reads no claims; untouched.

## Capabilities

- gherkin: `cdd/changes/fix-l3-implementation-count/specs/gherkin/spec.md` — one ADDED requirement (L3 counts implementation subtasks). gherkin holds 53 requirements, over every Tier A threshold; the delta carries a split-considered line deferring to the PF-6 store-ops split, whose guard half will carry this requirement.

Done-When: a store holding a living change with 9 implementation subtasks and 4 non-implementation tracked tasks (13 tracked, no split-considered line) passes the drift guard with no L3 issue
Done-When: a store holding a living change with 13 implementation subtasks and no split-considered line fails the guard with exactly 1 L3 issue naming "13 implementation subtasks (> 12)", and passes once a split-considered line is recorded
Done-When: on the same tasks file the guard's task-scale count and the strict validator's implementation count both equal 13
Done-When: `cdd/scripts/spec-drift.mjs` is byte-identical to `scripts/spec-drift.mjs`
Done-When: `GLOSSARY.md` defines implementation subtask and tracked task, and its design-gate entry names 8 implementation subtasks
Code: scripts/spec-drift.mjs, cdd/scripts/**, tests/acceptance/guard-l3-scope.test.js
