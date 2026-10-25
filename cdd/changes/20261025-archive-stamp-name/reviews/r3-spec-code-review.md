# R3 spec-axis code review — 20261025-archive-stamp-name
- reviewer: gpt-6-luna (family openai)
- author of record: zai/glm-5.3 (family zai)
- reviewed at: `5667775c2efb86bf42b6ed9b76b4436f134caadb` + dirty state observed: `M lib/adr-ops.mjs`, `M lib/store.mjs`, `M tests/acceptance/adr-reconfirm.test.js`, `M tests/smoke.mjs`, `?? cdd/changes/20261025-archive-stamp-name/`, `?? tests/acceptance/archive-folder-name.test.js`
- scope: `git diff HEAD -- lib tests` + the untracked `tests/acceptance/archive-folder-name.test.js` (spec axis only)

## Findings

No spec-axis blockers, shoulds, or notes. The implementation matches the proposal and both deltas without unsponsored behavior.

## Scenario coverage and pin honesty

- Gherkin delta, `cdd/changes/20261025-archive-stamp-name/specs/gherkin/spec.md`: all four scenarios have real coverage in `tests/acceptance/archive-folder-name.test.js`. AF1 asserts the dated prefix is stripped once; AF2 asserts bare-name append and returned path; AF3 asserts one date prefix and that the returned path exists; AF4 opens the stamped `metrics.md` through `archivedTo`. AF2 and AF4 were green before the implementation, as recorded in `reviews/red-records.md`, but remain genuine regression pins for their stated bare-append and metrics-locatability outcomes. AF1 and AF3 exercise the newly changed dated-name compose.
- ADR delta, `cdd/changes/20261025-archive-stamp-name/specs/adr/spec.md`: the 15 carried-over scenarios remain pinned by RC1–RC15 in `tests/acceptance/adr-reconfirm.test.js`; RC14 covers both multiple-open-change refusal and explicit narrowing. RC16 exercises dated-query resolution and asserts that the reconfirmation records the queried dated name. RC17 asserts refusal and unchanged ADR contents for a name unmatched verbatim or after one date strip. Although RC17 was green before implementation (per `reviews/red-records.md`), it genuinely guards the refusal behavior against normalization accidentally admitting an unknown name.
- The new S39 in `tests/smoke.mjs` exercises same-day dated-name archiving, exact single-date folder naming, `archivedTo` agreement, and `listArchived` recovery. The diff leaves the existing S10 block untouched; `git diff HEAD -- tests/smoke.mjs` contains only the appended S39 fixture.

## Scope and Done-When checks

- The changes to `lib/store.mjs` and `lib/adr-ops.mjs` are the promised shared one-date-strip helper, archive target/reported-path composition, and dated query matching. `lib/status.mjs` and `lib/metrics.mjs` are untouched; `listArchived`'s split is unchanged. No retro-rename of the five doubled archive folders appears in the diff.
- The first three proposal Done-When criteria are exercised by the acceptance and smoke pins above. The fourth criterion is explicitly Close-time: the change has not yet been archived in the observed dirty state. Its plan is real—the helper strips the leading date from this change's name, and S39's same-day fixture exercises that self-application shape. The Close-time folder itself is not claimed as already verified.
- Every `Verified by:` path in both deltas exists and is run by `npm test`: `tests/acceptance/archive-folder-name.test.js` and `tests/acceptance/adr-reconfirm.test.js`.

## Verification

- `node tests/acceptance/archive-folder-name.test.js` — 4 passed, 0 failed.
- `node tests/acceptance/adr-reconfirm.test.js` — 17 passed, 0 failed.
- `npm test` — exit 0; smoke 39/39, tools 21 passed, acceptance sweep passed (including both named acceptance files).
- The sandbox tests emit `fatal: not a git repository` stderr while exercising non-git stores; their results are successful, consistent with the red-records explanation.

VERDICT: PROCEED
