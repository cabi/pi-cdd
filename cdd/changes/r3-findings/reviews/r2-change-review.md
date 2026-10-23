# R2 change review — r3-findings

- **Reviewer form:** cold sub-agent (fresh session, briefed only from the paths on disk)
- **Model family:** reviewer `opencode-zen` (deepseek-v4-pro) vs author `zai` (glm-5.3) — families differ
- **Pinned state:** uncommitted working tree at commit `2c34772` (branch `r3-findings`); the change folder `cdd/changes/r3-findings/` is untracked
- **Review point:** R2 (package), at draft-green — proposal, delta, tasks on disk, no implementation task ticked

## Findings

### F1 — should — single-source-law test rewrite has no delta requirement (coverage gap)

Task 3.7 rewrites the pins the per-axis law breaks, including `single-source-law SSL1/SSL2 (R3 facts and the rule 2a basename loop)` (`cdd/changes/r3-findings/tasks.md:19`), and Done-When line 3 names the "rewritten single-source-law … pins" (`cdd/changes/r3-findings/proposal.md:30`). No delta requirement or scenario describes the single-source-law change: the only single-source-law pin in the delta is "Rule 2a states the one decisions home" (`cdd/changes/r3-findings/specs/gherkin/spec.md:44`), which is about the decisions home, not the R3 facts. The proposal's own Code line names `tests/acceptance/single-source-law.test.js` (`proposal.md:33`), but no delta requirement's Code line or scenario claims it. The proposal's "Solutions Considered" asserts the single-source-law pin is "covered by … MODIFIED requirements plus tracked rewrite tasks", but the MODIFIED requirements do not restate the single-source-law R3-facts behavior.

Disposition: fixed — the delta's "Loop law names three review points" now carries the scenario "The R3 review point carries one findings path per axis" (R3 entry holds findingsStandards/findingsSpec and no single findings field; the rule 2a render names every review point's skill and every findings basename), Verified by tests/acceptance/single-source-law.test.js, and that requirement's Code line now claims tests/acceptance/single-source-law.test.js. Task 3.7's rewrite is covered by a scenario.

### F2 — should — MODIFIED requirements' Code lines drop files their restated scenarios still reference

Each MODIFIED requirement's `Code:` line lists only the files this change touches, not the full surface the restated scenarios still pin. On archive this narrows the code↔spec correlation (rule 10) if the Code line replaces rather than merges:

- "Loop law names three review points" — delta `Code:` (`specs/gherkin/spec.md:64`) drops `lib/templates.mjs`, `lib/instructions.mjs`, `lib/context.mjs`, `lib/help.mjs`, `README.md`, `cdd/decisions/0008-*.md`, `tests/acceptance/single-source-law.test.js`, `tests/acceptance/loop-law-hardening.test.js` vs the living spec (`cdd/specs/gherkin/spec.md:267`). The restated scenarios still reference `single-source-law.test.js` ("Rule 2a states the one decisions home"), `loop-law-hardening.test.js` ("Rule 2a cross-references the two-sessions rule"), `README.md` ("The repository's own store copy and README match the law"), and `lib/context.mjs`/`lib/help.mjs` ("Ambient and help statements match the law").
- "Reviewer briefs live next to their skills" — delta `Code:` (`specs/gherkin/spec.md:162`) drops `brief-r1.md`, `brief-r2.md`, `brief-adr.md`, `cdd-spec-review/SKILL.md`, `tests/smoke.mjs`, `tests/acceptance/loop-law-hardening.test.js`, `tests/acceptance/design-docs.test.js` vs the living spec (`cdd/specs/gherkin/spec.md:816`), all still pinned by the restated scenarios.
- "Tasks template scaffolds review tasks" — delta `Code:` (`specs/gherkin/spec.md:106`) drops `cdd/decisions/0008-*.md` vs the living spec (`cdd/specs/gherkin/spec.md:324`); it also swaps `lib/context.mjs`/`lib/help.mjs` for `lib/templates.mjs`/`lib/instructions.mjs`, which corrects a pre-existing living-spec error.

Disposition: fixed — all 3 MODIFIED requirements' Code lines now carry the union of the living spec's Code files and this change's additions (law: templates/instructions/context/help/README/0008-*.md/single-source-law/loop-law-hardening/r3-findings restored; tasks: context/help/0008-*.md restored alongside the correcting templates/instructions swap; briefs: all five briefs, both SKILL.mds, smoke, loop-law-hardening, design-docs restored), so archive merges without narrowing the rule-10 correlation.

### F3 — note — task 3.8 (A1 reconfirms) is orphan

Task 3.8 adds `Reconfirmed-by: r3-findings` paragraphs to ADR-0008/0009/0010 (`cdd/changes/r3-findings/tasks.md:20`), but no Done-When line and no delta requirement sponsors it. The proposal's "Decisions followed" section cites the ADRs as followed, but the reconfirm work is invisible to the Done-When and the delta.

Disposition: won't-fix — task 3.8 is rule-mandated process bookkeeping, not spec behavior: the A1 reconfirm rides the same commit as the touching code (institutionalized in 20261023-design-docs), its observable check is on the task line, and it feeds Done-When 4 (strict + guard green — the guard's A1 door fires on this change's globs). ADR files are not capability-owned code, so no delta requirement can claim them.

### F4 — note — Done-When line 5 (backlog closure) has no delta requirement

Done-When line 5 closes PF-8 and PF-13 in `cdd/backlog.md` (`cdd/changes/r3-findings/proposal.md:32`), but no delta requirement describes it. Acceptable per rule 13 (the backlog is living triage data, not spec), but it is a process criterion rather than a spec criterion.

Disposition: won't-fix — accepted as a process criterion per rule 13: the backlog is living triage data, not spec; the Done-When stays observable (cdd backlog listing both done) and task 4.5 verifies it.

## Checklist summary

- **Coverage** — every Done-When maps to ≥1 requirement except the single-source-law rewrite (F1) and the backlog closure (F4); every requirement maps to ≥1 task (3.3/3.4 → loop law, 3.3 → tasks template, 3.5 → briefs, 3.6 → Capabilities).
- **Sponsorship** — task 3.8 is orphan (F3); no orphan requirements.
- **Same-change coherence** — proposal's four "What Changes" bullets map one-to-one to the three MODIFIED + one ADDED requirement; Done-When ↔ traceability table align; no contradictions found.
- **MODIFIED/REMOVED legality** — all three MODIFIED requirements restate every living-spec scenario (7/7, 4/4, 5/5) plus one new scenario each; no REMOVED requirements present. Code-line narrowing flagged separately (F2).
- **Verify-by runnable** — every scenario pin names an existing acceptance test or `tests/acceptance/r3-findings.test.js` (created by task 3.2); every task verify-by names a real command or file check.
