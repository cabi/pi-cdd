# gherkin — living spec

## Requirements

### Requirement: Scenario bodies are parse-valid Gherkin

Every requirement carries exactly one fenced ` ```gherkin ` block holding one complete Gherkin document whose `Feature:` name equals the requirement heading. The official `@cucumber/gherkin` parser is the arbiter of validity at `cdd validate` (draft and strict) and at archive; parse failures are errors, and every error names the file, the requirement, and the markdown line number of the defect. Old-format residue — `#### Scenario:` markdown headings, markdown `Verified by:` pins outside the fence — is an error.

```gherkin
Feature: Scenario bodies are parse-valid Gherkin

Scenario: Parseable Feature fence passes the gate
  Given a change delta whose every requirement carries one fenced gherkin Feature document
  When cdd validate runs on the change in draft mode
  Then the verdict is green with exactly 0 errors
  # Verified by: tests/acceptance/gherkin-parse-gate.test.js

Scenario: Broken fence fails naming the markdown line
  Given a change delta containing exactly 1 requirement whose fenced Feature document holds invalid gherkin syntax
  When cdd validate runs on the change in draft mode
  Then the verdict is red and the error message names the delta file, the requirement, and the markdown line number of the syntax defect
  # Verified by: tests/acceptance/gherkin-parse-gate.test.js

Scenario: Feature name must equal the requirement heading
  Given a change delta containing exactly 1 requirement whose fenced Feature name differs from its heading
  When cdd validate runs on the change in draft mode
  Then the verdict is red with exactly 1 error naming both the heading and the Feature name
  # Verified by: tests/acceptance/gherkin-parse-gate.test.js

Scenario: Old-format residue is rejected loudly
  Given a change delta containing exactly 1 requirement with a markdown scenario heading or a markdown Verified by pin outside the fence
  When cdd validate runs on the change in draft mode
  Then the verdict is red with 1 error per residue naming the old construct and the ADR that replaced it
  # Verified by: tests/acceptance/gherkin-parse-gate.test.js

Scenario: A requirement without a fence fails
  Given a change delta containing exactly 1 requirement with prose and no fenced gherkin Feature document
  When cdd validate runs on the change in draft mode
  Then the verdict is red with exactly 1 error demanding one fenced Feature block
  # Verified by: tests/acceptance/gherkin-parse-gate.test.js

Scenario: Strict mode flags a pin whose file does not exist
  Given a change delta whose scenario pins 1 acceptance test path that does not exist in the repository
  When cdd validate runs on the change in strict mode
  Then the verdict is red with exactly 1 error naming the pinned path and the draft verdict stays green
  # Verified by: tests/acceptance/gherkin-parse-gate.test.js
```

### Requirement: Gherkin subset limits

The cdd dialect is a closed subset of Gherkin: the step keywords `Given`, `When`, `Then`, `And`, `But` in English, exactly one `When` per scenario, at least 1 `Then`, and `And`/`But` only continuing a prior step. Scenario names are unique within a requirement and each requirement holds exactly one fence. Anything else the grammar allows — `Background`, `Rule`, tags, `Scenario Outline` with `Examples`, data tables, doc strings, asterisk or localized keywords, prose inside the fence, comments other than the pin — is an error naming the rejected construct. The subset laws are defined exactly once, in the law module, and enforced by every parser-bearing door: `cdd validate` and the door 3 full scan. The pin grammar exists in exactly one dialect: the strict `# Verified by:` fence comment.

```gherkin
Feature: Gherkin subset limits

Scenario: Construct outside the subset fails naming it
  Given a change delta containing exactly 1 fenced Feature document using a construct outside the cdd subset
  When cdd validate runs on the change in draft mode
  Then the verdict is red with an error naming the rejected construct among Background, Rule, tags, Scenario Outline, data tables, doc strings, and non-English or asterisk keywords
  # Verified by: tests/acceptance/gherkin-subset.test.js

Scenario: Second When fails validation
  Given a change delta containing exactly 1 scenario whose fenced body holds 2 When steps
  When cdd validate runs on the change in draft mode
  Then the verdict is red with an error stating the scenario must hold exactly one When step
  # Verified by: tests/acceptance/gherkin-subset.test.js

Scenario: Missing Then fails validation
  Given a change delta containing exactly 1 scenario whose fenced body holds 1 When step and 0 Then steps
  When cdd validate runs on the change in draft mode
  Then the verdict is red with an error stating the scenario must hold at least 1 Then step
  # Verified by: tests/acceptance/gherkin-subset.test.js

Scenario: A scenario cannot start with And or But
  Given a change delta containing exactly 1 scenario whose first step starts with And
  When cdd validate runs on the change in draft mode
  Then the verdict is red with an error stating And and But continue a prior step
  # Verified by: tests/acceptance/gherkin-subset.test.js

Scenario: Prose stays outside the fence
  Given a change delta containing exactly 1 fenced Feature document with prose between the Feature line and the first Scenario or between a Scenario and its steps
  When cdd validate runs on the change in draft mode
  Then the verdict is red with an error per prose line locating the stray prose
  # Verified by: tests/acceptance/gherkin-subset.test.js

Scenario: The pin comment is the only legal comment
  Given a change delta containing exactly 1 fenced Feature document with a comment that is not a Verified by pin
  When cdd validate runs on the change in draft mode
  Then the verdict is red with an error stating the only legal comment is the scenario pin
  # Verified by: tests/acceptance/gherkin-subset.test.js

Scenario: Every scenario ends with exactly one pin
  Given a change delta containing exactly 1 fenced Feature document where a scenario lacks its pin or carries 2 pins
  When cdd validate runs on the change in draft mode
  Then the verdict is red with an error naming the scenario and demanding exactly one Verified by pin as its last line
  # Verified by: tests/acceptance/gherkin-subset.test.js

Scenario: Scenario names are unique within a requirement
  Given a change delta containing exactly 1 requirement whose fenced Feature document holds 2 scenarios with the same name
  When cdd validate runs on the change in draft mode
  Then the verdict is red with exactly 1 error naming the duplicated scenario name
  # Verified by: tests/acceptance/gherkin-subset.test.js

Scenario: One Feature fence per requirement
  Given a change delta containing exactly 1 requirement holding 2 gherkin fences
  When cdd validate runs on the change in draft mode
  Then the verdict is red with exactly 1 error demanding exactly one Feature document per requirement
  # Verified by: tests/acceptance/gherkin-subset.test.js

Scenario: Door 3 enforces the subset on living fences
  Given a repository whose living spec holds exactly 1 fence whose scenario carries 2 When steps
  When the door 3 full scan runs
  Then the scan exits non-zero with exactly 1 error in door 1's exact wording, naming the living spec file and the two-When defect
  # Verified by: tests/acceptance/gherkin-door3.test.js

Scenario: Exactly one pin dialect at the extractors
  Given a repository whose living spec holds exactly 1 strict fence-comment pin and exactly 1 markdown Verified by line outside any fence
  When the spec extractor runs
  Then it reports exactly 1 pin — the strict fence comment
  # Verified by: tests/acceptance/gherkin-door3.test.js
```

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

### Requirement: Door 3 re-lints every fence

The door 3 full scan parses every fence in living specs and open deltas with the same arbiter as `cdd validate`, and enforces the same subset laws — one law module defines them, and its copy travels inside `cdd/scripts/` beside the guard. When `@cucumber/gherkin` cannot be imported in the adopting project, the scan exits non-zero with exactly 1 actionable message containing the install command. Door 2 pre-commit checks stay zero-dependency and never import the parser. `cdd init` refreshes the `cdd/scripts/*` copies on an existing store so a frozen store can catch up to the law it is held to.

```gherkin
Feature: Door 3 re-lints every fence

Scenario: Door 3 rejects a broken living-spec fence
  Given a repository whose living spec contains exactly 1 fence with invalid gherkin syntax
  When the door 3 full scan runs
  Then the scan exits non-zero with exactly 1 error naming the living spec file and the markdown line number
  # Verified by: tests/acceptance/gherkin-door3.test.js

Scenario: Missing parser fails loudly at door 3
  Given a repository where the @cucumber/gherkin package cannot be imported
  When the door 3 full scan runs
  Then the scan exits non-zero with exactly 1 message containing the exact devDependency install command
  # Verified by: tests/acceptance/gherkin-door3.test.js

Scenario: An existing store refreshes its door scripts at init
  Given a repository with an existing cdd store whose cdd/scripts/ copies differ from the extension's
  When cdd init runs on that store
  Then the store's cdd/scripts/* files are re-copied and the refreshed files are listed in the output
  Then missing git hooks are installed and existing hooks are left untouched
  # Verified by: tests/acceptance/gherkin-door3.test.js

Scenario: Hook-health advice names a command that works on existing stores
  Given a repository whose git hooks wiring is stale
  When the door 3 full scan runs
  Then the hook-health finding advises a command that succeeds on a repository that already has a store
  # Verified by: tests/acceptance/gherkin-door3.test.js
```

