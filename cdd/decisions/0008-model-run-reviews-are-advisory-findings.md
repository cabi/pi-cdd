---
status: accepted
code: lib/templates.mjs, lib/instructions.mjs, lib/context.mjs, lib/help.mjs
---
# Model-run artifact reviews are advisory findings, never verdicts

The loop's three review points (R1 proposal review, R2 package review at
draft-green, R3 code review at Close) are run by model sessions using the
bundled skills `cdd-spec-review`, `cdd-code-review`, and `cdd-adr-review`.
This decision rules what those runs produce: a findings list where every
finding carries a severity (blocker/should/note) and a disposition
(fixed:/open/won't-fix:) — never a red or green verdict.

**Why.** A verdict from a model-run review would create a second gate
authority beside the deterministic validators and the human. Verdicts from
models are unrepeatable: the same artifact can pass one cold session and
fail the next, so a verdict gate would break the same-inputs-same-verdict
rule the loop already promises (ADR-0002's rule, restated for every door
by ADR-0007). Findings, by contrast, are cheap to verify and dispose
individually: a blocker is either fixed (the artifact changed, the
deterministic doors re-check it) or won't-fixed with a recorded reason a
human can overrule. Gate authority stays where it is checkable — `cdd
validate` draft/strict, the drift guard, and the human sponsor.

**Shipping.** Rule 2a of the loop law names the three review points, their
skills, modes, and findings paths; the tasks template scaffolds the R2
task (3.1 Change review) before the first implementation task and the
R3/ADR-review tasks in Close before archive; the proposal instruction
carries the R1 tail; the ambient block (lib/context.mjs) and the help
screen (lib/help.mjs) state the same review points with the same triggers;
README's driving-the-loop table documents them for the human. A review
disposition per finding; an open blocker stops the loop at that step until
disposed, which the scaffolded task's verify line makes checkable.

**Consequences.** A review can be wrong without breaking the loop: a
spurious blocker costs a disposition line, not a false red. Reviews
cannot force or unblock anything on their own — sponsors can ignore a
should, and validators still catch what a review missed. Loop agents must
never write "review passed" as a gate; they report findings and
dispositions, and the deterministic doors decide. Resolved accepted by the
human sponsor on 2026-10-21: advisory findings are the permanent contract;
a later door wanting verdict-shaped reviews must supersede this ADR.
Reconfirmed by single-source-law on 2026-10-21: the review points this ADR
ships now render from lib/loop-law.mjs (ADR-0009) into these same surfaces
(templates, instructions, ambient, help); the advisory-findings contract is
unchanged.

Reconfirmed by reviewer-not-author on 2026-10-21: rule 2b governs who runs
a review (a cold sub-agent, with the same-session re-read as the recorded
fallback), not what a review may decide — the advisory-findings contract
of this ADR is unchanged; findings stay advisory, never verdicts.

Reconfirmed by acceptance-wiring on 2026-10-21: this change alters what
the law names (rule 7's executor sentence), not what a review may decide —
its R1, R2, and both R3 axis findings stayed advisory throughout, disposed
by the author with recorded dispositions, never verdicts.

Reconfirmed by pin-law-rename on 2026-10-21: lib/templates.mjs
changed only its DOOR_SCRIPTS entry for the grammar-law rename; the
advisory-findings grammar and review-point wiring this ADR records are
unchanged.

Reconfirmed by runner-ergonomics on 2026-10-21: the ADR-review trigger
wording made precise (decision content fires, reconfirmations do not)
changes no finding's advisory standing — reviews stay findings with
severity and disposition, never verdicts; gate authority stays with the
deterministic doors.

Reconfirmed by loop-law-hardening on 2026-10-22: this change edits files
under this ADR's code: globs (lib/templates.mjs); the advisory-findings
contract is unchanged — findings stay advisory with severity and
disposition, never verdicts, and gate authority stays with the
deterministic validators and the human. The literal rules 11a and 7
additions it carries to that file are recorded by ADR-0011, not claimed
here.

Reconfirmed by backlog-op on 2026-10-22: this change edits files under
this ADR's code: globs (lib/templates.mjs, lib/help.mjs); the
advisory-findings contract is unchanged — R3's two cold sessions reported
findings with severity and disposition only, all disposed by the author,
and gate authority stayed with the deterministic doors (validate strict,
the drift guard, and the acceptance pins) plus the human.
