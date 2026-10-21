# Delta — acceptance-wiring

## ADDED Requirements

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
