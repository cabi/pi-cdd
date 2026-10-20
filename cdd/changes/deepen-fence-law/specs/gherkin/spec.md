## MODIFIED Requirements

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
  Then the scan exits non-zero with exactly 1 error naming the living spec file and the two-When defect
  # Verified by: tests/acceptance/gherkin-door3.test.js

Scenario: Exactly one pin dialect at the extractors
  Given a repository whose living spec holds exactly 1 strict fence-comment pin and exactly 1 markdown Verified by line outside any fence
  When the spec extractor runs
  Then it reports exactly 1 pin — the strict fence comment
  # Verified by: tests/acceptance/gherkin-door3.test.js
```

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
  # Verified by: tests/acceptance/gherkin-door3.test.js

Scenario: Hook-health advice names a command that works on existing stores
  Given a repository whose git hooks wiring is stale
  When the door 3 full scan runs
  Then the hook-health finding advises a command that succeeds on a repository that already has a store
  # Verified by: tests/acceptance/gherkin-door3.test.js
```

Code: scripts/law.mjs, scripts/spec-drift.mjs, scripts/spec-extract.mjs, scripts/arch-extract.mjs, lib/gherkin.mjs, lib/validate.mjs, lib/templates.mjs, lib/instructions.mjs, lib/store.mjs, lib/status.mjs, tests/**, cdd/scripts/**
