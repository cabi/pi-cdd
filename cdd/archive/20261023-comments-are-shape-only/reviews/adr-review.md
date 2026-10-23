# ADR review — comments-are-shape-only

**Reviewer form:** cold sub-agent (fresh session, briefed only from the brief and disk paths)
**Reviewer model family:** deepseek (opencode-zen / deepseek-v4-pro) — differs from author's zai (glm lineage, zai/glm-5.3)
**Repo state:** commit `dcda8d4` plus uncommitted working tree (the change content lives in the working tree; ADR-0012 and its acceptance tests are untracked)
**Reviewed:** `cdd/decisions/0012-comments-are-shape-only.md` against `cdd/decisions/` (0001–0011), `cdd/rules.md` rule 12, `cdd/scripts/spec-drift.mjs` A0/A1/A2, and the change folder `cdd/changes/comments-are-shape-only/`

## Findings

### [note] ADR-0012 — "hard to reverse" is met through enforcement, not the decision's nature

- **Finding:** The four-criterion test's first leg — *hard to reverse* — is the weakest for this decision. "Comments may only describe shape" is a convention, not a structural commitment like ADR-0001 (zero-dependency tooling) or ADR-0003 (plain-markdown store). Its irreversibility is delegated entirely to two enforcement mechanisms the ADR itself names: the A2 reconfirm-on-touch (editing any file in the `code:` glob forces reconfirmation) and the acceptance pin (`comment-law.test.js` fails the suite on corpus-routing comments). The decision is hard to reverse *silently*, not hard to reverse in itself.
- **Evidence:** `cdd/decisions/0012-comments-are-shape-only.md` — "Editing any file named in this ADR's code line now reconfirms this decision (A2), which is the point: comment discipline is decided, not habitual." The ADR does argue the leg, but the argument rests on the pin + A2, not on inherent irreversibility.
- **Disposition:** won't-fix: the ADR itself argues the leg through A2 + the acceptance pin ("Editing any file named in this ADR's code line now reconfirms this decision (A2), which is the point"); the finding sharpens the reading and stays recorded here

### [note] ADR-0012 — "accepted" status predates the loop's validation

- **Finding:** The **Resolved** section records the decision was "accepted before the loop ran: the human sponsor settled the rule and both allowances with the director (delegated authority held there)". The ADR's frontmatter is `status: accepted` while the change that drafts it is still mid-loop (this ADR review runs at Close, before archive). This is transparent — not a silent contradiction — but a reader should note the acceptance was settled outside the loop's validate/guard/archive sequence, and the loop here records and validates a decision already made rather than deciding it.
- **Evidence:** `cdd/decisions/0012-comments-are-shape-only.md` — "**Resolved.** Accepted before the loop ran: the human sponsor settled the rule and both allowances with the director (delegated authority held there); the comments-are-shape-only change drafted this ADR, enacted the sweep, and landed the pins."
- **Disposition:** won't-fix: the provenance is deliberately transparent in the Resolved section; the loop's role here is to record and enforce a decision already made, and the note documents exactly that

## Coverage and verification

- Four-criterion test, both directions: hard-to-reverse (weakest leg, noted above), surprising-without-context (a reader seeing shape-only comments would not infer the corpus-routing ban), real trade-off (four alternatives weighed in **Why**), crosses capability boundaries (`code:` spans index.ts, lib/, scripts/, .githooks/). No unrecorded decision that passes all four was found — the two allowances (JSDoc one-liners, test-local check-ids) and the no-rule-N/door-N pin choice are all recorded in the ADR.
- Form: `code:` globs (`index.ts`, `lib/*.mjs`, `lib/*.ts`, `scripts/*.mjs`, `.githooks/*`) all match real paths (verified: index.ts; 10 lib/*.mjs; lib/status-ui.ts; 4 scripts/*.mjs; commit-msg + pre-commit). Title states the decision. Options weighed with reasons. Consequences name what gets harder ("A comment can no longer tell a reader why a line exists").
- No silent contradiction: checked against ADR-0004 (stale `lib/context.ts` glob is PF-22, recorded in the proposal, not a contradiction of ADR-0012), ADR-0008/0009/0010/0011 (overlapping `lib/*.mjs` globs, decisions untouched — no reconfirm needed). The rule-10 extension is explicitly reasoned, not silent.
- Amend vs supersede vs reconfirm: ADR-0012 is a new decision extending rule 10's principle without reversing it; a new ADR is the correct instrument. No finding.
- The drift-evidence claim (header "rotted twice") is consistent with the current `// Checks: A0 A1 A2 G H L1 L2 L3 L4 L4-skip M O` line at `scripts/spec-drift.mjs:18`, now machine-pinned by `tests/acceptance/guard-header-index.test.js`.
