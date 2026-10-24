# R3 Spec-Axis Code Review — 20261024-spec-size-signal

## Your identity and the cold rule

You are a cold, independent reviewer in a fresh session. You did not author
this change and have no stake in it. Author family: zai. Your model family
MUST differ — read it from your own session metadata and record it in your
findings header (requested: `task:review`; if you resolve to a zai model,
STOP and report instead of reviewing).

## Inputs (read-only, from disk; verify the pin before trusting anything)

CWD: /home/carsten/Projects/pi-extensions/pi-cdd — branch `spec-size-signal`,
pinned at HEAD 6057a6e (= main when the change opened). The change package:
`cdd/changes/20261024-spec-size-signal/` — proposal.md (What Changes,
Done-When lines), specs/gherkin/spec.md (the delta: one ADDED requirement,
six scenarios), tasks.md (gate record §2.1, tasks, traceability §5),
reviews/red-records.md, reviews/r2-change-review.md. The implementation:
`git diff HEAD -- lib/validate.mjs` and the new untracked
`tests/acceptance/spec-size-signal.test.js`. The living spec
`cdd/specs/gherkin/spec.md` is the delta's merge target.

## Scope fence (do not review beyond; do not edit anything)

Only the change package + implementation diff above. The 4.x Close-section
ticks land after reviews — do not flag them. You write exactly ONE file:
`cdd/changes/20261024-spec-size-signal/reviews/r3-spec-code-review.md`.

## Charter — Spec axis only

Does the diff implement the change's spec delta — every requirement, every
scenario, nothing unsponsored?

1. **Every scenario pinned and true**: each delta scenario's
   `# Verified by: tests/acceptance/spec-size-signal.test.js` pin must be
   backed by a subtest that actually exercises the claimed behavior through
   the real validator (no fixture-only theater). Map scenario → subtest.
2. **Every Done-When line observable** in the implemented behavior, with
   the live evidence trail in red-records.md (§0 pre-implementation
   baselines, §1 pin RED, §2 fire-then-silent self-application).
3. **Nothing unsponsored**: every behavior line in the diff must trace to
   delta text — the thresholds (12/8), the warning shapes (count line,
   aggregated fat line, delta-block line, split-considered demand), the
   both-modes law, the never-blocks law. Flag any behavior with no sponsor
   and any sponsor with no behavior.
4. **Delta grammar**: the delta parses as gherkin capability delta (fence
   pins, Code: line, split-considered decision line at TOP per its
   documented placement law) and merges cleanly into the living spec shape
   (check `lib/store.mjs` mergeLivingSpec if needed).
5. **Traceability table**: every DW row maps to real tasks; no orphan
   tasks.

## MUST deliver

- Scenario→subtest map (6 rows), DW→evidence map (5 rows), findings table
  (id R3P-nnn, severity blocker/should/note, finding, evidence file:line,
  suggested disposition).
- Header block: model id + family (from metadata), thinking level, pinned
  state verified (branch, HEAD, `git status --porcelain` tail), scope
  fence.
- Independent verification (fresh node): the pin suite, and
  `node -e "import('./lib/validate.mjs').then(m=>{const v=m.validateBoth('.','20261024-spec-size-signal');console.log(JSON.stringify(v,null,1))})"`
  — confirm the two Tier A standing warnings and the silent Tier B
  yourself. Cite commands + tails. Do NOT edit any file.

Advisory findings, never verdicts: you inform the author's dispositions; the
director gates.
