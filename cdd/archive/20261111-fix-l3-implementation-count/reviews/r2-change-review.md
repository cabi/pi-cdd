# R2 package review — fix-l3-implementation-count

**Review point:** R2 (package), at draft-green — skill `cdd-spec-review`, package mode.
**Status:** COMPLETE — assigned scope fully inspected; 5 `should`, 2 `note` findings, all advisory; author dispositions in the final section.
## Reviewer form and independence (rule 2b)

- **Form:** cold sub-agent session, spawned fresh for this review, briefed from paths on disk
  (`proposal.md`, `tasks.md`, `specs/gherkin/spec.md`, the living `cdd/specs/gherkin/spec.md`,
  `cdd/rules.md`). Not the author's session; no prior context on this change.
- **Author's model family:** `zai` (glm-5.3 lineage).
- **Reviewer model family:** `opencode-go` / `deepseek-v4.1-flash` (from `PI_PROVIDER` and
  `PI_MODEL` in this session's environment). Providers and lineages differ — independence holds.

## Reviewed state

- Repository `/home/carsten/Projects/pi-extensions/pi-cdd` at commit `91fe446`
  ("docs(cdd): re-point PF-6 premise after archive-stamp-name merge (gherkin 52->53)").
- The change package is **uncommitted**: `git status --porcelain` reports exactly one entry,
  `?? cdd/changes/fix-l3-implementation-count/`. Everything reviewed below is untracked working-tree
  content; staged and unstaged diffs are empty, and no other path is modified in the worktree.
- Artifacts read at that state: `proposal.md` (45 lines), `tasks.md` (91 lines),
  `specs/gherkin/spec.md` (35 lines), plus `cdd/specs/gherkin/spec.md` (1757 lines), `cdd/rules.md`,
  `lib/validate.mjs`, `lib/store.mjs`, `lib/templates.mjs`, `lib/loop-law.mjs`,
  `scripts/grammar-law.mjs`, `scripts/spec-drift.mjs`, `tests/smoke.mjs`,
  `tests/acceptance/gherkin-guard-placeholder.test.js`, `cdd/backlog.md`, `GLOSSARY.md`,
  `package.json`.
- No `design.md` exists; the skip record lives in `tasks.md` §2 (`tasks.md:63`).

## Mechanical state consumed (read-only)

Draft validation of this change, run in-process against the on-disk artifacts, is green with two
pre-existing spec-size warnings and no split-considered demand:

```
{ ok: true, errors: [],
  warnings: [
    "spec-size: living spec \"gherkin\" holds 53 requirements (>= 12) — split signal: consider splitting the spec",
    "spec-size: living spec \"gherkin\" requirements at or over 8 scenarios: Gherkin subset limits, Loop law names three review points, Code lines claim implementation surface, never decision memory, The ADR claims index is single-sourced, cdd archive stamps a derived metrics file — split signal: consider splitting these requirements" ] }
```

No build, test suite, formatter, or package command was run; nothing was written except this file.

## Findings

Every finding is advisory and carries disposition `open`. Gate authority stays with the
deterministic validators and the human.

### R2-F001 — `should` — proposal's scaffold arithmetic contradicts the scaffold and its own next sentence

- **Location:** `cdd/changes/fix-l3-implementation-count/proposal.md:5`.
- **Evidence status:** Trace-backed.
- **Preconditions:** read `lib/templates.mjs` and the guard's current count.
- **Trace:** `proposal.md:5` states the scaffold "puts 5 non-work items on the file (1 context,
  1 design, 2 close, plus the 3.1 change-review subtask inside section 3), so a change with 8 work
  subtasks … reaches 13 counted items", and two sentences later states "8 implementation subtasks
  reported as 15 tracked tasks". The scaffold emits **5** Close items, not 2 —
  `lib/templates.mjs:197-203` (`4.1`–`4.5`) — plus `1.1` context and `2.1` design
  (`lib/templates.mjs` §1/§2), with `3.1` inside section 3 (`lib/templates.mjs:187`). Non-work
  items outside section 3 are therefore 7, and `checkL3` sums **all four** sections
  (`scripts/spec-drift.mjs:658-671`, `splitTaskSections` at `scripts/grammar-law.mjs:49-71`), so a
  change carrying 8 implementation subtasks counts 15 tracked items (7 + 8), matching the 15 in the
  same paragraph's last sentence — not 13, and not "5 non-work items".
