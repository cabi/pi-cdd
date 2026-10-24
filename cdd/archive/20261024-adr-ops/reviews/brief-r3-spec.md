# R3 spec-axis review — adr-ops

## Change identity

- Change: `cdd/changes/adr-ops/`
- Artifact under review: the implementation diff — **an uncommitted working tree** at the single-feature-commit stage: run `git diff ecbdafe -- <paths>` plus reads of untracked files (`git status --short` lists them; notably `scripts/adr-index.mjs`, `lib/adr-ops.mjs` are new/untracked). Base (fixed point): `ecbdafe` on branch `adr-ops`.
- Review point: R3 (code review), before archive; this brief covers the **Spec axis only** — the Standards axis runs in its own separate session with its own brief (`brief-r3-standards.md`).

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the paths and diff below, from disk at the pinned state. Loop law rule 2b — the reviewer is not the author of the artifacts under review.
- Your model family must differ from the author's model family (family = same provider or model lineage). The author's family is **zai** (glm-5.3). Verify your own family from your runtime environment (e.g. `PI_PROVIDER`) — the brief states the author's family, never yours as settled fact. If you cannot establish that the families differ, say so in your findings header and stop.
- You review ONE axis: Spec. Do not evaluate standards conformance here; the other axis has its own session so neither frames the other.

## Inputs (paths, pinned state)

- Diff command: `git diff ecbdafe` (working tree vs base, tracked files) plus untracked-file reads for `git status --short` entries (`scripts/adr-index.mjs`, `lib/adr-ops.mjs`, the new acceptance suites, the change folder).
- Commit list: `git log ecbdafe..HEAD --oneline` (expected empty — the whole change is the staged/unstaged working tree plus index).
- `cdd/changes/adr-ops/specs/<capability>/spec.md` — every delta (the scenarios the diff must implement): `specs/adr/spec.md`, `specs/extension/spec.md`, `specs/gherkin/spec.md`.
- `cdd/changes/adr-ops/proposal.md` — Done-When lines and the `Code:` implementation surface.
- `cdd/changes/adr-ops/tasks.md` — what was ticked, with verify-bys.
- `tests/acceptance/` — the pin files the scenarios name.

## Scope fence

- In scope: whether the diff implements the change's delta — every requirement, every scenario, nothing unsponsored — and whether the pins actually pin.
- Out of scope: conventions and ADR conformance (Standards axis, separate session), proposing redesigns, any fix. You report findings; you do not edit files.

## MUST-DELIVER checklist (the charter)

1. **Every scenario implemented** — each delta scenario's observable outcome is produced by the diffed code; a scenario whose THEN is not traceable to a code change is a finding.
2. **Pins actually pin** — each `# Verified by:` acceptance test exercises the pinned behavior such that it would FAIL if the scenario regressed (mutate the behavior in thought or in a scratch run; a pin that stays green through a regression is a finding — a copied-fragment or sandbox-only pin does not count).
3. **No unsponsored code** — every hunk in the diff serves a delta requirement or a ticked task's verify-by; code no scenario or task sponsors is a finding (dead code, speculative hooks, drive-by refactors).

## Findings grammar (advisory — no fixes, no verdicts)

Each finding: severity `blocker` | `should` | `note`, the finding, evidence (path:line). You report every finding with disposition `open`; the author later sets `fixed:` or `won't-fix:` when disposing.
Never red/green verdicts; gate authority stays with the deterministic validators and the human.

## Output

Write your findings to `cdd/changes/adr-ops/reviews/r3-spec-code-review.md`
(output path per `reviewPoint("R3").findingsSpec` in `lib/loop-law.mjs` — the spec-axis file; you write only this file, never the standards axis's). Header records your reviewer form (cold sub-agent / same-session re-read) and your model family vs. the author's.
