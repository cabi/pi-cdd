<!--
PROPOSAL — how to fill this file (the decision document, not a design document)

Sections (all required):

Why: 1-2 sentences on the user-visible problem or opportunity. State the
problem, not a solution. If you cannot name who hurts and how, the change
is not ready.

What Changes: bullet list of behavior changes. Be specific about new
capabilities, modifications, removals. Mark breaking changes with BREAKING.

Solutions Considered (reuse-first): for EVERY capability below, name the
existing solutions you evaluated before deciding to build: libraries,
platform/framework features, tools already in the dependency tree, and
existing specs under cdd/specs/. Record for each: what it covers, and why
you adopt it or reject it. "None found" is only acceptable if you name what
you searched. Do not specify new behavior in an area where a maintained
solution already fits — adopt it and note the trade-off instead.

Non-Goals: what this change explicitly will NOT do. This is the scope fence
against feature creep: every tempting adjacent feature goes here, not into
the spec. At least one entry is required; if the scope is truly minimal,
name the closest feature you are rejecting.

Done-When: 1-5 completion criteria, each on its own "Done-When:" line,
each phrased as an observable check (a command that exits 0, an artifact
that exists, a behavior a user can observe), never as an activity
("implement", "add"). tasks.md must trace back to every one of them.

Capabilities: which specs are created or modified. Before filling this in,
read cdd/specs/ for the capability inventory and cdd/changes/ for work
already in flight: if an open change already claims this behavior or these
files, extend that change instead of opening a twin — parallel changes on
one capability collide at archive. Genuinely sequential follow-ups open as
their own change and record "Depends on: <change>" here.

R1 review: after this proposal, if the design gate (tasks §2)
answered T1 or T2 YES, run skill cdd-spec-review in proposal mode on it — findings
at reviews/r1-proposal-review.md, every blocker disposed before drafting the delta. Reviews are advisory findings, never verdicts: they never gate
on their own. Reviews run cold (rule 2b): the reviewer is not the author of the artifacts under review — spawn the R1 reviewer as a fresh cold sub-agent session, briefed from paths on disk, never curated content.

Keep the whole document under one page. If a section does not change a
decision someone makes, delete it.
-->

# 20261024-metrics-stamp

## Why

Per-change economics are untestable in repo units: PF-33 records 35 archives of derivable evidence nobody captures, and the self-report gap class (PF-14, PF-26, plus the phase-0 director catch) has produced unverifiable cost claims three times — the archive door must derive the numbers mechanically at Close or they exist nowhere.

