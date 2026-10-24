# R1 proposal review — guard-pure-checks

## Change identity

- Change: `cdd/changes/guard-pure-checks/`
- Artifact under review: `cdd/changes/guard-pure-checks/proposal.md` + `cdd/changes/guard-pure-checks/design.md` (the design gate answered T2 and T4 YES, so a design.md exists and is part of the review object); a delta draft (`cdd/changes/guard-pure-checks/specs/gherkin/spec.md`) and tasks §3 exist on disk but are **out of R1 scope** (R2 reviews the package); tasks.md §2.1's design-gate record is the one tasks read input
- Review point: R1 (proposal), fired because the design gate answered T1/T2 YES (T2 here)

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the paths below, from disk at the pinned state. Loop law rule 2b — the reviewer is not the author of the artifacts under review.
- Your model family must differ from the author's model family (family = same provider or model lineage). Verify your own family from your runtime environment (e.g. `PI_PROVIDER`/`PI_MODEL` or your harness equivalent) — the brief states the author's family (`zai` / `glm-5.3`), never yours as settled fact. If you cannot establish that the families differ, say so in your findings header and stop.

## Inputs (paths, pinned state)

- Repository: the working tree is **uncommitted** on branch `guard-pure-checks`, HEAD `3f484a5b549d7f2460f2d30a1183ebc127736517` (main tip, the branch point) — state that in your findings header.
- `cdd/changes/guard-pure-checks/proposal.md` — the artifact under review.
- `cdd/changes/guard-pure-checks/design.md` — part of the review object (design gate produced one).
- `cdd/specs/` — living spec inventory (capability mapping, reuse).
- `cdd/archive/` — merged changes, for reuse-first honesty (esp. `20261024-spec-model`, run 1 of this sequence).
- `cdd/rules.md` — the loop law (proposal shape, Done-When/Code: lines, rule 2c design shape).
- `cdd/changes/guard-pure-checks/tasks.md` §2.1 — the design-gate record (T1–T5 answers), which MUST-DELIVER 1 reads; the rest of tasks.md is out of scope at R1.
- `cdd/decisions/` — ADRs (the change claims none drafted).
- `scripts/spec-drift.mjs`, `tests/smoke.mjs` — the code the proposal describes (evidence for the Why's divergence claims).

## Scope fence

- In scope: the proposal as an artifact — its Why, What Changes, Done-When lines, Code: globs, capability claims, reuse-first honesty, design-gate credibility — and design.md's four-section contract (rule 2c): exactly one kind-carrying mermaid flowchart, one boundary line per diagram box, no free-form sections.
- Out of scope: the delta draft (`cdd/changes/guard-pure-checks/specs/gherkin/spec.md` — R2's object, not R1's) and the tasks §3 lines; reading tasks.md §2.1's design-gate record is the one exception (MUST-DELIVER 1). Also out of scope: proposing redesigns, any fix. You report findings; you do not edit files.

## MUST-DELIVER checklist (the charter)

1. **Design-gate answers credible** — the T1–T5 record in `tasks.md` §2.1: each answer's claim checks out against the proposal's actual reach; an answer that understates or overstates the change's reach is a finding.
2. **Reuse-first actually searched** — the proposal names what it reuses (existing modules, archived changes, platform features) and the search is plausible against `cdd/specs/` and `cdd/archive/`; a from-scratch build of something the store already has is a finding.
3. **Every Done-When verifiable as written** — each line names an observable check (command, file, pin), not an activity or a feeling.
4. **Scope fence sane** — Non-Goals and Solutions Considered actually fence the work; nothing in What Changes is unsponsored by a Done-When; the mission fence (no new door script, DOOR_SCRIPTS stays 5, parse home stays grammar-law, LAW_VERSION stays 2, byte-identical observable output) is honored by the artifact.
5. **Capability mapping right** — the capability named exists in `cdd/specs/`, the change maps to the capability that owns the behavior it changes, and the proposal carries the required Capabilities section recording that mapping.

## Findings grammar (advisory — no fixes, no verdicts)

Each finding: severity `blocker` | `should` | `note`, the finding, evidence (path:line). You report every finding with disposition `open`; the author later sets `fixed:` or `won't-fix:` when disposing.
Never red/green verdicts; gate authority stays with the deterministic validators and the human.

## Output

Write your findings to `cdd/changes/guard-pure-checks/reviews/r1-proposal-review.md`
(output path per `reviewPoint("R1").findings` in `lib/loop-law.mjs`). Header
records your reviewer form (cold sub-agent / same-session re-read) and your
model family vs. the author's.
