# Tasks — 20261111-guard-untracked-claims

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

- [x] 2.1 Design gate — T1 cross-cutting NO (one capability, gherkin; one module's gather seam), T2 architecture bet NO (a flag change in the existing gather seam, no new abstraction), T3 shared seam NO (the gather → facts → claim-map seam is unchanged; gather feeds it a mode-bound list), T4 invariant risk NO (the staged-index-only invariant is pinned by scenarios 2 and 6; history-law immunity by scenario 5), T5 parallel work NO (no other open change); shape: one ADDED requirement, no design.md, C4 level n/a — verify by this line naming all five answers, the chosen shape, and the C4 level

## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
- [x] 3.2 Acceptance tests land red-first — tests/acceptance/guard-file-universe.test.js implements all 6 delta scenarios; the pre-fix run fails scenarios 1 (untracked O conflict) and 4 (untracked A1) and passes the non-regression pins 2, 3, 5, 6; evidence recorded at reviews/red-records.md, verify by reviews/red-records.md holding the pre-fix run with scenarios 1 and 4 failing
- [x] 3.3 Mode-bound claim universe in gather — scripts/spec-drift.mjs gathers a new claimFiles fact as `git ls-files --cached --others --exclude-standard` in working-tree modes and `git ls-files --cached` in staged modes, feeds it to buildClaimMap and checkA1, keeps facts.tracked index-only for the topology gather, and syncs cdd/scripts/spec-drift.mjs byte-identical, verify by node --test tests/acceptance/guard-file-universe.test.js exiting 0 and cmp -s scripts/spec-drift.mjs cdd/scripts/spec-drift.mjs
- [x] 3.4 Full acceptance sweep — every scenario green against the fixed guard and the whole suite unchanged, verify by npm test exiting 0 and node cdd/scripts/spec-drift.mjs exiting 0 on this store

## Done When Traceability

| criterion | task ids |
|---|---|
| untracked conflict reds the full scan with exactly 1 O finding | 3.2, 3.3 |
| staged door prints no O finding for the untracked file | 3.2, 3.3 |
| gitignored file: L2 dead glob, no O finding | 3.2, 3.3 |
| untracked delta claim under a governing ADR fires A1 | 3.2, 3.3 |
| npm test green and cdd/scripts/spec-drift.mjs byte-identical — sponsor: living requirement Scaffold edits travel with their pins (cdd/specs/gherkin/spec.md), no delta requirement by rule 5 | 3.3, 3.4 |

Non-regression pins: delta scenarios 5 (history-law immunity) and 6 (index file conflicts in every scan mode) are sponsored by the ADDED requirement itself — no Done-When line covers them by design.
## 4. Close

- [x] 4.1 Standards-axis change code review — run skill `cdd-code-review` with the standards-axis brief (brief-r3-standards.md) over the diff since the change branched, in its own cold session; findings at `reviews/r3-standards-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-standards-code-review.md holding no open blocker
- [x] 4.2 Spec-axis change code review — run skill `cdd-code-review` with the spec-axis brief (brief-r3-spec.md) over the same diff, in a second cold session; findings at `reviews/r3-spec-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-spec-code-review.md holding no open blocker
- [x] 4.3 ADR review — skip recorded on this line: this change drafts no ADR and amends no ADR's decision content (the proposal cites ADR-0001/0006/0007/0012/0013; task 4.5 appends Reconfirmed-by paragraphs, which do not count as amendment), verify by reviews/adr-review.md holding no open blocker or a skip recorded on this line
- [x] 4.4 cdd validate strict green, guard green
- [ ] 4.5 Reconfirm the governing ADRs — run cdd reconfirm for ADR-0001, ADR-0006, ADR-0007, ADR-0012, and ADR-0013 with one-line evidence naming the mode-bound claim universe, staging the decision touches in the same feature commit as the guard-source move, verify by each ADR file holding a Reconfirmed by 20261111-guard-untracked-claims line and node cdd/scripts/spec-drift.mjs printing no A2 finding at the post-feature-commit tip
- [ ] 4.6 Archive — pair-commit: feature commit, then archive commit
