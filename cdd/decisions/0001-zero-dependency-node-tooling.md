---
status: accepted
code: scripts/**
---
# Zero-dependency Node tooling at the doors

Ported from the factory (`openspec-cdd/openspec/decisions/0001-zero-dependency-node-tooling.md`); path adjusted to this repo.

The guard and the Phase 0 extractors are plain Node scripts over `fs` and `git` — no runtime dependencies, no framework. This repo's whole promise is that the doors stay runnable anywhere Node exists: CI images, git hooks, agent sandboxes. A dependency tree sitting at the door would be drift risk guarding drift — the guard must be the thing that never itself needs guarding.

In pi-cdd the extension itself may use the pi runtime (it runs inside pi by definition), but everything it copies into an adopting project — guard, extractors, CI templates — keeps this ADR: zero-dependency Node at every verification door.

Reconfirmed-by: comments-are-shape-only — scripts/*.mjs headers compressed to shape-only; zero-dependency tooling unchanged.
