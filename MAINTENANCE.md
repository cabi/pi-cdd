# MAINTENANCE — the lean `cdd` tool

This repo applies the "lean tools" pass to **its own** extension surface
(no proxy, no upstream dependency): the five tools registered by `index.ts`
at baseline commit `139effd` were merged into one `cdd` op-dispatch tool with
trimmed model-facing text. Features, result payloads, and error texts are
unchanged; only what the model reads on every request shrank.

Project basis: [openspec-cdd](https://github.com/cabi/openspec-cdd) by cabi —
same author, private project, no license file; attribution lives at the top of
`README.md`.

## Matching baseline

| | five-tool version | lean version |
|---|---|---|
| commit | `139effd` (main) | this tree |
| declarations (name+desc+schema) | 1818 chars ≈ 455 tok | 665 chars ≈ 166 tok |
| registered tools | 5 (`cdd_init`, `cdd_new_change`, `cdd_validate`, `cdd_status`, `cdd_archive`) | 1 (`cdd`) |

The verbatim descriptions and schemas of the five-tool version are preserved
in `OPS_DOC` in `index.ts` and returned by `op: help` — that is the
authoritative reference for "what did the old text say", not git history.

## What was trimmed, per tool

Trimming rules applied: say each thing once; drop what the schema already
expresses (types, enums, defaults); drop parameter descriptions; no ALL-CAPS
emphasis; no thresholds the user should decide; keep every rule that changes
how the model *calls* the tool.

| op (was) | old decl chars | kept in the lean description | moved to `op: help` only |
|---|---|---|---|
| `init` (`cdd_init`, 458) | once-per-project rule | CI enum (`github`/`gitlab`/`none`), hooks flag semantics, hookPath install prose (result text still carries the install command) |
| `new` (`cdd_new_change`, 453) | scaffold target `cdd/changes/<name>/`, "artifacts to fill" | artifact file names, capability default (first word of name), kebab-case error text |
| `validate` (`cdd_validate`, 465) | draft vs strict split, no-name → whole store | exact strict semantics (pin files must exist, modified/removed requirements in living spec), `change` alias |
| `status` (`cdd_status`, 126) | "lists open changes" | nothing else — it was already one line |
| `archive` (`cdd_archive`, 316) | strict-green precondition, destination `cdd/archive/` | delta-merge mechanics, pair-commit protocol (result text unchanged) |

Ambient block (`lib/context.mjs`): 797 → 662 chars. Dropped the Tools: line
(the declaration now lists the ops), the traceability clause (rules.md and
artifact instructions carry it), and intro prose; kept the heading, the
`cdd/rules.md` pointer, open-changes list, the one-line workflow chain, and
the mechanical-sweeps rule.

## pi internals this depends on

Verified against pi `1.3.0` (`@earendil-works/pi-coding-agent` dist):

1. **`prepareArguments` runs before schema validation.**
   `pi-agent-core/dist/agent-loop.js` (`prepareToolCall`) calls
   `tool.prepareArguments` first, then `validateToolArguments`; the extension
   API passes the field through
   (`dist/core/tools/tool-definition-wrapper.js:10,33`). This is what makes
   the op aliases (`cdd_validate` → `validate`) and the legacy top-level
   parameter folding (`change`, `capabilities`, `ci`, `hooks`, `mode` →
   `options`) work *before* TypeBox rejects them.
2. **Unknown top-level keys pass validation** (TypeBox default, no
   `additionalProperties: false`) — the legacy shape would not crash even
   without the fold; the fold exists to make `execute` see one canonical
   shape. `execute` still whitelists option keys itself with a clear error.
3. **`pi` manifest.** `package.json` declares `"pi": {"extensions": ["./index.ts"]}`
   — that is what lets `pi install /path/to/pi-cdd` discover an extension whose
   entry point sits at the repo root instead of `extensions/`. Moving or
   renaming `index.ts` must update this manifest and the README install block.
4. **Static tool list.** The factory registers exactly one tool at load and
   never calls `setActiveTools`; there is no loader tool. `tests/tools.mjs`
   T1 pins this (1 tool, 6 ops, `setActiveToolsCalls === 0`) so the list
   cannot change mid-session.
5. **System-prompt cost is the declaration only**: name + description +
   parameters (see `docs/session-format.md`). Ambient text is the
   `before_agent_start` block from `lib/context.mjs`.

## Vendored parser (`vendor/`)

pi clones the repo and never runs `npm install`, so every runtime import
must resolve from committed files. `vendor/@cucumber/gherkin` is the
parser; its only external dependency, `@cucumber/messages`, sits in
`vendor/node_modules/` so Node's module resolution finds it from the
vendored `dist/` files. The root `.gitignore` anchors `node_modules/` to
the repo root (`/node_modules/`) — keep it that way, or a fresh clone
silently loses `@cucumber/messages` and the extension fails to load.

To upgrade the parser: `npm i -D @cucumber/gherkin@NEW`, then copy
`node_modules/@cucumber/gherkin/{package.json,LICENSE,dist}` and
`node_modules/@cucumber/messages/{package.json,LICENSE,dist}` over the
vendor copies, trim each copied `package.json` to
`name/version/type/main/license`, and commit both packages together.

## How to upgrade / evolve

When changing what a tool does, treat `OPS_DOC` as the contract:

1. Change the op's behavior in the `switch` in `index.ts` **and** its
   `OPS_DOC` entry (description + parameters) in the same edit — help must
   keep returning the truthful full documentation.
2. Keep the declaration budget: `name + description + parameters ≤ 700`
   chars (T1). If a new rule must be stated, prefer `help` over the
   description.
3. Add fill-ins only when the guess cannot be wrong (alias mappings,
   canonical field names, JSON-ifying objects). Anything ambiguous stays a
   clear execute-time error — see T4.
4. `npm test` (smoke + tool suites) must stay green; `RUN_PI_LOOP=1 npm
   test` additionally verifies a live `pi` accepts the declaration and the
   `prepareArguments` path (spends tokens — run before committing surface
   changes).
5. Re-measure and update the table in `README.md`:

   ```bash
   node -e 'import("./index.ts").then(m=>{const t=[];m.default({registerTool:d=>t.push(d),registerCommand:()=>{},on:()=>{}});const x=t[0];console.log(x.name.length+x.description.length+JSON.stringify(x.parameters).length)})'
   ```

6. If the legacy five-tool compatibility layer is ever dropped, delete
   `OP_ALIASES` and the folding block in `fillArgs` together with the T2
   checks.

## Test map (`tests/tools.mjs`)

| check | pins |
|---|---|
| T1 | one tool, six ops, static list, ≤700-char declaration, no OPS_DOC duplication in the description |
| T2a–d | fill-ins fire for legacy names/params; never misfire on ambiguous input |
| T3a–g | every op round-trips the real libs in a sandbox; help returns full parameters |
| T4a–c | clear errors for the ambiguous cases (missing name, unknown option, bad JSON, conflicting name, red archive) |

## Door-script sync (the law, ADR-0007)

`scripts/law.mjs` states every door-side grammar; `spec-drift.mjs`,
`spec-extract.mjs`, and `arch-extract.mjs` import it. The four files are
copied verbatim into adopting stores (`DOOR_SCRIPTS` in
`lib/templates.mjs`).

- Edit grammars in `scripts/law.mjs`, never in `cdd/scripts/` — copies
  are refreshed, not merged. Bump `LAW_VERSION` when the grammar changes.
- After touching any door script, refresh this repo's own copies
  (`cdd init` on the repo) and commit extension copy + store copy
  together — the guard treats them as a set.
- Tests that copy door scripts into a sandbox copy the whole set
  (`law.mjs` is an import, not a standalone).

## Known debts (one-pass-one-close review, 2026-10-20)

- `lib/store.mjs` ↔ `lib/validate.mjs` import cycle: `archiveChange` gates
  on `validateChange`, which reads the store. Both call lazily, so ESM
  resolves it; unwinding it means folding validation into the store layer —
  not worth it yet.
- `stage: "strict-validation"` is a string literal, not a type. Justified
  by the one-pass-one-close proposal: future stages (merge, move) get a
  home without a union Node consumers must parse.
- The `strictOnly` tag and the `mode === "strict"` guards in
  `lib/validate.mjs` encode one concept twice. Harmless today — the guards
  decide what a run evaluates, the tag decides how a run projects — but a
  single-mechanism refactor could drop `mode` from `runValidation`.
- The archive refusal render is written twice in `index.ts` (command
  handler and tool case). Extraction awaits a second caller; T4b/T4c pin
  the byte-identical text meanwhile.
