# Delta — acceptance-wiring

## ADDED Requirements

### Requirement: The loop law names the pins' executor

The loop law's test-first rule (rule 7) MUST name the executor of Verified-by pins — `npm test`, whose `node --test` sweep executes every `tests/acceptance/*.test.js` suite, the same entrypoint CI runs — and the store copy `cdd/rules.md` MUST carry the sentence byte-identically to the law source.

```gherkin
Feature: The loop law names the pins' executor

Scenario: Rule 7 names the executor
  Given the loop law text
  When rule 7 is read
  Then it states that npm test runs the node --test sweep executing every tests/acceptance/*.test.js suite and that CI runs the same entrypoint
  # Verified by: tests/acceptance/law-pin-executor.test.js

Scenario: The sentence has exactly 1 home
  Given the law source and the store copy cdd/rules.md
  When the executor sentence is searched for in both
  Then both carry it with identical wording
  # Verified by: tests/acceptance/law-pin-executor.test.js
```

Code: lib/templates.mjs, cdd/rules.md, tests/acceptance/law-pin-executor.test.js
