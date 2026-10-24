## ADDED Requirements

### Requirement: The spec model is the single parse

The spec-file parse — requirement blocks, delta operation blocks, fence-masked pins, and `Code:` globs compiled with the shared matcher — MUST be defined exactly once, in the law module behind every door; the drift guard, the spec extractor, and the store's delta readers MUST import that model and none MUST re-state the parsing. The extractor's pin scan MUST mask to gherkin fence interiors exactly like the guard, and its glob claims MUST come from the shared matcher.

```gherkin
Feature: The spec model is the single parse

Scenario: One parse answers every part
  Given a delta spec text holding 1 MODIFIED requirement whose scenario ends with a strict fence pin and whose block carries a Code line with a single-star glob
  When the law module's spec-model parse runs on the text
  Then the model holds the operation block and the requirement block with their headings and start lines, exactly 1 pin read from the gherkin fence interior, and the Code glob compiled to claim exactly the files it names
  # Verified by: tests/acceptance/spec-model.test.js

Scenario: No door re-states the spec parse
  Given the repository's law module, guard, spec extractor, and store parse sources after the change
  When they are scanned for the spec-model parse and for private pin scans and glob translations
  Then the parse is defined exactly once in the law module and every other file only imports it — the extractor holds no private pin scan and no private glob translation, and the store's parse functions delegate to the model
  # Verified by: tests/acceptance/spec-model.test.js

Scenario: A fence-quoted pin lookalike pins nothing at the extractor
  Given a repository whose spec carries exactly 1 strict fence pin and 1 quoted "# Verified by:" lookalike inside a non-gherkin documentation fence, with both pinned test files present
  When the spec extractor runs
  Then the lookalike pins nothing — its test file stays an extraction candidate — and the strict fence pin pins its test
  # Verified by: tests/acceptance/spec-model.test.js

Scenario: A star glob claims the files it names
  Given a repository whose spec claims a single-star glob naming exactly 2 existing files and no other spec claims them
  When the spec extractor runs
  Then both files are owned territory and the burn-down counts them — never silently zero
  # Verified by: tests/acceptance/spec-model.test.js
```

Code: scripts/grammar-law.mjs, scripts/spec-drift.mjs, scripts/spec-extract.mjs, lib/store.mjs, cdd/scripts/**, tests/acceptance/spec-model.test.js
