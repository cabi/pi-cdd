# R3 standards-axis code review — 20261024-dw-masked-view
- reviewer: gpt-6-luna (family opencode-zen)
- author of record: zai/glm-5.3 (family zai)
- reviewed at: `git rev-parse HEAD` = `c766f0fd7269bc0d52935c4802a4570226e98d1d`; dirty state from `git status --short`: `M cdd/backlog.md`, `M lib/metrics.mjs`, `M lib/validate.mjs`, `M tests/acceptance/archive-metrics-stamp.test.js`, `?? cdd/changes/20261024-dw-masked-view/`
- scope: `git diff HEAD -- lib tests` (standards axis only); no staged changes; the diff includes the two modified `lib/*.mjs` files and `tests/acceptance/archive-metrics-stamp.test.js`. The backlog edit and untracked change package are outside the diff scope.

## Finding

### should — test check-id comments include explanatory prose

- **Location:** `tests/acceptance/archive-metrics-stamp.test.js:471, 480, 493`.
- **Evidence status:** Trace-backed.
- **Evidence:** ADR-0012 allows test-local check IDs as names but says prose around those IDs should go. The added M8, M9, and M10 source-comment banners add descriptive prose (`the DW column equals the validator's masked view`, `a bare "Done-When:" line keeps stamp and validator agreed`, and `the masked view is single-sourced`). The existing M1–M7 banners in this same file use bare IDs.
- **Expected behavior:** Keep test-local IDs, with no prose in their surrounding source-comment banners.
- **Actual behavior:** The added banners duplicate test intent in comments, contrary to the repository's comment law.
- **Impact:** A bounded violation of the documented comment standard; the comments add a second, manually maintained description of the checks.
- **Smallest safe fix:** Reduce the three banners to the existing `// --- M# ---` form; retain the descriptive `check()` names and assertions.
- **Disposition:** fixed — banners reduced to the bare `// --- M# ---` form (change author, before Close; check() names and assertions retained, file header's fixture inventory untouched per the file's minted convention)

## Named module-cycle observation

The new imports form `validate → store → metrics → validate`. This is not a blocker under the repository's documented standards: no rule prohibits module cycles, and `tests/acceptance/spec-model.test.js` already pins an existing cycle in both import orders. Here, `maskHtmlComments` is an exported function declaration and `metrics.mjs` calls it from `specStrength`, not during module initialization. I also directly imported `store.mjs`, `validate.mjs`, and `metrics.mjs` with each as the first entrypoint; all three orders loaded successfully. The cycle stands as-is.

**Counts:** 0 blocker, 1 should, 0 note

VERDICT: PROCEED
