# R2 package review — 20261024-scaffold-honesty

## Change identity

- Change: `cdd/changes/20261024-scaffold-honesty/`
- Artifact package under review: `proposal.md` + the spec delta (`specs/gherkin/spec.md`, two ADDED requirements) + `tasks.md` (gate record §2.1 ticked with the skip record; implementation groups unticked). No `design.md` — the design gate answered all five triggers NO (skip record).
- Review point: R2 (package), at draft-green — draft-mode `cdd validate` PASSED for this change before this review was dispatched (run it yourself to confirm). Implementation has not started: `tests/acceptance/scaffold-honesty.test.js` does not exist yet and S39 is not in `tests/smoke.mjs` yet, so strict mode would report pin-not-on-disk findings — that red is the RED-first order, not a package defect.
- R1 was skipped lawfully (rule 2a: the design gate answered T1 and T2 both NO); there is no R1 findings file — check the skip's lawfulness against the gate record in `tasks.md` §2.1.
- Charter: the loop's R2 package review (skill `cdd-spec-review`, package mode) — you may read `skills/cdd-spec-review/SKILL.md` for the review method.

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the paths below, from disk at the pinned state. Loop law rule 2b — the reviewer is not the author of the artifacts under review.
- Your model family must differ from the author's model family. The brief states the author's family (`zai` / `glm-5.3`), never yours as settled fact. If you cannot establish that the families differ, say so in your findings header and stop.
- Report advisory findings (severity blocker / should / note), never verdicts. You do not edit any file except your findings file.

## Inputs (paths, pinned state)

- Repository: the working tree is **uncommitted** on branch `scaffold-honesty`, HEAD `abb97d8` (= main); every artifact under review is an uncommitted file — state that in your findings header.
- `cdd/changes/20261024-scaffold-honesty/proposal.md` — Why (PF-1 false rejections with both reproduced error strings + PF-2 word-of-mouth coupling), What Changes, Solutions Considered, Non-Goals, 3 Done-When lines, Code: globs.
- `cdd/changes/20261024-scaffold-honesty/specs/gherkin/spec.md` — the delta (two ADDED requirements: "Scaffold instruction text is not proposal content" with 4 scenarios; "Scaffold edits travel with their pins" with 2 scenarios).
- `cdd/changes/20261024-scaffold-honesty/tasks.md` — gate record §2.1, task list 3.1–3.5, Done-When traceability table, Close group 4.1–4.5.
- `cdd/changes/20261024-scaffold-honesty/reviews/mission-brief.md` — the director's mission brief (context for scope; the boundary it names is part of the charter).
- `cdd/rules.md` — the loop law (delta format law incl. ADR-0006 fence grammar; rule 2a review points; rule 2b cold reviews; rule 7 — the rule this change amends with one sentence).
- `cdd/specs/gherkin/spec.md` — living spec, 48 requirements; fit-check the two ADDED requirements against neighbors: "The scaffold passes its own doors" (near line 184, `Code: tests/smoke.mjs, lib/templates.mjs`), "Proposal scaffold carries a Capabilities section" (near line 995), "Loop law states the Done-When contract" (near line 1040), "Store copies stay byte-identical to the law sources" (single-source law, SSL3) — no re-pinning, no overlap.
- `cdd/backlog.md` — PF-1 (the mission), PF-2 (the doc line), PF-13 (the precedent fix that joined the placeholder check to validateProposal), PF-23 (resolve replaces notes), PF-32 (out of scope).
- `lib/validate.mjs` — `validateProposal` (lines ~27–38: section checks, the Done-When count `matchAll(/^Done-When:\s*\S/gm)`, the placeholder check with the `solution evaluated|scope fence|spec paths created or modified` alternation), `maskCodeSpans` (the blanking precedent), `validateTasks`/`checkRequirement` (why tasks/delta comments do not false-trip — the delta instruction comment sits before `## ADDED Requirements`; the tasks `<task>|<pin>` check runs per implementation item).
- `lib/instructions.mjs` — `PROPOSAL_INSTRUCTION` (the embedded comment whose own `Done-When: 1-5 completion criteria` line phantom-counts and whose "scope fence" phrase trips the check).
- `lib/templates.mjs` — `RULES_MD` (single law source; rule 7 is inline text, not interpolated from lib/loop-law.mjs), `proposalTemplate`.
- `tests/smoke.mjs` — S4, S22, S31, S32 (line ~614: leg 1 fresh-scaffold exactly-3 placeholder errors; leg 2 round-trip fill `fillPlaceholders` strips `<!--…-->` comments then fills `<...>` placeholders, then strict green, then archive); S38 is the highest existing S pin.
- `tests/acceptance/law-done-when.test.js` — LDW1–LDW4; LDW4 pins `PROPOSAL_INSTRUCTION` containing "Done-When: 1-5 completion criteria" verbatim (scaffold wording must not change).
- `tests/acceptance/single-source-law.test.js` — SSL3: RULES_MD and cdd/rules.md byte-identical.
- `cdd/archive/20261023-design-docs/` — PF-13's precedent fix (placeholder check joined to the existing validateProposal door).

