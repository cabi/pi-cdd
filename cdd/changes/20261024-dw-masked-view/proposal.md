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

# 20261024-dw-masked-view

## Why

Two store surfaces disagree on one question: `validateProposal` counts Done-Whens over a comment-masked view (the 20261024-scaffold-honesty law), but `deriveStamp` greps the raw proposal text — so the stamp's done-whens column counts the scaffold instruction comment's own "Done-When:" line and mints a wrong number at every Close where that comment survives (the one archived stamp says 6 where the validator counts 5 — PF-37).

## What Changes

- lib/validate.mjs exports `maskHtmlComments` (one additive export; `validateProposal` and the mask body are untouched).
- lib/metrics.mjs derives the done-whens count from the same masked view the validator uses — `maskHtmlComments` imported from lib/validate.mjs plus the validator's exact line pattern (`/^Done-When:\s*\S/gm`); the masking logic stays single-source, no copy in metrics.mjs.
- The gherkin living requirement "cdd archive stamps a derived metrics file" is MODIFIED: its "Stamped counts equal direct counts over the artifacts" scenario currently encodes the raw-count law this defect rode on and now pins the masked view; one added scenario pins the scaffold-comment case (6 raw matches, 5 counted).
- tests/acceptance/archive-metrics-stamp.test.js gains a scaffold-comment fixture and two pins: stamp count equals the validator's masked count, and metrics.mjs holds no comment-masking regex of its own.
- The already-archived stamp keeps its minted done-whens: 6 (as-of-stamp honesty — gate design note, tasks §2 item 3).

## Solutions Considered

- gherkin: existing `maskHtmlComments` in lib/validate.mjs — adopted: it is the exact masked view the scaffold-honesty law already put in front of the validator's count; exporting and importing it adds no new logic and fixes the disagreement at its source (rejected: duplicating the regex in metrics.mjs — the single-source violation this change exists to remove; rejected: relocating the mask to canonical scripts/grammar-law.mjs — a cross-module move that widens the diff without changing behavior; rejected: an exported count-done-whens helper in validate.mjs — either it touches validateProposal (out of scope) or duplicates the count expression inside validate.mjs).
- gherkin: existing single-parse seam (`parseSpecModel` from canonical scripts/grammar-law.mjs) — adopted unchanged for the delta columns; the done-whens column joins it as the second validator-aligned count.

## Non-Goals

- Correcting or retro-stamping past archives — the minted done-whens: 6 in cdd/archive/20261024-20261024-metrics-stamp/metrics.md stays as minted (director ruling; a correction would need a re-derive-on-read rule, new behavior).
- Any change to `validateProposal` itself or to the mask's behavior.
- PF-36 (fresh-node instrument law), PF-38 and later, backlog renumbering, phase-2 session joins.

## Capabilities

- gherkin: cdd/specs/gherkin/spec.md — MODIFIED requirement "cdd archive stamps a derived metrics file"

The touched code is governed by four decisions, followed not superseded: ADR-0003 (plain-markdown-store — the stamp keeps deriving from plain files on disk, no new format or parser), ADR-0006 (feature-block-consolidation — lib/validate.mjs gains one export keyword and no new feature blocks; the count expression moves to its single consumer), ADR-0007 (law-behind-every-door — the masked-view agreement rides the spec delta and acceptance pins, not source prose), and ADR-0012 (comments-are-shape-only — the new comments state contracts and callers only, no corpus pointers).

Done-When: a strictly valid change whose proposal holds 4 real Done-When lines plus the scaffold instruction comment (5 raw matches) stamps done-whens 4, equal to validateProposal's masked count on the same text — verify tests/acceptance/archive-metrics-stamp.test.js
Done-When: lib/metrics.mjs counts Done-Whens through maskHtmlComments imported from lib/validate.mjs and contains no comment-masking regex of its own — verify tests/acceptance/archive-metrics-stamp.test.js
Done-When: every pre-existing stamp pin (comment-free fixtures) still passes — npm test exits 0 — verify tests/acceptance/archive-metrics-stamp.test.js
Done-When: this change's own Close stamp prints the masked count where raw grep counts one more (self-application) — verify cdd/archive/<date>-20261024-dw-masked-view/metrics.md at Close
Code: lib/metrics.mjs, lib/validate.mjs, tests/acceptance/archive-metrics-stamp.test.js
