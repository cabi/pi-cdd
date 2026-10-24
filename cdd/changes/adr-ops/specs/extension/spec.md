## ADDED Requirements

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
