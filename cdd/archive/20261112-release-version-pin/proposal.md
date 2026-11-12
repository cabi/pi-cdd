# 20261112-release-version-pin

## Why

The v0.5.0 release commit turned both CI legs red: the gherkin living spec's scenario "Corpus teaches the fenced declarative format" carries `Given the extension at version 0.4.1`, and its pin's T4 check asserts `package.json` equals that literal. Every version bump therefore breaks the pin — v0.5.0 is simply the first release since the ADR-0006 consolidation (18ba08d) embedded the literal. The version fact is incidental context for a corpus-format scenario; pinning it literally turns every future release into a spec change by accident.

## What Changes

- T4 asserts that none of the corpus surfaces — the delta template, the authoring instruction (source and export), and cdd rule 4 (both the rendered `RULES_MD` and the `cdd/rules.md` store copy) — contains the manifest's release version string.
- The scenario's Given stops naming a literal version ("the extension at its released package version"); its Then adds that none of the 3 corpus sources names the extension's released package version.
- No corpus source changes — only the pin file `tests/acceptance/gherkin-style-guidance.test.js` is edited.

## Solutions Considered

- gherkin: re-pin the literal to 0.5.0 — rejected: the same trap fires again at 0.6.0; the breakage class survives.
- gherkin: drop the Given version clause and T4 entirely — rejected: nothing then guards the corpus against re-introducing a literal version; the shape check is one declarative assertion.
- gherkin: corpus-never-names-the-literal — adopted: keeps a factual pin with no version-shape regex; the pin reads four labelled surfaces covering the 3 corpus sources (the delta template rendering, the instruction source and its export, rule 4 through both `tpl.RULES_MD` and the `cdd/rules.md` store copy) and asserts none contains the manifest's release version string.

## Non-Goals

- No edit to the corpus sources themselves (`lib/templates.mjs`, `lib/instructions.mjs`, `cdd/rules.md` rule 4).
- No release runbook, version-bump tooling, or CI workflow change.
- No other spec, test, or door touched.

## Decision alignment

- **ADR-0001 (zero-dependency node tooling):** followed — no dependency enters; the pin reads files the suite already imports.
- **ADR-0003 (plain markdown store):** followed — the store's markdown stays the only source; no store format changes.
- **ADR-0006 (canonical fenced Gherkin):** the MODIFIED requirement restates the fenced document with every scenario the living spec holds for it; fences and pins stay canonical.
- **ADR-0007 (the law behind every door):** followed — no law text changes and no new door verdicts.
- **ADR-0008 (model-run reviews are advisory findings):** followed — the R2 findings are disposed as advisory rows, never verdicts.
- **ADR-0009 (single-source law):** no law text changes; the store copy of the law stays byte-identical.
- **ADR-0011 (ticks are claims and pins hit real doors):** followed — every tick names a verification that ran; the new pin hits the real corpus surfaces.
- **ADR-0012 (comments are shape-only):** followed — the delta's fences carry only shape comments; no decision ids ride comments.
- **ADR-0013 (one claim map for guard and ops):** followed — no claim-map change; the delta restates the living Code line unchanged.
- No ADR decision content is drafted or amended, and no ADR-governed file moves, so no ADR review and no reconfirmation ride this change (A2 governs moves of governed files; this change edits a claimed test file in place, with its delta in the same commit).

## Capabilities

- gherkin: `specs/gherkin/spec.md` — one MODIFIED requirement (Declarative style is door-1 law): the corpus scenario drops the literal version from its Given and gains a no-literal-release-version clause in its Then; the other two scenarios restated verbatim.

Done-When: npm test exits 0 with the manifest at its released version and the rewritten T4 passing
Done-When: T4 fails when any of the 3 corpus sources names the extension's released package version, with the failing run recorded at reviews/red-records.md
Done-When: cdd validate strict is green on the change and door 3 reports clean on the store after archive
Code: tests/acceptance/gherkin-style-guidance.test.js
