# pin-law-rename

## Why

Two modules with confusingly similar names sit at the heart of the loop: `lib/loop-law.mjs` (the loop law — review points, findings grammar, rules 2/2a/2b, ADR-0009) and `scripts/law.mjs` (the grammar law — pin dialect, fence scan, subset predicates, LAW_VERSION, ADR-0007). A change author in green-start-warning R1 wrote `lib/loop-law.mjs` into a delta `Code:` line when they meant `scripts/law.mjs`; the cold review caught it, but the generic name "law" keeps baiting the trap — the module's own name does not say it is the *grammar* law.

## What Changes

- BREAKING (path only): `scripts/law.mjs` is renamed to `scripts/grammar-law.mjs` (git history preserved via `git mv`); every importer re-points: `lib/store.mjs`, `lib/validate.mjs`, `lib/gherkin.mjs` (import + header comments), the sibling door scripts `scripts/spec-drift.mjs`, `scripts/spec-extract.mjs`, `scripts/arch-extract.mjs` (relative `./grammar-law.mjs`), and `tests/acceptance/review-wiring.test.js` (`lawPath` constant). The break is the path itself: in-repo importers are all re-pointed here, and adopting stores refresh their `cdd/scripts/` set through the existing `cdd init` mechanism — only an external importer of the old path breaks.
- `DOOR_SCRIPTS` (lib/templates.mjs) carries the new name; the stale `cdd/scripts/law.mjs` is removed and the copy set is regenerated through the real door (`cdd init` refresh on this store) so all four `cdd/scripts/*.mjs` files are byte-identical to their sources.
- Tests and docs re-pin the new path: `tests/smoke.mjs` (import + S30/S31 wording), `tests/acceptance/gherkin-guard-placeholder.test.js` (byte-identity pair + read), `tests/acceptance/gherkin-door3.test.js` (D4/D5 sandbox copies), `tests/acceptance/review-wiring.test.js:20` (`lawPath` constant), and `MAINTENANCE.md` (its three references).
- ADR-0007 is amended in place: frontmatter `code:` glob, prose name, and the bare `law.mjs` consequence mention (decisions/0007:32) all name `scripts/grammar-law.mjs`; its law is unchanged (one grammar module, every door imports it — the module just stops being generically "law").
- Living gherkin spec (via this change's delta): the `Code:` lines of "Declarative style is door-1 law" and "Guard tolerates scaffold placeholders in open deltas", and the placeholder requirement's prose/scenario naming, carry the new path — the glob update travels in the same change as the rename.
- No behavior change anywhere: no grammar edits, no verdict-shape edits, `LAW_VERSION` stays 2, `lib/loop-law.mjs` and its ADR-0009 untouched.
- This change follows ADR-0008 (model-run reviews are advisory findings): its R1/R2/R3/ADR reviews report findings with dispositions, never verdicts, and the deterministic validators keep gate authority. The delta's restated Code: globs carry surfaces ADR-0008 governs (lib/instructions.mjs) unchanged from the living spec.

## Solutions Considered

- gherkin: rename in place (adopted) vs. alias module `scripts/law.mjs` re-exporting `grammar-law.mjs` for compatibility (rejected — a second law-named file perpetuates the trap; the repo has no external importers to protect, the extension ships `cdd/scripts/` copies as a set via `DOOR_SCRIPTS`) vs. leaving the name and documenting harder (rejected — documentation already failed once; the name is the fix).
- gherkin: existing spec coverage reused — the byte-identity scenario in "Guard tolerates scaffold placeholders in open deltas" already pins source↔copy equality; this change re-pins it to the new filename instead of inventing a new scenario.
- gherkin: name candidates evaluated — `pin-law.mjs` (names one chapter of the module), `door-law.mjs` (vague), `spec-law.mjs` (collides with spec-drift/spec-extract family), `grammar-law.mjs` (adopted: names the module's whole content, ADR-0007's own title says "one grammar module behind every door", and pairs with `loop-law.mjs` so both law names are self-describing).

## Non-Goals

- No rename of `lib/loop-law.mjs` (aptly named; the trap dies when the other module stops being generically "law"), no renames of spec-drift/spec-extract/arch-extract, no `cdd/scripts/` layout changes beyond the regenerated copy set.
- No ADR-0007 supersession: the decision's content (one grammar module behind every door) stands; only its naming text and globs are amended.
- No LAW_VERSION bump, no grammar or verdict-shape changes, no edits to loop-law text or ADR-0009/0010.
- No changes to adopting-store migration beyond the existing `cdd init` refresh mechanism (which already re-copies the set).

## Capabilities

- gherkin — modified: two MODIFIED requirements in this change's delta ("Declarative style is door-1 law" — Code: glob re-point; "Guard tolerates scaffold placeholders in open deltas" — prose, scenario, and Code: glob re-point). No new capability, no open twin: `cdd/changes/` holds only this change.
Done-When: `node cdd/scripts/spec-drift.mjs` exits 0 with `cdd/scripts/grammar-law.mjs` byte-identical to `scripts/grammar-law.mjs`, the old name is gone pre-archive from every file except the unmerged living spec and this change's own record (`git grep -nE "(^|[^-a-z])law\.mjs"` matching nothing outside cdd/archive/, cdd/specs/, and cdd/changes/ — the living gherkin spec keeps its pre-merge text until archive merges this delta, and the change folder is the rename's own record), `npm test` is green, and once this change archives the same grep over all tracked files matches nothing outside cdd/archive/ (the pattern ignores `grammar-law.mjs`/`loop-law.mjs`; it covers paths, prose, and bare `law.mjs` mentions in scripts/, cdd/scripts/, lib/, tests/, MAINTENANCE.md, decisions/0007, cdd/specs/)
Code: scripts/grammar-law.mjs, scripts/spec-drift.mjs, scripts/spec-extract.mjs, scripts/arch-extract.mjs, cdd/scripts/**, lib/gherkin.mjs, lib/validate.mjs, lib/store.mjs, lib/templates.mjs, MAINTENANCE.md, decisions/0007-the-law-behind-every-door.md, tests/smoke.mjs, tests/acceptance/gherkin-guard-placeholder.test.js, tests/acceptance/gherkin-door3.test.js, tests/acceptance/review-wiring.test.js
