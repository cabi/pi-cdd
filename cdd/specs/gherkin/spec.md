# gherkin — living spec

## Requirements

### Requirement: Scenario bodies are parse-valid Gherkin

Every requirement carries exactly one fenced ` ```gherkin ` block holding one complete Gherkin document whose `Feature:` name equals the requirement heading. The official `@cucumber/gherkin` parser is the arbiter of validity at `cdd validate` (draft and strict) and at archive; parse failures are errors, and every error names the file, the requirement, and the markdown line number of the defect. Old-format residue — `#### Scenario:` markdown headings, markdown `Verified by:` pins outside the fence — is an error.

```gherkin
Feature: Scenario bodies are parse-valid Gherkin

Scenario: Parseable Feature fence passes the gate
  Given a change delta whose every requirement carries one fenced gherkin Feature document
  When cdd validate runs on the change in draft mode
  Then the verdict is green with exactly 0 errors
  # Verified by: tests/acceptance/gherkin-parse-gate.test.js

Scenario: Broken fence fails naming the markdown line
  Given a change delta containing exactly 1 requirement whose fenced Feature document holds invalid gherkin syntax
  When cdd validate runs on the change in draft mode
  Then the verdict is red and the error message names the delta file, the requirement, and the markdown line number of the syntax defect
  # Verified by: tests/acceptance/gherkin-parse-gate.test.js

Scenario: Feature name must equal the requirement heading
  Given a change delta containing exactly 1 requirement whose fenced Feature name differs from its heading
  When cdd validate runs on the change in draft mode
  Then the verdict is red with exactly 1 error naming both the heading and the Feature name
  # Verified by: tests/acceptance/gherkin-parse-gate.test.js

Scenario: Old-format residue is rejected loudly
  Given a change delta containing exactly 1 requirement with a markdown scenario heading or a markdown Verified by pin outside the fence
  When cdd validate runs on the change in draft mode
  Then the verdict is red with 1 error per residue naming the old construct and the ADR that replaced it
  # Verified by: tests/acceptance/gherkin-parse-gate.test.js

Scenario: A requirement without a fence fails
  Given a change delta containing exactly 1 requirement with prose and no fenced gherkin Feature document
  When cdd validate runs on the change in draft mode
  Then the verdict is red with exactly 1 error demanding one fenced Feature block
  # Verified by: tests/acceptance/gherkin-parse-gate.test.js

Scenario: Strict mode flags a pin whose file does not exist
  Given a change delta whose scenario pins 1 acceptance test path that does not exist in the repository
  When cdd validate runs on the change in strict mode
  Then the verdict is red with exactly 1 error naming the pinned path and the draft verdict stays green
  # Verified by: tests/acceptance/gherkin-parse-gate.test.js
```

### Requirement: Gherkin subset limits

The cdd dialect is a closed subset of Gherkin: the step keywords `Given`, `When`, `Then`, `And`, `But` in English, exactly one `When` per scenario, at least 1 `Then`, and `And`/`But` only continuing a prior step. Scenario names are unique within a requirement and each requirement holds exactly one fence. Anything else the grammar allows — `Background`, `Rule`, tags, `Scenario Outline` with `Examples`, data tables, doc strings, asterisk or localized keywords, prose inside the fence, comments other than the pin — is an error naming the rejected construct. The subset laws are defined exactly once, in the law module, and enforced by every parser-bearing door: `cdd validate` and the door 3 full scan. The pin grammar exists in exactly one dialect: the strict `# Verified by:` fence comment.

