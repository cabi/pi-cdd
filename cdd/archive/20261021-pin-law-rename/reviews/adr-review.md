# adr-review — 2026-10-21 — reviewer: cold sub-agent

Review object: the in-place amendment of `decisions/0007-the-law-behind-every-door.md` (frontmatter `code:` glob, prose module name, consequence mention) that travels with the `scripts/law.mjs` → `scripts/grammar-law.mjs` rename in change `pin-law-rename`. First live fire of the ADR-amendment trigger (rule 2a: a change that amends an ADR runs `cdd-adr-review`).

Context read: `decisions/0007-the-law-behind-every-door.md` (amended, working tree), `git diff decisions/`, `decisions/0006-feature-block-consolidation.md`, `cdd/decisions/0008/0009/0010`, `cdd/changes/pin-law-rename/{proposal,tasks}.md`, `cdd/changes/pin-law-rename/specs/gherkin/spec.md`, `cdd/rules.md` (rules 2a, 12), `skills/cdd-adr-review/SKILL.md`. Glob paths checked against disk; no guard run (read-only review).

| severity | finding | evidence | disposition |
|---|---|---|---|
| note | The in-place amendment leaves no trace in ADR-0007 itself: the module name is silently rewritten with no "Amended by" note, while the repo's own convention appends "Reconfirmed by <change> on <date>" paragraphs whenever a change touches an ADR without changing its decision. A reader of the ADR alone cannot tell the module was ever `law.mjs` or why it was renamed. | decisions/0007-the-law-behind-every-door.md:3,11,32 (rewritten, no amendment note); cdd/decisions/0008:43,48,53, 0009:52,58, 0010:51 (Reconfirmed by convention) | fixed: "Amended by pin-law-rename on 2026-10-21" trace appended at decisions/0007-the-law-behind-every-door.md (end of file), worded without the old path so the change's Done-When grep stays clean; findings file also renamed to the loop-law path reviews/adr-review.md |

## Four-criterion test (both directions)

- **ADR-0007 still merits its record.** The decision — one grammar module behind every door, stated exactly once — is hard to reverse (splitting the single source back into dialects is a large change), surprising without context (the three-dialect drift history), a real trade-off (single module vs. per-door copies; the parser seam; clobbering local edits), and crosses capability boundaries (every door plus store copies). The rename changes only the module's name, not the decision's substance, so all four criteria still hold.
- **Amendment-in-place is the right form.** The rename is path-only; the decision content stands. Superseding would falsely imply the decision is replaced; leaving the ADR untouched would leave a dangling `code:` glob (`scripts/law.mjs` no longer exists). In-place amendment keeps the glob truthful and the decision intact.

## Amendment hygiene

- `code:` glob truthful: all nine globbed paths exist on disk (`scripts/grammar-law.mjs`, `scripts/spec-drift.mjs`, `scripts/spec-extract.mjs`, `scripts/arch-extract.mjs`, `lib/gherkin.mjs`, `lib/validate.mjs`, `lib/store.mjs`, `lib/templates.mjs`, `index.ts`); the old `scripts/law.mjs` is gone.
- Prose consistent: still states "one grammar module behind every door" and "stated exactly once, in `scripts/grammar-law.mjs`" — no contradiction of the original decision.
- No status/date games: `status: accepted` unchanged; no false revision history added.
- No dangling references: `grep law.mjs` over `decisions/` and `cdd/decisions/` finds only ADR-0007's own re-pointed mentions; no other ADR references the old path.

## Missing-record direction

- The rename itself does not merit its own ADR: it is a single-capability naming change (T1 = NO), reversible, not a real architecture trade-off, and does not cross capability boundaries. The design-gate record (T2 = YES) plus the in-place amendment is the correct lighter record.
- No other recent decision fails the four-criterion test or merits-but-lacks a record: cdd/decisions/0008 (advisory findings), 0009 (single-source loop law), and 0010 (reviewer independence) each pass all four criteria and are recorded.

## Coverage and verification

- Read: the amended ADR-0007, its `git diff`, 0006, cdd/decisions/0008-0010, proposal.md, tasks.md, the spec delta, cdd/rules.md (rules 2a, 12), and the skill charter.
- Verified on disk: all nine `code:` glob paths exist; `scripts/law.mjs` absent; `cdd/scripts/grammar-law.mjs` present; no `law.mjs` references remain in `decisions/` or `cdd/decisions/` outside ADR-0007's re-pointed mentions.
- Note: ADR-0007 lives in root `decisions/` (source-tree ADR), which the guard's A0/A1/A2 checks do not scan (cdd/decisions/ only) — its glob truthfulness is reviewer hygiene, verified manually here.
