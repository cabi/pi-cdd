## MODIFIED Requirements

### Requirement: Reviewer briefs live next to their skills

The five reviewer brief templates MUST exist on disk under their bundled skills' `assets/` directories — `assets/brief-r1.md` and `assets/brief-r2.md` under cdd-spec-review, `assets/brief-r3-standards.md` and `assets/brief-r3-spec.md` under cdd-code-review, `assets/brief-adr.md` under cdd-adr-review — each carrying the common skeleton plus its per-review-type MUST-DELIVER checklist, and each skill's SKILL.md MUST point at the brief templates under its `assets/` directory. The R1 brief's review object MUST be the proposal plus design.md when the design gate produced one, and the R2 brief's package object MUST include design.md with one design-alignment check.

```gherkin
Feature: Reviewer briefs live next to their skills

Scenario: The five briefs carry the common skeleton
  Given the five reviewer brief templates on disk under their skills' assets/ directories
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

Scenario: The R3 briefs name distinct per-axis findings files
  Given the two R3 brief templates and the cdd-code-review SKILL.md on disk
  When their output lines and review steps are read
  Then brief-r3-standards.md names findings path reviews/r3-standards-code-review.md and brief-r3-spec.md names findings path reviews/r3-spec-code-review.md, 2 distinct files
  And each brief names only its own findings file and never the other axis's
  And the SKILL.md review steps name both findings paths, one per axis
  # Verified by: tests/acceptance/r3-findings.test.js

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
  Then it points at the brief templates under its assets/ directory
  # Verified by: tests/acceptance/loop-law-hardening.test.js

Scenario: Smoke pins the briefs structurally
  Given the smoke suite of the extension
  When it runs against the five brief templates
  Then exactly 1 check pins their presence, the law citations, the findings grammar, and the output-filename lines
  # Verified by: tests/smoke.mjs
```

Code: skills/cdd-spec-review/assets/brief-r1.md, skills/cdd-spec-review/assets/brief-r2.md, skills/cdd-code-review/assets/brief-r3-standards.md, skills/cdd-code-review/assets/brief-r3-spec.md, skills/cdd-adr-review/assets/brief-adr.md, skills/cdd-spec-review/SKILL.md, skills/cdd-code-review/SKILL.md, skills/cdd-adr-review/SKILL.md, tests/smoke.mjs, tests/acceptance/loop-law-hardening.test.js, tests/acceptance/design-docs.test.js, tests/acceptance/r3-findings.test.js

### Requirement: One decisions home across the corpus

No live artifact of the extension — the loop law, the README layout, the reviewer briefs and skills, the source comments — documents a second decisions directory: every live path that names an ADR home names `cdd/decisions/`. Historical factory notes — PRODUCT.md and the 0001 body's factory-path record — keep their past-tense references as history.

```gherkin
Feature: One decisions home across the corpus

Scenario: Reviewer brief and skill name the one home
  Given a repository whose product ADRs were moved into the store
  When the ADR review brief and skill are read
  Then each names cdd/decisions paths only, never a live root decisions directory
  # Verified by: tests/acceptance/decisions-home.test.js

Scenario: Root-path references survive only as history
  Given a repository whose product ADRs were moved into the store
  When every tracked file outside the archive and the open change folders is scanned for decisions paths
  Then root-path decisions references remain only in the historical factory notes in PRODUCT.md and the 0001 body
  # Verified by: tests/acceptance/decisions-home.test.js
```

Code: skills/cdd-adr-review/assets/brief-adr.md, skills/cdd-adr-review/SKILL.md, README.md, lib/gherkin.mjs

## ADDED Requirements

### Requirement: Bundled skills follow the pi skill-authoring layout

Every bundled skill directory follows the pi skill-authoring layout convention: `assets/` holds template files the skill instantiates at use, `references/` holds documents read as-is, `scripts/` holds executables — each optional, present only when the skill carries that kind of file. Brief templates are assets, never loose files beside a SKILL.md. Every bundled skill's frontmatter description MUST carry a when/whenever routing clause so the skill surfaces for the right task.

```gherkin
Feature: Bundled skills follow the pi skill-authoring layout

Scenario: No loose brief templates beside a SKILL.md
  Given the bundled skill directories under skills/
  When each directory beside its SKILL.md is listed
  Then no file matching brief-*.md or *-brief.md sits directly beside a SKILL.md
  And every brief template a skill bundles lives under its assets/ directory
  # Verified by: tests/smoke.mjs

Scenario: Every skill description carries a routing when-clause
  Given the bundled skills' SKILL.md frontmatter
  When each description is read
  Then it contains a when/whenever clause (case-insensitive) — the routing signal that surfaces the skill for the right task
  # Verified by: tests/smoke.mjs
```

Code: skills/cdd-code-review/SKILL.md, skills/cdd-spec-review/SKILL.md, skills/cdd-adr-review/SKILL.md, skills/cdd-backlog-triage/SKILL.md, tests/smoke.mjs
