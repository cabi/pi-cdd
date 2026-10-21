# wire-review-points

## Why

The three bundled review skills (`cdd-spec-review`, `cdd-code-review`, `cdd-adr-review`) describe review points R1/R2/R3 that the loop itself never mentions: nothing in the law, the artifact templates, the ambient block, or `/cdd-help` tells an author when a review fires or where its findings live. Model-run review therefore happens only when a human remembers to ask for it — the skills are dead weight in every session that starts cold.

## What Changes

- The loop law (`RULES_MD` rule 2 plus a new rule 2a, mirrored into `cdd/rules.md`) names the three review points: R1 conditional on a design-gate T1 or T2 YES, R2 always at draft-green before the first implementation task, R3 plus a conditional ADR review at Close before archive. All three report advisory findings — severity `blocker`/`should`/`note`, disposition `fixed:`/`open`/`won't-fix:` — never red/green verdicts; the deterministic validators and the human keep gate authority, and every open blocker is disposed before the next loop step.
- `PROPOSAL_INSTRUCTION` gains the R1 tail: after the proposal is drafted, if the design gate answered T1 (cross-cutting) or T2 (architecture bet) YES, run skill `cdd-spec-review` in proposal mode; findings at `cdd/changes/<name>/reviews/r1-proposal-review.md`; open blockers are disposed before drafting the delta.
- `tasksTemplate` scaffolds `3.1 Change review` before the first implementation task (R2: at draft-green run `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; the task ticks only when no blocker is open), and the Close section gains, before archive, the R3 code-review task (skill `cdd-code-review`, findings at `reviews/r3-code-review.md`, no open blocker before archive) plus the conditional task: if this change drafted or amended any ADRs, run `cdd-adr-review` on them, findings at `reviews/adr-review.md` per that skill. `TASKS_INSTRUCTION` carries the matching clauses.
- Every statement of the loop moves together: the ambient block (`lib/context.mjs`), the `/cdd-help` steps (`lib/help.mjs`), and the README driving-the-loop table carry the same review points with triggers and findings paths.
- The gate record lands on time: the law states the design-gate T1–T5 answers are written into tasks §2 as the gate runs (the scaffold exists from `cdd new`), before the proposal is drafted — closing the R1 ambiguity this change's own review tripped over.
- `tests/smoke.mjs` gains a scaffold check (S34) pinning the review-point scaffolds, and the delta's scenarios pin `tests/smoke.mjs` again — healing the pre-existing L2 staleness (the skills commit d967404 added S33 to smoke.mjs with no spec travel; this change's spec commits are the honest catch-up).
- ADR-0008 "Model-run artifact reviews are advisory findings, never verdicts" is drafted (drafted status: draft, a status ADR_STATUSES accepts — scripts/law.mjs:245; the human sponsor resolved it accepted at Close) into `cdd/decisions/`.

## Capabilities

- gherkin — one delta `specs/gherkin/spec.md` in this change: scenarios pinning the review-point wiring in `RULES_MD`, `PROPOSAL_INSTRUCTION`, `TASKS_INSTRUCTION`, `tasksTemplate`, the ambient block, the `/cdd-help` steps, and the store copy `cdd/rules.md`; scenarios pinning the new smoke check; scenarios pinning the new acceptance test `tests/acceptance/review-wiring.test.js`.
- No new capability: today `lib/context.mjs`, `lib/help.mjs`, and `README.md` sit outside every capability's `Code:` globs. This change's delta claims `lib/context.mjs`, `lib/help.mjs`, `cdd/rules.md`, and `cdd/decisions/0008-*.md` for gherkin going forward; `README.md` deliberately stays unowned documentation, covered by Done-When observability only (the acceptance test pins it).

## Solutions Considered

- The bundled skills themselves (`cdd-spec-review`, `cdd-code-review`, `cdd-adr-review`, shipped in d967404): they already define the R1/R2 triggers, the findings grammar, and the findings paths. Adopted as-is — the skills are the procedure; the law and templates only name when and where. No new review behavior is specified in templates.
- `cdd init` store propagation: init writes `RULES_MD` only into a fresh store and deliberately never rewrites an existing store's contract (bd4358b). Adopted the honest alternative — the store copy `cdd/rules.md` is edited in place in this same change.
- Validator enforcement (strict red while `reviews/r2-change-review.md` is missing): rejected — reviews are advisory by this change's own ADR; the deterministic validator gains no review gate, and the scaffolded task ticks already carry the proceed rule.
- A single-source loop-law constant feeding rules, ambient, and help from one module: rejected here as a refactor no Done-When needs; recorded as a follow-up idea.

## Non-Goals

- Migrating ADRs 0001–0007 from `decisions/` into `cdd/decisions/` so the guard sees them (separate migration change; recorded as a process finding for the human).
- Wiring `tests/acceptance/` into `npm test` or CI beyond what exists today.
- Any change to validator/guard logic, gate authority, or review-skill content.
- A single-source refactor of the loop-law text.
- Version bump of the extension package.

Done-When: exactly 7 loop statements — RULES_MD, store cdd/rules.md, ambient block, /cdd-help steps, README driving table, PROPOSAL_INSTRUCTION tail, TASKS_INSTRUCTION clauses — each name R1, R2, and R3 with their triggers and findings paths, and the change-loop rule states the T1–T5 gate record lands in tasks §2 as the gate runs, before the proposal is drafted — pinned by tests/acceptance/review-wiring.test.js
Done-When: a scaffolded tasks.md holds a "3.1 Change review" task before the first implementation task and Close-section review tasks before archive — pinned by tests/acceptance/review-wiring.test.js
Done-When: cdd/decisions/ holds ADR-0008 with a guard-accepted frontmatter status (draft at drafting, accepted once the human resolves it at Close) stating the advisory-findings decision (A0 clean)
Done-When: npm test exits 0
Done-When: node scripts/spec-drift.mjs full scan exits 0 (heals the pre-existing L2 finding on tests/smoke.mjs)
Code: lib/instructions.mjs, lib/templates.mjs, lib/context.mjs, lib/help.mjs, cdd/rules.md, cdd/decisions/0008-*.md, tests/smoke.mjs, tests/acceptance/review-wiring.test.js
