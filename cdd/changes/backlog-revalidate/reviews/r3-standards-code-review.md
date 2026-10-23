# R3 standards review — backlog-revalidate

**Reviewer form:** cold sub-agent session (fresh session, briefed only from paths on disk).
**Reviewer model family:** opencode-zen (deepseek-v4-pro) — differs from the author's family zai (glm-5.3), verified from `PI_PROVIDER`/`PI_MODEL` at runtime.
**Repository state:** HEAD `bef3546` (matches the pinned base); `git log bef3546..HEAD` is empty (no commits yet). The diff is the uncommitted working tree on branch `backlog-revalidate`: modified tracked files `cdd/backlog.md`, `cdd/rules.md`, `index.ts`, `lib/backlog.mjs`, `lib/templates.mjs`, `skills/cdd-backlog-triage/SKILL.md`, `tests/acceptance/backlog-op.test.js`, `tests/smoke.mjs`, `tests/tools.mjs`; untracked `cdd/changes/backlog-revalidate/**` and `tests/acceptance/backlog-revalidate.test.js`. 248 insertions, 43 deletions.
**Scope:** Standards axis only — the diff's conformance to documented conventions and accepted ADRs, the smell baseline, and guard/validator alignment. Spec conformance is out of scope (separate session).

## Findings

### [should] R3S-F001 — the revalidation law names a premise rewrite the tool cannot perform

- **Severity:** should
- **Disposition:** fixed: the freehand-exceptions sentence now sanctions premise edits — "a premise backfill that adds the segment, or a rewrite when the premise merely moved" (skills/cdd-backlog-triage/SKILL.md, minting section); the gherkin-delta scenarios were updated to match ("premise edits that keep the grammar — a backfill, or a moved-premise rewrite … as the only 2 freehand exceptions"). Chosen over the resolve-param fix: the rewrite is a data-line correction, not a disposition change, so it belongs with the freehand line-edit exceptions, not the op. smoke 36/36 green.
- **Evidence:** `skills/cdd-backlog-triage/SKILL.md:101-102` ("a premise that merely moved (anchor renamed, fix reshaped) rewrites the premise line, not the finding") vs `lib/backlog.mjs:295` (`resolveBacklogItem(root, { id, status, change, note })` — no `premise` parameter) and `skills/cdd-backlog-triage/SKILL.md:118-119` (the only two freehand exceptions: a note edit and "a premise backfill that adds the premise segment").
- **Evidence status:** Trace-backed
- **Preconditions:** an open item carries a premise whose anchor moved (file renamed, fix reshaped) so the premise is now false but the finding still stands.
- **Trace:** the law at SKILL.md:101-102 directs the triager to "rewrite the premise line" → the only sanctioned write paths are `resolve` (lib/backlog.mjs:295, which accepts `status`/`change`/`note` but no `premise`) and the two freehand exceptions (SKILL.md:118-119, which cover *adding* a premise to an item that lacks one, not *rewriting* an existing one) → no mechanism rewrites an existing premise without hand-editing the line, which the "never freehand" rule (SKILL.md:113-114) forbids.
- **Expected:** the law's "rewrites the premise line" has a sanctioned mechanism — either `resolve` accepts a `premise` parameter, or the freehand exceptions name premise *rewrite* (not only backfill) as a third exception.
- **Actual:** the law prescribes an action the tool and the freehand exceptions together do not permit; a triager following the law has no compliant way to move a premise.
- **Smallest safe fix:** add a `premise` parameter to `resolveBacklogItem` (validated through the existing `parsePremise`), or extend the freehand-exceptions sentence to cover rewriting an existing premise segment.

### [note] R3S-F002 — new test header cites a spec heading and change name, which ADR-0012 bans

- **Severity:** note
- **Disposition:** fixed: both "Pins:" header lines deleted from tests/acceptance/backlog-revalidate.test.js; suite 14/14 green. The pre-existing instances the reviewer found (backlog-op.test.js:8, extension-door1.test.js:6) are out of this change's sponsorship and were minted as a new backlog item through the op (evaluate on recurrence; ADR-0012's code glob excludes tests/, so no door enforces them).
- **Evidence:** `tests/acceptance/backlog-revalidate.test.js:7` (`// Pins: MODIFIED "The backlog op triages findings on disk" scenarios in the backlog-revalidate change delta.`) vs `cdd/decisions/0012-comments-are-shape-only.md` ("tests may not cite spec headings back"; "Banned in comments: corpus routing of any form (ADR ids, PF ids, spec or change names, commit ids)").
- **Evidence status:** Trace-backed
- **Preconditions:** none — the header is read directly against the decision text.
- **Trace:** the new test's header names a spec scenario heading ("The backlog op triages findings on disk") and a change name ("backlog-revalidate") → ADR-0012's decision text bans both in comments, and its allowance keeps only test-local check-ids (MC9/RF6/S33-style), not scenario-heading prose.
- **Expected:** the header carries check-ids only, or no corpus pointer at all.
- **Actual:** the header routes back to the spec delta and change name — a new instance of the pattern ADR-0012 was written to retire. (Pre-existing instances of the same "Pins:" pattern exist at `tests/acceptance/backlog-op.test.js:8` and `tests/acceptance/extension-door1.test.js:6`; ADR-0012's `code:` glob does not include `tests/`, so no door enforces this on test files — the decision text still applies.)
- **Smallest safe fix:** drop the "Pins:" line, or reduce it to the test-local check-ids it exercises.

## Coverage and verification

- Read the full diff (`git diff bef3546 --stat` then per-file) for all nine modified tracked files, plus direct reads of the untracked `tests/acceptance/backlog-revalidate.test.js` and the change-folder artifacts.
- Confirmed rule 13 law text renders byte-identically from its single source: `lib/templates.mjs` RULES_MD uses `\`` escapes that render to literal backticks in `cdd/rules.md`; the sed-level "DIFFER" is the escape mechanism, not real drift, and `tests/acceptance/single-source-law.test.js:119` pins `store === tpl.RULES_MD`.
- Confirmed no guard/validator touched: `cdd/scripts/spec-drift.mjs` and `lib/validate.mjs` are unchanged; no door is weakened, bypassed, or blinded.
- Confirmed no data loss in `resolve`: the `merged` spread (`lib/backlog.mjs:316-320`) preserves `premise`/`verified` on resolve.
- Confirmed `pathBad` (`lib/backlog.mjs:58-66`) rejects leading `/`, empty, and `..` segments — premises read inside the store only.
- Confirmed the new test drives the real door (loads the extension via `loadViaPi(index.ts)` and dispatches the real tool), satisfying ADR-0011.
- Confirmed no new door-side grammar: the backlog grammar is living triage data, outside ADR-0007's door-side scope.
- Smell baseline (Mysterious Name, Duplicated Code, Feature Envy, Data Clumps, Primitive Obsession, Repeated Switches, Shotgun Surgery, Divergent Change, Speculative Generality, Message Chains, Middle Man, Refused Bequest): no new instances introduced by the diff.
- No blockers found.
