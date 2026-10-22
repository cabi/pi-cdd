## ADDED Requirements

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

Code: skills/cdd-adr-review/brief-adr.md, skills/cdd-adr-review/SKILL.md, README.md, lib/gherkin.mjs

## MODIFIED Requirements

### Requirement: Loop law names three review points

The loop law — the rules text a fresh store renders as `cdd/rules.md` — MUST name review points R1 (conditional: a design gate answering T1 or T2 YES), R2 (always, at draft-green before the first implementation task), and R3 (at Close before archive) with their skills, modes, and findings paths, MUST state the ADR review's precise trigger — decision-content changes fire it; reconfirmations and typo fixes do not — and MUST state the advisory-findings grammar: severities blocker/should/note, dispositions fixed:/open/won't-fix:, never red/green verdicts, gate authority with the deterministic validators and the human. Rule 2a MUST cross-reference, where it names R3, the rule 2b requirement that the standards and spec axes run as two separate cold sessions.

```gherkin
Feature: Loop law names three review points

Scenario: Rule 2a states all three review points and the ADR review
  Given the loop law text rendered into a fresh store's cdd/rules.md
  When the review-points rule is read
  Then it names R1 conditional on a design-gate T1 or T2 YES with skill cdd-spec-review in proposal mode and findings path reviews/r1-proposal-review.md
  And it names R2 always at draft-green before the first implementation task with skill cdd-spec-review in package mode and findings path reviews/r2-change-review.md
  And it names R3 at Close before archive with skill cdd-code-review and findings path reviews/r3-code-review.md
  And it names the conditional ADR review for decision-content changes to ADRs — drafting one or amending its content — not for Reconfirmed-by paragraphs or typo fixes, with skill cdd-adr-review and findings path reviews/adr-review.md
  # Verified by: tests/acceptance/review-wiring.test.js

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

Code: lib/loop-law.mjs, lib/templates.mjs, lib/instructions.mjs, lib/context.mjs, lib/help.mjs, README.md, cdd/rules.md, cdd/decisions/0008-*.md, tests/acceptance/review-wiring.test.js, tests/acceptance/single-source-law.test.js, tests/acceptance/loop-law-hardening.test.js

### Requirement: Declarative style is door-1 law

The authoring corpus and rule 4 prescribe declarative scenarios — observable behavior and outcomes, never interaction mechanics such as keystrokes, widgets, or selectors — and state that imperative step prose is a door-1 review finding. The validator carries exactly 0 style lexicons or step-count heuristics: style is never machine-checked.

```gherkin
Feature: Declarative style is door-1 law

Scenario: Corpus teaches the fenced declarative format
  Given the extension at version 0.4.1
  When the delta template, the delta authoring instruction, and cdd rule 4 are read
  Then each of the 3 names the fenced Feature document with the pin comment inside, and the declarative style clause banning interaction mechanics
  # Verified by: tests/acceptance/gherkin-style-guidance.test.js

Scenario: Imperative step prose stays green
  Given a change delta whose scenario steps phrase interaction mechanics like clicks and keystrokes in otherwise valid gherkin
  When cdd validate runs on the change in draft mode
  Then the verdict is green because style is door-1 judgment and never machine-checked
  # Verified by: tests/acceptance/gherkin-style-guidance.test.js

Scenario: The validator exports no style-checking surface
  Given the gherkin validation module of the extension
  When its exported surface is listed and an imperative scenario body is checked
  Then it exports exactly the fence extraction and fence checking functions and returns 0 style errors for the imperative body
  # Verified by: tests/acceptance/gherkin-style-guidance.test.js
```

Code: scripts/grammar-law.mjs, scripts/spec-drift.mjs, scripts/spec-extract.mjs, scripts/arch-extract.mjs, cdd/scripts/**, lib/gherkin.mjs, lib/validate.mjs, lib/store.mjs, lib/templates.mjs, lib/instructions.mjs, tests/smoke.mjs, tests/acceptance/gherkin-door3.test.js, tests/acceptance/gherkin-parse-gate.test.js, tests/acceptance/gherkin-style-guidance.test.js, tests/acceptance/gherkin-subset.test.js
