# R3 Spec-Axis Code Review — law-guard-fixes

**Reviewer form:** cold sub-agent
**Reviewer model family:** opencode-zen (opencode-zen/deepseek-v4-pro) vs author family: zai (zai/glm-5.3) — families differ ✓

---

## Findings

### F1 — should — LDW2 pin normalizes whitespace, so the "byte-identically" requirement is not actually pinned byte-identically

**Evidence:** `tests/acceptance/law-done-when.test.js:47` and `tests/acceptance/law-done-when.test.js:66`

The scenario "Rule 3 renders from the loop-law module" requires: "the store copy cdd/rules.md carries the same rule-3 fragment **byte-identically**" (`cdd/changes/law-guard-fixes/specs/gherkin/spec.md:21`). The pin LDW2 extracts the rule-3 block from both the rendered law text (`tpl.RULES_MD`) and the store copy (`cdd/rules.md`) and asserts `norm(r3store) === norm(r3render)`. Both `ruleBlock()` (line 47: `return block.replace(/\s+/g, " ")`) and `norm()` (line 38: `s.replace(/\s+/g, " ")`) collapse all whitespace to single spaces, so the comparison is whitespace-insensitive. A whitespace/indentation/line-break drift in the store mirror's rule-3 block would leave the pin green, so the byte-identity requirement the scenario names is not fully exercised. The pin should assert exact string equality (`r3store === r3render`) to pin the requirement as written.

### F2 — note — Proposal Done-When lines omit a completion criterion for the PF-17 rule-3 text fix

**Evidence:** `cdd/changes/law-guard-fixes/proposal.md:40-42` vs `cdd/changes/law-guard-fixes/tasks.md:27`

The change bundles two core fixes (PF-17 rule-3 text, PF-18 guard gate). The proposal's three `Done-When:` lines cover the PF-18 sandbox shape, the backlog op, and the change's own archive pair-commit — none states an observable criterion for the rule-3 text contract (the PF-17 half). The Done-When traceability table (`tasks.md:27`) adds a fourth criterion — "rule 3 states 1-5 observable criteria, rendered + mirror, wording gone" — that has no corresponding proposal `Done-When:` line. The rule-3 fix is implemented and pinned (LDW1-3 green), so this is a proposal/traceability coherence gap, not a missing implementation; the proposal's completion criteria simply do not name half the change.

---

## Summary

- **2 findings total**: 1 `should`, 1 `note`, 0 `blocker`.
- **Every delta scenario implemented**: both requirements ("Loop law states the Done-When contract", "Topology staleness is full-scan law") have their observable outcomes produced by the diffed code — `lawRule3()` in `lib/loop-law.mjs` interpolated into `lib/templates.mjs` and mirrored into `cdd/rules.md`; the topology L2 branch gated on `!preCommit` in both `scripts/spec-drift.mjs` and `cdd/scripts/spec-drift.mjs` (byte-identical copies, verified by `cmp`).
- **Pins actually pin**: LDW1/LDW3 assert the rendered text and module export and would fail on a wording regression; GPC2/GPC3 run the real door script as a child process in a sandbox built with the real `initStore`/`archiveChange` and would fail if the `!preCommit` gate regressed (GPC2 deadlocks) or if topology L2 were dropped (GPC3 goes green). The one gap is F1: LDW2's byte-identity assertion is whitespace-normalized.
- **No unsponsored code**: every hunk in `git diff HEAD` serves one of the two delta requirements or a ticked task's verify-by.

## Dispositions (author, 2026-10-23)

Run 1 of the spec axis (deepseek-v4-pro, spawned before the reviewer-pair override; both free rungs had 429'd). Superseded by the override pair's flash run in r3-spec-code-review.md, which independently reproduced F1 and whose dispositions apply. This run's F2 (proposal Done-When omission) was fixed the same day: the PF-17 Done-When line was added to proposal.md.
