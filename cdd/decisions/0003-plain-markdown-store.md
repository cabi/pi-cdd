---
status: accepted
code: lib/store.mjs
---
# The store is plain markdown, owned by the method

The artifact store lives at `cdd/` in the adopting project as ordinary markdown files — changes, spec deltas, living specs, archive, rules, glossary, decisions. No database, no index format, no tool-specific metadata beyond frontmatter the method itself defines.

Reasons:

1. **No reverse lock-in:** uninstall the extension and every door keeps working — the guard reads files, not an API. The store outlives the tool that scaffolded it.
2. **Reviewability (critic C1):** specs are for humans first. Plain markdown in a visible root folder is readable, greppable, diffable in every code review.
3. **Merge semantics stay textual:** the delta → spec merge on archive is a markdown section operation, reviewable in the archive commit.

Consequence: the extension's store layer is a thin `fs` module, and any future format change is an ADR plus a migration note — never a silent version bump.

- Reconfirmed by comments-are-shape-only on 2026-10-23: lib/store.mjs lesson prose and pointer comments removed; the plain-markdown store unchanged.
- Reconfirmed by spec-model on 2026-10-24: spec-model kept the store plain markdown: parseDelta/parseLivingSpec are thin adapters over the law model, store formats unchanged
- Reconfirmed by 20261024-metrics-stamp on 2026-10-24: metrics.md is one more plain-markdown file in the archive folder; the store layer stays a thin fs module — no schema, no index, no generated format beyond markdown
