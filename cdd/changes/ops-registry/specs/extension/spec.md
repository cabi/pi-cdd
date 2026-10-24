# extension — spec delta

## MODIFIED Requirements

### Requirement: Thin ops over a deep library

The `cdd` tool's ops dispatch and render; every behavior lives in the library they call. A status answer is one status document delivered in two shapes, and an archive refusal carries the machine-readable reason. The op surface itself is one ordered registry in `lib/ops.mjs`: every op's name, its five-tool provenance marker where one exists (`was`), full documentation, legacy aliases, and parameter schema live in that one table, and every consumer derives — the tool declaration's op enum, the help op's per-op documentation payload, the legacy op alias fold, each dispatch case's option whitelist, and the door-1 slash command list the help screen renders (the five `registerCommand` calls stay literal in `index.ts`; the agreement pin detects drift between them and the registry).

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

Scenario: The registry drives every op surface
  Given the op registry in lib/ops.mjs and the extension loaded through its real entry point
  When the declaration enum, the help payload, the dispatch case labels, the per-op option whitelists, and the help rows are read
  Then each equals its derivation from the registry — exactly 9 ops, exactly 5 slash commands in registration order, and nothing extra on any surface
  And the tool declaration's description names every registry op
  # Verified by: tests/acceptance/ops-registry.test.js

Scenario: An undocumented option refuses with the registry's allowed list
  Given the extension loaded through its real entry point
  When the cdd tool runs an op that declares options, carrying an option its registry row does not declare
  Then the tool answers with exactly 1 error naming the unknown option and the allowed list equals the registry row's parameter keys
  # Verified by: tests/acceptance/ops-registry.test.js

Scenario: The registry documents every op it dispatches
  Given the help op's documentation payload
  When its keys are read
  Then they equal the registry's op names exactly — the help op included and the backlog premise option documented
  And each of the five five-tool originals carries its was provenance marker
  # Verified by: tests/acceptance/ops-registry.test.js
```

Code: index.ts, lib/ops.mjs, tests/tools.mjs, tests/acceptance/ops-registry.test.js
