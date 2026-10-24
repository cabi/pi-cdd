# R2 package review — 20261024-spec-size-signal

## Header

- **Review point / method:** R2 (package), skill `cdd-spec-review` package mode, brief `reviews/brief-r2.md`.
- **Reviewer:** `opencode-zen/deepseek-v4.1-flash` (`PI_PROVIDER=opencode-zen`, `PI_MODEL=deepseek-v4.1-flash`), reasoning high. Author family per the brief: `zai` / `glm-5.3`. **Families differ** — reviewer independence per rule 2b / ADR-0010 holds. This is a cold session: none of the artifacts under review were authored here.
- **Pinned state:** branch `spec-size-signal`, HEAD `6057a6e` ("docs(cdd): mint PF-35 (stale cdd-tool verdicts after lib edits)"), identical to `main`. Working tree: **every artifact under review is untracked** — `git status --porcelain` → `?? cdd/changes/20261024-spec-size-signal/`. No staged and no unstaged tracked modifications; the committed range contributes no diff. `git status` re-checked after every command below: unchanged (this file is the only file this session wrote).
- **Draft validate observed** (fresh node process, `node -e "import('./lib/validate.mjs').then(({validateChange}) => …)"`, not the long-lived tool — PF-35): `draft ok=true`, `warnings []`. Draft-green confirmed independently; the brief's claim holds.
- **Strict validate observed on the same run:** `strict ok=false` with exactly 12 errors — 6 × `scenario "…" pins "tests/acceptance/spec-size-signal.test.js" but that file does not exist` (all six scenarios) and 6 × `unchecked task "…"` (1.1, 3.1, 3.2, 3.3, 3.4, 3.5; 2.1 is ticked). That is the assigned RED-first shape, **not** a package defect.
- **Charter form:** advisory findings with severities (`blocker` / `should` / `note`). No verdict is asserted; the deterministic validators keep gate authority.

## Findings

### R2-F001 — `should` — DW5's constants-home clause has no verification step

- **Evidence:** `cdd/changes/20261024-spec-size-signal/tasks.md:89` (DW5: "… thresholds live as named constants in lib/validate.mjs, none in scripts/grammar-law.mjs or cdd/scripts/"), mapped to tasks 3.2/3.3/3.4 at `tasks.md:89`; the only verification that touches constants is `tasks.md:77` (3.3 "verify by node --test tests/acceptance/spec-size-signal.test.js with the Tier A subtests green").
- **Trace (trace-backed):** the acceptance subtests assert *verdict text* only; `cdd validate` strict mode checks tasks/pins (`lib/validate.mjs:147-183`) and never inspects where a constant lives; the guard consumes `TASK_LIMIT` only (`scripts/spec-drift.mjs:34,668`). A runner could add `SPEC_REQ_SIGNAL`/`SCENARIO_SIGNAL` to `lib/validate.mjs` **and** to `scripts/grammar-law.mjs` plus its byte-identical copy `cdd/scripts/grammar-law.mjs` (`cmp scripts/grammar-law.mjs cdd/scripts/grammar-law.mjs` → identical) and every stated verification still passes.
- **Expected:** DW5's second clause ("none in scripts/grammar-law.mjs or cdd/scripts/") is falsifiable by a task verification.
- **Actual:** no verification observes it; the clause is a claim with no in-store instrument.
- **Impact:** exactly the copy-drift surface the gate record rejected (`tasks.md:67`, PF-28) can be reintroduced while DW5 is marked met.
- **Smallest safe fix:** extend 3.3's verification with one line — `grep -c 'SPEC_REQ_SIGNAL\|SCENARIO_SIGNAL' scripts/grammar-law.mjs cdd/scripts/grammar-law.mjs` must report 0 — or add a 3.6 whose verify-by is that grep.

### R2-F002 — `should` — Task 3.5 leaves the `split-considered:` placement unspecified; the tail placement leaks the line into the living spec at archive

