split-considered: one requirement, one law — the signal is a single Feature document mirroring rule 6; the gherkin split itself is PF-6's, gated on size-attributable miss data

## ADDED Requirements

### Requirement: Spec-size signal

The validator SHALL warn — never error — in both verdict modes when a change's delta touches a living spec holding 12 or more requirements, aggregate-name that spec's requirements holding 8 or more scenarios into one warning line, warn on a delta's own ADDED or MODIFIED requirement block holding 8 or more scenarios, and demand a split-considered decision line when a delta ADDEDs a requirement into a spec holding 12 or more requirements. The scan is deliberately substring over the delta file's raw text — the same semantics rule 6 applies to the task-side split signal — so any prose mention of the line-kind must be colon-free; a mention is prose, the decision is the line.

```gherkin
Feature: Spec-size signal

Scenario: Over-threshold requirement count warns once in both modes
  Given a capability whose living spec holds 12 or more requirements
  When a change holding any delta entry for that capability validates in draft mode and in strict mode
  Then each verdict carries exactly 1 warning naming the requirement count, and both verdicts report ok as true
  # Verified by: tests/acceptance/spec-size-signal.test.js

Scenario: Fat requirements aggregate into one warning line
  Given a capability whose living spec holds the requirement "alpha" with 11 scenarios and the requirement "beta" with 8 scenarios, and no other requirement reaching 8 scenarios
  When a delta touching that capability validates in either mode
  Then exactly 1 warning names both "alpha" and "beta", and a capability whose every requirement holds fewer than 8 scenarios receives no such warning
  # Verified by: tests/acceptance/spec-size-signal.test.js

Scenario: A delta block grown past the scenario threshold warns
  Given a delta holding an ADDED requirement block with 8 scenarios and a MODIFIED requirement block with 8 scenarios, in a capability whose living spec holds fewer than 12 requirements and no requirement reaching 8 scenarios
  When the delta validates in either mode
  Then each grown block receives exactly 1 warning naming that block, and a delta block holding 7 scenarios receives none
  # Verified by: tests/acceptance/spec-size-signal.test.js

Scenario: Growth into an over-threshold spec demands split consideration
  Given a delta holding an ADDED requirement for a capability whose living spec holds 12 or more requirements, and the delta file carrying no split-considered line
  When the delta validates in either mode
  Then exactly 1 warning demands split consideration, and the verdict reports ok as true
  # Verified by: tests/acceptance/spec-size-signal.test.js

Scenario: A split-considered line satisfies the demand
  Given a delta holding an ADDED requirement for a capability whose living spec holds 12 or more requirements, and the delta file carrying a split-considered line
  When the delta validates in either mode
  Then no split-consideration warning is reported
  # Verified by: tests/acceptance/spec-size-signal.test.js

Scenario: Warnings never block either verdict
  Given a change whose delta trips the requirement-count, fat-requirement, block-growth, and split-consideration warnings at once
  When draft and strict validate run
  Then both verdicts report ok as true with all warnings present and no error naming the spec-size signal
  # Verified by: tests/acceptance/spec-size-signal.test.js
```

Code: lib/validate.mjs, tests/acceptance/spec-size-signal.test.js
