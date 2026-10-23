## MODIFIED Requirements

### Requirement: Loop law names three review points

The loop law — the rules text a fresh store renders as `cdd/rules.md` — MUST name review points R1 (conditional: a design gate answering T1 or T2 YES), R2 (always, at draft-green before the first implementation task), and R3 (at Close before archive) with their skills, modes, and findings paths — R3 naming two findings paths, one per review axis: `reviews/r3-standards-code-review.md` for the standards axis and `reviews/r3-spec-code-review.md` for the spec axis — MUST state the ADR review's precise trigger — decision-content changes fire it; reconfirmations and typo fixes do not — and MUST state the advisory-findings grammar: severities blocker/should/note, dispositions fixed:/open/won't-fix:, never red/green verdicts, gate authority with the deterministic validators and the human. Rule 2a MUST cross-reference, where it names R3, the rule 2b requirement that the standards and spec axes run as two separate cold sessions.

```gherkin
Feature: Loop law names three review points

Scenario: Rule 2a states all three review points and the ADR review
  Given the loop law text rendered into a fresh store's cdd/rules.md
  When the review-points rule is read
  Then it names R1 conditional on a design-gate T1 or T2 YES with skill cdd-spec-review in proposal mode and findings path reviews/r1-proposal-review.md
  And it names R2 always at draft-green before the first implementation task with skill cdd-spec-review in package mode and findings path reviews/r2-change-review.md
  And it names R3 at Close before archive with skill cdd-code-review and findings paths reviews/r3-standards-code-review.md for the standards axis and reviews/r3-spec-code-review.md for the spec axis
  And it names the conditional ADR review for decision-content changes to ADRs — drafting one or amending its content — not for Reconfirmed-by paragraphs or typo fixes, with skill cdd-adr-review and findings path reviews/adr-review.md
  # Verified by: tests/acceptance/review-wiring.test.js

Scenario: R3 findings are per-axis in law and store mirror
  Given the loop law text rendered into a fresh store's cdd/rules.md and this repository's store copy cdd/rules.md
  When rule 2a is read
  Then each names reviews/r3-standards-code-review.md as the standards-axis findings path and reviews/r3-spec-code-review.md as the spec-axis findings path, 2 distinct files
  # Verified by: tests/acceptance/r3-findings.test.js

Scenario: The R3 review point carries one findings path per axis
  Given the loop law module's review points
  When rule 2a is rendered from them
  Then the R3 entry carries findingsStandards reviews/r3-standards-code-review.md and findingsSpec reviews/r3-spec-code-review.md and no single findings field
  And the render names every review point's skill and the basename of every findings path it carries
  # Verified by: tests/acceptance/single-source-law.test.js

Scenario: Rule 2a states the one decisions home
  Given the loop law text rendered into a fresh store's cdd/rules.md
  When the review-points rule is read
  Then it names cdd/decisions as the home of every ADR — 0001 through 0007 the product decisions, 0008 and later the loop decisions — and states there is no second decisions directory
  # Verified by: tests/acceptance/single-source-law.test.js

Scenario: Findings grammar is advisory, never verdicts
  Given the loop law text rendered into a fresh store's cdd/rules.md
  When the review-points rule is read
  Then it states the 3 severities blocker, should, and note and the 3 dispositions fixed:, open, and won't-fix:
  And it states that reviews never produce red or green verdicts and gate authority stays with the deterministic validators and the human
  # Verified by: tests/acceptance/review-wiring.test.js

Scenario: The change loop carries the review points
  Given the loop law text rendered into a fresh store's cdd/rules.md
  When the change loop of the loop law is read
  Then it places R1 after the proposal, R2 at draft-green, and R3 before archive
  # Verified by: tests/acceptance/review-wiring.test.js

Scenario: The repository's own store copy and README match the law
  Given this repository's store copy cdd/rules.md and its README driving-the-loop table
  When both are read
  Then the store copy carries the same review-points rule as the loop law
  And the README review-points row names the review-point triggers and points at cdd/rules.md rule 2a, naming no skill, mode, or findings path
  # Verified by: tests/acceptance/review-wiring.test.js

Scenario: Ambient and help statements match the law
  Given the ambient context block and the help text of the extension
  When both are read
  Then each names R1, R2, and R3 with the same triggers as the review-points rule
  # Verified by: tests/acceptance/review-wiring.test.js

Scenario: Rule 2a cross-references the two-sessions rule
  Given the loop law text rendered into a fresh store's cdd/rules.md
  When rule 2a is read where it names R3
  Then it cross-references the rule 2b requirement that the standards and spec axes run as two separate cold sessions
  # Verified by: tests/acceptance/loop-law-hardening.test.js
```

Code: lib/loop-law.mjs, lib/templates.mjs, lib/instructions.mjs, lib/context.mjs, lib/help.mjs, README.md, cdd/rules.md, cdd/decisions/0008-*.md, tests/acceptance/review-wiring.test.js, tests/acceptance/single-source-law.test.js, tests/acceptance/loop-law-hardening.test.js, tests/acceptance/r3-findings.test.js

### Requirement: Tasks template scaffolds review tasks

