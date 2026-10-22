<!--
TASKS — how to fill and work this file (verified checklist traced to Done-When)

Before writing tasks, re-read the proposal's Done-When lines. If any
criterion is not observable as written, resolve it with the user first.

Format:
- Group tracked tasks under ## numbered headings; every tracked task is a
  checkbox "- [ ] X.Y Task" and MUST end with its verification:
  "verify by <command, test, or observable check>". A task without a
  verification is a wish, not a task.
- Phrase each task as the interface it establishes ("Reporter emits a CSV
  header row"), never as an activity ("implement reporting"). Work each
  task red-green-refactor: write the failing unit test that names that
  interface, implement the smallest code that turns it green, refactor
  freely. Unit tests are engineering artifacts born during apply — they
  churn with the design and are never pinned in the spec.
- Order by dependency. Keep each task small enough to finish in one session.
- Turn the design gate's open questions into early tasks. Keep a
  "## Design Notes" section only for decisions the design gate did not cover.
- Follow the implementation steps with "## Done When Traceability": a table row per proposal criterion —
  "| <criterion> | <task ids that verify it> |". If a criterion has no task,
  add the task or fix the criterion.

Scale rule: more than 8 implementation subtasks is the split signal — run
the split procedure at the design gate; more than 12 fails strict validation.
The split: read the traceability table (it is the split map), cut into N
proposals each with its own Done-When subset and its own delta, record
"Depends on:", supersede the original (never delete it). A genuinely atomic
change that must exceed 12 records a "split-considered: kept whole because
<reason>" line in this file instead.

Apply protocol: work strictly top-to-bottom, one task at a time. Tick a box
only after its verification passes ("checked" means "its verification
passed", never "I am done looking at it"); re-read this file after each
tick. If a verification fails, uncheck and fix — never continue on a red
check. Group-local testing: each group lands the unit tests its own work
calls for; a final group runs the scenarios' acceptance tests end to end.

Review tasks: task 3.1 (Change review) runs cdd-spec-review
in package mode at draft-green — the package drafted, validate draft green,
before the first implementation task ticks — findings at reviews/r2-change-review.md.
The Close review tasks run before archive: cdd-code-review (findings
at reviews/r3-code-review.md) and, if the change drafted an ADR or amended one's decision content — a Reconfirmed-by paragraph or a typo fix does not count,
cdd-adr-review (findings at reviews/adr-review.md).
A review reports advisory findings (severity blocker/should/note + disposition), never
verdicts: it ticks only when no blocker is open, and the
deterministic validators keep gate authority. Reviews run cold (rule 2b): the reviewer is not the author of the artifacts under review — every model-run review (R2, R3, ADR) is a fresh cold sub-agent session briefed from paths on disk; a same-session re-read is the weaker fallback and records its form and justification in the findings file header.

Anti-scope-creep: no task may exist without a spec requirement or Done-When
criterion that needs it. Improvements no criterion demands go back to the
proposal as Non-Goals or a future change.
-->

# Tasks — adr-dir-migration

## 1. Context

- [ ] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

- [x] 2.1 Design gate — T1 NO (one concern: a path unification the single-source law propagates; no capability crossing), T2 NO (removes a split, places no bet), T3 NO (the sentence is already single-sourced in lib/loop-law.mjs; no new seam), T4 YES (guard topology changes — design below), T5 NO (sequential single-runner work) — verify by this line naming all five answers

Design (T4 — guard topology, the move's whole point):

- Probe evidence (staged `git mv`, full scan, nothing committed): the bare move fires exactly one issue — `[A0] cdd/decisions/0005-…md has unknown status "superseded (format rulings) by 0006-…"` — the guard's first-ever finding against a product-era ADR. Remedy rides in the move commit M itself: frontmatter `status: superseded`, the annotation preserved verbatim as a body line, so the tree is guard-green at rest from M on. Lifecycle bookkeeping, not decision content (director-blessed) → no cdd-adr-review trigger.
- A1 forecast (verified by the RED run of tests/acceptance/decisions-home.test.js): delta `Code:` ∩ ADR globs → the change docs cite ADR-0003 (lib/store.mjs, restated Code: of the declarative-style requirement — followed, not amended, no glob file edited), ADR-0006, ADR-0007 (lib/gherkin.mjs), ADR-0008 (lib/context.mjs et al., restated Code: of the loop-law requirement — followed, not amended, no glob file edited), ADR-0009 (lib/loop-law.mjs, README.md), ADR-0010 (lib/loop-law.mjs, cdd/rules.md, skills/cdd-adr-review/SKILL.md), ADR-0011 (cdd/rules.md).
- A2 forecast: the same five ADRs get Reconfirmed-by paragraphs in the feature commit F (same-commit touch = reconfirm). ADR-0001–0004 stay dormant: their globs (scripts/**, index.ts, lib/store.mjs, lib/context.ts) name files this change never touches.
- O single-owner: the new adr capability owns `cdd/decisions/000[1-7]-*.md`; gherkin's "Declarative style is door-1 law" `Code:` line drops the root-path 0007 entry (0007 becomes adr-owned — one capability per file).
- Commit shape: M = pure relocation + 0005 normalization with a `Mechanical-Change:` trailer (honest: no spec or acceptance file staged; the M-check polices exactly that, and L2 travel exempts mechanical); F = change folder + law/docs/tests + Reconfirmed-by paragraphs; A = archive pair-commit. L2 red between F and A is the designed transient (mission L2 lesson).

## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package as a cold sub-agent session (no zai family; brief instantiated from skills/cdd-spec-review/brief-r2.md at `reviews/r2-brief.md` per PF-9); findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
- [ ] 3.2 Acceptance RED (law pin) — rewrite the SSL2b check in tests/acceptance/single-source-law.test.js to pin the single-home rule 2a sentence (every ADR lives in cdd/decisions/, 0001–0007 the product decisions, 0008 and later the loop decisions, no second decisions directory), verify by node --test tests/acceptance/single-source-law.test.js failing on SSL2b while the law still names the split
- [ ] 3.3 Acceptance RED (migration pin) — create tests/acceptance/decisions-home.test.js asserting the repository root holds no decisions/ directory, cdd/decisions/ holds exactly ADRs 0001–0011 with guard-enum frontmatter statuses, git log --follow on the relocated 0001 lists at least 2 commits, live root-path decisions references survive only in the factory notes (PRODUCT.md, the 0001 body) with the archive and open change folders excluded, and the drift-guard full scan (child-process run — the real door) exits 0, verify by node --test tests/acceptance/decisions-home.test.js failing while ADRs 0001–0007 sit at the root
- [ ] 3.4 Move commit M — `git mv` the seven root ADRs into cdd/decisions/ and normalize ADR-0005's frontmatter (status `superseded`, annotation verbatim as a body line); commit with a Mechanical-Change trailer, verify by git log --follow --oneline cdd/decisions/0001-zero-dependency-node-tooling.md listing pre-move commits and node cdd/scripts/spec-drift.mjs exiting 0
- [ ] 3.5 Single-home law sentence — replace the decisions-split sentence in lib/loop-law.mjs lawRule2a with the single-home sentence and regenerate the cdd/rules.md mirror byte-identically, verify by node --test tests/acceptance/single-source-law.test.js green (SSL2b and SSL3)
- [ ] 3.6 Reference sweep — drop the README.md Layout decisions/ line, rewrite the skills/cdd-adr-review/brief-adr.md root-vs-cdd note to the one home, update the skills/cdd-adr-review/SKILL.md example refs and the lib/gherkin.mjs comment to cdd/decisions/ paths, verify by grep -rn over non-archive paths showing root decisions/ references only in the historical factory notes (decisions/0001 body, PRODUCT.md) and npm test green
- [ ] 3.7 Reconfirmed-by paragraphs — add a Reconfirmed-by paragraph to ADR-0006, ADR-0007, ADR-0009, ADR-0010, and ADR-0011 recording this change's reconfirmation (A2 remedy), verify by node cdd/scripts/spec-drift.mjs full scan exiting 0 with no A2 finding
- [ ] 3.8 Feature commit F — commit the change folder, law edit, mirror, reference sweep, acceptance tests, and Reconfirmed-by paragraphs as one conventional feature commit, verify by git log -1 --stat naming them and npm test green


## Done When Traceability

| criterion | task ids |
|---|---|
| git log --follow walks a moved ADR through the move | 3.4 |
| root decisions/ gone; cdd/decisions/ holds exactly 0001–0011 | 3.3, 3.4 |
| guard full scan green over all eleven ADRs | 3.3, 3.4, 3.7 |
| npm test green with the single-home pins | 3.2, 3.3, 3.5, 3.6 |
| only historical factory-path references remain | 3.6 |

## 4. Close

- [ ] 4.1 Change code review — run skill `cdd-code-review` over the diff since the change branched as TWO cold sub-agent sessions (rule 2b; no zai family): standards axis with its brief instantiated at `reviews/r3-standards-brief.md`, findings at `reviews/r3-standards-code-review.md`; spec axis with its brief at `reviews/r3-spec-brief.md`, findings at `reviews/r3-spec-code-review.md` (separate files per PF-8, briefs under the change folder per PF-9); dispose every blocker and record dispositions, verify by both findings files holding no open blocker
- [ ] 4.2 ADR review — this change drafts no ADR and amends no decision content: ADR-0005's status normalization is lifecycle bookkeeping (director-blessed handshake) and Reconfirmed-by paragraphs do not count (rule 2a) — the skip is recorded here at Close, verify by this line recording the skip (or reviews/adr-review.md holding no open blocker)
- [ ] 4.3 cdd validate strict green, guard green
- [ ] 4.4 Archive — pair-commit: feature commit, then archive commit
