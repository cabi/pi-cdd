## ADDED Requirements

### Requirement: The new op warns on pre-existing red

The `new` tool op and the `/cdd-new` command render a scaffold result's `preexistingRed` as a warning block after the change summary: the findings listed, marked as pre-existing — the change did not cause them — with a hint to fix the store or knowingly accept the red. Both surfaces print no warning block when the list is empty, and the warning never blocks the scaffold.

```gherkin
Feature: The new op warns on pre-existing red

Scenario: The new op renders findings as a pre-existing-red block
  Given a scaffold result whose preexistingRed holds 2 findings
  When the new op renders the change summary
  Then the output holds exactly 1 pre-existing-red block listing both findings and stating the change did not cause them
  # Verified by: tests/acceptance/extension-new-warning.test.js

Scenario: The new op stays silent on a green start
  Given a scaffold result whose preexistingRed list is empty
  When the new op renders the change summary
  Then the output holds no pre-existing-red block
  # Verified by: tests/acceptance/extension-new-warning.test.js

Scenario: The cdd-new command renders the same block
  Given a scaffold result whose preexistingRed holds 1 finding
  When the /cdd-new command renders its result
  Then the output holds exactly 1 pre-existing-red block listing the finding
  # Verified by: tests/acceptance/extension-new-warning.test.js
```

Code: index.ts, tests/acceptance/extension-new-warning.test.js
