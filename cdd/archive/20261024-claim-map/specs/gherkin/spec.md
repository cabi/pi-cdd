## MODIFIED Requirements

### Requirement: The ADR claims index is single-sourced

The ADR claims index (decision frontmatter parsed into id, file, status, supersedes, title, and code globs), the glob matcher that turns a code glob into the set of files it claims, and the ADR status vocabulary are defined exactly once in a zero-dependency door module, `scripts/adr-index.mjs`; the drift guard and the tool ops import them and none re-states the parsing, the matcher, or the vocabulary. The claim map — which spec requirement's `Code:` globs claim which files, across living specs and open deltas, and which files each ADR governs — is likewise derived exactly once, by the builder in that module over the parsed spec models, the ADR index, and the tracked file list; the drift guard's gather pass and the tool ops library consume it and neither re-derives it — no second glob-to-regex translation, no private per-file claiming loop, no restated `Code:`-line scan. The store copy travels with the guard's copies.

```gherkin
Feature: The ADR claims index is single-sourced

Scenario: The index builds one entry per ADR in the decisions home
  Given the repository's store holding its 13 ADRs in cdd/decisions/
  When the claims index is built
  Then it holds exactly 13 entries, one per ADR, each carrying its ADR id, its store-relative file path, its frontmatter status, its title from the first heading, the code globs from its frontmatter, and a supersedes field that is null for every entry (this corpus records supersession in prose, not frontmatter)
  # Verified by: tests/acceptance/adr-index-agreement.test.js

Scenario: The op and the guard answer the same governing set
  Given a synthetic git repository whose store holds exactly 2 accepted ADRs with overlapping code claims and 1 open change whose delta spec claims a file both ADRs govern
  When the door 3 full scan and the cdd tool's adrs op with the claimed file both answer
  Then the ADR citations in the scan's A1 findings and the op's governing set name exactly the same 2 ADR ids
  # Verified by: tests/acceptance/adr-index-agreement.test.js

Scenario: No consumer re-states the matcher
  Given the repository's guard and op sources after the change
  When scripts/spec-drift.mjs, lib/adr-ops.mjs, and scripts/adr-index.mjs are scanned for a glob-to-regex translation
  Then the translation is defined exactly once, in scripts/adr-index.mjs, and every other file only imports it
  # Verified by: tests/acceptance/adr-index-agreement.test.js

Scenario: The claim map is derived exactly once
  Given the repository's guard, ops library, and claims-index sources after the change
  When scripts/spec-drift.mjs, lib/adr-ops.mjs, scripts/adr-index.mjs, and scripts/grammar-law.mjs are scanned for a per-file claiming loop, a glob-to-regex translation, and a private Code-line scan
  Then the claiming loop appears exactly once, in scripts/adr-index.mjs, and lib/adr-ops.mjs holds no glob-to-regex use and no Code-line scan — its governing answers and its open-delta claims come from the shared claim map — and scripts/spec-drift.mjs holds no glob-to-regex use, its claim answers reading the same map — and scripts/grammar-law.mjs holds no claiming loop, its shared parse compiling the Code: globs it reads without claiming files
  # Verified by: tests/acceptance/claim-map.test.js

Scenario: The op answers from the shared claim map
  Given the repository's store, its tracked files, and an untracked path matching a governing ADR glob
  When the cdd tool runs op adrs with code for a tracked claimed file and for the untracked path and the claim map's per-path governing query answers the same two paths
  Then each op answer equals the map's query answer for that path, the tracked and the untracked path alike
  # Verified by: tests/acceptance/claim-map.test.js
```

Code: scripts/adr-index.mjs, tests/acceptance/adr-index-agreement.test.js, tests/acceptance/claim-map.test.js

### Requirement: The drift guard gathers once, then checks purely

The drift guard's laws MUST read a single gathered facts snapshot — files on disk, per-spec models from the single parse, resolved pins, git state including the staged/pre-commit distinction, and open-change claims — collected by one gather pass per run. The claim sets in that snapshot — per-file owners, per-ADR governed files, and open-change claims — enter it through the shared claim-map builder imported from the claims-index module; no gather helper and no law re-derives them locally. Every law (A, G, H, L1, L2, L3, L4, M, O) MUST be a pure function of that snapshot that returns findings without touching the filesystem, git, or the console; the runner alone maps findings to the report. Gathering is the only I/O seam: all filesystem and git access in the guard MUST live in the gather pass, and report writing in the runner.

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
