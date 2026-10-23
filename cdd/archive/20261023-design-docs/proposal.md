# design-docs

## Why

The design gate (loop rule 2, tasks §2.1) records architecture bets as "a short design above the tick" — prose with no reviewable shape. When a change bets on architecture (T2) or risks an invariant (T4), reviewers get no structured artifact, no diagram, and no level claim to check, so architecture risk is argued in free-form text that varies per change and per author.

## What Changes

- The design gate gains a shape clause: T2 (architecture bet) or T4 (invariant risk) answered YES ⇒ the change carries `design.md` at the change root (proposal.md's sibling); all other shapes (including T1/T3/T5-only) keep today's form — short prose in tasks §2 above the tick. The gate record names the chosen shape and, for design.md, the C4 level and why. No always-artifact: prose-shaped changes get no design.md.
- `designTemplate` in lib/templates.mjs (alongside the other artifact scaffolds) scaffolds design.md: exactly four mandatory sections — `## Level` (which C4 level — Context/Container/Component — and why the risk lives there; the Code level is banned: too fine, rots fastest), `## Diagram` (exactly one mermaid flowchart using C4 conventions — node labels carry the element kind, e.g. `Container: guard`, `Component: validate` — flowchart syntax, NOT mermaid's native C4* diagram types), `## Boundaries` (one line per box: what it is, what it must not know about), `## Alternatives` (the obvious other shape, and why not). No free-form sections.
- lib/loop-law.mjs (single source) states the design.md rule — trigger, shape choice, four sections, one diagram, level convention — rendered into the loop law text and the store mirror cdd/rules.md, regenerated with the established explicit mirror write + byte-identity check (initStore deliberately never rewrites an existing store's copy). Law text is adopter-generic: C4 vocabulary only, no tool-specific names.
- skills/cdd-spec-review/brief-r1.md — review object grows to proposal.md + design.md (when the gate produced one); skills/cdd-spec-review/brief-r2.md — design.md joins the package object plus one alignment bullet: the diagram's boxes map to real capabilities/modules, the level claim matches the stated risk, design ↔ proposal ↔ delta hold no contradictions. SKILL.md charter lines updated to match where they list objects.
- Enforcement stays charter-only: no validator change, no new machine door — if reviews keep finding missing/bad diagrams, that becomes a process finding and a door later. Validate/grammar-law stay untouched.
- ADR layering: when a T2 bet mints an ADR, the ADR records the decision; design.md stays the shape and is archived with the change folder. An ADR may cite the archived design.md path but carries no diagram copy.

## Solutions Considered

- gherkin (loop law + scaffolds + briefs): this capability already owns the gate record, artifact scaffolds, the reviewer briefs, and the single-source law — every edit of this change lands in its files; adopted (a new `design` capability would split loop-law ownership).
- C4 model vocabulary: the established, tool-agnostic notation for level-scoped architecture views (Context/Container/Component); adopted for the Level/Diagram/Boundaries contract, with the Code level banned as too fine and fastest-rotting.
- Mermaid flowchart syntax with C4-convention node labels vs mermaid's native C4* diagram types: flowchart syntax renders anywhere mermaid renders and stays plain lintable flowchart text; the native C4* types are less portable and heavier to lint; adopted flowchart with kind-carrying labels.
- Validator door (validate / grammar-law): a machine check for design.md presence or shape; rejected per the settled decision — charter-only now, the PF→door path covers recurring findings later.
- Existing specs under cdd/specs/: no living capability promises a design-phase artifact beyond the gate record ("Design gate record lands before the proposal", gherkin); the new rule extends gherkin rather than minting a capability.

## Non-Goals

- No validator or grammar-law enforcement for design.md (charter-only).
- No design.md for T1/T3/T5-only changes (no always-artifact).
- No ADR machinery change: the layering sentence lands in the law text; no ADR template or validator edit ships.
- PF-1 (proposal scaffold comment traps) stays unfixed — adjacent but explicitly out of scope.

## Capabilities

- gherkin MODIFY — the design gate's shape clause, the loop law's design.md rule, the design.md artifact scaffold, and the reviewer briefs all extend the loop-law capability that already owns them; no other capability's spec moves.

Done-When: cdd/changes/design-docs/design.md exists with the four mandatory sections and exactly one mermaid flowchart, modelling the design-phase pipeline (the dogfood instance)
Done-When: node tests/acceptance/design-docs.test.js exits 0, pinning the gate clause in the tasks scaffold, designTemplate's contract, the brief/SKILL object lines, and the law rule in lib/loop-law.mjs and cdd/rules.md
Done-When: cdd validate strict is green and node cdd/scripts/spec-drift.mjs exits 0 on the change
Code: lib/loop-law.mjs, lib/templates.mjs, lib/context.mjs, lib/help.mjs, cdd/rules.md, cdd/decisions/0008-*.md, skills/cdd-spec-review/brief-r1.md, skills/cdd-spec-review/brief-r2.md, skills/cdd-spec-review/SKILL.md, tests/acceptance/review-wiring.test.js, tests/acceptance/design-docs.test.js

## Decisions followed (A1 citations)

- ADR-0006 (feature-block consolidation) — followed: the design.md scaffold ships inside lib/templates.mjs's existing artifact-scaffold feature block; no new scaffold surface is split out.
- ADR-0007 (the law behind every door) — followed: the design-doc rule is loop law only; no validator door is added or changed.
- ADR-0008 (model-run reviews are advisory findings) — followed: the brief edits keep advisory-only notices; no verdict machinery ships.
- ADR-0009 (single-source the loop law) — followed: rule 2c is defined once in lib/loop-law.mjs and mirrored byte-identically into cdd/rules.md.
- ADR-0010 (reviewer independence is loop law) — followed: R1 and R2 run as cold cross-family sub-agents per the briefs.
- ADR-0011 (ticks are claims and pins hit real doors) — followed: the acceptance suite pins the wiring on disk before any implementation task ticks.
