## ADDED Requirements

### Requirement: The backlog triage skill is bundled

The extension bundles `skills/cdd-backlog-triage/SKILL.md` — the triage rubric for `cdd/backlog.md` process findings — discovered through the existing `pi.skills` registration. The skill advises; it never enforces: the backlog stays living triage data that no door checks (rule 13), which the skill cites without restating.

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
  And it states that items are minted and resolved only through the cdd backlog op, with direct note edits that keep the grammar as the exactly 1 freehand exception
  # Verified by: tests/smoke.mjs

```

Code: skills/cdd-backlog-triage/SKILL.md, tests/smoke.mjs
