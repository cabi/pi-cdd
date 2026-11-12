# Red-first records — 20261112-release-version-pin

## Task 3.2 — T4 red under a corpus source naming the release version

- Date: 2026-11-12
- Method: scratch git worktree at HEAD 78fda00 (`git worktree add --detach /tmp/pi-cdd-redcheck 78fda00`), so the main working tree was never touched. In the worktree only:
  1. `lib/instructions.mjs` — one injected first-line comment `// released at 0.5.0` (a corpus source naming the manifest's release version; the fault class this change pins against).
  2. `tests/acceptance/gherkin-style-guidance.test.js` — T4 replaced with this change's final assertion (no corpus surface contains the manifest's release version string, over the delta template, the instruction source + `DELTA_INSTRUCTION`, `tpl.RULES_MD`, and the `cdd/rules.md` store copy).
- Command: `node --test tests/acceptance/gherkin-style-guidance.test.js`
- Result (failing run):

```
  FAIL T4  no corpus source names the manifest's release version
FAIL 5 passed, 1 failed
  T4: a corpus source names the manifest's release version
  'test failed'
```

- T4 fails with exactly the corpus-never-names message; T1-T3, T5, T6 stay green (5 passed). Counter-check in the main tree (no fault): T4 ok under the same code. The worktree was removed after the run; no file in the main working tree was modified for this evidence.
