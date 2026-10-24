# R3 standards-axis review — guard-pure-checks

## Change identity

- Change: `cdd/changes/guard-pure-checks/`
- Artifact under review: the implementation diff — **an uncommitted working tree** at the single-feature-commit stage: run `git diff 3f484a5` (tracked files — expect exactly `scripts/spec-drift.mjs` and its store copy `cdd/scripts/spec-drift.mjs`) plus reads of untracked files (`git status --short` lists them; `tests/acceptance/guard-pure-checks.test.js` and the change folder `cdd/changes/guard-pure-checks/` are new/untracked). Base (fixed point): `3f484a5` on branch `guard-pure-checks` (= main tip; the whole change rides the working tree).
- Review point: R3 (code review), before archive; this brief covers the **Standards axis only** — the Spec axis runs in its own separate session with its own brief (`brief-r3-spec.md`).

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the paths and diff below, from disk at the pinned state. Loop law rule 2b — the reviewer is not the author of the artifacts under review.
- Your model family must differ from the author's model family (family = same provider or model lineage). The author's family is **zai** (glm-5.3). Verify your own family from your runtime environment (e.g. `PI_PROVIDER`) — the brief states the author's family, never yours as settled fact. If you cannot establish that the families differ, say so in your findings header and stop.
- You review ONE axis: Standards. Do not evaluate spec compliance here; the other axis has its own session so neither frames the other.

## Inputs (paths, pinned state)

- Diff command: `git diff 3f484a5` (working tree vs base, tracked files) plus untracked-file reads for `git status --short` entries (`tests/acceptance/guard-pure-checks.test.js`, the change folder `cdd/changes/guard-pure-checks/`).
- Commit list: `git log 3f484a5..HEAD --oneline` (expected empty — the whole change is the working tree at the single-feature-commit stage).
- `cdd/rules.md` — loop law (incl. mechanical-change rules).
- Standards documents this repo names: `AGENTS.md`/`README.md` conventions sections, plus the smell baseline charter in `skills/cdd-code-review/SKILL.md`.
- `cdd/decisions/` — accepted ADRs whose `code:` globs the diff touches (expect ADR-0001, ADR-0006, ADR-0007, ADR-0012 to govern `scripts/spec-drift.mjs`). Note: reconfirmation lines for touched ADRs are NOT part of this diff — they ride the archive commit by design; their absence here is lawful, not a finding.
- The change folder `cdd/changes/guard-pure-checks/` for context only (what the diff claims to be), including `RED-log.txt`, `proof/byte-identity.txt`, and the R1/R2 findings/dispositions in `reviews/`.
- Sibling law modules for convention comparison: `scripts/grammar-law.mjs`, `scripts/spec-extract.mjs`, `scripts/adr-index.mjs`.

## Scope fence

- In scope: the diff's conformance to documented conventions and accepted decisions. Shape constraints the director pinned for this change (treat as mission law): no new door-script file (`DOOR_SCRIPTS` in `lib/templates.mjs` stays exactly five entries; the parse home stays `grammar-law.mjs`), no new cross-file import edges (the guard's imports of `grammar-law.mjs` are pre-existing), no behavior change beyond byte-identity (guard observable output stdout/stderr/exit cmp-identical — check order, check tags, the `// Checks:` header line, hint/skip line placement, report text, and exit codes unchanged), store copies byte-identical regenerations, no store-format changes, `LAW_VERSION` stays 2. Coverage discipline: every law family keeps at least one real-door acceptance pin; this change deleted zero smoke scenarios — audit that claim against the diff (`tests/smoke.mjs` must not appear in it).
- Out of scope: whether the diff implements the change's scenarios (Spec axis, separate session), proposing redesigns, any fix. You report findings; you do not edit files.

## MUST-DELIVER checklist (the charter)

1. **Conventions** — the diff follows the repo's documented standards (naming, structure, error handling, test placement) as written in the standards docs, and reads like its sibling law modules.
2. **ADR-governed files respected** — files under an accepted ADR's `code:` globs change only in ways the ADR sanctions; violations of a recorded decision are findings. Expect ADR-0007 (one law, one door script; single-sourcing) and ADR-0012 (comments carry shape, not contract) to govern most of this diff; the guard must import `parseSpecModel`/`globToRe` from the law module, never re-state parsing.
3. **Smell baseline** — the diff against the skill's smell list, quoted verbatim from `skills/cdd-code-review/SKILL.md` step 3 (Mysterious Name, Duplicated Code, Feature Envy, Data Clumps, Primitive Obsession, Repeated Switches, Shotgun Surgery, Divergent Change, Speculative Generality, Message Chains, Middle Man, Refused Bequest): new instances are findings; pre-existing ones are not; a documented repo standard overrides the baseline; tooling-enforced items are skipped. The change is a restructure, so judge whether the new gather/pure/report seams reduce or add smells relative to the base file (`git show 3f484a5:scripts/spec-drift.mjs`).
4. **Guard/validator alignment** — the code agrees with what the deterministic doors expect (`cdd/scripts/spec-drift.mjs` store copy byte-identical regeneration, `tests/acceptance/guard-header-index.test.js` tag scan over the new source, `lib/validate.mjs`, CI): changes that weaken, bypass, or blind a door are findings, and so is silent divergence. A red door is a fact, not an obstacle. The byte-identity claim (guard output cmp-identical at 3f484a5 with only the changed source pair copied into a worktree) is recorded in task 3.5's tick with full method and output (`proof/byte-identity.txt`) — audit the claim's shape against the diff (e.g. nothing in the diff could change observable output the proof did not cover), you cannot re-run the worktree yourself.

## Findings grammar (advisory — no fixes, no verdicts)

Each finding: severity `blocker` | `should` | `note`, the finding, evidence (path:line). You report every finding with disposition `open`; the author later sets `fixed:` or `won't-fix:` when disposing.
Never red/green verdicts; gate authority stays with the deterministic validators and the human.

## Output

Write your findings to `cdd/changes/guard-pure-checks/reviews/r3-standards-code-review.md`
(output path per `reviewPoint("R3").findingsStandards` in `lib/loop-law.mjs` — the standards-axis file; you write only this file, never the spec axis's). Header records your reviewer form (cold sub-agent / same-session re-read) and your model family vs. the author's.
