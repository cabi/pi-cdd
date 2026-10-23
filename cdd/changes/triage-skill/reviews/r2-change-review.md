# R2 package review — triage-skill

**Reviewer form:** cold sub-agent (fresh session, briefed only from paths on disk).
**Reviewer model family:** opencode-zen (deepseek-v4-pro) — verified from runtime
`PI_PROVIDER=opencode-zen`, `PI_MODEL=deepseek-v4-pro`.
**Author model family:** zai (glm-5.3) per the brief. Families differ — rule 2b satisfied.
**Working-tree form:** branch `triage-skill`, base `main` @ ae44199 (HEAD == ae44199),
change uncommitted; `cdd/changes/triage-skill/` is untracked. No `design.md` — the
design gate answered T1–T5 all NO (skip record in tasks §2), consistent with rule 2c.

## Findings

### [should] R2-F001 — Done-When 3 (dogfood) has no delta requirement

- **Location:** `cdd/changes/triage-skill/proposal.md` (Done-When 3, "Close section records the skill exercised live…"); delta `cdd/changes/triage-skill/specs/gherkin/spec.md` (single ADDED requirement).
- **Provenance:** reviewer 01a16a72; source: proposal.md, specs/gherkin/spec.md, tasks.md.
- **Evidence status:** Trace-backed.
- **Preconditions:** none — the gap is structural.
- **Trace:** The delta carries exactly 1 ADDED requirement ("The backlog triage skill is bundled") whose two scenarios cover (a) the skill being a loadable pi skill and (b) the skill carrying the rubric. Neither scenario, nor any requirement prose, covers exercising the skill live — minting a PF-n through the rubric and recording it in the Close section. Done-When 3 ("this change's tasks.md Close section records the skill exercised live — at least 1 triage decision from this run made through the rubric and minted through the backlog op") is therefore a completion criterion with a task (3.4) but no sponsoring delta requirement.
- **Expected:** every Done-When line maps to ≥1 delta requirement (charter item 1).
- **Actual:** Done-When 3 maps to task 3.4 only; no delta requirement sponsors it.
- **Impact:** The dogfood criterion is unsponsored by the spec — the delta cannot be held to it at archive, and the requirement→task chain is one-sided for this criterion.
- **Smallest safe fix:** either add a scenario to the ADDED requirement pinning the live exercise (e.g. "the skill's rubric is exercised to mint one PF-n through the backlog op"), or explicitly mark Done-When 3 as a process criterion outside the spec chain in the proposal.

### [note] R2-F002 — Done-When 2 (validate/guard) is a universal gate with no delta requirement

- **Location:** `cdd/changes/triage-skill/proposal.md` (Done-When 2).
- **Provenance:** reviewer 01a16a72; source: proposal.md, tasks.md.
- **Evidence status:** Trace-backed.
- **Trace:** Done-When 2 ("cdd validate strict is green and node cdd/scripts/spec-drift.mjs exits 0 over the repository with the change open") maps to task 4.4 in the traceability table but to no delta requirement. It is the loop's own gate, not a product requirement.
- **Expected/Actual:** strictly, a Done-When with no delta requirement (charter item 1); in practice this is the universal invariant every change carries.
- **Impact:** low — standard and expected; noted for completeness.
- **Smallest safe fix:** none required; optionally acknowledge in the proposal that this criterion is the loop gate, not a spec requirement.

### [note] R2-F003 — Done-When 1's anchor list omits the "evaluate-on-recurrence not-a-status" anchor

- **Location:** `cdd/changes/triage-skill/proposal.md` (Done-When 1) vs `cdd/changes/triage-skill/specs/gherkin/spec.md` (scenario "The triage skill carries the rubric") and `cdd/changes/triage-skill/tasks.md` (task 3.2).
- **Provenance:** reviewer 01a16a72; source: proposal.md, specs/gherkin/spec.md, tasks.md.
- **Evidence status:** Trace-backed.
- **Trace:** The delta scenario 2 requires the skill to "mark the note-level evaluate-on-recurrence pattern as not a grammar status", and task 3.2 lists "the evaluate-on-recurrence pattern marked not a grammar status" among S37's rubric anchors. Done-When 1's anchor enumeration ("the 5 grammar statuses, the item grammar line, both inviolable conventions, the change-worthy rule, backlog-op-only writes with the note-edit exception, and the rule 13 citation") omits that anchor.
- **Expected:** the Done-When criterion names every anchor S37 must check, so the completion check is complete.
- **Actual:** the not-a-status anchor is required by the delta and the task but absent from the Done-When criterion.
- **Impact:** low — the criterion is slightly less complete than the delta; S37 will still check the anchor per task 3.2.
- **Smallest safe fix:** add "the evaluate-on-recurrence pattern marked not a grammar status" to Done-When 1's anchor list.

