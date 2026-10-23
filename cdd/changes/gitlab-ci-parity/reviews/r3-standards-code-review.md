# R3 standards-axis code review — gitlab-ci-parity

- Reviewer form: **cold sub-agent** (fresh session, briefed only from
  `brief-r3-standards-instantiated.md` and the paths/diff on disk; not the
  author's session).
- Model family check: reviewer `opencode-zen` / `deepseek-v4-pro`
  (from `PI_PROVIDER` / `PI_MODEL`); author `zai` / `glm-5.3` (stated in the
  brief). Families differ — review proceeds.
- Axis: Standards only. Spec runs in a separate session.
- Diff base: `866ab4b` (main); `git diff 866ab4b -- lib/templates.mjs .gitlab-ci.yml`
  plus untracked `tests/acceptance/gitlab-ci-parity.test.js` and the change folder.

## Findings

All findings reported with disposition `open` (author disposes later).

### F001 — note — Duplicated Code: fail-closed YAML-subset parser copied between suites

The `parseWorkflow` YAML-subset parser (~50 lines) in
`tests/acceptance/gitlab-ci-parity.test.js:26-88` is a near-verbatim copy of
the same parser in `tests/acceptance/ci-node-matrix.test.js:24-…`, differing
only in the GitLab adaptation (mapping keys may contain colons, so a key runs
to the last colon). This is a new instance of the Duplicated Code smell
(same logic shape in two files). It is a deliberate, documented choice — the
proposal's "Solutions Considered" rejects extending the existing suite
("it pins the GitHub workflow file; the GitLab template is a different
surface and gets a sibling suite with its own check ids") — and the
colon-in-key adaptation makes naive sharing non-trivial. Judgement call, not
a hard violation; flagged for the record.

### F002 — note — new test header repeats the corpus-routing pattern already backlogged

`tests/acceptance/gitlab-ci-parity.test.js:2-3` opens with
`// (delta: acceptance capability, change gitlab-ci-parity): …`, naming the
change and its delta in a source comment. ADR-0012 (comments are shape-only)
bans "corpus routing of any form (… spec or change names …)" in comments, but
its `code:` glob is `index.ts, lib/*.mjs, lib/*.ts, scripts/*.mjs, .githooks/*`
— `tests/` is outside it, and the ADR's Consequences record that test headers
are a swept convention already minted as a backlog finding (the same pattern
exists in `tests/acceptance/ci-node-matrix.test.js:3` and
`tests/acceptance/run-acceptance.test.js:3`). Pre-existing pattern, not a new
hard violation; noted so the new file is not mistaken for a fresh convention.

## Dispositions (author, 2026-10-24)

- **F001 — won't-fix:** deliberate and proposal-documented (Solutions
  Considered: sibling suite with its own check ids; extending the GitHub
  suite rejected). `tests/acceptance/ci-node-matrix.test.js` is pinned as-is
  by the living acceptance spec — modifying it here would be an unsponsored
  drive-by; a shared helper module would couple two independent acceptance
  pins to a third file outside the pin convention. Consolidation, if ever
  wanted, is its own change.
- **F002 — won't-fix for the pattern; fixed the routing target:** the
  corpus-routing comment style is pre-existing across the acceptance corpus
  (PF-24 tracks the one-shot sweep; `tests/` sits outside ADR-0012's `code:`
  glob), so the new file follows the established convention and the sweep
  will take all instances together. The evidence did catch a real defect:
  the header named the wrong capability (`acceptance`) — stale from before
  the guard-driven restructure; corrected to `gherkin` at
  tests/acceptance/gitlab-ci-parity.test.js:3 (suite re-run green, GL0–GL6,
  exit 0).
## Non-findings (checked, clean)

- **ADR-0009 (single-source)**: the change grows `CI_GITLAB` only; no loop-law
  mirror text (`RULES_MD` ↔ `cdd/rules.md`) is altered. The new
  `.gitlab-ci.yml` ↔ `CI_GITLAB` byte-identity is pinned by GL6, the same
  mirror-pair pattern the repo already uses — consistent, not a divergence.
- **ADR-0001 (zero-dependency doors)**: `npm ci` installs the adopter's own
  devDependencies for `npm test`; the door script `spec-drift.mjs` stays
  zero-dependency and runs before it. Matches the existing
  `.github/workflows/cdd.yml` shape. No violation.
- **ADR-0012 (comments shape-only)**: the new comment lines live inside the
  `CI_GITLAB` scaffold output string — "scaffold templates" are explicitly
  exempt ("Rendered text is untouched"). Not source comments.
- **Guard/validator alignment**: no guard or validator touched; the parity
  suite is green (`node tests/acceptance/gitlab-ci-parity.test.js` → GL0–GL6
  ok, exit 0); no door weakened or blinded.
- **Conventions**: test placement `tests/acceptance/*.test.js` and check-id
  naming (GL0–GL6) follow the repo's established pattern.
