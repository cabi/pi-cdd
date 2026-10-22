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

Scenario: Rule 2a cross-references the two-sessions rule
  Given the loop law text rendered into a fresh store's cdd/rules.md
  When rule 2a is read where it names R3
  Then it cross-references the rule 2b requirement that the standards and spec axes run as two separate cold sessions
  # Verified by: tests/acceptance/loop-law-hardening.test.js
```

Code: lib/loop-law.mjs, lib/templates.mjs, lib/instructions.mjs, lib/context.mjs, lib/help.mjs, README.md, cdd/rules.md, cdd/decisions/0008-*.md, tests/acceptance/review-wiring.test.js, tests/acceptance/single-source-law.test.js, tests/acceptance/loop-law-hardening.test.js

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

## ADDED Requirements

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

The five reviewer brief templates MUST exist on disk next to their bundled skills — `brief-r1.md` and `brief-r2.md` beside cdd-spec-review, `brief-r3-standards.md` and `brief-r3-spec.md` beside cdd-code-review, `brief-adr.md` beside cdd-adr-review — each carrying the common skeleton (change identity, reviewer session requirements including the author-family rule and two-axes-two-sessions where applicable, inputs as paths with pinned read-time state, scope fence, findings grammar, the output filename per loop-law `reviewPoint()`, advisory-only notice) plus its per-review-type MUST-DELIVER checklist, and each skill's SKILL.md MUST point at the briefs living next to it.

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

Code: skills/cdd-spec-review/brief-r1.md, skills/cdd-spec-review/brief-r2.md, skills/cdd-code-review/brief-r3-standards.md, skills/cdd-code-review/brief-r3-spec.md, skills/cdd-adr-review/brief-adr.md, tests/smoke.mjs, tests/acceptance/loop-law-hardening.test.js

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
