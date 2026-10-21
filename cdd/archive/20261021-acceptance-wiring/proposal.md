# acceptance-wiring

## Why

The backlog item this change drains was stated as "the acceptance suites
execute in neither `npm test` nor CI." That premise is stale: change
`run-acceptance-suites` (archived 2026-10-21) wired exactly that, and fresh
probes at change start confirm it holds — local Node 24.4.1 `npm test` runs
all 12 suites green in ~3 s; nvm Node 22.17.1 `node --test` runs 12/12 green;
docker node:20 (v20.20.2) with git, executing CI's own steps (`npm ci` →
`npm test`), runs 12/12 green, exit 0. Bare `node --test` discovers
`tests/acceptance/*.test.js` identically on 20, 22, and 24 — the suspected
cross-version discovery split does not exist. (Probing note for the record: a
node:20-*-slim container without git fails 4 suites spuriously —
`spawnSync git ENOENT`; the suites spawn git. GitHub-hosted runners ship git.
A future slim-runner migration must install it, or the sweep lies.)

Two real gaps remain, and this change closes only them:

1. **CI checks one Node major.** `.github/workflows/cdd.yml` pins Node 20
   while local development runs Node 24 and `engines` promises `>=20`. A
   regression that only bites Node 24 — or only Node 20 — passes CI today,
   half-blind on exactly the sweep the loop's Done-When pins rely on.
2. **The law never names the executor.** Rule 7 demands test-first and names
   pins, but nothing says which command verifies a pin. An author can satisfy
   "verify by" with a one-off `node --test <file>` run that the project's
   entrypoint and CI never repeat, so future changes can verify against
   something other than the thing that actually gates pushes.

## What Changes

- CI: the guard job in `.github/workflows/cdd.yml` gains a
  `node-version: [20, 24]` matrix (`fail-fast: false`); both legs run the
  unchanged chain — `npm ci`, full guard scan, `npm test --if-present` — so
  the floor major (20) and the local-dev major (24) each gate every push.
- Law: rule 7 gains one sentence naming the pins' executor — `npm test` runs
  the `node --test` sweep, which executes every `tests/acceptance/*.test.js`
  suite, and CI runs the same entrypoint. Authored in `lib/templates.mjs`'s `RULES_MD`
  (the byte-pinned source); `cdd/rules.md` re-mirrored byte-identical.
- Two new pin suites, one per capability: `ci-node-matrix.test.js` (matrix
  legs, setup-node wiring, fail-fast, unchanged steps) and
  `law-pin-executor.test.js` (executor sentence in source and mirror,
  byte-identity). Existing suites — RA1–RA4 included — are untouched.

## Solutions Considered

- adopted: matrix on the existing guard job — one job, two legs of the same
  step list; zero new steps; both majors gate every push; `fail-fast: false`
  keeps one leg's red from canceling the other leg's signal.
- rejected: one job per Node major — duplicates the step list; the two copies
  drift, the exact staleness class this project keeps removing.
- rejected: 24-only CI — drops the floor major that `engines: >=20` and the
  current workflow pin; the matrix keeps the floor and adds the dev major.
- rejected: a Node 22 leg — neither the CI floor nor the dev standard; exactly
  2 legs (floor + dev) is the contract (22 was probed green at gate time
  anyway, so no blind spot is left unrecorded).
- rejected: matrixing `.gitlab-ci.yml` — out of this change's scope (GitHub
  workflow only); recorded as a Non-Goal, not silently ignored.
- rejected: teaching the scaffold's `CI_GITHUB` template the matrix — the
  repo's workflow is intentionally diverged from the scaffold (project-specific
  install comments); RA4's "`npm test` appears" is the only scaffold contract
  and keeps holding.
- rejected: the executor sentence in rule 4 (delta pins) instead of rule 7 —
  rule 7 is where subtask verification lives; one sentence, one home: rule 7's
  text is literal `RULES_MD` (loop-law.mjs owns only the chain, review-point,
  and grammar facts — its single-source scope), so no new module home either.
  Follows ADR-0009 (single-source the loop law): the sentence is authored
  once in the law source and the store copy re-mirrored byte-identically.
  Also follows ADR-0008 (advisory findings) and ADR-0010 (reviewer
  independence) — this change's R1/R2 findings are advisory with recorded
  dispositions, and both reviewers were cold sub-agent sessions.
- existing specs: `cdd/specs/acceptance/spec.md` pins that the sweep runs and
  names `npm test` as its executor, but nothing pins that it gates on 2 Node
  majors, and no loop-law rule names the executor an author reads at verify
  time — both new surfaces (CI matrix, law sentence) are unsponsored today,
  hence two ADDED requirements across the acceptance and gherkin capabilities.

## Non-Goals

- Not touching any existing acceptance suite; RA1–RA4 keep pinning the bare
  `node --test` sweep exactly as archived.
- Not changing `package.json`'s test script — pinned by RA1 and proven
  version-stable by the 20/22/24 probes.
- Not matrixing `.gitlab-ci.yml` (keeps `image: node:20`, the floor).
- Not editing the scaffold templates `CI_GITHUB` / `CI_GITLAB`.
- Not adding Node 22 to CI.
- Not migrating suites off their check() harnesses.

Done-When: CI's guard job runs the install → guard → test chain on exactly 2 Node legs (20 and 24) with fail-fast: false as the pinned proxy for no leg cancelling the other, and rule 7 of the loop law names `npm test`'s `node --test` sweep as the executor of Verified-by pins
Code: .github/workflows/cdd.yml, lib/templates.mjs, cdd/rules.md, tests/acceptance/ci-node-matrix.test.js, tests/acceptance/law-pin-executor.test.js
