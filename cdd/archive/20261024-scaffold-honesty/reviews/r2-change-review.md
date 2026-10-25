# R2 package review — 20261024-scaffold-honesty — 2026-10-24 — reviewer: cold sub-agent

- Reviewer model: `opencode-zen/gpt-6-luna`; its family differs from the author's stated `zai/glm-5.3` family.
- Pinned state: branch `scaffold-honesty`, HEAD `abb97d82288eb6cf26a4463db5f1861221fa1b51` (same as `main`). The commit endpoints are identical; this review covers the assigned uncommitted package, not a committed branch range.
- Working-tree scope at review start: no staged changes; unstaged `cdd/backlog.md` contains one appended PF-34 item and is excluded from the package review. Untracked package files: `cdd/changes/20261024-scaffold-honesty/proposal.md`, `specs/gherkin/spec.md`, `tasks.md`, `reviews/brief-r2.md`, and `reviews/mission-brief.md`. The proposal, delta, and tasks are the package artifacts; the two review briefs were context.
- Draft validation: direct read-only call to the validator API used by the `cdd validate` operation — `validateChange(process.cwd(), "20261024-scaffold-honesty", "draft")` — printed `PASS`. The `cdd` operation itself was not exposed as a shell command in this reviewer session.

| severity | finding | evidence | disposition |
|---|---|---|---|
| should | **Fresh-scaffold red behavior is re-pinned in the ADDED requirement.** The new scenario restates an existing living-spec contract, and is less precise than that contract's exact-three-errors assertion. | `cdd/changes/20261024-scaffold-honesty/specs/gherkin/spec.md:22-26` adds “The fresh scaffold still fails on its body placeholders.” `cdd/specs/gherkin/spec.md:191-195` already specifies that a fresh scaffold is draft-red on placeholders only, with exactly three errors, one per artifact. `tests/smoke.mjs:621-623` exercises that contract in S32 leg 1 through `validateChange`. | open — remove the duplicate scenario and its pin from the new requirement; retain the existing S32 leg-1 assertion as the regression contract. |

**Counts:** 0 blocker, 1 should, 0 note.

## Dispositions (author)

- should — **fixed**: the duplicate scenario "The fresh scaffold still fails on its body placeholders" (and its `# Verified by: tests/smoke.mjs` pin) was removed from the ADDED requirement in `specs/gherkin/spec.md`; the fresh-scaffold-red contract remains owned by the living spec (exactly-three-errors) and exercised by S32 leg 1. Delta req 1 now carries 3 scenarios.
