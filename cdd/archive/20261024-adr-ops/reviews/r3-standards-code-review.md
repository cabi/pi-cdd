# R3 standards-axis code review — adr-ops

- **Reviewer form:** cold sub-agent session (fresh session, briefed only from
  `brief-r3-standards.md` and paths on disk; rule 2b).
- **Reviewer model family:** `opencode-zen` / `deepseek-v4-pro` (from
  `PI_PROVIDER` / `PI_MODEL` in the runtime environment).
- **Author model family:** `zai` / `glm-5.3` (per the brief). Families differ —
  the reviewer-independence requirement of rule 2b is met.
- **Scope:** Standards axis only. Diff `git diff ecbdafe` (working tree vs base
  `ecbdafe`, branch `adr-ops`) plus untracked-file reads (`lib/adr-ops.mjs`,
  `scripts/adr-index.mjs`, the new acceptance suites, the change folder).
  `git log ecbdafe..HEAD` is empty — the whole change is the staged/unstaged
  working tree plus index. Spec compliance is out of scope (separate session).

## Findings

### [should] F001 — `lib/adr-ops.mjs` re-states the `Code:` line grammar instead of importing `CODE_LINE`, and the re-statement diverges

- **Location:** `lib/adr-ops.mjs:183` (`claimedByOpenChanges`)
- **Evidence:** `lib/adr-ops.mjs:183` matches
  `/^\s*Code:\s*(.+)$/gm`; the single source is
  `scripts/grammar-law.mjs:105` — `CODE_LINE = /^\s*(?:-\s+)?Code:\s*(.+)$/gm`.
  The guard imports `CODE_LINE` (`scripts/spec-drift.mjs:25`, used at
  `:150`, `:309`, `:336`); the op re-types it.
- **Finding:** ADR-0007 ("the law behind every door") records that the Gherkin
  grammar constants (`CODE_LINE`, `PIN_COMMENT` and friends) live solely in
  `scripts/grammar-law.mjs`, and ADR-0009 (single-source) forbids a second
  statement. The op's inline regex is a second statement, and it is not
  byte-equivalent: it drops the optional `- ` list prefix that `CODE_LINE`
  allows. A delta spec written as `- Code: <globs>` (list form) is claimed by
  the guard's A1 but not by the op's `claimedByOpenChanges`, so `reconfirm
  --check` can silently miss a claimed file the guard governs.
- **Disposition:** open
- **Smallest safe fix:** import `CODE_LINE` from `../scripts/adr-index.mjs`'s
  law pair (or directly from `scripts/grammar-law.mjs`) and match with it,
  deleting the inline regex.

### [should] F002 — `lib/adr-ops.mjs` re-states `MECH_GREP` and applies it without `--extended-regexp`, so the mechanical-commit exclusion is silently inert

- **Location:** `lib/adr-ops.mjs:27` (constant) and `:39` (`lastCommitDate`)
- **Evidence:** `lib/adr-ops.mjs:27` copies
  `MECH_GREP = "^Mechanical-Change:|^\\[mechanical\\]"` from
  `scripts/spec-drift.mjs:74`, and `:39` runs
  `git log -1 --format=%ad --date=short --invert-grep --grep=${MECH_GREP} -- <rel>`
  with **no** `--extended-regexp`. The guard applies the same pattern with
  `--extended-regexp` (`scripts/spec-drift.mjs:80` and `:454`).
- **Finding:** Git's default `--grep` is basic regexp, where `|` is a literal
  character. Without `--extended-regexp`, the pattern matches no commit
  message, so `--invert-grep` selects *every* commit — the mechanical-commit
  exclusion the comment claims to mirror (`lib/adr-ops.mjs:25`) never fires.
  `reconfirm --check` therefore reports a file as "moved" even when its last
  commit was a mechanical sweep, diverging from the guard's M semantics. This
  is a duplicated constant (single-source violation) *and* a silent behavioral
  divergence from the door it claims to mirror.
