# ops-registry

## Why

"What ops exist" is hand-maintained in four surfaces that have already
drifted apart:

- `lib/help.mjs:25` advertises a `/cdd-validate` slash command that no code
  registers (only 5 commands register, `index.ts:220`/`232`/`251`/`264`/`274`;
  `/cdd-validate` is not among them) — a ghost command shown to the human on
  every `/cdd-help`.
- `lib/help.mjs:26` lists seven of the nine ops — exactly `adrs` and
  `reconfirm` are missing; the row arrived with the lean-tools merge
  (`8936460`) and grew only once (`backlog`), never again when the adrs and
  reconfirm ops landed.
- `tests/smoke.mjs:333` (S21) pins the stale ops row verbatim — the drift is
  now test-enshrined, so a bare correction of help.mjs would go red on a test
  that exists to catch exactly this rot.
- `index.ts` holds the same truth four more times: the op enum in the tool
  declaration (`index.ts:306`), the `OPS_DOC` map (`index.ts:60`–`144`), the
  dispatch switch (`index.ts:314`–`410`), and per-case `parseOptions`
  whitelists — the whitelist/docs drift already bit once: the backlog case
  accepts a `premise` option (`index.ts:369`; described in prose at
  `index.ts:108`) that `OPS_DOC.backlog.parameters` does not document.

Six copies of one list, three observed defects, one enshrined by a test. The
repo's own law (ADR-0009) already prescribes the cure for the loop law:
state it once, render it everywhere.

## What Changes

- One ordered op registry in **new file `lib/ops.mjs`** — one row per op
  holding `{ name, was, aliases, description, parameters }` (plain JSON
  fragments, the OPS_DOC content moved verbatim), plus `COMMANDS` (the 5
  slash commands in registration order — `cdd-init · cdd-new · cdd-status ·
  cdd-help · cdd-archive`) and the derivations `OP_NAMES`, `OPS_DOC`,
  `OP_ALIASES`. The `was` field is provenance: MAINTENANCE.md names OPS_DOC
  the authoritative record of the five-tool surface's original text, so the
  row keeps it and the help payload keeps carrying it.
- `index.ts` derives every op surface from the registry: the declaration
  enum, the help payload, the legacy alias map, and each dispatch case's
  option whitelist (`Object.keys` of the row's `parameters.properties`); the
  dispatch switch stays literal — one case per registry op, nothing extra,
  and those case labels are the deliberate keyed restatement the agreement
  pin scans exactly-once.
- `lib/help.mjs` joins the two "Commands and tools" rows from `COMMANDS` and
  `OP_NAMES`. The ops row gains `adrs · reconfirm`; the commands row drops
  the ghost `/cdd-validate` **and reorders to registration order** (the old
  row ended `… · /cdd-archive · /cdd-help`; the derived row reads
  `/cdd-init · /cdd-new · /cdd-status · /cdd-help · /cdd-archive`) — order
  becomes part of the single source instead of a hand-maintained accident.
  The acceptance pin asserts the derived commands row verbatim so the
  reorder can never happen silently.
- Docs corrected where stale: the backlog row documents its already-accepted
  `premise` option, and the help op gains its own `OPS_DOC` entry so "every
  registry op is documented, nothing extra" holds exactly.
- `tests/smoke.mjs` S21 updated in place (needle list carries the 9-op row,
  adds a ghost-absent assertion; no check deleted) — per H1.
- New acceptance pin `tests/acceptance/ops-registry.test.js` loads the real
  extension entry and asserts the agreement invariant: exactly 9 ops equal
  across enum, OPS_DOC, dispatch cases, whitelists, and help rows; exactly 5
  registered slash commands equal the derived commands row, in registration
  order; `/cdd-validate` in no rendered row; the `was` provenance fields
  ride exactly the five original tools.
- Behavior-preserving for all 9 ops: same params, same dispatch outcomes,
  same aliases, same doc text (modulo the two corrections above) — the one
  deliberate non-behavior surface change is the disclosed commands-row
  reorder.

## Solutions Considered

- ADR-0009's single-source shape (adopted — the registry is `lib/loop-law.mjs`
  for the op surface: plain data module, every consumer derives, no consumer
  restates).
- The claim-map run's registry-home reasoning (adopted — home the table where
  its primary consumer's capability owns the file; `lib/ops.mjs` sits in
  extension territory, unlike help.mjs which 6 gherkin requirements claim).
- The adr-index-agreement scan-pin pattern (adopted — the pin source-scans
  `case "` labels in index.ts for exactly-once per registry op, and probes
  option whitelists through the real execute with an unknown option).
