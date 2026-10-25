# R1 Proposal Review Brief — 20261025-stale-lib-guard

You are a cold reviewer in a fresh session. You did not author these artifacts.

## Independence record

- Author model family: **zai** (glm-5.3). You must be from a different family. Write the model you actually run on at the top of your findings file; if you are also zai, stop and report that instead of reviewing.

## What to do

1. Read the skill file `skills/cdd-spec-review/SKILL.md` (repo root) and follow its **proposal mode** checklist.
2. Review, from disk:
   - `cdd/changes/20261025-stale-lib-guard/proposal.md`
   - `cdd/changes/20261025-stale-lib-guard/design.md` (the design gate fired T2 YES, so a design.md exists)
   - Context only (not under review): `cdd/rules.md`, `cdd/backlog.md` lines PF-35/PF-36, `cdd/specs/extension/spec.md` (living spec), `index.ts`, `lib/ops.mjs`.
3. Pay particular attention to (director's steers, already adjudicated at the gate — check the adjudication is honest, not just present):
   - the refusal must name the exact fresh-node lawful command per op, not just "restart pi";
   - surface membership is re-globbed per dispatch; added and removed files count as stale;
   - file size is statted alongside mtimeMs.
4. Checks that decide the verdict (from the skill): Done-When → requirement → task chain coherence; delta↔living-spec fit (single capability extension, Code-line ownership); reuse-first honesty of Solutions Considered; design-gate credibility (T1–T5 answers evidence-backed, neither under- nor overstated); verify-by realism (can the named acceptance pin actually pin each scenario?).

## Output

Write findings to `cdd/changes/20261025-stale-lib-guard/reviews/r1-proposal-review.md`:

- Header: your model id, thinking level, date, mode (proposal), form (cold subagent, fresh session).
- One block per finding: severity `blocker` / `should` / `note`, the artifact+line, the problem, and the disposition you recommend (`fixed:` / `open` / `won't-fix:` — the author disposes; you recommend).
- Advisory only — no verdicts; deterministic validators keep gate authority.
- If nothing fires at a severity, say so explicitly.

Do not edit any artifact. Do not run the cdd tool. Report by writing the findings file and ending with a short summary of blocker/should/note counts.
