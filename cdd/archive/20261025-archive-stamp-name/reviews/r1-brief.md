# R1 proposal review — 20261025-archive-stamp-name

## Change identity

- Change: `cdd/changes/20261025-archive-stamp-name/`
- Artifact under review: `cdd/changes/20261025-archive-stamp-name/proposal.md` + `cdd/changes/20261025-archive-stamp-name/design.md` (the design gate answered T2 YES, so a design.md exists — rule 2c) — the delta does not exist yet; tasks.md exists only for its §2.1 design-gate record, a read input
- Review point: R1 (proposal), fired because the design gate answered T2 YES

## Independence record

The author ran as zai/glm-5.3 (family zai, from PI_MODEL). Any reviewer outside
the zai family (family = same provider or model lineage) satisfies rule 2b's
family-difference requirement — record your own actual model + family in the
findings header from your runtime metadata. If you cannot establish that the
families differ, say so in your findings header and stop.

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the
  paths below, from disk at the pinned state. Loop law rule 2b — the reviewer
  is not the author of the artifacts under review.
- Skill: run `cdd-spec-review` in **proposal mode** (its SKILL.md lives at
  /home/carsten/Projects/pi-extensions/pi-cdd/skills/cdd-spec-review/SKILL.md — read it first).
- Mid-change state note: the change folder is uncommitted work on top of the
  pinned commit — that is normal; the delta spec (specs/gherkin/spec.md) and
  tasks §3 still hold scaffold placeholders because R1 fires before they are
  drafted — out of scope for this review.
- Defect context: the backlog item this change fixes is PF-39 in
  cdd/backlog.md (line 45).

## Inputs (paths, pinned state)

- Repository at commit 5667775c2efb86bf42b6ed9b76b4436f134caadb (working tree
  if the change is uncommitted — state that in your findings header).
- `cdd/changes/20261025-archive-stamp-name/proposal.md` — the artifact under review.
- `cdd/changes/20261025-archive-stamp-name/design.md` — part of the review object (T2 YES produced it).
- `cdd/specs/` — living spec inventory (capability mapping, reuse).
- `cdd/archive/` — merged changes, for reuse-first honesty.
- `cdd/rules.md` — the loop law (proposal shape, Done-When/Code: lines).
- `cdd/changes/20261025-archive-stamp-name/tasks.md` §2.1 — the design-gate record (T1–T5
  answers), which MUST-DELIVER 1 reads; the rest of tasks.md is out of scope.
- `cdd/decisions/` — ADRs the proposal cites (amend/reconfirm claims).

## Scope fence

- In scope: the proposal as an artifact — its Why, What Changes, Done-When
  lines, Code: globs, capability claims, reuse-first honesty, design-gate
  credibility — and design.md's four-section contract (rule 2c): exactly one
  kind-carrying mermaid flowchart, no free-form sections.
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

Write your findings to `cdd/changes/20261025-archive-stamp-name/reviews/r1-proposal-review.md`
(output path per `reviewPoint("R1").findings` in `lib/loop-law.mjs`). Header
records your reviewer form (cold sub-agent / same-session re-read) and your
model family vs. the author's. End with one line: VERDICT: PROCEED or
VERDICT: HOLD (HOLD only if an open blocker exists).
