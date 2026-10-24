# R3 spec-axis code review — director-skill

## Header

- Review point: R3 (code review, before archive) — **Spec axis only**. The Standards axis ran in its own separate session (brief `brief-r3-standards.md`); that session's findings file was not read here, so neither axis frames the other.
- Reviewer form: **cold sub-agent** (fresh session, not the author's; briefed from paths on disk only — `cdd/changes/director-skill/reviews/brief-r3-spec.md`).
- Reviewer family: `opencode-zen` / `deepseek-v4.1-flash` (`PI_PROVIDER=opencode-zen`, `PI_MODEL=deepseek-v4.1-flash`). Author family: `zai` / `glm-5.3`. Families differ (different provider and lineage), so the rule 2b family clause holds.
- Repo state: branch `director-skill`, working tree dirty; `HEAD == 443f425` and `git log 443f425..HEAD --oneline` is empty (nothing committed yet; the pair-commit lands after this review).
- Artifact under review: `git diff 443f425 -- tests/smoke.mjs` (one hunk, `@@ -947,6 +947,108 @@`, +102 lines, the new check S38) plus untracked reads of `skills/cdd-director/SKILL.md`, `skills/cdd-director/assets/mission-brief.md`, and `cdd/changes/director-skill/` (proposal.md, tasks.md, specs/gherkin/spec.md).
- Output path check: `reviewPoint("R3").findingsSpec === "reviews/r3-spec-code-review.md"` (`lib/loop-law.mjs:55`) — matches this file.
- Scope fence honored: no standards/ADR/design opinions, no fixes proposed, no file edited except this one.
- State observed while reviewing (context, not a verdict): `node tests/smoke.mjs` → 37/37 passed; `cdd validate director-skill` strict → PASS; `node cdd/scripts/spec-drift.mjs` → `spec-drift: clean (5 specs, 30 acceptance test files, full scan)`, exit 0.

## Method

Pins were judged by mutation, not by reading: a scratch copy of the repo (`/tmp/specrev`, outside the repo — no repo file was touched) was edited against a specific scenario clause and `node tests/smoke.mjs` re-run. Every mutation result quoted below is an observed run, not a thought experiment.

## Checklist coverage

1. **Every scenario implemented** — clean. All three delta scenarios' THEN clauses trace to the S38 block plus the two new artifacts: loadability/frontmatter/rules citations (`tests/smoke.mjs:952-1027` ← `specs/gherkin/spec.md:79-82`), the seven law points, gate table, evidence protocol, harvest, delivery mechanics, anti-patterns (`tests/smoke.mjs:964-1002` ← `spec.md:84-93`), and the mission-brief anatomy (`tests/smoke.mjs:1028-1050` ← `spec.md:95-101`). Spot-checks of the artifact bodies found each named clause present (`skills/cdd-director/SKILL.md:25-120`, `skills/cdd-director/assets/mission-brief.md:8-86`); the five cited rule numbers resolve to `cdd/rules.md:13` (2a "Review points are advisory..."), `:34` (2b "Reviews run cold"), `:101` (9a "No hook bypass"), `:107` (11 "Archive"), `:119` (13 "The backlog"). No finding.
2. **Pins actually pin** — findings S1–S3 (should), N1–N8 (note). Several THEN clauses are pinned only by a bare token anywhere in the file, so a substantial regression to that clause leaves S38 green.
3. **No unsponsored code** — clean for the diff: the single hunk is entirely check S38, and every assertion in it is traceable to a scenario clause (frontmatter/bounds/routing → `spec.md:79`; 7 points and the gate table → `spec.md:88-90`; evidence protocol → `spec.md:91`; harvest → `spec.md:90`; delivery mechanics → `spec.md:90`; anti-patterns → `spec.md:92`; mission-brief anchors → `spec.md:98-100`). No dead code, no speculative hooks, no drive-by edit; S33/S36/S37 are untouched. Two note-level observations on the artifact bodies: N9, N10.

## Findings

### S1 — `should` — the "director re-runs gates before blessing" clause is pinned by a bare token, not by the behavior

Disposition: **fixed** — evidence-protocol clauses are now scoped to their own section and the re-run assert also requires "before blessing"; the inverted-bullet mutation now fails S38 (verified on a scratch copy).

The scenario's THEN requires the skill to carry the evidence protocol clause "the director re-runs gates before blessing" (`cdd/changes/director-skill/specs/gherkin/spec.md:91`). The pin is `assert(/re-?runs?/.test(text), ...)` over the whole skill text (`tests/smoke.mjs:984`); the same sentence also exists in law point 1 (`skills/cdd-director/SKILL.md:28`), so the token survives any change to the protocol section itself. Mutation: replacing the bullet `skills/cdd-director/SKILL.md:82-83` ("You re-run the gates yourself before blessing: validation, the drift guard, the test suite.") with its inverse — "Reruns are the runner's job: you bless on its word; re-runs cost time." — leaves S38 green (37/37 passed). The clause the scenario names can be inverted without the pin noticing.

### S2 — `should` — the "least capable" floor-model clause is pinned by the two words "floor model" alone

Disposition: **fixed** — "least capable" is now a pinned anchor on the brief; the least-to-most mutation now fails S38.

`spec.md:98` requires the brief to carry "the floor model as the least capable model a reviewer may fall back to". The pin is the anchor `"floor model"` (`tests/smoke.mjs:1041`) — the qualifier that carries the safety meaning ("least capable", i.e. the fallback floor) is not constrained. Mutation: `skills/cdd-director/assets/mission-brief.md:54` changed from "the least capable model a reviewer may fall back to" to "the most capable model a reviewer may fall back to" leaves S38 green (37/37 passed). The floor — the one number-like constraint in the reviewer-constraints clause — is unpinned.

### S3 — `should` — three of the five delivery-mechanics clauses are pinned by single words; dropping their instruction halves stays green

Disposition: **fixed** — the mechanics are pinned on their instruction halves ("plain send", "landed on disk|work landed", "logical id"), scoped to the section; deleting the halves now fails S38.

`spec.md:90` names the mechanics: "idled-pane asks fail with No pending ask **so follow with a send**, crashed runner panes are benign exits **verified by work landed**, reviewer leaves relay through the director, re-list the roster before re-addressing, and nudges are answered". The pins are bare tokens on the file text — `/benign/`, `/relay/`, `/re-?list/i`, `/nudge/` (`tests/smoke.mjs:993-996`). Mutation: deleting the operative halves — "follow it with a plain send to the session's short id" (`skills/cdd-director/SKILL.md:101-102`) and "verify the work landed on disk, then stop the pane by its logical id from the advisory" (`SKILL.md:103-104`) — leaves S38 green (37/37 passed). Only the "No pending ask" literal (`tests/smoke.mjs:992`) is a real anchor among the five.

### N1 — `note` — the gate table is pinned as "at least the four asks", not "exactly the 4 asks"

Disposition: **fixed** — the pin asserts exactly 4 gate-table rows; an added M5 row fails S38.

`spec.md:88` requires "a milestone gate table covering **exactly** the 4 asks M1, M2, M3, and M4". The pin loops `for (const m of ["M1","M2","M3","M4"]) assert(gate.includes(m), ...)` (`tests/smoke.mjs:981`). Mutation: adding a fifth row `| M5 — bonus ask | nothing |` to the table (`SKILL.md:73-76`) leaves S38 green (37/37 passed). The "exactly" in the scenario is not enforced, while the sibling count in scenario 2 ("exactly the 7 points") is (`tests/smoke.mjs:968`).

### N2 — `note` — only three of six named sections are located; renaming the others stays green

Disposition: **fixed** — all six charter sections are located by heading and asserted on their own text; a renamed section now fails S38.

The pin locates the law, the gate table, and anti-patterns sections by heading (`tests/smoke.mjs:965`, `:979`, `:998`) but has no section-existence assertion for the evidence protocol, the findings harvest, or the delivery mechanics — their clauses are asserted against the whole file. Mutation: renaming `## Delivery mechanics` (`SKILL.md:97`) to `## Messenger trivia` leaves S38 green (37/37 passed). Deleting the entire evidence-protocol section is caught, but only incidentally by the `/only the director pushes/i` assertion (`tests/smoke.mjs:986`) — that was the sole failure observed (`skills/cdd-director: director-pushes law missing`) when `SKILL.md:78-85` was removed, because `/command/` + `/tail/` and `/re-?runs?/` are still satisfied from law point 1 (`SKILL.md:28`).

### N3 — `note` — the description's "to cdd projects" routing target is not pinned

Disposition: **fixed** — the description assert now requires cdd scoping and the >= 20 bound matches the scenario's "20 to 1024"; dropping "cdd" from the routing clause fails S38.

`spec.md:79` requires the description to carry "a when or whenever routing clause **to cdd projects**". The pin is `/\bwhen(ever)?\b/i` (`tests/smoke.mjs:963`), which constrains only the conjunction. Mutation: `SKILL.md:3` description changed to "Load when you are bored and want something to read: ..." (cdd-project routing gone, "when" kept) leaves S38 green (37/37 passed). Also note the bound check at `tests/smoke.mjs:962` uses `length > 20`, so a description of exactly 20 characters — inside "the 20 to 1024 character bounds" as written — would fail the pin.

### N4 — `note` — the mission-brief "protocol skeleton" is pinned by the words "protocol" and "pair-commit"

Disposition: **fixed** — the skeleton is pinned on its named steps (design gate, before the proposal, draft-green, red first, two axes, two cold sessions, strict, guard, pair-commit) scoped to the brief's protocol section; gutting the list fails S38.

`spec.md:98` requires "the protocol skeleton from design gate to archive pair-commit". The pins are `briefL.includes("protocol")` and `briefL.includes("pair-commit")` (`tests/smoke.mjs:1038-1039`). Mutation: replacing the whole eight-step protocol list (`skills/cdd-director/assets/mission-brief.md:29-48`) with "Some protocol stuff; ends with the pair-commit." leaves S38 green (37/37 passed). The skeleton — the brief's core sequence — is not pinned beyond two words.

### N5 — `note` — the pin over-constrains wording beyond the delta: "two writers" vs the scenario's "2 writers"

Disposition: **fixed** — the assert accepts both spellings (/(2|two) writers/); the delta-verbatim "2 writers" wording passes (verified green on a scratch copy).

`spec.md:92` names the anti-pattern "2 writers on one repo"; the pin requires the literal substring `"two writers"` (`tests/smoke.mjs:1000`) in the anti-patterns section. Mutation: rewriting `skills/cdd-director/SKILL.md:119` to the delta's own wording ("2 writers on one repo — runners are sequential.") **fails** S38 with `skills/cdd-director: anti-pattern missing: two writers`. An implementer following the scenario text verbatim cannot pass the pin; the pin pins a spelling the spec does not state.

### N6 — `note` — the "restates no fragment" check is line-scoped and length-gated, so wrapped law text can evade it

Disposition: **fixed** — the no-restate check walks 60-character word-start windows over the whole whitespace-normalized law text; a hard-wrapped law fragment injected into the skill now fails S38.

`spec.md:81` requires "its body restates no fragment of the law text in cdd/rules.md under a whitespace-normalized comparison". The pin normalizes whitespace but iterates `rules.split("\n")` per physical line and skips fragments shorter than 60 characters (`tests/smoke.mjs:1022-1026`). A law sentence that `cdd/rules.md` wraps across several short lines — each under 60 characters — can be copied into the skill and the concatenated whitespace-normalized comparison is never made, so the pin stays green. (Verbatim whole-line copies of 60+ characters are caught; that path was confirmed by the pin's own construction, not by mutation.)

### N7 — `note` — "milestone asks that each end in a WAIT" is met by one section-level WAIT plus a HOLD, and the pin cannot tell

Disposition: **fixed** — the brief ends each of its 4 ask bullets in a WAIT (M4's WAIT is its final HOLD) and the pin requires exactly 4 ask lines each carrying a WAIT; dropping one fails S38.

`spec.md:98` requires "milestone asks that each end in a WAIT". The brief states WAIT once, above the four bullets (`skills/cdd-director/assets/mission-brief.md:63-64`), and the M4 bullet ends in "report, then HOLD for verification and the explicit merge blessing" (`mission-brief.md:69-70`), not WAIT. The pin is the bare substring `"wait"` (`tests/smoke.mjs:1045`), so it neither requires per-ask WAIT nor distinguishes WAIT from HOLD. (Removing the single "WAIT:" line does fail S38 — that is the reason the anchor is green — so this is a wording/traceability gap, not a hole.)

### N8 — `note` — floor-down halts to "the director" where the scenario says "a human decision"

Disposition: **fixed** — the floor-down line names "a human decision", pinned inside the reviewer-constraints section with floor-down and stop; swapping it for "an engineering call" fails S38.

`spec.md:98` requires "floor-down halting the run for a human decision". The brief says "if no model at or above the floor answers, stop and ask the director; never silently degrade" (`skills/cdd-director/assets/mission-brief.md:58-59`) — the halt target named is the director, not a human decision; the brief does not say the director escalates that decision. The pin is `briefL.includes("floor-down")` + `briefL.includes("stop")` (`tests/smoke.mjs:1043-1044`), so the target is unpinned either way. Advisory: this may be intended (law point 7 makes the human the escalation point, `SKILL.md:63-66`), but the brief's text as written does not carry the scenario's clause.

### N9 — `note` — two SKILL.md prose sections are sponsored by the requirement description, not by any scenario THEN

Disposition: **won't-fix** — requirement-prose sponsorship is lawful: the requirement description itself names the advises-never-enforces posture and the mission-brief template as capability content, and pinning every prose section into a scenario would freeze editorial structure the requirement deliberately leaves open; the frame/anti echo is emphasis in two registers (posture vs. catalog), and the no-restate pin governs law text, not intra-file echo.
`SKILL.md:12-22` ("Two standing frames before the law") and `SKILL.md:122-129` ("## The mission brief") are content no scenario THEN enumerates; sponsorship runs through the requirement description prose ("The skill advises; it never enforces ... plus an instantiable mission-brief template under its assets", `spec.md:64-73`) rather than through a scenario clause. The first frame also restates two anti-patterns nearly verbatim ("Direct edits on contract files" `SKILL.md:20` vs `SKILL.md:117`; "never two writers on one repository" `SKILL.md:21-22` vs `SKILL.md:119`). Not a correctness problem; recorded because the Spec axis asks whether every hunk is sponsored by a requirement or a task verify-by, and these two sections have no scenario behind them.

### N10 — `note` — the delta's `Code:` line enumerates files where the proposal promised a directory glob

Disposition: **won't-fix** — the Code line names the exact files the capability owns, which is the accurate merged state (no third file under skills/cdd-director/ exists); any future file under the directory arrives through a change that amends the Code line, and the drift guard confirms single-owner cleanliness today.
`cdd/changes/director-skill/specs/gherkin/spec.md:104` claims `skills/cdd-director/SKILL.md, skills/cdd-director/assets/mission-brief.md, tests/smoke.mjs`, while the proposal's implementation surface is `skills/cdd-director/**, tests/smoke.mjs` (`cdd/changes/director-skill/proposal.md:39`). The drift guard is currently clean (`node cdd/scripts/spec-drift.mjs` → clean, exit 0), so nothing is broken now; but the merged living-spec line will claim only the two named files, so any later file added under `skills/cdd-director/` would be unowned by this capability's Code line. Advisory only — the delta's Code line is the narrower surface, not a wrong one.

## Disposition summary

- blocker: 0
- should: 3 (S1, S2, S3)
- note: 10 (N1–N10)
- Dispositioned: 11 `fixed` (S1–S3, N1–N8), 2 `won't-fix` with recorded reasons (N9, N10); every fix was mutation-verified on a scratch copy outside the repo (`/tmp/pinrev` — 9 mutations re-run: 8 now fail S38, the N5 spelling acceptance passes by design).
