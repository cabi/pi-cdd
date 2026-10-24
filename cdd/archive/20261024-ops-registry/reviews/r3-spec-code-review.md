# R3 spec-axis code review — ops-registry

## Reviewer form and family

- **Form:** cold one-shot reviewer, fresh session, not the author's session (loop-law
  rule 2b satisfied — neither the artifacts nor the code under review were authored
  here).
- **Invocation:** launched as a fresh one-shot sub-agent session
  `PI_SUBAGENT_ID=97d53975-a7a3-4997-95ba-7c19074cbdda`, session
  `01a16ecc-5052-735a-a2a2-9a8b0d73f3c0`, task agent `ops-registry-runner`. Variance
  from the brief's expected literal `pi -p --no-session` form: the harness ran this
  review as an isolated fresh session with no prior context instead of a
  `pi -p` process. Cold either way; recorded rather than silently normalized.
- **Model family evidence (from runtime env):** `PI_PROVIDER=opencode-zen`,
  `PI_MODEL=deepseek-v4.1-flash`, `PI_REASONING_LEVEL=high` → family **DeepSeek**.
  Author family per the brief: **zai/glm-5.3**. Families differ, so the
  different-family requirement holds.
- **Pinned state:** branch `ops-registry`, HEAD `4afb08b` **plus this change's
  uncommitted implementation in the working tree** — modified `index.ts`,
  `lib/help.mjs`, `tests/smoke.mjs`; untracked `lib/ops.mjs`,
  `tests/acceptance/ops-registry.test.js`. `tests/tools.mjs` unmodified
  (`git status --short` confirms).
- **Axis:** Spec only. Standards conformance is the other session's brief; nothing
  below judges conventions.

## Method

Read the two deltas, the proposal, tasks, the `git diff 4afb08b -- index.ts lib/help.mjs
tests/smoke.mjs` hunks and both untracked files at the pinned state, then ran the pins
as-is and again in throwaway copies of the tree under `/tmp` (`/tmp/r3mut`…`/tmp/r3mut7`)
with one deliberate regression each. The repo working tree was never modified; the only
file written by this session is this one.

Baseline at the pinned state: `node tests/acceptance/ops-registry.test.js` → `9 ok, 0 FAIL`;
`node tests/smoke.mjs` → `37/37 passed`; `node tests/tools.mjs` → `18 passed, 0 failed`.

## Scenario walk

Extension delta (`cdd/changes/ops-registry/specs/extension/spec.md`):

| scenario | THEN traceable to | pin as written |
| --- | --- | --- |
| status delivers one document in two shapes | no diff hunk (pre-existing `lib/status.mjs` + `index.ts` status case) | `tests/tools.mjs` unchanged — see F5 |
| archive refusal carries verdict and stage | no diff hunk (pre-existing `archiveChange` stage path) | `tests/tools.mjs` unchanged — see F5 |
| the registry drives every op surface | `lib/ops.mjs:20` `OPS`, `:130` `COMMANDS`, `:132` `OP_NAMES`, `:134` `OPS_DOC`, `:139` `OP_ALIASES`, `:142` `optionKeys`; `index.ts:202` enum, `index.ts:211`–`303` cases, `index.ts:299` help case; `lib/help.mjs:26`–`27` | OR1–OR6, OR8 (`tests/acceptance/ops-registry.test.js:83`–`159`, `:172`–`187`) hold for equality/one-each; additive holes in F2 |
| an undocumented option refuses with the registry's allowed list | `index.ts:89`–`103` `parseOptions` + the seven derived whitelists (`index.ts:212`/`225`/`234`/`246`/`265`/`287`/`293`) | OR4 (`:119`–`138`) pins it — verified red when the backlog whitelist was re-literalised without `premise` |
| the registry documents every op it dispatches | `lib/ops.mjs:20`–`127` rows, backlog `premise` at `:91`, help row `:122`; `index.ts:299`–`303` | OR9 (`:191`–`213`) pins presence, `was` markers exactly; not exact key equality — F3 |

Gherkin delta (`cdd/changes/ops-registry/specs/gherkin/spec.md`):

