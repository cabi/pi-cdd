# acceptance — living spec

## Requirements

### Requirement: Acceptance suites run with the project tests

The project's test entrypoint executes the acceptance sweep: every suite
under tests/acceptance/ runs as part of `npm test`, and a failing suite fails
the command. CI runs the same entrypoint, so the sweep gates every push without
a separate workflow step. This is the only execution path the spec pins: how a
suite is written stays each suite's own concern.

```gherkin
Feature: Acceptance suites run with the project tests

  Scenario: npm test runs the whole acceptance sweep
    When npm test runs in a clean checkout
    Then every suite matching tests/acceptance/*.test.js executes
    And a suite that fails makes npm test exit nonzero
    # Verified by: tests/acceptance/run-acceptance.test.js

  Scenario: the sweep needs no per-suite registration
    When a new suite file is added under tests/acceptance/
    Then the next npm test run executes it without any other edit
    # Verified by: tests/acceptance/run-acceptance.test.js
  Scenario: CI runs the project test entrypoint
    When a push is checked by the repository's CI workflow
    Then the workflow runs npm test as a step
    And the acceptance sweep gates the push with it
    # Verified by: tests/acceptance/run-acceptance.test.js
```
