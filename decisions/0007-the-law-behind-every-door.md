---
status: accepted
code: scripts/law.mjs, scripts/spec-drift.mjs, scripts/spec-extract.mjs, scripts/arch-extract.mjs, lib/gherkin.mjs, lib/validate.mjs, lib/store.mjs, lib/templates.mjs, index.ts
---
# The law: one grammar module behind every door

0006 ruled the fence format; this decision rules where every door-side
grammar is defined. The fence scanner and mask, the pin dialect,
parse-error shaping, the gherkin subset laws, the tasks skeleton, the
`Code:` glob line, and decision frontmatter are stated exactly once, in
`scripts/law.mjs`. Doors and tools import it; none restate it.

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
door 3's verdict matches door 1's wording exactly. `law.mjs` carries a
`LAW_VERSION` marker — bump it when the grammar changes. Door-side
tests that copy scripts into sandboxes must copy the set, since the
guard and extractors import the law.
