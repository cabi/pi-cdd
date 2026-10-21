---
status: accepted
code: lib/loop-law.mjs, cdd/rules.md, skills/cdd-spec-review/SKILL.md, skills/cdd-code-review/SKILL.md, skills/cdd-adr-review/SKILL.md
---
# Make reviewer independence loop law (rule 2b)

Reviewer independence — **the reviewer is not the author of the artifacts
under review** — lived only as guidance inside the three bundled review
skills (`cdd-spec-review`, `cdd-code-review`, `cdd-adr-review`): a cold
sub-agent preferred, a same-session re-read as a weaker fallback. Guidance
in a skill can be skipped, paraphrased away, or silently rot; and the
principle is a property of the loop, not of any one skill. This decision
moves it into the law: rule 2b of `cdd/rules.md`, single-sourced in
`lib/loop-law.mjs` per ADR-0009 alongside rules 2/2a.

**Decision.** Loop law rule 2b states the requirement: every model-run
review runs as a cold sub-agent session — a fresh session briefed only
from paths on disk (charter plus artifact paths, never curated content);
a same-session re-read is the lawful but weaker fallback and records its
form and justification in the findings file header. The three skills cite
rule 2b and carry only the procedure; the findings grammar
(`FINDINGS_GRAMMAR.reviewerForms`) names both forms so findings headers
declare which one produced them.

**Why.** Alternatives considered: skills-only guidance (status quo —
three restatements that drift independently, and nothing obliges a loop
agent who never loads a skill); validator enforcement (rejected: coldness
is not machine-checkable — a validator cannot distinguish a cold
sub-agent transcript from a same-session re-read, and gate authority
stays with the deterministic validators per ADR-0008); the hard-ban
alternative, banning any non-cold review outright (rejected: environments
without a sub-agent mechanism need a lawful escape hatch, and the actual
failure mode is the *unrecorded* fallback — recording the form and its
justification in the findings header makes every fallback visible and
auditable instead of forbidden and hidden).

**Consequences.** Rule 2b joins the byte-pinned law text; changing the
independence contract now takes a change to the law, not a skill edit.
The skills' procedural text (how to spawn, what to paste, how to record)
stays procedural and may evolve without an ADR, as long as it cites rule
2b and does not restate it. Findings headers declare the reviewer form;
a fallback review carries its justification, so a reader can weigh it
accordingly. Drafted `status: draft` for the human sponsor to resolve at
Close.

Resolved accepted by the human sponsor on 2026-10-21: reviewer
independence is the permanent contract of the loop — a cold sub-agent
reviewer by default, the recorded same-session fallback; a later change
wanting same-session reviews as the default must supersede this ADR.

Reconfirmed by acceptance-wiring on 2026-10-21: every review in this
change — R1 proposal mode, R2 package mode, and both R3 axes — ran as a
fresh cold sub-agent session; rule 2b is unchanged and followed.
