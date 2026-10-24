# R2 package review — director-skill

**Reviewer form:** cold sub-agent (fresh session, briefed only from the paths the brief names on disk).
**Reviewer model family:** opencode-zen (deepseek-v4.1-flash) — from runtime `PI_PROVIDER=opencode-zen`, `PI_MODEL=deepseek-v4.1-flash`, thinking high.
**Author model family:** zai (glm-5.3) per the brief. Families differ — rule 2b (cdd/rules.md:34) satisfied.
**Working-tree form:** branch `director-skill`, base `443f425` (HEAD == 443f425), change uncommitted; `git status --short` shows only `?? cdd/changes/director-skill/` — the whole change directory is untracked. No `design.md`: the design gate answered T1–T5 all NO and recorded the skip record, chosen shape, and C4 level N/A at cdd/changes/director-skill/tasks.md:65-67, consistent with rule 2c (cdd/rules.md:45).

**Draft-green premise confirmed:** `validateChange(cwd,'director-skill','draft')` passes; `strict` fails with exactly 5 errors, all `unchecked task` for 3.1–3.5 (cdd/changes/director-skill/tasks.md:70-74). `node cdd/scripts/spec-drift.mjs` → `spec-drift: clean (5 specs, 30 acceptance test files, full scan)`, exit 0.

## Findings

### [should] R2-F001 — the findings harvest restates the triage rubric's living contract, against the proposal's "never restates their procedure"

- **Location:** cdd/changes/director-skill/specs/gherkin/spec.md:90 (scenario "The skill carries the director law") vs cdd/specs/gherkin/spec.md:1234-1239 (scenario "The triage skill teaches the revalidation law") and cdd/changes/director-skill/proposal.md:19.
- **Provenance:** reviewer (cold sub-agent); source: proposal.md, specs/gherkin/spec.md (delta + living), tasks.md.
- **Evidence status:** Trace-backed.
- **Trace:** The delta requires the director skill to carry "the findings harvest: mint process findings in flight through the backlog op, revalidate the ledger before every dispatch, 3 strikes forces dispositions, and watch items stay watch" (cdd/changes/director-skill/specs/gherkin/spec.md:90). The same law is already the living contract of the triage skill: cdd/specs/gherkin/spec.md:1237 ("revalidation before dispatch"), :1238 ("the three-strikes rule — an open or watch item surviving 3 revalidations unchanged is forced to a disposition"), :1239 ("revalidation never auto-closes"), prose at :1213. Meanwhile cdd/changes/director-skill/proposal.md:19 states, for the four bundled skills including cdd-backlog-triage, that the director skill "names when they fire (the milestone gate table) and never restates their procedure".
- **Expected:** the package states one rule for the triage rubric's home. Either the director skill points at cdd-backlog-triage when the harvest fires, or the proposal's no-restatement claim is narrowed.
- **Actual:** the delta's scenario requires the director skill to restate the triage rubric's revalidation and three-strikes law verbatim in effect, contradicting proposal.md:19.
- **Impact:** an implementer following the delta writes duplicate rubric prose into the director skill; the two copies can drift, and the "never restates their procedure" claim is falsified at archive.
- **Smallest safe fix:** change cdd/changes/director-skill/specs/gherkin/spec.md:90 to have the director skill name the harvest as an action it hands to the `cdd-backlog-triage` skill (cf. proposal.md:9 law point 5, which already gives the director "revalidate before dispatch, harvest findings in flight" as its own action), or narrow proposal.md:19's claim to the three review skills.

### [should] R2-F002 — task 3.2's rule-citation check is not implementable as written, and its verbatim test is line-granular

