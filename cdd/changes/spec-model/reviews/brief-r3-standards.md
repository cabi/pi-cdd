# R3 standards-axis review — spec-model

## Change identity

- Change: `cdd/changes/spec-model/`
- Artifact under review: the implementation diff — **an uncommitted working tree** at the single-feature-commit stage: run `git diff bc4b867 -- <paths>` plus reads of untracked files (`git status --short` lists them; notably `tests/acceptance/spec-model.test.js` and the change folder `cdd/changes/spec-model/` are new/untracked). Base (fixed point): `bc4b867` on branch `spec-model`.
- Review point: R3 (code review), before archive; this brief covers the **Standards axis only** — the Spec axis runs in its own separate session with its own brief (`brief-r3-spec.md`).

## Reviewer session requirements

- You are a **cold session**: fresh, not the author's session. Read only the paths and diff below, from disk at the pinned state. Loop law rule 2b — the reviewer is not the author of the artifacts under review.
- Your model family must differ from the author's model family (family = same provider or model lineage). The author's family is **zai** (glm-5.3). Verify your own family from your runtime environment (e.g. `PI_PROVIDER`) — the brief states the author's family, never yours as settled fact. If you cannot establish that the families differ, say so in your findings header and stop.
- You review ONE axis: Standards. Do not evaluate spec compliance here; the other axis has its own session so neither frames the other.

## Inputs (paths, pinned state)

- Diff command: `git diff bc4b867` (working tree vs base, tracked files — expect `scripts/grammar-law.mjs`, `scripts/spec-drift.mjs`, `scripts/spec-extract.mjs`, `lib/store.mjs`, `cdd/backlog.md`, and the three regenerated store copies under `cdd/scripts/`) plus untracked-file reads for `git status --short` entries (`tests/acceptance/spec-model.test.js`, the change folder `cdd/changes/spec-model/`).
- Commit list: `git log bc4b867..HEAD --oneline` (expected empty — the whole change is the working tree at the single-feature-commit stage).
- `cdd/rules.md` — loop law (incl. mechanical-change rules).
- Standards documents this repo names: `AGENTS.md`/`README.md` conventions sections, plus the smell baseline charter in `skills/cdd-code-review/SKILL.md`.
- `cdd/decisions/` — accepted ADRs whose `code:` globs the diff touches. Note: reconfirmation lines for touched ADRs are NOT part of this diff — they ride the archive commit by design; their absence here is lawful, not a finding.
- The change folder `cdd/changes/spec-model/` for context only (what the diff claims to be), including `RED-log.txt` and the R2 findings/dispositions.

## Scope fence

- In scope: the diff's conformance to documented conventions and accepted decisions. Shape constraints the director pinned for this change (treat as mission law): no new door-script file (DOOR_SCRIPTS in `lib/templates.mjs` stays exactly five entries), no new cross-file import edges beyond `grammar-law.mjs → adr-index.mjs` (pre-existing edge, now used for `globToRe`), the guard's per-law structure (check order, flow, report format) unchanged, store copies byte-identical regenerations, no store-format changes, `LAW_VERSION` stays 2.
- Out of scope: whether the diff implements the change's scenarios (Spec axis, separate session), proposing redesigns, any fix. You report findings; you do not edit files.

## MUST-DELIVER checklist (the charter)

1. **Conventions** — the diff follows the repo's documented standards (naming, structure, error handling, test placement) as written in the standards docs.
2. **ADR-governed files respected** — files under an accepted ADR's `code:` globs change only in ways the ADR sanctions; violations of a recorded decision are findings. Expect ADR-0007 (law single-sourcing) and the guard/extractor/store ADRs to govern most of this diff.
3. **Smell baseline** — the diff against the skill's smell list, quoted verbatim from `skills/cdd-code-review/SKILL.md` step 3 (Mysterious Name, Duplicated Code, Feature Envy, Data Clumps, Primitive Obsession, Repeated Switches, Shotgun Surgery, Divergent Change, Speculative Generality, Message Chains, Middle Man, Refused Bequest): new instances are findings; pre-existing ones are not; a documented repo standard overrides the baseline; tooling-enforced items are skipped.
4. **Guard/validator alignment** — the code agrees with what the deterministic doors expect (`cdd/scripts/spec-drift.mjs`, `lib/validate.mjs`, CI): changes that weaken, bypass, or blind a door (the guard, validators, CI) are findings, and so is silent divergence — e.g. a door script whose store copy is not a byte-identical regeneration, or a parse the guard re-states privately instead of reading from the law module. A red door is a fact, not an obstacle. The byte-identity claim (guard output cmp-identical at bc4b867 with only this diff's files copied in) is recorded in task 3.7's tick — audit the claim's shape against the diff, you cannot re-run the worktree yourself.

## Findings grammar (advisory — no fixes, no verdicts)

Each finding: severity `blocker` | `should` | `note`, the finding, evidence (path:line). You report every finding with disposition `open`; the author later sets `fixed:` or `won't-fix:` when disposing.
Never red/green verdicts; gate authority stays with the deterministic validators and the human.

## Output

Write your findings to `cdd/changes/spec-model/reviews/r3-standards-code-review.md`
(output path per `reviewPoint("R3").findingsStandards` in `lib/loop-law.mjs` — the standards-axis file; you write only this file, never the spec axis's). Header records your reviewer form (cold sub-agent / same-session re-read) and your model family vs. the author's.