- **Evidence:** `tasks.md:79` ("then add the split-considered line to the delta" — no position); the delta's current last line is `Code: …` at `cdd/changes/20261024-spec-size-signal/specs/gherkin/spec.md:47`.
- **Trace (trace-backed):** `scripts/grammar-law.mjs:369-380` pushes every non-heading line into the open block (`if (living) living.block.push(line)`, line 378); `lib/store.mjs:253-256` writes the parsed blocks back verbatim (`const body = living.map((l) => l.text).join("\n")` → `cdd/specs/gherkin/spec.md`). Delta line 47 is the live proof of that path — it is how a per-requirement `Code:` line reaches the living spec. A `split-considered:` line appended after line 47 therefore becomes permanent text inside the "Spec-size signal" requirement block after archive. Placed above `## ADDED Requirements` (delta line 1) both `living` and `deltaBlock` are still `null` (`grammar-law.mjs:359-379`), so the line is dropped and never merged — the authoring decision stays spent-once.
- **Expected:** the escape-hatch line is consumed by the validator and disappears with the delta.
- **Actual:** the default (append at end) is indistinguishable, at 3.5's wording level, from the leaky placement.
- **Impact:** a stray decision line inside a living-spec requirement block — noise in the exact artifact this change builds a navigation signal for; also visible to future authors as if gherkin had been split-considered once.
- **Smallest safe fix:** name the placement in 3.5 — top of the delta file, above `## ADDED Requirements`, mirroring the archived tasks-scope precedent (`cdd/archive/20261023-guard-glob-fix/tasks.md:3`) — and state that the Tier B check scans the **raw** delta text so an HTML-comment placement satisfies it (do not route that scan through `maskHtmlComments`, `lib/validate.mjs:57`).

### R2-F003 — `should` — Task 3.3's verification is a red run, against the tasks protocol

- **Evidence:** `tasks.md:76` (3.2 authors the pin over all six scenarios, including "split-considered demand and satisfaction"); `tasks.md:77` (3.3 ends "verify by node --test tests/acceptance/spec-size-signal.test.js with the Tier A subtests green"); protocol at `tasks.md:36-37` ("If a verification fails, uncheck and fix — never continue on a red check").
- **Trace (trace-backed):** at 3.3 only Tier A exists. Scenarios 4 and 5 (`specs/gherkin/spec.md:28-38`) are Tier B and must fail, so the named command exits non-zero; the literal verification is red, and the stated protocol forbids proceeding on red.
- **Expected:** a group-local verification a runner can run and observe as satisfied.
- **Actual:** satisfying it requires inventing a scoping flag, which the task text does not authorize.
- **Impact:** bounded — nothing is unachievable — but the wording invites either a protocol violation or an improvised command; R3 would then have to judge which.
- **Smallest safe fix:** state the scope, e.g. `node --test --test-name-pattern='requirement count|aggregat|grown block' tests/acceptance/spec-size-signal.test.js`, or say explicitly "expected: file red, only the Tier A subtests green".

### R2-F004 — `note` — Scenario 3's fixture must avoid the over-threshold/fat path to stay unambiguous

