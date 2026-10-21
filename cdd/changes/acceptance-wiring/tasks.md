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
The Close review tasks run before archive: cdd-code-review (findings
at reviews/r3-code-review.md) and, if the change drafted or amended ADRs,
cdd-adr-review (findings at reviews/adr-review.md).
A review reports advisory findings (severity blocker/should/note + disposition), never
verdicts: it ticks only when no blocker is open, and the
deterministic validators keep gate authority. Reviews run cold (rule 2b): the reviewer is not the author of the artifacts under review — every model-run review (R2, R3, ADR) is a fresh cold sub-agent session briefed from paths on disk; a same-session re-read is the weaker fallback and records its form and justification in the findings file header.

Anti-scope-creep: no task may exist without a spec requirement or Done-When
criterion that needs it. Improvements no criterion demands go back to the
proposal as Non-Goals or a future change.
-->

# Tasks — acceptance-wiring

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

- [x] 2.1 Design gate — answer the five triage triggers (T1 cross-cutting, T2 architecture bet, T3 shared seam, T4 invariant risk, T5 parallel work): any YES needs a short design above; all NO is recorded here as the skip record, verify by this line naming all five answers

Answers: **T1 YES, T2 NO, T3 YES, T4 NO, T5 NO.** Short design follows (required for T1/T3).

- T1 YES — spans two capability seams: acceptance (CI wiring for the sweep) and gherkin (the law text — rule 7 lives in `lib/templates.mjs` `RULES_MD`, byte-mirrored to `cdd/rules.md`, both files owned by the gherkin capability). Two delta specs, one proposal.
- T2 NO — a standard Actions matrix on the existing guard job plus one law sentence; no new dependency, no new architecture, no bet on unstated behavior.
- T3 YES — shared seam: `RULES_MD` is the single source, byte-pinned (SSL3) to the store copy `cdd/rules.md`. The sentence is authored in the source and the store copy re-mirrored byte-identical; the module-rendered loop-law fragments — rules 2/2a/2b (`lib/loop-law.mjs`) — and `LOOP_CHAIN` (ambient block) stay untouched.
- T4 NO — no invariant weakened: guard L1 gains two pinned suites (no exceptions added); SSL3 byte-identity is preserved by mirroring; RA1–RA4 stay untouched (the matrix fans out the same single `npm test` step, so RA4 still finds its step).
- T5 NO — single runner, dedicated branch `acceptance-wiring`, no other open changes.

Design (for T1/T3):

1. **Matrix on the existing guard job** — `.github/workflows/cdd.yml` gains `strategy: { fail-fast: false, matrix: { node-version: [20, 24] } }`; `actions/setup-node` consumes `${{ matrix.node-version }}`; the step chain is unchanged (`npm ci` → full guard scan → `npm test --if-present`), so each leg is door 3 on its own major: 20 = the CI floor pin, 24 = the local-dev major. `fail-fast: false` so one leg's red never cancels the other leg's signal.
2. **Law sentence, one home** — rule 7 (test-first) gains exactly one sentence naming the executor, worded as a subset claim that stays true to the real script (`npm test` = `node tests/smoke.mjs && node tests/tools.mjs && node --test`): "Pins run with the project's tests: `npm test` runs the `node --test` sweep, which executes every `tests/acceptance/*.test.js` suite, and CI runs the same entrypoint — a subtask is verified by that command green." Authored once in `lib/templates.mjs`'s `RULES_MD`; `cdd/rules.md` regenerated byte-identical (SSL3 keeps holding).
3. **Pin suites per capability** (guard single-owner law) — `tests/acceptance/ci-node-matrix.test.js` (MX: matrix legs, setup-node wiring, fail-fast, unchanged steps) owned by the acceptance delta; `tests/acceptance/law-pin-executor.test.js` (LAW: executor sentence in source and mirror, byte-identity) owned by the gherkin delta.
4. **No ADR** — reversible YAML + one law sentence; neither hard-to-reverse nor surprising without the delta's record. Skip recorded at 4.2.

