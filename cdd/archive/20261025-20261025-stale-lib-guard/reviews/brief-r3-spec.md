# R3 Spec-Axis Code Review Brief — 20261025-stale-lib-guard

You are a cold reviewer in a fresh session. You did not author this code.

## Independence record

- Author model family: **zai** (glm-5.3). You must be from a different family. Write the model you actually run on at the top of your findings file; if you are also zai, stop and report that instead of reviewing.
- Earlier artifact reviews on this change: R1 and R2, both by opencode-zen/gpt-6-luna at thinking high; dispositions recorded in their findings files — context, not authority.

## What to do

1. Read the skill file `skills/cdd-code-review/SKILL.md` (repo root) and follow its **Spec axis** checklist.
2. The diff under review is exactly: `git diff 899ba38..1f675b2` on branch `change/20261025-stale-lib-guard` (repo root `/home/carsten/Projects/pi-extensions/pi-cdd`). Files: `index.ts`, `lib/stale.mjs` (new), `tests/tools.mjs`, `tests/acceptance/stale-lib-guard.test.js` (new).
3. The contract under review against:
   - `cdd/changes/20261025-stale-lib-guard/proposal.md` — the 5 Done-When criteria and Non-Goals.
   - `cdd/changes/20261025-stale-lib-guard/specs/extension/spec.md` — the delta: 1 ADDED requirement ("A stale process refuses mutation and warns on verdicts"), 9 scenarios, each `# Verified by: tests/acceptance/stale-lib-guard.test.js`.
   - `cdd/changes/20261025-stale-lib-guard/tasks.md` — ticked tasks 3.1–3.6 with recorded verify evidence.
4. Spec-axis checks that decide your findings: does the diff implement EVERY delta scenario (1 stale archive refusal with exactly 1 error naming the changed file + fresh-node command, no mutation; 2 stale validate answers with exactly 1 staleness warning; 3 added file stale; 4 removed file stale; 5 backlog list warns / add refuses; 6 clean process unaffected; 7 all three mutating door-1 commands refuse; 8 same-length rewrite with restored mtime detected; 9 every refusal command actually runs its op)? Is anything in the diff UNSPONSORED (behavior no scenario or Non-Goal authorizes — e.g. fresh-spawn execution, doc changes, validate/archive semantic changes beyond the pre-dispatch staleness path, store tracking)? Do the acceptance tests actually pin each scenario as its `Verified by:` line claims (run `node --test tests/acceptance/stale-lib-guard.test.js` and read the file — hermetic scratch surfaces, real jiti-loaded dispatcher, no self-fulfilling mocks of the guard itself)? Do the unit pins in tests/tools.mjs cover the guard's contract without re-implementing it?
5. Non-Goals guardrails (any of these landing in the diff is a finding): fresh-spawn execution of mutating ops; doc-law changes; behavior change to validate/archive semantics beyond the staleness path; staleness tracking of the project's cdd/ store.

## Output

Write findings to `cdd/changes/20261025-stale-lib-guard/reviews/r3-spec-code-review.md`:

- Header: your model id, thinking level, date, axis (spec), form (cold subagent, fresh session).
- One block per finding: severity `blocker` / `should` / `note`, file+line (or delta scenario id), problem, recommended disposition (`fixed:` / `open` / `won't-fix:`).
- Advisory only — no verdicts; the deterministic validators keep gate authority.
- If nothing fires at a severity, say so explicitly.

You may run read-only commands (git diff, node --test, grep). Do not edit any artifact other than your findings file. Do not run the cdd tool. Do not commit. End with a one-line summary: model, thinking, blocker/should/note counts.
