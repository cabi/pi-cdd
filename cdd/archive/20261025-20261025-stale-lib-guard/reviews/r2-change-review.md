# R2 package review — 20261025-stale-lib-guard — 2026-10-25 — reviewer: cold subagent, fresh session

- **Model:** `gpt-6-luna` (`opencode-zen`); thinking: high; mode: package; form: cold subagent, fresh session.
- **Independence:** the brief identifies the author family as zai (`glm-5.3`); this reviewer is opencode-zen (`gpt-6-luna`), a different family.
- **Scope:** `/home/carsten/Projects/pi-extensions/pi-cdd`, current `HEAD` `899ba38adeca43263b93184d556e84aea548f5ca`. The assignment does not pin a comparison base/head range, so exact range drift cannot be confirmed; this report reviews the package and context paths named in the R2 brief from disk, not an inferred Git range. Staged files: none. Unstaged tracked files: `cdd/backlog.md` (context only, not under review). Untracked at review start: `cdd/changes/20261025-stale-lib-guard/design.md`, `proposal.md`, `reviews/brief-r1-proposal.md`, `reviews/brief-r2-change-review.md`, `reviews/r1-proposal-review.md`, `specs/extension/spec.md`, and `tasks.md`. The findings file is the requested output. No other artifact was edited.

## Findings

### [blocker] stale-surface requirement still permits metadata-only comparison — `stale-lib-guard-r2-F001`

- **Artifact and line:** `cdd/changes/20261025-stale-lib-guard/specs/extension/spec.md:64`; contrast its same-length/original-mtime scenario at `:100` with `cdd/changes/20261025-stale-lib-guard/design.md:35,48-57` and `cdd/changes/20261025-stale-lib-guard/tasks.md:82-84`.
- **Provenance:** reviewer `opencode-zen/gpt-6-luna`; evidence sources: delta requirement and scenario, design boundaries/Alternatives, task 3.3, and the recorded R1 disposition in `reviews/r1-proposal-review.md`.
- **Evidence status:** Trace-backed.
- **Preconditions:** A source file is rewritten with the same byte length and its original `mtimeMs` restored.
- **Reproduction or trace:** The normative paragraph says freshness is compared by membership plus modification time and size. Under the precondition, all three values remain equal, so that comparison cannot report a change. The delta scenario explicitly requires this rewrite to count as stale, and design Boundaries/task 3.3 specify a per-file SHA-256 digest. Design Alternatives still says the metadata diff catches any post-load edit, then separately acknowledges that metadata-only comparison misses this case.
- **Expected behavior and actual behavior:** The requirement should specify a comparison that detects changed file contents regardless of unchanged metadata. Its current normative text permits a metadata-only implementation that fails its own scenario.
- **Impact:** The central stale-mutation guarantee remains underspecified, so the R1 blocker is not fully closed across the package; an implementation could satisfy the prose while allowing stale code to mutate the store.
- **Smallest safe fix:** Update the delta's normative paragraph to require content-change detection (with membership), reconcile the stale metadata-only claim in `design.md`, and keep the requirement, design, and task mechanism aligned.
- **Recommended disposition:** `open`.

### [should] fresh-node example conflates extension root and target project root — `stale-guard-r2-F002`

- **Artifact and line:** `cdd/changes/20261025-stale-lib-guard/tasks.md:73` (archive example and “from the repo root”); `tasks.md:81` (fresh-node examples run from repo root); `tasks.md:94` (command map); `design.md:35` (guard boundary).
- **Provenance:** reviewer `opencode-zen/gpt-6-luna`; evidence sources: gate adjudication and design boundary, traced against the current dispatcher in `index.ts:35,248`.
- **Evidence status:** Trace-backed.
- **Preconditions:** The extension is loaded from its install/source directory while the cdd operation targets another project directory, as allowed by the dispatcher’s separate `EXT_DIR` and `ctx.cwd` values.
- **Reproduction or trace:** The concrete archive example imports `./lib/store.mjs` relative to the command’s current directory and passes `process.cwd()` as the store root. From the extension root, the import resolves but the operation targets the extension repository’s store; from the target project root, the store root is right but the relative import does not resolve to the extension library. The planned scratch test can miss this if it places the copied extension surface and target store in the same directory.
- **Expected behavior and actual behavior:** A refusal command should invoke the requested operation against the same target store that was refused, independently of where the extension is installed. The example only does both when extension and target project happen to share a root.
- **Impact:** For ordinary projects using a separately installed extension, the advertised recovery command can fail or operate on the wrong store.
- **Smallest safe fix:** Build commands with an absolute import URL for the extension module and an explicit target-project root; run the command-table acceptance checks with extension source and target store in separate scratch directories.
- **Recommended disposition:** `open`.

