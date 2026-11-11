# Red records — 20261111-guard-untracked-claims

Task 3.2 evidence. Pre-fix run of the acceptance pin against the unmodified
guard (`scripts/spec-drift.mjs` at HEAD, store copy in sync):

```
$ node --test tests/acceptance/guard-file-universe.test.js
  FAIL UF1  untracked util.mjs double-claimed reds the full scan with exactly 1 O finding
       exactly 1 O finding, got 0: []
  ok   UF2  the pre-commit door prints no O finding for the untracked file
  ok   UF3  a gitignored claim is an L2 dead glob with the frozen wording, never an O finding
  FAIL UF4  an untracked file claimed by an open delta under an accepted ADR fires exactly 1 A1
       the scan must red on the uncited untracked claim, got exit 0:
spec-drift: clean (1 spec, 1 acceptance test file, full scan)
  ok   UF5  an untracked claimed file fires neither L2 staleness nor A2 — the scan stays clean
  ok   UF6  a staged util.mjs conflicts in the full scan and the pre-commit door alike

guard-file-universe: 4 passed, 2 failed
```

Reading: the two behavior scenarios red exactly as the change demands —
UF1 because the untracked `src/shared/util.mjs` never enters the claim
universe (0 O findings where exactly 1 must fire), UF4 because the
uncited untracked delta claim is invisible (`spec-drift: clean` where an
A1 must fire). The four non-regression pins hold pre-fix: staged doors
stay index-limited (UF2), ignored files stay outside the universe (UF3),
untracked claimants fire no history law (UF5), index files conflict in
every mode (UF6).
