---
status: accepted
code: lib/templates.mjs, cdd/rules.md, tests/acceptance/loop-law-hardening.test.js
---
# Make tick re-verification and real-door pins loop law (rules 11a, 7)

Two Close-phase blind spots surfaced by the 20261021 changes lived only in
convention. First, ticks in `tasks.md` were treated as history: a review
finding (or a door refusal) that invalidated a ticked artifact left the tick
standing, so a reader could not tell what had been re-checked. Second,
acceptance pins for door behavior could pass without touching the door: the
H1/H2 pins in 20261021-runner-ergonomics stayed green through a module-scope
ReferenceError because they exercised copied fragments — only S15, which
invoked the real door (a store-refresh run compared byte-for-byte), caught
the breakage. Both are properties of the loop, not of any skill, and both
cost real debugging time when violated.

**Decision.** Loop law rule 11a states: ticks are claims, not history — a
Close-phase review finding that invalidates a ticked artifact voids the
tick; the author un-ticks, edits, re-runs the item's verify-by, and records
the re-tick inline as `re-verified after <review point>`. A door refusing
the change at Close — a validator or guard failure — voids affected ticks
the same way. Re-editing a ticked artifact without recording the re-tick is
a blocker at archive. The test-first rule (rule 7) gains: acceptance pins
for door behavior invoke the real door entry point — a real module import
or a child-process run — never a copied fragment; a sandbox-only pin is a
note-level finding at R3.

**Why.** Alternatives considered: skills-only guidance (rejected for the
same reason ADR-0010 rejected it — guidance drifts, is paraphrased away,
and never binds a runner who never loads the skill); tasks-scaffold
enforcement of the re-tick record (rejected: the duty triggers on review
findings and door refusals, which a scaffold template cannot see; the
record belongs inline next to the tick it re-validates); for pin-realism,
allowing fragment pins with a warning (rejected: the incident showed
fragments stay green through exactly the failures they exist to catch);
and validator-only enforcement of pin realism (rejected as the sole
mechanism — a validator can require a spawn/import token, but judging
whether a pin would fail on regression is the reviewer's job; hence the
R3 note-level finding rather than a machine gate).

**Consequences.** Rule 11a joins the byte-pinned literal law text in
`lib/templates.mjs` and its `cdd/rules.md` mirror; changing either duty now
takes a change to the law, not a task-hygiene edit. Re-ticks cost a real
re-verification at Close — that is the point: the tick becomes a claim a
reader can trust. Real-door pins fail more often than fragments (any
module-level breakage surfaces); that fragility is the signal. Loop-law-
hardening dogfooded rule 11a twice before it became law. Drafted
`status: accepted` for the human sponsor to resolve at Close.

**Resolved.** Accepted 2026-10-22 by the human sponsor at Close of
loop-law-hardening: rules 11a and 7 ship with this change; the re-tick
duty was dogfooded twice during the change itself.

- Reconfirmed by backlog-op on 2026-10-22: this change edits lib/templates.mjs and the regenerated cdd/rules.md mirror; every tick in tasks.md carries a run record naming a real door, and the new pins hit real doors — the backlog scenarios round-trip the actual tool dispatch (BO1–BO12, tools T3) and the not-gated boundary runs the real drift guard inside a sandbox git repo (BO11).

- Reconfirmed by adr-dir-migration on 2026-10-22: cdd/rules.md changes only by deliberate mirror regeneration from RULES_MD after the rule 2a sentence edit (initStore does not rewrite an existing store's rules.md; identity pinned by the single-source-law suite). Ticks-still-claims and pins-hit-real-doors are untouched.

- Reconfirmed by design-docs on 2026-10-23: rule 2c joins the law text and cdd/rules.md moves only by the deliberate RULES_MD mirror regeneration; byte-identity now double-pinned (single-source-law suite plus tests/acceptance/design-docs.test.js DD9, with DD8 pinning 2c's rendered position between 2b and rule 3). Ticks-still-claims and pins-hit-real-doors are untouched.

- Reconfirmed by r3-findings on 2026-10-23: cdd/rules.md changed only as the byte-identical render of the single source, every tick in this change maps to an observable verify line, and the pins hit real doors — the R3 cold review found the red suite the runner's green claim had papered over.

- Reconfirmed by law-guard-fixes on 2026-10-23: cdd/rules.md changed only as the byte-identical render of the single source, every Close tick cites an exact command and tail, and the new pins hit real doors — LDW4 drives the real validateChange door on a scratch change, the guard pin drives the real spec-drift child process in a sandbox repo.

- Reconfirmed by skill-layout on 2026-10-23: the brief-path pins in loop-law-hardening.test.js moved with the files into assets/ and still read the real briefs from disk; the S33 growth was red-first honest — it failed on the loose brief pre-move exactly as claimed before going green, and every Close tick cites an exact command.

- Reconfirmed by comments-are-shape-only on 2026-10-23: lib/templates.mjs and tests/acceptance/loop-law-hardening.test.js comments swept; every tick still cites an exact command.

- Reconfirmed by backlog-revalidate on 2026-10-23: every new tick cites an exact command (task 4.4 records the green evidence) and the new pins drive the real door; rule 11 text unchanged.

- Reconfirmed by gitlab-ci-parity on 2026-10-23: every tick in tasks.md cites its evidence (RED shown before green, green tails recorded); the new pin hits the real render and the real disk copy, mutation-verified by the R3 spec reviewer.

- Reconfirmed by adr-ops on 2026-10-24: lib/templates.mjs changes only the DOOR_SCRIPTS list — the RULES_MD law block is byte-untouched; every tick in this change keeps its exact verify-by command and the new pins drive real doors (RED evidence recorded before green).
