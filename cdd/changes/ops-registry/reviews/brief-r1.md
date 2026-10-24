# R1 proposal review — ops-registry

## Change identity

- Change: `cdd/changes/ops-registry/`
- Artifact under review: `cdd/changes/ops-registry/proposal.md` + `cdd/changes/ops-registry/design.md` (the design gate answered T4 YES — invariant risk — so a design.md exists per rule 2c and is part of the review object); the review point fires because the gate answered T1 YES (cross-cutting: extension + gherkin deltas); the delta scaffolds under `cdd/changes/ops-registry/specs/` are unfilled templates — **out of R1 scope** (R2 reviews the package); `cdd/changes/ops-registry/tasks.md` §2.1's design-gate record is the one tasks read input
- Review point: R1 (proposal), fired because the design gate answered T1 YES

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the paths below, from disk at the pinned state. Loop law rule 2b — the reviewer is not the author of the artifacts under review.
- Your model family must differ from the author's model family (family = same provider or model lineage). The brief states the author's family (`zai` / `glm-5.3`), never yours as settled fact. If you cannot establish that the families differ, say so in your findings header and stop.

## Inputs (paths, pinned state)

- Repository: the working tree is **uncommitted** on branch `ops-registry`, HEAD `4afb08b` (= main) — state that in your findings header.
- `cdd/changes/ops-registry/proposal.md` — the artifact under review.
- `cdd/changes/ops-registry/design.md` — part of the review object (design gate produced one: T4 YES).
- `cdd/specs/extension/spec.md`, `cdd/specs/gherkin/spec.md` — living spec inventory (capability mapping, reuse, claim topology: note which requirements' Code lines claim lib/help.mjs, tests/smoke.mjs, index.ts, tests/tools.mjs).
- `cdd/archive/` — merged changes, for reuse-first honesty (esp. `20261022-backlog-op` — the two-delta precedent the proposal cites — and `20261024-claim-map`).
- `cdd/rules.md` — the loop law (proposal shape, Done-When/Code: lines, rule 2a review points).
- `cdd/changes/ops-registry/tasks.md` §2.1 — the design-gate record (T1–T5 answers), which MUST-DELIVER 1 reads; the rest of tasks.md is out of scope at R1.
- `cdd/decisions/` — ADRs the proposal cites (0002, 0007, 0009, 0012).
- `index.ts`, `lib/help.mjs`, `tests/smoke.mjs`, `tests/tools.mjs`, `scripts/spec-drift.mjs` (checkL2/checkO) — the code the proposal describes, for premise honesty.

## Scope fence

- In scope: the proposal as an artifact — its Why, What Changes, Done-When lines, Code: globs, capability claims, reuse-first honesty, design-gate credibility — and design.md's four-section contract (rule 2c): Level, Diagram, Boundaries, Alternatives, exactly one kind-carrying mermaid flowchart in flowchart syntax, no free-form sections.
- Out of scope: the delta scaffolds (`cdd/changes/ops-registry/specs/*/spec.md` — R2's object) and the tasks §3 lines; reading tasks.md §2.1's design-gate record is the one exception (MUST-DELIVER 1). Also out of scope: proposing redesigns, any fix. You report findings; you do not edit files.

## MUST-DELIVER checklist (the charter)

1. **Design-gate answers credible** — the T1–T5 record in `tasks.md` §2.1: each answer's claim checks out against the proposal's actual reach; in particular T1 YES (help.mjs/smoke.mjs are gherkin territory — verify against the living spec Code lines) and T4 YES (byte-preservation risk across four consumers).
2. **Reuse-first actually searched** — the proposal names what it reuses (ADR-0009's single-source shape, the claim-map home reasoning, the adr-index-agreement scan-pin pattern, the backlog-op two-delta precedent) and the search is plausible against `cdd/specs/` and `cdd/archive/`; a from-scratch build of something the store already has is a finding.
3. **Every Done-When verifiable as written** — each line names an observable check (command, file, pin), not an activity or a feeling.
4. **Scope fence sane** — Non-Goals and Solutions Considered actually fence the work; nothing in What Changes is unsponsored by a Done-When.
5. **Capability mapping right** — the capabilities named exist in `cdd/specs/`, the change maps to the capability that owns the behavior it changes (extension MODIFIED "Thin ops over a deep library"; gherkin ADDED for help.mjs/smoke.mjs travel), the proposal carries the required Capabilities section, and the claim split violates no guard law (checkO one-capability-per-file, checkL2 travel).
6. **Premise honesty** — the Why's factual claims about the drift (ghost /cdd-validate at lib/help.mjs:16; 7-of-9 ops row at lib/help.mjs:17; S21 needle at tests/smoke.mjs:333; the backlog premise whitelist drift in index.ts) check out against the code on disk at the pinned state.

## Findings grammar (advisory — no fixes, no verdicts)

Each finding: severity `blocker` | `should` | `note`, the finding, evidence (path:line). You report every finding with disposition `open`; the author later sets `fixed:` or `won't-fix:` when disposing.
Never red/green verdicts; gate authority stays with the deterministic validators and the human.

## Output

Write your findings to `cdd/changes/ops-registry/reviews/r1-proposal-review.md`
(output path per `reviewPoint("R1").findings` in `lib/loop-law.mjs`). Header
records your reviewer form (cold sub-agent / same-session re-read) and your
model family vs. the author's. End your run with a one-line summary of
blocker/should/note counts as your final message.
