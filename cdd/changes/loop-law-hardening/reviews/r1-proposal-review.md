# R1 proposal review — loop-law-hardening

## Reviewer form

- **Reviewer form:** cold sub-agent (fresh session, briefed only from paths on disk).
- **Reviewer model family:** opencode-zen / deepseek-v4-pro.
- **Author model family:** zai / glm-5.3.
- **Family separation:** families differ (different provider and model lineage) — the cold-reviewer family requirement is satisfied for this run.
- **Repo state:** working tree of branch `law-hardening`, HEAD `901e7fe`; the change artifacts under `cdd/changes/loop-law-hardening/` are uncommitted (proposal, tasks, and the five brief templates + three SKILL.md pointer edits are all working-tree changes).

## Findings

### 1. [should] The proposal omits the required "Capabilities" section

The proposal template (the comment block at the top of `proposal.md`) lists
"Capabilities: which specs are created or modified" among the sections marked
"all required". This proposal has Why, What Changes, Solutions Considered,
Non-Goals, Done-When, and Code:, but no Capabilities section. The capability
is named only in passing inside Solutions Considered ("gherkin capability owns
loop law — delta lands there"). The mapping is recoverable, but the required
section that records it — and the twin-change check ("if an open change
already claims this behavior … extend that change instead of opening a twin")
— is absent.

- Evidence: `cdd/changes/loop-law-hardening/proposal.md` (no `## Capabilities` heading); template comment `proposal.md:PNWK` ("Capabilities: which specs are created or modified").
- Author disposition: fixed — `## Capabilities` section added (gherkin: MODIFIED ×2 + ADDED items; no open twin recorded).

### 2. [should] Six Done-When lines exceed the 1–5 ceiling

The template states "Done-When: 1-5 completion criteria, each on its own
`Done-When:` line". This proposal carries six `Done-When:` lines (rule 2b
clauses + rule 2a cross-reference; rules 11a + 7; five brief templates; ADR
amendment + reconfirmations; dead-binding cleanup; deterministic gates). Each
line is individually observable, but the count exceeds the stated ceiling and
should be consolidated (e.g. the cleanup and the gates lines are both
"npm test exits 0" checks and could merge).

- Evidence: `cdd/changes/loop-law-hardening/proposal.md` — six `Done-When:` lines (`uhHW`, `ZZtu`, `FMUT`, `mlRW`, `RBsp`, `eiAf`); template comment `proposal.md:ftmr` ("1-5 completion criteria").
- Author disposition: fixed — cleanup line and gates line merged into one; the proposal now carries exactly five Done-When lines.

### 3. [should] ADR-0010 amendment rationale cites a position ADR-0010 never recorded

The proposal's Solutions Considered justifies amending ADR-0010 (rather than
reconfirming) on the claim that "clause 1 contradicts ADR-0010's recorded 'a
same-family cold reviewer is lawfully cold' position", and What Changes frames
the amendment as "family separation: guidance → law". But ADR-0010 is silent
on model family — `grep -n family cdd/decisions/0010-*.md` matches nothing.
The phrase "a same-family cold reviewer is lawfully cold" appears only as a
Non-Goal of the archived `reviewer-not-author` proposal
(`cdd/archive/20261021-reviewer-not-author/proposal.md:33`), and that change's
own R3 review confirmed "no model-family clause in the law" as a held
Non-Goal. Family separation was never recorded as guidance anywhere in the
law, the ADRs, or the skills — it was deferred, not stated.

The amendment is still the right instrument (family separation tightens the
reviewer-independence contract ADR-0010 owns), but the rationale should cite
the actual gap — ADR-0010 is silent on family, and the reviewer-not-author
change deferred it to guidance as a Non-Goal — rather than a recorded
position that does not exist. The "guidance → law" framing is "silence → law".

- Evidence: `cdd/changes/loop-law-hardening/proposal.md` (Solutions Considered, ADR-instrument bullet; What Changes ADR-0010 bullet); `cdd/decisions/0010-reviewer-independence-is-loop-law.md` (no "family" match); `cdd/archive/20261021-reviewer-not-author/proposal.md:33`.
- Author disposition: fixed — rationale rewritten to "silence → law": ADR-0010 is silent on family; the quoted phrase is the archived reviewer-not-author proposal's Non-Goal (a deferral, not a recorded position). What Changes, Solutions Considered, and tasks §2 all aligned to this framing.

### 4. [note] "Rule 11a" numbering sits under Archive (rule 11)

The new re-tick rule is numbered "11a", a sub-rule of rule 11 (Archive). The
duty it states — a Close-phase finding or door refusal voids a tick, re-run
the verify-by, record the re-tick — is Close/archive-adjacent, so the home is
defensible, but "11a" is the first sub-lettered rule in the law and a reader
may expect tick discipline under rule 6 (Tasks) or rule 7 (Test-first). Worth
a one-line rationale in the delta if kept.

- Evidence: `cdd/changes/loop-law-hardening/proposal.md` (What Changes, rule 11a bullet); `lib/templates.mjs` `RULES_MD` (rules 11 and 12 are literal, adjacent).
- Author disposition: fixed — one-line rationale added to the proposal's rule-11a bullet (the duty fires at Close: voiding triggers are Close-phase findings and door refusals, and the blocker lands at archive itself; rule 6's scaffold already carries tick discipline).

