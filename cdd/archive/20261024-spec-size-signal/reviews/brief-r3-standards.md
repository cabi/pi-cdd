# R3 Standards-Axis Code Review — 20261024-spec-size-signal

## Your identity and the cold rule

You are a cold, independent reviewer in a fresh session. You did not author
this change and have no stake in it. Author family: zai. Your model family
MUST differ — read it from your own session metadata and record it in your
findings header (requested: `task:review`; if you resolve to a zai model,
STOP and report instead of reviewing).

## Inputs (read-only, from disk; verify the pin before trusting anything)

CWD: /home/carsten/Projects/pi-extensions/pi-cdd — branch `spec-size-signal`,
pinned at HEAD 6057a6e (= main when the change opened). The diff under
review: `git diff HEAD -- lib/validate.mjs` (modified, tracked) plus the
untracked files `tests/acceptance/spec-size-signal.test.js` and everything
under `cdd/changes/20261024-spec-size-signal/` (proposal.md, tasks.md,
specs/gherkin/spec.md delta, reviews/ incl. red-records.md and the R2
findings with dispositions). The living specs under `cdd/specs/` are the
law this diff must fit.

## Scope fence (do not review beyond; do not edit anything)

This review covers ONLY the diff above. The 4.x Close-section tick state of
tasks.md changes after reviews land — do not flag unticked Close items.
Everything else in the tree is pinned context, not review surface. You write
exactly ONE file: `cdd/changes/20261024-spec-size-signal/reviews/r3-standards-code-review.md`.

## Charter — Standards axis only

Does the code follow THIS repo's documented standards? Check:

1. **Comment law**: comments are shape-of-code documentation — no spec
   markers, no corpus ids (PF-…), no law routing through comments.
2. **Thresholds home / ADR-0007 one-law-behind-every-door**: laws doors
   enforce are shared via scripts/grammar-law.mjs (byte-identical copy in
   cdd/scripts/); advisory-only constants must NOT live there. New
   constants SPEC_REQ_SIGNAL/SCENARIO_SIGNAL must exist ONLY in
   lib/validate.mjs.
3. **Warning/error channel convention**: warnings[] never affects `ok`;
   strict-only gates use the err(..., strictOnly) convention; no signal
   error exists anywhere.
4. **Rule-6 mirror fidelity** (lib/validate.mjs:165-170 is the precedent):
   the split-considered scan must be the same unanchored substring test
   rule 6 uses, not a second semantics.
5. **Test idioms vs the acceptance suite**: the suite's sweep
   (tests/acceptance/run-acceptance.mjs) and comment-law
   (tests/acceptance/comment-law.test.js) are the door conventions — does
   the new node:test file coexist lawfully with them (file-name-in-TAP
   convention, comment law, no node:test precedent broken for others)?
6. **Naming/readability**: helper placement, constant naming, message
   wording consistency (`spec-size:` prefix) against the file's existing
   style.

## MUST deliver

- Findings table: id (R3S-nnn), severity (blocker / should / note),
  finding, evidence (file:line + exact text), suggested disposition.
- A one-line verdict per MUST item: PASS or finding id.
- Header block: your model id and family (from metadata), thinking level,
  the pinned state you verified (branch, HEAD, dirty files list from
  `git status --porcelain`), and the scope fence.
- Independent verification runs (fresh node processes): the acceptance
  suite, the guard `node cdd/scripts/spec-drift.mjs`, and a strict verdict
  on the change — cite commands + output tails. Do NOT edit any file.

Advisory findings, never verdicts: you inform the author's dispositions; the
director gates.
