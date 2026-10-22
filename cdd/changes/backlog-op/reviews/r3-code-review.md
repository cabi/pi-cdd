# R3 code review — backlog-op

## Standards axis

- Reviewer form: cold sub-agent session (fresh session, briefed only from the R3 standards brief and the artifact paths on disk)
- Reviewer model family: opencode-zen (deepseek lineage) — `PI_PROVIDER=opencode-zen`, `PI_MODEL=deepseek-v4-pro`
- Author model family: zai (glm lineage) — per the brief
- Families differ: yes (opencode-zen/deepseek vs zai/glm)
- Review point: R3 (code review), Standards axis only — the Spec axis runs in its own separate session
- Fixed point: `5fd7651` (working tree, uncommitted, branch `backlog-op`); diff = `git diff 5fd7651` plus untracked files `cdd/backlog.md`, `cdd/changes/backlog-op/`, `lib/backlog.mjs`, `tests/acceptance/backlog-op.test.js`
- Doors at review time: `node cdd/scripts/spec-drift.mjs` → "spec-drift: clean (5 specs, 17 acceptance test files, full scan)"; `validateStore(..., "strict")` → ok, no errors/warnings; `npm test` → all green (17 acceptance suites, 10 SSL, 16 tools, 35 smoke)
- Disposition grammar: every finding is `open`; the author later sets `fixed:` / `won't-fix:`.

## Findings

### 1. should — "six ops" documentation left stale by the 7th op

The change adds a 7th op (`backlog`) to the `cdd` tool and updates the ops row in `lib/help.mjs`, but four references elsewhere still say "six ops" or list only six ops. The change made these statements false.

Evidence:
- `README.md:7` — "The agent sees it as **one lean `cdd` tool** (six ops)"
- `README.md:36-37` — the door-1 authoring surface lists "ops: init · new · validate · status · archive · help" (missing `backlog`)
- `MAINTENANCE.md:72` — "T1 pins this (1 tool, 6 ops, `setActiveToolsCalls === 0`)"
- `MAINTENANCE.md:125` — "| T1 | one tool, six ops, static list, ≤700-char declaration, ..."

The R2 review (finding 4) already named the MAINTENANCE.md "six ops" references, but its disposition only resolved the Code:-glob question and left the stale counts in place. `MAINTENANCE.md` is outside spec ownership by design (a recorded Non-Goal), and `README.md` is not in any Code: glob, so no door catches this — but the repo's own documentation now contradicts the code.

### 2. note — Code: globs over-claim `tests/smoke.mjs`

The proposal's `Code:` line and the gherkin delta's `Code:` line both name `tests/smoke.mjs`, but the diff does not modify it (`git diff 5fd7651 -- tests/smoke.mjs` is empty). There is no "ops row" in `tests/smoke.mjs` to update: S21 pins only the literal `"agent tool: cdd"` needle, not the ops list. The claim traces to the R2 finding-4 disposition, which assumed `tests/smoke.mjs` carried an ops row.

Evidence:
- `cdd/changes/backlog-op/proposal.md:39` — `Code: index.ts, lib/backlog.mjs, lib/templates.mjs, lib/help.mjs, cdd/rules.md, tests/tools.mjs, tests/smoke.mjs, tests/acceptance/backlog-op.test.js, tests/acceptance/library-usage.test.js`
- `cdd/changes/backlog-op/specs/gherkin/spec.md` — `Code: lib/templates.mjs, lib/help.mjs, cdd/rules.md, tests/smoke.mjs, tests/acceptance/backlog-op.test.js`
- `tests/smoke.mjs:329-339` — S21 checks `"agent tool: cdd"` and other needles, none of which is the ops list

The guard is green, so this is not a door failure — but the Code: glob names a file the change does not touch, which over-states the implementation surface the guard correlates.

### 3. note — minor duplication in `lib/backlog.mjs`

Three small shapes repeat inside the module (judgement call — each is small enough that extraction would add indirection):

- The read-then-refuse-on-error pair `const r = readBacklog(root); if (r.error) return { ok: false, error: r.error };` appears in `listBacklog`, `addBacklogItem`, and `resolveBacklogItem`.
- The `noPipe` validation loop over `[label, v]` pairs appears in both `addBacklogItem` and `resolveBacklogItem`.
- The `if (!STATUSES.includes(st)) return { ok: false, error: ... }` status check appears in both `addBacklogItem` and `resolveBacklogItem`.

