# Tasks — 20261112-release-version-pin

## 1. Context

- [x] 1.1 Read the living requirement "Declarative style is door-1 law" (cdd/specs/gherkin/spec.md:124-149) and the pin file tests/acceptance/gherkin-style-guidance.test.js top to bottom, verify by this checkbox naming both artifacts as read

## 2. Design

- [x] 2.1 Design gate — T1 cross-cutting NO (one capability, gherkin; one scenario of one requirement; one test file), T2 architecture bet NO (an assertion rewrite inside an existing pin, no new abstraction), T3 shared seam NO (the pin keeps reading the same 3 corpus surfaces T1-T3 already read; no seam touched), T4 invariant risk NO (no law invariant touched; the scenario keeps its 3 corpus sources and its pin file), T5 parallel work NO (no other open change); shape: one MODIFIED requirement, no design.md (T2 NO), C4 level n/a — verify by this line naming all five answers, the chosen shape, and the C4 level

## 3. Implementation

- [x] 3.1 Change review — once proposal, delta, and tasks are on disk and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package in a cold session; findings at `reviews/r2-change-review.md`; dispose every blocker and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker (R2 done: 1 blocker + 6 should + 2 notes, all disposed — 6 fixed, 1 won't-fix with rationale, 2 no-action/reworded)
- [x] 3.2 Red-first evidence — in a scratch git worktree at the pre-change commit, inject the literal package version into one corpus source and run the pin carrying this change's final T4, recording the failing run at `reviews/red-records.md`; the worktree is removed after the run, verify by reviews/red-records.md holding the failing run with T4 naming the corpus-never-names check
- [x] 3.3 Rewrite T4 — assert that none of the corpus surfaces contains the manifest's release version string: the delta template (tpl.deltaTemplate), the authoring instruction (lib/instructions.mjs source plus insMod.DELTA_INSTRUCTION), and cdd rule 4 (both tpl.RULES_MD and the cdd/rules.md store copy), verify by node --test tests/acceptance/gherkin-style-guidance.test.js exiting 0 — re-verified after the R3 T4 rework (labelled pairs, shared INSTRUCTION_SURFACES): 1/1 pass
- [x] 3.4 Full acceptance sweep, verify by npm test exiting 0 and node cdd/scripts/spec-drift.mjs exiting 0 — re-verified after the R3 T4 rework: npm test exit 0 (59/59), spec-drift clean

## Done When Traceability

| criterion | task ids |
| --- | --- |
| npm test exits 0 with the manifest at its released version and the rewritten T4 passing | 3.3, 3.4 |
| T4 fails when any of the 3 corpus sources names the extension's released package version, recorded at reviews/red-records.md | 3.2 |
| cdd validate strict green on the change and door 3 clean on the store after archive | 4.4, 4.6 |

## 4. Close

- [x] 4.1 Standards-axis change code review — run skill `cdd-code-review` with the standards-axis brief in its own cold session over the diff since the change opened; findings at `reviews/r3-standards-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-standards-code-review.md holding no open blocker (R3 done: 0 blocker, 3 should, 2 notes — all disposed, 5 fixed incl. T4 labelled pairs + INSTRUCTION_SURFACES hoist + dead-fallback drop; re-runs green after the rework: pin 1/1, npm test 59/59)
- [x] 4.2 Spec-axis change code review — run skill `cdd-code-review` with the spec-axis brief in a second cold session over the same diff; findings at `reviews/r3-spec-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-spec-code-review.md holding no open blocker (R3 done: 0 blocker, 2 should, 4 notes — 2 fixed + 1 fixed via the shared prose edit with standards row 4, 4 no-action with rationale; re-runs green)
- [x] 4.3 ADR review — skip recorded on this line: this change drafts no ADR and amends no ADR's decision content (the proposal cites the nine governing ADRs — 0001, 0003, 0006, 0007, 0008, 0009, 0011, 0012, 0013 — as alignments demanded by the A1 law, not amendments; no ADR-governed file moves and no decision text changes), verify by reviews/adr-review.md holding no open blocker or a skip recorded on this line
- [x] 4.4 cdd validate strict green, guard green (strict PASS 0 errors, only the two known living-spec size warnings; spec-drift: clean — 5 specs, 46 acceptance test files, full scan)
- [x] 4.5 Archive — pair-commit: feature commit (delta + pin file travel together), then archive commit (living spec merged, metrics stamped)
- [x] 4.6 Post-archive door 3 scan — after the archive op merged the living spec, the git-freshness L2 law necessarily holds the pin (committed in the feature commit) as changed after the spec until both travel in one commit; the pair-commit archive commit is the L2 remedy, and the full scan exits 0 on the tree including it: node cdd/scripts/spec-drift.mjs → spec-drift: clean (full scan)
