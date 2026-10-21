<!--
SPEC DELTA — how to fill this file (behavior contracts, not implementation)

Precision lives in scenarios, not prose: a spec that chases precision
through ever-more-detailed English either stays ambiguous or turns into
pseudo-code. State each behavior once as a requirement, then pin it down
with quantified WHEN/THEN scenarios that read like test cases.

Format (cdd validate enforces):
- "### Requirement: <name>" plus a description of at most 500 characters
  stating exactly one behavior. Use SHALL/MUST for normative statements,
  never should/may.
- Every requirement carries exactly one ```gherkin fence holding one
  complete Gherkin document (ADR-0006): "Feature: <name>" equal to the
  requirement heading, then one or more "Scenario: <name>" blocks — Given/
  When/Then steps with exactly one When, at least one Then, And/But only
  continuing the step above — and each scenario ends with its last line
  "# Verified by: tests/acceptance/<path>". No markdown "#### Scenario:"
  headings, no prose inside the fence, no other comments, no Background,
  Rule, tags, Scenario Outline, Examples, data tables, doc strings, or
  non-English keywords.
- Delta operations: ## ADDED / MODIFIED / REMOVED Requirements. A MODIFIED
  block must restate the requirement with EVERY scenario the living spec
  already has, plus the new or changed ones — silently dropping an existing
  scenario fails validation. A REMOVED requirement carries a "Reason:" line
  and, if users are affected, a migration note.
- End with "Code: <glob>" lines naming the files this capability owns; the
  drift guard matches tracked files against these globs for staleness and
  single-owner checks. A capability without a Code line guards nothing.
- Test-contract migration: when this change legitimately breaks an existing
  acceptance test, the delta MUST carry a MODIFIED requirement covering it
  AND the tasks must track the test rewrite as its own task.

Quantification (the anti-"bi-weekly" rules):
- Every interval, amount, limit, and threshold carries a number and a unit:
  "every 14 days", not "bi-weekly" or "regularly"; "p95 under 200 ms", not
  "fast"; "3 retries", not "several".
- Comparatives ("fast", "large", "user-friendly") are banned unless a number
  follows them. If it cannot be measured, it is a Non-Goal, not a requirement.
- Each scenario is a potential automated test: WHEN states the exact input or
  trigger, THEN the exactly observable outcome. A scenario that depends on
  geometry, quotas, or timing states its measured budget — a scenario that
  cannot hold on the target environment is a spec bug; reject it at propose
  time, not as a red acceptance test at apply time.

Content rules:
- Write scenarios declaratively: Given/When/Then state observable outcomes
  and the value delivered — never interaction mechanics such as keystrokes,
  widgets, or selectors. Declarative phrasing is door-1 review law; the
  validator checks parse and grammar, never phrasing.
- Spec observable behavior: inputs, outputs, error conditions, external
  constraints. No internal class/function names, no library choices, no
  step-by-step internals — those belong in tasks.md design notes.
- Quick test: if the implementation can change without changing externally
  visible behavior, it does not belong in this file.
- Do not add requirements the proposal's Done-When does not need. Anything
  else is scope creep.
-->

## ADDED Requirements

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
  And the README table names R1, R2, and R3 with their triggers
  # Verified by: tests/acceptance/review-wiring.test.js

Scenario: Ambient and help statements match the law
  Given the ambient context block and the help text of the extension
  When both are read
  Then each names R1, R2, and R3 with the same triggers as the review-points rule
  # Verified by: tests/acceptance/review-wiring.test.js
```

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
