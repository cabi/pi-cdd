---
status: accepted
code: index.ts, lib/*.mjs, lib/*.ts, scripts/*.mjs, .githooks/*
---
# Comments are shape-of-code documentation only

Source comments in this repository had become a second, hand-maintained
index of the cdd corpus. Pointer comments cited decisions and process
findings ("(ADR-0006)", "(PF-20: ...)", "never silently drop a guard
(bd4358b)"); file headers carried lessons and rationale the corpus already
owns; and the drift guard's header kept a prose catalogue of its own
checks that had already rotted twice: a cold R3 caught it missing the
then-new L4 tag, and the comments-are-shape-only audit found it also
missing the [G] and [H] tags the script emits today — two proven drifts in
one hand-written index. A pointer comment is a reverse index: static,
unverified, and silently wrong the moment the corpus moves. The corpus
already indexes code forward — Code: globs and Verified-by pins, enforced
by the doors — and the doors route an editor to the corpus at edit time
(A1 citations force the consultation). A comment that points back adds a
second, weaker copy of every index the corpus already carries.

**Decision.** Comments may only describe the code they sit in: the
module's or function's contract, the algorithm's reading order, and
observed caller behavior. Banned in comments: corpus routing of any form
(ADR ids, PF ids, spec or change names, commit ids); WHY-prose (lessons,
history, rationale — the corpus owns those); WHAT-restating (narrating
what the next lines obviously do); and hand-maintained indexes (any list
that mirrors facts the code or build derives). The drift guard's check
catalogue is machine-checkable: its header carries a `// Checks:` line,
and an acceptance pin asserts set equality with the tags the script
actually emits, both directions. Two allowances, settled with the human
sponsor: JSDoc one-liners on exports stay (they document the module's own
shape, which no corpus artifact owns), and test-local check-ids (MC9,
RF6, S33-style names) stay as names — but scenario-heading prose around
them goes: tests may not cite spec headings back, because the failure
output already names the id and the spec greps forward.

**Why.** Alternatives considered: extending rule 10 (no spec markers in
source) by interpretation (rejected — it names traceability markers, not
comment prose, and interpretation drifts; a decision records the line);
teaching the commit guard comment semantics so every adopting repo
enforces the law (rejected for now — a string-aware scanner in a
zero-dependency door script is a deliberate guard change if ever needed;
the acceptance pin runs with the project's own tests where the scanner's
false-positive risk is reviewed as code); generating the guard header
from its checks table at build time (rejected — no build step exists, and
a codegen lane for one comment block is a new moving part; the
set-equality pin delivers the same rot-loudness — a check added without
indexing it, or an index entry with no emitting check, fails the suite).
Sweep-only with no pin was rejected outright: the header's two drifts
happened precisely because nothing checked the catalogue.

**Consequences.** A comment can no longer tell a reader why a line exists
— the why lives one `git log` or one corpus grep away, and A1/A2 keep
that walk enforced at edit time. Editing any file named in this ADR's
code line now reconfirms this decision (A2), which is the point: comment
discipline is decided, not habitual. Rendered text is untouched: error
messages, scaffold templates, and the law strings may cite the corpus —
they are behavior or corpus data traveling through code, not comments.
Test comments keep check-ids but not spec headings, so a red suite names
its failing check while the spec stays the single forward index. The pin
deliberately does not match rule-N or door-N wording (collision-prone
natural language; grammar-law literally renders rule text as data) and
does not scan tests/ or the byte-identical door copies (P5 already pins
the copies); those lanes are swept convention, recorded here.

**Resolved.** Accepted before the loop ran: the human sponsor settled the
rule and both allowances with the director (delegated authority held
there); the comments-are-shape-only change drafted this ADR, enacted the
sweep, and landed the pins. cdd-adr-review runs on this ADR at Close.

- Reconfirmed by backlog-revalidate on 2026-10-23: the new code in index.ts and lib/backlog.mjs carries shape-only comments (no corpus routing); the standards-axis review caught the same-pattern violation in the new test's header (deleted), and the pre-existing test headers were minted as a backlog finding through the op.

- Reconfirmed by gitlab-ci-parity on 2026-10-23: the new comment lines live inside the CI_GITLAB scaffold output string (rendered text, explicitly exempt as "Rendered text is untouched"); the new test file' source comments follow the swept test-header convention (PF-24).

- Reconfirmed by adr-ops on 2026-10-24: the new scripts/adr-index.mjs and the scripts/spec-drift.mjs import refactor carry shape-only comments (what the module is and who consumes it — no law prose, no corpus routing); the guard's behavior surface is unchanged.
- Reconfirmed by spec-model on 2026-10-24: spec-model comments are shape-of-code only; the R3 standards finding trimmed the last WHY-prose sites
- Reconfirmed by guard-pure-checks on 2026-10-24: the new region markers and function comments describe module shape only; the R3 standards review found two WHY-prose blocks and both were trimmed before landing
- Reconfirmed by claim-map on 2026-10-24: lib/adr-ops.mjs comments document shape — module header and reworked op flow state contracts, no history narration
- Reconfirmed by ops-registry on 2026-10-24: moved comments stayed shape-only: the ops.mjs header dropped its corpus claim and test comments dropped their history
- Reconfirmed by decision-scan-unify on 2026-10-24: the scan's comments stay shape-of-code — region comments name the walk, filter, and parse, no history narration (R3 standards reviewed)
