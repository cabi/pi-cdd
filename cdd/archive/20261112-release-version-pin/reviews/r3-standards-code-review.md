# r3-standards-code-review — 20261112-release-version-pin — 2026-11-12

Reviewer form: **cold sub-agent** (fresh session, briefed only from paths on disk; loop
law rule 2b — no same-session fallback applies).
Model family: `opencode-go/deepseek-v4.1-flash` (DeepSeek lineage) vs author `zai` (GLM
lineage) — families differ.
Axis: **Standards only**. Spec-axis fit is out of scope here (its own cold session, its
own file `r3-spec-code-review.md`).

## Pinned state

- Repository `/home/carsten/Projects/pi-extensions/pi-cdd` at HEAD `78fda00`
  ("chore(release): 0.5.0") — uncommitted working tree; `git status` shows exactly
  `M tests/acceptance/gherkin-style-guidance.test.js` plus the untracked change folder
  `cdd/changes/20261112-release-version-pin/`.
- Diff scope: `git diff 78fda00 -- tests/acceptance/gherkin-style-guidance.test.js`
  (the only tracked-file edit; commit list `git log 78fda00..HEAD --oneline` is empty)
  plus the untracked artifacts `proposal.md`, `specs/gherkin/spec.md`, `tasks.md`,
  `reviews/r2-change-review.md`, `reviews/red-records.md` read from disk.
- Standards sources consulted: `cdd/rules.md` (rules 2a/2b/3–8/10/11/11a),
  `cdd/decisions/0001–0013` front-matter `code:` globs and decision bodies (0005, 0006,
  0011, 0012 read in full), `PRODUCT.md`/`MAINTENANCE.md`/`README.md` for documented
  conventions, plus the skill's smell baseline. The repo has **no** `AGENTS.md`,
  `CONTRIBUTING.md`, or `CODING_STANDARDS.md` at any level; `cdd/rules.md` plus the
  accepted ADRs are the only written standards.
- Baseline runs, not taken on trust, at this pinned state:
  `node --test tests/acceptance/gherkin-style-guidance.test.js` → PASS 6 (T1–T6);
  `node cdd/scripts/spec-drift.mjs` → `spec-drift: clean (5 specs, 46 acceptance test
  files, full scan)`.

## Findings

Severity `blocker` / `should` / `note`. Every row is left **`open`**; the author disposes
with `fixed:` / `won't-fix:`. Advisory only — no verdicts, no gate authority.

| severity | finding | evidence | disposition |
|---|---|---|---|
| should | **The rewritten pin loses failure diagnosability.** T4 iterates an unlabeled array of 4 texts, so the assertion cannot name which corpus surface failed — and the array is not the "3 corpus sources" the scenario counts (the instruction appears as source + export, rule 4 as `tpl.RULES_MD` + the `cdd/rules.md` copy), so the mapping from entry to surface is implicit. The in-repo pattern R2 explicitly recommended (BO10) labels every surface and embeds the label in every message, and T1–T3 in this same file name the surface ("rules.md lacks fenced-gherkin law"). The recorded red run shows the cost: `T4: a corpus source names the manifest's release version` with no source named. Fix: `for (const [label, text] of [["deltaTemplate", ...], ["instructions.mjs", ...], ["RULES_MD", ...], ["cdd/rules.md", ...]])` with `${label}` in the message. | tests/acceptance/gherkin-style-guidance.test.js:73–81 (array + single message at :80); tests/acceptance/backlog-op.test.js:156 (BO10 labelled pairs); tests/acceptance/gherkin-style-guidance.test.js:53, :62 (sibling messages name the surface); reviews/red-records.md:13–16 | fixed: T4 iterates labelled `[label, text]` pairs — "delta template", "instructions.mjs source + export", "rule 4 (RULES_MD)", "rule 4 (cdd/rules.md)" — with `${label}` in the failure message; pin suite re-run green 6/6 after the rework |
| should | **Duplicated corpus-surface expressions with divergent null handling** (baseline smell: possible *Duplicated Code*). T4 rebuilds the same three expressions T2 and T3 already compute — `fs.readFileSync(lib/instructions.mjs) + "\n" + insMod.DELTA_INSTRUCTION` (T2:53, T4:75) and rule 4 (T3:62, T4:76–77) — so a future surface change must land in two places or the checks drift apart. Worse, the copies disagree: T3 defends the export with `tpl.RULES_MD ?? fs.readFileSync(...)`, T4 reads `tpl.RULES_MD` bare, so an absent export makes `text.includes(...)` throw `TypeError: Cannot read properties of undefined (reading 'includes')` instead of the intended assertion message, and `undefined` is pushed into the array unvalidated. Fix: hoist one labelled corpus map at file scope and consume it from T4 (and ideally T1–T3). | tests/acceptance/gherkin-style-guidance.test.js:53 vs :75; :62 vs :76–80 | fixed: instruction surfaces hoisted to one file-scope `INSTRUCTION_SURFACES` const consumed by T2 and T4; T3's dead `tpl.RULES_MD ?? readFileSync` fallback dropped so rule 4 reads `tpl.RULES_MD` bare in both T3 and T4 — an absent export reddens the SSL3 byte-identity pin (tests/acceptance/single-source-law.test.js:117) first |
| should | **`proposal.md` still claims a pin shape the shipped code no longer has.** The adopted solution describes "a factual, quantified pin (exactly 1 regex, exactly 3 corpus sources)", but the final T4 carries **zero** regexes — the semver-shape assertion was dropped exactly as R2's third finding asked, and that row's disposition even claims "task 3.3 and the proposal updated". The proposal archives as the change's record, so it must not describe an assertion that does not exist. Fix: reword the adopted solution to what shipped (no-literal scan over the manifest version across the labelled corpus sources). | cdd/changes/20261112-release-version-pin/proposal.md:17 vs tests/acceptance/gherkin-style-guidance.test.js:70–82; reviews/r2-change-review.md (row 3, disposition "fixed: shape assertion dropped from T4 … task 3.3 and the proposal updated") | fixed: adopted bullet rewritten to the shipped shape — no version-shape regex, four labelled surface reads covering the 3 corpus sources (proposal.md:17) |
| note | **The delta prose over-claims what the pin enforces.** It states as law that "The corpus and rule 4 never name a literal release version, so no release bump turns a corpus pin red", while T4 only forbids the manifest's *current* version string: a stale `0.4.1` left in a corpus source would keep T4 green, and `pkg.version` changing to something a corpus file coincidentally contains would false-red. This is the same broad-vs-narrow reading R2 fixed in the Then (row 2) but not in the prose sentence R2 added (row 4). Spec-axis owns requirement fit; recorded here because the prose is a forward guarantee no check carries. | cdd/changes/20261112-release-version-pin/specs/gherkin/spec.md:5 vs tests/acceptance/gherkin-style-guidance.test.js:80 (`!text.includes(pkg.version)`) | fixed: prose narrowed to "never name the extension's released package version, so a release bump finds no stale literal to turn a corpus pin red" — same edit disposes spec-axis row 1 |
| note | **The section banner states a broader rule than the check.** `// --- 2. released version — the corpus never names it literally ---` reads as "never any literal" (any semver, or "literally" naming a version at all) while the check under it only scans for the one manifest string. ADR-0012 (comments are shape-only) does not govern this path — its `code:` globs are `index.ts, lib/*.mjs, lib/*.ts, scripts/*.mjs, .githooks/*` — so this is a judgement call, not an ADR breach; the banner itself is the shape marker the file's siblings use. Fix if touched anyway: "released version — the corpus stays version-agnostic". | tests/acceptance/gherkin-style-guidance.test.js:68 | fixed: banner reworded to "released version — the corpus stays version-agnostic" |

