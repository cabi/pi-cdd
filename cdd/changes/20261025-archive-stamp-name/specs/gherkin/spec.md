## ADDED Requirements

### Requirement: Archive folders carry the stamp date once

The archive op MUST compose the archive folder name as the archive stamp followed by the change name stripped of at most one leading `yyyymmdd-` date segment. Change names MAY carry a leading date prefix; the archive stamp is the authoritative archive date. For a change name whose slug after that one strip carries no leading date segment, the archived folder never carries a doubled date prefix; the rename target and the reported archive path MUST land on that one composed name.

```gherkin
Feature: Archive folders carry the stamp date once

Scenario: A dated change name strips exactly one leading date segment
  Given a sandbox store holding 1 closable change whose name starts with a yyyymmdd date segment
  When the cdd tool archives that change
  Then the archive folder name is the archive stamp followed by the change name with exactly 1 leading date segment removed
  # Verified by: tests/acceptance/archive-folder-name.test.js

Scenario: A bare change name appends unchanged
  Given a sandbox store holding 1 closable change whose name carries no date segment
  When the cdd tool archives that change
  Then the archive folder name is the archive stamp plus the change name unchanged
  # Verified by: tests/acceptance/archive-folder-name.test.js

Scenario: The archived folder never carries a doubled date prefix
  Given a sandbox store holding 1 closable change whose name starts with exactly 1 yyyymmdd date segment, equal to the archive stamp's date, followed by a slug with no leading date segment
  When the cdd tool archives that change
  Then the archive folder name contains exactly 1 date prefix and the reported archive path names that same folder
  # Verified by: tests/acceptance/archive-folder-name.test.js

Scenario: The reported archive path locates the stamped metrics file
  Given a sandbox store holding 1 closable change whose name starts with a yyyymmdd date segment
  When the cdd tool archives that change
  Then the reported archive path equals the archive folder on disk and the derived metrics stamp is readable through it
  # Verified by: tests/acceptance/archive-folder-name.test.js
```

Code: lib/store.mjs, tests/smoke.mjs, tests/acceptance/archive-folder-name.test.js
split-considered: kept whole — one naming law on a single seam (archivedBasename consumed at both compose points); the gherkin size question is owned wholesale by the PF-6 store-ops capability split (director M0: Tier A budget unchanged).
