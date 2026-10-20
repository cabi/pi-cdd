# Tasks — test-the-scaffold

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

- [x] 2.1 Design gate — T1 cross-cutting NO, T2 architecture bet NO, T3 shared seam NO, T4 invariant risk NO, T5 parallel work NO — verify by this line naming all five answers

## 3. Implementation

- [x] 3.1 S32: the scaffold round-trips (createChange → draft red on placeholders → minimal fill relative to template output → strict green → archiveChange merges and moves) — verify by node tests/smoke.mjs
- [x] 3.2 fixtureProposal helper replaces the 5 duplicated canonical-proposal strings — verify by node tests/smoke.mjs

## Design Notes

Grilling record (2026-10-21): scope = full chain, not per-template pairs; fill style = minimal in-place edits on template output, no production fill API; fixtures = dedup only, edge cases keep hand-written defects; S29 out of scope; home = smoke.mjs (no acceptance file, no L1 machinery); vehicle = gherkin capability, store-split recorded in Non-Goals; S30 and S4 stay (unit + placeholder pins). Probe: fresh scaffold validates draft-red with exactly 3 placeholder errors, strict adds unchecked tasks + missing pin, archive refuses staged.

## Done When Traceability

| criterion | task ids |
|---|---|
| node tests/smoke.mjs green with S32 pinning scaffold → draft-red → fill → strict-green → archive merge | 3.1 |
| the 5 duplicated proposal fixture strings are gone, one helper serves all | 3.2 |

## 4. Close

- [ ] 4.1 cdd validate strict green, guard green
- [ ] 4.2 Archive — pair-commit: feature commit, then archive commit
