---
status: accepted
code: lib/gherkin.mjs, lib/validate.mjs, lib/templates.mjs, lib/instructions.mjs, scripts/spec-drift.mjs
---
# One Feature document per requirement; pins are comments inside the fence

Supersedes the format rulings of 0005 (per-scenario fences, scenario-name
equality with the `#### Scenario:` markdown heading, the pin as markdown
outside the fence, and 0005's allowance of `Scenario Outline` + `Examples` +
data tables). 0005's standing verdicts are untouched: the official
`@cucumber/gherkin` parser is the arbiter, parse errors report against the
markdown file's line numbers, no `Background`/`Rule`/tags/localized
keywords, and declarative phrasing stays door-1 judgment — never a machine
check.

**The format.** Each requirement carries exactly one ` ```gherkin ` fence,
placed after its markdown prose. The fence holds one complete Gherkin
document:

    Feature: <name — must equal the ### Requirement: heading>

    Scenario: <name>
      Given <exact starting state>
      When <one trigger>
      Then <exactly observable outcome>
      # Verified by: tests/acceptance/<path>

`#### Scenario:` markdown headings are gone — the `Scenario:` line inside
the fence is the single source of the name. Requirement prose (the
SHALL/MUST law, ≤500 chars) stays markdown; `Feature:` is a name-only echo,
and Feature-description lines inside the fence are rejected: the fence is an
executable document, prose lives around it.

**Why the pin moved inside.** 0005 kept the pin outside because a bare
`Verified by:` prose line inside a fence is parser territory and ambiguous.
A `#` comment is neither: valid Gherkin, unambiguous, invisible to the step
machinery. The reason for the old rule dissolves, and each scenario becomes
one self-contained unit — name, steps, and proof in a single block — while
the markdown scaffolding around it collapses to nothing.

**Strict comment law.** The only legal comment inside a fence is the
scenario's trailing `# Verified by: <path>` line. Any other `#` line is an
error. This is parse-level structure, not style: a tolerated comment could
silently comment out a step (`# Given …`) and drift the scenario. Exactly
one pin per scenario, positioned after that scenario's steps.

**Subset narrows.** `Feature` joins `{Scenario, Given, When, Then, And,
But}`. `Scenario Outline` + `Examples`, data tables, and doc strings —
allowed by 0005 — are now rejected. Deliberate narrowing: structural
sharing now comes from the Feature document itself, and outline machinery
was unused while widening the drift surface. Per-scenario law is unchanged:
exactly one `When`, at least one `Then`, `And`/`But` continuation-only,
names unique within the requirement.

**Formatting is convention, not law.** The canonical shape indents steps two
spaces and separates scenarios with blank lines; the validator is
whitespace-indifferent (ADR-0005's no-style-machine-checks ruling applied to
a new axis).

**Consequences.** Door 3 (`spec-drift.mjs`) and `cdd validate` rework in the
same change that flips the format; the living-spec migration is that
change's own MODIFIED delta. Archives are immutable history: old-format
archives stay exactly as written; only living specs and new changes speak
the current format.

- Reconfirmed by adr-dir-migration on 2026-10-22: the only glob file this change touches is lib/gherkin.mjs, and only a path comment there — a reference now points at the one decisions home, cdd/decisions/. The parser-arbiter, subset, and door-1 phrasing law is unchanged.

- Reconfirmed by design-docs on 2026-10-23: lib/templates.mjs grows designTemplate beside the existing artifact scaffolds and the tasks skeleton's design-gate line gains the design.md shape clause; the scaffold-block format and every existing scaffold are unchanged.

- Reconfirmed by r3-findings on 2026-10-23: the per-axis R3 rule lands inside the existing artifact blocks — tasksTemplate's Close items, the two brief templates, and the cdd-code-review charter — and proposalTemplate's new Capabilities section joins its existing scaffold block; no scaffold surface is split out.

- Reconfirmed by law-guard-fixes on 2026-10-23: lib/templates.mjs changes only inside the RULES_MD law block — rule 3 now renders from lawRule3() stating the 1-5 observable-criteria contract — and every scaffold block (feature/proposal/delta/tasks/design/briefs) is untouched.

- Reconfirmed by guard-glob-fix on 2026-10-23: scripts/spec-drift.mjs changed (globToRe fix plus a new memory-claim check with an under-correction exemption), but the decision holds: every requirement still carries exactly one Feature block, pins stay inside the gherkin fence as the only comment line, and the two new requirements (glob compilation contract, memory-claim law) follow the same one-doc-per-requirement shape with their own acceptance pins.

- Reconfirmed by comments-are-shape-only on 2026-10-23: lib/gherkin.mjs, lib/validate.mjs, lib/templates.mjs, scripts/spec-drift.mjs comments swept; the format rulings unchanged.

- Reconfirmed by backlog-revalidate on 2026-10-23: lib/templates.mjs changes only rule 13's literal text inside RULES_MD (the op's actions named non-enumeratively); no new feature block, every requirement keeps exactly one.

- Reconfirmed by gitlab-ci-parity on 2026-10-23: lib/templates.mjs changes only the CI_GITLAB scaffold string; no feature-block format touched, and the new requirement lands as exactly one Feature block with its own acceptance pin.

- Reconfirmed by adr-ops on 2026-10-24: the glob matcher and ADR-index construction moved verbatim from scripts/spec-drift.mjs to scripts/adr-index.mjs (one shared source for the guard and the new ops); the corpus-format verdicts — one Feature block per requirement, pins as the only comment inside the fence — are untouched, and the new requirements follow the same shape.
