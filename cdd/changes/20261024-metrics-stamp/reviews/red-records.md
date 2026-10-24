# red records — 20261024-metrics-stamp

## 2026-10-24 — acceptance pins RED before any implementation (task 3.2)

Command: `node tests/acceptance/archive-metrics-stamp.test.js`
Commit at run: working tree at pinned HEAD 0d63d30 + change artifacts + pin file; lib/metrics.mjs absent.

Three fixture-shakeout iterations preceded the true RED (fixture bugs, not implementation findings): commit helper never ran `git commit` (`execFileSync(...) === undefined` — execFileSync returns `""`); ambiguous `## Counts` prose in fixture A; fixture proposal missing `Code:` line (strict validation: `missing "Code: <globs>" line`). After fixing the fixtures, all three fixtures strict-validate and the only failures are the stamp checks.

Output tail:

```
  FAIL M1  archive writes metrics.md with the spec-strength block
       archive result missing stamp outcome: null
  FAIL M2  stamped counts equal direct counts and ride the single parse
       count drift vs direct counts:
null
  FAIL M3  all 7 findings layouts counted, one format-version line, zero-row file is 0
       Cannot read properties of null (reading 'split')
  FAIL M4  lying declared counts yield exactly 1 mismatch line; parsed numbers win
       Cannot read properties of null (reading 'split')
  FAIL M5  3 labeled derivable git facts, beyond-2-norm omitted-with-reason, honest gaps named
       commits-before-archive not 3 as-of-stamp:
null
  FAIL M6  non-git store stamps git fields not-derivable, never estimated
       commits not stamped not-derivable:
null
  FAIL M7  total stamp failure archives anyway with stamped:false + reason
       result missing stamped:false: null

0 passed, 7 failed
exit=1
```

All 7 scenarios of the delta observed RED: the stamp does not exist, the archive result carries no stamp outcome, and no derivation runs.

## 2026-10-24 — R2-driven pin extension, RED again before implementation

R2 (reviews/r2-change-review.md) surfaced two shoulds; both were disposed by extending the pin file (disposition-total assertions in M3; fixture D — a git store with exactly 1 path commit — pinning elapsed below 2 commits as not-derivable-with-reason in M5). Re-run after the extension, still before any implementation tick:

Command: `node tests/acceptance/archive-metrics-stamp.test.js`

```
  FAIL M1 … FAIL M7 (all 7 checks)
0 passed, 7 failed
exit=1
```

Fixture D strict-validates (no fixture assert fired); the only failures remain the stamp checks.

## 2026-10-24 — GREEN after implementation (tasks 3.3–3.5)

Three implementation defects were found and fixed by the pins themselves before green: `matchAll` over a non-global regex (TASK_ITEM anchors needed the m flag); a hyphen-vs-em-dash mismatch in the DISPOSED layout; and the consecutive-commit loop ran newest-first, inverting re-tick detection and the elapsed interval. Pin correction along the way: archivedTo is store-relative, so the pin joins it to the fixture root.

Sweep (command → tail):

- `node tests/acceptance/archive-metrics-stamp.test.js` → `7 passed, 0 failed`, exit 0
- `npm test` → `ℹ duration_ms 6625.700261`, `npm-test-exit=0`
- `node tests/smoke.mjs` → `38/38 passed`, `smoke-exit=0`
- `node cdd/scripts/spec-drift.mjs` → `spec-drift: clean (5 specs, 42 acceptance test files, full scan)`, guard-exit=0 (after the proposal cites ADR-0003/0007/0012 and the source comments dropped corpus pointers per ADR-0012 — the two initially failing ADR tests, comment-shape-adr and decisions-home, went green with the guard)
- fresh-node pair (PF-35): `validateChange(".", "20261024-metrics-stamp", "draft")` → ok=true; strict → ok=false only on then-unticked 3.3–3.5 (the expected mid-implementation state; re-verified after ticking below)
- self-application: `cdd validate` draft on this change with the new lib in place → PASS (the two spec-size warnings are the known PF-6 split signal)
