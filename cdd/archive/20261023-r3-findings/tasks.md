<!-- split-considered: kept whole because the 16 tracked tasks are 8 implementation steps plus the scaffolded context, design-gate, change-review, and Close tasks of one atomic root-cause fix — the law field, the render, the mirror, the briefs, and the scaffold travel in one commit, and any cut would archive half the per-axis convention with pins stranded between changes -->

# Tasks — r3-findings

## 1. Context

- [x] 1.1 Read the living spec requirements the delta restates and every file matching the proposal's Code: globs, verify by this file's traceability table covering every Done-When line

## 2. Design

- [x] 2.1 Design gate — T1 NO (every edit lands inside the gherkin capability's own Code files: loop law, scaffolds, briefs, charter, pins), T2 NO (settled fix for a twice-recurred defect, no architecture bet), T3 NO (the per-axis findings render through the existing single-source reviewPoint pattern — no new seam), T4 NO (the law↔mirror byte identity stays guarded by the untouched mirror-pin class and the deliberate-write path is unchanged), T5 NO (one sequential runner, no parallel work) — all NO, short prose form, no design.md; R1 lawfully skipped, verify by this line naming all five answers with their reasons and recording the R1 skip

## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open:/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
- [x] 3.2 Acceptance pins RED — tests/acceptance/r3-findings.test.js pins the law render and the store mirror naming both per-axis R3 findings paths, each R3 brief naming only its own file, the charter naming both, and the Capabilities scaffold with its draft-blocking placeholder — written and run red before any implementation ticks, verify by node --test tests/acceptance/r3-findings.test.js exiting 0 once tasks 3.3–3.6 land
- [x] 3.3 Per-axis R3 law — lib/loop-law.mjs's R3 entry carries findingsStandards/findingsSpec, rule 2a renders both paths, and the tasks Close scaffold plus TASKS_INSTRUCTION name two per-axis code-review tasks, verify by tests/acceptance/r3-findings.test.js and tests/acceptance/single-source-law.test.js green
- [x] 3.4 Store mirror deliberate write — cdd/rules.md re-rendered from the law and written byte-identically, verify by tests/acceptance/single-source-law.test.js mirror checks green
- [x] 3.5 Briefs and charter — brief-r3-standards.md and brief-r3-spec.md each name only their own findings file and the cdd-code-review SKILL.md aggregates per axis, verify by tests/acceptance/r3-findings.test.js brief and charter checks green
- [x] 3.6 Proposal scaffold Capabilities — proposalTemplate renders the ## Capabilities section with its placeholder line and validateProposal flags the kept placeholder, verify by tests/acceptance/r3-findings.test.js Capabilities checks green
- [x] 3.7 Test-contract migration — rewrite the pins the per-axis law legitimately breaks: single-source-law SSL1/SSL2 (R3 facts and the rule 2a basename loop), review-wiring RW1/RW10, and the smoke Close-scaffold check, verify by npm test exiting 0
- [x] 3.8 A1 reconfirms riding the feature commit — Reconfirmed-by: r3-findings paragraphs on ADR-0008, ADR-0009, and ADR-0010 whose code globs this change touches, verify by the 3 ADR files carrying the paragraph

## Done When Traceability

| criterion | task ids |
|---|---|
| r3-findings.test.js green (law + mirror + briefs + charter + Capabilities) | 3.2, 3.3, 3.4, 3.5, 3.6 |
| fresh Close scaffold names both per-axis paths | 3.3, 3.7 |
| npm test green with rewritten pins | 3.7 |
| validate strict green + guard green | 3.7, 4.4 |
| PF-8 and PF-13 done in cdd/backlog.md naming r3-findings | 4.5 |

## 4. Close

- [x] 4.1 Standards-axis change code review — run skill `cdd-code-review` with brief-r3-standards.md over the diff since the change branched, in a fresh cold sub-agent session; findings at `reviews/r3-standards-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-standards-code-review.md holding no open blocker — done: cold session r3-findings-r3-standards (opencode-zen/deepseek-v4-pro vs author zai), 1 blocker (SSL2/SSL4 loops still on p.findings — suite red) fixed on disk with the per-axis cascade, 2 notes won't-fixed with rationale; npm test green
- [x] 4.2 Spec-axis change code review — run skill `cdd-code-review` with brief-r3-spec.md over the same diff, in a second fresh cold sub-agent session from a different model family than 4.1; findings at `reviews/r3-spec-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-spec-code-review.md holding no open blocker — done: cold session r3-findings-r3-spec (opencode-zen/nemotron-3-ultra-free vs author zai), 0 blockers, 2 notes: proposal Code: under-listing fixed (ADR globs + loop-law-hardening), delta union Code: over-listing won't-fixed (Code: = requirement ownership, R2/F2 union convention)
- [x] 4.3 ADR review — this change adds only Reconfirmed-by paragraphs to ADR-0008/0009/0010, which is not a decision-content change; skip recorded on this line, verify by the skip recorded on this line
- [x] 4.4 cdd validate strict green, guard green — validate strict PASS, spec-drift clean (5 specs, 20 acceptance test files, full scan) after all R3 disposal edits
- [x] 4.5 Close PF-8 and PF-13 in cdd/backlog.md as done with the change reference via the cdd backlog op, verify by cdd backlog listing both done — plus PF-14 minted (false-green self-report caught by the standards R3)
- [x] 4.6 Archive — pair-commit: feature commit, then archive commit
