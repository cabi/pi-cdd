# skill-layout

## Why

The five reviewer brief templates sit loose beside their SKILL.md files, off the pi skill-authoring layout convention (a skill directory may bundle `assets/`, `references/`, `scripts/` beside SKILL.md; `assets/` holds template files consumed or copied at use). A consumer following the convention looks under `assets/` and finds nothing, and the flat files do not announce their role — they are templates to instantiate, not documents to read. Nothing pins the routing signal that makes a bundled skill discoverable either: every description happens to carry a when-clause today, but no check holds it there.

## What Changes

- MOVE the five brief templates into per-skill `assets/` directories (pure renames, git history preserved via `--follow`): `brief-r3-standards.md` + `brief-r3-spec.md` → `skills/cdd-code-review/assets/`, `brief-r1.md` + `brief-r2.md` → `skills/cdd-spec-review/assets/`, `brief-adr.md` → `skills/cdd-adr-review/assets/`. `assets/` is optional per skill — cdd-backlog-triage bundles no templates and ships none.
- UPDATE every reference to the old flat paths, in the same commit as the moves: the 3 SKILL.md pointer lines and the path pins S36 (`tests/smoke.mjs`), LLH6/LLH7 (`tests/acceptance/loop-law-hardening.test.js`), RF6/RF7 (`tests/acceptance/r3-findings.test.js`), DD16/DD17 (`tests/acceptance/design-docs.test.js`). Verified pre-flight: `lib/loop-law.mjs` and `cdd/rules.md` carry no brief file paths (no law or mirror edit), and `lib/templates.mjs` names only basenames that stay truthful under `assets/` — no scaffold edit.
- `tests/smoke.mjs` S33 grows two assertions over every bundled skill directory: (a) LAYOUT — no file matching `brief-*.md` or `*-brief.md` sits directly beside a SKILL.md; every brief template a skill bundles lives under `assets/` (red until the moves land); (b) ROUTING SIGNAL — every frontmatter description contains a when/whenever clause, case-insensitive, the heuristic named in the check message (born green: all 4 descriptions comply today — recorded as the check's baseline evidence, not a faked red).
- The gherkin living spec: MODIFIED "Reviewer briefs live next to their skills" (prose, 1 Given line, 1 Then line, and the Code: line move to `assets/` paths; all 6 scenarios restated) + MODIFIED "One decisions home across the corpus" (Code: pin for brief-adr.md moves to the `assets/` path; both scenarios restated unchanged — discovered by task 3.4's sweep: the living spec :929 pinned the flat path outside the briefs requirement) + ADDED "Bundled skills follow the pi skill-authoring layout" owning the layout-convention sentence — `assets/` = template files the skill instantiates at use, `references/` = documents read as-is, `scripts/` = executables, each optional — and the two S33-growth scenarios.
- Grep sweep: no `skills/<skill>/brief-*.md` path form survives outside `cdd/archive/` (decision memory keeps its historical shorthand — ADR-0010's reconfirm note "brief-r1/brief-r2" is history, not a live path).

## Solutions Considered

- pi skill-authoring layout convention (pi.dev docs, quoted in the mission brief): the platform's own answer to where a skill's auxiliary files live; adopted — the briefs are exactly `assets/` material (instantiate, hand to the cold reviewer session).
- Flat placement with prose pointers (status quo): rejected — off-convention, role-ambiguous, and unenforceable by a check.
- `references/` or `scripts/` for the briefs: rejected — briefs are neither read-as-is documents nor executables.
- A new S38 instead of growing S33: rejected — S33 already owns the loadable-skills surface contract (frontmatter, manifest registration); the two new assertions are skill-surface-wide, so they grow S33; S37 keeps its triage-rubric contract single-minded (20261023-triage-skill's shape decision).
- Existing per-suite pins (S36, LLH6/LLH7, RF6/RF7, DD16/DD17): reused — their paths move with the files; no new suites, no new briefs, no brief-content change.
- ADR-0011 (ticks are claims, pins hit real doors): followed — every pin this change moves already reads the real file from disk (readBrief joins the repo path and reads; S36 path.joins the moved location); no copied-fragment pins introduced, and any Close-phase finding that voids a tick gets the inline re-tick record the ADR mandates.
- ADR-0006 (feature-block consolidation), ADR-0007 (the law behind every door), ADR-0009 (single-source the loop law): followed — the MODIFIED "One decisions home across the corpus" requirement re-pins README.md and lib/gherkin.mjs unchanged (surfaces that requirement already governed); this change touches no door law and no law mirror — lib/loop-law.mjs and cdd/rules.md carry no brief paths (verified in task 1.1).

## Non-Goals

- No loop-law or `cdd/rules.md` change: neither carries brief file paths (verified in task 1.1); byte-identity of the law untouched.
- No brief-content change: pure renames; the five bodies stay byte-identical.
- No `assets/` directory for cdd-backlog-triage: it bundles no templates.
- No validator, guard, or grammar-law change; no new acceptance suites.
- No ADR: a reversible layout alignment inside one capability, no cross-capability trade-off.

## Capabilities

- gherkin: MODIFIED "Reviewer briefs live next to their skills" + MODIFIED "One decisions home across the corpus" (Code: pin to the assets/ path) + ADDED "Bundled skills follow the pi skill-authoring layout" in `cdd/changes/skill-layout/specs/gherkin/spec.md`, merging into `cdd/specs/gherkin/spec.md` at archive.

Done-When: node tests/smoke.mjs exits 0 with S33 grown by the layout assertion (no loose brief-*.md or *-brief.md beside any SKILL.md under skills/; every bundled brief template under its skill's assets/) and the routing-signal assertion (every bundled skill's description contains when/whenever)
Done-When: npm test exits 0 with every suite green after the moves and pin updates
Done-When: cdd validate strict is green and node cdd/scripts/spec-drift.mjs exits 0 with the change open — the loop's universal gate; it maps to task 4.4 only

Code: skills/cdd-code-review/SKILL.md, skills/cdd-code-review/assets/brief-r3-standards.md, skills/cdd-code-review/assets/brief-r3-spec.md, skills/cdd-spec-review/SKILL.md, skills/cdd-spec-review/assets/brief-r1.md, skills/cdd-spec-review/assets/brief-r2.md, skills/cdd-adr-review/SKILL.md, skills/cdd-adr-review/assets/brief-adr.md, tests/smoke.mjs, tests/acceptance/loop-law-hardening.test.js, tests/acceptance/r3-findings.test.js, tests/acceptance/design-docs.test.js
