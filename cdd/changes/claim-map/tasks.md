<!--
TASKS — how to fill and work this file (verified checklist traced to Done-When)

Before writing tasks, re-read the proposal's Done-When lines. If any
criterion is not observable as written, resolve it with the user first.

Format:
- Group tracked tasks under ## numbered headings; every tracked task is a
  checkbox "- [ ] X.Y Task" and MUST end with its verification:
  "verify by <command, test, or observable check>". A task without a
  verification is a wish, not a task.
- Phrase each task as the interface it establishes ("Reporter emits a CSV
  header row"), never as an activity ("implement reporting"). Work each
  task red-green-refactor: write the failing unit test that names that
  interface, implement the smallest code that turns it green, refactor
  freely. Unit tests are engineering artifacts born during apply — they
  churn with the design and are never pinned in the spec.
- Order by dependency. Keep each task small enough to finish in one session.
- Turn the design gate's open questions into early tasks. Keep a
  "## Design Notes" section only for decisions the design gate did not cover.
- Follow the implementation steps with "## Done When Traceability": a table row per proposal criterion —
  "| <criterion> | <task ids that verify it> |". If a criterion has no task,
  add the task or fix the criterion.

Scale rule: more than 8 implementation subtasks is the split signal — run
the split procedure at the design gate; more than 12 fails strict validation.
The split: read the traceability table (it is the split map), cut into N
proposals each with its own Done-When subset and its own delta, record
"Depends on:", supersede the original (never delete it). A genuinely atomic
change that must exceed 12 records a "split-considered: kept whole because
<reason>" line in this file instead.

Apply protocol: work strictly top-to-bottom, one task at a time. Tick a box
only after its verification passes ("checked" means "its verification
passed", never "I am done looking at it"); re-read this file after each
tick. If a verification fails, uncheck and fix — never continue on a red
check. Group-local testing: each group lands the unit tests its own work
calls for; a final group runs the scenarios' acceptance tests end to end.

Review tasks: task 3.1 (Change review) runs cdd-spec-review
in package mode at draft-green — the package drafted, validate draft green,
before the first implementation task ticks — findings at reviews/r2-change-review.md.
The Close review tasks run before archive: cdd-code-review — two
axes, two cold sessions: the standards axis (findings at
reviews/r3-standards-code-review.md) and the spec axis (findings at
reviews/r3-spec-code-review.md) — and, if the change drafted an ADR or amended one's decision content — a Reconfirmed-by paragraph or a typo fix does not count,
cdd-adr-review (findings at reviews/adr-review.md).
A review reports advisory findings (severity blocker/should/note + disposition), never
verdicts: it ticks only when no blocker is open, and the
deterministic validators keep gate authority. Reviews run cold (rule 2b): the reviewer is not the author of the artifacts under review — every model-run review (R2, R3, ADR) is a fresh cold sub-agent session briefed from paths on disk; a same-session re-read is the weaker fallback and records its form and justification in the findings file header.

Anti-scope-creep: no task may exist without a spec requirement or Done-When
criterion that needs it. Improvements no criterion demands go back to the
proposal as Non-Goals or a future change.
-->

# Tasks — claim-map

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs (cdd/specs/gherkin/spec.md and cdd/specs/adr/spec.md requirement blocks read verbatim; scripts/adr-index.mjs, scripts/grammar-law.mjs, scripts/spec-drift.mjs, lib/adr-ops.mjs read line-level during M1 premise verification; tests/acceptance/adr-index-agreement.test.js AG2/AG3 read during R1)

## 2. Design

- [x] 2.1 Design gate — record: **T1 YES** (cross-cutting: the seam moves gherkin's scripts/spec-drift.mjs + scripts/adr-index.mjs and adr's lib/adr-ops.mjs together — two capabilities' living specs change in one stroke); **T2 YES** (architecture bet: the builder home — extend scripts/adr-index.mjs vs scripts/grammar-law.mjs vs a new law module; a new module is fence-dead because the guard is a door script whose imports must travel byte-identical inside the store copy and DOOR_SCRIPTS is pinned at 5); **T3 YES** (new shared seam buildClaimMap consumed by both the guard's gather pass and the ops library); **T4 YES** (the claim map feeds the guard's exit code and the adrs op's answers — byte-identity on both surfaces is the invariant at risk); **T5 NO** (single sequential implementation, no parallel teams). Chosen shape: **design.md at C4 Component level** — the risk lives in which module inside the system owns the shared derivation and what each consumer may know about it, a component-boundary question. The T2 bet mints **ADR-0013** (cross-capability law home), verify by this line naming all five answers, the chosen shape, and the C4 level

## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
  - Evidence: cold sub-agent claim-map-review-r2 (opencode-zen/deepseek-v4.1-flash, thinking high, family DeepSeek ≠ author zai; invocation recorded in reviews/pf29-invocation-log.md). Findings: 1 blocker / 3 should / 2 note — all disposed (5 `fixed:`, 1 `won't-fix:`), zero open blockers. The blocker: tasks 3.7 named a nonexistent door script for regeneration — fixed; the runnable regeneration command (`node -e 'import("./lib/templates.mjs").then(m => m.writeDoorScripts(process.cwd(), process.cwd()))'`, writeDoorScripts exported lib/templates.mjs:257) was executed on disk before re-recording: exit 0, cdd/scripts/ byte-identical. Fixes landed in proposal.md (DW2 two-stage, DW3 probe set), both delta files (per-path governing query sentence; verbatim restorations), tasks 3.5/3.6/3.7. Post-fix: `cdd validate claim-map` draft PASS; guard shows only the two expected RED-first [L1] pins (one per Verified-by line pinning the not-yet-written tests/acceptance/claim-map.test.js).
- [x] 3.2 Acceptance pin, RED first — tests/acceptance/claim-map.test.js holding the exactly-once scan (per-file claiming loop appears exactly once, in scripts/adr-index.mjs; lib/adr-ops.mjs zero globToRe uses and zero CODE_LINE import/matchAll; scripts/spec-drift.mjs zero globToRe uses; the pin body names the deleted sites: the guard's gather topology, filesClaimedByChange, globClaimsMemory, checkL2, checkO, checkA1, checkA2, and the op's governs/claiming loop/CODE_LINE scan) plus a real-door adrs --code run over the live store; run RED before implementation and record the red output in this tick, verify by node tests/acceptance/claim-map.test.js exiting non-zero before implementation with the red output recorded here, then exiting 0 after tasks 3.3–3.5
  - RED recorded (before any implementation): `node tests/acceptance/claim-map.test.js` → exit 1, output: "  FAIL CM1  the claiming loop appears exactly once, in scripts/adr-index.mjs; no consumer re-derives / the guard translates no globs — gather topology, filesClaimedByChange, globClaimsMemory, checkL2, checkO, checkA1, and checkA2 read the shared claim map" + "  FAIL CM2  adrs --code answers equal the claim map's per-path governing query, tracked and untracked alike / scripts/adr-index.mjs exports buildClaimMap" + "claim-map: 0 ok, 2 FAIL" — both scenarios red for the intended reasons (the guard still derives; the builder is absent).
  - Note: during implementation the CM1 Code-line assertion was tightened from `!/matchAll/` to `!/Code:/` — reconfirmDates legitimately uses matchAll for reconfirmation lines, which the broader ban would have misfired on; the tightened pin was still red pre-implementation (the guard held globToRe, the ops library held the CODE_LINE import) and now pins the restatement itself, not the API shape.
- [x] 3.3 The claim-map builder lands in scripts/adr-index.mjs — buildClaimMap, a pure function over the parsed spec models, the ADR index, and the tracked file list, yielding per-file claim sets, per-ADR governing sets, and open-delta claims (no fs, no git), verify by node tests/acceptance/claim-map.test.js and node tests/acceptance/adr-index-agreement.test.js both exiting 0
  - Evidence: buildClaimMap exported from scripts/adr-index.mjs — pure (no fs, no git) over {specs, adrIndex, tracked}; outputs filesOfGlob, filesOfSpec, filesOfChange, filesOfAdr, filesOfGlobs (capability-level union), governingFor (per-path governing query over retained compiled globs). `node tests/acceptance/claim-map.test.js` → "claim-map: 2 ok, 0 FAIL"; `node tests/acceptance/adr-index-agreement.test.js` → "adr-index-agreement: 3 passed, 0 failed" (AG1 now reads 13 entries — ADR-0013 landed in 3.8).
- [x] 3.4 The guard consumes the map — gatherFacts calls buildClaimMap once and stores it as facts.claims; the 9 re-derivation sites (gather topology ×2, filesClaimedByChange, globClaimsMemory, checkL2 ×2, checkO, checkA1, checkA2) read the map; scripts/spec-drift.mjs holds zero globToRe uses; pure checks stay pure, verify by node tests/acceptance/guard-pure-checks.test.js and node tests/acceptance/claim-map.test.js exiting 0 and node scripts/spec-drift.mjs exiting 0
  - Evidence: gatherFacts calls buildClaimMap once (stored as facts.claimMap — the map object, this tick's earlier "facts.claims" shorthand) right before the facts object; all 9 sites read it (gather topology ×2, filesClaimedByChange, globClaimsMemory, checkL2 ×2, checkO, checkA1, checkA2); scripts/spec-drift.mjs holds zero globToRe and zero `.re.test(` (CM1 green). `node tests/acceptance/guard-pure-checks.test.js` → "2 passed, 0 failed"; `node scripts/spec-drift.mjs` → exit 0, "spec-drift: clean (6 specs, 37 acceptance test files, full scan)".
- [x] 3.5 The ops consume the map — lib/adr-ops.mjs answers adrs (table, --code via the map's per-path governing query — tracked and untracked paths alike, directory answers from the map's file sets) and reconfirm --check from the shared map; governs(), the private claiming loop, and the CODE_LINE import + matchAll scan are deleted; open-delta specs are parsed with parseSpecModel, verify by node tests/acceptance/adr-ops.test.js and node tests/acceptance/adr-reconfirm.test.js and node tests/acceptance/claim-map.test.js all exiting 0
  - Evidence: lib/adr-ops.mjs — governs() deleted, the private claiming loop deleted, the CODE_LINE import deleted (CM1: zero globToRe, zero `.re.test(`, zero CODE_LINE/Code:); adrs --code answers via map.governingFor (tracked and untracked paths alike), directory answers from the map's file sets, open-delta specs parsed with parseSpecModel (openDeltaSpecs replaces claimedByOpenChanges); reconfirm --check builds one map over the delta specs. `node tests/acceptance/adr-ops.test.js` → "adr-ops: 15 passed, 0 failed"; `node tests/acceptance/adr-reconfirm.test.js` → "adr-reconfirm: 15 passed, 0 failed"; claim-map 2 ok.
- [x] 3.6 Byte-identity proofs recorded — (a) PF-27 worktree recipe, two stages: clean worktree at 0bd33cd, baseline `node scripts/spec-drift.mjs` captured, then stage 1 copies this change's implementation files only (scripts/, lib/, regenerated cdd/scripts/) in and reruns with cmp stdout/stderr/exit; stage 2 additionally copies the change directory (specs, proposal, tasks — reviews excluded) and the new acceptance test file into BOTH the baseline and the after side, reruns both, cmp stdout/stderr/exit — so the open-delta claim surfaces (filesClaimedByChange, checkA1 citations, checkO's delta half, checkL2's hint) compare over real delta claims; (b) the adrs op's table, its --code answers over a probe set (tracked claimed path lib/templates.mjs, untracked path matching a governing glob, non-matching path no/such/file.mjs), and the reconfirm op's --check answers captured before and after over the live store, cmp — all cmp outputs recorded in this tick, verify by every cmp reporting identical and the outputs recorded here
  - Evidence (a), worktree /tmp/claim-map-proof detached at 0bd33cd: stage 1 (implementation files only — scripts/adr-index.mjs, scripts/spec-drift.mjs, lib/adr-ops.mjs, regenerated cdd/scripts/{adr-index,spec-drift}.mjs): baseline `node scripts/spec-drift.mjs` → "spec-drift: clean (4 specs, 36 acceptance test files, full scan)", exit 0, stderr 0 bytes; after-copy rerun → same line, exit 0; cmp stdout identical, cmp stderr identical, exit codes identical (0). Stage 2 (change dir specs/proposal/tasks + tests/acceptance/claim-map.test.js copied into BOTH sides): after-side "spec-drift: clean (6 specs, 37 acceptance test files, full scan)" exit 0; baseline-impl restored via git checkout and rerun on the same corpus → same line, exit 0; cmp stdout identical, cmp stderr identical, exit codes identical (0) — filesClaimedByChange, checkA1 citations, checkO's delta half, and checkL2's hint compared over the real delta claims. Evidence (b), ops over the same worktree corpus before vs after the impl copy (probe: adrs table; --code lib/templates.mjs, lib/zz-untracked.mjs, no/such/file.mjs, lib; reconfirm --check): cmp of the two probe transcripts identical. Live-store post-change record: table lists 13 ADRs incl. ADR-0013; --code lib/templates.mjs still answers 6 ADRs (0006–0009, 0011, 0012); --code lib answers 9; reconfirm --check (with this change open) cites ADR-0013's three moved files — "3 claim(s) moved past their ADR's latest reconfirmation" with the pre-existing epoch semantics for a not-yet-committed decision file.
- [x] 3.7 Store copies and full sweep — regenerate the door copies via writeDoorScripts (lib/templates.mjs export, invoked as `node -e 'import("./lib/templates.mjs").then(m => m.writeDoorScripts(process.cwd(), process.cwd()))'`), cmp all 5 cdd/scripts/*.mjs against scripts/*.mjs, run the full test sweep, verify by the regeneration command exiting 0 && cmp of the 5 door copies identical && npm test exiting 0
  - Evidence: regeneration `node -e 'import("./lib/templates.mjs").then(m => m.writeDoorScripts(process.cwd(), process.cwd()))'` → exit 0 ("regen ok"); `git status --porcelain cdd/scripts/` → only " M cdd/scripts/adr-index.mjs" and " M cdd/scripts/spec-drift.mjs" (the two touched laws; the other three copies byte-unchanged); P5 ("store copies stay byte-identical to the law sources") green; `npm test` → "tests 37 / pass 37 / fail 0".
- [x] 3.8 ADR-0013 records the claim-law home — cdd/decisions/0013-*.md drafted (claim law lives in scripts/adr-index.mjs; the guard and the ops library consume, neither re-derives), verify by node tests/acceptance/decisions-home.test.js exiting 0
  - Evidence: cdd/decisions/0013-one-claim-map-for-guard-and-ops.md drafted (frontmatter status accepted; code: scripts/adr-index.mjs, scripts/spec-drift.mjs, lib/adr-ops.mjs, tests/acceptance/claim-map.test.js). `node tests/acceptance/decisions-home.test.js` → "6 passed, 0 failed". The store inventory pins moved with the thirteenth ADR and are mirrored in the delta scenarios: DH2 (1..13), the adrs table (13 ids), the lib directory answer (+= ADR-0013), AG1 (13 entries); the adr delta gained a third MODIFIED block ("Product ADRs live in the store's decisions home", twelve→thirteen) and the gherkin delta's AG1 scenario now reads 13 — `cdd validate claim-map` draft PASS after the delta grew.


## Done When Traceability

| criterion | task ids |
|---|---|
| claim-map.test.js exits 0 scanning for the exactly-once claiming loop with zero derivation in the consumers, pin body naming the deleted sites | 3.2, 3.3, 3.4, 3.5 |
| guard stdout/stderr/exit cmp-identical before/after on a clean 0bd33cd worktree, implementation files only | 3.3, 3.4, 3.6 |
| adrs table + --code and reconfirm --check answers byte-identical before/after over the live store | 3.5, 3.6 |
| cdd/scripts/*.mjs byte-identical, npm test exits 0, cdd validate strict green | 3.7 (+ strict at 4.4) |
| cdd/decisions/0013-*.md exists and decisions-home.test.js exits 0 | 3.8 |

## 4. Close

- [x] 4.1 Standards-axis change code review — run skill `cdd-code-review` with the standards-axis brief (brief-r3-standards.md) over the diff since the change branched, in its own cold session; findings at `reviews/r3-standards-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-standards-code-review.md holding no open blocker
  - Evidence: cold sub-agent claim-map-review-r3-standards (agent "reviewer", opencode-zen/deepseek-v4.1-flash @ thinking high, family DeepSeek ≠ author zai; invocation recorded in reviews/pf29-invocation-log.md). Findings: 0 blocker / 1 should / 4 note — all disposed (S1 fixed, S2 fixed, S3 fixed, S4 won't-fix, S5 fixed). S1/S2/S3/S5 fixes: CM1 corpus extended to grammar-law with the claim-signature predicate `re\.test\(`, buildClaimMap JSDoc restated as contract (tracked order, ADR sets in index order), ops header enumeration corrected, AO1 message 13. Post-fix verification: `node tests/acceptance/claim-map.test.js` → "claim-map: 2 ok, 0 FAIL"; `npm test` → tests 37 / pass 37 / fail 0; `node scripts/spec-drift.mjs` → exit 0 "spec-drift: clean (6 specs, 37 acceptance test files, full scan)"; door copy regenerated, `cmp scripts/adr-index.mjs cdd/scripts/adr-index.mjs` identical. Reviewer confirmed clean: ADR-0001, DOOR_SCRIPTS=5 byte-identical, gather/pure split (buildClaimMap at scripts/spec-drift.mjs:245 inside gatherFacts), consumer trace equivalence, ADR-0011 pin sponsorship.
- [x] 4.2 Spec-axis change code review — run skill `cdd-code-review` with the spec-axis brief (brief-r3-spec.md) over the same diff, in a second cold session; findings at `reviews/r3-spec-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-spec-code-review.md holding no open blocker
  - Evidence: cold sub-agent claim-map-review-r3-spec (agent "reviewer", opencode-zen/deepseek-v4.1-flash @ thinking high, family DeepSeek ≠ author zai; invocation recorded in reviews/pf29-invocation-log.md). Scope pinned by the reviewer at base/HEAD 0bd33cd + full working tree, no drift; all 36 delta scenarios traced to real pins; twelve→thirteen inventory pins, DIR_LIB += ADR-0013, and both byte-identity contracts judged sponsored; ADR-0013's existence sponsored (glob choice = ADR decision content, correctly on the 4.3 axis). Findings: 0 blocker / 1 should / 3 note — all disposed (SPEC-01 fixed — CM1 corpus + grammar-law assertion + delta scenario Then reconciled to "scripts/grammar-law.mjs holds no claiming loop, its shared parse compiling the Code: globs it reads without claiming files"; SPEC-02 escape-spellings fixed via `re\\.test\\(` strengthening, identifier-only half won't-fix — a data-flow pin needs AST tooling the zero-dep law forbids; SPEC-03 won't-fix — CM2 routes, AO5/AO10 + AG3 carry semantics and cross-surface agreement; SPEC-04 fixed). Post-fix evidence identical to 4.1's run.
- [x] 4.3 ADR review — if this change drafted an ADR under `cdd/decisions/` or amended one's decision content (a Reconfirmed-by paragraph or a typo fix does not count), run skill `cdd-adr-review` on them (findings at `reviews/adr-review.md` per that skill); if none, record the skip on this line, verify by reviews/adr-review.md holding no open blocker or a skip recorded on this line
  - Evidence: ADR-0013 drafted (task 3.8) → cold sub-agent claim-map-review-adr (agent "reviewer", opencode-zen/deepseek-v4.1-flash @ thinking high, family DeepSeek ≠ author zai; invocation recorded in reviews/pf29-invocation-log.md). Verdict: keep with edits — four-criterion test passed (hard-to-reverse, surprising-without-context, cross-capability hold; trade-off partial), not over-drafted, no missing-ADR blocker. Findings: 0 blocker / 2 should / 3 note — all disposed (A1 fixed: Why names the grammar-law and I/O-walker alternatives with their rejection reasons; A2 fixed: false "0012's claims-index charter" referent replaced with 0007 + the gherkin claims-index requirement; A3 fixed: invariant scoped to "no consumer of the map", carve-out carries its why; A4 won't-fix: recipe, not architecture — rides PF-27's close note; A5 won't-fix: semantics spec-stated and pinned). Post-fix: `node tests/acceptance/decisions-home.test.js` → exit 0.
- [x] 4.4 cdd validate strict green, guard green
  - Evidence: `cdd validate claim-map --mode strict` → PASS (via the cdd tool op). `node scripts/spec-drift.mjs` → exit 0, "spec-drift: clean (6 specs, 37 acceptance test files, full scan)". `cdd reconfirm --check` preflight → 3 demands, all ADR-0013's claims (lib/adr-ops.mjs, scripts/adr-index.mjs, scripts/spec-drift.mjs) with the expected epoch-1970 last-touch for the not-yet-committed ADR file; per the method the reconfirm line rides the archive commit (feature commit first, then `cdd reconfirm ADR-0013 --evidence ...`, then archive).
- [ ] 4.5 Archive — pair-commit: feature commit, then archive commit
