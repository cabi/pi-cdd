# R3 standards-axis code review — director-skill

## Reviewer form

- **Form:** cold sub-agent session (fresh session, briefed only from paths on disk — rule 2b).
- **Reviewer model family:** opencode-zen / deepseek-v4-pro (`PI_PROVIDER=opencode-zen`, `PI_MODEL=deepseek-v4-pro`).
- **Author model family:** zai / glm-5.3 (per the brief). Families differ — the rule 2b author-family clause is satisfied.
- **Repo state at review:** working tree on branch `director-skill`, `HEAD == 443f425 == main`, change uncommitted. Diff read as `git diff 443f425 -- tests/smoke.mjs` (tracked) plus untracked reads of `skills/cdd-director/` and `cdd/changes/director-skill/`. `git log 443f425..HEAD --oneline` is empty (nothing committed yet).
- **Doors at review:** `cdd validate strict` (director-skill) → PASS; `node cdd/scripts/spec-drift.mjs` → clean (5 specs, 30 acceptance test files, full scan); `node tests/smoke.mjs` → 37/37 passed. No door is red.

## Scope

Standards axis only: the diff's conformance to documented conventions and accepted decisions, plus the smell baseline. Spec compliance (scenario coverage, pin honesty) is the other axis's session.

## ADR-governed files

No accepted ADR's `code:` glob covers the diff's surface. The diff touches `skills/cdd-director/**` and `tests/smoke.mjs`; the nearest ADR globs (ADR-0010 `skills/cdd-spec-review/SKILL.md`, `skills/cdd-code-review/SKILL.md`, `skills/cdd-adr-review/SKILL.md`; ADR-0011 `tests/acceptance/loop-law-hardening.test.js`) do not name either path. No ADR violation.

## Findings

### note — Duplicated Code: frontmatter-validation block copy-pasted from S33/S37

The S38 check re-implements the same frontmatter-validation shape (name-matches-directory, description-bounds, routing clause) that S33 and S37 already carry, rather than sharing a helper.

- Evidence: `tests/smoke.mjs:952-963` (S38) duplicates `tests/smoke.mjs:810-811` (S33) and `tests/smoke.mjs:919-920` (S37).
- Disposition: **won't-fix** — the single-minded-pin decision in the proposal's Solutions Considered sanctions one independent check per skill pin; sharing S33's block would couple the director pin to S33's shape, and S33 is itself a deliberate sibling copy of S37's.
- Note: this is a judgement call, not a hard violation. The proposal's Solutions Considered explicitly adopts the single-minded-pin pattern ("adopted S38 so each pin keeps a single-minded contract (the S37-vs-S33 split is the precedent)"), so a documented repo decision sanctions the shape. The cost is three copies of the same block to keep in sync; the repo standard overrides the baseline here.

### note — description routing-scope check inconsistent with S33/S37

S33 and S37 assert the description scopes routing to cdd projects (`/cdd/`), but S38 asserts only the `when/whenever` clause and drops the `/cdd/` scope assertion. The director skill's description is the only bundled skill whose description is never asserted to contain "cdd".

- Evidence: `tests/smoke.mjs:963` (S38: `/\bwhen(ever)?\b/` only) vs `tests/smoke.mjs:811` and `tests/smoke.mjs:920` (S33/S37: `/cdd/`).
- Disposition: **fixed** — S38 now asserts cdd scoping on the description alongside the when/whenever clause, matching S33/S37.
- Note: not a functional gap — the director skill's description does contain "cdd" ("cdd review-loop runs"), so it would pass either assertion. The finding is a check-coverage inconsistency between sibling pins, not a defect in the artifact.

### note — "no restating" check is line-granular, so wrapped law fragments escape it

The no-restating check normalizes each line of `cdd/rules.md` individually and tests only fragments of 60+ characters, so a law fragment that wraps across a line break in `cdd/rules.md` is never assembled and never matched. The skill paraphrases several law points near-verbatim (e.g. "gate authority stays with the deterministic validators and the human sponsor" vs `cdd/rules.md` rule 2a's "gate authority stays with the deterministic validators and the human"), which the check does not catch because the source phrase spans two lines.

- Evidence: `tests/smoke.mjs:1020-1024` (the `norm`/`skillNorm`/`frag.length >= 60` loop).
- Disposition: **fixed** — the check walks 60-character word-start windows over the whole whitespace-normalized law text, so law fragments that wrap across lines are assembled and matched; the near-verbatim phrase the finding cites was reworded in the skill, and a wrapped-fragment injection now fails S38 (verified on a scratch copy).
- Note: judgement call about the check's strength, not a hard violation. The check is a smoke assertion, not a deterministic door; whether it adequately verifies the "restates no rule text" Done-When criterion is a pin-honesty question that belongs to the spec axis, but the line-granularity itself is a code-quality observation worth recording here.

## Summary

3 findings, all `note` severity: 2 `fixed` (mutation-verified on a scratch copy outside the repo), 1 `won't-fix` with a recorded reason. No blockers, no `should`. No ADR-governed file is touched, and no deterministic door is weakened, bypassed, or blinded by the diff.
