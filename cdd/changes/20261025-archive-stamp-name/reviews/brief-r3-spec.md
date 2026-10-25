# R3 spec-axis brief — 20261025-archive-stamp-name

You are a cold reviewer. You did not author this change. Your session's own
model/family must not be zai (the author's family — see Independence record).
Read only files on disk under this repository; nothing else is context.

## What you are reviewing

The implementation diff of cdd change `20261025-archive-stamp-name`, against
the SPEC axis only: does the diff implement the change's spec delta — every
requirement, every scenario, nothing unsponsored? (Standards compliance is a
separate reviewer's job; do not grade it.)

Reproduce the diff yourself (the change branched at 5667775c; the work is
uncommitted on top of it):

    git diff HEAD -- lib tests
    git status --short

Note: `tests/acceptance/archive-folder-name.test.js` is a NEW untracked file
(it will not appear in `git diff HEAD`) — read it directly.

The contract artifacts:

- `cdd/changes/20261025-archive-stamp-name/proposal.md` — what was promised
  (What Changes, Non-Goals, the four Done-When lines, the ADR citations, the
  adoption step that is deliberately OUTSIDE this diff).
- `cdd/changes/20261025-archive-stamp-name/specs/gherkin/spec.md` — the
  gherkin delta (one ADDED requirement, 4 scenarios).
- `cdd/changes/20261025-archive-stamp-name/specs/adr/spec.md` — the adr
  delta (one MODIFIED requirement restated complete: 15 carried-over
  scenarios + 2 new).
- The living requirements it touches: `cdd/specs/gherkin/spec.md` (context)
  and `cdd/specs/adr/spec.md` "The reconfirm op records decision
  reconfirmation" (~line 110).
- `cdd/changes/20261025-archive-stamp-name/tasks.md` — the task chain and
  its traceability table.
- Red records: `cdd/changes/20261025-archive-stamp-name/reviews/red-records.md`.
- The acceptance pins: AF1–AF4 in `tests/acceptance/archive-folder-name.test.js`,
  RC16/RC17 in `tests/acceptance/adr-reconfirm.test.js`, S39 in
  `tests/smoke.mjs`.

## What to check

1. Every scenario in both deltas is implemented and pinned (each scenario's
   observable outcome has a real acceptance path; the 15 carried-over adr
   scenarios are pinned by the pre-existing RC1–RC15).
2. Nothing unsponsored: no behavior in the diff that the delta/proposal does
   not license. In particular: `lib/status.mjs` and `lib/metrics.mjs` must
   be untouched, `listArchived`'s split unchanged, the retro-rename of the 5
   doubled folders absent from this diff (it is a director-ordered adoption
   step AFTER archive — its presence here would be scope creep), and S10 in
   tests/smoke.mjs byte-untouched (S10 keeps the bare-append law; the new
   S39 and the acceptance file own dated-strip).
3. The Done-When lines are all satisfied by the diff + tests (the fourth —
   this change's own Close folder single-dated — is Close-time by design; it
   is not yours to verify, but its plan must be real: the compose now strips
   through archivedBasename, which this change's own dated name exercises).
4. Pin honesty: for every scenario, open its `# Verified by:` test file and
   report whether that test actually exercises that scenario — a pin that
   would stay green if the scenario regressed is a blocker. Note the
   red-records honestly mark AF2/AF4 and RC17 as green-before regression
   pins: rule whether each still genuinely exercises its scenario (AF2
   bare-append, AF4 archivedTo-locates-metrics, RC17 refusal-survives-
   normalization).
5. Verified-by realism: every `Verified by:` in both deltas names a path
   that exists and runs under `npm test`.

## Independence record (PF-38 law)

The author ran on zai/glm-5.3. Your cold header must record the model you
actually run on and its family, and the review is invalid if that family is
zai.

## Where your findings go

Write `cdd/changes/20261025-archive-stamp-name/reviews/r3-spec-code-review.md`
with this header shape (fill every field from your own session):

    # R3 spec-axis code review — 20261025-archive-stamp-name
    - reviewer: <model you run on> (family <provider>)
    - author of record: zai/glm-5.3 (family zai)
    - reviewed at: <pinned commit + dirty state you observed, e.g. `git rev-parse HEAD` + `git status --short`>
    - scope: git diff HEAD -- lib tests + the untracked tests/acceptance/archive-folder-name.test.js (spec axis only)

Severity grammar (this repo's findings grammar): blocker / should / note.
Every finding needs a disposition line if the author must act on it. End the
file with exactly one line:

    VERDICT: PROCEED

or `VERDICT: BLOCK` with the blockers named. Run any command you need to
verify claims (npm test is allowed; it exits 0 on the author's runs).
