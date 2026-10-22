# extension — spec delta

## ADDED Requirements

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
