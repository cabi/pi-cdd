# r3-findings

## Why

R3's two axes still share one findings file: the loop law names a single R3 findings path, both brief templates route both axes to it, and every per-axis filename so far was a runner-side patch against the template — the 20261022-backlog-op and 20261023-design-docs runs both lost spec-axis findings to the shared file and reconstructed them from reviewer reports (PF-8, two recurrences). Separately, the proposal scaffold ships no `## Capabilities` section although its own embedded instruction requires one — the root of design-docs' R1 blocker (PF-13).

## What Changes

- The loop law's R3 review point carries one findings path per axis — `reviews/r3-standards-code-review.md` (standards) and `reviews/r3-spec-code-review.md` (spec) — and rule 2a renders both; the store mirror `cdd/rules.md` carries the same wording.
- The tasks Close section scaffolds two code-review tasks, one per axis, each naming its own findings file; the tasks instruction renders the per-axis paths.
- Each R3 brief template names only its own per-axis findings file, and the cdd-code-review charter aggregates per axis instead of naming one shared path.
- The proposal scaffold renders a `## Capabilities` section whose placeholder is draft-blocking like every other scaffold placeholder.

## Solutions Considered

- gherkin (the loop-law and scaffold capability): evaluated the existing single-path R3 wiring (`reviewPoint("R3").findings`, one brief output path, one Close task, one charter path) — it covers a world where one session owns one file, and keeping it while mandating append-only writes (the backlog's alternative) leaves the clobber race in place and keeps every filename a runner-side patch; adopted the split at the source — per-axis fields on the R3 review point rendered through the established single-source pattern (`lib/loop-law.mjs` renders; mirrors and scaffolds interpolate). No library or platform feature applies: this is loop law about our own review artifacts. The three pins the single path breaks (single-source-law, review-wiring, smoke) are covered by the existing test-contract migration path: MODIFIED requirements plus tracked rewrite tasks.

## Non-Goals

- No change to R1/R2/ADR review wiring, the findings grammar, or the advisory-findings rule.
- No new validator door; the Capabilities placeholder joins the existing `validateProposal` placeholder check.
- No backlog migration beyond closing PF-8 and PF-13 with the change reference.

## Capabilities

- gherkin MODIFY — per-axis R3 findings paths in the loop law and store mirror, two per-axis Close code-review tasks, distinct per-axis brief outputs and charter, and a scaffolded Capabilities section with a draft-blocking placeholder.

Done-When: `node --test tests/acceptance/r3-findings.test.js` exits 0 pinning the per-axis R3 findings paths in the law render and the store mirror, each R3 brief naming only its own file, the charter naming both, and the Capabilities scaffold with its draft-blocking placeholder
Done-When: a fresh scaffold's Close section names `reviews/r3-standards-code-review.md` and `reviews/r3-spec-code-review.md`, pinned by `tests/smoke.mjs`
Done-When: `npm test` exits 0 with the rewritten single-source-law, review-wiring, and smoke pins
Done-When: `cdd validate` strict green and `node cdd/scripts/spec-drift.mjs` exits 0
Done-When: PF-8 and PF-13 read done in `cdd/backlog.md`, each naming r3-findings
Code: lib/loop-law.mjs, lib/templates.mjs, lib/instructions.mjs, lib/validate.mjs, skills/cdd-code-review/SKILL.md, skills/cdd-code-review/brief-r3-standards.md, skills/cdd-code-review/brief-r3-spec.md, cdd/rules.md, cdd/decisions/0008-*.md, cdd/decisions/0009-*.md, cdd/decisions/0010-*.md, tests/acceptance/r3-findings.test.js, tests/acceptance/review-wiring.test.js, tests/acceptance/single-source-law.test.js, tests/acceptance/loop-law-hardening.test.js, tests/smoke.mjs

## Decisions followed (A1 citations)

- ADR-0006 (feature-block consolidation) — followed: the proposal and tasks scaffolds change in place inside `lib/templates.mjs`'s existing artifact-scaffold block (proposalTemplate grows the `## Capabilities` section; the tasks Close section gains the per-axis review items); no scaffold surface is split out.
- ADR-0007 (the law behind every door) — followed: the per-axis R3 rule is loop law rendered from `lib/loop-law.mjs`; no validator door is added or changed — the placeholder check gains only the Capabilities placeholder fragment inside the existing door.
- ADR-0008 (model-run reviews are advisory findings) — followed: the per-axis findings files keep the advisory grammar and dispositions; no verdict machinery ships.
- ADR-0009 (single-source the loop law) — followed: the per-axis R3 paths are defined once on the R3 review point in `lib/loop-law.mjs` and rendered into the law text, the statement surfaces, and the byte-identical `cdd/rules.md` mirror.
- ADR-0010 (reviewer independence is loop law) — followed: two axes = two cold sessions = two findings files becomes the law itself instead of a runner-side patch; each brief names only its own file so neither reviewer can write the other's.
- ADR-0011 (ticks are claims and pins hit real doors) — followed: the acceptance suite pins the on-disk wiring before any implementation task ticks.