The tasks scaffold MUST place a `3.1 Change review` task (skill `cdd-spec-review`, package mode, once the change package is drafted and validates green in draft mode, findings at `reviews/r2-change-review.md`, ticks only when no blocker is open) before the single placeholder implementation task, MUST place in the Close section — before the validate-and-guard and archive items — two code-review tasks (skill `cdd-code-review`, one per review axis: the standards axis with findings at `reviews/r3-standards-code-review.md`, the spec axis with findings at `reviews/r3-spec-code-review.md`, each task naming its axis and its own findings file) and a conditional ADR-review task (skill `cdd-adr-review`, findings at `reviews/adr-review.md`, skip recorded on the task line when the change made no ADR decision-content change — drafting an ADR or amending one's content counts; a Reconfirmed-by paragraph or typo fix does not), and its embedded instruction text MUST explain these clauses and the advisory-findings rule. The smoke suite MUST pin these scaffolds.

```gherkin
Feature: Tasks template scaffolds review tasks

Scenario: Change review precedes the first implementation task
  Given a scaffolded tasks.md from a fresh change
  When the implementation section is read top to bottom
  Then item 3.1 is the change review naming skill cdd-spec-review in package mode once the package is drafted and validates green in draft mode
  And it names findings path reviews/r2-change-review.md
  And it states the task ticks only when no blocker is open
  And exactly 1 placeholder implementation task follows it
  # Verified by: tests/acceptance/review-wiring.test.js

Scenario: Close gates archive on disposed reviews
  Given a scaffolded tasks.md from a fresh change
  When the Close section is read top to bottom
  Then the first Close item runs skill cdd-code-review on the standards axis with findings path reviews/r3-standards-code-review.md
  And the second runs skill cdd-code-review on the spec axis with findings path reviews/r3-spec-code-review.md
  And the third runs skill cdd-adr-review on ADRs whose decision content this change drafted or amended, with findings path reviews/adr-review.md and a skip recorded on the task line when no ADR decision content changed
  And it states on the task line that a Reconfirmed-by paragraph or typo fix is not a decision-content change
  And all 3 precede the validate-and-guard item and the archive item
  # Verified by: tests/acceptance/review-wiring.test.js

Scenario: The tasks instruction carries the review clauses
  Given a scaffolded tasks.md from a fresh change
  When the embedded instruction text is read
  Then it explains the change-review task at draft-green and the Close review items
  And it states reviews are advisory findings with severities and dispositions, never verdicts
  # Verified by: tests/acceptance/review-wiring.test.js

Scenario: Smoke pins the review scaffolds
  Given the smoke suite of the extension
  When it runs against a fresh scaffold
  Then exactly 1 check pins the change-review scaffold and the Close review tasks
  # Verified by: tests/smoke.mjs
```

Code: lib/templates.mjs, lib/instructions.mjs, lib/context.mjs, lib/help.mjs, cdd/rules.md, cdd/decisions/0008-*.md, tests/acceptance/review-wiring.test.js, tests/smoke.mjs

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
  Then it points at the brief templates living next to it
  # Verified by: tests/acceptance/loop-law-hardening.test.js

Scenario: Smoke pins the briefs structurally
  Given the smoke suite of the extension
  When it runs against the five brief templates
  Then exactly 1 check pins their presence, the law citations, the findings grammar, and the output-filename lines
  # Verified by: tests/smoke.mjs
```

Code: skills/cdd-spec-review/brief-r1.md, skills/cdd-spec-review/brief-r2.md, skills/cdd-code-review/brief-r3-standards.md, skills/cdd-code-review/brief-r3-spec.md, skills/cdd-adr-review/brief-adr.md, skills/cdd-spec-review/SKILL.md, skills/cdd-code-review/SKILL.md, tests/smoke.mjs, tests/acceptance/loop-law-hardening.test.js, tests/acceptance/design-docs.test.js, tests/acceptance/r3-findings.test.js

## ADDED Requirements

### Requirement: Proposal scaffold carries a Capabilities section

The proposal scaffold MUST render a `## Capabilities` section with a placeholder line instructing which specs the change creates or modifies — the same section the embedded proposal instruction names among its required sections — and the draft validator MUST flag that placeholder as unfilled exactly as it flags the other scaffold placeholders.

```gherkin
Feature: Proposal scaffold carries a Capabilities section

Scenario: The scaffold renders the section
  Given the proposal scaffold rendered by a fresh change
  When its sections are read top to bottom
  Then it carries a ## Capabilities heading with a placeholder line instructing which specs are created or modified
  And the embedded instruction text in the same scaffold names Capabilities among the required sections
  # Verified by: tests/acceptance/r3-findings.test.js

Scenario: The Capabilities placeholder blocks draft green
  Given a scaffolded proposal whose every other placeholder is filled with minimal content and only the Capabilities placeholder is kept
  When draft validation runs on it
  Then the proposal artifact is red with the template placeholders still unfilled error
  # Verified by: tests/acceptance/r3-findings.test.js
```

Code: lib/templates.mjs, lib/validate.mjs, tests/acceptance/r3-findings.test.js