- **Location:** cdd/changes/director-skill/tasks.md:71 (and the pinned criterion cdd/changes/director-skill/proposal.md:36, delta cdd/changes/director-skill/specs/gherkin/spec.md:80-81) vs cdd/rules.md:1 and cdd/rules.md:13,34,101,107,119.
- **Provenance:** reviewer (cold sub-agent); source: tasks.md, proposal.md, specs/gherkin/spec.md, cdd/rules.md.
- **Evidence status:** Trace-backed.
- **Trace:** tasks.md:71 requires S38 to check that "every loop-law rule number cited by the skill names that obligation as a rule heading in cdd/rules.md, and no line of cdd/rules.md is restated verbatim". cdd/rules.md contains no rule headings at all — `grep -n '^#' cdd/rules.md` returns exactly one hit, cdd/rules.md:1 (`# cdd rules — the contract of this repository`); the rules are bold-titled numbered list items (cdd/rules.md:13 `2a. **Review points are advisory findings, never verdicts**`, :34 `2b. **Reviews run cold**`, :101 `9a. **No hook bypass**`, :107 `11. **Archive**`, :119 `13. **The backlog**`). The second half of the check compares line strings against law text wrapped at roughly 76 characters per line (cdd/rules.md:13-33), so a restatement re-wrapped at a different column passes the check.
- **Expected:** a check an implementer can write that would go red on a real violation — extraction rule named, obligation pinned by something checkable.
- **Actual:** "as a rule heading" names nothing present in cdd/rules.md; the verbatim half is a proxy that a re-wrapped restatement defeats.
- **Impact:** S38's consistency half either gets implemented with an invented meaning (silent scope drift between the task and the artifact) or gets dropped, leaving cdd/changes/director-skill/proposal.md:36's criterion unverified.
- **Smallest safe fix:** in tasks.md:71, spell the extraction out — collect `rule <n>` mentions from the skill's body, assert each number exists as a numbered item in cdd/rules.md, and pin the obligation by requiring a keyword from that rule's bold title (e.g. `2b` ↔ "run cold", `9a` ↔ "bypass"); replace "no line … restated verbatim" with a normalized comparison (strip whitespace/line wrapping), or state that the check is a proximity/keyword check rather than a verbatim one.

### [note] R2-F003 — Done-When 3 and 4 have no delta requirement (declared deliberate)

- **Location:** cdd/changes/director-skill/proposal.md:37-38 vs cdd/changes/director-skill/specs/gherkin/spec.md (single ADDED requirement, :62-71).
- **Provenance:** reviewer (cold sub-agent); source: proposal.md, specs/gherkin/spec.md, tasks.md.
- **Evidence status:** Trace-backed.
- **Trace:** proposal.md:37 requires `cdd validate` strict plus the drift guard, self-declaring "the loop's own universal gate, not a spec requirement; it maps to task 4.4 only"; proposal.md:38 requires the dogfood record, self-declaring "deliberately outside the spec chain". The delta's one ADDED requirement and its three scenarios (:76-101) sponsor neither; both criteria do map to tasks (cdd/changes/director-skill/tasks.md:74 for dogfood, :90 for strict+guard).
- **Expected:** every Done-When maps to ≥1 delta requirement.
- **Actual:** two of four criteria are unsponsored; both say so in their own text and carry a task and a traceability row (cdd/changes/director-skill/tasks.md:82-83).
- **Impact:** low — recorded rather than charged: nothing in the merged living spec will carry either criterion after archive, so a future reader of cdd/specs/gherkin/spec.md cannot see the loop gate or the dogfood obligation.
- **Smallest safe fix:** none required; the declarations at proposal.md:37-38 are the disclosure the checklist asks for.

### [note] R2-F004 — Done-When 1's anchor enumeration omits the findings harvest and the anti-patterns

- **Location:** cdd/changes/director-skill/proposal.md:35 vs cdd/changes/director-skill/specs/gherkin/spec.md:90,92 and cdd/changes/director-skill/tasks.md:71,73.
- **Provenance:** reviewer (cold sub-agent); source: proposal.md, specs/gherkin/spec.md, tasks.md.
- **Evidence status:** Trace-backed.
- **Trace:** proposal.md:35 names the charter anchors S38 must pin: "the 7 director-law points, the milestone gate table for M1–M4, the evidence protocol …, the pi delivery mechanics, and the mission-brief template under assets/". The delta additionally requires the findings harvest (cdd/changes/director-skill/specs/gherkin/spec.md:90) and an anti-patterns section naming six named patterns (:92), and tasks.md:71 lists both among S38's charter anchors.
- **Expected:** the Done-When criterion names every anchor the delta and the task require, so the criterion is complete.
- **Actual:** two required anchors are absent from proposal.md:35's list.
- **Impact:** low — S38 still checks them per tasks.md:71, but the proposal's completion criterion is narrower than the delta it claims to summarize.
- **Smallest safe fix:** add "the findings harvest" and "the anti-patterns section" to proposal.md:35's anchor list, or mark the list illustrative.

### [note] R2-F005 — the delta requirement's description is 518 characters against the delta template's 500-character bound

- **Location:** cdd/changes/director-skill/specs/gherkin/spec.md:64-71 vs lib/templates.mjs (delta template instruction, "at most 500 characters").
- **Provenance:** reviewer (cold sub-agent); source: specs/gherkin/spec.md, lib/templates.mjs, cdd/specs/gherkin/spec.md.
- **Evidence status:** Trace-backed.
- **Trace:** joining cdd/changes/director-skill/specs/gherkin/spec.md:64-71 with single spaces gives 518 characters (measured with the same join). The bound comes from the delta authoring template in lib/templates.mjs; `grep` finds no validator enforcement of it, and living requirement descriptions already exceed it by a wide margin (two living descriptions at 1214 and 1186 characters in cdd/specs/gherkin/spec.md).
- **Expected:** delta description within the template's stated bound.
- **Actual:** 18 characters over, unenforced.
- **Impact:** negligible in practice; noted because a reviewer stumbling on it should find it already recorded.
- **Smallest safe fix:** trim a clause (e.g. drop "for review-loop directors") or consciously waive the bound.

