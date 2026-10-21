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

## MODIFIED Requirements

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
