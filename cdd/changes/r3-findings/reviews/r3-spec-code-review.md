# R3 spec-axis code review — r3-findings

## Reviewer form
Cold sub-agent session (fresh, not the author's session). Model family: **opencode-zen** (nemotron-3-ultra-free) vs author family **zai** (glm-5.3) — families differ.

## Pinned state
Entire change is uncommitted working tree at `git diff 2c34772` (no commits on branch r3-findings). Untracked files: `tests/acceptance/r3-findings.test.js` and `cdd/changes/r3-findings/**`. All reads from disk at this state.

## Findings

### note — Proposal Code: globs omit two modified files
**Evidence:** `cdd/changes/r3-findings/proposal.md:52` lists implementation surface globs but does not include `cdd/decisions/0008-model-run-reviews-are-advisory-findings.md`, `cdd/decisions/0009-single-source-the-loop-law.md`, `cdd/decisions/0010-reviewer-independence-is-loop-law.md` (all three modified with Reconfirmed-by paragraphs per task 3.8), nor `tests/acceptance/loop-law-hardening.test.js` (modified per task 3.7 test-contract migration). The spec's delta (`cdd/changes/r3-findings/specs/gherkin/spec.md:223`) also conservatively listed `lib/context.mjs` and `lib/help.mjs` which derive from the single source and needed no independent edits.
**Disposition:** fixed: proposal.md's Code: line now also lists `cdd/decisions/0008-*.md`, `cdd/decisions/0009-*.md`, `cdd/decisions/0010-*.md` (task 3.8 reconfirms) and `tests/acceptance/loop-law-hardening.test.js` (task 3.7 LLH6 migration) — disposer: author session, 2026-10-23.

### note — Spec delta Code: line lists files not actually modified
**Evidence:** `cdd/changes/r3-findings/specs/gherkin/spec.md:223` Code: line includes `lib/context.mjs` and `lib/help.mjs`; `git status` and the diff show no changes to these files. They render ambient/help from `lib/loop-law.mjs` (the single source) so no independent edits were required.
**Disposition:** won't-fix: the delta's MODIFIED requirements restate the living spec's union Code: lines (the convention R2's F2 finding locked in); `Code:` declares which files a requirement OWNS, not which files this change's diff touches — `lib/context.mjs` and `lib/help.mjs` render from the single source `lib/loop-law.mjs`, still match their globs, and guard L2 fires only when no tracked file matches a glob. Removing them would narrow the living spec's coverage at archive and undo the R2 fix.

## Summary
2 findings total (both `note`), 0 `should`, 0 `blocker`. Worst issue: `note` — proposal Code: globs incomplete vs actual modified files.