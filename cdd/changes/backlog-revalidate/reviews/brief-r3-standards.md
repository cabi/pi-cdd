<!--
INSTANTIATED from skills/cdd-code-review/assets/brief-r3-standards.md for
the backlog-revalidate Close. Hand this file to a cold reviewer session as
its entire brief. Nothing else rides along.
-->

# R3 standards-axis review — backlog-revalidate

## Change identity

- Change: `cdd/changes/backlog-revalidate/`
- Artifact under review: the implementation diff `bef3546` (main, the branch
  point) → the current uncommitted working tree on branch
  `backlog-revalidate` — the Standards axis of R3, run at Close
- Review point: R3 (code review), before archive; this brief covers the
  **Standards axis only** — the Spec axis runs in its own separate session
  with its own brief (`brief-r3-spec.md`)

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the
  paths and diff below, from disk at the pinned state. Loop law rule 2b —
  the reviewer is not the author of the artifacts under review.
- Your model family must differ from the author's model family (family = same
  provider or model lineage). The author's family is **zai / glm-5.3**.
  Verify your own family from your runtime environment (e.g. `PI_PROVIDER`)
  — if you cannot establish that the families differ, say so in your
  findings header and stop.
- You review ONE axis: Standards. Do not evaluate spec compliance here; the
  other axis has its own session so neither frames the other.

## Inputs (paths, pinned state)

- Diff command: the change is an uncommitted working tree, so read
  `git diff bef3546 --stat` for the modified-file list, then
  `git diff bef3546 -- <path>` per tracked file, plus direct reads of the
  new untracked files: `tests/acceptance/backlog-revalidate.test.js`,
  `cdd/changes/backlog-revalidate/**` (proposal, tasks, deltas, reviews —
  change artifacts, context only).
- Commit list: `git log bef3546..HEAD --oneline` (expected: none yet — the
  feature commit happens after this review).
- `cdd/rules.md` — loop law (incl. mechanical-change rules).
- Standards documents this repo names: `AGENTS.md`/`README.md` conventions
  sections, plus the smell baseline charter in
  `skills/cdd-code-review/SKILL.md`.
- `cdd/decisions/` — accepted ADRs whose `code:` globs the diff touches.
- The change folder `cdd/changes/backlog-revalidate/` for context only (what
  the diff claims to be).

## Scope fence

- In scope: the diff's conformance to documented conventions and accepted
  decisions. The diff spans: `index.ts`, `lib/backlog.mjs`,
  `lib/templates.mjs`, `cdd/rules.md`, `cdd/backlog.md` (data: premise
  backfills, header conventions line, two done-resolves, one minted item),
  `skills/cdd-backlog-triage/SKILL.md`, `tests/tools.mjs`,
  `tests/smoke.mjs`, `tests/acceptance/backlog-op.test.js`, and the new
  `tests/acceptance/backlog-revalidate.test.js`.
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
   Duplicated Code, Feature Envy, Data Clumps, Primitive Obsession,
   Repeated Switches, Shotgun Surgery, Divergent Change, Speculative
   Generality, Message Chains, Middle Man, Refused Bequest): new instances
   are findings; pre-existing ones are not; a documented repo standard
   overrides the baseline; tooling-enforced items are skipped.
4. **Guard/validator alignment** — the code agrees with what the
   deterministic doors expect (`cdd/scripts/spec-drift.mjs`,
   `lib/validate.mjs`, CI): changes that weaken, bypass, or blind a door
   (the guard, validators, CI) are findings, and so is silent divergence —
   e.g. law text that no longer renders byte-identically from its single
   source; a red door is a fact, not an obstacle.

## Findings grammar (advisory — no fixes, no verdicts)

Each finding: severity `blocker` | `should` | `note`, the finding, evidence
(path:line). You report every finding with disposition `open`; the author
later sets `fixed:` or `won't-fix:` when disposing.
Never red/green verdicts; gate authority stays with the deterministic
validators and the human.

## Output

Write your findings to
`cdd/changes/backlog-revalidate/reviews/r3-standards-code-review.md`
(output path per `reviewPoint("R3").findingsStandards` in `lib/loop-law.mjs`
— the standards-axis file; you write only this file, never the spec
axis's). Header records your reviewer form (cold sub-agent /
same-session re-read) and your model family vs. the author's.
