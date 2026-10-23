# R3 standards-axis code review — law-guard-fixes

- Reviewer form: cold sub-agent (fresh session, briefed only from the paths named in brief-r3-standards-instantiated.md)
- Reviewer model family: opencode-zen/deepseek-v4-pro (from `PI_PROVIDER=opencode-zen`, `PI_MODEL=deepseek-v4-pro`)
- Author model family: zai/glm-5.3 — families differ (opencode-zen vs zai)
- Repo state: branch `law-guard-fixes`, fixed point `HEAD` = 26f3467, change artifacts uncommitted in the working tree
- Review point: R3 (code review), Standards axis only, at Close
- Scope: the diff's conformance to documented conventions and accepted decisions. Advisory findings only — no fixes, no verdicts.

## Findings

### F1 — note — loop-law.mjs header comment is stale about which rules are canonical law prose

The module header comment names only `lawRule2/lawRule2a` as the canonical law prose, but the module now also carries `lawRule2b`, `lawRule2c`, and (added by this change) `lawRule3`. The change adds `lawRule3()` without updating the comment, extending a pre-existing staleness (2b/2c were already omitted).

Evidence: `lib/loop-law.mjs:4-5` ("The law prose (lawRule2/lawRule2a) is canonical text kept byte-identical to the store copy cdd/rules.md") against the new `export function lawRule3()` at `lib/loop-law.mjs:157-161`.

### F2 — note — LDW2 claims "byte-identically" but asserts whitespace-normalized equality

The test name and description state the store copy carries the rule-3 text "byte-identically", but the assertion compares `norm(r3store) === norm(r3render)` — `norm()` collapses all whitespace, so the check is whitespace-insensitive, not byte-identity. True byte-identity of the whole law text is still pinned by SSL3 (`tests/acceptance/single-source-law.test.js:117-119`, `assert(store === tpl.RULES_MD)`), so no invariant is left unguarded — the finding is that the new test's own claim overstates its check.

Evidence: `tests/acceptance/law-done-when.test.js:66-72` (LDW2 name and `norm()` comparison) against `tests/acceptance/single-source-law.test.js:117-119`.

### F3 — note — Done When Traceability table carries a criterion with no matching Done-When line

The proposal carries three `Done-When:` lines, none of which states the PF-17 rule-3 text contract. The traceability table's first row ("rule 3 states 1-5 observable criteria, rendered + mirror, wording gone" → 3.2, 3.3) therefore maps a criterion that is not one of the proposal's Done-When lines, so the rule-6 criterion→task mapping is not 1:1 with the proposal's completion criteria. The PF-17 fix is a first-class "What Changes" bullet but has no Done-When line of its own.

Evidence: `cdd/changes/law-guard-fixes/proposal.md` (three Done-When lines, all PF-18/backlog/dogfood) against `cdd/changes/law-guard-fixes/tasks.md` (Done When Traceability table, row 1).

## Checks that passed (no finding)

- **Single-source / byte-identity (ADR-0009)**: `lawRule3()` is defined once in `lib/loop-law.mjs` and interpolated into `RULES_MD` in `lib/templates.mjs`; `cdd/rules.md` is byte-identical to the rendered `RULES_MD` (verified: `tpl.RULES_MD === store` is `true`), and SSL3 pins that identity.
- **ADR-governed files respected**: `lib/loop-law.mjs` (ADR-0009/0010) gains only the rule-3 prose; `lib/templates.mjs` (ADR-0006/0007/0008/0009/0011) interpolates it inside the existing RULES_MD artifact block, no scaffold surface split; `cdd/rules.md` changes only as the deliberate byte-identical mirror regeneration; `scripts/spec-drift.mjs` + `cdd/scripts/spec-drift.mjs` (ADR-0001/0006/0007) change only the mode-dispatch branch gate, restating no grammar.
- **Zero-dependency (ADR-0001)**: `lawRule3()` is pure string assembly; the guard edit is plain branch logic; no dependency enters the tree.
- **Guard/validator alignment**: the topology-L2 ownership move is the sanctioned, spec'd fix (PF-18), documented in `design.md` (Boundaries + Alternatives) and the spec delta, and mirrored in the code comment at `scripts/spec-drift.mjs:360-366`. The invariant stays enforced: the commit-msg door's staged-pair check polices every commit being made, the full scan owns committed-history topology L2, and the H check flags a single-hook scaffold missing commit-msg. No silent divergence; the law text renders byte-identically from its single source.
- **Smell baseline**: no new instances of the twelve baseline smells. The two `spec-drift.mjs` copies are the sanctioned DOOR_SCRIPTS duplication (ADR-0007), not new Duplicated Code; the rationale comment is appropriate for a subtle branch gate.
- **Test placement/conventions**: both new pins live in `tests/acceptance/*.test.js`, follow the existing shebang + `check`/`assert`/summary pattern, and invoke real surfaces (rendered module output, store mirror, real `initStore`/`archiveChange`, real door as a child process) per rule 7 / ADR-0011.

## Dispositions (author, 2026-10-23)

- F1 (header comment stale) — **fixed:** lib/loop-law.mjs:4 now reads "lawRule2/lawRule2a/2b/2c and lawRule3".
- F2 (LDW2 claims byte-identity but compares normalized) — **fixed:** ruleBlock() returns the raw slice; LDW2 asserts `r3store === r3render` (byte-exact). Verified by spec-axis F1 disposition below.
- F3 (traceability row without a Done-When line) — **fixed:** proposal.md carries the PF-17 Done-When line first ("rule 3's rendered law text and its cdd/rules.md mirror state the 1-5 observable-criteria contract, and the old one-line wording is gone"); 4 Done-When lines ↔ 4 table rows.

## Post-Close addendum 2026-10-23 (post-approval, director-authorized)

The Close pair-commit surfaced an A2 staleness debt (six ADRs vs the change's
governed files). While executing a director-authorized bypass order, the
runner isolated the door red, found the order's premise false (a lawful
amend shape exists), and stopped before any --no-verify. The six
reconfirmation paragraphs landed via director-authorized amend of this
change's unpushed archive commit, through both wired doors. Findings:
PF-19 (corrected mechanism — staged-pair vs A2 on literally-claimed ADR
files) and PF-20 (globToRe star-escape bug) are recorded in cdd/backlog.md.
No R3 finding above is affected; this addendum is store history, not a
review verdict.
