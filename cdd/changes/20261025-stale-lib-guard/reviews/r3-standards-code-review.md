# R3 Standards-Axis Code Review

- Model: `gpt-6-luna` (opencode-zen; different family from the author's zai)
- Thinking: high
- Date: 2026-10-25
- Axis: Standards
- Form: cold subagent, fresh session

## Findings

### should — `lib/stale.mjs:92-93` — fresh-node command is not shell-safe for valid paths

**Problem:** The JavaScript quoting in `q()` does not escape shell-active characters inside the surrounding `node -e "..."`. For example, executing the generated default command with the literal target root `/$HOME/Projects/pi-extensions/pi-cdd` made `bash` expand `$HOME`; `hasStore` returned `true` for the expanded project instead of the literal target. A refusal can therefore direct the user at the wrong project or fail to import the extension.

**Disposition:** open — encode/escape values for the outer shell as well as JavaScript, or use a command form that avoids shell interpolation; pin paths containing `$` (and other shell-active characters).

### should — `tests/acceptance/stale-lib-guard.test.js:2` — comment carries a change marker

**Problem:** The source comment names `20261025-stale-lib-guard`, a change-folder identifier. This is a source traceability marker banned by `cdd/rules.md` rule 10 and corpus routing in comments banned by ADR-0012.

**Disposition:** open — remove the change identifier from the comment; describe the test harness without corpus routing.

### note — `lib/stale.mjs:71` — unused backlog-action set

**Problem:** `MUTATING_BACKLOG` is declared but never read; `gradeOp()` classifies every non-`list` backlog action as mutating without consulting it.

**Disposition:** open — remove the unused set or make the classification use it if explicit membership is intended.

### note — `lib/stale.mjs:49-50` — unused snapshot metadata

**Problem:** `mtimeMs` and `size` are stored in each snapshot entry but never read; `staleEntries()` compares only digests. The `statSync()` call and retained values add work/state without affecting detection.

**Disposition:** open — remove the unused metadata unless a current consumer is intended.

### note — `tests/acceptance/stale-lib-guard.test.js:291-292` — duplicate assertion

**Problem:** Both assertions check `after.size === before.size`; the second labeled “same size” repeats the first “same length” check.

**Disposition:** open — remove the duplicate or replace it with a distinct assertion.

## Severity totals

- Blocker: none
- Should: 2
- Note: 3
