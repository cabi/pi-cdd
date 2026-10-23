# R3 standards-axis code review — triage-skill

**Reviewer form:** cold sub-agent (fresh session, briefed only from paths on disk).
**Reviewer model family:** opencode-zen (deepseek-v4-pro) — verified from runtime
`PI_PROVIDER=opencode-zen`, `PI_MODEL=deepseek-v4-pro`.
**Author model family:** zai (glm-5.3) per the brief. Families differ — rule 2b satisfied.
**Working-tree form:** branch `triage-skill`, base `main` @ ae44199 (HEAD == ae44199),
change uncommitted. Included: tracked changes `cdd/backlog.md` (PF-21 line) and
`tests/smoke.mjs` (S37), plus untracked `skills/cdd-backlog-triage/SKILL.md` and the
change folder `cdd/changes/triage-skill/`. No `design.md` (design gate T1–T5 all NO).

## Findings

### [note] R3S-F001 — S37 duplicates S33's frontmatter validation (Duplicated Code)

- **Location:** `tests/smoke.mjs:893,895,896` (S37) vs `tests/smoke.mjs:808,810,811` (S33).
- **Provenance:** reviewer 01a16a79; source: tests/smoke.mjs, proposal.md.
- **Evidence status:** Trace-backed.
- **Preconditions:** none — the duplication is structural.
- **Trace:** S33 (the three review skills) and S37 (the triage skill) each carry the
  same three frontmatter checks — `name?.[1] === s` (name matches directory),
  `desc[1].length > 20 && desc[1].length <= 1024` (description bounds), and
  `/cdd/.test(desc[1])` (cdd-scoped routing) — verbatim. This is a new instance of the
  Duplicated Code smell: the same logic shape appears in two hunks of the change.
- **Expected:** a shared helper (e.g. `assertSkillFrontmatter(s, text)`) would hold the
  three checks once and be called from both S33 and S37.
- **Actual:** the three checks are copy-pasted between the two checks.
- **Impact:** low — three lines duplicated; a future change to the frontmatter contract
  (e.g. a new bound) must be edited in two places. The proposal's Solutions Considered
  documents the decision to keep S37 separate ("S33's assertions are review-skill-specific
  … adopted S37 so each pin keeps a single-minded contract"), which is a defensible
  judgement call; the smell is noted, not a hard violation.
- **Smallest safe fix:** extract the three frontmatter assertions into a small helper
  shared by S33 and S37, or leave as-is and accept the documented single-minded-contract
  rationale.

### [note] R3S-F002 — status definitions are prose not pinned (single-source boundary)

- **Location:** `skills/cdd-backlog-triage/SKILL.md:31-43` (the five one-line status
  definitions) vs `tests/smoke.mjs:898` (S37 pins only the status strings).
- **Provenance:** reviewer 01a16a79; source: skills/cdd-backlog-triage/SKILL.md,
  tests/smoke.mjs, lib/backlog.mjs, cdd/decisions/0009-single-source-the-loop-law.md.
- **Evidence status:** Trace-backed.
- **Preconditions:** none — the observation is about the pin's coverage, not a current defect.
- **Trace:** S37 single-sources the status *strings* correctly — it imports
  `STATUSES` from `lib/backlog.mjs` and asserts each appears in the skill text — so the
  taxonomy cannot drift from the op's grammar. But the skill's one-line *definitions*
  ("open — active: raised, awaiting decision or fix", "seeded-into-change — an open change
  carries the fix; the op requires the adopting change name in the change field", etc.)
  are explanatory prose pinned by no test. They currently match `lib/backlog.mjs`
  semantics (verified: `open` is the add default; `seeded-into-change` requires the
  change name at resolve; resolving to `open` refuses), but a future reword could drift
  from the op's behavior with no door to catch it.
- **Expected/Actual:** the status strings are single-sourced and pinned (the ADR-0009
  pattern done right); the definitions are the skill's own teaching and are not pinned.
- **Impact:** low — a maintainability boundary, not a current defect. ADR-0009's
  single-source rule governs loop-law facts, not a skill's explanatory prose, so this is
  a judgement call rather than a documented-standard breach.
- **Smallest safe fix:** none required; optionally extend S37 to assert one or two
  definitional anchors (e.g. that the `seeded-into-change` definition names the
  change-name requirement) if the author wants the definitions pinned too.

## Coverage and verification

- Inspected: `cdd/rules.md` (loop law, incl. rule 13 and the mechanical-change rules);
  `skills/cdd-code-review/SKILL.md` (smell baseline, quoted verbatim in step 3);
  `cdd/decisions/` (all 11 ADRs' `code:` globs — none claims `cdd/backlog.md`,
  `tests/smoke.mjs`, or `skills/cdd-backlog-triage/SKILL.md`, so no ADR-governed file is
  touched); `lib/backlog.mjs` (STATUSES = open|watch|done|won't-do|seeded-into-change,
  item grammar, op semantics); `tests/smoke.mjs` (S33/S36/S37); the new skill; the change
  folder (proposal, spec delta, tasks) for context.
- Verified: every S37 assertion is satisfiable against the skill text (the 5 statuses,
  `evaluate-on-recurrence` + `not a grammar status`, the item grammar line, both
  inviolable conventions, the change-worthy rule, `backlog op`, the note-edit freehand
  exception, the rule 13 citation); the PF-21 backlog line conforms to the item grammar
  (no `|` in summary/note, id PF-21 follows PF-20, status `open` valid); the spec delta's
  `Code: skills/cdd-backlog-triage/SKILL.md, tests/smoke.mjs` claims the new surface so
  the guard's topology check is not blinded; no door, guard, or validator code is changed
  (the change is additive: a skill, a smoke check, a backlog line, a delta).
- Not run: `node tests/smoke.mjs` and `node cdd/scripts/spec-drift.mjs` (read-only
  review; the author's task 4.4 owns the green door, and gate authority stays with the
  deterministic validators and the human). The smoke test's green/red status is asserted
  by inspection, not execution.

## Dispositions (author, after review)

- R3S-F001 won't-fix: the duplication is the documented single-minded-contract choice (proposal, Solutions Considered) — each S-check reads standalone so a future bundled skill copies the pattern without chasing helpers; S33 sets the precedent, and extracting a shared frontmatter helper across S33/S37 is a tests-wide refactor outside this change's delta.
- R3S-F002 won't-fix: the status strings are already single-sourced (STATUSES import) and, after the spec-axis F002 fix, the taxonomy is set-checked; the one-line definitions are teaching prose — pinning their wording would couple the door to phrasing rather than contract, and ADR-0009 governs loop-law facts, not skill prose (the reviewer's own trace).
