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

# Tasks — director-skill

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs — cdd/specs/gherkin/spec.md (the three review-skill requirements, "Reviewer briefs live next to their skills", "The backlog triage skill is bundled" at line 1211), tests/smoke.mjs (S33 at :799, S36 at :885, S37 at :909, BACKLOG_STATUSES), the four bundled skills (skills/cdd-code-review/SKILL.md, skills/cdd-spec-review/SKILL.md, skills/cdd-adr-review/SKILL.md, skills/cdd-backlog-triage/SKILL.md, plus the brief templates under their assets/), cdd/rules.md (the law this skill cites), cdd/backlog.md (the PF ledger the harvest law references), package.json (pi.skills registration), and the primary-source runs under cdd/archive/ (20261023-triage-skill, 20261023-law-guard-fixes, 20261023-r3-findings, 20261023-runner-ergonomics, 20261021-wire-review-points), verify by this line naming every file read

## 2. Design

- [x] 2.1 Design gate — answer the five triage triggers (T1 cross-cutting, T2 architecture bet, T3 shared seam, T4 invariant risk, T5 parallel work): any YES needs a short design above; a T2 or T4 YES instead carries `design.md` at the change root (rule 2c: four sections, one C4 flowchart) — the record names the chosen shape and, for design.md, the C4 level and why; all NO is recorded here as the skip record, verify by this line naming all five answers, the chosen shape, and the C4 level
  - Gate record: **T1 cross-cutting NO** — every edit lands in one capability (gherkin owns the skills/ + tests/smoke.mjs surface; the new skill is a corpus artifact under that surface); **T2 architecture bet NO** — the change follows the established bundled-skill pattern (four bundled precedents: three review skills + triage, pinned by S33/S36/S37), no structural choice is made; **T3 shared seam NO** — no code seam moves: the skill cites the loop law, the review skills, the cdd backlog op, and pi's intercom mechanics read-only; lib/ and scripts/ untouched; **T4 invariant risk NO** — no door, guard, or validator behavior changes; the director law is taught, not enforced — the skill advises, gate authority stays with the deterministic validators and the human (rule 2a's own frame); **T5 parallel work NO** — no other open change exists, no file collision. **Chosen shape: skip record (no design.md, note-form design not triggered). C4 level: N/A — no design document.**
  - Shape decisions the gate did cover: (a) the smoke pin is a new S38 following S33/S37's structural pattern (frontmatter name matches directory, bounded description, when/whenever routing clause), not an S33 extension — S33's contract is the three review skills and their findings grammar, S37's is the triage rubric; the director skill carries the director law, so it takes its own pin (triage-skill's S37-vs-S33 split is the precedent); (b) the mission-brief template lives under `skills/cdd-director/assets/` — S33's loose-brief ban and the skill-layout convention both put instantiable briefs in assets/; (c) the pi/intercom delivery mechanics are user-mandated content — first-class prose sections, not a footnote.
## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
- [x] 3.2 S38 smoke check authored red-first — extend tests/smoke.mjs with check S38 (structural: frontmatter name matches directory, quoted description within the 20-to-1024 bounds carrying the when/whenever routing clause; charter: the director-law section holds exactly 7 numbered points, the milestone gate table covers M1–M4, evidence protocol, findings harvest, delivery mechanics, anti-patterns section; consistency: every `rule <n>` mention extracted from the skill body resolves to a numbered item `^n\.` in cdd/rules.md whose bold title carries its obligation keyword (2a advisory, 2b run cold, 9a bypass, 11 archive, 13 backlog), and no whitespace-normalized fragment of cdd/rules.md of 60 characters or longer appears in the skill body; assets: mission-brief.md exists with the anatomy anchors), verify by node tests/smoke.mjs while skills/cdd-director/ is absent reporting exactly 1 failing check at S38 naming the missing skills/cdd-director/SKILL.md (RED observed and recorded in the tick note)
  - RED note: with skills/cdd-director/ absent, `node tests/smoke.mjs` → "1 FAILED, 36 passed", the failure at S38: "skills/cdd-director/SKILL.md missing" (tail: `FAIL S38  skills/ holds the cdd-director skill, frontmatter valid, charter consistent with the law` / `skills/cdd-director/SKILL.md missing`); every other check green.
- [x] 3.3 Director skill authored — skills/cdd-director/SKILL.md carrying the seven law points, the milestone gate table, the evidence protocol, the findings harvest, the pi delivery mechanics, and the anti-patterns, citing loop law by rule number without restating it, verify by node tests/smoke.mjs reporting S38's remaining failures naming only assets/mission-brief.md
  - Note: with SKILL.md on disk, `node tests/smoke.mjs` → "1 FAILED, 36 passed", S38 failing only at `skills/cdd-director/assets/mission-brief.md missing` — every charter, consistency, and citation anchor green. Three check-side anchors were loosened to match the delta's own phrasing (re-run/re-runs, case-insensitive "only the director pushes" and "Re-list"); no assertion was deleted.