Evidence: `lib/backlog.mjs` — `listBacklog` (~line 108), `addBacklogItem` (~line 118), `resolveBacklogItem` (~line 140).

## Spec axis

> Provenance note (author): the two R3 axes ran as parallel cold sessions and the
> template routes both to this one shared file. The Standards-axis session wrote
> second and clobbered the Spec-axis section. The section below is reconstructed
> verbatim from the Spec-axis reviewer's final report by the author; the reviewer's
> session transcript is on disk (2026-10-22T03-59-49-224Z_…-f938d20c-44c8f1fb-f240).
> Logged as PF-8 (shared findings file has no append discipline) and PF-9 (/tmp
> briefs are volatile — one brief was reaped mid-run).

- Reviewer form: cold sub-agent session (fresh, briefed only from the instantiated
  R3 spec brief)
- Reviewer model family: opencode-zen (deepseek lineage) — deepseek-v4-pro
- Author model family: zai (glm lineage) — families differ: yes
- Review point: R3, Spec axis only (Standards axis ran in its own session)
- Fixed point: `5fd7651` working tree, branch `backlog-op`

Findings (all `open` as reported):

1. **should** — The "Backlog content never gates" pin (BO11) never runs the drift
   guard; it only runs `validateStore` strict plus a `Code:`-glob proxy, while the
   scenario's When names "the drift guard runs". Partial pin (the glob proxy covers
   the realistic path), not dead.
2. **note** — BO10 asserts the same fragments in `RULES_MD` and `cdd/rules.md` but
   never the "byte-for-byte" identity the scenario's Then requires (that identity is
   covered by `single-source-law.test.js`, not the pinned test).
3. **note** — The `backlog` addition to the help ops row is unpinned;
   `tests/smoke.mjs:332` checks only the `"agent tool: cdd"` substring.
4. **note** — `tests/smoke.mjs` is named in both the proposal's `Code:` line and the
   gherkin delta's `Code:` glob but is not modified; the claimed "ops row" pin
   doesn't exist.
5. **note** — BO9 ("off-grammar item line refuses every action") exercises only the
   default `list` action, though the refusal is structurally shared across all
   actions.

Coverage verdict (reviewer's words): every delta scenario is implemented and
traceable to the diff; the MODIFIED "Library modules refuse silent direct
execution" requirement correctly restates all three living scenarios and adds the
backlog-module scenario with `lib/backlog.mjs` in its `Code:` glob; no unsponsored
hunks found (`MAINTENANCE.md` and the help ops row are sponsored by task 3.5, and
`MAINTENANCE.md` is deliberately outside every `Code:` glob per the proposal's
Non-Goals). `cdd validate` strict and the drift guard both run green.

## Dispositions

Standards axis:

- S1. should → **fixed**: README.md:7, README.md:36-37, MAINTENANCE.md:72,
  MAINTENANCE.md:125 updated to seven ops (backlog listed). README.md rides
  ADR-0009's glob — cited at archive (Reconfirmed-by).
- S2. note (= Spec 4) → **fixed by the same edit**: S21's ops-row pin now asserts
  `backlog` in the row, so `tests/smoke.mjs` is genuinely modified and the
  `Code:` claims hold.
- S3. note → **fixed**: `lib/backlog.mjs` field and status checks deduplicated into
  shared helpers — `pipes([...])` replaces the two inline noPipe loops (add's four
  fields, resolve's two) and `badStatus(st)` replaces the two identical
  `STATUSES.includes` checks; messages byte-identical. The two-line readBacklog
  passthrough stays per action (flattening it behind a throw helper added nesting
  without removing the check).

Spec axis:

- P1. should → **fixed**: BO11 now runs the real drift guard
  (`node cdd/scripts/spec-drift.mjs`) inside its sandbox on a backlog carrying
  junk prose and asserts a clean exit — the pinned When is now literally exercised.
- P2. note → **won't-fix**: byte-for-byte identity of `RULES_MD` ↔ `cdd/rules.md`
  is pinned by `tests/acceptance/single-source-law.test.js` (SSL3); duplicating a
  full-file equality pin in BO10 would test the same door twice for churn, and the
  scenario's Verified-by already names the suite that pins it.
- P3. note → **fixed**: S21's pinned needle extended to the full ops row including
  `backlog` (same edit as S2).
- P4. note → **fixed** by P3's edit (see S2).
- P5. note → **fixed**: BO9 now loops `add` and `resolve` (in addition to the
  default `list`) over the off-grammar file and asserts each refuses.
