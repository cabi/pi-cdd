# R3 spec-axis code review — fix-l3-implementation-count

**Reviewer model:** `opencode-go/deepseek-v4.1-flash`
**Independence (rule 2b):** cold sub-agent session, briefed from disk only; author family zai vs reviewer family deepseek — rule 2b holds.
**Status:** COMPLETE — 0 `blocker`, 1 `should`, 3 `note`; every finding is advisory and disposition `open`.

## Reviewed state

- Repository `/home/carsten/Projects/pi-extensions/pi-cdd`; base `91fe44666ba5a71fce950489195ed8cd81114167`, head `07016802d231a36ee2608098d9c68376e0421ebe` (`fix(guard): L3 task-scale law counts implementation subtasks only`). Confirmed by `git log`/`git diff 91fe446...HEAD`.
- Range is one commit, 8 changed paths (`git diff --name-status`): `GLOSSARY.md`, `cdd/changes/fix-l3-implementation-count/{proposal.md,tasks.md,specs/gherkin/spec.md,reviews/r2-change-review.md}`, `scripts/spec-drift.mjs`, `cdd/scripts/spec-drift.mjs`, `tests/acceptance/guard-l3-scope.test.js`.
- Working tree clean, staged/unstaged empty, untracked empty (`git status --porcelain -uall`) at review time; this findings file is the only addition.
- Spec source: the change folder (proposal Done-When, delta, tasks) plus living `cdd/specs/gherkin/spec.md`, `cdd/rules.md`, `lib/validate.mjs`, `lib/store.mjs`, `lib/templates.mjs`, `scripts/grammar-law.mjs`.

## Findings

### R3S-F001 — `should` — the guard's clean-summary count is behaviour no requirement, criterion, or task sponsors

- **Disposition:** open
- **Evidence status:** Trace-backed
- **Evidence:** delta requirement and all four scenarios are about the law's counting and the issue line only — `cdd/changes/fix-l3-implementation-count/specs/gherkin/spec.md:5` ("The drift guard's task-scale law MUST count only a living change's implementation subtasks … never context, design, or close tasks"), scenarios at `:10-32`. The proposal enumerates exactly three behavioural items — `proposal.md:9-12`, none about the clean line. Task 3.3 names only section selection, issue line, and header comment — `tasks.md:71`. The diff nevertheless adds `implSubtasksPhrase` (`scripts/spec-drift.mjs:671-675`) and injects it into the store-wide clean line (`scripts/spec-drift.mjs:784`); `cdd/scripts/spec-drift.mjs:784` carries the same copy.
- **Trace:** the only consumer is the new pin's S4, which reads the summary text (`tests/acceptance/guard-l3-scope.test.js:145-148`) instead of the law's own count, so the pin now depends on unsponsored output. Every adopting store's clean line changes shape (a fourth field, `N implementation subtasks`, `0` when no change is open).
- **Expected:** behaviour in the diff is traceable to a requirement, Done-When criterion, or task (anti-scope-creep clause, `tasks.md:57-58`).
- **Actual:** a new guard output element with no sponsorship, and a pin coupled to it.
- **Impact:** bounded — no door verdict changes and every scenario still holds — but the output contract of a shipped door moved without a spec or task line to review it against.
- **Smallest safe fix:** drop the summary field and observe the count through the law itself: a fixture with 13 implementation subtasks plus 4 non-implementation items must print "13 implementation subtasks (> 12)" while the validator also counts 13 — agreement proven from sponsored outputs. Otherwise sponsor it: add the clean-line clause to the requirement (as a MODIFIED delta line is not needed if the requirement text names it) and to `proposal.md:9-12`/task 3.3.

### R3S-F002 — `note` — the summary count is not scoped like the law it reports

- **Disposition:** open
- **Evidence status:** Trace-backed
- **Evidence:** `checkL3` skips changes whose tasks file is not staged (`scripts/spec-drift.mjs:680`: `if (facts.staged && !facts.stagedSet.has(rel)) continue;`), while `implSubtasksPhrase` sums every entry of `facts.tasksTexts` unconditionally (`scripts/spec-drift.mjs:671-675`).
- **Trace:** in a staged scan the clean line reports a subtask count including task files the law did not evaluate; a store with no open change prints `0 implementation subtasks`.
- **Impact:** informational only; a reader comparing the staged line with L3's silence can be misled about what was counted.
- **Smallest safe fix:** if F001 is kept, filter the phrase with the same `staged && !stagedSet.has(rel)` guard.

### R3S-F003 — `note` — scenario 4's pin measures the report helper, not `checkL3`'s count

