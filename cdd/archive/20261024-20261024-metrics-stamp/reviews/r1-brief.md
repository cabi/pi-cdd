# R1 brief — proposal review, change 20261024-metrics-stamp

You are a cold reviewer. You did not author these artifacts. Read files from
disk; disk is truth. Your output is a findings file — you write it yourself,
you do not converse.

## What to review (proposal mode)

1. `cdd/changes/20261024-metrics-stamp/proposal.md` — the proposal under review.
2. `cdd/changes/20261024-metrics-stamp/design.md` — the design-gate artifact (gate answered T2 YES, so this exists; review it for coherence with the proposal).
3. `cdd/changes/20261024-metrics-stamp/tasks.md` — read §2 design gate record only (T1–T5 answers); implementation tasks come later, out of scope here.
4. `cdd/specs/` — living spec inventory. The change targets the capability whose spec is `cdd/specs/gherkin/spec.md`. Check for parallel claim collisions (two open changes claiming the same capability/files — look in `cdd/changes/` for other open change folders).
5. `cdd/changes/20261024-metrics-stamp/specs/gherkin/spec.md` — the change's delta placeholder directory (may be empty; delta not yet drafted at R1).

## Charter (what to check)

- **Why:** does it name who hurts, today, with the pain anchored in real evidence (the research doc and backlog are cited — verify the citations exist: `research/2026-10-24-archive-metrics.md`, `cdd/backlog.md` PF-33)?
- **What Changes:** specific and complete for the stated scope; anything breaking marked BREAKING.
- **Reuse-first honesty:** every adopted/rejected solution in Solutions Considered names a real candidate that exists on disk. A capability claim with zero evaluation and no search noted is a blocker.
- **Non-Goals:** real fence — each names a declined thing and why. Placeholder Non-Goals are a blocker.
- **Done-Whens:** 1–5, observable. An unobservable Done-When (no acceptance path can watch it happen) is a blocker.
- **Capabilities:** exactly one capability claimed (specs/gherkin); no parallel claim collision.
- **Code: claims:** name existing or to-be-created surface (lib/store.mjs exists; lib/metrics.mjs and tests/acceptance/archive-metrics-stamp.test.js are to-be-created — that is legal).
- **Design coherence:** design.md bets (seam placement, stamp-time freeze, trust model) consistent with proposal claims and the gate record in tasks.md §2.

Context you may consult for grounding: `research/2026-10-24-archive-metrics.md` (the evidence base), `cdd/backlog.md` (PF-33), `cdd/rules.md` (the law — read at least rules on proposal/Done-Whens/Non-Goals if you need the exact bar).

## Output

Write `cdd/changes/20261024-metrics-stamp/reviews/r1-proposal-review.md`:

- Header line 1: `# r1-proposal-review — 20261024-metrics-stamp — 2026-10-24 — reviewer: cold sub-agent`
- Header line 2: your model id, family, and the pinned commit you read (run `git rev-parse HEAD` in the repo root /home/carsten/Projects/pi-extensions/pi-cdd).
- Then the charter checks as rows: |severity|finding|evidence|disposition| — severity one of blocker/should/note; evidence cites file + section/line. Empty findings table is fine if everything holds; say so explicitly.
- Then a `## Verdict` line: `PROCEED` (no open blockers) or `HOLD` (open blockers listed).
