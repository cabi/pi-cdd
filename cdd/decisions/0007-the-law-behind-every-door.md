---
status: accepted
code: scripts/grammar-law.mjs, scripts/spec-drift.mjs, scripts/spec-extract.mjs, scripts/arch-extract.mjs, lib/gherkin.mjs, lib/validate.mjs, lib/store.mjs, lib/templates.mjs, index.ts
---
# The law: one grammar module behind every door

0006 ruled the fence format; this decision rules where every door-side
grammar is defined. The fence scanner and mask, the pin dialect,
parse-error shaping, the gherkin subset laws, the tasks skeleton, the
`Code:` glob line, and decision frontmatter are stated exactly once, in
`scripts/grammar-law.mjs`. Doors and tools import it; none restate it.

**Why.** The grammar lived in three dialects and they drifted: the
guard accepted backticked pins door 1 rejected, `spec-extract` counted
markdown pins no other door could see, and the door 3 full scan parsed
fences while enforcing none of the subset laws — a two-When fence
passed CI and failed `cdd validate`. ADR-0002's same-verdict rule
cannot rest on copy discipline; bd4358b shows that discipline breaking.
One grammar, one module, one verdict.

**Shipping.** The law is zero-dependency Node (ADR-0001) and travels
into adopting projects verbatim via `DOOR_SCRIPTS`; `cdd init` on an
existing store re-copies it — local edits under `cdd/scripts/` are
clobbered by design, because the law is not local custom. The parser
sits behind the seam, injected by the caller: parser-bearing doors
(door 1, the apply preflight, door 3's full scan) pass their installed
or vendored `@cucumber/gherkin`; the commit doors never import it
(ADR-0005's split untouched).

**Consequences.** Amends 0006's consequences rather than superseding
them: the subset laws are now enforced by every parser-bearing door, so
door 3's verdict matches door 1's wording exactly. `grammar-law.mjs` carries a
`LAW_VERSION` marker — bump it when the grammar changes. Door-side
tests that copy scripts into sandboxes must copy the set, since the
guard and extractors import the law.

`validateBoth` in `lib/validate.mjs` derives the draft and strict
verdicts from one evaluation — strict-only checks tag their errors, and the
draft projection filters them. The draft ⊆ strict subset holds by
construction — the draft verdict is the strict run minus the tagged
errors — and the acceptance tests pin it from the outside (smoke S31,
extension-door1 E2), so a mislabeled check fails loudly there.

Amended by pin-law-rename on 2026-10-21: the law module is now
`scripts/grammar-law.mjs` (self-describing rename, decision unchanged — one
law behind every door).

Reconfirmed by adr-dir-migration on 2026-10-22: the only glob file this
change touches is lib/gherkin.mjs, and only a path comment there; the
law-behind-every-door topology (machine law in scripts/, adapters
injecting it) is unchanged. The product ADRs of this decision's era now
live in the same store home, cdd/decisions/.

Reconfirmed by design-docs on 2026-10-23: the design document stays
outside every machine door by sponsor decision (charter-only enforcement;
no validator change, no new door) — the briefs and the cdd-code-review
skill carry its checks; if reviews keep finding missing or bad diagrams,
that becomes a process finding and a door later, exactly the trajectory
this decision prescribes.

Reconfirmed by r3-findings on 2026-10-23: the per-axis R3 findings rule is rendered loop law from lib/loop-law.mjs with cdd/rules.md as its byte-identical mirror, and no new validator door is added — the Capabilities placeholder joins the existing validateProposal placeholder door.

Reconfirmed by law-guard-fixes on 2026-10-23: the rule-3 law wording now
matches the validateProposal door's 1-5 criteria contract, and the guard's
door ownership is made explicit — pre-commit keeps the staged checks, the
commit-msg door owns staged pairs, the full scan owns topology L2 (!preCommit
gate) — so every check stays door-backed and no door gained law-free checks.

Reconfirmed by guard-glob-fix on 2026-10-23: scripts/spec-drift.mjs changed (globToRe fix, new memory-claim check), but the grammar decision holds: the Gherkin grammar (CODE_LINE, PIN_COMMENT and friends) still lives solely in scripts/grammar-law.mjs — the guard imports CODE_LINE rather than restating it, and no new grammar constant was introduced.

Reconfirmed-by: comments-are-shape-only — doorway banners and ADR-pointer comments removed across scripts/ and lib/; every door still routes editors to the corpus at edit time.

Reconfirmed-by: backlog-revalidate — the new refusals and verdicts are pinned by tests/acceptance/backlog-revalidate.test.js driving the real door (loadViaPi on index.ts); no law text restated in code.
