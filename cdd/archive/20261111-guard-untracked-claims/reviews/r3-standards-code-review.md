# R3 Standards code review — 20261111-guard-untracked-claims

## Independence

- Reviewer: cold sub-agent session (did not author this change), model
  `opencode-go/deepseek-v4.1-flash` @ thinking high — family DeepSeek.
- Author: `zai/glm-5.3` — family zai/GLM. Different family: independence holds.
- Review state: the whole change is **uncommitted** in the working tree at HEAD
  `adf4561`. Lens: Standards only (`MAINTENANCE.md`, `GLOSSARY.md`,
  `cdd/rules.md`, smell baseline). Spec-axis concerns are out of scope and
  were not reranked; `reviews/r3-spec-code-review.md` is the other axis.
- Surfaces read from disk: `scripts/spec-drift.mjs`, `cdd/scripts/spec-drift.mjs`,
  `tests/acceptance/guard-file-universe.test.js`, `scripts/adr-index.mjs`,
  `lib/adr-ops.mjs` (consumer), `cdd/backlog.md`, the change package.

Verdict: no blocker. Five findings, one `should`, four `note`. The code is
minimal (13 added lines + 2 call-site swaps per copy), the store copy is
byte-identical, the gather-once / single-derivation laws (ADR-0013) hold, and
nothing new is dependency-bearing (ADR-0001). Every finding is a naming or
truth-in-documentation gap the change is the right moment to close.

## Findings

### F1 — should — the shared builder still names the claim universe "tracked"

- **Finding.** `buildClaimMap` is now fed a mode-bound universe that includes
  not-ignored untracked files, but its parameter, its derived-set names, and
  its contract JSDoc all still say *tracked*. Three names now denote one set:
  *claim universe* (the delta requirement), *claimFiles* (the new fact),
  *tracked* (the builder parameter and its docs). `GLOSSARY.md:3` makes one
  canonical term per concept a house rule, and this is the module every
  consumer reads the concept from. The delta's MODIFIED requirement already
  restates the input as "the caller's claim universe — the tracked file list
  for the tool ops, the mode-bound universe for the guard", so the module's own
  documentation is the last surface still contradicting the new law.
- **Evidence.**
  - `scripts/spec-drift.mjs:263` — `tracked: claimFiles,` (untracked-inclusive
    list handed to a parameter named `tracked`).
  - `scripts/adr-index.mjs:140` — `export function buildClaimMap({ specs = [], adrIndex = [], tracked = [] })`.
  - `scripts/adr-index.mjs:121-131` — "…and the tracked file list —", "Every set
    iterates in tracked order", "- `filesOfGlob` — glob string -> Set of tracked
    files it claims" (repeated for `filesOfSpec`, `filesOfChange`, `filesOfAdr`,
    `filesOfGlobs`), `scripts/adr-index.mjs:154` — "tracked order, like every set here".
  - Contrast `scripts/adr-index.mjs:133-135`, whose `governingFor` note already
    says "tracked and untracked paths alike" — the module knows the distinction;
    only the list-input vocabulary never caught up.
- **Disposition.** fixed — parameter, derived-set names and JSDoc now say universe/claim-universe (scripts/adr-index.mjs buildClaimMap; lib/adr-ops.mjs and the guard call site pass universe:; store copy synced, guard green). Reviewer's suggested fix: rename the parameter to
  `universe` (or `files`) and restate the JSDoc as "the caller's claim universe
  — the tracked list for the tool ops, the mode-bound universe for the guard",
  matching the delta sentence verbatim. Alternative disposition the author may
  take: state in the tasks' Close notes that the builder vocabulary is
  deliberately "tracked order = universe order" — but then F1 recurs at every
  future touch, so propose the rename.

### F2 — note — the staged branch re-runs the exact command `tracked` already ran

- **Finding.** Duplicated Code / dead parallel fact. `git ls-files` with no
  flag defaults to `--cached`, so the staged branch of the new line shells out
  for a byte-identical list that line 191 already computed; staged runs now pay
  two identical git calls for one set, and `facts.tracked` survives only as a
  topology input (its sole remaining read is the last-commit gather), which
  makes the two facts a standing data clump for the next editor to puzzle over.
- **Evidence.**
  - `scripts/spec-drift.mjs:191` — `const tracked = isRepo ? (git(['ls-files']) ?? '').split('\n').filter(Boolean) : [];`
  - `scripts/spec-drift.mjs:199-204` — `git(mode.staged ? ['ls-files', '--cached'] : ['ls-files', '--cached', '--others', '--exclude-standard'])`
  - `scripts/spec-drift.mjs:275` — the only read of `tracked` after the change:
    `for (const f of new Set([...allSpecs, ...tracked, ...adrIndex.map((a) => a.fileRel)]))`.
