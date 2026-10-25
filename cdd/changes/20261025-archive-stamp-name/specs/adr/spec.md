## MODIFIED Requirements

### Requirement: The reconfirm op records decision reconfirmation

The cdd tool's reconfirm op appends the standardized line `- Reconfirmed by <change> on <yyyy-mm-dd>: <evidence>` to an ADR's reconfirmation block, below existing reconfirmation lines. The change name defaults to the sole open change and explicitly accepts an archived change name (post-Close debt has a lawful path), matching a dated query by stripping at most one leading `yyyymmdd-` date segment from it — the same archived-basename law the archive compose uses; evidence is one required line. The op refuses an unknown id, a superseded ADR (naming the supersede path), a missing change (no open change and none given), an unknown change name — no verbatim match and no one-date-strip normalized match (naming the open and archived namespaces), missing or multi-line evidence, and a second reconfirmation of the same ADR by the same change. `--check` lists, for one open change (refusing the ambiguity of several until an explicit change narrows it), every ADR governing a claimed file of that change where the file's last non-mechanical commit date is strictly after the ADR's latest reconfirmation date — or, when never reconfirmed, after the ADR file's own last non-mechanical commit date. The governed claimed files in `--check` come from the shared claim map built in the claims-index module; the op holds no private claim derivation. A store sweep holds every reconfirmation line in every ADR to the pinned grammar.

