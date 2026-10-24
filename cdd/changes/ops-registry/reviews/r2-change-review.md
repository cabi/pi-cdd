# R2 change review — ops-registry

- **Form:** cold sub-agent (rule 2b, launch form). This session read only `reviews/brief-r2.md` as briefing material plus the paths it lists; it did not write any artifact under review.
- **Family evidence:** invocation `pi -p --no-session`, `PI_PROVIDER=opencode-zen`, `PI_MODEL=deepseek-v4.1-flash`, `PI_REASONING_LEVEL=high` (`PI_SUBAGENT_NAME=ops-registry-runner`, session `01a16eb5-5804-73eb-9c7d-3639e010631f`). Author family: zai/glm-5.3. The two differ.
- **State:** HEAD `4afb08b`, branch `ops-registry`, `cdd/changes/ops-registry/` the only untracked path. Draft validate green (context of the gate, not a review result); `node scripts/spec-drift.mjs` currently RED with six `[L1] … pins "tests/acceptance/ops-registry.test.js" but that file does not exist` lines — expected, since the pin file is a group-3 artifact.
- **Read:** `proposal.md`, `design.md`, `specs/extension/spec.md`, `specs/gherkin/spec.md`, `tasks.md`, living `cdd/specs/extension/spec.md`, living `cdd/specs/gherkin/spec.md`, `cdd/rules.md`, `index.ts`, `lib/help.mjs`, `lib/loop-law.mjs`, `tests/tools.mjs`, `tests/smoke.mjs`, `scripts/spec-drift.mjs`.

## Summary

Five `should`, five `note`, no blocker. The delta shape is right: both MODIFIED requirements restate the full living text, every scenario ends with a pin, `Verified by` targets exist as files or are the declared new pin, and the tasks table traces each Done-When to task ids. The mechanism (one data module, every consumer derives) matches the repo's own ADR-0009 cure and the existing `lib/loop-law.mjs` precedent.

Where it is weak: the design's one hard boundary — what `index.ts` and `lib/help.mjs` may still restate — is justified with two claims the code does not support, and it leaves one restatement (the tool description's nine-op prose) unnamed; and one delta scenario states a refusal behavior that two of the nine ops cannot produce. `tasks.md` 3.5 contradicts the design's own scoping of that boundary.

## Findings

### F1 — `tasks.md` 3.5's Done-when contradicts the design's boundary and cannot be met as written · `should` · evidence `cdd/changes/ops-registry/tasks.md:3.5`, `cdd/changes/ops-registry/design.md:47-51`, `lib/help.mjs:13`, `lib/help.mjs:14`, `lib/help.mjs:31` · `open`

Task 3.5 says `lib/help.mjs` will have "no op or command literals left in the file". The design deliberately scopes the ban to the two derived rows: "It must not hold an op or command literal *in those two rows*; loop-law prose mentions of commands elsewhere in the screen (e.g. the /cdd-status tip) are loop-law content … and stay out of scope." Three such literals live outside those rows — `lib/help.mjs:13` (`/cdd-archive <name>`), `:14` (`/cdd-status`), `:31` (`/cdd-init first`) — so 3.5 as written is unachievable without deleting prose the design says to keep. An implementer obeying 3.5 edits past the boundary; one obeying the design leaves 3.5's Done-when false.

### F2 — the design's justification for leaving those literals cites a source that does not supply them · `should` · evidence `cdd/changes/ops-registry/design.md:49-51`, `lib/help.mjs:5-14`, `lib/loop-law.mjs:170`, `lib/loop-law.mjs:194` · `open`

Design.md:49-51 says the command mentions outside the two rows "are loop-law content sourced from `lib/loop-law.mjs`". They are not: `lib/help.mjs:5` opens `HELP_LINES` and `:13`/`:14` are literal strings inside it. `lib/loop-law.mjs` exports `helpReviewTip` (`:170`) and `helpIndependenceLine` (`:194`), consumed at `lib/help.mjs:11` — nothing supplies the `/cdd-archive` or `/cdd-status` mentions. The exemption is defensible on its own terms ("these are instructional prose, not the surfaced list"), but the stated reason is factually wrong, and it is the reason a future reader will rely on when deciding whether a fourth `/cdd-status` mention is in scope.

### F3 — the case-label exemption is attributed to a test that constrains one label, not the set · `should` · evidence `cdd/changes/ops-registry/design.md:43-46`, `tests/tools.mjs:249-254` · `open`

Design.md:43-46 makes the literal `case "…":` labels "the one deliberate restatement", "required literal by the T3e source scan". The only source scan in the suite is `tests/tools.mjs:251` (`src.split('case "status":')[1].split('case "')[0]`), which requires exactly that one label to be literal so it can count `status(` calls. No existing test requires the other eight labels to be literal, and no test constrains label multiplicity — that is created by the new pin. The design is choosing an exemption, not describing a constraint it inherits; saying otherwise makes the exemption look obligatory when it is a trade-off the design made.

### F4 — `index.ts` still restates an op list in prose, and the boundary says it may not · `should` · evidence `cdd/changes/ops-registry/design.md:41-43`, `index.ts:302`, `tests/tools.mjs:77-83`, `cdd/changes/ops-registry/tasks.md:3.4` · `open`

