# 20261112-adopter-neutral-citations

## Why

Adopter projects complain that pi-cdd's own text cites ADR ids that do not exist in their store — or collide with their own differently-numbered decisions, since ids are per-project and filename-derived (`cdd/decisions/NNNN-*.md` → `ADR-NNNN`). The dangling citations (`(ADR-0006)` in rule 4, the delta instruction, and door findings; `ADR-0008` in ops help) mislead adopter agents into chasing or drafting a decision they can never resolve, stalling new-ADR authoring.

## What Changes

- Adopter-visible extension text stops citing the extension's own decision ids: rule 4 in the rules template and the store's `cdd/rules.md` copy, the delta authoring instruction (source and export), and door-finding messages (validator, drift guard, grammar law — extension copies and the `cdd/scripts/` twins).
- No store behavior changes: `rules.md` stays write-only-when-missing — no refresh, no template-history comparison.

## Solutions Considered

- requirement home: one ADDED requirement in the gherkin spec owns the whole law — every surface it sweeps (templates, instruction, rules copy, validate, spec-drift, grammar-law, cdd/scripts twins) is gherkin-owned; rejected splicing the law into "Declarative style is door-1 law" and "The scaffold passes its own doors" (two half-homes, one requirement past the 500-char one-behavior rule) and rejected a new extension requirement because it would claim files gherkin already owns.
- citation hygiene: keeping the ids but suffixing "(pi-cdd repo)" — rejected: still leaks a foreign id into adopter text and lengthens every finding.
- error-code catalogue (E001-style): rejected: new machinery for a text-hygiene problem; a Non-Goal.
- rules.md upgrade path: template-history compare on re-init — rejected by user decision (2026-11-12); the recipe for unamended stores stays `rm cdd/rules.md && cdd init`.

## Non-Goals

- No `rules.md` refresh or template-history comparison in init — write-if-missing stays.
- No error-code catalogue, no message restructuring — only the id citations drop; every message keeps its law phrase.
- The generic help examples stay: `ADR id, e.g. "ADR-0008"` in the dispatch parameter description (`lib/ops.mjs:113`) is an illustrative usage description, not a citation of a governing decision. The reconfirm hint (`lib/adr-ops.mjs:221`) is actionable copy-paste text but stays too — `lib/adr-ops.mjs` is owned by the adr capability (the one-owner law, and the staged scan requires an adr spec to travel with its code), so its neutralization rides a follow-up adr-capability change.
- No renumbering or relocation of the extension's own decisions under `cdd/decisions/`.

## Capabilities

- gherkin: one ADDED requirement "Adopter-visible text carries no decision ids" (+3 scenarios: corpus text cites no decision id, door findings cite no decision id, a fresh adopter store is id-clean) — delta at specs/gherkin/spec.md

Done-When: tests/acceptance/adopter-neutral-surfaces.test.js exits 0, and a fresh scratch store initialized by the scaffold into an empty directory contains no four-digit decision-id literal in any written file
Code: lib/templates.mjs, lib/instructions.mjs, cdd/rules.md, lib/validate.mjs, scripts/spec-drift.mjs, scripts/grammar-law.mjs, cdd/scripts/**, tests/acceptance/adopter-neutral-surfaces.test.js

## Decision alignment

- **ADR-0001 (zero-dependency node tooling):** followed — text edits only; no dependency enters.
- **ADR-0006 (canonical fenced Gherkin):** followed — the fence-law rationale stays recorded in this repo's ADR-0006; rule 4 and the instruction keep teaching the fenced document, minus the id citation. No decision content is amended.
- **ADR-0007 (the law behind every door):** followed — no law text changes and no door verdicts change; only finding-message citations drop.
- **ADR-0008 (model-run reviews are advisory findings):** followed — R2/R3 findings are disposed as advisory rows, never verdicts.
- **ADR-0009 (single-source law):** followed — the store copy's rule 4 and the template stay byte-identical to each other (both edited in the same change); no law section text changes.
- **ADR-0010 (reviewer independence is loop law):** followed — the only edit to an ADR-0010-governed file is cdd/rules.md's rule-4 citation drop; the loop-law text and its code claims are untouched, and this change's reviews stay cold-session per the loop.
- **ADR-0011 (ticks are claims and pins hit real doors):** followed — every tick names a verification that ran; the new pin reads the real module surfaces and initializes a real scratch store.
- **ADR-0012 (comments are shape-only):** followed — no decision ids ride comments; source comments stay shape-of-code.
- **ADR-0013 (one claim map for guard and ops):** followed — no claim-map change; the delta's Code line claims the surfaces it pins, derived from the one map.
- No ADR decision content is drafted or amended, and no ADR-governed file moves, so no ADR review and no reconfirmation ride this change.
