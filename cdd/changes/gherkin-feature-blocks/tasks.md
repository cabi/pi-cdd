# Tasks — gherkin-feature-blocks

## 1. Context

- [x] 1.1 Read the living spec, ADR-0005/0006, lib/gherkin.mjs, lib/validate.mjs, lib/templates.mjs, both spec-drift.mjs copies — verify by this line naming them all

## 2. Design

- [x] 2.1 Design gate — grilling rounds settled: per-requirement Feature fence, no #### headings, markdown prose, pin comments inside, strict comment law, Feature-only subset addition, archives immutable (record in decisions/0006-feature-block-consolidation.md) — verify by decisions/0006-feature-block-consolidation.md

## 3. Implementation

- [x] 3.1 Rework lib/gherkin.mjs: checkFence validates a whole Feature document (Feature echo, no description lines, per-scenario subset laws, Outline/Examples/tables/doc strings rejected, strict comment law with per-scenario pin association) — verify by tests/acceptance/gherkin-subset.test.js
- [x] 3.2 Rework lib/validate.mjs: per-requirement exactly one fence, Feature name = requirement heading, old-format residue (#### Scenario headings, markdown pins) red, per-scenario pin existence in strict — verify by tests/acceptance/gherkin-parse-gate.test.js
- [x] 3.3 Rework templates (RULES_MD rule 4, deltaTemplate, DELTA_INSTRUCTION) and /cdd-help bullets — verify by tests/acceptance/gherkin-style-guidance.test.js
- [x] 3.4 Rework both spec-drift.mjs copies: G section scans Feature fences, collects pin comments inside fences, maps errors to markdown lines — verify by tests/acceptance/gherkin-door3.test.js
- [x] 3.5 Migrate tests/smoke.mjs + tests/tools.mjs fixtures to the Feature-block format — verify by tests/smoke.mjs
- [x] 3.6 Write the delta: MODIFIED ×4 restating every living requirement in the Feature-block format (this delta is the migration) — verify by tests/acceptance/gherkin-door3.test.js

## 4. Close

## Done When Traceability

| criterion | task ids |
|---|---|
| every living requirement is one Feature fence with # Verified by: pin comments | 3.6 |
| validate/door-3 accept nothing else | 3.1, 3.2, 3.4 |

## 4. Close
- [ ] 4.1 cdd validate strict green, guard green
- [ ] 4.2 Archive — pair-commit: feature commit, then archive commit
