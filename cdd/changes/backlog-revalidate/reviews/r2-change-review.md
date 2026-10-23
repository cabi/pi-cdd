# R2 package review — backlog-revalidate

**Reviewer form:** cold sub-agent session (fresh session, briefed only from paths on disk).
**Reviewer model family:** opencode-zen / deepseek-v4-pro (PI_PROVIDER=opencode-zen, PI_MODEL=deepseek-v4-pro).
**Author model family:** zai (glm-5.3). Families differ — cold-review requirement satisfied.
**Repository state:** commit `bef3546` (HEAD `bef3546ae566f47eb130db145bbd0f4bc5ef87af`); the change artifacts are UNCOMMITTED/untracked in the working tree (branch `backlog-revalidate`, `?? cdd/changes/backlog-revalidate/`). No staged or unstaged tracked-file changes; the whole change is the untracked folder.
**Artifacts reviewed:** proposal.md, tasks.md (design gate §2 — T2/T4 NO, so no design.md per rule 2c), specs/extension/spec.md, specs/gherkin/spec.md, against living specs cdd/specs/extension/spec.md and cdd/specs/gherkin/spec.md, and cdd/rules.md.
**Draft-green precondition:** taken as stated by the brief (validate draft passes, no implementation task ticked); not re-run here (read-only review).

## Findings

### [should] R2-F001 — `verified`-segment validation is claimed but not scenario-pinned — **disposed fixed:** two scenarios added ("A malformed verified segment refuses every action", "Out-of-order verified dates refuse every action"), both pinned tests/acceptance/backlog-revalidate.test.js

- **Location:** cdd/changes/backlog-revalidate/specs/extension/spec.md:5 (prose) vs scenarios at :70, :84; cdd/changes/backlog-revalidate/tasks.md §2 design note ("`verified:` holds strictly-increasing ISO dates").
- **Provenance:** reviewer R2, evidence: extension delta prose + scenario list.
- **Evidence status:** Trace-backed.
- **Preconditions:** none — a spec-coverage gap, present at draft-green.
- **Trace:** The extension delta prose (line 5) states the op refuses "any off-grammar item line — including a malformed premise or verified segment". The only refusal scenarios are "A malformed premise refuses every action" (:70) and "Add refuses a malformed premise" (:84) — both premise-only. No scenario pins a malformed `verified` segment refusing, a non-increasing (out-of-order) verified date refusing, or `add` refusing a `verified` segment (the design note says only `add` may carry a premise, never `verified`).
- **Expected:** every behavioral claim in the prose has a scenario pinning it. **Actual:** the `verified`-segment validation claim (and the "strictly-increasing" property) has zero scenario coverage.
- **Impact:** the `verified` grammar's validation behavior is unverifiable by the acceptance suite; a future regression in verified-date validation would pass silently.
- **Smallest safe fix:** add one scenario pinning a malformed `verified` segment refusing every action (and, if the strictly-increasing property is intended law, a scenario pinning an out-of-order date refusing).

### [should] R2-F002 — `grep:` exact-count evaluation is not scenario-pinned — **disposed fixed:** scenario "Grep premises evaluate by exact line count" added (=1 → hold, =2 against 1 matching line → ROTTED), pinned tests/acceptance/backlog-revalidate.test.js

- **Location:** cdd/changes/backlog-revalidate/proposal.md:9 (grep micro-form) vs cdd/changes/backlog-revalidate/specs/extension/spec.md:84, :95.
- **Provenance:** reviewer R2, evidence: proposal + extension delta scenarios.
- **Evidence status:** Trace-backed.
- **Preconditions:** none — a spec-coverage gap.
- **Trace:** The proposal (line 9) defines `grep:<literal>@<path>=<n>` with "n = exact count of lines containing the literal as a plain substring" — the most novel evaluation logic in the premise evaluator. The delta scenarios exercise `grep:` only as (a) a malformed form (`grep:x`, :84) and (b) a vanished anchor (`A vanished grep anchor reports ANCHOR-GONE`, :95). No scenario shows a `grep:` premise evaluating to `hold` (count matches) or `ROTTED` (count mismatches). The "Revalidate reports a verdict" scenario (:88) uses form-agnostic "premise holds"/"premise is false" items and does not guarantee grep-count coverage.
- **Expected:** the exact-count matching behavior is pinned by a scenario. **Actual:** the count-matching half of the grep form is untested.
- **Impact:** the core evaluation of the most complex premise form can regress undetected.
- **Smallest safe fix:** add a scenario where a `grep:` premise with a matching count reports `hold` and one with a mismatching count reports `ROTTED`.

