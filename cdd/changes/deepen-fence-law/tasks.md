<!-- filled from the template; the instruction comment above traveled with it -->

# Tasks — deepen-fence-law

## 1. Context

- [x] 1.1 Read the living spec (cdd/specs/gherkin/spec.md), every file matching the proposal's Code: globs, ADR-0001/0005/0006, and MAINTENANCE.md — verify by this task naming all four sources read

## 2. Design

- [x] 2.1 Design gate — T1 cross-cutting YES (all doors adopt one law module); T2 architecture bet YES (frozen stores refresh their law); T3 shared seam YES (scripts/law.mjs is the seam, one adapter lib + one adapter door scripts — two adapters, real seam); T4 invariant risk NO (verdict shapes unchanged); T5 parallel work NO (single change, sequential commits). Design recorded in Design Notes below — verify by this line naming all five answers

## Design Notes

- scripts/law.mjs owns the grammar; lib and the copied door scripts both adapt it (lib imports ../scripts/law.mjs — plain ESM, no build step). Zero dependencies, Node >= 20.
- Subset enforcement lands at parser-bearing doors only: door 1 (cdd validate) and door 3 full scan. Doors 1–2 staged/commit-msg modes stay parser-free (ADR-0001).
- law.mjs ships through the existing DOOR_SCRIPTS copy list; cdd init re-copies cdd/scripts/* on existing stores. LAW_VERSION is a diagnostic, not a migration system.
- Verdict shapes are frozen: guard keeps its flat lettered strings, validate keeps {ok, errors, warnings}.

## 3. Implementation

- [x] 3.1 The tasks grammar gets an owner — law.mjs tasks primitives + parseTasks in lib/store.mjs, template double "## 4. Close" fixed, consumers switched, template-pinning test — verify by node tests/smoke.mjs
- [ ] 3.2 The fence law moves into law.mjs — scanner/mask/pin dialect/error-shaping/subset predicates, lib/gherkin.mjs + lib/validate.mjs as door-1 adapter — verify by node tests/smoke.mjs
- [ ] 3.3 Door scripts adopt the law — guard full scan enforces the subset, spec-extract counts strict pins, arch-extract strict frontmatter, L3 via law.mjs — verify by node tests/smoke.mjs
- [ ] 3.4 Acceptance: door-3 subset scenario and pin-dialect scenario red/green as specified — verify by node tests/acceptance/gherkin-door3.test.js
- [ ] 3.5 Refresh path — cdd init re-copies cdd/scripts/* on existing stores, truthful [H] advice, LAW_VERSION marker; dogfood on this store — verify by node tests/tools.mjs and git status showing cdd/scripts/law.mjs
- [ ] 3.6 Records — ADR-0007, GLOSSARY "the law", MAINTENANCE sync flow, ADR-0003 glob fix — verify by node cdd/scripts/arch-extract.mjs exiting 0

## Done When Traceability

| criterion | task ids |
|---|---|
| a delta with a two-When scenario is red at the door 3 full scan and green at --staged | 3.3, 3.4 |
| the pin dialect is defined exactly once in scripts/law.mjs and no second copy remains under scripts/ | 3.2, 3.3 |
| cdd init on this existing store re-copies cdd/scripts/* and lists the refreshed files | 3.5 |
| npm test is green with a test pinning the scaffolded tasks template to the parser | 3.1 |

## 4. Close

- [ ] 4.1 cdd validate strict green, guard green
- [ ] 4.2 Archive — pair-commit: feature commit, then archive commit
