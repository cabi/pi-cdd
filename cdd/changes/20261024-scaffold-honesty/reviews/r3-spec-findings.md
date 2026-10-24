# R3 spec-axis findings — 20261024-scaffold-honesty

- Reviewer model: `opencode-zen/gpt-6-luna`; family: `opencode-zen` (runtime provider/model: `opencode-zen` / `gpt-6-luna`). This differs from the author's `zai` / `zai/glm-5.3` family.
- Pinned state: branch `scaffold-honesty`, HEAD `abb97d8` (= `main`). All change artifacts and implementation edits are uncommitted: tracked edits to `lib/validate.mjs`, `lib/templates.mjs`, `cdd/rules.md`, and `tests/smoke.mjs`; untracked `cdd/changes/20261024-scaffold-honesty/` and `tests/acceptance/scaffold-honesty.test.js`. `cdd/backlog.md` is excluded from this review.
- Green evidence rerun by this reviewer: `node tests/smoke.mjs` — exit 0, 38/38; `node --test tests/acceptance/scaffold-honesty.test.js` — exit 0, 2/2; `npm test` — exit 0, 40/40 acceptance suites (and smoke/tool pins green); `node cdd/scripts/spec-drift.mjs` — exit 0, clean (5 specs, 40 acceptance test files); `cdd validate` draft for this change — PASS.
- Advisory only; deterministic validators retain gate authority.

## Coverage checks

1. **Comment-kept fill at the five-line cap (1a):** The delta scenario is at `cdd/changes/20261024-scaffold-honesty/specs/gherkin/spec.md:10-14`. S39 fills the scaffold in place, substitutes exactly five author-written Done-When lines, retains the proposal comment, and validates the result at `tests/smoke.mjs:656-668`. The test uses strict mode; `lib/validate.mjs:190-197, 220-232` shows strict projects the same run including all draft errors, so a green strict verdict also establishes no proposal errors.
2. **Instruction phrases do not trip the placeholder check (1b):** The delta scenario and smoke pin are at `cdd/changes/20261024-scaffold-honesty/specs/gherkin/spec.md:16-20` and `tests/smoke.mjs:656-668`. The comment-kept full fill is checked through the real `validateChange` path. `lib/validate.mjs:35-41, 64-65` masks closed comments for the count and placeholder checks only.
3. **Unclosed opener remains live (1c):** The delta scenario is at `cdd/changes/20261024-scaffold-honesty/specs/gherkin/spec.md:23-27`; S39 changes a Done-When line to `Done-When: <!-- ...` and asserts the placeholder error at `tests/smoke.mjs:669-674`. `lib/validate.mjs:40, 64-65` leaves an unclosed opener unmasked and detects it.
4. **Rule 7 states the coupling (2a):** The delta scenario is at `cdd/changes/20261024-scaffold-honesty/specs/gherkin/spec.md:39-43`; SH1 checks rule 7 in `RULES_MD` at `tests/acceptance/scaffold-honesty.test.js:51-54`. The sentence is in the source at `lib/templates.mjs:51-54`.
5. **Store copy carries the sentence (2b):** The delta scenario and its named pin are at `cdd/changes/20261024-scaffold-honesty/specs/gherkin/spec.md:45-49` and `tests/acceptance/scaffold-honesty.test.js:56-59`. The corresponding text is present in `cdd/rules.md:94-97`; see Finding 1 for the byte-identity assertion gap in this specific pin.

The validator change is scoped to `validateProposal` and `maskHtmlComments` (`lib/validate.mjs:27-41, 57-66`): section and `Code:` checks still inspect raw text; only the Done-When count and placeholder scan use masked text; task/delta validators, caps, and gates are unchanged. The S32 leg-2 edit keeps comments only in the proposal while leaving task/delta comment handling unchanged (`tests/smoke.mjs:624-630`), as the proposal and Non-Goals require. The rule-7 sentence is the only law-text addition in `lib/templates.mjs` and `cdd/rules.md`; `lib/instructions.mjs` is untouched, and the LDW4 wording pin passed in the rerun `npm test`. The added delta requirements concern comment-kept proposal validation and rule 7; they do not re-pin the fresh-scaffold-red scenario owned by the living requirement at `cdd/specs/gherkin/spec.md:184-197` or duplicate the separate rule-3 Done-When contract near `cdd/specs/gherkin/spec.md:1040-1052`.

Tasks 3.1–3.5 are ticked at `cdd/changes/20261024-scaffold-honesty/tasks.md:70-74`. Their red evidence and the post-fix green evidence are recorded at `cdd/changes/20261024-scaffold-honesty/reviews/red-records.md:5-53`; its order note explicitly records that the full green sweep for task 3.4 occurred after task 3.5, and the reruns above support those green claims.

## Findings

### 1. should — SH2's named pin does not itself prove byte identity

`cdd/changes/20261024-scaffold-honesty/specs/gherkin/spec.md:45-49` requires the sentence to be carried byte-identically and names `tests/acceptance/scaffold-honesty.test.js` as its pin. In that test, `norm` collapses all whitespace at line 40, and SH2 only checks that the normalized expected sentence occurs in the store rule block at lines 56-59. It does not compare the source sentence or rule block byte-for-byte with the store copy; different wrapping or whitespace would still pass this named pin.

The existing `tests/acceptance/single-source-law.test.js:117-119` does assert `store === tpl.RULES_MD`, and it passed under the rerun `npm test`, so the repository-wide byte-identity invariant is currently covered. To make the scenario's declared pin independently match its claim, compare the exact rule-7 blocks in SH2 (or cite both this sentence-presence test and the existing SSL3 pin in the scenario).

## Counts

- Blocker: 0
- Should: 1
- Note: 0

## Dispositions

1. **fixed** — first suggested fix taken: SH2 now asserts `ruleBlock(store, "7") === ruleBlock(tpl.RULES_MD, "7")` — the exact rule-7 block compared byte-for-byte between store copy and source, so the scenario's named pin independently proves its byte-identity claim. `tests/acceptance/single-source-law.test.js` (SSL3) keeps owning whole-file identity; SH1 keeps the sentence-presence check on the source surface via the whitespace-normalized match. Red record unchanged in meaning: SH2 still fails pre-sentence (block equality cannot hold when the source block lacks the sentence).

Post-disposition green: `node --test tests/acceptance/scaffold-honesty.test.js` exit 0; `node tests/smoke.mjs` 38/38 exit 0; `npm test` exit 0; `node cdd/scripts/spec-drift.mjs` clean exit 0.