Design.md:41-43: "It must not restate any op *list* — no enum array, no doc text, no parameter table, no alias map the registry owns." `index.ts:302` is a 558-character tool description that walks all nine ops one by one ("init scaffolds…, new scaffolds…, … help lists per-op params") — per-op doc text, hand-maintained, and untouched by task 3.4, whose scope is enum, `OPS_DOC`/`OP_ALIASES` imports and whitelists. `tests/tools.mjs:77-83` pins only a ≤900-char budget and four forbidden duplicate fragments, not agreement with the registry. So the boundary is false at the moment it is written, and nothing in the change makes it true; an op added later still needs a prose edit at `index.ts:302` that no pin checks.

### F5 — the refusal scenario and the whitelist probe cannot hold for `status` and `help` · `should` · evidence `cdd/changes/ops-registry/specs/extension/spec.md:30-34`, `cdd/changes/ops-registry/tasks.md:3.2`, `index.ts:346-348`, `index.ts:403-405`, `index.ts:99` · `open`

The delta's "Scenario: An undocumented option refuses with the registry's allowed list" states that running "an op with an option the op's registry row does not declare" yields "exactly 1 error … the allowed list equals the registry row's parameter keys", and 3.2 requires this "probed through the real execute with an unknown option" for the per-op whitelists. `execute` ignores `options` for `status` (`index.ts:346-348`: the case body is a single `status()` call plus `result`, no `parseOptions`) and for `help` (`:403-405`: returns `OPS_DOC`). Both return success for an unknown option, so the invariant is untestable by the stated probe for 2 of 9 ops; for `status` the row's whitelist is empty by construction (`index.ts:99`: `properties: {}`), i.e. structural, not probed. Either the scenario scopes itself to the seven `parseOptions`-owning cases, or `status`/`help` gain `parseOptions(params.options, [])` so the refusal is real.

### F6 — the `was` field is contractual only in a Done-When line · `note` · evidence `cdd/changes/ops-registry/proposal.md:150`, `cdd/changes/ops-registry/specs/extension/spec.md:7`, `index.ts:62`, `index.ts:74`, `index.ts:84`, `index.ts:96`, `index.ts:101` · `open`

DW1 requires "the was fields ride exactly the five original tools". The field is real (`index.ts:62/74/84/96/101`, exactly five rows) and is the provenance `MAINTENANCE.md` relies on, but the delta's registry prose (`specs/extension/spec.md:7`) enumerates "name, full documentation, legacy aliases, and parameter schema" — no `was` — and no scenario names it. The pin will test a property the spec does not state; a future editor trimming "unused" fields would have nothing to contradict them.

### F7 — DW2's no-deletion clause has no requirement text · `note` · evidence `cdd/changes/ops-registry/proposal.md:151`, `cdd/changes/ops-registry/specs/gherkin/spec.md:24-28` · `open`

DW2 requires "`git diff main -- tests/smoke.mjs` shows zero deleted `check(` lines". The gherkin scenario covering that file ("The smoke suite pins the rendered rows") asserts that the needle list carries the registry-derived ops row and that the ghost is asserted absent — it says nothing about other `check()` blocks surviving. The scenario is weaker than the Done-When it is supposed to discharge.

### F8 — "two observed defects" introduces three · `note` · evidence `cdd/changes/ops-registry/proposal.md:26`, `lib/help.mjs:25`, `lib/help.mjs:26`, `index.ts:108`, `index.ts:369` · `open`

The motivating sentence reads "Six copies of one list, two observed defects, one enshrined by a test." The four bullets beneath it document three distinct defects: the ghost `/cdd-validate` (`lib/help.mjs:25` vs the five registrations), the ops row missing `adrs`/`reconfirm` (`lib/help.mjs:26`), and the undocumented `premise` option (`index.ts:369` whitelist vs `index.ts:106-120` doc row, described in prose only at `index.ts:108`). The count is a stale leftover; it sits in the one sentence that has to be exact, since it is the change's reason to exist.

### F9 — the registry prose claims derivation of the slash command list; registration stays literal · `note` · evidence `cdd/changes/ops-registry/specs/extension/spec.md:7`, `cdd/changes/ops-registry/design.md:43-46`, `index.ts:220`, `index.ts:232`, `index.ts:251`, `index.ts:264`, `index.ts:274` · `open`

The requirement says "every consumer derives — … and the door-1 slash command list". Read as the help row, that is what the change does. Read as the command surface, it is not: five `pi.registerCommand("cdd-…")` calls stay hand-written (`index.ts:220/232/251/264/274`), and the new pin's "exactly 5 in registration order" check compares those literals against `COMMANDS` — drift detection, not derivation. The design likewise names only the case labels as its deliberate restatement, so this second one goes unlisted. One sentence naming registration as retained-literal (or a loop over `COMMANDS`) would settle which reading is meant.

### F10 — the gherkin scenarios pin a file the gherkin Code line does not claim · `note` · evidence `cdd/changes/ops-registry/specs/gherkin/spec.md:16`, `:22`, `:28`, `cdd/changes/ops-registry/specs/extension/spec.md:43` · `open`