### [note] R2-F004 — freehand note-edit exception sits beside rule 13's "written through the backlog op"

- **Location:** `cdd/changes/triage-skill/proposal.md` ("minting/resolving only through the cdd backlog op with the one documented freehand exception (direct note edits that extend framing, grammar intact)"); `cdd/rules.md` rule 13 ("written through the cdd backlog op (list, add, resolve)").
- **Provenance:** reviewer 01a16a72; source: proposal.md, cdd/rules.md, lib/backlog.mjs.
- **Evidence status:** Trace-backed.
- **Trace:** Rule 13 states process findings are "written through the cdd backlog op (list, add, resolve)". The proposal teaches a freehand exception — direct note edits that extend framing, grammar intact — which is a third path (editing an existing item's note segment) not named by rule 13. The skill cites rule 13 without restating it, so the exception must be framed as neither minting nor resolving to avoid reading as a contradiction.
- **Expected:** the skill's note-edit exception is clearly scoped as an edit to an existing item's note field, not a mint or resolve, so it does not conflict with rule 13.
- **Actual:** the proposal's wording ("backlog-op-only writes with the note-edit exception") is terse and could read as a carve-out from rule 13's op-only path.
- **Impact:** low — a reader could see tension between the skill and rule 13; the skill's framing will resolve it.
- **Smallest safe fix:** when authoring the skill, state explicitly that the freehand exception covers only note-field edits on existing items (neither minting nor resolving), which rule 13's op list does not address.

## Coverage and verification

- Inspected: `cdd/changes/triage-skill/proposal.md`, `tasks.md`, `specs/gherkin/spec.md`; living specs `cdd/specs/gherkin/spec.md` (owning requirements "Reviews run cold" :448, "Reviewer briefs live next to their skills" :790, "Process findings land in the backlog" :881) and `cdd/specs/extension/spec.md` ("The backlog op triages findings on disk" :102); `cdd/rules.md`; `tests/smoke.mjs` (S33/S36 patterns, `npm test` runs smoke); `lib/backlog.mjs` (STATUSES = open|watch|done|won't-do|seeded-into-change); `cdd/backlog.md` (PF-3/PF-4 evaluate-on-recurrence, PF-14/16/18/19/20 examples).
- Verified: the 5 grammar statuses match `lib/backlog.mjs` STATUSES exactly; the item grammar line matches the backlog grammar; the delta is ADDED-only (no MODIFIED/REMOVED, so no restatement/Reason obligations); the ADDED requirement does not duplicate a living requirement; the design-gate skip record names all five T1–T5 answers, the chosen shape, and C4 level N/A; scenario pins `# Verified by: tests/smoke.mjs` are runnable (`npm test` runs `node tests/smoke.mjs`) and consistent with existing smoke-pinned living scenarios; task verify-bys (3.2 red-first, 3.3 green, 3.4 backlog-op listing, 4.4 validate+guard) name real, runnable commands.
- No design.md present (consistent with the all-NO gate record); no implementation exists yet.

## Dispositions (author, after review)

- R2-F001 fixed: Done-When 3 now marks itself a process criterion of this change's execution, deliberately outside the spec chain — the durable skill contract is pinned by the delta's two scenarios (the reviewer's option b).
- R2-F002 fixed: Done-When 2 now names itself the loop's universal gate mapping to task 4.4 only.
- R2-F003 fixed: Done-When 1's anchor list now includes "the evaluate-on-recurrence pattern marked not a grammar status".
- R2-F004 fixed: task 3.3 now frames the freehand exception as note-field edits on existing items only — neither minting nor resolving, the two paths rule 13's op list names — so the skill reads as no contradiction of rule 13.
