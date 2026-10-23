# R3 spec-axis code review — triage-skill

**Reviewer form:** cold sub-agent (fresh session, not the author's).
**Model family:** opencode-zen (deepseek-v4-pro) — differs from the author's
family (zai, glm-5.3) per rule 2b; verified from `PI_PROVIDER=opencode-zen`,
`PI_MODEL=deepseek-v4-pro` at review time.
**Reviewed range:** `ae44199...HEAD` (three-dot). HEAD == ae44199 == main, so
the change is an uncommitted working tree: tracked edits to `tests/smoke.mjs`
and `cdd/backlog.md`, plus untracked `skills/cdd-backlog-triage/` and
`cdd/changes/triage-skill/`. `git log ae44199..HEAD` is empty (no commits).
**Axis:** Spec only. Standards conformance is out of scope (separate session).

## Summary

Both delta scenarios are implemented and traceable to the diffed code; every
hunk is sponsored (the skill, the S37 smoke check, and the PF-21 dogfood line
in `cdd/backlog.md`). Two note-level pin-looseness findings follow; no
blockers, no shoulds.

## Findings

### [note] F001 — the evaluate-on-recurrence pin is two independent regexes, not co-located

- **Severity:** note · **Disposition:** open
- **Location:** `tests/smoke.mjs:902` vs `skills/cdd-backlog-triage/SKILL.md:45,61,85`
- **Evidence status:** Trace-backed
- **Finding:** Scenario "The triage skill carries the rubric" requires the
  skill to "mark the note-level evaluate-on-recurrence pattern as not a grammar
  status". The pin asserts `/evaluate-on-recurrence/` and
  `/not a grammar status/i` as two independent regexes over the whole file. The
  hyphenated form `evaluate-on-recurrence` occurs only at SKILL.md:61
  ("evaluate-on-recurrence deferrals") and :85 ("with an evaluate-on-recurrence
  note"), while the "not a grammar status" marking sits at :45 on the
  space-separated "evaluate on recurrence" line. The pin therefore does not
  verify the association the scenario states: a mutation that re-marks a
  *different* pattern as "not a grammar status" while leaving "evaluate on
  recurrence" unmarked would keep the pin green (both substrings still
  present, just not together).
- **Expected:** the pin fails if the "evaluate on recurrence" pattern loses its
  "not a grammar status" marking.
- **Actual:** the pin stays green through that regression because the two
  halves are matched independently in different sections.
- **Impact:** Low — the skill content is currently correct; the pin is merely
  looser than the scenario's wording.
- **Smallest safe fix:** assert the co-location, e.g. match
  `/evaluate on recurrence[^.]*is not a grammar status/i` (or a single regex
  spanning the marked line) instead of two file-wide regexes.

### [note] F002 — "exactly the 5 grammar statuses" is pinned positively only

- **Severity:** note · **Disposition:** open
- **Location:** `tests/smoke.mjs:900` vs `skills/cdd-backlog-triage/SKILL.md:26-44`
- **Evidence status:** Trace-backed
- **Finding:** Scenario "The triage skill carries the rubric" requires the
  skill to teach "exactly the 5 grammar statuses". The pin loops
  `BACKLOG_STATUSES` (single-sourced from `lib/backlog.mjs:27`) and asserts each
  is present, but has no negative check: a skill that taught a sixth
  status-like token would still pass. The skill content is currently correct
  ("Never invent statuses; the op refuses them (allowed: open, watch, done,
  won't-do, seeded-into-change)", SKILL.md:47-49), so this is a pin-strength
  gap, not a content defect.
- **Expected:** the pin fails if the skill teaches a status outside the op's
  grammar.
- **Actual:** the pin stays green through that regression.
- **Impact:** Low — `lib/backlog.mjs` STATUSES is the grammar authority and the
  op refuses unknown statuses, so a stray taught status would be caught at the
  op, not the pin.
- **Smallest safe fix:** optional — add a negative assertion that no other
  `[status]`-shaped token appears, or accept the op as the enforcement backstop
  and leave the pin as-is.

## Coverage and verification

- Read the full delta (`cdd/changes/triage-skill/specs/gherkin/spec.md`), the
  proposal, tasks.md, the skill, and the S37 diff hunk.
- Confirmed `lib/backlog.mjs:27` `STATUSES` is exactly
  `["open", "watch", "done", "won't-do", "seeded-into-change"]` — matching the
  skill's five taught statuses.
- Confirmed `package.json:18-19` registers `"./skills"`, so the skill is
  discoverable via `pi.skills` (no manifest change needed, as the proposal
  states).
- Confirmed every diff hunk is sponsored: the skill (scenario pins), S37
  (scenario pins), and the PF-21 line in `cdd/backlog.md` (task 3.4 dogfood /
  Done-When 3).
- No unsponsored code, dead code, speculative hooks, or drive-by refactors
  found.

## Dispositions (author, after review)

- F001 fixed: S37 now pins the marking co-located — `/evaluate on recurrence[^.]*is not a grammar status/i` replaces the two independent regexes, so a mutation that re-marks a different pattern no longer keeps the pin green (tests/smoke.mjs, S37).
- F002 fixed: S37 extracts the "The status taxonomy" section and asserts its backtick bullets are exactly the 5 STATUSES imported from lib/backlog.mjs — set equality, no stray sixth status passes.
- Basis: both are pin strengthenings inside the delta's sponsored surface; `node tests/smoke.mjs` → "36/36 passed" exit 0 after the fixes.
