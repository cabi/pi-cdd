# R3 spec-axis brief — 20261024-dw-masked-view

You are a cold reviewer. You did not author this change. Your session's own
model/family must not be zai (the author's family — see Independence record).
Read only files on disk under this repository; nothing else is context.

## What you are reviewing

The implementation diff of cdd change `20261024-dw-masked-view`, against the
SPEC axis only: does the diff implement the change's spec delta — every
requirement, every scenario, nothing unsponsored? (Standards compliance is a
separate reviewer's job; do not grade it.)

Reproduce the diff yourself (the change branched at c766f0f; the work is
uncommitted on top):

    git diff HEAD -- lib tests

The contract artifacts:

- `cdd/changes/20261024-dw-masked-view/proposal.md` — what was promised
  (What Changes, Non-Goals, the four Done-When lines, the ADR citations).
- `cdd/changes/20261024-dw-masked-view/specs/gherkin/spec.md` — the delta
  (one MODIFIED requirement, restated in full).
- The living requirement it modifies: "cdd archive stamps a derived metrics
  file" in `cdd/specs/gherkin/spec.md`.
- `cdd/changes/20261024-dw-masked-view/tasks.md` — the task chain and its
  traceability table.
- The acceptance pins: M8/M9/M10 and fixtures F1/F2 in
  `tests/acceptance/archive-metrics-stamp.test.js`.
- Red records: `cdd/changes/20261024-dw-masked-view/reviews/red-records.md`.

## What to check

1. Every scenario in the delta requirement is implemented and pinned (each
   scenario's observable outcome has a real acceptance path; M1–M7 pre-date
   this change and pin the six carried-over scenarios).
2. Nothing unsponsored: no behavior in the diff that the delta/proposal does
   not license; in particular `validateProposal` and the mask body must be
   untouched, and lib/validate.mjs's change must be exactly an export.
3. The Done-When lines are all satisfied by the diff + tests (the fourth —
   self-application at Close — is Close-time by design; it is not yours to
   verify, but its plan must be real: the proposal keeps the scaffold comment
   so raw counts 5 where the masked view counts 4).
4. Verified-by realism: every `Verified by:` in the delta names a path that
   exists and actually exercises the claim.

## Independence record (PF-38 law)

The author ran on zai/glm-5.3. Your cold header must record the model you
actually run on and its family, and the review is invalid if that family is
zai.

## Where your findings go

Write `cdd/changes/20261024-dw-masked-view/reviews/r3-spec-code-review.md`
with this header shape (fill every field from your own session):

    # R3 spec-axis code review — 20261024-dw-masked-view
    - reviewer: <model you run on> (family <provider>)
    - author of record: zai/glm-5.3 (family zai)
    - reviewed at: <pinned commit + dirty state you observed, e.g. `git rev-parse HEAD` + `git status --short`>
    - scope: git diff HEAD -- lib tests (spec axis only)

Severity grammar (this repo's findings grammar): blocker / should / note.
Every finding needs a disposition line if the author must act on it. End the
file with exactly one line:

    VERDICT: PROCEED

or `VERDICT: BLOCK` with the blockers named. Run any command you need to
verify claims (npm test is allowed; it exits 0 on the author's runs).
