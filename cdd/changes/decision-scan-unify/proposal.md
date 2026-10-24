# decision-scan-unify

## Why

"What is a decision file?" has two answers. scripts/adr-index.mjs
`buildAdrIndex` walks only `cdd/decisions`, skips names that do not match
`/^(\d{4})-/`, and parses frontmatter with fallback status `accepted`;
scripts/arch-extract.mjs carries a private `scanDecisions` (:152–176) that
walks `cdd/decisions` **and** `docs/adr`, ingests every `.md` with no name
filter, and defaults status to `unknown`. So a misnamed ADR is invisible to
the guard, the adrs op, and reconfirm, yet sits in arch-extract's baseline
as settled context; a docs/adr record is scanned only by the extractor. The
deletion test: deleting the private copy and calling a parameterized scan
from adr-index loses only the divergence itself — one law, two flag sets.

## What Changes

- One decision scan `scanDecisionFiles` exported from scripts/adr-index.mjs
  behind explicit ingest flags — `dirs` (which decision directories to walk,
  in order), `numberedOnly` (whether only four-digit-prefixed names count as
  decisions), `defaultStatus` (fallback when frontmatter states none); the
  defaults equal the index preference.
- `buildAdrIndex` builds on the scan with explicit index flags
  `{dirs: ['cdd/decisions'], numberedOnly: true, defaultStatus: 'accepted'}`
  — rows, row order, and every derived answer bit-identical.
- scripts/arch-extract.mjs deletes its private `scanDecisions` and its
  `parseDecisionFrontmatter` import, imports the shared scan, calls it with
  its legacy preference
  `{dirs: ['cdd/decisions', 'docs/adr'], numberedOnly: false, defaultStatus: 'unknown'}`,
  and projects the rows to its `{location, status, code, title}` shape.
- Behavior-preserving on both surfaces: guard/adrs/reconfirm answers
  unchanged (the existing suites are the proof and stay green, unchanged);
  arch-extract's scanned set and statuses unchanged on the same input tree.
- Door copies regenerated per ADR-0007: cdd/scripts/arch-extract.mjs and
  cdd/scripts/adr-index.mjs byte-identical to their sources (the new
  arch-extract → adr-index import edge mirrors spec-drift's and travels
  inside the store copy).

## Solutions Considered

- gherkin: claim-map's MODIFIED-requirement precedent (adopted — "The ADR
  claims index is single-sourced" extends to the scan itself; both touched
  scripts are gherkin-claimed, scripts/adr-index.mjs by that requirement and
  scripts/arch-extract.mjs by "Declarative style is door-1 law"); the
  exactly-once scan-pin pattern from SM2/CM1 (adopted for the walk-and-parse
  pin); the PF-27 worktree byte-identity recipe (adopted, extended with a
  decision-set equivalence probe for the extractor surface).
- adr: the scan joins `buildAdrIndex`'s primitives in scripts/adr-index.mjs
- adr: the scan joins `buildAdrIndex`'s primitives in scripts/adr-index.mjs
  (adopted — co-located with the index and the claim map that the guard
  and the ops library already import, in the module that already travels
  into the store);
  `parseDecisionFrontmatter` stays in grammar-law.mjs and the scan calls it
  (adopted — the frontmatter law does not move, the walk does); moving the
  scan into lib/ (rejected — lib modules do not travel into adopting
  stores, and the scan is door law).
- extension: no new traveling module (rejected — DOOR_SCRIPTS is pinned at
  5 and a sixth door is fence-dead); no new op or surface (rejected).

## Non-Goals

- No unification of the two title laws beyond the shared row:
  adr-index keeps `(first '# ' line).slice(2)`; the extractor keeps its
  `^#\s+(.+)$` match over that line with filename fallback. Three exotic
  inputs diverge: a file whose only heading is tab-indented (`#\t…`, no
  `# ` line anywhere) — the old extractor law matched it (`\s+` spans a
  tab) while the new projection falls back to the filename; a
  tab-indented heading placed before a real `# ` heading — the old law
  took the tab heading, the new projection takes the `# ` heading; and a
  bare `# ` first heading before a later real one (`# \n# Second…`) —
  the old law skipped the empty match and took the later heading, the
  new projection falls back to the filename (pinned by DS3d). On
  this store, and on any conventionally written markdown (every decision
  file leads with `# `), the answers are identical; unifying the laws
  themselves would change observable answers the fence forbids.
- No change to which files the guard, adrs, or reconfirm see: a misnamed
  file remains invisible to the index, docs/adr remains extractor-only
  territory. What closes is the second derivation of the scan, not the
  answer divergence the flags encode.
- No new door script, no store-format change, no new op, LAW_VERSION
  untouched.

## Decisions followed

- ADR-0001 (zero-dependency Node tooling at the doors): the scan is plain
  `node:fs`, no new dependency, and it lands in the door module.
- ADR-0007 (door scripts are store-copied): both edited doors regenerate;
  copies stay byte-identical; the new import edge travels inside the store
  copy because the two copies sit side by side in cdd/scripts/.
- ADR-0012 (comments are shape-of-code documentation only): the scan's
  comments carry shape, not corpus routing.
- ADR-0013 (one claim map for guard and ops): its Decision rules the claim
  derivation's home, not the scan's — the scan joins the same module by
  co-location with the index and the claim map. Its Why rejected an
  I/O-walking builder for the claim map ("would re-read files the guard's
  gather-once law reads once"); that reservation does not bind here: the
  scan re-reads exactly the files `buildAdrIndex` reads today, relocated,
  not new I/O — each door still reads the decision files once.

## Capabilities

- gherkin: cdd/specs/gherkin/spec.md MODIFIED — "The ADR claims index is
  single-sourced" (the decision scan becomes single-sourced behind explicit
  ingest flags; new acceptance file tests/acceptance/decision-scan.test.js).
  The adr capability's files (lib/adr-ops.mjs and its three tests) are
  untouched.

Done-When: tests/acceptance/decision-scan.test.js exits 0 pinning the walk-and-parse exactly once — `scanDecisionFiles` exported from scripts/adr-index.mjs, scripts/arch-extract.mjs holding no decision-directory walk and no decision-frontmatter import — plus the flag semantics over a synthetic tree (defaults equal the index preference; index flags; legacy extractor flags each answered, including the missing-directory tolerance and the heading-less file's empty-string index title) and the extractor-surface equivalence (the live-tree baseline — report decisions lines plus --json derived.decisions rows — captured before any edit at the branch point, and the synthetic-tree legacy-flag rows projected to the extractor shape), the file RED before implementation for exactly those reasons
Done-When: the drift guard's full-corpus stdout, stderr, and exit code are cmp-identical before/after per the PF-27 worktree recipe, and the adrs op's table, --code, and reconfirm --check answers are byte-identical before/after — recorded in the tasks tick
Done-When: arch-extract's scanned decisions are equivalent before/after: on the live tree the report's decisions lines and the --json derived.decisions rows — location, status, code, title, order — are identical before vs after the change, cmp-recorded in the tasks tick
Done-When: cdd/scripts/*.mjs are byte-identical to scripts/*.mjs (cmp), the full test sweep (`npm test`) exits 0, and cdd validate strict is green
Code: scripts/adr-index.mjs, scripts/arch-extract.mjs, tests/acceptance/decision-scan.test.js, cdd/scripts/**
