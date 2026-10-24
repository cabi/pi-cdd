## ADDED Requirements
### Requirement: The ADR claims index is single-sourced

The ADR claims index (decision frontmatter parsed into id, file, status, supersedes, title, and code globs), the glob matcher that turns a code glob into the set of files it claims, and the ADR status vocabulary are defined exactly once in a zero-dependency door module, `scripts/adr-index.mjs`; the drift guard and the tool ops import them and none re-states the parsing, the matcher, or the vocabulary. The store copy travels with the guard's copies.

```gherkin
Feature: The ADR claims index is single-sourced

Scenario: The index builds one entry per ADR in the decisions home
  Given the repository's store holding its 12 ADRs in cdd/decisions/
  When the claims index is built
  Then it holds exactly 12 entries, one per ADR, each carrying its ADR id, its store-relative file path, its frontmatter status, its title from the first heading, the code globs from its frontmatter, and a supersedes field that is null for every entry (this corpus records supersession in prose, not frontmatter)
  # Verified by: tests/acceptance/adr-index-agreement.test.js

Scenario: The op and the guard answer the same governing set
  Given a synthetic git repository whose store holds exactly 2 accepted ADRs with overlapping code claims and 1 open change whose delta spec claims a file both ADRs govern
  When the door 3 full scan and the cdd tool's adrs op with the claimed file both answer
  Then the ADR citations in the scan's A1 findings and the op's governing set name exactly the same 2 ADR ids
  # Verified by: tests/acceptance/adr-index-agreement.test.js

Scenario: No consumer re-states the matcher
  Given the repository's guard and op sources after the change
  When scripts/spec-drift.mjs, lib/adr-ops.mjs, and scripts/adr-index.mjs are scanned for a glob-to-regex translation
  Then the translation is defined exactly once, in scripts/adr-index.mjs, and every other file only imports it
  # Verified by: tests/acceptance/adr-index-agreement.test.js
```

Code: scripts/adr-index.mjs, tests/acceptance/adr-index-agreement.test.js

### Requirement: A-check findings name their remedy op

The drift guard's A1 and A2 findings teach executable remedies: A1's finding names the adrs op reverse lookup as the way to find every governing ADR, and A2's finding names the reconfirm op as the tooled path to reconfirmation. The naming rides the existing finding text; the firing triggers, the check tags, and the rest of the finding text are unchanged.

```gherkin
Feature: A-check findings name their remedy op

Scenario: An A1 finding names the reverse-lookup command
  Given a synthetic git repository whose store holds exactly 1 accepted ADR governing a file that 1 open change's delta spec claims and whose proposal does not cite the ADR
  When the door 3 full scan runs
  Then the scan exits non-zero with exactly 1 A1 finding naming the ADR, and the finding contains "cdd adrs --code"
  # Verified by: tests/acceptance/guard-adr-remedies.test.js

Scenario: An A2 finding names the reconfirm command
  Given a synthetic git repository whose store holds exactly 1 accepted ADR whose governed file carries 1 commit after the ADR file's last commit and no open change claims that file
  When the door 3 full scan runs
  Then the scan exits non-zero with exactly 1 A2 finding naming the ADR, and the finding contains "cdd reconfirm"
  # Verified by: tests/acceptance/guard-adr-remedies.test.js
```

Code: scripts/spec-drift.mjs, cdd/scripts/**, tests/acceptance/guard-adr-remedies.test.js

## MODIFIED Requirements

### Requirement: Guard tolerates scaffold placeholders in open deltas

The door 3 full scan treats a placeholder pin inside an open-delta spec (`cdd/changes/*/specs/`) as template text, not a claim: it does not fail the pin-resolution check and is reported as skipped, one informational line per open delta after the verdict — a skip is never silent. A placeholder pin is a `# Verified by:` pin whose path contains the scaffold's placeholder marker: the angle-bracket form of the words `scenario` or `name`, spelled here without its brackets because the draft door flags the literal token strings as unfilled (`lib/validate.mjs`) — the guard and the draft door agree on this token family. Any other angle-bracket shape is not a placeholder: it fails L1 even in an open delta, so the guard never silently greens an unrecognized token. Living specs keep full strictness — a placeholder pin there is an unresolvable pin like any other. The predicate lives in the grammar law module (`scripts/grammar-law.mjs`, `LAW_VERSION` 2) and the store copies travel with their sources: `cdd/scripts/grammar-law.mjs`, `cdd/scripts/spec-drift.mjs`, and `cdd/scripts/adr-index.mjs` are byte-identical to them in this repository, and adopting stores pick all three up when `cdd init` refreshes `cdd/scripts/*`.

```gherkin
Feature: Guard tolerates scaffold placeholders in open deltas

Scenario: Placeholder pin in an open delta stays green with a skip line
  Given a store whose full scan exits 0
  And an open delta spec pinning exactly 1 acceptance-test path containing a placeholder marker (angle-bracket `scenario`)
  When the door 3 full scan runs
  Then the scan exits 0 and prints exactly 1 skip line reporting 1 placeholder pin skipped and naming the open delta
  # Verified by: tests/acceptance/gherkin-guard-placeholder.test.js

Scenario: Placeholder pin in a living spec stays red
  Given a store whose full scan exits 0 except for a living spec pinning exactly 1 acceptance-test path containing a placeholder marker (angle-bracket `scenario`)
  When the door 3 full scan runs
  Then the scan exits non-zero with exactly 1 pin-resolution issue naming the living spec and prints no placeholder-skip line
  # Verified by: tests/acceptance/gherkin-guard-placeholder.test.js

Scenario: Resolved pin in an open delta prints no skip line
  Given a store whose full scan exits 0
  And an open delta spec pinning exactly 1 existing acceptance-test file with no placeholder marker
  When the door 3 full scan runs
  Then the scan exits 0 and prints no placeholder-skip line
  # Verified by: tests/acceptance/gherkin-guard-placeholder.test.js

Scenario: Unrecognized marker shape in an open delta stays red
  Given a store whose full scan exits 0
  And an open delta spec pinning exactly 1 acceptance-test path containing a marker shape the template never emits (angle-bracket `flavor`)
  When the door 3 full scan runs
  Then the scan exits non-zero with exactly 1 pin-resolution issue naming the delta spec and prints no placeholder-skip line
  # Verified by: tests/acceptance/gherkin-guard-placeholder.test.js

Scenario: Store copies stay byte-identical to the law sources
  Given this repository's store after the change
  When the store copies are compared with their sources
  Then cdd/scripts/grammar-law.mjs is byte-identical to scripts/grammar-law.mjs, cdd/scripts/spec-drift.mjs is byte-identical to scripts/spec-drift.mjs, and cdd/scripts/adr-index.mjs is byte-identical to scripts/adr-index.mjs, and the law reports LAW_VERSION 2
  # Verified by: tests/acceptance/gherkin-guard-placeholder.test.js
```

Code: scripts/grammar-law.mjs, scripts/spec-drift.mjs, lib/templates.mjs, tests/acceptance/gherkin-guard-placeholder.test.js, tests/acceptance/gherkin-door3.test.js
