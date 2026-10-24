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

## MODIFIED Requirements

### Requirement: cdd archive stamps a derived metrics file

At Close, between the Close auto-tick and the archive rename, the archive operation MUST derive and write exactly 1 metrics.md into the archive folder from the change's own artifacts; every stamped number MUST be mechanically derivable from those artifacts or explicitly labeled with its derivation basis; the done-whens count MUST equal the proposal validator's comment-masked Done-When count — one view behind both surfaces — and stamp failure MUST never gate the archive. Split-considered: deferred to the PF-6 gherkin store-ops split; the stamp is one more derived write of the same archive operation and rides its Code line.

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
  Then each number equals the direct count — done-whens equal the comment-masked Done-When count the validator uses, non-goals equal the Non-Goals bullet count, delta-requirements and delta-scenarios equal the Requirement and Scenario line counts inside the delta operations, subtasks equal the checkbox line count — the delta counts from the repository's single spec parse and the done-whens count from the validator's masked view, never a private re-parse
  # Verified by: tests/acceptance/archive-metrics-stamp.test.js

Scenario: The done-whens count matches the validator's masked view
  Given a strictly valid change whose proposal holds 4 real Done-When lines and 1 instruction comment holding a Done-When-shaped line, for exactly 5 raw line matches
  When the stamp is derived
  Then the spec-strength block lists done-whens 4, equal to the validator's masked count over the same proposal text
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

Code: lib/store.mjs, lib/metrics.mjs, lib/validate.mjs, tests/acceptance/archive-metrics-stamp.test.js
