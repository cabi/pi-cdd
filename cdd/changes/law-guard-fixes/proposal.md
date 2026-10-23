# law-guard-fixes

## Why

Two approved backlog findings (PF-17, PF-18) in the same family — the loop-law text and the guard's pre-commit corner — each make the loop contradict itself: the law documents a proposal contract ("one `Done-When:` line") that its own scaffold instruction and validate door define differently (1–5 observable criteria), and the pre-commit door's topology check deadlocks the archive pair-commit the Close protocol requires — the exact shape that forced a `--no-verify` bypass during 20261023-hook-wiring.

## What Changes

- Rule 3 of the loop law (rendered law text + `cdd/rules.md` mirror) states the Done-When contract as 1–5 completion criteria, each an observable check, and becomes single-sourced in `lib/loop-law.mjs` (rendered into `lib/templates.mjs`'s law text). No door behavior changes — `validateProposal` already enforces 1..5.
- The committed-history topology L2 check runs only in the door 3 full scan; the pre-commit staged scan stops running it. The commit-msg door's staged-pair check is unchanged, so spec-and-code travel together stays enforced for every commit being made.
- Two acceptance pins: the rule-3 text contract (rendered text + mirror + module source), and the archive pair-commit passing the real pre-commit door in a sandbox built with the real `archiveChange`.

## Solutions Considered

- gherkin: the loop-law module's renderer pattern (`lawRule2()`, `lawRule2a()`, …) — adopted for rule 3; it is the established single-source seam and the store mirror stays byte-identical through the existing deliberate mirror write.
- gherkin: the guard's existing mode dispatch (`--staged` / `--commit-msg` / full scan) — adopted; the fix is one branch gate, not a restructure. The alternative remedy — teach the pre-commit door to honor a claiming ARCHIVED delta mid-pair — rejected: it encodes the archive operation's mid-state into the door and adds a claimant category the ownership check explicitly excludes.
- No library applies: both fixes are law prose and guard branch logic owned by this capability.

## Non-Goals

- No change to `validateProposal`'s 1..5 enforcement — the door already carries the real contract; this change aligns the text only.
- No change to the full-scan topology L2 or the mid-Close hint (pinned by gherkin-guard-placeholder.test.js H1/H2) — the check moves ownership, it is not deleted.
- The transient full-scan red between `archiveChange` and the archive commit (no open change claims the code there, so no hint) is left as-is: it clears at the archive commit and no gate reads the full scan at that moment.
- Prose surfaces outside the law (README, `lib/help.mjs` wording) stay untouched — they carry generic phrasing, not the contract.

## Capabilities

- gherkin: `cdd/changes/law-guard-fixes/specs/gherkin/spec.md` — ADDED "Loop law states the Done-When contract", ADDED "Topology staleness is full-scan law"

## Decisions followed (A1 citations)

- ADR-0001 (zero-dependency Node tooling) — followed: lawRule3() is pure string assembly in lib/loop-law.mjs; the guard edit is plain branch logic. No dependency enters the tree.
- ADR-0006 (feature-block consolidation) — followed: rule 3 stays inside the existing RULES_MD artifact block in lib/templates.mjs, rendered from the law module exactly as rules 2/2a/2b/2c already are; no scaffold surface is split out.
- ADR-0007 (the law behind every door) — followed: the wording this change aligns is the law text the validateProposal door already enforces; no grammar is restated — the guard edit changes only which entry mode runs an existing check, and that ownership split is recorded in design.md, not duplicated law.
- ADR-0008 (model-run reviews are advisory findings) — followed: no review machinery changes; the R2 findings on this package carry severities and dispositions per the grammar.
- ADR-0009 (single-source the loop law) — followed: this change executes the decision for rule 3 — the proposal contract moves from hardcoded template text into lib/loop-law.mjs and mirrors byte-identically into cdd/rules.md.
- ADR-0010 (reviewer independence is loop law) — followed: the mirror edit touches cdd/rules.md mechanically (full mirror write); rules 2a/2b independence law is rendered verbatim from the unchanged loop-law module and the byte-identity pin still guards it.
- ADR-0011 (ticks are claims and pins hit real doors) — followed: both new pins invoke the real surfaces — law-done-when.test.js asserts against the rendered module output and the store mirror; guard-pair-commit.test.js builds its sandbox with the real initStore/archiveChange and runs the real door script as a child process.

Done-When: rule 3's rendered law text and its cdd/rules.md mirror state the 1-5 observable-criteria contract, and the old one-line wording is gone
Done-When: a sandbox reproducing the PF-18 shape with the real archiveChange staged set shows the archive pair-commit's second commit passing the real pre-commit door, with the full-scan topology L2 still firing exactly once at the mid-pair tip
Done-When: cdd backlog op marks PF-17 and PF-18 done, naming this change
Done-When: this change's own archive pair-commit lands through the wired pre-commit door with no --no-verify
Code: lib/loop-law.mjs, lib/templates.mjs, cdd/rules.md, scripts/spec-drift.mjs, cdd/scripts/spec-drift.mjs, tests/acceptance/law-done-when.test.js, tests/acceptance/guard-pair-commit.test.js, cdd/backlog.md
