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
The Close review tasks run before archive: cdd-code-review (findings
at reviews/r3-code-review.md) and, if the change drafted or amended ADRs,
cdd-adr-review (findings at reviews/adr-review.md).
A review reports advisory findings (severity blocker/should/note + disposition), never
verdicts: it ticks only when no blocker is open, and the
deterministic validators keep gate authority. Reviews run cold (rule 2b): the reviewer is not the author of the artifacts under review — every model-run review (R2, R3, ADR) is a fresh cold sub-agent session briefed from paths on disk; a same-session re-read is the weaker fallback and records its form and justification in the findings file header.

Anti-scope-creep: no task may exist without a spec requirement or Done-When
criterion that needs it. Improvements no criterion demands go back to the
proposal as Non-Goals or a future change.
-->

# Tasks — pin-law-rename

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

- [x] 2.1 Design gate — T1 cross-cutting NO (one capability: every code/test/ADR file touched sits in gherkin's Code: globs; MAINTENANCE.md is re-pointed text in a doc no capability glob claims — status quo, no new ownership created; extension's globs — index.ts, lib/status*, tests/tools.mjs, extension-door1/extension-new-warning — untouched); T2 architecture bet YES (amends accepted ADR-0007 in place — prose + code: globs — rather than superseding; bets that a self-describing grammar-law.mjs, paired with loop-law.mjs, kills the misdirection trap that fired in green-start-warning R1); T3 shared seam YES (scripts/grammar-law.mjs stays the single grammar seam — same exports, same adapters; DOOR_SCRIPTS carries the rename; stale cdd/scripts/law.mjs pruned, no alias module); T4 invariant risk NO (no grammar, verdict-shape, or behavior change; LAW_VERSION stays 2 — a rename is not a grammar change per ADR-0007's bump rule); T5 parallel work NO (atomic rename: importers, copies, spec text, and ADR travel in one commit with the delta) — Design recorded in Design Notes below — verify by this line naming all five answers

### Design Notes

- **Name.** `grammar-law.mjs` over `pin-law.mjs` (director-confirmed): the module owns fence scan/mask, the pin dialect, the subset laws, the tasks grammar, ADR frontmatter, CODE_LINE, and LAW_VERSION — "pin" names one chapter, "grammar" names the module (ADR-0007's own title: "one grammar module behind every door"), and the pair loop-law/grammar-law makes both law names self-describing. `lib/loop-law.mjs` keeps its name.
- **Store copies.** `writeDoorScripts` (lib/templates.mjs:199) copies `DOOR_SCRIPTS` verbatim and never prunes: the change renames the source, updates `DOOR_SCRIPTS`, `git rm`s the stale `cdd/scripts/law.mjs`, and regenerates the set through the real door — `cdd init`'s refresh path on an existing store (lib/store.mjs:36) — so `cdd/scripts/{grammar-law,spec-drift,spec-extract,arch-extract}.mjs` all land byte-identical to their sources.
- **Guard mechanics mid-flight.** The living gherkin spec's `scripts/law.mjs` glob goes dead at the rename but L2's no-match check is per-spec (other globs still match), and the travel check passes because the open delta's spec.md is staged in the rename commit; the dead glob is retired by this change's own MODIFIED requirements at archive. ADR-0007 lives in root `decisions/`, which the A0/A1/A2 machine checks do not scan (cdd/decisions/ only) — its amendment is reviewer hygiene plus this proposal's citation, and it travels in the rename commit.
- **LAW_VERSION stays 2**: adopting stores refresh copies by `cdd init` re-copy, not version compare; a bump would falsely signal a grammar change.

## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
- [x] 3.2 Acceptance expectations re-pinned to the grammar-law name first (red): tests/smoke.mjs (module import + S30 check name and assert wording), tests/acceptance/gherkin-guard-placeholder.test.js (P5 byte-identity pair + read), tests/acceptance/gherkin-door3.test.js (D4/D5 sandbox copies), tests/acceptance/review-wiring.test.js (lawPath constant) — verify by npm test red with every failure naming scripts/grammar-law.mjs or cdd/scripts/grammar-law.mjs and no other failure kind — RED confirmed 2026-10-21: smoke ERR_MODULE_NOT_FOUND scripts/grammar-law.mjs; guard-placeholder P5 ENOENT cdd/scripts/grammar-law.mjs; door3 D4/D5 ENOENT cdd/scripts/grammar-law.mjs; review-wiring green (tolerant wiring import by design); loop-law suites (single-source-law, reviewer-independence) untouched and green
- [x] 3.3 Grammar law module renamed and every in-repo importer re-pointed: `git mv scripts/law.mjs scripts/grammar-law.mjs` with its header comment renamed; imports in lib/store.mjs, lib/validate.mjs, lib/gherkin.mjs (plus their header comments); `./grammar-law.mjs` in scripts/spec-drift.mjs (incl. its "the one pin dialect" comments), scripts/spec-extract.mjs, scripts/arch-extract.mjs; `DOOR_SCRIPTS` in lib/templates.mjs — verify by `git grep -nE "(^|[^-a-z])law\.mjs" -- scripts lib tests` matching nothing and `node --input-type=module -e "await import('./lib/validate.mjs'); await import('./lib/gherkin.mjs'); await import('./lib/store.mjs')"` exiting 0 — done 2026-10-21: 15 occurrences across 8 files rewritten with the boundary regex (loop-law.mjs untouched), both verify checks green
- [x] 3.4 Stale store copy pruned and the door-script set regenerated through the real door (writeDoorScripts via `initStore`), `cdd/scripts/grammar-law.mjs` and its three siblings byte-identical to the sources — verify by `cmp` exiting 0 for all four source/copy pairs and `ls cdd/scripts/` holding exactly the four door scripts — done 2026-10-21: `git rm cdd/scripts/law.mjs`, then `initStore(process.cwd(), process.cwd(), {})` refreshed all four door scripts (`refreshed: [grammar-law, spec-drift, spec-extract, arch-extract]`); `cmp` byte-identical for all four
- [x] 3.5 ADR-0007 amended in place (frontmatter `code:` glob, prose name, and the bare `law.mjs` consequence mention) and MAINTENANCE.md's three references re-pointed — verify by `git grep -nE "(^|[^-a-z])law\.mjs" -- decisions/0007-the-law-behind-every-door.md MAINTENANCE.md` matching nothing — done 2026-10-21: 3 refs each rewritten via the same boundary sed; grep exit 1 (clean)
- [x] 3.6 Whole suite and the pre-archive Done-When checks green — verify by `npm test` green, `node cdd/scripts/spec-drift.mjs` exit 0, and `git grep -nE "(^|[^-a-z])law\.mjs" -- ':!cdd/archive' ':!cdd/specs' ':!cdd/changes'` matching nothing (living spec and the change's own record are excluded until the archive merge; the full grep is task 4.4's post-archive check) — done 2026-10-21: npm test exit 0 (14/14 acceptance suites; previously-red S30/P5/D4/D5 all ok), guard clean (4 specs, 14 acceptance tests), scoped grep exit 1


## Done When Traceability

| criterion | task ids |
|---|---|
| Done-When: spec-drift exit 0 + byte-identical grammar-law copies + zero old-name references outside cdd/archive/ + npm test green | 3.2, 3.3, 3.4, 3.5, 3.6 |

## 4. Close

- [x] 4.1 Change code review — run skill `cdd-code-review` over the diff since the change branched; findings at `reviews/r3-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-code-review.md holding no open blocker
- [x] 4.2 ADR review — this change amends an accepted ADR (decisions/0007-the-law-behind-every-door.md, root decisions/: text + `code:` globs), so skill `cdd-adr-review` runs on the amended ADR (first dogfood of the ADR-amendment trigger); findings at `reviews/adr-review.md`; dispose every blocker and record dispositions, verify by reviews/adr-review.md holding no open blocker
- [x] 4.3 cdd validate strict green, guard green — done 2026-10-21: formatVerdict strict PASS (after R3 fixes: 3.4 verify-by restored, 1.1 ticked); spec-drift clean (4 specs, 14 acceptance tests, full scan), exit 0
- [x] 4.4 Archive — pair-commit shaped so rename history stays honest: feature commit stages everything EXCEPT the `cdd/scripts/` regen (its only deletion is `scripts/law.mjs`, so git pairs it with `scripts/grammar-law.mjs` and `--follow` keeps aa40a69/166a364), then the archive commit carries the `cdd/scripts/` regen together with the merged living spec (satisfying the L2 travel check) — verify by the post-archive full `git grep -nE "(^|[^-a-z])law\.mjs"` matching nothing outside cdd/archive/, `node cdd/scripts/spec-drift.mjs` exit 0, and `git log --follow --oneline scripts/grammar-law.mjs | head -3` listing pre-rename commits

Done 2026-10-21: feature commit 4c225bd (R099 scripts/law.mjs →
scripts/grammar-law.mjs); archive commit merged the living spec with the
cdd/scripts/ regen; full grep clean outside cdd/archive/; guard green;
git log --follow walks aa40a69/166a364 through the rename.
