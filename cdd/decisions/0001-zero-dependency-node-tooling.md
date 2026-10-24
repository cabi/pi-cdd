---
status: accepted
code: scripts/**
---
# Zero-dependency Node tooling at the doors

Ported from the factory (`openspec-cdd/openspec/decisions/0001-zero-dependency-node-tooling.md`); path adjusted to this repo.

The guard and the Phase 0 extractors are plain Node scripts over `fs` and `git` — no runtime dependencies, no framework. This repo's whole promise is that the doors stay runnable anywhere Node exists: CI images, git hooks, agent sandboxes. A dependency tree sitting at the door would be drift risk guarding drift — the guard must be the thing that never itself needs guarding.

In pi-cdd the extension itself may use the pi runtime (it runs inside pi by definition), but everything it copies into an adopting project — guard, extractors, CI templates — keeps this ADR: zero-dependency Node at every verification door.

- Reconfirmed by comments-are-shape-only on 2026-10-23: scripts/*.mjs headers compressed to shape-only; zero-dependency tooling unchanged.

- Reconfirmed by adr-ops on 2026-10-24: spec-drift refactor moves the claims index + matcher to scripts/adr-index.mjs and grows A1/A2 remedy text — the memory-claim checks themselves are unchanged
- Reconfirmed by spec-model on 2026-10-24: spec-model kept the doors zero-dependency: grammar-law imports globToRe from sibling adr-index, node built-ins only
- Reconfirmed by guard-pure-checks on 2026-10-24: the guard still ships zero runtime deps — the restructure adds only the node:url builtin and keeps the @cucumber/gherkin dynamic import gated on the full-scan scope
- Reconfirmed by claim-map on 2026-10-24: scripts/adr-index.mjs still imports nothing — buildClaimMap is pure ES module code over parsed inputs, no dependency added
- Reconfirmed by decision-scan-unify on 2026-10-24: the shared decision scan lands inside scripts/adr-index.mjs and travels as its byte-identical store copy — Node built-ins only, no dependency added
