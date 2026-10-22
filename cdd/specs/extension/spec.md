# extension — living spec

## Requirements

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

Scenario: A missing change refuses identically
  Given a store holding no change of the name asked for
  When the cdd tool runs op archive on that name
  Then the tool answers with the same refusal text and staged payload as a red change
  # Verified by: tests/tools.mjs

Scenario: The close moves a green change atomically
  Given a strict-green change holding exactly 1 ADDED requirement
  When the archive library call runs on that change
  Then the requirement merges into the living spec and the change folder moves under the archive
  # Verified by: tests/acceptance/extension-door1.test.js
```

Code: index.ts, lib/status.mjs, lib/status-ui.ts, tests/tools.mjs, tests/acceptance/extension-door1.test.js

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

### Requirement: The backlog op triages findings on disk

The `cdd` tool's backlog op maintains `cdd/backlog.md`, a flat list of process findings with one line per item: list is the default action, add appends the next id on a grammar-conforming line, and resolve rewrites an item's status. The op refuses unknown actions and options, unknown ids, resolving to open, seeded-into-change without a change name, and any off-grammar item line.

```gherkin
Feature: The backlog op triages findings on disk

Scenario: Add appends the first item when the file is absent
  Given a store whose cdd/backlog.md is absent
  When the cdd tool runs op backlog with action add, a one-line summary, and a source reference
  Then cdd/backlog.md is created holding exactly 1 item line that starts with "- PF-1 [open] " and ends with the source reference introduced by " | source: "
  # Verified by: tests/acceptance/backlog-op.test.js

Scenario: List is the default action and renders every item
  Given a store whose cdd/backlog.md holds exactly 2 items
  When the cdd tool runs op backlog with no action
  Then the answer renders both item lines with their ids and statuses
  # Verified by: tests/acceptance/backlog-op.test.js

Scenario: Resolve rewrites one item's status
  Given a store whose cdd/backlog.md holds item PF-1 with status open and exactly 1 other item
  When the cdd tool runs op backlog with action resolve, id PF-1, and status done
  Then PF-1's line reads "[done]" and every other item line is unchanged
  # Verified by: tests/acceptance/backlog-op.test.js

Scenario: Seeded-into-change demands a change name
  Given a store whose cdd/backlog.md holds item PF-1 with status open
  When the cdd tool runs op backlog with action resolve, id PF-1, status seeded-into-change, and no change name
  Then the tool answers with exactly 1 error result and the file is unchanged
  # Verified by: tests/acceptance/backlog-op.test.js

Scenario: An unknown action refuses
  Given a store whose cdd/backlog.md holds exactly 1 item
  When the cdd tool runs op backlog with action purge
  Then the tool answers with exactly 1 error result naming the allowed actions and the file is unchanged
  # Verified by: tests/acceptance/backlog-op.test.js

Scenario: An unknown option refuses
  Given a store whose cdd/backlog.md holds exactly 1 item
  When the cdd tool runs op backlog with no action and the option color set to red
  Then the tool answers with exactly 1 error result naming the allowed options and the file is unchanged
  # Verified by: tests/acceptance/backlog-op.test.js

Scenario: An unknown id refuses
  Given a store whose cdd/backlog.md holds exactly 1 item PF-1
  When the cdd tool runs op backlog with action resolve, id PF-9, and status done
  Then the tool answers with exactly 1 error result and the file is unchanged
  # Verified by: tests/acceptance/backlog-op.test.js

Scenario: Resolving to open refuses
  Given a store whose cdd/backlog.md holds item PF-1 with status open
  When the cdd tool runs op backlog with action resolve, id PF-1, and status open
  Then the tool answers with exactly 1 error result and the file is unchanged
  # Verified by: tests/acceptance/backlog-op.test.js

Scenario: An off-grammar item line refuses every action
  Given a store whose cdd/backlog.md holds 1 item line without a status field
  When the cdd tool runs op backlog with no action
  Then the tool answers with exactly 1 error result naming the malformed line
  # Verified by: tests/acceptance/backlog-op.test.js
```

Code: index.ts, lib/backlog.mjs, tests/tools.mjs, tests/acceptance/backlog-op.test.js
