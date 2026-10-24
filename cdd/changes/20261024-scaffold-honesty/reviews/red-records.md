# Red records — 20261024-scaffold-honesty

The observed RED outputs behind the implementation ticks (ADR-0011: ticks are
claims). Every red run was made before the corresponding fix landed; commands
re-runnable from the repo root.

## Task 3.2 — acceptance pin RED (sentence absent from both surfaces)

Command: `node --test tests/acceptance/scaffold-honesty.test.js`

Observed (before the rule-7 sentence existed in RULES_MD or cdd/rules.md):

```
exit=1
scaffold-honesty: 0 pass, 2 fail
SH1: rule 7 in RULES_MD lacks the scaffold-pin sentence
SH2: rule 7 in cdd/rules.md lacks the scaffold-pin sentence
```

## Task 3.3 — S39 + S32 leg 2 RED (validator unmasked)

Command: `node tests/smoke.mjs`

Observed (against the unmasked `validateProposal`, comment-kept fills):

```
exit=1
  FAIL S32  the scaffold round-trips: what the harness emits, the harness accepts
       FAIL
       error: rt/proposal.md: template placeholders still unfilled
  FAIL S39  comment-kept proposal fill passes clean; an unclosed <!-- still flags
       FAIL
       error: cc/proposal.md: 6 Done-When criteria (max 5 — split the change)
       error: cc/proposal.md: template placeholders still unfilled
2 FAILED, 36 passed
```

Both PF-1 defect faces appear in the S39 record: the phantom Done-When count
(5 author lines + the scaffold's own `Done-When: 1-5 completion criteria` = 6)
and the placeholder false trip on the comment's own phrases ("scope fence").

## Green (same commands, after tasks 3.4/3.5)

- `node tests/smoke.mjs` → exit=0, `38/38 passed (RUN_PI_LOOP=1 adds the isolated-pi check)`
- `node --test tests/acceptance/scaffold-honesty.test.js` → `scaffold-honesty: 2 pass, 0 fail`
- `npm test` → exit=0, `ℹ tests 40 / ℹ pass 40 / ℹ fail 0`
- `node cdd/scripts/spec-drift.mjs` → exit=0, `spec-drift: clean (5 specs, 40 acceptance test files, full scan)`

## Order note (recorded in the M3 ask)

Task 3.4's verify (`npm test` exiting 0) completes only after task 3.5: the
3.2 pin stays red until the rule-7 sentence exists. Authoring order kept
(3.4 then 3.5); the full sweep was observed green after 3.5.
