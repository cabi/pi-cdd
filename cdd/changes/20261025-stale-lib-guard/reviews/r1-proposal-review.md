# R1 proposal review — 20261025-stale-lib-guard — 2026-10-25 — reviewer: cold sub-agent, fresh session

- Model: gpt-6-luna (`PI_PROVIDER=opencode-zen`); thinking: high; mode: proposal; form: cold subagent, fresh session.
- Independence: author family zai (glm-5.3); reviewer model/family differs.
- Scope: `/home/carsten/Projects/pi-extensions/pi-cdd` at HEAD `899ba38adeca43263b93184d556e84aea548f5ca`, using the working tree. Staged: none. Unstaged: `cdd/backlog.md`. Untracked: `cdd/changes/20261025-stale-lib-guard/` (proposal, design, delta, tasks, and review brief). The review object is `proposal.md` and `design.md`; inputs checked include `cdd/rules.md`, PF-35/PF-36, the extension living spec, `index.ts`, `lib/ops.mjs`, and the gate record in `tasks.md` §2.1.

## Findings

### [blocker] Metadata equality can miss a source edit

- **Artifact and evidence:** `cdd/changes/20261025-stale-lib-guard/proposal.md:9` specifies membership plus `mtimeMs` and size; `cdd/changes/20261025-stale-lib-guard/design.md:47-48` says that diff “catches any post-load edit”; `cdd/changes/20261025-stale-lib-guard/tasks.md:75` says size covers a same-mtime replacement.
- **Problem / trace:** A same-length rewrite with the original `mtimeMs` preserved (or on a filesystem whose timestamp resolution has not advanced) leaves membership, `mtimeMs`, and size identical to the snapshot. The specified comparison therefore reports a clean surface despite changed bytes. The same-mtime rationale only holds when the replacement also changes size.
- **Expected vs. actual:** Every changed source file should make the process stale; under that precondition this design considers the surface clean and allows the cached pre-edit code to run.
- **Impact:** The central safety guarantee can silently fail for a source edit, including before a mutating operation.
- **Recommended disposition:** `open` — compare a content digest as well (and pin a same-size, same-mtime rewrite), or explicitly narrow the guarantee and obtain agreement that this detection gap is acceptable.

### [should] Per-op fresh-node commands are not verified for legality

- **Artifact and evidence:** `cdd/changes/20261025-stale-lib-guard/tasks.md:73` adjudicates the steer as a lawful command “per op” but supplies only the archive example; `cdd/changes/20261025-stale-lib-guard/tasks.md:83` verifies that a refusal message contains a file and command; `cdd/changes/20261025-stale-lib-guard/tasks.md:87` runs the self-application proof only for archive. The delta at `cdd/changes/20261025-stale-lib-guard/specs/extension/spec.md:62` requires commands for all listed mutating operations/actions.
- **Problem:** A command string can satisfy the planned “file + command” assertion while invoking the wrong function, omitting needed arguments, or otherwise failing to run that operation. The acceptance cases exercise archive and backlog add refusals but do not establish that the planned `init`, `new`, `reconfirm`, backlog `resolve`, and backlog `revalidate` command examples are lawful.
- **Expected vs. actual:** Each refusal should give a command that runs its refused operation in a fresh process; the current verification plan can pass without establishing this for each command-map entry.
- **Impact:** Operators may follow an apparently actionable refusal and still fail to perform the required operation; the director's refusal-as-guidance steer is not fully pinned.
- **Recommended disposition:** `open` — add a table-driven pin for every mutating op/action and exercise the generated commands against an isolated scratch store where safe.

## Severity counts

- No `note` findings.

Summary: model gpt-6-luna, thinking high — blocker: 1, should: 1, note: 0.

## Author dispositions — 2026-10-25 (author: zai/glm-5.3, session 01a17075)

- [blocker] Metadata equality can miss a source edit — **fixed:** the diff now decides on membership plus a per-file sha256 content digest computed on every dispatch (no metadata fast-path); mtimeMs and size ride as recorded metadata. Pinned by new delta scenario "A same-length rewrite with the original modification time is detected" (tests/acceptance/stale-lib-guard.test.js). design.md Alternatives, proposal.md What Changes, tasks.md gate-record line 4 updated.
- [should] Per-op fresh-node commands are not verified for legality — **fixed:** new delta scenario "Every refusal command runs its op" pins a table-driven check executing every mutating op's and backlog action's refusal command in a fresh process against isolated scratch stores; tasks 3.2/3.3 carry the table-driven pin.