The touched code is governed by three decisions, followed not superseded: ADR-0003 (the store stays plain markdown — `metrics.md` is one more ordinary file in the archive folder), ADR-0007 (one grammar module — every delta/task count imports the shared model from `scripts/grammar-law.mjs`, nothing restated door-side), and ADR-0012 (comments stay shape-of-code — the new module's comments describe its contract, no corpus pointers).

## What Changes

- `cdd archive` stamps a derived `metrics.md` into the archive folder — lib/metrics.mjs (pure derivation) called by archiveChange between the Close auto-tick and the rename; never hand-edited, never gates the archive.
- Spec-strength block: done-whens, non-goals, delta requirements (added/modified/removed), delta scenarios, subtasks — delta and task counts import the single parse from canonical scripts/grammar-law.mjs; severity/disposition vocabulary imports FINDINGS_GRAMMAR from lib/loop-law.mjs.
- Review-yield block: findings per review file (filename-classified r1/r2/r3-standards/r3-spec/adr) by severity and disposition; a format-version line records parse assumptions; declared `## Counts` / `**Counts:**` lines cross-check against parsed severity rows at stamp time, mismatches stamped as mismatch lines — never silently trusted.
- Convergence as-of-stamp: commits-before-archive, elapsed-so-far (only with ≥2 commits), commit-visible re-ticks (complete at stamp time — the archive commit only ticks); beyond-2-norm omitted-with-reason; honest-gaps block names what stamp time cannot see (feature→archive gap, agent-only time, session-token cost).
- Failure semantics: a field whose derivation fails is stamped `not-derivable: <reason>`; a non-git store stamps git fields not-derivable; a total stamp failure leaves the archive succeeding, its result carrying the stamp outcome.

## Solutions Considered

- gherkin (delta/task counting): scripts/grammar-law.mjs parseSpecModel + splitTaskSections/TASK_ITEM — the single-parse law's model ("The spec model is the single parse"), already imported by lib/store.mjs:16; adopted, no private parse. The /tmp/pf33 phase-0 scratch scripts are reference only (off-repo, transient); the research doc's Method section is the derivation spec of record — the shipped derivation is fresh code with its own pins.
- gherkin (findings vocabulary): lib/loop-law.mjs FINDINGS_GRAMMAR (severities/dispositions, exported) — adopted for the stamp's severity/disposition vocabulary; no in-repo findings-row parser exists (grep over lib/*.mjs and scripts/*.mjs finds definitions only) → fresh filename-classified parse with format-version line and declared-counts cross-check.
- gherkin (module placement): the lib/backlog.mjs / lib/adr-ops.mjs module-split pattern — adopted for lib/metrics.mjs; inline-in-store.mjs rejected (design.md Alternatives).

## Non-Goals

- Retro-stamping the 35 existing archives (ledger: phase 1 stamps at Close only).
- Any living-spec metrics ledger or status-op reporting — the stamp is per-archive history, derive-don't-ask.
- Session-token cost join — phase 2, held by PF-33.
- Traceability-rows column — phase 0: rows track Done-When count and "add little independent signal beyond DW" (research doc caveat 7).
- Final draft-validate verdict — the ledger's "phase 1 may preserve the final draft verdict" is declined by name: at Close, strict green implies draft green (draft checks are a strict subset of strict), so the field would be tautologically PASS (director ruling a; adjudicated, not ignored).
- Changes to how reviews are authored — the stamp derives from reviews as-authored (the 7 observed layouts are the input contract); reshaping authoring to ease parsing would invert derive-don't-ask and disturb every in-flight change's review flow (PF-33 scope).
- Backlog op changes — PF-33 phase 1 names the archive op only; the backlog op is process bookkeeping with no stamp input, so touching it buys nothing for this change.
- The archive op's registry description in lib/ops.mjs (the registry pins names/order, not prose behavior docs).
- Sub-commit re-tick cycles and agent-only calendar time — structurally underivable; stamped in honest-gaps, never estimated.

## Capabilities

- gherkin: specs/gherkin/spec.md, ADDED requirements (store-ops precedent: "A new change reports the store verdict at start" claims lib/store.mjs)

Done-When: cdd archive on a strict-green change writes cdd/archive/<date>-<name>/metrics.md whose every field is mechanically derived — a failing derivation is stamped "not-derivable: <reason>", never estimated — verify tests/acceptance/archive-metrics-stamp.test.js
Done-When: the stamp's spec-strength counts equal mechanical grep-truth on the archived artifacts, and its delta counts import the single parse from canonical scripts/grammar-law.mjs — verify tests/acceptance/archive-metrics-stamp.test.js
Done-When: a findings file whose declared Counts line contradicts its parseable severity rows yields a stamped mismatch line naming declared vs parsed — never silent trust — verify tests/acceptance/archive-metrics-stamp.test.js
Done-When: git-derived fields carry as-of-stamp labels (commits-before-archive; elapsed-so-far only with 2 or more commits; re-ticks complete at stamp), beyond-2-norm omitted-with-reason, and the feature→archive gap sits in honest-gaps — verify tests/acceptance/archive-metrics-stamp.test.js
Done-When: a stamp failure never blocks archive — a non-git store archives with git fields not-derivable and archiveChange's result carries the stamp outcome — verify tests/acceptance/archive-metrics-stamp.test.js
Code: lib/store.mjs, lib/metrics.mjs, tests/acceptance/archive-metrics-stamp.test.js
