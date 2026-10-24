# R2 change review — guard-pure-checks

## Reviewer form

- **Form:** cold sub-agent (fresh session, briefed only from the paths in
  `reviews/brief-r2.md`, read from disk at the pinned state).
- **Reviewer model family:** `opencode-zen` / `deepseek-v4-pro`
  (PI_PROVIDER=`opencode-zen`, PI_MODEL=`deepseek-v4-pro`).
- **Author model family:** `zai` / `glm-5.3` lineage (per the brief).
- **Families differ:** yes — different providers (opencode-zen/deepseek vs
  zai/glm-5.3). Review proceeds.

## Scope

Package review at draft-green: proposal.md, design.md, tasks.md, and the one
delta `specs/gherkin/spec.md`, against the living `cdd/specs/gherkin/spec.md`
and `cdd/rules.md`. Advisory findings only — no verdicts, no fixes.

## Findings

### 1. Proposal and delta Code lines disagree on `tests/smoke.mjs` — `should`

The proposal's `Code:` line names `tests/smoke.mjs` as implementation surface,
but the delta's `Code:` line omits it, even though task 3.7 modifies
`tests/smoke.mjs` (converting redundant sandbox builders to direct pure-check
calls). The two artifacts describe the same change but claim different surface.

- Evidence: `cdd/changes/guard-pure-checks/proposal.md:39`
  (`Code: scripts/spec-drift.mjs, cdd/scripts/**, tests/acceptance/guard-pure-checks.test.js, tests/smoke.mjs`)
  vs `cdd/changes/guard-pure-checks/specs/gherkin/spec.md:25`
  (`Code: scripts/spec-drift.mjs, cdd/scripts/**, tests/acceptance/guard-pure-checks.test.js`).
- The immediately preceding change kept the two identical
  (`cdd/archive/20261024-spec-model/proposal.md:41` and
  `cdd/archive/20261024-spec-model/specs/gherkin/spec.md:35`).
- Consequence: the delta's Code globs are what the guard's L2/O checks read, so
  the smoke.mjs edit is not claimed by this change's delta. `tests/smoke.mjs` is
  already claimed by the living gherkin spec, so it is not unowned — but the
  proposal↔delta mismatch is a same-change coherence defect.

### 2. Byte-identity proof's "changed files" scope is not pinned to source-only — `note`

Task 3.5 and the design say "copy in only this branch's changed files" and
"apply only the changed files", without stating that the proof worktree must
receive only the guard source (`scripts/spec-drift.mjs`) and not the new
acceptance test or the delta spec. The guard's report prints spec and
acceptance-test counts (`spec-drift: clean (N specs, M acceptance test files,
full scan)`), so copying the new `tests/acceptance/guard-pure-checks.test.js`
or the delta spec into the proof worktree would change those counts and break
the cmp. The spec-model precedent made this explicit — its tick listed the
source files only and noted the delta spec + acceptance file "ride the tree"
(`cdd/archive/20261024-spec-model/tasks.md:85`). The recipe is right; the
scoping is left implicit here.

- Evidence: `cdd/changes/guard-pure-checks/tasks.md` (task 3.5),
  `cdd/changes/guard-pure-checks/design.md` (Proof boundary).

### 3. Done-When 2 (byte-identity) maps to no delta requirement — `note`

