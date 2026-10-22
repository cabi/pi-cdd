## ADDED Requirements

### Requirement: Product ADRs live in the store's decisions home

Every ADR lives in `cdd/decisions/` — 0001–0007 the product decisions relocated from the repository root with history intact, 0008 and later the loop decisions — there is no second decisions directory. Relocation preserves git history through the move, and every relocated ADR carries a frontmatter status the drift guard's enum accepts.

```gherkin
Feature: Product ADRs live in the store's decisions home

Scenario: The store holds exactly the eleven ADRs
  Given a repository whose product ADRs 0001 through 0007 were moved into the store
  When the decisions home is listed
  Then it holds exactly the 11 ADRs numbered 0001 through 0011 and the repository root holds no decisions directory
  # Verified by: tests/acceptance/decisions-home.test.js

Scenario: A relocated ADR keeps its history through the move
  Given a repository whose product ADRs 0001 through 0007 were moved into the store
  When git log --follow runs on the relocated ADR 0001
  Then it lists at least 2 commits — the move commit plus its pre-move history
  # Verified by: tests/acceptance/decisions-home.test.js

Scenario: Relocated ADR statuses sit in the guard's enum
  Given a repository whose product ADRs 0001 through 0007 were moved into the store
  When the frontmatter status of each of the 11 ADRs is read
  Then each is exactly one of accepted, superseded, draft, or proposed
  # Verified by: tests/acceptance/decisions-home.test.js

Scenario: The door 3 full scan governs all eleven ADRs
  Given a repository whose product ADRs 0001 through 0007 were moved into the store
  When the door 3 full scan runs
  Then it exits 0 with no A-check finding naming any of the 11 ADRs
  # Verified by: tests/acceptance/decisions-home.test.js
```

Code: cdd/decisions/000[1-7]-*.md, tests/acceptance/decisions-home.test.js
