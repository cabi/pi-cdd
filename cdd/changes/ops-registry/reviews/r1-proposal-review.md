# R1 proposal review — ops-registry

**Reviewer form:** cold sub-agent session, briefed only from the paths named in
`cdd/changes/ops-registry/reviews/brief-r1.md`; no authoring context carried in.
**Reviewer family:** anthropic/claude. **Author family:** zai/glm-5.3 — families
differ, so this review is admissible under rule 2b without the fallback clause.
**Pinned state:** commit `4afb08b` (branch `ops-registry`); `cdd/changes/ops-registry/`
is the only untracked path, the rest of the tree is clean at that commit. Every
citation below was read at that state.
**Scope:** proposal.md, design.md, `tasks.md` §2.1 only. The delta scaffolds under
`cdd/changes/ops-registry/specs/` and `tasks.md` §3 are R2's object and were not
reviewed. No fixes were made; findings are advisory.

## Charter results

| # | Charter item | Result |
|---|---|---|
| 1 | Design-gate answers credible (T1–T5) | **passes with an evidence defect** — T1/T3/T4/T5 verdicts hold; T1's claim counts are undercounts (P3) |
| 2 | Reuse-first actually searched | passes — all three named precedents exist and are as described (see below) |
| 3 | Every Done-When verifiable as written | passes except one half of DW2 (N1) |
| 4 | Scope fence sane, nothing unsponsored | **one unsponsored behavior change** (P2), one fence asserted rather than argued (P5), one underspecified field (N2) |
| 5 | Capability mapping right | passes — mapping and guard consequences verified |
| 6 | Premise honesty | substance passes (all six drift claims true), citations fail (P1), two details imprecise (N3, N4) |

Verified for charter item 2: `cdd/archive/20261022-backlog-op/` is a real two-delta
change (proposal, specs, tasks, reviews); `cdd/archive/20261024-claim-map/` carries
the design.md its gate produced; `tests/acceptance/adr-index-agreement.test.js`
and `tests/acceptance/claim-map.test.js` are real scan pins that run the drift
script as a child process (`tests/acceptance/adr-index-agreement.test.js:139`);
ADR-0009 exists as cited.

Verified for charter item 5: `cdd/specs/extension/spec.md` claims `index.ts` and
`tests/tools.mjs` and no gherkin file; `cdd/specs/gherkin/spec.md` claims
`lib/help.mjs` (6 requirements) and `tests/smoke.mjs` (8) and neither extension
file. The new `lib/ops.mjs` and `tests/acceptance/ops-registry.test.js` are
claimed by nobody today, so the one-capability-per-file guard
(`scripts/spec-drift.mjs`, `checkO`) stays green, and the travel law (`checkL2`)
is satisfied by the extension+gherkin delta pair. MODIFIED "Thin ops over a deep
library" is a living requirement, and the ADDED gherkin requirement names a law
(rows render from one registry) that no living requirement states — no rule 5
duplication.

Verified for charter item 6: the ghost `/cdd-validate` in the commands row, the
seven-of-nine ops row, the S21 verbatim pin, the four index.ts copies, and the
`premise` drift are all real. `premise` occurs only at `index.ts:108`
(description prose) and `index.ts:369` (backlog whitelist); `OPS_DOC.backlog`
(`index.ts:106`–`120`) has no `premise` property.

## Findings

### P1 — the Why's line citations do not match the pinned tree (should · open)

`cdd/changes/ops-registry/proposal.md` cites eight sites in `## Why` and `## Non-Goals`;
seven are wrong at `4afb08b`, and only `tests/smoke.mjs:333` is exact. The drift
claims themselves are all true — this is an evidence-anchor defect, not a premise defect.

- `lib/help.mjs:16` cited for the ghost command row → the ghost row is
  `lib/help.mjs:25`; `lib/help.mjs:16` is `["h", "Brownfield: adopting an existing project"]`.
- `lib/help.mjs:17` cited for the ops row → the ops row is `lib/help.mjs:26`.
- `index.ts:171`–`271` cited for the 5 `registerCommand` calls → the calls are at
  `index.ts:220`, `232`, `251`, `264`, `274`, and the block ends at `index.ts:294`.
- `index.ts:261` cited for the declaration op enum → `index.ts:306`.
- `index.ts:60`–`182` cited for `OPS_DOC` → `OPS_DOC` runs `index.ts:60`–`144`.
- `index.ts:273`–`410` cited for the dispatch switch → the switch opens at `index.ts:314`
  (`switch (params.op)`), closes at `index.ts:410`.
- `index.ts:367` cited for the backlog option whitelist → `index.ts:369`.
- `README.md:37` cited for the README ops line → the list spans `README.md:36`–`37`.

