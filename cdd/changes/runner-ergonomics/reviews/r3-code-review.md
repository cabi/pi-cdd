# R3 code review — runner-ergonomics (two-axis, cold)

Reviewer-independence: both axes ran as cold sub-agent sessions (rule 2b) — fresh sessions, briefs from disk, read-time state pinned (staged diff vs 9df6c73 on branch `ergonomics`, whole change staged and uncommitted). Models: opencode-zen/deepseek-v4-pro for both. Findings aggregated verbatim-lightly-cleaned under the two headings; no reranking across axes.

## Standards

No hard documented-standard breaches. Judgement calls:

- **should — Duplicated Code** (`scripts/spec-drift.mjs`): the L2-hint block re-implemented the A1 citation block's "map open change → files its delta Code: globs claim" loop. Disposition: fixed — extracted `filesClaimedByChange(files)`, used by both A1 and the hint (the proposal's "reuses the codeGlobs machinery" claim now holds for the loop too, not just the data).
- **note — Duplicated Code** (`lib/validate.mjs`, `scripts/grammar-law.mjs`): the import.meta.url direct-execution guard appears twice. Disposition: won't-fix: grammar-law is deliberately import-free (door scripts travel standalone; it is the law source validate imports FROM — a helper export would invert that dependency), and the guard is six lines; a shared helper would couple a law source to a library for no behavioral gain.
- **note — dead data** (`scripts/spec-drift.mjs`): `l2StaleFiles` stored `{file, cap}` with `cap` unread; `openOwners` accumulated an unread Set. Disposition: fixed — `l2StaleFiles` is now the file list; the claim Sets are consumed for the honest count.
- **note — Divergent Change** (`scripts/spec-drift.mjs`, `lib/validate.mjs` each edited for two traps). Disposition: won't-fix: the five traps are one scoped ergonomics batch; tasks.md carries the law's `split-considered:` annotation recording exactly this.
- **note — test-harness boilerplate** consistent with repo convention. Disposition: no action needed.

## Spec

No blockers, no should findings. Pin honesty verified for all 19 scenarios (every pin opens a test that goes red on that scenario's regression); mirroring claims confirmed by cmp; no unsponsored behavior; Non-Goals hold.

- **note — hint message overstates the explained count** (`scripts/spec-drift.mjs`): the line printed `l2StaleFiles.length` (all staleness L2s) but only the delta-claimed subset is explained. Disposition: fixed — the line now counts the matched files (`claimed`), so an unmatched L2 is never called expected.
- **note — requirement wording broader than implementation** (delta "Guard hints expected L2 red…"): text said "L2 findings" while the (correct) implementation fires only for staleness L2. Disposition: fixed — delta requirement now names the staleness form explicitly; the narrower behavior is unambiguously sponsored.

Summary: Standards 5 findings (1 should, 4 notes; worst: duplicated matching loop — fixed). Spec 2 findings (2 notes; worst: overstated hint count — fixed). All blockers: none.
