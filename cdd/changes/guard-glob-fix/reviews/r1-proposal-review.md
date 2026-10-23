# R1 proposal review — guard-glob-fix

- **Review point:** R1 (after the proposal, because the design gate answered T2 = YES)
- **Mode:** proposal
- **Skill:** cdd-spec-review
- **Reviewer form:** cold standalone subagent session; model `opencode-zen/deepseek-v4.1-flash`; not the author of any reviewed artifact; non-zai family
- **Date:** 2026-10-23
- **Range:** branch `guard-glob-fix` @ `24fc6f829bffc4c04fffa081a05a7071a29c5995`; the whole change (`cdd/changes/guard-glob-fix/`) is uncommitted/untracked. Findings are **advisory**; the author disposes. No verdicts.
- **Design gate record:** `cdd/changes/guard-glob-fix/tasks.md` §2.1 — T1 NO, T2 YES, T3 NO, T4 YES, T5 NO; chosen shape + `design.md` at the change root, C4 **Component** level. Credible: T2/T4 YES correctly forces the design, and Component is justified (the risk lives in the claim-resolution pipeline inside one script, `scripts/spec-drift.mjs`, feeding all three door modes; no external system boundary moves). `design.md` has exactly the four required sections, exactly one C4 flowchart with element-kind labels, and Code level is not used.

## Findings

### [blocker] B1 — A1 citation set is incomplete; the change cannot pass its own `[A1]` guard today

- **Location:** `cdd/changes/guard-glob-fix/proposal.md` §"Decisions followed" (names only ADR-0001, ADR-0006, ADR-0007) vs the delta `Code:` globs.
- **Evidence (reproduced):** `node cdd/scripts/spec-drift.mjs` at the change root exits 1 and prints
  `[A1] change guard-glob-fix touches code governed by ADR-0010 (cdd/decisions/0010-reviewer-independence-is-loop-law.md; e.g. cdd/rules.md) — cite "ADR-0010" in the proposal (follow it) or supersede the decision first`.
  A1 scans every `Code:` glob in the delta (`…/specs/gherkin/spec.md`, `…/specs/adr/spec.md`); the adr delta edits `cdd/rules.md`, which ADR-0010 claims. ADR-0008/0009/0011 also overlap the delta but are only satisfied incidentally (their tokens appear as fallout-table row text in `design.md`, not as citations), so they are fragile too.
- **Impact:** Done-When DW4 ("guard full scan exits 0 at tip with fixed compiler") and the Close pin `tests/acceptance/decisions-home.test.js:94` (DH6, asserts real-repo full scan exit 0) cannot hold. The change's core proof is red on its own artifact.
- **Smallest safe fix:** add the missing ADR numbers to "Decisions followed" in `proposal.md` — at minimum `ADR-0010`, and name ADR-0008/0009/0011 explicitly so the pass does not depend on incidental fallout-table text.

### [should] S1 — a fifth Done-When criterion exists in `tasks.md` but not in the proposal

