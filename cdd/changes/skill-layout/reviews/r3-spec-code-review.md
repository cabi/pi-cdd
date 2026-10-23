# R3 spec-axis code review — skill-layout

**Reviewer form:** cold sub-agent (fresh session, not the author's session) — rule 2b satisfied.
**Reviewer model family:** opencode-zen / deepseek-v4-pro (from `PI_PROVIDER`/`PI_MODEL`).
**Author model family:** zai / glm-5.3 (per the brief). Families differ — review proceeds.
**Axis:** Spec only (Standards axis runs in its own cold session).
**Reviewed range:** `1750767...working tree` on branch `skill-layout` — staged renames + unstaged edits + the untracked change folder. No commits yet.

## Scope and method

Read the delta (`cdd/changes/skill-layout/specs/gherkin/spec.md`), the proposal, tasks.md, the full `git diff 1750767`, and the four acceptance suites the scenarios name. Ran `node tests/smoke.mjs` (36/36) and `node tests/acceptance/{loop-law-hardening,design-docs,r3-findings,decisions-home}.test.js` (10/10, 18/18, 10/10, 6/6) — all green. Confirmed the five brief renames are byte-identical (`git diff --numstat` reports `0 0` for each).

## Findings

### [note] R3SPEC-F001 — routing-signal pin is a word-presence heuristic, not a routing-clause check

- **Severity:** note
- **Finding:** The S33 routing-signal assertion (`tests/smoke.mjs:822`) pins "every description contains a when/whenever clause" with the regex `/\bwhen(ever)?\b/i` over the whole description. This matches any occurrence of the word "when"/"whenever", not specifically the routing clause. Every bundled description today contains multiple incidental "when" instances (e.g. cdd-spec-review's "when the design gate produced one", "when the design gate answered T1 or T2 YES"), so a regression that removed the actual "Use when …" routing clause while leaving an incidental "when" would keep the pin green.
- **Evidence:** `tests/smoke.mjs:822` (`assert(desc && /\bwhen(ever)?\b/i.test(desc[1]), ...)`); `skills/cdd-spec-review/SKILL.md:3` (description carries "when the design gate produced one" and "when the design gate answered T1 or T2 YES" in addition to the routing clause).
- **Disposition:** open
- **Note on scope:** The pin is faithful to the scenario's literal THEN ("it contains a when/whenever clause (case-insensitive)") and to the heuristic the proposal documents ("the heuristic named in the check message"). The weakness is that the scenario itself reduces "routing signal" to word presence. Advisory only — the current four descriptions all genuinely carry routing clauses, and the check does catch the total-removal regression.

## Coverage and verification

- Every delta scenario traced to a diff hunk:
  - "The five briefs carry the common skeleton" / "Each brief carries its MUST-DELIVER checklist" → byte-identical renames + `readBrief` path update (`tests/acceptance/loop-law-hardening.test.js:130`); LLH6/LLH7 green.
  - "The R3 briefs name distinct per-axis findings files" → RF6/RF7 path updates (`tests/acceptance/r3-findings.test.js:117,124`); the cdd-code-review SKILL.md aggregate step names both findings paths.
  - "The R1 and R2 briefs carry the design document" → DD16/DD17 path updates (`tests/acceptance/design-docs.test.js:166,172`); DD18 (SKILL.md object lines) green.
  - "The skills point at their briefs" → three SKILL.md pointer lines moved to `assets/` paths.
  - "Smoke pins the briefs structurally" → S36 path updates (`tests/smoke.mjs:887-891`).
  - "No loose brief templates beside a SKILL.md" → S33 layout assertion (`tests/smoke.mjs:817-833`).
  - "Every skill description carries a routing when-clause" → S33 routing-signal assertion (`tests/smoke.mjs:822`).
  - "One decisions home" scenarios → unchanged behavior; brief-adr.md byte-identical, SKILL.md pointer-only edit; DH5 scans all tracked files and stays green.
- Pins actually pin: each `# Verified by:` test reads the moved file from disk at its `assets/` path (no copied fragments); S33 would fail if a brief moved back loose or a description lost every "when"/"whenever". Confirmed green by running the suites.
- No unsponsored code: every hunk (3 pointer lines, 5 renames, 4 pin-path updates, S33 growth) serves a delta requirement or a ticked task's verify-by. `lib/templates.mjs` basenames and the living-spec flat paths are out of the diff by design (archive-time update; R2 F002 already disposed).

## Dispositions (author, after review)

- R3SPEC-F001 won't-fix: the word-presence heuristic is the deliberate design this change's handshake approved ("pick the simplest honest heuristic and state it in the check name" — the scenario's THEN pins word presence and the check message names the heuristic); a grammar-level routing-clause parse would make the smoke check brittle against prose variance across four independent descriptions. The total-removal regression is caught; if a description ever games the pin, strengthening is a one-line change with its own review.