## Scope fence

- In scope: the package as a whole — the Done-When → requirement → task chain, delta↔living-spec fit (ADDED requirements don't re-pin or contradict neighbors), reuse-first honesty, design-gate credibility (five reasoned answers; all-NO skip), verify-by realism of every task's verification clause, traceability table completeness, the rule-7 sentence's placement and single-source story, the S32-leg-2 edit's safety (does keeping the proposal comment in the round-trip fill stay strict-green only if the fix lands, and does leg 1's exactly-3 contract survive), and the unclosed-`<!--` scenario's realism (M1 advisory folded as a requirement scenario).
- Out of scope: implementation (none exists), proposing redesigns, any fix. You report findings; you do not edit files (except your findings file).

## MUST-DELIVER checklist (the charter)

1. **The chain is closed** — every Done-When line maps to ≥1 task in the traceability table; every task maps to a Done-When line or a spec requirement; no orphan in either direction.
2. **Delta fits the living spec** — two ADDED requirements, each exactly one behavior, each with one gherkin fence (ADR-0006 grammar: Feature name = heading, exactly one When per scenario, ≥1 Then, And/But continuation-only, last line the `# Verified by:` pin comment, no banned constructs); every scenario's pin names a real acceptance path (`tests/smoke.mjs` precedent: the living spec's line-184 requirement pins it); no re-pinning of scenarios the line-184/995/1040/SSL3 requirements already own; Code: globs point at files gherkin lawfully owns.
3. **Scenario verify-by realism** — each scenario is actually reachable by its named pin: S39 in tests/smoke.mjs can drive validateProposal on a synthetic store (S32 already does — read its harness); tests/acceptance/scaffold-honesty.test.js can assert the rule-7 sentence in RULES_MD and cdd/rules.md (read how SSL3 reads both).
4. **RED-first realism** — tasks 3.2/3.3 pin the fix before it exists (S39 + S32-leg-2 comment-kept fill RED against the current validator; the acceptance test RED before the sentence exists); the red observations are specified well enough that a runner cannot fake them.
5. **Reuse-first honesty** — Solutions Considered names real, opened candidates (maskCodeSpans, strip-the-comment, out-of-band instructions, narrowed vocabulary, rule-7-vs-skill for PF-2); the PF-13 precedent is correctly characterized.
6. **Scope honesty** — What Changes and the delta promise no more than PF-1's scaffold↔placeholder interplay + PF-2's doc line; Non-Goals fence the boundary (no thresholds, no split law, no tasks/delta validator change, no scaffold rewording); the mission brief's out-of-scope list is respected.

## Output protocol

- Write findings to `cdd/changes/20261024-scaffold-honesty/reviews/r2-change-review.md` — header: your model id and family, the pinned state (branch, HEAD, uncommitted), the draft-validate output you observed; then findings numbered with severity (blocker / should / note), each with the exact path:line evidence and a concrete fix suggestion; end with counts.
- Advisory only: findings never gate on their own; the deterministic validators keep gate authority.
