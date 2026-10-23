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

# Tasks — skill-layout

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs — read: cdd/specs/gherkin/spec.md (owning requirements "Reviewer briefs live next to their skills" :790, "The backlog triage skill is bundled" :1205, "Reviews run cold" :448), skills/{cdd-code-review,cdd-spec-review,cdd-adr-review,cdd-backlog-triage}/ incl. the five flat briefs, lib/templates.mjs (Close scaffold names brief-r3-*.md basenames at :195-196), lib/loop-law.mjs + cdd/rules.md (verified: NO brief file paths, only prose "each with its own brief" — no law/mirror edit in this change), tests/smoke.mjs (S33 :799, S36 :861), tests/acceptance/{loop-law-hardening,r3-findings,design-docs}.test.js (LLH6/LLH7, RF6/RF7, DD16/DD17 brief-path pins), cdd/backlog.md (PF-8, PF-9, PF-14 discipline); consumer sweep verified complete — no consumer resolves brief paths programmatically beyond these pins and the SKILL.md pointers, verify by this line naming every read file and the sweep result

## 2. Design

- [x] 2.1 Design gate — answer the five triage triggers (T1 cross-cutting, T2 architecture bet, T3 shared seam, T4 invariant risk, T5 parallel work): any YES needs a short design above; a T2 or T4 YES instead carries `design.md` at the change root (rule 2c: four sections, one C4 flowchart) — the record names the chosen shape and, for design.md, the C4 level and why; all NO is recorded here as the skip record, verify by this line naming all five answers, the chosen shape, and the C4 level
  - Gate record: **T1 cross-cutting NO** — every edit lands in one capability (gherkin owns the skills/ + tests/smoke.mjs surface); **T2 architecture bet NO** — the target layout is the pi platform's own convention, not a structural choice this repo makes; the moves are pure renames; **T3 shared seam NO** — no code seam moves: lib/loop-law.mjs and cdd/rules.md carry no brief paths (verified in 1.1), templates.mjs changes 2 basename mentions only; **T4 invariant risk NO** — no door, guard, or validator behavior changes; the pins move with the files they read; **T5 parallel work NO** — no other open change exists, no file collision. **Chosen shape: skip record (no design.md, note-form design not triggered). C4 level: N/A — no design document.**
  - Shape decisions the gate did cover: (a) the two S33 growth assertions land in S33 (the loadable-skills surface contract) rather than a new S38 — they are skill-surface-wide structure checks, not rubric or grammar checks (triage-skill's S37-vs-S33 split stays intact); (b) the layout convention + routing signal live in one ADDED requirement rather than grown into "The backlog triage skill is bundled" — its premise is triage-specific; the convention spans all 4 bundled skills.

## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker — DONE: cold sub-agent skill-layout-r2-review (family opencode-zen/deepseek-v4-pro vs author zai, rule 2b satisfied), 5 findings (0 blocker, 4 should, 1 note), all disposed in the findings file's Dispositions section (F001 fixed: adr SKILL.md added to MODIFIED Code:; F002 fixed: templates.mjs edit dropped; F003/F004 fixed: two process Done-When lines dropped, criteria kept as task 3.4 verify-bys; F005 won't-fix: universal-gate convention); re-validated PASS + guard clean after the fixes
- [x] 3.2 S33 growth authored red-first — grow tests/smoke.mjs S33 with two assertions over every bundled skill directory: (a) LAYOUT — no file matching brief-*.md or *-brief.md sits directly beside a SKILL.md, and every brief template a skill bundles lives under its assets/ directory; (b) ROUTING SIGNAL — every SKILL.md frontmatter description contains a when/whenever clause (case-insensitive), the check message naming the heuristic ("description carries a when/whenever routing clause"), verify by node tests/smoke.mjs run before the moves reporting exactly 1 failure at check S33 naming a loose brief beside a SKILL.md (the red observation recorded in this task's note), with the routing-signal assertion observed born green on the pre-move tree (all 4 descriptions comply — baseline evidence, not a faked red) — DONE: red observed pre-move, `node tests/smoke.mjs` → "1 FAILED, 35 passed", FAIL S33: "skills/cdd-adr-review: brief template brief-adr.md sits loose beside SKILL.md — briefs live under assets/"; routing-signal assertion ordered first per dir and executed green in-check for cdd-adr-review (first dir, before the layout assert aborted the check), and the identical /\bwhen(ever)?\b/i regex over all 4 descriptions returns ROUTING-GREEN (baseline evidence: born green, no faked red); post-move greenness verified in task 3.3
- [x] 3.3 Moves and reference updates — git mv the 5 briefs into their skills' assets/ dirs (history via --follow), update the 3 SKILL.md pointer lines (assets/brief-*.md) and the path pins: S36 (smoke.mjs), LLH6/LLH7 + readBrief (loop-law-hardening.test.js), RF6/RF7 (r3-findings.test.js), DD16/DD17 (design-docs.test.js); this tasks file's Close brief pointers updated to the assets/ form; lib/templates.mjs left untouched (basenames stay truthful — R2 F002), verify by npm test exiting 0 with S33 green and no other check regressed — DONE: 5 renames staged as pure R records, all references updated, `npm test` → exit 0 (smoke 36/36 with `ok S33`, 16 tool tests, all acceptance suites green); S33 layout + routing assertions both green post-move; the feature commit (moves + updates + pins together, L2 travel) lands at Close per the triage-skill pair-commit precedent
- [x] 3.4 Sweep and history verification — grep the repo (cdd/archive, node_modules, vendor, .pi excluded) for skills/<skill>/brief-*.md path forms and confirm zero survivors, and confirm git log --follow --oneline skills/cdd-code-review/assets/brief-r3-standards.md reaches the briefs' creation commits, verify by the grep returning no path-form matches and the --follow log naming the original creation commits — evidence: pre-archive sweep (cdd/archive, node_modules, vendor, .pi excluded) leaves exactly the living spec's two Code: lines (cdd/specs/gherkin/spec.md:844 owned by the MODIFIED briefs requirement, :929 owned by the MODIFIED "One decisions home across the corpus" requirement) — both update at archive by design; staged renames 100% (git diff --cached --find-renames --summary: five renames); post-feature-commit (54e6ad1) `git log --follow --oneline skills/cdd-code-review/assets/brief-r3-standards.md` reaches fca3650/301c72a and `git log --follow --oneline skills/cdd-adr-review/assets/brief-adr.md` reaches 4938f5c — creation history preserved through the moves; the post-archive zero-survivor sweep re-run lands in the Close report (the archived record freezes at the archive step)


## Done When Traceability

| criterion | task ids |
|---|---|
| S33 grown green: layout assertion (no loose brief beside a SKILL.md, briefs under assets/) + routing-signal assertion (when/whenever in every description) | 3.2, 3.3 |
| npm test exits 0 after the moves and pin updates | 3.3 |
| cdd validate strict green and node cdd/scripts/spec-drift.mjs exit 0 with the change open | 4.4 |
## 4. Close

- [x] 4.1 Standards-axis change code review — run skill `cdd-code-review` with the standards-axis brief (skills/cdd-code-review/assets/brief-r3-standards.md) over the diff since the change branched, in its own cold session; findings at `reviews/r3-standards-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-standards-code-review.md holding no open blocker
   - cold session skill-layout-r3-standards (opencode-zen/deepseek-v4-pro vs author zai/glm-5.3 — families differ): 0 blocker, 0 should, 2 note — F001 fixed (S33 title now states its full surface), F002 won't-fix (rationale in the findings file); no open blocker
- [x] 4.2 Spec-axis change code review — run skill `cdd-code-review` with the spec-axis brief (skills/cdd-code-review/assets/brief-r3-spec.md) over the same diff, in a second cold session; findings at `reviews/r3-spec-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-spec-code-review.md holding no open blocker
   - cold session skill-layout-r3-spec (opencode-zen/deepseek-v4-pro — families differ): 0 blocker, 0 should, 1 note — R3SPEC-F001 won't-fix (the word-presence heuristic is the approved design; rationale in the findings file); no open blocker
- [x] 4.3 ADR review — skipped: no ADR drafted or amended in this change (pure renames, pointer and pin updates, smoke growth — no decision content touched; the standards reviewer confirmed the ADR-governed edits stay within ADR-0010/0011's sanctioned procedural/path-update room) — if this change drafted an ADR under `cdd/decisions/` or amended one's decision content (a Reconfirmed-by paragraph or a typo fix does not count), run skill `cdd-adr-review` on them (findings at `reviews/adr-review.md` per that skill); if none, record the skip on this line, verify by reviews/adr-review.md holding no open blocker or a skip recorded on this line
- [x] 4.4 cdd validate strict green, guard green
   - `cdd validate skill-layout --mode strict` → PASS; full-scan guard mid-Close shows only the two by-design A2 lines (ADR-0010/0011 reconfirm paragraphs appended, landing in the archive pair-commit — same topology as the guard's L2 mid-Close note); post-pair-commit guard clean claimed in the Close report
- [x] 4.5 Archive — pair-commit: feature commit, then archive commit
