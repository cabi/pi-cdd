## ADDED Requirements

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
