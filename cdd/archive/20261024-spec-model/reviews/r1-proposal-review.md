# R1 proposal review — spec-model

## Reviewer form

- **Form:** cold sub-agent session (fresh session, briefed only from `cdd/changes/spec-model/reviews/brief-r1.md` and the paths it names; not the author's session).
- **Reviewer model family:** `opencode-zen` / `deepseek-v4-pro` (from `PI_PROVIDER` / `PI_MODEL`).
- **Author model family (per brief):** `zai` / `glm-5.3`.
- **Family separation:** established — the two families differ (different provider and lineage). Cold-review requirement (rule 2b) satisfied.
- **Repository state:** working tree uncommitted on branch `spec-model`, HEAD `bc4b867bc4c23b06406c519897d495dd531bcc29` (main); the only untracked path is `cdd/changes/spec-model/`.

## Scope

R1 proposal review of `proposal.md` + `design.md` (design gate answered T2 YES). The delta draft and tasks §3 are out of scope; tasks §2.1's design-gate record is the one tasks read (MUST-DELIVER 1). Advisory findings only — no verdicts, no fixes.

## Findings

| # | Severity | Disposition | Finding | Evidence |
|---|---|---|---|---|
| 1 | should | fixed: T4 flipped to YES in the gate record (tasks.md §2.1) with a post-review amendment note naming the R1 finding; same evidence re-read as invariants, shape consequence unchanged | The design-gate record answers **T4 invariant risk NO**, but the change's central risk is precisely an invariant: it re-points the guard's four re-parse sites (pinsOf/codeGlobs, memoryClaimsOf, correctionsByCap, the G-check) to a new parse model and pins the guard's full-corpus stdout/stderr/exit byte-identical, and it must preserve the store adapters' exact `{op, requirement, block, startLine, text}` shapes. The T4 answer's own text ("preserved by proof, not hope") concedes the invariants exist and are at stake — it describes a mitigation, not the absence of risk. The honest answer is T4 YES (invariant risk is real and central), with the byte-identity proof (PF-27) as the mitigation. The shape consequence is unchanged (T2 YES already carries `design.md`, and its Boundaries section covers the proof), but the gate record's reasoning understates the risk it is simultaneously pinning. | `cdd/changes/spec-model/tasks.md:66` (T4 clause); `cdd/changes/spec-model/proposal.md:38` (Done-When byte-identity) |
| 2 | note | fixed: design.md Boundaries split into one line per box (Validate, Archive) | `design.md`'s Boundaries section holds one combined entry for **two** diagram boxes — `Validate` and `Archive` are drawn as separate boxes (`design.md:16-17`) but share a single boundary line. Rule 2c requires "1 line per diagram box". The two consumers do share an identical "must not know" contract (neither may learn the model exists), so the merge is defensible, but it is a literal deviation from the one-line-per-box shape. | `cdd/changes/spec-model/design.md:16-17` (two boxes) vs `design.md:28` (one combined entry) |
| 3 | note | fixed: task 3.2 amended to require the scan to enumerate exactly what it treats as re-statement, so the pin's strength is visible in the test itself | Done-When #3 ("the spec-model parse is defined exactly once … no door script or the store re-states spec-file parsing") is verified by "the single-source scan in tests/acceptance/spec-model.test.js exits 0". The criterion names an observable check (test exit 0), so it passes the verifiability bar, but a scan can only detect *known* re-statement patterns — it cannot prove single-sourcing, only the absence of a detectable pattern. The check's strength is bounded by what the scan looks for; worth stating in the test what "re-statement" is matched against so the pin is not vacuously green. | `cdd/changes/spec-model/proposal.md:39` |

## Checklist disposition (MUST-DELIVER)

1. **Design-gate answers credible** — T1/T2/T3/T5 credible; T4 NO understates the invariant risk (finding 1).
2. **Reuse-first actually searched** — satisfied: reuses `grammar-law.mjs`, `globToRe` from `adr-index.mjs` (ADR-0007/PF-20), and the existing `parseDelta`/`parseLivingSpec` shapes; Solutions Considered rejects from-scratch alternatives. No from-scratch build of existing store surface.
3. **Every Done-When verifiable** — all four name observable checks (cmp, test exit 0); finding 3 notes the bounded strength of the single-source scan.
4. **Scope fence sane** — Non-Goals and Solutions Considered fence the work; every What Changes bullet is sponsored by a Done-When line.
5. **Capability mapping right** — `gherkin` exists (`cdd/specs/gherkin/spec.md`), the change maps to it, the Capabilities section is present, and the cited precedent "The ADR claims index is single-sourced" is a real gherkin requirement (`cdd/specs/gherkin/spec.md:1404`).

## Design-document contract (rule 2c)

`design.md` carries exactly the four mandatory sections (Level, Diagram, Boundaries, Alternatives), exactly one kind-carrying mermaid `flowchart TD` with C4 node labels (`System:`/`Component:`), and Level states Component with the Code level explicitly banned. Finding 2 is the only shape deviation (one combined Boundaries entry for two boxes).
