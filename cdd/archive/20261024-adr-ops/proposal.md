# adr-ops

## Why

The ADR corpus has workflow operations but no workflow: discovery is freehand (grep `cdd/decisions/` and re-derive glob ownership by hand — the exact skill PF-20 proved unreliable even for the guard), reconfirmation bookkeeping has drifted into three competing spellings across the twelve ADRs (multi-line `Reconfirmed by X on DATE:` paragraphs, dateless `Reconfirmed-by: X — ev` lines, and no pin anywhere), and PF-19's residual corner is real — a post-archive reconfirmation has no lawful tooled path, so debt that surfaces after Close lands as an untracked freehand edit. The guard's A1/A2 findings teach the law but not the command: they tell the runner to cite or reconfirm without naming the tool that answers.

## What Changes

- One shared module, `scripts/adr-index.mjs` (zero-dependency door lib, `grammar-law.mjs` precedent): the ADR claims index (decision frontmatter → id, file, status, supersedes, title, code globs), the glob matcher (the PF-20-fixed compilation), and the status vocabulary (re-exported from `grammar-law.mjs`, defined once). The drift guard refactors to consume it with zero behavior change — the check is sequenced: at a working-tree state holding the extraction and nothing else, the guard's clean-tree full-scan stdout, stderr, and exit code must be byte-identical to the captured baseline; only after that passes do the remedy-sentence edits (below) land, so the before/after pair isolates the extraction. The store copy travels with the guard (`DOOR_SCRIPTS` grows one entry, byte-identity pinned for all three traveling files).
- `cdd adrs` — discovery: a table (id, title, status, code globs) over every ADR; `--status <value>` filter with refusal-with-remedy on unknown values (valid statuses listed from the shared constant, nearest-match hint by Levenshtein ≤2 or unambiguous prefix, no hint on an ambiguous tie); `--code <path>` reverse lookup returning every governing ADR on overlapping claims, ordered by id, with path normalization (strip `./`, relativize absolute paths, refuse outside-root), directory queries (any claimed file under the directory), and an empty-result remedy hint.
- `cdd reconfirm <adr-id>` — bookkeeping: appends the pinned-format line `- Reconfirmed by <change> on <iso>: <evidence>`; `--change` defaults to the sole open change and explicitly accepts an ARCHIVED change name (the PF-19 corner); refuses unknown ids, superseded ADRs (suggesting the supersede path), a missing change, a missing `--evidence`, and a second reconfirmation by the same change (idempotence refusal). `cdd reconfirm --check` is the pre-flight: ADRs whose claimed files moved since their last reconfirmation, for the current open change — A2's post-archive surprise turned into a pre-commit listing.
- The guard's A1 finding names `cdd adrs --code <file>` and A2 names `cdd reconfirm` — the doors teach executable remedies.
- Every existing reconfirmation line in the twelve ADRs migrates to the pinned grammar (dates for the dateless lines derived from the archived change folders), and a store-sweep pin holds the grammar forever.
- PF-19's note names this change as the residual's fix.

## Solutions Considered

- adr: the guard's existing A-check machinery in `scripts/spec-drift.mjs` (frontmatter parse, glob compilation, status enum) — adopted as the extraction source rather than writing a second parser: the op and the door must agree by construction, and PF-20 showed hand-rolled matching silently rots.
- adr: `lib/backlog.mjs`'s op shape (pure functions over the store, refusal-with-remedy style, direct-execution guard, ACTIONS-derived OPS_DOC) — adopted wholesale for `lib/adr-ops.mjs`; no new op architecture is invented.
- gherkin: `scripts/grammar-law.mjs` as the traveling door-lib precedent — adopted: placement in `scripts/` (not `lib/`) because adopting stores carry only `cdd/scripts/*`; a `lib/` import in the store copy of the guard would break every adopting store.
- gherkin: the byte-identity + `cdd init` refresh travel law (living requirement "Guard tolerates scaffold placeholders in open deltas") — adopted and extended to the third traveling file rather than minting a parallel travel law.
- extension: the backlog-op requirement precedent ("The backlog op triages findings on disk", `cdd/specs/extension/spec.md`) — adopted for the two new ops: the op requirement lives in the extension capability with the tool surface (index.ts, lib/adr-ops.mjs, tests/tools.mjs), while the adr capability carries the domain laws (index single-sourcing, discovery semantics, bookkeeping grammar).

## Non-Goals

