<!--
TEMPLATE — runner mission brief (skill cdd-director, asset).
Instantiate by replacing every <placeholder> (and deleting this comment), then
hand the result to the runner session as its entire brief. Nothing else rides
along — no summaries, no pasted file contents. The runner is a leaf: it
executes the brief, reports at milestones, and never pushes.
-->

# Mission — <change-name>

## The mission (one bounded outcome)

<ONE bounded outcome, one sentence: the deliverable and its Done-When shape —
e.g. "One change through the complete cdd loop: `director-skill` — skill +
mission-brief template + delta + S-pin, archived.">

## Out of scope (the boundary)

<What is explicitly OUT: the out-of-scope boundary — name the surfaces this
mission must not touch, the changes it must not make, the decisions reserved
for the director/human.>

## Read first (context files)

<The exact paths to read before anything else: cdd/rules.md, the living spec
sections that own the surface, the precedent artifacts under cdd/archive/,
the existing checks — every path by name.>

## The protocol (skeleton)

Work the loop in this order, exactly:

1. Design gate recorded in tasks §2 BEFORE the proposal — five T-answers,
   each with its reason; R1 only if T1 or T2 YES (skip recorded lawfully
   otherwise).
2. Proposal → delta + tasks → draft-green (`validate` draft mode passes).
3. R2 at draft-green: cold reviewer, package mode, brief instantiated under
   `reviews/`; dispose every finding.
4. Acceptance RED first: the S-pin check authored and observed failing before
   the artifact exists.
5. Implementation to green: artifact authored, check green, nothing else
   regressed.
6. R3 two axes: standards + spec, two cold sessions, two findings files,
   briefs under `reviews/`.
7. `validate` strict green + drift guard green (command + tail excerpt in
   every claim).
8. Close: feature commit (delta + code together), then archive pair-commit
   — feature commit and archive commit travel as a pair.

## Reviewer constraints

- **Family rule (rule 2b):** reviewers come from a different model family
  than the author's — never the author's own family.
- **Floor model:** <the least capable model a reviewer may fall back to, by
  exact provider/model-id>.
- **Free rungs:** free models are taken opportunistically only — never
  relied on, never below the floor.
- **Floor-down = STOP:** if no model at or above the floor answers, stop and
  ask the director — a floor-down is a human decision, never silently degraded.

## Milestone asks

After each milestone, intercom `ask` the director (<short session id>) and
WAIT — no work past an ask:

- **M1** — gate + proposal (+ R1 or lawful skip): <what the director checks>. Ask, then WAIT.
- **M2** — draft-green + R2: <what the director checks>. Ask, then WAIT.
- **M3** — implementation green: <what the director checks>. Ask, then WAIT.
- **M4** — Close complete + archived + commits: report, then WAIT as the final
  HOLD — no merge until the director's verification and the explicit merge
  blessing.

## Standing rules

- **Branch:** `<branch-name>` from main. Conventional commits.
- **Never push.** The director pushes after the ff-only blessing — the runner
  never touches the remote.
- Green claims cite the exact command + tail excerpt.
- New process findings go through the backlog op, minted in flight.
- You are a leaf: no push, no merge, no orchestrating further agents.

## First action

Verify the premise on disk (the absence/presence this mission assumes —
files, checks, branch state), THEN send the handshake ask confirming
protocol, reviewer plan, and delta shape. Only after the handshake: branch,
`cdd new`, and begin.
