## MODIFIED Requirements

### Requirement: The ADR claims index is single-sourced

The ADR claims index (decision frontmatter parsed into id, file, status, supersedes, title, and code globs), the glob matcher that turns a code glob into the set of files it claims, and the ADR status vocabulary are defined exactly once in a zero-dependency door module, `scripts/adr-index.mjs`; the drift guard and the tool ops import them and none re-states the parsing, the matcher, or the vocabulary. The decision scan — the ordered walk over the decision directories and the one frontmatter parse per file — is likewise defined exactly once in that module, exported behind explicit ingest flags: which directories to walk (a directory in the flag set that does not exist is skipped), whether only four-digit-prefixed file names count as decisions, and the fallback status when frontmatter states none. The claims index builds on the scan with the index preference, and the architecture extractor imports the same scan with its legacy preference (both decision directories, every .md name, fallback status unknown) and holds no private walk — the two doors differ by flags, never by a second scan. The claim map — which spec requirement's `Code:` globs claim which files, across living specs and open deltas, and which files each ADR governs — is likewise derived exactly once, by the builder in that module over the parsed spec models, the ADR index, and the tracked file list; the drift guard's gather pass and the tool ops library consume it and neither re-derives it — no second glob-to-regex translation, no private per-file claiming loop, no restated `Code:`-line scan. The store copy travels with the guard's copies.

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

Scenario: The decision scan is defined exactly once behind explicit flags
  Given the repository's claims-index and extractor sources after the change
  When scripts/adr-index.mjs and scripts/arch-extract.mjs are scanned for a decision-directory walk or a decision-frontmatter parse
  Then the walk and the parse appear exactly once, exported as scanDecisionFiles from scripts/adr-index.mjs behind explicit ingest flags — which directories to walk, whether only four-digit-prefixed names count, and the fallback status — and scripts/arch-extract.mjs holds no private walk and no decision-frontmatter import, calling the shared scan with its legacy preference
  # Verified by: tests/acceptance/decision-scan.test.js

Scenario: Index flags preserve the claims index surface
  Given a synthetic tree holding a numbered ADR with status frontmatter, a numbered ADR without status frontmatter, a numbered .md with no heading, a misnamed .md in cdd/decisions, and an .md under docs/adr
  When the scan runs with the index flags — cdd/decisions only, four-digit names only, fallback status accepted — and again with no flags at all, and the index projection is built over the rows
  Then both calls answer exactly the three numbered decisions, the frontmatter-less one carrying status accepted, the heading-less one answering the empty-string title, and the misnamed and docs/adr files are absent — the scan's defaults are the index preference; and with cdd/decisions absent from the tree the index flags answer no rows
  # Verified by: tests/acceptance/decision-scan.test.js

Scenario: Legacy flags preserve the extractor surface
  Given the same synthetic tree
  When the scan runs with the extractor's legacy flags — cdd/decisions and docs/adr, every .md name, fallback status unknown — and again with docs/adr absent from the tree
  Then every .md appears, the misnamed and docs/adr files included, and exactly the rows whose frontmatter states a status carry it, every other row carrying unknown; with docs/adr absent the rows cover cdd/decisions alone — and the projected rows, location, status, code, and title in the same order, equal the rows the extractor's private scan produced before the change on the same tree
  # Verified by: tests/acceptance/decision-scan.test.js
```

Code: scripts/adr-index.mjs, tests/acceptance/adr-index-agreement.test.js, tests/acceptance/claim-map.test.js, tests/acceptance/decision-scan.test.js
