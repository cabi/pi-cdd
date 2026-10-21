---
status: accepted
code: lib/loop-law.mjs, lib/templates.mjs, lib/instructions.mjs, lib/context.mjs, lib/help.mjs, README.md
---
# Single-source the loop law in lib/loop-law.mjs

The loop law — the review-point facts (R1/R2/R3/ADR triggers, skills, modes,
findings paths) and the findings grammar — was stated in five places:
`lib/templates.mjs` (RULES_MD, mirrored byte-exact to `cdd/rules.md`),
`lib/instructions.mjs`, `lib/context.mjs` (ambient), `lib/help.mjs`, and
`README.md`. One surface drifted once already (the ambient paraphrase said
"when" where the law says "if", and dropped the R2 "always"); a task brief
even misattributed the source of truth. This decision rules the mechanism:
**the facts live in exactly one module, `lib/loop-law.mjs`; every other
surface renders from it.**

**Why.** A law restated by hand in N places is N laws. The mirror precedent
(templates renders `cdd/rules.md` byte-exact, pinned by RW5) solved only the
store-copy pair, not the fan-out. Alternatives considered: a generator that
emits every surface from one template file (rejected: adds a build step and
generated-file churn for a six-line set of facts, and the byte-identical
law prose cannot be re-wrapped without changing `cdd/rules.md`); pointer-only
everywhere (rejected for lib surfaces: the scaffold instructions, ambient
block, and help tip must carry the actual trigger phrases because the agent
reads them without opening other files). The module keeps the law prose
(rules 2/2a) as canonical text — byte-identical to the store copy — plus the
machine-readable facts (`REVIEW_POINTS`, `FINDINGS_GRAMMAR`) that every
derived surface interpolates; tests pin prose and facts to each other
(single-source-law SSL1–SSL3, review-wiring RW1/RW2).

**Shipping.** `lib/loop-law.mjs` exports the facts and renderers
(`lawRule2`, `lawRule2a`, `ambientReviewPoints`, `helpReviewTip`);
`templates.mjs` composes RULES_MD from the module's rule fragments (RW5
keeps the `cdd/rules.md` mirror byte-exact); `instructions.mjs`
interpolates the R1/R2/R3/ADR facts into the proposal and tasks
instructions; `context.mjs` renders the ambient review-points sentence from
`ambientReviewPoints()`; `help.mjs` renders its reviews tip from
`helpReviewTip()`; README's driving-table row becomes pointer-only — it
names the canonical triggers and points at rule 2a of `cdd/rules.md`
instead of restating skills, modes, and findings paths. The module's data
exports — `LOOP_CHAIN`, `REVIEW_POINTS`, `FINDINGS_GRAMMAR`, `reviewPoint()` —
are the guarded surface; every derived statement names them.

**Consequences.** What becomes harder: a new statement surface must be wired
to `lib/loop-law.mjs` instead of pasting prose (an unwired surface fails the
acceptance pins, by design); every edit to the law prose must keep the
fragments byte-identical to `cdd/rules.md` — including its historical line
wraps — or RW5 breaks; and the module is now a shared dependency of five
surfaces (templates, instructions, context, help, tests), so renaming an
export is no longer local.

Reconfirmed by reviewer-not-author on 2026-10-21: rule 2b joins rules 2/2a
as canonical text in lib/loop-law.mjs, byte-pinned to cdd/rules.md like the
rest of the law; the reviewer-independence facts (REVIEWER_INDEPENDENCE,
FINDINGS_GRAMMAR.reviewerForms) extend the module this ADR rules
single-source, and the three skills cite the law without restating it.
