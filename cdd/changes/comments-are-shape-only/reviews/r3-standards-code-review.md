# R3 standards-axis code review — comments-are-shape-only

**Reviewer form:** cold sub-agent session (not the author's session).
**Reviewer model family:** opencode-zen / deepseek-v4-pro.
**Author model family:** zai (glm lineage — zai/glm-5.3). Families differ — rule 2b satisfied.
**Pinned state:** branch `comments-shape`, HEAD `dcda8d4`, change in the uncommitted working tree.
**Diff:** `git diff dcda8d4` (29 tracked paths) plus reads of the untracked paths
(`cdd/changes/comments-are-shape-only/`, `cdd/decisions/0012-comments-are-shape-only.md`,
`tests/acceptance/comment-law.test.js`, `tests/acceptance/guard-header-index.test.js`,
`tests/acceptance/comment-shape-adr.test.js`).

## Findings

### [should] r3-std-F001 — Sweep left a duplicated header line in lib/templates.mjs

- **Severity:** should · **Disposition:** fixed: duplicate line 2 deleted post-review; `npm test` 28 pass / 0 fail and `node scripts/spec-drift.mjs` clean after the fix
- **Location:** lib/templates.mjs:2
- **Evidence:** the file header reads
  `// templates.mjs — the form of every artifact. Ambient carries the method,` on line 1
  and the identical line again on line 2, before `// these files carry the form. Zero dependencies.`
  (line 3). The diff hunk `@@ -1,5 +1,6 @@` shows the sweep inserted a second copy of the
  first line while deleting the `(ADR-0004)` / `by ADR-0001` citations.
- **Finding:** the comment sweep duplicated the module's own header line. This is exactly the
  kind of accidental artifact the change exists to remove — a comment that restates the module
  name twice and carries no shape information. It is a comment-only defect (no behavior change),
  but it is a real, visible blemish in the swept surface.
- **Expected / actual:** a single shape-only header line; the file carries the line twice.
- **Impact:** cosmetic; a reader sees a doubled sentence. No door or test flags it (the
  comment-law pin bans corpus routing, not duplication).
- **Smallest safe fix:** delete the duplicate line 2.

### [should] r3-std-F002 — Sweep left a stray `/**` opener in lib/store.mjs

- **Severity:** should · **Disposition:** fixed: stray `/**` opener deleted, single clean JSDoc block above `archiveChange`; suite + guard green after the fix
- **Location:** lib/store.mjs:250
- **Evidence:** the JSDoc block above `archiveChange` opens with two consecutive `/**` lines
  (lines 250 and 251) before ` * Merge a change's deltas into the living specs…`. The diff hunk
  `@@ -247,9 +247,10 @@` shows a `+/**` line added immediately above the pre-existing `/**`.
- **Finding:** the sweep inserted a second block-comment opener, leaving a malformed JSDoc
  (`/**` on line 250 opens a comment whose first content line is the literal text `/**`). It
  still parses as a valid block comment, so nothing breaks, but the JSDoc is no longer a clean
  doc comment and the stray line is a clear sweep artifact.
- **Expected / actual:** one `/**` opener; the file has two.
- **Impact:** cosmetic; malformed JSDoc on a public export. No behavior change.
- **Smallest safe fix:** delete the stray `/**` on line 250.

### [note] r3-std-F003 — guard-header-index pin hard-codes the tag-emission mechanisms

- **Severity:** note · **Disposition:** won't-fix: the three emission shapes are the pin's contract, now documented by this review's evidence line; a future check emitting through a new shape updates the pin in the same change (the ADR chose pin-over-guard-scanner deliberately, and a shared emission helper would re-centralize what the header index exists to keep honest)
- **Location:** tests/acceptance/guard-header-index.test.js:36-40 (`emittedTags`)
- **Evidence:** `emittedTags` collects tags from exactly three source shapes —
  `issues.push(\`[TAG]`, `=> \`[TAG]`, and `console.log(\`…[TAG]` — and the set-equality pin
  (GHI1) treats that collection as the complete emitted set.
- **Finding:** the pin's completeness depends on every future check emitting its tag through one
  of those three literal shapes. A check that builds its tag line through a helper variable or a
  different call shape would be invisible to the pin (an undocumented tag would not be reported),
  or a documented tag would be reported stale. This is a judgement call, not a current defect:
  the three shapes cover every tag the script emits today (verified by trace: A0/A1/A2/G/H/L1/L2/
  L3/M/O via `issues.push`, L4 via the `=> \`[L4]` helper, L4-skip via `console.log`), and the ADR
  deliberately chose a pin over a guard-side scanner. It is recorded so the author can weigh
  whether the emission-shape list itself should be pinned or documented.
- **Impact:** latent blind spot in the rot-loudness mechanism the ADR relies on.
- **Smallest safe fix:** none required now; optionally document the three emission shapes as the
  pin's contract, or derive the tag set from a single emission helper.

## Coverage and verification

- Read `cdd/rules.md` (loop law, incl. rule 2b and mechanical-change rules) and
  `skills/cdd-code-review/SKILL.md` (smell baseline, quoted verbatim in step 3).
- Read the full `git diff dcda8d4` (29 tracked paths) and the untracked change folder, ADR-0012,
  and the three new acceptance tests.
- Confirmed the `// Checks:` line (scripts/spec-drift.mjs:18) is set-equal to the tags the script
  emits (trace-backed: A0 A1 A2 G H L1 L2 L3 L4 L4-skip M O).
- Confirmed no banned corpus-routing pattern remains in comments on the scanned surface
  (index.ts, lib/, scripts/, .githooks) — grep returned no matches.
- Smell baseline: no new instances of the twelve Fowler smells in the diff; the hand-rolled
  comment scanner in comment-law.test.js is the enforcement mechanism the ADR chose, not
  speculative generality, and the per-file `check`/`assert` helpers follow the repo's established
  test convention.
- ADR-governed files: the sweep edits files under ADR-0012's `code:` globs only in the way the
  ADR sanctions (comment-only, shape-only); the proposal's Decisions-followed section cites
  ADR-0012, satisfying A1.
- Not run (read-only review): `npm test`, the guard, or the new acceptance pins; mechanical
  green claims in tasks.md were consumed as supplied evidence, not reproduced.