- **Disposition.** fixed — collapsed to mode.staged ? tracked : [...tracked, ...ls-files --others --exclude-standard]; set-equality with the old spelling verified before landing (555 files both ways, empty symmetric difference). Reviewer's suggested shape:
  drops the duplicate call: `const claimFiles = mode.staged ? tracked :
  [...tracked, ...(git(['ls-files', '--others', '--exclude-standard']) ?? '').split('\n').filter(Boolean)];`

### F3 — note — the L2 dead-glob line now under-describes its own universe

- **Finding.** The finding text at `scripts/spec-drift.mjs:540` still says
  "no **tracked** file matches". After this change the verdict fires only when
  no file of the *claim universe* matches (index + non-ignored untracked), so
  the message names a narrower set than the rule it reports. The wording is
  frozen on purpose (the proposal's Non-Goal "No message rewording"; scenario 3
  and `tests/acceptance/guard-file-universe.test.js` (UF3) pin it), so this is a
  recorded trade, not an oversight — but it leaves the guard's one
  dead-glob remedy sentence mildly untrue in a module whose messages are the
  law's human surface.
- **Evidence.** `scripts/spec-drift.mjs:540` —
  ``issues.push(`[L2] ${specRel} declares Code: ${globs.join(', ')} but no tracked file matches — fix the glob or remove the line`);``
  frozen by `cdd/changes/20261111-guard-untracked-claims/proposal.md`
  ("No message rewording") and by UF3's assertion on that literal text.
- **Disposition.** won't-fix — kept frozen per the proposal Non-Goal and UF3's pin on the untouched message; the trade is recorded here. Reviewer's options were:
  metrics/close note, or reword once the change archives
  ("but no file in the claim universe matches") together with UF3's assertion.

### F4 — note — the new gather comment's blast-radius list is incomplete

- **Finding.** The eight-line comment (the change's only prose in the guard)
  states that an untracked file "can fire no staleness verdict (L2 topology,
  A2) — only ownership (O), dead-glob (L2), change-claim (A1) answers". The
  staleness half is verifiably right, but the three-law list is not exhaustive:
  the same `claimMap` sets also drive L4's memory-claim derivation and the L2
  capability index's decision-memory exemption, so an untracked decision file
  (a new ADR authored but not yet staged) can flip a memory-claim exemption.
  Narrow, but the comment sits on the law module and reads as an exhaustive map.
- **Evidence.** `scripts/spec-drift.mjs:192-198` (the comment) versus
  `scripts/spec-drift.mjs:343-345` —
  `const globClaimsMemory = (glob, facts) => glob.startsWith('cdd/decisions/') || [...(facts.claimMap.filesOfGlob.get(glob) ?? [])].some((f) => f.startsWith('cdd/decisions/'));`
  — read at `scripts/spec-drift.mjs:350`, `:368`, `:384`, `:500`, `:505`
  (L4, `checkL4` at `scripts/spec-drift.mjs:494`).
- **Disposition.** fixed — the gather comment now reads "Only claim-set answers read the universe: ownership (O), dead-glob (L2), change-claim (A1), and L4's memory-claim exemption." Reviewer suggested:
  dead-glob, A1, and L4's memory-claim exemption — read the universe."

### F5 — note — the new suite's header re-cites the change name

- **Finding.** The house `Pins:` header form used by the sibling suites stops
  at `(gherkin delta)`; this header appends `, change
  20261111-guard-untracked-claims`, i.e. a change name in a comment — the exact
  pattern PF-24 records as the banned "Pins:" class and as having been deleted
  from a previous new acceptance suite. `tests/` is outside ADR-0012's code
  glob (PF-24's premise), so no door enforces it; it is a convention regression
  the next header sweep would have to undo.
- **Evidence.** `tests/acceptance/guard-file-universe.test.js:8-9` —
  `// Pins: ADDED "The claim universe follows the scan mode" scenarios\n// (gherkin delta, change 20261111-guard-untracked-claims).`
  against `tests/acceptance/adr-index-agreement.test.js:7`,
  `tests/acceptance/guard-adr-remedies.test.js:5` ("(gherkin delta)."),
  `tests/acceptance/adr-ops.test.js:6`; `cdd/backlog.md` PF-24.
- **Disposition.** fixed — header now reads "(gherkin delta)". Reviewer suggested:
  word deletion, matches the blessed form.

## Verified while reviewing (evidence, not findings)

- `node --test tests/acceptance/guard-file-universe.test.js` → 6 passed, 0 failed.
- `node cdd/scripts/spec-drift.mjs` → `spec-drift: clean (5 specs, 46 acceptance test files, full scan)`, exit 0.
- `npm test` → `pass 59, fail 0`.
- `cdd validate --mode strict` → PASS (3 spec-size warnings, gherkin at 54 requirements, pre-existing).
- `cmp scripts/spec-drift.mjs cdd/scripts/spec-drift.mjs` → byte-identical (ADR-0007 door-script law).
- No spec-heading or decision-id leakage into the new guard comment (ADR-0012);
  the only comment text added to `scripts/spec-drift.mjs` is the granularity
  paragraph quoted in F4.
