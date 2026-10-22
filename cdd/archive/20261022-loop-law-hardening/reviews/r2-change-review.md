# R2 package review — loop-law-hardening

**Reviewer form:** cold sub-agent session (loop law rule 2b) — not the author's session, briefed only from paths on disk.
**Model families:** reviewer `opencode-zen` (PI_PROVIDER=opencode-zen) vs author `zai` (glm-5.3) — families differ, satisfying the author-family clause.
**Repository state:** working tree on branch `law-hardening`, HEAD `901e7fe2afc706de30ead0cd02b25f183ba41b31`; the change package `cdd/changes/loop-law-hardening/` is UNCOMMITTED (untracked), as are the five brief templates and the three modified SKILL.md files. No implementation task (3.x) is ticked; design tasks 2.1 and 2.2 are ticked.

## Findings

### [should] R2-F001 — tests/smoke.mjs is in the proposal's Code: but no delta Code: glob covers it

- **Severity:** should
- **Author disposition:** fixed — `tests/smoke.mjs` added to the "Reviewer briefs live next to their skills" `Code:` line in the delta.
- **Location:** `cdd/changes/loop-law-hardening/specs/gherkin/spec.md` — "Reviewer briefs live next to their skills" Code: line (omits `tests/smoke.mjs`); `cdd/changes/loop-law-hardening/proposal.md:43` (names `tests/smoke.mjs`); `cdd/changes/loop-law-hardening/tasks.md` task 3.9 (modifies `tests/smoke.mjs`, adds S36).
- **Finding:** The proposal's `Code:` globs name `tests/smoke.mjs`, and task 3.9 edits it (smoke check S36). The delta's "Reviewer briefs live next to their skills" requirement carries the scenario "Smoke pins the briefs structurally" (spec.md:234–238, pinned `# Verified by: tests/smoke.mjs`), but that requirement's `Code:` line lists only the five brief files plus `tests/acceptance/loop-law-hardening.test.js` — it does not name `tests/smoke.mjs`. No other delta requirement's `Code:` glob covers it either. The smoke change is therefore unsponsored by any delta Code: glob: a proposal↔delta coherence gap and a sponsorship gap.
- **Impact:** The spec-drift guard (L2 staleness / uncovered-code check) would flag `tests/smoke.mjs` as changed without a matching spec Code: glob, failing the deterministic gate at archive. The scenario describing the smoke behavior lives in a requirement whose Code: glob does not name the file that behavior lives in.
- **Smallest safe fix:** Add `tests/smoke.mjs` to the "Reviewer briefs live next to their skills" requirement's `Code:` line.

### [note] R2-F002 — Implementation section holds 9 subtasks; split-signal boundary is unrecorded

- **Severity:** note
- **Author disposition:** fixed — `split-considered:` line recorded after task 3.9 (implementation count 8: tasks 3.2–3.9, 3.1 is the package review; kept whole because the clauses are one law-hardening seam).
- **Location:** `cdd/changes/loop-law-hardening/tasks.md` §3 (3.1–3.9); rule 6 (`cdd/rules.md`).
- **Finding:** §3 lists 9 subtasks (3.1–3.9). Rule 6's split signal fires at "more than 8 implementation subtasks". The tasks-template comment labels 3.1 a "review task" rather than an implementation subtask, which would put the implementation count at exactly 8 (3.2–3.9) — at, not over, the boundary. No `split-considered:` line is recorded (the only occurrence is the template comment at tasks.md:30). The count is ambiguous and the boundary is unrecorded.
- **Impact:** If 3.1 counts as an implementation subtask, the split signal fired and the "split-considered: kept whole because …" record required by rule 6 is missing. Low impact (9 < 12, so strict validation still passes), but the author should confirm the count and record the decision.
- **Smallest safe fix:** Either record a `split-considered:` line, or state in §2 that 3.1 is a review task and the implementation count is 8.

### [note] R2-F003 — "npm test exits 0" Done-When is not directly verified by any task

- **Severity:** note
- **Author disposition:** fixed — task 4.3's verify-by now runs the full sweep (`npm test` exits 0 and the guard exits 0) alongside cdd validate strict.
- **Location:** `cdd/changes/loop-law-hardening/proposal.md:42` (Done-When 5); `cdd/changes/loop-law-hardening/tasks.md` traceability table ("dead `const law` binding gone, npm test exits 0, guard exits 0 | 3.7, 4.3").
- **Finding:** Done-When 5 names "npm test exits 0" as a gate. The traceability table maps it to tasks 3.7 and 4.3, but 3.7's verify-by runs only `node --test tests/acceptance/review-wiring.test.js`, and 4.3 runs `cdd validate` strict + the guard — neither runs the full `npm test` sweep.
- **Impact:** The full-sweep assertion is implied by the individual test files going green, but no single task's verify-by actually runs `npm test`. Minor coverage gap in verify-by realism.
- **Smallest safe fix:** Add `npm test` to task 4.3's verify-by (or a dedicated final task).

