## ADDED Requirements

### Requirement: Library modules refuse silent direct execution

Running the validator library or the grammar module directly as a node command MUST print exactly one usage line to stderr naming the real invocations and exit 2 instead of silently succeeding; importing either module as a library MUST stay silent. The check MUST behave identically in the scripts/ source and the verbatim cdd/scripts/ store copy.

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

## MODIFIED Requirements

### Requirement: Loop law names three review points

The loop law — the rules text a fresh store renders as `cdd/rules.md` — MUST name review points R1 (conditional: a design gate answering T1 or T2 YES), R2 (always, at draft-green before the first implementation task), and R3 (at Close before archive) with their skills, modes, and findings paths, MUST state the ADR review's precise trigger — decision-content changes fire it; reconfirmations and typo fixes do not — and MUST state the advisory-findings grammar: severities blocker/should/note, dispositions fixed:/open/won't-fix:, never red/green verdicts, gate authority with the deterministic validators and the human.

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

Scenario: Rule 2a states the two decisions directories
  Given the loop law text rendered into a fresh store's cdd/rules.md
  When the review-points rule is read
  Then it names the repository root decisions directory as the home of ADRs 0001 through 0007, the product decisions
  And it names cdd/decisions as the home of ADRs numbered 0008 and later, the loop decisions
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
```

Code: lib/loop-law.mjs, lib/templates.mjs, lib/instructions.mjs, lib/context.mjs, lib/help.mjs, README.md, cdd/rules.md, cdd/decisions/0008-*.md, tests/acceptance/review-wiring.test.js, tests/acceptance/single-source-law.test.js

### Requirement: Tasks template scaffolds review tasks

The tasks scaffold MUST place a `3.1 Change review` task (skill `cdd-spec-review`, package mode, once the change package is drafted and validates green in draft mode, findings at `reviews/r2-change-review.md`, ticks only when no blocker is open) before the single placeholder implementation task, MUST place in the Close section — before the validate-and-guard and archive items — a code-review task (skill `cdd-code-review`, findings at `reviews/r3-code-review.md`) and a conditional ADR-review task (skill `cdd-adr-review`, findings at `reviews/adr-review.md`, skip recorded on the task line when the change made no ADR decision-content change — drafting an ADR or amending one's content counts; a Reconfirmed-by paragraph or typo fix does not), and its embedded instruction text MUST explain these clauses and the advisory-findings rule. The smoke suite MUST pin these scaffolds.

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
  And the second runs skill cdd-adr-review on ADRs whose decision content this change drafted or amended, with findings path reviews/adr-review.md and a skip recorded on the task line when no ADR decision content changed
  And it states on the task line that a Reconfirmed-by paragraph or typo fix is not a decision-content change
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

Code: lib/context.mjs, lib/help.mjs, cdd/rules.md, cdd/decisions/0008-*.md, tests/acceptance/review-wiring.test.js