All three gherkin scenarios pin `tests/acceptance/ops-registry.test.js`, but the gherkin delta's Code line is `lib/help.mjs, tests/smoke.mjs`; the pin file is claimed only by the extension delta (`specs/extension/spec.md:43`). This is legal — `checkL1`/`checkO` (`scripts/spec-drift.mjs:412`, `:628`) only require pins to exist and a file to have one claiming capability — but the acceptance file for gherkin behavior sits under an extension claim, so "which requirement owns this test" resolves to the wrong capability when someone later moves the renderer.

## Coverage notes

- **Coherence:** requirement prose ↔ scenarios ↔ pins line up in both deltas; both MODIFIED restatements are complete against the living text (`cdd/specs/extension/spec.md:7`); the gherkin requirement is genuinely ADDED (no living duplicate). Tasks trace every Done-When to ids, and each implementation subtask carries a `verify by`.
- **Design gate:** `design.md` is C4 Component with the mandated four sections and a mermaid `flowchart` whose nodes carry `Component:` labels; the T1/Y-T2/N/T3/T4 records live in `tasks.md` 2.1 as rules 2c asks.
- **Mechanism:** one data module consumed by declaration, payload, aliases, whitelists and rows is the right deep-module shape for this codebase, and `lib/ops.mjs` avoids the `lib/help.mjs` capability-claim problem the proposal describes. No new dependency, no new interface.
- **Deliberate non-changes checked and accepted:** no `README.md` line (drift is real — `README.md:36-37` lists seven of nine — and is explicitly fenced out), no `scripts/` or door-script change, no ADR (proposal argues the four criteria rather than asserting them).

## Reviewer self-check

- Every finding quotes the sentence it contradicts and cites the line it was checked against; nothing was recorded as `fixed`.
- The RED guard and the draft-green state are labelled as context; no finding depends on a command I did not run.

## Dispositions (author, post-review)

- F1 fixed: — tasks 3.5 reworded: the no-literal ban now scopes to "the two
  derived rows", with the instructional command mentions in other rows
  explicitly kept. The Done-when is now achievable exactly as the design
  scopes it.
- F2 fixed: — design.md's help-screen boundary no longer claims the
  command mentions are sourced from lib/loop-law.mjs; it now states what
  they are (literal instructional prose inside HELP_LINES rows that are
  not the two registry rows) and names the two exports that ARE
  loop-law-sourced (helpReviewTip, helpIndependenceLine).
- F3 fixed: — design.md now says only `case "status":` is required literal
  (T3e's source scan splits on it); the other eight stay literal by
  choice, and the multiplicity invariant is created by the new agreement
  pin, not inherited.
- F4 fixed: — the design's index.ts boundary now names THREE deliberate
  literal restatements (case labels, registerCommand calls, declaration
  description prose) instead of claiming none exist. The description stays
  byte-identical per the behavior-preserving fence, and the acceptance pin
  (tasks 3.2) gained "the declaration description names every registry op"
  so a future tenth op cannot land with a stale description unchecked.
- F5 fixed: — the delta scenario now scopes the refusal probe to ops that
  declare options ("an op that declares options, carrying an option its
  registry row does not declare"); tasks 3.2 probes the seven
  option-owning ops through real execute and asserts status/help
  structurally (their rows declare no options; their dispatch cases call
  no parseOptions). Keeping status/help option-silent (ignore, not refuse)
  preserves the documented five-tool behavior — cdd_status never had
  options to reject.
- F6 fixed: — the delta's registry prose now enumerates the `was`
  five-tool provenance marker in the row shape, and the "registry
  documents every op" scenario gained "And each of the five five-tool
  originals carries its was provenance marker".
- F7 fixed: — the gherkin scenario "The smoke suite pins the rendered
  rows" gained "And the check is updated in place — no smoke check is
  deleted", so the requirement text now covers DW2's no-deletion clause.
- F8 fixed: — "two observed defects" → "three observed defects" in
  proposal.md (ghost, missing adrs/reconfirm, undocumented premise).
- F9 fixed: — the delta prose now reads "the door-1 slash command list the
  help screen renders (the five registerCommand calls stay literal in
  index.ts; the agreement pin detects drift between them and the
  registry)", and design.md names the registerCommand calls as deliberate
  restatement #2 with the loop-over-COMMANDS alternative rejected (each
  command has its own description and handler; a loop would push UI code
  into the data module).
- F10 won't-fix: — one acceptance file, one owning capability (checkO
  forbids two); the file centers on the registry (an extension surface),
  so the extension delta owns its claim. Pins crossing capability lines is
  the store's existing shape (every "Thin ops" scenario pins
  tests/tools.mjs while gherkin requirements pin tests/smoke.mjs); the
  gherkin delta's three scenarios pin the render behaviors the same file
  exercises, and the guard resolves the file's owner deterministically.
  If the renderer ever moves, the guard's L1 red — not ownership intuition
  — forces the pin edit.

No open blocker, no open should, no open note requiring action beyond the
recorded won't-fix. All fixes landed before the first implementation task
ticks.
