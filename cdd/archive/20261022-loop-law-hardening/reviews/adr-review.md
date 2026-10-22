# ADR review — loop-law-hardening

- Change: `loop-law-hardening`
- Review point: ADR (R3, at Close before archive)
- Reviewer form: cold sub-agent (fresh session, briefed only from paths on disk)
- Reviewer model: `deepseek-v4-pro` (provider `opencode-zen`) — family `opencode-zen`/deepseek
- Author family: `zai`/glm-5.3 (per brief). Families differ: opencode-zen/deepseek ≠ zai/glm. Proceeding.
- Pinned state: base `901e7fe`, working tree uncommitted (ADR edits present in the tree)
- Date: 2026-10-22

## Findings

### 1. should — Rules 11a (re-tick) and 7 (pin-realism) are new loop-law decisions with no ADR

> Author disposition: fixed — ADR-0011 drafted (cdd/decisions/0011-ticks-are-claims-and-pins-hit-real-doors.md): both decisions recorded, alternatives weighed, consequences stated; status draft for the human sponsor to resolve at Close; sponsored via delta requirement + task 3.10 + LLH10; ADR-0008's reconfirm reworded to scope itself to its own contract (also disposes finding 4).

The change adds two new normative law rules — rule 11a "Ticks are claims, not history" and the rule 7 pin-realism sentence — as literal `RULES_MD` text, but records no ADR for either. The amendment to ADR-0010 covers only the two rule-2b clauses (author-family, two-axes-two-sessions); ADR-0008 and ADR-0009 get Reconfirmed-by paragraphs only. Both new rules pass the four-criterion test:

- **hard to reverse** — they are law text; changing them now requires a change to the law, not a skill edit.
- **surprising without context** — a reader seeing "a tick is voided by a review finding" or "pins must invoke the real door entry point" needs the incident context (stale ticks; fragment pins staying green through a module-scope ReferenceError) to understand why.
- **a real trade-off** — re-tick adds a re-verification duty at Close; pin-realism makes pins more fragile (a real module import or child-process run can break where a copied fragment cannot).
- **crosses capability boundaries** — 11a spans review findings → tick state → archive; rule 7 spans test-first → acceptance pins → R3 review.

The proposal weighs the alternatives (proposal.md "Solutions Considered": "skills-only guidance — rejected"), but that reasoning lives in the proposal and spec delta, not in any ADR. The four-criterion test's "expensive omission" direction applies: a decision that passes all four but is unrecorded is a finding.

Evidence: `cdd/rules.md:93` (rule 11a), `cdd/rules.md:75-76` (rule 7 pin-realism), `cdd/decisions/0010-reviewer-independence-is-loop-law.md:64` (amendment covers only rule 2b), `cdd/changes/loop-law-hardening/proposal.md` (Solutions Considered).

Disposition: open.

### 2. note — "family as guidance" misstates the prior state (it was silence, not guidance)

> Author disposition: fixed — amendment reworded to "the previously unrecorded family and session-splitting weightings become law"; proposal Solutions Considered aligned; task 3.8 re-ticked.

The amendment's closing paragraph says "one weighting (family as guidance) tightens to law" (`cdd/decisions/0010-reviewer-independence-is-loop-law.md:77`), but the amendment's own text two lines earlier records "The prior silence on both is noted" (`:73`), and the proposal states ADR-0010 "itself is silent on family" and that the family question was deferred as a Non-Goal in the archived reviewer-not-author proposal. Family separation was never guidance; it was silence/deferral. The "guidance" framing slightly overstates what is being tightened and sits in mild tension with the "prior silence" note in the same section.

Evidence: `cdd/decisions/0010-reviewer-independence-is-loop-law.md:73,77`; `cdd/changes/loop-law-hardening/proposal.md` (ADR treatment bullet).

Disposition: open.

### 3. note — Amendment does not name the rejected reconfirm-only option with its reason

> Author disposition: fixed — amendment now names "Reconfirm-only — rejected:" with its reason; task 3.8 re-ticked.

The amendment states "Amend rather than supersede" and gives the reason (core decision stands, one weighting tightens), but does not name the third instrument — reconfirm-only — or why it was rejected. The proposal's Solutions Considered does weigh it ("Reconfirm-only — rejected: ADR-0010's body is silent on both … law tightening while the ADR stays silent would be the silent contradiction the ADR review exists to catch"), but that reasoning is not carried into the ADR record itself. The "prior silence" note gestures at it without naming the option. Minor form gap against the "options are actually weighed" criterion.

Evidence: `cdd/decisions/0010-reviewer-independence-is-loop-law.md:75-79`; `cdd/changes/loop-law-hardening/proposal.md` (Solutions Considered, ADR instrument bullet).

Disposition: open.

