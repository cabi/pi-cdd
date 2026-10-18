# pi-cdd — contract-driven development inside pi

A pi extension that brings the [openspec-cdd](https://github.com/cabi/openspec-cdd)
method (same author: cabi) to any project — **without the OpenSpec CLI**. The
method (change loop, lean-verified schema, three doors, drift guard) is
unchanged; the counterparty at door 1 is no longer an external tool but the
extension itself. The agent sees it as **one lean `cdd` tool** (six ops)
instead of five separate tools — same features, ~63% fewer declaration tokens
per request (see [Lean tool declaration](#lean-tool-declaration)).

## How to install this extension into pi

```bash
pi install git:github.com/cabi/pi-cdd           # user-level: loads in every project
pi install git:github.com/cabi/pi-cdd@v0.1.0    # pinned to a tag
pi install --local git:github.com/cabi/pi-cdd   # this project only (loads after project trust)
pi remove git:github.com/cabi/pi-cdd            # uninstall again
```

- A git source is cloned under pi's package directory and reconciled to the
  selected ref; a configured ref never moves on its own — `pi update
  --extensions` picks up a newer tag when you ask it to.
- To try it once without touching settings: `pi -e git:github.com/cabi/pi-cdd`
  (or, from a checkout, `pi --extension /path/to/pi-cdd`).
- Requires Node ≥ 20 (the runtime pi already uses; the extension itself is
  zero-dependency).
- Then, in the adopting project, run `/cdd-init` once to scaffold the `cdd/`
  store and the git hooks.

```
door 1 · authoring      /cdd-init /cdd-new /cdd-status /cdd-archive   (human)
                        cdd (agent tool; ops: init · new · validate ·
                        status · archive · help)
                        + ambient method injection (before_agent_start)
door 2 · commit         .githooks/pre-commit  → spec-drift.mjs --staged   (message-independent checks)
                        .githooks/commit-msg  → spec-drift.mjs --commit-msg "$1"
                          (L2 travel + mechanical exemption + M integrity — the
                          trailer is visible here, so nothing needs --no-verify)
door 3 · CI             guard + acceptance suite, machine verdicts only
```


`/cdd-init` scaffolds the store (`cdd/`), the executable `pre-commit` and
`commit-msg` hooks (git hands the second one the composed message — that is
what makes the `Mechanical-Change:` lane pass the door honestly, no
`--no-verify` ever),
writes is zero-dependency Node + git — uninstall the extension and every
door keeps working (ADR-0003).

## Why it works without a counterparty tool

The factory used the OpenSpec CLI to force discipline. Here discipline comes
from structure (ADR-0002): the method rules are **injected** into every
session's context (`before_agent_start` — no skippable fetch), verdicts are
**deterministic tools** returning red/green JSON, and the human keeps the
close button. Multi-session continuity is the store itself: a cold-start
agent in a `cdd/` project is oriented by the ambient block alone.

## Lean tool declaration

This is the lean version of the tool surface: the previous five tools
(`cdd_init`, `cdd_new_change`, `cdd_validate`, `cdd_status`, `cdd_archive`)
are merged into **one `cdd` tool** with an `op` parameter. Rare parameters
travel inside `options` as a JSON string; `op: help` returns the full per-op
documentation — the verbatim descriptions and schemas of the five-tool
version — so nothing is lost, only not repeated on every request. Legacy tool
names (`cdd_validate`, …) still work: `prepareArguments` maps them onto ops
and folds legacy top-level parameters into `options` before validation.

| Model-facing text | five-tool version | lean (one tool) |
|---|---|---|
| tool declarations (name + description + schema) | 1818 chars ≈ 455 tok | 665 chars ≈ 166 tok (−63%) |
| ambient block (store present) | 797 chars ≈ 199 tok | 662 chars ≈ 166 tok (−17%) |
| **total per request** | **≈ 654 tok** | **≈ 332 tok (−49%)** |

Characters are exact; tokens estimated at 4 chars/token (no tokenizer
dependency). Without a store there is no ambient block, so the per-request
cost is the declaration alone: ≈ 455 → ≈ 166 tok.
## Layout

```
index.ts          extension factory: commands, one merged cdd tool, ambient hook
lib/store.mjs     init / create / archive (plain fs over cdd/)
lib/validate.mjs  draft + strict validator (errors / warnings / split signal)
lib/context.mjs   ambient block builder
lib/templates.mjs  rules.md, CI files, hook, artifact scaffolds
cdd-src/          the files copied into adopting projects
scripts/          standalone ports (spec-drift, spec-extract, arch-extract)
tests/            smoke.mjs (libs, ambient, guard) + tools.mjs (merged-tool
                  suite: every op, fill-ins, help, static list); npm test runs
                  both; RUN_PI_LOOP=1 adds the isolated-pi checks (spends tokens)
decisions/        ADRs 0001–0005
GLOSSARY.md       canonical language
PRODUCT.md        bird's-eye map from the factory
```


## The authoring corpus

The per-artifact `instruction` text we developed in openspec-cdd's
`schema.yaml` lives on in `lib/instructions.mjs` — ported line for line
(reuse-first Solutions Considered, Non-Goals fence, Done-When criteria,
quantification rules, design-gate triage, traceability, split procedure).
The `new` op embeds it into every generated artifact as the leading
HTML comment, `cdd/rules.md` summarizes it, and the validator enforces its
machine-checkable parts (missing sections, Done-When cap, REMOVED Reason,
vague comparatives, traceability table, >12 split). The corpus is pinned by
smoke checks S22–S25.

## Driving the loop — your prompts are the triggers

There are no phase skills to invoke. The ambient block (injected into every
request) tells the agent which loop to run; the validator's red/green is the
phase machine; your prompt is the requirement input.

| You say / do | Phase | Gate that says "enough" |
|---|---|---|
| `"arch-extract"` | brownfield Phase 0 — induce the as-built architecture | agent runs `cdd/scripts/arch-extract.mjs`, fills the interpreted section, drafts ADRs in `cdd/decisions/` (four-criterion test) — machines detect, **you resolve** |
| `"spec-extract"` | brownfield — map unowned territory | agent runs `cdd/scripts/spec-extract.mjs`: extraction candidates (tests pinned by no spec) + burn-down; specs are drafted via the change loop — approval asks *is this what we WANT?* |
| `"New change: <what and why>"` | design gate → proposal → deltas → tasks | `cdd validate` **draft green** (placeholders replaced, every scenario ends with a `Verified by:` pin, every task carries `verify by`) |
| `"implement <change>"` | test-first ticking | the acceptance test exists before the task ticks |
| *(nothing — automatic at green)* | archive | strict green + guard green → `cdd archive`; or you: `/cdd-archive <name>` |
| `/cdd-status` | any time | — TUI window: **Open** / **Archived** tabs as sortable tables (newest first, in-process highlighted; `tab`/`←→` switch tabs, `↑↓` rows, `1-9` sort column, `enter` flips direction, `esc` closes); plain table outside the TUI |
| `/cdd-help` | any time | — the themed version of this section, in the TUI |

"Enough" is mechanical, never a feeling: authoring is done when draft
validation turns green; the change is done when your `Done-When:` line is
demonstrably true and strict + guard are green. Batch-creating several
changes and implementing them later is fine — creation scaffolds, it never
starts work; `/cdd-status` keeps the queue visible.
## Validation

Three fresh headless `pi` processes (no session memory between them)
built a calculator change through the full loop — init → author → strict
green → paired feature/archive commits — with the guard catching a real
agent mistake on the way (a `Mechanical-Change:` trailer on an archive
commit touching `cdd/specs/`, rejected by the M check, amended away).
Final state verified from outside: guard clean, living spec merged, pin
green. See `PRODUCT.md` → validation criteria.

**Run 6 — human PO, three cold agents:** a product owner drove three
one-sentence feature prompts through intercom gate answers; cold agents
built homepage, catalog, and contact form for a real site, uncoached —
including choosing the `Mechanical-Change:` lane for a stray-tag fix and
absorbing two mid-flight PO amendments (card material/age lines, DSGVO
checkbox). 23/23 acceptance green, guard clean after every feature, three
frozen archives. Full report: `docs/validation-run-6-klausner.md`.
