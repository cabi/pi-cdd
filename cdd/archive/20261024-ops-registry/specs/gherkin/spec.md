# gherkin — spec delta

## ADDED Requirements

### Requirement: The help screen renders the ops registry

The /cdd-help screen's "Commands and tools" rows render from the op registry in `lib/ops.mjs`: the commands row joins the registered slash commands in registration order, the ops row joins the registry's op names in registry order, and the plain render names no command the extension does not register. The smoke suite pins the rendered rows against the same registry.

```gherkin
Feature: The help screen renders the ops registry

Scenario: The help rows equal the registry render
  Given lib/help.mjs and the op registry in lib/ops.mjs
  When the help screen's commands row and ops row are rendered
  Then the commands row equals the slash-prefixed join of the exactly 5 registered commands in registration order and the ops row equals the join of the exactly 9 registry op names
  # Verified by: tests/acceptance/ops-registry.test.js

Scenario: The rendered help text carries no ghost command
  Given the plain-text render of the help screen
  When its rows are read
  Then /cdd-validate appears nowhere in it and every slash command it names is one the extension registers
  # Verified by: tests/acceptance/ops-registry.test.js

Scenario: The smoke suite pins the rendered rows
  Given the smoke suite's help-content check
  When it runs against the current help screen
  Then its needle list carries the registry-derived ops row and it asserts the ghost command absent
  And the check is updated in place — no smoke check is deleted
  # Verified by: tests/acceptance/ops-registry.test.js
```

Code: lib/help.mjs, tests/smoke.mjs