### 4. note — ADR-0008 reconfirm overstates its scope ("the law text this ADR governs")

> Author disposition: fixed — 0008 reconfirm now scoped to its own advisory-findings contract; rules 11a/7 attributed to ADR-0011; task 3.8 re-ticked.

The ADR-0008 reconfirm says "the literal rules 11a and 7 additions extend the law text this ADR governs" (`cdd/decisions/0008-model-run-reviews-are-advisory-findings.md:69-71`). ADR-0008's decision content is the advisory-findings contract, not all law text living in `lib/templates.mjs`. Rules 11a and 7 are about tick discipline and pin authoring, not about what reviews may decide. The phrasing is a symptom of the gap in finding 1: because 11a and 7 have no ADR of their own, the reconfirm reaches to claim them under ADR-0008's "law text" umbrella, which is not what ADR-0008 decided.

Evidence: `cdd/decisions/0008-model-run-reviews-are-advisory-findings.md:69-71`; `cdd/decisions/0008-model-run-reviews-are-advisory-findings.md` (code glob `lib/templates.mjs, lib/instructions.mjs, lib/context.mjs, lib/help.mjs`).

Disposition: open.

### 5. note — Brief-templates placement (static vs module-rendered) is a weighed architectural bet with no ADR

> Author disposition: won't-fix — conscious call recorded as a proposal Non-Goal ("No separate ADR for the briefs' static-file placement"): briefs are procedural, cite rule ids without restating law, structurally pinned by S36 + LLH6/LLH7; a later change wanting module-rendered briefs supersedes that reasoning.

The proposal records a T2 architecture bet: reviewer briefs land as static markdown next to the skills, cited by pointer, structurally pinned by smoke — explicitly NOT rendered from `lib/loop-law.mjs` (proposal.md "Solutions Considered", "briefs" bullet; tasks.md 2.1 T2). This is a real trade-off (drift risk between brief prose and law text vs. keeping the law module single-sourced) that crosses the skills/law-module/smoke-pin boundary. It is borderline whether it merits an ADR — the briefs are procedural, not law, and cite rule ids without restating law — but the decision is currently recorded only in the proposal and tasks, not in any ADR. Worth a conscious call rather than silence.

Evidence: `cdd/changes/loop-law-hardening/proposal.md` (Solutions Considered, briefs bullet); `cdd/changes/loop-law-hardening/tasks.md` (2.1 T2).

Disposition: open.

### 6. note — Amendment line-wrapping is inconsistent

> Author disposition: fixed — long line rewrapped to the file's column convention.

One line in the amendment runs far longer than the surrounding wrapped lines ("The prior silence on both is noted: this ADR's body never mentioned model family or session splitting; a runner-ergonomics reconfirm note", `cdd/decisions/0010-reviewer-independence-is-loop-law.md:73`), breaking the file's otherwise consistent ~72-column wrapping. Cosmetic only.

Evidence: `cdd/decisions/0010-reviewer-independence-is-loop-law.md:73`.

Disposition: open.

## Summary

- blocker: 0
- should: 1 (missing ADR for rules 11a and 7)
- note: 5

### Brief template friction

- The brief's Inputs section points at "`cdd/scripts/arch-extract.mjs` A0/A1/A2 rules" for the four-criterion law, but the A0/A1/A2 rules live in `cdd/scripts/spec-drift.mjs` (A0 lifecycle, A1 citation-on-touch, A2 staleness), not in `arch-extract.mjs`. `arch-extract.mjs` carries only the four-criterion test as a comment in its "Interpreted" section and "Draft ADR skeleton" block. The four-criterion law itself is `cdd/rules.md` rule 12, which the brief does name correctly. The A0/A1/A2 pointer is misattributed.
- The brief's MUST-DELIVER item 1 asks the reviewer to run the four-criterion test "both directions" but does not state the four criteria inline; they are only reachable via the (misattributed) arch-extract pointer and rule 12. A reviewer without the criteria spelled out must chase them down. Minor: the criteria could be restated in the brief for self-containment.
- The brief's Output section gives two output paths ("`cdd/changes/<change-name>/reviews/adr-review.md` … for unbatched drafts use `cdd/decisions/reviews/<date>-adr-review.md`") but does not state how the reviewer decides which applies when a change owns the ADRs; the instantiated brief resolved this by naming the change path, which is fine, but the template leaves the branch implicit.

## Follow-up review: ADR-0011 and disposition rewordings

- Reviewer form: cold sub-agent (fresh session, briefed only from paths on disk)
- Reviewer model: `deepseek-v4-pro` (provider `opencode-zen`) — family `opencode-zen`/deepseek
- Author family: `zai`/glm-5.3 (per brief). Families differ: opencode-zen/deepseek ≠ zai/glm. Proceeding.
- Pinned state: base `901e7fe`, working tree uncommitted (ADR edits present in the tree)
- Date: 2026-10-22