- [x] 3.4 Mission-brief template authored — skills/cdd-director/assets/mission-brief.md carrying the anatomy: bounded outcome, scope fence, context files, protocol skeleton, reviewer constraints, milestone asks with WAIT, verify-premise-then-handshake first action, branch rule, never-push rule, verify by node tests/smoke.mjs exiting 0 with S38 green and no other check regressed
  - GREEN note: `node tests/smoke.mjs` → "37/37 passed", exit 0 — S38 green over SKILL.md + assets/mission-brief.md; all 36 prior checks unchanged.
- [x] 3.5 Dogfood record — this change runs under the director protocol it bundles; record in the Close section the correspondence between this run's 4 milestone asks and the skill's milestone gate table, plus every process finding minted during the run through the cdd backlog op (or that none was minted), verify by the Close section process line recording the milestone correspondence and the mint list (or none)

## Done When Traceability

| criterion | task ids |
|---|---|
| S38 green: node tests/smoke.mjs exits 0 with the loadable skill, its charter anchors, and the mission-brief template pinned | 3.2, 3.3, 3.4 |
| Charter consistent with the loop law: every cited rule number names that obligation in cdd/rules.md, no rule text restated, pinned by tests/smoke.mjs | 3.2, 3.3 |
| cdd validate strict green and the drift guard green with the change open | 4.4 |
| Dogfood: the Close section records this run's milestone correspondence and every PF minted in flight (or none) | 3.5 |

## 4. Close

- [x] 4.1 Standards-axis change code review — run skill `cdd-code-review` with the standards-axis brief (brief-r3-standards.md) over the diff since the change branched, in its own cold session; findings at `reviews/r3-standards-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-standards-code-review.md holding no open blocker — cold session opencode-zen/deepseek-v4-pro (family ≠ author zai/glm-5.3), 0 blocker / 0 should / 3 note, dispositioned 2 fixed + 1 won't-fix, 0 open
- [x] 4.2 Spec-axis change code review — run skill `cdd-code-review` with the spec-axis brief (brief-r3-spec.md) over the same diff, in a second cold session; findings at `reviews/r3-spec-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-spec-code-review.md holding no open blocker — cold session opencode-zen/deepseek-v4.1-flash (v4-pro 400'd again at spawn; director's standing rung pre-approval), reviewer mutation-tested its own pins; 0 blocker / 3 should / 10 note, dispositioned 11 fixed + 2 won't-fix, 0 open; every pin fix re-verified by 9 mutations on a scratch copy in /tmp (8 caught, 1 spelling acceptance by design)
- [x] 4.3 ADR review — if this change drafted an ADR under `cdd/decisions/` or amended one's decision content (a Reconfirmed-by paragraph or a typo fix does not count), run skill `cdd-adr-review` on them (findings at `reviews/adr-review.md` per that skill); if none, record the skip on this line, verify by reviews/adr-review.md holding no open blocker or a skip recorded on this line — skip: no ADR drafted or amended by this change (Non-Goals record it; skills/cdd-director/** is outside every accepted ADR's code: glob per the standards-axis ADR check)
- [ ] 4.4 cdd validate strict green, guard green
- [ ] 4.5 Archive — pair-commit: feature commit, then archive commit

Process note (dogfood, task 3.5): this change ran under the director protocol it bundles — M1 gate+proposal (gate all-NO skip record, R1 lawfully skipped) matched the skill's M1 row; M2 draft-green+R2 (0-blocker cold package review, 7 findings disposed) matched the M2 row's disposition-quality gate; M3 implementation green ran RED-first (S38 observed failing on the missing skill before authoring) per the M3 row's evidence-tails gate; M4 is this Close. One protocol event in flight: the paid floor model 400'd twice (upstream reasoning-field error) — floor-down fired, the runner stopped and asked, the director shifted the rung (deepseek-v4.1-flash delivered R2), exactly as the skill's reviewer-constraints and escalation law teach; at R3 the floor answered for the standards axis, 400'd again for the spec axis, and the director's standing rung pre-approval moved the spec axis to deepseek-v4.1-flash without a second stop. R3 dispositions: 13 spec-axis + 3 standards-axis findings, all dispositioned, 0 open — door-taught corrections accepted, not suppressed. Process findings minted through the backlog op this run: none — the incidents were the protocol working, not process defects.
