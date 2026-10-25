# R3 standards-axis brief — 20261025-archive-stamp-name

You are a cold reviewer. You did not author this change. Your session's own
model/family must not be zai (the author's family — see Independence record).
Read only files on disk under this repository; nothing else is context.

## What you are reviewing

The implementation diff of cdd change `20261025-archive-stamp-name`, against
the STANDARDS axis only: does the code follow this repository's documented
standards? (The spec axis — does the diff implement the delta — is a separate
reviewer's job; do not grade it.)

Reproduce the diff yourself (the change branched at 5667775c; the work is
uncommitted on top of it):

    git diff HEAD -- lib tests
    git status --short
    cat cdd/changes/20261025-archive-stamp-name/proposal.md   # scope + ADR citations

Note: `tests/acceptance/archive-folder-name.test.js` is a NEW untracked file
(it will not appear in `git diff HEAD`) — read it directly. The other new
work sits in the modified `tests/acceptance/adr-reconfirm.test.js` (RC16,
RC17) and `tests/smoke.mjs` (S39).

## The standards that govern this repo

- `cdd/rules.md` — the law of the method (rule 10: no spec markers in source;
  rule 7: acceptance pins invoke the real door).
- `cdd/decisions/` — the proposal's citation paragraph names ADR-0003,
  ADR-0007, ADR-0012, ADR-0013 as followed-not-superseded; read whichever of
  those decision records you need (ADR-0012's comment law directly governs
  the new comment on `archivedBasename` in lib/store.mjs).
- Acceptance-test conventions: judge the new AF1–AF4 checks and RC16/RC17
  against the file's own established conventions (RC1–RC15 in
  `tests/acceptance/adr-reconfirm.test.js`, and
  `tests/acceptance/archive-metrics-stamp.test.js`).
- The smell baseline: read `skills/cdd-code-review/SKILL.md` §3 — its Fowler
  smell list applies as labelled judgement calls; a documented repo standard
  overrides it; skip anything tooling enforces.

## A named observation you must rule on

`lib/adr-ops.mjs` now imports `lib/store.mjs` (the single `archivedBasename`
helper). No import cycle exists (store.mjs imports templates.mjs,
grammar-law.mjs, validate.mjs, metrics.mjs — never adr-ops.mjs), but the
coupling pulls the store module into the ADR ops' load. Rule whether the
single-sourcing (one helper in the store's own module, imported by the
consumer) stands as-is under this repo's standards (ADR-0007 single-source,
ADR-0013 one claim map) or is a blocker; do not stay silent on it.

## Independence record (PF-38 law)

The author ran on zai/glm-5.3. Your cold header must record the model you
actually run on and its family, and the review is invalid if that family is
zai.

## Where your findings go

Write `cdd/changes/20261025-archive-stamp-name/reviews/r3-standards-code-review.md`
with this header shape (fill every field from your own session):

    # R3 standards-axis code review — 20261025-archive-stamp-name
    - reviewer: <model you run on> (family <provider>)
    - author of record: zai/glm-5.3 (family zai)
    - reviewed at: <pinned commit + dirty state you observed, e.g. `git rev-parse HEAD` + `git status --short`>
    - scope: git diff HEAD -- lib tests + the untracked tests/acceptance/archive-folder-name.test.js (standards axis only)

Severity grammar (this repo's findings grammar): blocker / should / note.
Every finding needs a disposition line if the author must act on it. End the
file with exactly one line:

    VERDICT: PROCEED

or `VERDICT: BLOCK` with the blockers named. Run any command you need to
verify claims (npm test is allowed; it exits 0 on the author's runs).
