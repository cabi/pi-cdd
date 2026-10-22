# gherkin — spec delta

## ADDED Requirements

### Requirement: Process findings land in the backlog

The loop law names `cdd/backlog.md` as the destination for process findings raised during a run: findings land as PF-n items via the backlog op, milestone and Close reports cite PF-n ids instead of prose, and the backlog is living triage data — validate and the drift guard never check its content.

```gherkin
Feature: Process findings land in the backlog

Scenario: The law names the destination and the citation rule in both sources
  Given the loop law sources lib/templates.mjs and cdd/rules.md
  When both are read
  Then each names cdd/backlog.md as where process findings land and requires reports to cite PF-n ids, and the two texts agree byte-for-byte
  # Verified by: tests/acceptance/backlog-op.test.js

Scenario: Backlog content never gates
  Given a store whose cdd/backlog.md holds free-form note prose on its items
  When validate runs in strict mode over the store and the drift guard runs
  Then both answer green
  # Verified by: tests/acceptance/backlog-op.test.js

Scenario: The live backlog holds the seed findings grammar-conforming
  Given the repository store after the seeding task
  When cdd/backlog.md is read
  Then it holds at least the 7 seeded item lines with ids PF-1 through PF-7 (the backlog is living triage data and may grow), every item line matches the grammar with ids strictly sequential, and the file header carries the conventions line that a steer is believed only when an on-disk artifact backs it
  # Verified by: tests/acceptance/backlog-op.test.js
```

Code: lib/templates.mjs, lib/help.mjs, cdd/rules.md, tests/smoke.mjs, tests/acceptance/backlog-op.test.js

## MODIFIED Requirements

### Requirement: Library modules refuse silent direct execution

Running the validator library, the backlog module, or the grammar module directly as a node command MUST print exactly one usage line to stderr naming the real invocations and exit 2 instead of silently succeeding; importing any of them as a library MUST stay silent. The check MUST behave identically in the scripts/ source and the verbatim cdd/scripts/ store copy.

```gherkin
Feature: Library modules refuse silent direct execution

Scenario: Direct execution of the validator prints usage
  Given the repository working tree
  When node runs lib/validate.mjs directly as a command
  Then it prints exactly one usage line to stderr naming the cdd tool's validate operation and exits with code 2
  # Verified by: tests/acceptance/library-usage.test.js

Scenario: Direct execution of the grammar module prints usage in both locations
  Given the grammar module in scripts/ and its verbatim store copy in cdd/scripts/
  When node runs each directly as a command
  Then each prints the same one usage line to stderr naming the door commands spec-drift, spec-extract, and arch-extract, and exits with code 2
  # Verified by: tests/acceptance/library-usage.test.js

Scenario: Direct execution of the backlog module prints usage
  Given the repository working tree
  When node runs lib/backlog.mjs directly as a command
  Then it prints exactly one usage line to stderr naming the cdd tool's backlog operation and exits with code 2
  # Verified by: tests/acceptance/library-usage.test.js

Scenario: Library imports stay silent
  Given the same modules
  When a node program imports each as a library
  Then neither module prints anything on stdout or stderr and the import completes normally
  # Verified by: tests/acceptance/library-usage.test.js
```

Code: lib/validate.mjs, lib/backlog.mjs, scripts/grammar-law.mjs, cdd/scripts/**, tests/acceptance/library-usage.test.js
