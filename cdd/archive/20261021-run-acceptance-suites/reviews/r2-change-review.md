# r2-change-review — run-acceptance-suites — 2026-10-21 — reviewer: cold sub-agent

| severity | finding | evidence | disposition |
|---|---|---|---|
| should | Scenario "npm test runs the whole acceptance sweep" pins to a test that checks the npm test script *string* (`invokes node --test on tests/acceptance/`), not the observable "every suite executes" outcome | tasks.md 3.2; specs/acceptance/spec.md, Scenario: npm test runs the whole acceptance sweep | fixed: 3.2 re-worded to a TAP probe — the pin spawns the sweep self-guarded and asserts every suite file appears in TAP output, not just the script string |
| note | Requirement prose asserts "CI runs the same entrypoint, so the sweep gates every push" but no scenario pins it and no task verifies it (proposal declares CI "needs no edit") | specs/acceptance/spec.md, Requirement: Acceptance suites run with the project tests; proposal.md What Changes | fixed: author overrides to pin it anyway — scenario "CI runs the project test entrypoint" added to the delta and a workflow check added to 3.2; finding 4 was exactly "nor CI", so the consequence deserves a pin |
