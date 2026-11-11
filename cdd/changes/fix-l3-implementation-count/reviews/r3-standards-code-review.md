# R3 Standards-axis code review — fix-l3-implementation-count

**Reviewer model:** `opencode-go/deepseek-v4.1-flash`
**Independence form:** cold sub-agent session, briefed from disk only; author family zai vs reviewer family deepseek — rule 2b holds
**Status:** COMPLETE
**Diff under review:** `git diff 91fe446...HEAD` (`91fe446` → `0701680` "fix(guard): L3 task-scale law counts implementation subtasks only"), clean worktree, no staged or untracked files.

## Standards sources found

No dedicated standards file exists in this repo: `CODING_STANDARDS.md`, `CONTRIBUTING.md`, `AGENTS.md`, `CLAUDE.md` are all absent
(`ls` at repo root; only `GLOSSARY.md`, `MAINTENANCE.md`, `PRODUCT.md`, `README.md`). `MAINTENANCE.md` is process/maintainer
documentation and `README.md` describes workflow doors — neither states code-writing rules. The standards that do bind are
decisions and spec rules:

- **ADR-0012** (`cdd/decisions/0012-comments-are-shape-only.md`) — comments are shape-only; banlist: corpus routing (ADR/PF ids,
  spec or change names, commit ids), WHY-prose, WHAT-restating, hand-maintained indexes. Mechanically enforced on
  `index.ts`, `lib/`, `scripts/`, `.githooks/` only (`tests/acceptance/comment-law.test.js:192-193`).
- **ADR-0001** (zero dependency), **ADR-0007** (the law behind every door), **ADR-0013** (one claim map).
- `cdd/rules.md` rule 6 (the 8/12 thresholds are *implementation subtask* counts), rule 10 (no spec markers in source).

Tooling-enforced items (comment scanner above; the byte-identity pin `tests/acceptance/gherkin-guard-placeholder.test.js`
P5 for `scripts/spec-drift.mjs` ↔ `cdd/scripts/spec-drift.mjs`) are not reported.

## Findings

### R3S-F001 — `should` — the clean-summary count is store-wide and staged-blind, while the law it reports on is per-file and staged-scoped

- **Finding:** `implSubtasksPhrase` sums implementation subtasks over *every* open change's tasks file and ignores
  `facts.staged`, so the always-on clean line can print a number above `TASK_LIMIT` on a green run and reports files the law
  never judged in staged/pre-commit mode. Smell: Divergent Change in one observable's scope (Duplicated Code of the counting
  shape with a different filter).
- **Evidence:** `scripts/spec-drift.mjs:669-675`
  (`for (const { text } of facts.tasksTexts.values()) n += implSubtaskCount(text);`) versus the law's own filter four lines
  later at `scripts/spec-drift.mjs:680` (`if (facts.staged && !facts.stagedSet.has(rel)) continue;`), consumed at
  `scripts/spec-drift.mjs:784`. Three open changes with 5 subtasks each print `15 implementation subtasks` on a clean scan while
  the limit is 12; the pre-commit hook runs this line in staged mode (`.githooks/pre-commit:2`).
- **Impact:** operator-facing only — no verdict changes, no issue suppressed. The line reads as law-relevant scale next to a
  per-file threshold of 12, so a healthy multi-change store looks like it should have failed.
- **Smallest safe fix:** pass the same `(rel, text)` set `checkL3` iterates (per-change or staged-filtered) into the phrase, or
  label it as a store total (`${n} implementation subtasks across open changes`).
- **Disposition:** open

### R3S-F002 — `should` — the committed R2 review header contradicts itself and miscounts its own findings

- **Finding:** Duplicated Code / copy-paste residue in a committed artifact: two consecutive `**Status:**` lines that disagree
  about dispositions, both stating a severity split the file does not have (it holds 5 `should` + 2 `note`, not 4 + 3), plus a
  fractured duplicated sentence in the coverage section.
- **Evidence:** `cdd/changes/fix-l3-implementation-count/reviews/r2-change-review.md:4-5` (line 4 "all disposition `open`", line 5
  "author dispositions in the final section"), both claiming "4 `should`, 3 `note`"; finding headers are F001–F004 and F007
  `should`, F005–F006 `note`. Same file `:257-258`:
  `the 1757-line living spec (read in the regions the delta touches and the requirements its laws` /
  `the 1757-line living spec (read in the regions the delta touches and the requirements its laws cite).`
- **Impact:** the status header is the part a reader (and the 4.1 tick, which checks for "no open blocker") trusts; a
  self-contradicting header with a wrong finding count undermines the review record this change archives.
- **Smallest safe fix:** keep one Status line with the true split (5 `should`, 2 `note`), delete the second, and delete the
  fragment at `:257` leaving `:258`.
- **Disposition:** open

### R3S-F003 — `note` — the new pin's header routes to a change folder that rots at archive

- **Finding:** ADR-0012 bans corpus routing in comments; the scanner's roots (`index.ts`, `lib/`, `scripts/`, `.githooks/`)
  exclude `tests/`, so this is unenforced — but the cited path is deleted by the very act this change ends with.
- **Evidence:** `tests/acceptance/guard-l3-scope.test.js:5-6`
  (`The scenarios mirror cdd/changes/fix-l3-implementation-count/specs/gherkin/spec.md and run both real doors`). Sibling test
  comments cite directory-level corpus paths only (`tests/acceptance/decisions-home.test.js:2`,
  `tests/acceptance/guard-memory-claims.test.js:3`). `archiveChange` moves the folder to `cdd/archive/<date>-<name>/`
  (`lib/store.mjs`), so the pointer is stale the moment this change closes.
