## MODIFIED Requirements

### Requirement: Declarative style is door-1 law

The authoring corpus and rule 4 prescribe declarative scenarios — observable behavior and outcomes, never interaction mechanics such as keystrokes, widgets, or selectors — and state that imperative step prose is a door-1 review finding. The validator carries exactly 0 style lexicons or step-count heuristics: style is never machine-checked.

```gherkin
Feature: Declarative style is door-1 law

Scenario: Corpus teaches the fenced declarative format
  Given the extension at version 0.4.1
  When the delta template, the delta authoring instruction, and cdd rule 4 are read
  Then each of the 3 names the fenced Feature document with the pin comment inside, and the declarative style clause banning interaction mechanics
  # Verified by: tests/acceptance/gherkin-style-guidance.test.js

Scenario: Imperative step prose stays green
  Given a change delta whose scenario steps phrase interaction mechanics like clicks and keystrokes in otherwise valid gherkin
  When cdd validate runs on the change in draft mode
  Then the verdict is green because style is door-1 judgment and never machine-checked
  # Verified by: tests/acceptance/gherkin-style-guidance.test.js

Scenario: The validator exports no style-checking surface
  Given the gherkin validation module of the extension
  When its exported surface is listed and an imperative scenario body is checked
  Then it exports exactly the fence extraction and fence checking functions and returns 0 style errors for the imperative body
  # Verified by: tests/acceptance/gherkin-style-guidance.test.js
```

Code: scripts/grammar-law.mjs, scripts/spec-drift.mjs, scripts/spec-extract.mjs, scripts/arch-extract.mjs, cdd/scripts/**, lib/gherkin.mjs, lib/validate.mjs, lib/store.mjs, lib/templates.mjs, lib/instructions.mjs, decisions/0007-the-law-behind-every-door.md, tests/smoke.mjs, tests/acceptance/gherkin-door3.test.js, tests/acceptance/gherkin-parse-gate.test.js, tests/acceptance/gherkin-style-guidance.test.js, tests/acceptance/gherkin-subset.test.js

### Requirement: Guard tolerates scaffold placeholders in open deltas

The door 3 full scan treats a placeholder pin inside an open-delta spec (`cdd/changes/*/specs/`) as template text, not a claim: it does not fail the pin-resolution check and is reported as skipped, one informational line per open delta after the verdict — a skip is never silent. A placeholder pin is a `# Verified by:` pin whose path contains the scaffold's placeholder marker: the angle-bracket form of the words `scenario` or `name`, spelled here without its brackets because the draft door flags the literal token strings as unfilled (`lib/validate.mjs`) — the guard and the draft door agree on this token family. Any other angle-bracket shape is not a placeholder: it fails L1 even in an open delta, so the guard never silently greens an unrecognized token. Living specs keep full strictness — a placeholder pin there is an unresolvable pin like any other. The predicate lives in the grammar law module (`scripts/grammar-law.mjs`, `LAW_VERSION` 2) and the store copies travel with their sources: `cdd/scripts/grammar-law.mjs` and `cdd/scripts/spec-drift.mjs` are byte-identical to them in this repository, and adopting stores pick both up when `cdd init` refreshes `cdd/scripts/*`.

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
  Then cdd/scripts/grammar-law.mjs is byte-identical to scripts/grammar-law.mjs and cdd/scripts/spec-drift.mjs is byte-identical to scripts/spec-drift.mjs, and the law reports LAW_VERSION 2
  # Verified by: tests/acceptance/gherkin-guard-placeholder.test.js
```

Code: scripts/grammar-law.mjs, scripts/spec-drift.mjs, tests/acceptance/gherkin-guard-placeholder.test.js
