# R3 change review — green-start-warning

Review point R3 (Close, before archive). Two cold sub-agent reviews run in
parallel per skill `cdd-code-review`, one per axis; briefs handed over as
paths from disk with the read-time state pinned below. Reviewer independence
(rule 2b): both reviewers are fresh standalone sessions from families other
than the author's; no fallback re-read was needed.

- Standards axis: subagent `green-start-r3-standards2` — opencode-zen/deepseek-v4-pro (cold, fresh session). Retry ladder: nemotron-3-ultra-free and minimax-m3.1-flash-free both 429-limited at spawn time (FreeUsageLimitError), resolved by moving to the paid rung; ladder recorded here per rule 2b.
- Spec axis: subagent `green-start-r3-spec3` — zai/glm-5.3-flash (cold, fresh session). Same 429 ladder reason.
- Read-time state pinned in both briefs: branch green-start, base = main @ dbe7f49, working tree uncommitted; all implementation tasks ticked; npm test green (12 pass); guard clean (5 specs, 12 acceptance tests, full scan).

## Standards-axis findings (3 hard, 4 smells) and dispositions

| # | Finding (standard cited) | Disposition |
|---|---|---|
| 1 | HARD — rule 10 (`cdd/rules.md`): "No spec markers in source code"; the three new acceptance files opened with `// Pinned by cdd/changes/green-start-warning/specs/…` comments; no other test carries such a marker. | FIXED — comments removed from all three files. Traceability stays in the cdd/ tree (Code: globs + Verified-by pins). |
| 2 | HARD — ADR-0007 (one law behind every door): the placeholder token family was defined twice — `PLACEHOLDER_PIN` in `scripts/law.mjs:82` and an inline `/<scenario>/…/<name>/` check in `lib/validate.mjs:70`. | FIXED — `lib/validate.mjs` now imports `PLACEHOLDER_PIN` from `../scripts/law.mjs` and the inline regex is deleted; behavior identical (alternation ≡ the two tests). |
| 3 | HARD — ADR-0003 (plain-markdown store): `lib/store.mjs` header still claimed "Plain fs operations only" while `preExistingRed` spawns the guard via `execFileSync`. | FIXED (comment honesty) — header now states the one non-fs act: a read-only guard subprocess that reports and never writes. The store format itself is unchanged (plain markdown), so ADR-0003's ADR+migration trigger does not fire; the seam (`createChange`) was the design-gate decision, R2-hardened, director-approved. |
| 4 | SMELL (shotgun/coupling) — `l.trim().startsWith("[")` restated the guard's issue-line shape in a second module. | FIXED — `ISSUE_LINE` exported from `scripts/law.mjs` (the single law surface; `lib/store.mjs` imports it). No LAW_VERSION bump: recognition refactor, grammar semantics unchanged (LAW_VERSION is a human signal per standing disposition). |
| 5 | SMELL (duplicated code) — the three acceptance files each carry their own sandbox fixture and `check`/`assert` helpers. | DECLINED — the repo idiom is self-contained acceptance files (no shared helper module exists under `tests/`; all acceptance files are self-contained scripts); consolidation would be a drive-by refactor outside this change's scope. |
| 6 | SMELL (primitive obsession) — `preexistingRed: string[]` encodes three entry kinds as undifferentiated strings. | DECLINED — the delta pins verbatim string entries (issue lines incl. indent); both consumers render text; a discriminated type would be speculative generality with no current user. |
| 7 | SMELL (divergent change) — `store.mjs` gained a second responsibility (running/parsing the guard verdict) beside fs scaffolding. | DECLINED — `createChange` is the single seam by design-gate decision (R2 blocker disposed there; milestone-2 approval); moving the check to `index.ts` would duplicate the merge across both surfaces. Documented by the finding-3 header amendment. |

## Spec-axis findings (0 blockers, 2 advisory) and dispositions

| # | Finding | Disposition |
|---|---|---|
| S1 | ADVISORY — `/cdd-new` with a UI notified only a count ("N findings; see the change summary"); the findings themselves appeared nowhere in UI mode, while the scenario says the command "renders the same block". | FIXED — the UI notify now carries the full block (findings verbatim + "this change did not cause it" + fix-or-accept hint), matching `redBlock`; E3 extended to pin the `hasUI: true` path (asserts "did not cause" + the finding itself). |
| S2 | MINOR — unsponsored copy change: the `new` tool op's success text gained a "Fill proposal.md, …" trailing line no delta requirement sponsors. | FIXED — reverted to the pre-change copy (`change scaffolded:` + json + redBlock). The `/cdd-new` command's Fill line is pre-existing text, untouched. |
| S3 | Judged satisfied by the reviewer, no action: bracket-line detection and the "N placeholder pin(s)" plural wording are both pinned exactly (W1, P1); S3's shape-coupling concern is additionally resolved by the standards finding-4 `ISSUE_LINE` fix. | NOTED — no action. |

Pin-honesty audit (spec axis): all 12 scenarios verified to be honestly
exercised by their pinned tests — each pin fails if its scenario regresses.

## Verdict

No open blockers. 5 findings fixed in-code, 4 declined with recorded
rationale, 1 noted. `npm test` green (12 pass), guard clean, strict
validation green after the fixes.
