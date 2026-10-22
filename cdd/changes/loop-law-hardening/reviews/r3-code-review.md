# R3 code review — loop-law-hardening

- Change: `cdd/changes/loop-law-hardening/`
- Review point: R3 (code review), before archive
- Axis: **Standards** (the Spec axis runs in a separate cold session and appends its own section)
- Reviewer form: cold sub-agent (fresh session, briefed only from paths on disk)
- Reviewer model + family: `deepseek-v4-pro` via `opencode-zen` (family: deepseek / opencode-zen)
- Author family (from the brief): `zai/glm-5.3` — families differ (different provider and model lineage)
- Pinned state: base `901e7fe` + uncommitted working tree (diff read via `git diff 901e7fe -- …`)
- Date: 2026-10-22

## Standards axis

> Author disposition: fixed — `lawRule2b()` now interpolates `familySeparation`, `familyEscape`, and `twoAxes` (fact values carry the exact prose); mirror regenerated, SSL3 + LLH suite green. Re-ticks recorded on tasks 3.3, 3.6.

### Finding 1 — `should` — dead `REVIEWER_INDEPENDENCE` fields

The three new fields `familySeparation`, `familyEscape`, and `twoAxes` are added to the `REVIEWER_INDEPENDENCE` object but never referenced anywhere in the codebase. `lawRule2b()` hardcodes the new sentences as literal prose instead of interpolating these facts, diverging from the established pattern where the other `REVIEWER_INDEPENDENCE` fields (`principle`, `coldForm`, `fallbackForm`, `recording`, `recordingCompact`) are interpolated by the compact renderers (`proposalIndependence`, `tasksIndependence`, `ambientIndependence`, `helpIndependenceLine`). The change's own `tasks.md` (line 65) states the `familySeparation` fact "renders one more sentence in `lawRule2b()`" — the implementation does not do that; it hardcodes the sentence, leaving the fact dead. The fact values are also near-duplicates of the law prose with a case difference ("the reviewer's model family…" vs the law's "The reviewer's model family…"), so they are not even byte-identical to what they claim to represent.

Evidence: `lib/loop-law.mjs:119-122` (definitions) vs `lib/loop-law.mjs:129-140` (`lawRule2b()` hardcodes the prose); `grep -rn 'familySeparation\|familyEscape\|twoAxes'` returns only the definitions and a `tasks.md` mention, no code usage.

Disposition: `open`

> Author disposition: fixed — MUST-DELIVER item 3 now quotes the skill's 12-smell baseline verbatim (Mysterious Name … Refused Bequest) with the override and tooling-skip rules; task 2.2 re-ticked.

### Finding 2 — `should` — brief smell list diverges from the skill's smell baseline

`brief-r3-standards.md` MUST-DELIVER item 3 says "the diff against the skill's smell list" and then parenthetically lists a set of smells that does not match the actual smell baseline in `skills/cdd-code-review/SKILL.md` (step 3). The brief names `long function`, `large class`, `switch statements`, `temporary field`, and `comments-as-deodorant` — none of which appear in the skill's baseline — and omits `Mysterious Name`, `Message Chains`, `Middle Man`, and `Refused Bequest`, which the skill does list. A cold reviewer briefed only from this template would apply the wrong smell set. (The skill remains the authoritative source, and the brief does point at "the skill's smell list", so this is a charter defect, not a door failure.)

Evidence: `skills/cdd-code-review/brief-r3-standards.md` (MUST-DELIVER 3) vs `skills/cdd-code-review/SKILL.md` (step 3, "the smell baseline below").

Disposition: `open`

> Author disposition: won't-fix — deliberate static-file bet (proposal Solutions Considered; T2), drift bought down by smoke S36 + LLH6/LLH7; the duplication is the cost of briefing cold sessions from disk without a renderer.

### Finding 3 — `note` — duplicated skeleton across the five brief templates

