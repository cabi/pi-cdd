# R2 Package Review Brief — 20261025-stale-lib-guard

You are a cold reviewer in a fresh session. You did not author these artifacts.

## Independence record

- Author model family: **zai** (glm-5.3). You must be from a different family. Write the model you actually run on at the top of your findings file; if you are also zai, stop and report that instead of reviewing.
- An earlier R1 proposal review (same change) was performed by opencode-zen/gpt-6-luna at thinking high; its findings were disposed and are context, not authority.

## What to do

1. Read the skill file `skills/cdd-spec-review/SKILL.md` (repo root) and follow its **package mode** checklist.
2. Review, from disk, the whole package:
   - `cdd/changes/20261025-stale-lib-guard/proposal.md`
   - `cdd/changes/20261025-stale-lib-guard/design.md`
   - `cdd/changes/20261025-stale-lib-guard/specs/extension/spec.md` (the delta)
   - `cdd/changes/20261025-stale-lib-guard/tasks.md` (gate record, implementation subtasks, traceability)
   - `cdd/changes/20261025-stale-lib-guard/reviews/r1-proposal-review.md` (dispositions already recorded — check each disposition actually closes its finding)
3. Context only (not under review): `cdd/rules.md`, `cdd/specs/extension/spec.md` (the LIVING spec at repo root — check delta↔living-spec fit against it), `cdd/backlog.md` PF-35/PF-36, `index.ts`, `lib/ops.mjs`, `lib/store.mjs`, `lib/backlog.mjs`, `lib/adr-ops.mjs`, `tests/tools.mjs`, `tests/pi-jiti.mjs`, `tests/acceptance/ops-registry.test.js`.
4. Package-mode checks that decide your findings: the Done-When → requirement-scenario → task chain closes both ways (every criterion has tasks, every task traces to a criterion or requirement); the delta fits the living spec (single capability, Code-line ownership, no silent drops); reuse-first honesty; gate-record credibility; verify-by realism — especially: can `tests/acceptance/stale-lib-guard.test.js` actually pin each of the 9 scenarios with the hermetic scratch+jiti harness described in task 3.2 (scratch copy of index.ts+lib+scripts+vendor, one lib file edited after load), and is the scenario "Every refusal command runs its op" executable as written (scratch-store setup per mutating op/backlog action)?
5. Known advisory state you may weigh but need not re-litigate: the delta requirement holds 9 scenarios (spec-size warning ≥8, split signal, advisory only); the author kept it whole as one behavior and will surface the signal to the director.

## Output

Write findings to `cdd/changes/20261025-stale-lib-guard/reviews/r2-change-review.md`:

- Header: your model id, thinking level, date, mode (package), form (cold subagent, fresh session).
- One block per finding: severity `blocker` / `should` / `note`, artifact+line, problem, recommended disposition (`fixed:` / `open` / `won't-fix:`).
- Advisory only — no verdicts; the deterministic validators keep gate authority.
- If nothing fires at a severity, say so explicitly.

Do not edit any artifact other than your findings file. Do not run the cdd tool. End with a one-line summary: model, thinking, blocker/should/note counts.
