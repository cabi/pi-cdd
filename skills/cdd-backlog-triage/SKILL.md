---
name: cdd-backlog-triage
description: "Triage process findings for cdd projects: decide whether run friction deserves a PF-n line in cdd/backlog.md, pick its status, and mint or resolve it through the cdd backlog op. Use when a cdd run, review, or Close surfaces process friction and the question is record vs change vs decline — the rubric that makes triage uniform instead of tribal memory."
---

# cdd-backlog-triage — the backlog triage rubric

Use this skill whenever a run surfaces process friction — a door, scaffold,
law-text, or protocol stumble — and the question is whether and how it lands
in `cdd/backlog.md`. The backlog is living triage data: no door validates it,
no guard checks it (loop law rule 13). This skill advises; it never enforces.

## When to record at all

Record systemic or repeated friction — a defect class the next run will hit
again, not a one-off stumble fixed in the moment.

- Record: friction another runner would re-hit even when this run worked
  around it — PF-18 (pre-commit L2 deadlocks the archive pair-commit),
  PF-19 (two door checks with contradictory demands, one commit), PF-20
  (globToRe star-escape silently nullifies most Code globs) are all guard
  corners found and worked around mid-run, recorded so the next runner
  starts from them.
- Do not record: single-run stumbles with no structural residue (a typo
  fixed in place, a misread instruction). The boundary cases PF-5 and PF-7
  show recording stays cheap when the decision itself — won't-do, with the
  reason — is the knowledge worth keeping.

## The status taxonomy — the backlog op's 5 grammar statuses

- `open` — active: raised, awaiting decision or fix. The starting status
  every add mints (PF-1, PF-9).
- `watch` — real but not ripe: holding for evidence, re-triage on
  recurrence (PF-6: gherkin spec navigation concern ripening as the spec
  grows).
- `done` — closed: the fix landed or the item settled; the note names the
  close (PF-16: hook wiring closed by 20261023-hook-wiring; PF-8: per-axis
  findings files closed by r3-findings).
- `won't-do` — consciously declined; the reason rides the note (PF-5:
  tool-side friction, no repo action; PF-7: free-rung 429s, deployment
  policy).
- `seeded-into-change` — an open change carries the fix; the op requires
  the adopting change name in the change field at resolve time.

The note-level pattern "evaluate on recurrence" (PF-3, PF-4) is not a grammar status — it is a note convention for deferred decisions:
generalize into law or a change only if the pattern recurs. Never invent
statuses; the op refuses them (allowed: open, watch, done, won't-do,
seeded-into-change) and resolving to open refuses — open is the starting
status, not a resolution.

## The item grammar (one line, ids strictly increasing PF-1..)

`- PF-n [status] summary | source: ref [| change: name] [| note: text]`

- summary — the finding in one line, no pipes.
- source — the run, review, or archived change that raised it. A steer is
  believed only when an on-disk artifact backs it (the ledger header's own
  convention): source names the artifact — the change folder's review file,
  the commit, the guard or CI output — never a verbal claim.
- change — the adopting change when the fix rides one.
- note — triage reasoning: why-record, the fix shape, evaluate-on-recurrence
  deferrals, corrections dated in place (PF-19's CORRECTED note is the
  precedent).

## The two inviolable conventions

1. A steer is believed only when an on-disk artifact backs it. Every claim
   in a summary carries its evidence in source or note. PF-14 runs the
   enforcement direction: a green claim without evidence is unverified —
   every milestone and Close report cites the exact command and its tail
   excerpt.
2. Milestone and Close reports cite PF-n ids, never prose: "minted PF-21
   (watch)" — not "recorded a finding about briefs". The id is greppable;
   prose is not.

## Change-worthy vs record-only

- Change-worthy: two independent recurrences, or one occurrence with a
  known structural fix. The fix then rides a change — seeded-into-change
  with the adopting name, or the note proposes the change shape (PF-12:
  guard should flag dead-path Code globs; PF-20: the glob fix with its
  acceptance-test shape spelled out).
- Record-only: everything else. The line exists so the next occurrence
  finds its precedent: won't-do with the reason (PF-5, PF-7), open/watch
  with an evaluate-on-recurrence note (PF-3, PF-4).

## Minting and resolving — only through the cdd backlog op

Items are minted (add: summary + source required, status defaults to open)
and resolved (resolve: status required; seeded-into-change requires the
change name) only through the cdd backlog op — never freehand. The exactly
one freehand exception: direct edits to an existing item's note field that
extend framing, grammar intact — note-field edits on existing items are
neither minting nor resolving, the two paths rule 13's op list (list, add,
resolve) names, so the exception reads as no contradiction of the law.
Rewriting statuses or summaries by hand is never note editing — route it
through resolve.

## Findings-file hygiene

Review briefs and findings live under the change folder
(`cdd/changes/<name>/reviews/`), where the archive keeps them — never /tmp
(PF-9: a reaped brief forced its reviewer to reconstruct it mid-run).
Process findings minted from a review cite that review's findings file in
source.
