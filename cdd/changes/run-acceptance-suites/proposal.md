# run-acceptance-suites

## Why

The six acceptance suites under tests/acceptance/ — including review-wiring's 15
checks — run in neither `npm test` nor CI. A template-literal break during
wire-review-points was caught only by a suite nothing executes (process findings
4 and 8 of that change). Every contributor trusting CI to catch regressions is
flying blind on exactly the tests that pin the loop's behavior.

## What Changes

- `npm test` gains the acceptance sweep: every `tests/acceptance/*.test.js`
  suite executes via node's built-in test runner, and any suite failure fails
  the command.
- CI needs no edit: `.github/workflows/cdd.yml` already runs
  `npm test --if-present` and inherits the sweep.
- A new acceptance suite pins the wiring itself.

## Solutions Considered

- acceptance: node's built-in runner, invoked bare (`node --test`) — covers
  discovery of `*.test.js` from the repo root, per-file subprocess isolation,
  nonzero exit on failure; compatible with node 20 (CI's pin). Adopted: zero
  new dependencies and zero new code.
- acceptance: glob argument `node --test 'tests/acceptance/*.test.js'` — rejected:
  glob arguments need node ≥21 and CI pins node 20; directory arguments are not
  discovery roots on any pinned version (verified empirically on v24.4.1).
- acceptance: enumerate each suite in the package.json script — rejected: every
  new suite needs a script edit, the exact staleness class this change removes.
- acceptance: a small runner script (glob + spawn loop) — rejected: duplicate
  code for what `node --test` already does.
- existing specs: cdd/specs/gherkin/spec.md pins loop and validator behavior;
  nothing covers where suites execute — hence the new `acceptance` capability.

## Non-Goals

- Not migrating the suites' check() harnesses to node:test assertions — only
  execution is wired, the suites keep their own reporting.
- Not editing .github/workflows/cdd.yml — it already runs `npm test`.
- Not adding coverage thresholds or performance gates.

Done-When: `npm test` in a clean checkout executes every `tests/acceptance/*.test.js` suite and exits nonzero when any of them fails
Code: package.json, tests/acceptance/*.test.js