The five brief templates repeat the common skeleton near-verbatim — the cold-session block, the author-family clause, the `PI_PROVIDER` verification instruction, and the findings-grammar block each appear five times. This is a deliberate static-file choice (the proposal's Solutions Considered explicitly rejects module-rendered briefs), and drift is bought down by smoke S36 and acceptance pins LLH6/LLH7, so this is a judgement call rather than a hard violation.

Evidence: `skills/cdd-spec-review/brief-r1.md`, `brief-r2.md`, `skills/cdd-code-review/brief-r3-standards.md`, `brief-r3-spec.md`, `skills/cdd-adr-review/brief-adr.md`.

Disposition: `open`

### Checks that passed (no finding)

- **Byte-identity**: `RULES_MD` renders byte-identical to `cdd/rules.md` (verified by direct comparison and by SSL3 green).
- **ADR-governed files respected**: every file under an accepted ADR's `code:` glob is cited/reconfirmed by this change — `lib/loop-law.mjs` and `lib/templates.mjs` (ADR-0008/0009 reconfirmed, ADR-0010 amended), `cdd/rules.md` and the three `SKILL.md` files (ADR-0010 amended). No file under a `code:` glob changes without a matching reconfirm/amendment.
- **No spec markers in source**: the `lib/` edits add law prose only; no `# Verified by:` or other spec markers leak into source (rule 10).
- **Real-door pins**: the new acceptance suite imports `lib/templates.mjs` and `lib/loop-law.mjs` directly and runs `review-wiring.test.js` via `spawnSync`; smoke S36 reads the briefs from disk. No copied-fragment or sandbox-only pins introduced.
- **Guard/validator alignment**: `node cdd/scripts/spec-drift.mjs` exits 0 ("clean"), `npm test` exits 0, smoke 35/35 green. The new sub-lettered rule `11a.` parses under the existing `^\d+[a-z]?\.` rule-boundary convention used by the tests.
- **Sponsored cleanup**: the removed `const law` / `lawPath` lines in `tests/acceptance/review-wiring.test.js` were genuinely dead (the `grammar-law.mjs` binding was unused; the live `lawMod` loop-law binding remains and is used at line 125); `fs` remains in use, so no new dead import.

### Brief template friction

- The MUST-DELIVER smell list (item 3) does not match the skill's actual smell baseline — see Finding 2. The brief should either quote the skill's list verbatim or drop the parenthetical and rely on "the skill's smell list" alone.
- The brief's "Inputs" section names `git diff <fixed-point>...HEAD` (three-dot, merge-base), but this change's diff is an uncommitted working tree against a base commit, so the three-dot form does not apply as written; the instantiated brief (my spawn prompt) correctly substituted `git diff 901e7fe -- …`. The template could note the uncommitted-working-tree variant explicitly, as the R1/R2 briefs already do ("or the working tree if the change is uncommitted").
- The brief's MUST-DELIVER item 4 ("Guard/validator alignment") is phrased around "weaken, bypass, or blind a deterministic door", which is narrower than the charter's stated "does the code agree with cdd/scripts/spec-drift.mjs and lib/validate.mjs expectations" — a reviewer could read item 4 as only about door weakening and miss the byte-identity/validator-agreement check that item 1's "single-sourcing" only partially covers.

## Spec axis

### Spec-axis session header

- Reviewer form: cold sub-agent (fresh session, briefed only from paths on disk)
- Reviewer model + family: `deepseek-v4-pro` via `opencode-zen` (family: deepseek / opencode-zen)
- Author family (from the brief): `zai/glm-5.3` — families differ (different provider and model lineage)
- Pinned state: base `901e7fe` + uncommitted working tree (diff read via `git diff 901e7fe -- lib/ cdd/rules.md cdd/decisions/ tests/ skills/`; untracked files read directly)
- Date: 2026-10-22

### Finding 1 — `should` — three `REVIEWER_INDEPENDENCE` fields are unsponsored dead code

> Author disposition: fixed — `lawRule2b()` now interpolates all three facts (values carry the exact prose); mirror regenerated; suite green; tasks 3.3/3.6 re-ticked.

The diff adds `familySeparation`, `familyEscape`, and `twoAxes` to the `REVIEWER_INDEPENDENCE` object, but no code path reads them: `lawRule2b()` hardcodes the new sentences as literal prose rather than interpolating the facts, and the compact renderers (`proposalIndependence`, `tasksIndependence`, `ambientIndependence`, `helpIndependenceLine`) are unchanged. Task 3.3's verify-by states the mechanism as "`REVIEWER_INDEPENDENCE` gains the family-separation fact and `lawRule2b()` renders the sentence" — the implementation does the first half and not the second, so the three fields serve no delta scenario (the scenarios only require the rendered text, which is hardcoded) and no verify-by consumes them. This is unsponsored code under the Spec axis's "no unsponsored code" charter item. (The Standards axis flags the same lines as an interpolation-pattern divergence; this is the Spec-axis framing — dead code no scenario sponsors.)

Evidence: `lib/loop-law.mjs:119-122` (definitions) vs `lib/loop-law.mjs:129-140` (`lawRule2b()` hardcodes the prose); `grep -rn 'familySeparation\|familyEscape\|twoAxes' lib/ skills/ tests/` returns only the definitions, no usage.

Disposition: `open`

### Finding 2 — `should` — LLH6 does not pin the cold-session rule

> Author disposition: fixed — LLH6 now pins `cold session` (normed) in every brief; task 3.2 re-ticked.

The scenario "The five briefs carry the common skeleton" requires the session requirements to state three things: the cold-session rule, the author-family rule, and two-axes-two-sessions (for the R3 briefs). LLH6 pins the author-family rule only by the word `family` plus `PI_PROVIDER`, and pins two-axes-two-sessions only for the two R3 briefs via `two separate cold sessions`. Nothing in LLH6 checks that any brief states the cold-session rule itself (reviewer is not the author / fresh session) — a brief that dropped the cold-session requirement but kept the heading, the word `family`, and `PI_PROVIDER` would stay green. The R1, R2, and ADR briefs have no "cold" check at all.

Evidence: `tests/acceptance/loop-law-hardening.test.js` LLH6 (checks `Reviewer session requirements`, `family`, `PI_PROVIDER`, `pinned`, `scope fence`, `blocker`, `won't-fix:`, `advisory`, findings path, and `two separate cold sessions` for R3 only) vs `cdd/changes/loop-law-hardening/specs/gherkin/spec.md` scenario "The five briefs carry the common skeleton".

Disposition: `open`

### Finding 3 — `note` — LLH1 pins the two-sessions phrase but not the rule-2b cross-reference

> Author disposition: fixed — LLH1 now also pins `rule 2b governs both axes` (normed) in store + RULES_MD rule 2a blocks; task 3.2 re-ticked.

The scenario "Rule 2a cross-references the two-sessions rule" requires rule 2a to cross-reference the rule 2b requirement. LLH1 checks only that rule 2a contains `two separate cold sessions`; it does not check for the cross-reference itself (`rule 2b` / `governs both axes`). A rule 2a that named "two separate cold sessions" without pointing at rule 2b would still pass LLH1, so the pin is slightly weaker than the scenario's THEN.

Evidence: `tests/acceptance/loop-law-hardening.test.js` LLH1 (checks `two separate cold sessions` in rule 2a and `RULES_MD` rule 2a) vs `cdd/rules.md` rule 2a (`as two separate cold sessions — rule 2b governs both axes`).

Disposition: `open`

### Finding 4 — `note` — LLH6's author-family pin is word-presence only

> Author disposition: fixed — LLH6 now pins the normative sentence `must differ from the author's model family` per brief; task 3.2 re-ticked.

The author-family rule is pinned by the bare word `family` plus `PI_PROVIDER`. A brief whose session-requirements section contained unrelated text mentioning "family" and "PI_PROVIDER" (but no actual family-separation requirement) would keep LLH6 green. The pin does not require the normative content ("differ from the author's", "same provider or model lineage", "stop and ask the human sponsor"). This is a weaker pin than the scenario's THEN, though the smoke pin S36 (`/family/`) is equally word-level, so the two pins together still do not assert the normative sentence.

Evidence: `tests/acceptance/loop-law-hardening.test.js` LLH6 (`includes(b, "family", ...)` and `includes(b, "PI_PROVIDER", ...)`) and `tests/smoke.mjs` S36 (`assert(/family/.test(b), ...)`).

Disposition: `open`

### Brief template friction

- The brief's MUST-DELIVER item 3 ("pins that actually pin") is clear, but the charter's "walk MODIFIED ×3 and ADDED ×4" phrasing assumes the reviewer already knows the requirement count; the brief itself does not state which requirements are MODIFIED vs ADDED, so a reviewer must derive the walk list from the delta rather than the brief. Minor — the delta is a listed input.
- The brief's "Inputs" section names `git diff <fixed-point>...HEAD` (three-dot, merge-base), but this change's diff is an uncommitted working tree against a base commit, so the three-dot form does not apply as written; the instantiated brief (my spawn prompt) correctly substituted `git diff 901e7fe -- …`. The template could note the uncommitted-working-tree variant explicitly, as the R1/R2 briefs already do ("or the working tree if the change is uncommitted").
- The brief's MUST-DELIVER item 2 ("pins actually pin") says a copied-fragment or sandbox-only pin "does not count", but does not define how a reviewer distinguishes a sandbox-only pin from a real-door pin in a static read; the reviewer is left to infer it from the pin's imports/spawns. A one-line definition (e.g. "a pin that imports the module under test or spawns the real entry point, vs one that re-implements the logic inline") would remove the ambiguity.
