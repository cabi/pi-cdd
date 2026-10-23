## MODIFIED Requirements

### Requirement: Design gate record lands before the proposal

The loop law's change-loop rule MUST state that the T1–T5 answers are written into the tasks design section as the gate runs, before the proposal is drafted, and MUST state the design-document shape clause: a T2 (architecture bet) or T4 (invariant risk) YES carries `design.md` at the change root — proposal.md's sibling — with the gate record naming the chosen shape and, for design.md, the C4 level and why; every other shape keeps the short prose form above the tick, and no change carries design.md without the trigger.

```gherkin
Feature: Design gate record lands before the proposal

Scenario: The law states the gate record timing
  Given the loop law text rendered into a fresh store's cdd/rules.md
  When the change-loop rule is read
  Then it states that the T1 through T5 answers are written into the tasks design section as the gate runs, before the proposal is drafted
  # Verified by: tests/acceptance/review-wiring.test.js

Scenario: The law states the design-document trigger
  Given the loop law text rendered into a fresh store's cdd/rules.md
  When the design-documents rule is read
  Then it states that a T2 architecture-bet YES or a T4 invariant-risk YES carries design.md at the change root, proposal.md's sibling
  And it states that every other shape keeps the short prose form in the tasks design section above the tick and no change carries design.md without the trigger
  # Verified by: tests/acceptance/design-docs.test.js

Scenario: The law states the gate record names shape and level
  Given the loop law text rendered into a fresh store's cdd/rules.md
  When the design-documents rule is read
  Then it states that the gate record names the chosen shape and, for design.md, the C4 level and why
  # Verified by: tests/acceptance/design-docs.test.js

Scenario: The tasks scaffold carries the shape clause
  Given a scaffolded tasks.md from a fresh change
  When the design-gate line is read
  Then it names the five triage triggers and the T2 or T4 design.md clause
  And it instructs the record to name the chosen shape and, for design.md, the C4 level
  # Verified by: tests/acceptance/design-docs.test.js
```

Code: lib/loop-law.mjs, lib/templates.mjs, lib/context.mjs, lib/help.mjs, cdd/rules.md, cdd/decisions/0008-*.md, tests/acceptance/review-wiring.test.js, tests/acceptance/design-docs.test.js

### Requirement: Reviewer briefs live next to their skills

The five reviewer brief templates MUST exist on disk next to their bundled skills — `brief-r1.md` and `brief-r2.md` beside cdd-spec-review, `brief-r3-standards.md` and `brief-r3-spec.md` beside cdd-code-review, `brief-adr.md` beside cdd-adr-review — each carrying the common skeleton plus its per-review-type MUST-DELIVER checklist, and each skill's SKILL.md MUST point at the briefs living next to it. The R1 brief's review object MUST be the proposal plus design.md when the design gate produced one, and the R2 brief's package object MUST include design.md with one design-alignment check.

```gherkin
Feature: Reviewer briefs live next to their skills

Scenario: The five briefs carry the common skeleton
  Given the five reviewer brief templates on disk next to their skills
  When each is read
  Then each carries change identity, reviewer session requirements, inputs as paths with pinned read-time state, a scope fence, the findings grammar, its output filename per lib/loop-law.mjs reviewPoint(), and the advisory-only notice
  And the session requirements state the cold-session rule, the author-family rule, and two-axes-two-sessions for the R3 briefs
  # Verified by: tests/acceptance/loop-law-hardening.test.js

Scenario: Each brief carries its MUST-DELIVER checklist
  Given the five reviewer brief templates on disk
  When each is read
  Then brief-r1.md checks design-gate credibility, reuse-first search, Done-When verifiability, scope fence, and capability mapping
  And brief-r2.md checks coverage, sponsorship, same-change coherence, MODIFIED and REMOVED restatement, and runnable verify-bys
  And brief-r3-standards.md checks conventions, ADR-governed files, the smell baseline, and guard alignment
  And brief-r3-spec.md checks scenario implementation, pins that actually pin, and no unsponsored code
  And brief-adr.md checks the four-criterion test both directions, form, consistency with accepted ADRs, and the amend-or-supersede-or-reconfirm choice
  # Verified by: tests/acceptance/loop-law-hardening.test.js

Scenario: The R1 and R2 briefs carry the design document
  Given the R1 and R2 brief templates and the cdd-spec-review SKILL.md on disk
  When their review-object lines are read
  Then brief-r1.md names the artifact under review as the proposal plus design.md when the design gate produced one
  And brief-r2.md names the whole change package including design.md
  And brief-r2.md carries 1 design-alignment check stating that the diagram's boxes map to real capabilities or modules, the level claim matches the stated risk, and design, proposal, and delta hold no contradictions
  And the SKILL.md object lines name design.md where they list the proposal-mode and package-mode objects
  # Verified by: tests/acceptance/design-docs.test.js

Scenario: The skills point at their briefs
  Given the 3 bundled review skills
  When each SKILL.md is read
  Then it points at the brief templates living next to it
  # Verified by: tests/acceptance/loop-law-hardening.test.js

Scenario: Smoke pins the briefs structurally
  Given the smoke suite of the extension
  When it runs against the five brief templates
  Then exactly 1 check pins their presence, the law citations, the findings grammar, and the output-filename lines
  # Verified by: tests/smoke.mjs
```