Done-When 2 ("the PF-27 worktree byte-identity proof records cmp-identical
stdout, stderr, and exit code") has no corresponding delta requirement. This is
deliberate and documented — the proposal's Non-Goals state "No spec delta for
byte-identity: it is a one-shot migration proof riding the tick, not a durable
promise" — and it follows the spec-model precedent, whose byte-identity
Done-When likewise had no delta scenario. Per the charter a Done-When with no
requirement is a finding; the author may dispose this as `won't-fix:` on the
strength of the documented non-goal.

- Evidence: `cdd/changes/guard-pure-checks/proposal.md` (Done-When 2 and
  Non-Goals), `cdd/archive/20261024-spec-model/proposal.md:37`.

### 4. Done-When 3 and 4 are general green gates with no delta requirement — `note`

Done-When 3 (`npm test` green with 36 suites + smoke green) and Done-When 4
(`cdd validate` strict zero errors + guard full-scan clean) are whole-change
completion gates rather than checks of the single delta requirement. They are
standard and map to tasks (3.2/3.7/3.8 and 3.8 respectively), but neither names
a requirement. Same disposition note as finding 3.

- Evidence: `cdd/changes/guard-pure-checks/proposal.md` (Done-When 3 and 4).

### 5. Task 3.6 (store copies) is absent from the Done-When traceability table — `note`

Task 3.6 (regenerate `cdd/scripts/` via `writeDoorScripts`, cmp all five
byte-identical) is not named by any Done-When criterion nor listed in the
`## Done When Traceability` table. It is required — the delta's `Code:` line
claims `cdd/scripts/**` and the living spec pins store copies byte-identical to
their sources — but no completion criterion sponsors it, so the table does not
show the cut line for it. The spec-model precedent did map its store-copies
task into the table (`cdd/archive/20261024-spec-model/tasks.md:96`).

- Evidence: `cdd/changes/guard-pure-checks/tasks.md` (task 3.6 and the
  traceability table).

## Checklist summary

- **Coverage** — the single requirement maps to tasks 3.2/3.3/3.4; Done-When 1
  maps to it. Done-When 2/3/4 map to no requirement (findings 3, 4).
- **Sponsorship** — no orphan requirements; no orphan tasks (3.6 is required
  but unsponsored in the table — finding 5).
- **Same-change coherence** — proposal/delta/tasks/design describe one change;
  the one defect is the Code-line mismatch (finding 1). Design.md has the four
  rule-2c sections, one C4 Component flowchart, 9 boxes ↔ 9 boundary lines, and
  a Component level claim matching the stated risk.
- **MODIFIED/REMOVED legality** — delta is ADDED-only; the ADDED requirement
  ("The drift guard gathers once, then checks purely") does not already live in
  the living gherkin spec. No MODIFIED/REMOVED to check.
- **Verify-by runnable** — every task's verify-by names a real command/check
  (RED-first run, cmp, `npm test`, `cdd validate` strict, guard full-scan); both
  scenarios pin `tests/acceptance/guard-pure-checks.test.js`, the new pin
  authored RED-first in task 3.2. The one realism caveat is the proof scoping
  (finding 2).

## Dispositions (author, post-review)

| # | Severity | Disposition | Action / reason |
|---|---|---|---|
| 1 | should | fixed: | delta `Code:` line now names `tests/smoke.mjs` (specs/gherkin/spec.md:25) — proposal and delta claim the same surface; also the semantically right claim: the delta's codeGlobs are what the guard's L2 expected-mid-Close machinery reads, so the smoke.mjs edit of task 3.7 must be claimed by this change's delta to stay a hint, not an issue |
| 2 | note | fixed: | task 3.5 now pins the proof scope explicitly: copy only the changed SOURCE pair (scripts/spec-drift.mjs + cdd/scripts/spec-drift.mjs); delta spec and new acceptance test never enter the proof worktree (corpus stays at baseline so the report's spec/acceptance counts match) |
| 3 | note | won't-fix: | documented Non-Goal ("No spec delta for byte-identity: one-shot migration proof riding the tick, not a durable promise") per the spec-model precedent; a durable scenario would promise byte-identity forever, which this change explicitly does not |
| 4 | note | won't-fix: | Done-When 3/4 are whole-change completion gates (full suite green, strict validate + guard clean) — standard form, identical in the spec-model precedent; the coverage chain is carried by Done-When 1 ↔ the one requirement ↔ tasks 3.2–3.4 |
| 5 | note | fixed: | traceability table row "npm test green with 36 suites and smoke green" now names 3.6 (store-copy cmp rides the suite via the P5 byte-identical pin) |

Re-validated after edits: `validateChange(cwd,'guard-pure-checks','draft')` → `{"ok":true,"errors":[],"warnings":[]}`.
