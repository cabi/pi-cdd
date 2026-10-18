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
tests/smoke.mjs   19 checks — run with `npm test` (RUN_PI_LOOP=1 adds the
                  isolated-pi check that spends tokens)
decisions/        ADRs 0001–0005
GLOSSARY.md       canonical language
PRODUCT.md        bird's-eye map from the factory
```

## Validation

Three fresh headless `pi` processes (no session memory between them)
built a calculator change through the full loop — init → author → strict
green → paired feature/archive commits — with the guard catching a real
agent mistake on the way (a `Mechanical-Change:` trailer on an archive
commit touching `cdd/specs/`, rejected by the M check, amended away).
Final state verified from outside: guard clean, living spec merged, pin
green. See `PRODUCT.md` → validation criteria.
