# R3 standards-axis brief — 20261024-dw-masked-view

You are a cold reviewer. You did not author this change. Your session's own
model/family must not be zai (the author's family — see Independence record).
Read only files on disk under this repository; nothing else is context.

## What you are reviewing

The implementation diff of cdd change `20261024-dw-masked-view`, against the
STANDARDS axis only: does the code follow this repository's documented
standards? (The spec axis — does the diff implement the delta — is a separate
reviewer's job; do not grade it.)

Reproduce the diff yourself (the change branched at c766f0f; the work is
uncommitted on top):

    git diff HEAD -- lib tests
    cat cdd/changes/20261024-dw-masked-view/proposal.md   # scope + ADR citations

## The standards that govern this repo

- `cdd/rules.md` — the law of the method.
- `cdd/decisions/0012-comments-are-shape-only.md` — the comment law; directly
  applicable: the diff touches `lib/*.mjs` (its code line) and adds comments.
- The proposal's citation paragraph names ADR-0003, ADR-0006, ADR-0007,
  ADR-0012 as followed-not-superseded; read whichever of those decision
  records you need to judge the diff against them.
- Acceptance-test conventions: look at the pre-existing pins in
  `tests/acceptance/archive-metrics-stamp.test.js` (M1–M7) and judge the new
  M8/M9/M10 + fixtures F1/F2 against the file's own established conventions.

## A named observation you must rule on (from the director's M3 verdict)

The new import closes a module cycle: `lib/validate.mjs:10` imports
`./store.mjs`; `lib/store.mjs:23-24` imports `./validate.mjs` and
`./metrics.mjs`; `lib/metrics.mjs:19` now imports `./validate.mjs` — so
validate → store → metrics → validate. `maskHtmlComments` is a hoisted
function declaration and the full suite (47 tests, plus direct imports from
each entrypoint) is green. Rule whether this stands as-is or is a blocker
under this repo's standards; do not stay silent on it.

## Independence record (PF-38 law)

The author ran on zai/glm-5.3. Your cold header must record the model you
actually run on and its family, and the review is invalid if that family is
zai.

## Where your findings go

Write `cdd/changes/20261024-dw-masked-view/reviews/r3-standards-code-review.md`
with this header shape (fill every field from your own session):

    # R3 standards-axis code review — 20261024-dw-masked-view
    - reviewer: <model you run on> (family <provider>)
    - author of record: zai/glm-5.3 (family zai)
    - reviewed at: <pinned commit + dirty state you observed, e.g. `git rev-parse HEAD` + `git status --short`>
    - scope: git diff HEAD -- lib tests (standards axis only)

Severity grammar (this repo's findings grammar): blocker / should / note.
Every finding needs a disposition line if the author must act on it. End the
file with exactly one line:

    VERDICT: PROCEED

or `VERDICT: BLOCK` with the blockers named. Run any command you need to
verify claims (npm test is allowed; it exits 0 on the author's runs).