### [note] R2-F003 — revalidate verdict semantics live only in scenarios, not prose — **disposed fixed:** the requirement description now names the verdict set and the ROTTED-vs-ANCHOR-GONE distinction

- **Location:** cdd/changes/backlog-revalidate/specs/extension/spec.md:5 (prose) vs :88, :95 (scenarios).
- **Provenance:** reviewer R2, evidence: extension delta.
- **Evidence status:** Trace-backed.
- **Preconditions:** none — a clarity gap.
- **Trace:** The prose (line 5) says only "revalidate re-checks premise-bearing active items against the store" and never names the four verdicts or their semantics. The distinction between `ROTTED` (premise evaluates false) and `ANCHOR-GONE` (a `grep:` premise names a path that does not exist) is recoverable only from the two scenarios (:88, :95).
- **Expected:** the prose states the verdict set and the ROTTED-vs-ANCHOR-GONE distinction. **Actual:** the distinction is implicit in scenario wording.
- **Impact:** a reader (or future author) cannot tell from the prose whether ANCHOR-GONE is a distinct verdict or a special case of ROTTED.
- **Smallest safe fix:** one prose sentence naming hold/ROTTED/NOT-MECHANICAL/ANCHOR-GONE and stating that ANCHOR-GONE is the grep-path-missing case.

### [note] R2-F004 — `watch` and `seeded-into-change` revalidate coverage is thin — **disposed fixed:** the verdict scenario now holds a watch item (hold) and a seeded-into-change item (ROTTED) alongside the three open items and asserts exactly 5 verdict lines

- **Location:** cdd/changes/backlog-revalidate/proposal.md:10 vs cdd/changes/backlog-revalidate/specs/extension/spec.md:88, :102.
- **Provenance:** reviewer R2, evidence: proposal + extension delta scenarios.
- **Evidence status:** Trace-backed.
- **Preconditions:** none — a coverage gap.
- **Trace:** The proposal (line 10) says revalidate evaluates "every premise-bearing active item (open, watch, seeded-into-change)". The verdict-reporting scenario (:88) exercises only `open` (hold/ROTTED/NOT-MECHANICAL) and `done` (excluded). `watch` appears only in the idempotency scenario (:102, statuses open/watch/done); `seeded-into-change` appears in no revalidate scenario at all.
- **Expected:** each claimed active status is exercised by a revalidate scenario. **Actual:** `seeded-into-change` revalidation is unpinned and `watch` verdict reporting is unpinned.
- **Impact:** a regression that skips `seeded-into-change` items during revalidate would pass the suite.
- **Smallest safe fix:** extend the verdict-reporting scenario (or add one) to include a `watch` and a `seeded-into-change` premise-bearing item.

## Coverage and verification

- Inspected: proposal.md, tasks.md (design gate §2 + traceability table), both delta specs, both living specs (the three MODIFIED requirements and their full scenario sets), cdd/rules.md.
- MODIFIED legality verified: all three MODIFIED requirements restate every living scenario (extension "The backlog op triages findings on disk" 9/9; gherkin "Process findings land in the backlog" 3/3; gherkin "The backlog triage skill is bundled" 2/2). No REMOVED requirements, so no `Reason:` obligation.
- Coverage verified: 4 Done-When lines each map to ≥1 task in the traceability table; all 3 delta requirements map to tasks (extension → 3.2/3.3/3.4/3.5/3.6; gherkin process-findings → 3.5; gherkin triage-skill → 3.7).
- Sponsorship verified: no orphan tasks (3.1 and 4.x are the standard review/Close scaffold; 3.8's header-conventions-line detail is sponsored by the proposal's Capabilities note "header conventions line … data edits riding this change's sponsorship").
- Verify-by realism: every task verify-by names an existing command or a test-first file (`tests/acceptance/backlog-revalidate.test.js` does not yet exist — expected, created test-first); every scenario pin names a real acceptance path (`backlog-op.test.js`, `tests/smoke.mjs` exist; `backlog-revalidate.test.js` is the new test-first file).
- Same-change coherence: proposal ↔ delta ↔ tasks describe one change (premise/verified grammar + revalidate + list staleness + rule-13 non-enumeration + triage-skill laws + dogfood); no contradictions found.
- Not run (read-only): `cdd validate` draft/strict, the drift guard, and the test suites — the brief's draft-green precondition is taken as stated.