- **Expected:** one consistent scaffold model, since the Why paragraph is the change's rationale.
- **Actual:** two incompatible counts in one paragraph; the "2 close" figure matches neither the
  scaffold nor the change's own task file (5 Close items) nor the cited report (15).
- **Impact:** the motivation sentence that every reader will check against `lib/templates.mjs` is
  wrong, and the delta's fixture repeats the same unrealism: scenario 1's
  `specs/gherkin/spec.md:11` uses "4 non-implementation tracked tasks" where the scaffold always
  produces 7. The scenario still discriminates (13 tracked red pre-fix vs 9 counted green post-fix),
  so no criterion breaks — the rationale, not the test, is the casualty.
- **Smallest safe fix:** restate the paragraph on the real scaffold (7 non-work items outside
  section 3, 3.1 counted inside it) so the "8 work subtasks → 15 tracked" figure is the one
  number, or state explicitly that the example models a trimmed fixture rather than the scaffold.

### R2-F002 — `should` — the split-considered decision line sits inside requirement prose, where it merges into the living requirement

- **Location:** `cdd/changes/fix-l3-implementation-count/specs/gherkin/spec.md:5` (last sentence),
  delta `Code:` line at `specs/gherkin/spec.md:35`.
- **Evidence status:** Trace-backed.
- **Preconditions:** gherkin holds 53 requirements (`>= SPEC_REQ_SIGNAL` 12) and the delta holds one
  ADDED entry, which arms the demand at `lib/validate.mjs:179`.
