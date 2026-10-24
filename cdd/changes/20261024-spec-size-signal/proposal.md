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

# 20261024-spec-size-signal

## Why

The gherkin living spec accreted 26→48→50 requirements in three days with zero signal from `cdd validate` — no warning that the spec is over-grown, no split-consideration demand when a delta grows it further — while the task law has carried its 8/12 signal since inception (PF-32; premise verified: `grep -n "threshold" lib/validate.mjs` → 0 matches). The author growing an over-threshold spec has no navigation aid and no demanded growth decision; the corpus already shows the cost (gherkin at 50 requirements holding 173 scenarios, a 22-scenario requirement in extension, 15 and 10 in adr).

## What Changes

- **Tier A existence signal** (warning, never blocks, both verdict modes — warnings already ride `warnings[]` into every projected verdict): when a change carries a delta for a capability whose living spec holds ≥ 12 requirements, validate emits exactly 1 requirement-count warning; when that living spec holds requirements with ≥ 8 scenarios each, exactly 1 aggregated fat-requirement warning naming them — never one line per requirement (warning budget: 2 standing lines for a gherkin-touching change, 1 for adr, 1 for extension, 0 for acceptance, today).
- **Tier A authoring signal**: a delta's own ADDED/MODIFIED requirement block holding ≥ 8 scenarios warns naming that block — the growth surface caught at authoring time.
- **Tier B growth-act**: a delta with any ADDED entry into a capability whose living spec holds ≥ 12 requirements must carry a `split-considered:` line in the delta file, else 1 warning mirroring rule 6's split demand. Warning only — PF-32 reserves hardening (strict error, door enforcement) for recurrence.
- **Thresholds 12/8** mirror rule 6's TASK_LIMIT=12 / SPLIT_SIGNAL=8 pair, justified at the design gate against the empirical corpus (requirements: acceptance 2 / adr 3 / extension 7 / gherkin 50; scenario tail 22 / 15 / 11 / 11 / 10 / 9 / 8 vs mode 2); they live as named local constants in lib/validate.mjs — the grammar-law module stays reserved for laws doors enforce, and no door consumes these.
- New acceptance pin `tests/acceptance/spec-size-signal.test.js` importing the real `lib/validate.mjs`, observed RED before implementation (reviews/red-records.md, in-store from the start). No guard change, no door change, no rules.md edit.
- **Self-application**: this change's own delta ADDEDs into gherkin (50 ≥ 12) — Tier B fires on it and is satisfied by the delta's `split-considered:` line; the firing-before-satisfaction observation is recorded in red-records.md.

## Solutions Considered

- gherkin: `validateTasks`' two-tier SPLIT_SIGNAL/TASK_LIMIT shape at lib/validate.mjs:165-169 (adopted as the pattern — a warning at the signal threshold, escalation above the limit; this change maps both tiers onto the warning channel per PF-32's never-blocks law, with escalation reserved for recurrence).
- gherkin: `scripts/grammar-law.mjs` TASK_LIMIT/SPLIT_SIGNAL residence (rejected for the new constants: the guard is the module's door consumer — scripts/spec-drift.mjs:34 imports TASK_LIMIT — and spec-size has no door consumer; an entry there would force the byte-identical cdd/scripts copy sync with no reader behind any door. TASK_LIMIT's pair-mate SPLIT_SIGNAL rides its door consumer; the spec-size pair rides none).
- gherkin: per-capability delta scoping already in `validateDelta` — the strict-mode living-spec read per `cap` at lib/validate.mjs:132-135 (adopted and extended to both modes: the signal rides the change-time growth context; capabilities no open change touches stay silent, which is the intended scope — cross-capability split deltas remain lawful without validator amendment).
- gherkin: `parseLivingSpec` in lib/store.mjs:180-189 (adopted: it already returns per-requirement block lines, so scenario counting needs no new parser).
- Alternative threshold values (evaluated at the gate, rejected): scenario threshold at ≥ 12 fires only extension's 22 and adr's 15, blinding the signal to gherkin's 11/11/9/8 tail — the exact per-requirement split surface PF-32 names.

Governing decisions (cited per the guard's A1 gate):

- ADR-0006 (one Feature document per requirement; pins are `# Verified by:` comments inside the fence): the ADDED requirement's scenarios carry their pins as fence comments; no heading scenarios.
- ADR-0007 (the law behind every door): the signal is defined once in lib/validate.mjs — every verdict path (draft, strict, validateBoth) flows through the same validateDelta; no copied fragment, and the shared law module takes no advisory-only entries.
- ADR-0010 (reviewer independence is loop law): R2/R3 run as cold sub-agents on a non-author family, read from completion metadata.
- ADR-0011 (ticks are claims and pins hit real doors): the acceptance pin imports the real validator module; RED observed before implementation lands; red-records.md lives in the change folder from the start.
- ADR-0012 (comments are shape-only documentation): the new constants' doc comments state the threshold semantics and their rule-6 mirror — shape of the code, no spec markers.

## Non-Goals

- No PF-6 gherkin split — the signal points at it; the split itself happens only on size-attributable miss data, later.
- No hard-fail tier anywhere: no strict error, no guard/door 2 or 3 change, no rules.md text change — rule 6's task-side 8/12 law is untouched; hardening spec-size is PF-32's reserved on-recurrence escalation.
- No store-wide living-spec scan beyond capabilities a change's delta touches — the signal is a change-time navigation aid, not a health report.
- No PF-33 metrics capture, no PF-34 skill-doc half.

## Capabilities

- gherkin: cdd/specs/gherkin/spec.md (one requirement ADDED, delta carries `split-considered:`)

Done-When: a change whose delta touches a capability whose living spec holds ≥ 12 requirements receives exactly 1 requirement-count warning in BOTH draft and strict verdicts (fixture-pinned in tests/acceptance/spec-size-signal.test.js; live-fired on this change's own gherkin delta)
Done-When: a living spec holding requirements with ≥ 8 scenarios each receives exactly 1 aggregated warning naming those requirements — never one line per requirement — and specs with none stay silent
Done-When: a delta ADDED or MODIFIED requirement block holding ≥ 8 scenarios receives 1 warning naming that block
Done-When: an ADDED entry into a ≥ 12-requirement living spec without `split-considered:` in the delta receives 1 warning, and with the line receives none — observed live on this change's own delta (fires before the line, silent after), recorded in reviews/red-records.md
Done-When: warnings never affect `ok` in either mode (this change's own validate runs green with standing warnings present), and the 12/8 thresholds live as named constants in lib/validate.mjs with no entry in scripts/grammar-law.mjs or cdd/scripts/
Code: lib/validate.mjs, tests/acceptance/spec-size-signal.test.js
