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

# Tasks — 20261025-stale-lib-guard

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

Gate record — answered 2026-10-25 before any artifact; M0 director verdict GO (intercom session 01a16f41, three steers accepted: refusal names the exact fresh-node lawful path; surface membership re-globbed per dispatch with added/removed files counting as stale; size statted alongside mtimeMs):
- T1 cross-cutting: NO — one capability: the fix surface (index.ts dispatch, a new lib/stale.mjs, the new acceptance pin, tests/tools.mjs) rides extension's existing Code lines (cdd/specs/extension/spec.md:45,94,122,266,282,322); gherkin's only index.ts claim is the comment-law scan surface (cdd/specs/gherkin/spec.md:1277, scans index.ts + lib/ comments) — satisfied by writing shape-only comments, no gherkin delta, no second spec ages.
- T2 architecture bet: YES — the bet is the mechanism: dispatch-time re-glob + stat (mtimeMs + size) diff of the extension's imported source surface against a load-time snapshot, graded refuse (mutating ops) / warn (read ops), versus fresh-spawn-per-mutating-op and doc-law-only (both rejected — heavier / already-tracked as PF-34/PF-38 doc halves). If the detection is wrong, every dev-session mutation refuses spuriously or the stale class persists silently (two verified instances: PF-36 lines). Chosen shape: design.md at the change root, C4 Component level — the risk lives inside the tool's dispatch component and its relationship to the library components it freezes at load, not between containers.
- T3 shared seam: NO — the guard is a new module consumed only by index.ts's dispatch and the three mutating door-1 command handlers; no existing seam's behavior changes in a clean process (all op round-trip pins in tests/tools.mjs and tests/acceptance/ops-registry.test.js hold byte-equivalent — verified at the gate by reading the dispatch paths they exercise).
- T4 invariant risk: NO — the archive refusal's pinned shape (stage "strict-validation" + strict verdict in data) is untouched: the stale-lib refusal is a distinct pre-dispatch error result; the op registry and its derivations are untouched; thin-ops law preserved (all guard behavior lives in lib/stale.mjs, index.ts only consults).
- T5 parallel work: NO — cdd/changes/ held no open change at run start (cdd status output, 2026-10-25) and the scaffold listed exactly this folder.