Evidence held at gate time (feeds the proposal's Why): local Node 24.4.1 `npm test` → 12/12 green, exit 0, ~3 s; nvm Node 22.17.1 `node --test` → 12/12 green; docker node:20 (v20.20.2) with git, exact CI steps (`npm ci` → `npm test`) → 12/12 green. First docker probe showed 4 red suites — false alarm: slim images ship no git and the suites spawn it (`spawnSync git ENOENT`); GitHub-hosted runners have git. Recorded so a future slim-runner migration doesn't misread it.

## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
- [x] 3.2 Red-first MX pin suite — author tests/acceptance/ci-node-matrix.test.js pinning the matrix: legs exactly Node 20 and 24, setup-node consuming the matrix entry, fail-fast false, and the unchanged npm ci → guard → npm test step chain; verify by `node --test tests/acceptance/ci-node-matrix.test.js` failing against the unmodified workflow (RED evidence recorded under this task before 3.3)
  - RED evidence (2026-10-21, pre-3.3): exit 1 — `FAIL MX1 guard job sets fail-fast: false`, `FAIL MX2 matrix legs are exactly [20, 24] — 0 node-version lists found`, `FAIL MX3 setup-node provisions its Node from the matrix entry — 1 node-version keys, matrix reference absent`; MX4 (unchanged steps) ok ×3
- [x] 3.3 Matrix wiring — .github/workflows/cdd.yml's guard job gains `strategy: { fail-fast: false, matrix: { node-version: [20, 24] } }` and setup-node consumes `${{ matrix.node-version }}`, steps otherwise unchanged; verify by `node --test tests/acceptance/ci-node-matrix.test.js` green
- [x] 3.4 Red-first LAW pin suite — author tests/acceptance/law-pin-executor.test.js pinning the executor sentence (exact wording, tasks §2 design point 2) present in lib/templates.mjs's `RULES_MD` and in cdd/rules.md with identical wording (file-level byte-identity stays SSL3's contract, re-run at 3.5); verify by `node --test tests/acceptance/law-pin-executor.test.js` failing against the unmodified law (RED evidence recorded under this task before 3.5)
  - RED evidence (2026-10-21, pre-3.5): exit 1 — `FAIL LAW1 RULES_MD rule 7 carries the executor sentence — sentence absent from rule 7`, `FAIL LAW2 cdd/rules.md rule 7 carries the same sentence — sentence absent from rule 7`, `FAIL LAW3 the sentence appears exactly once in each surface — RULES_MD ×0, cdd/rules.md ×0`
- [x] 3.5 Executor sentence, one home — add the sentence to `RULES_MD` in lib/templates.mjs and re-mirror cdd/rules.md byte-identically; verify by `node --test tests/acceptance/law-pin-executor.test.js` green and `node --test tests/acceptance/single-source-law.test.js` green
  - SSL9/guard initially red: A1 flagged ADR-0009/0008/0010-governed code touched without citation — fixed by citing all three in the proposal (this change follows each: single-source authoring, advisory findings, cold reviews); SSL suite and guard then green, RULES_MD === cdd/rules.md byte-identical

## Done When Traceability

| criterion | task ids |
|---|---|
| CI's guard job runs the install → guard → test chain on exactly 2 Node legs (20 and 24) with fail-fast: false as the pinned proxy for no leg cancelling the other | 3.2, 3.3 |
| rule 7 of the loop law names `npm test`'s `node --test` sweep as the executor of Verified-by pins | 3.4, 3.5 |

## 4. Close

- [x] 4.1 Change code review — run skill `cdd-code-review` over the diff since the change branched; findings at `reviews/r3-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-code-review.md holding no open blocker
  - Two cold axis reviewers (both opencode-zen/deepseek-v4-pro) found the same 2 blockers: a duplicate `guard:` key breaking the workflow (author's edit slip) + the MX pin grepping text instead of structure (green on the broken file). Both fixed: stray line removed, MX suite rewritten with a fail-closed YAML-subset parser (MX0–MX4 structural; RED demonstrated on the broken file, green after). 1 note won't-fix (house-style suite headers). Positive: LAW pin honest, no scope creep, RA1–RA4 untouched.
- [x] 4.2 ADR review — if this change drafted or amended ADRs under `cdd/decisions/`, run skill `cdd-adr-review` on them (findings at `reviews/adr-review.md` per that skill); if none, record the skip on this line, verify by reviews/adr-review.md holding no open blocker or a skip recorded on this line
  - Skip recorded: no ADR drafted or amended — cdd/decisions/ untouched; the proposal cites ADR-0008/0009/0010 (following them, per guard A1), which is citation, not amendment.
- [x] 4.3 cdd validate strict green, guard green
- [ ] 4.4 Archive — pair-commit: feature commit, then archive commit