| scenario | THEN traceable to | pin as written |
| --- | --- | --- |
| the help rows equal the registry render | `lib/help.mjs:26`–`27` (both rows now template `COMMANDS`/`OP_NAMES`) | OR7 (`:163`–`170`) — membership, not equality: F2, F4 |
| the rendered help text carries no ghost command | `lib/help.mjs:26` derives the row (ghost `/cdd-validate` gone); `tests/smoke.mjs:336` asserts absence | OR8 (`:172`–`187`) pins `/cdd-validate` and every `/cdd-*` token — F2 for non-`/cdd-` tokens |
| the smoke suite pins the rendered rows | `tests/smoke.mjs:329`–`337` updated in place (9-op needle at `:333`, ghost assertion at `:336`, 0 deleted `check(` lines) | **no pin** — F1 |

## Findings

### F1 — `should` — the gherkin "smoke suite pins the rendered rows" scenario has no pin in the file the delta names

The scenario's `# Verified by: tests/acceptance/ops-registry.test.js`, but that file
never reads `tests/smoke.mjs`: its nine checks (OR1–OR9,
`tests/acceptance/ops-registry.test.js:83`–`213`) all load `lib/ops.mjs`, `index.ts`,
and `lib/help.mjs` only. The scenario's two THEN halves therefore live entirely in
code that no pin observes:

- needle list carrying the 9-op row — `tests/smoke.mjs:333`;
- the ghost-absence assertion — `tests/smoke.mjs:336`.

Deleting `tests/smoke.mjs:336` and reverting the needle at `:333` to the stale 7-op
row leaves all nine OR checks and the acceptance file green; only `node tests/smoke.mjs`
itself would notice, and nothing asserts that smoke's S21 still contains those lines.
The "no smoke check is deleted" half is held solely by the one-off `grep -c "^-.*check("`
recorded in `cdd/changes/ops-registry/tasks.md:24` (tick 3.5 evidence), which is run-time
evidence, not a pin.

The shape the delta asks for already exists in-tree as precedent:
`tests/acceptance/review-wiring.test.js:218`–`221` (RW15) reads `tests/smoke.mjs` as
source and `includes()`-asserts its needles. Evidence: absence of any `smoke` reference
in `tests/acceptance/ops-registry.test.js:1`–`215`.

### F2 — `should` — additive drift in the two rendered rows and in the rendered slash-command set stays green

Gherkin scenario 1's THEN is *equality* of both rows ("equals the slash-prefixed join of
the exactly 5 registered commands in registration order", "equals the join of the exactly
9 registry op names"), and the requirement's third clause is "the plain render names no
command the extension does not register". The pins test membership:

- `tests/acceptance/ops-registry.test.js:168`–`169` assert
  `text.includes(opsRow)` / `text.includes(commandsRow)` — a superstring of the derived
  row satisfies them;
- `tests/acceptance/ops-registry.test.js:180`–`185` (the registry-independent half) only
  requires each *declared* op to appear in the rendered row — extra rendered elements are
  unexamined;
- `tests/acceptance/ops-registry.test.js:176` iterates `text.match(/\/cdd-[a-z-]+/g)`, so a
  rendered slash token that does not start with `/cdd-` is never checked against the
  registered set.

Scratch evidence (repo untouched, copies under `/tmp`):

- `/tmp/r3mut`: `lib/help.mjs` rows rendered as `/${COMMANDS.join(" · /")} · /cdd-help`
  and `… ${OP_NAMES.join(" · ")} · bogus` → `9 ok, 0 FAIL`, smoke `37/37 passed`.
- `/tmp/r3mut6`: commands row gains ` · /new-helper` (unregistered, not `/cdd-` prefixed)
  → `9 ok, 0 FAIL`, smoke `37/37 passed`.

Controls that do fire, so the pins are not inert: reversing `OP_NAMES` in the render makes
OR7 fail; a duplicate `case "dump":` label makes OR3 fail; dropping `was` from the status
row makes OR9 fail; re-literalising the backlog whitelist without `premise` makes OR4 fail.

### F3 — `should` — the help payload's key set is pinned only by containment, so an extra doc entry survives

Extension scenario 5's THEN is "they equal the registry's op names exactly". OR9
(`tests/acceptance/ops-registry.test.js:191`–`213`) asserts each registry op name appears
in `textOf(res)` and checks the `was` markers and the backlog `premise` option, but never
compares the payload's key set (the payload object is even returned as `details`,
`index.ts:302`, yet only the text is read).

