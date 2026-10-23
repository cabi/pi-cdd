<!--
INSTANTIATED from skills/cdd-code-review/assets/brief-r3-spec.md for the
backlog-revalidate Close. Hand this file to a cold reviewer session as its
entire brief. Nothing else rides along.
-->

# R3 spec-axis review — backlog-revalidate

## Change identity

- Change: `cdd/changes/backlog-revalidate/`
- Artifact under review: the implementation diff `bef3546` (main, the branch
  point) → the current uncommitted working tree on branch
  `backlog-revalidate` — the Spec axis of R3, run at Close
- Review point: R3 (code review), before archive; this brief covers the
  **Spec axis only** — the Standards axis runs in its own separate session
  with its own brief (`brief-r3-standards.md`)

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the
  paths and diff below, from disk at the pinned state. Loop law rule 2b —
  the reviewer is not the author of the artifacts under review.
- Your model family must differ from the author's model family (family = same
  provider or model lineage). The author's family is **zai / glm-5.3**.
  Verify your own family from your runtime environment (e.g. `PI_PROVIDER`)
  — if you cannot establish that the families differ, say so in your
  findings header and stop.
- You review ONE axis: Spec. Do not evaluate standards conformance here; the
  other axis has its own session so neither frames the other.

## Inputs (paths, pinned state)

- Diff command: the change is an uncommitted working tree, so read
  `git diff bef3546 --stat` for the modified-file list, then
  `git diff bef3546 -- <path>` per tracked file, plus direct reads of the
  new untracked files: `tests/acceptance/backlog-revalidate.test.js` and
  the change folder `cdd/changes/backlog-revalidate/`.
- Commit list: `git log bef3546..HEAD --oneline` (expected: none yet — the
  feature commit happens after this review).
- `cdd/changes/backlog-revalidate/specs/extension/spec.md` — the extension
  delta (every scenario the diff must implement).
- `cdd/changes/backlog-revalidate/specs/gherkin/spec.md` — the gherkin
  delta (same).
- `cdd/changes/backlog-revalidate/proposal.md` — Done-When lines and the
  `Code:` implementation surface.
- `cdd/changes/backlog-revalidate/tasks.md` — what was ticked, with
  verify-bys.
- `tests/acceptance/` — the pin files the scenarios name
  (`backlog-revalidate.test.js`, `backlog-op.test.js`; the gherkin delta
  also pins `tests/smoke.mjs`).

## Scope fence

- In scope: whether the diff implements the change's delta — every
  requirement, every scenario, nothing unsponsored — and whether the pins
  actually pin.
- Out of scope: conventions and ADR conformance (Standards axis, separate
  session), proposing redesigns, any fix. You report findings; you do not
  edit files.
- Context you may need: `cdd/backlog.md` is data (rule 13) — its dogfood
  edits (premise backfills, header conventions line, PF-10/PF-11
  done-resolves, PF-23 mint) are sponsored by ticked task 3.8 and its
  verify-by `reviews/dogfood-revalidate.md`; judge them against the delta's
  grammar scenarios, not as free-floating code.

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
   sponsors is a finding (dead code, speculative hooks, drive-by
   refactors).

## Findings grammar (advisory — no fixes, no verdicts)

Each finding: severity `blocker` | `should` | `note`, the finding, evidence
(path:line). You report every finding with disposition `open`; the author
later sets `fixed:` or `won't-fix:` when disposing.
Never red/green verdicts; gate authority stays with the deterministic
validators and the human.

## Output

Write your findings to
`cdd/changes/backlog-revalidate/reviews/r3-spec-code-review.md`
(output path per `reviewPoint("R3").findingsSpec` in `lib/loop-law.mjs` —
the spec-axis file; you write only this file, never the standards
axis's). Header records your reviewer form (cold sub-agent /
same-session re-read) and your model family vs. the author's.
