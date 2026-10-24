# Delta — guard-pure-checks

## ADDED Requirements

### Requirement: The drift guard gathers once, then checks purely

The drift guard's laws MUST read a single gathered facts snapshot — files on disk, per-spec models from the single parse, resolved pins, git state including the staged/pre-commit distinction, and open-change claims — collected by one gather pass per run. Every law (A, G, H, L1, L2, L3, L4, M, O) MUST be a pure function of that snapshot that returns findings without touching the filesystem, git, or the console; the runner alone maps findings to the report. Gathering is the only I/O seam: all filesystem and git access in the guard MUST live in the gather pass, and report writing in the runner.

```gherkin
Feature: The drift guard gathers once, then checks purely

Scenario: Gathering is the only I/O seam
  Given the repository's guard source after the change
  When the pure-check region of the guard is scanned for filesystem, git, and console access
  Then no law function in the region reads the filesystem, calls git, or writes to the console — every such access sits in the gather pass or the runner
  # Verified by: tests/acceptance/guard-pure-checks.test.js

Scenario: A pure check runs on facts alone
  Given a facts snapshot built entirely in memory holding 1 living spec with 1 unresolved pin and no git repository on disk
  When the L1 law's pure check runs on the snapshot
  Then it returns exactly 1 forward-pin finding naming the pin and the spec, without touching the filesystem or git
  # Verified by: tests/acceptance/guard-pure-checks.test.js
```

Code: scripts/spec-drift.mjs, cdd/scripts/**, tests/acceptance/guard-pure-checks.test.js
