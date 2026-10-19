# gherkin-feature-blocks

## Why

The v0.3 scenario format (ADR-0005) is un-idiomatic Gherkin: the scenario
name lives twice (`#### Scenario:` heading + `Scenario:` line), the
`Verified by:` pin hangs as markdown scaffolding outside the fence, and the
language's top keyword `Feature` never appears. The fence is a scenario
fragment where Gherkin expects a document.

## What Changes

- One ` ```gherkin ` fence per requirement holding one complete Gherkin
  document: `Feature: <name>` (equal to the `### Requirement:` heading), ≥1
  `Scenario:` blocks, each ending with a `# Verified by: <path>` pin
  comment as its last line.
- `#### Scenario:` markdown headings are gone; the `Scenario:` line is the
  single source of the name. Requirement prose stays markdown.
- Strict comment law: only `# Verified by:` pins are legal inside a fence.
- Subset narrows: `Feature` added; `Scenario Outline`/`Examples`, data
  tables, doc strings now rejected (ADR-0006).
- Gate flip in one change: lib/gherkin.mjs, lib/validate.mjs,
  lib/templates.mjs, lib/instructions.mjs, both spec-drift.mjs copies, all
  gherkin acceptance suites, smoke/tools fixtures.
- Living-spec migration is this change's own MODIFIED delta (all 4
  requirements restated in the new format).

## Solutions Considered

- gherkin: keep per-scenario fences and add `Feature:` per fence — rejected:
  still N blocks per requirement, Feature-per-scenario is no idiomatic
  document, no consolidation win.
- gherkin: full consolidation per ADR-0006 — adopted: one Feature document
  per requirement, pin comments inside, heading duplication removed.
- gherkin: migrate via mechanical rewrite of cdd/specs/ bypassing the loop —
  rejected: the migration IS a delta; the change dogfoods the new gate.

## Non-Goals

- No Background/Rule/tags/localized keywords — subset stays minimal.
- No style machine-checks: formatting (indentation, blank lines) is
  template convention; declarative phrasing stays door-1 judgment.
- No archive rewriting — old-format archives stay as history.

Done-When: every living requirement is one Feature fence whose scenarios
each end with a `# Verified by:` pin comment, and validate/door-3 accept
nothing else
Code: lib/gherkin.mjs, lib/validate.mjs, lib/templates.mjs, lib/instructions.mjs, scripts/spec-drift.mjs, cdd/scripts/spec-drift.mjs, tests/acceptance/*, cdd/specs/gherkin/spec.md