- **Impact:** low; a comment-only pointer that becomes wrong, which is exactly the rot ADR-0012 argues against.
- **Smallest safe fix:** drop the path — "the four scenarios in this change's delta" — or cite the living requirement instead.
- **Disposition:** open

### R3S-F004 — `note` — the count's section selection is re-implemented in the guard instead of the law module both doors import

- **Finding:** Duplicated Code (judgement call): `lib/store.mjs:210` already defines the same selection
  (`implementation: sections.find((s) => s.num === 3) ?? null`) and both files import `splitTaskSections` from
  `scripts/grammar-law.mjs`, which ADR-0007 names as the law behind every door. The guard spells it again as
  `filter((s) => s.num === 3).reduce(...)`, so the two selection shapes differ in more than style: on a tasks file with a
  duplicated `## 3. Implementation` heading the guard counts both sections while the validator takes the first.
- **Evidence:** `scripts/spec-drift.mjs:666-667` vs `lib/store.mjs:210`; shared import at `lib/store.mjs:20` and
  `scripts/spec-drift.mjs:34`.
- **Impact:** low, and masked by door 1's skeleton error on such a file; the surface cost is that the change's "same count,
  one law" claim rests on a pin (`guard-l3-scope.test.js` S4) rather than on construction. Moving the helper into
  `scripts/grammar-law.mjs` would pull `cdd/scripts/grammar-law.mjs` into the diff and a store refresh with it, which is why
  the local choice is defensible.
- **Smallest safe fix:** export `countImplementationSubtasks(text)` from `scripts/grammar-law.mjs` and use it on both sides,
  or make the guard's shape match `parseTasks` (`find(...)?.items.length ?? 0`).
- **Disposition:** open

### R3S-F005 — `note` — the rewritten L3 header left a ragged sentence break

- **Finding:** the re-wrap after the edit stranding "The design" at the end of one line and "gate (T5)" at the start of the next
  reads like a broken sentence in the law's shape documentation. Judgement call; nothing enforces comment wrap.
- **Evidence:** `scripts/spec-drift.mjs:661-662`
  (`// never work-plan scale. The design` / `// gate (T5) fires at >8 as foresight; ...`).
- **Impact:** readability of the block that documents the law; the same ragged wrap exists in `cdd/scripts/spec-drift.mjs`.
- **Smallest safe fix:** re-flow those four lines in `scripts/spec-drift.mjs` and re-copy the store copy (task 3.4's `cmp`).
- **Disposition:** open

## Checked and suppressed

- **`(rule 6)` in the new comments** (`scripts/spec-drift.mjs:660,670`): not a banned class in the scanner's banlist, and it
  matches the pre-existing doc-comment idiom of the law module (`scripts/grammar-law.mjs:30,33`) — suppressed as local
  convention, not a violation.
- **Byte-identical duplication of the guard hunk** in `scripts/spec-drift.mjs` and `cdd/scripts/spec-drift.mjs`: mandated by the
  store-copy pin (P5), reproduced verbatim in the diff — not Duplicated Code.
- **Hard-coded section number `3`**, **arrow-const vs function-declaration mix**, **`=== 1` vs `> 1` pluralization** in
  `report()`: all consistent with pre-existing shape in the same files (`scripts/spec-drift.mjs:297-333`, `:784`).
- **Sandbox helper duplication** in the new test (`check`, `assert`, `gitRepo`, `runScan`): every acceptance test in
  `tests/acceptance/` is self-contained by convention; no shared helper module exists and the spec does not ask for one.
- **Out of scope (pre-existing):** the garbled "— and, if the change drafted an ADR … does not count, `cdd-adr-review`"
  sentence in `cdd/changes/…/tasks.md:46-47` is interpolated verbatim by `lib/instructions.mjs:160-161`, which is untouched by
  this diff.
- **Test observability** (`guard-l3-scope.test.js` S4 scrapes the clean summary for the guard count) is the direct consequence of
  R3S-F001's design choice — reported once, there.

## Coverage

Inspected the full range: the guard hunk in both copies, `tests/acceptance/guard-l3-scope.test.js` (all 167 lines), the delta,
`proposal.md`, `tasks.md`, `GLOSSARY.md` hunk, and `reviews/r2-change-review.md`; plus `lib/store.mjs`, `lib/validate.mjs`,
`scripts/grammar-law.mjs`, `tests/acceptance/comment-law.test.js`, `lib/instructions.mjs`, `.githooks/pre-commit`, and the CI
workflow. No build, test run, formatter, or package command was executed (no verification effects); no repository file was
modified except this findings file.

## Author dispositions (2026-11-11)

- R3S-F001 `should`: fixed — `implSubtasksPhrase` deleted rather than rescoped; the clean line carries no count (unsponsored output, per the spec axis's R3S-F001), which also retires the staged-blind store-wide sum.
- R3S-F002 `should`: fixed — one `**Status:**` line with the true split (5 `should`, 2 `note`); the fractured duplicate sentence removed.
- R3S-F003 `note`: fixed — the pin header no longer cites the change-folder path; it names the delta and its archive destination.
- R3S-F004 `note`: fixed — `implSubtaskCount` takes the validator's own selection shape (`find`, first section numbered 3), matching `parseTasks` (`lib/store.mjs`) by construction; store copy refreshed byte-identical.
- R3S-F005 `note`: fixed — the L3 header comment re-flowed; store copy refreshed.
