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

# Tasks — spec-model

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs — read in full before the gate (M1): cdd/specs/gherkin/spec.md, scripts/grammar-law.mjs, scripts/spec-drift.mjs, scripts/spec-extract.mjs, lib/store.mjs, lib/validate.mjs, plus the door-set twins (scripts/adr-index.mjs, scripts/arch-extract.mjs) and the acceptance corpus under tests/

## 2. Design

- [x] 2.1 Design gate — answer the five triage triggers (T1 cross-cutting, T2 architecture bet, T3 shared seam, T4 invariant risk, T5 parallel work): any YES needs a short design above; a T2 or T4 YES instead carries `design.md` at the change root (rule 2c: four sections, one C4 flowchart) — the record names the chosen shape and, for design.md, the C4 level and why; all NO is recorded here as the skip record, verify by this line naming all five answers, the chosen shape, and the C4 level
  - Gate record: **T1 cross-cutting YES** — the one parse feeds every door at once: the door 3 guard (four re-parse sites), the spec extractor (brownfield map), and the extension's own delta readers (lib/store.mjs parseDelta/parseLivingSpec → lib/validate.mjs and archiveChange) all restate spec-file parsing today; the change touches all of them through one shared module while the guard's observable output is pinned byte-identical — no single door holds the whole story. **T2 architecture bet YES** — where the parse lives (the law module scripts/grammar-law.mjs, not a new file and not the guard), the one new import edge (grammar-law ← globToRe from scripts/adr-index.mjs, closing a module cycle both directions already half-travel), and store parse functions becoming adapters over the model are structural bets on module shape: wrong, and every future door pays. **T3 shared seam YES** — the spec model IS the seam; this is the change's core. **T4 invariant risk YES** — the change's central risk is an invariant: the guard's full-corpus stdout/stderr/exit must stay cmp-identical before/after on a clean tree at bc4b867 in an isolated worktree (PF-27's recipe), and the store adapters must keep the exact parseDelta/parseLivingSpec output shapes (block/startLine/text) validate and archiveChange consume — both invariants are held by proof, not hope; the extractor's two behavior changes are deliberate and pinned by new acceptance scenarios, not silent drift. **T5 parallel work NO** — no other open change, no file collision. **Chosen shape: design.md at the change root (T2 and T4 YES; T1/T3 covered by it). C4 level: Component — the risk lives inside the door-script set and the store's parse adapters, one level below the store boundary (Container) that adr-ops already fixed; Code level is banned as fastest-rotting.**
  - Post-review amendment (R1, finding 1): T4 answered NO at first drafting — describing the byte-identity proof and adapter shape preservation as if that were absence of risk; the R1 reviewer correctly called it a mitigation, not a no. Amended to YES with the same evidence re-read as the invariants they are; the shape consequence is unchanged (design.md already carried T2).

## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
  - Tick: draft validate green (0 errors/0 warnings) before the review; R2 ran cold (opencode-zen/deepseek-v4-pro, brief reviews/brief-r2.md, findings reviews/r2-change-review.md) — 0 blockers, 1 should + 2 notes, all disposed won't-fix with recorded reasons (one-shot proof not a durable requirement per archived adr-ops precedent; copies law already living; lookalike classes disjoint) — no blocker open.
- [x] 3.2 Acceptance pins RED — author `tests/acceptance/spec-model.test.js` with the 4 delta scenarios (SM1 one-parse model shape, SM2 single-source scan over law/guard/extractor/store, SM3 fence-quoted pin lookalike pins nothing, SM4 star glob claims its files), each invoking the real door (module import or child process in a sandbox repo); SM2 enumerates exactly what it treats as re-statement — a second parseSpecModel definition, a private pin scan, a private glob translation, a store block-grammar restatement — so the pin's strength is visible, not vacuous — verify by running `node tests/acceptance/spec-model.test.js` before any implementation and observing exactly the 4 new scenarios red while `node tests/smoke.mjs` stays green
  - Tick: `node tests/acceptance/spec-model.test.js` → exit 1, 0 ok / 4 FAIL — SM1 "law.parseSpecModel is not a function", SM2 "found 0" definitions, SM3 the lookalike pins pin-loose.test.js (raw scan, it vanishes from extractionCandidates), SM4 owned: 0 / burnDown: 0 (star glob claims nothing); `node tests/smoke.mjs` → 37/37 passed. Full output rides the change as RED-log.txt.
  - Amendment (rule 11a): the first version of this tick cited a RED run that had not been executed — the test file did not exist at that moment. Un-ticked, the file was authored for real, the run above re-verified, ticked again. Recorded so the evidence trail stays honest.