Code: skills/cdd-spec-review/brief-r1.md, skills/cdd-spec-review/brief-r2.md, skills/cdd-code-review/brief-r3-standards.md, skills/cdd-code-review/brief-r3-spec.md, skills/cdd-adr-review/brief-adr.md, skills/cdd-spec-review/SKILL.md, tests/smoke.mjs, tests/acceptance/loop-law-hardening.test.js, tests/acceptance/design-docs.test.js

## ADDED Requirements

### Requirement: Design document template pins the four-section contract

The design.md scaffold — exported by the artifact-scaffold module beside the proposal and tasks templates — MUST render exactly 4 mandatory sections and no free-form section: `## Level` asks which C4 level (Context, Container, or Component) and why the risk lives there and bans the Code level as too fine and fastest-rotting; `## Diagram` carries exactly 1 mermaid flowchart in flowchart syntax whose node labels carry the element kind, never mermaid's native C4* diagram types; `## Boundaries` holds 1 line per diagram box — what it is, what it must not know about; `## Alternatives` names the obvious other shape and why not. The template MUST use C4 vocabulary only, with no tool-specific names.

```gherkin
Feature: Design document template pins the four-section contract

Scenario: The scaffold renders exactly the four sections
  Given the design document template exported by the scaffold module
  When its section headings are read
  Then they are exactly Level, Diagram, Boundaries, and Alternatives in that order, all 4 present, and no other section heading exists
  # Verified by: tests/acceptance/design-docs.test.js

Scenario: The Diagram section carries exactly one kind-carrying flowchart
  Given the design document template exported by the scaffold module
  When the Diagram section is read
  Then it holds exactly 1 mermaid fence declaring flowchart syntax with node labels that carry the element kind such as Container or Component
  And it names no mermaid C4 diagram type
  # Verified by: tests/acceptance/design-docs.test.js

Scenario: The Level section states the level contract
  Given the design document template exported by the scaffold module
  When the Level section is read
  Then it asks which C4 level — Context, Container, or Component — and why the risk lives there
  And it bans the Code level as too fine and fastest-rotting
  # Verified by: tests/acceptance/design-docs.test.js

Scenario: The template stays adopter-generic
  Given the design document template exported by the scaffold module
  When the whole template is scanned
  Then it uses C4 vocabulary and carries no tool-specific names
  # Verified by: tests/acceptance/design-docs.test.js
```

Code: lib/templates.mjs, tests/acceptance/design-docs.test.js

### Requirement: Design document rule is single-sourced loop law

The design-document rule — trigger, shape choice, the 4 sections, exactly 1 diagram, the level convention, and the ADR layering (an ADR records a T2 bet's decision and may cite the archived design.md path but never carries a diagram copy; design.md is archived with the change folder) — MUST be defined once in the loop-law module, MUST render into the loop law text as the rule numbered 2c directly after rule 2b, and MUST appear in this repository's store copy cdd/rules.md with the same text.

```gherkin
Feature: Design document rule is single-sourced loop law

Scenario: Rule 2c renders into the law and the store mirror
  Given the loop law text rendered from lib/loop-law.mjs and this repository's store copy cdd/rules.md
  When the design-documents rule is read in each
  Then each carries the rule numbered 2c directly after rule 2b, stating the trigger, the shape choice, the 4 mandatory sections, exactly 1 diagram, the level convention, and the ADR layering
  # Verified by: tests/acceptance/design-docs.test.js

Scenario: The rule text stays adopter-generic
  Given the design-documents rule rendered from lib/loop-law.mjs
  When the rule text is scanned
  Then it uses C4 vocabulary and carries no tool-specific names
  # Verified by: tests/acceptance/design-docs.test.js
```

Code: lib/loop-law.mjs, cdd/rules.md, tests/acceptance/design-docs.test.js
