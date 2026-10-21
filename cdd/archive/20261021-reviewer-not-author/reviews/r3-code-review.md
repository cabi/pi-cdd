# r3-code-review — reviewer-not-author — 2026-10-21 — reviewer: cold sub-agent (both axis sub-agents run cold: opencode-zen/deepseek-v4-pro, fresh sessions, briefs = skill charter + paths from disk)

Axes aggregated verbatim per cdd-code-review step 5; dispositions are the author's.

## Standards

**Standards sources found:** `cdd/rules.md` (the law), `MAINTENANCE.md` ("say each thing once", "no ALL-CAPS emphasis"), `GLOSSARY.md` (canonical terms), `decisions/0001` (zero-dependency), `decisions/0007` (law-behind-every-door), `decisions/0009` (single-source/byte-pinning). No `AGENTS.md`/`CONTRIBUTING.md`/`CODING_STANDARDS.md` exist. `help.mjs` is **unchanged** in the diff (its output changes only via `helpReviewTip()` in `loop-law.mjs`).

### (a) Documented-standard violations
None hard. The change follows ADR-0009's single-source mechanism correctly: facts live in `REVIEWER_INDEPENDENCE`/`FINDINGS_GRAMMAR.reviewerForms`, surfaces render from the module, `lawRule2b()` is byte-pinned to `cdd/rules.md` (RI5), and the test file mirrors `single-source-law.test.js` conventions exactly.

### (b) Baseline smells / judgement calls

| severity | finding | evidence | disposition |
|---|---|---|---|
| note | **Duplicated Code** — `lib/loop-law.mjs:127-155`: `proposalIndependence()`, `tasksIndependence()`, `ambientIndependence()`, `helpIndependenceLine()` each re-assemble the same fact family into four slightly different sentence templates. Facts are single-sourced, but the sentence assembly is duplicated 4×. | lib/loop-law.mjs:127-155 | won't-fix: per-surface compact phrasing is the ADR-0009 pattern — instructions carry normative phrases, ambient/help carry compact ones; the four templates differ by design |
| note | **Single-source gap** — `lib/loop-law.mjs:154`: `helpIndependenceLine()` hardcodes `"fallback recorded with justification"` instead of interpolating a compact recording fact, unlike its three siblings which interpolate `ri.recording`; it also references `REVIEWER_INDEPENDENCE.principle` directly rather than via `const ri = …`. | lib/loop-law.mjs:154 | fixed: `REVIEWER_INDEPENDENCE.recordingCompact` added and interpolated; renderer now uses `const ri` |
| note | **Inconsistent line wrapping** — `cdd/rules.md:29,33`: rule 2b's first line is 94 chars and its last ~100 chars, while the middle lines wrap at ~71, unlike rules 2/2a which wrap consistently at ~72. ADR-0009 pins "historical line wraps", but this is a new rule with no historical wrap to preserve. | cdd/rules.md:29,33 | fixed: `lawRule2b()` re-wrapped to ~72 cols and the store mirror regenerated (RI5 re-pins the byte identity) |
| note | **Missing blank line** — `lib/loop-law.mjs:123-124`: no blank line between `lawRule2b()`'s closing `}` and `export function ambientReviewPoints()`, unlike every other top-level function in the file. | lib/loop-law.mjs:123-124 | fixed: blank line added |
| note | **Proposal over-claims an edit** — the delta's `Code:` line lists `lib/help.mjs`, but the diff does not touch it (only its rendered output changes via `helpReviewTip()`). | cdd/changes/reviewer-not-author/specs/gherkin/spec.md Code: line | fixed: `lib/help.mjs` dropped from the delta `Code:` line — the help surface renders from `lib/loop-law.mjs`, which the glob already covers |
| note | **ADR-0010 `code:` glob narrower than touched files** — frontmatter lists `lib/loop-law.mjs, cdd/rules.md, skills/*` but omits `lib/templates.mjs`, `lib/instructions.mjs`, `lib/context.mjs`, `lib/help.mjs`, and the new test. | cdd/decisions/0010-reviewer-independence-is-loop-law.md frontmatter | won't-fix: those surfaces are governed by ADR-0009; 0010 claims the surfaces where the *decision* lives (law text + skills' citation duty) |
| note | **New terms absent from `GLOSSARY.md`** — "cold sub-agent", "same-session re-read", "reviewer independence" are introduced without glossary entries. "Cold sub-agent" is arguably implementation detail (excluded by the glossary's own rule); "reviewer independence" is a principle. | GLOSSARY.md | open: backlog candidate — a glossary sweep belongs to its own small change; the delta sponsors no glossary requirement |

**Summary:** 0 hard documented-standard violations; 7 judgement-call smells.

## Spec

**(a) Requirements/scenarios missing or partial in the diff**

None. Both delta requirements ("Reviews run cold", "Reviewer-independence ADR is drafted") and all 8 scenarios are implemented. Every `Code:` glob in the delta is touched except `lib/help.mjs`, which is listed but unedited — defensible, since the help surface renders the fact via `helpReviewTip()` in `lib/loop-law.mjs` (already delegating), but the glob is over-broad.

**(b) Behaviour with no sponsoring requirement (scope creep)**

None. Every hunk maps to a scenario: rule 2b text (S1/S5), `REVIEWER_INDEPENDENCE` + `lawRule2b()` + `FINDINGS_GRAMMAR.reviewerForms` (S1/S4/S5), the four surface renderers (S2), the three skill edits (S3), and the ADR-0008/0009 reconfirm notes (S7). Non-Goals hold: README untouched, no validator/guard change, no model-family clause in the law, skills changed only for the independence statement + fallback recording.

**(c) Requirements that look implemented but wrong**

None. Rule 2b renders byte-identical to `cdd/rules.md` (verified by RI5 and by direct comparison). The four surfaces interpolate the module's phrases and none restates the full law text.

**(d) Pin honesty per scenario**

| severity | finding | evidence | disposition |
|---|---|---|---|
| note | S1 "Rule 2b states the independence law" → RI1: pins the principle, "cold sub-agent session", the fallback *name*, and the recording phrase. **Gap:** the "lawful but weaker" qualifier is unpinned — `includes(r, fallbackForm)` checks only "same-session re-read", so dropping "lawful but weaker" from the law would stay green. | tests/acceptance/reviewer-independence.test.js RI1 | fixed: RI1 also pins "lawful but weaker" |
| — | S2 → RI2 honest (interpolation + non-restatement both asserted); S3 → RI3 honest; S4 → RI4 honest (exactly 2 forms, exact join); S5 → RI5 honest (byte-compare both copies); S6 → RI6 honest; S7 → RI7 honest; S8 → RI8 honest (runs the real guard). | tests/acceptance/reviewer-independence.test.js | noted: no action |

**Summary:** 0 missing, 0 scope creep, 0 wrong; 1 note-level pin gap (S1's "lawful but weaker" qualifier), fixed.

One-line summary: Standards 0 hard / 7 judgement (4 fixed, 2 won't-fix, 1 open-backlog); Spec 0/0/0 with 1 pin gap (fixed). No blockers.