```gherkin
Feature: The reconfirm op records decision reconfirmation

Scenario: Reconfirm appends the pinned line for the open change
  Given a sandbox store holding 1 accepted never-reconfirmed ADR and exactly 1 open change
  When the cdd tool runs op reconfirm with that ADR id and a one-line evidence
  Then the ADR file gains exactly 1 new line matching "- Reconfirmed by <change> on <yyyy-mm-dd>: <evidence>" with the open change's name and today's date
  # Verified by: tests/acceptance/adr-reconfirm.test.js

Scenario: An archived change name works post-Close
  Given a sandbox store holding 1 accepted never-reconfirmed ADR, no open change, and exactly 1 archived change
  When the cdd tool runs op reconfirm with that ADR id, the archived change's name, and a one-line evidence
  Then the ADR file gains exactly 1 new line in the pinned format naming the archived change
  # Verified by: tests/acceptance/adr-reconfirm.test.js

Scenario: A dated change query resolves to its bare archived name
  Given a sandbox store holding 1 accepted never-reconfirmed ADR, no open change, and exactly 1 archived change whose original change name started with a yyyymmdd date segment
  When the cdd tool runs op reconfirm with that ADR id, the dated original change name, and a one-line evidence
  Then the ADR file gains exactly 1 new line in the pinned format naming the dated change
  # Verified by: tests/acceptance/adr-reconfirm.test.js

Scenario: An unknown change name still refuses after normalized matching
  Given a sandbox store holding 1 accepted never-reconfirmed ADR and exactly 1 open change
  When the cdd tool runs op reconfirm with that ADR id, a change name that matches no known change verbatim or after stripping 1 leading date segment, and a one-line evidence
  Then the tool answers with exactly 1 error naming the open change and the archive namespace and the ADR file is unchanged
  # Verified by: tests/acceptance/adr-reconfirm.test.js

Scenario: An unknown ADR id refuses
  Given a sandbox store holding exactly 1 ADR
  When the cdd tool runs op reconfirm with id ADR-0099 and a one-line evidence
  Then the tool answers with exactly 1 error and the ADR file is unchanged
  # Verified by: tests/acceptance/adr-reconfirm.test.js

Scenario: A superseded ADR refuses naming the supersede path
  Given a sandbox store holding exactly 1 superseded ADR
  When the cdd tool runs op reconfirm with that ADR id and a one-line evidence
  Then the tool answers with exactly 1 error naming the supersede path (a new ADR marking this one superseded) and the file is unchanged
  # Verified by: tests/acceptance/adr-reconfirm.test.js

Scenario: No open change and none given refuses
  Given a sandbox store holding 1 accepted ADR and no open change
  When the cdd tool runs op reconfirm with that ADR id and a one-line evidence and no change
  Then the tool answers with exactly 1 error and the file is unchanged
  # Verified by: tests/acceptance/adr-reconfirm.test.js

Scenario: Missing evidence refuses
  Given a sandbox store holding 1 accepted ADR and exactly 1 open change
  When the cdd tool runs op reconfirm with that ADR id and no evidence
  Then the tool answers with exactly 1 error and the file is unchanged
  # Verified by: tests/acceptance/adr-reconfirm.test.js

Scenario: The same change reconfirming twice refuses
  Given a sandbox store holding 1 accepted ADR already reconfirmed by the open change
  When the cdd tool runs op reconfirm with that ADR id and a one-line evidence
  Then the tool answers with exactly 1 error naming the existing reconfirmation and the file is unchanged
  # Verified by: tests/acceptance/adr-reconfirm.test.js

Scenario: An unknown change name refuses
  Given a sandbox store holding 1 accepted never-reconfirmed ADR and exactly 1 open change
  When the cdd tool runs op reconfirm with that ADR id, change "no-such-change", and a one-line evidence
  Then the tool answers with exactly 1 error naming the open change and the archive namespace and the ADR file is unchanged
  # Verified by: tests/acceptance/adr-reconfirm.test.js

Scenario: Multi-line evidence refuses
  Given a sandbox store holding 1 accepted never-reconfirmed ADR and exactly 1 open change
  When the cdd tool runs op reconfirm with that ADR id and an evidence containing a newline
  Then the tool answers with exactly 1 error naming the one-line rule and the ADR file is unchanged
  # Verified by: tests/acceptance/adr-reconfirm.test.js

Scenario: A new reconfirmation lands below the existing ones
  Given a sandbox store holding 1 accepted ADR with 2 pinned reconfirmation lines followed by trailing sections
  When the cdd tool runs op reconfirm with that ADR id and a one-line evidence
  Then the new pinned line sits directly below the last existing reconfirmation line and above the trailing sections
  # Verified by: tests/acceptance/adr-reconfirm.test.js

Scenario: Check lists exactly the ADRs whose claims moved
  Given a synthetic git repository holding exactly 1 open change and 2 accepted ADRs governing its claimed files, where 1 ADR's governed file was last committed 2026-10-24 with the ADR's latest reconfirmation on 2026-10-23, and the other ADR's governed files were last committed 2026-10-20 with its latest reconfirmation on 2026-10-22
  When the cdd tool runs op reconfirm with check
  Then the answer names exactly the first ADR with its moved file and names no other ADR
  # Verified by: tests/acceptance/adr-reconfirm.test.js

Scenario: Check lists a never-reconfirmed ADR against the ADR file's own commits
  Given a synthetic git repository holding exactly 1 open change and 2 accepted never-reconfirmed ADRs governing its claimed files, where 1 ADR's governed file was committed after the ADR file's last commit and the other ADR was committed after its governed files
  When the cdd tool runs op reconfirm with check
  Then the answer names exactly the first ADR and names no other ADR
  # Verified by: tests/acceptance/adr-reconfirm.test.js

Scenario: The store sweep holds every reconfirmation line to the grammar
  Given the repository's 13 ADRs after the migration
  When every line in every ADR mentioning reconfirmation is matched against the pinned grammar "- Reconfirmed by <change> on <yyyy-mm-dd>: <evidence>"
  Then every such line is a full-line match on the pinned grammar and no legacy shape remains
  # Verified by: tests/acceptance/adr-reconfirm.test.js

Scenario: Check with multiple open changes refuses until narrowed
  Given a sandbox store holding 2 open changes and no ADR
  When the cdd tool runs op reconfirm with check and no change
  Then the tool answers with exactly 1 error naming both open changes and demanding --change
  # Verified by: tests/acceptance/adr-reconfirm.test.js

Scenario: Check with an explicit change narrows the pre-flight
  Given a sandbox store holding 2 open changes where only the named one claims a governed file that moved
  When the cdd tool runs op reconfirm with check and that change's name
  Then the answer scopes itself to the named change and names no other change
  # Verified by: tests/acceptance/adr-reconfirm.test.js
```

Code: lib/adr-ops.mjs, tests/acceptance/adr-reconfirm.test.js
split-considered: kept whole — the MODIFIED restates the living requirement complete (loop law rule 4); the reconfirm requirement's size predates this change (15 scenarios) and its split belongs to the PF-6 capability-split conversation.
