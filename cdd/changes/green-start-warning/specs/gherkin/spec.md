## ADDED Requirements

### Requirement: Guard tolerates scaffold placeholders in open deltas

The door 3 full scan treats a placeholder pin inside an open-delta spec (`cdd/changes/*/specs/`) as template text, not a claim: it does not fail the pin-resolution check and is reported as skipped, one informational line per open delta after the verdict — a skip is never silent. A placeholder pin is a `# Verified by:` pin whose path contains the scaffold's placeholder marker: the angle-bracket form of the words `scenario` or `name`, spelled here without its brackets because the draft door flags the literal token strings as unfilled (`lib/validate.mjs`) — the guard and the draft door agree on this token family. Any other angle-bracket shape is not a placeholder: it fails L1 even in an open delta, so the guard never silently greens an unrecognized token. Living specs keep full strictness — a placeholder pin there is an unresolvable pin like any other. The predicate lives in the law module (`scripts/law.mjs`, `LAW_VERSION` 2) and the store copies travel with their sources: `cdd/scripts/law.mjs` and `cdd/scripts/spec-drift.mjs` are byte-identical to them in this repository, and adopting stores pick both up when `cdd init` refreshes `cdd/scripts/*`.

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
  Then cdd/scripts/law.mjs is byte-identical to scripts/law.mjs and cdd/scripts/spec-drift.mjs is byte-identical to scripts/spec-drift.mjs, and the law reports LAW_VERSION 2
  # Verified by: tests/acceptance/gherkin-guard-placeholder.test.js
```

Code: scripts/law.mjs, scripts/spec-drift.mjs, tests/acceptance/gherkin-guard-placeholder.test.js

### Requirement: A new change reports the store verdict at start

`createChange` runs the store's door 3 full scan (`cdd/scripts/spec-drift.mjs`) before writing any artifact, capturing both stdout and stderr. The verdict travels in `preexistingRed` as a list of strings: empty when the scan exits 0; otherwise one entry per issue line the guard printed on stderr — the indented, bracket-tagged issue lines, verbatim, in order; the guard's summary line and everything on stdout are not findings. If the guard exits non-zero with no issue lines, it aborted rather than scanned (for example `@cucumber/gherkin` missing): `preexistingRed` then holds exactly 1 entry stating the guard could not complete, carrying the guard's own abort message. If the guard script is missing or cannot start, exactly 1 entry states the guard could not run. The scaffold always proceeds; the verdict is a warning, never a gate.

```gherkin
Feature: A new change reports the store verdict at start

Scenario: A red store yields the findings and still scaffolds
  Given a store whose door 3 full scan exits 1 with exactly 2 issue lines on stderr
  When createChange scaffolds a new change
  Then the scaffold succeeds and preexistingRed holds exactly those 2 issue lines verbatim, in order
  # Verified by: tests/acceptance/gherkin-create-warning.test.js

Scenario: A green store yields an empty warning
  Given a store whose door 3 full scan exits 0
  When createChange scaffolds a new change
  Then the result carries an empty preexistingRed list
  # Verified by: tests/acceptance/gherkin-create-warning.test.js

Scenario: A guard abort without issue lines is a could-not-complete finding
  Given a store whose door 3 full scan exits 1 printing an abort message and no issue lines
  When createChange scaffolds a new change
  Then the scaffold succeeds and preexistingRed holds exactly 1 entry stating the guard could not complete, carrying the abort message
  # Verified by: tests/acceptance/gherkin-create-warning.test.js

Scenario: A missing guard script yields a could-not-run finding
  Given a store whose cdd/scripts/spec-drift.mjs does not exist
  When createChange scaffolds a new change
  Then the scaffold succeeds and preexistingRed holds exactly 1 entry stating the guard could not run
  # Verified by: tests/acceptance/gherkin-create-warning.test.js
```

Code: lib/store.mjs, tests/acceptance/gherkin-create-warning.test.js