- **Trace:** `lib/validate.mjs:179` tests `/split-considered:/i` against the delta's **raw text**, so
  any occurrence anywhere satisfies it. The occurrence here is the final sentence of the
  requirement paragraph ("Split-considered: deferred to the PF-6 gherkin store-ops split; rides the
  guard half of the designed cut."), which the green draft run confirms is what satisfied the
  demand. On archive that sentence merges verbatim into the living requirement body. The living
  spec's own Spec-size signal requirement, `cdd/specs/gherkin/spec.md:1622`, documents the intended
  shape: "any prose mention of the line-kind must be colon-free; a mention is prose, the decision is
  the line". The archived precedent carries the line as a standalone trailing line after `Code:`
  (`cdd/specs/gherkin/spec.md:1757`).
- **Expected:** the decision line is a line of its own, distinguishable from requirement prose
  (`cdd/rules.md:84-86`, `cdd/specs/gherkin/spec.md:1622`).
- **Actual:** the decision and the requirement text are the same sentence, so the record is
  unremovable without editing the requirement, and it makes the merged requirement cite a backlog id
  (`PF-6`) as durable spec text, duplicating the note already at
  `cdd/specs/gherkin/spec.md:1757`.
- **Impact:** bounded — the validator is satisfied and the law is unchanged; the cost lands on the
  living spec after archive (a change-scoped decision frozen into requirement content, with the
  prose/decision ambiguity the spec itself warns about).
- **Smallest safe fix:** move the sentence to a standalone line after the delta's `Code:` line
  (`specs/gherkin/spec.md:35`), leaving the requirement prose to state the law only.

### R2-F003 — `should` — task 3.3's verify-by cannot pass until task 3.4 runs

- **Location:** `cdd/changes/fix-l3-implementation-count/tasks.md:71` (task 3.3),
  `tasks.md:72` (task 3.4).
- **Evidence status:** Trace-backed.
- **Preconditions:** task 3.3 edits `scripts/spec-drift.mjs`; the store copy
  `cdd/scripts/spec-drift.mjs` is refreshed only by task 3.4 (`cdd init`).
- **Trace:** 3.3's verify-by is "node --test tests/acceptance/guard-l3-scope.test.js green **and the
  full acceptance sweep green**". The sweep includes
  `tests/acceptance/gherkin-guard-placeholder.test.js` P5 ("store copies stay byte-identical to the
  law sources"), which asserts
  `cdd/scripts/spec-drift.mjs` equals `scripts/spec-drift.mjs` byte-for-byte
  (`tests/acceptance/gherkin-guard-placeholder.test.js:193-203`), and `node --test` runs that file
  (`package.json:9`: `"test": "node tests/smoke.mjs && node tests/tools.mjs && node --test"`). After
  3.3 and before 3.4 the two copies differ, so P5 fails and the sweep is red.
- **Expected:** a task's verify-by passes once that task's own work is done, per the apply protocol
  (`tasks.md:49-52`: "checked means its verification passed").
- **Actual:** 3.3 is red after its own work and only greens after 3.4 — the declared order (3.3 then
  3.4) makes a correctly executed 3.3 untickable, and ticks are claims
  (`cdd/rules.md` rule 11a).
- **Impact:** bounded process defect in the package, not in the code: it forces either an early 3.4
  or a dishonest tick.
- **Smallest safe fix:** scope 3.3's verify to
  `node --test tests/acceptance/guard-l3-scope.test.js` alone (the sweep green belongs to 3.4, whose
  `cmp -s` already names the pair), or swap the two tasks so the refresh precedes the sweep claim.

### R2-F004 — `should` — DW5 (GLOSSARY.md) maps to no delta requirement and no living requirement claims the file

- **Location:** `cdd/changes/fix-l3-implementation-count/proposal.md:44` (Done-When),
  `proposal.md:11` (What Changes), `tasks.md:73` (task 3.5), delta
  `specs/gherkin/spec.md:35` (Code line), `tasks.md:63` (design-gate skip record).
- **Evidence status:** Trace-backed.
- **Preconditions:** none.
- **Trace:** every Done-When line maps to a delta scenario except DW4 and DW5
  (`proposal.md:41-44`). DW4 is legitimately backed outside this delta: the living requirement at
  `cdd/specs/gherkin/spec.md:543-586` owns store-copy byte-identity with the scenario at
  `cdd/specs/gherkin/spec.md:577-580`, pinned by
  `tests/acceptance/gherkin-guard-placeholder.test.js`. DW5 has no such backing: no living spec
  names `GLOSSARY.md` (grep over `cdd/specs/` returns nothing), the delta's `Code:` line claims only
  `scripts/spec-drift.mjs`, `cdd/scripts/**`, and `tests/acceptance/guard-l3-scope.test.js`
  (`specs/gherkin/spec.md:35`), and L2 polices only files matching a spec glob
  (`scripts/spec-drift.mjs:519-546`), so the glossary edit is invisible to all three doors. The
  traceability table accordingly maps DW5 to task 3.5 alone (`tasks.md:83`). The §2 skip record's T1
  answer enumerates "the guard source, its store copy, and the pin" (`tasks.md:63`) and likewise
  omits `GLOSSARY.md`.
- **Expected:** each Done-When line spiders at least one delta requirement (or a living requirement
  that already owns the surface), and the design-gate skip record names the whole file set.
- **Actual:** DW5 is a spec-orphan criterion: real work (task 3.5) with no sponsoring requirement and
  no capability claim, plus an incomplete T1 file list.
- **Impact:** the change-terminology fix ships unaudited by spec or guard; precedent softens the
  severity (`cdd/archive/20261025-20261025-archive-stamp-name/proposal.md:88` also carried a
  self-application criterion with no delta requirement), so this is a `should`, not a blocker.
- **Smallest safe fix:** either widen the skip record's T1 answer and the traceability row to name
  `GLOSSARY.md` explicitly as a documentation criterion outside the capability set, or add the
  missing sponsorship (the honest minimal form: state in the traceability table that DW5 is
  task-only and why no capability can own it).

### R2-F005 — `note` — task 3.5's verify-by is a line-count proxy that can pass without the criterion

- **Location:** `cdd/changes/fix-l3-implementation-count/tasks.md:73`;
  criterion at `proposal.md:44`.
- **Evidence status:** Trace-backed.
- **Preconditions:** none.
- **Trace:** the verify is `grep -c "implementation subtask" GLOSSARY.md` ≥ 3. `grep -c` counts
  matching **lines**, not entries or occurrences, and the pattern is unanchored: 3 arbitrary lines
  containing the phrase pass the check without either glossary entry existing (the criterion's first
  half), and the criterion's second half — the design-gate entry naming "more than 8 implementation
  subtasks" — is never checked. Today `GLOSSARY.md` holds 0 matches, so the check does start red.
- **Expected:** a verification that fails when the two entries are absent or the gate wording is
  unfixed.
- **Actual:** a mention count that is satisfiable without the interface the task establishes.
- **Impact:** low; the task text itself states the intended edit, so the risk is a weak gate, not a
  wrong outcome.
- **Smallest safe fix:** check the three anchored shapes instead, e.g.
  `grep -c "^\*\*implementation subtask\*\*\|^\*\*tracked task\*\*\|more than 8 implementation subtasks" GLOSSARY.md`
  returning 3.

### R2-F006 — `note` — the law counts the mandated 3.1 review task as an implementation subtask, so the "inside both thresholds" framing does not survive the scaffold

- **Location:** `cdd/changes/fix-l3-implementation-count/proposal.md:5`, delta
  `specs/gherkin/spec.md:5`, `tasks.md:70-73`.
- **Evidence status:** Trace-backed.
- **Preconditions:** the scaffold mandates one section-3 review task (`lib/templates.mjs:187`) and
  the fix counts section-3 items.
- **Trace:** post-fix, `checkL3` counts the `## 3. Implementation` items, which include the mandated
  `3.1 Change review` task — the same set door 1 counts (`lib/store.mjs:204-218`,
  `lib/validate.mjs:186-207`). A change carrying 8 work subtasks therefore counts 9: no L3 error
  (limit 12) but the > 8 split signal fires at the design gate and in door 1's warning
  (`scripts/grammar-law.mjs:30-34`, `lib/validate.mjs:203`). The package never states this; DW1
  (`proposal.md:41`) pins 9 implementation subtasks passing the **guard**, which the fix delivers.
- **Expected:** the rationale's "a change with 8 work subtasks — inside both thresholds" reads as a
  claim about the scaffold's real shape.
- **Actual:** same-verdict between the doors is achieved (the point of the change), but the effective
  work budget is 7/11 because the review task occupies one slot. No criterion breaks.
- **Impact:** framing only; a reader expecting 8 work subtasks to sit below the split signal is
  surprised by a 9-count warning.
- **Smallest safe fix:** say it in the Why (one clause: the mandated section-3 review task counts
  under the narrowed law, so the split signal effectively lands at 8 counted items).

### R2-F007 — `should` — PF-6's premise rots when the delta adds requirement 54, and no task re-points it

- **Location:** `cdd/backlog.md:12` (PF-6, premise `grep:### Requirement:@cdd/specs/gherkin/spec.md=53`),
  `proposal.md:38`, delta `specs/gherkin/spec.md:5`, `tasks.md:74-91` (Close section).
- **Evidence status:** Trace-backed.
- **Preconditions:** the delta ADDs one requirement to gherkin, which currently holds 53
  (`grep -c "^### Requirement:" cdd/specs/gherkin/spec.md` = 53).
- **Trace:** PF-6's stored premise is a literal count of 53, and the repository's own most recent
  commit does exactly the re-point this change will invalidate: `91fe446`
  "docs(cdd): re-point PF-6 premise after archive-stamp-name merge (gherkin 52->53)" touched only
  `cdd/backlog.md`. After this change archives, the count is 54 and the premise is stale. The Close
  section (`tasks.md:85-91`) holds reviews, strict green, and archive, and no line re-points the
  premise; the delta simultaneously defers its own split decision **into** PF-6's cut
  (`specs/gherkin/spec.md:5`), so the change both depends on and invalidates that backlog item.
- **Expected:** a change that moves a backlog item's premise updates or re-points it, as `91fe446`
  did for the previous increment.
- **Actual:** the premise will read 53 against a 54-requirement spec, one increment behind.
- **Impact:** bounded data-hygiene defect in living triage data (`cdd/rules.md` rule 13: the backlog
  is living triage data, not spec); it erodes the premise mechanism PF-6 relies on.
- **Smallest safe fix:** add the re-point to the Close work (e.g. extend task 4.5's line or add the
  `cdd backlog` premise update after archive), mirroring `91fe446`.

## Coverage checks that found nothing

- **Requirement → task:** the delta's single ADDED requirement is implemented and verified by tasks
  3.2 and 3.3 (`tasks.md:70-71`); no requirement is task-orphaned.
- **Scenario → Done-When:** DW1 → scenario 1; DW2 → scenarios 2 and 3; DW3 → scenario 4
  (`proposal.md:41-43`, delta `specs/gherkin/spec.md:9-32`).
- **Pins:** all four scenarios end in `# Verified by: tests/acceptance/guard-l3-scope.test.js`
  (delta `specs/gherkin/spec.md:14,20,26,32`), a real path created by task 3.2; rule 7's test-first
  order holds.
- **Delta shape:** one `## ADDED Requirements` section, one `### Requirement:` heading whose
  `Feature:` name matches it exactly, one ```gherkin fence, one `When` per scenario, at least one
  `Then`, pins as the only fence comments (`cdd/rules.md:64-76`).
- **MODIFIED/REMOVED legality:** none present — the delta is ADDED-only, and no living requirement
  states a task-scale law (the `L3` mention at `cdd/specs/gherkin/spec.md:1520` only lists the law
  names), so rule 5's duplicate check comes out clean.
- **Premises verified:** rule 6 and the law constants both already say "implementation subtasks"
  (`cdd/rules.md:84-86`, `scripts/grammar-law.mjs:30-34`); door 1 counts
  `t.implementation.items` (`lib/validate.mjs:191`); smoke S9/S25 pin the thresholds as the
  Non-Goals claim (`tests/smoke.mjs:237,391`); the store copy is currently byte-identical
  (`cmp -s scripts/spec-drift.mjs cdd/scripts/spec-drift.mjs` clean), so task 3.4 starts green and
  goes red only if 3.3 lands first (see R2-F003).
- **Same-change coherence (car/garden/rocket):** proposal, delta, and tasks describe one change —
  narrow `checkL3` to section 3, restate the message, refresh the store copy, pin the term set. The
  §2 skip record's T1–T5 answers are individually credible on inspection (T3's "no new seam" checks
  out: `splitTaskSections` already returns named sections), with the T1 file-list gap recorded as
  R2-F004.
- **Design-gate record:** all five triggers answered, chosen shape named, no `design.md` required
  (`tasks.md:63`), consistent with `cdd/rules.md:2c`.

## Coverage gaps affecting this review

- None material. The package is small enough to inspect whole: 3 artifacts, 171 lines total, plus
the 1757-line living spec (read in the regions the delta touches and the requirements its laws cite).

## Author dispositions (2026-11-11)

| finding | disposition | what changed |
|---|---|---|
| R2-F001 | fixed | proposal.md Why restated on the real scaffold: 7 non-implementation items outside section 3 (1 context, 1 design, 5 close) plus the mandated section-3 review subtask, 8 work subtasks → 16 counted; the reporter's 15 quoted as their file's observed count; the trimmed acceptance fixture (13 tracked) named as such |
| R2-F002 | fixed | delta: decision sentence removed from the requirement paragraph; standalone `split-considered:` line after the `Code:` line, per the precedent at `cdd/specs/gherkin/spec.md:1757` |
| R2-F003 | fixed | task 3.3 verify scoped to `node --test tests/acceptance/guard-l3-scope.test.js` against the guard source; the byte-identity check and full sweep moved to task 3.4 ("byte-identical and sweep re-green") |
| R2-F004 | fixed | §2 skip record T1 names GLOSSARY.md (store-root documentation no capability claims); traceability DW5 row marked task-only, citing the archive-stamp-name precedent |
| R2-F005 | fixed | task 3.5 verify now the anchored three-shape grep (`^\*\*implementation subtask\*\*`, `^\*\*tracked task\*\*`, `more than 8 implementation subtasks`) returning 3 |
| R2-F006 | fixed | Why states the narrowed law still counts the section-3 review subtask: 8 work subtasks read as 9 — above the 8 split signal, far under the 12 limit |
| R2-F007 | fixed | task 4.5 extended: the archive commit re-points PF-6's premise in `cdd/backlog.md` (gherkin 53→54, mirroring 91fe446), verified by grep + git log |
