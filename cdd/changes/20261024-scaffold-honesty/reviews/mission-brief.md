

Complete your task. When finished, call the subagent_done tool. The user can interact with you at any time.

# Mission — 20261024-scaffold-honesty

Your director is pi session 01a16f41 (short id). Milestone asks go to it via intercom.

## The mission (one bounded outcome)

One change through the complete cdd loop: `20261024-scaffold-honesty` — the proposal scaffold's own instruction text never phantom-counts as a Done-When line and never trips the placeholder check on its own scaffold phrases (PF-1), the PF-2 doc line lands (changing the scaffold legitimately requires editing the S-series smoke pins), both behaviors pinned RED-first, S-series smoke-pin edits in the same change, archived.

## Out of scope (the boundary)

- No validator behavior change beyond the scaffold↔placeholder interplay PF-1 names — no new gates, no thresholds, no split-considered law (PF-32 is a separate mission).
- No living-spec restructure, no capability-split work (PF-6/PF-32).
- No riders beyond what the doors demand (PF-21 README line, PF-28 enumeration: other changes' cargo).
- Reserved to the director/human: bypass authorization, unfencing, destructive operations, anything the law is silent on — stop and ask, never sideways.

## Read first (context files)

- cdd/rules.md — the law, first, every run
- cdd/backlog.md items PF-1, PF-2, PF-13, PF-23 (PF-1 is the mission; PF-13 is the precedent fix on this same surface; PF-23 warns the backlog resolve op replaces notes — preserve prior note text when resolving)
- lib/instructions.mjs — the scaffold text around line 35 ("Done-When: 1-5 completion criteria, each on its own \"Done-When:\" line…") and every scaffold phrase the placeholder check scans
- lib/validate.mjs — validateProposal: the Done-When line counting and the placeholder check
- tests/acceptance/law-done-when.test.js and every S-series smoke pin (find them: grep -rl 'S[0-9]' tests/acceptance/)
- Precedent archive: cdd/archive/20261023-design-docs/ (PF-13's fix: placeholder joined to the existing validateProposal door)
- Owning capability specs: grep for instructions.mjs and validate.mjs in cdd/specs/*/spec.md Code: globs — orient before picking the capability

## The protocol (skeleton)

Work the loop in this order, exactly:

1. Design gate recorded in tasks §2 BEFORE the proposal — five T-answers, each with its reason; R1 only if T1 or T2 YES (skip recorded lawfully otherwise).
2. Proposal → delta + tasks → draft-green (`validate` draft mode passes).
3. R2 at draft-green: cold reviewer, package mode, brief instantiated under `reviews/`; dispose every finding.
4. Acceptance RED first: the pin authored and observed failing before the artifact exists.
5. Implementation to green: artifact authored, check green, nothing else regressed.
6. R3 two axes: standards + spec, two cold sessions, two findings files, briefs under `reviews/`.
7. `validate` strict green + drift guard green (command + tail excerpt in every claim).
8. Close: feature commit (delta + code together), then archive pair-commit — feature commit and archive commit travel as a pair.

## Reviewer constraints

- **Family rule (rule 2b):** you author on zai/glm-5.3 — reviewers never zai family. Read the model actually used from completion metadata; report model + thinking level in the milestone ask.
- **Shortlist:** host config `~/.pi/agent/herdr-agents/config.json` `models.tasks.review` (currently opencode-zen/deepseek-v3.1-flash, opencode-zen/gpt-6-luna) via `model: task:review`, `thinking: max`.
- **Floor model:** opencode-zen/deepseek-v4.1-flash. The PF-29 fallback recipe (exact working one-shot invocation, known failure modes) lives at cdd/archive/20261024-claim-map/reviews/pf29-invocation-log.md — read it before your first reviewer spawn.
- **Free rungs:** free models opportunistically only — never relied on, never below the floor.
- **Floor-down = STOP:** if no model at or above the floor answers, stop and ask the director — never silently degrade.

## Milestone asks

After each milestone, intercom `ask` the director (01a16f41) and WAIT — no work past an ask; every ask ENDS THE TURN:

- **M1** — gate + proposal (+ R1 or lawful skip): director checks five T-answers each with its reason; R1 skip lawfully recorded when T1/T2 are NO; sponsorship shape — every task traces to a Done-When or requirement; the capability pick. Ask, then WAIT.
- **M2** — draft-green + R2: director checks disposition quality (every finding fixed or won't-fix with a recorded reason); Done-When ↔ requirement ↔ task coverage; scope-shrink honesty. Ask, then WAIT.
- **M3** — implementation green: director checks evidence tails on every green claim; RED-first acceptance observed before green; door-taught corrections accepted, not suppressed. Ask, then WAIT.
- **M4** — Close complete + archived + commits: report everything (validate strict tail, guard tail, pair commits, PF dispositions), then WAIT as the final HOLD — no merge until the director's own verification and the explicit merge blessing quoted from a live intercom message id.

## Standing rules

- **Branch:** `scaffold-honesty` from main (main at abb97d8, clean). Conventional commits.
- At `cdd new`, copy this brief to cdd/changes/20261024-scaffold-honesty/reviews/mission-brief.md (PF-9 convention: briefs live under the change).
- At Close, resolve PF-1 and PF-2 through the backlog op citing this change — preserve their prior note text in the resolution (PF-23: resolve replaces notes).
- **Never push.** The director pushes after the ff-only blessing — you never touch the remote.
- Green claims cite the exact command + tail excerpt.
- New process findings minted in flight through the backlog op, source cited.
- You are a leaf: no push, no merge, no orchestrating beyond your cold reviewers.

## First action

Verify the premise on disk — grep -c 'Done-When: 1-5' lib/instructions.mjs returns 1; PF-1 and PF-2 are open in cdd/backlog.md; `cdd` status shows no open changes; main is clean at abb97d8 — THEN send the handshake ask confirming protocol, reviewer plan, and delta shape. Only after the handshake: branch, `cdd new`, and begin.

Your FINAL assistant message (before calling subagent_done or before the user exits) should summarize what you accomplished.