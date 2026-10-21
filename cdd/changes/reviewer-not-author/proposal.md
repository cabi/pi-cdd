# reviewer-not-author

## Why

The loop's model-run reviews exist to catch what the author cannot see — the car/garden/rocket mismatch, the scope creep, the drift. Yet the law that governs them (rule 2a) says everything about what a review produces (advisory findings, severities, dispositions, never verdicts) and nothing about who runs it. The reviewer-independence principle — "the reviewer is not the author of the artifacts under review" — lives only as procedural guidance inside the bundled skills (`cdd-spec-review` step 2 "Run cold", `cdd-adr-review` step 2, `cdd-code-review` implicitly via parallel sub-agents, no fallback path at all). Guidance is skippable: an author in a hurry can re-read their own artifacts in-session, mark nothing, and the loop has no vocabulary even to notice. A principle the loop depends on for its checks-and-balances belongs in the law, single-sourced per ADR-0009, with the skills carrying only the procedure.

## What Changes

- New loop-law rule **2b — reviewer independence**: every model-run review (R1, R2, R3, ADR) is run by a reviewer that is not the author — a cold sub-agent session. A same-session re-read fallback is lawful but weaker and MUST record the fallback and its justification in the findings file header. The rule is rendered from `lib/loop-law.mjs` (new `REVIEWER_INDEPENDENCE` fact family + `lawRule2b()` renderer), composed into `RULES_MD`, byte-mirrored into `cdd/rules.md` (RW5/SSL3), and the reviewer forms join `FINDINGS_GRAMMAR`.
- Statement surfaces derive from the module: `PROPOSAL_INSTRUCTION` and `TASKS_INSTRUCTION` interpolate the normative independence phrases; the ambient block and the `/cdd-help` review tip render a compact phrase pinned to the normative one.
- The three bundled skills align to "law carries the requirement, skills carry the procedure": each upgrades its cold-review guidance to a normative statement citing rule 2b, keeps the spawn procedure (fresh session, brief = charter + paths from disk, never curated content), and specifies how a justified fallback is recorded in the findings header. `cdd-code-review` gains the independence statement and fallback path it never had. Findings-grammar headers in the skills name the reviewer form and require justification when not cold.
- Living spec (gherkin capability): ADDED requirement "Reviews run cold" (law rule 2b + skills alignment + fallback recording, pinned by a new acceptance test) and ADDED requirement "Reviewer-independence ADR is drafted" (ADR-0010 pattern-matched to the 0008/0009 ADR requirements).
- New acceptance test `tests/acceptance/reviewer-independence.test.js`, authored RED before implementation.
- ADR-0010 (draft, human resolves at Close) records the four-criterion judgement; ADR-0008 and ADR-0009 carry A2 reconfirm notes in the feature commit (this change edits files under their `code:` globs: `lib/loop-law.mjs`, `lib/templates.mjs`, `lib/instructions.mjs`, `lib/context.mjs`, `lib/help.mjs`).

Follows ADR-0008 (reviews stay advisory findings; independence changes who reviews, not what reviews produce) and ADR-0009 (the new fact family extends the single canonical law module; no surface restates it).

## Capabilities

- gherkin — one delta `specs/gherkin/spec.md`: ADDED "Reviews run cold", ADDED "Reviewer-independence ADR is drafted". No MODIFIED requirements: rule 2a's content, triggers, skills, modes, findings paths are untouched; RW/SSL pins hold as-is.

## Solutions Considered

- law-module: `lib/loop-law.mjs` + `lawRule2b()` (ADR-0009 mechanism). Covers exactly this need — one canonical fact family, every surface derives, tests pin surface-to-module equality. Adopted unchanged in mechanism; this change is its first extension since ADR-0009 shipped.
- skills-only guidance: the status quo — "Run cold" prose in each skill. Covers procedure but not contract: guidance drifts per-file, cold agents may skip it, and the loop law cannot see reviewer identity at all. Rejected: a principle the loop's checks depend on is law, not preference.
- validator enforcement: teach `cdd validate` to check the findings header's reviewer form. Covers the recording mechanically, but a header is author-written — provenance checking is forgeable ceremony, not independence. Rejected for this change (door-1 law + visible recording instead); also a Non-Goal so it is not an implied future promise.
- hard ban on fallback: law requires cold, period; no same-session form. Covers maximal independence but breaks the honest degradation path — a runner without a sub-agent mechanism (human solo, constrained harness) would face law it cannot satisfy, inviting quiet non-compliance. Rejected: the lawful-but-weaker fallback with recorded justification keeps the law satisfiable and the deviation visible.

## Non-Goals

- No change to review points themselves: triggers, skills, modes, findings paths of R1/R2/R3/ADR stay exactly as rule 2a states them.
- No machine-checking of reviewer independence (no validator/guard change; see Solutions Considered).
- No model-family requirement in law: family diversity stays strengthening guidance in skill procedure; a same-family cold reviewer is lawfully cold.
- README review-points row unchanged (pointer form per ADR-0009; independence is law content, not a trigger; SSL7 bans restating law detail in the row).
- No charter changes to the review skills beyond the independence statement and fallback recording — the smell baseline, axes, and mode charters stay as they are.

Done-When: the loop law states reviewer independence as rule 2b rendered from `lib/loop-law.mjs` (principle, cold form, fallback form, recording requirement), `RULES_MD` composes it, and `cdd/rules.md` carries the rule 2b slice byte-identical to the module's rendering (whole-file identity stays pinned by tests/acceptance/single-source-law.test.js) — pinned by tests/acceptance/reviewer-independence.test.js
Done-When: every statement surface carries the independence fact from the module — the proposal and tasks instructions, the ambient block, and the help review tip — with compact phrases pinned to the normative ones — pinned by tests/acceptance/reviewer-independence.test.js
Done-When: each of the three bundled skills states the independence requirement as law citing rule 2b and carries only the procedure, including how a justified fallback is recorded in the findings file header — pinned by tests/acceptance/reviewer-independence.test.js
Done-When: the deterministic gates are green — npm test exits 0 and node scripts/spec-drift.mjs full scan exits 0
Done-When: cdd/decisions/0010-*.md records the reviewer-independence decision (draft status for the human sponsor to resolve at Close) and ADR-0008/0009 carry reconfirm notes — pinned by tests/acceptance/reviewer-independence.test.js
Code: lib/loop-law.mjs, lib/templates.mjs, lib/instructions.mjs, lib/context.mjs, lib/help.mjs, cdd/rules.md, skills/cdd-spec-review/SKILL.md, skills/cdd-code-review/SKILL.md, skills/cdd-adr-review/SKILL.md, cdd/decisions/0010-*.md, cdd/decisions/0008-*.md, cdd/decisions/0009-*.md, tests/acceptance/reviewer-independence.test.js
