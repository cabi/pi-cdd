# Dogfood — live `backlog revalidate` run

Change: backlog-revalidate (task 3.8). Run date: 2026-10-23 UTC (verified stamps; local clock 2026-10-24).

The run evaluates every active item of the real ledger at
`cdd/backlog.md` on branch `backlog-revalidate` after this change's
premise backfills (PF-1, PF-10, PF-11, PF-12, PF-21, PF-22 received
premises; PF-2, PF-3, PF-4, PF-6, PF-9, PF-14 were assessed and left
honestly non-mechanical).

Invocation (fresh jiti load of index.ts, the pi extension path — not the
runner session's possibly-stale tool instance):

    node /tmp/revalidate-live.mjs
    # loads index.ts via tests/pi-jiti.mjs loadViaPi and calls
    #   { op: "backlog", options: '{"action":"revalidate"}' }
    # with cwd = repository root

Exit code: 0. Full output, verbatim:

```
PF-1 [open] hold — premise holds: grep:Done-When: 1-5@lib/instructions.mjs=1
PF-2 [open] NOT-MECHANICAL — no premise on the item
PF-3 [open] NOT-MECHANICAL — no premise on the item
PF-4 [open] NOT-MECHANICAL — no premise on the item
PF-6 [watch] NOT-MECHANICAL — no premise on the item
PF-9 [open] NOT-MECHANICAL — no premise on the item
PF-10 [open] ROTTED — premise now false: absent:cdd/archive/20261022-adr-dir-migration
PF-11 [open] ROTTED — premise now false: absent:cdd/archive/20261022-adr-dir-migration
PF-12 [open] hold — premise holds: grep:dead-path@scripts/spec-drift.mjs=0
PF-14 [open] NOT-MECHANICAL — no premise on the item
PF-21 [open] hold — premise holds: grep:validate op@README.md=0
PF-22 [open] hold — premise holds: grep:lib/context.ts@cdd/decisions/0004-ambient-injection-over-fetch.md=1
```

Reading: the run did exactly what the change promises. PF-10 and PF-11 —
both still open with `change: adr-dir-migration` — were caught ROTTED:
their premise (`absent:cdd/archive/20261022-adr-dir-migration`) went false
when that change was archived, i.e. both items' premise rotted exactly the
way the backlog log had been silently accumulating until now. Per the
revalidation law (stale never auto-closes; the triager decides), both were
then resolved done through the backlog op with the evidence named:

    PF-10 → done — note: premise rotted: the archive dir exists; the
    adr-dir-migration fix landed and archived, so the item's Done-When
    (guard governance of all 11 ADRs) is met.
    PF-11 → done — note: premise rotted: the archive dir exists; the
    rename-pair lesson was applied inside adr-dir-migration itself
    (restructured to a true rename pair before any push) and the residual
    knowledge is the note text itself.

The four holds (PF-1, PF-12, PF-21, PF-22) each stamped their first
`verified` date; the three-strikes clock starts from this run (three
unchanged revalidations will force a disposition). No watcher item has
accumulated strikes yet — PF-6 is the only watch item and carries no
premise, so it reports NOT-MECHANICAL and revalidates by reading.
