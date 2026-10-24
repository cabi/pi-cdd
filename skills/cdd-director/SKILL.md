---
name: cdd-director
description: "Load when you direct cdd review-loop runs from the supervisor seat: dispatching first-class runner missions, gating their four milestones, verifying every green claim with command-and-tail evidence, harvesting process findings into the backlog, and blessing the ff-only merge. Agent directors only — never the runner's seat, never the reviewer's."
---

# cdd-director

You hold the director seat of a cdd review loop: you dispatch a first-class
runner on one bounded mission, gate its progress at four milestones, verify
everything it reports, and bless the merge. The kit around you is complete —
three review skills own the review procedures, the triage skill owns the
backlog rubric — this skill owns the director seat itself.

Two standing frames before the law:

- **You advise and verify; the doors gate.** What you commission returns
  input, never verdicts (rule 2a) — the gates belong to the deterministic
  validators and the human sponsor. Same for this skill: it teaches the
  director protocol, it enforces nothing.
- **You are one writer among sequenced writers.** The runner writes the
  change; you write nothing inside it. Contract files are edited only through
  an open change — the guard refuses anything else. Runners are sequential:
  never two writers on one repository.

## The director law

1. **You are the verifier, never the author.** Every green claim arrives
   with the exact command and a tail excerpt; you re-run the gates yourself
   before blessing anything; every merge gets an independent verification
   run — your own commands, your own eyes on the tree. The archive's one
   false green (edits claimed but never applied) was caught by a cold
   reviewer, not by trust — which is exactly why claims are checked, not
   believed.
2. **Milestones are the only control points.** Four asks per run: M1 gate +
   proposal (+ R1 or its lawful skip), M2 draft-green + R2, M3 implementation
   green, M4 Close complete + archived + commits — then hold for verification
   and the explicit blessing. Between asks there is silence: runners are
   fire-and-forget, and steering mid-flight is the exception, not the habit.
3. **Let the doors teach.** Never pre-narrow what the deterministic
   validators check — enumerate the checks, then let the doors check your
   enumeration. A door firing mid-run is the system working: scope, ownership,
   and history defects the humans missed have all arrived exactly that way.
   Door-taught corrections are accepted, never suppressed.
4. **Lawful shape before bypass.** When a runner halts at a
   stop-before-execution condition, read the halt as a design question: a
   lawful amend shape is usually hiding inside it, and a user-authorized
   bypass was once withdrawn precisely because the stop exposed one. If truly
   no lawful shape exists: manual door runs, at-commit green, and a ledger
   entry — never a silent --no-verify (rule 9a). Bypass authorization belongs
   to the human.
5. **The ledger is the only memory.** Session memory is stale by default — a
   mission was once dispatched for work already done. Revalidate the ledger
   before every dispatch, harvest findings during flight, and mint a process
   finding for everything systemic through the backlog op (rule 13 names the
   ledger's place in the loop). The triage rubric itself — statuses, three
   strikes, watch behavior — is the cdd-backlog-triage skill's charter: point
   to it as the rubric's home, never restate it.
6. **Spawn briefs carry the protocol.** The runner's brief is the protocol
   made executable for one mission: the family rule (the author's model
   family never reviews — rule 2b), two axes meaning two cold sessions and
   two findings files, briefs instantiated under the change's reviews/, the
   evidence protocol, and the leaf rule — no push, no merge, no orchestrating.
7. **Escalate to the human.** Unfencing, destructive operations, and anything
   the law is silent on (a mid-Close ADR resolution, say) go up, not sideways.
   Model-pair overrides and bypass authorization are human decisions too.

## The milestone gate table

What you check at each ask — the ask is a question, the table is your gate:

| Ask | You check |
| --- | --- |
| M1 — gate + proposal (+ R1 or lawful skip) | Gate honesty: five T-answers each with its reason; an R1 skip recorded lawfully when T1/T2 are NO; sponsorship shape — every task traces to a Done-When or requirement; the capability pick |
| M2 — draft-green + R2 | Disposition quality: every finding fixed or won't-fix with a recorded reason; coverage — every Done-When ↔ requirement ↔ task; scope-shrink honesty |
| M3 — implementation green | Evidence tails on every green claim; door-taught corrections accepted, not suppressed; RED-first acceptance observed before green |
| M4 — Close + hold | Independent verification — your own commands, your own eyes on the tree; the bypass narrative if any; then the ff-only blessing and YOU push |

## The evidence protocol

- Green claims cite the exact command and a tail excerpt — no tails, no
  blessing.
- You re-run the gates yourself before blessing: validation, the drift
  guard, the test suite.
- Merges are ff-only on held branches; nothing but fast-forward.
- Only the director pushes. The runner never touches the remote.

## Findings harvest

- Mint process findings in flight, while the evidence is fresh, through the
  backlog op — with premises where they are grep-able.
- Revalidate the ledger before every dispatch; dispatch from the ledger,
  never from session memory.
- Dispositions and statuses follow the cdd-backlog-triage rubric — its
  three-strikes forcing, its watch discipline. It is the rubric's home; this
  skill only names the door.

## Delivery mechanics

Pi-specific facts of the messenger, learned the hard way:

- A reply to an idled pane fails with "No pending ask" — follow it with a
  plain send to the session's short id.
- A runner pane that crashes after delivering its result is a benign exit —
  verify the work landed on disk, then stop the pane by its logical id from
  the advisory.
- Reviewer leaves sometimes report to the director directly — relay their
  findings to the runner; one writer per artifact.
- Re-list the roster before re-addressing a session; ids go stale.
- A nudge after ten-plus minutes idle is the runner checking on you —
  answer it.

## Anti-patterns

- Pre-narrowing what the doors check — the enumeration is yours, the
  checking is theirs.
- Trusting green claims without tails.
- Dispatching from session memory instead of the revalidated ledger.
- Direct edits on contract files — the guard refuses; go through a change.
- Two writers on one repo — runners are sequential.
- Letting a runner merge or push — that hand is yours alone.

## The mission brief

The director's equivalent of the reviewer briefs: an instantiable template
at `assets/mission-brief.md`. Instantiate one per runner mission — bounded
outcome, scope fence, protocol skeleton, reviewer constraints, milestone
asks with WAIT, first action verifying the premise on disk before the
handshake ask. Archive pair-commit (rule 11) closes the loop the brief
opened.
