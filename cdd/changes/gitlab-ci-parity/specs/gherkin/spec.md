## ADDED Requirements

### Requirement: The GitLab CI scaffold inherits the guard pipeline discipline

The GitLab CI scaffold MUST carry the same pipeline discipline the repository's guard pipeline learned: exactly 2 parallel matrix legs — Node majors 20 (the CI floor) and 24 (the local-dev major) — with each leg's image drawn from its matrix entry, `npm ci` before the guard scan (the suites import `@cucumber/gherkin` from `node_modules`; the vendored copy serves pi installs only), and `GIT_DEPTH` set to 0 so the history-walking guard sees the full clone. The door-3 and adjust-to-your-runner comments MUST survive in the render. This repository's root `.gitlab-ci.yml` is dogfood and MUST stay byte-identical to the render; adopter copies are theirs.

```gherkin
Feature: The GitLab CI scaffold inherits the guard pipeline discipline

Scenario: The scaffold fans out to both Node majors with install and full clone
  Given the GitLab CI scaffold template rendered to text
  When its guard job is read
  Then it runs exactly 2 parallel matrix legs for the Node versions 20 and 24 and each leg's image is node:$NODE_VERSION
  And it sets GIT_DEPTH to 0 so the guard scan walks full commit history
  And npm ci runs before the guard scan — the suites import @cucumber/gherkin from node_modules, not the vendored copy
  And the render keeps the door-3 comment and the adjust-to-your-runner comment
  # Verified by: tests/acceptance/gitlab-ci-parity.test.js

Scenario: The dogfood copy stays byte-identical to the render
  Given this repository's root .gitlab-ci.yml and the scaffold template's render
  When the 2 texts are compared byte for byte
  Then they are identical so the CI this repository runs is the CI it hands adopters
  # Verified by: tests/acceptance/gitlab-ci-parity.test.js
```

Code: lib/templates.mjs, .gitlab-ci.yml, tests/acceptance/gitlab-ci-parity.test.js
