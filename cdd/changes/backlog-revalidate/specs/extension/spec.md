## MODIFIED Requirements

### Requirement: The backlog op triages findings on disk

The `cdd` tool's backlog op maintains `cdd/backlog.md`, a flat list of process findings with one line per item: list is the default action, add appends the next id on a grammar-conforming line, resolve rewrites an item's status, and revalidate re-checks premise-bearing active items (open, watch, seeded-into-change) against the store, answering one verdict per item — hold, ROTTED (premise now false), NOT-MECHANICAL (no premise), or ANCHOR-GONE (a grep premise whose target path is gone). Item lines may carry an optional premise (a closed micro-form the tool evaluates in-process — `exists:`/`absent:`/`grep:` with a literal and an exact count, never shell or regex) and a machine-written verified date history. The op refuses unknown actions and options, unknown ids, resolving to open, seeded-into-change without a change name, and any off-grammar item line — including a malformed premise or verified segment.

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

Scenario: Premise and verified segments parse and round-trip
  Given a store whose cdd/backlog.md holds 1 item line ending with " | premise: exists:lib/backlog.mjs | verified: 2026-10-23" after its source segment
  When the cdd tool runs op backlog with no action
  Then the answer renders the item line byte-identical to the file
  # Verified by: tests/acceptance/backlog-revalidate.test.js

Scenario: A malformed premise refuses every action
  Given a store whose cdd/backlog.md holds 1 item line whose premise segment is not one of the three micro-forms
  When the cdd tool runs op backlog with no action
  Then the tool answers with exactly 1 error result naming the malformed line
  # Verified by: tests/acceptance/backlog-revalidate.test.js

Scenario: A malformed verified segment refuses every action
  Given a store whose cdd/backlog.md holds 1 item line whose verified segment holds "23-10-2026"
  When the cdd tool runs op backlog with no action
  Then the tool answers with exactly 1 error result naming the malformed line
  # Verified by: tests/acceptance/backlog-revalidate.test.js

Scenario: Out-of-order verified dates refuse every action
  Given a store whose cdd/backlog.md holds 1 item line whose verified segment holds "2026-10-24 2026-10-23"
  When the cdd tool runs op backlog with no action
  Then the tool answers with exactly 1 error result naming the malformed line
  # Verified by: tests/acceptance/backlog-revalidate.test.js

Scenario: Add carries a valid premise
  Given a store whose cdd/backlog.md is absent
  When the cdd tool runs op backlog with action add, a one-line summary, a source reference, and premise "absent:cdd/archive/20261001-x"
  Then the created item line ends with " | premise: absent:cdd/archive/20261001-x"
  # Verified by: tests/acceptance/backlog-revalidate.test.js

Scenario: Add refuses a malformed premise
  Given a store whose cdd/backlog.md is absent
  When the cdd tool runs op backlog with action add, a one-line summary, a source reference, and premise "grep:x"
  Then the tool answers with exactly 1 error result and cdd/backlog.md is absent
  # Verified by: tests/acceptance/backlog-revalidate.test.js

Scenario: Revalidate reports a verdict per active item and stamps verified dates
  Given a store whose cdd/backlog.md holds an open item whose premise holds, an open item whose premise is false, an open item without a premise, a watch item whose premise holds, a seeded-into-change item whose premise is false, and 1 done item
  When the cdd tool runs op backlog with action revalidate
  Then the answer carries exactly 5 verdict lines naming the 5 active items — hold, ROTTED, NOT-MECHANICAL, hold, ROTTED — and no line for the done item
  And every premise-bearing active item's line in the file now carries a verified segment holding today's date exactly once
  # Verified by: tests/acceptance/backlog-revalidate.test.js

Scenario: A vanished grep anchor reports ANCHOR-GONE
  Given a store whose cdd/backlog.md holds 1 open item whose grep premise names a path that does not exist in the store
  When the cdd tool runs op backlog with action revalidate
  Then that item's verdict line reads ANCHOR-GONE
  # Verified by: tests/acceptance/backlog-revalidate.test.js

Scenario: Grep premises evaluate by exact line count
  Given a store holding lib/sample.mjs with exactly 1 line containing the word needle and a cdd/backlog.md with 2 open items, one carrying premise "grep:needle@lib/sample.mjs=1" and one carrying premise "grep:needle@lib/sample.mjs=2"
  When the cdd tool runs op backlog with action revalidate
  Then the first item's verdict line reads hold and the second item's verdict line reads ROTTED
  # Verified by: tests/acceptance/backlog-revalidate.test.js

Scenario: Revalidate never edits dispositions and is same-day idempotent
  Given a store whose cdd/backlog.md holds premise-bearing items with statuses open, watch, and done
  When the cdd tool runs op backlog with action revalidate twice on the same day
  Then every item's id, status, summary, source, change, note, and premise segments are byte-identical before the first run and after the second
  And each premise-bearing active item's verified segment holds exactly 1 date
  # Verified by: tests/acceptance/backlog-revalidate.test.js

Scenario: A third verified date forces a disposition
  Given a store whose cdd/backlog.md holds 1 open item whose verified segment holds exactly 2 distinct dates and whose premise holds
  When the cdd tool runs op backlog with action revalidate
  Then that item's verdict line carries the force-a-disposition flag and its verified segment holds exactly 3 dates
  # Verified by: tests/acceptance/backlog-revalidate.test.js

Scenario: List annotates staleness for active items
  Given a store whose cdd/backlog.md holds 1 never-verified open item, 1 open item verified 3 days ago, and 1 done item
  When the cdd tool runs op backlog with no action
  Then the answer renders every item line verbatim followed by a staleness block listing exactly the 2 open items — one as never verified, one as verified on its date 3 days ago — naming no done item
  # Verified by: tests/acceptance/backlog-revalidate.test.js

Scenario: List marks a vanished grep anchor
  Given a store whose cdd/backlog.md holds 1 open item whose grep premise names a path that does not exist in the store
  When the cdd tool runs op backlog with no action
  Then the staleness block marks that item's anchor as gone
  # Verified by: tests/acceptance/backlog-revalidate.test.js
```

Code: index.ts, lib/backlog.mjs, tests/tools.mjs, tests/acceptance/backlog-op.test.js, tests/acceptance/backlog-revalidate.test.js
