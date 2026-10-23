## Spec axis

> Reconstruction note (PF-8, second occurrence): the Spec session wrote this
> section first; the parallel Standards session's write clobbered it. Rebuilt
> verbatim from the Spec reviewer's own completion report by the author —
> the reviewer's session log holds the original
> (2026-10-23T16-22-05-277Z_...a9884208-6d6c7d89-98d9.jsonl).

**Reviewer form:** cold sub-agent. **Model family:** opencode-zen/deepseek-v4-pro vs. author zai/glm-5.3 — families differ. **State:** branch `design-docs` at 28423ec, change fully uncommitted (6 modified + untracked files), reviewed via `git diff 28423ec` plus direct reads.

**Verdict:** COMPLETE — every delta scenario traced to a code hunk, no unsponsored hunks found. Four advisory findings (all `open`):

1. **[should]** `skills/cdd-spec-review/SKILL.md:23` — the proposal-mode read line still omits `design.md`, so scenario 3's "SKILL.md object lines name design.md where they list the proposal-mode and package-mode objects" is only half-implemented; pin DD18 checks only the description and package-mode lines, so it stays green through the gap.
2. **[should]** `tests/acceptance/design-docs.test.js:54-59` — pin DD2 doesn't exercise the "every other shape keeps short prose / no design.md without the trigger" clause; removing that sentence from rule 2c would leave DD2 green.
3. **[note]** Delta `Code:` lines (spec.md:37,85) name nine files the diff never touches (lib/context.mjs, lib/help.mjs, cdd/decisions/0008-*.md, review-wiring.test.js, brief-r3-*.md, brief-adr.md, smoke.mjs, loop-law-hardening.test.js).
4. **[note]** Dogfood `design.md` labels code modules (`lib/templates.mjs`, `lib/loop-law.mjs`) as "Container" while claiming Container level — a C4 level mismatch (code modules are Components).

---

# R3 code review — design-docs

## Standards axis

**Reviewer form:** cold sub-agent (fresh session, briefed only from
`brief-r3-standards-instantiated.md` and the paths it pins).
**Model family:** opencode-zen / deepseek-v4-pro (from `PI_PROVIDER` /
`PI_MODEL` in the runtime environment) — differs from the author's
zai / glm-5.3, so the rule 2b family-separation requirement is met.
**Pinned state:** branch `design-docs` at `28423ec` with the entire change
uncommitted in the working tree. Modified: `cdd/rules.md`,
`lib/loop-law.mjs`, `lib/templates.mjs`, `skills/cdd-spec-review/SKILL.md`,
`skills/cdd-spec-review/brief-r1.md`, `skills/cdd-spec-review/brief-r2.md`.
Untracked: `tests/acceptance/design-docs.test.js`,
`cdd/changes/design-docs/**`. `git log 28423ec..HEAD` is empty (HEAD ==
28423ec), so the review object is the working-tree diff `git diff 28423ec`
plus direct reads of the untracked files.

### Verification performed

- **Single-source law (ADR-0009) — byte-identity holds.** `lawRule2c()` in
  `lib/loop-law.mjs` is byte-identical to the `2c.` block in `cdd/rules.md`
  (verified by extracting both and comparing), and `RULES_MD` from
  `lib/templates.mjs` renders byte-identically to `cdd/rules.md`
  (`RULES_MD === cdd/rules.md` is `true`). Rule 2c is defined once in
  `lib/loop-law.mjs` and rendered through `RULES_MD` into the store mirror,
  exactly the mechanism ADR-0009 rules — no silent divergence.
- **ADR-governed files.** `lib/loop-law.mjs` (ADR-0009/0010) gains
  `lawRule2c()` as a new law fragment, consistent with the existing
  `lawRule2`/`lawRule2a`/`lawRule2b` pattern. `lib/templates.mjs`
  (ADR-0005/0006/0007/0008/0009/0011) gains `designTemplate()` beside the
  other artifact scaffolds and interpolates `lawRule2c()` into `RULES_MD`;
  the tasks-scaffold gate line gains the T2/T4 shape clause. `cdd/rules.md`
  (ADR-0010/0011) is the regenerated mirror. `skills/cdd-spec-review/SKILL.md`
  (ADR-0010) edits are procedural (which artifacts to read/check), and do not
  restate rule 2b — within ADR-0010's "cite, don't restate" constraint.
