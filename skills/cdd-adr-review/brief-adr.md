<!--
TEMPLATE — ADR review brief (skill cdd-adr-review). Instantiate by replacing
every <placeholder>, then hand the result to a cold reviewer session as its
entire brief. Nothing else rides along — no summaries, no pasted file
contents. Loop law rule 2b: the reviewer is not the author.

Instantiation checklist (author):
- The ADR files under review (drafts, or accepted ADRs whose decision content
  an open change amended) and the pinned repo state (commit).
- Reviewer model family MUST differ from the author's (rule 2b author-family clause; same provider/model
  lineage = same family). No other-family reviewer available → stop and ask
  the human sponsor; never silently degrade.
-->

# ADR review — <change-name or "unbatched drafts">

## Change identity

- ADRs under review: `cdd/decisions/<ids>` — drafted or amended by
  `<change-name>` (or standalone drafts when no change owns them)
- Review point: ADR review, at Close before archive when a change drafted an
  ADR or amended one's decision content (a Reconfirmed-by paragraph or a
  typo fix does not count)

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the
  paths below, from disk at the pinned state. Loop law rule 2b — the reviewer
  is not the author of the artifacts under review.
- Your model family must differ from the author's model family (family = same
  provider or model lineage). Verify your own family from your runtime
  environment (e.g. `PI_PROVIDER`) — the brief states the author's family,
  never yours as settled fact. If you cannot establish that the families
  differ, say so in your findings header and stop.

## Inputs (paths, pinned state)

- Repository at commit `<sha>` (or the working tree — state that in your
  findings header).
- The ADRs under review: `cdd/decisions/<ids>.md`
- Every accepted ADR for context: `cdd/decisions/` — the one decisions
  home: ADRs 0001–0007 the product decisions, 0008 and later the loop
  decisions.
- The amending change folder `cdd/changes/<change-name>/` (proposal, delta)
  for what the amendment claims.
- `cdd/rules.md` rule 12 (the four-criterion law — hard to reverse;
  surprising without context; a real trade-off; crosses capability
  boundaries) and the `cdd/scripts/spec-drift.mjs` A0/A1/A2 rules (A0
  lifecycle, A1 citation-on-touch, A2 staleness).

## Scope fence

- In scope: the ADRs' merit (four-criterion test, both directions), form,
  and consistency with accepted decisions.
- Out of scope: whether the underlying change was implemented well (that is
  R3), proposing redesigns, any fix. You report findings; you do not edit
  files.

## MUST-DELIVER checklist (the charter)

1. **Four-criterion test, both directions** — each ADR under review must be
   hard to reverse, surprising without context, a real trade-off, and
   crossing capability boundaries; a record that fails the test is noise (a
   finding), and a decision that passes all four but is unrecorded is the
   expensive omission (also a finding).
2. **Form** — `code:` globs match real paths; the title states the decision;
   options are actually weighed (the chosen one and the rejected ones with
   reasons); consequences include what gets harder, not only what improves.
3. **No silent contradiction** — the record does not quietly contradict an
   accepted ADR; a real reversal must be explicit (amend or supersede, with
   the reasoning visible).
4. **Amend vs supersede vs reconfirm chosen rightly** — when an accepted ADR
   changes: a tightened or extended core decision amends in place with a
   dated amendment section; a reversed core decision supersedes with a new
   ADR; an untouched decision under overlapping globs gets only a
   Reconfirmed-by note. The wrong instrument is a finding.

## Findings grammar (advisory — no fixes, no verdicts)

Each finding: severity `blocker` | `should` | `note`, the finding, evidence
(path:line). You report every finding with disposition `open`; the author
later sets `fixed:` or `won't-fix:` when disposing.
Never red/green verdicts; acceptance stays with the human.

## Output

Write your findings to `cdd/changes/<change-name>/reviews/adr-review.md`
(output path per `reviewPoint("ADR").findings` in `lib/loop-law.mjs`; for
ADR drafts that no open change owns, use `cdd/decisions/reviews/<date>-adr-review.md` —
if the brief instantiates a `<change-name>`, the change path always wins). Header
records your reviewer form (cold sub-agent / same-session re-read) and your
model family vs. the author's.
