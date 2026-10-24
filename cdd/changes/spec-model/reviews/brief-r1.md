# R1 proposal review — spec-model

## Change identity

- Change: `cdd/changes/spec-model/`
- Artifact under review: `cdd/changes/spec-model/proposal.md` + `cdd/changes/spec-model/design.md` (the design gate answered T2 YES, so a design.md exists and is part of the review object); a delta draft (`cdd/changes/spec-model/specs/gherkin/spec.md`) and tasks §3 exist on disk but are **out of R1 scope** (R2 reviews the package); tasks.md §2.1's design-gate record is the one tasks read input
- Review point: R1 (proposal), fired because the design gate answered T1 and T2 YES

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the paths below, from disk at the pinned state. Loop law rule 2b — the reviewer is not the author of the artifacts under review.
- Your model family must differ from the author's model family (family = same provider or model lineage). Verify your own family from your runtime environment (e.g. `PI_PROVIDER`) — the brief states the author's family (`zai` / `glm-5.3`), never yours as settled fact. If you cannot establish that the families differ, say so in your findings header and stop.

## Inputs (paths, pinned state)

- Repository: the working tree is **uncommitted** on branch `spec-model`, HEAD `bc4b867bc4c23b06406c519897d495dd531bcc29` (main) — state that in your findings header.
- `cdd/changes/spec-model/proposal.md` — the artifact under review.
- `cdd/changes/spec-model/design.md` — part of the review object (design gate produced one).
- `cdd/specs/` — living spec inventory (capability mapping, reuse).
- `cdd/archive/` — merged changes, for reuse-first honesty.
- `cdd/rules.md` — the loop law (proposal shape, Done-When/Code: lines).
- `cdd/changes/spec-model/tasks.md` §2.1 — the design-gate record (T1–T5 answers), which MUST-DELIVER 1 reads; the rest of tasks.md is out of scope at R1.
- `cdd/decisions/` — ADRs the proposal cites (amend/reconfirm claims).

## Scope fence

- In scope: the proposal as an artifact — its Why, What Changes, Done-When lines, Code: globs, capability claims, reuse-first honesty, design-gate credibility — and design.md's four-section contract (rule 2c): exactly one kind-carrying mermaid flowchart, no free-form sections.
- Out of scope: the delta draft (`cdd/changes/spec-model/specs/gherkin/spec.md` — R2's object, not R1's) and the tasks §3 lines; reading tasks.md §2.1's design-gate record is the one exception (MUST-DELIVER 1). Also out of scope: proposing redesigns, any fix. You report findings; you do not edit files.

## MUST-DELIVER checklist (the charter)

1. **Design-gate answers credible** — the T1–T5 record in `tasks.md` §2.1: each answer's claim checks out against the proposal's actual reach; "all NO" on a proposal that touches multiple surfaces/capabilities is a finding.
2. **Reuse-first actually searched** — the proposal names what it reuses (existing modules, archived changes, platform features) and the search is plausible against `cdd/specs/` and `cdd/archive/`; a from-scratch build of something the store already has is a finding.
3. **Every Done-When verifiable as written** — each line names an observable check (command, file, pin), not an activity or a feeling.
4. **Scope fence sane** — Non-Goals and Solutions Considered actually fence the work; nothing in What Changes is unsponsored by a Done-When.
5. **Capability mapping right** — the capabilities named exist in `cdd/specs/`, the change maps to the capability that owns the behavior it changes, and the proposal carries the required Capabilities section recording that mapping.

## Findings grammar (advisory — no fixes, no verdicts)

Each finding: severity `blocker` | `should` | `note`, the finding, evidence (path:line). You report every finding with disposition `open`; the author later sets `fixed:` or `won't-fix:` when disposing.
Never red/green verdicts; gate authority stays with the deterministic validators and the human.

## Output

Write your findings to `cdd/changes/spec-model/reviews/r1-proposal-review.md`
(output path per `reviewPoint("R1").findings` in `lib/loop-law.mjs`). Header
records your reviewer form (cold sub-agent / same-session re-read) and your
model family vs. the author's.