### Requirement: The scaffold passes its own doors

The harness scaffolds a change whose artifacts carry only placeholder findings until filled; a minimal fill relative to the template output reaches strict green and archives through the one-call close.

```gherkin
Feature: The scaffold passes its own doors

Scenario: A fresh scaffold is draft-red on placeholders only
  Given a store holding 1 change scaffolded by createChange with capability gherkin
  When cdd validate runs on the change in draft mode
  Then the verdict is red with exactly 3 errors, one per scaffolded artifact, and every error names template placeholders still unfilled
  # Verified by: tests/smoke.mjs

Scenario: A minimally filled scaffold goes strict-green
  Given the scaffolded change filled by replacing template placeholders with minimal content and pinning 1 existing acceptance file
  When cdd validate runs on the change in strict mode
  Then the verdict is green with 0 errors
  # Verified by: tests/smoke.mjs

Scenario: The chain archives and merges into the living spec
  Given the strict-green scaffolded change
  When the archive library call runs on that change
  Then the change folder moves under the archive and the living spec holds the scaffolded requirement
  # Verified by: tests/smoke.mjs

Scenario: Doorway pins are honest across the node matrix
  Given the smoke pin that executes the extension entry directly
  When the runtime node cannot execute TypeScript files (no type stripping)
  Then the pin asserts the invariant — a loud nonzero exit, never silent success — instead of the strip-capable usage-line contract
  # Verified by: tests/smoke.mjs
```

Code: tests/smoke.mjs, lib/templates.mjs

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

Code: lib/loop-law.mjs, lib/templates.mjs, lib/instructions.mjs, lib/context.mjs, lib/help.mjs, README.md, cdd/rules.md, tests/acceptance/review-wiring.test.js, tests/acceptance/single-source-law.test.js, tests/acceptance/loop-law-hardening.test.js, tests/acceptance/r3-findings.test.js

### Requirement: Proposal instruction carries the R1 review tail

The proposal scaffold's embedded instruction text MUST tell the author that after the proposal is drafted, a design gate answering T1 (cross-cutting) or T2 (architecture bet) YES triggers skill `cdd-spec-review` in proposal mode, with findings at the change's `reviews/r1-proposal-review.md`, and that every open blocker is disposed before drafting the delta.

```gherkin
Feature: Proposal instruction carries the R1 review tail

Scenario: The scaffolded proposal names the conditional R1 review
  Given a scaffolded proposal.md from a fresh change
  When the embedded instruction text is read
  Then it states that a design gate answering T1 or T2 YES triggers skill cdd-spec-review in proposal mode after the proposal is drafted
  And it names findings path reviews/r1-proposal-review.md
  And it states every open blocker is disposed before drafting the delta
  # Verified by: tests/acceptance/review-wiring.test.js
```

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

Code: lib/templates.mjs, lib/instructions.mjs, lib/context.mjs, lib/help.mjs, cdd/rules.md, tests/acceptance/review-wiring.test.js, tests/smoke.mjs

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

Code: lib/loop-law.mjs, lib/templates.mjs, lib/context.mjs, lib/help.mjs, cdd/rules.md, tests/acceptance/review-wiring.test.js, tests/acceptance/design-docs.test.js

### Requirement: Advisory-findings ADR is drafted

`cdd/decisions/` MUST hold ADR-0008 stating that model-run reviews are advisory findings, never verdicts. It is drafted with `status: draft` (a valid status the human resolves) and, once the human resolves it at Close, its frontmatter carries the resolved status; the drift guard MUST hold no violation against it in either state.

```gherkin
Feature: Advisory-findings ADR is drafted

Scenario: ADR-0008 states the advisory-findings decision
  Given the decision directory cdd/decisions/
  When ADR-0008 is read
  Then its frontmatter status is accepted (resolved by the human sponsor at Close; drafted as draft for the human to resolve) and its body states that model-run reviews are advisory findings, never verdicts
  # Verified by: tests/acceptance/review-wiring.test.js

Scenario: The guard accepts the draft status
  Given ADR-0008 with frontmatter status draft or accepted
  When the drift guard runs over the repository
  Then the guard output holds no violation naming ADR-0008
  # Verified by: tests/acceptance/review-wiring.test.js
```

Code: lib/context.mjs, lib/help.mjs, cdd/rules.md, tests/acceptance/review-wiring.test.js

### Requirement: The loop law is single-sourced

The loop-law facts — the loop chain, the review points with their trigger phrases, skills, modes, and findings paths, and the advisory-findings grammar — MUST be defined in exactly 1 module of the extension source (`lib/loop-law.mjs`); every other statement surface MUST render or interpolate from that module, and the README MUST carry only a trigger summary plus a pointer to the law.

```gherkin
Feature: The loop law is single-sourced

Scenario: Every statement surface renders the module's facts
  Given lib/loop-law.mjs and the statement surfaces of the extension — the loop law text, the proposal scaffold instruction, the tasks scaffold instruction, the ambient context block, and the help text
  When each surface's named review-point facts are read
  Then each equals the module's canonical values and no surface defines a fact independently
  # Verified by: tests/acceptance/single-source-law.test.js

Scenario: Re-sourcing leaves the law text byte-identical
  Given the loop law text and the module's renderers
  When the review-points rules of the law text are rendered
  Then the rendered text is byte-identical to this repository's store copy cdd/rules.md
  # Verified by: tests/acceptance/single-source-law.test.js
```

Code: lib/loop-law.mjs, tests/acceptance/single-source-law.test.js

### Requirement: Single-source ADR is drafted

`cdd/decisions/` MUST hold ADR-0009 recording that the loop law is single-sourced in `lib/loop-law.mjs` with every statement surface deriving from it, chosen over mirror, generator, and pointer-only alternatives. It is drafted with `status: draft` (a valid status the human resolves) and, once the human resolves it at Close, its frontmatter carries the resolved status; the drift guard MUST hold no violation against it in either state. The requirement claims its enforcement pin, not the ADR itself — decision memory answers to the A-checks.

```gherkin
Feature: Single-source ADR is drafted

Scenario: ADR-0009 states the single-source decision
  Given the decision directory cdd/decisions/
  When ADR-0009 is read
  Then its frontmatter status is draft or accepted (drafted as draft for the human sponsor to resolve at Close) and its body records the single-source mechanism chosen over mirror, generator, and pointer-only alternatives
  # Verified by: tests/acceptance/single-source-law.test.js

Scenario: The guard accepts the draft status
  Given ADR-0009 with frontmatter status draft or accepted
  When the drift guard runs over the repository
  Then the guard output holds no violation naming ADR-0009
  # Verified by: tests/acceptance/single-source-law.test.js
```

Code: tests/acceptance/single-source-law.test.js

### Requirement: Reviews run cold

The loop law MUST state reviewer independence as rule 2b — the reviewer is not the author of the artifacts under review; every model-run review runs as a cold sub-agent session, and a same-session re-read is the lawful but weaker fallback, which MUST record itself and its justification in the findings file header. Rule 2b MUST also require that the reviewer's model family differs from the author's — family meaning the same provider or model lineage — with the author stopping to ask the human sponsor rather than silently degrading when no other-family reviewer exists, and that R3's standards and spec axes run as two separate cold sessions. The findings grammar MUST name the 2 reviewer forms, and the three bundled review skills MUST cite rule 2b and carry only the procedure.

