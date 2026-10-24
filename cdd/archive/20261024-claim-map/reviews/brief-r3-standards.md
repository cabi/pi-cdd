# R3 Standards-axis brief — change `claim-map`

You are a cold reviewer. You did not author this change. Judge only what is on disk in /home/carsten/Projects/pi-extensions/pi-cdd. Everything you need is in this brief or reachable from it by reading the repository.

## The change under review

Contract-driven project: `cdd/rules.md` is the method law; `cdd/specs/*/spec.md` are living specs; the change `claim-map` (artifacts under `cdd/changes/claim-map/`) is closing. The implementation diff is the working tree against the branch point `0bd33cd`:

```
git -C /home/carsten/Projects/pi-extensions/pi-cdd diff 0bd33cd -- scripts/ lib/ tests/ cdd/scripts/ cdd/decisions/
git -C /home/carsten/Projects/pi-extensions/pi-cdd status --porcelain
```

Untracked new files are part of the diff: `tests/acceptance/claim-map.test.js`, `cdd/decisions/0013-one-claim-map-for-guard-and-ops.md`, everything under `cdd/changes/claim-map/` (the change's own artifacts — proposal/specs/tasks/reviews — are NOT code under review).

Changed code files: `scripts/adr-index.mjs`, `scripts/spec-drift.mjs`, `lib/adr-ops.mjs`, regenerated store copies `cdd/scripts/adr-index.mjs` + `cdd/scripts/spec-drift.mjs`, and in-place pin updates in `tests/acceptance/decisions-home.test.js`, `tests/acceptance/adr-ops.test.js`, `tests/acceptance/adr-index-agreement.test.js`.

## Your axis: Standards

Does the code follow THIS repo's documented standards? Read and apply:

- `cdd/rules.md` — the method law (artifact shapes, pair-commit law, mechanical-sweep rules).
- The store's decision records under `cdd/decisions/` — in particular 0001 (zero-dependency Node tooling), 0005 (doors never import the gherkin parser at commit time), 0006 (fence/scenario format), 0007 (one grammar module behind every door; law travels via DOOR_SCRIPTS), 0011 (tick re-verification and real-door pins), 0012 (comments are shape-of-code documentation only — no narrative/spec markers in code comments).
- The living spec laws the diff touches: `cdd/specs/gherkin/spec.md` requirements "The drift guard gathers once, then checks purely" (pure checks hold no I/O) and "The ADR claims index is single-sourced"; `cdd/specs/adr/spec.md` requirement "The adrs op discovers governing decisions".
- Source structure conventions of the existing modules (read the full files, not just the diff hunks).

Check at minimum: comment style vs ADR-0012 (shape-of-code, no spec markers, no "per rule X" narration); zero new dependencies (ADR-0001); the guard's gather/pure split preserved (no fs/git/console inside the pure-check region of `scripts/spec-drift.mjs`); DOOR_SCRIPTS still exactly 5 store copies, byte-identical to their sources; no behavior change smuggled in beyond the change's two byte-identity contracts; test edits stay pins (no weakened assertions without a delta scenario sponsoring them).

## Output

Write your findings to `cdd/changes/claim-map/reviews/r3-standards-code-review.md` (this file — nothing else outside it; you write NO other files, you run NO builds, you commit nothing). Format:

```
# R3 standards-axis findings — claim-map
Reviewer: cold session, model <provider/model you run as>, family <family>
Charter: standards axis only. Advisory findings, never verdicts.

| id | severity (blocker/should/note) | finding | evidence (path:line) | disposition |
|---|---|---|---|---|
| S1 | ... | ... | ... | open |

## Charter notes
<which standards you checked and how>
```

Then reply to your parent with: counts (blocker/should/note), the model you ran as, and your family. Findings are advisory; dispositions belong to the author.
