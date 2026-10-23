# guard-glob-fix

## Why

Every single-star `Code:` glob in the living corpus compiles to a regex demanding a literal `[` (PF-20: `globToRe` escapes `*` before translating it), so those claims have been silently zero — and the two globs that DO claim (ADR-0011 literal, and the class glob once fixed) bind ADR files to the travel doors, deadlocking A2-prescribed reconfirmations that have no archive commit to ride (PF-19). Fixing the compiler without correcting the over-claims would activate 11 ADR claims across two capabilities: 3 topology reds at tip and an 11-wide reconfirm collision.

## What Changes

- `globToRe` (scripts/spec-drift.mjs) compiles `Code:` globs with precise glob semantics: `[...]` → character class (`!` leading → `^`), `*` → `[^/]*`, `**` → `.*` across directory separators, every other regex metacharacter escaped so literals stay literal.
- The 8 over-claiming living `Code:` lines (7 gherkin requirements, 1 adr) drop their `cdd/decisions/` paths and name implementation surface only — the enforcement pins where the ADR paths were the only entry (Single-source ADR is drafted names `tests/acceptance/single-source-law.test.js`).
- The door 3 full scan gains a memory-claim check: a living or open-delta `Code:` line whose compiled claims intersect `cdd/decisions/**` reds naming the spec and the lawful surface — the honest-claim invariant gets teeth, and a staged ADR reconfirmation with nothing claiming it passes both commit doors green (the lawful reconfirm path, PF-19's residual corner closed).

## Solutions Considered

- gherkin: existing claim machinery (globToRe + claim resolution in scripts/spec-drift.mjs) — adopted for both fixes; the compiler rewrite and the new check stay in the existing full-scan seat, no new seam. The three rejected remedy shapes (door exemptions for `cdd/decisions/**`, a reconfirm-only commit shape, compiler-fix-only) are recorded in design.md Alternatives.
- adr: the existing A-checks (A0/A1/A2) already scan `cdd/decisions/` unconditionally — adopted as the lawful governance surface for decision memory; no new adr-side machinery, the capability's delta is one Code-line correction.
- Libraries (picomatch, minimatch) — rejected: one 20-line pure function inside the guarded script, and a new dependency for glob translation would move contract logic out of the surface the guard itself pins.

## Non-Goals

- No change to A-check semantics (A0/A1/A2), the mechanical lane, L1 pin resolution, or L3 — only claim compilation and what Code lines may claim.
- No dead-path drift check for `Code:` globs naming zero files (PF-12's family) — separate finding, stays in the backlog.
- No rewrite of archive history or git hooks; the pair-commit protocol is untouched.

## Capabilities

- gherkin: ADDED glob-compilation contract; ADDED decision-memory claim law; MODIFIED ×7 requirements with corrected `Code:` lines (specs/gherkin/spec.md).
- adr: MODIFIED `Product ADRs live in the store's decisions home` with corrected `Code:` line (specs/adr/spec.md).

## Decisions followed

ADR-0001 (scripts/** owns the guard script), ADR-0006 (library-and-script split the fix respects), ADR-0007 (the guard's grammar surfaces stay single-sourced — globToRe stays inside spec-drift.mjs, no second grammar module), ADR-0008 (advisory findings, never verdicts — this change's reviews run that grammar), ADR-0009 (the loop law stays single-sourced; this change adds no new law text), ADR-0010 (reviewer independence rule 2b — R1/R2/R3 run cold, other-family, two sessions per axis pair), ADR-0011 (ticks are claims, pins hit real doors — the delta's Code lines are corrected to claim only what the pins enforce). ADR-0008/0009/0010/0011 fire because the corrected Code lines this change's delta carries re-name their governed surfaces (lib/loop-law.mjs, lib/templates.mjs, cdd/rules.md, the review skills' pinned suites); this change follows them.

Done-When: every star/class Code glob compiles to precise claims pinned by real-door probes (a staged `src/*.mjs` claim reds commit-msg; `cfg/[ab].mjs` claims a.mjs/b.mjs, not c.mjs)
Done-When: no living Code line claims decision memory and the full scan rejects one that does, naming the spec and the lawful surface
Done-When: a staged ADR edit with no claiming spec passes `--staged` and `--commit-msg` green (lawful reconfirm path)
Done-When: the 8 over-claiming living Code lines name implementation surface only — the enforcement pins, never `cdd/decisions/**`
Done-When: the guard's full scan exits 0 at tip with the fixed compiler
Code: scripts/spec-drift.mjs, cdd/scripts/**, tests/acceptance/guard-glob-claims.test.js, tests/acceptance/guard-memory-claims.test.js
