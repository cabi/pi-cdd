# R3 code review — standards axis — ops-registry

- **Review point**: R3, standards axis only (brief: `cdd/changes/ops-registry/reviews/brief-r3-standards.md`).
- **Reviewer form**: cold sub-agent (`pi -p --no-session`, subagent `ops-registry-runner`), not the author's session — loop law rule 2b satisfied.
- **Model family**: author family `zai/glm-5.3`; this session `opencode-zen/deepseek-v4.1-flash` (`PI_PROVIDER=opencode-zen`, `PI_MODEL=deepseek-v4.1-flash`, `PI_REASONING_LEVEL=high`) — different family.
- **Pinned state**: branch `ops-registry`, HEAD `4afb08b` + uncommitted working tree. Diff: `git diff 4afb08b -- index.ts lib/help.mjs tests/smoke.mjs`; untracked files read directly: `lib/ops.mjs`, `tests/acceptance/ops-registry.test.js`.
- **Standards sources**: `README.md`, `MAINTENANCE.md`, `cdd/rules.md`, smell baseline in `skills/cdd-code-review/SKILL.md` (step 3), ADRs whose `code:` glob matches the diff — `cdd/decisions/0002-*.md`, `0007-*.md`, `0008-*.md`, `0009-*.md`, `0012-*.md`.
- **Doors at review state**: `node cdd/scripts/spec-drift.mjs` → clean (6 specs, 38 acceptance files, full scan); `node tests/smoke.mjs` 37/37; `node tests/tools.mjs` 18/18; `node --test` 38/38 files.
- **Findings**: 3 should, 5 note, 0 blocker. No verdict.

## Findings

### F1 — `should` — MAINTENANCE.md still points at `index.ts` for `OPS_DOC`
**Finding**: The repo's documented maintenance contract names `OPS_DOC`'s file, and the diff moved that file. `MAINTENANCE.md:26` states "The verbatim descriptions and schemas of the five-tool version are preserved in `OPS_DOC` in `index.ts` and returned by `op: help`"; `MAINTENANCE.md:96-99` states "Change the op's behavior in the `switch` in `index.ts` **and** its `OPS_DOC` entry (description + parameters) in the same edit". After the diff, `OPS_DOC` is defined only at `lib/ops.mjs:134-136` and merely imported at `index.ts:20`. No doc in the diff is updated, while the new module explicitly claims the doc relationship (`lib/ops.mjs:17-19`: "`was` carries the five-tool original's name where one exists (provenance for MAINTENANCE.md)").
**Evidence**: `MAINTENANCE.md:26`, `MAINTENANCE.md:96-99`; `lib/ops.mjs:17-19`, `lib/ops.mjs:134-136`; `index.ts:20`; diff contains no `MAINTENANCE.md` hunk.
**Disposition**: `open`

### F2 — `should` — the new module header makes an unpinned, false claim about the tree
**Finding**: `lib/ops.mjs:4-5` states "nothing else in the tree restates an op's name, docs, aliases, or parameters". The tree still restates op names twice: the tool description enumerates all nine ops (`index.ts:197-198`), and `README.md:7` sells "(seven ops)" while `README.md:36-37` lists the op row. This is both factually stale and, per ADR-0012, exactly the banned shape — a claim about the whole corpus inside a comment, since "hand-maintained indexes (any list that mirrors facts the code or build derives)" are forbidden and "comments may only describe the code they sit in". Nothing pins the claim, so it rots silently.
**Evidence**: `lib/ops.mjs:4-5`; `index.ts:197-198`; `README.md:7`, `README.md:36-37`; `cdd/decisions/0012-*.md` comment law clause.
**Disposition**: `open`

### F3 — `should` — new acceptance test carries history/WHY-prose ADR-0012 bans
**Finding**: `tests/acceptance/ops-registry.test.js:65-66` ("// the registry — absent before task 3.3, so every registry-backed check below holds its red line until the table exists") and `:179-181` ("// registry-independent half: … this is the check that was red while help.mjs listed seven of nine ops") narrate past process state and roadmap routing rather than describing the code they sit in. ADR-0012 bans WHY-prose (lessons, history) and corpus routing (spec/change names, task ids) in comments. The scanner cannot catch this by construction: `tests/acceptance/comment-law.test.js:33-46` bans ADR/PF ids, corpus paths, spec headings and commit ids — not task ids — and ADR-0012 records that the pin "does not scan tests/". Green suite therefore does not clear the convention.
**Evidence**: `tests/acceptance/ops-registry.test.js:65-66`, `:179-181`; `cdd/decisions/0012-*.md` (banned classes, test-lane exemption); `tests/acceptance/comment-law.test.js:33-46`.
**Disposition**: `open`

### F4 — `note` — red-line scaffold outlived the red line
**Finding**: `tests/acceptance/ops-registry.test.js:67-76` still guards the registry load with `let ops = null; try { … } catch { ops = null }` and a `registry()` helper that throws "lib/ops.mjs does not export the op registry (yet)". The module exists and exports `OPS`, so the fallback branch is unreachable speculative generality (smell baseline: Speculative Generality), and its comment repeats the history from F3.
**Evidence**: `tests/acceptance/ops-registry.test.js:65-76`; `lib/ops.mjs:20`.
**Disposition**: `open`

