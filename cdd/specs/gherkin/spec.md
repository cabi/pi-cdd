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

Code: lib/loop-law.mjs, lib/templates.mjs, lib/instructions.mjs, lib/context.mjs, lib/help.mjs, README.md, cdd/rules.md, cdd/decisions/0008-*.md, tests/acceptance/review-wiring.test.js, tests/acceptance/single-source-law.test.js, tests/acceptance/loop-law-hardening.test.js, tests/acceptance/r3-findings.test.js

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

Code: lib/templates.mjs, lib/instructions.mjs, lib/context.mjs, lib/help.mjs, cdd/rules.md, cdd/decisions/0008-*.md, tests/acceptance/review-wiring.test.js, tests/smoke.mjs

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

Code: lib/context.mjs, lib/help.mjs, cdd/rules.md, cdd/decisions/0008-*.md, tests/acceptance/review-wiring.test.js

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

`cdd/decisions/` MUST hold ADR-0009 recording that the loop law is single-sourced in `lib/loop-law.mjs` with every statement surface deriving from it, chosen over mirror, generator, and pointer-only alternatives. It is drafted with `status: draft` (a valid status the human resolves) and, once the human resolves it at Close, its frontmatter carries the resolved status; the drift guard MUST hold no violation against it in either state.

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

Code: cdd/decisions/0009-*.md

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

Code: cdd/decisions/0010-*.md, cdd/decisions/0008-*.md, cdd/decisions/0009-*.md, tests/acceptance/loop-law-hardening.test.js

### Requirement: Guard tolerates scaffold placeholders in open deltas

The door 3 full scan treats a placeholder pin inside an open-delta spec (`cdd/changes/*/specs/`) as template text, not a claim: it does not fail the pin-resolution check and is reported as skipped, one informational line per open delta after the verdict — a skip is never silent. A placeholder pin is a `# Verified by:` pin whose path contains the scaffold's placeholder marker: the angle-bracket form of the words `scenario` or `name`, spelled here without its brackets because the draft door flags the literal token strings as unfilled (`lib/validate.mjs`) — the guard and the draft door agree on this token family. Any other angle-bracket shape is not a placeholder: it fails L1 even in an open delta, so the guard never silently greens an unrecognized token. Living specs keep full strictness — a placeholder pin there is an unresolvable pin like any other. The predicate lives in the grammar law module (`scripts/grammar-law.mjs`, `LAW_VERSION` 2) and the store copies travel with their sources: `cdd/scripts/grammar-law.mjs` and `cdd/scripts/spec-drift.mjs` are byte-identical to them in this repository, and adopting stores pick both up when `cdd init` refreshes `cdd/scripts/*`.

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
  Then cdd/scripts/grammar-law.mjs is byte-identical to scripts/grammar-law.mjs and cdd/scripts/spec-drift.mjs is byte-identical to scripts/spec-drift.mjs, and the law reports LAW_VERSION 2
  # Verified by: tests/acceptance/gherkin-guard-placeholder.test.js
```

Code: scripts/grammar-law.mjs, scripts/spec-drift.mjs, tests/acceptance/gherkin-guard-placeholder.test.js

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

Code: cdd/decisions/0011-ticks-are-claims-and-pins-hit-real-doors.md, tests/acceptance/loop-law-hardening.test.js

### Requirement: Process findings land in the backlog

The loop law names `cdd/backlog.md` as the destination for process findings raised during a run: findings land as PF-n items via the backlog op, milestone and Close reports cite PF-n ids instead of prose, and the backlog is living triage data — validate and the drift guard never check its content.

```gherkin
Feature: Process findings land in the backlog

Scenario: The law names the destination and the citation rule in both sources
  Given the loop law sources lib/templates.mjs and cdd/rules.md
  When both are read
  Then each names cdd/backlog.md as where process findings land and requires reports to cite PF-n ids, and the two texts agree byte-for-byte
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

Code: skills/cdd-adr-review/brief-adr.md, skills/cdd-adr-review/SKILL.md, README.md, lib/gherkin.mjs

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
