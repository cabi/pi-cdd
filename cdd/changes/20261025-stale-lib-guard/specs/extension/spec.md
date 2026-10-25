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

## ADDED Requirements

### Requirement: A stale process refuses mutation and warns on verdicts

A long-lived cdd process that outlived edits to the extension's own source MUST NOT mutate a store with pre-edit code. Every dispatch and every mutating door-1 command compares the extension source surface on disk against the process's load-time snapshot — membership plus each file's content digest, so a changed file counts as stale even when its modification time and size are unchanged. A mutating op (init, new, archive, backlog add/resolve/revalidate, reconfirm) on a changed surface is refused with exactly 1 error naming the changed files and the fresh-node command that runs the op; a verdict or read op (validate, status, adrs, help, backlog list) answers with exactly 1 staleness warning naming the changed files; a clean process is unaffected. An op the grader does not recognize grades mutating.

```gherkin
Feature: A stale process refuses mutation and warns on verdicts

Scenario: A stale process refuses a mutating op
  Given a store holding 1 strictly-green open change and a tool process whose load-time snapshot of the extension source no longer matches disk because one file changed after load
  When the cdd tool runs op archive on that change
  Then the tool answers with exactly 1 error whose data names the changed file and a fresh-node command that runs the archive op
  And the store still holds the change folder under cdd/changes with no archive folder under cdd/archive
  # Verified by: tests/acceptance/stale-lib-guard.test.js

Scenario: A stale process warns on a verdict op
  Given a store holding 1 open change and a tool process whose load-time snapshot of the extension source no longer matches disk because one file changed after load
  When the cdd tool runs op validate on that change
  Then the tool answers with the change's verdict plus exactly 1 staleness warning naming the changed file
  # Verified by: tests/acceptance/stale-lib-guard.test.js

Scenario: An added file counts as changed
  Given a tool process loaded over an extension source surface with one new file written into that surface after load
  When the cdd tool runs op archive
  Then the tool answers with exactly 1 error naming the added file
  # Verified by: tests/acceptance/stale-lib-guard.test.js

Scenario: A removed file counts as changed
  Given a tool process loaded over an extension source surface with one of the surface's files deleted after load
  When the cdd tool runs op archive
  Then the tool answers with exactly 1 error naming the deleted file
  # Verified by: tests/acceptance/stale-lib-guard.test.js

Scenario: Backlog actions grade by their action
  Given a store holding 1 backlog item and a tool process whose load-time snapshot of the extension source no longer matches disk because one file changed after load
  When the cdd tool runs op backlog with action list and then op backlog with action add
  Then the list run answers with the backlog items plus exactly 1 staleness warning and the add run answers with exactly 1 error naming a fresh-node command
  # Verified by: tests/acceptance/stale-lib-guard.test.js

Scenario: A clean process is unaffected
  Given a store holding 1 open change and a tool process whose load-time snapshot matches disk
  When the cdd tool runs op validate and then op status and then op help
  Then each answer carries no staleness warning and no staleness refusal
  # Verified by: tests/acceptance/stale-lib-guard.test.js

Scenario: Every mutating door-1 command consults the same guard
  Given a tool process whose load-time snapshot of the extension source no longer matches disk because one file changed after load
  When the door-1 commands /cdd-init, /cdd-new, and /cdd-archive each run
  Then each answers with exactly 1 error naming the changed file and a fresh-node command for its own operation
  # Verified by: tests/acceptance/stale-lib-guard.test.js

Scenario: A same-length rewrite with the original modification time is detected
  Given a tool process loaded over an extension source surface and one surface file rewritten after load with the same byte length and its original modification time restored
  When the cdd tool runs op archive
  Then the tool answers with exactly 1 error naming that file
  # Verified by: tests/acceptance/stale-lib-guard.test.js

Scenario: Every refusal command runs its op
  Given the guard's fresh-node command table and an isolated scratch store prepared per mutating op and backlog action
  When each mutating refusal's fresh-node command runs in its scratch store in a fresh process
  Then each command performs exactly its own operation — the store is initialized, the change is created, the backlog item is added, resolved, and revalidated, the reconfirmation is written, and the change is archived
  # Verified by: tests/acceptance/stale-lib-guard.test.js
```

Code: index.ts, lib/stale.mjs, tests/tools.mjs, tests/acceptance/stale-lib-guard.test.js
