# R3 spec-axis code review — gitlab-ci-parity

## Reviewer form

- **Form:** cold sub-agent session (fresh session, briefed only from the paths on disk at the pinned state; not the author's session).
- **Reviewer model family:** opencode-zen / deepseek-v4-pro (from `PI_PROVIDER=opencode-zen`, `PI_MODEL=deepseek-v4-pro`).
- **Author model family (per brief):** zai (glm-5.3).
- **Family check:** families differ — review proceeds.
- **Working-tree state:** branch `gitlab-ci-parity`, `HEAD == 866ab4b == main`; the change is an uncommitted working tree. Tracked edits: `lib/templates.mjs`, `.gitlab-ci.yml`, `cdd/backlog.md`; untracked: `cdd/changes/gitlab-ci-parity/`, `tests/acceptance/gitlab-ci-parity.test.js`. `git log 866ab4b..HEAD` is empty by design.

## Scope

Spec axis only (R3, at Close): whether the diff implements the change's delta — every requirement, every scenario, nothing unsponsored — and whether the pins actually pin. Standards conformance is out of scope (separate session).

Inputs read: `cdd/changes/gitlab-ci-parity/specs/gherkin/spec.md`, `proposal.md`, `tasks.md`, `tests/acceptance/gitlab-ci-parity.test.js`, `lib/templates.mjs` (CI_GITLAB at :232), `.gitlab-ci.yml`, and the diff `git diff 866ab4b -- lib/templates.mjs .gitlab-ci.yml`.

## Findings

### [note] R3-SPEC-F001 — "the suites' parser import resolves" is pinned only via the npm ci mechanism, not the stated outcome

- **Severity:** note
- **Disposition:** fixed — the THEN's second conjunct was outcome-shaped ("the suites' parser import resolves"), asserting a package.json/CI result the template surface cannot own; scenario line tightened to the template-owned observable with the import story as rationale: "And npm ci runs before the guard scan — the suites import @cucumber/gherkin from node_modules, not the vendored copy" (cdd/changes/gitlab-ci-parity/specs/gherkin/spec.md:15). GL4 already pins exactly that observable; guard re-run clean, parity suite re-run green (GL0–GL6, exit 0).
- **Location:** `cdd/changes/gitlab-ci-parity/specs/gherkin/spec.md:16` (scenario 1 THEN); `tests/acceptance/gitlab-ci-parity.test.js:118-127` (GL4)
- **Evidence:** Scenario 1's THEN is a compound: "npm ci runs before the guard scan **and the suites' parser import resolves**". GL4 asserts `script[0] === "npm ci" && script[1] === "node cdd/scripts/spec-drift.mjs" && script[2] === "npm test --if-present"` — it pins that `npm ci` is present and ordered before the guard scan, but it never asserts that the parser import actually resolves (e.g. that `@cucumber/gherkin` is a real dependency `npm ci` would install). A template that kept `npm ci` but whose `package.json` dropped `@cucumber/gherkin` would still pass GL4 while the import fails in CI.
- **Analysis:** The first conjunct is pinned directly and correctly. The second conjunct is pinned only indirectly, through the mechanism (`npm ci` presence) that the requirement's prose names as the cause ("the suites import `@cucumber/gherkin` from `node_modules`"). Whether the import resolves is a `package.json` concern outside the template's control, so a template-level pin cannot assert it without actually running `npm ci` and importing the parser — which is a CI-level check, not a unit-level acceptance pin. The gap is therefore minor and arguably out of the pin's reach, but the THEN's second conjunct is not independently observable in the diffed code.
- **Suggested disposition:** won't-fix with a one-line note (the import-resolution outcome is a `package.json`/CI concern, not a template surface), or fold the intent into GL4's comment so the pin's scope is explicit.

## Coverage and verification

- **Every scenario implemented (checklist 1):** scenario 1's five THEN clauses are all produced by the `CI_GITLAB` growth in `lib/templates.mjs:232-249` — matrix legs `["20","24"]` (GL1), `image: node:$NODE_VERSION` (GL2), `variables: GIT_DEPTH: "0"` (GL3), `npm ci` before the guard scan (GL4), door-3 and adjust-to-runner comments kept (GL5). Scenario 2's byte-identity is produced by the hand-synced `.gitlab-ci.yml` (GL6). No THEN is untraceable to a code change.
- **Pins actually pin (checklist 2):** all seven checks (GL0–GL6) run against the real `CI_GITLAB` render imported from `lib/templates.mjs` and the real `.gitlab-ci.yml` read from disk — not sandbox copies. Scratch mutation confirmed the pins fail on regression: changing `- npm ci` to `- npm install` in `lib/templates.mjs` made GL4 FAIL (`script: ["npm install", ...]`) and GL6 FAIL (root copy diverged), exit 1; the file was restored. GL1 pins exactly two legs and their values (`length === 2 && ["20","24"]`), so a third major or a reordered pair fails; GL2 fails on any literal Node pin; GL3 fails if `GIT_DEPTH` is dropped or changed; GL5 fails if either scaffold comment is removed. The GL0 parser is a shared fail-closed pattern (adopted from `ci-node-matrix.test.js`, per the proposal), not a copied pin — the pins themselves are GitLab-template-specific.
- **No unsponsored code (checklist 3):** every hunk in the tracked diff serves a delta requirement or a ticked task's verify-by. `lib/templates.mjs` (CI_GITLAB growth) → scenario 1; `.gitlab-ci.yml` (hand-sync) → scenario 2; `tests/acceptance/gitlab-ci-parity.test.js` → the `# Verified by:` pin. The three new scaffold comment lines (`# full clone…`, `# fan out…`, `# the suites import…`) document the sponsored disciplines and are adopter-facing scaffold text (ADR-0012), not dead code or speculative hooks. `cdd/backlog.md` adds PF-25, a process-finding record from R2-F002 (not implementation code, and outside the brief's diff command).
- **Sweep membership:** `tests/acceptance/gitlab-ci-parity.test.js` sits in `tests/acceptance/` and passes standalone (GL0–GL6 all ok, exit 0); it is one of the 30 acceptance files the sweep runs (tasks.md 3.3 evidence: `npm test` → 30/30).
- **Checklist results:** every scenario implemented (clean), pins actually pin (clean, mutation-verified), no unsponsored code (clean). One note, disposed (fixed).

No blockers, no shoulds. One note, fixed by the author (see disposition above).
