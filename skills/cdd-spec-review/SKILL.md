---
name: cdd-spec-review
description: "Model-run review of cdd authoring artifacts — proposal, spec delta, tasks — for cross-artifact coherence before expensive work starts. Two modes: proposal (after the proposal is drafted, when the design gate answered T1 or T2 YES) and package (at draft-green, before the first implementation task). Checks the Done-When → requirement → task chain, delta↔living-spec fit, reuse-first honesty, design-gate credibility, verify-by realism. Use in projects with a cdd/ store when a review point fires or the user asks to review a change's artifacts."
---

Advisory review of cdd authoring artifacts. It produces **findings, never verdicts**: the deterministic doors (`cdd validate`, the drift guard, CI) decide green/red, and the human keeps the close button. A review cannot block a door — but loop law says every blocker finding is disposed before the next loop step begins.
Reviewer briefs live next to this skill: `brief-r1.md` (proposal mode) and `brief-r2.md` (package mode) — instantiate the matching template for the cold reviewer session (rule 2b).

The failure mode this skill exists for: three well-formed artifacts about three different things. `cdd validate` checks each artifact's shape; it cannot see that the proposal describes a car, the delta a garden, the tasks a rocket. A cold reviewer can.

## When a review fires

| Mode | Point | Trigger |
|---|---|---|
| **proposal** (R1) | after `proposal.md` is drafted, before the delta | only when the design-gate triage answered **T1 (cross-cutting) or T2 (architecture bet) = YES** |
| **package** (R2) | at draft-green, before the first implementation task is worked | always |

## Process

1. **Locate the change.** The name the caller passed, or — with several open changes — ask. All artifacts are read **from disk**; never review from the author's summary or the conversation's memory of drafting.
2. **Run cold — loop law rule 2b.** The reviewer-independence requirement is the law's; this skill carries only the procedure. Spawn a cold sub-agent: a fresh session whose prompt contains only the mode's charter below, the change's paths, and the instruction to read them — briefed from paths on disk, never curated content, nothing pasted or pre-summarized by the author. The same-session re-read is the lawful but weaker fallback, for when no sub-agent mechanism exists: run the review as a separate pass, re-reading every listed file from disk and deliberately ignoring everything remembered about writing them, and record the fallback and its justification in the findings file header.
3. **Read**, per mode:
   - *proposal*: `cdd/changes/<name>/proposal.md`, plus `cdd/specs/` (capability inventory) and `cdd/changes/` (work in flight).
   - *package*: `proposal.md`, `tasks.md`, every `specs/*/spec.md` delta, every touched `cdd/specs/<capability>/spec.md` living spec, and `cdd/rules.md`.
4. **Report findings** with the shared grammar, and write them to `cdd/changes/<name>/reviews/r1-proposal-review.md` or `r2-change-review.md`.
5. **Proceed rule.** Before drafting the delta (R1) or working task 3.2 (R2): every `blocker` carries a disposition other than `open`. The author may fix or argue (`won't-fix: <reason>`); a blocker that changes scope goes back to the human gate, not the reviewer.

## Charter — proposal mode (R1)

- **Why**: names who hurts and how; a solution stated as a problem is a blocker.
- **What Changes**: specific behavior changes; breaking changes marked.
- **Reuse-first honesty**: every capability names existing solutions evaluated (libraries, platform features, deps already in the tree, existing specs); "none found" says where was searched. A capability with zero evaluation and no search is a blocker.
- **Non-Goals**: a real fence — at least one tempting adjacent feature named, not a placeholder.
- **Done-When**: ≤ 5, each an observable check (a command that exits 0, an artifact that exists, a behavior observed) — never an activity. An unobservable criterion is a blocker; the tasks cannot trace to a wish.
- **Capabilities**: no open change already claims the same behavior or files (parallel changes on one capability collide at archive); genuine follow-ups record `Depends on:`.
- **Code: globs**: name an implementation surface that exists (or is genuinely being created).

## Charter — package mode (R2)

The chain, both directions:

- **Coverage (no gaps)**: every `Done-When:` criterion has ≥ 1 requirement in the delta AND ≥ 1 task in the traceability table. A criterion with a requirement but no task, or a task but no requirement, is a blocker.
- **Sponsorship (no orphans)**: no requirement exists that no Done-When needs; no task exists that no requirement or criterion needs; nothing implemented early that the proposal's Non-Goals fence explicitly rejects. Orphans are blockers (scope creep).
- **Same change**: proposal, delta, and tasks describe the same thing. Requirement names, scenario language, and task phrasing must be recognizably about one change; a topical mismatch anywhere in the chain is a blocker — this is the car/garden/rocket check.

Delta ↔ living spec:

- A MODIFIED block restates **every** scenario the living requirement already has, plus changes; silently dropping an existing scenario is a blocker.
- ADDED requirements do not already live in the spec; MODIFIED/REMOVED requirements do.
- REMOVED carries `Reason:` and, when users are affected, a migration note.

Honesty checks:

- **Design gate**: the T1–T5 answers in tasks §2 are credible against the actual proposal — an obviously cross-cutting change answered "all NO" is a blocker; a YES with no short design above it is a blocker.
- **Reuse-first**: as in proposal mode, judged against the delta's capabilities.
- **Split honesty**: > 8 implementation subtasks needs a split decision or a credible `split-considered:` line.

Quality checks (advisory, severity `should` unless ambiguity breaks verification):

- Every Done-When and every `Then` step is observable as written; comparatives carry numbers/units (the C2 rule).
- Every task's `verify by` names a check that can actually run; scenario pins point at plausible test paths.
- Tasks are phrased as interfaces established, ordered by dependency, each finishable in one session.

## Findings grammar

```markdown
# <rN>-<kind>-review — <change> — <date> — reviewer: cold sub-agent | same-session re-read — <justification if fallback>

| severity | finding | evidence | disposition |
|---|---|---|---|
| blocker | Done-When "CSV export" has no task | tasks.md traceability table | fixed: task 3.4 added |
| should | "fast" without a unit (C2) | specs/export/spec.md, Requirement: export speed | open |
| note | … | … | won't-fix: <reason> |
```

Severity: `blocker` (unsound to proceed), `should` (dispose or consciously carry), `note` (recorded, no action demanded). Evidence cites file and requirement/section — never "somewhere in the delta". Dispositions live in this file; when the author resolves later, they edit the row, not the report.
