# R1 proposal review — guard-pure-checks

## Reviewer form

- **Form:** cold sub-agent session (fresh session, briefed only from the paths named in `brief-r1.md`; not the author's session).
- **Reviewer model family:** `opencode-zen` / `deepseek-v4-pro` (DeepSeek lineage), read from `PI_PROVIDER` / `PI_MODEL` at review time.
- **Author model family (per brief):** `zai` / `glm-5.3` (GLM lineage).
- **Family separation:** the two families differ (different provider and model lineage), so the rule 2b family requirement is satisfied and the review proceeds.

## Repository state

- Working tree **uncommitted** on branch `guard-pure-checks`; `cdd/changes/guard-pure-checks/` is the only untracked path.
- HEAD `3f484a5b549d7f2460f2d30a1183ebc127736517` (main tip, the branch point), matching the brief's pinned state.

## Scope

Reviewed per the brief: `proposal.md` + `design.md` (the review object), `cdd/specs/`, `cdd/archive/` (esp. `20261024-spec-model`), `cdd/rules.md`, `tasks.md` §2.1 (design-gate record only), `cdd/decisions/`, and `scripts/spec-drift.mjs` / `tests/smoke.mjs` as evidence for the Why's divergence claims. The delta draft and tasks §3 are out of R1 scope.

## MUST-DELIVER evaluation

1. **Design-gate answers credible** — PASS. T1 NO (one capability `gherkin`, one script's internal structure) matches the reach: the Code: globs touch `scripts/spec-drift.mjs`, the byte-identical `cdd/scripts/**` re-copy, one new acceptance suite, and `tests/smoke.mjs` — all gherkin-owned surface, no cross-capability move. T2 YES (architecture bet on the guard's internal shape) and T3 YES (gather pass as the single input seam) are accurate to the proposal's What Changes. T4 YES (byte-identical stdout/stderr/exit as an invariant) is accurate. T5 NO (run 3/4 depend on this landing) is consistent with the run-1 `spec-model` proposal's explicit "future run 2/3/4" sequencing. No under/overstatement found.
2. **Reuse-first actually searched** — PASS. The proposal names `parseSpecModel` (run 1, `20261024-spec-model`), the PF-27 worktree recipe (adr-ops and spec-model precedent), and the house `check(id, name, fn)` runner (`spec-model.test.js` precedent). All are real on disk; no from-scratch build of something the store already holds.
3. **Every Done-When verifiable** — PASS with one note (below). All four lines name an observable check (a command exit, a cmp record, a validator result); none is an activity or feeling.
4. **Scope fence sane** — PASS. Non-Goals fence the work (no new door script, DOOR_SCRIPTS stays 5, LAW_VERSION stays 2, parse home stays grammar-law, no new laws/verdicts/order/tags/report/exit, no extractor/adapters restructure, no real-door test migration, no byte-identity delta). Every What Changes bullet is sponsored by a Done-When line. The mission fence is honored.
5. **Capability mapping right** — PASS. The `gherkin` capability exists (`cdd/specs/gherkin/spec.md`), the change maps to it (the guard is gherkin-owned surface), and the proposal carries the required `## Capabilities` section recording the mapping.

## Findings

| # | Severity | Finding | Evidence | Disposition |
|---|---|---|---|---|
| 1 | note | The fourth Done-When criterion — "node scripts/spec-drift.mjs reports the same clean line as main" — does not name the exact expected output. "The same clean line" is a comparison against main rather than a self-contained observable (e.g. "exits 0 with no issue lines"). It is still verifiable (run on main, run on branch, compare), but a self-contained phrasing would make the criterion independently checkable. | `cdd/changes/guard-pure-checks/proposal.md:38` | fixed: rephrased self-contained — "exits 0 printing a `spec-drift: clean (` line" (the counts inside the line vary with repo state; the one-shot cmp is the byte-exact check) |
| 2 | note | T4 flags byte-identity as an invariant risk, yet the proposal's Non-Goals explicitly declines a durable promise for it ("one-shot migration proof riding the tick, not a durable promise"). The design.md Proof boundary resolves this coherently — the acceptance suites are the durable lock, the cmp is one-shot migration evidence — but the author should confirm the suites actually pin every byte-identity-relevant surface (check order, tags, report text, exit codes) so the one-shot proof is not the only guard on output shape. | `cdd/changes/guard-pure-checks/proposal.md:29`, `cdd/changes/guard-pure-checks/design.md:31`, `cdd/changes/guard-pure-checks/tasks.md:9` | fixed: confirmed with evidence — tags pinned by tests/acceptance/guard-header-index.test.js (Checks line tag set == emitted tags), report text/exit codes pinned end-to-end through the real door by gherkin-guard-placeholder, guard-pair-commit, guard-memory-claims, guard-adr-remedies, guard-glob-claims, gherkin-door3, and tests/smoke.mjs scenario runs; task 3.4's verification re-runs the header-index and smoke locks on the restructured guard |

No blocker or should findings. The proposal and design.md satisfy the four-section design contract (rule 2c): exactly one kind-carrying mermaid flowchart, one boundary line per diagram box (9 boxes ↔ 9 boundary lines), no free-form sections, Component level stated with the Code-level ban justified.