Scratch evidence: `/tmp/r3mut7` makes the help case render and return
`{ ...OPS_DOC, dump: { description: "ghost op" } }` → `9 ok, 0 FAIL`. "Exactly" is
therefore not held on that surface; every other surface's "nothing extra" clause is
(OR2 JSON equality, OR3 label multiset, OR4 allowed-list string, OR1 `OPS_DOC` keys).

### F4 — `note` — the rows are pinned as rendered strings, not as derivations

The requirement says the rows "render from the op registry". OR7 compares the rendered
text to the derived string, so a renderer that hardcodes an identical row is
indistinguishable from one that derives it: `/tmp/r3mut2` replaces both rows in
`lib/help.mjs:26`–`27` with the literal strings → `9 ok, 0 FAIL`, smoke `37/37 passed`.
Behaviourally equivalent, so this is recorded for the archive record rather than raised
against the change.

### F5 — `note` — two of the five extension scenarios ride no diff hunk, by design

The status-two-shapes and archive-refusal scenarios are pinned by `tests/tools.mjs`, which
this change leaves untouched (task 3.6 evidence: `18 passed, 0 failed`; `git status` shows
no `tests/tools.mjs` modification). Their THENs are traceable to unchanged pre-existing
code, not to a hunk in this diff. This matches the proposal's "Behavior-preserving for all
9 ops" and its Non-Goal "No `tests/tools.mjs` change expected"; charter item 1's "traceable
to a code change" is therefore read as satisfied by unchanged code plus unchanged pin.

### F6 — `note` — residue of the `nameParam`/`capsParam` move

`index.ts:49` keeps the comment `// plain JSON-schema parameters — no typebox import, zero
resolution risk` followed by three blank lines, while its subject moved to
`lib/ops.mjs:10`–`15`. The comment now heads nothing. Reported under charter item 3 only
because it is the leftover half of a diff hunk; the substance is hygiene and belongs to the
Standards axis's judgement if it takes it.

### F7 — `note` — one hand-maintained op list remains, disclosed

`README.md:36`–`37` still lists seven of nine ops. The delta does not claim README as a
surface and `cdd/changes/ops-registry/proposal.md` records it as a Non-Goal, so this is not
a spec break; noted so the archive record carries the known remaining restatement.

## Dispositions

All findings above are `open`. Nothing here is a verdict: strict validation, the guard,
and the human keep gate authority.

## Dispositions

- **F1 — fixed:** new OR10 reads `tests/smoke.mjs` as source and asserts both rendered-row needles and the ghost-absence assertion text (the RW15 source-pin precedent), so scenario 3's THEN halves are pinned in the file the delta names.
- **F2 — fixed:** OR7 upgraded from `includes()` membership to exact-line equality for both rows; OR8's registry-independent half upgraded from subset to set equality (rendered row == declaration enum). Negative control (repo untouched, /tmp copy): appending `· bogus` to either rendered row → OR7 and OR8 both red.
- **F3 — fixed:** OR9 now asserts `res.details` deep-equals the registry's `OPS_DOC` exactly. Negative control: help case returning `{ ...OPS_DOC, dump: … }` → OR9 red.
- **F4 — fixed:** OR10 also source-pins the derivation (`lib/help.mjs` must contain `COMMANDS.join` and `OP_NAMES.join`). Negative control: both rows re-literalised with byte-identical strings → OR10 red, closing the equivalence hole.
- **F5 — won't-fix:** matches the proposal's Non-Goal ("No `tests/tools.mjs` change expected"); the two scenarios' behavior preservation is held by the unchanged suite (18/18 at the pinned state).
- **F6 — fixed:** same hunk as standards-F5 (dangling comment + blank run deleted from `index.ts`).
- **F7 — won't-fix:** README's op list is a recorded proposal Non-Goal; pre-existing restatement, disclosed in the archive record.

Post-fix state: `node tests/acceptance/ops-registry.test.js` → `10 ok, 0 FAIL`; `npm test` exit 0 (38/38 node-test, 37/37 smoke, 18/18 tools); strict validate `PASS`; guard clean. All mutation controls ran in throwaway /tmp copies; the repo tree was never mutated by a control.
