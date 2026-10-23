# backlog-revalidate

## Why

The backlog is a growing log and nothing detects an open item whose premise rotted — fixed under another change, its anchor deleted, overtaken by drift. It bit twice: a sweep dispatched on a false premise and a mission started stale before its gate; in both cases the ledger still read "open" while the fixing artifacts already existed. Revalidation is currently director habit; it needs to be law, and the tool needs to do the mechanical half.

## What Changes

- Item grammar gains two optional segments after `note:` — `premise: <micro-form>` and `verified: <iso-dates>` — parsed, validated, and rendered by lib/backlog.mjs. The premise micro-form is a closed grammar the tool evaluates itself, in-process, with zero shell and zero regex: `exists:<path>`, `absent:<path>`, `grep:<literal>@<path>=<n>` (n = exact count of lines containing the literal as a plain substring). No metacharacters exist to escape and no data file ever becomes an exec vector.
- New backlog action `revalidate`: evaluates every premise-bearing active item (open, watch, seeded-into-change), reports hold / ROTTED / NOT-MECHANICAL / ANCHOR-GONE per item, stamps the append-only `verified` date history (same-day idempotent), and flags a third distinct verified date as force-a-disposition. It never edits dispositions — stale ≠ done.
- `list` annotates staleness for active items: never-verified or verified YYYY-MM-DD with age in days, plus vanished grep anchors.
- Rule 13's action parenthetical becomes non-enumerative ("its actions are listed by the tool's help"), mirrored in both single sources; the op's refusal and silent-exec messages derive from one exported ACTIONS table.
- The triage skill gains three laws: revalidation-before-dispatch (premise false → closed done with evidence; premise moved → rewritten), three-strikes anti-rot (watch items included), and stale-never-auto-closes; premise backfills on existing items join the note-edit as freehand line-edit exceptions.
- Dogfood: mechanically-checkable open items get premises; `revalidate` runs on the live ledger and its output lands in the change folder — PF-10/PF-11 are expected ROTTEN (their fixing archives exist) and resolve done with evidence.

## Solutions Considered

- triage skill: the existing cdd-backlog-triage skill (covers the full rubric; adopted — the revalidation laws extend it where triage decisions live) over a new skill (rejected: one rubric, one home).
- premise checking: shelling out to test/grep from the item text (rejected — exec safety: data files must never become exec vectors), reusing the guard's glob compiler (rejected — its escaping class is exactly the disease to avoid, and a premise needs literal substring + exact count, not path matching); adopted: the closed three-form micro-grammar evaluated with fs + string scanning, impossible to escape by construction.
- staleness detection: file mtimes (rejected — checkout churn rewrites them, the date lies), git log archaeology (rejected — needs a repo and parses history per item); adopted: explicit verified-date history in the ledger line, diffable and derivable into strikes.
- grammar extension: a sidecar premise file (rejected — rule 13 names one ledger file; two files to keep in sync), new top-level fields (rejected — the flat line grammar is the ledger's whole contract); adopted: two optional segments inside the existing EXPECT chain.
- action enumeration: extending the rule-13 list to four actions (rejected — a hand-maintained index that drifts on the next action); adopted: non-enumerative law text plus messages derived from the ACTIONS table.

## Decisions Followed

The change touches code governed by eight standing decisions and follows each:

- ADR-0002 — the harness is the counterparty: revalidate reports into the tool result, no ambient side channels.
- ADR-0006 — feature-block consolidation: no new op or capability; the behavior joins the existing backlog op and its two owning requirements.
- ADR-0007 — the law behind every door: every new refusal and verdict this change adds is scenario-pinned and test-first.
- ADR-0008 — model-run reviews are advisory findings: revalidate reports verdicts, never dispositions; R2/R3 stay advisory.
- ADR-0009 — single-source the loop law: rule 13 is edited once in lib/templates.mjs and mirrored byte-for-byte into cdd/rules.md; the action list derives from one ACTIONS table.
- ADR-0010 — reviewer independence is loop law: reviews stay cold sessions; nothing here self-certifies.
- ADR-0011 — ticks are claims and pins hit real doors: every task tick cites a runnable command; the revalidate dogfood runs the real door on the live ledger.
- ADR-0012 — comments are shape-of-code documentation only: all comments this change adds to lib/, index.ts, and tests/ describe shape, not corpus.

## Non-Goals

- No premise autodiscovery or suggestion — the triager writes premises; items without one are honestly NOT-MECHANICAL.
- No auto-close, staleness expiry, or threshold judgment anywhere — revalidate reports and stamps; dispositions stay a triage call.
- No regex, glob, shell, or time-based premise forms, ever.
- No gating change: validate and the guard still never check cdd/backlog.md (rule 13's invariant is untouched).
- No new capability directory: backlog behavior stays owned by the existing extension and gherkin requirements.

## Capabilities

- gherkin: MODIFIED "Process findings land in the backlog" (non-enumerative rule 13), MODIFIED "The backlog triage skill is bundled" (three revalidation laws + premise backfill as a second freehand line-edit exception) — cdd/specs/gherkin/spec.md
- extension: MODIFIED "The backlog op triages findings on disk" (premise/verified grammar, revalidate, list staleness) — cdd/specs/extension/spec.md
- The live ledger edits (premise backfills, PF-12 note, header conventions line) and the PF-10/PF-11 dispositions are data edits riding this change's sponsorship, not spec.

Done-When: node tests/acceptance/backlog-revalidate.test.js exits 0
Done-When: node tests/acceptance/backlog-op.test.js and node tests/smoke.mjs exit 0 after the rule-13 non-enumerative edit, the grammar extension, and the three new skill laws
Done-When: cdd backlog revalidate over the live ledger reports PF-10 and PF-11 ROTTEN, its full output saved in the change folder, and both items resolve done with archive evidence
Done-When: cdd validate strict green and the drift guard green
Code: lib/backlog.mjs, index.ts, lib/templates.mjs, cdd/rules.md, skills/cdd-backlog-triage/SKILL.md, cdd/backlog.md, tests/smoke.mjs, tests/tools.mjs, tests/acceptance/backlog-op.test.js, tests/acceptance/backlog-revalidate.test.js
