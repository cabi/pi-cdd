# one-pass-one-close

## Why

The tool surface is shallow: the status op calls `status()` twice and validates every open change twice more inside (4 full validations per change per call), the archive flow is written twice — command handler and tool case — with payloads that already drifted apart, and every tool-surface file sits on the gherkin spec's `Code:` line, so any tool commit ages a spec it did not touch. The agents reading `cdd status` and `cdd archive` pay the latency; maintainers pay the twin.

## What Changes

- `lib/validate.mjs` derives both verdicts from one evaluation: errors carry a strictness tag, and a new `validateBoth(root, name)` returns `{draft, strict}` with the invariant *draft errors ⊆ strict errors* machine-checked. `validateChange`/`validateStore` keep their frozen shapes (ADR-0002).
- `lib/status.mjs` consumes `validateBoth` — one evaluation per change — and the status op handler answers from exactly one `status()` call feeding both payloads.
- `lib/store.mjs`'s `archiveChange` gates on strict validation itself: red changes get `{ok:false, stage:"strict-validation", validation}` and nothing moves; green changes merge and move unchanged. Both handlers (command and tool) render only.
- New capability `extension` owns the tool surface; the gherkin spec's `Code:` line narrows to gherkin's own files and tests.

## Solutions Considered

- extension: cache the `status()` call in the op handler (existing one-liner) — rejected: leaves two evaluations per change and the draft/strict subset relation unpinned.
- extension: shared archive helper inside index.ts — rejected: the close loop stays split across layers and any future caller can still skip the gate.
- extension: overload `validateChange` with `mode:"both"` — rejected: union return shape churns every verdict consumer, including the agent-facing op (ADR-0002 counterparty contract).
- gherkin: none needed — the capability keeps its law; only `Code:`-line bookkeeping travels (ADR-0007's law module is untouched).

## Non-Goals

- No status-ui rework (it already consumes the same status document).
- No separate `store` capability for `lib/store.mjs` — it stays on gherkin's `Code:` line.
- No guard (door 3) changes.

Done-When: the status op answers from exactly 1 `status()` call whose data feeds both the JSON and the view payload (node tests/tools.mjs)
Done-When: `archiveChange` refuses a strict-red change with `{ok:false, stage:"strict-validation", validation}` and no caller pre-gates (node tests/smoke.mjs && node tests/acceptance/extension-door1.test.js)
Done-When: draft errors ⊆ strict errors is machine-checked from one evaluation per change (node tests/smoke.mjs)
Done-When: the extension capability owns the tool-surface files — O single-owner and L2 staleness stay green on the full scan (node cdd/scripts/spec-drift.mjs)
Capabilities: extension (created), gherkin (Code:-line narrowing only)
Code: index.ts, lib/status.mjs, lib/status-ui.ts, lib/validate.mjs, lib/store.mjs, tests/smoke.mjs, tests/tools.mjs, tests/acceptance/extension-door1.test.js, cdd/specs/gherkin/spec.md
