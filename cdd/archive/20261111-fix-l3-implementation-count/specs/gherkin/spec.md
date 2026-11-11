## ADDED Requirements

### Requirement: L3 scale counts implementation subtasks

The drift guard's task-scale law MUST count only a living change's implementation subtasks — tracked checkbox items under the `## 3. Implementation` heading, the section the strict validator counts — never context, design, or close tasks. More than 12 fails unless the tasks file records a split-considered decision line (rule 6).

```gherkin
Feature: L3 scale counts implementation subtasks

Scenario: Scaffold overhead does not reach the limit
  Given a living change whose tasks file holds 9 implementation subtasks and 4 non-implementation tracked tasks, 13 tracked in all, with no split-considered line
  When the drift guard runs over that store
  Then no L3 issue is reported
  # Verified by: tests/acceptance/guard-l3-scope.test.js

Scenario: Thirteen implementation subtasks fail with the scoped message
  Given a living change whose tasks file holds 13 implementation subtasks and no split-considered line
  When the drift guard runs over that store
  Then exactly 1 L3 issue is reported and its line names "13 implementation subtasks (> 12)"
  # Verified by: tests/acceptance/guard-l3-scope.test.js

Scenario: A split-considered line passes the limit
  Given a living change whose tasks file holds 13 implementation subtasks and a split-considered decision line
  When the drift guard runs over that store
  Then no L3 issue is reported
  # Verified by: tests/acceptance/guard-l3-scope.test.js

Scenario: The guard agrees with the strict validator's counter
  Given a living change whose tasks file holds 13 implementation subtasks and 4 non-implementation tracked tasks
  When the guard's task-scale law and the strict validator each count that tasks file's implementation subtasks
  Then both counts equal exactly 13
  # Verified by: tests/acceptance/guard-l3-scope.test.js
```

Code: scripts/spec-drift.mjs, cdd/scripts/**, tests/acceptance/guard-l3-scope.test.js
split-considered: deferred to the PF-6 gherkin store-ops split; rides the guard half of the designed cut.
