# R1 proposal review — backlog-op

- **Review point:** R1 (proposal), fired because the design gate answered T1 and T2 YES.
- **Artifact under review:** `cdd/changes/backlog-op/proposal.md` (proposal only).
- **Reviewer form:** cold sub-agent session, briefed only from paths on disk (charter at `/tmp/brief-r1-backlog-op.md` plus the artifact paths it names). Not the author's session.
- **Model family:** reviewer `opencode-zen` (deepseek lineage, `PI_PROVIDER=opencode-zen`, `PI_MODEL=deepseek-v4-pro`); author `zai` (glm lineage). Families differ — the rule 2b family-separation requirement is met.
- **Repository state:** working tree, uncommitted, branched from `5fd7651` on branch `backlog-op`; `cdd/changes/backlog-op/` is the only open change.

## Findings

### 1. `should` — two refusal behaviors in What Changes are unsponsored by any Done-When line

What Changes bullet 2 promises `lib/backlog.mjs` refuses six shapes — "unknown actions and options, unknown ids, resolving to open, seeded-into-change without a change name, and any off-grammar line" — but the first Done-When line names only three of them:

> `Done-When: The cdd backlog op adds, lists, and resolves items in cdd/backlog.md, refusing unknown actions, unknown ids, and off-grammar files`

"resolving to open" and "seeded-into-change without a change name" (and, arguably, "unknown options") are promised in What Changes yet named in no Done-When line. Per MUST-DELIVER 4, nothing in What Changes may be unsponsored by a Done-When. The delta spec does pin "Seeded-into-change demands a change name" as a scenario, but the proposal's Done-When set should be self-contained at R1.

Evidence: `cdd/changes/backlog-op/proposal.md` (What Changes bullet 2 vs. first Done-When line).

### 2. `should` — the 8 seed findings are referenced but never enumerated or sourced

The proposal (What Changes bullet 1, and the second Done-When line) and the seed task both promise "the 8 triaged findings from the 2026-10-22 runs" without naming them or pointing at a durable source. The change's own Why is that findings "evaporate when the run ends" — so if those 8 findings live only in session memory, the seed task cannot reproduce them, which is exactly the loss mechanism this change exists to fix. The seed content should be captured on disk (or its source named) before the seed task runs.

Evidence: `cdd/changes/backlog-op/proposal.md` (What Changes bullet 1, second Done-When line); `cdd/changes/backlog-op/tasks.md` §3.7.

### 3. `note` — five Code: lines where the convention is one

The proposal carries one `Code:` line per Done-When line (five total), with `tests/acceptance/backlog-op.test.js` repeated in four of them. Rule 3 says "one `Code: <globs>` line naming the implementation surface", and the archive convention (e.g. `cdd/archive/20261022-loop-law-hardening/proposal.md`, `cdd/archive/20261021-runner-ergonomics/proposal.md`) is multiple Done-When lines under a single consolidated `Code:` line. The validator only checks for the presence of a `Code:` line (`lib/validate.mjs`), so this is not a gate failure — a clarity/convention deviation only.

Evidence: `cdd/changes/backlog-op/proposal.md` (five `Code:` lines); `cdd/rules.md` rule 3.

### 4. `note` — the delta specs already exist on disk, contrary to the review brief's premise

The brief states "the delta does not exist yet", but `cdd/changes/backlog-op/specs/gherkin/spec.md` and `cdd/changes/backlog-op/specs/extension/spec.md` are present and fully drafted. R1 is proposal-only, so the delta is out of scope for this review, but the loop order (proposal → R1 → delta) has the delta drafted ahead of R1; any R1 finding that would change the delta means re-drafting it. Recorded for the author's awareness, not a proposal defect.

Evidence: `cdd/changes/backlog-op/specs/gherkin/spec.md`, `cdd/changes/backlog-op/specs/extension/spec.md`.

## Checklist disposition

- **Design-gate answers credible (MUST-DELIVER 1):** T1 YES (cross-cutting — law text, op dispatch, help, pins), T2 YES (architecture bet — one curated file vs. derived scans), T3 YES (seams named), T4 YES (invariants named), T5 NO (no other open change — correct). Credible; no finding.
- **Reuse-first actually searched (MUST-DELIVER 2):** names reuse of the index.ts dispatch/`parseOptions`/`isError`, the RULES_MD single source (ADR-0009), and the existing "Library modules refuse silent direct execution" requirement (MODIFIED); Solutions Considered covers session-local todos, derived scans, and tasks.md. No from-scratch build of an existing store feature; no finding.
- **Every Done-When verifiable (MUST-DELIVER 3):** all five name observable checks; the only gap is the refusal-list narrowing in finding 1.
- **Scope fence sane (MUST-DELIVER 4):** Non-Goals and Solutions Considered fence the work; the one sponsorship gap is finding 1.
- **Capability mapping right (MUST-DELIVER 5):** `extension` and `gherkin` both exist in `cdd/specs/`; the op maps to extension (tool surface) and the law line + MODIFIED requirement to gherkin (loop law), consistent with the living spec's existing law-text requirements. The Capabilities section is present. No finding.

## Dispositions (author, after R1)

1. `should` — **fixed**: Done-When 1 now names the full refusal set ("unknown actions and options, unknown ids, resolve-to-open, seeded-into-change without a change name, and off-grammar files").
2. `should` — **fixed**: the proposal now carries a `## Seeds` section enumerating all 8 findings with per-item source refs; task 3.7 seeds from that durable list, not session memory.
3. `note` — **fixed**: the five per-criterion `Code:` lines are consolidated into one line after the Done-When block, matching rule 3 and the archive convention.
4. `note` — **won't-fix (recorded)**: the delta files predate R1 because `cdd validate` refuses a change with no capability delta at all, so draft validation required them to exist; R1's scope stayed proposal-only and findings 1–3 changed no delta content, so no redraft was needed.
