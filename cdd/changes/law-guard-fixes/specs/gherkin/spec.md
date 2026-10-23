## ADDED Requirements

### Requirement: Loop law states the Done-When contract

The loop law's proposal rule — rule 3 of the rendered law text — MUST state the proposal contract as `Done-When:` lines carrying 1-5 completion criteria, each phrased as an observable check, the same bounds the proposal scaffold instruction states and the validate door enforces. The rule-3 text MUST be defined in the loop-law module (`lib/loop-law.mjs`), rendered into the law text, and the repository's store copy `cdd/rules.md` MUST carry the identical rule-3 text.

```gherkin
Feature: Loop law states the Done-When contract

Scenario: Rule 3 states 1-5 observable criteria
  Given the loop-law text rendered from the module and this repository's store copy cdd/rules.md
  When rule 3 is read in each
  Then each states Done-When lines carrying 1-5 completion criteria, each an observable check
  And neither carries the one-Done-When-line wording
  # Verified by: tests/acceptance/law-done-when.test.js

Scenario: Rule 3 renders from the loop-law module
  Given lib/loop-law.mjs exporting the rule-3 text and the law text interpolating it
  When the law text is rendered
  Then the rule-3 fragment equals the module's render verbatim
  And the store copy cdd/rules.md carries the same rule-3 fragment byte-identically
  # Verified by: tests/acceptance/law-done-when.test.js
```

Code: lib/loop-law.mjs, lib/templates.mjs, cdd/rules.md, tests/acceptance/law-done-when.test.js

### Requirement: Topology staleness is full-scan law

The committed-history topology check — L2, code changed after every spec of its capability last changed — MUST run in the door 3 full scan, and the commit being made is policed by the commit-msg door's staged-pair check (staged code without a staged spec of the capability). The pre-commit staged scan MUST NOT run the topology check: it reads committed history, which cannot yet contain the archive pair-commit's staged living-spec merge, so there it can only deadlock the pair-commit's second commit — the archive move plus the merged living spec, no code files — which MUST pass the pre-commit door.

```gherkin
Feature: Topology staleness is full-scan law

Scenario: The archive pair-commit passes the pre-commit door
  Given a sandbox git store whose feature commit landed through the pre-commit door and whose real archiveChange output is staged — the archive move plus the merged living spec, no code files
  When the pre-commit staged scan runs on that staged set
  Then it exits 0 with the clean summary
  # Verified by: tests/acceptance/guard-pair-commit.test.js

Scenario: The full scan still enforces topology at the mid-pair tip
  Given the same sandbox after the archive move with the archive commit not yet made and no open change claiming the code
  When the door 3 full scan runs
  Then it exits non-zero with exactly 1 L2 issue naming the out-committing code file
  # Verified by: tests/acceptance/guard-pair-commit.test.js
```

Code: scripts/spec-drift.mjs, cdd/scripts/**, tests/acceptance/guard-pair-commit.test.js
