<!--
INSTANTIATED — R1 proposal review brief for change `design-docs`.

BOOTSTRAP WRINKLE (recorded per the change's charter): the brief-r1.md
template on disk does not yet carry the design.md object line this change
ships — R1 fires for design-docs BEFORE the template edit lands. This brief
was therefore instantiated manually from the on-disk brief-r1.md PLUS the
new object line: the review object is proposal.md + design.md (the gate
produced one — T2 YES). R2's brief will instantiate from the edited
template.

Author family: zai (glm-5.3). Reviewer must be another family.
-->

# R1 proposal review — design-docs

## Change identity

- Change: `cdd/changes/design-docs/`
- Artifact under review: `cdd/changes/design-docs/proposal.md` + `cdd/changes/design-docs/design.md` (the gate produced a design.md — T2 YES; the proposal alone is NOT the whole object). The delta does not exist yet; tasks.md exists only for its §2.1 design-gate record, a read input.
- Review point: R1 (proposal), fired because the design gate answered T1 or T2 YES

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the
  paths below, from disk at the pinned state. Loop law rule 2b — the reviewer
  is not the author of the artifacts under review.
- Your model family must differ from the author's model family (family = same
  provider or model lineage). Verify your own family from your runtime
  environment (e.g. `PI_PROVIDER`) — the brief states the author's family,
  never yours as settled fact. If you cannot establish that the families
  differ, say so in your findings header and stop.
- Read-only: you report findings; you do not edit any file except your
  findings output.

## Inputs (paths, pinned state)

- Repository at commit `28423ec` on branch `design-docs` — the change
  artifacts themselves are new and uncommitted (working tree); state that in
  your findings header.
- `cdd/changes/design-docs/proposal.md` — artifact under review (with
  design.md, see above).
- `cdd/changes/design-docs/design.md` — artifact under review (the dogfood
  design document this change ships the template for).
- `cdd/specs/` — living spec inventory (capability mapping, reuse).
- `cdd/archive/` — merged changes, for reuse-first honesty.
- `cdd/rules.md` — the loop law (proposal shape, Done-When/Code: lines).
- `cdd/changes/design-docs/tasks.md` §2.1 — the design-gate record (T1–T5
  answers), which MUST-DELIVER 1 reads; the rest of tasks.md is out of scope.
- `cdd/decisions/` — ADRs the proposal cites (amend/reconfirm claims).

## Scope fence

- In scope: the proposal as an artifact — its Why, What Changes, Done-When
  lines, Code: globs, capability claims, reuse-first honesty, design-gate
  credibility — and design.md as part of the review object: its four-section
  contract (Level / Diagram / Boundaries / Alternatives), exactly one
  mermaid flowchart with kind-carrying node labels, and whether its level
  claim matches the stated risk.
- Out of scope: drafting the delta or tasks (reading tasks.md §2.1's design-gate record is the one exception — MUST-DELIVER 1), proposing redesigns, any fix.
  You report findings; you do not edit files.

## MUST-DELIVER checklist (the charter)

1. **Design-gate answers credible** — the T1–T5 record in `tasks.md` §2.1:
   each answer's claim checks out against the proposal's actual reach;
   "all NO" on a proposal that touches multiple surfaces/capabilities is a
   finding.
2. **Reuse-first actually searched** — the proposal names what it reuses
   (existing modules, archived changes, platform features) and the search is
   plausible against `cdd/specs/` and `cdd/archive/`; a from-scratch build
   of something the store already has is a finding.
3. **Every Done-When verifiable as written** — each line names an observable
   check (command, file, pin), not an activity or a feeling.
4. **Scope fence sane** — Non-Goals and Solutions Considered actually fence
   the work; nothing in What Changes is unsponsored by a Done-When.
5. **Capability mapping right** — the capabilities named exist in
   `cdd/specs/`, the change maps to the capability that owns the behavior it
   changes, and the proposal carries the required Capabilities section
   recording that mapping.

## Findings grammar (advisory — no fixes, no verdicts)

Each finding: severity `blocker` | `should` | `note`, the finding, evidence
(path:line). You report every finding with disposition `open`; the author
later sets `fixed:` or `won't-fix:` when disposing.
Never red/green verdicts; gate authority stays with the deterministic validators and the human.

## Output

Write your findings to `cdd/changes/design-docs/reviews/r1-proposal-review.md`
(output path per `reviewPoint("R1").findings` in `lib/loop-law.mjs`). Header
records your reviewer form (cold sub-agent / same-session re-read) and your
model family vs. the author's.
