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

- Reconfirmed by adr-dir-migration on 2026-10-22: the only glob file this change touches is lib/gherkin.mjs, and only a path comment there; the law-behind-every-door topology (machine law in scripts/, adapters injecting it) is unchanged. The product ADRs of this decision's era now live in the same store home, cdd/decisions/.

- Reconfirmed by design-docs on 2026-10-23: the design document stays outside every machine door by sponsor decision (charter-only enforcement; no validator change, no new door) — the briefs and the cdd-code-review skill carry its checks; if reviews keep finding missing or bad diagrams, that becomes a process finding and a door later, exactly the trajectory this decision prescribes.

- Reconfirmed by r3-findings on 2026-10-23: the per-axis R3 findings rule is rendered loop law from lib/loop-law.mjs with cdd/rules.md as its byte-identical mirror, and no new validator door is added — the Capabilities placeholder joins the existing validateProposal placeholder door.

- Reconfirmed by law-guard-fixes on 2026-10-23: the rule-3 law wording now matches the validateProposal door's 1-5 criteria contract, and the guard's door ownership is made explicit — pre-commit keeps the staged checks, the commit-msg door owns staged pairs, the full scan owns topology L2 (!preCommit gate) — so every check stays door-backed and no door gained law-free checks.

- Reconfirmed by guard-glob-fix on 2026-10-23: scripts/spec-drift.mjs changed (globToRe fix, new memory-claim check), but the grammar decision holds: the Gherkin grammar (CODE_LINE, PIN_COMMENT and friends) still lives solely in scripts/grammar-law.mjs — the guard imports CODE_LINE rather than restating it, and no new grammar constant was introduced.

- Reconfirmed by comments-are-shape-only on 2026-10-23: doorway banners and ADR-pointer comments removed across scripts/ and lib/; every door still routes editors to the corpus at edit time.

- Reconfirmed by backlog-revalidate on 2026-10-23: the new refusals and verdicts are pinned by tests/acceptance/backlog-revalidate.test.js driving the real door (loadViaPi on index.ts); no law text restated in code.

- Reconfirmed by gitlab-ci-parity on 2026-10-23: the parity contract is pinned by tests/acceptance/gitlab-ci-parity.test.js driving the real render (imports lib/templates.mjs, reads the real .gitlab-ci.yml from disk); no law text restated in code, and the new scaffold comments are rendered output, not law.

- Reconfirmed by adr-ops on 2026-10-24: scripts/adr-index.mjs joins scripts/grammar-law.mjs as shared door law (the guard and the cdd adrs/reconfirm ops import the same builder and matcher); the walk-up root finding and the A-check semantics in scripts/spec-drift.mjs are unchanged.
- Reconfirmed by spec-model on 2026-10-24: spec-model extended the one grammar module with parseSpecModel; guard, extractor, and store read it, no private re-statement (SM2)
- Reconfirmed by guard-pure-checks on 2026-10-24: one law, one door script still — the restructure stays inside spec-drift.mjs and its store copy, imports the parse and matcher from the law modules, adds no door file
- Reconfirmed by claim-map on 2026-10-24: the claim map joins the single-law scheme — derived once in scripts/adr-index.mjs, both doors import it, DOOR_SCRIPTS stays five, store copy travels (ADR-0013)
- Reconfirmed by ops-registry on 2026-10-24: the op registry adds no door and moves no law: scripts/ untouched, guard and validator byte-identical, and the op-surface agreement is pinned by tests/acceptance/ops-registry.test.js driving the real tool
- Reconfirmed by decision-scan-unify on 2026-10-24: the decision scan joins the single-law scheme: derived once behind explicit flags in scripts/adr-index.mjs, the extractor imports it and holds no private walk, DOOR_SCRIPTS stays five
- Reconfirmed by 20261024-scaffold-honesty on 2026-10-24: no new law module: the comment mask lives inside validateProposal in lib/validate.mjs, one verdict for every door that calls it — change 20261024-scaffold-honesty
- Reconfirmed by 20261024-spec-size-signal on 2026-10-24: the spec-size signal extends the warning channel to a second signal family (existence + growth-act); both tiers warn in draft and strict and never gate ok — warn-never-error semantics unchanged
- Reconfirmed by 20261024-metrics-stamp on 2026-10-24: all stamp counts import the shared grammar model from scripts/grammar-law.mjs and FINDINGS_GRAMMAR from lib/loop-law.mjs; no rule is restated door-side, and the lying-declared-counts mismatch line surfaces rather than trusts
- Reconfirmed by 20261024-dw-masked-view on 2026-10-24: the mask body stays single-sourced in lib/validate.mjs; lib/metrics.mjs imports it rather than copying — no second mask behind any door, and the masked-view law rides the spec delta and acceptance pins
