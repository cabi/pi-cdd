<!--
TASKS — how to fill and work this file (verified checklist traced to Done-When)

Before writing tasks, re-read the proposal's Done-When lines. If any
criterion is not observable as written, resolve it with the user first.

Format:
- Group tracked tasks under ## numbered headings; every tracked task is a
  checkbox "- [ ] X.Y Task" and MUST end with its verification:
  "verify by <command, test, or observable check>". A task without a
  verification is a wish, not a task.
- Phrase each task as the interface it establishes ("Reporter emits a CSV
  header row"), never as an activity ("implement reporting"). Work each
  task red-green-refactor: write the failing unit test that names that
  interface, implement the smallest code that turns it green, refactor
  freely. Unit tests are engineering artifacts born during apply — they
  churn with the design and are never pinned in the spec.
- Order by dependency. Keep each task small enough to finish in one session.
- Turn the design gate's open questions into early tasks. Keep a
  "## Design Notes" section only for decisions the design gate did not cover.
- Follow the implementation steps with "## Done When Traceability": a table row per proposal criterion —
  "| <criterion> | <task ids that verify it> |". If a criterion has no task,
  add the task or fix the criterion.

Scale rule: more than 8 implementation subtasks is the split signal — run
the split procedure at the design gate; more than 12 fails strict validation.
The split: read the traceability table (it is the split map), cut into N
proposals each with its own Done-When subset and its own delta, record
"Depends on:", supersede the original (never delete it). A genuinely atomic
change that must exceed 12 records a "split-considered: kept whole because
<reason>" line in this file instead.

Apply protocol: work strictly top-to-bottom, one task at a time. Tick a box
only after its verification passes ("checked" means "its verification
passed", never "I am done looking at it"); re-read this file after each
tick. If a verification fails, uncheck and fix — never continue on a red
check. Group-local testing: each group lands the unit tests its own work
calls for; a final group runs the scenarios' acceptance tests end to end.

Review tasks: task 3.1 (Change review) runs cdd-spec-review
in package mode at draft-green — the package drafted, validate draft green,
before the first implementation task ticks — findings at reviews/r2-change-review.md.
The Close review tasks run before archive: cdd-code-review — two
axes, two cold sessions: the standards axis (findings at
reviews/r3-standards-code-review.md) and the spec axis (findings at
reviews/r3-spec-code-review.md) — and, if the change drafted an ADR or amended one's decision content — a Reconfirmed-by paragraph or a typo fix does not count,
cdd-adr-review (findings at reviews/adr-review.md).
A review reports advisory findings (severity blocker/should/note + disposition), never
verdicts: it ticks only when no blocker is open, and the
deterministic validators keep gate authority. Reviews run cold (rule 2b): the reviewer is not the author of the artifacts under review — every model-run review (R2, R3, ADR) is a fresh cold sub-agent session briefed from paths on disk; a same-session re-read is the weaker fallback and records its form and justification in the findings file header.

Anti-scope-creep: no task may exist without a spec requirement or Done-When
criterion that needs it. Improvements no criterion demands go back to the
proposal as Non-Goals or a future change.
-->

# Tasks — 20261024-dw-masked-view

## 1. Context

Untracked orientation, not a task (R2 S2: a checkbox without verify-by is a wish,
not a task): the living requirement under change ("cdd archive stamps a derived
metrics file", cdd/specs/gherkin/spec.md:1666) and every file matching the
proposal's Code: globs were read at run start — the evidence is the gate
record's file-and-line citations in §2, which is what this reading produced.

## 2. Design

Gate record — answered 2026-10-24 before any artifact; M0 director rulings accepted (intercom session 01a16f41, verdict GO):
- T1 cross-cutting: NO — one capability: the stamp requirement lives in the gherkin living spec (cdd/specs/gherkin/spec.md:1666); the edit surface (lib/metrics.mjs, a one-keyword additive export in lib/validate.mjs, tests/acceptance/archive-metrics-stamp.test.js) rides that capability's Code line — same precedent as mission 3 claiming lib/metrics.mjs under gherkin; no second spec ages.
- T2 architecture bet: NO — no structural bet: the seam already exists (validate.mjs owns maskHtmlComments since 20261024-scaffold-honesty; deriveStamp already imports shared law from canonical scripts/grammar-law.mjs); this change adds one export and points the DW column at the existing masked view.
- T3 shared seam: NO — consumes validate.mjs's mask via a new additive export; the mask body, validateProposal's behavior, and grammar-law.mjs are untouched; grep shows maskHtmlComments had zero external consumers and deriveStamp's only caller is store.mjs archiveChange (lib/store.mjs:286).
- T4 invariant risk: NO — the stamp never gates archive (pinned scenario, unchanged); the count-semantics change is observable only in future stamps; existing pins hold: the M1/M2 fixtures carry no HTML comment and no bare Done-When line, so masked count equals raw count equals 2 there (verified against the fixture text in tests/acceptance/archive-metrics-stamp.test.js at the gate).
- T5 parallel work: NO — cdd/changes/ held no open change at run start (cdd status) and the scaffold listed exactly this folder.

Design note (decisions the gate did not auto-settle — all confirmed at M0):
1. Single-source placement: `export` maskHtmlComments in lib/validate.mjs (the module that minted the masking law) and import it in lib/metrics.mjs. Rejected: moving the mask to scripts/grammar-law.mjs (a cross-module relocation this change does not need, widening the diff) and an exported count-done-whens helper in validate.mjs (either touches validateProposal — out of scope per M0 — or duplicates the count expression inside validate.mjs). Accepted residual, to be named to R2: the count pattern literal `/^Done-When:\s*\S/gm` then lives in both modules; equality with validator semantics is pinned by the acceptance scenario, not by trust.
2. Pattern alignment: the DW column adopts the validator's full semantics — masked text plus the content requirement (`/^Done-When:\s*\S/gm`) — not mask-only. CORRECTED 2026-10-25 (R2-phase ground truth, node): the earlier claim "a bare 'Done-When:' line counts 0 in both views" was wrong — `\s` matches newlines, so the validator's pattern counts a bare line by absorbing the next line's first character (raw `/^Done-When:/gm` counts the line itself; both views count it, differently but consistently); the decision is unchanged — running the validator's exact pattern over the validator's exact masked view is agreement by construction, whatever the text shape.
3. Past stamps as minted (director ruling, M0): cdd/archive/20261024-20261024-metrics-stamp/metrics.md keeps done-whens: 6 — as-of-stamp honesty: a stamp freezes what the algorithm computed at that Close, and its findings-format-version line documents the algorithm era; correction was rejected because it would require a standing mechanical rule (re-derive-on-read) — new behavior, out of scope — not a one-off edit. No retro-stamping of any archive.
4. Tier A stands: gherkin holds 52 requirements (≥ 12) so size warnings remain; the delta is pure MODIFY (no ADDED requirements), so the mission-2 split-considered top line does not fire — confirmed against the validator at authoring.

- [x] 2.1 Design gate — record above answers all five triage triggers (T1 NO, T2 NO, T3 NO, T4 NO, T5 NO) with evidence; chosen shape: short design note above this tick, no design.md (no T2/T4 YES), verify by this line naming all five answers and the chosen shape

## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
- [x] 3.2 Acceptance pins RED — extend tests/acceptance/archive-metrics-stamp.test.js with a fixture whose proposal holds 4 real Done-When lines plus the scaffold instruction comment (5 raw matches): pin the stamp's done-whens equals the validator's masked count (4) on the same text, pin a bare "Done-When:" line keeping stamp and validator in agreement (both count it; the validator's `\s*` spans newlines — ground truth in the §2 note-2 correction), and pin the single-source fact (lib/metrics.mjs imports maskHtmlComments from ./validate.mjs and holds no comment-masking regex of its own), run it against the unfixed code, record the red output — verify by reviews/red-records.md quoting the failing run before any implementation tick
- [x] 3.3 The done-whens column reads the validator's masked view — lib/validate.mjs gains the additive `export` on maskHtmlComments (no other change), lib/metrics.mjs imports it from ./validate.mjs and counts `/^Done-When:\s*\S/gm` over the masked proposal text — verify by node --test tests/acceptance/archive-metrics-stamp.test.js green
- [x] 3.4 Full sweep — npm test exits 0, fresh-node validateChange green over this change after the lib edits (PF-35), node cdd/scripts/spec-drift.mjs green — verify by this run's output tails recorded in the Close report

## Done When Traceability

| criterion | task ids |
|---|---|
| scaffold-comment fixture (4 real + 1 comment line = 5 raw) stamps done-whens 4, equal to validateProposal's masked count | 3.2, 3.3 |
| lib/metrics.mjs counts through maskHtmlComments imported from lib/validate.mjs, no private masking regex | 3.2, 3.3 |
| every pre-existing stamp pin passes — npm test exits 0 | 3.4 |
| this change's own Close stamp prints the masked count (self-application) | 4.5 |

## 4. Close

- [x] 4.1 Standards-axis change code review — run skill `cdd-code-review` with the standards-axis brief (brief-r3-standards.md) over the diff since the change branched, in its own cold session; findings at `reviews/r3-standards-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-standards-code-review.md holding no open blocker
- [x] 4.2 Spec-axis change code review — run skill `cdd-code-review` with the spec-axis brief (brief-r3-spec.md) over the same diff, in a second cold session; findings at `reviews/r3-spec-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-spec-code-review.md holding no open blocker
- [x] 4.3 ADR review — skipped lawfully (director M3 ruling): this change drafted no ADR under cdd/decisions/ and amended no decision content — the proposal cites ADR-0003/0006/0007/0012 as followed, not superseded; no ADR decision content was drafted or amended, so cdd-adr-review does not fire
- [x] 4.4 cdd validate strict green, guard green
- [x] 4.5 Archive — pair-commit: feature commit, then archive commit