Impact: R2 and R3 read these lines as the change's evidence, and rule 11a's
re-tick mechanics assume stable anchors. Cheap fix: re-cite from the pinned commit.

### P2 — the rendered commands row reorders silently, and no Done-When catches it (should · open)

`lib/help.mjs:25` renders
`/cdd-init · /cdd-new · /cdd-validate · /cdd-status · /cdd-archive · /cdd-help`.
The plan derives `COMMANDS` as "the 5 slash commands in registration order", and
registration order is init (`index.ts:220`), new (`232`), status (`251`), help
(`264`), archive (`274`) — so the derived row reads
`/cdd-init · /cdd-new · /cdd-status · /cdd-help · /cdd-archive`, swapping
`archive` and `help`. That is a user-visible /cdd-help change not named in
`## What Changes` (which lists the ghost removal and the two doc corrections only),
and it is unpinned: S21's needle list (`tests/smoke.mjs:333`) pins the ops row, not
the commands row (no test pins the commands row at all), and DW1's "exactly 5
registered slash commands equal the derived commands row" compares the row to its
own source without stating an order expectation.

Consequence: the proposal's "Behavior-preserving for all 9 ops" line is true for
dispatch and false for the rendered commands row, and the change can go fully green
while reordering it. Fix: pin the expected commands row verbatim (in the acceptance
pin or S21), or disclose the order change as intended and pin it either way.

### P3 — the gate record's claim counts are undercounts (should · open)

`cdd/changes/ops-registry/tasks.md` §2.1 (T1) and `design.md` `## Alternatives`
both say "5 living requirements claim lib/help.mjs, 4 claim tests/smoke.mjs". At
`4afb08b` the living spec claims `lib/help.mjs` in 6 requirements
(`cdd/specs/gherkin/spec.md` Code lines 286, 344, 380, 402, 913, 1289) and
`tests/smoke.mjs` in 8 (Code lines 149, 216, 344, 844, 913, 1244, 1267, 1402).
5 is the count that belongs to `index.ts` in the extension spec.

The T1 YES verdict is unaffected — the cross-capability fact is stronger than
recorded — but the numbers are the gate record's own evidence, and the same wrong
figure is repeated in the design document's rejection of the help.mjs home.
Fix: correct both places.

### P4 — design.md Boundaries forbid what the plan does (should · open)

Two boundary lines contradict the plan and the code they describe:

- "Extension entry (index.ts) … It must not restate any op name, doc text, or
  parameter list the registry owns" (`design.md` `## Boundaries`) versus
  `proposal.md`: "the dispatch switch stays literal — one case per registry op".
  `case "init":` at `index.ts:315` restates an op name, and DW1 deliberately pins
  those literals by scanning them. One of the two must give.
- "Help screen (lib/help.mjs) … It must not hold an op or command literal" — already
  false at HEAD and untouched by this change: `lib/help.mjs:13` holds
  `/cdd-archive <name>` and `lib/help.mjs:14` holds `/cdd-status`; only the two
  "Commands and tools" rows at `lib/help.mjs:25`–`26` are derived.

A boundary that is false at rest invites an implementer to widen the change (derive
the phase-step and tip rows too) or to leave the document wrong. Fix: state the
boundary the plan actually enforces, e.g. "no op or command literal in the two
"Commands and tools" rows", and admit the literal dispatch switch as the one
deliberate restatement, with its reason.

### P5 — "No new ADR" is asserted, not argued against rule 12 and ADR-0013 (should · open)

`## Non-Goals` fences out a decision record: "No new ADR (the decision follows
ADR-0009's recorded pattern; no new architecture bet is made)". Rule 12
(`cdd/rules.md`) routes decisions that are hard to reverse, surprising without
context, involve a real trade-off, and cross capabilities to `cdd/decisions/`.
The registry-home decision plausibly meets that test: the table sits in extension
territory specifically because `lib/help.mjs` is gherkin-claimed (a fact invisible
from the code), three shapes were traded off, and the split of table from literal
dispatch switch is exactly what a future reader will question.

The precedent is direct and in-repo: ADR-0013, minted by the sibling change
`cdd/archive/20261024-claim-map/`, records precisely such a home decision — "this
decision rules the home of the claim derivation". T2 NO answers "is this an
architecture bet?", which is a different question from rule 12's four criteria.
Fix: mint the small ADR the precedent implies, or record in the proposal why the
four criteria fail here.

### N1 — one half of DW2 is not an exit-code check (note · open)

