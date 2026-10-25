# R3 spec-axis review — 20261024-metrics-stamp

## Change identity

- Change: `cdd/changes/20261024-metrics-stamp/`
- Artifact under review: the implementation diff `0d63d30...HEAD` (three-dot,
  merge-base; HEAD = 93f8572 "feat(store): archive stamps a derived metrics.md
  into every archive folder") — the Spec axis of R3, run at Close
- Review point: R3 (code review), before archive; this brief covers the
  **Spec axis only** — the Standards axis runs in its own separate session
  with its own brief (`brief-r3-standards.md`)

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the
  paths and diff below, from disk at the pinned state. Loop law rule 2b —
  the reviewer is not the author of the artifacts under review.
- Your model family must differ from the author's model family (family = same
  provider or model lineage; the author's family is **zai / glm lineage**).
  Verify your own family from your runtime environment (e.g. `PI_PROVIDER`).
  If you cannot establish that the families differ, say so in your findings
  header and stop.
- You review ONE axis: Spec. Do not evaluate standards conformance here; the
  other axis has its own session so neither frames the other.

## Inputs (paths, pinned state)

- Diff command: `git diff 0d63d30...HEAD`
- Commit list: `git log 0d63d30..HEAD --oneline`
- `cdd/changes/20261024-metrics-stamp/specs/gherkin/spec.md` — every delta
  (the scenarios the diff must implement).
- `cdd/changes/20261024-metrics-stamp/proposal.md` — Done-When lines and the
  `Code:` implementation surface.
- `cdd/changes/20261024-metrics-stamp/tasks.md` — what was ticked, with
  verify-bys.
- `tests/acceptance/` — the pin files the scenarios name (the delta pins
  `tests/acceptance/archive-metrics-stamp.test.js` for every scenario).

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

Write your findings to `cdd/changes/20261024-metrics-stamp/reviews/r3-spec-code-review.md`
(the spec-axis file; you write only this file, never the standards axis's).
Header records your reviewer form (cold sub-agent) and your model family vs.
the author's (zai / glm lineage). End with a `## Counts` line and one line:
`VERDICT: PROCEED` or `VERDICT: HOLD` (HOLD only if an open blocker exists).
