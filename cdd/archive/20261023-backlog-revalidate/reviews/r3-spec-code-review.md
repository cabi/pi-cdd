# R3 spec-axis review — backlog-revalidate

**Reviewer form:** cold sub-agent session (fresh session, briefed only from paths on disk).
**Reviewer model family:** opencode-zen / deepseek-v4-pro (PI_PROVIDER=opencode-zen, PI_MODEL=deepseek-v4-pro).
**Author model family:** zai (glm-5.3). Families differ — cold-review requirement satisfied.
**Repository state:** base `bef3546` (HEAD `bef3546ae566f47eb130db145bbd0f4bc5ef87af`); the change is an UNCOMMITTED working tree on branch `backlog-revalidate` — 9 tracked files changed (248 insertions, 43 deletions), plus untracked `cdd/changes/backlog-revalidate/` and `tests/acceptance/backlog-revalidate.test.js`. `git log bef3546..HEAD` is empty (feature commit happens after this review).
**Artifacts reviewed:** the implementation diff `bef3546` → working tree, against specs/extension/spec.md and specs/gherkin/spec.md (the delta), proposal.md, tasks.md, and the pin files tests/acceptance/backlog-revalidate.test.js, tests/acceptance/backlog-op.test.js, tests/smoke.mjs.

## Findings

### [note] R3S-F001 — "Add refuses a malformed premise" pin does not exercise the scenario's absent-file framing

- **Location:** cdd/changes/backlog-revalidate/specs/extension/spec.md:94-98 (scenario) vs tests/acceptance/backlog-revalidate.test.js:122-128 (RV6).
- **Provenance:** reviewer R3S, evidence: extension delta scenario + acceptance pin.
- **Evidence status:** Trace-backed.
- **Preconditions:** none — a pin-fidelity gap.
- **Trace:** The scenario's Given is "a store whose cdd/backlog.md is absent" and its Then is "the tool answers with exactly 1 error result and cdd/backlog.md is absent". RV6 instead seeds a store with one item (`storeWith(["- PF-1 [open] alpha | source: run-a"])`) and asserts `r.isError` plus `fileOf(root) === before` (file unchanged), never the absent-file state. The refusal and no-write behavior are pinned — a regression that made `add` accept `grep:x` would fail `r.isError` — but the literal absent→absent framing the scenario names is not exercised.
- **Expected:** the pin reproduces the scenario's Given/Then (absent file stays absent on refusal). **Actual:** the pin uses a present file and asserts "unchanged", an equivalent no-write check but not the scenario's stated precondition/outcome.
- **Impact:** negligible to the refusal guarantee (both forms detect a write); the gap is that the scenario's exact observable is not the one tested, so a reader cannot confirm the absent-file path from the pin alone.
- **Smallest safe fix:** either seed RV6 with an absent store and assert the file is still absent, or reword the scenario's Given/Then to the present-file "unchanged" form the pin actually tests.

### [note] R3S-F002 — force-a-disposition verdict wording "3 verified dates unchanged" is misleading

- **Location:** lib/backlog.mjs:356 (verdict text) vs cdd/changes/backlog-revalidate/specs/extension/spec.md:126-130 (scenario).
- **Provenance:** reviewer R3S, evidence: implementation diff + extension delta scenario.
- **Evidence status:** Trace-backed.
- **Preconditions:** an active item reaches its third verified date.
- **Trace:** The scenario's Then is "that item's verdict line carries the force-a-disposition flag and its verified segment holds exactly 3 dates". The code emits `— ${stamped.length} verified dates unchanged, force a disposition (…)`, i.e. "3 verified dates unchanged, force a disposition". The flag "force a disposition" is present, so the scenario is satisfied; but "3 verified dates unchanged" reads as if the dates are unchanged, when a third date was just stamped — what is unchanged is the disposition. The phrase is ambiguous to a user reading the verdict.
- **Expected:** the verdict states that the disposition is unchanged after N verified dates. **Actual:** the wording attaches "unchanged" to the dates, not the disposition.
- **Impact:** a user-facing message that can be misread; no behavioral or spec-conformance impact.
- **Smallest safe fix:** reword to e.g. "3 verified dates, disposition unchanged — force a disposition (…)".

## Coverage and verification

- **Every scenario implemented:** all 22 extension-delta scenarios and all 7 gherkin-delta scenarios trace to diffed code. The new grammar (premise/verified parse, `parsePremise`/`parseVerified`/`parseLine` EXPECT-chain extension), the revalidate verdicts (hold/ROTTED/NOT-MECHANICAL/ANCHOR-GONE), the list staleness block, and the rule-13 non-enumeration wording are each produced by a code change in lib/backlog.mjs, index.ts, lib/templates.mjs, and cdd/rules.md. No scenario's THEN is untraceable.
- **Pins actually pin:** each `# Verified by:` acceptance test exercises the pinned behavior such that a regression would fail it. RV1-RV13 in tests/acceptance/backlog-revalidate.test.js cover the new scenarios; BO1-BO12 in backlog-op.test.js and S37 in tests/smoke.mjs cover the pre-existing and gherkin scenarios. The two fidelity notes above are the only deviations found.
- **No unsponsored code:** every hunk serves a delta requirement or a ticked task's verify-by. New exports (ACTIONS, STATUSES, ACTIVE_STATUSES, PREMISE_FORMS_DOC, DATE_RE) are all consumed; the dogfood edits to cdd/backlog.md (premise backfills, header conventions line, PF-10/PF-11 done-resolves, PF-23 mint) are sponsored by ticked task 3.8 and its verify-by reviews/dogfood-revalidate.md. No dead code, speculative hooks, or drive-by refactors found.
- **Not run (read-only):** `cdd validate` strict, the drift guard, and the test suites — the brief's Close precondition is taken as stated; the diff was inspected statically.

## Dispositions (author, post-review)

- R3S-F001 — fixed: RV6 reseeded with an absent store (mkdtemp, no initStore) and now asserts exactly 1 error with cdd/backlog.md still absent — the scenario's Given/Then exercised literally (the premise check runs before any disk touch, lib/backlog.mjs addBacklogItem). Suite 14/14 green.
- R3S-F002 — fixed: verdict reworded to "— N verified dates, no disposition change — force a disposition (fix via change, won't-do with reason, or superseded-by)" (lib/backlog.mjs:356); RV11's /force a disposition/ pin stays green, and the delta scenario pins the flag without quoting the wording, so no delta edit was needed.