Rule 3 wants each Done-When criterion to be an observable check. DW2's
"`node tests/smoke.mjs` exits 0" qualifies; "git diff shows no smoke check deleted"
is a diff reading. Acceptable as human judgment if labelled, but a needle-count or
check-count assertion in the pin would make it mechanical.

### N2 — the row shape carries both `was` and `aliases`, and only the pin reads `was` (note · open)

`## What Changes` gives rows `{ name, was, aliases, description, parameters }`,
and `OP_ALIASES` deliberately keeps all 7 legacy names (three map to `new`:
`cdd_new_change`, `cdd_new`, `new_change` at `index.ts:147`–`155`). No listed
derivation reads `was` — `OP_ALIASES` comes from the alias data — so `was` is
documentation only, pinned solely by DW1. Either it earns its place (state what it
is for) or it folds into `aliases`.

### N3 — "never grew with the backlog" is not what the row shows (note · open)

`proposal.md` `## Why`, second bullet: "the row was born at six ops and never grew
with the backlog, adrs, and reconfirm ops (adrs and reconfirm missing). The
rendered row does list `backlog` (`lib/help.mjs:26`); it is missing `adrs` and
`reconfirm` only. History agrees with the row, not the sentence: the row arrived
with `8936460` ("feat(tools): merge the five cdd_* tools into one lean op-dispatch
tool") and has not changed since.

### N4 — existing agreement pins are not named in `## Solutions Considered` (note · open)

`tests/tools.mjs` already pins four of the surfaces this change re-sources: op-enum
length 9 (`tests/tools.mjs:72`), command count 5 (`:74`), the ≤900-char declaration
budget (`:78`–`79`), and description-vs-`OPS_DOC` non-duplication (`:82`–`83`).
DW3 keeps them green unmodified, so this is not duplication — but naming them as
the pins the new agreement invariant extends (rather than replaces) would make the
reuse-first search visible where the reader looks for it.

## Disposition

All nine findings are `open`; none was disposed by the author at review time.

**0 blocker · 5 should · 4 note.** No open blocker — the loop is not stopped at R1.
P1, P3 and P5 are editing work in the proposal/design/tasks record; P2 and P4 change
what the implementation pins or claims and are the two worth settling before R2
reads the deltas.

## Dispositions (author, post-review)

- P1 fixed: — every premise line anchor re-verified by grep and re-cited
  (ghost row `lib/help.mjs:25`; ops row `:26`; commands `index.ts:220` init,
  `:232` new, `:251` status, `:264` help, `:274` archive; enum `:306`;
  `OPS_DOC` `:60–144`; switch `:314`–`:410`; backlog whitelist `:369`;
  README row `README.md:36–37`). proposal.md now carries those.
- P2 fixed: — the registration-order commands row (init, new, status, help,
  archive) differs from the old rendered row; the proposal discloses the
  before/after rows verbatim in What Changes, DW1 pins the rendered row
  verbatim, and the acceptance pin asserts it verbatim.
- P3 fixed: — claim counts corrected to the grep-verified 6 requirements
  claiming lib/help.mjs (`:286, :344, :380, :402, :913, :1289`) and 8
  claiming tests/smoke.mjs (`:149, :216, :344, :844, :913, :1244, :1267,
  :1402`); tasks §2.1 and design.md Alternatives updated.
- P4 fixed: — index.ts boundary now "must not restate any op *list*" with
  the literal `case "…":` labels admitted as the one deliberate keyed
  restatement (T3e source-scans them); lib/help.mjs boundary now scopes to
  the two registry-derived rows, leaving the loop-law tip (/cdd-status)
  untouched.
- P5 won't-fix: — no ADR for the registry home: the four-criterion test
  fails it (a reversible one-move refactor, claim topology visible via
  `cdd adrs --code lib/help.mjs`, placements cheap to revisit, no
  capability boundary crossed — gherkin delta + extension delta co-own the
  file by claim-count necessity, not opinion). Argued in proposal Non-Goals.
- N1 fixed: — DW2's diff half is now "git diff main -- tests/smoke.mjs
  shows zero deleted check( lines".
- N2 fixed: — `was` provenance stated in What Changes (MAINTENANCE.md names
  OPS_DOC the authoritative record of the five-tool originals).
- N3 fixed: — Why bullet now says the ops row "arrived with 8936460, grew
  only once (backlog), never for adrs/reconfirm".
- N4 fixed: — Solutions Considered names the four existing pins
  (tests/tools.mjs:72/:74/:78–83) as kept-and-extended, not replaced.

No open blocker, no open should. Remaining note-level work rode the same
edits. The reviewer's summary of claim counts (5/4) predates the grep
verification; the 6/8 numbers above are the corrected record.
