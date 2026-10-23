# R3 standards-axis code review — guard-glob-fix

- **Review point:** R3 (Close, before archive)
- **Axis:** Standards — does the code follow this repository's documented coding standards?
- **Mode:** cold, first-class subagent session; model `opencode-zen/deepseek-v4.1-flash` (provider `opencode-zen`); not the author of any reviewed artifact; non-zai family (author family: zai)
- **Date:** 2026-10-23
- **Range:** branch `guard-glob-fix` @ base `24fc6f829bffc4c04fffa081a05a7071a29c5995` (= HEAD; `git diff main...HEAD` is empty because the whole change is uncommitted). Modified: `scripts/spec-drift.mjs`, `cdd/scripts/spec-drift.mjs` (byte-identical, `cmp` clean). Untracked: `cdd/changes/guard-glob-fix/`, `tests/acceptance/guard-glob-claims.test.js`, `tests/acceptance/guard-memory-claims.test.js`. Findings are **advisory**; the author disposes. No verdicts.

## Summary

Two note-level findings; no blocker or should. The guard code follows the file's own conventions
(`// ===` banner + `// Lx — title` heading per check, `[X]`-tagged issue strings quoting exact
paths and ending in an action, zero new dependencies, loop-1/2 doors untouched). Both new test
files match the sibling `tests/acceptance/guard-pair-commit.test.js` harness (self-contained
`mkdtempSync` git sandboxes, `lib.initStore(root, REPO, {})`, `check(id, name, fn)` with
descriptive ids, exact expected-vs-actual failure messages, real-door child-process invocation,
`process.exit(1)` on failure). The change artifacts follow `cdd/rules.md` (delta shape, Verified-by
as the only in-fence comment, task numbering + `verify by` + Done-When Traceability placement,
`split-considered:` recorded, design.md exactly 4 H2 sections + one mermaid). What I checked and
cleared is enumerated under Coverage.

## Findings

### note — scripts/spec-drift.mjs:14-56 (and cdd/scripts/spec-drift.mjs:14-56) — the header check index does not list the new L4 law

- **What:** The script's opening contract enumerates the check families it runs (L1 traceability, L2
  staleness, M mechanical integrity, O single owner, `--staged` scoping, L3 scale, A0/A1/A2
  architectural decisions). The change adds an L4 law with a full banner at
  `scripts/spec-drift.mjs:348-360`, but the header index is not extended.
- **Why it violates the standard:** the file's own convention is that the header doubles as the map
  of which check tag means what and which door owns it; a reader who starts from the header and
  greps for a tag (the intended entry point per the `L1 traceability (always, no git needed)` /
  `L2 staleness (living specs with git history)` phrasing) will not find L4. This is a low-impact
  documentation-drift, not a behavior defect.
- **Precedent (so as not to overstate it):** the header already omits the pre-existing `[G]`
  (gherkin fences, banner at `scripts/spec-drift.mjs:538`) and `[H]` (hook health, banner at
  `scripts/spec-drift.mjs:337-343`). Adding L4 therefore follows the existing incomplete-header
  practice; it is a note, not a violation of a rule the author broke alone.
- **Suggested compliant shape:** add one short bullet to the header beside the L3 block, e.g.
  `// L4 memory claims (full scan): no Code: line may claim cdd/decisions/** — ADRs answer to the
  A-checks. An open delta's claim reds; a living claim reds unless an open change of the same
  capability corrects that requirement.` (Optionally also add the missing G and H entries so the
  index is exhaustive.)

### note — scripts/spec-drift.mjs:425 and scripts/spec-drift.mjs:434 — the `[L4]` issue message is a 230-character literal duplicated verbatim

- **What:** The same issue string is written out twice, once in the delta loop
  (`scripts/spec-drift.mjs:425`) and once in the living-loop `else` branch
  (`scripts/spec-drift.mjs:434`):
  `[L4] ${specRel} requirement "${heading}" claims decision memory in Code line "${glob}" — decision memory answers to the A-checks (A0/A1/A2 govern cdd/decisions/ unconditionally); a Code line claims implementation surface (name the enforcing acceptance test instead)`
- **Why it violates the standard:** the file's pattern is one message template per check, written
  at the point it fires (L1/L2/G/O/A all emit their message inline from a single site). Two copies
  of a long, contract-bearing sentence can drift apart under a future wording fix, and the two
  branches are required to stay identical.
- **Suggested compliant shape:** hoist one helper next to the check, e.g.
  `const l4Issue = (specRel, heading, glob) => \`[L4] ${specRel} requirement "${heading}" claims decision memory in Code line "${glob}" — decision memory answers to the A-checks (A0/A1/A2 govern cdd/decisions/ unconditionally); a Code line claims implementation surface (name the enforcing acceptance test instead)\`;`
  and call it at both sites.

## Coverage and verification

**Read / inspected (read-only):**
- Standards sources: `cdd/rules.md` (rules 2a/2b/2c, 3, 4, 5, 6, 7, 9a, 10, 11, 11a), `package.json`
  (test chain `node tests/smoke.mjs && node tests/tools.mjs && node --test`; engines node>=20),
  `tests/acceptance/guard-pair-commit.test.js` as the de-facto harness standard, and the
  `cdd/changes/20261023-law-guard-fixes/` artifact shape. No `AGENTS.md`/`CLAUDE.md` exists at the
  repo root.
- Guard code: `scripts/spec-drift.mjs` header (`:1-76`), `globToRe` (`:220-243`), L4 block
  (`:348-440`), caps filter (`:453-461`), L2-hint + skip printing (`:716-750`), and the identical
  `cdd/scripts/spec-drift.mjs`.
