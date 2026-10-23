# R3 standards-axis code review — hook-wiring

## Reviewer form

- **Form:** cold sub-agent session (loop law rule 2b) — a fresh session briefed only from paths on disk, not the author's session.
- **Reviewer model family:** `opencode-zen` (model `deepseek-v4-pro`), read from `PI_PROVIDER`/`PI_MODEL` at runtime.
- **Author model family:** `zai` (glm-5.3), per the brief. Families differ (different providers) — the rule 2b family-separation requirement is met.
- **Pinned state:** branch `hook-wiring`, diff base `51fb3b2` (main), uncommitted working tree as of 2026-10-23. Implementation diff = `package.json` + `MAINTENANCE.md` (modified tracked) + `tests/acceptance/hook-wiring.test.js` (untracked new file). The change folder `cdd/changes/hook-wiring/` is context only, not part of the implementation diff.
- **Scope:** Standards axis only — the diff's conformance to documented conventions, accepted ADRs, the smell baseline, and guard/validator alignment. Spec compliance is out of scope (separate session). Advisory findings only; no verdicts, no edits beyond this file.

## Findings

### F1 — Duplicated Code: sandbox lifecycle and missing-script guard repeated across HW2/HW3 — `note` — open

The two sandbox scenarios repeat the same setup/teardown shape and the same pre-flight guard instead of sharing one helper.

- `tests/acceptance/hook-wiring.test.js:44-45` and `:70-71` — `fs.mkdtempSync(path.join(os.tmpdir(), "hook-wiring-…"))` + `try { … } finally { fs.rmSync(sandbox, { recursive: true, force: true }); }` appear verbatim in both HW2 and HW3.
- `tests/acceptance/hook-wiring.test.js:46` and `:72` — `assert(prepareScript !== undefined, "cannot exercise a missing script")` is duplicated in both checks (HW1 already asserts the script exists at `:33`).

This is a judgement call, not a hard violation: the `runScript` helper (`tests/acceptance/hook-wiring.test.js:40-43`) already centralizes the spawn, and the remaining duplication is two occurrences in a test file, well under any maintenance threshold. A `withSandbox(prefix, fn)` helper would remove it, but the current shape is idiomatic for this repo's acceptance suites and reads clearly. No documented repo standard is breached.

Disposition: won't-fix — two occurrences in one test file, below any maintenance threshold (the reviewer's own judgement), and the repo's acceptance suites keep explicit per-check sandbox lifecycles (same shape in `tests/acceptance/r3-findings.test.js` RF10). A `withSandbox` helper for exactly two call sites would be abstraction the current requirement doesn't use; the duplicated pre-flight guard stays because each check must fail with its own message when run standalone against a red tree (the RED run exercised exactly that path).

## Summary

- **Findings:** 1 (note), 0 should, 0 blocker.
- **ADR-governed files:** none of `package.json`, `MAINTENANCE.md`, or `tests/acceptance/hook-wiring.test.js` fall under a recorded ADR `code:` glob (verified against all 11 ADRs in `cdd/decisions/`), so no ADR-conformance findings.
- **Guard/validator alignment:** `node cdd/scripts/spec-drift.mjs` exits 0 (clean, full scan) and `node --test tests/acceptance/hook-wiring.test.js` is 3/3 green; the prepare script wires the doors rather than weakening them, and the script text is byte-identical across `package.json`, `MAINTENANCE.md`, and the test's `EXPECTED_PREPARE` pin — no silent divergence.
- **Worst issue (this axis):** the F1 note — mild, judgement-call duplication in the new test file; nothing blocking.