```gherkin
Feature: Reviews run cold

Scenario: Rule 2b states the independence law
  Given the loop law text rendered into a fresh store's cdd/rules.md
  When rule 2b is read
  Then it states the principle that the reviewer is not the author of the artifacts under review
  And it requires every model-run review to run as a cold sub-agent session
  And it names the same-session re-read as the lawful but weaker fallback
  And it requires a non-cold review to record the fallback and its justification in the findings file header
  # Verified by: tests/acceptance/reviewer-independence.test.js

Scenario: Rule 2b separates author and reviewer families
  Given the loop law text rendered into a fresh store's cdd/rules.md
  When rule 2b is read
  Then it requires the reviewer's model family to differ from the author's, family meaning the same provider or model lineage
  And it requires the author to stop and ask the human sponsor rather than silently degrade when no reviewer of another family exists
  # Verified by: tests/acceptance/loop-law-hardening.test.js

Scenario: Rule 2b separates R3's two axes into two cold sessions
  Given the loop law text rendered into a fresh store's cdd/rules.md
  When rule 2b is read where it governs R3
  Then it requires the standards axis and the spec axis to run as two separate cold sessions, each with its own brief
  # Verified by: tests/acceptance/loop-law-hardening.test.js

Scenario: Statement surfaces render the independence fact from the module
  Given lib/loop-law.mjs and the 4 rendered statement surfaces — the proposal scaffold instruction, the tasks scaffold instruction, the ambient context block, and the help text
  When each surface's independence statement is read
  Then each renders or interpolates the module's canonical reviewer-independence phrases
  And none of the 4 states those phrases independently
  # Verified by: tests/acceptance/reviewer-independence.test.js

Scenario: The skills cite rule 2b and carry the procedure
  Given the 3 bundled review skills cdd-spec-review, cdd-code-review, and cdd-adr-review
  When each skill is read
  Then each cites loop law rule 2b for the reviewer-independence requirement without restating the law
  And each names the cold-reviewer procedure of a fresh session briefed from paths on disk, never curated content
  And each states that a fallback review records its form and justification in the findings file header
  And cdd-code-review requires both axis sub-agents to run cold
  # Verified by: tests/acceptance/reviewer-independence.test.js

Scenario: The findings grammar names the reviewer forms
  Given the findings-grammar fact of lib/loop-law.mjs
  When the grammar is read
  Then it names exactly 2 reviewer forms: cold sub-agent and same-session re-read
  # Verified by: tests/acceptance/reviewer-independence.test.js

Scenario: Re-sourcing rule 2b leaves the law byte-identical
  Given the rule 2b renderer of lib/loop-law.mjs and this repository's store copy cdd/rules.md
  When rule 2b is rendered from the module
  Then the rendered text is byte-identical to the rule 2b slice of the store copy
  # Verified by: tests/acceptance/reviewer-independence.test.js
```

Code: lib/loop-law.mjs, lib/templates.mjs, lib/instructions.mjs, lib/context.mjs, cdd/rules.md, skills/cdd-spec-review/SKILL.md, skills/cdd-code-review/SKILL.md, skills/cdd-adr-review/SKILL.md, tests/acceptance/reviewer-independence.test.js, tests/acceptance/loop-law-hardening.test.js

### Requirement: Reviewer-independence ADR is drafted

`cdd/decisions/` MUST hold ADR-0010 recording reviewer independence as loop law rule 2b, chosen over skills-only guidance, validator enforcement, and hard-ban alternatives; because this change edits files under their `code:` globs, ADR-0008 and ADR-0009 MUST carry reconfirm notes naming it. ADR-0010 is drafted with `status: draft` (a valid status the human resolves) and, once resolved at Close, its frontmatter carries the resolved status; the drift guard MUST hold no violation against it in either state. The loop-law-hardening change MUST amend ADR-0010 with a dated section recording the author-family clause and the two-axes-two-sessions clause as rule 2b law — noting ADR-0010's prior silence on both — under the amend choice rather than supersede.

```gherkin
Feature: Reviewer-independence ADR is drafted

Scenario: ADR-0010 states the reviewer-independence decision
  Given the decision directory cdd/decisions/
  When ADR-0010 is read
  Then its frontmatter status is draft or accepted (drafted as draft for the human sponsor to resolve at Close) and its body records reviewer independence as law rule 2b chosen over skills-only guidance, validator enforcement, and hard-ban alternatives
  # Verified by: tests/acceptance/reviewer-independence.test.js

Scenario: ADR-0008 and ADR-0009 carry reconfirm notes
  Given the decision directory cdd/decisions/
  When ADR-0008 and ADR-0009 are read
  Then each carries a reconfirm note naming change reviewer-not-author
  # Verified by: tests/acceptance/reviewer-independence.test.js

Scenario: The guard accepts the draft status
  Given ADR-0010 with frontmatter status draft or accepted
  When the drift guard runs over the repository
  Then the guard output holds no violation naming ADR-0010
  # Verified by: tests/acceptance/reviewer-independence.test.js

Scenario: ADR-0010 carries the rule-2b amendment
  Given the decision directory cdd/decisions/ and the loop-law-hardening change
  When ADR-0010 is read
  Then a dated amendment section records the author-family clause and the two-axes-two-sessions clause as rule 2b law, noting the prior silence on both
  And it records why amend was chosen over supersede: the core decision stands and one weighting tightens
  # Verified by: tests/acceptance/loop-law-hardening.test.js
```

Code: tests/acceptance/reviewer-independence.test.js, tests/acceptance/loop-law-hardening.test.js

### Requirement: Guard tolerates scaffold placeholders in open deltas

The door 3 full scan treats a placeholder pin inside an open-delta spec (`cdd/changes/*/specs/`) as template text, not a claim: it does not fail the pin-resolution check and is reported as skipped, one informational line per open delta after the verdict — a skip is never silent. A placeholder pin is a `# Verified by:` pin whose path contains the scaffold's placeholder marker: the angle-bracket form of the words `scenario` or `name`, spelled here without its brackets because the draft door flags the literal token strings as unfilled (`lib/validate.mjs`) — the guard and the draft door agree on this token family. Any other angle-bracket shape is not a placeholder: it fails L1 even in an open delta, so the guard never silently greens an unrecognized token. Living specs keep full strictness — a placeholder pin there is an unresolvable pin like any other. The predicate lives in the grammar law module (`scripts/grammar-law.mjs`, `LAW_VERSION` 2) and the store copies travel with their sources: `cdd/scripts/grammar-law.mjs`, `cdd/scripts/spec-drift.mjs`, and `cdd/scripts/adr-index.mjs` are byte-identical to them in this repository, and adopting stores pick all three up when `cdd init` refreshes `cdd/scripts/*`.

```gherkin
Feature: Guard tolerates scaffold placeholders in open deltas

Scenario: Placeholder pin in an open delta stays green with a skip line
  Given a store whose full scan exits 0
  And an open delta spec pinning exactly 1 acceptance-test path containing a placeholder marker (angle-bracket `scenario`)
  When the door 3 full scan runs
  Then the scan exits 0 and prints exactly 1 skip line reporting 1 placeholder pin skipped and naming the open delta
  # Verified by: tests/acceptance/gherkin-guard-placeholder.test.js

Scenario: Placeholder pin in a living spec stays red
  Given a store whose full scan exits 0 except for a living spec pinning exactly 1 acceptance-test path containing a placeholder marker (angle-bracket `scenario`)
  When the door 3 full scan runs
  Then the scan exits non-zero with exactly 1 pin-resolution issue naming the living spec and prints no placeholder-skip line
  # Verified by: tests/acceptance/gherkin-guard-placeholder.test.js

Scenario: Resolved pin in an open delta prints no skip line
  Given a store whose full scan exits 0
  And an open delta spec pinning exactly 1 existing acceptance-test file with no placeholder marker
  When the door 3 full scan runs
  Then the scan exits 0 and prints no placeholder-skip line
  # Verified by: tests/acceptance/gherkin-guard-placeholder.test.js

Scenario: Unrecognized marker shape in an open delta stays red
  Given a store whose full scan exits 0
  And an open delta spec pinning exactly 1 acceptance-test path containing a marker shape the template never emits (angle-bracket `flavor`)
  When the door 3 full scan runs
  Then the scan exits non-zero with exactly 1 pin-resolution issue naming the delta spec and prints no placeholder-skip line
  # Verified by: tests/acceptance/gherkin-guard-placeholder.test.js

Scenario: Store copies stay byte-identical to the law sources
  Given this repository's store after the change
  When the store copies are compared with their sources
  Then cdd/scripts/grammar-law.mjs is byte-identical to scripts/grammar-law.mjs, cdd/scripts/spec-drift.mjs is byte-identical to scripts/spec-drift.mjs, and cdd/scripts/adr-index.mjs is byte-identical to scripts/adr-index.mjs, and the law reports LAW_VERSION 2
  # Verified by: tests/acceptance/gherkin-guard-placeholder.test.js
```

