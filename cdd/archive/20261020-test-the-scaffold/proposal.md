# test-the-scaffold

## Why

The test suites hand-write fixture artifacts the scaffold would have produced, so the template↔validator contract is unpinned: the double "## 4. Close" bug in tasksTemplate shipped green because no test ever drove a real scaffold through a real verdict. S30 pins the tasks pair alone; every other template rides untested.

## What Changes

- One round-trip check (S32) drives the chain createChange → draft red on placeholders → minimal fill relative to the template output → strict green → archiveChange merges into the living spec.
- The 5 duplicated hand-written proposal fixtures collapse into one dedup-only helper (validator fixtures stay minimal-valid, not scaffold-derived).

## Solutions Considered

- gherkin: the existing smoke suite (S4 placeholder-red, S30 tasks pair) — adopted as the home; the chain extends the same sandbox pattern instead of adding an acceptance file that would need an L1 pin and a Code line for a lib-level test.

## Non-Goals

- S29's TUI internals poke (`split("selectedBg")`) — different disease: the TUI has no observable render to assert on; a future change.
- Splitting a "store" capability out of gherkin's Code line — recorded as a possibility, waits until it hurts.
- Rebasing edge-case fixtures (bad pins, corrupt deltas) onto the scaffold — defects are the point there; hand-writing stays.

Done-When: node tests/smoke.mjs green with S32 pinning scaffold → draft-red → fill → strict-green → archive merge
Done-When: the 5 duplicated proposal fixture strings are gone, one helper serves all
Code: tests/smoke.mjs, lib/templates.mjs
