# 20261025-stale-lib-guard

## Why

The cdd tool runs inside a long-lived pi process whose jiti/ESM module cache freezes `lib/` at load; after any edit lands on disk, the tool silently executes the pre-edit code. Two verified instances (PF-36, both at the mutating archive op: a missing metrics key/stamp, then a wrong done-whens count that only the disk-verify discipline caught) plus the verdict sibling (PF-35) make the class change-worthy by the recurrence rule — the runner's fresh-node discipline needs to become the tool's own mechanics.

## What Changes

- New library component `lib/stale.mjs`: a load-time snapshot of the extension's imported source surface (index.ts, every file under `lib/` recursively — not just `*.mjs`/`*.ts`, so an asset dropped there also marks the process stale; `scripts/*.mjs`; `vendor/**` — membership plus a per-file sha256 content digest), a per-dispatch fresh re-glob + digest diff, an op grading (mutating vs read; mutating defaults for unknown ops), and per-op fresh-node example commands.
- The tool dispatcher (`index.ts` execute) consults the guard before every op: a mutating op (init, new, archive, backlog add/resolve/revalidate, reconfirm) on a stale surface is refused with exactly 1 error naming the changed files and the exact fresh-node lawful path — no override flag; a read/verdict op (validate, status, adrs, help, backlog list) answers with exactly 1 staleness warning naming the changed files; a clean process is unaffected.
- The three mutating door-1 commands (/cdd-init, /cdd-new, /cdd-archive) get the same one-line consult.
- New acceptance pin `tests/acceptance/stale-lib-guard.test.js` (hermetic: scratch copy of the dispatch surface, jiti-loaded, lib edited mid-process — including a same-length rewrite with the original mtimeMs deliberately restored, and a table-driven check that every mutating op's and backlog action's refusal command actually runs that op in a fresh process against isolated scratch stores held in directories separate from the extension-surface copy) plus a clean-process check in `tests/tools.mjs`.

## Solutions Considered

- extension: the op registry in `lib/ops.mjs` (read in full) — grading could ride a per-row registry flag; rejected: the registry's pinned derivations are op-surface artifacts (enum, help, aliases, options, commands), and a dispatch-internal grade is behavior, which the thin-ops law homes in the library; a parallel classification in the guard gets its own pin instead.
- extension: `scripts/spec-drift.mjs` `globToRe` (read; PF-20 fix) — an existing glob matcher; rejected: importing the door-3 guard into lib couples the extension to the door script and its header-index pin; the surface walk is a 10-line zero-dependency directory scan.
- extension: jiti cache invalidation — no public API on the jiti instance pi holds; a fresh `createJiti` per dispatch is fresh-spawn-lite with the same marshalling cost; rejected for the same reason as fresh-spawn (design.md Alternatives).
- platform: `fs.watch` watchers — event-driven detection misses writes outside watched windows and leaks watchers per extension load; rejected: dispatch-time stat of ~70 files is cheaper and complete.
- existing spec: cdd/specs/extension/spec.md "Thin ops over a deep library" — adopted as the home: all guard behavior lives in `lib/stale.mjs`, the dispatcher only consults.

## Non-Goals

- No fresh-spawn execution of mutating ops (the refusal names the fresh-node command; the operator runs it).
- No doc-law changes (PF-34/PF-38 track the skills/role-doc halves; out of scope).
- No behavior change to validate/archive semantics beyond the pre-dispatch staleness path; no verdict re-running, no guard in library functions.
- No staleness tracking of the project's `cdd/` store — store writes are not staleness.

## Decision alignment

This change follows, and does not supersede, the decisions that govern the touched
files (`index.ts`, `lib/*.mjs`):

- **ADR-0002 (the harness is the counterparty):** the staleness refusal is exactly the
  kind of structure that decision demands — a hard gate the model can read but never
  negotiate. The verdict ops keep answering (warned, additive); the pair-commit rhythm
  and the command-first door-1 handlers are untouched.
- **ADR-0007 (the law behind every door):** `lib/stale.mjs` states no grammar of its
  own — no fence, pin, or gherkin law is restated there; it only consults the files the
  grammar module already governs.
- **ADR-0012 (comments are shape-only):** every comment added in `index.ts`,
  `lib/stale.mjs`, and the tests describes code shape only — no decision ids, finding
  ids, or corpus pointers.

## Capabilities

- extension: cdd/specs/extension/spec.md — one ADDED requirement (the staleness guard); extension holds 7 requirements, under every Tier A threshold.

Done-When: a long-lived tool process whose extension source changed on disk refuses op archive with exactly 1 error naming a changed file and a fresh-node command, and the store is not mutated (no archive folder appears)
Done-When: the same stale process answers op validate with the verdict plus exactly 1 staleness warning naming a changed file
Done-When: a file added to, removed from, or same-length-rewritten (original mtimeMs preserved) on the guard surface after load counts as stale — membership and content digest, not just mtime
Done-When: a clean process (loaded after all edits) dispatches every op with no staleness refusal or warning — npm test exits 0 with all pre-existing round-trip pins unchanged
Done-When: this change's own Close archive op runs through the fresh-node path the guard names, with the archived folder and stamped metrics.md on disk
Code: index.ts, lib/stale.mjs, tests/tools.mjs, tests/acceptance/stale-lib-guard.test.js