## Chain checks that came back clean (for the record)

- **ADR-governed files respected** — no ADR's `code:` globs cover
  `tests/acceptance/gherkin-style-guidance.test.js` (ADR-0011 claims
  `tests/acceptance/loop-law-hardening.test.js` only; ADR-0013 claims
  `tests/acceptance/claim-map.test.js`). No ADR-governed file is touched, so no
  reconfirmation is due, matching `tasks.md:30`.
- **Guard/validator alignment** — the diff weakens no door: `cdd/rules.md`,
  `lib/templates.mjs`, `lib/instructions.mjs`, `lib/validate.mjs`, and
  `cdd/scripts/**` are untouched, so law text renders byte-identically from its single
  source (ADR-0009) and the claim map (ADR-0013) is unchanged. `spec-drift` clean and the
  pin suite green at the pinned state (runs above).
- **Pin realism (rule 7 / ADR-0011)** — T4 does not pin door behavior, so the
  real-door-entry-point duty does not fire; what it does read, it reads for real (real
  module imports `tpl`/`insMod`, real `package.json`, real `cdd/rules.md`) rather than a
  copied fragment. Not sandbox-only.
- **Comment law** — the only added comment line is a section banner in the shape the file
  already uses; no ADR/PF ids, no spec-heading prose, no WHY narration, no hand-maintained
  index inside `lib/`, `scripts/`, or `.githooks/`.
- **Spec markers (rule 10)** — the diff adds no corpus routing to code; the pin path stays
  in the delta's `# Verified by:` comment.
- **Rule 8 (mechanical changes)** — not claimed: a commit that edits an acceptance test
  correctly travels as a normal change, not a `Mechanical-Change:` sweep.
- **Rule 11a (ticks are claims)** — no ticked artifact is re-edited after a *Close-phase*
  review point here; R2 sits before implementation, so no `re-verified after R2` line is
  due, and the Close ticks at `tasks.md:28–32` are still open.
- **Smell baseline** — beyond the Duplicated Code row above, no new instance: no
  Mysterious Name (the T4 title says what it checks), no Feature Envy/Data Clumps/
  Speculative Generality/Message Chains (the change adds one local array and one loop), no
  Repeated Switches, and no Shotgun Surgery/Divergent Change (one file, one reason).

## Summary

5 findings: 0 blocker, 3 should, 2 note. Worst standards issue: the replaced T4 gives up
the per-surface failure message the file's siblings and BO10 establish, so a red run names
no corpus source.
