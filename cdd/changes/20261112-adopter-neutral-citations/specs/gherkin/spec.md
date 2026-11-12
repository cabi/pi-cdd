## ADDED Requirements

### Requirement: Adopter-visible text carries no decision ids

The text the extension writes or injects into an adopter store never cites a decision id from the extension's own store: ids are per-project and filename-derived, so a literal dangles or collides in a consuming project's own decisions. The corpus rule 4 spellings, the scaffold-written store files, and every door-finding message stay id-free. The rendered-text exemption of "Source comments are shape-of-code documentation only" is untouched — this law sweeps that rendered text itself.

```gherkin
Feature: Adopter-visible text carries no decision ids

Scenario: Corpus text cites no decision id
  Given the rules template rule 4, the store copy rule 4, and the delta authoring instruction source and its exported string
  When each surface's source text is scanned for a four-digit decision id literal
  Then no surface matches and rule 4 still names the fenced Feature document with the pin comment inside
  # Verified by: tests/acceptance/adopter-neutral-surfaces.test.js

Scenario: Door findings cite no decision id
  Given the finding message sources of the validator, the drift guard, and the grammar law, extension copies and store twins alike
  When each source is scanned for a four-digit decision id literal
  Then no source matches while each message keeps its law phrase
  # Verified by: tests/acceptance/adopter-neutral-surfaces.test.js

Scenario: A fresh adopter store is id-clean
  Given an empty directory outside this repository
  When the store scaffold initializes it with door scripts and hooks
  Then every written file scans clean of a four-digit decision id literal
  # Verified by: tests/acceptance/adopter-neutral-surfaces.test.js
```

Code: lib/templates.mjs, lib/instructions.mjs, cdd/rules.md, lib/validate.mjs, scripts/spec-drift.mjs, scripts/grammar-law.mjs, cdd/scripts/**, tests/acceptance/adopter-neutral-surfaces.test.js
split-considered: one text-hygiene property over surfaces gherkin already owns; no seam of a store-ops cut separates it, and a gherkin spec split is its own change if the split signal recurs.
