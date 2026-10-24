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

- Reconfirmed by reviewer-not-author on 2026-10-21: rule 2b joins rules 2/2a as canonical text in lib/loop-law.mjs, byte-pinned to cdd/rules.md like the rest of the law; the reviewer-independence facts (REVIEWER_INDEPENDENCE, FINDINGS_GRAMMAR.reviewerForms) extend the module this ADR rules single-source, and the three skills cite the law without restating it.

- Reconfirmed by acceptance-wiring on 2026-10-21: the new rule 7 sentence is authored once, in lib/templates.mjs's RULES_MD, and byte-mirrored to cdd/rules.md (SSL3 byte-identity re-verified green); rule 7 stays literal text in the template, outside lib/loop-law.mjs's scope (chain, review points, grammar) exactly as this ADR draws it.

- Reconfirmed by pin-law-rename on 2026-10-21: the grammar-law module rename does not touch lib/loop-law.mjs or any loop-law template text; the single-source seam this ADR records is unchanged.

- Reconfirmed by runner-ergonomics on 2026-10-21: the reworded trigger and the decisions-split sentences render from lib/loop-law.mjs through every surface (rules text, scaffold 4.2 line, ambient block, /cdd-help); the cdd/rules.md mirror was rewritten deliberately because an existing store keeps its rules.md — single-sourcing is unchanged, not weakened.

- Reconfirmed by loop-law-hardening on 2026-10-22: the rule 2b and rule 2a additions render from lib/loop-law.mjs and the literal rules 11a and 7 from the RULES_MD template; the cdd/rules.md mirror was rewritten deliberately (an existing store keeps its rules.md) — single-sourcing is unchanged, byte-identity pinned by the same acceptance suite.

- Reconfirmed by backlog-op on 2026-10-22: the literal rule 13 renders from the RULES_MD template in lib/templates.mjs, the ops row from lib/help.mjs, and the README seven-ops lines from the same source of truth as the tool declaration; the cdd/rules.md mirror was rewritten deliberately from RULES_MD (an existing store keeps its rules.md) — single-sourcing is unchanged, byte-identity still pinned by the single-source-law suite.

- Reconfirmed by adr-dir-migration on 2026-10-22: rule 2a's decisions-directory sentence is rewritten at its single source (lib/loop-law.mjs, rendered through RULES_MD) to state the one decisions home — every ADR lives in cdd/decisions/; the README layout row states the same truth, and the cdd/rules.md mirror was rewritten deliberately from RULES_MD (byte-identity still pinned by the single-source-law suite). Single-sourcing is unchanged.

- Reconfirmed by design-docs on 2026-10-23: rule 2c is defined once in lib/loop-law.mjs (lawRule2c) and rendered into RULES_MD between rules 2b and 3; cdd/rules.md moved only by the deliberate mirror regeneration and stays byte-identical (pinned by DD8/DD9 alongside the single-source-law suite). No second statement of the rule exists — briefs and the SKILL charter cite it.

- Reconfirmed by r3-findings on 2026-10-23: the per-axis paths are defined once as findingsStandards/findingsSpec on the R3 review point in lib/loop-law.mjs and render from it into the law text, the statement surfaces, and the byte-identical cdd/rules.md mirror (pinned by the r3-findings and single-source-law suites) — no second statement of the rule exists; briefs and the SKILL charter cite it.

- Reconfirmed by law-guard-fixes on 2026-10-23: lawRule3() is defined once in lib/loop-law.mjs, renders into RULES_MD, and cdd/rules.md is written as its byte-identical mirror — pinned byte-exact by LDW2 (r3store === r3render) — no second statement of the rule exists.

- Reconfirmed by comments-are-shape-only on 2026-10-23: lib/loop-law.mjs header banners removed; the loop law stays single-sourced in cdd/rules.md.

- Reconfirmed by backlog-revalidate on 2026-10-23: rule 13's reworded sentence is authored once in RULES_MD and byte-mirrored to cdd/rules.md (an existing store keeps its rules.md — the mirror rewrite is deliberate); single-sourcing unchanged, byte-identity still pinned by the single-source suite.

- Reconfirmed by gitlab-ci-parity on 2026-10-23: CI_GITLAB grows in lib/templates.mjs only; the root .gitlab-ci.yml stays a byte-identical dogfood mirror of the render, now pinned byte-exact by GL6 — the same single-source mirror pattern as RULES_MD ↔ cdd/rules.md; no rule text duplicated.

- Reconfirmed by adr-ops on 2026-10-24: lib/templates.mjs changes only the DOOR_SCRIPTS list; the loop-law facts in lib/loop-law.mjs are untouched and this change's review-point answers (R1, R2) were read from them unchanged.
- Reconfirmed by ops-registry on 2026-10-24: the two Commands-and-tools rows now render from the single op registry like every other shared line
- Reconfirmed by 20261024-scaffold-honesty on 2026-10-24: the scaffold-pin sentence is authored once in RULES_MD; cdd/rules.md regenerated byte-identically (SSL3 + SH2 exact rule-7 block equality green) — change 20261024-scaffold-honesty
