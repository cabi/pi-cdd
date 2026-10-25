## ADDED Requirements

### Requirement: cdd archive stamps a derived metrics file

At Close, between the Close auto-tick and the archive rename, the archive operation MUST derive and write exactly 1 metrics.md into the archive folder from the change's own artifacts; every stamped number MUST be mechanically derivable from those artifacts or explicitly labeled with its derivation basis, and stamp failure MUST never gate the archive. Split-considered: carving this stamp into its own metrics capability — deferred to the PF-6 gherkin store-ops split; the stamp is one more derived write of the same archive operation and rides its Code line.

```gherkin
Feature: cdd archive stamps a derived metrics file

Scenario: The stamp lands in the archive folder
  Given a strictly valid open change holding 2 Done-When lines, 3 Non-Goals bullets, a delta with 1 ADDED requirement carrying 4 scenarios, 5 task checkboxes, 2 findings files under reviews, and a git store holding 3 commits
  When cdd archive completes
  Then the renamed archive folder holds exactly 1 metrics.md whose spec-strength block lists done-whens 2, non-goals 3, delta-requirements added 1 modified 0 removed 0, delta-scenarios 4, and subtasks 5
  # Verified by: tests/acceptance/archive-metrics-stamp.test.js

Scenario: Stamped counts equal direct counts over the artifacts
  Given the archived change whose stamp was derived
  When every spec-strength number is compared with a direct count over the change's own proposal, delta, and task files
  Then each number equals the direct count — done-whens equal the Done-When line count, non-goals equal the Non-Goals bullet count, delta-requirements and delta-scenarios equal the Requirement and Scenario line counts inside the delta operations, subtasks equal the checkbox line count — all derived from the repository's single spec parse rather than a private re-parse
  # Verified by: tests/acceptance/archive-metrics-stamp.test.js

Scenario: Review yield counts every observed findings layout
  Given a reviews folder holding exactly 7 findings files, one per distinct findings layout observed in the archive corpus
  When the stamp is derived
  Then each file contributes its hand-counted findings by severity and disposition, the stamp carries exactly 1 format-version line recording the parse assumption set, and a file without any severity row contributes 0 findings instead of an error
  # Verified by: tests/acceptance/archive-metrics-stamp.test.js

Scenario: A declared count that lies is stamped as a mismatch
  Given a findings file whose declared Counts line claims 0 blocker, 0 should, 0 note while its rows hold 1 blocker and 2 should findings
  When the stamp is derived
  Then the stamp carries exactly 1 mismatch line naming the file with the declared and the parsed numbers, and the review-yield block counts the parsed 1 blocker and 2 should
  # Verified by: tests/acceptance/archive-metrics-stamp.test.js

Scenario: Git facts carry their as-of-stamp label
  Given a change whose git store holds 3 commits and whose archive rename has not happened yet
  When the stamp is derived
  Then the convergence block carries exactly 3 labeled derivable facts — commits-before-archive 3, elapsed-so-far, and commit-visible re-ticks — each labeled as-of-stamp, beyond-2-norm is stamped omitted-with-reason because its cross-path count cannot close before the rename, and the honest-gaps block names the feature-to-archive gap, agent-only time, and session-token cost
  # Verified by: tests/acceptance/archive-metrics-stamp.test.js

Scenario: An underivable field states its reason
  Given a change store with no git metadata
  When the stamp is derived
  Then every git-derived field is stamped not-derivable: no git store with no field carrying an estimated value, while the spec-strength and review-yield blocks still carry their numbers
  # Verified by: tests/acceptance/archive-metrics-stamp.test.js

Scenario: A total stamp failure never gates the archive
  Given a strictly valid change whose stamp derivation fails before writing
  When cdd archive completes
  Then the archive rename and merge happen unchanged and the archive result carries the stamp outcome stamped false with the failure reason
  # Verified by: tests/acceptance/archive-metrics-stamp.test.js
```

Code: lib/store.mjs, lib/metrics.mjs, tests/acceptance/archive-metrics-stamp.test.js
