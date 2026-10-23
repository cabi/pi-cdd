## ADDED Requirements

### Requirement: Contributor clones self-wire the doors

The root package's `prepare` script — run by npm automatically at the end of every `npm install` and `npm ci` in this repository — MUST wire a git checkout to its committed hooks: in a working directory holding a `.git` directory it sets `core.hooksPath` to `.githooks` so doors 2a/2b run on every local commit; in a directory without `.git` it MUST exit 0 having configured nothing, so pack, publish, and ephemeral-checkout contexts stay silent.

```gherkin
Feature: Contributor clones self-wire the doors

Scenario: A fresh clone wires the doors at install time
  Given a git repository checkout of this repository with no core.hooksPath configured
  When the prepare script from package.json runs as npm install's lifecycle step
  Then git config core.hooksPath reads .githooks
  # Verified by: tests/acceptance/hook-wiring.test.js

Scenario: Without a git directory the prepare step is a silent no-op
  Given a working directory holding this repository's package.json and no .git directory
  When the prepare script runs
  Then it exits 0 and no git configuration is written
  # Verified by: tests/acceptance/hook-wiring.test.js
```

Code: package.json, tests/acceptance/hook-wiring.test.js