- **Evidence:** `specs/gherkin/spec.md:22-26` (scenario 3: "each grown block receives exactly 1 warning naming that block") vs `:16-20` (scenario 2's aggregated line names requirements by name) and `:10-14` (requirement-count line).
- **Trace (trace-backed):** the corpus makes this routine, not hypothetical — gherkin's fat tail is 11/11/9/8 (`cdd/specs/gherkin/spec.md`, 4 of 50 requirements ≥ 8 scenarios). If scenario 3's fixture capability holds ≥ 12 requirements, or any other ≥ 8-scenario requirement naming the grown block, two lines name the same block and the "exactly 1 warning" assertion needs per-line matching, not counting.
- **Expected/actual:** the scenario is satisfiable only with an unstated fixture constraint.
- **Impact:** a test author may write the assertion against the wrong count and land a brittle pin; advisory only.
- **Smallest safe fix:** add the constraint to the Given ("… in a capability whose living spec holds fewer than 12 requirements and no requirement reaching 8 scenarios").

### R2-F005 — `note` — Proposal citation drift for the strict-mode living-spec read

- **Evidence:** `proposal.md:66` cites "the strict-mode living-spec read per `cap` at lib/validate.mjs:125-133"; the code is `lib/validate.mjs:132-135` (`if (mode === "strict")` at 132, `livingPath` 133, read at 134, `livingNames` at 135). The characterization itself is correct (it *is* strict-only and per-capability).
- **Trace:** direct read of `lib/validate.mjs:119-145`.
- **Impact:** low — a reader grepping the cited range lands a few lines above the code; PF-32 carries the same stale range (`cdd/backlog.md:38`).
- **Smallest safe fix:** update the proposal to `lib/validate.mjs:132-135`; leave PF-32's own text to its resolution note.

### R2-F006 — `note` — The delta-scope `split-considered:` line kind is documented only by the runtime warning

- **Evidence:** `cdd/rules.md:86` documents `split-considered:` at tasks scope only; the delta format in `cdd/rules.md` has no line-kind registry; `proposal.md:81` fences a `rules.md` edit out of scope on purpose.
- **Trace:** `grep -rn "split-considered" cdd/rules.md` → line 86 only.
- **Impact:** authors meet the escape hatch only after tripping the warning, and only in the warning text; acceptable for a never-blocks advisory tier, but it is the one piece of the new law with no authoring-side documentation.
- **Smallest safe fix:** no action in this change (correctly fenced) — record a backlog follow-up, or fold "document the delta-scope line kind in rules.md" into PF-32's resolution note so the hardening change inherits it.

### R2-F007 — `note` — One requirement carries both tiers

- **Evidence:** `specs/gherkin/spec.md:5` is one SHALL sentence covering four behaviors (requirement count, fat aggregation, delta block growth, split demand) with six scenarios beneath it.
- **Trace:** ADR-0006 makes the requirement the Feature-document unit, so this is lawful and matches living neighbours (gherkin already holds an 11-scenario requirement); the cost is only structural: PF-32 reserves hardening "on recurrence", and hardening Tier A alone (e.g. a strict error at ≥ 12) would MODIFY the same block that carries Tier B, so the tiers escalate together by construction.
- **Impact:** none today; a future escalation decision has less room than it would with two requirements.
- **Smallest safe fix:** no change now — note for the escalation change, where splitting into "Spec-size existence signal" / "Spec-size growth demand" is cheap while the block is 6 scenarios long.

## Checked and clean (evidence inspected)

- **Chain closure (charter 1):** 5 Done-When lines (`proposal.md:89-93`) ↔ 5 traceability rows (`tasks.md:85-89`) ↔ tasks — DW1→3.2/3.3/3.5, DW2→3.2/3.3, DW3→3.2/3.3, DW4→3.2/3.4/3.5, DW5→3.2/3.3/3.4. No Done-When line lacks a task; every implementation task (3.1 review per the tasks-template convention, 3.2–3.5) maps to a criterion or a spec requirement. No orphan found in either direction.
- **Delta fits the living spec (charter 2):** one ADDED requirement, one `gherkin` fence, `Feature:` name equals the heading (`specs/gherkin/spec.md:3,8`), no `#### Scenario:` headings, every scenario carries exactly one `When` and a `# Verified by:` last line (proven mechanically: draft mode runs `checkRequirement`/`checkFence` and passed green). No re-pinning: `grep -n "split-considered\|requirement count\|spec size\|over-threshold" cdd/specs/gherkin/spec.md` → 0 hits; the neighbours claiming `lib/validate.mjs` (`cdd/specs/gherkin/spec.md:149`) own different behaviors. The delta's `Code:` globs are lawful for gherkin: `lib/validate.mjs` is already in the capability's Code: union (line 149) and the new pin path is the change's own, arriving in the living spec through the same `Code:` absorption path (delta line 47).
- **Verify-by realism (charter 3):** every scenario is reachable from one fixture-store pin — `validateChange(root, name, mode)` / `validateBoth` take the store root, `validateDelta` receives `(root, name, cap, text, mode, errors, warnings)` (`lib/validate.mjs:119`), and the living spec is read from `storeDir(root)/specs/<cap>/spec.md` (line 133-134), so a synthetic over-threshold living spec plus a synthetic delta drives every scenario; `parseLivingSpec` already returns per-requirement blocks (`lib/store.mjs:180-189`) and `checkRequirement` already yields `scenarioTexts` (`lib/validate.mjs:79-83`), so no new parser is needed. Precedent shapes exist (`tests/acceptance/gherkin-subset.test.js`, `tests/acceptance/scaffold-honesty.test.js`).
- **RED-first realism (charter 4):** 3.2 pins the signal before it exists — against the current validator every "exactly 1 warning" assertion sees zero warnings and fails, and strict is already red for the missing pin path. 3.5 cannot be faked: it demands four recorded observations (Tier B fire without the line, silence with it, Tier A standing lines on both runs) from fresh `node -e` processes, and PF-35 is correctly scoped — 3.2's pre-edit RED needs no fresh node (the law applies only after a `lib/*.mjs` edit), 3.5's post-edit observations do and say so (`reviews/red-records.md:3,25`).
- **Reuse-first honesty (charter 5):** every Solutions-Considered characterization checked against code — `validateTasks`' two-tier pair is at `lib/validate.mjs:165-170` (cited 165-169, correct); `grammar-law.mjs` holds `SPLIT_SIGNAL = 8` (`:31`) and `TASK_LIMIT = 12` (`:34`), `scripts/spec-drift.mjs:34` imports `TASK_LIMIT` only, and `SPLIT_SIGNAL` genuinely has no guard consumer — so "the spec-size pair rides no door consumer" and "an entry would force the byte-identical `cdd/scripts` sync" are both accurate (`cmp` → identical). `parseLivingSpec` is at `lib/store.mjs:180-189` (the proposal cites 180-189 — correct) and does return per-requirement blocks. Per-capability scoping is at `lib/validate.mjs:132-135` (see F005 for the range).
- **Gate credibility / thresholds (charter 6):** the corpus numbers in the gate record are exactly right, measured on disk — acceptance 2 reqs / 5 scenarios (0 fat); adr 3 reqs / 29 scenarios, tail 15,10,4 (2 fat); extension 7 reqs / 41 scenarios, tail 22,5,… (1 fat); gherkin 50 reqs / 173 scenarios, tail 11,11,9,8 (4 fat). So 12/8 fires gherkin alone at requirement level, catches the whole fat tail including gherkin's 11/11/9/8, and yields exactly the stated warning budget (gherkin 2 standing lines, adr 1, extension 1, acceptance 0). The rejected ≥ 12-per-requirement alternative would indeed have fired only extension's 22 and adr's 15. All five T-answers are reasoned and consistent with the code; R1's skip is lawful (T1 and T2 both NO, `tasks.md:66-67,71`).
- **Scope honesty:** `proposal.md:55-60` promises Tier A existence/authoring plus Tier B demand and nothing more; Non-Goals (`:80-83`) fence PF-6, hard-fail/guard/rules.md, store-wide scans, PF-33, and PF-34's skill-doc half — matching the mission brief's out-of-scope list (`reviews/mission-brief.md:11`). The deliberate no-`split-considered:` state is honest and self-describing (`proposal.md:60`, `tasks.md:79`, `reviews/red-records.md:17-31`); nothing else in the package claims the line exists yet.
- **Not run (evidence limits):** the acceptance pin does not exist yet (RED-first), so no tests, builds, or guard (`node cdd/scripts/spec-drift.mjs`) were executed — R2 is a package review; guard green belongs to 4.4. No files were modified except this one; `git status --porcelain` after all commands still shows only `?? cdd/changes/20261024-spec-size-signal/`.

## Counts

- **Blocker: 0 · Should: 3 (R2-F001, R2-F002, R2-F003) · Note: 4 (R2-F004 – R2-F007)**
- **Blocker: 0 · Should: 3 (R2-F001, R2-F002, R2-F003) · Note: 4 (R2-F004 – R2-F007)**
- No finding blocks the package from proceeding to 3.2 (RED-first pin) once dispositions are recorded; F001–F003 are cheap to fix in place.

## Dispositions (author, 2026-10-24)

- **R2-F001 (should): fixed** — tasks.md 3.3 verify-by now carries `grep -rn "SPEC_REQ_SIGNAL\|SCENARIO_SIGNAL" scripts/grammar-law.mjs cdd/scripts/grammar-law.mjs` exiting 1 (no entry in either law copy) alongside the scoped test run.
- **R2-F002 (should): fixed** — tasks.md 3.5 names the placement: top of the delta file, above `## ADDED Requirements`, where the archive merge drops the line; the task records the tail-absorption trace and that Tier B scans raw delta text.
- **R2-F003 (should): fixed** — tasks.md 3.3 verify-by is now `node --test --test-name-pattern="Tier A" …` green, with the expected partial red stated in the task text (Tier B subtests stay red until 3.4 by design — a scoped group-local check, not a red check to fix).
- **R2-F004 (note): fixed** — delta scenario 3's Given now carries the fixture constraint "in a capability whose living spec holds fewer than 12 requirements and no requirement reaching 8 scenarios".
- **R2-F005 (note): fixed** — proposal.md cites lib/validate.mjs:132-135 (verified on disk: `if (mode === "strict")` at :132, read at :133-134, livingNames at :135).
- **R2-F006 (note): open (follow-up, outside this change's fence)** — documenting the delta-scope `split-considered:` line kind in rules.md is fenced by the proposal's Non-Goals (no rules.md edit in this change); folded into PF-32's resolution note at Close so the hardening change inherits it.
- **R2-F007 (note): won't-fix (intentional)** — one requirement carries both tiers by design: the signal is one law and ADR-0006 makes the requirement the Feature-document unit; the two-block split ("existence signal" / "growth demand") is named here for the escalation change.

Corpus note (author): the reviewer's acceptance total (5 scenarios) is the true count — 3 scenarios sit indented inside gherkin fences plus 2 column-0; the author's M1 `^Scenario:`-anchored pattern saw only the column-0 pair. Requirement counts (2/3/7/50), the fat tails, and gherkin's 173 agree across both measurements; no threshold decision moves.

Blockers open: 0.
