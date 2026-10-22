# backlog-op

## Why

Process findings from loop runs — deferred review findings, tooling friction, deployment quirks — live in session memory and session-local todo lists, and evaporate when the run ends. This month the director's ledger went stale twice off exactly that loss: a dispatched change was already done, and a "missing" feature already existed. Runners and the director need one durable, on-disk place where a finding survives the session that raised it.

## What Changes

- New durable file `cdd/backlog.md`: a flat list of process findings under a strict item grammar — one line per item, `- PF-n [status] summary | source: ref` plus optional `| change: name` and `| note: text` fields, status one of open, watch, done, won't-do, seeded-into-change, ids strictly increasing, header holding the conventions line (a steer is believed only when an on-disk artifact backs it). The file is born on first write and seeded with the 8 triaged findings from the 2026-10-22 runs.
- New library module `lib/backlog.mjs`: list (the default action), add, resolve. It refuses unknown actions and options, unknown ids, resolving to open, seeded-into-change without a change name, and any off-grammar line in the file, each as exactly one error result; it refuses silent direct execution like every library module.
- New `cdd` tool op `backlog` in index.ts: op enum, OPS_DOC entry, tool description, dispatch through the shared option parsing — no new slash command, no new legacy alias.
- One law line (rule 13 in `lib/templates.mjs` RULES_MD, mirrored byte-for-byte into `cdd/rules.md`): process findings from a run land in `cdd/backlog.md` as PF-n items via the op; milestone and Close reports cite PF-n ids, never prose; the backlog is living triage data, not spec — validate and the guard never check its content.
- Pins: tests/tools.mjs op pins (enum 6→7, description budget held), tests/acceptance/backlog-op.test.js (op round-trip through the real tool, grammar refusals, live-store seeds, law text, not-gated boundary), tests/acceptance/library-usage.test.js gains the backlog module scenario, tests/smoke.mjs ops row, MAINTENANCE.md ownership note for the new file. S-series pins edited only where pinned text legitimately changed.

## Solutions Considered

- backlog storage: session-local todo lists (`.pi/todos/`) — cover per-session task tracking; rejected as the finding store: session-scoped, invisible to the next runner, and the observed loss mechanism. Derived scans grepping finding markers out of tasks.md or reviews (the stale `.pi/todos/29027343.md` sketch) — rejected: findings sources are heterogeneous prose, markers never landed, and a scan re-derives what one append-friendly file already holds. `cdd/changes/name/tasks.md` — rejected: findings outlive their change and would archive away with it. Adopted: one curated file behind a thin op; the archive's folder-per-change pattern does not fit one-line items.
- op surface: the existing index.ts dispatch — op enum, OPS_DOC served by op help, parseOptions unknown-key refusal, isError results — already covers thin-op law and error style; adopted as-is with `backlog` joining. lib/status.mjs's two-shape rendering — rejected: backlog answers are line lists, no document pair needed.
- law text: the RULES_MD single source with its byte mirror into `cdd/rules.md` (ADR-0009) — adopted; rule 13 lands in the template and the mirror regen rides the archive commit. The existing gherkin requirement "Library modules refuse silent direct execution" — adopted by MODIFIED: `lib/backlog.mjs` joins its Code: globs and scenario set. Follows ADR-0008 (the backlog records advisory findings and never gates), ADR-0009 (single-sourced law text), ADR-0010 (rules.md governed as loop law), ADR-0011 (acceptance pins invoke the real op, never a reimplementation).

## Capabilities

- extension — ADDED: the backlog op's on-disk triage behavior (the tool surface this capability owns).
- gherkin — ADDED: the process-findings law requirement; MODIFIED: "Library modules refuse silent direct execution" gains `lib/backlog.mjs`. No new `backlog` capability: the op belongs to the extension surface and the law to loop law; a new partition for one op plus one law line would be capability sprawl. No open change claims these files.

## Non-Goals

- No guard or validator checks on backlog content: `cdd/backlog.md` appears in no Code: glob, no L-series check, no placeholder or staleness logic touches it.
- No `cdd/backlog/` directory, no per-item files, no backlog archive folders.
- No derived aggregation ops over tasks, reviews, or session transcripts.
- No initStore seeding of the file (born on first write), no ambient context block change, no `/cdd-backlog` command, no legacy op alias.
- No status-transition state machine beyond the refused shapes — re-resolving an item is a legal correction, last write wins.
- MAINTENANCE.md edits ride its existing outside-spec-ownership note; it appears in no Code: glob by design.

Done-When: The `cdd backlog` op adds, lists, and resolves items in `cdd/backlog.md`, refusing unknown actions and options, unknown ids, resolve-to-open, seeded-into-change without a change name, and off-grammar files
Done-When: `cdd/backlog.md` in the live store holds the 8 triaged seed findings — items PF-1 through PF-7 plus the steer-believed-on-disk conventions line in the file header — with every item line matching the grammar
Done-When: The loop law names `cdd/backlog.md` as the process-finding destination and requires PF-n citations in reports, in both `lib/templates.mjs` and the `cdd/rules.md` mirror
Done-When: `lib/backlog.mjs` refuses silent direct execution
Done-When: Validate strict and the drift guard stay green whatever prose the backlog holds
Code: index.ts, lib/backlog.mjs, lib/templates.mjs, lib/help.mjs, cdd/rules.md, tests/tools.mjs, tests/smoke.mjs, tests/acceptance/backlog-op.test.js, tests/acceptance/library-usage.test.js

## Seeds

The 8 triaged findings from the 2026-10-22 runs, carried into `cdd/backlog.md` at landing (statuses per the director's triage):

1. open — proposal scaffold comments phantom-count as a 6th Done-When and their scaffold phrases trip the placeholder check; the behavior fix needs its own loop pass — source: `20261022-loop-law-hardening` (M2 validate lesson).
2. open, tiny — a doc line stating that changing the scaffold legitimately requires editing S-series smoke pins — source: `20261022-wire-review-points` (finding 9).
3. open (evaluate) — bootstrap-deliverable ordering: the loop has no recorded notion of deliverables authored before the delta; generalize into law only if the pattern recurs — source: `20261022-loop-law-hardening` (R2-F004).
4. open (evaluate) — design-ticks-at-draft-green ambiguity; law/scaffold line only if it recurs — source: `20261022-loop-law-hardening` (R2-F005).
5. record-only, won't-do candidate — anchor-drift aborted edit batches (agent tooling friction, hit by both recent runners) — source: director session 2026-10-22.
6. watch — the gherkin living spec at 26 requirements vs extension 4 / acceptance 2; navigation concern ripening — source: director session 2026-10-22.
7. record-only — free-rung 429s at spawn (deployment policy, not law) — source: director session 2026-10-22.
8. conventions line in the file header, not an item — a steer is believed only when an on-disk artifact backs it — source: `20261022-loop-law-hardening` (M3 phantom review-complete steer).