### F5 — `note` — dangling comment and blank run left by the deletion in `index.ts`
**Finding**: After `nameParam`/`capsParam` moved to `lib/ops.mjs:10-15`, `index.ts:49` still reads "// plain JSON-schema parameters — no typebox import, zero resolution risk" and now introduces nothing; it is followed by three blank lines (`index.ts:50-52`) before the next comment. Comment-law's WHAT-restating ban applies to a comment with no subject.
**Evidence**: `index.ts:49-52`; `lib/ops.mjs:10-15`.
**Disposition**: `open`

### F6 — `note` — module name under-describes its contract
**Finding**: The file announces itself as "The op registry" (`lib/ops.mjs:1`) and is exported/imported under that framing, but it also owns the slash-command list (`lib/ops.mjs:130` `export const COMMANDS`), which `lib/help.mjs` consumes as the second surface. The header sentence is honest about both ("the help screen's Commands-and-tools rows"), yet the name says op registry only — Mysterious Name, judgement call given it is a two-row table on one screen.
**Evidence**: `lib/ops.mjs:1-5`, `lib/ops.mjs:130`; `lib/help.mjs` HELP_LINES import.
**Disposition**: `open`

### F7 — `note` — OR3/OR5 pin `index.ts` source text, not the op surface
**Finding**: OR3 parses `indexSrc` with `/case "([a-z]+)":/g` (`tests/acceptance/ops-registry.test.js:109-115`) and OR5 splits the status/help bodies on `case "<name>":` and scans for `parseOptions(` (`:140-149`). Any unrelated nested `switch`/`case "…"` added to `index.ts` later turns OR3 red without any op changing — a false-red coupling to source shape rather than to the door.
**Evidence**: `tests/acceptance/ops-registry.test.js:109-115`, `:140-149`; `index.ts` dispatch switch.
**Disposition**: `open`

### F8 — `note` — ADR reconfirmation for the touched ADRs is still pending, and A2 is blind to it
**Finding**: The diff touches files claimed by `cdd/decisions/0002-*.md`, `0007-*.md` (both `code: index.ts`), `0008-*.md`, `0009-*.md` (both `lib/help.mjs`) and `0012-*.md` (`index.ts, lib/*.mjs, …`); none of them carries an ops-registry reconfirmation line yet. `cdd/scripts/spec-drift.mjs:722-737` (`checkA2`) fires only when a code file moved *after* an ADR's last commit and returns early while the change is uncommitted, so the guard is clean now and rings only post-commit.
**Evidence**: `cdd/decisions/0002/0007/0008/0009/0012-*.md` (no `ops-registry` reconfirmation); `cdd/scripts/spec-drift.mjs:722-737`; guard output "spec-drift: clean".
**Disposition**: `open`

## Smell baseline — checked, no new instance
Duplicated Code (registry de-duplicates the surfaces), Feature Envy, Data Clumps, Primitive Obsession, Repeated Switches (`optionKeys` replaces the seven hand whitelists), Shotgun Surgery (reduced: one table), Divergent Change, Message Chains, Middle Man, Refused Bequest — no new instance in the diff. Only Speculative Generality (F4) and Mysterious Name (F6) produced findings.

## Items with no finding
- Conventions 1 (`README.md`, `MAINTENANCE.md`, `cdd/rules.md`): the `lib/help.mjs` single-sourcing ADR-0009 asks for is intact (still renders `helpReviewTip`); the stale README seven-op row and `MAINTENANCE.md:125` test-map row are pre-existing, not introduced here.
- Door alignment 4: `tests/acceptance/ops-registry.test.js` loads the real `index.ts` via `tests/pi-jiti.mjs` `loadViaPi` and exercises real `execute`, satisfying `cdd/rules.md` rule 7; `tests/smoke.mjs` S21 and `tests/tools.mjs` run through the real tool. Guard, validator (`lib/validate.mjs` untouched), and CI (`node --test` discovers the new file) are consistent with the change.

## Dispositions

- **F1 — fixed:** `MAINTENANCE.md:26` now points at `OPS_DOC` in `lib/ops.mjs`; the upgrade step (:96–99) is rewritten registry-first ("Change the op's row (description + parameters) in `lib/ops.mjs` **and** its behavior in the `switch` in `index.ts`"). The move created the stale pointer; the doc must not lie about the table's home.
- **F2 — fixed:** the false corpus claim is deleted; the header now states only what this module owns. The two disclosed restatements stay where the pin can see them (OR6 holds the declaration description; README's list is a recorded proposal Non-Goal).
- **F3 — fixed:** the history comments are gone or rewritten WHAT-only — the scaffold comment was removed with F4, and the OR8 half now reads "the rendered ops row equals the declaration enum as a set — an added or dropped op drifts red even without a registry".
- **F4 — fixed:** the `try`/`catch` + `registry()` scaffold is replaced by a direct top-level `const ops = await import(...)`; the red-line record lives on in tasks.md §3.2, not in unreachable test code.
- **F5 — fixed:** the dangling comment and the blank run are deleted from `index.ts`.
- **F6 — won't-fix:** "ops" is the op surface's name and the header sentence names both surfaces it feeds; renaming post-review would churn design.md, both deltas' `Code:` lines, and three imports for zero behavior change. Judgement call, recorded.
- **F7 — won't-fix:** counting case labels statically requires reading source text (tests/tools.mjs T3e source-scans `case "status":` the same way); an unrelated nested `switch` appearing in index.ts's execute path would itself be a conventions event worth a red flag, not a false alarm to engineer around.
- **F8 — tracked at Close:** by-design latency — `reconfirm --check` runs as the Close pre-flight and the reconfirmation lines ride the archive commit (claim-map precedent). Reported to the director in the M4 ask.
