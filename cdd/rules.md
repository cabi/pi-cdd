# cdd rules — the contract of this repository

Code is the truth, the spec is the index. This file is the method's law;
the guard (cdd/scripts/spec-drift.mjs) enforces the machine-checkable parts.

1. **The store** — everything contractual lives in cdd/ as plain markdown:
   changes in flight, living specs, archive history, decisions.
2. **The change loop** — design gate (its T1–T5 answers are written into
   tasks §2 as the gate runs, before the proposal is drafted) → proposal →
   delta → tasks → implement with acceptance tests → archive. One change
   folder per change, with the review points of rule 2a wired in: R1 after
   the proposal, R2 at draft-green, R3 before archive.
2a. **Review points are advisory findings, never verdicts** — R1: after the
    proposal, if the design gate answered T1 or T2 YES (T1 cross-cutting,
    T2 architecture bet), skill `cdd-spec-review` runs in proposal mode
    (findings: `cdd/changes/<name>/reviews/r1-proposal-review.md`). R2:
    always, at draft-green (the package is drafted — proposal, delta, tasks
    on disk — and `cdd validate` draft mode passes), before the first
    implementation task, skill `cdd-spec-review` runs in package mode
    (findings: `reviews/r2-change-review.md`). R3: at Close before
    archive, skill `cdd-code-review` runs (findings:
    `reviews/r3-code-review.md`), and if the change drafted or amended
    ADRs, skill `cdd-adr-review` runs on them (findings:
    `reviews/adr-review.md`). A review reports findings with severity
    blocker/should/note and disposition fixed:/open/won't-fix:, never red
    or green verdicts; gate authority stays with the deterministic
    validators and the human. An open blocker stops the loop at that step
    until disposed.
2b. **Reviews run cold** — the reviewer is not the author of the
    artifacts under review; every model-run review runs as a cold
    sub-agent session: a fresh session, briefed only from paths on
    disk (charter plus artifact paths, never curated content). A
    same-session re-read is the lawful but weaker fallback, used
    only with recorded justification, and it records its form and
    justification in the findings file header.
3. **Proposal** — ## Why, ## What Changes, one `Done-When:` line, one
   `Code: <globs>` line naming the implementation surface.
4. **Delta** — `## ADDED | MODIFIED | REMOVED Requirements` →
   `### Requirement: <name>` + prose, then exactly one ```gherkin fence
   holding one complete Gherkin document (ADR-0006): `Feature: <name>`
   equal to the heading, every `Scenario: <name>` with exactly one When,
   at least one Then, And/But continuation-only, and each scenario's last
   line a `# Verified by: tests/acceptance/<path>` pin comment — the only
   comment allowed inside a fence. No `#### Scenario:` markdown headings,
   no Background/Rule/tags/Outline/Examples/tables. Scenarios are
   declarative: observable outcomes and value, not interaction mechanics
   (keystrokes, widgets, selectors) — phrasing law is door-1 judgment,
   parse law is the validator. Quantify: intervals, limits, and thresholds
   carry numbers and units ("every 14 days", "p95 under 200 ms") —
   unquantified comparatives are warnings. Count verbs carry an exactness
   qualifier: "contains exactly N" detects drift, "at least N" sets a
   floor — unqualified counts warn. REMOVED carries a `Reason:` line.
5. **MODIFIED and REMOVED** only name requirements that exist in the
   living spec. ADDED must not duplicate a living requirement.
6. **Tasks** — four steps (context → design → implementation → close);
   every implementation subtask carries `verify by <test>`; the
   `## Done When Traceability` table (criterion → task ids) follows the
   implementation steps, before the Close section. More than 8
   implementation subtasks is the split signal — split at the design gate,
   more than 12 fails strict; record `split-considered:` if kept whole.
7. **Test-first** — the acceptance test a subtask names exists before the
   subtask is checked. A scenario without a committed pin is a wish. Pins run
   with the project's tests: `npm test` runs the `node --test` sweep, which
   executes every `tests/acceptance/*.test.js` suite, and CI runs the same
   entrypoint — a subtask is verified by that command green.
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
