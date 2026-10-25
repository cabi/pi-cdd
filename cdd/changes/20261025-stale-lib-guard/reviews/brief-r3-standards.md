# R3 Standards-Axis Code Review Brief — 20261025-stale-lib-guard

You are a cold reviewer in a fresh session. You did not author this code.

## Independence record

- Author model family: **zai** (glm-5.3). You must be from a different family. Write the model you actually run on at the top of your findings file; if you are also zai, stop and report that instead of reviewing.
- Earlier artifact reviews on this change: R1 and R2, both by opencode-zen/gpt-6-luna at thinking high; dispositions recorded in their findings files — context, not authority.

## What to do

1. Read the skill file `skills/cdd-code-review/SKILL.md` (repo root) and follow its **Standards axis** checklist.
2. The diff under review is exactly: `git diff 899ba38..1f675b2` on branch `change/20261025-stale-lib-guard` (repo root `/home/carsten/Projects/pi-extensions/pi-cdd`). Files: `index.ts`, `lib/stale.mjs` (new), `tests/tools.mjs`, `tests/acceptance/stale-lib-guard.test.js` (new), plus the change folder `cdd/changes/20261025-stale-lib-guard/` (artifacts and review records — standards-axis review targets the CODE files; the artifacts are context).
3. Standards to review against (read from disk):
   - `cdd/rules.md` — in particular: source code carries no spec markers; comments are shape-of-code only (no decision ids, PF ids, commit ids, corpus pointers — ADR-0012); acceptance tests are the only place requirements are pinned; no restatement of grammar that lives in `scripts/grammar-law.mjs` (ADR-0007).
   - `cdd/decisions/0002-the-harness-is-the-counterparty.md`, `cdd/decisions/0007-the-law-behind-every-door.md`, `cdd/decisions/0012-comments-are-shape-only.md` — the proposal's Decision alignment section claims the change follows all three; check the code actually does.
   - Repo test conventions: existing acceptance suites under `tests/acceptance/`, unit pin style in `tests/tools.mjs` (fakeApi capture, sandbox/tmpdir hermetic pattern, jiti loading via `tests/pi-jiti.mjs`).
   - Error-shape conventions in `index.ts` and `lib/*.mjs`: `{ ok: false, ... }` / isError results, one error per refusal, messages that name what to do next.
4. Standards-axis checks that decide your findings: does `lib/stale.mjs` keep the module boundary the design claims (guard owns surface+snapshot+diff+grade+commands; dispatcher consults; libs unaware)? Is the surface walk correct against the real tree (index.ts, lib/ all files, scripts/ .mjs only, vendor/ recursive — and NOT the project store)? Are comments shape-only? Any spec markers, dead code, duplicated logic that should reuse an existing module, or a testing convention broken?

## Output

Write findings to `cdd/changes/20261025-stale-lib-guard/reviews/r3-standards-code-review.md`:

- Header: your model id, thinking level, date, axis (standards), form (cold subagent, fresh session).
- One block per finding: severity `blocker` / `should` / `note`, file+line, problem, recommended disposition (`fixed:` / `open` / `won't-fix:`).
- Advisory only — no verdicts; the deterministic validators keep gate authority.
- If nothing fires at a severity, say so explicitly.

You may run read-only commands (git diff, node --test, grep). Do not edit any artifact other than your findings file. Do not run the cdd tool. Do not commit. End with a one-line summary: model, thinking, blocker/should/note counts.
