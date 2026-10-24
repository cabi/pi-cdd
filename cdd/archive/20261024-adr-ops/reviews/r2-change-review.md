# R2 package review — adr-ops

- **Reviewer form:** cold sub-agent session (fresh session, briefed only from paths on disk at the pinned state).
- **Reviewer model family:** opencode-zen / deepseek-v4-pro (from `PI_PROVIDER=opencode-zen`, `PI_MODEL=deepseek-v4-pro`).
- **Author model family:** zai/glm-5.3 (per the brief). Families differ — independence holds.
- **Pinned state:** branch `adr-ops`, HEAD `ecbdafe6705c7a1d86f68b0848415a2ecc06c2a0`; the change is untracked (`?? cdd/changes/adr-ops/`).
- **Review point:** R2 (package), at draft-green. Advisory findings only — no verdicts, no fixes.

## Charter checks (MUST-DELIVER)

1. **Coverage** — every Done-When maps to ≥1 delta requirement and every requirement maps to ≥1 task. Verified: all 5 Done-When lines map (Done-When 1→adr "adrs op"; 2→adr "single-sourced index" agreement scenario; 3→adr "reconfirm op"; 4→adr "reconfirm op" store-sweep; 5→gherkin MODIFIED byte-identity + reconfirm post-archive). All 6 delta requirements map to tasks (3.2/3.7, 3.3, 3.4/3.5, 3.6, 3.2, 3.3/3.4/3.8).
2. **Sponsorship** — no orphan tasks, no orphan requirements. Verified.
3. **Same-change coherence** — proposal, three deltas, and tasks describe one change (adr-ops: shared index module + discovery + reconfirmation + guard remedy + thin dispatch). Coherent.
4. **MODIFIED/REMOVED legality** — the one MODIFIED (gherkin "Guard tolerates scaffold placeholders in open deltas") restates all 5 living scenarios faithfully; the only change is scenario 5's Then clause gaining the third traveling file (`cdd/scripts/adr-index.mjs`) and the prose "both"→"all three". No REMOVED. Verified.
5. **Verify-by runnable** — every task verify-by names a real command/test; every scenario pin names a real acceptance path that a task creates. Verified (with the note below on the help scenario's pin placement).

## Charter datapoints from R1 (verified handled)

- `--code lib/templates.mjs` expected set: proposal Done-When 1 and the adr delta overlap scenario both name exactly ADR-0006/0007/0008/0009/0011/0012 in id order, ADR-0005 excluded as superseded. Verified against the actual frontmatter: ADR-0005 (superseded) claims `lib/templates.mjs` literally; ADR-0006/0007/0008/0009/0011 claim it literally; ADR-0012 claims it via `lib/*.mjs` (star glob, post-PF-20 `globToRe` at `scripts/spec-drift.mjs:183` compiles `*`→`[^/]*`). The set is correct.
- Byte-identity scoped to the extraction-only commit: proposal Done-When 5 and task 3.2 ("Extraction-only … commit it alone") sequence the check before the remedy edits. Verified.
- Op-registration lives in the extension capability: extension delta "The adrs and reconfirm ops dispatch thin over the ADR library". Verified.

## Findings

### F1 — note — the index scenario omits the `supersedes` field
The requirement prose lists six index fields (`id, file, status, supersedes, title, code globs`), but the scenario "The index builds one entry per ADR" enumerates only five, omitting `supersedes`.
Evidence: `cdd/changes/adr-ops/specs/adr/spec.md:5` (prose) vs `:13` (Then clause). The field is indirectly pinned by the overlap scenario's superseded-exclusion (`:60`), so this is a coherence nit, not a gap.
Disposition: fixed — the index scenario's Then now pins the supersedes field explicitly: null for every entry, because this corpus records supersession in prose, not frontmatter.

### F2 — note — `--check` never-reconfirmed branch is unpinned
The reconfirm requirement prose describes two `--check` branches: compare the file's commit date against the ADR's latest reconfirmation date, "or, when never reconfirmed, after the ADR file's own last non-mechanical commit date". Only the reconfirmed branch is pinned by a scenario ("Check lists exactly the ADRs whose claims moved"); the never-reconfirmed branch has no scenario.
Evidence: `cdd/changes/adr-ops/specs/adr/spec.md:103` (prose) vs the single `--check` scenario at `:139`.
Disposition: fixed — a second --check scenario pins the never-reconfirmed branch (baseline = the ADR file's own last non-mechanical commit date).

### F3 — note — the ambiguous-tie hint behavior is unpinned at acceptance level
The adrs op prose specifies "an ambiguous tie lists the candidates and hints nothing", but no acceptance scenario pins it (the two hint scenarios cover edit-distance `drafed`→`draft` and prefix `prop`→`proposed` only). The tie rule is pinned only by task 3.8's "statusHint tie rule pinned with a synthetic vocabulary" in `tests/tools.mjs`.
Evidence: `cdd/changes/adr-ops/specs/adr/spec.md:33` (prose) vs the scenario set at `:37`–`:96`; `cdd/changes/adr-ops/tasks.md` task 3.8.
Disposition: won't-fix — the four real statuses are pairwise Levenshtein distance > 4 apart, so no input can sit within distance 2 of two of them at once (triangle inequality): no ambiguous tie is constructible with the real vocabulary, and an acceptance scenario cannot exist without lying about the store. The synthetic-vocabulary unit pin in tests/tools.mjs (task 3.8) is the only honest pin of the tie rule.

### F4 — should — the help scenario's pin does not match the task that verifies the help surface
The extension delta's "Help documents both ops with the shared status vocabulary" scenario pins `tests/acceptance/adr-ops.test.js`, but the help/enum surface is task 3.8's concern, verified via `node tests/tools.mjs` — and task 3.3's scenario list for `adr-ops.test.js` (table, filter, distance hint, prefix hint, overlap set, `./` absolute outside-root, directory, empty+hint) does not name the help or unknown-options scenarios. Risk: the help scenario goes unwritten, or is tested in the wrong file.
Evidence: `cdd/changes/adr-ops/specs/extension/spec.md:10` (pin at `:14`) vs `cdd/changes/adr-ops/tasks.md` tasks 3.3 and 3.8.
Disposition: fixed — task 3.3's scenario list now names the help-documentation and unknown-option (sort=alpha) scenarios riding tests/acceptance/adr-ops.test.js, and task 3.4 names force=true; task 3.8 keeps the enum/help-loop/budget unit pins in tests/tools.mjs.

### F5 — note — the direct-execution guard for `lib/adr-ops.mjs` is claimed but unpinned
The proposal's Solutions Considered says `lib/backlog.mjs`'s op shape — including its "direct-execution guard" — is "adopted wholesale for `lib/adr-ops.mjs`". No delta requirement or scenario pins a direct-execution refusal for the new module; the living "Library modules refuse silent direct execution" requirement names only the validator, backlog, and grammar modules.
Evidence: `cdd/changes/adr-ops/proposal.md:19`; living `cdd/specs/gherkin/spec.md` "Library modules refuse silent direct execution".
Disposition: fixed — the extension delta gains a scenario pinning the direct-execution refusal (node lib/adr-ops.mjs exits 2 with exactly 1 stderr line naming the adrs op), pinned by tests/acceptance/adr-ops.test.js.

### F6 — note — `lib/templates.mjs` (DOOR_SCRIPTS growth) is in the proposal Code line but not claimed by any delta Code line
The proposal Code line names `lib/templates.mjs` (the `DOOR_SCRIPTS` growth that makes `cdd init` refresh the third traveling file), but no delta requirement's Code line claims it — the gherkin MODIFIED requirement's Code line names only `scripts/grammar-law.mjs, scripts/spec-drift.mjs, scripts/adr-index.mjs, tests/acceptance/gherkin-guard-placeholder.test.js`.
Evidence: `cdd/changes/adr-ops/proposal.md:54` vs `cdd/changes/adr-ops/specs/gherkin/spec.md` MODIFIED Code line.
Disposition: fixed — the gherkin MODIFIED requirement's Code line now claims lib/templates.mjs (the DOOR_SCRIPTS growth that ships the third traveling file to adopting stores).

## Summary

No blockers. The package is coherent, fully covered, and sponsorship-clean; the MODIFIED requirement restates all five living scenarios faithfully; the R1 datapoints (overlap set, byte-identity scoping, extension op-registration) are all handled. Six advisory findings remain: one `should` (F4, help-scenario pin placement) and five `note` (F1–F3, F5–F6), all coherence/pinning nits.

## Post-review adjustment (author, pre-implementation)

The door O-check (one capability owns a file, `scripts/spec-drift.mjs` O law) forced
ownership changes across the delta Code lines after R2: `scripts/adr-index.mjs` and
`lib/adr-ops.mjs` are owned by the adr capability (dropped from the gherkin MODIFIED
and extension Code lines), `scripts/spec-drift.mjs` stays gherkin-owned (dropped from
the adr index requirement's Code line), and the two op acceptance suites stay adr-owned
(dropped from the extension Code line — its scenarios still pin them). F6's substance
stands: the gherkin MODIFIED Code line claims `lib/templates.mjs` (DOOR_SCRIPTS).
Scenarios are unchanged; only Code-line membership moved.

## Post-review adjustments (recorded by the author, at commit time)

- **O-check forced the index requirement's home** (first commit attempt): the living gherkin comments-law render (cdd/specs/gherkin/spec.md:1289, ADR-0012's law) claims `scripts/*.mjs`, so the staged `scripts/adr-index.mjs` was double-claimed (gherkin living + adr delta). Per the O law's own in-flight mechanism, the requirement moved from the adr delta to the gherkin delta (same capability as the living claim); the adrs/reconfirm requirements keep `lib/adr-ops.mjs` and their suites in adr. Proposal capabilities section records the same. No scenario text changed; dispositions above unaffected.