### Checks run (no findings)

- **Four-criterion test, both directions.** ADR-0011 passes all four: hard to reverse (rules 11a/7 are law text; changing them now takes a change to the law, not a task-hygiene edit); surprising without context (a reader needs the stale-tick and fragment-pin incident context); a real trade-off (re-ticks cost a real re-verification at Close; real-door pins fail more often than fragments); crosses capability boundaries (11a spans review findings → tick state → archive; rule 7 spans test-first → acceptance pins → R3). The omission direction is clean: every decision this change makes is recorded — family + two-sessions in the 0010 amendment, 11a + 7 in ADR-0011, the briefs' static placement disposed won't-fix as procedural (consistent with ADR-0010's own "procedural text may evolve without an ADR" reasoning), cleanup mechanical. Nothing else merits a missing ADR.
- **Form.** ADR-0011 frontmatter `status: draft` (valid); `code:` globs `lib/templates.mjs, cdd/rules.md, tests/acceptance/loop-law-hardening.test.js` all match real paths (verified on disk); title states the decision; alternatives weighed (skills-only guidance, tasks-scaffold enforcement, fragment-pins-with-warning, validator-only enforcement — each with a reason); consequences name what gets harder ("Re-ticks cost a real re-verification", "Real-door pins fail more often than fragments").
- **No silent contradiction.** ADR-0011's "note-level finding at R3" and "blocker at archive" stay inside ADR-0008's advisory-findings contract (findings, not verdicts; the archive blocker is a door-1 duty, not a new deterministic gate). Its rules 11a/7 are literal in `RULES_MD` (templates.mjs), outside `lib/loop-law.mjs`'s scope, matching ADR-0009's seam — the 0009 reconfirm states this correctly. No overlap with ADR-0010.
- **Instrument split.** Right: ADR-0011 as a new ADR for two new rules; Reconfirmed-by for 0008/0009 (files under their globs edited, decision content untouched); amendment for 0010 (core decision stands, two weightings tighten — nothing reversed).

### Findings

#### 1. should — Dangling orphan fragment left at the end of ADR-0010

The reworded amendment tail leaves a severed sentence fragment as the file's final line: `reviews as the default must supersede this ADR.` (line 83). It is the truncated tail of the "Resolved accepted" sentence at line 49 ("a later change wanting same-session reviews as the default must supersede this ADR."). The accepted ADR now ends on a dangling clause with no subject. The decision content is intact — the amendment's reasoning ends cleanly at line 82 ("to catch.") — but a law record should not end mid-sentence, and the duplicate reads as an editing accident rather than a deliberate close.

Evidence: `cdd/decisions/0010-reviewer-independence-is-loop-law.md:83` (duplicate of `:49`).

Disposition: open.

#### 2. note — "previously unrecorded … weightings become law" is accurate but slightly broad for session-splitting

The reworded tail says "the previously unrecorded family and session-splitting weightings become law" (`:78-79`). This correctly disposes the prior "family as guidance" finding — the family weighting was never guidance, and neither weighting was previously law. But "previously unrecorded" is slightly broad: the session-splitting practice *was* recorded, as precedent, in a runner-ergonomics reconfirm note — which the amendment's own "prior silence" note acknowledges two lines earlier ("a runner-ergonomics reconfirm note recorded the two-session practice as precedent, not decision content", `:73-74`). "Unrecorded" is accurate scoped to "weightings [as law]" and to "this ADR's body", but a reader could misread it as "never mentioned anywhere". Minor precision point, same class as the disposed finding 2; the reword is substantially correct.

Evidence: `cdd/decisions/0010-reviewer-independence-is-loop-law.md:78-79` vs `:73-74`.

Disposition: open.

### Brief template friction

No residual friction. The three points the prior review raised against `brief-adr.md` are all fixed in the current file: the A0/A1/A2 pointer now names `cdd/scripts/spec-drift.mjs` (not `arch-extract.mjs`), the four criteria are stated inline in MUST-DELIVER item 1, and the output-path branch is explicit ("if the brief instantiates a `<change-name>`, the change path always wins").

### Author dispositions (follow-up section)

- FU-1 (should, dangling fragment): **fixed** — the severed duplicate line at
  0010:83 deleted; the file now ends on the Reconfirm-only rejection.
- FU-2 (note, "previously unrecorded" breadth): **fixed** — now reads "the
  previously unrecorded family weighting and the session-splitting weighting
  (recorded so far only as practice precedent) become law".

Re-verified after the follow-up review: loop-law-hardening.test.js (10/10),
reviewer-independence.test.js, single-source-law.test.js all green;
ADR-0010 has no other open finding in this file.
