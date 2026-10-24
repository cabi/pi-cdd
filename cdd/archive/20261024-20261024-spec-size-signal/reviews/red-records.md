# Red records — 20261024-spec-size-signal

RED-first evidence, observed from the start (in-store). Every entry: command, observed output, date. Fresh-node law (PF-35): after the first edit to lib/validate.mjs lands, every verdict that must exercise the edited code is read from a fresh `node -e` process — the long-lived cdd tool process may hold pre-edit code.

## 0. Pre-implementation observations (M2, before any code edit — tool process still trustworthy, no lib/validate.mjs edit has landed)

### 0.1 Premise: no size signal exists today

Command:

    grep -n "threshold" lib/validate.mjs

Observed (2026-10-24, M1):

    (0 matches — exit 1)

### 0.2 Tier B cannot fire on this change's own delta yet (the BEFORE half of the self-application record)

This change's delta (cdd/changes/20261024-spec-size-signal/specs/gherkin/spec.md) ADDEDs into gherkin — a living spec holding 50 requirements (≥ 12) — and is deliberately authored WITHOUT a `split-considered:` line. Under the law this change itself proposes, that state must warn. Today it cannot: the signal does not exist in code.

Command:

    cdd tool validate op (change: 20261024-spec-size-signal, mode: draft)

(Same validator module the CLI would load. No lib/validate.mjs edit has landed at this point, so the long-lived tool process is truthful per PF-35; from the first code edit on, this file cites fresh `node -e "import('./lib/validate.mjs')…"` processes only.)

Observed (2026-10-24, M2):

    PASS

Draft-green, zero warnings — the delta (ADDED into a 50-requirement living spec, no split-considered line) validates silently today. This is the BEFORE half of the self-application record; the AFTER halves (Tier B fires, then silent with the line) land at M3 from fresh-node processes.

### 0.3 Placeholder-red baseline (scaffold discipline)

Command (at M1, before authoring):

    cdd validate 20261024-spec-size-signal --mode draft

Observed (2026-10-24, M1):

    FAIL
      error: 20261024-spec-size-signal/tasks.md: template placeholders still unfilled
      error: 20261024-spec-size-signal/specs/gherkin/spec.md: template placeholders still unfilled

## 1. Acceptance pin RED (task 3.2, M3 — pre-implementation)

Command (run before any lib/validate.mjs edit; the pin imports the real module itself):

    node --test tests/acceptance/spec-size-signal.test.js

Observed (2026-10-24): exit 1, zero passing subtests — all six red on missing signal warnings. Representative failures (full output preserved in the M3 ask):

    ✖ Tier A — over-threshold requirement count warns once in both modes
      AssertionError: draft wants exactly 1 count warning, got []
      0 !== 1
    ✖ Tier B — a split-considered line satisfies the demand
      AssertionError: only the count line remains, got []
      0 !== 1
    ✖ Never blocks — all four signal warnings leave ok true in both modes
      AssertionError: draft sees all four, got []
      0 !== 4

Every failure is the same shape: `signalWarnings` finds nothing because the signal does not exist yet — the intended RED.

## 2. Self-application, fresh-node (task 3.5, M3 — fire, then silent)

BEFORE — delta authored without the decision line, fresh node (`node -e "import('./lib/validate.mjs')…validateBoth('.', '20261024-spec-size-signal')"`), observed 2026-10-24:

    DRAFT ok=true
    DRAFT warning: spec-size: living spec "gherkin" holds 50 requirements (>= 12) — split signal: consider splitting the spec
    DRAFT warning: spec-size: living spec "gherkin" requirements at or over 8 scenarios: Gherkin subset limits, Loop law names three review points, Code lines claim implementation surface, never decision memory, The ADR claims index is single-sourced — split signal: consider splitting these requirements
    DRAFT warning: spec-size: ADDED "Spec-size signal" grows "gherkin" past 12 requirements — record a split-considered decision line in the delta or split the change
    STRICT ok=false (5 unchecked tasks — mid-M3 state, no signal error)
    STRICT warning: (the same three lines)

Tier B FIRES on this change's own delta in both modes; Tier A's two lines ride along (fat aggregation names exactly the corpus tail 11/11/9/8); draft ok=true with 3 standing warnings — never blocks.

AFTER — decision line added at the TOP of the delta file (above `## ADDED Requirements`), same fresh-node command:

    DRAFT ok=true warnings=2
    DRAFT warning: spec-size: living spec "gherkin" holds 50 requirements (>= 12) — split signal: consider splitting the spec
    DRAFT warning: spec-size: living spec "gherkin" requirements at or over 8 scenarios: Gherkin subset limits, Loop law names three review points, Code lines claim implementation surface, never decision memory, The ADR claims index is single-sourced — split signal: consider splitting these requirements
    STRICT split-considered warnings=0
    STRICT warnings=2

The demand is satisfied by the line; the Tier A standing lines remain (they measure the living spec, not the delta's decision). DW4's live observation complete: fires before, silent after.

## 0.4 Strict-mode RED-first baseline (M2 close, pre-implementation)

Command:

    cdd tool validate op (change: 20261024-spec-size-signal, mode: strict)

Observed (2026-10-24, M2): FAIL with exactly 12 errors — 6 × unchecked task (1.1, 3.1, 3.2, 3.3, 3.4, 3.5) and 6 × `scenario "…" pins "tests/acceptance/spec-size-signal.test.js" but that file does not exist` (all six scenarios). No other error. This is the RED-first shape: the pin file is the next work item (task 3.2). Matches the R2 reviewer's independent observation (fresh node) — same 12-error shape.
