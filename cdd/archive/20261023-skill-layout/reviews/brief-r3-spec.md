<!--
R3 spec-axis review brief (skill cdd-code-review, Spec axis), instantiated
for change skill-layout by the author session (family: zai, glm-5.3).
Reviewer: cold sub-agent, family opencode-zen (deepseek-v4-pro) — differs
from the author's family per rule 2b. Repo: working tree on branch
skill-layout (base main @ 1750767), change uncommitted — the diff is the
staged renames + unstaged edits + the untracked change folder. This file is
the reviewer's entire brief; nothing else rides along. TWO AXES = TWO
SESSIONS: the Standards axis runs in its own cold session with its own brief
(assets/brief-r3-standards.md).
-->

# R3 spec-axis review — skill-layout

## Change identity

- Change: `cdd/changes/skill-layout/`
- Artifact under review: the implementation diff `1750767...working tree`
  — the Spec axis of R3, run at Close
- Review point: R3 (code review), before archive; this brief covers the
  **Spec axis only** — the Standards axis runs in its own separate session
  with its own brief (`assets/brief-r3-standards.md`)

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

- Diff command: `git diff 1750767` (staged + unstaged) plus reads of the untracked change folder `cdd/changes/skill-layout/` — the change is an uncommitted working tree
- Commit list: none yet (working tree; base main @ 1750767)
- `cdd/changes/skill-layout/specs/gherkin/spec.md` — every delta (the
  scenarios the diff must implement).
- `cdd/changes/skill-layout/proposal.md` — Done-When lines and the `Code:`
  implementation surface.
- `cdd/changes/skill-layout/tasks.md` — what was ticked, with verify-bys.
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

Write your findings to `cdd/changes/skill-layout/reviews/r3-spec-code-review.md`
(output path per `reviewPoint("R3").findingsSpec` in `lib/loop-law.mjs` — the
spec-axis file; you write only this file, never the standards axis's). Header records your reviewer form (cold sub-agent /
same-session re-read) and your model family vs. the author's.
