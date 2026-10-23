# R2 package review — design-docs

- **Reviewer form:** cold sub-agent session (fresh session, not the author's).
- **Reviewer model family:** opencode-zen / deepseek-v4-pro (from `PI_PROVIDER=opencode-zen`, `PI_MODEL=deepseek-v4-pro`).
- **Author model family:** zai / glm-5.3 (per the brief). Families differ — review proceeds.
- **Pinned state:** repository at commit `28423ec`, read from the WORKING TREE (the change is uncommitted: `skills/cdd-spec-review/{SKILL.md,brief-r1.md,brief-r2.md}` modified, `cdd/changes/design-docs/` untracked).
- **Scope:** proposal.md, design.md, tasks.md, delta `specs/gherkin/spec.md`, living `cdd/specs/gherkin/spec.md`, `cdd/rules.md`.

## Findings

### should — Done-When 1's shape criterion is not verified by any task's verify-by — DISPOSED fixed

- **Finding:** The first Done-When line requires `design.md` to exist "with the four mandatory sections and exactly one mermaid flowchart", but the task it maps to (2.1, the design gate) verifies only "this line naming all five answers, the chosen shape, and the C4 level" — the gate record line, not the design.md's four-section / one-flowchart shape. No other task's verify-by checks the dogfood design.md's shape (task 3.4 verifies the *template's* shape, not this instance's).
- **Evidence:** `cdd/changes/design-docs/proposal.md` (Done-When line 1); `cdd/changes/design-docs/tasks.md` (task 2.1 verify-by, and the Done When Traceability row mapping criterion 1 → task 2.1).
- **Disposition:** fixed: task 2.1's verify-by now also names the dogfood design.md shape check (exactly Level/Diagram/Boundaries/Alternatives + exactly 1 mermaid flowchart, on disk) — not an acceptance-suite pin, so it survives archive.

### should — Proposal `Code:` line omits files the delta MODIFIED requirement names — DISPOSED fixed

- **Finding:** The proposal's `Code:` line names 7 files (`lib/loop-law.mjs, lib/templates.mjs, cdd/rules.md, brief-r1.md, brief-r2.md, SKILL.md, tests/acceptance/design-docs.test.js`), but the delta's MODIFIED requirement "Design gate record lands before the proposal" carries a `Code:` line that additionally names `lib/context.mjs, lib/help.mjs, cdd/decisions/0008-*.md, tests/acceptance/review-wiring.test.js`. The proposal's Non-Goals state no ADR edit ships, yet `cdd/decisions/0008-*.md` appears in the delta Code line; and design.md's Boundaries say the rule is "rendered into every statement surface" while the proposal names only "the loop law text and the store mirror cdd/rules.md". The implementation surface is therefore inconsistent between proposal and delta.
- **Evidence:** `cdd/changes/design-docs/proposal.md` (Code: line, Non-Goals); `cdd/changes/design-docs/specs/gherkin/spec.md` (MODIFIED "Design gate record lands before the proposal" Code: line); `cdd/changes/design-docs/design.md` (Boundaries, "design-doc rule" entry).
- **Disposition:** fixed: proposal Code: line extended to the delta's full surface (lib/context.mjs, lib/help.mjs, cdd/decisions/0008-*.md, tests/acceptance/review-wiring.test.js added) — the delta MODIFIED requirement spans the original living Code line unchanged (its behavior still lives in those files); no ADR file edit ships, the glob names governance surface only.

### note — Done-When 3 maps to no delta requirement — DISPOSED won't-fix

- **Finding:** The third Done-When line ("cdd validate strict is green and node cdd/scripts/spec-drift.mjs exits 0 on the change") is a self-referential validation criterion and maps to no specific delta requirement; the traceability table maps it to Close task 4.3. This is a standard closing criterion, but per the coverage charter it is a Done-When with no requirement.
- **Evidence:** `cdd/changes/design-docs/proposal.md` (Done-When line 3); `cdd/changes/design-docs/tasks.md` (Done When Traceability row 3 → task 4.3).
- **Disposition:** won't-fix: Close-phase doors (validate strict, spec-drift guard) are process gates owned by the loop-law capability's existing requirements, not behaviors this delta adds; every archived change carries the same self-referential closing criterion (precedent: loop-law-hardening).

## Coverage and verification

- Read the full package (proposal, design, tasks, delta) and the living spec + rules.md from disk at the pinned working-tree state.
- MODIFIED legality verified: both MODIFIED requirements ("Design gate record lands before the proposal", "Reviewer briefs live next to their skills") restate every living-spec scenario (1 and 4 respectively) and add new scenarios; no REMOVED requirements present.
- Sponsorship verified: all four delta requirements map to tasks 3.3/3.4/3.5/3.6; no orphan tasks or requirements.
- design.md verified against the four-section contract: exactly Level / Diagram / Boundaries / Alternatives, one mermaid flowchart (flowchart TD, kind-carrying labels, no native C4* type), 7 diagram boxes ↔ 7 boundary lines, Container level claim matches the stated artifact-pipeline risk.
- Verify-by runnability: all task verify-bys name real commands; pins on `tests/acceptance/design-docs.test.js` are expected-red at draft-green (per the brief), not findings.
