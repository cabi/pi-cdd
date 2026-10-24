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

# Tasks — adr-ops

## 1. Context

- [x] 1.1 .1 Read the living spec and every file matching the proposal's Code: globs — read in full before the gate (M1)

## 2. Design

- [x] 2.1 Design gate — answer the five triage triggers (T1 cross-cutting, T2 architecture bet, T3 shared seam, T4 invariant risk, T5 parallel work): any YES needs a short design above; a T2 or T4 YES instead carries `design.md` at the change root (rule 2c: four sections, one C4 flowchart) — the record names the chosen shape and, for design.md, the C4 level and why; all NO is recorded here as the skip record, verify by this line naming all five answers, the chosen shape, and the C4 level
  - Gate record: **T1 cross-cutting YES** — the change spans two capabilities' specs (adr gains the two op requirements; gherkin gains the guard-remedy requirement and the store-travel amendment) while also touching extension-claimed files (index.ts, tests/tools.mjs) with no extension spec edit: the ops, the guard, and the tool registration interlock through one shared module, so no single capability holds the whole story. **T2 architecture bet NO** — every structural choice follows an established pattern: a zero-dependency door lib in scripts/ (grammar-law.mjs precedent), ops as thin dispatch over a deep library (backlog op precedent), refusal-with-remedy phrasing (backlog op style). **T3 shared seam YES** — the ADR claims index, the glob matcher, and the status vocabulary extract from scripts/spec-drift.mjs into a single module both the guard and the ops import; this is the change's core. **T4 invariant risk NO** — the guard refactor is behavior-preserving (clean-tree output byte-identical before/after, checked against a captured baseline; the check-tag set is unchanged); the remedy-text growth stays inside existing findings. **T5 parallel work NO** — no other open change exists, no file collision. **Chosen shape: short design note above this tick (T1/T3 YES, T2/T4 NO — no design.md). C4 level: N/A — no design document.**
  - Design note (T3): the shared source is `scripts/adr-index.mjs` — a zero-dependency door lib importing only `./grammar-law.mjs` — exporting the claims index builder (decision frontmatter → id, file, status, supersedes, title, code globs), the glob matcher, and a re-export of ADR_STATUSES. The guard imports `./adr-index.mjs` (store copies travel through DOOR_SCRIPTS; adopting stores carry only cdd/scripts/*, which rules out a lib/ home); the op library `lib/adr-ops.mjs` (lib/backlog.mjs pattern: pure functions over the store plus a direct-execution refusal) imports `../scripts/adr-index.mjs`; index.ts adds two thin ops whose refusal and help text derive the status vocabulary from the shared constant, never re-typed.
  - R1 disposition (post-review amendment): finding F2 accepted — the change gains a third capability (extension: ADDED thin-dispatcher requirement, backlog-op precedent), so the T1 clause "no extension spec edit" above is superseded; the T1 YES answer itself is unchanged (three capabilities now, not two). F1 (ADR-0012 in the overlap set), F3 (byte-identity scoped to the sequenced isolation check), and F4 (PF-19 mechanism = backlog resolve note-merge) are fixed in the proposal and the findings file holds the dispositions.

## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
  - Charter datapoint (R1, director-directed): the cold reviewer corrected the `--code lib/templates.mjs` expected set against the very matcher this change extracts — ADR-0012's `lib/*.mjs` star glob claims the file post-PF-20. Computed expectations need a cold eye.
- [x] 3.2 .2 Extraction-only (evidence via worktree proof): write `scripts/adr-index.mjs` (claims index builder, globToRe, ADR_STATUSES re-export), refactor `scripts/spec-drift.mjs` to import it, grow DOOR_SCRIPTS in `lib/templates.mjs`, regenerate the store copies, extend `tests/acceptance/gherkin-guard-placeholder.test.js` to compare all three traveling pairs, then prove zero behavior change by running the guard in a git worktree at ecbdafe holding ONLY the extraction files and cmp-ing stdout, stderr, and exit code against the captured pre-change baseline — the cmp result rides the feature commit message (single-feature-commit shape per director approval; L2 makes per-task code commits unstageable once the package is committed) — verify by the worktree cmp of /tmp/guard-before.stdout and /tmp/guard-before.stderr plus `node tests/acceptance/gherkin-guard-placeholder.test.js` exit 0 — byte-identity proven via worktree baseline: guard stdout+stderr cmp-identical at ecbdafe+extraction vs pre-change baseline, exit 0
- [x] 3.3 .3 adrs op: `lib/adr-ops.mjs` (statusHint with the tie rule parameterized, path normalization, reverse lookup, directory semantics) + index.ts registration (enum, OPS_DOC deriving the status vocabulary from the shared constant) — RED-first acceptance scenarios in `tests/acceptance/adr-ops.test.js` (table, filter, distance hint, prefix hint, overlap set, ./ absolute outside-root, directory, empty+hint, help documentation, unknown option sort=alpha) and T3i in `tests/tools.mjs` — verify by `node tests/acceptance/adr-ops.test.js` exit 0 — node tests/acceptance/adr-ops.test.js — 15 passed, 0 failed
- [x] 3.4 .4 reconfirm op: append the pinned line, refusals (unknown id, superseded, missing change, missing evidence, same-change-twice, unknown option force=true), post-archive `--change`, `--check` listing (both branches), store sweep — RED-first acceptance scenarios in `tests/acceptance/adr-reconfirm.test.js` and T3j in `tests/tools.mjs` — verify by `node tests/acceptance/adr-reconfirm.test.js` exit 0 — node tests/acceptance/adr-reconfirm.test.js — 11 passed, 0 failed
- [x] 3.5 .5 Corpus migration: fold every legacy reconfirmation line in the 12 ADRs to the pinned grammar, dating dateless lines from their change's archive folder — verify by the store-sweep scenario in `tests/acceptance/adr-reconfirm.test.js` exit 0 — 69 blocks folded across 11 ADRs; RC11 corpus sweep green; every record matches the pinned grammar
- [x] 3.6 .6 Guard remedy text: A1 names `cdd adrs --code`, A2 names `cdd reconfirm`, store copy regenerated byte-identical — RED-first `tests/acceptance/guard-adr-remedies.test.js` — verify by `node tests/acceptance/guard-adr-remedies.test.js` exit 0 and `cmp scripts/spec-drift.mjs cdd/scripts/spec-drift.mjs` — node tests/acceptance/guard-adr-remedies.test.js — 2 passed, 0 failed; store copy cmp-identical
- [x] 3.7 .7 Agreement pin: synthetic git repository where `cdd adrs --code <file>` and the guard's A1 citations answer the same governing set — RED-first `tests/acceptance/adr-index-agreement.test.js` (also pins the 12-entry index and the single matcher definition) — verify by `node tests/acceptance/adr-index-agreement.test.js` exit 0 — node tests/acceptance/adr-index-agreement.test.js — 3 passed, 0 failed (AG3: op set == guard A1 citations)
- [x] 3.8 .8 Tool declaration: enum 7→9, help loop lists adrs+reconfirm, lean budget holds, statusHint tie rule pinned with a synthetic vocabulary — verify by `node tests/tools.mjs` exit 0 — node tests/tools.mjs — 18 passed, 0 failed (budget 900 for nine ops)
- [x] 3.9 .9 PF-19 close-out: `cdd backlog resolve` PF-19 to done with the note naming adr-ops, then the full acceptance corpus end to end — verify by `node tests/tools.mjs && for f in tests/acceptance/*.test.js; do node "$f" || exit 1; done` exit 0 and PF-19's note in `cdd/backlog.md` naming adr-ops — PF-19 resolved done with note naming adr-ops (note-merged, original preserved); PF-27 recorded; full corpus: tools 18/18 + 34 acceptance files green


## Done When Traceability

| criterion | task ids |
|---|---|
| `cdd adrs` lists all 12 ADRs and `--code lib/templates.mjs` returns exactly ADR-0006/0007/0008/0009/0011/0012 in id order | 3.3, 3.8 |
| on a synthetic repo state, `cdd adrs --code` and the guard's A1 check answer the same governing set | 3.2, 3.7 |
| `cdd reconfirm` appends the pinned line (open + post-archive), refuses all five refusals, `--check` lists moved claims | 3.4 |
| every reconfirmation line in all 12 ADRs matches the pinned grammar, held by a store-sweep pin | 3.5 |
| guard clean-tree output byte-identical to the baseline at the extraction-only state; PF-19 resolved with a note naming adr-ops | 3.2, 3.9 |

## 4. Close

- [x] 4.1 Standards-axis change code review — run skill `cdd-code-review` with the standards-axis brief (brief-r3-standards.md) over the diff since the change branched, in its own cold session; findings at `reviews/r3-standards-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-standards-code-review.md holding no open blocker (cold deepseek-v4-pro session; 3 findings — F001/F002 fixed, F003 won't-fix; dispositions appended in-file; no open blocker)
- [x] 4.2 Spec-axis change code review — run skill `cdd-code-review` with the spec-axis brief (brief-r3-spec.md) over the same diff, in a second cold session; findings at `reviews/r3-spec-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-spec-code-review.md holding no open blocker (cold deepseek-v4-pro session; 6 findings — 4 fixed with sponsored scenarios + pins RC12–RC15, 2 won't-fix by design; dispositions appended in-file; no open blocker)
- [x] 4.3 ADR review — if this change drafted an ADR under `cdd/decisions/` or amended one's decision content (a Reconfirmed-by paragraph or a typo fix does not count), run skill `cdd-adr-review` on them (findings at `reviews/adr-review.md` per that skill); if none, record the skip on this line, verify by reviews/adr-review.md holding no open blocker or a skip recorded on this line (SKIP: no ADR drafted or amended — the corpus edits are bookkeeping only: reconfirmation lines in the pinned grammar + the one-time migration of existing lines to it; no decision content touched)
- [x] 4.4 cdd validate strict green, guard green (strict PASS; `node cdd/scripts/spec-drift.mjs` → "spec-drift: clean (7 specs, 34 acceptance test files, full scan)" exit 0)
- [x] 4.5 Archive — pair-commit: feature commit, then archive commit