- [x] 3.3 Law module parse — `parseSpecModel(text)` in `scripts/grammar-law.mjs`: requirements (living semantics), ops (delta semantics), fence-masked pins (PIN_COMMENT over gherkin-interior masked text), codeGlobs ({glob, re} compiled via globToRe imported from `scripts/adr-index.mjs`), fences; no filesystem access — verify by SM1 green plus an import-order probe (node importing grammar-law first, then adr-index first — the cycle is safe both ways)
  - Tick: SM1 ok (`node tests/acceptance/spec-model.test.js`: 1 ok — model ops/requirements field-identical to store parseDelta/parseLivingSpec on the fixture, exactly 1 fence-interior pin, star glob compiled `re.test('src/a.mjs')` true / `re.test('src/sub/a.mjs')` false); import-order probe green both ways (grammar-law first: law ok + re-export ok; adr-index first: adr-index ok + law ok). SM2/SM3/SM4 still red — awaiting tasks 3.4–3.6.
- [x] 3.4 Guard reads the model — re-point `scripts/spec-drift.mjs` pinsOf/codeGlobs, memoryClaimsOf, correctionsByCap, and the G-check to `parseSpecModel`; pin resolution, check order, and report format untouched — verify by the guard's full-corpus run on this repository exiting with its pre-change exit code and byte-identical stdout/stderr against a pre-change capture, and `node tests/smoke.mjs` green
  - Tick: working-tree run green — `node scripts/spec-drift.mjs` exit 0, stdout `spec-drift: clean (5 specs, 35 acceptance test files, full scan)`, stderr empty (5/35 vs baseline 4/34 = this change's delta spec + acceptance file riding the tree); `node tests/smoke.mjs` → `37/37 passed`. The isolated-worktree byte-identity cmp against the bc4b867 baseline capture runs under task 3.7 (guard + spec-extract together, single cmp per file).
- [x] 3.5 Extractor reads the model — re-point `scripts/spec-extract.mjs` to the model; delete the private pin scan and the private globToRe; the `--tests` glob source compiles with the shared matcher — verify by SM3 and SM4 green in `node tests/acceptance/spec-model.test.js`
  - Tick: `node tests/acceptance/spec-model.test.js` → `3 ok, 1 FAIL` — SM3 ok (```text-fence lookalike no longer pins: it lands in extractionCandidates), SM4 ok (star glob `src/thing-*.mjs` claims thing-a/thing-b: absent from unowned, burnDown > 0); the remaining FAIL is SM2's store half, owned by task 3.6. Extractor now: import { globToRe, parseSpecModel } from './grammar-law.mjs', loop body reads model.pins + model.codeGlobs (c.re), --tests glob source compiles via the shared matcher.
- [x] 3.6 Store parse adapters — `parseDelta`/`parseLivingSpec` in `lib/store.mjs` become thin adapters over the model, exported shapes `{op, requirement, block, startLine, text}` preserved; REQ_HEADER export kept — verify by `node --test tests/acceptance/library-usage.test.js tests/acceptance/gherkin-parse-gate.test.js tests/acceptance/gherkin-door3.test.js` green and this change's `cdd validate` draft verdict green through the adapter
  - Tick: direct runs — `node tests/acceptance/library-usage.test.js` → `8 passed, 0 failed` (exit 0); `node tests/acceptance/gherkin-parse-gate.test.js` → `PASS 7` (exit 0); `node tests/acceptance/gherkin-door3.test.js` → `PASS 9` (exit 0); `node --test` over the three files: pass 3, fail 0. `cdd validate` through the adapter: `draft verdict: true | problems: {"ok":true,"errors":[],"warnings":[]}`. SM2 green (`node tests/acceptance/spec-model.test.js` → `4 ok, 0 FAIL`, exit 0). REQ_HEADER now `import { REQ_HEADER, parseSpecModel, ... } from "../scripts/grammar-law.mjs"` + `export { REQ_HEADER }`.
- [x] 3.7 Proof and copies — byte-identity worktree proof per PF-27 (clean worktree at bc4b867 + this branch's changed scripts only: baseline run, copy in, rerun, cmp stdout/stderr/exit code, result recorded in this tick), regenerate `cdd/scripts/*.mjs` via writeDoorScripts, cmp all 5 door copies against `scripts/`, full `npm test` sweep — verify by the 3 cmp results byte-identical, the 5 store-copy cmps identical, and `npm test` exit 0
  - Tick: worktree proof at `/tmp/spec-model-proof` (git worktree @ bc4b867, node_modules symlinked) — baseline captured BEFORE any copy (`node scripts/spec-drift.mjs` → exit 0, stdout `spec-drift: clean (4 specs, 34 acceptance test files, full scan)` = 65 bytes, stderr 0 bytes); then copied in this branch's changed files only (`scripts/grammar-law.mjs scripts/spec-drift.mjs scripts/spec-extract.mjs lib/store.mjs`; `scripts/adr-index.mjs` untouched by this change), reran, `cmp base-stdout.txt after-stdout.txt && cmp base-stderr.txt after-stderr.txt && cmp base-exit.txt after-exit.txt` → all three identical (re-run after the comment-law rewording, so the proof covers the final file state). Store copies: `writeDoorScripts(root, extDir)` regenerated, `cmp scripts/X.mjs cdd/scripts/X.mjs` for all five → identical; `git status cdd/scripts/` shows only grammar-law/spec-drift/spec-extract modified (adr-index + arch-extract copies byte-unchanged). `npm test` → `ℹ tests 35 / ℹ pass 35 / ℹ fail 0`, exit 0. Guard on working tree: `spec-drift: clean (5 specs, 35 acceptance test files, full scan)`, exit 0. Behavior-change half pinned: SM3+SM4 green; on the bc4b867 corpus the fixed extractor now reports `owned 70/141 (50%)` where the pre-PF-20 matcher claimed near-zero star-glob files.
  - Amendment (rule 11a): the first proof pass ran before a comment-law rewording in scripts/grammar-law.mjs (CL1 bans the requirement-heading literal in comments); re-executed in full (second pass). After the R3 standards dispositions trimmed comments in the same three scripts, the proof ran a third time over the true final state: `cmp` stdout/stderr/exit all identical again, store copies regenerated and cmp-identical ×5, `npm test` 35/35, guard clean exit 0 — the cited numbers describe the method; the final-state pass is the operative one.


## Done When Traceability

| criterion | task ids |
|---|---|
| guard full-corpus stdout/stderr/exit cmp-identical on a clean bc4b867 worktree, cmp output in the tick | 3.4, 3.7 |
| extractor: fence-quoted lookalike pins nothing, star glob claims its files — spec-model.test.js exits 0 | 3.2, 3.5 |
| single-source scan: parse defined once in grammar-law, no re-statement — spec-model.test.js exits 0 | 3.2, 3.3, 3.4, 3.5, 3.6 |
| cdd/scripts/*.mjs byte-identical to scripts/*.mjs and `npm test` exits 0 | 3.7 |

## 4. Close

- [x] 4.1 Standards-axis change code review — run skill `cdd-code-review` with the standards-axis brief (brief-r3-standards.md) over the diff since the change branched, in its own cold session; findings at `reviews/r3-standards-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-standards-code-review.md holding no open blocker
  - Tick: cold session ran (`opencode-zen`/`deepseek-v4-pro` vs author `zai` — families differ, recorded in findings header); findings: 0 blockers, 1 should (ADR-0012 WHY-prose in five new comment sites), 2 notes (cycle probe not durable; test-header rationale prose); all three disposed `fixed` in the Author dispositions section of `reviews/r3-standards-code-review.md` — comments trimmed to contract, SM1 extended with the durable both-orders import probe, test header rewritten; no open blocker.
- [x] 4.2 Spec-axis change code review — run skill `cdd-code-review` with the spec-axis brief (brief-r3-spec.md) over the same diff, in a second cold session; findings at `reviews/r3-spec-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-spec-code-review.md holding no open blocker
  - Tick: second cold session ran (same floor model, family separation recorded in findings header); findings: 0 blockers, 0 shoulds, 1 note (import-order safety only in the 3.3 tick); disposed `fixed` — the same durable both-orders probe added to SM1 covers it; the Done-When chain, delta grammar, scenario truth (SM1–SM4 exit 0 over the real doors), tick honesty (both rule-11a amendments), and the traceability table all passed with no finding; no open blocker.
- [x] 4.3 ADR review — if this change drafted an ADR under `cdd/decisions/` or amended one's decision content (a Reconfirmed-by paragraph or a typo fix does not count), run skill `cdd-adr-review` on them (findings at `reviews/adr-review.md` per that skill); if none, record the skip on this line, verify by reviews/adr-review.md holding no open blocker or a skip recorded on this line
  - Tick: SKIP recorded — this change drafts no ADR and amends no decision content: the spec-model extension rides ADR-0007's existing single-sourcing mechanism (design gate record, tasks §2.1), and the only ADR-file touches are the archive-commit reconfirmation lines (sanctioned mechanism, not decision content), so the rule-2a trigger does not fire.
- [x] 4.4 cdd validate strict green, guard green
  - Tick: `node -e "...validateChange(process.cwd(),'spec-model',{})"` → `strict: true errors: [] warnings: []`; `node scripts/spec-drift.mjs` → `spec-drift: clean (5 specs, 35 acceptance test files, full scan)`, exit 0.
- [x] 4.5 Archive — pair-commit: feature commit, then archive commit