### [note] R2-F006 — delta scenario 1 carries no routing-clause assertion, and restates living layout law

- **Location:** cdd/changes/director-skill/specs/gherkin/spec.md:79-81 vs cdd/changes/director-skill/proposal.md:35, cdd/changes/director-skill/tasks.md:71, cdd/specs/gherkin/spec.md:1248,1260,1263, tests/smoke.mjs:799.
- **Provenance:** reviewer (cold sub-agent); source: specs/gherkin/spec.md (delta + living), proposal.md, tasks.md, tests/smoke.mjs.
- **Evidence status:** Trace-backed.
- **Trace:** proposal.md:35 and tasks.md:71 both require S38 to assert the skill description carries a "when/whenever routing clause"; delta scenario 1 (cdd/changes/director-skill/specs/gherkin/spec.md:79) asserts only frontmatter-name-matches-directory and the 20–1024 bound "scoping routing to cdd projects". The clause itself is living law for every bundled skill (cdd/specs/gherkin/spec.md:1248, scenario at :1260, checked for every `skills/<dir>` by S33 at tests/smoke.mjs:799) — so it is covered, just not by this delta. Symmetrically, the scenario's two assertions duplicate what S33 already pins for every bundled skill directory (tests/smoke.mjs:799), adding no new contract beyond the requirement's existence.
- **Expected:** the delta's loadable-skill scenario asserts what the Done-When and the task test; an ADDED requirement adds contract, not a restatement of living layout law.
- **Actual:** the routing clause lives only in the proposal/task; the scenario's assertions are the living layout requirement applied to one more directory.
- **Impact:** low-to-none — the gap is local-only (nothing goes unverified in the merged spec), so this is recorded as a coherence observation, not a coverage hole.
- **Smallest safe fix:** either add the when/whenever clause to cdd/changes/director-skill/specs/gherkin/spec.md:79, or note in the delta that the loadable-skill scenario rides the living layout requirement.

### [note] R2-F007 — "the floor model", "free rungs opportunistic", "floor-down stops the run" are undefined in the corpus

- **Location:** cdd/changes/director-skill/specs/gherkin/spec.md:98 and cdd/changes/director-skill/proposal.md:10 vs GLOSSARY.md, PRODUCT.md, docs/, skills/, cdd/rules.md.
- **Provenance:** reviewer (cold sub-agent); source: specs/gherkin/spec.md, proposal.md, repo-wide grep.
- **Evidence status:** Trace-backed.
- **Trace:** cdd/changes/director-skill/specs/gherkin/spec.md:98 requires the mission-brief template to carry "the floor model, free rungs opportunistic, and floor-down stops the run". A repo-wide grep (excluding node_modules/vendor/.git) finds these terms only in that delta line, in cdd/changes/director-skill/proposal.md:10, and once as informal narrative in an archived run (cdd/archive/20261023-law-guard-fixes/reviews/r3-spec-code-review.run1-deepseek-v4-pro.md:33, "both free rungs had 429'd"; cdd/archive/20261023-law-guard-fixes/tasks.md:35). GLOSSARY.md (70 lines), PRODUCT.md, docs/, skills/, and cdd/rules.md carry no definition of a model-routing floor, free rungs, or floor-down.
- **Expected:** a spec scenario passing reviewer constraints to be written into a bundled template names vocabulary a reader can resolve — defined in the corpus or self-explained in the scenario.
- **Actual:** the three terms have no definition anywhere on disk; the authoring task (cdd/changes/director-skill/tasks.md:73) must invent their semantics, and a future reader of the living spec inherits the same undefined terms.
- **Impact:** the mission-brief template's reviewer constraints can be authored differently from what the scenario intends without any check going red (S38's anchor check per tasks.md:71 only tests presence of anatomy anchors); a routed model can be selected against an undefined floor.
- **Smallest safe fix:** add a clause to cdd/changes/director-skill/specs/gherkin/spec.md:98 defining the terms inline (e.g. "the floor model — the cheapest model a runner may fall back to; free rungs — optional upgrades taken only when available; floor-down stops the run"), or add the terms to GLOSSARY.md in this change.

## Coverage and verification

