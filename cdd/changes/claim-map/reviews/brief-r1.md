# R1 proposal review — claim-map

## Change identity

- Change: `cdd/changes/claim-map/`
- Artifact under review: `cdd/changes/claim-map/proposal.md` + `cdd/changes/claim-map/design.md` (the design gate answered T2 YES, so a design.md exists and is part of the review object); a delta scaffold (`cdd/changes/claim-map/specs/claim/spec.md`) exists on disk but is an unfilled template — **out of R1 scope** (R2 reviews the package); tasks.md §2.1's design-gate record is the one tasks read input
- Review point: R1 (proposal), fired because the design gate answered T1 and T2 YES

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the paths below, from disk at the pinned state. Loop law rule 2b — the reviewer is not the author of the artifacts under review.
- Your model family must differ from the author's model family (family = same provider or model lineage). The brief states the author's family (`zai` / `glm-5.3`), never yours as settled fact. If you cannot establish that the families differ, say so in your findings header and stop.

## Inputs (paths, pinned state)

- Repository: the working tree is **uncommitted** on branch `claim-map`, HEAD `0bd33cdc81521e6e299a8c8eeafe0dc6eacb0583` (= main) — state that in your findings header.
- `cdd/changes/claim-map/proposal.md` — the artifact under review.
- `cdd/changes/claim-map/design.md` — part of the review object (design gate produced one).
- `cdd/specs/` — living spec inventory (capability mapping, reuse).
- `cdd/archive/` — merged changes, for reuse-first honesty (esp. `20261024-spec-model`, `20261024-guard-pure-checks`, `20261024-adr-ops`).
- `cdd/rules.md` — the loop law (proposal shape, Done-When/Code: lines).
- `cdd/changes/claim-map/tasks.md` §2.1 — the design-gate record (T1–T5 answers), which MUST-DELIVER 1 reads; the rest of tasks.md is out of scope at R1.
- `cdd/decisions/` — ADRs the proposal cites (ADR-0007; the proposal plans a new ADR-0013).
- `lib/adr-ops.mjs`, `scripts/spec-drift.mjs`, `scripts/adr-index.mjs`, `scripts/grammar-law.mjs` — the code the proposal describes, for premise honesty.

## Scope fence

- In scope: the proposal as an artifact — its Why, What Changes, Done-When lines, Code: globs, capability claims, reuse-first honesty, design-gate credibility — and design.md's four-section contract (rule 2c): Level, Diagram, Boundaries, Alternatives, exactly one kind-carrying mermaid flowchart in flowchart syntax, no free-form sections.
- Out of scope: the delta scaffold (`cdd/changes/claim-map/specs/claim/spec.md` — R2's object, not R1's) and the tasks §3 lines; reading tasks.md §2.1's design-gate record is the one exception (MUST-DELIVER 1). Also out of scope: proposing redesigns, any fix. You report findings; you do not edit files.

## MUST-DELIVER checklist (the charter)

1. **Design-gate answers credible** — the T1–T5 record in `tasks.md` §2.1: each answer's claim checks out against the proposal's actual reach; "all NO" on a proposal that touches multiple surfaces/capabilities is a finding.
2. **Reuse-first actually searched** — the proposal names what it reuses (existing modules, archived changes, platform features) and the search is plausible against `cdd/specs/` and `cdd/archive/`; a from-scratch build of something the store already has is a finding.
3. **Every Done-When verifiable as written** — each line names an observable check (command, file, pin), not an activity or a feeling.
4. **Scope fence sane** — Non-Goals and Solutions Considered actually fence the work; nothing in What Changes is unsponsored by a Done-When.
5. **Capability mapping right** — the capabilities named exist in `cdd/specs/`, the change maps to the capability that owns the behavior it changes, and the proposal carries the required Capabilities section recording that mapping.
6. **Premise honesty** — the Why's factual claims about lib/adr-ops.mjs and scripts/spec-drift.mjs (private derivations, 8 re-derivation sites) check out against the code on disk.

## Findings grammar (advisory — no fixes, no verdicts)

Each finding: severity `blocker` | `should` | `note`, the finding, evidence (path:line). You report every finding with disposition `open`; the author later sets `fixed:` or `won't-fix:` when disposing.
Never red/green verdicts; gate authority stays with the deterministic validators and the human.

## Output

Write your findings to `cdd/changes/claim-map/reviews/r1-proposal-review.md`
(output path per `reviewPoint("R1").findings` in `lib/loop-law.mjs`). Header
records your reviewer form (cold sub-agent / same-session re-read) and your
model family vs. the author's. End your run with a one-line summary of
blocker/should/note counts as your final message.
