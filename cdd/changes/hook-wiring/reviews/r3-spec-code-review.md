# R3 Spec-Axis Code Review — hook-wiring

**Reviewer form:** cold sub-agent session
**Reviewer model family:** NVIDIA (nemotron-3-ultra-free via opencode-zen)
**Author model family:** zai (glm-5.3) — families differ ✓
**Review point:** R3 (before archive), Spec axis only
**Change:** `cdd/changes/hook-wiring/`
**Diff base:** `51fb3b2` (main), branch `hook-wiring`, uncommitted working tree
**Artifacts reviewed:**
- `git diff 51fb3b2 -- package.json MAINTENANCE.md` (tracked changes)
- `tests/acceptance/hook-wiring.test.js` (new acceptance pin file)
- `cdd/changes/hook-wiring/specs/gherkin/spec.md` (delta scenarios)
- `cdd/changes/hook-wiring/proposal.md` (Done-When, Code: surface)
- `cdd/changes/hook-wiring/tasks.md` (ticked tasks with verify-bys)

---

## Findings

*No findings.* All three charter criteria are satisfied.

### 1. Every scenario implemented ✓
- **Scenario 1** ("A fresh clone wires the doors at install time"): implemented by the `prepare` script in `package.json` (`[ -d .git ] && git config core.hooksPath .githooks || true`). Acceptance test **HW2** exercises this in a real sandbox git repository — after running the script, `git config --get core.hooksPath` returns `.githooks`.
- **Scenario 2** ("Without a git directory the prepare step is a silent no-op"): same script guards with `[ -d .git ]` and `|| true`. Acceptance test **HW3** verifies exit 0, no `.git` created, and `core.hooksPath` remains unset when run in a plain directory.
- Both scenarios' observable outcomes are produced by the diffed code and traced to passing acceptance tests.

### 2. Pins actually pin ✓
- **HW1** pins the *exact script text* read from `package.json` at runtime — any divergence (missing guard, missing `|| true`, typo) fails the test.
- **HW2** runs the script in a real `git init` sandbox and asserts `core.hooksPath === ".githooks"` post-run — a regression (e.g., wrong path, missing `git config` call) would fail.
- **HW3** runs the script in a non-git directory and asserts exit 0, no `.git` created, `core.hooksPath` unset — a regression (e.g., missing `[ -d .git ]` guard causing `git config` to error or write outside a repo) would fail.
- All three tests execute the *actual script text from `package.json`*, not a copy; they are not sandbox-only or copied-fragment pins.

### 3. No unsponsored code ✓
- `package.json` hunk (add `prepare` script): directly sponsors both delta scenarios; named in proposal `Code:` and every task's verify-by.
- `MAINTENANCE.md` hunk (Contributor setup note): sponsored by proposal Done-When criterion "MAINTENANCE.md carries the contributor-setup note — fresh clones wire via npm install's prepare step, the manual equivalent is named, PF-16 referenced" and ticked task **3.4** (verify-by: `MAINTENANCE.md holding that note naming the manual command and PF-16`).
- `tests/acceptance/hook-wiring.test.js`: explicitly named in both scenarios' `# Verified by:` lines and proposal `Code:` line; the implementation diff's third leg per the brief.
- No dead code, speculative hooks, or drive-by refactors in the reviewed diff.

---

## Disposition

All findings (none) carry disposition `open` per the charter. The author will set `fixed:` or `won't-fix:` when disposing.