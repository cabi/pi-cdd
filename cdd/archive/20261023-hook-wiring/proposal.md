# hook-wiring

## Why

Fresh contributor clones of pi-cdd ship the door scripts but never the wiring: `.githooks/pre-commit` and `commit-msg` sit in the tree while `core.hooksPath` stays unset, so local commits bypass doors 2a/2b entirely and land as CI-only guard reds — twice already (d967404, e45a51d; PF-16). Adopter projects self-wire via `cdd init`; this repository's own clones are the gap.

## What Changes

- `package.json` gains a `prepare` script — `[ -d .git ] && git config core.hooksPath .githooks || true`. npm runs the root package's prepare automatically at the end of every `npm install`/`npm ci` in the repo, and that install is the step every contributor needs anyway (the test suite requires node_modules), so a fresh clone self-wires the doors with zero extra steps.
- The `.git` guard plus `|| true` make prepare a silent success where wiring is meaningless: npm pack/publish tarball contexts (no `.git`), CI ephemeral checkouts (hooks never run there), and pi's managed git-clone of this repo (nobody commits there). The script is npm-lifecycle-only — it never fires at pi startup and never in adopter projects.
- MAINTENANCE.md gains a short contributor-setup note: fresh clones wire via `npm install` (prepare); the manual equivalent `git config core.hooksPath .githooks`; hooks are clone-local config, so CI never needs them; root cause PF-16.
- PF-16 closes as done in the backlog naming this change.

## Solutions Considered

- gherkin (the harness/devenv capability): evaluated git's native mechanisms first — `git config --global core.hooksPath` (rejected: one global path would point unrelated repositories at this repo's hooks, or vice versa), `git init --template` with a hooks template (rejected: opt-in per machine; a fresh clone on a new machine still gets nothing), and husky (rejected: a new devDependency for a one-line `git config` call). npm's prepare lifecycle is the platform feature that fits: zero dependencies, runs exactly when a contributor clone first becomes buildable, standard npm behavior. Adopted with the `[ -d .git ]` guard and `|| true` so non-repo contexts stay silent. No existing living spec covers this repo's own clone setup (checked all four capabilities; `cdd init`'s hook installation covers adopters only).

## Non-Goals

- No change to the hooks themselves, the guard, or door semantics — wiring only.
- No adopter-facing behavior: `cdd init` hook installation and its templates are untouched.
- No CI workflow change: CI runs door 3's full scan; hooks are meaningless in ephemeral checkouts.

## Capabilities

- gherkin ADD — contributor clones self-wire the doors: one ADDED requirement pinning the prepare-script contract in both regimes (wire at install in a git repo; silent no-op without `.git`).

Done-When: `node --test tests/acceptance/hook-wiring.test.js` exits 0, pinning both prepare-script regimes — a sandbox git repository wired to `core.hooksPath .githooks`, and a no-`.git` directory left unwired with exit 0
Done-When: `npm test` exits 0 with the new suite in the sweep
Done-When: `cdd validate` strict green and `node cdd/scripts/spec-drift.mjs` exits 0
Done-When: MAINTENANCE.md carries the contributor-setup note — fresh clones wire via `npm install`'s prepare step, the manual equivalent is named, PF-16 referenced
Done-When: PF-16 reads done in `cdd/backlog.md` naming hook-wiring
Code: package.json, tests/acceptance/hook-wiring.test.js
