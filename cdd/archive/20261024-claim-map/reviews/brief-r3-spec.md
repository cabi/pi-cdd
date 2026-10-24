# R3 Spec-axis brief — change `claim-map`

You are a cold reviewer. You did not author this change. Judge only what is on disk in /home/carsten/Projects/pi-extensions/pi-cdd. Everything you need is in this brief or reachable from it by reading the repository.

## The change under review

The change `claim-map` closes with this contract, authored in `cdd/changes/claim-map/`:

- `proposal.md` — Why / What Changes / Solutions Considered / Non-Goals / Capabilities / Done-When (5 lines) / Code.
- `specs/gherkin/spec.md` and `specs/adr/spec.md` — the delta: MODIFIED requirements only. Gherkin: "The ADR claims index is single-sourced" (two scenarios added) and "The drift guard gathers once, then checks purely" (description sentence added). ADR: "The adrs op discovers governing decisions" (description sentence replaced), "The reconfirm op records decision reconfirmation" (description sentence added), "Product ADRs live in the store's decisions home" (twelve→thirteen).
- `tasks.md` — ticked tasks with evidence lines (including the RED-first record).

The implementation diff is the working tree against branch point `0bd33cd`:

```
git -C /home/carsten/Projects/pi-extensions/pi-cdd diff 0bd33cd -- scripts/ lib/ tests/ cdd/scripts/ cdd/decisions/
git -C /home/carsten/Projects/pi-extensions/pi-cdd status --porcelain
```

Untracked new files count as the diff too: `tests/acceptance/claim-map.test.js`, `cdd/decisions/0013-one-claim-map-for-guard-and-ops.md`.

## Your axis: Spec

Does the diff implement the delta — every requirement, every scenario, nothing unsponsored?

For each delta scenario (all of them, one by one): name its `Verified by:` path, open that file, and confirm a real check exists that fails if the scenario's Then-clause is false. Flag any scenario whose pin is a tautology, pins less than the Then-clause states, or does not exist.

For the diff's every behavior: is it sponsored by a delta scenario or a Done-When line? In particular judge whether these are sponsored: (1) the store inventory pins moving twelve→thirteen in `tests/acceptance/decisions-home.test.js`, `tests/acceptance/adr-ops.test.js`, `tests/acceptance/adr-index-agreement.test.js` (look for the delta scenarios that restate those counts); (2) the two byte-identity contracts in the tasks 3.6 evidence (worktree /tmp/claim-map-proof if you want to re-verify mechanics — read-only); (3) ADR-0013's existence and its code globs (Done-When line 5 and the "Product ADRs" delta block).

Nothing-unsponsored also runs the other way: any scenario in the delta with NO corresponding implementation change is a finding.

## Output

Write your findings to `cdd/changes/claim-map/reviews/r3-spec-code-review.md` (this file only; you write NO other files, you run NO builds, you commit nothing). Format:

```
# R3 spec-axis findings — claim-map
Reviewer: cold session, model <provider/model you run as>, family <family>
Charter: spec axis only. Advisory findings, never verdicts.

| id | severity (blocker/should/note) | finding | evidence (path:line) | disposition |
|---|---|---|---|---|
| P1 | ... | ... | ... | open |

## Scenario coverage table
| delta scenario | verified-by path | real check? |
|---|---|---|
```

Then reply to your parent with: counts (blocker/should/note), the model you ran as, and your family. Findings are advisory; dispositions belong to the author.
