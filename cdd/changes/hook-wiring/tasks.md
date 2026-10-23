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

# Tasks — hook-wiring

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs, verify by this file's traceability table covering every Done-When line

## 2. Design

- [x] 2.1 Design gate — T1 NO (every edit lands inside the gherkin capability's harness surface: package.json's scripts block, one new acceptance suite; no other capability's Code files change — MAINTENANCE.md rides along outside spec ownership by its own header), T2 NO (a dev-workflow convention on a standard npm lifecycle hook, no architecture bet), T3 NO (the prepare script is a leaf one-liner calling git config; no shared seam is created or moved), T4 NO (the doors themselves, the guard, and hook contents are untouched — only their wiring into contributor clones changes, and the at-commit guard re-run stays director protocol), T5 NO (one sequential runner, no parallel work) — all NO, short prose form, no design.md; R1 lawfully skipped, verify by this line naming all five answers with their reasons and recording the R1 skip

## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
- [x] 3.2 Acceptance pins RED — tests/acceptance/hook-wiring.test.js pins both prepare-script regimes against the real script text read from package.json: a sandbox git repository whose core.hooksPath reads .githooks after the script runs, and a no-.git directory where the script exits 0 and configures nothing — written and run red before any implementation ticks, verify by node --test tests/acceptance/hook-wiring.test.js failing on the missing prepare script (red run recorded in this tick) and exiting 0 once tasks 3.3–3.4 land. Red run 2026-10-23: `node --test tests/acceptance/hook-wiring.test.js` → exit 1, "0 passed, 3 failed", HW1 fails "package.json scripts.prepare is missing" (HW2/HW3 cascade on the missing script)
- [x] 3.3 prepare script — package.json scripts gain `"prepare": "[ -d .git ] && git config core.hooksPath .githooks || true"`, verify by node --test tests/acceptance/hook-wiring.test.js green. Green run 2026-10-23: exit 0, "3/3 passed" — HW2 wires a real sandbox git repo (core.hooksPath reads .githooks), HW3 proves the no-.git no-op, both executing the script text read from package.json
- [x] 3.4 Contributor-setup note — MAINTENANCE.md carries the fresh-clone wiring note (npm install's prepare step wires .githooks; manual equivalent `git config core.hooksPath .githooks`; clone-local config, CI never needs it; PF-16 reference), verify by MAINTENANCE.md holding that note naming the manual command and PF-16. Note landed as "## Contributor setup (git hooks)" after Door-script sync: names npm install/npm ci + prepare script verbatim, the manual equivalent, CI/pack no-op rationale, and PF-16 as root cause
- [x] 3.5 Full sweep — the new suite rides `npm test`'s node --test sweep alongside smoke and tools, verify by npm test exiting 0. Green run 2026-10-23: `npm test` → exit 0, node --test reports "tests 21 / pass 21 / fail 0" (was 20 files — tests/acceptance/hook-wiring.test.js joined the sweep), smoke and tools green upstream in the chain


## Done When Traceability

| criterion | task ids |
|---|---|
| hook-wiring.test.js exits 0 pinning both prepare regimes | 3.2, 3.3 |
| npm test exits 0 with the new suite in the sweep | 3.2, 3.3, 3.5 |
| cdd validate strict green and guard exits 0 | 4.4 |
| MAINTENANCE.md carries the contributor-setup note | 3.4 |
| PF-16 reads done in cdd/backlog.md naming hook-wiring | 4.5 |

## 4. Close

- [x] 4.1 Standards-axis change code review — run skill `cdd-code-review` with the standards-axis brief (brief-r3-standards.md) over the diff since the change branched, in its own cold session; findings at `reviews/r3-standards-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-standards-code-review.md holding no open blocker. Ran 2026-10-23 via brief-r3-standards-instantiated.md: cold session opencode-zen/deepseek-v4-pro (families differ from zai author) — 1 note (sandbox-lifecycle duplication across HW2/HW3), disposed won't-fix; 0 should, 0 blocker
- [x] 4.2 Spec-axis change code review — run skill `cdd-code-review` with the spec-axis brief (brief-r3-spec.md) over the same diff, in a second cold session; findings at `reviews/r3-spec-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-spec-code-review.md holding no open blocker. Ran 2026-10-23 via brief-r3-spec-instantiated.md: cold session opencode-zen/nemotron-3-ultra-free (NVIDIA family, differs) — 0 findings: both scenarios trace to HW2/HW3, pins would fail on regression, no unsponsored code
- [x] 4.3 ADR review — if this change drafted an ADR under `cdd/decisions/` or amended one's decision content (a Reconfirmed-by paragraph or a typo fix does not count), run skill `cdd-adr-review` on them (findings at `reviews/adr-review.md` per that skill); if none, record the skip on this line, verify by reviews/adr-review.md holding no open blocker or a skip recorded on this line. SKIPPED — no ADR drafted or amended by this change (dev-workflow wiring; existing ADRs untouched, confirmed by the standards axis: no diff file falls under a recorded ADR code: glob)
- [x] 4.4 cdd validate strict green, guard green. Evidence 2026-10-23 at Close state: `cdd validate strict hook-wiring` → PASS; `node cdd/scripts/spec-drift.mjs` → exit 0, "spec-drift: clean (5 specs, 21 acceptance test files, full scan)"
- [x] 4.5 Close PF-16 in `cdd/backlog.md` as done naming hook-wiring via the `cdd` backlog op, verify by the backlog listing PF-16 done with the change reference. Resolved via backlog op 2026-10-23: "PF-16 [done] … | note: closed by 20261023-hook-wiring: package.json prepare script wires core.hooksPath .githooks at every npm install/npm ci, MAINTENANCE.md documents the fresh-clone flow + manual equivalent, acceptance pin tests/acceptance/hook-wiring.test.js"
- [ ] 4.6 Archive — pair-commit: feature commit, then archive commit
