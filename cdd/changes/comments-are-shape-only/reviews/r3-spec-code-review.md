# R3 spec-axis code review — comments-are-shape-only

**Reviewer form:** cold sub-agent session (not the author's session).
**Reviewer model family:** opencode-zen / deepseek-v4-pro (provider `opencode-zen`).
**Author model family:** zai (glm lineage — zai/glm-5.3). Families differ — rule 2b satisfied.
**Pinned state:** branch `comments-shape`, HEAD `dcda8d4`, change in the uncommitted working tree.
**Diff:** `git diff dcda8d4` (tracked) plus reads of the untracked paths
(`cdd/changes/comments-are-shape-only/`, `cdd/decisions/0012-comments-are-shape-only.md`,
`tests/acceptance/comment-law.test.js`, `tests/acceptance/guard-header-index.test.js`,
`tests/acceptance/comment-shape-adr.test.js`).

## Charter result

All three delta capabilities are implemented and pinned: the comment-law pin
(`comment-law.test.js`) scans the real surface and proves its scanner fails and
stays string-aware; the guard-header-index pin (`guard-header-index.test.js`)
set-compares the `// Checks:` header against the emitted tags (verified
trace-backed: A0 A1 A2 G H L1 L2 L3 L4 L4-skip M O, exact match); the
comment-shape ADR pin (`comment-shape-adr.test.js`) reads ADR-0012 and runs the
guard; the adr-count delta (11→12) is pinned by `decisions-home.test.js` DH2/DH6.
No unsponsored code was found beyond two coverage observations below. Findings
are advisory; the author disposes. No verdicts.

## Findings

### [should] r3-spec-F001 — corpus-path pin under-covers the "no cdd corpus paths" ban

- **Severity:** should · **Disposition:** fixed: corpus-path class extended to `cdd\/(?:backlog|rules)\.md`, and the CL2 synthetic fixture now plants a `// see cdd/rules.md for the law` comment asserted to be caught with the path named (4-hit expectation); `cdd/scripts/` deliberately NOT banned — door-copy relationship comments (e.g. scripts/grammar-law.mjs:3,15) document the code's own copy structure, which is shape, not corpus routing; suite 28 pass / 0 fail + guard clean after the fix
- **Location:** tests/acceptance/comment-law.test.js:38 (`corpus-path` regex)
- **Evidence:** the banned-pattern regex is
  `/\bcdd\/(?:specs|changes|decisions|archive)(?![\w.-])|cdd\/backlog\.md/g` —
  it names `cdd/specs`, `cdd/changes`, `cdd/decisions`, `cdd/archive`, and
  `cdd/backlog.md`, but not `cdd/rules.md` (nor `cdd/scripts/`). The requirement
  prose bans "no cdd corpus paths" without qualification
  (specs/gherkin/spec.md ADDED "Source comments are shape-of-code documentation
  only"). The sweep itself removed a `cdd/rules.md` citation from
  lib/context.mjs:1-3 ("pointing at cdd/rules.md" → "pointing at the rules
  text"), proving the gap is real: had that citation remained, the pin would
  not have caught it and the suite would still be green.
- **Finding:** the pin's corpus-path class is narrower than the requirement's
  "no cdd corpus paths" ban. `cdd/rules.md` is the canonical corpus file, yet a
  comment citing it would pass CL1. The pin therefore does not fully pin the
  requirement it is named to enforce.
- **Expected / actual:** any cdd corpus path in a comment fails the pin; a
  `cdd/rules.md` (or `cdd/scripts/…`) citation does not.
- **Impact:** latent enforcement gap — a future comment citing `cdd/rules.md`
  would drift past the pin unaudited.
- **Smallest safe fix:** extend the corpus-path regex to cover `cdd/rules.md`
  (and any other cdd/ root corpus files), e.g. add `|cdd\/rules\.md` or a
  general `cdd\/` root-file alternative.

### [note] r3-spec-F002 — gherkin Code line omits lib/backlog.mjs, which the sweep changed

- **Severity:** note · **Disposition:** fixed: `lib/backlog.mjs` added to the EXTENSION delta's surface (prose, Given, Code line) rather than the gherkin Code line — the living spec cdd/specs/extension/spec.md:164 owns lib/backlog.mjs (backlog-op requirement), so a gherkin claim would have been the cross-capability [O] failure this change already corrected once; suite + guard green after the fix
- **Location:** cdd/changes/comments-are-shape-only/specs/gherkin/spec.md:23 (`Code:`)
- **Evidence:** the Code line enumerates
  `lib/context.mjs, lib/gherkin.mjs, lib/help.mjs, lib/instructions.mjs,
  lib/loop-law.mjs, lib/store.mjs, lib/templates.mjs, lib/validate.mjs,
  scripts/*.mjs, .githooks/*, tests/acceptance/comment-law.test.js` — it omits
  `lib/backlog.mjs`, yet the sweep changed lib/backlog.mjs:1-14 (removed
  `cdd/backlog.md` and `PF-1` citations) and lib/backlog.mjs:76. The
  requirement prose and scenario Given name the whole surface "index.ts, lib/,
  scripts/, and .githooks", so the prose sponsors the sweep, but the Code line
  under-enumerates the lib/ directory it claims.
- **Finding:** the Code line (the guard's ownership claim) does not name
  lib/backlog.mjs, so the backlog.mjs sweep hunk is unsponsored by the Code
  line even though the prose's "lib/" covers it. (lib/status-ui.ts is correctly
  claimed by the extension spec's Code line; lib/status.mjs was not swept.)
- **Expected / actual:** the Code line names every swept lib/ file; it omits
  lib/backlog.mjs.
- **Impact:** minor — the guard's ownership/topology checks under-claim
  lib/backlog.mjs for this requirement; no behavior change.
- **Smallest safe fix:** add `lib/backlog.mjs` to the gherkin Code line.

## Coverage and verification

- Read `cdd/rules.md` (loop law) and the brief's charter (three MUST-DELIVER
  items: every scenario implemented, pins actually pin, no unsponsored code).
- Read the three spec deltas (gherkin 3 ADDED, extension 1 ADDED, adr 1
  MODIFIED 11→12), `proposal.md` (Done-When + Non-Goals), `tasks.md`, ADR-0012,
  and the four acceptance pins.
- Verified the `// Checks:` header (scripts/spec-drift.mjs:18) is set-equal to
  the emitted tags (trace-backed: A0 A1 A2 G H L1 L2 L3 L4 L4-skip M O).
- Verified 12 ADRs on disk (0001–0012) and DH2/DH6 updated 11→12.
- Verified door copies byte-identical: `cmp scripts/*.mjs cdd/scripts/*.mjs`
  for arch-extract, grammar-law, spec-drift → identical.
- Verified the swept surface carries no banned corpus-routing comment (grep).
- **Working-tree note:** the tree changed during this review — the two
  Standards-axis findings (a duplicated templates.mjs header line and a stray
  `/**` in lib/store.mjs) were fixed by the author mid-review, and
  `Reconfirmed-by: comments-are-shape-only` lines were added to
  cdd/decisions/0001–0011 (A2 reconfirmation, guard-driven, not spec-delta
  content). This review reflects the state at the time each file was read.
- Not run (read-only review): `npm test`, the guard, or the acceptance pins;
  mechanical green claims in tasks.md were consumed as supplied evidence.