- Tests: `tests/acceptance/guard-glob-claims.test.js` (all 150 lines, GGC1-GGC5) and
  `tests/acceptance/guard-memory-claims.test.js` (all 253 lines, MC1-MC9).
- Artifacts: `proposal.md`, `design.md`, `tasks.md`, `specs/gherkin/spec.md`, `specs/adr/spec.md`,
  and the R1/R2 findings for dispositions (not re-litigated).

**Cleared checks:**
- Banner/heading convention: the new L4 banner at `scripts/spec-drift.mjs:348` uses the same
  `// =====` / `// L4 — <title>` shape as L1/L2/L3/A; `[L4]` issue strings quote exact
  `${specRel}`, `${heading}` and `${glob}` paths and end in an action (as L1/L2/G/O do).
- Informational-skip pattern: the `[L4-skip]` line is a `console.log` with a `spec-drift:` prefix,
  printed before the report block — the same placement as the pre-existing L2 expected-mid-Close
  hint (`scripts/spec-drift.mjs:716-733`), so it is consistent with the nearest precedent
  (placeholder skips are the only ones printed after the clean summary). Not flagged.
- Zero dependencies: `globToRe` is a hand-rolled translator with no imports; both doors 1-2 and the
  no-new-dependency rule hold.
- `scripts/spec-drift.mjs` and `cdd/scripts/spec-drift.mjs` are byte-identical (`cmp` exits 0).
- Test-file conventions: both new files match `guard-pair-commit.test.js` — `#!/usr/bin/env node`,
  a rationale header comment naming the failure shape, `import * as fs/os/path`, `execFileSync`
  child-process invocation of the real door (`--staged` / `--commit-msg`), `lib.initStore`,
  symlinked `node_modules`, a `check(id, name, fn)` harness with `ok`/`FAIL` lines, descriptive ids
  (GGC1-5, MC1-9) and names, failure messages that carry the actual output, and
  `process.exit(1)` on any failure. Both pinpoint counts ("exactly 1", "exactly 2") in assertions.
- Test-sandbox teardown: both new files leave their `/tmp/cdd-*` sandboxes behind. This matches the
  change's own sibling `tests/acceptance/guard-pair-commit.test.js` (also no `rmSync`), so it is
  consistent with the newest convention in this domain; older files (`extension-new-warning`,
  `gherkin-create-warning`, `gherkin-guard-placeholder`) do tear down. Recorded, not flagged.
- Delta shape: every gherkin fence in both deltas contains only `# Verified by:` comments (an
  `awk` scan of all in-fence `#` lines found no others); each `Feature:` equals its requirement
  heading; 40 scenarios / 40 `When` lines in `specs/gherkin/spec.md` (one `When` each); counts are
  qualified ("exactly 1", "exactly 2", "2 distinct files").
- Rule 5 (MODIFIED names living requirements): all 7 gherkin MODIFIED headings and the adr MODIFIED
  heading match a heading present in the living `cdd/specs/gherkin/spec.md` / `cdd/specs/adr/spec.md`
  exactly.
- Tasks: 4 sections, implementation subtasks each carry `verify by <test>` (14 occurrences), the
  `## Done When Traceability` table sits between §3 and §4, and the top-of-file
  `<!-- split-considered: ... -->` is recorded.
- design.md: exactly 4 H2 sections (`## Level`, `## Diagram`, `## Boundaries`, `## Alternatives`)
  and exactly one ```mermaid fence; no native C4 and no Code level (rule 2c).
- Rule 10 (no spec markers): `git diff` adds no `Verified by`/`@spec`/`spec:` marker to source; no
  added `TODO`/`FIXME`/debug `console.log` remnants. The new `PF-19`/`PF-20` comment references
  follow the committed precedent `PF-18` at `scripts/spec-drift.mjs:476` (present in the base at
  `git show HEAD:scripts/spec-drift.mjs:364`) and `PF-17` in
  `tests/acceptance/law-done-when.test.js:7`; the repo's de-facto standard permits backlog-item
  refs in comments, so these are not treated as rule-10 violations.
- Both new test files and the change's spec pins resolve: GGC1-5 → `tests/acceptance/guard-glob-claims.test.js`,
  MC1-9 → `tests/acceptance/guard-memory-claims.test.js`.

**Commands consumed (read-only, non-mutating):** `git status --short`, `git diff --stat`,
`git diff`, `git show HEAD:...`, `git log`, `cmp`, `grep`/`awk` over the guard, the tests and the
delta specs. Not run: `npm test`, `cdd validate`, or the guard itself (mutation-capable; its behavior
is out of the standards axis, and the sibling spec-axis review at
`cdd/changes/guard-glob-fix/reviews/r3-spec-code-review.md` consumed the passing runs).

## Dispositions (author)

| finding | severity | disposition |
|---|---|---|
| scripts/spec-drift.mjs:14-56 — header index omits L4 | note | FIXED — L4 bullet added to the header index after the L3 block: "L4 memory claims (full scan): a Code: line claiming cdd/decisions/** (by prefix or by compiled glob) reds as decision memory governed by the A-checks; a living claim under an open same-capability correction skips once, loudly." Both copies synced (cmp identical). |
| scripts/spec-drift.mjs:425 / :434 — duplicated `[L4]` message literal | note | FIXED — hoisted `const l4Issue = (specRel, heading, glob) => \`[L4] ...\`` (scripts/spec-drift.mjs:427, before the check block); both call sites push through it. Both copies synced (cmp identical). |