- **Disposition:** open
- **Evidence status:** Trace-backed
- **Evidence:** `cdd/changes/fix-l3-implementation-count/specs/gherkin/spec.md:30-31` ("When the guard's task-scale law and the strict validator each count that tasks file's implementation subtasks / Then both counts equal exactly 9"); the pin reads the summary (`tests/acceptance/guard-l3-scope.test.js:145-158`).
- **Trace:** both paths call `implSubtaskCount`, so a `checkL3` regression that keeps the helper (for example counting only ticked boxes) leaves S4 green; S1 (`:101-107`) and S2 (`:112-124`) are the real backstops, and they do catch it.
- **Impact:** low — the scenario is covered by the pin set, not by its own pin alone.
- **Smallest safe fix:** assert the scoped count from an L3 issue line (13 impl + 4 non-impl) in S4 as well.

### R3S-F004 — `note` — the new "tracked task" glossary entry describes the traceability table wrongly

- **Disposition:** open
- **Evidence status:** Trace-backed
- **Evidence:** `GLOSSARY.md:42` (new entry): "any checkbox item (`- [ ]` / `- [x]`) under a tasks file's four skeleton sections; what the Done-When Traceability table maps." The table's rows map a criterion to task ids (`tasks.md` template guidance; `lib/validate.mjs` only requires the heading), not tracked tasks as such.
- **Impact:** low; DW5's requirement (definitions present, gate wording fixed) is met, but the added definition carries one inaccurate clause.
- **Smallest safe fix:** replace the clause with "the ids the Done-When Traceability rows name".

## Coverage checks that found nothing

- **Requirement → diff:** the law counts `sections.filter((s) => s.num === 3)` (`scripts/spec-drift.mjs:666-667`), which is exactly `parseTasks(text).implementation.items` (`lib/store.mjs:204-217`, `lib/validate.mjs:191` item counting) — the requirement's "the section the strict validator counts" holds for every skeleton-valid file.
- **Scenario → pin, one by one:** S1 fails pre-fix (13 tracked > 12 fires L3), green post-fix; S2 fails on both the old count and the old "tracked tasks" message; S3 fails if the `split-considered:` exemption regresses (it already passed pre-fix — pins the exemption, not the narrowing); S4 fails if the guard's count reverts to the sum (summary would read 13). No pin would stay green if its scenario regressed.
- **Door realism:** the test copies door 3 from the source tree (`lib.initStore(root, REPO, {})` → `writeDoorScripts` at `lib/templates.mjs:260-267` copies `REPO/scripts/*`), so it exercises `scripts/spec-drift.mjs`, matching task 3.3's claim; door 1 is the real `lib/validate.mjs` (`:18`). Byte-identity of the store copy holds (`cmp` clean), satisfying DW4.
- **Non-Goals:** no threshold constant, door-1 counter, or spec-size signal changed; `SPLIT_SIGNAL`/`TASK_LIMIT` untouched (`scripts/grammar-law.mjs:31,34`).
- **GLOSSARY.md scope:** touched by the commit, no capability claims it; sponsored by DW5 and recorded as task-only in the R2 dispositions (`reviews/r2-change-review.md`, DW5 row) — not creep.
- **Structural laws:** the new helpers sit in the pure-check region and hold no fs/git/console access (guard-pure-checks GPC1); the `// Checks:` tag set is unchanged (`scripts/spec-drift.mjs:18`).

## Verification commands consumed

Read-only only: `git log/diff/status/show`, `cmp scripts/spec-drift.mjs cdd/scripts/spec-drift.mjs` (identical), greps over specs, tests, and lib. No build, test, guard, or formatter run; the tick claims of tasks 3.2–3.5 were not re-executed (rule: advisory review, gate authority stays with the deterministic doors).

## Author dispositions (2026-11-11)

- R3S-F001 `should`: fixed — dropped, not sponsored: `implSubtasksPhrase` is deleted and S4 proves agreement from the law's own outputs. A fixture with 13 implementation subtasks plus 4 non-implementation items prints "13 implementation subtasks (> 12)" in the L3 issue line while the strict validator's split-signal warning counts 13. Delta S4, proposal Done-When 3, and the traceability row amended 9→13 to match the observable.
- R3S-F002 `note`: fixed — subsumed by the deletion in R3S-F001.
- R3S-F003 `note`: fixed — S4 now reads `checkL3`'s own count from the L3 issue line; the report helper is gone.
- R3S-F004 `note`: fixed — "tracked task" now reads "…; what the task ids in its Done-When Traceability rows name."
