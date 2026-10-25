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
on their own. Reviews run cold (rule 2b): the reviewer is not the author
of the artifacts under review — spawn the R1 reviewer as a fresh cold sub-agent session, briefed from paths on disk, never curated content.

Keep the whole document under one page. If a section does not change a
decision someone makes, delete it.
-->

# 20261025-archive-stamp-name

## Why

Change names may carry a leading date segment (director-era mission convention), and the archive op prepends its own stamp to the full name — so the archived folder doubles the date (`cdd/archive/20261024-20261024-dw-masked-view/`, 5 instances, PF-39 at cdd/backlog.md) — and the worse half is functional: once the folder stores the stripped form, post-archive `reconfirm --change` cannot resolve a dated query, because the folder cannot say whether the original name was dated.

## What Changes

- lib/store.mjs exports `archivedBasename(name)` — strip at most one leading `^\d{8}-` date segment — and both compose points consume it: the rename target (line 294) and the reported `archivedTo` path (line 297). A change name carrying one leading date segment with a date-free slug after it archives with exactly one date prefix; the reported path always equals the real folder. Names whose slug itself starts with a date segment keep the strip-one law — the folder mirrors the name after one strip (no name-validation law exists).
- lib/adr-ops.mjs normalizes `reconfirm --change` queries with the same helper at both matching sites (lines 251, 308): verbatim match first, then the query stripped of at most one leading date segment — a dated query resolves to the recovered bare archived name post-archive.
- Recovery stays as-is: `listArchived`'s split (first 8 chars = date) is already correct for single-date folders; lib/status.mjs recomposition unchanged.
- The delta is TWO capability files (director M1 ruling on the R1 blocker — law-unity lives in the seam, not in spec topology): gherkin ADDED "Archive folders carry the stamp date once" (compose law, reported-path/metrics-stamp locatability, convention note — change names MAY carry a date prefix, the archive stamp is the authoritative archive date), and adr MODIFIED "The reconfirm op records decision reconfirmation" (restated complete plus a dated-query resolution scenario; unknown-name refusal holds under normalized matching).
- tests/smoke.mjs S-series re-pin: the existing S10 fixture keeps pinning the bare-name law; a dated-name round-trip pins the strip law (single-date folder, archivedTo agreement). New acceptance pin tests/acceptance/archive-folder-name.test.js.
- Adoption (director-ordered at M0, outside this change's tasks and Done-Whens): after this change's own archive, the 5 doubled folders git-mv to single-date form in their own Mechanical-Change commit, then PF-39 resolves with its premise re-pointed; this change's own Close is the first single-dated archive (self-application).

## Solutions Considered

- gherkin: existing `listArchived` split in lib/store.mjs (first 8 chars = date, rest = name) — adopted unchanged: correct for single-date folders, already feeds the status table and knownChanges; re-pointing recovery at a second format would widen the diff for nothing.
- gherkin: five fix shapes weighed at the director's M0 and recorded in design.md Alternatives — compose-only strip (rejected: trades the cosmetic defect for a functional one), strip-at-name (rejected: the name is identity), drop-the-stamp (rejected: loses chronology), stop-date-prefixing (rejected: fixes nothing existing), name-validation law (rejected: bare names must archive lawfully) — this change adopts compose-strip plus query normalization as one law.
- gherkin: existing reconfirm matching sites lib/adr-ops.mjs:251/:308 — adopted as the two normalization consumers; no new index, the single claim map (ADR-0013) is untouched.
- None found for a pre-existing name-date strip helper: searched the lib/*.mjs exports and every `slice(9)` date-segment handling site (grep over lib/ and scripts/) — no module strips a date from a change name today; `archivedBasename` is new and single-sourced.

## Non-Goals

- Disambiguating two same-bare change names from different days in knownChanges matching — the law's known limit, deferred by the M0 ruling: no uniqueness law backs the archive (nothing enforces it), but no same-bare pair exists among the 38 archived folders today — the collision is unobserved, not impossible.
- Guaranteeing exactly-one-date folder names when the change name's own slug starts with a date segment (a second `yyyymmdd-` after the first) — strip-at-most-one is the M0-ruled law, such a name's folder mirrors it after one strip, and no name-validation law exists (R2 finding, disposed by narrowing the guarantee).
- Retro-rename of the 5 doubled folders as spec behavior — it is an adoption step (own commit, Mechanical-Change trailer, after this change's archive), not contract law.
- Any change-name validation or rejection law — bare and dated names both stay lawful.
- Rewriting backlog history — PF-33's done-note stays frozen; PF-6's 52-requirement premise going stale (53 after this change) is the known Tier A size signal, budget unchanged per the director's M0.

## Capabilities

- gherkin: cdd/specs/gherkin/spec.md — ADDED requirement "Archive folders carry the stamp date once"
- adr: cdd/specs/adr/spec.md — MODIFIED requirement "The reconfirm op records decision reconfirmation" (restated complete + dated-query scenarios)

The touched code is governed by accepted decisions, followed not superseded: ADR-0003 (plain-markdown store — folder names stay plain path composition), ADR-0007 (one grammar module — archivedBasename is a store-lib helper beside the compose it serves, no new grammar surface), ADR-0012 (comments are shape-of-code only), ADR-0013 (one claim map — reconfirm matching still reads the single claim map; normalization adds no second index). Fresh reconfirmations ride the archive commit at Close.

Done-When: archiving a change whose name carries exactly 1 leading date segment with a date-free slug yields an archive folder with exactly one date prefix and an archivedTo equal to that folder — verify tests/acceptance/archive-folder-name.test.js
Done-When: archiving a bare-named change appends the name verbatim — the existing S10 law holds — verify npm test (tests/smoke.mjs S10)
Done-When: after archive, reconfirm --change passed the dated change name resolves and records the reconfirmation — verify tests/acceptance/adr-reconfirm.test.js
Done-When: this change's own Close archive folder carries exactly one date (self-application) — verify cdd/archive/20261025-archive-stamp-name/ exists at Close
Code: lib/store.mjs, lib/adr-ops.mjs, tests/smoke.mjs, tests/acceptance/archive-folder-name.test.js, tests/acceptance/adr-reconfirm.test.js
