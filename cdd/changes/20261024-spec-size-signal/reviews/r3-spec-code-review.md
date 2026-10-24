# R3 Spec-Axis Code Review — 20261024-spec-size-signal

## Header

- **Reviewer / model metadata:** `gpt-6-luna`, family `gpt` (provider `opencode-zen`), thinking level `high`. Read from this fresh session's metadata: `PI_MODEL=gpt-6-luna`, `PI_PROVIDER=opencode-zen`, `PI_REASONING_LEVEL=high`; the session record has `modelId:"gpt-6-luna"` and `thinkingLevel:"high"`. Author family per brief: `zai`; the model lineages differ.
- **Cold form:** fresh independent session; none of the change artifacts were authored here. No other sessions were contacted.
- **Pinned state:** branch `spec-size-signal`; HEAD `6057a6e7aca9f8e63ddb9a69613f1f11005f1303` (brief pin `6057a6e`). `git status --porcelain | tail -20`:
  ```text
   M lib/validate.mjs
  ?? cdd/changes/20261024-spec-size-signal/
  ?? tests/acceptance/spec-size-signal.test.js
  ```
- **Scope fence:** reviewed only `cdd/changes/20261024-spec-size-signal/`, `git diff HEAD -- lib/validate.mjs`, `tests/acceptance/spec-size-signal.test.js`, and the living-spec merge target. This is the only file written by this review.
- **Charter:** advisory spec-axis findings, not a verdict. Close-section ticks were not reviewed.

## Independent verification

Commands were run in fresh Node processes, after verifying the pinned branch and HEAD.

1. `node --test tests/acceptance/spec-size-signal.test.js`

   Output tail:
   ```text
   ✔ spec-size-signal.test.js — spec-size signal pin (real lib/validate.mjs) (16.976866ms)
   ℹ tests 6
   ℹ suites 1
   ℹ pass 6
   ℹ fail 0
   ℹ cancelled 0
   ℹ skipped 0
   ℹ todo 0
   ℹ duration_ms 89.735845
   ```

2. `node -e "import('./lib/validate.mjs').then(m=>{const v=m.validateBoth('.','20261024-spec-size-signal');console.log(JSON.stringify(v,null,1))})"`

   Output tail (full verdict JSON):
   ```json
   {
    "draft": {
     "ok": true,
     "errors": [],
     "warnings": [
      "spec-size: living spec \"gherkin\" holds 50 requirements (>= 12) — split signal: consider splitting the spec",
      "spec-size: living spec \"gherkin\" requirements at or over 8 scenarios: Gherkin subset limits, Loop law names three review points, Code lines claim implementation surface, never decision memory, The ADR claims index is single-sourced — split signal: consider splitting these requirements"
     ]
    },
    "strict": {
     "ok": true,
     "errors": [],
     "warnings": [
      "spec-size: living spec \"gherkin\" holds 50 requirements (>= 12) — split signal: consider splitting the spec",
      "spec-size: living spec \"gherkin\" requirements at or over 8 scenarios: Gherkin subset limits, Loop law names three review points, Code lines claim implementation surface, never decision memory, The ADR claims index is single-sourced — split signal: consider splitting these requirements"
     ]
    }
   }
   ```
   This independently confirms the two standing Tier A warnings in both modes, no Tier B warning after the delta's decision line, and `ok: true` with no errors in both verdicts.

3. `grep -rn 'SPEC_REQ_SIGNAL\|SCENARIO_SIGNAL' scripts/grammar-law.mjs cdd/scripts/grammar-law.mjs; rc=$?; printf 'grep_exit=%s\n' "$rc"`

   Output tail: no matches; `grep_exit=1`. The named constants are local to `lib/validate.mjs:124-125` (`nl -ba lib/validate.mjs | sed -n '120,125p'`).

4. `git diff HEAD -- lib/validate.mjs`

   Relevant diff tail, cross-checked with `nl -ba lib/validate.mjs | sed -n '172,179p'`:
   ```text
   for (const e of entries) {
     ...
     if (e.op === "ADDED" && livingBlocks.length >= SPEC_REQ_SIGNAL && !/split-considered:/i.test(text)) {
       warnings.push(`spec-size: ADDED "${e.requirement}" grows ...`);
     }
   }
   ```

