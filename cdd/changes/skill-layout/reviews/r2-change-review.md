# R2 package review — skill-layout

**Reviewer form:** cold sub-agent (fresh session, briefed only from paths on disk)
**Reviewer model family:** opencode-zen (deepseek-v4-pro)
**Author model family:** zai (glm-5.3) — families differ, rule 2b satisfied
**Working-tree form:** branch `skill-layout`, base `main` @ 1750767, change uncommitted (untracked `cdd/changes/skill-layout/`); no staged or unstaged tracked edits
**Artifacts reviewed:** proposal.md, tasks.md, specs/gherkin/spec.md (delta), cdd/specs/gherkin/spec.md (living), cdd/rules.md; no design.md (gate all-NO, skip record in tasks §2.1 — rule 2c)

## Findings

### [should] F001 — MODIFIED Code: line omits the third SKILL.md pointer

The MODIFIED requirement "Reviewer briefs live next to their skills" carries the scenario "The skills point at their briefs" whose Given names "the 3 bundled review skills" and whose Then requires each SKILL.md to point at its briefs under `assets/`. All three SKILL.md files carry a pointer line that this change edits (skills/cdd-adr-review/SKILL.md:7, skills/cdd-spec-review/SKILL.md:7, skills/cdd-code-review/SKILL.md:7). But the requirement's `Code:` line lists only `skills/cdd-spec-review/SKILL.md` and `skills/cdd-code-review/SKILL.md` — `skills/cdd-adr-review/SKILL.md` is absent (it appears only in the ADDED requirement's Code: line, which is about layout/routing, not the pointer edit).

- Evidence: cdd/changes/skill-layout/specs/gherkin/spec.md (MODIFIED Code: line); skills/cdd-adr-review/SKILL.md:7
- Disposition: open

### [should] F002 — lib/templates.mjs edit is unsponsored by any Code: line

The proposal's "What Changes" and its `Code:` line name `lib/templates.mjs` (Close-scaffold wording, 2 basename mentions at :195-196) as an edited file. No delta requirement's `Code:` line names `lib/templates.mjs` — neither the MODIFIED nor the ADDED requirement. Rule 10 makes Code: globs the code↔spec correlation; an edited file outside every requirement's Code: line is a traceability gap. (Secondary: the two mentions are basenames, not flat paths — `brief-r3-standards.md`/`brief-r3-spec.md` keep those basenames under `assets/` — so the proposal should either justify the edit as spec-relevant or drop it.)

- Evidence: cdd/changes/skill-layout/proposal.md (What Changes + Code:); lib/templates.mjs:195-196; cdd/changes/skill-layout/specs/gherkin/spec.md (both Code: lines)
- Disposition: open

### [should] F003 — Done-When "git history preserved" has no delta requirement

The proposal's Done-When "git log --follow --oneline on each moved brief reaches its creation commit through the new assets/ path" has no corresponding requirement or scenario. The MODIFIED requirement's prose asserts the briefs "MUST exist on disk under their bundled skills' assets/ directories" — the end state — but nothing in the delta claims rename-history preservation. It is an observable completion criterion with no spec backing.

- Evidence: cdd/changes/skill-layout/proposal.md (Done-When); cdd/changes/skill-layout/specs/gherkin/spec.md (no history scenario)
- Disposition: open

### [should] F004 — Done-When "grep sweep returns zero matches" has no delta requirement

The proposal's Done-When "a grep for skills/<skill>/brief-*.md path forms over the repo returns zero matches" has no corresponding requirement or scenario. The ADDED requirement's "No loose brief templates beside a SKILL.md" scenario checks files on disk beside a SKILL.md, not stale path forms in code references; the MODIFIED requirement's "The skills point at their briefs" scenario covers only the SKILL.md pointers, not the test pins and templates.mjs mentions the sweep targets. The sweep is broader than any scenario.

- Evidence: cdd/changes/skill-layout/proposal.md (Done-When); cdd/changes/skill-layout/specs/gherkin/spec.md (ADDED scenario "No loose brief templates beside a SKILL.md")
- Disposition: open

### [note] F005 — Done-When "validate strict + drift green" maps to task 4.4 only

The proposal's Done-When "cdd validate strict is green and node cdd/scripts/spec-drift.mjs exits 0" is the loop's universal gate and maps to task 4.4 only (the proposal says so explicitly). It has no delta requirement — expected for the universal gate, but recorded for completeness against checklist item 1.

- Evidence: cdd/changes/skill-layout/proposal.md (Done-When); cdd/changes/skill-layout/tasks.md (traceability table, "cdd validate strict green ... | 4.4")
- Disposition: open

## Coverage and verification

- MODIFIED legality: the delta restates all 6 living scenarios of "Reviewer briefs live next to their skills" (common skeleton, MUST-DELIVER checklist, R3 per-axis files, R1/R2 design doc, skills point at briefs, smoke pins) — verified against cdd/specs/gherkin/spec.md:790-880. No REMOVED requirements.
- Requirement→task: MODIFIED → task 3.3; ADDED → task 3.2. Both sponsored.
- Same-change coherence: proposal, delta, and tasks all describe the same move (briefs into assets/, reference updates, S33 growth). No design.md (gate all-NO, skip record present).
- Verify-by realism: task 3.2 (`node tests/smoke.mjs` red-first), 3.3 (`npm test`), 3.4 (grep + `git log --follow`), 4.4 (`cdd validate strict` + guard) all name existing commands. Every scenario pin names a real file (tests/acceptance/loop-law-hardening.test.js, r3-findings.test.js, design-docs.test.js, tests/smoke.mjs — all present).
- Routing-signal baseline: all 4 bundled SKILL.md descriptions carry a when/whenever clause (verified), so the born-green claim in task 3.2 is accurate.
