## MODIFIED Requirements

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
