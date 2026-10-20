## ADDED Requirements

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
