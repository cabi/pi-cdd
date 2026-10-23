<!--
INSTANTIATED — R3 standards-axis brief for change `r3-findings`.

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
TWO AXES = TWO SESSIONS: you review the standards axis ONLY. Write your
findings to cdd/changes/r3-findings/reviews/r3-standards-code-review.md and
to no other findings file — never the other axis's file.
-->>

# R3 standards-axis review — r3-findings

## Change identity

- Change: `cdd/changes/r3-findings/`
- Artifact under review: the implementation diff `2c34772...HEAD`
  (three-dot, merge-base) — the Standards axis of R3, run at Close
- Review point: R3 (code review), before archive; this brief covers the
  **Standards axis only** — the Spec axis runs in its own separate session
  with its own brief (`brief-r3-spec.md`)

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the
  paths and diff below, from disk at the pinned state. Loop law rule 2b —
  the reviewer is not the author of the artifacts under review.
- Your model family must differ from the author's model family (family = same
  provider or model lineage). Verify your own family from your runtime
  environment (e.g. `PI_PROVIDER`) — the brief states the author's family,
  never yours as settled fact. If you cannot establish that the families
  differ, say so in your findings header and stop.
- You review ONE axis: Standards. Do not evaluate spec compliance here; the
  other axis has its own session so neither frames the other.

## Inputs (paths, pinned state)

- Diff command: `git diff 2c34772` (the entire change is the uncommitted working tree; read the untracked files — tests/acceptance/r3-findings.test.js and cdd/changes/r3-findings/** — directly)
- Commit list: `git log 2c34772..HEAD --oneline`
- `cdd/rules.md` — loop law (incl. mechanical-change rules).
- Standards documents this repo names: `AGENTS.md`/`README.md` conventions
  sections, plus the smell baseline charter in `skills/cdd-code-review/SKILL.md`.
- `cdd/decisions/` — accepted ADRs whose `code:` globs the diff touches.
- The change folder `cdd/changes/r3-findings/` for context only (what the
  diff claims to be).

## Scope fence

- In scope: the diff's conformance to documented conventions and accepted
  decisions.
- Out of scope: whether the diff implements the change's scenarios (Spec
  axis, separate session), proposing redesigns, any fix. You report
  findings; you do not edit files.

## MUST-DELIVER checklist (the charter)

1. **Conventions** — the diff follows the repo's documented standards
   (naming, structure, error handling, test placement) as written in the
   standards docs.
2. **ADR-governed files respected** — files under an accepted ADR's `code:`
   globs change only in ways the ADR sanctions; violations of a recorded
   decision are findings.
3. **Smell baseline** — the diff against the skill's smell list, quoted
   verbatim from `skills/cdd-code-review/SKILL.md` step 3 (Mysterious Name,
   Duplicated Code, Feature Envy, Data Clumps, Primitive Obsession, Repeated
   Switches, Shotgun Surgery, Divergent Change, Speculative Generality,
   Message Chains, Middle Man, Refused Bequest): new instances are findings;
   pre-existing ones are not; a documented repo standard overrides the
   baseline; tooling-enforced items are skipped.
4. **Guard/validator alignment** — the code agrees with what the
   deterministic doors expect (`cdd/scripts/spec-drift.mjs`,
   `lib/validate.mjs`, CI): changes that weaken, bypass, or blind a door
   (the guard, validators, CI) are findings, and so is silent divergence — e.g. law text that no longer
   renders byte-identically from its single source; a red door is a fact,
   not an obstacle.

## Findings grammar (advisory — no fixes, no verdicts)

Each finding: severity `blocker` | `should` | `note`, the finding, evidence
(path:line). You report every finding with disposition `open`; the author
later sets `fixed:` or `won't-fix:` when disposing.
Never red/green verdicts; gate authority stays with the deterministic validators and the human.

## Output

Write your findings to `cdd/changes/r3-findings/reviews/r3-standards-code-review.md`
(output path per `reviewPoint("R3").findingsStandards` in `lib/loop-law.mjs` — the
standards-axis file; you write only this file, never the spec axis's). Header records your reviewer form (cold sub-agent /
same-session re-read) and your model family vs. the author's.
