# R3 Spec-axis brief — change `decision-scan-unify`

You are a cold reviewer. You did not author this change. Judge only what is on disk in /home/carsten/Projects/pi-extensions/pi-cdd. Everything you need is in this brief or reachable from it by reading the repository.

## The change under review

The change `decision-scan-unify` closes with this contract, authored in `cdd/changes/decision-scan-unify/`:

- `proposal.md` — Why / What Changes / Solutions Considered / Non-Goals / Decisions followed / Capabilities / Done-When (4 lines) / Code.
- `specs/gherkin/spec.md` — the delta: ONE MODIFIED requirement, "The ADR claims index is single-sourced" (description extended with the decision-scan sentence; the 5 pre-existing scenarios restated verbatim; 3 scenarios ADDED: "The decision scan is defined exactly once behind explicit flags", "Index flags preserve the claims index surface", "Legacy flags preserve the extractor surface").
- `tasks.md` — ticked tasks with evidence lines (including the RED-first record and the PF-27 two-stage byte-identity evidence).

The implementation diff is the working tree against branch point `f76f12f`:

```
git -C /home/carsten/Projects/pi-extensions/pi-cdd diff f76f12f -- scripts/ lib/ tests/ cdd/scripts/ cdd/decisions/
git -C /home/carsten/Projects/pi-extensions/pi-cdd status --porcelain
```

Untracked new files count as the diff too: `tests/acceptance/decision-scan.test.js`.

## Your axis: Spec

Does the diff implement the delta — every requirement, every scenario, nothing unsponsored?

For each delta scenario (all of them, one by one, the 3 ADDED and the 5 restated): name its `Verified by:` path, open that file, and confirm a real check exists that fails if the scenario's Then-clause is false. Flag any scenario whose pin is a tautology, pins less than the Then-clause states, or does not exist.

For the diff's every behavior: is it sponsored by a delta scenario or a Done-When line? In particular judge whether these are sponsored: (1) `scanDecisionFiles`'s flag set and its defaults in `scripts/adr-index.mjs` (which scenario pins each flag's semantics — dirs, numberedOnly, defaultStatus — and the missing-directory tolerance?); (2) `buildAdrIndex`'s refactor onto the scan (which scenario pins index answers unchanged, including the heading-less title '' projection?); (3) arch-extract's consumption with the legacy preference and its projection (which scenario pins the extractor rows unchanged — location, status, code, title, order?); (4) the regenerated door copies and the PF-27/ops evidence in tasks 3.5 (Done-When line 2); (5) the test file's DS1 source pins (which scenario sponsors source-level pins?).

Nothing-unsponsored also runs the other way: any scenario in the delta with NO corresponding implementation change is a finding, and any behavior in the diff beyond the delta's scope (e.g. changes to files no scenario or Done-When mentions) is a finding.

Also check the delta home: the proposal says the gherkin capability is the only one modified. Confirm no requirement in any OTHER living spec (`cdd/specs/adr/spec.md` etc.) restates what this delta changes such that it would now be stale.

## Output

Write your findings to `cdd/changes/decision-scan-unify/reviews/r3-spec-code-review.md` (this file only; you write NO other files, you run NO builds, you commit nothing). Format:

```
# R3 spec-axis findings — decision-scan-unify
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
