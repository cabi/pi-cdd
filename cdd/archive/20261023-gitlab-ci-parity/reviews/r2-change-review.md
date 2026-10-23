# R2 package review — gitlab-ci-parity

## Reviewer form

- **Form:** cold sub-agent session (fresh session, briefed only from the paths on disk; not the author's session).
- **Reviewer model family:** opencode-zen / deepseek-v4-pro (from `PI_PROVIDER=opencode-zen`, `PI_MODEL=deepseek-v4-pro`).
- **Author model family (per brief):** zai (glm-5.3).
- **Family check:** families differ — review proceeds.
- **Working-tree state:** branch `gitlab-ci-parity`, base `main` @ 866ab4b, `HEAD == 866ab4b`; `cdd/changes/gitlab-ci-parity/` is untracked (the change is uncommitted). No staged or unstaged tracked changes; the only working-tree delta is the untracked change folder.

## Scope

Package review at draft-green (R2): `proposal.md`, `tasks.md`, the delta `specs/acceptance/spec.md`, the living `cdd/specs/acceptance/spec.md`, and `cdd/rules.md`. No `design.md` exists (design gate T1–T5 all NO, rule 2c) — correct. No implementation exists yet.

## Findings

### [note] R2-F001 — Done-When "npm test exits 0" is not backed by a delta requirement

- **Severity:** note
- **Disposition:** won't-fix: the sweep behavior is already specified by the living requirement "Acceptance suites run with the project tests" (cdd/specs/acceptance/spec.md) — a delta requirement restating it would duplicate a living requirement (rule 5); the criterion stays observable and task-traced (3.3).
- **Location:** `cdd/changes/gitlab-ci-parity/proposal.md:31` (Done-When line 3)
- **Evidence:** `proposal.md:31` ("Done-When: npm test exits 0 with the parity suite inside the sweep"); the delta `specs/acceptance/spec.md` carries exactly one ADDED requirement with two scenarios — scenario 1 (pipeline discipline, `:10`) and scenario 2 (byte-identity, `:19`) — neither of which asserts "npm test exits 0 with the parity suite inside the sweep". The Done-When Traceability table maps this criterion to task 3.3 only (`tasks.md:23`).
- **Analysis:** Checklist item 1 requires every Done-When line to map to ≥1 delta requirement. This criterion is instead sponsored by the living spec's "Acceptance suites run with the project tests" requirement (`cdd/specs/acceptance/spec.md`, scenarios "npm test runs the whole acceptance sweep" and "the sweep needs no per-suite registration"). The sweep behavior is already fully specified there, so adding a delta requirement would duplicate a living requirement (rule 5). The gap is therefore cosmetic, not a real coverage hole: the criterion is observable and traceable, just not to a *delta* requirement.
- **Suggested disposition:** won't-fix with a one-line note, or fold the criterion's intent into the existing scenario pins (the scenarios already pin `tests/acceptance/gitlab-ci-parity.test.js`, which the sweep runs).

### [note] R2-F002 — "Parity" is against the dogfood workflow, not the adopter-facing GitHub scaffold

- **Severity:** note
- **Disposition:** fixed: the proposal now names the reference as the repository's own guard pipeline (.github/workflows/cdd.yml, the dogfood copy) and Non-Goals record CI_GITHUB template parity as an explicit follow-up change, so the two adopter-facing scaffolds' asymmetry is stated, not inferred.
- **Location:** `cdd/changes/gitlab-ci-parity/proposal.md:7-11` ("What Changes"); `lib/templates.mjs:212` (CI_GITHUB template)
- **Evidence:** The proposal states the change copies "the GitHub workflow's 3 hard-wired disciplines" (Node matrix, `npm ci`, `GIT_DEPTH: 0`). Those three disciplines exist in the repository's dogfood `.github/workflows/cdd.yml` (matrix `[20, 24]`, `npm ci`, `fetch-depth: 0`), but the adopter-facing `CI_GITHUB` template at `lib/templates.mjs:212-230` still ships the old shape: a single `node-version: 20` (no matrix) and no `npm ci` step (it does carry `fetch-depth: 0`). After this change, the adopter-facing `CI_GITLAB` scaffold will carry all three disciplines while the adopter-facing `CI_GITHUB` scaffold carries only one.
- **Analysis:** This is a pre-existing gap in `CI_GITHUB`, out of scope for this change (the proposal's Non-Goals explicitly exclude `.github/workflows/cdd.yml`, and `CI_GITHUB` is a different surface). It is flagged only because the proposal's "parity" framing names "the GitHub workflow" without distinguishing the dogfood workflow from the adopter-facing `CI_GITHUB` template; a reader could infer the two adopter-facing scaffolds end up symmetric, which they do not.
- **Suggested disposition:** won't-fix for this change, with a note that `CI_GITHUB` template parity is a candidate follow-up change (or a `PF-n` backlog item).

## Coverage and verification

- Read `proposal.md`, `tasks.md`, delta `specs/acceptance/spec.md`, living `cdd/specs/acceptance/spec.md`, `cdd/rules.md`.
- Confirmed `HEAD == 866ab4b` on branch `gitlab-ci-parity`; change folder untracked.
- Confirmed reviewer family (opencode-zen/deepseek-v4-pro) differs from author family (zai/glm-5.3).
- Verified verify-by realism against disk: `lib/templates.mjs` (CI_GITLAB at :232, CI_GITHUB at :212), `.gitlab-ci.yml`, `.github/workflows/cdd.yml`, `lib/store.mjs` (initStore writes the adopter copy), `tests/acceptance/ci-node-matrix.test.js`, `tests/acceptance/single-source-law.test.js`, `cdd/backlog.md` PF-15 all exist; the scenario pins name `tests/acceptance/gitlab-ci-parity.test.js` (to be created by task 3.2, test-first — correct at draft-green).
- Checklist results: coverage (1 note), sponsorship (clean), same-change coherence (clean, 1 note), MODIFIED/REMOVED legality (clean — ADDED only), verify-by runnable (clean).
- No blockers, no shoulds. Two notes, both open.
