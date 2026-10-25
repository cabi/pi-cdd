# R3 spec-axis review — 20261024-scaffold-honesty

## Change identity

- Change: `cdd/changes/20261024-scaffold-honesty/` — fix PF-1 (the proposal scaffold's own instruction text never phantom-counts as a Done-When line and never trips the placeholder check on its own phrases) + land PF-2's law line (scaffold edits travel with their smoke pins).
- Review point: R3 spec axis, at implementation-green. Question: does the implementation diff deliver **every requirement and every scenario** of the spec delta, and **nothing unsponsored** beyond it?
- Charter: the loop's R3 code review, spec axis (skill `cdd-code-review` — you may read `skills/cdd-code-review/SKILL.md` for the method).

## Pinned state

- Branch `scaffold-honesty`, HEAD `abb97d8` (= main). Everything under review is **uncommitted**: tracked modifications `lib/validate.mjs`, `lib/templates.mjs`, `cdd/rules.md`, `tests/smoke.mjs` plus untracked `tests/acceptance/scaffold-honesty.test.js`. State this in your findings header.
- `cdd/backlog.md` carries one appended PF-34 line owned by the director — **excluded**.
- Verified green before dispatch: `node tests/smoke.mjs` 38/38; `npm test` 40/40; `node cdd/scripts/spec-drift.mjs` clean; `cdd validate` draft PASS.
- Red records: `cdd/changes/20261024-scaffold-honesty/reviews/red-records.md` holds the observed pre-fix failures (both PF-1 defect faces) and the order note.

## The contract (what the diff must deliver)

- Delta: `cdd/changes/20261024-scaffold-honesty/specs/gherkin/spec.md` — two ADDED requirements:
  1. **"Scaffold instruction text is not proposal content"** — 3 scenarios: (a) comment-kept fill with exactly 5 author-written Done-When lines validates clean; (b) the instruction's own phrases never trip the placeholder check; (c) an unclosed `<!--` opener is not masked and still flags. Pins: `# Verified by: tests/smoke.mjs`.
  2. **"Scaffold edits travel with their pins"** — 2 scenarios: rule 7 states the scaffold↔pin coupling (S-series, tests/smoke.mjs); the store copy carries the same sentence single-sourced. Pins: `# Verified by: tests/acceptance/scaffold-honesty.test.js`.
- Proposal `What Changes` / `Non-Goals` / `Done-When` lines and the tasks traceability table in the same folder complete the contract; `cdd/specs/gherkin/spec.md` (living spec, 48 requirements) is the fit boundary — the ADDED requirements must not re-pin what neighbors already own (esp. "The scaffold passes its own doors" near line 184, "Loop law states the Done-When contract" near line 1040, SSL3's byte-identity requirement).

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Loop law rule 2b. Read only what this brief names, from disk.
- Your model family must differ from the author's (`zai` / glm-5.3). If you cannot establish that, say so in your findings header and stop.
- Report advisory findings (severity blocker / should / note), never verdicts. You do not edit any file except your findings file.

## MUST-DELIVER checklist (the charter)

1. **Every scenario implemented and pinned** — map each of the 5 scenarios to its implementation and its pin, with path:line evidence: (1a)/(1b) → S39 leg 1 in `tests/smoke.mjs` (comment kept, 5 author lines, strict-green) driving `validateChange`; (1c) → S39 leg 2 (unclosed opener still trips "placeholders still unfilled"); (2a) → SH1 asserting the sentence in `RULES_MD` rule 7; (2b) → SH2 asserting it in `cdd/rules.md`. Verify each pin actually executes the claim (not a weaker proxy).
2. **The mask's scope matches the delta's promise** — `maskHtmlComments` in `lib/validate.mjs` masks only closed `<!-- … -->` blocks, only for the Done-When count and the placeholder check; section checks and the `Code:` check stay on raw text; tasks/delta validators untouched; no thresholds, caps, or gates changed (Non-Goals fence).
3. **Nothing unsponsored** — the diff carries no behavior beyond the delta + what the doors demanded (S32 leg-2's fill edit is the round-trip contract update scenario 1 names; the proposal's Governing-decisions block is citation, not new behavior; `cdd/rules.md`'s 5-line change is the sentence + wrap). Flag anything that exceeds or sidesteps the contract.
4. **Scaffold wording unchanged** — `lib/instructions.mjs` untouched; LDW4's verbatim pin still passes (`tests/acceptance/law-done-when.test.js`).
5. **Living-spec fit** — the ADDED requirements don't duplicate or contradict the neighbors named above; pins don't re-pin S32 leg 1's fresh-scaffold-red contract (R2 already removed that duplicate — verify it stayed removed).
6. **Ticks and evidence agree** — tasks 3.1–3.5 ticked with verify-by claims that `reviews/red-records.md` and the current green runs actually support (re-run what you need: `node tests/smoke.mjs`, `node --test tests/acceptance/scaffold-honesty.test.js`).

## Scope fence

- In scope: the implementation diff + the new test file, judged against the change's own delta/proposal/tasks.
- Out of scope: `cdd/backlog.md`; redesigning the fix; the R2 package review (already disposed — `reviews/r2-change-review.md` is context); any fix. You report findings; you do not edit files except your findings file.

## Output protocol

- Write findings to `cdd/changes/20261024-scaffold-honesty/reviews/r3-spec-findings.md` — header: your model id and family, the pinned state (branch, HEAD, uncommitted, exclusions), the green evidence you re-ran yourself; then numbered findings with severity (blocker / should / note), each with exact path:line evidence and a concrete fix suggestion; end with counts.
- Advisory only: findings never gate on their own; the deterministic validators keep gate authority.
