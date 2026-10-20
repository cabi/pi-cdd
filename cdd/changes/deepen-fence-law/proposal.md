<!-- filled from the template; the instruction comment above traveled with it -->

# deepen-fence-law

## Why

The fence law lives in three dialects: `lib/gherkin.mjs`, the guard, and `spec-extract.mjs` disagree on the pin grammar, and the door 3 full scan parses fences but enforces none of the subset laws — a two-When delta passes CI while `cdd validate` fails it. ADR-0002's "same verdict at every door" currently rests on copy discipline, and commit bd4358b shows that discipline breaking (a regen wiped the parse gate). Meanwhile the tasks.md grammar has no owner: the template ships two `## 4. Close` sections and every consumer silently splits on the first.

## What Changes

- `scripts/law.mjs` — one zero-dependency law module owning every door-side grammar: fence scan/mask, the pin dialect, the subset predicates, parser error-shaping, the tasks grammar, the ADR frontmatter grammar, and the code-glob grammar.
- `lib/gherkin.mjs` and `lib/validate.mjs` become thin door-1 adapters over the law (parser injected, ADR-0005 split intact).
- The copied door scripts adopt the law: the guard's full scan enforces the subset laws, `spec-extract.mjs` counts strict pins only, `arch-extract.mjs` parses strict frontmatter.
- Doors 1–2 staged/commit-msg checks stay parser-free (ADR-0001).
- `parseTasks` in `lib/store.mjs` gives the tasks grammar its owner; the template's double `## 4. Close` is fixed and pinned by test.
- `cdd init` on an existing store refreshes `cdd/scripts/*` and says so; the [H] hook-health advice becomes truthful.
- ADR-0007 records the law module; GLOSSARY gains "the law"; MAINTENANCE documents the sync flow.

## Solutions Considered

- gherkin: `@cucumber/gherkin` (adopted — stays the arbiter per ADR-0005/0006; the law module wraps it once instead of each door re-shaping its errors). Per-door dialects plus a conformance test (rejected — three copies of every future rule change, the exact drift this change removes).
- store: the `parseDelta`/`parseLivingSpec` precedent in `lib/store.mjs` (adopted — `parseTasks` joins them on law.mjs primitives). Regex-per-consumer as today (rejected — five private grammars already drifted; the double Close shipped unnoticed).
- sync: the existing `writeDoorScripts` copy list (adopted — extended with refresh-on-init so stores can catch up). A `LAW_VERSION` check with a migration op (rejected — one version exists, YAGNI; the marker ships as a diagnostic only).

## Non-Goals

- No changes to verdict output formats (guard letters, agent-tool JSON, status).
- No parser at doors 1–2 staged/commit-msg modes — they stay zero-dependency forever.
- No status double-run or archive-twin refactors (report candidates 3/4 — separate changes).
- No new spec capabilities: refresh-on-init is recorded in the ADR, not the spec.

Done-When: a delta with a two-When scenario is red at the door 3 full scan and green at --staged
Done-When: the pin dialect is defined exactly once in scripts/law.mjs and no second copy remains under scripts/
Done-When: cdd init on this existing store re-copies cdd/scripts/* and lists the refreshed files
Done-When: npm test is green with a test pinning the scaffolded tasks template to the parser
Code: scripts/**, lib/**, tests/**, cdd/scripts/**
