<!--
TASKS — how to fill and work this file (verified checklist traced to Done-When)

Before writing tasks, re-read the proposal's Done-When lines. If any
criterion is not observable as written, resolve it with the user first.

Format:
- Group tracked tasks under ## numbered headings; every tracked task is a
  checkbox "- [ ] X.Y Task" and MUST end with its verification:
  "verify by <command, test, or observable check>". A task without a
  verification is a wish, not a task.
- Phrase each task as the interface it establishes ("Reporter emits a CSV
  header row"), never as an activity ("implement reporting"). Work each
  task red-green-refactor: write the failing unit test that names that
  interface, implement the smallest code that turns it green, refactor
  freely. Unit tests are engineering artifacts born during apply — they
  churn with the design and are never pinned in the spec.
- Order by dependency. Keep each task small enough to finish in one session.
- Turn the design gate's open questions into early tasks. Keep a
  "## Design Notes" section only for decisions the design gate did not cover.
- Follow the implementation steps with "## Done When Traceability": a table row per proposal criterion —
  "| <criterion> | <task ids that verify it> |". If a criterion has no task,
  add the task or fix the criterion.

Scale rule: more than 8 implementation subtasks is the split signal — run
the split procedure at the design gate; more than 12 fails strict validation.
The split: read the traceability table (it is the split map), cut into N
proposals each with its own Done-When subset and its own delta, record
"Depends on:", supersede the original (never delete it). A genuinely atomic
change that must exceed 12 records a "split-considered: kept whole because
<reason>" line in this file instead.

Apply protocol: work strictly top-to-bottom, one task at a time. Tick a box
only after its verification passes ("checked" means "its verification
passed", never "I am done looking at it"); re-read this file after each
tick. If a verification fails, uncheck and fix — never continue on a red
check. Group-local testing: each group lands the unit tests its own work
calls for; a final group runs the scenarios' acceptance tests end to end.

Review tasks: task 3.1 (Change review) runs cdd-spec-review
in package mode at draft-green — the package drafted, validate draft green,
before the first implementation task ticks — findings at reviews/r2-change-review.md.
The Close review tasks run before archive: cdd-code-review (findings
at reviews/r3-code-review.md) and, if the change drafted an ADR or amended one's decision content — a Reconfirmed-by paragraph or a typo fix does not count,
cdd-adr-review (findings at reviews/adr-review.md).
A review reports advisory findings (severity blocker/should/note + disposition), never
verdicts: it ticks only when no blocker is open, and the
deterministic validators keep gate authority. Reviews run cold (rule 2b): the reviewer is not the author of the artifacts under review — every model-run review (R2, R3, ADR) is a fresh cold sub-agent session briefed from paths on disk; a same-session re-read is the weaker fallback and records its form and justification in the findings file header.

Anti-scope-creep: no task may exist without a spec requirement or Done-When
criterion that needs it. Improvements no criterion demands go back to the
proposal as Non-Goals or a future change.
-->

# Tasks — loop-law-hardening

## 1. Context

- [x] 1.1 Read the living spec and every file matching the proposal's Code: globs

## 2. Design

Law hardening, decided at the gate — one clause placement per clause:

- **Clause 1 (author-family) extends rule 2b in the law module.** A new `REVIEWER_INDEPENDENCE` fact (`familySeparation`) renders one more sentence in `lawRule2b()`: the cold reviewer's model family MUST differ from the author's (family = same provider or model lineage), and when no other-family reviewer can run the loop stops and asks the human sponsor — never silently degrade — with any lawful fallback recording its form and justification per the existing recording duty. Wording is vendor-neutral and relative (no vendor names in law; concrete families appear only in briefs and findings records). Compact surfaces (ambient/help/instructions) stay unchanged: they render compact phrases, and family separation is law content, like the rest of rule 2b beyond the compact phrase.
- **Clause 2 (two-axes-two-sessions) is session law in rule 2b plus a cross-reference in rule 2a.** Rule 2b gains: R3's standards and spec axes run as two separate cold sessions, each with its own brief — one session doing both axes leaks the first axis's framing into the second. Rule 2a's R3 sentence gains a parenthetical cross-reference only (no restatement). R3 keeps ONE findings file `reviews/r3-code-review.md` (REVIEW_POINTS facts, tasks-template wiring, and RW/SSL pins stay intact); each session writes its axis section into it.
- **Clause 3 (re-tick) is a new literal rule 11a** ("Ticks are claims, not history") in `lib/templates.mjs` `RULES_MD` — rules 3–12 are literal text there. It covers both voiding forms: a Close-phase review finding AND a door refusal (guard A2 reconfirm mid-Close) void a tick; un-tick, edit, re-run the item's verify-by, record the re-tick inline (`re-verified after <review point>`); an unrecorded re-edit of a ticked artifact is a blocker at archive. Tasks scaffold comment stays untouched (the law is the statement; the scaffold already carries tick discipline).
- **Clause 4 (pin-realism) is one sentence inside literal rule 7** (Test-first, the pin-authoring section): a pin for door behavior invokes the door's real entry point — a real module import or a child-process run — never a copied fragment; a sandbox-only pin is a note-level finding at R3.
- **Brief templates are static files on disk, not law-module output.** Their consumers are cold reviewer sessions, not code; the law stays single-sourced in `lib/loop-law.mjs`, and the briefs CITE rule ids without restating law text (no second law home). Drift risk (brief vs law) is bought down by smoke pin S36 (five files, law tokens, findings grammar, output filename per reviewPoint) plus acceptance pins on the skeleton duties.
- **Cleanup is sponsored, not smuggled.** The dead `const law` binding + feeding `lawPath` line at tests/acceptance/review-wiring.test.js:20-21 are removed by an explicit task with the suite green as its verify-by, and the proposal's Done-When names it; the guard's mechanical-change fence forbids touching this file under a Mechanical-Change trailer, so this path — honest sponsorship inside a change — is the only lawful one.
- **ADR treatment: ADR-0010 is amended, 0008/0009 reconfirmed.** the archived reviewer-not-author proposal deferred family separation as a Non-Goal ("a same-family cold reviewer is lawfully cold"); ADR-0010 itself is silent on family. Clause 1 turns that deferral into law with a stop-and-ask duty. That reverses one recorded alternative-weighting inside ADR-0010's decision → a dated Amendment section in ADR-0010 (chosen over superseding: the core decision — independence as rule 2b law — stands, one constraint tightens; chosen over keeping guidance: the incident class it prevents — silent same-family self-review — is exactly what rule 2b exists to prevent). Amendment = decision-content change → `cdd-adr-review` runs on ADR-0010 at R3 (rule 2a). ADR-0008 and ADR-0009 get Reconfirmed-by paragraphs only (this change edits files under their code globs: templates.mjs, loop-law.mjs, cdd/rules.md, skills).
- **Briefs-before-delta is sanctioned bootstrap ordering.** Task 2.2 creates the five brief templates in the Design phase — before the delta — so R1 and R2 instantiate real templates instead of improvised briefs (director-confirmed at the handshake); their spec coverage is the ADDED requirement "Reviewer briefs live next to their skills".

- [x] 2.1 Design gate — T1 cross-cutting YES (the four clauses must reach the law module, two literal rule texts, the store byte-mirror, three skill files, five new brief files, a smoke pin, an acceptance pin file, and ADR-0010's amendment at once — nine-plus surfaces in three artifact families); T2 architecture bet YES (the bet: reviewer briefs land as static markdown next to the skills, cited-by pointer from each SKILL.md, structurally pinned by smoke — NOT rendered from `lib/loop-law.mjs`; the trade is a drift risk between brief prose and law text, bought down by pinning law tokens, findings grammar, and output filenames inside the briefs; the alternative — briefs as module templates — was rejected because it would make the law module a second home for procedural prose and multiply mirrored surfaces for no machine-checked gain); T3 shared seam YES (`lib/loop-law.mjs` renders rules 2/2a/2b, `lib/templates.mjs` `RULES_MD` owns the literal rules 3–12 text, and `cdd/rules.md` must stay the byte mirror of their composition (SSL3); the briefs must cite rule ids without ever restating law text, or they fork the seam); T4 invariant risk YES (SSL1 pins REVIEW_POINTS exact facts — R3's single findings path must survive the two-session split; SSL2/SSL3 byte mirrors; RI1/RI3/RI5 pins on rule 2b's exact phrases and the skills' tokens; RW pins on rule 2a's tokens; S33/S34 skill and tasks-template pins; guard A1/A2 over ADR-0008/0009/0010 globs requiring citations plus same-commit reconfirm touches); T5 parallel work NO (one author, sequential: module → literal texts → mirror → briefs → skills → tests → ADRs; no parallel streams), verify by this line naming all five answers
- [x] 2.2 (re-verified after R1; re-verified after R2; re-verified after R3 — r3-standards smell list aligned to the skill's verbatim baseline, r3-spec/adr inputs line covers uncommitted working trees, adr brief states the four criteria inline and fixes the A0/A1/A2 pointer and output-path branch — session-requirements bullet now has the reviewer verify its own family from its runtime environment, r2 artifact/design-tick/REMOVED-qualifier/instantiation-checklist fixes — template friction fixes applied to all five briefs: law citation on the family line, reviewer-reports-open disposition grammar, r1 inputs + §2.1 scope exception + Capabilities-section check) The five reviewer brief templates exist on disk next to their skills — `skills/cdd-spec-review/brief-r1.md`, `skills/cdd-spec-review/brief-r2.md`, `skills/cdd-code-review/brief-r3-standards.md`, `skills/cdd-code-review/brief-r3-spec.md`, `skills/cdd-adr-review/brief-adr.md` — each carrying the common skeleton (change identity · reviewer session requirements incl. not the author's family and two-axes-two-sessions where applicable · inputs as pinned-state paths · scope fence · findings grammar · output filename per reviewPoint().findings · advisory-only line) and its per-type MUST-DELIVER checklist, with a one-line pointer added to each of the three SKILL.md files, verify by the five files on disk carrying skeleton, checklist, findings grammar, and output filename, and grep finding a brief pointer line in each SKILL.md


## 3. Implementation

- [x] 3.1 Change review — once the package is drafted (proposal, delta, tasks on disk) and `cdd validate` draft mode passes, run skill `cdd-spec-review` in package mode over the whole change package; findings at `reviews/r2-change-review.md`; dispose every blocker (fixed:/open/won't-fix:) and record dispositions — ticks only when no blocker is open, verify by reviews/r2-change-review.md holding no open blocker
- [x] 3.2 (re-verified after R3 — LLH1 now pins the rule-2b-governs-both-axes cross-ref, LLH6 pins the cold-session rule and the normative family sentence, LLH10 added for ADR-0011; full suite re-run green) Acceptance pin file written RED first — `tests/acceptance/loop-law-hardening.test.js` pins every new and modified scenario in the delta (family + two-sessions + 2a cross-reference rendered from the module; rules 11a and 7 read in the mirror byte-identical to `RULES_MD`; brief skeleton + MUST-DELIVER checklists + SKILL pointers; ADR-0010 amendment + 0008/0009 reconfirms; cleanup), verify by node --test tests/acceptance/loop-law-hardening.test.js failing before any implementation lands (RED recorded in the test run output)
- [x] 3.3 (re-verified after R3 — familySeparation/familyEscape/twoAxes facts now interpolate into lawRule2b() instead of dead hardcode; mirror regenerated; SSL3 + LLH suite green) Author-family clause in the law module — `REVIEWER_INDEPENDENCE` gains the family-separation fact and `lawRule2b()` renders the sentence: reviewer's model family differs from the author's (same provider or model lineage), stop and ask the human sponsor when no other-family reviewer exists, never silently degrade; vendor-neutral wording; compact surfaces unchanged, verify by the family scenarios of tests/acceptance/loop-law-hardening.test.js green and tests/acceptance/reviewer-independence.test.js still green
- [x] 3.4 Two-axes-two-sessions clause — rule 2b gains the normative sentence (standards and spec axes run as two separate cold sessions, each with its own brief) and rule 2a's R3 sentence gains the parenthetical cross-reference only, verify by the two-sessions and cross-reference scenarios of tests/acceptance/loop-law-hardening.test.js green and tests/acceptance/review-wiring.test.js + tests/acceptance/single-source-law.test.js still green
- [x] 3.5 Re-tick rule 11a and pin-realism sentence in rule 7 — literal text in `RULES_MD`: rule 11a "Ticks are claims, not history" (Close-phase review finding or door refusal voids the tick; un-tick, edit, re-run verify-by, record `re-verified after <review point>`; unrecorded re-edit is a blocker at archive) and the rule 7 pin-realism sentence (real door entry point — real module import or child-process run — never a copied fragment; sandbox-only pin is a note-level finding at R3), verify by the 11a and rule-7 scenarios of tests/acceptance/loop-law-hardening.test.js green
- [x] 3.6 (re-verified after R3 — mirror regenerated over the interpolation rewrap; SSL3 byte-identity green) Store mirror rewrite — regenerate `cdd/rules.md` from `writeDoorScripts`' composed template so SSL3 byte-identity holds over the extended law, verify by tests/acceptance/single-source-law.test.js green (byte-identity check) and the mirror scenarios of tests/acceptance/loop-law-hardening.test.js green
- [x] 3.7 Sponsored cleanup — remove the dead `const law` binding and the `lawPath` line that served only it from tests/acceptance/review-wiring.test.js (lines 20–21 at branch point), verify by the cleanup scenario of tests/acceptance/loop-law-hardening.test.js green and node --test tests/acceptance/review-wiring.test.js exiting 0
- [x] 3.8 (re-verified after R3 — amendment reworded: prior-silence framing kept, reconfirm-only option named with its reason, long line rewrapped; 0008 reconfirm scoped to its own contract, 11a/7 attributed to ADR-0011; guard clean) ADR-0010 amendment and 0008/0009 reconfirms — dated amendment section in `cdd/decisions/0010-*.md` recording both rule-2b extensions (family + two-sessions) with the prior silence noted and the amend-over-supersede reason; `Reconfirmed by loop-law-hardening on 2026-10-22` paragraphs in ADR-0008 and ADR-0009, verify by the ADR scenarios of tests/acceptance/loop-law-hardening.test.js green and node cdd/scripts/spec-drift.mjs clean (A1 citations satisfied, no A2 movement violation)
- [x] 3.9 Smoke S36 — structural pin on the five brief templates (presence, law citations, findings grammar, output filename per reviewPoint), verify by node tests/smoke.mjs green with exactly 1 new check
- [x] 3.10 ADR-0011 drafted (added after the R3 ADR-axis review found rules 11a and 7 merited their own ADR) — `cdd/decisions/0011-ticks-are-claims-and-pins-hit-real-doors.md` records both law decisions with alternatives weighed and consequences; drafted `status: draft` for the human sponsor to resolve at Close, verify by the ADR-0011 scenario of tests/acceptance/loop-law-hardening.test.js green and node cdd/scripts/spec-drift.mjs clean

split-considered: kept whole because the four clauses are one law-hardening seam — the module text, the literal rules, the byte-mirror, and the ADR amendment travel together, and splitting would fork the SSL3 byte-identity and the single R3 findings path across changes. Implementation count is 9 (tasks 3.2–3.10; 3.10 added post-R3 to dispose the ADR-axis finding); 3.1 is the package review; 10 items total stays under the 12 hard limit.


## Done When Traceability

| criterion | task ids |
|---|---|
| rule 2b family + two-sessions clauses rendered, 2a cross-reference, mirror byte-identical | 3.3, 3.4, 3.6 |
| rules 11a and 7 read in the mirror byte-identical to RULES_MD | 3.5, 3.6 |
| five briefs on disk with skeleton, charter, grammar, output filenames + SKILL pointers | 2.2, 3.2, 3.9 |
| ADR-0010 dated amendment (family + two-sessions) and 0008/0009 reconfirms | 3.8 |
| ADR-0011 records the rule-11a and rule-7 decisions (drafted post-R3, resolved at Close) | 3.10 |
| dead `const law` binding gone, npm test exits 0, guard exits 0 | 3.7, 4.3 |

## 4. Close

- [x] 4.1 Change code review — run skill `cdd-code-review` over the diff since the change branched as TWO cold sessions per rule 2b: standards axis briefed from `skills/cdd-code-review/brief-r3-standards.md` and spec axis briefed from `skills/cdd-code-review/brief-r3-spec.md`, each session writing its axis section into `reviews/r3-code-review.md`; dispose every blocker and record dispositions, verify by reviews/r3-code-review.md holding no open blocker and recording both axis sessions
- [x] 4.2 ADR review — if this change drafted an ADR under `cdd/decisions/` or amended one's decision content (a Reconfirmed-by paragraph or a typo fix does not count), run skill `cdd-adr-review` on them (findings at `reviews/adr-review.md` per that skill); if none, record the skip on this line, verify by reviews/adr-review.md holding no open blocker or a skip recorded on this line
- [x] 4.3 cdd validate strict green, guard green, full suite green — npm test exits 0 and node cdd/scripts/spec-drift.mjs exits 0
- [x] 4.4 Archive — pair-commit: feature commit, then archive commit