- The existing tools.mjs declaration pins (kept, extended — T1's enum-9,
  command-5, ≤900-char budget, and no-OPS_DOC-duplication checks at
  `tests/tools.mjs:72`/`74`/`78`–`83` already pin four surfaces at set
  level; the agreement pin adds the per-element exactly-once and
  whitelist/doc equalities they cannot express, and T1–T4 stay green
  unmodified).
- Growth of lib/help.mjs as the registry home (rejected — inverts the
  dependency; see design.md Alternatives).
- Byte-identity worktree proofs (rejected — door scripts are untouched, so
  no store-copy proof is needed; the pin + full sweep carry the
  behavior-preservation evidence).

## Non-Goals

- No change to `scripts/` or `cdd/scripts/` (door scripts, LAW_VERSION,
  store format all untouched), hence no byte-identity proof harness.
- No new op, no removed op, no change to any op's behavior, dispatch
  outcomes, or alias semantics; `fillArgs`'s top-level folding logic stays as
  is.
- No README.md change (its ops line at `README.md:36`–`37` lists seven of
  nine ops too — real doc drift, but outside this change's fence; a follow-up
  change or mechanical doc pass can take it once the registry exists to
  derive from).
- No `tests/tools.mjs` change expected (T1–T4 stay green unmodified); if a
  check must move, it moves in place with justification, never deleted.
- No new ADR. Argued against the four-criterion test, not asserted: the
  registry home is reversible in one small move (table + imports, the pin
  follows); the claim-topology fact that forced it is visible in the guard's
  own output (`cdd adrs --code lib/help.mjs`) and recorded in design.md,
  which archives with the change; the three traded shapes are cheap
  placements, not structural bets; and the table itself crosses no capability
  boundary — the gherkin-claimed renderer consuming an extension-owned data
  module is ordinary dependency direction, pinned by the gherkin ADDED
  requirement. ADR-0013 differs in kind: that home decision was T2-YES
  architecture bet territory with byte-identity fence constraints; this gate
  answered T2 NO.
- No UI/theme work beyond the two derived rows.

## Decisions followed

- ADR-0002 (the harness is the counterparty): the declaration stays lean;
  the full per-op documentation keeps riding the help op, unchanged in
  content.
- ADR-0007 (zero-dependency Node tooling): the registry is a plain `.mjs`
  data module — no new dependency, no typebox, vendored tree untouched.
- ADR-0009 (single-source the law): one table behind enum, docs, aliases,
  whitelists, and help rows — the loop-law cure applied to the op surface.
- ADR-0012 (comments are shape-of-code documentation only): `lib/ops.mjs`,
  `index.ts`, and `lib/help.mjs` carry shape-only comments; the agreement
  law lives in the spec and the pin, not in prose.
- ADR-0008 (model-run reviews are advisory findings): the help screen's
  review-point wording — ADR-0008's shipping surface in `lib/help.mjs` —
  is untouched; this change re-sources only the two "Commands and tools"
  rows, so every review-point statement keeps stating what rule 2a states.

## Capabilities

- extension: `cdd/specs/extension/spec.md` MODIFIED — "Thin ops over a deep
  library" (the requirement gains the registry law: the op surface is one
  ordered registry, every consumer derives, agreement pinned; new acceptance
  file tests/acceptance/ops-registry.test.js).
- gherkin: `cdd/specs/gherkin/spec.md` ADDED — "The help screen renders the
  ops registry" (the /cdd-help rows render from the registry; the smoke
  suite pins the rendered rows and asserts the ghost command absent).
  Required by claim topology: lib/help.mjs (6 living requirements) and
  tests/smoke.mjs (8) are gherkin-capability files (guard laws L2/O police
  one capability per file), so their travel rides a gherkin delta even
  though the content is extension surface.

Done-When: tests/acceptance/ops-registry.test.js exits 0 loading the real extension entry and asserting the agreement invariant — the registry's exactly 9 ops equal the declaration enum, the OPS_DOC keys (help included, backlog premise documented), the dispatch case labels, the per-op option whitelists, and the derived help ops row; exactly 5 registered slash commands equal the derived commands row in registration order and verbatim; /cdd-validate appears in no rendered row; the was fields ride exactly the five original tools
Done-When: node tests/smoke.mjs exits 0 with S21 updated in place — needle list carries the 9-op registry row, asserts the ghost /cdd-validate absent, and git diff main -- tests/smoke.mjs shows zero deleted check( lines
Done-When: the full sweep npm test exits 0 with tests/tools.mjs unmodified
Done-When: cdd validate ops-registry strict passes and node scripts/spec-drift.mjs exits 0
Code: index.ts, lib/ops.mjs, lib/help.mjs, tests/smoke.mjs, tests/acceptance/ops-registry.test.js
