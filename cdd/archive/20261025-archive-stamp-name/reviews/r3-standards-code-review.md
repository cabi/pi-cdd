# R3 standards-axis code review — 20261025-archive-stamp-name
- reviewer: gpt-6-luna (family opencode-zen)
- author of record: zai/glm-5.3 (family zai)
- reviewed at: `5667775c2efb86bf42b6ed9b76b4436f134caadb` + dirty (`M lib/adr-ops.mjs`, `M lib/store.mjs`, `M tests/acceptance/adr-reconfirm.test.js`, `M tests/smoke.mjs`, `?? cdd/changes/20261025-archive-stamp-name/`, `?? tests/acceptance/archive-folder-name.test.js`)
- scope: `git diff HEAD -- lib tests` + the untracked `tests/acceptance/archive-folder-name.test.js` (standards axis only)

## Findings

### blocker — New comments violate ADR-0012's comment-shape law

Evidence: `lib/store.mjs:91` calls out “One law, two consumers” and maintains a cross-module list ending in `lib/adr-ops.mjs`; this is a hand-maintained consumer index, not a description of the helper's local shape. `tests/acceptance/archive-folder-name.test.js:2-8` narrates the covered law and explicitly points back to the spec with `Pins: gherkin ADDED "Archive folders carry the stamp date once"`. `tests/smoke.mjs:1126` adds scenario-heading prose to the `S39` test-local check id. ADR-0012, “Comments are shape-of-code documentation only,” bans hand-maintained indexes and corpus/spec-heading pointers; it specifically allows test-local check ids but not scenario-heading prose around them.

- disposition: fixed — all three sites reduced to shape-only at Close (2026-10-25), re-verified green: lib/store.mjs:91 comment now states the helper's contract alone (cross-module consumer list removed); tests/acceptance/archive-folder-name.test.js header reduced to the file's own subject with the spec-heading "Pins:" pointer and scenario narration removed (and the closable() comment's "pinning one fixture scenario" phrase dropped); tests/smoke.mjs S39 heading is now the topic label "dated-name archive round-trip". Evidence tails after fix: `node tests/acceptance/archive-folder-name.test.js` → 4 passed 0 failed; `node tests/acceptance/adr-reconfirm.test.js` → 17 passed 0 failed; `node tests/smoke.mjs` → 39/39 passed; `npm test` → exit 0.

## Named observation — `archivedBasename` import

No finding. `lib/adr-ops.mjs:17` imports the one `archivedBasename` helper from `lib/store.mjs:91-94`, where it sits beside the archive path composition it serves. This keeps the strip-once behavior single-sourced rather than restating it in the query consumer. ADR-0007's centralized grammar law does not claim this archive-name transformation, and ADR-0013's claim map remains in `scripts/adr-index.mjs`; the reconfirm operation adds no competing map. The import does load the broader store module into ADR ops, but the brief confirms there is no cycle and the cited decisions establish no prohibition on this dependency. It stands as-is under the standards reviewed.

## Verification

- `npm test` — passed; includes smoke S39, reconfirm RC1–RC17, and archive-folder AF1–AF4.

VERDICT: BLOCK — open blocker: new comments violate ADR-0012
