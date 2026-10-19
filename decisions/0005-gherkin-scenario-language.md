---
status: superseded (format rulings) by 0006-feature-block-consolidation.md — parser-arbiter, subset, and door-1 phrasing verdicts stand
code: lib/gherkin.mjs, lib/validate.mjs, lib/templates.mjs, lib/instructions.mjs, scripts/spec-drift.mjs
---
# Gherkin is the scenario language; the official parser is the arbiter

Every scenario body in a delta and in a living spec is a fenced ` ```gherkin `
block containing one complete `Scenario:` (or `Scenario Outline:` with an
`Examples:` table) definition. The `Verified by:` pin stays markdown, outside
the fence. A spec is finished only when the official `@cucumber/gherkin`
parser accepts every fence and the cdd ruleset layer passes — at
`cdd validate` (draft and strict), at archive, and at door 3.

**Subset.** Allowed: `Scenario`, `Scenario Outline` + `Examples`, data tables,
`Given/When/Then/And/But`, English keywords. Rejected post-parse:
`Background` (scenarios must be self-contained — each carries its own pin),
`Rule` (the `### Requirement:` heading already plays that role), tags,
localized keywords. The scenario name inside the fence must equal the
`#### Scenario:` heading — drift between them fails validation.

**Ruleset beyond the grammar.** Exactly one `When` per scenario (one behavior
per scenario is existing law; multiple `When`s is the two-behaviors smell),
at least one `Then`, `Given` optional, `And/But` continuation-only. Scenario
names unique within a requirement. Parse errors are reported against the
markdown file's line numbers with the scenario named, never against a
synthetic buffer.

**Declarative style is law, door-1 enforced.** Scenarios describe observable
behavior and outcomes — the value delivered — not interaction mechanics
(keystrokes, widgets, selectors); imperative step prose is a review finding
raised by human or agent judgment. Deliberately not machine-checked: no
style lexicon, no step-count heuristics — such checks are not stably
implementable, and a false positive on a hard gate would block a
semantically perfect spec. Rule 4's quantification law is unchanged and
scans the full scenario text including the Gherkin steps.

**Doors and packaging.** Door 2 (pre-commit) stays zero-dependency and
structural — ADR-0001 holds there untouched. Door 3 re-lints all fences and
therefore requires `@cucumber/gherkin` as a documented devDependency in the
adopting project, failing loudly with the exact install command when absent.
This amends ADR-0001's "every verification door" clause for door 3 only: the
choice is one devDependency line in a project that runs CI versus vendored
parser copies rotting silently in every store. The extension itself ships
the parser for its own validate gate. pi installs extensions as bare git
clones and never runs npm install (verified: the managed clone under
`~/.pi/agent/git/` carries no `node_modules`), so the extension vendors
`@cucumber/gherkin` 42.0.1 at `vendor/@cucumber/` — one copy on the
extension's own release channel, updated like any other change. This is not
the rejected per-store vendoring: consumer stores keep their npm
devDependency, the extension tree carries its parser for `cdd validate`.

**Rejected alternatives.** `gherkin-lint` as arbiter (community tool, stale
since 2023, six transitive deps, rides an old parser generation); vendoring
the parser dist into every consumer store (we would become the update
channel for a grammar we do not own); native `.feature` files as the spec
source (Gherkin has no delta semantics — ADDED/MODIFIED/REMOVED and pins
would be rewritten into tags and comments, a rewrite of the store engine);
Given/When/Then prose without a parse gate (self-certification — the
arbiter must be code we did not write); a grace period or per-store format
flag (the validator would carry two formats forever). Breaking change,
hard switch at v0.3.0.
