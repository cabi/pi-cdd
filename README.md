# pi-cdd — contract-driven development inside pi

A pi extension that brings the [openspec-cdd](https://github.com/cabi/openspec-cdd)
method to any project — **without the OpenSpec CLI**. The method (change loop,
lean-verified schema, three doors, drift guard) is unchanged; the counterparty
at door 1 is no longer an external tool but the extension itself.

```
door 1 · authoring      /cdd-init /cdd-new /cdd-status /cdd-archive   (human)
                        cdd_init cdd_new_change cdd_validate          (agent)
                        cdd_status cdd_archive
                        + ambient method injection (before_agent_start)
door 2 · commit         .githooks/pre-commit → node cdd/scripts/spec-drift.mjs
door 3 · CI             guard + acceptance suite, machine verdicts only
```

## Install (dev)

```bash
pi --extension /path/to/pi-cdd        # per invocation
# or in pi settings:  extensions: ["/path/to/pi-cdd"]
```

`/cdd-init` scaffolds the store (`cdd/`), the executable pre-commit hook,
CI templates (GitHub and/or GitLab), and `tests/acceptance/`. Everything it
writes is zero-dependency Node + git — uninstall the extension and every
door keeps working (ADR-0003).

## Why it works without a counterparty tool

The factory used the OpenSpec CLI to force discipline. Here discipline comes
from structure (ADR-0002): the method rules are **injected** into every
session's context (`before_agent_start` — no skippable fetch), verdicts are
**deterministic tools** returning red/green JSON, and the human keeps the
close button. Multi-session continuity is the store itself: a cold-start
agent in a `cdd/` project is oriented by the ambient block alone.

## Layout

```
index.ts          extension factory: commands, tools, event handler
lib/store.mjs     init / create / archive (plain fs over cdd/)
lib/validate.mjs  draft + strict validator (errors / warnings / split signal)
lib/context.mjs   ambient block builder
lib/templates.mjs  rules.md, CI files, hook, artifact scaffolds
cdd-src/          the files copied into adopting projects
scripts/          standalone ports (spec-drift, spec-extract, arch-extract)
tests/smoke.mjs   26 checks — `npm test` runs 24; RUN_PI_LOOP=1 adds the two
                  isolated-pi checks that spend tokens)
decisions/        ADRs 0001–0005
GLOSSARY.md       canonical language
PRODUCT.md        bird's-eye map from the factory
```


## The authoring corpus

The per-artifact `instruction` text we developed in openspec-cdd's
`schema.yaml` lives on in `lib/instructions.mjs` — ported line for line
(reuse-first Solutions Considered, Non-Goals fence, Done-When criteria,
quantification rules, design-gate triage, traceability, split procedure).
`cdd_new_change` embeds it into every generated artifact as the leading
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
| `"New change: <what and why>"` | design gate → proposal → deltas → tasks | `cdd_validate` **draft green** (placeholders replaced, every scenario ends with a `Verified by:` pin, every task carries `verify by`) |
| `"implement <change>"` | test-first ticking | the acceptance test exists before the task ticks |
| *(nothing — automatic at green)* | archive | strict green + guard green → `cdd_archive`; or you: `/cdd-archive <name>` |
| `/cdd-status` | any time | — table of open + archived changes with verdicts and next step |
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
