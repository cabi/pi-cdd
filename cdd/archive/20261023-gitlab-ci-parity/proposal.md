# gitlab-ci-parity

## Why

The GitLab CI scaffold (`CI_GITLAB` in lib/templates.mjs, rendered by `cdd init` as the adopter's `.gitlab-ci.yml`) is an adopter-facing surface, and pi-cdd will be adopted by GitLab-hosted projects — yet it still ships the CI shape the GitHub workflow has since outgrown: a single `node:20` job, no dependency install, and GitLab's default shallow clone. Every lesson the repository's own guard pipeline learned the hard way is missing from the copy adopters receive, so their door 3 is red by construction or silently under-gated.

## What Changes

- The `CI_GITLAB` template gains the 3 disciplines the repository's own guard pipeline (`.github/workflows/cdd.yml`, the dogfood workflow) learned — note the adopter-facing `CI_GITHUB` template does not yet carry all of them (R2-F002, Non-Goals):
  - **Node matrix** — `parallel: matrix` with `NODE_VERSION: ["20", "24"]` and `image: node:$NODE_VERSION`. The two-leg discipline (floor major + local-dev major) is what PF-15 taught: the smoke pin S35 broke only on the node-20 leg, and only the matrix caught it. GitLab matrix legs are independent jobs, so one leg's red never cancels the other — no fail-fast equivalent needed.
  - **`npm ci` before the guard** — the suites import `@cucumber/gherkin` from `node_modules` (the vendored copy under `vendor/` serves pi installs only); without an install step the pipeline is red by construction.
  - **`variables: GIT_DEPTH: "0"`** — the guard walks commit history (lastCommit/L2 topology comparisons); GitHub needs `fetch-depth: 0` for exactly this reason, and GitLab's default shallow depth would starve the same comparisons. This is the correctness detail most likely to be missed: the pipeline would pass on trivial pushes and fail (or mis-report) on the first history-sensitive scan.
- The door-3 comment and the "adjust to your runner" comment stay (adopter-facing scaffold comments are scaffold output, not harness source comments).
- The repository's root `.gitlab-ci.yml` — the dogfood copy `initStore` wrote — is hand-synced to the new template in the same commit, and a new acceptance-suite pin holds it byte-identical to the render: our copy is dogfood, never customized; adopter copies are theirs.

## Solutions Considered

- acceptance: the structural YAML-subset parser + MX0–MX4 check style of tests/acceptance/ci-node-matrix.test.js — adopted as the pattern for the new suite (fail-closed on duplicate keys and orphaned blocks, so a textually-plausible but broken template cannot pass). Extending that suite itself — rejected: it pins the GitHub workflow file; the GitLab template is a different surface and gets a sibling suite with its own check ids.
- gherkin: the SSL3 byte-identity pin style (tests/acceptance/single-source-law.test.js asserts `cdd/rules.md === RULES_MD`) — adopted verbatim as the pattern for the repo-copy ↔ template identity check.
- gherkin: teaching `cdd init` to refresh the root copy mechanically — rejected: no init machinery change is needed; the copy is synced by hand in the same commit and pinned byte-identical, so drift is caught by the sweep, not by new refresh code.

## Decisions followed (A1 citations)

- ADR-0008 (model-run reviews are advisory findings): `lib/templates.mjs` carries review-wiring text governed by the decision; this change leaves that text untouched — followed.
- ADR-0009 (single-source the loop law): the templates module mirrors the loop law; this change grows `CI_GITLAB` only and alters no mirror text — followed.
- ADR-0012 (comments are shape-only): the new comment lines live inside the `CI_GITLAB` scaffold output string — adopter-facing template text, not this codebase's own code comments — and stay shape-only; the module's own comments are unchanged — followed.
- ADR-0006 (feature-block consolidation): `lib/templates.mjs` is governed by the decision; this change's delta keeps the consolidated single-Feature scenario format — followed.
- ADR-0007 (the law behind every door): the templates module mirrors the loop law; this change grows `CI_GITLAB` only and alters no mirror text — followed.
- ADR-0011 (ticks are claims and pins hit real doors): every tick in tasks.md cites its evidence and the new pin runs the real suite — followed.
## Non-Goals

- No change to `.github/workflows/cdd.yml` — it is the reference shape this change copies from.
- No `CI_GITHUB` template parity — the adopter-facing GitHub scaffold (`lib/templates.mjs:212`) ships the same stale shape `CI_GITLAB` had (single `node-version: 20`, no `npm ci`); making the two adopter-facing scaffolds symmetric is a follow-up change, deliberately out of scope here.
- No runner classes, tags, `rules:`, caches, or artifacts in the scaffold — adopters' runners vary; the "adjust to your runner" comment stays the escape hatch.
- No byte-identity contract over adopter copies — only this repository's dogfood copy is pinned; adopter copies are theirs to customize.
- No ADR: template content parity, no architecture bet (gate all-NO).

Done-When: the CI_GITLAB render fans the guard out to exactly the 2 Node majors 20 and 24 via parallel matrix legs with image node:$NODE_VERSION, runs npm ci before the guard scan, sets GIT_DEPTH to 0, and keeps the door-3 and adjust-to-your-runner comments (pinned by tests/acceptance/gitlab-ci-parity.test.js)
Done-When: the repository's root .gitlab-ci.yml is byte-identical to the CI_GITLAB render (pinned by tests/acceptance/gitlab-ci-parity.test.js)
Done-When: npm test exits 0 with the parity suite inside the sweep

Code: lib/templates.mjs, .gitlab-ci.yml, tests/acceptance/gitlab-ci-parity.test.js

Capabilities: gherkin

R1 review: design gate answered T1–T5 all NO (tasks §2) — R1 is lawfully skipped; no proposal-mode review runs for this change.