5. `nl -ba scripts/grammar-law.mjs | sed -n '337,380p'` and `nl -ba lib/store.mjs | sed -n '166,175p;246,255p'`:

   Output tail:
   ```text
   337 export function parseSpecModel(text) {
   348   const opMark = line.match(OP_HEADER);
   359   const r = line.match(REQ_HEADER);
   362     living = { requirement: r[1].trim(), block: [line], startLine: i + 1 };
   365       deltaBlock = { op, requirement: r[1].trim(), block: [line], startLine: i + 1 };
   378   if (living) living.block.push(line);
   379   if (deltaBlock) deltaBlock.block.push(line);
   166 export function parseDelta(text) {
   170   return parseSpecModel(text).ops.map((o) => ({
   253 const body = living.map((l) => l.text).join("\n");
   255 fs.writeFileSync(livingPath, `# ${cap.name} — living spec\n\n## Requirements\n\n${body}`);
   ```
   The `split-considered:` decision is at the delta top (`cdd/changes/20261024-spec-size-signal/specs/gherkin/spec.md:1`), before `## ADDED Requirements`; the parser does not attach preamble lines to an operation block, and archive output is rebuilt from parsed requirement blocks. The live `validateBoth` run above has no delta-shape errors. The Gherkin fence has six pinned scenarios; each pin is its scenario's last line (`cdd/changes/20261024-spec-size-signal/specs/gherkin/spec.md:9-47`).

## Scenario → subtest map

| Delta scenario | Pin-backed subtest / result |
|---|---|
| `Over-threshold requirement count warns once in both modes` (`cdd/changes/20261024-spec-size-signal/specs/gherkin/spec.md:12-16`) | `Tier A — over-threshold requirement count warns once in both modes` (`tests/acceptance/spec-size-signal.test.js:81-96`); uses `validateBoth`, checks draft and strict, and checks 11 is silent. |
| `Fat requirements aggregate into one warning line` (`cdd/changes/20261024-spec-size-signal/specs/gherkin/spec.md:18-22`) | `Tier A — fat requirements aggregate into one warning line` (`tests/acceptance/spec-size-signal.test.js:98-112`); uses the real validator, checks both names in one line and the below-threshold silent case. |
| `A delta block grown past the scenario threshold warns` (`cdd/changes/20261024-spec-size-signal/specs/gherkin/spec.md:24-28`) | `Tier A — a delta block grown past the scenario threshold warns` (`tests/acceptance/spec-size-signal.test.js:114-134`); covers ADDED at 8 and 7, plus MODIFIED at 8, through the real validator. **Partial scenario match:** the scenario says one delta contains both an 8-scenario ADDED and an 8-scenario MODIFIED block; the test exercises those in separate fixture deltas. See R3P-002. |
| `Growth into an over-threshold spec demands split consideration` (`cdd/changes/20261024-spec-size-signal/specs/gherkin/spec.md:30-34`) | `Tier B — growth into an over-threshold spec demands split consideration` (`tests/acceptance/spec-size-signal.test.js:136-145`); real validator, draft and strict, no line, `ok` true. Its single-ADDED fixture does not catch R3P-001. |
| `A split-considered line satisfies the demand` (`cdd/changes/20261024-spec-size-signal/specs/gherkin/spec.md:36-40`) | `Tier B — a split-considered line satisfies the demand` (`tests/acceptance/spec-size-signal.test.js:147-166`); real validator, both modes, line suppresses demand. |
| `Warnings never block either verdict` (`cdd/changes/20261024-spec-size-signal/spec.md:42-46`) | `Never blocks — all four signal warnings leave ok true in both modes` (`tests/acceptance/spec-size-signal.test.js:168-180`); real validator, asserts four warnings and `ok: true` in both modes. |

## Done-When → evidence map

| Done-When | Tasks / observed evidence |
|---|---|
| DW1 — requirement-count warning once in both modes (`cdd/changes/20261024-spec-size-signal/proposal.md:89`) | Traceability maps to 3.2/3.3/3.5 (`cdd/changes/20261024-spec-size-signal/tasks.md:85`). The fixture asserts both modes and the below-threshold case (`tests/acceptance/spec-size-signal.test.js:81-96`); live self-application Tier A count warning is in `cdd/changes/20261024-spec-size-signal/reviews/red-records.md:70-72,80-82` and independently reproduced above. |
| DW2 — one aggregated fat-requirement warning, with silent case (`cdd/changes/20261024-spec-size-signal/proposal.md:90`) | Maps to 3.2/3.3 (`cdd/changes/20261024-spec-size-signal/tasks.md:86`). Fixture checks one aggregate naming both and no-fat silence (`tests/acceptance/spec-size-signal.test.js:98-112`); the live names are in `cdd/changes/20261024-spec-size-signal/reviews/red-records.md:71,82` and independently reproduced above. |
| DW3 — ADDED or MODIFIED delta block at 8 warns (`cdd/changes/20261024-spec-size-signal/proposal.md:91`) | Maps to 3.2/3.3 (`cdd/changes/20261024-spec-size-signal/tasks.md:87`). Fixture checks ADDED 8, ADDED 7, and MODIFIED 8 (`tests/acceptance/spec-size-signal.test.js:114-134`); see R3P-002 for the same-delta scenario gap. |
| DW4 — ADDED demand without line, silence with line, live fire then silence (`cdd/changes/20261024-spec-size-signal/proposal.md:92`) | Maps to 3.2/3.4/3.5 (`cdd/changes/20261024-spec-size-signal/tasks.md:88`). Pin demand/satisfaction subtests are at `tests/acceptance/spec-size-signal.test.js:136-166`; the self-application BEFORE fire and AFTER silence, including standing Tier A lines, is recorded at `cdd/changes/20261024-spec-size-signal/reviews/red-records.md:67-86`. Current `validateBoth` confirms silence after the line. |
| DW5 — warnings never alter `ok`; named local thresholds, absent from law copies (`cdd/changes/20261024-spec-size-signal/proposal.md:93`) | Maps to 3.2/3.3/3.4 (`cdd/changes/20261024-spec-size-signal/tasks.md:89`). Both-mode assertions are at `tests/acceptance/spec-size-signal.test.js:168-180`; constants are at `lib/validate.mjs:124-125`; the grep above confirms no law-copy entry. |

