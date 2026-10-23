## ADDED Requirements

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

Code: lib/loop-law.mjs, lib/templates.mjs, lib/instructions.mjs, lib/context.mjs, lib/help.mjs, README.md, cdd/rules.md, tests/acceptance/review-wiring.test.js, tests/acceptance/single-source-law.test.js, tests/acceptance/loop-law-hardening.test.js, tests/acceptance/r3-findings.test.js

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
