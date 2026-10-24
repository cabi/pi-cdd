# R3 standards findings — 20261024-scaffold-honesty

- **Reviewer model:** `opencode-zen/gpt-6-luna`
- **Model family:** `opencode-zen`; distinct from the author's `zai` / `glm-5.3` family.
- **Pinned state:** branch `scaffold-honesty`, HEAD `abb97d8` (= `main`); implementation target was uncommitted. Reviewed tracked modifications to `lib/validate.mjs`, `lib/templates.mjs`, `cdd/rules.md`, and `tests/smoke.mjs`, plus untracked `tests/acceptance/scaffold-honesty.test.js`. Excluded `cdd/backlog.md` (PF-34) and treated `cdd/changes/20261024-scaffold-honesty/` artifacts as context only.
- **Green evidence rerun:** `node tests/smoke.mjs` — 38/38; `npm test` — smoke 38/38, tool tests 18/18, `node --test` 40/40; `node cdd/scripts/spec-drift.mjs` — clean (5 specs, 40 acceptance test files); `cdd validate` draft — PASS; `git diff --check HEAD` — clean.

## Findings

1. **Severity: should — validator comments state behavioral law instead of code shape.**
   **Evidence:** `lib/validate.mjs:32-34` explains what counts as proposal content and which checks judge raw versus masked text; `lib/validate.mjs:57-63` documents when comments count as content and the outcomes for closed and unclosed comment blocks. This exceeds shape/algorithm documentation and states validator behavior in comments, contrary to ADR-0012 and the brief's requirement for the `maskHtmlComments` comment. **Suggested fix:** reduce these comments to terse implementation-shape notes (for example, that closed comment spans are blanked with spaces); leave the behavior contract to the law and tests.

2. **Severity: should — test header routes through corpus identifiers and rationale.**
   **Evidence:** `tests/acceptance/scaffold-honesty.test.js:2-7` names `PF-2`, the change, the loop law/rule 7, and explains why the sentence was added and why the test is red. ADR-0012 bars PF IDs and corpus-routing/WHY prose in comments; its test-comment allowance is for local check IDs, not this header. **Suggested fix:** remove the header rationale and use only a local purpose comment, e.g. “Verify that the rendered rules and store copy carry the scaffold-pin sentence.”

3. **Severity: note — SH2's label overstates its equality check.**
   **Evidence:** `tests/acceptance/scaffold-honesty.test.js:56` says “byte-identically,” while lines 58-59 compare `norm(block).includes(norm(SENTENCE))`, which deliberately normalizes whitespace. The separate SSL3 contract covers whole-file byte identity. **Suggested fix:** rename SH2's description to say “same whitespace-normalized sentence.”

## Counts

- Blocker: 0
- Should: 2
- Note: 1

## Dispositions

1. **fixed** — both comments reduced to single-line shape notes: the `validateProposal` comment now maps inputs to checks only ("masked text feeds the Done-When count and the placeholder pin; sections and Code: read raw text"), and `maskHtmlComments`'s doc comment is now `Blank closed comment blocks (space-filled, length-preserving); unclosed openers stay live text.` (lib/validate.mjs).
2. **fixed** — the six-line header replaced by a two-line local purpose comment: `// scaffold-honesty — rule 7's scaffold-pin sentence on both law surfaces: / // the RULES_MD source and the rendered store copy.` No PF IDs, no change/law routing, no red rationale.
3. **fixed** — SH2's check was strengthened beyond the label fix: it now asserts the store copy's rule-7 block equals the `RULES_MD` rule-7 block byte-for-byte (see r3-spec-findings.md finding 1), so the label's equality claim is exactly what the pin proves.

Post-disposition green: `node --test tests/acceptance/scaffold-honesty.test.js` exit 0; `node tests/smoke.mjs` 38/38 exit 0; `npm test` exit 0; `node cdd/scripts/spec-drift.mjs` clean exit 0.