- Inspected: cdd/changes/director-skill/proposal.md, cdd/changes/director-skill/tasks.md, cdd/changes/director-skill/specs/gherkin/spec.md (delta, ADDED-only), cdd/specs/gherkin/spec.md (living, 1358 lines — owning requirements "Reviews run cold", "Reviewer briefs live next to their skills" :790, "The backlog triage skill is bundled" :1211, "Bundled skills follow the pi skill-authoring layout" :1246), cdd/rules.md, lib/loop-law.mjs (R2 record :39-44, FINDINGS_GRAMMAR), lib/templates.mjs, lib/validate.mjs, tests/smoke.mjs (S33 :799, S34 :844, S35 :861, S36 :885, S37 :909), cdd/scripts/spec-drift.mjs, package.json, cdd/decisions/ (0001-0012 globs), GLOSSARY.md, PRODUCT.md, docs/.
- Verified with no finding raised: (1) draft-green — draft validate passes, strict fails only on the five unchecked implementation tasks; (2) coverage — all four Done-When lines appear in the traceability table (cdd/changes/director-skill/tasks.md:78-83) with task ids, and the delta's requirement maps to tasks 3.2-3.4 (:80); (3) sponsorship — no orphan requirement; the only tasks without a delta requirement are the template-mandated review/close rows (3.1, 4.1-4.3) and the two declared process criteria (4.4, 4.5 per proposal.md:37-38); (4) delta legality — one ADDED requirement, no MODIFIED/REMOVED block, name "The director skill is bundled" unique against cdd/specs/gherkin/spec.md (rule 5, cdd/rules.md:79); (5) pins — every scenario's last line is `# Verified by: tests/smoke.mjs`, which exists, is the gherkin capability's established acceptance surface (cdd/specs/gherkin/spec.md:1244, :1267), and runs first under `npm test` (package.json); (6) verify-bys runnable and fail-then-pass as written — tasks.md:71 (S38 red with skills/cdd-director/ absent, naming the missing SKILL.md), :72 (S38 naming only the missing asset), :73 (S38 green, nothing regressed); (7) guard — `node cdd/scripts/spec-drift.mjs` clean, and no accepted ADR glob covers skills/cdd-director/** or tests/smoke.mjs, so the change owes no ADR citation under the [A1] rule (ADR-0010/0012/0007 globs checked); (8) rule 2c skip record present at cdd/changes/director-skill/tasks.md:65-67 with all five answers, chosen shape, and C4 N/A.
- Not checked (out of scope per the brief): implementation, redesign, any fix. Not present on disk: cdd/changes/director-skill/design.md (none, by gate record); no implementation files under a `skills/cdd-director/` directory yet.

## Dispositions (author, after review)

Recorded by the author after this review. All findings below are `open` at review time.

- R2-F001 fixed — delta's harvest anchor rewritten (cdd/changes/director-skill/specs/gherkin/spec.md, scenario "The skill carries the director law"): the skill now names its own harvest actions (mint in flight through the backlog op, revalidate before every dispatch) and points to the cdd-backlog-triage skill as the rubric's home for dispositions and statuses instead of restating them; proposal.md's no-restatement claim stands un-narrowed.
- R2-F002 fixed — tasks.md 3.2's consistency check rewritten to an implementable form: extract `rule <n>` mentions, assert each resolves to a numbered item `^n\.` in cdd/rules.md with its obligation keyword in the bold title (2a advisory, 2b run cold, 9a bypass, 11 archive, 13 backlog), and compare whitespace-normalized fragments of 60+ characters rather than raw lines; delta scenario 1's wording matches ("no fragment … under a whitespace-normalized comparison").
- R2-F003 won't-fix — both criteria self-declare as process obligations (the loop's universal gate; the dogfood record) and map to tasks 4.4/3.5 with traceability rows; the triage-skill change set this precedent (its Done-When 3 is likewise outside the spec chain). Disclosure lives in the lines themselves.
- R2-F004 fixed — proposal.md Done-When 1's anchor list now names the findings harvest and the anti-patterns section alongside the other charter anchors.
- R2-F005 won't-fix — the 500-character bound is template guidance, not validator law (lib/validate.mjs enforces no description bound), and the living spec already carries 1214- and 1186-character descriptions; the 518-char description keeps the advises-never-enforces frame and the rule 2a citation, which a trim would cost.
- R2-F006 fixed — scenario 1 now asserts the when/whenever routing clause explicitly. The remaining overlap with the living layout requirement is accepted by precedent: the triage skill's bundled requirement asserts the same layout facts for its own directory, and a post-archive reader of the merged spec must see the director skill's contract without following S33.
- R2-F007 fixed — scenario 3 now defines the three terms inline: the floor model as the least capable model a reviewer may fall back to, free rungs taken only when available and never relied on, and floor-down halting the run for a human decision.

**Finding count:** 0 blocker, 2 should, 5 note.
