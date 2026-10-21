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

Code: scripts/law.mjs, scripts/spec-drift.mjs, scripts/spec-extract.mjs, scripts/arch-extract.mjs, cdd/scripts/**, lib/gherkin.mjs, lib/validate.mjs, lib/store.mjs, lib/templates.mjs, lib/instructions.mjs, decisions/0007-the-law-behind-every-door.md, tests/smoke.mjs, tests/acceptance/gherkin-door3.test.js, tests/acceptance/gherkin-parse-gate.test.js, tests/acceptance/gherkin-style-guidance.test.js, tests/acceptance/gherkin-subset.test.js

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

The loop law — the rules text a fresh store renders as `cdd/rules.md` — MUST name review points R1 (conditional: a design gate answering T1 or T2 YES), R2 (always, at draft-green before the first implementation task), and R3 (at Close before archive) with their skills, modes, and findings paths, and MUST state the advisory-findings grammar: severities blocker/should/note, dispositions fixed:/open/won't-fix:, never red/green verdicts, gate authority with the deterministic validators and the human.

```gherkin
Feature: Loop law names three review points

Scenario: Rule 2a states all three review points and the ADR review
  Given the loop law text rendered into a fresh store's cdd/rules.md
  When the review-points rule is read
  Then it names R1 conditional on a design-gate T1 or T2 YES with skill cdd-spec-review in proposal mode and findings path reviews/r1-proposal-review.md
  And it names R2 always at draft-green before the first implementation task with skill cdd-spec-review in package mode and findings path reviews/r2-change-review.md
  And it names R3 at Close before archive with skill cdd-code-review and findings path reviews/r3-code-review.md
  And it names the conditional ADR review for changes that drafted or amended ADRs with skill cdd-adr-review and findings path reviews/adr-review.md
  # Verified by: tests/acceptance/review-wiring.test.js

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
```

Code: lib/templates.mjs, lib/instructions.mjs, lib/context.mjs, lib/help.mjs, README.md, cdd/rules.md, cdd/decisions/0008-*.md, tests/acceptance/review-wiring.test.js

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

The tasks scaffold MUST place a `3.1 Change review` task (skill `cdd-spec-review`, package mode, once the change package is drafted and validates green in draft mode, findings at `reviews/r2-change-review.md`, ticks only when no blocker is open) before the single placeholder implementation task, MUST place in the Close section — before the validate-and-guard and archive items — a code-review task (skill `cdd-code-review`, findings at `reviews/r3-code-review.md`) and a conditional ADR-review task (skill `cdd-adr-review`, findings at `reviews/adr-review.md`, skip recorded on the task line when the change drafted or amended no ADR), and its embedded instruction text MUST explain these clauses and the advisory-findings rule. The smoke suite MUST pin these scaffolds.

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
  Then the first Close item runs skill cdd-code-review with findings path reviews/r3-code-review.md
  And the second runs skill cdd-adr-review on ADRs this change drafted or amended, with findings path reviews/adr-review.md and a skip recorded on the task line when none exist
  And both precede the validate-and-guard item and the archive item
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

### Requirement: Design gate record lands before the proposal

The loop law's change-loop rule MUST state that the T1–T5 answers are written into the tasks file's design section as the gate runs, before the proposal is drafted — so the gate record is verifiable on disk before any review depends on it.

```gherkin
Feature: Design gate record lands before the proposal

Scenario: The law states the gate record timing
  Given the loop law text rendered into a fresh store's cdd/rules.md
  When the change-loop rule is read
  Then it states that the T1 through T5 answers are written into the tasks design section as the gate runs, before the proposal is drafted
  # Verified by: tests/acceptance/review-wiring.test.js
```

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

The loop law MUST state reviewer independence as rule 2b — the reviewer is not the author of the artifacts under review; every model-run review runs as a cold sub-agent session, and a same-session re-read is the lawful but weaker fallback, which MUST record itself and its justification in the findings file header. The findings grammar MUST name the 2 reviewer forms, and the three bundled review skills MUST cite rule 2b and carry only the procedure.

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

Code: lib/loop-law.mjs, lib/templates.mjs, lib/instructions.mjs, lib/context.mjs, cdd/rules.md, skills/cdd-spec-review/SKILL.md, skills/cdd-code-review/SKILL.md, skills/cdd-adr-review/SKILL.md, tests/acceptance/reviewer-independence.test.js

### Requirement: Reviewer-independence ADR is drafted

`cdd/decisions/` MUST hold ADR-0010 recording reviewer independence as loop law rule 2b, chosen over skills-only guidance, validator enforcement, and hard-ban alternatives; because this change edits files under their `code:` globs, ADR-0008 and ADR-0009 MUST carry reconfirm notes naming it. ADR-0010 is drafted with `status: draft` (a valid status the human resolves) and, once resolved at Close, its frontmatter carries the resolved status; the drift guard MUST hold no violation against it in either state.

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
```

Code: cdd/decisions/0010-*.md, cdd/decisions/0008-*.md, cdd/decisions/0009-*.md
