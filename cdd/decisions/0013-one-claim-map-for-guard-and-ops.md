---
status: accepted
code: scripts/adr-index.mjs, scripts/spec-drift.mjs, lib/adr-ops.mjs, tests/acceptance/claim-map.test.js
---
# One claim map behind guard and ops

0007 ruled the grammar's home; this decision rules the home of the
claim derivation — which spec requirement's `Code:` globs claim which
file, across living specs and open deltas, and which accepted ADR
governs which file. It is stated exactly once: `buildClaimMap` in
`scripts/adr-index.mjs`, a pure function over the parsed spec models,
the ADR index, and the tracked file list. The drift guard's gather pass
builds the map once and every law reads `facts.claimMap`; `lib/adr-ops.mjs`
answers `adrs --code` (tracked and untracked paths alike, through the
map's per-path governing query) and `reconfirm --check` from the same
map. No consumer of the map holds a glob translation, a claiming
loop, or a restated `Code:`-line scan.

**Why.** The map was derived twice and the copies were free to drift:
the guard re-derived it at nine sites, the ops library at three more —
its own matcher, its own claiming loop, its own restated `Code:`-line
scan over open deltas. adr-index-agreement's AG3 pinned agreement
between two of those sites: a checksum over drift, not one law. A new
module was fence-dead — the guard is a door script, its imports travel
verbatim inside the store copy, and DOOR_SCRIPTS is five. Two more
homes were weighed and lost: `scripts/grammar-law.mjs`, because claim
semantics are not grammar and the builder would deepen the existing
grammar-law ↔ adr-index import cycle, and an I/O-walking builder,
which would re-read files the guard's gather-once law reads once.
`scripts/adr-index.mjs` already owned the glob translation and the
claims index both consumers read; the claim map is their completion.

**Shipping.** Zero-dependency Node (ADR-0001), travels with the door
scripts into adopting stores. Both surfaces are pinned byte-identical:
the guard's report (stdout, stderr, exit) is cmp-identical before and
after the re-point on a frozen-corpus worktree, with and without an
open delta; the ops' answers (table, `--code`, `reconfirm --check`)
are cmp-identical over the same store. `tests/acceptance/claim-map.test.js`
scans that the claiming loop appears exactly once — in adr-index.mjs —
and that neither consumer holds a glob translation or a restated
`Code:`-line scan.

**Consequences.** `spec-extract.mjs` still derives a union-only claim
set for its own burn-down (a set-level union over the parse, not the
per-requirement map); a future change may move it onto the map.
Landing this ADR grew the store to thirteen decisions, so the corpus
pins moved with it: the decisions-home inventory, the adrs table, and
the claims-index entry count now read thirteen. Amends nothing — 0007's
grammar home and the gherkin spec's claims-index law (matcher and
index stated once, in the requirement that pins this module) stand;
this decision adds
the derivation law they implied.

- Reconfirmed by claim-map on 2026-10-24: claim map derived once in scripts/adr-index.mjs (buildClaimMap); guard gather (spec-drift.mjs) and lib/adr-ops.mjs consume it, no consumer re-derives — pinned by claim-map.test.js CM1/CM2, byte-identity proofs in changes/claim-map tasks 3.6
- Reconfirmed by decision-scan-unify on 2026-10-24: scanDecisionFiles sits in the claim map's law home scripts/adr-index.mjs; the map itself and both its consumers are untouched, answers bit-identical
- Reconfirmed by 20261025-archive-stamp-name on 2026-10-25: reconfirm matching still reads the single claim map; the query normalization adds no second index
