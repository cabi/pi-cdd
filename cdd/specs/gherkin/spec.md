# gherkin — living spec

## Requirements

### Requirement: Scenario bodies are parse-valid Gherkin

A scenario body is exactly one fenced ` ```gherkin ` block wrapping one complete `Scenario:` or `Scenario Outline:` definition; the `Verified by:` pin stays markdown outside the fence. The official `@cucumber/gherkin` parser is the arbiter of validity at `cdd validate` (draft and strict) and at archive; parse failures are errors, and every error names the file, the scenario, and the markdown line number of the defect.

#### Scenario: Parseable fence passes the gate

```gherkin
Scenario: Parseable fence passes the gate
Given a change delta whose every scenario body is a fenced gherkin block wrapping one complete scenario definition
When cdd validate runs on the change in draft mode
Then the verdict is green with exactly 0 errors
```

Verified by: tests/acceptance/gherkin-parse-gate.test.js

#### Scenario: Broken fence fails naming the markdown line

```gherkin
Scenario: Broken fence fails naming the markdown line
Given a change delta containing exactly 1 scenario whose fenced body holds invalid gherkin syntax
When cdd validate runs on the change in draft mode
Then the verdict is red and the error message names the delta file, the scenario, and the markdown line number of the syntax defect
```

Verified by: tests/acceptance/gherkin-parse-gate.test.js

#### Scenario: Pin stays outside the fence

```gherkin
Scenario: Pin stays outside the fence
Given a change delta containing exactly 1 scenario whose Verified by pin line sits inside the gherkin fence
When cdd validate runs on the change in draft mode
Then the verdict is red with exactly 1 error stating that the pin must stay markdown outside the fence
```

Verified by: tests/acceptance/gherkin-parse-gate.test.js

### Requirement: Gherkin subset limits

The cdd dialect is a closed subset of Gherkin: `Scenario`, `Scenario Outline` with `Examples`, data tables, and the step keywords `Given`, `When`, `Then`, `And`, `But` in English. A scenario has exactly one `When` step, at least 1 `Then` step, and the scenario name inside the fence equals the `#### Scenario:` heading; anything else the grammar allows — `Background`, `Rule`, tags, localized keywords, a second `When` — is a validation error naming the rejected construct.

#### Scenario: Rejected construct fails validation

```gherkin
Scenario Outline: Rejected construct fails validation
Given a change delta containing exactly 1 scenario whose fenced body uses a construct outside the cdd subset
When cdd validate runs on the change in draft mode
Then the verdict is red with exactly 1 error naming the rejected construct <construct>

Examples:
  | construct     |
  | Background    |
  | Rule          |
  | @tag          |
  | German keyword |
```

Verified by: tests/acceptance/gherkin-subset.test.js

#### Scenario: Second When fails validation

```gherkin
Scenario: Second When fails validation
Given a change delta containing exactly 1 scenario whose fenced body holds 2 When steps
When cdd validate runs on the change in draft mode
Then the verdict is red with exactly 1 error stating the scenario must hold exactly one When
```

Verified by: tests/acceptance/gherkin-subset.test.js

#### Scenario: Missing Then fails validation

```gherkin
Scenario: Missing Then fails validation
Given a change delta containing exactly 1 scenario whose fenced body holds 1 When step and 0 Then steps
When cdd validate runs on the change in draft mode
Then the verdict is red with exactly 1 error stating the scenario must hold at least 1 Then step
```

Verified by: tests/acceptance/gherkin-subset.test.js

#### Scenario: Fence name must equal the heading

```gherkin
Scenario: Fence name must equal the heading
Given a change delta containing exactly 1 scenario whose fenced scenario name differs from its heading
When cdd validate runs on the change in draft mode
Then the verdict is red with exactly 1 error naming both the heading and the fenced scenario name
```

Verified by: tests/acceptance/gherkin-subset.test.js

### Requirement: Declarative style is door-1 law

The authoring corpus and rule 4 prescribe declarative scenarios — observable behavior and outcomes, never interaction mechanics such as keystrokes, widgets, or selectors — and state that imperative step prose is a door-1 review finding. The validator carries exactly 0 style lexicons or step-count heuristics: style is never machine-checked.

#### Scenario: Corpus teaches the fenced declarative format

```gherkin
Scenario: Corpus teaches the fenced declarative format
Given the extension at version 0.3.0
When the delta template, the delta authoring instruction, and cdd rule 4 are read
Then each of the 3 names the fenced gherkin scenario body, the pin outside the fence, and the declarative style clause
```

Verified by: tests/acceptance/gherkin-style-guidance.test.js

### Requirement: Door 3 re-lints every fence

The door 3 full scan parses every fence in living specs and open deltas with the same arbiter as `cdd validate`. When `@cucumber/gherkin` cannot be imported in the adopting project, the scan exits non-zero with exactly 1 actionable message containing the install command. Door 2 pre-commit checks stay zero-dependency and never import the parser.

#### Scenario: Door 3 rejects a broken living-spec fence

```gherkin
Scenario: Door 3 rejects a broken living-spec fence
Given a repository whose living spec contains exactly 1 fence with invalid gherkin syntax
When the door 3 full scan runs
Then the scan exits non-zero with exactly 1 error naming the living spec file and the markdown line number
```

Verified by: tests/acceptance/gherkin-door3.test.js

#### Scenario: Missing parser fails loudly at door 3

```gherkin
Scenario: Missing parser fails loudly at door 3
Given a repository where the @cucumber/gherkin package cannot be imported
When the door 3 full scan runs
Then the scan exits non-zero with exactly 1 message containing the exact devDependency install command
```

Verified by: tests/acceptance/gherkin-door3.test.js
Code: lib/gherkin.mjs, lib/validate.mjs, lib/templates.mjs, lib/instructions.mjs, scripts/spec-drift.mjs
