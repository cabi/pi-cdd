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
