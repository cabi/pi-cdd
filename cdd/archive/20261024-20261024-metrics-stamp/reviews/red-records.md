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

## R3 Close pass (post-feature-commit 93f8572)

- standards axis (gpt-6-luna, GPT lineage, cold): 0 blocker / 1 should — R3S-F001 ADR-0012 comment residue; fixed (banners → bare markers, header trimmed, corpus pointers reworded); pins 7/7 after
- spec axis (gpt-6-luna, GPT lineage, cold): 0 blocker / 3 should — F001 single-parse pin, F002 derivation-throw fixture, F003 merge-unchanged asserts; all three fixed as pin extensions (fixture E + M2/M7 asserts); these pin already-correct behavior, so they ran green on arrival (regression pins, not RED-first violations — the RED evidence for the underlying behavior is above)
- `node tests/acceptance/archive-metrics-stamp.test.js` after all R3 fixes → `7 passed, 0 failed`, exit 0

## Self-application findings at Close (found by this change's own first archive)

- S1 (tooling): the `cdd archive` op ran through a stale process — its result JSON lacked the new `metrics` key and no metrics.md landed in the archive folder; re-running the op fresh-node stamped correctly. The PF-35 class hit a mutating op, not just verdicts. Recovered by: index reset, living-spec merge reverted (uncommitted), folder moved back, op re-run fresh-node.
- S2 (editing): the R3-standards disposition edit anchored on a blank line and inserted a duplicate `|should|` row instead of replacing the open one — the first real stamp counted should 2 (declared 1) with no mismatch line, which exposed S3.
- S3 (parser gap, RED-first fix): `declaredCounts` read only `**Counts:**` bold lines and `## Counts` sections; the live reviewer convention `## Counts: blocker N, should N, note N` (inline heading) parsed as null — the declared-counts cross-check silently skipped on the real R2/R3 files. RED: fixture B gained a lying inline-heading file (`## Counts: 0 blocker, 0 should, 0 note` over 1 fixed should) and M4 now demands exactly 2 mismatch lines → `6 passed, 1 failed` (only the bold-line mismatch fired). Fix: declaredCounts also matches `/^##\s+Counts:?\s*(.+)$/m` → `7 passed, 0 failed`.
- S4 (word order, RED-first fix): the inline convention writes "blocker 0, should 2" (word-first) while the parser's severity regex accepted only "0 blocker" (number-first) — truthful inline declarations parsed as all-zero and produced three FALSE declared-counts-mismatch lines in the first real stamp. RED: fixture A's adr-review.md gained a truthful word-first `## Counts: blocker 0, should 1, note 0` and M3 now asserts zero mismatch lines in fixture A → `6 passed, 1 failed`. Fix: declaredCounts accepts both orders per severity; fixture B's inline lie also flipped word-first so M4 pins the true positive → `7 passed, 0 failed`.
