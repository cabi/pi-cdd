# R3 spec-axis code review — guard-pure-checks

## Reviewer form

- **Form:** cold sub-agent session (fresh session, briefed only from the paths named in `reviews/brief-r3-spec.md`, read from disk at the pinned state; not the author's session).
- **Reviewer model family:** `opencode-zen` / `deepseek-v4-pro` (DeepSeek lineage), read from `PI_PROVIDER` / `PI_MODEL` at review time.
- **Author model family (per brief):** `zai` / `glm-5.3` (GLM lineage).
- **Family separation:** the two families differ (different provider and model lineage), so the rule 2b family requirement is satisfied and the review proceeds.

## Repository state

- Working tree uncommitted on branch `guard-pure-checks`; HEAD `3f484a5` (main tip, the branch point), matching the brief's pinned state.
- Tracked diff `git diff 3f484a5` touches three files: `scripts/spec-drift.mjs`, `cdd/scripts/spec-drift.mjs`, and `cdd/backlog.md` (see finding 1). Untracked: `cdd/changes/guard-pure-checks/` and `tests/acceptance/guard-pure-checks.test.js`.

## Scope

Spec axis only, per the brief: the diff and change artifacts against the change's own spec claims. Coding-convention conformance is out of scope (Standards axis). Advisory findings only — no verdicts, no fixes.

## Checklist results

1. **Done-When → requirement → task → pin chain** — intact. Done-When 1 (the new pin exits 0) is carried by the single ADDED requirement "The drift guard gathers once, then checks purely" (scenarios GPC1/GPC2) → tasks 3.2/3.3/3.4 → pin `tests/acceptance/guard-pure-checks.test.js`. Done-When 2 (byte-identity) and Done-When 3/4 (whole-change gates) map to no requirement — disposed `won't-fix:` at R2 with reasons recorded (one-shot migration proof riding the tick; standard completion gates), not re-litigated here. No unsponsored implementation, no promised-and-missing requirement.
2. **Delta grammar** — correct. One gherkin fence, one `When` and one `Then` per scenario, both scenarios end with `# Verified by: tests/acceptance/guard-pure-checks.test.js` (a real file). The ADDED requirement name does not duplicate any of the 40+ living requirements in `cdd/specs/gherkin/spec.md`; the Feature heading equals the requirement heading.
3. **Scenario truth vs implementation** — both scenarios pin what they claim. GPC1 slices the source between the `===== pure checks —` and `===== report —` markers, scans five token regexes, and asserts all 11 law functions (`checkA0`…`checkO`) are defined inside the region — non-vacuous. GPC2 builds the facts object in memory (no disk load), `chdir`s to a repo-less temp dir, imports the real `scripts/spec-drift.mjs`, and calls the real exported `checkL1`; the import runs nothing (the `runningAsScript` guard at `scripts/spec-drift.mjs:790-792`). `node tests/acceptance/guard-pure-checks.test.js` exits 0 (GPC1 + GPC2 ok).
4. **Tick honesty** — every `[x]` tick cites a command + output excerpt that reproduces. Verified live: `node scripts/spec-drift.mjs` → `spec-drift: clean (5 specs, 36 acceptance test files, full scan)` exit 0; `node tests/smoke.mjs` → `37/37 passed` exit 0; `cdd validate` strict → PASS; all five `cdd/scripts/*.mjs` copies byte-identical to `scripts/` sources. The 3.7 migration table's "zero deletions" conclusion is honest: the orphan emission (`orphan acceptance test … pinned by no spec`), the `[M]` emission, and `hooks:false` appear in no acceptance suite (grep over `tests/acceptance/` returns nothing), so S14/S16/S28 are genuinely sole real-door pins; every retained pin named in the table (W1, P1–P4, GPC1–5, GGC1–6, D9) exists in its named suite.
5. **Traceability table** — complete and consistent. All four Done-When criteria map to tasks, and every implementation task 3.2–3.8 is named by at least one row (3.6 now rides the "npm test green" row, per the R2 fix).

## Findings

| # | Severity | Finding | Evidence | Disposition |
|---|---|---|---|---|
| 1 | note | The tracked diff includes `cdd/backlog.md` (one line added: PF-29, the cold-review floor-model invocation recipe) beyond the two source files the brief expected ("expect exactly `scripts/spec-drift.mjs` + `cdd/scripts/spec-drift.mjs`"). This is correctly unclaimed — the backlog is living triage data that no door checks (rule 13; `cdd/specs/gherkin/spec.md` "The backlog triage skill is bundled"), so it is not unsponsored implementation — but the brief's "exactly two files" expectation is off by one, and the PF-29 entry rides the same commit as the guard restructure. | `git diff 3f484a5 -- cdd/backlog.md`; `cdd/backlog.md:35` | open |
| 2 | note | The delta (and proposal) `Code:` line names `tests/smoke.mjs`, but the implementation made zero changes to it: task 3.7's audit concluded "no redundant per-scenario sandbox builder exists … so zero conversions", and `tests/smoke.mjs` is absent from the diff. The R2 fix (finding 1) added `tests/smoke.mjs` to the delta `Code:` line on the premise that task 3.7 would modify it; that premise did not hold, so the claim is now vestigial — the proposal's "What Changes" bullet about converting smoke.mjs sandbox builders was a no-op in practice. Harmless (the guard is clean; `tests/smoke.mjs` is already claimed by the living gherkin spec), but the `Code:` line over-claims surface the change does not touch. | `cdd/changes/guard-pure-checks/specs/gherkin/spec.md:25`; `cdd/changes/guard-pure-checks/tasks.md` (task 3.7 tick); `git diff 3f484a5 --stat` (no `tests/smoke.mjs`) | open |
| 3 | note | GPC1's I/O-seam scan is a real, non-vacuous proxy, but its token regexes (`/\bfs\./`, `/\bexecFileSync\b/`, `/\bgit\(/`, `/\bconsole\./`, `/\bprocess\.exit\b/`) match only the current import style. Alternative I/O vectors — named imports from `node:fs/promises`, `process.stdout.write`/`process.stderr.write`, or `spawn`/`exec`/`execSync` from `node:child_process` — would slip past the scan. The current pure-check region (lines 292–751) is genuinely clean of all of these, so this is a robustness observation about the pin's future strength, not a current defect. | `tests/acceptance/guard-pure-checks.test.js` (GPC1 regex list); `scripts/spec-drift.mjs:292-751` | open |

No blocker or should findings. The spec-axis chain (Done-When → requirement → task → pin), delta grammar, scenario truth, tick honesty, and traceability all hold; the three notes above are coherence/robustness observations for the author to dispose.

## Author dispositions (post-review, rule 2a)

- Finding 1 (note — cdd/backlog.md beyond the brief's two-file expectation): **won't-fix** — the ride is intentional and lawful (rule 13; both reviewers confirmed the backlog is triage data no door checks); the brief's "exactly two files" line was written before PF-29 occurred mid-M4, and the backlog line lands with this change's feature commit.
- Finding 2 (note — vestigial tests/smoke.mjs claim on the Code: line): **fixed** — trimmed from BOTH the delta Code: line (cdd/changes/guard-pure-checks/specs/gherkin/spec.md:25) and the proposal Code: line. The R2 inclusion was plan-conditional (task 3.7 was expected to convert some sandbox builders); the audit concluded zero conversions, so the claim no longer described touched surface. The proposal's "What Changes" bullet stays: it states the conversion rule, under which zero builders qualified.
- Finding 3 (note — GPC1 regexes match only the current import style): **fixed** — the scan list now also covers `/node:fs/`, `/node:child_process/`, `\bexecSync\b`, `\bspawnSync\b`, `\bspawn\b`, and `\bprocess\.(?:exit|stdout|stderr)\b`; the pure region remains clean of all ten patterns, pin 2/2 exit 0.
- Post-disposition re-verification: `node tests/acceptance/guard-pure-checks.test.js` → 2 passed, 0 failed (exit 0); `npm test` → tests 36 / pass 36 / fail 0 exit 0; validate strict → errors [] warnings []; guard clean line exit 0.
