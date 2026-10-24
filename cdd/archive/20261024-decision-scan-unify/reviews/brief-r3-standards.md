# R3 Standards-axis brief — change `decision-scan-unify`

You are a cold reviewer. You did not author this change. Judge only what is on disk in /home/carsten/Projects/pi-extensions/pi-cdd. Everything you need is in this brief or reachable from it by reading the repository.

## The change under review

Contract-driven project: `cdd/rules.md` is the method law; `cdd/specs/*/spec.md` are living specs; the change `decision-scan-unify` (artifacts under `cdd/changes/decision-scan-unify/`) is closing. The implementation diff is the working tree against the branch point `f76f12f`:

```
git -C /home/carsten/Projects/pi-extensions/pi-cdd diff f76f12f -- scripts/ lib/ tests/ cdd/scripts/ cdd/decisions/
git -C /home/carsten/Projects/pi-extensions/pi-cdd status --porcelain
```

Untracked new files are part of the diff: `tests/acceptance/decision-scan.test.js` and everything under `cdd/changes/decision-scan-unify/` (the change's own artifacts — proposal/specs/tasks/reviews — are NOT code under review).

Changed code files: `scripts/adr-index.mjs` (new exported scanDecisionFiles + refactored buildAdrIndex), `scripts/arch-extract.mjs` (private decision walk deleted, consumes the shared scan), regenerated store copies `cdd/scripts/adr-index.mjs` + `cdd/scripts/arch-extract.mjs`, and the new acceptance test.

## Your axis: Standards

Does the code follow THIS repo's documented standards? Read and apply:

- `cdd/rules.md` — the method law (artifact shapes, acceptance-test law, pair-commit law).
- The store's decision records under `cdd/decisions/` — in particular 0001 (zero-dependency Node tooling), 0007 (one grammar module behind every door; law travels via DOOR_SCRIPTS as byte-identical store copies), 0011 (tick re-verification and real-door pins), 0012 (comments are shape-of-code documentation only — no narrative/spec markers in code comments), 0013 (one claim map behind guard and ops; adr-index.mjs is its law home).
- The living spec laws the diff touches: `cdd/specs/gherkin/spec.md` requirement "The ADR claims index is single-sourced" and the door-1 requirement that claims `scripts/arch-extract.mjs` (find its Code line).
- Source structure conventions of the existing modules (read the full files, not just the diff hunks): naming, doc-comment style, single-quote convention, error handling.

Check at minimum: comment style vs ADR-0012 (shape-of-code, no spec markers, no "per rule X" narration); zero new dependencies (ADR-0001); DOOR_SCRIPTS still exactly 5 store copies, byte-identical to their sources (`cmp scripts/X.mjs cdd/scripts/X.mjs`); the scan's contract honesty (flags actually steer walk/filter/default as documented; no hidden second parse or second walk anywhere); arch-extract's import of `./adr-index.mjs` consistent with how store copies sit side by side under `cdd/scripts/`; test edits stay pins (no weakened assertions, no tautologies); the behavior-preservation claims (index answers, extractor rows) are pinned by real executable checks, not source-text greps alone (judge whether the DS1 source pins are fair mechanical pins or brittle/cheatable).

## Output

Write your findings to `cdd/changes/decision-scan-unify/reviews/r3-standards-code-review.md` (this file — nothing else outside it; you write NO other files, you run NO builds, you commit nothing). Format:

```
# R3 standards-axis findings — decision-scan-unify
Reviewer: cold session, model <provider/model you run as>, family <family>
Charter: standards axis only. Advisory findings, never verdicts.

| id | severity (blocker/should/note) | finding | evidence (path:line) | disposition |
|---|---|---|---|---|
| S1 | ... | ... | ... | open |

## Charter notes
<which standards you checked and how>
```

Then reply to your parent with: counts (blocker/should/note), the model you ran as, and your family. Findings are advisory; dispositions belong to the author.
