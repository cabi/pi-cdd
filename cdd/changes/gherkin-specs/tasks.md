# Tasks — gherkin-specs

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs — store is empty (first capability); read lib/validate.mjs, lib/templates.mjs, lib/instructions.mjs, scripts/spec-drift.mjs in full

## 2. Design

- [x] 2.1 Design gate — T1 cross-cutting YES (validator + templates + corpus + door 3 + docs change together): design recorded in decisions/0005-gherkin-scenario-language.md, settled with the user across three grilling rounds (arbiter, embedded fenced format, subset, ruleset, door placement, packaging, declarative-style-as-door-1-law); T2 architecture bet YES (bets on @cucumber/gherkin 42.x API surface — mitigated by pinning ^42 and a smoke test that exercises the real parser); T3 shared seam NO (validate.mjs remains the only gate entry; door 3 gets its own extraction); T4 invariant risk YES (fences must stay extractable from arbitrary markdown — covered by acceptance tests over the delta of this very change); T5 parallel work NO (no other open changes). All five answers named.

## 3. Implementation

- [x] 3.1 Extraction + parse + line mapping: lib/gherkin.mjs extracts the fenced gherkin body of every `#### Scenario:` block, wraps each requirement's scenarios into one synthetic Feature, parses with @cucumber/gherkin, and maps parse errors back to the markdown file's line numbers — verify by tests/acceptance/gherkin-parse-gate.test.js
- [x] 3.2 Ruleset layer: exactly one When, at least 1 Then, And/But continuation-only, English keywords only, reject Background/Rule/tags, fence scenario name equals heading, scenario names unique within a requirement — verify by tests/acceptance/gherkin-subset.test.js
- [x] 3.3 Gate integration: validate.mjs treats fence-missing, parse failure, and ruleset violations as errors in draft and strict; pin-inside-fence is an error; quantification warnings scan the fence text — verify by tests/acceptance/gherkin-parse-gate.test.js
- [x] 3.4 Corpus and law: deltaTemplate scaffolds a fenced scenario with the pin outside the fence; DELTA_INSTRUCTION and RULES_MD rule 4 carry the subset, the fence law, and the declarative-style clause — verify by tests/acceptance/gherkin-style-guidance.test.js
- [x] 3.5 Door 3 lint: scripts/spec-drift.mjs full scan parses every fence in living specs and open deltas, exits non-zero naming file and line on the first defect, and exits non-zero printing the exact install command when @cucumber/gherkin cannot be imported; --staged and --commit-msg modes never import the parser — verify by tests/acceptance/gherkin-door3.test.js
- [x] 3.6 Packaging: @cucumber/gherkin ^42 as an extension dependency verified loadable under jiti (vendored into the extension tree if pi does not install extension deps — record which), package.json version 0.3.0, README/PRODUCT/GLOSSARY carry the amended zero-dependency claim — verify by node tests/smoke.mjs && node tests/tools.mjs
- [x] 3.7 Regression sweep: tests/smoke.mjs and tests/tools.mjs fixtures updated to the fenced format, all suites green, guard green on this repository's own store — verify by node cdd/scripts/spec-drift.mjs

## 4. Close

## Done When Traceability

| criterion | task ids |
|---|---|
| smoke + tools suites exit 0 with the gate active; strict green on this change; gherkin-*.test.js demonstrate the six red verdicts | 3.1, 3.2, 3.3, 3.6, 3.7 |
| door 3 exits non-zero on a broken living-spec fence and on a missing parser with the install command | 3.5 |

- [ ] 4.1 cdd validate strict green, guard green
- [ ] 4.2 Archive — pair-commit: feature commit, then archive commit
