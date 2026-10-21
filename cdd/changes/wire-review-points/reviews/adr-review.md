# adr-review — 2026-10-21 — reviewer: cold sub-agent

Subject: `cdd/decisions/0008-model-run-reviews-are-advisory-findings.md` (status: draft — pre-resolution review; the human resolves afterward).

## Four-criterion test (is it ADR-worthy?)

| criterion | verdict | evidence |
|---|---|---|
| hard to reverse | pass | method-level contract (design gate T2 "architecture bet" YES); flipping to verdict-shaped reviews later rewrites the loop law, all three review skills, and the templates |
| surprising without context | pass | a reader seeing "reviews never gate" in rule 2a would not infer the unrepeatability rationale on their own |
| a real trade-off | pass | advisory findings vs verdict gates — the ADR names the cost of each (spurious blocker = a disposition line, not a false red; reviews lose teeth) |
| crosses capability boundaries | pass | spans the three review skills, the loop law, templates, instructions, ambient block, and help |

The decision merits an ADR; no demotion finding. No decision visible in the change's evidence passes all four criteria while lacking an ADR (the rejected "validator enforcement" and "single-source law constant" are both covered by this ADR's scope or recorded as Non-Goals/follow-ups).

## Findings

| severity | finding | evidence | disposition |
|---|---|---|---|
| note | No dedicated "Rejected alternatives"/"Options" section — the verdict alternative is named and weighed, but only inside **Why** and **Consequences**, not as a structured option list | 0008 **Why** ("A verdict … would create a second gate authority"), **Consequences** ("whether some later door deserves a verdict-shaped review") | open |
| note | Citation imprecision: "(ADR-0007 lineage: same inputs, same verdict)" — the same-verdict rule originates in ADR-0002 (0007 inherits it), and "enough is mechanical" is a help-screen phrase, not a law line | 0008 **Why**; decisions/0007 ("ADR-0002's same-verdict rule"); lib/help.mjs ("'Enough' is mechanical, never a feeling") | open |
| note | `code:` globs claim `lib/context.mjs` and `lib/help.mjs`, but the **Shipping** section describes only rule 2a, the tasks template, and the proposal instruction — the ambient block and help steps that also state the decision go undescribed | 0008 frontmatter vs **Shipping**; lib/context.mjs ambient line, lib/help.mjs reviews tip | open |
| note | `code:` globs omit `cdd/rules.md`, the store copy where rule 2a lives; consistent with 0007's convention (which also omits the store copy), and `cdd/rules.md` is separately guarded by the gherkin spec's `Code:` line | 0008 frontmatter; decisions/0007 frontmatter; cdd/changes/wire-review-points/specs/gherkin/spec.md `Code:` line | open |

## Consistency with accepted ADRs

- No silent contradiction: 0008 aligns with 0002 ("hard gates stay external to the model") and 0007 ("same inputs, same verdict") — it extends, not reverses, them. The reference to 0007 is a lineage citation, not an amend/supersede, and no counterpart flip is required.
- No re-litigation of an accepted decision.

## Form

- Frontmatter `status: draft` and `code:` globs present; all four globs match existing files; the guard accepts the draft status (A0 clean — `node scripts/spec-drift.mjs` reports no A0/A1/A2 finding against 0008).
- Title states the decision, not the topic.
- Consequences name what becomes harder ("reviews cannot force or unblock anything on their own — sponsors can ignore a should"), not only what improves.
- No `induced:` marker — correct, since this ADR was drafted by the change (design gate T2 YES), not derived by arch-extract.

## Verdict

Fit for the human to resolve. Zero blockers, zero shoulds; four notes, all disposition `open` for the author to dispose.

## Dispositions (author) + resolution

Sponsor resolved ADR-0008 **accepted** at Door 4 (2026-10-21); frontmatter flipped `draft` → `accepted`, Consequences tail updated with the resolution.

- note "no Options section" — **won't-fix**: the repo's ADR form (0001–0007) carries **Why./Shipping./Consequences.** without a structured options list; the verdict alternative is named and weighed inline in Why and Consequences.
- note "citation imprecision" — **fixed**: Why now reads "break the same-inputs-same-verdict rule the loop already promises (ADR-0002's rule, restated for every door by ADR-0007)".
- note "Shipping omits ambient/help" — **fixed**: Shipping now states the ambient block (lib/context.mjs) and help screen (lib/help.mjs) carry the same review points with the same triggers, and README documents them.
- note "code: omits cdd/rules.md" — **won't-fix**: consistent with 0007's convention (accepted ADRs omit the store copy); cdd/rules.md is guarded by the gherkin spec's Code: line.
