## ADDED Requirements

### Requirement: Source comments are shape-of-code documentation only

Comments on the harness source surface MUST describe only the code they sit in: the module's or function's contract, the algorithm's reading order, observed caller behavior. Comment text MUST carry no corpus routing: no decision ids, no process-finding ids, no commit ids, no cdd corpus paths, no spec-heading citations. Rendered text (error messages, scaffold templates, law strings) is behavior or corpus data, not comments, and is exempt. Test files keep check-ids as names by allowance; their scenario-heading prose is swept by this change and rests as convention, not on the pin.

```gherkin
Feature: Source comments are shape-of-code documentation only

Scenario: Comment scan reports zero corpus routing
  Given the harness source surface index.ts, lib/, scripts/, and .githooks with comment text isolated from strings by a string-aware scanner
  When the comment-law acceptance pin scans that comment text for decision ids, process-finding ids, commit ids, cdd corpus paths, and spec-heading citations
  Then the scan reports exactly 0 banned patterns and the pin exits 0
  # Verified by: tests/acceptance/comment-law.test.js

Scenario: Corpus routing in comments fails the suite
  Given a source file on the scanned surface whose comment text cites a decision id
  When the comment-law acceptance pin scans it
  Then the pin names the file, the line, and the banned pattern, and exits non-zero
  # Verified by: tests/acceptance/comment-law.test.js
```

Code: lib/context.mjs, lib/gherkin.mjs, lib/help.mjs, lib/instructions.mjs, lib/loop-law.mjs, lib/store.mjs, lib/templates.mjs, lib/validate.mjs, scripts/*.mjs, .githooks/*, tests/acceptance/comment-law.test.js

### Requirement: The drift guard's check index is machine-pinned

The drift guard scripts/spec-drift.mjs MUST document the check tags it emits in one machine-readable header line (`// Checks:`), and the documented set MUST equal exactly the set of tags the script emits across its issue lines and informational skip lines — an unindexed check or a stale index entry fails the suite.

```gherkin
Feature: The drift guard's check index is machine-pinned

Scenario: Header check line equals the emitted check tags
  Given scripts/spec-drift.mjs carrying a header line that names its check tags and issue lines each tagged with the check that raised them
  When the guard header-index acceptance pin compares the documented tag set with the emitted tag set
  Then the 2 sets contain exactly the same tags and the pin exits 0
  # Verified by: tests/acceptance/guard-header-index.test.js

Scenario: An unindexed check fails the pin
  Given scripts/spec-drift.mjs emitting a check tag its header line does not name
  When the guard header-index acceptance pin compares the 2 sets
  Then the pin names the undocumented tag and exits non-zero
  # Verified by: tests/acceptance/guard-header-index.test.js
```

Code: scripts/spec-drift.mjs, tests/acceptance/guard-header-index.test.js

### Requirement: Comment-shape ADR is drafted

`cdd/decisions/` MUST hold ADR-0012 recording that source comments are shape-of-code documentation only — banned: corpus routing, WHY-prose, WHAT-restating, hand-maintained indexes; allowed: JSDoc one-liners on exports and test-local check-ids — enacted by a comment sweep plus suite pins over guard-side enforcement. The requirement claims its enforcement pin, not the ADR itself — decision memory answers to the A-checks.

```gherkin
Feature: Comment-shape ADR is drafted

Scenario: ADR-0012 states the comment-shape decision
  Given the decision directory cdd/decisions/
  When ADR-0012 is read
  Then its frontmatter status is accepted (set at drafting under the sponsor's delegated authority) and its body records the comment law, both allowances, and the header-rot evidence that motivated it
  # Verified by: tests/acceptance/comment-shape-adr.test.js

Scenario: The guard holds no violation naming ADR-0012
  Given ADR-0012 with frontmatter status accepted
  When the drift guard runs over the repository
  Then the guard output holds no violation naming ADR-0012
  # Verified by: tests/acceptance/comment-shape-adr.test.js
```

Code: tests/acceptance/comment-shape-adr.test.js
