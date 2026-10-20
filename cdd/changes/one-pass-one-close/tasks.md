# Tasks — one-pass-one-close

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

- [x] 2.1 Design gate — answered in Design Notes below: one change (T1 cross-cutting yes — shared review origin), seam additive (T3), no invariant risk beyond the asserted subset (T4), no parallel work (T5), no architecture bet requiring code (T2) — verify by this line naming all five answers

## 3. Implementation

- [x] 3.1 `lib/validate.mjs`: errors carry a strictness tag; `validateBoth(root, name)` returns `{draft, strict}` from one evaluation with the subset invariant asserted — verify by node tests/smoke.mjs
- [x] 3.2 `lib/status.mjs` consumes `validateBoth` (one evaluation per change); the status op handler answers from exactly 1 `status()` call feeding both payloads — verify by node tests/tools.mjs
- [x] 3.3 `lib/store.mjs`'s `archiveChange` gates on strict itself and returns `{ok:false, stage:"strict-validation", validation}` on refusal; both handlers render only — verify by node tests/smoke.mjs
- [x] 3.4 tests/acceptance/extension-door1.test.js pins the three extension requirements — verify by node tests/acceptance/extension-door1.test.js
- [x] 3.5 ownership moves: gherkin spec's `Code:` line narrows to gherkin's own files and tests; the extension delta carries its own — verify by node cdd/scripts/spec-drift.mjs

## Design Notes

- Grilling record (2026-10-20): one change, not two (shared review origin, same files, one archive cycle). `validateBoth` is additive — `validateChange`/`validateStore` shapes stay frozen because the verdict is a counterparty contract (ADR-0002) and ~50 pinned assertions read `v.ok`/`v.errors`. "both" is not a strictness dial setting; it is a different question, so it gets its own interface. The refusal payload gains `stage:"strict-validation"` so future stages (merge, move) have a home. Human-visible texts stay byte-identical.
- Single implementation commit: splitting would force an unnatural gherkin-spec touch per commit (L2 arithmetic), and the change is one coherent deepening.

## Done When Traceability

| criterion | task ids |
|---|---|
| status op answers from exactly 1 `status()` call, both payloads same data | 3.2 |
| `archiveChange` refuses red changes with staged payload, no caller pre-gates | 3.3 |
| draft ⊆ strict machine-checked from one evaluation | 3.1 |
| extension capability owns the tool surface (O/L2 green) | 3.4, 3.5 |

## 4. Close

- [ ] 4.1 cdd validate strict green, guard green
- [ ] 4.2 Archive — pair-commit: feature commit, then archive commit