- **Location:** `tasks.md` §"Done-When Traceability" vs `proposal.md` §"Done-When" (4 lines).
- **Evidence (trace-backed):** the traceability table carries an extra criterion, "the 8 over-claiming living Code lines name implementation surface only", traced to 3.3 and 3.8, plus a "backlog marks PF-19/PF-20 done" half traced to 3.9/4.6. Neither is anchored to a proposal Done-When line.
- **Impact:** the proposal's observability fence is one requirement short of what tasks claims to verify; the 8-line correction and the backlog disposition are announced in What Changes ("removes `cdd/decisions/` from the 8 lines") but unobservable in Done-When. Propsal-mode Done-When is capped at ≤5, so this is an editing gap, not a cap violation.
- **Smallest safe fix:** fold the 8-line correction and backlog disposition into an existing Done-When line (e.g. DW1's second clause), or make the tasks traceability column point at the What-Changes bullet it already covers.

### [note] N2 — delta drafted before R1, inverting the rule-2a order

- **Location:** `cdd/changes/guard-glob-fix/tasks.md` — 3.1 (proposal) and 3.3 (delta) are `[x]`, 3.2 (this R1 review) is `[ ]`.
- **Impact:** the proposal and delta were both frozen before the proposal review, so R1 cannot influence the delta shape; the gate's leverage is reduced.
- **Smallest safe fix:** none required (advisory); if the author reorders, tick 3.2 before 3.3 in future changes.

### [note] N3 — Fallout inventory scope wording and Consequences omission

- **Location:** `design.md` §"Fallout inventory" (header says "every star/class Code glob") and §"Consequences" ("only star globs left are `cdd/scripts/**`").
- **Evidence (trace-backed):** the table includes `gherkin/spec.md:879`, a literal `cdd/decisions/0011-…md` (not a star/class glob); and the surviving-glob sentence omits ADR-0001's `scripts/**`, which is a star glob and works under both compilers.
- **Impact:** the boundary inventory is slightly under-labelled; the remediation itself is correct (the 7 gherkin + 1 adr rows and the 3 reds 0005/0006/0007 are accurate — verified: adr spec last commit `28423ec`, stale vs the delta's base commits for 0005/0006/0007 only, 0001–0004 not stale).
- **Smallest safe fix:** retitle to "living Code lines that claim decision memory" and add ADR-0001's `scripts/**` to the surviving-glob list.

### [note] N4 — repo-only handles in `design.md` (DH6, PF-19/PF-20, A2, L2)

- **Location:** `design.md` §"Boundaries"/§"Consequences" (`DH6`), §"Alternatives", `proposal.md` (`PF-19`, `PF-20`).
- **Evidence (trace-backed):** `DH6` is glossed only as "the decisions-home pin"; the others are unexpanded backlog/loop handles. No rule forbids this in a change `design.md` (`lawRule2c` in `lib/loop-law.mjs:142-156` bans repo names only in the law text; `tests/acceptance/design-docs.test.js` DD7 does not cover a change's design doc), so this is a readability note against the adopter-generic intent.
- **Smallest safe fix:** expand each handle on first use.

### [note] N5 — the 10 `[L1]` missing-pin reds are the intended RED-first state

- **Location:** `node cdd/scripts/spec-drift.mjs` output.
- **Evidence (reproduced):** 10× `[L1] … pins "tests/acceptance/guard-glob-claims.test.js|guard-memory-claims.test.js" but that file does not exist`.
- **Impact:** none — 3.5/3.7 write those tests RED-first. Called out so the B1 red (`[A1]`) is not confused with the expected pin reds.

## Coverage

Read: `skills/cdd-spec-review/SKILL.md`, `cdd/rules.md` (2a/2c/3/4), `proposal.md`, `design.md`, `tasks.md`, the gherkin/adr deltas, `cdd/specs/gherkin/spec.md`, `cdd/specs/adr/spec.md`, `cdd/backlog.md` (PF-19/PF-20), `scripts/spec-drift.mjs` (globToRe:220-226, arg parsing ~117, A1/A2, the three door modes), `lib/loop-law.mjs`, `tests/acceptance/design-docs.test.js`, `tests/acceptance/{single-source-law,decisions-home,loop-law-hardening}.test.js`. Commands consumed (read-only): `git log/status/merge-base --is-ancestor`, `node cdd/scripts/spec-drift.mjs` (run from the repo root, full scan), `rg` over specs/ADRs. Not inspected: `npm test`/`cdd validate` (mutation-capable; not run under this review).

## Author dispositions (2026-10-23)

- B1 — fixed: proposal.md "Decisions followed" now cites ADR-0001, ADR-0006, ADR-0007, ADR-0008, ADR-0009, ADR-0010, ADR-0011 explicitly (each with how the change follows it) and states why the four extra ADRs fire (the delta's corrected Code lines re-name their governed surfaces). Verified: `node cdd/scripts/spec-drift.mjs` no longer prints the ADR-0010 finding.
- S1 — fixed: proposal.md gains the fifth Done-When line "the 8 over-claiming living Code lines name implementation surface only — the enforcement pins, never `cdd/decisions/**`"; the backlog-disposition half stays covered by the What-Changes bullet + task 4.6 (backlog op predates the feature commit, so its Done-When seat is the task itself, not an outcome of the shipped code).
- N2 — won't-fix: rule 2a orders R1 after the proposal; drafting the delta in the same session before the review runs is legal and R1's package-mode successor (R2) reviews the whole package with full leverage. Noted for future changes where review-driven delta reshaping matters.
- N3 — fixed: fallout header retitled to "every glob-carrying Code line … (star, class, and the one literal path caught by the same sweep)"; Consequences now names ADR-0001's `scripts/**` as the surviving star glob and explains the `cdd/scripts/**` twin-surface relationship.
- N4 — fixed: fallout header carries the handle glossary (PF-nn, A0/A1/A2/L1/L2, DH6).
- N5 — no action: expected RED-first state, already labeled in tasks 3.5/3.7.