- No change to the A-checks' firing semantics — A0/A1/A2 keep their exact triggers and check tags; only the remedy sentences grow.
- No `rules.md` refactoring-section idea (sketched in dispatch, not commissioned) and no PF-23 resolve append-vs-replace fix — different ops, stays open.
- PF-22 (ADR-0004's stale `lib/context.ts` glob) stays untouched — corpus cleanup, not this change's surface.
- No supersede/successor bookkeeping op, no ADR creation op — discovery and reconfirmation only.
- The status vocabulary itself is not extended or reordered; the op reads the enum the A0 check already enforces.

## Capabilities

- adr: `cdd/changes/adr-ops/specs/adr/spec.md` — ADDED "The adrs op discovers governing decisions", ADDED "The reconfirm op records decision reconfirmation"
- gherkin: `cdd/changes/adr-ops/specs/gherkin/spec.md` — ADDED "The ADR claims index is single-sourced", ADDED "A-check findings name their remedy op", MODIFIED "Guard tolerates scaffold placeholders in open deltas" (third traveling file). The index requirement lives here, not in adr: the living comments-law render claims `scripts/*.mjs` for gherkin (ADR-0012), and the O law gives every file one owning capability — the shared module is door law, so gherkin holds it while the adr capability holds the ops.
- extension: `cdd/changes/adr-ops/specs/extension/spec.md` — ADDED "The adrs and reconfirm ops dispatch thin over the ADR library" (enum 7→9, OPS_DOC derived from the shared tables)

## Decisions followed (A1 citations)

- ADR-0001 (zero-dependency Node tooling) — followed: `scripts/adr-index.mjs` is plain Node over `fs`, importing only its sibling `grammar-law.mjs`; nothing enters the dependency tree.
- ADR-0002 (the harness is the counterparty) — followed: the new ops are deterministic tool ops returning documents; the model reads answers, never negotiates a verdict.
- ADR-0006 (feature-block consolidation) — followed: every new requirement lands as exactly one Feature block with its own acceptance pin; no scaffold surface splits.
- ADR-0007 (the law behind every door) — followed and executed: the claims index, matcher, and status vocabulary become door-side law stated exactly once in a scripts/ module that doors and tools import; none restate it.
- ADR-0008 (model-run reviews are advisory findings) — followed: this change's reviews carry severities and dispositions; no review machinery changes.
- ADR-0009 (single-source the loop law) — followed: the same single-source discipline applied to the ADR claims surface — one definition, every statement surface imports it.
- ADR-0011 (pins hit real doors) — followed: every new pin drives the real op (loadViaPi on index.ts) or the real guard as a child process; the shared-module agreement pin compares the op's answer against the guard's own A1 citations.
- ADR-0012 (comments are shape-of-code documentation only) — followed: the new module and op carry shape-of-code comments only; corpus routing lives in the store.

Done-When: `cdd adrs` lists all 12 ADRs (id, title, status, code globs) and `--code lib/templates.mjs` returns exactly ADR-0006, ADR-0007, ADR-0008, ADR-0009, ADR-0011, ADR-0012 in id order (ADR-0005 also claims the file literally but is superseded — superseded decisions do not govern)
Done-When: on a synthetic repo state, `cdd adrs --code <file>` and the guard's A1 check answer the same governing-ADR set for every claimed file the change touches
Done-When: `cdd reconfirm` appends the pinned-format line (open change and post-archive `--change`), refuses unknown id / superseded / missing change / missing evidence / same-change-twice, and `--check` lists exactly the ADRs whose claimed files moved since their last reconfirmation
Done-When: every reconfirmation line in all 12 ADRs matches the pinned grammar, held by a store-sweep acceptance pin
Done-When: the guard's clean-tree full-scan output (stdout, stderr, exit code) is byte-identical to the captured baseline at a tree state holding only the extraction (remedy edits land after), and `cdd backlog resolve` moves PF-19 to done with a note naming this change as the residual corner's fix
Code: scripts/adr-index.mjs, scripts/spec-drift.mjs, cdd/scripts/adr-index.mjs, cdd/scripts/spec-drift.mjs, lib/adr-ops.mjs, lib/templates.mjs, index.ts, tests/tools.mjs, tests/acceptance/adr-ops.test.js, tests/acceptance/adr-reconfirm.test.js, tests/acceptance/adr-index-agreement.test.js, tests/acceptance/guard-adr-remedies.test.js, tests/acceptance/gherkin-guard-placeholder.test.js, cdd/decisions/*.md, cdd/backlog.md
