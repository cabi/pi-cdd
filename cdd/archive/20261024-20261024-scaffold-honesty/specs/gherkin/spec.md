## ADDED Requirements

### Requirement: Scaffold instruction text is not proposal content

The proposal validator SHALL treat HTML comment blocks in a proposal as non-content for the Done-When count and the placeholder check: the scaffold's own instruction text never counts as a Done-When line and never trips the placeholder check on its scaffold phrases. Section-presence and `Code:` checks still run on the raw proposal text, and an unclosed `<!--` is not masked — a placeholder hiding behind it keeps flagging.

```gherkin
Feature: Scaffold instruction text is not proposal content

Scenario: Comment-kept fill at the Done-When cap
  Given a proposal scaffolded from the template with every body placeholder filled in place and the scaffold instruction comment retained
  When the draft validator runs on a change holding that proposal with exactly 5 author-written Done-When lines
  Then the proposal reports no errors — the instruction's own "Done-When: 1-5 completion criteria" line does not count toward the cap of 5
  # Verified by: tests/smoke.mjs

Scenario: The instruction's own phrases never trip the placeholder check
  Given a comment-kept proposal whose body contains no unfilled placeholders
  When the draft validator runs on a change holding that proposal
  Then no "template placeholders still unfilled" error is reported for the instruction comment's scaffold phrases such as "scope fence"
  # Verified by: tests/smoke.mjs


Scenario: An unclosed comment opener is not masked
  Given a proposal whose Done-When line still holds an unclosed comment opener "Done-When: <!--" as its content
  When the draft validator runs on a change holding that proposal
  Then the placeholder error fires — only closed comment blocks are treated as non-content
  # Verified by: tests/smoke.mjs
```

Code: lib/validate.mjs, tests/smoke.mjs

### Requirement: Scaffold edits travel with their pins

The law SHALL state, in rule 7, that a change editing scaffold text legitimately edits, in the same change, the smoke pins that pin the scaffold's shape — in this repository the S-series checks in tests/smoke.mjs — with the sentence single-sourced in the law source and carried into the store copy byte-identically.

```gherkin
Feature: Scaffold edits travel with their pins

Scenario: Rule 7 states the scaffold-pin coupling
  Given the law's rule 7 text in the single law source lib/templates.mjs
  When the rule is read
  Then it states that a change editing scaffold text edits, in the same change, the pins pinning the scaffold's shape (the S-series checks in tests/smoke.mjs)
  # Verified by: tests/acceptance/scaffold-honesty.test.js

Scenario: The store copy carries the same sentence
  Given the rule-7 scaffold-pin sentence in the law source
  When the store copy cdd/rules.md is read
  Then it carries the same sentence, kept byte-identical by the single-source law
  # Verified by: tests/acceptance/scaffold-honesty.test.js
```

Code: lib/templates.mjs, cdd/rules.md, tests/acceptance/scaffold-honesty.test.js
