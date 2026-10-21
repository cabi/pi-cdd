# r3-code-review — acceptance-wiring — 2026-10-21 — two cold sub-agents (skill cdd-code-review), fresh sessions, briefed from paths on disk only

- Standards axis: opencode-zen/deepseek-v4-pro (read-time state pinned: HEAD 9c11125e1b2daaa96d761d9d9b7237f657619a61, porcelain `M .github/workflows/cdd.yml`, `M cdd/rules.md`, `M lib/templates.mjs`, `?? cdd/changes/acceptance-wiring/`, `?? tests/acceptance/ci-node-matrix.test.js`, `?? tests/acceptance/law-pin-executor.test.js`)
- Spec axis: opencode-zen/deepseek-v4-pro (same pinned state; ran `node cdd/scripts/spec-drift.mjs` and `npm test` itself — clean, 14/14, exit 0, at review time)

## Standards

| severity | finding | evidence | disposition |
|---|---|---|---|
| blocker | `.github/workflows/cdd.yml` gained a duplicate `guard:` key (`jobs: guard: guard:`) — invalid YAML; the matrix wiring is broken regardless of green pins. Introduced by the author's matrix edit re-including the `guard:` line above the replaced range. | workflow lines 6–7 at review time; `git diff main -- .github/workflows/cdd.yml` | fixed: stray line removed; MX0 (fail-closed structural parse) added and demonstrated RED on the broken file (`duplicate mapping key "guard:" at indent 2`), then green after the fix |
| should | ci-node-matrix.test.js asserted content via regex only — green while the workflow was structurally broken; exactly the regression class this change exists to prevent. | MX1–MX3 regex checks at review time | fixed: suite rewritten around a fail-closed YAML-subset parser (duplicate keys, orphaned blocks, unsupported syntax are errors); MX0–MX4 now assert the matrix/strategy/setup-node/steps as structure of `jobs.guard`, not text tokens |
| note | Rule-10 ("source code carries no spec markers") vs the `(delta: … change acceptance-wiring)` header comments in the two new suites — pre-existing house style, matching tests/acceptance/run-acceptance.test.js verbatim. | headers of both new suites; run-acceptance.test.js header | won't-fix: reviewer itself judged it pre-existing accepted style, consistent with every existing pin suite; not a new violation introduced by this diff |

## Spec

| severity | finding | evidence | disposition |
|---|---|---|---|
| blocker | Duplicate `guard:` key: the workflow is malformed; GitHub Actions rejects duplicate mapping keys, and the requirement "The acceptance sweep gates on both supported Node majors" was therefore not actually satisfied — CI would not fan out. | workflow at review time; delta Requirement "The acceptance sweep gates on both supported Node majors" | fixed: stray line removed; suite, sweep, and guard green post-fix (see above) |
| blocker | Pin dishonesty (MX): the grep-based pin would stay green under the duplicate-key defect — it exercised token presence, not "the guard job's build matrix"; neither guard nor `npm test` caught the break (both green at review time). | both MX scenarios vs MX1–MX3 regex checks | fixed: structural rewrite (same as the Standards should above); MX1–MX4 now fail closed when the parse fails — demonstrated by the recorded RED run where MX0's failure cascades MX1–MX4 red |
| — (positive) | LAW pin honest: rule-7 extraction from both surfaces, exact sentence, exactly-once; genuinely exercises both gherkin scenarios. RA1–RA4 untouched, package.json unchanged, no scope creep found; both ADDED requirements implemented. | law-pin-executor.test.js LAW1–3; Non-Goals audit | no action needed |

## Author's process note (recorded for the loop's memory)

Both blockers shared one root cause: the author's edit pattern of re-including a boundary line in replacement text while the anchor range starts below it — the same slip hit proposal.md (Solutions Considered bullet, caught same-turn) and the workflow (caught only by the two cold R3 reviewers; every deterministic door was green). The structural MX0 pin now converts this class from invisible to red. "Validate after every artifact edit" was insufficient — the workflow needed a structural pin, which R3 forced into existence.