### [should] two promised door-1 guards have no acceptance pin — `stale-guard-r2-F003`

- **Artifact and line:** `cdd/changes/20261025-stale-lib-guard/proposal.md:11`; `cdd/changes/20261025-stale-lib-guard/specs/extension/spec.md:106-111`; `cdd/changes/20261025-stale-lib-guard/tasks.md:86`.
- **Provenance:** reviewer `opencode-zen/gpt-6-luna`; evidence sources: proposal behavior, delta scenario, and task 3.5 verification.
- **Evidence status:** Trace-backed.
- **Preconditions:** The implementation applies the stale check to `/cdd-archive` but omits it from `/cdd-init` or `/cdd-new`.
- **Reproduction or trace:** The proposal promises the same consult in all three mutating door-1 commands, and task 3.5 names all three. The only door-command scenario is specifically `/cdd-archive`; task 3.5 verifies only that scenario. An implementation omitting either other handler can therefore pass the cited acceptance pin.
- **Expected behavior and actual behavior:** All three commands should be checked for stale refusal. The current package pins only the archive handler end to end.
- **Impact:** Regressions in `/cdd-init` or `/cdd-new` could ship despite the stated door-1 requirement and a green task verification.
- **Smallest safe fix:** Extend the acceptance coverage with a table-driven check or dedicated scenarios for `/cdd-init`, `/cdd-new`, and `/cdd-archive`.
- **Recommended disposition:** `open`.

### [should] required design boundary is missing for the Model diagram box — `stale-guard-r2-F004`

- **Artifact and line:** `cdd/changes/20261025-stale-lib-guard/design.md:18-30,33-39`; `cdd/rules.md:36-43` (rule 2c).
- **Provenance:** reviewer `opencode-zen/gpt-6-luna`; evidence sources: design Diagram and Boundaries sections, and repository design-document rule.
- **Evidence status:** Trace-backed.
- **Preconditions:** The T2=YES gate requires the design document to follow rule 2c.
- **Reproduction or trace:** The diagram has six boxes, including `Model` (“Component: pi model / human”), while Boundaries has entries for Dispatch, Guard, Frozen library, Extension source, and Project store only. Rule 2c requires one boundary line per diagram box.
- **Expected behavior and actual behavior:** Every diagram box should have a boundary stating what it is and what it must not know about; the Model box has none.
- **Impact:** The required T2 design artifact is incomplete against the repository’s documented design-gate contract.
- **Smallest safe fix:** Add the Model boundary to `design.md` or remove the box if it is not part of the design boundary.
- **Recommended disposition:** `open`.

## Severity counts

- No `note` findings.
- **Counts:** blocker 1; should 3; note 0.

## Coverage and verification

- Read the R2 brief and `skills/cdd-spec-review/SKILL.md` package-mode checklist; reviewed the proposal, design, delta, tasks, R1 findings/dispositions, living extension spec, `cdd/rules.md`, PF-35/PF-36 context, and the named dispatcher/library/test harness files.
- Traced the source/target-root distinction through `index.ts` and checked the existing store, backlog, and ADR operation interfaces against the proposed scratch-command setup. The package plans a table-driven command legality check; no implementation exists yet to execute that planned test.
- Did not run the cdd tool, tests, or validators, as instructed by the brief. The R2 assignment did not provide a pinned base/head comparison range; exact changed-range coverage is therefore unconfirmed.

Summary: model gpt-6-luna, thinking high — blocker: 1, should: 3, note: 0.

## Author dispositions

- F001 (blocker, fixed): delta prose rewritten — "membership plus each file's content digest, so a changed file counts as stale even when its modification time and size are unchanged"; design.md fresh-spawn bullet and diagram edges updated to the digest wording (metadata rides as recorded data only, never decides).
- F002 (should, fixed): refusal commands import the extension library by absolute file URL and pass the target project root explicitly; gate adjudication 1, Design Notes, tasks 3.2/3.3, proposal pin bullet updated; scratch harness places extension-surface copy and target store in separate directories.
- F003 (should, fixed): delta scenario 7 rewritten to run /cdd-init, /cdd-new, and /cdd-archive each against the stale process, each refused with exactly 1 error; task 3.5 verify updated to all three commands.
- F004 (should, fixed): Caller boundary added to design.md Boundaries (no override path, no surface/diff knowledge required).
- INCOMPLETE note (no pinned base/head): expected for a package review — no implementation diff exists pre-implementation; the R3 briefs pin the comparison range.