### [note] R2-F004 — Brief templates (a delta deliverable) are created and ticked in the Design phase

- **Severity:** note
- **Author disposition:** fixed — the Design section records the sanctioned bootstrap ordering (task 2.2 creates the briefs before the delta so R1/R2 instantiate real templates; director-confirmed at handshake).
- **Location:** `cdd/changes/loop-law-hardening/tasks.md` task 2.2 (ticked `[x]`, in §2 Design); delta ADDED requirement "Reviewer briefs live next to their skills".
- **Finding:** The five brief templates are a deliverable of this change (delta ADDED requirement, proposal Code:), yet task 2.2 in the Design section creates them and is ticked before the delta is drafted. This inverts the normal loop ordering (delta → implement). The inversion is justified by bootstrapping — R1 already consumed the briefs (task 2.2's "re-verified after R1" note) — but the ordering is not recorded as such.
- **Impact:** Mild process-coherence oddity; no gate impact. Worth a one-line note in §2 that the briefs are created early to bootstrap the review points this change itself mandates.
- **Smallest safe fix:** Add a sentence to §2 recording the bootstrap ordering.

### [note] R2-F005 — ADR-0010 "prior silence on both" vs proposal's "silent on model family"

- **Severity:** note
- **Author disposition:** fixed — the proposal's ADR bullets now state ADR-0010 is silent on both family and the two-axes-two-sessions split, matching the delta's amendment scenario.
- **Location:** `cdd/changes/loop-law-hardening/specs/gherkin/spec.md` (scenario "ADR-0010 carries the rule-2b amendment": "noting the prior silence on both"); `cdd/changes/loop-law-hardening/proposal.md` (What Changes ADR bullet: "ADR-0010 is silent on model family").
- **Finding:** The delta's amendment scenario claims ADR-0010's "prior silence on both" (family + two-sessions), while the proposal explicitly claims silence only on model family and describes two-axes-two-sessions as "recorded" without a silence claim. Minor wording nuance between the two artifacts.
- **Impact:** Cosmetic; the amendment content is otherwise coherent. No gate impact.
- **Smallest safe fix:** Align the proposal's ADR bullet to state silence on both, or soften the delta's "on both".

## Coverage and verification

- Read in full: `cdd/rules.md`, `cdd/changes/loop-law-hardening/proposal.md`, `tasks.md`, `specs/gherkin/spec.md` (delta), and `cdd/specs/gherkin/spec.md` (living spec).
- MODIFIED legality checked scenario-by-scenario: "Loop law names three review points" (6 living → 6 restated + 1 new), "Reviews run cold" (5 living → 5 restated + 2 new), "Reviewer-independence ADR is drafted" (3 living → 3 restated + 1 new). No scenario silently dropped; no REMOVED requirements.
- Coverage: all 5 Done-When lines map to ≥1 delta requirement; all 7 delta requirements map to ≥1 task. Sponsorship: no orphan tasks or requirements found (task 3.6 store-mirror is sponsored by the byte-identity Done-Whens; task 3.2 RED-first is sponsored by the "pinned by …" Done-Whens).
- Verify-by realism: every implementation task's verify-by names an existing command or test file; the new pin file `tests/acceptance/loop-law-hardening.test.js` is the change's own RED-first deliverable (task 3.2), so its absence at draft-green is expected.
- Confirmed via `git status`/`grep`: `tests/smoke.mjs` absent from all delta Code: globs (R2-F001); 9 subtasks in §3 (R2-F002); no `split-considered:` record.

## Brief template friction

- The scope fence says the brief templates "predate this review" — misleading: they are this change's own deliverable, created and ticked in task 2.2 (Design) before the delta. The brief should say "created by this change's task 2.2" rather than "predate".
- The brief asserts the reviewer's model family ("opencode-zen/deepseek-v4-pro") as a hardcoded fact; the reviewer can only confirm its provider (`PI_PROVIDER=opencode-zen`), not the lineage string. The brief-r2 template's own "If you cannot establish that, say so" guard is the right escape hatch, but the instantiated brief should not state the lineage as settled.
- "no implementation task ticked yet" is clear for 3.x, but design tasks 2.1/2.2 are ticked; a one-line note that design ticks are expected at draft-green would remove ambiguity.
- The MUST-DELIVER checklist item 4 ("every REMOVED carries a Reason: line") is unconditional in wording but this delta has no REMOVED requirements; a "where present" qualifier would match the conditional reality.

**Author note on template friction (all four items fixed in this change's working tree):** the session-requirements bullet in all five briefs now tells the reviewer to verify its own family from its runtime environment (`PI_PROVIDER`) — the brief states the author's family, never the reviewer's as settled fact; brief-r2.md's artifact line notes design-section ticks are expected at draft-green; its MUST-DELIVER 4 reads "every REMOVED, where present, carries a `Reason:` line"; its instantiation checklist gained the bootstrap-deliverable bullet ("say which task created it — never word it as predating the review"). Task 2.2 un-ticked, briefs re-edited, verify-by re-run green, re-ticked with an inline `re-verified after R2` record.