Gate adjudications of the M0 steers:
1. Refusal-as-guidance (steer 1): the mutating refusal names the changed files and the exact fresh-node lawful path per op (a per-op example map in the guard: archive → node -e "import('<extension-abs-file-url>/lib/store.mjs').then(m => console.log(JSON.stringify(m.archiveChange('<target-project-root>', '<name>'))))" — absolute file URL for the extension module plus the explicit target project root, so the lawful path works with extension and target project in different trees (shape updated per R2 F002), not just "restart pi". No override flag — an override re-legalizes the class.
2. Membership re-glob (steer 2): each dispatch re-globs the surface fresh (index.ts, lib/*.mjs, lib/*.ts, scripts/*.mjs, vendor/**) and diffs membership + per-file mtimeMs + size against the snapshot — added, removed, and changed files all count as stale.
3. Size alongside mtimeMs (steer 3): ACCEPTED — the same fs.statSync call already returns size; zero extra IO; mtime+size catches the pathological same-mtime content replace (editor write-back inside one filesystem timestamp tick). No reason to skip found.
4. R1 blocker disposition (2026-10-25, reviewer opencode-zen/gpt-6-luna thinking high): a same-length rewrite preserving mtimeMs evades ANY metadata diff — steer 3's size trick only closes the changed-size half; the diff now decides on membership + per-file sha256 content digest (mtimeMs/size ride as recorded metadata, no metadata fast-path), pinned by a same-length/mtime-restored rewrite scenario.

- [x] 2.1 Design gate — record above answers all five triage triggers (T1 NO, T2 YES, T3 NO, T4 NO, T5 NO) with evidence; chosen shape: design.md (T2 YES), C4 Component level, verify by this line naming all five answers, the chosen shape, and the C4 level

## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
- [x] 3.2 Acceptance pin first — author tests/acceptance/stale-lib-guard.test.js as a hermetic harness (scratch copy of index.ts + lib + scripts + vendor, loaded through tests/pi-jiti.mjs, one lib file edited after load; the extension-surface copy and the target store live in separate scratch directories, matching a separately installed extension) pinning all 9 delta scenarios (the 7 core scenarios plus a same-length rewrite with restored mtimeMs and the table-driven refusal-command legality check), and run it RED against the unguarded dispatcher with the red output recorded in this tick, verify by node --test tests/acceptance/stale-lib-guard.test.js failing every scenario check pre-implementation and the red run recorded here — RED run 2026-10-25: 8 of 9 scenarios ✖ (archive executes with no refusal, no staleness warning, no freshCommand in any refusal, door-1 commands run their mutations, same-length/same-mtime rewrite invisible, no commands to execute for the legality check); scenario 6 (clean process unaffected) passes vacuously pre-implementation — no guard exists yet to interfere with a clean process, so it can only fail once the guard misfires; tail: `pass 1 / fail 8`, fixture harness bugs fixed before the red run (scaffold placeholder delta owned by the fixture, renameSync, isError undefined on success paths, pre-existing 'staleness' wording in the backlog op doc scoped out of the clean-process regex)
- [x] 3.3 Staleness guard module — lib/stale.mjs exports the surface walk (index.ts, every file under lib/ recursive, scripts/*.mjs, vendor/** recursive), the load-time snapshot, the per-call diff (added/removed/changed via membership + per-file sha256 content digest), the op grading (mutating: init/new/archive/reconfirm + backlog add/resolve/revalidate; read: validate/status/adrs/help + backlog list; unknown grades mutating), and the refusal/warning messages naming the changed files plus the table-driven fresh-node example commands (one entry per mutating op and per mutating backlog action, each importing the extension library by absolute file URL and naming the target project root explicitly) — with unit pins in tests/tools.mjs over a tmpdir fixture, verify by the new tests/tools.mjs checks green (surface walk count, diff kinds, grading table, message contains file + command) — GREEN 2026-10-25: T5a surface walk + diff (membership list exact, changed/added/removed kinds, same-length/same-mtime rewrite caught by digest — mtime compared with 2ms tolerance because stat and utimes disagree at sub-ms on this filesystem), T5b grading table (unknown ops and unknown backlog actions grade mutating; absent backlog action is the list default and grades read), T5c refusal text names file and op, freshCommand shape `node -e "import('file://…` with no double quote inside the -e string, init command carries root and ext dir single-quoted, clean-process help dispatch carries no staleWarning; `npm test` tail: `# pass 22 / # fail 0` over the tools file
- [x] 3.4 Dispatcher consult — index.ts takes the snapshot at module load (EXT_DIR) and consults the guard at execute entry: mutating op on stale surface answers exactly 1 error whose data holds the stale entries and the fresh-node example; read op appends exactly 1 staleness warning; clean process answers byte-equivalent to today, verify by acceptance scenarios 1–6 and 8–9 green and the pre-existing round-trip pins in tests/tools.mjs and tests/acceptance/ops-registry.test.js unchanged and green — GREEN 2026-10-25: `node --test tests/acceptance/stale-lib-guard.test.js` → `# tests 9 / # pass 9 / # fail 0` (1 suite, 731ms), scenarios 1–6/8–9 all ✔; pre-existing ops-registry and tools round-trip pins green inside the npm test sweep
- [x] 3.5 Door-1 mutating commands consult — /cdd-init, /cdd-new, /cdd-archive refuse with the same one-line consult before calling the library, verify by acceptance scenario 7 green for all three commands — GREEN 2026-10-25: scenario 7 ✔ inside the 9/9 suite run (each of /cdd-init, /cdd-new, /cdd-archive answers exactly 1 refusal and performs no mutation)
- [x] 3.6 Whole suite — npm test exits 0 (no staleness refusal or warning on the clean test process) and node cdd/scripts/spec-drift.mjs exits 0, verify by both command exit codes 0 recorded in this tick — GREEN 2026-10-25: `npm test` → `NPMTEST: 0` (smoke + tools + node --test sweep, all suites pass); `node cdd/scripts/spec-drift.mjs` → `spec-drift: clean (5 specs, 43 acceptance test files, full scan)`, `GUARD: 0`; the guard's A1 ADR-citation findings were cleared by citing ADR-0002/ADR-0007/ADR-0012 in the proposal's Decision alignment section (follow, not supersede)
- [x] 3.7 Self-application proof — with implementation landed, show the guard firing on this change's own Close attempt from the pre-edit process (recorded refusal output) and run the actual archive through the fresh-node lawful path the refusal names, verify by the archived folder under cdd/archive with its stamped metrics.md on disk plus the recorded refusal output in this tick — GUARD FIRED 2026-10-25 (full output at reviews/self-application-proof.txt): a held process loaded over the real repo via tests/pi-jiti.mjs answered a clean status with no warning, then a post-load surface edit (scripts/zz-close-probe.mjs added, simulating the Close-time situation) made the same process's own archive attempt refuse — `isError: true`, stale `[{"path":"scripts/zz-close-probe.mjs","kind":"added"}]`, exactly 1 error naming the fresh-node archive command with the real repo paths — while op validate still answered PASS plus exactly 1 staleness warning; the refusal mutated nothing (probe removed, tree clean); the actual archive is executed through that refusal's own command (substituting <name>) at Close 4.5, immediately below

## Design Notes

- Snapshot timing: index.ts snapshots the surface once at module load via EXT_DIR; the guard itself stays a pure function pair (snapshot at load, diff per dispatch) so unit pins need no process tricks.
- Backlog grading reads the action before grading — list/revalidate-report warn, add/resolve/revalidate refuse; revalidate mutates (writes revalidation dates), list is read.
- Refusal data shape: {ok:false, error:<message>, stale:[{path, kind}]} — distinct from the strict-validation refusal shape; warning rides the result as a staleWarning field plus a rendered banner line, additive so clean-process answers stay byte-equivalent.
- Fresh-node examples map op → command string; each command imports the extension library by absolute file URL (pathToFileURL of the extension dir) and passes the target project root explicitly, so extension and target project may live in different trees (R2 F002); the refusal renders the map entry for the refused op.

## Done When Traceability

| criterion | task ids |
|---|---|
| stale process refuses op archive with exactly 1 error naming a changed file and a fresh-node command, no store mutation | 3.2, 3.4 |
| same stale process answers op validate with the verdict plus exactly 1 staleness warning naming a changed file | 3.2, 3.4 |
| a file added to, removed from, or same-length-rewritten on the guard surface after load counts as stale | 3.2, 3.3, 3.4 |
| clean process dispatches every op with no staleness refusal or warning — npm test exits 0, pre-existing pins unchanged | 3.2, 3.4, 3.6 |
| this change's own Close archive op runs through the fresh-node path, archived folder + stamped metrics.md on disk | 3.7, 4.5 |

## 4. Close

- [x] 4.1 Standards-axis change code review — run skill `cdd-code-review` with the standards-axis brief (brief-r3-standards.md) over the diff since the change branched, in its own cold session; findings at `reviews/r3-standards-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-standards-code-review.md holding no open blocker — DONE 2026-10-25: cold session, model gpt-6-luna (opencode-zen, family ≠ author zai, thinking high); 0 blocker / 2 should / 3 note; all 5 disposed fixed in commit 0f7e3dc (shell-safe single-quoted fresh-node commands with paths as trailing args, change marker removed from test comment, dead set and metadata removed, duplicate assert removed) — dispositions section appended to the findings file; `npm test` 0 and `node cdd/scripts/spec-drift.mjs` 0 (full scan) after the fixes
- [x] 4.2 Spec-axis change code review — run skill `cdd-code-review` with the spec-axis brief (brief-r3-spec.md) over the same diff, in a second cold session; findings at `reviews/r3-spec-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-spec-code-review.md holding no open blocker — DONE 2026-10-25: cold session, model gpt-6-luna (opencode-zen, family ≠ author zai, thinking high); 4 blocker / 0 should / 1 note; all disposed fixed in commit 0f7e3dc: B1 ADR-freshness (npm test 1) cleared by reconfirming ADR-0002/0007/0012 through the fresh-node reconfirmOp path — the A2 firing was post-commit, so 3.6's green was honest at its time; B2 scenario 8 isolated clean process; B3 scenario 7 asserts each door command's own op; B4 scenario 9 revalidates the open item with a premise before resolve (delta scenario amended to the same order); scope note resolved by aligning the declaration (every file under lib/ on the surface) — dispositions section in the findings file; acceptance 9/9, npm test 0, guard 0 after the fixes
- [x] 4.3 ADR review — if this change drafted an ADR under `cdd/decisions/` or amended one's decision content (a Reconfirmed-by paragraph or a typo fix does not count), run skill `cdd-adr-review` on them (findings at `reviews/adr-review.md` per that skill); if none, record the skip on this line, verify by reviews/adr-review.md holding no open blocker or a skip recorded on this line — SKIP 2026-10-25: no ADR drafted or amended by this change; the ADR-0002/0007/0012 lines written during Close are reconfirmations only (explicitly excluded by this task's rule)
- [x] 4.4 cdd validate strict green, guard green — fresh-node strict AFTER the 3.7 tick: `{"ok":true,"errors":[],"warnings":[spec-size advisory x2 — one pre-existing, one the delta requirement the director ruled keep-whole at M1]}` (validateChange(root, name, "strict") string mode — the M3 report's earlier "strict ok=true" was imprecise: it passed `{mode:"strict"}` as an object, which the signature (mode = "draft" default) silently took as draft; the lawful strict is this run); reconfirm --check clean: "20261025-stale-lib-guard claims no file that moved past its ADR's latest reconfirmation"; guard green after the archive pair-commit
- [x] 4.5 Archive — pair-commit: feature commit, then archive commit — archive executed 2026-10-25 through the refusal message's OWN fresh-node command (reviews/self-application-proof.txt, <name> substituted): `{"ok":true,"merged":["ADDED extension :: A stale process refuses mutation and warns on verdicts"],"autoTicked":2,"metrics":{"stamped":true},"archivedTo":"cdd/archive/20261025-20261025-stale-lib-guard/"}`; doubled archive-date prefix is PF-39, director ruled live-with at M3 verdict (Mission 7 fixes the stamp); feature commits 1f675b2 + 0f7e3dc + b2117c9, archive commit = this commit
