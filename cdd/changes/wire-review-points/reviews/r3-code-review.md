# R3 code review — wire-review-points

Two-axis review (Standards + Spec) of the uncommitted diff against HEAD `d967404`.
Fixed point: `d967404` (the change's pair-commit lands after this review).
Diff: `git diff HEAD` plus untracked files (`cdd/changes/wire-review-points/`,
`cdd/decisions/0008-*.md`, `tests/acceptance/review-wiring.test.js`).

Suites run: `npm test` (33/33 smoke + 15/15 tool), all six acceptance suites green,
`cdd validate` strict green. Guard full scan currently exits 1 (see note N2).

## Standards

- **should** — Duplicated line in the proposal instruction. `lib/instructions.mjs:42-43`
  repeats `one capability collide at archive. Genuinely sequential follow-ups open as`
  verbatim, so the "Capabilities" guidance reads "…Genuinely sequential follow-ups open
  as / one capability collide at archive. Genuinely sequential follow-ups open as / their
  own change…". A copy-paste slip introduced by this change (the `+` line in the diff);
  no test catches it. Disposition: open.
- **note** — Stray dead statement. `tests/acceptance/review-wiring.test.js:98` holds a
  leftover `const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rw-"));` floating between
  the RW4 and RW5 checks (the real one lives inside RW5 at line 100). It runs once at
  module load and creates an unused temp dir. Disposition: open.

## Spec

- **should** — Pin honesty: the ambient/help/README pins check the review-point *names*
  but not the *triggers* their scenarios require. The delta's "Ambient and help statements
  match the law" scenario demands "each names R1, R2, and R3 **with the same triggers** as
  the review-points rule", and "The repository's own store copy and README match the law"
  demands the README table "names R1, R2, and R3 **with their triggers**". The pins
  `RW6`/`RW7`/`RW14` (`tests/acceptance/review-wiring.test.js:112,117,190`) assert only
  that the tokens `R1`/`R2`/`R3` appear (RW6 additionally checks `draft-green`). If the
  trigger wording ("after the proposal", "at draft-green", "before archive") regressed
  while the names stayed, these pins would remain green. The core naming claim is pinned;
  the trigger clause is not. Disposition: open.
- **note** — Guard is currently red, not green. `node scripts/spec-drift.mjs` exits 1 with
  `[L2] tests/smoke.mjs changed after every spec of gherkin last changed`. This is the
  pre-existing staleness the proposal names (smoke.mjs last committed in `d967404`, the
  living spec in `d6f5af0`); it heals at the feature commit, when `tests/smoke.mjs` and
  the delta's `specs/gherkin/spec.md` travel together and the delta's spec commit becomes
  the capability tip. The Done-When "full scan exits 0" is therefore met only post-commit,
  not in the current uncommitted tree. Disposition: open.

## Summary

Standards: 2 findings (1 should, 1 note) — worst: duplicated instruction line.
Spec: 2 findings (1 should, 1 note) — worst: trigger clause unpinned in RW6/RW7/RW14.
No blockers.

## Dispositions (author)

- R3-S1 duplicated Capabilities line — **fixed**: duplicate line deleted from `lib/instructions.mjs` (the copy-paste slip came from this change's own edit). Ties to process finding 8: needle checks for instruction text live only in the acceptance suite, which does not run in CI — a smoke-side needle would have caught this at `npm test`.
- R3-S2 unpinned triggers — **fixed**: RW6/RW7/RW14 now assert the trigger phrases ("after the proposal", "T1 or T2 YES" / "T1/T2 YES", "at draft-green", "before archive") alongside the R1/R2/RW3 tokens. Red-green verified: temporarily dropping "T1 or T2 YES" from the ambient line turned RW6 red ("ambient block lacks \"T1 or T2 YES\""), restore turned it green.
- R3-N1 dead const — **fixed**: stray `const tmp = fs.mkdtempSync(...)` removed from `tests/acceptance/review-wiring.test.js`.
- R3-N2 guard red pre-commit — **won't-fix (informational)**: pre-existing L2 staleness from d967404, named in the proposal; heals when `tests/smoke.mjs` and the delta travel in the feature commit (Done-When 5 is a post-commit check, re-run after the feature commit and before `cdd archive`).
