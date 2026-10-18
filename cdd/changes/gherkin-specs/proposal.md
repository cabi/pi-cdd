# gherkin-specs

## Why

Scenario bodies are free prose today — the template says "Concrete Given/When/Then prose" and nothing machine-checks the shape. Agent-authored scenarios drift into unstructured text, and the human reviewer at door 1 has no mechanical floor under the acceptance contract. A spec whose scenarios cannot be parsed is a spec whose "Verified by" pins point at prose, not behavior.

## What Changes

- BREAKING: every scenario body becomes a fenced ` ```gherkin ` block containing exactly one complete `Scenario:` or `Scenario Outline:` definition; the `Verified by:` pin stays markdown outside the fence.
- BREAKING: `cdd validate` (draft and strict) parse-gates every fence with the official `@cucumber/gherkin` parser plus a ruleset layer (exactly one `When`, at least one `Then`, English keywords only, no `Background`/`Rule`/tags, fence scenario name must equal the `#### Scenario:` heading). Old-format prose scenarios fail validation with a message naming the new format. Hard switch at v0.3.0 — no grace period, no per-store flag.
- Door 3 (`spec-drift.mjs` full scan) re-lints every fence in living specs and open deltas; it requires `@cucumber/gherkin` as a documented devDependency and fails loudly with the exact install command when the parser is absent. Door 2 (pre-commit) stays zero-dependency and structural.
- `cdd/rules.md` rule 4, the authoring corpus (`lib/instructions.mjs`), and the templates teach the fenced format and the declarative style law: scenarios describe observable behavior and outcomes, not interaction mechanics — enforced by door-1 judgment, deliberately never by a style lexicon.
- ADR: `decisions/0005-gherkin-scenario-language.md` (amends ADR-0001's door-3 clause).

## Solutions Considered

- scenario language arbiter: `@cucumber/gherkin` 42.x — adopted (official, actively maintained, one dependency, parses from string so no temp files); `gherkin-lint` — rejected (community tool, stale since 2023, six transitive deps, rides the old parser generation); own regex ruleset only — rejected (self-certification: the arbiter must be code we did not write); native `.feature` files as spec source — rejected (Gherkin has no delta semantics; ADDED/MODIFIED/REMOVED and pins would be rewritten into tags and comments).
- door-3 parser supply: documented devDependency in the adopting project — adopted (CI projects already manage devDependencies; failures are loud and actionable); vendoring the parser dist into every store — rejected (silent rot; we would become the update channel for a grammar we do not own); door 3 skips re-lint — rejected (a hand-edited living spec with broken Gherkin would pass every door).
- declarative-style enforcement: prose law at door 1 — adopted; machine lexicon/step-count warnings — rejected (not stably implementable; false positives on a hard gate would block semantically perfect specs).

## Non-Goals

- No Cucumber step definitions or glue code — pins stay file-level; the parser validates shape, it never binds specs to test code.
- No style lexicon, verb list, or step-count heuristic in the validator, ever.
- No migration path or dual-format acceptance for pre-0.3.0 scenario prose.
- No `Background`, `Rule`, tag support in cdd scenarios — the subset is closed.

Done-When: `node tests/smoke.mjs && node tests/tools.mjs` exit 0 with the Gherkin gate active, and `cdd validate strict` is green on this change while `tests/acceptance/gherkin-*.test.js` demonstrate red verdicts for exactly these six defects: broken fence syntax, pin inside the fence, a rejected construct (`Background`, `Rule`, tag, localized keyword), a second `When`, a missing `Then`, and a fence name unequal to its heading
Done-When: `node cdd/scripts/spec-drift.mjs` exits non-zero on a living spec containing one broken fence, and exits non-zero printing the exact `@cucumber/gherkin` install command when the parser cannot be imported
Code: lib/gherkin.mjs, lib/validate.mjs, lib/templates.mjs, lib/instructions.mjs, scripts/spec-drift.mjs

Capabilities: gherkin (new living spec — first capability in this store).