### 5. [note] Why's incident citation is not independently verifiable from the pinned inputs

The Why states the `20261021-runner-ergonomics` H1/H2 pins "stayed green
through a module-scope ReferenceError that only S15 (real door invocation)
caught". H1/H2 (L2-hint pins in `tests/acceptance/gherkin-guard-placeholder.test.js`)
and S15 (guard L2-red in `tests/smoke.mjs`) exist and are consistent with the
claim, but the incident itself is a past-session account not recorded in
`cdd/archive/`. The pin-realism motivation is coherent regardless; this is a
traceability note, not a defect in the proposal's shape.

- Evidence: `cdd/changes/loop-law-hardening/proposal.md` (Why); `tests/acceptance/gherkin-guard-placeholder.test.js:170,182`; `tests/smoke.mjs:521`.
- Author disposition: fixed — the Why now marks the incident a session account and cites the on-disk pins it rests on (tests/acceptance/gherkin-guard-placeholder.test.js H1/H2 vs tests/smoke.mjs S15).
## Charter check (MUST-DELIVER)

1. **Design-gate answers credible** — T1–T5 in `tasks.md` §2.1 check out
   against the proposal's reach: T1 YES (nine-plus surfaces across three
   artifact families) is accurate; T2 YES (static-markdown briefs vs
   module-rendered) is a real architecture bet; T3 YES (loop-law.mjs renders
   2/2a/2b, templates.mjs owns literal 3–12) matches the code; T4 YES
   (SSL/RW/RI pins) matches the pin inventory; T5 NO (one author, sequential)
   is plausible. No "all NO" problem.
2. **Reuse-first actually searched** — the proposal names the gherkin
   capability, three archive precedents (reviewer-not-author,
   runner-ergonomics, pin-law-rename), and the platform (no template-rendering
   dependency). The search is plausible against `cdd/specs/` and
   `cdd/archive/`.
3. **Every Done-When verifiable as written** — each line names an observable
   check (acceptance pin, smoke S36, `npm test` exit 0, `spec-drift` exit 0).
   No activity-phrased criterion. (Count exceeds 1–5 — see finding 2.)
4. **Scope fence sane** — Non-Goals fence validator enforcement, REVIEW_POINTS
   facts, compact surfaces, scaffold re-tick line, vendor names, and the
   mechanical-change fence. Every What Changes item is sponsored by a
   Done-When line.
5. **Capability mapping right** — "gherkin" owns the loop law (the living
   `cdd/specs/gherkin/spec.md` holds "Loop law names three review points",
   "Reviews run cold", etc.), and the change maps there. The mapping is
   correct but not recorded in the required Capabilities section (finding 1).

## Brief template friction

The brief template `skills/cdd-spec-review/brief-r1.md` (first live use) has
these frictions, all note-level:

- **Inputs list is incomplete for the charter.** The template's Inputs list
  `proposal.md`, `cdd/specs/`, `cdd/archive/`, `cdd/rules.md` — but
  MUST-DELIVER #1 requires the design-gate record in `tasks.md` §2.1, and the
  proposal under review cites ADRs in `cdd/decisions/`. The instantiated brief
  had to add both `tasks.md` and `cdd/decisions/` by hand.
- **Scope fence contradicts the charter.** "Artifact under review" says "delta
  and tasks do not exist yet or are out of scope", yet MUST-DELIVER #1 asks
  the reviewer to check the design-gate record in `tasks.md` §2.1. The
  instantiated brief patched this with a parenthetical; the template should
  state the §2.1 exception directly.
- **Disposition grammar is ambiguous.** "disposition `fixed:` | `open` |
  `won't-fix:` (author disposes; you report)" does not say what the reviewer
  reports. The instantiated brief clarified "you report with disposition
  `open` (leave the fixed:/won't-fix: to the author)". The template should
  state that the reviewer reports `open` and the author sets `fixed:` /
  `won't-fix:`.
- **MUST-DELIVER #5 does not ask for the Capabilities section.** It checks
  that named capabilities exist in `cdd/specs/`, but not that the proposal
  carries the required "Capabilities" section the proposal template mandates —
  a reviewer following only the brief would not flag finding 1.
- **Instantiation checklist hard-codes the law under review.** The checklist's
  "Reviewer model family MUST differ from the author's" is the very
  family-separation rule this change is establishing; a reader of the
  template alone cannot tell whether it cites existing law or the law being
  established (bootstrapping).

**Author note on template friction (all five items fixed in this change's working tree):** the family line now cites "rule 2b author-family clause" (law citation, not bare restatement); the disposition grammar now states the reviewer reports `open` and the author later sets `fixed:`/`won't-fix:`; brief-r1.md's Inputs carry tasks.md §2.1 + cdd/decisions/, its scope fence states the §2.1 exception, and MUST-DELIVER 5 checks the required Capabilities section. Task 2.2 un-ticked, templates re-edited, verify-by re-run green, re-ticked with an inline `re-verified after R1` record — first dogfood of the re-tick rule this change authors.
