# R3 spec-axis code review — adr-ops

- **Reviewer form:** cold sub-agent session (fresh session, not the author's).
- **Reviewer model family:** `opencode-zen` / `deepseek-v4-pro` (from `PI_PROVIDER` / `PI_MODEL`).
- **Author model family:** `zai` / `glm-5.3` (per the brief). Families differ — cold-review requirement satisfied.
- **Axis:** Spec only (Standards runs in its own session).
- **Reviewed range:** working tree vs base `ecbdafe` on branch `adr-ops` (`git log ecbdafe..HEAD` is empty — the whole change is the staged/unstaged working tree plus untracked files). Included: tracked diffs (`index.ts`, `lib/templates.mjs`, `scripts/spec-drift.mjs`, `tests/tools.mjs`, `tests/acceptance/gherkin-guard-placeholder.test.js`, `tests/acceptance/gherkin-door3.test.js`, `cdd/decisions/*.md`, `cdd/backlog.md`) and untracked/new files (`scripts/adr-index.mjs`, `lib/adr-ops.mjs`, `cdd/scripts/adr-index.mjs`, the four new acceptance suites, the change folder).
- **Disposition:** all findings `open`; the author disposes with `fixed:` / `won't-fix:`.

## Charter check (summary)

1. **Every scenario implemented** — every delta scenario's THEN is traceable to a code change (see the per-scenario trace below). No scenario is unimplemented.
2. **Pins actually pin** — the pins drive the real tool (`loadViaPi` on `index.ts`), the real guard as a child process, and synthetic git repos with controlled commit dates; each would fail on a regression of the pinned behavior. No copied-fragment or sandbox-only pin found.
3. **No unsponsored code** — the diff is clean apart from one weakly-sponsored hunk (F004).

## Findings

### [should] R3S-F001 — `reconfirm --change` accepts a non-existent change name

- **Location:** `lib/adr-ops.mjs:229-230` (the only validation is the kebab-case regex; no existence check against open or archived changes).
- **Evidence status:** Trace-backed.
- **Preconditions:** `cdd reconfirm <id> --change <typo>` where `<typo>` is kebab-case but names no open or archived change.
- **Trace:** `reconfirmOp` validates `change` only with `/^[a-z0-9][a-z0-9-]*$/` (line 229) and then writes `- Reconfirmed by <typo> on <date>: <evidence>` (line 255-256). `openChanges`/`archivedChange` are never consulted to confirm the name exists.
- **Expected:** the spec's refusal list is exhaustive (unknown id, superseded, missing change, missing evidence, second reconfirmation) and does not name "unknown change name", so this is not a spec violation — but the requirement's intent ("explicitly accepts an archived change name") is that the name is a *real* change.
- **Actual:** a typo'd `--change` silently writes a bogus reconfirmation line. The store-sweep pin (RC11) checks grammar only, so the bogus line passes and its date becomes the `--check` baseline for that ADR.
- **Impact:** a wrong reconfirmation record with a wrong date baseline, undetected by any pin.
- **Smallest safe fix:** refuse a `--change` that is neither an open change nor an archived change (list the open changes and the archive folders), or at minimum record the gap as a Non-Goal.

### [note] R3S-F002 — `reconfirm --check` checks all open changes, not "the current open change"

- **Location:** `lib/adr-ops.mjs:263-268` (`checkOp` calls `openChanges(root)` and `claimedByOpenChanges(root, opens)` with no refusal for multiple opens).
- **Evidence status:** Trace-backed.
- **Preconditions:** more than one open change in `cdd/changes/`.
- **Trace:** the append path refuses multiple open changes ("multiple open changes … pass --change", line ~222), but `checkOp` (line 263) iterates *all* open changes' `Code:` claims.
- **Expected:** the requirement says "for the current open change" (singular).
- **Actual:** with multiple open changes, `--check` silently pre-flights all of them; "the current open change" is undefined.
- **Impact:** minor spec-fidelity gap; the single-open-change scenario (RC9/RC10) is unaffected.
- **Smallest safe fix:** mirror the append path's refusal (or require `--change`) when more than one change is open.

### [note] R3S-F003 — `adrs --code <dir>` enumerates files via `git ls-files`, unlike the file query

- **Location:** `lib/adr-ops.mjs:120` (`trackedFiles(root).filter(...)`), `lib/adr-ops.mjs:43-45` (`git ls-files`).
- **Evidence status:** Trace-backed.
- **Preconditions:** a directory query in a store that is not a git repo, or a directory containing untracked files an ADR claims.
- **Trace:** the directory branch (line 120) builds `under` from `trackedFiles` (git `ls-files`), while the file branch (line ~124) is pure glob matching with no git dependency.
- **Expected:** "a directory answers every accepted ADR governing at least 1 claimed file under it" — independent of git tracking.
- **Actual:** a non-git store returns an empty `under` set and answers "no ADR governs <dir>" even when ADRs claim files there; untracked files are invisible to the directory query but visible to the file query.
- **Impact:** asymmetric, git-dependent semantics; the live-repo scenario (AO9) is unaffected.
- **Smallest safe fix:** enumerate files under the directory from the filesystem (or refuse when git is unavailable) instead of `git ls-files`.

### [note] R3S-F004 — `scripts/adr-index.mjs` direct-execution guard is not pinned by any scenario

- **Location:** `scripts/adr-index.mjs:21-25` (`process.exit(2)` guard).
- **Evidence status:** Trace-backed.
- **Preconditions:** none (a hunk with no direct pin).
- **Trace:** the extension delta's "refuses silent direct execution" scenario pins `lib/adr-ops.mjs` only (AO13); no scenario pins `scripts/adr-index.mjs`'s guard.
- **Expected:** every hunk serves a delta requirement or a ticked task's verify-by.
- **Actual:** the guard follows the `grammar-law.mjs` door-lib precedent named in the proposal's "Solutions Considered", so it is weakly sponsored, but it is an unpinned hunk.
- **Impact:** negligible (defensive, convention-consistent); flagged for the no-unsponsored-code charter item.
- **Smallest safe fix:** either accept it as part of the door-lib precedent (record the disposition) or drop it.

### [note] R3S-F005 — `reconfirm` appends to end of file rather than "below existing reconfirmation lines"

- **Location:** `lib/adr-ops.mjs:256` (`text.replace(/\n*$/, "\n") + "\n" + line + "\n"`).
- **Evidence status:** Trace-backed.
- **Preconditions:** an ADR whose reconfirmation block is not the last content in the file.
- **Trace:** the op appends to the file tail; it does not locate a "reconfirmation block".
- **Expected:** the requirement says "appends … to an ADR's reconfirmation block, below existing reconfirmation lines".
- **Actual:** correct for the corpus (reconfirmation lines sit at the end), but a trailing section after the block would land the new line after it.
- **Impact:** minor; the corpus and RC1 are unaffected.
- **Smallest safe fix:** insert after the last existing reconfirmation line, or record the corpus assumption.

### [note] R3S-F006 — evidence is not validated to be a single line

- **Location:** `lib/adr-ops.mjs:233-235` (only a non-empty check), `lib/adr-ops.mjs:255` (evidence embedded verbatim).
- **Evidence status:** Trace-backed.
- **Preconditions:** `--evidence` containing a newline.
- **Trace:** `String(evidence).trim()` is embedded into the line at 255 with no single-line check.
- **Expected:** "evidence is one required line".
- **Actual:** a multi-line evidence produces a multi-line "line" that breaks the pinned grammar; the store-sweep pin (RC11) would catch it only later, not at the op.
- **Impact:** minor robustness gap.
- **Smallest safe fix:** refuse evidence containing a newline.

## Coverage and verification

- Read in full: the three delta specs (`specs/adr/spec.md`, `specs/extension/spec.md`, `specs/gherkin/spec.md`), `proposal.md`, `tasks.md`, `scripts/adr-index.mjs`, `lib/adr-ops.mjs`, the four new acceptance suites, and the diffs of `index.ts`, `lib/templates.mjs`, `scripts/spec-drift.mjs`, `tests/tools.mjs`, `tests/acceptance/gherkin-guard-placeholder.test.js`, `tests/acceptance/gherkin-door3.test.js`, `cdd/decisions/*.md`, `cdd/backlog.md`.
- Confirmed `git log ecbdafe..HEAD` is empty (whole change is the working tree) and `HEAD == ecbdafe`.
- Confirmed byte-identity: `scripts/adr-index.mjs` ≡ `cdd/scripts/adr-index.mjs`, `scripts/spec-drift.mjs` ≡ `cdd/scripts/spec-drift.mjs`, `scripts/grammar-law.mjs` ≡ `cdd/scripts/grammar-law.mjs` (all `cmp`-identical); `LAW_VERSION = 2` and `isPlaceholderPin` are pre-existing in `scripts/grammar-law.mjs` (unchanged), so the MODIFIED requirement's actual delta is the third traveling file (`adr-index.mjs`), which is implemented via `DOOR_SCRIPTS` and the P5 byte-identity pair.
- Confirmed `ADR_STATUSES = ["accepted", "superseded", "draft", "proposed"]` is the single shared constant re-exported through `scripts/adr-index.mjs` and consumed by both the guard and the ops (never re-typed).
- Did not run the acceptance suites (read-only assignment); relied on the recorded results in `tasks.md` (adr-ops 15/15, adr-reconfirm 11/11, adr-index-agreement 3/3, guard-adr-remedies 2/2, tools 18/18) and traced each pin to the real tool/guard/git surface.

## Author dispositions (2026-10-24, applied post-review)

- **F001 — FIXED.** `reconfirmOp` validates the change name against
  `knownChanges` (open changes ∪ archived change folder names) and refuses
  `unknown change "…" — open: …; archived changes live under cdd/archive/<date>-<name>`.
  Sponsored by a new delta scenario ("An unknown change name refuses") and
  pinned by RC12 in `tests/acceptance/adr-reconfirm.test.js`.
- **F002 — FIXED.** `checkOp(root, change)` scopes the pre-flight: an explicit
  `--change` (validated by the same `knownChanges` set) narrows to that
  change; no `--change` with multiple open changes refuses naming them and
  demanding `--change`; the sole-open-change default is unchanged. Sponsored
  by two new delta scenarios and pinned by RC14.
- **F003 — WON'T-FIX (by design).** The claims surface is tracked files by
  definition — the guard's own A-checks build their file universe from
  `git ls-files` identically — so a git-backed directory enumeration is the
  tool↔door agreement this change exists to guarantee, not drift from it.
  A non-git store has an inert claims model everywhere (the guard included).
- **F004 — WON'T-FIX (door-lib convention).** The direct-execution guard in
  `scripts/adr-index.mjs` follows the `grammar-law.mjs` precedent (guard,
  named in the proposal's Solutions Considered); pinning each door-lib's
  exit-2 banner would be a new law for an existing convention.
- **F005 — FIXED.** `reconfirmOp` now inserts the new line directly below the
  last existing reconfirmation line (falling back to the file tail when none
  exists), matching the requirement text that already promised it. Sponsored
  by "A new reconfirmation lands below the existing ones" and pinned by RC15.
- **F006 — FIXED.** Evidence containing a newline refuses with
  "evidence must be one line — newlines would break the pinned
  reconfirmation-line grammar". Sponsored by "Multi-line evidence refuses"
  and pinned by RC13.
