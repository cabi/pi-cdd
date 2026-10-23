# triage-skill

## Why

Backlog triage — when a run's friction deserves a PF-n line, what status it takes, and when it graduates into a change — lives only in the maintainer's head and a volatile policy draft (`/tmp/backlog-conventions.md`, distilled from the live ledger on 2026-10-23 and still on disk at propose time). Every runner and director re-derives it from tribal memory of the PF-1..PF-20 ledger, so triage calls drift between runs and the conventions stay unenforced prose.

## What Changes

- `skills/cdd-backlog-triage/SKILL.md` — a fourth bundled skill carrying the triage rubric: when to record at all (systemic or repeated friction, never one-off stumbles); the status taxonomy — the 5 grammar statuses of the backlog op (open, watch, done, won't-do, seeded-into-change) with one-line definitions plus ledger examples, and the note-level "evaluate on recurrence" pattern (PF-3/PF-4) taught explicitly as NOT a grammar status; the item grammar line; the two inviolable conventions (a steer is believed only when an on-disk artifact backs it; milestone and Close reports cite PF-n ids, never prose); the change-worthy rule (two independent recurrences, or one occurrence with a known structural fix, vs record-only); minting/resolving only through the `cdd` backlog op with the one documented freehand exception (direct note edits that extend framing, grammar intact); findings-file hygiene (review briefs and findings live under the change folder — PF-9's /tmp lesson). The skill cites loop law rule 13 without restating it.
- Discovery rides the existing `pi.skills` registration (`"./skills"` in package.json) — no manifest change.
- `tests/smoke.mjs` gains S37, a new check following S33's structural pattern (frontmatter name matches directory, description within bounds, cdd-scoped routing) plus the rubric anchors above. S33 stays untouched — its contract is the three review skills and their findings grammar, which a triage skill does not carry.
- The gherkin living spec (owner of the skills/ + tests/smoke.mjs surface) gains exactly 1 ADDED requirement pinning the bundled triage skill's contract, its scenarios pinned to the smoke suite.

## Solutions Considered

- gherkin (capability): owns the bundled-skills surface — the Code lines of "Reviews run cold" and "Reviewer briefs live next to their skills" already claim `skills/*/SKILL.md` and `tests/smoke.mjs`; adopted — one ADDED requirement there instead of minting a new capability that would split skills ownership.
- The maintainer policy draft (`/tmp/backlog-conventions.md`): covers promotion, status semantics, evidence-naming, note amendments, triage cadence; adopted as the skill's source material — the skill is its durable home (a /tmp file is volatile, PF-9's lesson class).
- `lib/backlog.mjs` grammar + the `cdd` backlog op: the existing write path and grammar authority; the skill teaches both and changes neither.
- Extending S33 vs a new S37: S33's assertions are review-skill-specific (severity/disposition/blocker findings grammar); adopted S37 so each pin keeps a single-minded contract.
- README/docs page instead of a skill: rejected — skills are the surface pi discovers and routes by frontmatter; a docs page does not route and duplicates the skill's audience.

## Non-Goals

- No validator, guard, or grammar-law change: the backlog stays living triage data no door checks (rule 13) — the skill advises, it never enforces.
- No `cdd` backlog op change: no new statuses or actions; "evaluate on recurrence" stays a note convention, not a grammar status.
- No scheduled triage cadence machinery: the maintainer-reads-run-reports cadence is recorded as policy, not automated.
- No ADR: bundling a docs skill is reversible, unsurprising, and crosses no capability trade-off.
- PF-1 (scaffold comment traps) and PF-2 (doc line on S-series pins) stay out — adjacent scaffold questions, not triage knowledge.

## Capabilities

- gherkin: ADDED requirement "The backlog triage skill is bundled" in `cdd/changes/triage-skill/specs/gherkin/spec.md`, merging into `cdd/specs/gherkin/spec.md` at archive.

Done-When: node tests/smoke.mjs exits 0 with check S37 pinning the bundled triage skill as a loadable pi skill (frontmatter name matching the directory, bounded description) and its rubric anchors — the 5 grammar statuses, the evaluate-on-recurrence pattern marked not a grammar status, the item grammar line, both inviolable conventions, the change-worthy rule, backlog-op-only writes with the note-edit exception, and the rule 13 citation
Done-When: cdd validate strict is green and node cdd/scripts/spec-drift.mjs exits 0 over the repository with the change open — the loop's own universal gate, not a spec requirement; it maps to task 4.4 only
Done-When: this change's tasks.md Close section records the skill exercised live — at least 1 triage decision from this run made through the rubric and minted through the backlog op — a process criterion of this change's execution (like the review tasks), deliberately outside the spec chain: the durable skill contract is pinned by the delta's two scenarios
Code: skills/cdd-backlog-triage/SKILL.md, tests/smoke.mjs
