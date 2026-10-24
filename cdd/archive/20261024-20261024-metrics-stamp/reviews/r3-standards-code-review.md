# R3 standards-axis review — 20261024-metrics-stamp

- Reviewer: cold sub-agent; model `gpt-6-luna` (`PI_PROVIDER=opencode-zen`); family: OpenAI GPT lineage, different from the author's zai / glm lineage.
- Repository: `/home/carsten/Projects/pi-extensions/pi-cdd`
- Pinned comparison: base `0d63d308151d9cd44afd08caef3911b695a1f777`..head `93f85720c653927e2a722d2d02dd857e9ee0f693`; inspected `git diff 0d63d30...HEAD`.
- Scope: committed comparison only (12 changed files). Staged: none. Unstaged: none. Untracked inputs: `reviews/brief-r3-standards.md` and `reviews/brief-r3-spec.md`; neither is part of the comparison. The requested findings file is output, not review input.

|severity|finding|evidence|disposition|
|---|---|---|---|
|should|**R3S-F001 — Remove corpus-routing and scenario-heading comments.** Trace-backed against ADR-0012. Preconditions: the added comments in the cited source/test files. Actual: `lib/metrics.mjs:31` describes formats as what “the corpus actually contains,” `tests/acceptance/archive-metrics-stamp.test.js:140-141` routes readers to the phase-0 research corpus, and `tests/acceptance/archive-metrics-stamp.test.js:279-371` adds prose scenario headings around M1–M7. The test header at `tests/acceptance/archive-metrics-stamp.test.js:2-8` also maintains a fixture inventory and records RED history. Expected: comments describe only code shape, contract, algorithm reading order, or observed caller behavior; test-local check IDs may remain, but scenario-heading prose and corpus pointers do not. Impact: these comments duplicate/reroute information owned by the corpus and breach the accepted comment standard. Smallest safe fix: remove the corpus/history and test scenario-heading prose, retaining only comments needed to explain local algorithm shape.|fixed: banners reduced to bare `// --- M# ---` markers, header trimmed to the fixture inventory (RED-history sentence dropped), both corpus pointers reworded to shape-only ("one findings-layout fixture per counted row shape", "the counted row shapes"); check() name strings kept as test-local check ids/failure output (no spec-heading citation); pins re-run 7 passed / 0 failed|

## Coverage and verification

- Read `cdd/rules.md`, `README.md` conventions/layout, `skills/cdd-code-review/SKILL.md`, and applicable ADRs `cdd/decisions/0003-plain-markdown-store.md`, `cdd/decisions/0007-the-law-behind-every-door.md`, and `cdd/decisions/0012-comments-are-shape-only.md`.
- Inspected the full pinned diff and commit list; traced archive paths against validator/guard handling. `git diff --check 0d63d30...HEAD` produced no output. No tests or builds were run.

## Counts: blocker 0, should 1, note 0
VERDICT: PROCEED
