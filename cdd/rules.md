# cdd rules — the contract of this repository

Code is the truth, the spec is the index. This file is the method's law;
the guard (cdd/scripts/spec-drift.mjs) enforces the machine-checkable parts.

1. **The store** — everything contractual lives in cdd/ as plain markdown:
   changes in flight, living specs, archive history, decisions.
2. **The change loop** — design gate → proposal → delta → tasks →
   implement with acceptance tests → archive. One change folder per change.
3. **Proposal** — ## Why, ## What Changes, one `Done-When:` line, one
   `Code: <globs>` line naming the implementation surface.
4. **Delta** — `## ADDED | MODIFIED | REMOVED Requirements` →
   `### Requirement: <name>` → `#### Scenario: <name>`; every scenario
   ends with `Verified by: tests/acceptance/<path>`. Quantify: intervals,
   limits, and thresholds carry numbers and units ("every 14 days", "p95
   under 200 ms") — unquantified comparatives are warnings. Count verbs
   carry an exactness qualifier: "contains exactly N" detects drift,
   "at least N" sets a floor — unqualified counts warn. REMOVED
   carries a `Reason:` line.
5. **MODIFIED and REMOVED** only name requirements that exist in the
   living spec. ADDED must not duplicate a living requirement.
6. **Tasks** — four steps (context → design → implementation → close);
   every implementation subtask carries `verify by <test>`; ends with
   `## Done When Traceability` (criterion → task ids). More than 8
   implementation subtasks is the split signal — split at the design gate,
   more than 12 fails strict; record `split-considered:` if kept whole.
7. **Test-first** — the acceptance test a subtask names exists before the
   subtask is checked. A scenario without a committed pin is a wish.
8. **Mechanical changes** — behavior-preserving sweeps declare
   `Mechanical-Change: <reason>` in the commit message; they age no spec
   and never touch cdd/specs/ or acceptance tests.
9. **Doors** — door 1 is this loop (human + agent judgment), door 2 is the
   pre-commit and commit-msg guards, door 3 is CI running the same guard,
   full scan.
9a. **No hook bypass** — a red door is a fact, not an obstacle: git's
    `--no-verify` is never used. A behavior-preserving sweep declares the
    `Mechanical-Change:` trailer and passes the commit-msg guard honestly;
    anything else that blocks belongs in the change loop.
10. **No spec markers in source code** — traceability lives in the cdd/
    tree only; code↔spec correlation is Code: globs plus git history.
11. **Archive** — strict validation green (every task outside Close ticked;
    the archive ticks the Close section itself) and guard green; deltas merge
    into the living spec; feature commit and archive commit travel as a pair.
12. **Decisions** — hard to reverse, surprising without context, a real
    trade-off, crossing capabilities → cdd/decisions/ (A0/A1/A2 rules in
    cdd/scripts/arch-extract.mjs).
