# R3 standards-axis code review — r3-findings

- Reviewer form: cold sub-agent (standalone session, briefed only from disk)
- Reviewer model family: opencode-zen (deepseek-v4-pro)
- Author model family: zai (glm-5.3) — families differ, per rule 2b
- Pinned state: the entire change is uncommitted in the working tree
  (`git diff 2c34772`; `git log 2c34772..HEAD` is empty — HEAD == 2c34772),
  plus the untracked files `tests/acceptance/r3-findings.test.js` and
  `cdd/changes/r3-findings/**`, read from disk at that state.
- Axis: Standards only. Spec compliance is out of scope (separate session).

## Findings

### blocker — the acceptance suite is red: test-contract migration is incomplete

The change's own Done-When requires "`npm test` exits 0 with the rewritten
single-source-law, review-wiring, and smoke pins", but `npm test` exits 1.
Two checks in `tests/acceptance/single-source-law.test.js` still iterate the
R3 review point's removed `findings` field and throw
`The "path" argument must be of type string. Received undefined`:

- `tests/acceptance/single-source-law.test.js:104` (SSL2) —
  `includes(r, path.basename(p.findings), "rule 2a")` inside the
  `for (const p of law.REVIEW_POINTS)` loop; R3 now carries
  `findingsStandards`/`findingsSpec` and no `findings` field.
- `tests/acceptance/single-source-law.test.js:134` (SSL4) —
  `includes(t, path.basename(p2.findings), "tasks instruction")` inside the
  `for (const p2 of [rp("R2"), rp("R3"), rp("ADR")])` loop.

Task 3.7 claimed to rewrite "single-source-law SSL1/SSL2 (R3 facts and the
rule 2a basename loop)", but only SSL1 was rewritten; SSL2's basename loop
(line 104) and SSL4's basename loop (line 134) were missed. This is a red
door (a fact, not an obstacle) and leaves the change incomplete against its
own Done-When. Disposition: fixed: both loops now select the file list per
axis (`const files = p.findings ? [p.findings] : [p.findingsStandards,
p.findingsSpec]`); `npm test` exits 0 with all 20 acceptance files green —
disposer: author session, 2026-10-23.

### note — duplicated discriminator cascade across two suites

The per-axis output selection
`outputs = axis === "standards" ? [rp.findingsStandards] : axis === "spec" ? [rp.findingsSpec] : [rp.findings]`
is duplicated verbatim in `tests/acceptance/loop-law-hardening.test.js`
(LLH6) and `tests/smoke.mjs` (S36). This is a Duplicated Code / Repeated
Switches shape on the `axis` discriminator. Judgement call: the two suites
are separate (acceptance vs smoke) and the duplication is one line, so this
is minor. Disposition: won't-fix: the acceptance and smoke suites are
deliberately standalone scripts; the cascade is one line per suite and a
shared helper would couple the two suites for no behavioral gain.

### note — instruction section order vs. scaffold render order

The proposal instruction's "Sections (all required)" list orders Done-When
(`lib/instructions.mjs:35`) before Capabilities (`lib/instructions.mjs:40`),
but the scaffold renders `## Capabilities` (`lib/templates.mjs:105`) before
`Done-When:` (`lib/templates.mjs:109`). The instruction does not state "in
this order", so this is a cosmetic inconsistency, not a hard breach.
Disposition: won't-fix: the instruction's "Sections (all required)" list is a
minimum-shape enumeration, not an order (it never says "in this order"); the
scaffold's order — placeholders as sections, `Done-When:`/`Code:` as the
closing lines — is deliberately pinned by tests/acceptance/r3-findings.test.js
RF9 ("## Capabilities must come before the Done-When line"), and reordering the
scaffold now would rewrite the change's own acceptance pin with no delta
sponsorship.