- **Disposition:** open
- **Smallest safe fix:** add `--extended-regexp` to the `git log` args in
  `lastCommitDate` (matching the guard), and ideally import the shared
  `MECH_GREP` rather than re-stating it.

### [note] F003 — the `reconfirm` dispatch overloads the top-level `name` parameter as the ADR id

- **Location:** `index.ts` `case "reconfirm"` —
  `const id = o.value.id !== undefined ? o.value.id : params.name;`
- **Evidence:** `name` is documented in the tool schema as "change name,
  kebab-case", but here it is silently reused as the ADR id fallback so that a
  positional `cdd reconfirm ADR-0008` works. The `adrs` op does not use
  `params.name` at all, so the two new ops treat the same parameter
  differently.
- **Finding:** Confusing parameter reuse (a mild Mysterious Name / overload):
  one documented concept ("change name") doubles as another ("ADR id") in one
  op only. Not a correctness defect — the id is still validated downstream —
  but it makes the dispatch surface harder to reason about.
- **Disposition:** open
- **Smallest safe fix:** either document the fallback in the `reconfirm`
  description, or drop the `params.name` fallback and require `id` via options
  like the other reconfirm parameters.

## Coverage and verification

- Read `brief-r3-standards.md`, `cdd/rules.md`, `skills/cdd-code-review/SKILL.md`
  (smell baseline quoted verbatim), `README.md`, `MAINTENANCE.md`, and the
  accepted ADRs whose `code:` globs the diff touches (0001–0012).
- Inspected the full `git diff ecbdafe` (index.ts, lib/templates.mjs,
  tests/tools.mjs, scripts/spec-drift.mjs, cdd/scripts/spec-drift.mjs, the
  decisions reconfirmation-line migration, backlog.md, the two guard test
  edits) and read the untracked/new files `lib/adr-ops.mjs`,
  `scripts/adr-index.mjs`, `cdd/scripts/adr-index.mjs`, and the four new
  acceptance suites plus the change folder's three spec deltas and tasks.md.
- Confirmed store copies byte-identical: `cmp scripts/adr-index.mjs
  cdd/scripts/adr-index.mjs` and `cmp scripts/spec-drift.mjs
  cdd/scripts/spec-drift.mjs` both clean (the P5 byte-identity pin holds).
- Smell baseline: no new instances of the twelve smells beyond the two
  single-source duplications recorded as F001/F002; the acceptance-test
  harness boilerplate (`fakeApi`/`check`/`assert`/`loadViaPi`) is a
  pre-existing pattern across every suite, not a new instance.
- Guard/validator alignment: the extraction is behavior-preserving (store
  copies byte-identical, `globToRe`/`buildAdrIndex`/`ADR_STATUSES` now
  single-sourced in `scripts/adr-index.mjs` and imported by both the guard and
  the ops); the two divergences above (F001, F002) are the only places the op
  re-states door grammar/constants instead of importing them.

## Author dispositions (2026-10-24, applied post-review)

- **F001 — FIXED.** `lib/adr-ops.mjs` now imports `CODE_LINE` from
  `scripts/grammar-law.mjs` and drives `claimedByOpenChanges` with
  `[...text.matchAll(CODE_LINE)]`; the local re-statement is gone. The op and
  the door read the same regex object by construction.
- **F002 — FIXED.** `MECH_GREP` is now exported from `scripts/grammar-law.mjs`
  (single source beside `CODE_LINE`); `scripts/spec-drift.mjs` drops its local
  const and imports it, and `lib/adr-ops.mjs`'s `lastCommitDate` passes
  `--extended-regexp` before `--grep` so the alternation is ERE, matching the
  guard's two call sites. Both store copies regenerated and `cmp`-identical;
  `LAW_VERSION` stays 2 (pure relocation, no behavior change).
- **F003 — WON'T-FIX (house pattern).** The reconfirm dispatch overloads the
  top-level `name` slot as the ADR id fallback, mirroring how `validate`,
  `status`, and `archive` fill their positional slot from `name`; the OPS_DOC
  entry documents `id` as the canonical spelling. Changing the fill-in pattern
  for one op would diverge from the established tool convention.