Code: scripts/grammar-law.mjs, scripts/spec-drift.mjs, lib/templates.mjs, tests/acceptance/gherkin-guard-placeholder.test.js, tests/acceptance/gherkin-door3.test.js

### Requirement: A new change reports the store verdict at start

`createChange` runs the store's door 3 full scan (`cdd/scripts/spec-drift.mjs`) before writing any artifact, capturing both stdout and stderr. The verdict travels in `preexistingRed` as a list of strings: empty when the scan exits 0; otherwise one entry per issue line the guard printed on stderr — the indented, bracket-tagged issue lines, verbatim, in order; the guard's summary line and everything on stdout are not findings. If the guard exits non-zero with no issue lines, it aborted rather than scanned (for example `@cucumber/gherkin` missing): `preexistingRed` then holds exactly 1 entry stating the guard could not complete, carrying the guard's own abort message. If the guard script is missing or cannot start, exactly 1 entry states the guard could not run. The scaffold always proceeds; the verdict is a warning, never a gate.

```gherkin
Feature: A new change reports the store verdict at start

Scenario: A red store yields the findings and still scaffolds
  Given a store whose door 3 full scan exits 1 with exactly 2 issue lines on stderr
  When createChange scaffolds a new change
  Then the scaffold succeeds and preexistingRed holds exactly those 2 issue lines verbatim, in order
  # Verified by: tests/acceptance/gherkin-create-warning.test.js

Scenario: A green store yields an empty warning
  Given a store whose door 3 full scan exits 0
  When createChange scaffolds a new change
  Then the result carries an empty preexistingRed list
  # Verified by: tests/acceptance/gherkin-create-warning.test.js

Scenario: A guard abort without issue lines is a could-not-complete finding
  Given a store whose door 3 full scan exits 1 printing an abort message and no issue lines
  When createChange scaffolds a new change
  Then the scaffold succeeds and preexistingRed holds exactly 1 entry stating the guard could not complete, carrying the abort message
  # Verified by: tests/acceptance/gherkin-create-warning.test.js

Scenario: A missing guard script yields a could-not-run finding
  Given a store whose cdd/scripts/spec-drift.mjs does not exist
  When createChange scaffolds a new change
  Then the scaffold succeeds and preexistingRed holds exactly 1 entry stating the guard could not run
  # Verified by: tests/acceptance/gherkin-create-warning.test.js
```

Code: lib/store.mjs, tests/acceptance/gherkin-create-warning.test.js

### Requirement: The loop law names the pins' executor

The loop law's test-first rule (rule 7) MUST name the executor of Verified-by pins — `npm test`, whose `node --test` sweep executes every `tests/acceptance/*.test.js` suite, the same entrypoint CI runs — and the store copy `cdd/rules.md` MUST carry the sentence byte-identically to the law source.

```gherkin
Feature: The loop law names the pins' executor

Scenario: Rule 7 names the executor
  Given the loop law text
  When rule 7 is read
  Then it states that npm test runs the node --test sweep executing every tests/acceptance/*.test.js suite and that CI runs the same entrypoint
  # Verified by: tests/acceptance/law-pin-executor.test.js

Scenario: The sentence has exactly 1 home
  Given the law source and the store copy cdd/rules.md
  When the executor sentence is searched for in both
  Then both carry it with identical wording
  # Verified by: tests/acceptance/law-pin-executor.test.js
```

Code: lib/templates.mjs, cdd/rules.md, tests/acceptance/law-pin-executor.test.js

### Requirement: Library modules refuse silent direct execution

Running the validator library, the backlog module, or the grammar module directly as a node command MUST print exactly one usage line to stderr naming the real invocations and exit 2 instead of silently succeeding; importing any of them as a library MUST stay silent. The check MUST behave identically in the scripts/ source and the verbatim cdd/scripts/ store copy.

```gherkin
Feature: Library modules refuse silent direct execution

Scenario: Direct execution of the validator prints usage
  Given the repository working tree
  When node runs lib/validate.mjs directly as a command
  Then it prints exactly one usage line to stderr naming the cdd tool's validate operation and exits with code 2
  # Verified by: tests/acceptance/library-usage.test.js

Scenario: Direct execution of the grammar module prints usage in both locations
  Given the grammar module in scripts/ and its verbatim store copy in cdd/scripts/
  When node runs each directly as a command
  Then each prints the same one usage line to stderr naming the door commands spec-drift, spec-extract, and arch-extract, and exits with code 2
  # Verified by: tests/acceptance/library-usage.test.js

Scenario: Direct execution of the backlog module prints usage
  Given the repository working tree
  When node runs lib/backlog.mjs directly as a command
  Then it prints exactly one usage line to stderr naming the cdd tool's backlog operation and exits with code 2
  # Verified by: tests/acceptance/library-usage.test.js

Scenario: Library imports stay silent
  Given the same modules
  When a node program imports each as a library
  Then neither module prints anything on stdout or stderr and the import completes normally
  # Verified by: tests/acceptance/library-usage.test.js
```

