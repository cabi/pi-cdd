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

### Requirement: Extension-surface comments are shape-of-code documentation only

Comments on the extension surface — index.ts, lib/status-ui.ts, and lib/backlog.mjs — MUST describe only the code they sit in: the module's or function's contract, the algorithm's reading order, observed caller behavior. Comment text MUST carry no corpus routing: no decision ids, no process-finding ids, no commit ids, no cdd corpus paths, no spec-heading citations. Rendered text (error messages, status strings) is behavior, not comments, and is exempt. The comment-law pin scans this surface together with the gherkin-owned surface under the same requirement family.

```gherkin
Feature: Extension-surface comments are shape-of-code documentation only

Scenario: Comment scan reports zero corpus routing on the extension surface
  Given the extension source surface index.ts, lib/status-ui.ts, and lib/backlog.mjs with comment text isolated from strings by a string-aware scanner
  When the comment-law acceptance pin scans that comment text for decision ids, process-finding ids, commit ids, cdd corpus paths, and spec-heading citations
  Then the scan reports exactly 0 banned patterns and the pin exits 0
  # Verified by: tests/acceptance/comment-law.test.js
```

Code: index.ts, lib/status-ui.ts, lib/backlog.mjs

### Requirement: The adrs and reconfirm ops dispatch thin over the ADR library

The cdd tool grows two ops, adrs and reconfirm, registered as thin dispatchers over the ADR op library (`lib/adr-ops.mjs`) the way the backlog op dispatches over `lib/backlog.mjs`: each op's options parse against its allowed list with unknown options refused by name, the per-op help documentation for both derives its status vocabulary from the shared constant the guard reads (never re-typed), and every answer is the library's document — one text result, marked error exactly when the library refuses.

```gherkin
Feature: The adrs and reconfirm ops dispatch thin over the ADR library

Scenario: Help documents both ops with the shared status vocabulary
  Given the cdd tool loaded from the repository's extension entry
  When the cdd tool runs op help
  Then the per-op documentation holds entries for adrs and reconfirm, and the adrs entry renders exactly the shared vocabulary's 4 statuses in the shared constant's order
  # Verified by: tests/acceptance/adr-ops.test.js

Scenario: The adrs op refuses unknown options
  Given a store holding exactly 1 ADR
  When the cdd tool runs op adrs with the option sort set to alpha
  Then the tool answers with exactly 1 error naming the allowed options and nothing is written
  # Verified by: tests/acceptance/adr-ops.test.js

Scenario: The reconfirm op refuses unknown options
  Given a store holding exactly 1 ADR
  When the cdd tool runs op reconfirm with the option force set to true
  Then the tool answers with exactly 1 error naming the allowed options and the ADR file is unchanged
  # Verified by: tests/acceptance/adr-reconfirm.test.js

Scenario: A library refusal surfaces as exactly 1 error result
  Given a store holding exactly 1 ADR
  When the cdd tool runs op reconfirm with id ADR-0099 and a one-line evidence
  Then the tool answers with exactly 1 error result carrying the library's refusal text and the store is unchanged
  # Verified by: tests/acceptance/adr-reconfirm.test.js
Scenario: The ADR op library refuses silent direct execution
  Given the repository's extension sources after the change
  When node runs lib/adr-ops.mjs as a command
  Then it exits 2 with exactly 1 stderr line naming the adrs op
  # Verified by: tests/acceptance/adr-ops.test.js

```

Code: index.ts, tests/tools.mjs
