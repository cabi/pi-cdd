<!--
INSTANTIATED — R3 spec-axis brief for change `r3-findings`.

Pinned state: branch r3-findings at 2c34772 (main) with the ENTIRE change
uncommitted in the working tree:

#   M cdd/decisions/0008-model-run-reviews-are-advisory-findings.md
#    M cdd/decisions/0009-single-source-the-loop-law.md
#    M cdd/decisions/0010-reviewer-independence-is-loop-law.md
#    M cdd/rules.md
#    M lib/instructions.mjs
#    M lib/loop-law.mjs
#    M lib/templates.mjs
#    M lib/validate.mjs
#    M skills/cdd-code-review/SKILL.md
#    M skills/cdd-code-review/brief-r3-spec.md
#    M skills/cdd-code-review/brief-r3-standards.md
#    M tests/acceptance/loop-law-hardening.test.js
#    M tests/acceptance/review-wiring.test.js
#    M tests/acceptance/single-source-law.test.js
#    M tests/smoke.mjs
#   ?? cdd/changes/r3-findings/
#   ?? tests/acceptance/r3-findings.test.js

Use the working-tree diff `git diff 2c34772` plus direct reads of the
untracked files; state the uncommitted state in your findings header.

Author family: zai (glm-5.3). Reviewer must be another family.
TWO AXES = TWO SESSIONS: you review the spec axis ONLY. Write your
findings to cdd/changes/r3-findings/reviews/r3-spec-code-review.md and
to no other findings file — never the other axis's file.
-->>

# R3 spec-axis review — r3-findings

## Change identity

- Change: `cdd/changes/r3-findings/`
- Artifact under review: the implementation diff `2c34772...HEAD`
  (three-dot, merge-base) — the Spec axis of R3, run at Close
- Review point: R3 (code review), before archive; this brief covers the
  **Spec axis only** — the Standards axis runs in its own separate session
  with its own brief (`brief-r3-standards.md`)

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the
  paths and diff below, from disk at the pinned state. Loop law rule 2b —
  the reviewer is not the author of the artifacts under review.
- Your model family must differ from the author's model family (family = same
  provider or model lineage). Verify your own family from your runtime
  environment (e.g. `PI_PROVIDER`) — the brief states the author's family,
  never yours as settled fact. If you cannot establish that the families
  differ, say so in your findings header and stop.
- You review ONE axis: Spec. Do not evaluate standards conformance here; the
  other axis has its own session so neither frames the other.

## Inputs (paths, pinned state)

- Diff command: `git diff 2c34772` (the entire change is the uncommitted working tree; read the untracked files — tests/acceptance/r3-findings.test.js and cdd/changes/r3-findings/** — directly)
- Commit list: `git log 2c34772..HEAD --oneline`
- `cdd/changes/r3-findings/specs/gherkin/spec.md` — every delta (the
  scenarios the diff must implement).
- `cdd/changes/r3-findings/proposal.md` — Done-When lines and the `Code:`
  implementation surface.
- `cdd/changes/r3-findings/tasks.md` — what was ticked, with verify-bys.
- `tests/acceptance/` — the pin files the scenarios name.

## Scope fence

- In scope: whether the diff implements the change's delta — every
  requirement, every scenario, nothing unsponsored — and whether the pins
  actually pin.
- Out of scope: conventions and ADR conformance (Standards axis, separate
  session), proposing redesigns, any fix. You report findings; you do not
  edit files.

## MUST-DELIVER checklist (the charter)

1. **Every scenario implemented** — each delta scenario's observable outcome
   is produced by the diffed code; a scenario whose THEN is not traceable
   to a code change is a finding.
2. **Pins actually pin** — each `# Verified by:` acceptance test exercises
   the pinned behavior such that it would FAIL if the scenario regressed
   (mutate the behavior in thought or in a scratch run; a pin that stays
   green through a regression is a finding — a copied-fragment or
   sandbox-only pin does not count).
3. **No unsponsored code** — every hunk in the diff serves a delta
   requirement or a ticked task's verify-by; code no scenario or task
   sponsors is a finding (dead code, speculative hooks, drive-by refactors).

## Findings grammar (advisory — no fixes, no verdicts)

Each finding: severity `blocker` | `should` | `note`, the finding, evidence
(path:line). You report every finding with disposition `open`; the author
later sets `fixed:` or `won't-fix:` when disposing.
Never red/green verdicts; gate authority stays with the deterministic validators and the human.

## Output

Write your findings to `cdd/changes/r3-findings/reviews/r3-spec-code-review.md`
(output path per `reviewPoint("R3").findingsSpec` in `lib/loop-law.mjs` — the
spec-axis file; you write only this file, never the standards axis's). Header records your reviewer form (cold sub-agent /
same-session re-read) and your model family vs. the author's.