Code: lib/validate.mjs, scripts/grammar-law.mjs, cdd/scripts/**, tests/acceptance/library-usage.test.js

### Requirement: Guard clean summary counts acceptance test files

The guard's clean summary MUST name the acceptance-test count as a count of test files, never as a bare test count that a first-time runner can misread as a scenario count.

```gherkin
Feature: Guard clean summary counts acceptance test files

Scenario: Clean summary says files
  Given a working tree whose specs, acceptance tests, and code are in sync
  When the guard runs a full scan
  Then the clean summary reports the acceptance tests as test files, using the word file or files with the count
  # Verified by: tests/acceptance/gherkin-guard-placeholder.test.js
```

Code: scripts/spec-drift.mjs, cdd/scripts/**, tests/acceptance/gherkin-guard-placeholder.test.js

### Requirement: Guard hints expected L2 red for a matching open change

When L2 staleness findings exist (the form that fires when code changed after every spec of its capability last changed) and an open change's delta Code globs match an affected file, the guard MUST print exactly one informational hint line saying the matched L2 lines are expected mid-Close and clear at the archive pair-commit. The hint MUST NOT fire when no open change explains the red and MUST NOT suppress, reclassify, or change the exit code of any issue.

```gherkin
Feature: Guard hints expected L2 red for a matching open change

Scenario: Matching open change yields one hint
  Given a working tree with an L2 finding whose affected file matches an open change's delta Code globs
  When the guard runs
  Then it prints exactly one hint line naming the open change and the archive pair-commit as the point where the L2 lines clear
  And the L2 issue lines and exit code are unchanged
  # Verified by: tests/acceptance/gherkin-guard-placeholder.test.js

Scenario: No matching open change yields no hint
  Given the same working tree with no open change whose delta Code globs match the L2-affected file
  When the guard runs
  Then no hint line appears
  And the L2 issue lines and exit code are unchanged
  # Verified by: tests/acceptance/gherkin-guard-placeholder.test.js
```

Code: scripts/spec-drift.mjs, cdd/scripts/**, tests/acceptance/gherkin-guard-placeholder.test.js

### Requirement: Spec text quotes template tokens inside code spans

Draft validation MUST exempt the angle-bracket template tokens when they appear inside inline-code spans anywhere in a delta requirement's text — description prose or scenario steps alike — making backticks the deliberate-quoting escape hatch. The same tokens bare outside code spans MUST still fail as unfilled placeholders, and the scaffold's fence-internal template pins — which carry no code span — MUST keep their existing treatment.

```gherkin
Feature: Spec text quotes template tokens inside code spans

Scenario: A token inside a code span passes draft validation
  Given a change whose delta spec quotes the angle-bracket scenario token inside an inline-code span in a requirement description
  When draft validation runs
  Then that requirement passes with no unfilled-placeholder error
  # Verified by: tests/acceptance/library-usage.test.js

Scenario: A bare token outside a code span still fails
  Given another requirement in the same delta spec that contains the same token bare, outside any code span
  When draft validation runs
  Then that requirement is flagged with the template placeholders still unfilled error
  # Verified by: tests/acceptance/library-usage.test.js

Scenario: The scaffold's own door count is unchanged
  Given an untouched fresh change scaffold with its fence-internal template pins
  When draft validation runs on it
  Then it still reports exactly 3 errors
  # Verified by: tests/acceptance/library-usage.test.js
```

Code: lib/validate.mjs, tests/acceptance/library-usage.test.js

### Requirement: Re-tick law makes ticks claims, not history

The loop law MUST state, as rule 11a in the Archive section, that ticks are claims, not history: a Close-phase review finding that invalidates a ticked artifact voids the tick, and the author MUST un-tick, edit, re-run the item's verify-by, and record the re-tick inline as `re-verified after <review point>`; a door refusing the change at Close voids affected ticks the same way, and re-editing a ticked artifact without recording the re-tick is a blocker at archive.

```gherkin
Feature: Re-tick law makes ticks claims, not history

Scenario: Rule 11a states the re-tick duty
  Given the loop law text rendered into a fresh store's cdd/rules.md
  When rule 11a is read
  Then it states that a Close-phase review finding that invalidates a ticked artifact voids the tick
  And it requires un-ticking, editing, re-running the item's verify-by, and recording the re-tick inline as `re-verified after <review point>`
  # Verified by: tests/acceptance/loop-law-hardening.test.js

Scenario: A door refusal voids ticks the same way
  Given the loop law text rendered into a fresh store's cdd/rules.md
  When rule 11a is read
  Then it states that a door refusing the change at Close — a validator or guard failure — voids affected ticks exactly as a review finding does
  # Verified by: tests/acceptance/loop-law-hardening.test.js

Scenario: Unrecorded re-edits are a blocker at archive
  Given the loop law text rendered into a fresh store's cdd/rules.md
  When rule 11a is read
  Then it states that re-editing a ticked artifact without recording the re-tick is a blocker at archive
  # Verified by: tests/acceptance/loop-law-hardening.test.js
```

Code: lib/templates.mjs, cdd/rules.md, tests/acceptance/loop-law-hardening.test.js

### Requirement: Acceptance pins invoke the real door

The loop law's test-first rule MUST state that acceptance pins for door behavior invoke the real door entry point — a real module import or a child-process run — never a copied fragment, and that a sandbox-only pin is a note-level finding at R3.

```gherkin
Feature: Acceptance pins invoke the real door

Scenario: The test-first rule states the pin-realism clause
  Given the loop law text rendered into a fresh store's cdd/rules.md
  When the test-first rule is read
  Then it states that acceptance pins for door behavior invoke the real door entry point — a real module import or a child-process run — never a copied fragment
  And it states that a sandbox-only pin is a note-level finding at R3
  # Verified by: tests/acceptance/loop-law-hardening.test.js
```

Code: lib/templates.mjs, cdd/rules.md, tests/acceptance/loop-law-hardening.test.js

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

### Requirement: Review wiring holds no dead law reads

The review-wiring acceptance suite MUST keep a single live path to the loop law, with the unused `law` binding and the `lawPath` line that served only it removed while the suite stays green.

```gherkin
Feature: Review wiring holds no dead law reads

Scenario: The dead law binding is gone
  Given tests/acceptance/review-wiring.test.js
  When the file is read
  Then it declares no `law` binding and no `lawPath` line that served only it
  And the review-wiring suite passes
  # Verified by: tests/acceptance/loop-law-hardening.test.js
```

Code: tests/acceptance/review-wiring.test.js, tests/acceptance/loop-law-hardening.test.js

### Requirement: Re-tick and pin-realism ADR is drafted

The re-tick rule (11a) and the pin-realism sentence (rule 7) are loop-law decisions with their own ADR, drafted during this change and resolved by the human sponsor at Close.

```gherkin
Feature: Re-tick and pin-realism ADR is drafted

Scenario: ADR-0011 records both law decisions
  Given cdd/decisions/0011-ticks-are-claims-and-pins-hit-real-doors.md
  When the ADR is read
  Then it names rule 11a and the rule 7 pin-realism sentence as its decision
  And it weighs the rejected alternatives and states what gets harder
  And its status is draft or accepted
  # Verified by: tests/acceptance/loop-law-hardening.test.js
```

Code: tests/acceptance/loop-law-hardening.test.js

### Requirement: Process findings land in the backlog

The loop law names `cdd/backlog.md` as the destination for process findings raised during a run: findings land as PF-n items via the backlog op, milestone and Close reports cite PF-n ids instead of prose, and the backlog is living triage data — validate and the drift guard never check its content. The law names the backlog op's actions by pointing at the tool, never by enumerating them.

```gherkin
Feature: Process findings land in the backlog

Scenario: The law names the destination and the citation rule in both sources
  Given the loop law sources lib/templates.mjs and cdd/rules.md
  When both are read
  Then each names cdd/backlog.md as where process findings land and requires reports to cite PF-n ids, and the two texts agree byte-for-byte
  # Verified by: tests/acceptance/backlog-op.test.js

Scenario: The law names no action enumeration
  Given the loop law sources lib/templates.mjs and cdd/rules.md
  When both are read
  Then rule 13 names the backlog op without listing its actions — it points at the tool's help instead — and the two texts agree byte-for-byte
  # Verified by: tests/acceptance/backlog-op.test.js

Scenario: Backlog content never gates
  Given a store whose cdd/backlog.md holds free-form note prose on its items
  When validate runs in strict mode over the store and the drift guard runs
  Then both answer green
  # Verified by: tests/acceptance/backlog-op.test.js

Scenario: The live backlog holds the seed findings grammar-conforming
  Given the repository store after the seeding task
  When cdd/backlog.md is read
  Then it holds at least the 7 seeded item lines with ids PF-1 through PF-7 (the backlog is living triage data and may grow), every item line matches the grammar with ids strictly sequential, and the file header carries the conventions line that a steer is believed only when an on-disk artifact backs it
  # Verified by: tests/acceptance/backlog-op.test.js
```

Code: lib/templates.mjs, lib/help.mjs, cdd/rules.md, tests/smoke.mjs

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

### Requirement: Contributor clones self-wire the doors

The root package's `prepare` script — run by npm automatically at the end of every `npm install` and `npm ci` in this repository — MUST wire a git checkout to its committed hooks: in a working directory holding a `.git` directory it sets `core.hooksPath` to `.githooks` so doors 2a/2b run on every local commit; in a directory without `.git` it MUST exit 0 having configured nothing, so pack, publish, and ephemeral-checkout contexts stay silent.

```gherkin
Feature: Contributor clones self-wire the doors

Scenario: A fresh clone wires the doors at install time
  Given a git repository checkout of this repository with no core.hooksPath configured
  When the prepare script from package.json runs as npm install's lifecycle step
  Then git config core.hooksPath reads .githooks
  # Verified by: tests/acceptance/hook-wiring.test.js

Scenario: Without a git directory the prepare step is a silent no-op
  Given a working directory holding this repository's package.json and no .git directory
  When the prepare script runs
  Then it exits 0 and no git configuration is written
  # Verified by: tests/acceptance/hook-wiring.test.js
```

Code: package.json, tests/acceptance/hook-wiring.test.js

### Requirement: Loop law states the Done-When contract

The loop law's proposal rule — rule 3 of the rendered law text — MUST state the proposal contract as `Done-When:` lines carrying 1-5 completion criteria, each phrased as an observable check, the same bounds the proposal scaffold instruction states and the validate door enforces. The rule-3 text MUST be defined in the loop-law module (`lib/loop-law.mjs`), rendered into the law text, and the repository's store copy `cdd/rules.md` MUST carry the identical rule-3 text.

```gherkin
Feature: Loop law states the Done-When contract

Scenario: Rule 3 states 1-5 observable criteria
  Given the loop-law text rendered from the module and this repository's store copy cdd/rules.md
  When rule 3 is read in each
  Then each states Done-When lines carrying 1-5 completion criteria, each an observable check
  And neither carries the one-Done-When-line wording
  # Verified by: tests/acceptance/law-done-when.test.js

Scenario: Rule 3 renders from the loop-law module
  Given lib/loop-law.mjs exporting the rule-3 text and the law text interpolating it
  When the law text is rendered
  Then the rule-3 fragment equals the module's render verbatim
  And the store copy cdd/rules.md carries the same rule-3 fragment byte-identically
  # Verified by: tests/acceptance/law-done-when.test.js
```

Code: lib/loop-law.mjs, lib/templates.mjs, cdd/rules.md, tests/acceptance/law-done-when.test.js

### Requirement: Topology staleness is full-scan law

The committed-history topology check — L2, code changed after every spec of its capability last changed — MUST run in the door 3 full scan, and the commit being made is policed by the commit-msg door's staged-pair check (staged code without a staged spec of the capability). The pre-commit staged scan MUST NOT run the topology check: it reads committed history, which cannot yet contain the archive pair-commit's staged living-spec merge, so there it can only deadlock the pair-commit's second commit — the archive move plus the merged living spec, no code files — which MUST pass the pre-commit door.

```gherkin
Feature: Topology staleness is full-scan law

Scenario: The archive pair-commit passes the pre-commit door
  Given a sandbox git store whose feature commit landed through the pre-commit door and whose real archiveChange output is staged — the archive move plus the merged living spec, no code files
  When the pre-commit staged scan runs on that staged set
  Then it exits 0 with the clean summary
  # Verified by: tests/acceptance/guard-pair-commit.test.js

Scenario: The full scan still enforces topology at the mid-pair tip
  Given the same sandbox after the archive move with the archive commit not yet made and no open change claiming the code
  When the door 3 full scan runs
  Then it exits non-zero with exactly 1 L2 issue naming the out-committing code file
  # Verified by: tests/acceptance/guard-pair-commit.test.js
```

Code: scripts/spec-drift.mjs, cdd/scripts/**, tests/acceptance/guard-pair-commit.test.js

### Requirement: Code globs compile to precise file claims

The drift guard MUST compile every `Code:` glob to one anchored regex with precise glob semantics: a `[...]` span becomes a character class (leading `!` negates), a single `*` matches within one directory segment, `**` matches across separators, every other regex metacharacter is escaped so literals stay literal, and an unterminated `[` or an empty class span (`[]`, `[!]`) is literal text — an empty class would match nothing, and a silent no-match glob is the failure this law kills. A compiled claim MUST be exactly the files the glob names — never silently zero (PF-20's disease: `*` escaped before translation made every star glob demand a literal `[`), never broader.

```gherkin
Feature: Code globs compile to precise file claims

Scenario: A single star claims within one directory
  Given a sandbox git store whose spec claims src/*.mjs with the files src/app.mjs, src/app.js, and src/sub/app.mjs committed
  When src/app.mjs is staged with no spec of the capability and the commit-msg door runs
  Then it exits non-zero naming src/app.mjs
  And staging src/app.js or src/sub/app.mjs with no spec of the capability stays green — the glob claims neither file
  # Verified by: tests/acceptance/guard-glob-claims.test.js

Scenario: A double star claims across directories
  Given a sandbox git store whose spec claims src/** with the files src/app.js and src/deep/b.js committed
  When either file is staged with no spec of the capability and the commit-msg door runs
  Then it exits non-zero naming that file
  # Verified by: tests/acceptance/guard-glob-claims.test.js

Scenario: A character class claims its members and only them
  Given a sandbox git store whose spec claims cfg/[ab].mjs and cfg/[!ab].mjs with the files cfg/a.mjs, cfg/b.mjs, and cfg/c.mjs committed
  When cfg/a.mjs or cfg/b.mjs is staged with no spec of the capability
  Then the commit-msg door reds on the [ab] claim naming that file
  And staging cfg/c.mjs alone reds only on the [!ab] claim — each class claims its members and only them
  # Verified by: tests/acceptance/guard-glob-claims.test.js

Scenario: A literal dot stays literal
  Given a sandbox git store whose spec claims cfg/v1.2.mjs with the files cfg/v1.2.mjs and cfg/v1X2.mjs committed
  When cfg/v1X2.mjs is staged with no spec of the capability and the commit-msg door runs
  Then it stays green — the glob's dot matches a dot, not any character
  # Verified by: tests/acceptance/guard-glob-claims.test.js

Scenario: An unterminated class span is literal text
  Given a sandbox git store whose spec claims cfg/[ab.mjs with a file literally named cfg/[ab.mjs committed
  When that file is staged with no spec of the capability and the commit-msg door runs
  Then it exits non-zero naming it — the stray bracket claims nothing broader than itself
  # Verified by: tests/acceptance/guard-glob-claims.test.js

Scenario: An empty class span is literal text
  Given a sandbox git store whose spec claims cfg/[].mjs and cfg/[!].mjs with files literally so named committed
  When either file is staged with no spec of the capability and the commit-msg door runs
  Then it exits non-zero naming that file — an empty class would match nothing, and a silent no-match glob is the failure this law kills
  # Verified by: tests/acceptance/guard-glob-claims.test.js
```

Code: scripts/spec-drift.mjs, cdd/scripts/**, tests/acceptance/guard-glob-claims.test.js

### Requirement: Code lines claim implementation surface, never decision memory

A `Code:` line names implementation surface — files whose travel the doors bind. Decision memory (`cdd/decisions/**`) is governed unconditionally by the guard's A-checks and MUST NOT be claimed: the door 3 full scan reds on any open-delta line naming decision memory (by `cdd/decisions/` prefix or by compiled claim), and on any living line not under an open correction. The exemption is per-requirement, not per-change: an open change of the same capability that MODIFIES the requirement holding the claim (matched by heading, exactly) AND restates its `Code:` line free of decision-memory claims earns one informational skip line for that claim — never silent, always green; a delta that ADDS a memory claim, a second open change's claim, a correction restated under a different heading, or a correction whose restated line keeps the claim exempts nothing and reds. The travel-door half of the exemption is all-or-nothing: a claim is exempt from the staged-pair and topology checks only when every requirement holding it is corrected — one uncorrected holder keeps the doors bound. With honest lines no door binds decision memory, so a staged ADR reconfirmation with nothing claiming it passes both commit doors.

```gherkin
Feature: Code lines claim implementation surface, never decision memory

Scenario: An open delta claiming decision memory reds
  Given a store whose full scan exits 0 and an open change whose delta spec carries Code: cdd/decisions/*.md
  When the door 3 full scan runs
  Then it exits non-zero with exactly 1 memory-claim finding naming the delta spec, the claim, and the lawful surface — decision memory answers to the A-checks, not spec travel
  # Verified by: tests/acceptance/guard-memory-claims.test.js

Scenario: A living claim with no correction reds
  Given a store whose full scan exits 0 except for a living spec carrying Code: cdd/decisions/*.md with no open change of that capability modifying that requirement
  When the door 3 full scan runs
  Then it exits non-zero with exactly 1 memory-claim finding naming the living spec
  # Verified by: tests/acceptance/guard-memory-claims.test.js

Scenario: A living claim under correction skips with one line
  Given a living spec carrying Code: cdd/decisions/*.md and an open change of the capability whose delta modifies that requirement with a corrected Code line
  When the door 3 full scan runs
  Then it exits 0 printing exactly 1 informational skip line naming the claim and the open change
  # Verified by: tests/acceptance/guard-memory-claims.test.js

Scenario: An added claim corrects nothing
  Given a living spec carrying Code: cdd/decisions/*.md on requirement R and an open change of the capability whose delta adds a new requirement claiming Code: cdd/decisions/*.md without touching R
  When the door 3 full scan runs
  Then it exits non-zero with exactly 2 findings — the added delta line and the living line on R — the exemption follows the corrected requirement, never the change
  # Verified by: tests/acceptance/guard-memory-claims.test.js

Scenario: A second open change gets no cover
  Given a living spec carrying Code: cdd/decisions/*.md on requirement R, an open change of the capability whose delta modifies R with a corrected Code line, and a second open change whose delta claims Code: cdd/decisions/*.md
  When the door 3 full scan runs
  Then R prints exactly 1 skip line and the second change's claim prints exactly 1 finding — one change's correction never launders another's claim
  # Verified by: tests/acceptance/guard-memory-claims.test.js

Scenario: A renamed heading breaks the match
  Given a living spec carrying Code: cdd/decisions/*.md on requirement R and an open change whose delta modifies R's content but restates it under a different requirement heading
  When the door 3 full scan runs
  Then the living claim on R reds — a correction that no longer names the requirement it corrects exempts nothing, and no skip is granted on a fuzzy match
  # Verified by: tests/acceptance/guard-memory-claims.test.js

Scenario: A correction that keeps the claim reds both
  Given a living spec carrying Code: cdd/decisions/*.md on requirement R and an open change of the capability whose delta modifies R by exact heading but restates Code: cdd/decisions/*.md unchanged
  When the door 3 full scan runs
  Then it exits non-zero with exactly 2 findings — the living line on R and the delta line on R — a correction that re-claims memory corrects nothing
  # Verified by: tests/acceptance/guard-memory-claims.test.js

Scenario: A staged ADR edit with no claiming spec passes both doors
  Given a tracked ADR file no spec's Code line claims
  When the ADR edit is staged and each commit door runs
  Then both doors exit 0 — decision memory travels alone, answering to the A-checks
  # Verified by: tests/acceptance/guard-memory-claims.test.js

Scenario: A staged ADR edit claimed only under correction passes both doors
  Given a living spec carrying Code: cdd/decisions/*.md on requirement R and an open change of the capability whose delta modifies R with a corrected Code line
  When an ADR edit matching the claim is staged and each commit door runs
  Then both doors exit 0 — the under-correction claim exempts the travel doors for the archive window, and the skip line carries the record
  # Verified by: tests/acceptance/guard-memory-claims.test.js

Scenario: A compiled claim with no decisions prefix reds
  Given a living spec carrying Code: cdd/** — no decisions prefix, yet the compiled glob matches a tracked decision file
  When the door 3 full scan runs
  Then it exits non-zero with exactly 1 finding naming the living spec and the glob as compiled — the prefix is a fast path, the compiled claim is the law
  # Verified by: tests/acceptance/guard-memory-claims.test.js

Scenario: A half-corrected spec exempts nothing
  Given a living spec where requirements R2 and R3 both carry Code: cdd/decisions/*.md and an open change of the capability corrects R2 only
  When the door 3 full scan runs, then an ADR edit matching the claim is staged and the commit-msg door runs
  Then the scan exits non-zero with exactly 1 skip for R2 and exactly 1 finding naming R3
  And the door reds with the staged-pair finding — a claim held by any uncorrected requirement still binds the travel doors
  # Verified by: tests/acceptance/guard-memory-claims.test.js
```

Code: scripts/spec-drift.mjs, cdd/scripts/**, tests/acceptance/guard-memory-claims.test.js

### Requirement: The backlog triage skill is bundled

The extension bundles `skills/cdd-backlog-triage/SKILL.md` — the triage rubric for `cdd/backlog.md` process findings — discovered through the existing `pi.skills` registration. The skill advises; it never enforces: the backlog stays living triage data that no door checks (rule 13), which the skill cites without restating. The rubric includes the revalidation law: open items are re-verified against disk before dispatch, unchanged survivors are forced to a disposition, and staleness never auto-closes.

```gherkin
Feature: The backlog triage skill is bundled

Scenario: The triage skill is a loadable pi skill
  Given the bundled skill skills/cdd-backlog-triage/SKILL.md
  When its frontmatter and body are read
  Then its frontmatter name matches its directory and its quoted description stays within the 20 to 1024 character bounds scoping routing to cdd projects
  And its body cites loop law rule 13 for the backlog's place in the loop without restating the law
  # Verified by: tests/smoke.mjs

Scenario: The triage skill carries the rubric
  Given the bundled triage skill on disk
  When its rubric is read
  Then it teaches exactly the 5 grammar statuses of the backlog op (open, watch, done, won't-do, seeded-into-change) and marks the note-level evaluate-on-recurrence pattern as not a grammar status
  And it states the item grammar line and both inviolable conventions (a steer is believed only when an on-disk artifact backs it; milestone and Close reports cite PF-n ids, never prose)
  And it states the change-worthy rule (two independent recurrences, or one occurrence with a known structural fix) against record-only
  And it states that items are minted and resolved only through the cdd backlog op, with direct note edits and premise edits that keep the grammar — a backfill, or a moved-premise rewrite — as the only 2 freehand exceptions
  # Verified by: tests/smoke.mjs

Scenario: The triage skill teaches the revalidation law
  Given the bundled triage skill on disk
  When its revalidation law is read
  Then it teaches revalidation before dispatch — every open item is re-verified against disk before it is dispatched on, a false premise closes the item done with evidence, and a moved premise rewrites it
  And it teaches the three-strikes rule — an open or watch item surviving 3 revalidations unchanged is forced to a disposition (a fix via change, a won't-do with reason, or a superseded-by), so nothing camps in the backlog
  And it teaches that revalidation never auto-closes — staleness surfaces and the triager decides
  And it names premise edits on an existing item — a backfill, or the rewrite of a premise that merely moved — as freehand line edits that keep the grammar, joining the note-edit exception
  # Verified by: tests/smoke.mjs
```

Code: skills/cdd-backlog-triage/SKILL.md, tests/smoke.mjs

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

### Requirement: Source comments are shape-of-code documentation only

Comments on the harness source surface MUST describe only the code they sit in: the module's or function's contract, the algorithm's reading order, observed caller behavior. Comment text MUST carry no corpus routing: no decision ids, no process-finding ids, no commit ids, no cdd corpus paths, no spec-heading citations. Rendered text (error messages, scaffold templates, law strings) is behavior or corpus data, not comments, and is exempt. Test files keep check-ids as names by allowance; their scenario-heading prose is swept by this change and rests as convention, not on the pin.

```gherkin
Feature: Source comments are shape-of-code documentation only

Scenario: Comment scan reports zero corpus routing
  Given the harness source surface index.ts, lib/, scripts/, and .githooks with comment text isolated from strings by a string-aware scanner
  When the comment-law acceptance pin scans that comment text for decision ids, process-finding ids, commit ids, cdd corpus paths, and spec-heading citations
  Then the scan reports exactly 0 banned patterns and the pin exits 0
  # Verified by: tests/acceptance/comment-law.test.js

Scenario: Corpus routing in comments fails the suite
  Given a source file on the scanned surface whose comment text cites a decision id
  When the comment-law acceptance pin scans it
  Then the pin names the file, the line, and the banned pattern, and exits non-zero
  # Verified by: tests/acceptance/comment-law.test.js
```

Code: lib/context.mjs, lib/gherkin.mjs, lib/help.mjs, lib/instructions.mjs, lib/loop-law.mjs, lib/store.mjs, lib/templates.mjs, lib/validate.mjs, scripts/*.mjs, .githooks/*, tests/acceptance/comment-law.test.js

### Requirement: The drift guard's check index is machine-pinned

The drift guard scripts/spec-drift.mjs MUST document the check tags it emits in one machine-readable header line (`// Checks:`), and the documented set MUST equal exactly the set of tags the script emits across its issue lines and informational skip lines — an unindexed check or a stale index entry fails the suite.

```gherkin
Feature: The drift guard's check index is machine-pinned

Scenario: Header check line equals the emitted check tags
  Given scripts/spec-drift.mjs carrying a header line that names its check tags and issue lines each tagged with the check that raised them
  When the guard header-index acceptance pin compares the documented tag set with the emitted tag set
  Then the 2 sets contain exactly the same tags and the pin exits 0
  # Verified by: tests/acceptance/guard-header-index.test.js

Scenario: An unindexed check fails the pin
  Given scripts/spec-drift.mjs emitting a check tag its header line does not name
  When the guard header-index acceptance pin compares the 2 sets
  Then the pin names the undocumented tag and exits non-zero
  # Verified by: tests/acceptance/guard-header-index.test.js
```

Code: scripts/spec-drift.mjs, tests/acceptance/guard-header-index.test.js

### Requirement: Comment-shape ADR is drafted

`cdd/decisions/` MUST hold ADR-0012 recording that source comments are shape-of-code documentation only — banned: corpus routing, WHY-prose, WHAT-restating, hand-maintained indexes; allowed: JSDoc one-liners on exports and test-local check-ids — enacted by a comment sweep plus suite pins over guard-side enforcement. The requirement claims its enforcement pin, not the ADR itself — decision memory answers to the A-checks.

```gherkin
Feature: Comment-shape ADR is drafted

Scenario: ADR-0012 states the comment-shape decision
  Given the decision directory cdd/decisions/
  When ADR-0012 is read
  Then its frontmatter status is accepted (set at drafting under the sponsor's delegated authority) and its body records the comment law, both allowances, and the header-rot evidence that motivated it
  # Verified by: tests/acceptance/comment-shape-adr.test.js

Scenario: The guard holds no violation naming ADR-0012
  Given ADR-0012 with frontmatter status accepted
  When the drift guard runs over the repository
  Then the guard output holds no violation naming ADR-0012
  # Verified by: tests/acceptance/comment-shape-adr.test.js
```

Code: tests/acceptance/comment-shape-adr.test.js

### Requirement: The GitLab CI scaffold inherits the guard pipeline discipline

The GitLab CI scaffold MUST carry the same pipeline discipline the repository's guard pipeline learned: exactly 2 parallel matrix legs — Node majors 20 (the CI floor) and 24 (the local-dev major) — with each leg's image drawn from its matrix entry, `npm ci` before the guard scan (the suites import `@cucumber/gherkin` from `node_modules`; the vendored copy serves pi installs only), and `GIT_DEPTH` set to 0 so the history-walking guard sees the full clone. The door-3 and adjust-to-your-runner comments MUST survive in the render. This repository's root `.gitlab-ci.yml` is dogfood and MUST stay byte-identical to the render; adopter copies are theirs.

```gherkin
Feature: The GitLab CI scaffold inherits the guard pipeline discipline

Scenario: The scaffold fans out to both Node majors with install and full clone
  Given the GitLab CI scaffold template rendered to text
  When its guard job is read
  Then it runs exactly 2 parallel matrix legs for the Node versions 20 and 24 and each leg's image is node:$NODE_VERSION
  And it sets GIT_DEPTH to 0 so the guard scan walks full commit history
  And npm ci runs before the guard scan — the suites import @cucumber/gherkin from node_modules, not the vendored copy
  And the render keeps the door-3 comment and the adjust-to-your-runner comment
  # Verified by: tests/acceptance/gitlab-ci-parity.test.js

Scenario: The dogfood copy stays byte-identical to the render
  Given this repository's root .gitlab-ci.yml and the scaffold template's render
  When the 2 texts are compared byte for byte
  Then they are identical so the CI this repository runs is the CI it hands adopters
  # Verified by: tests/acceptance/gitlab-ci-parity.test.js
```

Code: lib/templates.mjs, .gitlab-ci.yml, tests/acceptance/gitlab-ci-parity.test.js

### Requirement: The director skill is bundled

The extension SHALL bundle a `cdd-director` skill — the director law for
review-loop directors: seven law points, a milestone gate table for the
4 milestone asks, the evidence protocol, findings harvest, pi delivery
mechanics, and anti-patterns — plus an instantiable mission-brief template
under its assets. The skill advises; it never enforces (gate authority
stays with the deterministic validators and the human, rule 2a), and its
loop-law citations stay consistent with `cdd/rules.md` without restating
rule text.

```gherkin
Feature: The director skill is bundled

Scenario: The director skill is a loadable pi skill
  Given the bundled skill skills/cdd-director/SKILL.md
  When its frontmatter and body are read
  Then its frontmatter name matches its directory and its quoted description stays within the 20 to 1024 character bounds and carries a when or whenever routing clause to cdd projects
  And every loop-law rule it cites by number names that obligation in cdd/rules.md, covering at least rules 2a, 2b, 9a, 11, and 13
  And its body restates no fragment of the law text in cdd/rules.md under a whitespace-normalized comparison
  # Verified by: tests/smoke.mjs

Scenario: The skill carries the director law
  Given the bundled director skill on disk
  When its charter is read
  Then it teaches exactly the 7 points of the director law: the verifier never authors, milestones are the only control points, the doors teach, lawful shape comes before bypass, the ledger is the only memory, spawn briefs carry the protocol, and the human is the escalation point
  And it carries a milestone gate table covering exactly the 4 asks M1, M2, M3, and M4
  And it carries the evidence protocol: green claims cite the exact command and tail excerpt, the director re-runs gates before blessing, merges are ff-only on held branches, and only the director pushes
  And it carries the findings harvest: mint process findings in flight through the backlog op, revalidate the ledger before every dispatch, and name the cdd-backlog-triage skill as the rubric's home for dispositions and statuses instead of restating them
  And it carries the pi delivery mechanics: idled-pane asks fail with No pending ask so follow with a send, crashed runner panes are benign exits verified by work landed, reviewer leaves relay through the director, re-list the roster before re-addressing, and nudges are answered
  And it carries an anti-patterns section naming pre-narrowing door checks, trusting green claims without tails, dispatching from session memory, direct edits on contract files, 2 writers on one repo, and letting a runner merge or push
  # Verified by: tests/smoke.mjs

Scenario: The mission-brief template is bundled under assets
  Given the bundled director skill's assets/mission-brief.md on disk
  When the template is read
  Then it carries the anatomy of a runner mission brief: 1 bounded outcome as the mission, an out-of-scope boundary of what is explicitly out, context files to read first, the protocol skeleton from design gate to archive pair-commit, reviewer constraints covering the family rule, the floor model as the least capable model a reviewer may fall back to, free rungs taken only when available and never relied on, and floor-down halting the run for a human decision, and milestone asks that each end in a WAIT
  And it orders the first action as verify the premise on disk then a handshake ask
  And it names the branch rule and the never-push rule for the runner
  # Verified by: tests/smoke.mjs
```

Code: skills/cdd-director/SKILL.md, skills/cdd-director/assets/mission-brief.md, tests/smoke.mjs

### Requirement: The ADR claims index is single-sourced

The ADR claims index (decision frontmatter parsed into id, file, status, supersedes, title, and code globs), the glob matcher that turns a code glob into the set of files it claims, and the ADR status vocabulary are defined exactly once in a zero-dependency door module, `scripts/adr-index.mjs`; the drift guard and the tool ops import them and none re-states the parsing, the matcher, or the vocabulary. The store copy travels with the guard's copies.

```gherkin
Feature: The ADR claims index is single-sourced

Scenario: The index builds one entry per ADR in the decisions home
  Given the repository's store holding its 12 ADRs in cdd/decisions/
  When the claims index is built
  Then it holds exactly 12 entries, one per ADR, each carrying its ADR id, its store-relative file path, its frontmatter status, its title from the first heading, the code globs from its frontmatter, and a supersedes field that is null for every entry (this corpus records supersession in prose, not frontmatter)
  # Verified by: tests/acceptance/adr-index-agreement.test.js

Scenario: The op and the guard answer the same governing set
  Given a synthetic git repository whose store holds exactly 2 accepted ADRs with overlapping code claims and 1 open change whose delta spec claims a file both ADRs govern
  When the door 3 full scan and the cdd tool's adrs op with the claimed file both answer
  Then the ADR citations in the scan's A1 findings and the op's governing set name exactly the same 2 ADR ids
  # Verified by: tests/acceptance/adr-index-agreement.test.js

Scenario: No consumer re-states the matcher
  Given the repository's guard and op sources after the change
  When scripts/spec-drift.mjs, lib/adr-ops.mjs, and scripts/adr-index.mjs are scanned for a glob-to-regex translation
  Then the translation is defined exactly once, in scripts/adr-index.mjs, and every other file only imports it
  # Verified by: tests/acceptance/adr-index-agreement.test.js
```

Code: scripts/adr-index.mjs, tests/acceptance/adr-index-agreement.test.js

### Requirement: A-check findings name their remedy op

The drift guard's A1 and A2 findings teach executable remedies: A1's finding names the adrs op reverse lookup as the way to find every governing ADR, and A2's finding names the reconfirm op as the tooled path to reconfirmation. The naming rides the existing finding text; the firing triggers, the check tags, and the rest of the finding text are unchanged.

```gherkin
Feature: A-check findings name their remedy op

Scenario: An A1 finding names the reverse-lookup command
  Given a synthetic git repository whose store holds exactly 1 accepted ADR governing a file that 1 open change's delta spec claims and whose proposal does not cite the ADR
  When the door 3 full scan runs
  Then the scan exits non-zero with exactly 1 A1 finding naming the ADR, and the finding contains "cdd adrs --code"
  # Verified by: tests/acceptance/guard-adr-remedies.test.js

Scenario: An A2 finding names the reconfirm command
  Given a synthetic git repository whose store holds exactly 1 accepted ADR whose governed file carries 1 commit after the ADR file's last commit and no open change claims that file
  When the door 3 full scan runs
  Then the scan exits non-zero with exactly 1 A2 finding naming the ADR, and the finding contains "cdd reconfirm"
  # Verified by: tests/acceptance/guard-adr-remedies.test.js
```

Code: scripts/spec-drift.mjs, cdd/scripts/**, tests/acceptance/guard-adr-remedies.test.js
