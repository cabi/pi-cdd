# pi-cdd — Contract-Driven Development as a native pi extension

**Status:** product definition (phase P0) · **Repo:** `~/Projects/pi-cdd` · **Predecessor:** `openspec-cdd` (the factory, https://github.com/cabi/openspec-cdd)

## Vision

The CDD method built in the factory — design gate, quantified spec deltas, `Verified by:` pins, three doors, mechanical-change protocol — as a **standalone pi extension**. Same functionality, same artifact store, same guard discipline: **no openspec in any form**. Where the factory used the OpenSpec CLI as its door-1 authoring counterparty, pi-cdd takes that role itself: in this product's language, that role is called the **pi-tool** (see GLOSSARY.md).

The two products share the method, not the code path:

- **openspec-cdd (factory)** — reference implementation on OpenSpec; continuously tests the contract with the real CLI; stays as is.
- **pi-cdd (this repo)** — the method re-implemented from scratch on pi's extension runtime. The harness *is* the counterparty.

## Scope of v1

| Surface | Name | Kind | Trigger |
|---|---|---|---|
| Project init | `/cdd-init` | command | human, once — scaffolds `cdd/` tree, rules file, decisions dir, hooks + CI templates |
| Change scaffold | `/cdd-new <id>` · `cdd_new_change` | command + tool | start of every change |
| Form gate | `cdd_validate` | tool (readOnlyHint) | agent, before every commit |
| Orientation | `/cdd-status` · `cdd_status` | command + tool | anytime |
| Close loop | `/cdd-archive <id>` · `cdd_archive` | command + tool | end of every change |
| Method context | ambient injection | `before_agent_start` | every session |

Not in v1: TUI components beyond notifications, custom renderers, model/provider integration, MCP.

## Non-goals

1. **No openspec dependency of any form** — not the CLI, not its artifact naming, not `openspec/` paths, not its scaffold strings.
2. **Doors 2 and 3 are never owned by the extension.** The pre-commit guard and the CI workflow stay standalone zero-dependency Node scripts (ADR-0001). The extension may *reference* them, never *be* them.
3. **No lock-in the other direction either:** the store is plain markdown (ADR-0003); the extension can be uninstalled and every door keeps working.

## Architecture

```
pi-cdd/
  index.ts            # factory: registers commands, tools, context injection
  lib/
    store.ts          # cdd/ tree operations (create/list/read/archive)
    validate.ts       # form-gate checks (the --strict equivalent)
    templates.ts      # artifact templates + method rules text
    context.ts        # ambient injection (claude-rules pattern)
  commands/           # /cdd-init /cdd-new /cdd-status /cdd-archive
  tools/              # cdd_new_change cdd_validate cdd_status cdd_archive
  scripts/            # standalone ports (copied into adopting projects)
    spec-drift.mjs    # door 2/3 guard, reads cdd/ instead of openspec/
    spec-extract.mjs  # brownfield extractor
    arch-extract.mjs  # ADR/glossary extractor
  tests/smoke.mjs     # red/green fixtures, store round-trip, headless run
```

**The artifact store in an adopting project** (decided: visible at root):

```
cdd/
  rules.md            # the method rules injected into context (replaces config.yaml injection)
  GLOSSARY.md         # project language
  decisions/          # ADRs
  schemas/            # artifact templates shipped to the project
  changes/<name>/     # proposal.md, specs/ deltas, design.md, tasks.md
  specs/<capability>/ # living contract (merged on archive)
  archive/<name>/     # frozen history
```

Artifact format ports unchanged: delta sections `## ADDED/MODIFIED/REMOVED Requirements`, quantified scenarios ending in `Verified by: <acceptance test path>`, `Done-When:`, `Code:` globs in proposals, `Mechanical-Change:` trailer protocol, 8-task split signal (T5).

## Workflow-step mapping (openspec → pi-cdd)

| openspec command | pi-cdd equivalent | Mechanism |
|---|---|---|
| `schema add` + project init | `/cdd-init` | command, human, once |
| `new change <id>` | `/cdd-new` / `cdd_new_change` | command (human) + tool (agent) |
| `instructions <artifact> --change` | ambient context + `cdd/schemas/` files | injected every session, no call to skip |
| `validate <id> --strict` | `cdd_validate` | tool, agent self-serves red/green |
| `list` / `status` | `/cdd-status` / `cdd_status` | command + tool |
| `instructions apply` | injected method instruction (run guard preflight) | ambient |
| `archive <id> --yes` | `/cdd-archive` / `cdd_archive` | command + tool, git pair-commit |

Hard gates unchanged: validate (door 1 form gate), `spec-drift.mjs` pre-commit (door 2), guard + acceptance suite + tool jobs in CI (door 3).

## Compatibility & verification

- **Runtime:** pi extension API as of pi 1.3.0 (jiti, no build step). All behavior mode-independent — must work headless (`pi --print`, JSON, RPC); UI guarded by `ctx.hasUI`.
- **Smoke suite** mirrors the factory discipline: validator red/green fixtures, store round-trip, archive merge correctness, guard green/red against `cdd/`, headless `pi --print --extension` micro-loop. Every fix to a finding gets a pinning check.
- **Validation run (P4):** scratch project under `validation/`; a cold-start pi agent (project-extension distribution) builds a small Node CLI tool through the change loop. Falsifies the method like `todo-app-api-v2` and `holzborste` did for the factory; findings engraved back as checks.

## Roadmap

- **P0 (done)** product definition, glossary, ADRs
- **P1** extension core: store, validator, templates, context injection, commands, tools
- **P2** standalone scripts ported to `cdd/` paths
- **P3** smoke suite + fixtures
- **P4** validation run (agent builds a CLI tool via pi-cdd)
- **P5** hardening, README, packaging prep (npm package only after the design is falsified)

## Captured knowledge sources

- Factory `openspec/GLOSSARY.md` (10 terms) — ported and extended below
- Factory `openspec/decisions/0001-zero-dependency-node-tooling.md` — ported as ADR-0001
- Factory README (method, doors, tool-class table), `openspec/AGENTS.md` (consumer page — superseded here by ambient injection), smoke-suite discipline
- pi docs: `docs/extensions.md`, examples `claude-rules.ts` (context injection), `commands.ts`, `plan-mode/` (mode toggle + state)
