# R1 proposal review — backlog-revalidate

**Reviewer form:** cold sub-agent session (fresh session, briefed only from paths on disk).
**Reviewer model family:** opencode-zen (deepseek-v4-pro) — differs from the author's family zai (glm-5.3), verified from `PI_PROVIDER`/`PI_MODEL` at runtime.
**Repository state:** HEAD `bef3546` (matches the pinned base); the change artifacts under `cdd/changes/backlog-revalidate/` are UNCOMMITTED/untracked in the working tree (branch `backlog-revalidate`). No `design.md` exists — the design gate answered T2/T4 NO, so the short design note in `tasks.md` §2.1 is the design record (rule 2c: no design document required).
**Scope:** proposal.md + the design-gate record in tasks.md §2.1 (read input). Delta and tasks are out of scope.

## Findings

### [should] R1-F001 — "no tool-schema change" claim in the design note is inaccurate

- **Severity:** should
- **Disposition:** fixed: tasks.md §2.1 revalidate bullet reworded to "no new op; the backlog op's action enum in OPS_DOC gains revalidate, derived from the exported ACTIONS table" — the enum edit is now named in the design record.
- **Evidence:** `index.ts:110` defines the backlog op's action parameter as `enum: ["list", "add", "resolve"]`; `index.ts:360` hardcodes the unknown-action refusal `(allowed: list, add, resolve)`. Adding a `revalidate` action necessarily extends that enum and the refusal — both are part of the op's tool schema.
- **Evidence status:** Trace-backed
- **Preconditions:** none — the claim is read directly against the current schema.
- **Trace:** proposal What Changes bullet 2 ("New backlog action `revalidate`") → design note claims "no schema change" → `index.ts:110` action enum must gain `"revalidate"` for the action to be accepted by `parseOptions`.
- **Expected:** the design note states the schema surface accurately.
- **Actual:** the note claims no schema change while the action enum (a schema field) must change.
- **Smallest safe fix:** reword to "no new op; the backlog op's action enum gains `revalidate`" (or drop the "no tool-schema change" clause).

### [note] R1-F002 — single-sourcing covers messages but not the action enum

- **Severity:** note
- **Disposition:** fixed: the design record now derives the OPS_DOC action enum from the exported ACTIONS table too (tasks.md §2.1 enumeration bullet), so refusal, silent-exec message, and enum share one source. The op description string keeps its status list — statuses are separately single-sourced from lib/backlog.mjs's STATUSES by the smoke pins, and the description enumerates no actions.
- **Evidence:** `lib/backlog.mjs:22` (silent-exec message) and `index.ts:360` (refusal) are the two messages named; `index.ts:110` (action enum) and `index.ts:106` (op description) are two further hardcoded enumerations of the action list not named as single-sourced.
- **Evidence status:** Trace-backed
- **Preconditions:** none.
- **Trace:** the proposal scopes single-sourcing to "refusal and silent-exec messages"; the action enum at `index.ts:110` remains a separate hardcoded list that must agree with the exported `ACTIONS` table.
- **Expected:** one source of truth for the action list, or an explicit statement of which enumerations stay manual.
- **Actual:** the enum (and the op description) remain second sources of truth for the action list.

### [note] R1-F003 — freehand-exception count change is spec-visible but not named in the Capabilities parenthetical

- **Severity:** note
- **Disposition:** fixed: the Capabilities parenthetical now names "+ premise backfill as a second freehand line-edit exception", the delta's restated rubric scenario reads "the only 2 freehand exceptions", and task 3.7 pins the new count in smoke.
- **Evidence:** `cdd/specs/gherkin/spec.md:1225` pins "direct note edits that keep the grammar as the exactly 1 freehand exception". Adding premise backfill as a second freehand exception changes "exactly 1" to "exactly 2" — a spec-visible wording change the delta must capture.
- **Evidence status:** Trace-backed
- **Preconditions:** none.
- **Trace:** proposal What Changes bullet 5 → the triage skill's "exactly 1 freehand exception" becomes two exceptions → the MODIFIED requirement's scenario at `cdd/specs/gherkin/spec.md:1225` must be reworded.
- **Expected:** the Capabilities section names every spec-visible change the delta will carry.
- **Actual:** the parenthetical names only "three revalidation laws"; the freehand-exception count change is in What Changes but not surfaced in the Capabilities mapping.
- **Smallest safe fix:** extend the Capabilities parenthetical to name the freehand-exception change (e.g. "three revalidation laws + a second freehand line-edit exception").

## Coverage and verification

- Read: `proposal.md`, `tasks.md` §2.1 (design-gate record), `cdd/rules.md`, `cdd/specs/gherkin/spec.md` (the two named requirements), `cdd/specs/extension/spec.md` (the named requirement), `lib/backlog.mjs`, `index.ts`, `lib/help.mjs`, `lib/templates.mjs`, `cdd/backlog.md`, `cdd/scripts/spec-drift.mjs` (glob compiler), archive inventory, `cdd/decisions/` inventory.
- Verified: all three capability names exist in the living spec and map to the owning capability; the design-gate T1–T5 answers are credible (T1 cross-cutting YES is correct — triage skill + backlog op + rule 13 text = gherkin ×2 + extension ×1; T2/T3/T4/T5 NO check out; only one open change exists); reuse-first is searched (Solutions Considered names the existing triage skill and the guard's `globToRe` compiler, both real); all four Done-When lines are observable commands/checks; Non-Goals fence the work and every What Changes item is sponsored by a Done-When.
- No blockers. Three advisory findings (1 should, 2 notes), all disposition `open`.
