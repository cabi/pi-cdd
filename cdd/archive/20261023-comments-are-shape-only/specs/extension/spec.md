## ADDED Requirements

### Requirement: Extension-surface comments are shape-of-code documentation only

Comments on the extension surface — index.ts, lib/status-ui.ts, and lib/backlog.mjs — MUST describe only the code they sit in: the module's or function's contract, the algorithm's reading order, observed caller behavior. Comment text MUST carry no corpus routing: no decision ids, no process-finding ids, no commit ids, no cdd corpus paths, no spec-heading citations. Rendered text (error messages, status strings) is behavior, not comments, and is exempt. The comment-law pin scans this surface together with the gherkin-owned surface under the same requirement family.

```gherkin
Feature: Extension-surface comments are shape-of-code documentation only

Scenario: Comment scan reports zero corpus routing on the extension surface
  Given the extension source surface index.ts, lib/status-ui.ts, and lib/backlog.mjs with comment text isolated from strings by a string-aware scanner
  When the comment-law acceptance pin scans that comment text for decision ids, process-finding ids, commit ids, cdd corpus paths, and spec-heading citations
  Then the scan reports exactly 0 banned patterns and the pin exits 0
  # Verified by: tests/acceptance/comment-law.test.js
```

Code: index.ts, lib/status-ui.ts, lib/backlog.mjs