```gherkin
Feature: Gherkin subset limits

Scenario: Construct outside the subset fails naming it
  Given a change delta containing exactly 1 fenced Feature document using a construct outside the cdd subset
  When cdd validate runs on the change in draft mode
  Then the verdict is red with an error naming the rejected construct among Background, Rule, tags, Scenario Outline, data tables, doc strings, and non-English or asterisk keywords
  # Verified by: tests/acceptance/gherkin-subset.test.js

Scenario: Second When fails validation
  Given a change delta containing exactly 1 scenario whose fenced body holds 2 When steps
  When cdd validate runs on the change in draft mode
  Then the verdict is red with an error stating the scenario must hold exactly one When step
  # Verified by: tests/acceptance/gherkin-subset.test.js

Scenario: Missing Then fails validation
  Given a change delta containing exactly 1 scenario whose fenced body holds 1 When step and 0 Then steps
  When cdd validate runs on the change in draft mode
  Then the verdict is red with an error stating the scenario must hold at least 1 Then step
  # Verified by: tests/acceptance/gherkin-subset.test.js

Scenario: A scenario cannot start with And or But
  Given a change delta containing exactly 1 scenario whose first step starts with And
  When cdd validate runs on the change in draft mode
  Then the verdict is red with an error stating And and But continue a prior step
  # Verified by: tests/acceptance/gherkin-subset.test.js

Scenario: Prose stays outside the fence
  Given a change delta containing exactly 1 fenced Feature document with prose between the Feature line and the first Scenario or between a Scenario and its steps
  When cdd validate runs on the change in draft mode
  Then the verdict is red with an error per prose line locating the stray prose
  # Verified by: tests/acceptance/gherkin-subset.test.js

Scenario: The pin comment is the only legal comment
  Given a change delta containing exactly 1 fenced Feature document with a comment that is not a Verified by pin
  When cdd validate runs on the change in draft mode
  Then the verdict is red with an error stating the only legal comment is the scenario pin
  # Verified by: tests/acceptance/gherkin-subset.test.js

Scenario: Every scenario ends with exactly one pin
  Given a change delta containing exactly 1 fenced Feature document where a scenario lacks its pin or carries 2 pins
  When cdd validate runs on the change in draft mode
  Then the verdict is red with an error naming the scenario and demanding exactly one Verified by pin as its last line
  # Verified by: tests/acceptance/gherkin-subset.test.js

Scenario: Scenario names are unique within a requirement
  Given a change delta containing exactly 1 requirement whose fenced Feature document holds 2 scenarios with the same name
  When cdd validate runs on the change in draft mode
  Then the verdict is red with exactly 1 error naming the duplicated scenario name
  # Verified by: tests/acceptance/gherkin-subset.test.js

Scenario: One Feature fence per requirement
  Given a change delta containing exactly 1 requirement holding 2 gherkin fences
  When cdd validate runs on the change in draft mode
  Then the verdict is red with exactly 1 error demanding exactly one Feature document per requirement
  # Verified by: tests/acceptance/gherkin-subset.test.js

Scenario: Door 3 enforces the subset on living fences
  Given a repository whose living spec holds exactly 1 fence whose scenario carries 2 When steps
  When the door 3 full scan runs
  Then the scan exits non-zero with exactly 1 error in door 1's exact wording, naming the living spec file and the two-When defect
  # Verified by: tests/acceptance/gherkin-door3.test.js

Scenario: Exactly one pin dialect at the extractors
  Given a repository whose living spec holds exactly 1 strict fence-comment pin and exactly 1 markdown Verified by line outside any fence
  When the spec extractor runs
  Then it reports exactly 1 pin — the strict fence comment
  # Verified by: tests/acceptance/gherkin-door3.test.js
```

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

Code: scripts/law.mjs, scripts/spec-drift.mjs, scripts/spec-extract.mjs, scripts/arch-extract.mjs, lib/gherkin.mjs, lib/validate.mjs, lib/templates.mjs, lib/instructions.mjs, lib/store.mjs, lib/status.mjs, index.ts, tests/**, cdd/scripts/**

### Requirement: Door 3 re-lints every fence

The door 3 full scan parses every fence in living specs and open deltas with the same arbiter as `cdd validate`, and enforces the same subset laws — one law module defines them, and its copy travels inside `cdd/scripts/` beside the guard. When `@cucumber/gherkin` cannot be imported in the adopting project, the scan exits non-zero with exactly 1 actionable message containing the install command. Door 2 pre-commit checks stay zero-dependency and never import the parser. `cdd init` refreshes the `cdd/scripts/*` copies on an existing store so a frozen store can catch up to the law it is held to.

```gherkin
Feature: Door 3 re-lints every fence

Scenario: Door 3 rejects a broken living-spec fence
  Given a repository whose living spec contains exactly 1 fence with invalid gherkin syntax
  When the door 3 full scan runs
  Then the scan exits non-zero with exactly 1 error naming the living spec file and the markdown line number
  # Verified by: tests/acceptance/gherkin-door3.test.js

Scenario: Missing parser fails loudly at door 3
  Given a repository where the @cucumber/gherkin package cannot be imported
  When the door 3 full scan runs
  Then the scan exits non-zero with exactly 1 message containing the exact devDependency install command
  # Verified by: tests/acceptance/gherkin-door3.test.js

Scenario: An existing store refreshes its door scripts at init
  Given a repository with an existing cdd store whose cdd/scripts/ copies differ from the extension's
  When cdd init runs on that store
  Then the store's cdd/scripts/* files are re-copied and the refreshed files are listed in the output
  Then missing git hooks are installed and existing hooks are left untouched
  # Verified by: tests/acceptance/gherkin-door3.test.js

Scenario: Hook-health advice names a command that works on existing stores
  Given a repository whose git hooks wiring is stale
  When the door 3 full scan runs
  Then the hook-health finding advises a command that succeeds on a repository that already has a store
  # Verified by: tests/acceptance/gherkin-door3.test.js
```