The five traceability rows map to real implementation tasks (`cdd/changes/20261024-spec-size-signal/tasks.md:85-89`); implementation tasks 3.2-3.5 have corresponding pin, signal, demand, or live-observation work (`cdd/changes/20261024-spec-size-signal/tasks.md:76-79`). Task 3.1 is the package-review task, not an orphan behavior task. No traceability orphan found.

## Findings

| ID | Severity | Finding | Evidence | Suggested disposition |
|---|---|---|---|---|
| R3P-001 | should | **Tier B emits one demand warning per ADDED requirement, although the contract requires one per delta.** The proposal says a delta with *any* ADDED entry and no decision line produces “1 warning” (`cdd/changes/20261024-spec-size-signal/proposal.md:57`; DW4, `cdd/changes/20261024-spec-size-signal/proposal.md:92`; task 3.4, `cdd/changes/20261024-spec-size-signal/tasks.md:78`). In `validateDelta`, the Tier B `warnings.push` is inside `for (const e of entries)` (`lib/validate.mjs:172-179`), so two or more ADDED entries in an over-threshold capability produce two or more demand lines. The pin uses only one ADDED entry (`tests/acceptance/spec-size-signal.test.js:136-144`), so the passing suite does not expose the mismatch. | Move the Tier B demand emission out of the per-entry loop (or guard it so it runs once per delta); add a real-validator fixture with multiple ADDED entries and assert exactly one demand warning. |
| R3P-002 | should | **Scenario 3's pin does not exercise its stated combined-delta case.** The Given explicitly requires one delta holding both an 8-scenario ADDED and an 8-scenario MODIFIED block (`cdd/changes/20261024-spec-size-signal/specs/gherkin/spec.md:24-27`). The pin tests the ADDED case in one fixture (`tests/acceptance/spec-size-signal.test.js:117-125`) and the MODIFIED case in a separate fixture (`tests/acceptance/spec-size-signal.test.js:127-133`), so no subtest exercises the scenario as written. | Build one fixture delta containing both blocks and assert one correctly named warning per block through the real validator; retain the 7-scenario negative case. |

## Counts

- **Blocker: 0 · Should: 2 · Note: 0**
- These are advisory findings, not a verdict; the director retains gate authority.

## Dispositions (author, 2026-10-24)

- **R3P-001 (should): fixed** — the Tier B demand emission is hoisted out of the per-entry loop: one demand per delta, exactly as the proposal/DW4/task 3.4 contract states. The single-ADDED message is byte-identical to the previously recorded shape (`ADDED "X" grows "cap" past 12 requirements — …`), so the red-records.md §2 fire-then-silent observations remain verbatim-true; a multi-ADDED delta now emits one line naming the count (`2 ADDED requirements grow "cap" past 12 requirements — …`). Pin strengthened: the demand subtest adds a real-validator fixture with two ADDED entries asserting exactly 1 demand line naming the count, draft and strict.
- **R3P-002 (should): fixed** — the block-growth subtest now builds the scenario as written: ONE delta holding a grown ADDED block and a grown MODIFIED block, asserting exactly 2 block warnings (one per block, each naming its block) through the real validator; the separate single-block fixtures and the 7-scenario negative case are retained.

Verification after both fixes: pin suite 6/6; full sweep tests 46 / pass 46 / fail 0; guard `spec-drift: clean (5 specs, 41 acceptance test files, full scan)`; fresh-node `validateBoth` on this change: draft ok=true warnings=2, strict ok=true warnings=2, demand lines 0 (the decision line satisfies the demand; the two Tier A standing lines remain).
