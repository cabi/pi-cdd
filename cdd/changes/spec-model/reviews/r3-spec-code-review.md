# R3 spec-axis code review — spec-model

## Reviewer form

- **Form:** cold sub-agent session (fresh session, briefed only from `cdd/changes/spec-model/reviews/brief-r3-spec.md` and the paths it names; not the author's session).
- **Reviewer model family:** `opencode-zen` / `deepseek-v4-pro` (from `PI_PROVIDER` / `PI_MODEL`).
- **Author model family (per brief):** `zai` / `glm-5.3`.
- **Family separation:** established — the two families differ (different provider and lineage). Cold-review requirement (rule 2b) satisfied.
- **Repository state:** working tree uncommitted on branch `spec-model`, HEAD `bc4b867`; tracked modifications to `scripts/grammar-law.mjs`, `scripts/spec-drift.mjs`, `scripts/spec-extract.mjs`, `lib/store.mjs`, and the `cdd/scripts/*` door copies; untracked `cdd/changes/spec-model/` and `tests/acceptance/spec-model.test.js`.

## Scope

Spec-axis code review of the implementation diff (`git diff bc4b867` + untracked `tests/acceptance/spec-model.test.js`) measured against the change's own artifacts (proposal, spec delta, tasks, R1/R2 dispositions). Advisory findings only — no verdicts, no fixes.

## Findings

| # | Severity | Disposition | Finding | Evidence |
|---|---|---|---|---|
| 1 | note | fixed | The import cycle `scripts/grammar-law.mjs` ↔ `scripts/adr-index.mjs` — the change's one new import edge, which the design gate itself names as "closing a module cycle both directions already half-travel" — is verified only by a one-shot import-order probe in task 3.3's tick, not by a durable acceptance scenario. `grammar-law.mjs` now imports `globToRe` from `adr-index.mjs` (`scripts/grammar-law.mjs:15`), while `adr-index.mjs` already imports `ADR_STATUSES`/`parseDecisionFrontmatter` from `grammar-law.mjs` (`scripts/adr-index.mjs:15`). The cycle resolves today because neither module reads the other's binding at top-level evaluation time, but that property is load-order-sensitive: a future change that makes either side consume the other's export during module initialization would break one of the two import orders, and no acceptance test would catch it. The single-source scan (SM2) checks for re-statement, not for cycle safety; the import-order probe lives only in the 3.3 tick evidence and is not re-run by `tests/acceptance/spec-model.test.js`. | `scripts/grammar-law.mjs:15`; `scripts/adr-index.mjs:15`; `cdd/changes/spec-model/tasks.md` (3.3 tick: "import-order probe green both ways"); `cdd/changes/spec-model/proposal.md` (T2 gate record: "closing a module cycle both directions already half-travel") |

## Checks that passed (no finding)

- **Done-When → requirement → task → pin chain:** the single delta requirement ("The spec model is the single parse") is sponsored by Done-When lines 38–39 and maps to tasks 3.2–3.6; every scenario has a task that implements it. The two Done-When lines without a dedicated scenario (byte-identity proof, store-copy byte-identity) were already raised as R2 findings 1 and 2 and disposed `won't-fix` with recorded reasons — no new evidence changes those dispositions.
- **Delta grammar:** `cdd validate` strict mode passes (0 errors, 0 warnings). Every scenario ends with `# Verified by: tests/acceptance/spec-model.test.js`, which resolves to a real file; exactly one gherkin fence per requirement, one `When`, ≥1 `Then`; the delta is ADDED-only (no MODIFIED/REMOVED), and the ADDED requirement does not duplicate a living requirement.
- **Scenario truth vs implementation:** `node tests/acceptance/spec-model.test.js` exits 0 (4 ok, 0 FAIL). SM1/SM2 invoke the real door by importing `scripts/grammar-law.mjs` and `lib/store.mjs`; SM3/SM4 invoke the real extractor as a child process in a sandbox repo. The two deliberate behavior changes are each pinned by a scenario that fails against the old behavior: SM3 (fence-masked pin scan — the lookalike inside a documentation fence pins nothing) and SM4 (shared glob matcher — a star glob claims the files it names), both recorded red in `RED-log.txt` (exit 1, 0 ok, 4 FAIL, pre-implementation).
- **Tick honesty:** every `[x]` tick in tasks.md cites a command + output excerpt that could have produced it. The two rule-11a amendments are recorded as the law requires: 3.2 (false-tick correction — the first RED citation named a run that had not been executed; un-ticked, the file authored for real, re-verified) and 3.7 (proof re-execution after a comment-law rewording, with the final numbers from the second pass).
- **Traceability table:** tasks.md's Done-When table is complete and consistent with the delta — all four proposal criteria map to task ids, and no criterion is orphaned.


## Author dispositions (post-review, rule 2a)

- Finding 1 (note — import-order safety only in the 3.3 tick, not durable): **fixed** — SM1 in `tests/acceptance/spec-model.test.js` now spawns `node --input-type=module -e` children importing `scripts/grammar-law.mjs` and `scripts/adr-index.mjs` in both orders and asserts each loads clean, so both entry orders are pinned acceptance, not one-shot tick evidence. Post-disposition: `node tests/acceptance/spec-model.test.js` → `4 ok, 0 FAIL` exit 0.
