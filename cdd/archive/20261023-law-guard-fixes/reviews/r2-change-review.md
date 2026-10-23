# R2 change review — law-guard-fixes

- Reviewer form: cold sub-agent (fresh session, briefed only from the paths named in brief-r2-instantiated.md)
- Reviewer model family: opencode-zen/deepseek-v4-pro (from `PI_PROVIDER=opencode-zen`, `PI_MODEL=deepseek-v4-pro`)
- Author model family: zai/glm-5.3 — families differ (opencode-zen vs zai)
- Repo state: branch `law-guard-fixes`, commit 26f3467, change artifacts uncommitted in the working tree
- Review point: R2 (package), at draft-green
- Scope: cross-artifact coherence, coverage, sponsorship, delta↔living-spec fit, verify-by realism. Advisory findings only — no fixes, no verdicts.

## Findings

### F1 — should — design.md Boundaries covers 3 of 6 diagram boxes

Rule 2c requires "Boundaries hold 1 line per diagram box: what it is, what it must not know about." The design.md diagram draws six boxes — `Dev` (Person), `PC` (Component: pre-commit door), `CM` (Component: commit-msg door), `Ops` (Person), `FS` (Component: door 3 full scan), and `Git` (System) — but the Boundaries section holds only three lines, one per door (pre-commit, commit-msg, full scan). The two Person boxes and the System box carry no boundary line, so the section does not satisfy the literal "1 line per diagram box" clause. The substantive door boundaries are present and correct; the gap is the three non-door boxes.

Evidence: `cdd/changes/law-guard-fixes/design.md` (Diagram section, lines ~13–20; Boundaries section, lines ~22–25) against `cdd/rules.md` rule 2c.

Disposition: fixed 2026-10-23 — Boundaries rewritten with one line per box: Dev, PC, CM, Ops, FS, Git (design.md Boundaries section). Draft validate re-run green after the amendment.

### F2 — note — two Done-When lines are process-level and map to Close tasks, not delta requirements

The charter's coverage check flags "a Done-When with no requirement." Two of the four Done-When lines — "cdd backlog op marks PF-17 and PF-18 done, naming this change" and "this change's own archive pair-commit lands through the wired pre-commit door with no --no-verify" — map to Close tasks 4.6 and 4.5 respectively (per the Done When Traceability table) but to no delta requirement. This is the expected shape for process-level criteria (backlog bookkeeping and the dogfood proof), and the traceability table maps them correctly to tasks, so the coverage trace is intact at the task level; the requirement-free trace for these two is noted for completeness.

Evidence: `cdd/changes/law-guard-fixes/proposal.md` (Done-When lines 3 and 4) and `cdd/changes/law-guard-fixes/tasks.md` (Done When Traceability table, rows 3 and 4).

Disposition: accepted 2026-10-23, no change — the two process-level Done-Whens (backlog bookkeeping, dogfood archive proof) are Close-phase criteria by nature; the traceability table carries them to tasks 4.6/4.5, and the delta requirements cover the product surfaces. Recorded for the archive record.

## Checks that passed (no finding)

- Coverage: both delta requirements map to implementation tasks (requirement 1 → 3.2/3.3; requirement 2 → 3.4/3.5); all four Done-When lines map to tasks via the traceability table.
- Sponsorship: no orphan tasks and no orphan requirements; 3.6 is the standard whole-corpus sweep.
- Same-change coherence: proposal, delta, tasks, and design.md describe one change (rule-3 text alignment + topology-L2 gate); the design gate record (T4 YES → design.md at Component level) matches the design.md Level claim and the stated risk (check-ownership split among the guard's three entry modes inside one script).
- MODIFIED/REMOVED legality: delta is ADDED-only; neither ADDED requirement duplicates a living requirement by name or content (the single-sourcing requirement already in the living spec governs the loop-law facts, not the rule-3 contract text).
- Verify-by realism: every scenario pin names a real acceptance path — `tests/acceptance/law-done-when.test.js` and `tests/acceptance/guard-pair-commit.test.js` are created by tasks 3.2/3.4 (draft-green normal); `tests/acceptance/single-source-law.test.js` and `tests/acceptance/gherkin-guard-placeholder.test.js` exist on disk. `validateProposal` enforces the 1..5 Done-When count (`lib/validate.mjs`), matching the proposal's "no door behavior changes" claim; the topology L2 branch currently runs in the pre-commit path (`scripts/spec-drift.mjs`, the `else` branch of the L2 staleness block), matching the PF-18 diagnosis.
