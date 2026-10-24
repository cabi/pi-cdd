<!--
TEMPLATE — R3 spec-axis review brief (skill cdd-code-review, Spec
axis). Instantiate by replacing every <placeholder>, then hand the result to a
cold reviewer session as its entire brief. Nothing else rides along — no
summaries, no pasted file contents. Loop law rule 2b: the reviewer is not the
author.

Instantiation checklist (author):
- <change-name>, the pinned diff base <fixed-point> and HEAD commit — pins
  exactly what diff the reviewer reads.
- TWO AXES = TWO SESSIONS: the Standards and Spec axes run as two separate
  cold sessions, each with its own brief (this one; the Standards axis gets
  brief-r3-standards.md). One session doing both axes leaks the first axis's
  framing into the second — do not merge them.
- Reviewer model family MUST differ from the author's (rule 2b author-family clause; same provider/model
  lineage = same family). No other-family reviewer available → stop and ask
  the human sponsor; never silently degrade.
-->

# R3 spec-axis review — director-skill

## Change identity

- Change: `cdd/changes/director-skill/`
- Artifact under review: the implementation diff `443f425...HEAD`
  (three-dot, merge-base) — the Spec axis of R3, run at Close
- Review point: R3 (code review), before archive; this brief covers the
  **Spec axis only** — the Standards axis runs in its own separate session
  with its own brief (`brief-r3-standards.md`)
- Repo state: working tree on branch `director-skill`, HEAD == `443f425` ==
  main, change uncommitted — the diff is `git diff 443f425 -- tests/smoke.mjs`
  (tracked) plus untracked reads of `skills/cdd-director/` and
  `cdd/changes/director-skill/`; state this in your findings header.

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the
  paths and diff below, from disk at the pinned state. Loop law rule 2b — the reviewer
  is not the author of the artifacts under review.
- The author's model family is **zai** (glm-5.3). Your model family must
  differ from the author's model family (family = same provider or model
  lineage). Verify your own family from your runtime environment (e.g.
  `PI_PROVIDER`) — if you cannot establish that the families differ, say so
  in your findings header and stop.
- You review ONE axis: Spec. Do not evaluate standards conformance here; the
  other axis has its own session so neither frames the other.

## Inputs (paths, pinned state)

- Diff command: `git diff 443f425 -- tests/smoke.mjs`, plus untracked-file
  reads of `skills/cdd-director/SKILL.md`,
  `skills/cdd-director/assets/mission-brief.md`, and the change folder under
  `cdd/changes/director-skill/` (the change is an uncommitted working tree)
- Commit list: `git log 443f425..HEAD --oneline` (empty — nothing committed
  yet; the pair-commit lands after this review)
- `cdd/changes/director-skill/specs/gherkin/spec.md` — every delta (the
  scenarios the diff must implement).
- `cdd/changes/director-skill/proposal.md` — Done-When lines and the `Code:`
  implementation surface.
- `cdd/changes/director-skill/tasks.md` — what was ticked, with verify-bys.
- `tests/acceptance/` — the pin files the scenarios name. Note: this
  capability's scenarios pin `tests/smoke.mjs` (the bundle's deterministic
  smoke suite) as their acceptance surface — judge the pins there.

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

Write your findings to `cdd/changes/director-skill/reviews/r3-spec-code-review.md`
(output path per `reviewPoint("R3").findingsSpec` in `lib/loop-law.mjs` — the
spec-axis file; you write only this file, never the standards axis's). Header records your reviewer form (cold sub-agent /
same-session re-read) and your model family vs. the author's.
