# R3 Standards-Axis Code Review

- Model: `gpt-6-luna` (opencode-zen; different family from the author's zai)
- Thinking: high
- Date: 2026-10-25
- Axis: Standards
- Form: cold subagent, fresh session

## Findings

### should — `lib/stale.mjs:92-93` — fresh-node command is not shell-safe for valid paths

**Problem:** The JavaScript quoting in `q()` does not escape shell-active characters inside the surrounding `node -e "..."`. For example, executing the generated default command with the literal target root `/$HOME/Projects/pi-extensions/pi-cdd` made `bash` expand `$HOME`; `hasStore` returned `true` for the expanded project instead of the literal target. A refusal can therefore direct the user at the wrong project or fail to import the extension.

**Disposition:** fixed (0f7e3dc) — original ask: encode/escape values for the outer shell as well as JavaScript, or use a command form that avoids shell interpolation; pin paths containing `$` (and other shell-active characters).

### should — `tests/acceptance/stale-lib-guard.test.js:2` — comment carries a change marker

**Problem:** The source comment names `20261025-stale-lib-guard`, a change-folder identifier. This is a source traceability marker banned by `cdd/rules.md` rule 10 and corpus routing in comments banned by ADR-0012.

**Disposition:** fixed (0f7e3dc) — original ask: remove the change identifier from the comment; describe the test harness without corpus routing.

### note — `lib/stale.mjs:71` — unused backlog-action set

**Problem:** `MUTATING_BACKLOG` is declared but never read; `gradeOp()` classifies every non-`list` backlog action as mutating without consulting it.

**Disposition:** fixed (0f7e3dc) — original ask: remove the unused set or make the classification use it if explicit membership is intended.

### note — `lib/stale.mjs:49-50` — unused snapshot metadata

**Problem:** `mtimeMs` and `size` are stored in each snapshot entry but never read; `staleEntries()` compares only digests. The `statSync()` call and retained values add work/state without affecting detection.

**Disposition:** fixed (0f7e3dc) — original ask: remove the unused metadata unless a current consumer is intended.

### note — `tests/acceptance/stale-lib-guard.test.js:291-292` — duplicate assertion

**Problem:** Both assertions check `after.size === before.size`; the second labeled “same size” repeats the first “same length” check.

**Disposition:** fixed (0f7e3dc) — original ask: remove the duplicate or replace it with a distinct assertion.

## Severity totals

- Blocker: none
- Should: 2
- Note: 3

## Author dispositions — 2026-10-25 (fix commit 0f7e3dc)

- should S1 (shell-safety) — **fixed:** `freshNodeCommand` rewritten — payload is a
  single-quote-free `node -e '…'` program; paths travel as single-quoted trailing
  arguments (`-- '<extDir>' '<root>'`), so nothing inside the command is subject to
  shell expansion (verified by executing a command with `$HOME` in the target root:
  `process.argv` receives the literal path). Pinned in `tests/tools.mjs` T5c
  (command shape, payload single-quote-free, explicit ext/root args).
- should S2 (change marker in test comment) — **fixed:** header comment reworded;
  no change id, no corpus routing (ADR-0012 rule 10).
- note N1 (unused `MUTATING_BACKLOG`) — **fixed:** removed; `gradeOp`'s explicit
  action list is the single source.
- note N2 (unused snapshot metadata) — **fixed:** snapshot entries carry the
  digest only; `statSync` dropped from the diff entirely.
- note N3 (duplicate size assertion) — **fixed:** duplicate removed (scenario 8
  rewritten on an isolated process, see spec-axis disposition).
