# 20261111-guard-untracked-claims

## Why

A full scan over a working tree holding new, unstaged files reports a misleading clean: the guard builds its claim universe from `git ls-files` output alone, so untracked files are invisible to the ownership check (O), the ADR-citation check (A1), and the dead-glob check (L2). An adopting project hit this as their PF-3 — two capabilities' claims colliding on a brand-new file, or an open change claiming ADR-governed code that exists only in the working tree, both scan green until someone runs `git add`. The guard promises to police drift where the code actually is; today it polices only where the index says code is.

## What Changes

- The guard's gather pass builds a mode-bound claim universe: working-tree scans (door 3) resolve claims against index files plus non-ignored untracked files (`git ls-files --cached --others --exclude-standard`); staged scans (pre-commit, commit-msg) keep the index alone as their universe.
- The claim map — and through it O (single owner), the L2 dead-glob check, A1 (citation on touch), and A2's governed-file set — resolves against that universe.
- Staleness verdicts stay committed-history law: L2 topology and A2 compare commits, so an untracked file enters the claim and governed sets but can never out-commit a spec or a decision; the topology gather keeps reading the index alone.
- New acceptance pin `tests/acceptance/guard-file-universe.test.js` covers untracked conflicts, ignored-file exclusion, staged index-limits, unchanged index verdicts, and history-law immunity.
- `cdd/scripts/spec-drift.mjs` travels byte-identical.

## Solutions Considered

- gherkin: `git ls-files --cached --others --exclude-standard` (git platform feature, read) — the git-native working-tree enumeration, honoring `.gitignore` exactly as git does; adopted: one flag change in the gather seam, no new dependency (ADR-0001).
- gherkin: filesystem walk over the tree with manual `.gitignore` parsing — rejected: re-implements git's ignore semantics, a second source of truth that will drift.
- gherkin: `git status --porcelain` parsing — rejected: encodes status, not membership; the ls-files flags name the exact set.
- gherkin: the per-path governing query in `scripts/adr-index.mjs` (the `adrs` op already answers untracked paths on demand) — evaluated: it answers point queries, while the guard needs one gathered set-based universe per run (the gathers-once law); the list comes from the gather seam, not per-file queries.
- gherkin: widening `lib/adr-ops.mjs` — rejected: the op is already untracked-aware; untouched (Non-Goal).

## Non-Goals

- No new "unclaimed code file" law — the widened universe feeds existing conflict laws only; nothing reds merely because an untracked file matches no claim.
- No message rewording — the L2 dead-glob line keeps its exact wording.
- No change to the `adrs`/`reconfirm` ops (already untracked-aware per-query) or to `lib/adr-ops.mjs`.
- No untracked-file coverage in staged scans — the commit being made is the universe there.
- Gitignored files stay invisible in every mode.

## Decision alignment

- **ADR-0001 (zero-dependency):** one more git flag in the gather seam; no dependency enters.
- **ADR-0006:** fences and pins untouched.
- **ADR-0007 (the law behind every door):** the grammar-law module is untouched; no law text changes.
- **ADR-0012 (comments are shape-only):** the new gather comment documents the mode-bound list only — no decision ids, no finding ids.
- **ADR-0013 (one claim map):** the single claim-map builder stays the only derivation of per-file owners, governed files, and change claims; gather feeds it a different file list, nothing re-derives locally. The feature commit reconfirms ADR-0001/0006/0007/0012/0013 with evidence naming the mode-bound universe (the A2 law's demand for a moved, governed file).

## Capabilities

- gherkin: `cdd/changes/20261111-guard-untracked-claims/specs/gherkin/spec.md` — one ADDED requirement (the claim universe follows the scan mode) and one MODIFIED requirement (The ADR claims index is single-sourced: its builder-input sentence names the caller's claim universe — the tracked file list for the tool ops, the mode-bound universe for the guard — instead of the tracked file list alone, every scenario restated). gherkin holds 54 requirements, over every Tier A threshold; the delta carries a split-considered line deferring to the PF-6 store-ops split, whose guard half will carry the ADDED requirement.

Done-When: a green sandbox store where two capabilities' Code claims both match a non-ignored untracked file fails the door 3 full scan with exactly 1 O finding naming that file
Done-When: the same store under the pre-commit staged door prints no O finding for the untracked file
Done-When: with the file gitignored, the full scan reports capability B's literal claim as an L2 dead glob carrying the frozen wording "but no tracked file matches" and prints no O finding
Done-When: an untracked file claimed by an open change's delta and governed by an accepted ADR fires exactly 1 A1 finding naming the ADR when the proposal cites none
Done-When: `npm test` passes and `cdd/scripts/spec-drift.mjs` is byte-identical to `scripts/spec-drift.mjs`
Code: scripts/spec-drift.mjs, cdd/scripts/**, tests/acceptance/guard-file-universe.test.js
