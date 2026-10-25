# adr — living spec

## Requirements

### Requirement: Product ADRs live in the store's decisions home

Every ADR lives in `cdd/decisions/` — 0001–0007 the product decisions relocated from the repository root with history intact, 0008 and later the loop decisions — there is no second decisions directory. Relocation preserves git history through the move, and every relocated ADR carries a frontmatter status the drift guard's enum accepts. The decisions home is decision memory governed unconditionally by the guard's A-checks; this capability's `Code:` line names its enforcement pin, never the memory files themselves.

```gherkin
Feature: Product ADRs live in the store's decisions home

Scenario: The store holds exactly the thirteen ADRs
  Given a repository whose product ADRs 0001 through 0007 were moved into the store
  When the decisions home is listed
  Then it holds exactly the 13 ADRs numbered 0001 through 0013 and the repository root holds no decisions directory
  # Verified by: tests/acceptance/decisions-home.test.js

Scenario: A relocated ADR keeps its history through the move
  Given a repository whose product ADRs 0001 through 0007 were moved into the store
  When git log --follow runs on the relocated ADR 0001
  Then it lists at least 2 commits — the move commit plus its pre-move history
  # Verified by: tests/acceptance/decisions-home.test.js

Scenario: Relocated ADR statuses sit in the guard's enum
  Given a repository whose product ADRs 0001 through 0007 were moved into the store
  When the frontmatter status of each of the 13 ADRs is read
  Then each is exactly one of accepted, superseded, draft, or proposed
  # Verified by: tests/acceptance/decisions-home.test.js

Scenario: The door 3 full scan governs all thirteen ADRs
  Given a repository whose product ADRs 0001 through 0007 were moved into the store
  When the door 3 full scan runs
  Then it exits 0 with no A-check finding naming any of the 13 ADRs
  # Verified by: tests/acceptance/decisions-home.test.js

```

Code: tests/acceptance/decisions-home.test.js

### Requirement: The adrs op discovers governing decisions

The cdd tool's adrs op lists every ADR from the shared claims index (id, title, status, code globs), filters by status using the shared vocabulary, and answers a code path with every accepted ADR whose globs claim it, ordered by id. An unknown status refuses listing the shared vocabulary's statuses with a nearest-match hint (edit distance at most 2, or an unambiguous prefix; an ambiguous tie lists the candidates and hints nothing). Paths normalize before matching: a leading `./` is stripped, an absolute path is relativized against the store root, and a path outside the root refuses. A directory answers every accepted ADR governing at least 1 claimed file under it, stating that semantics. An empty answer carries the remedy hint to run `cdd adrs` for all claims. Single-path governing answers (including paths not among the tracked files) come from the claim map's per-path governing query; directory answers and open-delta claims come from the same map — the op holds no glob translation, no private claiming loop, and no restated `Code:`-line scan, and open-delta specs are read with the shared spec parse.

```gherkin
Feature: The adrs op discovers governing decisions

Scenario: The unfiltered table lists every ADR
  Given the repository's store holding its 13 ADRs
  When the cdd tool runs op adrs with no options
  Then the answer lists all 13 ADRs in id order, each with its id, its title, its status, and its code globs
  # Verified by: tests/acceptance/adr-ops.test.js

Scenario: The status filter narrows to matching ADRs
  Given the repository's store holding its 13 ADRs with exactly 1 superseded ADR
  When the cdd tool runs op adrs with status superseded
  Then the answer lists exactly 1 ADR, the superseded one, and no other
  # Verified by: tests/acceptance/adr-ops.test.js

Scenario: An unknown status by edit distance refuses with a hint
  Given the repository's store holding its 13 ADRs
  When the cdd tool runs op adrs with status drafed
  Then the tool answers with exactly 1 error listing exactly the 4 shared statuses and hinting "did you mean: --status draft"
  # Verified by: tests/acceptance/adr-ops.test.js

Scenario: An unambiguous prefix refuses with a hint
  Given the repository's store holding its 13 ADRs
  When the cdd tool runs op adrs with status prop
  Then the tool answers with exactly 1 error listing exactly the 4 shared statuses and hinting "did you mean: --status proposed"
  # Verified by: tests/acceptance/adr-ops.test.js

Scenario: Overlapping claims list every governing ADR in id order
  Given the repository's store where 7 ADRs claim lib/templates.mjs through literal or star globs and 1 of them is superseded
  When the cdd tool runs op adrs with code lib/templates.mjs
  Then the answer lists exactly ADR-0006, ADR-0007, ADR-0008, ADR-0009, ADR-0011, and ADR-0012 in id order, and the superseded ADR-0005 is listed nowhere
  # Verified by: tests/acceptance/adr-ops.test.js

Scenario: A dot-slash path normalizes to the relative form
  Given the repository's store
  When the cdd tool runs op adrs with code ./lib/templates.mjs
  Then the answer is identical to the answer for code lib/templates.mjs
  # Verified by: tests/acceptance/adr-ops.test.js

Scenario: An absolute path relativizes against the store root
  Given the repository's store
  When the cdd tool runs op adrs with code set to the store root's absolute lib/templates.mjs path
  Then the answer is identical to the answer for code lib/templates.mjs
  # Verified by: tests/acceptance/adr-ops.test.js

Scenario: A path outside the store root refuses
  Given the repository's store
  When the cdd tool runs op adrs with code /etc/passwd
  Then the tool answers with exactly 1 error refusing the path as outside the store root
  # Verified by: tests/acceptance/adr-ops.test.js

Scenario: A directory answers any claimed file under it
  Given the repository's store
  When the cdd tool runs op adrs with code lib
  Then the answer lists every accepted ADR governing at least 1 claimed file under lib/, ordered by id, and states that a directory matches any claimed file under it
  # Verified by: tests/acceptance/adr-ops.test.js

Scenario: No governing ADR answers empty with the remedy hint
  Given the repository's store
  When the cdd tool runs op adrs with code no/such/file.mjs
  Then the answer holds no ADR and its text carries the remedy hint to run cdd adrs to see all claims
  # Verified by: tests/acceptance/adr-ops.test.js
```

Code: lib/adr-ops.mjs, tests/acceptance/adr-ops.test.js

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