- **Smell baseline** (quoted from `skills/cdd-code-review/SKILL.md` step 3):
  no new instance of Mysterious Name, Duplicated Code, Feature Envy, Data
  Clumps, Primitive Obsession, Repeated Switches, Shotgun Surgery, Divergent
  Change, Speculative Generality, Message Chains, Middle Man, or Refused
  Bequest. The rule-2c text appearing in both `lib/loop-law.mjs` and
  `cdd/rules.md` is the ADR-0009 single-source mirror, not Duplicated Code
  (documented repo standard overrides the baseline). The multi-file fan-out
  is the sanctioned single-source surface set, not Shotgun Surgery.
- **Guard/validator alignment.** No validator, guard, or CI file is touched;
  the change is charter-only as the proposal states. The new acceptance test
  `tests/acceptance/design-docs.test.js` follows the repo's existing
  `check`/`assert`/`includes`/`excludes` harness (same shape as
  `single-source-law.test.js` and `review-wiring.test.js`) and exits non-zero
  on failure, so it runs as a real door under `node --test`.

### Findings

- **note** — New loop-law rule 2c and the `design.md` artifact ship without a
  dedicated ADR. The four-criterion test (rule 12; `cdd/scripts/arch-extract.mjs`
  "hard to reverse, surprising without context, a real trade-off, crosses
  capability boundaries") is resolved in the proposal's "Solutions Considered"
  and the design.md "Alternatives" section rather than a recorded decision.
  The change is charter-only (reversible) and extends the existing design gate
  within the `gherkin` capability, so the author's implicit "no ADR needed"
  claim is defensible — but it is a judgement call the human sponsor should
  confirm, since a new law rule is a contract change. Evidence:
  `cdd/changes/design-docs/proposal.md` ("Decisions followed (A1 citations)"
  lists only ADR-0006…0011 as *followed*; "Non-Goals" states "No ADR machinery
  change"), `cdd/rules.md` rule 2c.

- **note** — The operational loop-chain surfaces do not mention the new
  conditional `design.md` step. `LOOP_CHAIN` in `lib/loop-law.mjs:14-24`
  (rendered into the ambient block), the hardcoded step line in
  `lib/help.mjs:11` ("design gate → proposal → deltas (pinned) → tasks"), and
  the README driving-table row (`README.md:120`) all describe the loop without
  `design.md`. This is defensible — `design.md` is conditional on a T2/T4 YES,
  and rule 2's own loop prose omits it too — but a reader of only the
  ambient/help surfaces will not learn the artifact exists. Not a
  byte-identity divergence (the law mirror is byte-identical); a completeness
  gap in the operational paraphrase, not a hard violation.

No blockers or `should` findings. The diff conforms to the repo's documented
standards: single-sourcing (ADR-0009), reviewer independence (ADR-0010),
advisory findings (ADR-0008), and the acceptance-test harness convention are
all respected, and the law↔mirror byte-identity is intact.

## Author dispositions (R3)

Spec 1 (should, SKILL.md proposal-mode line) — **fixed**: the *proposal* read line now reads `proposal.md and design.md (when the gate produced one)`; DD18 strengthened to pin design.md on both mode lines, so the gap can't reopen silently.
Spec 2 (should, DD2 clause coverage) — **fixed**: DD2 now pins "keeps the short design note above the tick in the tasks file" (whitespace-normalized), so removing the every-other-shape clause from rule 2c fails the suite.
Spec 3 (note, delta Code: lines name untouched files) — **won't-fix: restatement semantics**: the two flagged Code: lines belong to MODIFIED requirements and restate the living spec's ownership globs verbatim (Code: routes ownership after archive, it is not a diff surface); the NEW requirements' Code: lines name only diff-touched files.
Spec 4 (note, C4 labels on code modules) — **fixed**: the two boxes relabeled as the artifact stations ("design template scaffold", "design-doc rule text") with the implementing functions as parenthetical homes; boxes stay 7 ↔ 7 boundary lines.
Standards 1 (note, no dedicated ADR) — **won't-fix: sponsor-settled**: the human sponsor pre-decided (proposal Solutions Considered carries the four-criterion resolution; charter-only enforcement, extends the existing gate) that this change mints no ADR; the ADR-review trigger law found no draft/amend to sweep.
Standards 2 (note, loop-chain paraphrase omits design.md) — **won't-fix: out of settled scope**: the operational paraphrase surfaces (LOOP_CHAIN, help, README) were deliberately outside this change's F-contract; recording as follow-up material, not a silent scope expansion mid-Close.
