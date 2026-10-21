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

### Requirement: The acceptance sweep gates on both supported Node majors

CI MUST run the project test entrypoint on exactly 2 Node majors — 20, the CI floor, and 24, the local-dev major — as parallel guard-job legs that never cancel each other's signal, so a major-specific regression fails the push on the leg that reproduces it.

```gherkin
Feature: The acceptance sweep gates on both supported Node majors

Scenario: The guard job fans out to both supported Node majors
  Given the repository's GitHub Actions workflow
  When the guard job's build matrix is read
  Then it lists exactly the 2 Node versions 20 and 24
  And each leg provisions its Node from its matrix entry
  And each leg runs the same npm ci, guard scan, and npm test steps
  # Verified by: tests/acceptance/ci-node-matrix.test.js

Scenario: One leg's failure never cancels the other leg's signal
  Given the guard job's build matrix
  When the job's strategy is read
  Then fail-fast is false so a red leg lets the other leg finish and report its own verdict
  # Verified by: tests/acceptance/ci-node-matrix.test.js
```

Code: .github/workflows/cdd.yml, tests/acceptance/ci-node-matrix.test.js
