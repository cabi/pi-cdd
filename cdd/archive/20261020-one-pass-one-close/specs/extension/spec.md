## ADDED Requirements

### Requirement: Thin ops over a deep library

The `cdd` tool's ops dispatch and render; every behavior lives in the library they call. A status answer is one status document delivered in two shapes, and an archive refusal carries the machine-readable reason.

```gherkin
Feature: Thin ops over a deep library

Scenario: The status op delivers one document in two shapes
  Given a store holding exactly 1 open change
  When the cdd tool runs op status
  Then the JSON payload and the view payload carry the same status document
  # Verified by: tests/tools.mjs

Scenario: The archive refusal carries verdict and stage
  Given a change whose strict verdict is red
  When the cdd tool runs op archive on that change
  Then the tool answers with exactly 1 error result whose data holds the stage "strict-validation" and the strict verdict
  # Verified by: tests/tools.mjs
```

### Requirement: One verdict pair per change

A status pass evaluates each open change exactly once and derives both verdicts from that single evaluation; the draft verdict's errors are always a subset of the strict verdict's errors.

```gherkin
Feature: One verdict pair per change

Scenario: One evaluation returns both verdicts
  Given a change holding exactly 1 strict-only defect that draft mode tolerates
  When the verdict pair is derived from one evaluation
  Then the pair holds exactly 2 verdicts with draft ok and strict red
  # Verified by: tests/acceptance/extension-door1.test.js

Scenario: Draft errors are a subset of strict errors
  Given a change holding exactly 1 draft-level defect and exactly 1 strict-only defect
  When the verdict pair is derived from one evaluation
  Then every draft error also appears in the strict verdict's errors
  # Verified by: tests/acceptance/extension-door1.test.js
```

### Requirement: The close loop is one call

Archiving is one library call that gates, merges, and moves; callers render the outcome and never gate themselves.

```gherkin
Feature: The close loop is one call

Scenario: The close refuses a red change itself
  Given a change whose strict verdict is red
  When the archive library call runs on that change
  Then it returns ok false with the stage "strict-validation" and the strict verdict
  And the change folder stays in place with no spec merged
  # Verified by: tests/acceptance/extension-door1.test.js

Scenario: The close moves a green change atomically
  Given a strict-green change holding exactly 1 ADDED requirement
  When the archive library call runs on that change
  Then the requirement merges into the living spec and the change folder moves under the archive
  # Verified by: tests/acceptance/extension-door1.test.js
```

Code: index.ts, lib/status.mjs, lib/status-ui.ts, tests/tools.mjs, tests/acceptance/extension-door1.test.js
