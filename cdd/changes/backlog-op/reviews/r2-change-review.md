# R2 package review — backlog-op

- Reviewer form: cold sub-agent session (fresh session, briefed only from the R2 brief at /tmp/brief-r2-backlog-op.md and the artifact paths on disk)
- Reviewer model family: opencode-zen (deepseek lineage) — `PI_PROVIDER=opencode-zen`, `PI_MODEL=deepseek-v4-pro`
- Author model family: zai (glm lineage) — per the brief
- Families differ: yes (opencode-zen/deepseek vs zai/glm)
- Review point: R2 (package), at draft-green
- Artifacts reviewed: proposal.md, tasks.md, specs/extension/spec.md, specs/gherkin/spec.md, plus the living specs cdd/specs/{extension,gherkin}/spec.md and cdd/rules.md
- Disposition grammar: every finding is `open`; the author later sets `fixed:` / `won't-fix:`.

## Findings

### 1. blocker — Seed deliverable is internally contradictory (7 items + header vs "8 item lines PF-1..PF-8")

The gherkin delta pins the live backlog at "exactly 8 item lines with ids PF-1 through PF-8", but the proposal and the seeding task both say seed #8 is the header conventions line, not an item — which yields 7 item lines (PF-1..PF-7) plus one header line.

Evidence:
- `cdd/changes/backlog-op/specs/gherkin/spec.md:27` — "Then it holds exactly 8 item lines with ids PF-1 through PF-8 and every item line matches the grammar"
- `cdd/changes/backlog-op/proposal.md:52` — "8. conventions line in the file header, not an item — a steer is believed only when an on-disk artifact backs it"
- `cdd/changes/backlog-op/tasks.md:19` — "seed 8 as the header conventions line, not an item"
- `cdd/changes/backlog-op/proposal.md:35` — Done-When "holds the 8 triaged seed findings" (one of the 8 is a header line, not a finding)

The acceptance test that pins this scenario and the seeding task (3.7) cannot both be satisfied as written: the scenario demands 8 item lines PF-1..PF-8, the task produces 7 items plus a header. One of the two must change. No scenario pins the header conventions line itself, so the header deliverable is also unpinned.

### 2. should — "unknown options" refusal has no requirement backing

Done-When #1 and the proposal's What Changes name "unknown actions and options" as a refusal, but the delta requirement prose drops "options" and no scenario covers an unknown option.

Evidence:
- `cdd/changes/backlog-op/proposal.md:34` — Done-When "refusing unknown actions and options, unknown ids, resolve-to-open, ..."
- `cdd/changes/backlog-op/proposal.md:10` — "refuses unknown actions and options, unknown ids, ..."
- `cdd/changes/backlog-op/specs/extension/spec.md:7` — "The op refuses unknown actions, unknown ids, resolving to open, ..." (no "options")
- `cdd/changes/backlog-op/specs/extension/spec.md` — no scenario names an unknown option (scenarios cover unknown action `purge`, unknown id, seeded-without-change, off-grammar line)

A Done-When clause ("unknown options") has no requirement or scenario that sponsors it.

### 3. should — "resolve-to-open" refusal is stated but has no scenario pin

The requirement prose names "resolving to open" as a refusal, but no scenario pins it, so the behavior is unpinned by any acceptance test.

Evidence:
- `cdd/changes/backlog-op/specs/extension/spec.md:7` — "The op refuses ... resolving to open, ..."
- `cdd/changes/backlog-op/specs/extension/spec.md` — the seven scenarios are: add-first-item, list-default, resolve-rewrites-status, seeded-without-change, unknown-action, unknown-id, off-grammar-line. None exercises resolve-to-open.

### 4. should — Code: globs omit files the change modifies

The change modifies `lib/help.mjs` (ops row), `tests/tools.mjs` (op enum 6→7), `tests/smoke.mjs` (ops row), and `MAINTENANCE.md` (ownership note and the "six ops" references), but none of these files appears in the proposal's `Code:` line or in any delta `Code:` glob. The guard correlates code↔spec through Code: globs, so these edits are invisible to it.

Evidence:
- `cdd/changes/backlog-op/tasks.md:17` — "3.5 help.mjs ops row gains backlog and MAINTENANCE.md records the backlog file's ownership"
- `cdd/changes/backlog-op/proposal.md` Pins bullet — "tests/tools.mjs op pins (enum 6→7, description budget held) ... tests/smoke.mjs ops row, MAINTENANCE.md ownership note"
- `cdd/changes/backlog-op/proposal.md:39` — `Code: index.ts, lib/backlog.mjs, lib/templates.mjs, cdd/rules.md, tests/acceptance/backlog-op.test.js, tests/acceptance/library-usage.test.js` (no help.mjs, tests/tools.mjs, tests/smoke.mjs, MAINTENANCE.md)
- `cdd/changes/backlog-op/specs/extension/spec.md` Code: `index.ts, lib/backlog.mjs, tests/acceptance/backlog-op.test.js` (no tests/tools.mjs)

### 5. note — Done-When traceability table criterion drops refusal clauses

The traceability table's first criterion is a shortened restatement of Done-When #1 that drops "and options", "resolve-to-open", and "seeded-into-change without a change name", so the table does not trace the full Done-When.

Evidence:
- `cdd/changes/backlog-op/tasks.md:24` — "The `cdd backlog` op adds, lists, and resolves items in `cdd/backlog.md`, refusing unknown actions, unknown ids, and off-grammar files"
- `cdd/changes/backlog-op/tasks.md:24` — "The `cdd backlog` op adds, lists, and resolves items in `cdd/backlog.md`, refusing unknown actions, unknown ids, and off-grammar files"
- `cdd/changes/backlog-op/proposal.md:34` — Done-When "refusing unknown actions and options, unknown ids, resolve-to-open, seeded-into-change without a change name, and off-grammar files"

## Dispositions

- 1. blocker → fixed: the gherkin seed scenario now pins "exactly 7 item lines with ids PF-1 through PF-7, every item line matches the grammar, and the file header carries the conventions line that a steer is believed only when an on-disk artifact backs it"; proposal Done-When 2 and the traceability table row follow the same wording — 7 items plus a pinned header line, no contradiction.
- 2. should → fixed: requirement prose now reads "refuses unknown actions and options"; new scenario "An unknown option refuses" pins it.
- 3. should → fixed: new scenario "Resolving to open refuses" pins it.
- 4. should → fixed / won't-fix (partial): extension delta Code: gains `tests/tools.mjs`; the gherkin law requirement's Code: gains `lib/help.mjs` and `tests/smoke.mjs` — both are gherkin-owned in the living spec, and claiming them from the extension capability would trip the guard's cross-capability O-check; the proposal's consolidated Code: line now names all edited files. `MAINTENANCE.md` stays out of every Code: glob by design (its outside-spec-ownership note; recorded as a Non-Goal).
- 5. note → fixed: traceability row 1 restates Done-When 1 verbatim and row 2 the new seed wording.

Author: zai/glm-5.3 (same session that authored the artifacts), 2026-10-22.
