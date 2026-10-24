# R3 spec-axis review — guard-pure-checks

## Change identity

- Change: `cdd/changes/guard-pure-checks/`
- Artifact under review: the implementation diff measured against the change's own artifacts — proposal `cdd/changes/guard-pure-checks/proposal.md`, spec delta `cdd/changes/guard-pure-checks/specs/gherkin/spec.md`, tasks `cdd/changes/guard-pure-checks/tasks.md`, plus prior review dispositions in `cdd/changes/guard-pure-checks/reviews/` (R1, R2).
- Diff pinned state: run `git diff 3f484a5` (tracked — expect exactly `scripts/spec-drift.mjs` + `cdd/scripts/spec-drift.mjs`) plus reads of untracked files (`tests/acceptance/guard-pure-checks.test.js`, the change folder). Base (fixed point): `3f484a5` on branch `guard-pure-checks` (= main tip; the whole change rides the working tree).
- Review point: R3 (code review), before archive; this brief covers the **Spec axis only** — the Standards axis runs in its own separate session with its own brief (`brief-r3-standards.md`).

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the paths and diff below, from disk at the pinned state. Loop law rule 2b — the reviewer is not the author of the artifacts under review.
- Your model family must differ from the author's model family (family = same provider or model lineage). The author's family is **zai** (glm-5.3). Verify your own family from your runtime environment (e.g. `PI_PROVIDER`) — the brief states the author's family, never yours as settled fact. If you cannot establish that the families differ, say so in your findings header and stop.
- You review ONE axis: Spec. Do not evaluate coding conventions here; the other axis has its own session so neither frames the other.

## Inputs (paths, pinned state)

- The change artifacts (read whole): `cdd/changes/guard-pure-checks/proposal.md`, `cdd/changes/guard-pure-checks/specs/gherkin/spec.md`, `cdd/changes/guard-pure-checks/tasks.md`, `cdd/changes/guard-pure-checks/reviews/r1-proposal-review.md`, `cdd/changes/guard-pure-checks/reviews/r2-change-review.md`, `cdd/changes/guard-pure-checks/RED-log.txt`, `cdd/changes/guard-pure-checks/proof/byte-identity.txt`.
- The living spec the delta modifies: `cdd/specs/gherkin/spec.md` (the delta's ADDED requirement name must not duplicate a living requirement).
- The diff: `git diff 3f484a5` (tracked) + untracked `tests/acceptance/guard-pure-checks.test.js` — the implementation the delta's scenarios pin.
- Loop law: `cdd/rules.md` rules 4 (delta grammar), 6 (tasks/traceability), 7 (acceptance pins invoke the real door entry), 10 (RED first), 12 (tick evidence: exact command + tail excerpt).

## Spec-axis checklist

1. **Done-When → requirement → task → pin chain** — every proposal Done-When is carried by a delta requirement whose scenario pins a test, and a task verifies it; nothing unsponsored (implementation with no requirement behind it), nothing promised and missing (requirement with no task or no pin). The byte-identity proof is deliberately a tick-riding migration proof, not a delta scenario — that placement was reviewed and disposed at R2 (`won't-fix`, reasons recorded); do not re-litigate a disposed finding absent new evidence.
2. **Delta grammar** — every scenario ends with a `# Verified by: tests/acceptance/<path>` pin resolving to a real file; exactly one gherkin fence per requirement, one When, ≥1 Then; ADDED introduces no duplicates; the Feature heading matches the capability's living spec.
3. **Scenario truth vs implementation** — the acceptance suite (`tests/acceptance/guard-pure-checks.test.js`, scenarios GPC1–GPC2) actually pins what each scenario claims: run it (`node tests/acceptance/guard-pure-checks.test.js`) and read the assertions. GPC1 claims the pure-check region holds no fs/git/console — check the scan is real (source slice between region markers, token regexes) and cannot be vacuous. GPC2 claims a pure check runs on in-memory facts with no repository on disk — check the facts object is built in memory (not loaded from this repo's disk) and the law invoked is the real exported function from `scripts/spec-drift.mjs`, not a copy.
4. **Tick honesty** — every `[x]` tick in tasks.md cites a command + output excerpt that could have produced it; the migration task (3.7) claims ZERO deletions with a keep-table naming the sole real-door pins — audit that table against `tests/smoke.mjs` at the pinned state (the file must be untouched by the diff, and the named pins must exist and exercise the claimed emissions).
5. **Traceability table** — tasks.md's Done-When table is complete and consistent with the delta.

## Scope fence

- In scope: the diff and change artifacts against the change's own spec claims. Out of scope: coding-convention conformance (Standards axis), redesign proposals, fixes, the ff-only merge itself. You report findings; you do not edit files (the single exception: your findings output file below).

## Findings grammar (advisory — no fixes, no verdicts)

Each finding: severity `blocker` | `should` | `note`, the finding, evidence (path:line). You report every finding with disposition `open`; the author later sets `fixed:` or `won't-fix:` when disposing.
Never red/green verdicts; gate authority stays with the deterministic validators and the human.

## Output

Write your findings to `cdd/changes/guard-pure-checks/reviews/r3-spec-code-review.md`
(output path per `reviewPoint("R3").findingsSpec` in `lib/loop-law.mjs` — the spec-axis file; you write only this file, never the standards axis's). Header records your reviewer form (cold sub-agent / same-session re-read) and your model family vs. the author's.
