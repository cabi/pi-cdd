# Archive metrics — derivation over cdd/archive/ (PF-33 phase 0)

Derived 2026-10-24 from the 35 archived changes under `cdd/archive/`, read-only. First draft (same day) shipped two derivation defects — every tasks.md total line count was reported as its checkbox count, and one author-disposition bullet was parsed as a reviewer finding — found and fixed in director review; every number below is from the corrected derivation.
Scratch derivation script: `/tmp/pf33/derive.mjs` (ad-hoc, not part of the repo); its JSON output feeds every table below.
This file is the only repository write; nothing under `cdd/`, `lib/`, `tests/`, `skills/`, or `scripts/` was touched.

## Method — how each column is derived

Every number below is mechanically derived; nothing is estimated or interpolated.

- **Corpus**: `ls cdd/archive/` → 35 change folders (all have `proposal.md`, `tasks.md`, `specs/<cap>/spec.md`; 33 have `design.md` or a recorded design-gate answer — see caveats).
- **Done-Whens / Non-Goals**: `grep -c '^Done-When:' proposal.md`; Non-Goals = bullets under `## Non-Goals`.
- **Delta ops**: per `specs/*/spec.md`: requirement counts under `## ADDED/MODIFIED/REMOVED Requirements` (`### Requirement:` headings), scenario counts (`Scenario:` lines) inside those sections, `Reason:` lines for MODIFIED.
- **Subtasks / traceability**: checkbox lines (`- [ ]`/`- [x]`) in `tasks.md`; traceability rows in the Done When Traceability table; Close group = tasks under the `## N. Close` heading.
- **Commits / elapsed**: `git log --format='%H %cI %s' -- cdd/archive/<change>` UNION `-- cdd/changes/<name>` (both paths; the change moved between them). "elapsed (incl. director waits)" = last commit − first commit, minutes. **Label honesty**: missions run gated by a director and agent-only time is not derivable from git; conversely most changes were committed in one burst at Close (see 2-norm), so elapsed measures the *commit-burst span*, a lower bound on calendar effort, not development duration.
- **Re-ticks**: `git show <sha>:<path>/tasks.md` at every commit on the change folder; count of task ids going x→[ ] between consecutive commits. All 35 changes are derivable at commit granularity (every change has ≥2 commits); zero x→untick transitions were observed anywhere. Sub-commit re-tick cycles are invisible by construction — where the pair-commit shape hides them, that is the derivation's ceiling, not evidence of absence.
- **Review findings**: parsed from `reviews/*.md` — severity (blocker/should/note), disposition (fixed/open/won't-fix/noted/…), review point by filename (`r1-proposal-review`, `r2-change-review`, `r3-standards-*` vs `r3-spec-*`, `r3-code-review` split by in-file section, `adr-review`; `r2-voided-*` kept separate). Validation: every file carrying a declared `## Counts` section or a bold `**Counts:** 0 blocker, 1 should, 0 note`-shaped line cross-checked — 0 mismatches across the corpus; 10 files hand-recounted against grep truth across all 7 observed layout formats (tables, `### F1 — should` headings, `### [should] F1`, `### N. Title — should`, `### should — Title — DISPOSED fixed`, `- **should** — … Disposition: open.` bullets, `1. **Severity: should**` lists, verdict-style HARD/SMELL/ADVISORY/MINOR tables).
- **Verdict-style mapping (interpretive, exactly 1 file)**: 20261021-green-start-warning/reviews/r3-code-review.md grades HARD/SMELL/ADVISORY/MINOR (9 findings): HARD→blocker, SMELL→note, ADVISORY→should, MINOR→note. That is the only file in the corpus without native blocker/should/note vocabulary; every other number in this doc is vocabulary-native.
- **Session-token costs**: out of scope (phase 2, held).

## Corpus totals (N = 35 changes)

| measure | value | derivation |
|---|---|---|
| Done-When criteria | 133 | Σ per proposal |
| Non-Goals bullets | 154 | Σ per proposal |
| Subtask checkboxes | 444 (median 13) | Σ per tasks.md |
| Traceability rows | 137 | Σ Done-When→task tables |
| Delta requirements | 63 ADDED / 45 MODIFIED / 0 REMOVED | Σ per delta spec |
| Delta scenarios | 202 ADDED + 246 MODIFIED = 448 | Σ per delta spec |
| Findings (all review points) | 465 | Σ parsed severity rows |
| red-records.md present | 4 changes | file existence |

Findings by review point (severity: blocker/should/note; dispositions: fixed/open/won't-fix; "nodisp" = no mechanically extractable disposition):

| review point | files | blocker | should | note | total | fixed | open | won't-fix | nodisp |
|---|---|---|---|---|---|---|---|---|---|
| R1 | 16 | 5 | 40 | 40 | 85 | 56 | 9 | 3 | 17 |
| R2 | 30 | 7 | 63 | 82 | 152 | 79 | 21 | 17 | 30 |
| R3-standards | 27 | 7 | 20 | 64 | 91 | 40 | 8 | 21 | 21 |
| R3-spec | 26 | 4 | 22 | 63 | 89 | 39 | 5 | 8 | 37 |
| R3-spec-run1 | 1 | 0 | 1 | 1 | 2 | 0 | 0 | 0 | 2 |
| R3-unsplit | 3 | 0 | 7 | 7 | 14 | 9 | 0 | 1 | 4 |
| R2-voided | 1 | 0 | 4 | 4 | 8 | 0 | 8 | 0 | 0 |
| ADR | 7 | 0 | 5 | 19 | 24 | 13 | 4 | 3 | 3 |

## The probe — R2 findings vs delta size (N = 30 changes with a parseable R2 review)

R2 runs pre-implementation on the authoring package, so its findings are the purest spec-quality signal in the store. "R2 s+b" = should+blocker findings; "per req" = R2 s+b ÷ delta requirement count (ADDED+MODIFIED+REMOVED). R3 columns: total findings from `r3-spec-*` and `r3-standards-*` files.

| change | Δ reqs | Δ scen | R2 s+b | R2 total | per req | R3-spec | R3-std |
|---|---|---|---|---|---|---|---|
| acceptance-wiring | 2 | 4 | 1 | 6 | 0.50 | 2 | 3 |
| green-start-warning | 3 | 12 | 9 | 11 | 3.00 | 2 | 7 |
| pin-law-rename | 2 | 8 | 2 | 2 | 1.00 | — | 4 |
| reviewer-not-author | 2 | 8 | 4 | 7 | 2.00 | 1 | 7 |
| run-acceptance-suites | 1 | 3 | 1 | 2 | 1.00 | 5 | 2 |
| runner-ergonomics | 6 | 19 | 2 | 3 | 0.33 | 2 | 5 |
| single-source-law | 3 | 9 | 3 | 11 | 1.00 | — | — |
| wire-review-points | 5 | 13 | 5 | 9 | 1.00 | 2 | 2 |
| adr-dir-migration | 4 | 16 | 2 | 5 | 0.50 | 3 | 2 |
| backlog-op | 3 | 16 | 4 | 5 | 1.33 | 5 | — |
| loop-law-hardening | 8 | 28 | 1 | 5 | 0.13 | — | — |
| backlog-revalidate | 3 | 29 | 2 | 4 | 0.67 | 2 | 2 |
| comments-are-shape-only | 5 | 11 | 2 | 5 | 0.40 | 2 | 3 |
| design-docs | 4 | 15 | 2 | 3 | 0.50 | 4 | 2 |
| gitlab-ci-parity | 1 | 2 | 0 | 2 | 0.00 | 1 | 2 |
| guard-glob-fix | 10 | 47 | 2 | 4 | 0.20 | 3 | 4 |
| hook-wiring | 1 | 2 | 2 | 6 | 2.00 | — | 1 |
| law-guard-fixes | 2 | 4 | 1 | 2 | 0.50 | 3 | 3 |
| r3-findings | 4 | 21 | 2 | 4 | 0.50 | 2 | 3 |
| skill-layout | 3 | 10 | 4 | 5 | 1.33 | 1 | 2 |
| triage-skill | 1 | 2 | 1 | 4 | 1.00 | 2 | 2 |
| scaffold-honesty | 2 | 5 | 1 | 1 | 0.50 | 1 | 3 |
| spec-size-signal | 1 | 6 | 3 | 7 | 3.00 | 2 | 1 |
| adr-ops | 6 | 40 | 1 | 6 | 0.17 | 6 | 3 |
| claim-map | 5 | 36 | 1 | 1 | 0.20 | 8 | 5 |
| decision-scan-unify | 1 | 8 | 2 | 2 | 2.00 | 6 | 3 |
| director-skill | 1 | 3 | 2 | 7 | 2.00 | 13 | 6 |
| guard-pure-checks | 1 | 2 | 2 | 10 | 2.00 | 3 | 3 |
| ops-registry | 2 | 8 | 5 | 10 | 2.50 | 7 | 8 |
| spec-model | 1 | 4 | 1 | 3 | 1.00 | 1 | 3 |

R2 totals: 30 changes, 152 findings, 70 of them should+blocker.

**Cautious observations (descriptive, not causal; N = 30 for ratios, heterogeneous eras):**

- R2 should+blocker per delta requirement: median 1.00, range 0.00–3.00. Changes above 2.0: green-start-warning, reviewer-not-author, hook-wiring, spec-size-signal, decision-scan-unify, director-skill, guard-pure-checks, ops-registry.
- Across the 30 changes with both Δ reqs and R2 counts, Pearson r(Δ reqs, R2 s+b) = 0.01 — effectively zero: delta size carries no linear signal on R2 finding count. The spread is what matters — small deltas (1 req) range from 0 to 3 s+b/req (gitlab-ci-parity 0.00 vs green-start-warning 3.00) while large deltas sit low (guard-glob-fix 0.20, adr-ops 0.17, claim-map 0.20). Consistent with R2 findings tracking authoring quality per requirement, not volume — but with N = 30 and heterogeneous eras this is an observation, not a law. Do not read as causal.
- R3 runs after implementation with the code in hand; its totals are not comparable to R2's (different object, different era mix). The r3-spec vs r3-standards split is by filename (era-2); era-1 combined `r3-code-review.md` files are split by in-file section where possible (14 findings could not be split).

## Convergence

### 2-norm: commits per change

Distribution: 2 commits × 32, 3 commits × 2, 7 commits × 1.

- 32/35 changes are exactly the pair-commit (feature commit creating `cdd/changes/<name>`, archive commit moving it to `cdd/archive/`).
- Beyond-2-norm total: 7 extra commits across the corpus. Outliers: deepen-fence-law (7), one-pass-one-close (3), test-the-scaffold (3).
- The 2-norm holds; deviations are historical (early changes committed incrementally) — e.g. deepen-fence-law's 7 commits are 5 intra-change refactor/feat/docs commits plus open+archive.

### Elapsed (incl. director waits) — first→last commit on the change folder

min 0.1m · median 0.9m · p90 3.3m · max 23.3m.

**Honesty caveat (headline derivability gap):** the median is under a minute because 32/35 changes committed everything in one burst at Close; "elapsed" therefore measures the feature→archive commit gap, not calendar effort. Only changes with >2 commits expose any intra-change timeline, and none of them expose gate waits (director asks happen between commits only when commits exist between milestones). Calendar effort per change is **not derivable from git** for 32/35 changes.

### Re-ticks

Zero x→untick transitions observed across all 35 changes at commit granularity (every change derivable; no "not derivable (pair-commit)" rows needed because the derivation ran — but its resolution is commits, so sub-commit re-tick cycles are structurally invisible). One author note in the corpus self-reports an untick-re-tick cycle (loop-law-hardening R2 author note: "Task 2.2 un-ticked … re-ticked with an inline `re-verified after R2` record") — invisible to git because it happened inside one commit. This is direct evidence the re-tick column is a lower bound.

## Per-change derivation table (all columns)

| change | DW | NG | ΔA/ΔM/ΔR reqs | Δ scen | subtasks | Close tasks | trace rows | commits | >2 | elapsed | re-ticks | R2 s+b | R3 s/st | findings |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| gherkin-feature-blocks | 1 | 3 | 0/4/0 | 20 | 10 | 0 | 2 | 2 | 0 | 0.9m | 0 | — | —/— | 0 |
| gherkin-specs | 2 | 4 | 4/0/0 | 9 | 11 | 0 | 2 | 2 | 0 | 0.7m | 0 | — | —/— | 0 |
| deepen-fence-law | 4 | 4 | 0/3/0 | 18 | 10 | 0 | 4 | 7 | 5 | 22.6m | 0 | — | —/— | 0 |
| one-pass-one-close | 4 | 3 | 3/0/0 | 7 | 9 | 0 | 4 | 3 | 1 | 23.1m | 0 | — | —/— | 0 |
| test-the-scaffold | 2 | 3 | 1/0/0 | 3 | 6 | 0 | 2 | 3 | 1 | 1.2m | 0 | — | —/— | 0 |
| acceptance-wiring | 1 | 6 | 2/0/0 | 4 | 11 | 0 | 2 | 2 | 0 | 0.1m | 0 | 1 | 2/3 | 15 |
| green-start-warning | 4 | 4 | 3/0/0 | 12 | 12 | 0 | 4 | 2 | 0 | 0.5m | 0 | 9 | 2/7 | 28 |
| pin-law-rename | 1 | 4 | 0/2/0 | 8 | 12 | 0 | 1 | 2 | 0 | 1.0m | 0 | 2 | —/4 | 13 |
| reviewer-not-author | 5 | 5 | 2/0/0 | 8 | 13 | 0 | 5 | 2 | 0 | 0.1m | 0 | 4 | 1/7 | 22 |
| run-acceptance-suites | 1 | 3 | 1/0/0 | 3 | 9 | 0 | 1 | 2 | 0 | 0.3m | 0 | 1 | 5/2 | 9 |
| runner-ergonomics | 5 | 6 | 4/2/0 | 19 | 14 | 0 | 5 | 2 | 0 | 0.3m | 0 | 2 | 2/5 | 10 |
| single-source-law | 5 | 5 | 2/1/0 | 9 | 13 | 0 | 5 | 2 | 0 | 0.2m | 0 | 3 | —/— | 21 |
| wire-review-points | 5 | 5 | 5/0/0 | 13 | 13 | 0 | 5 | 2 | 0 | 0.2m | 0 | 5 | 2/2 | 26 |
| adr-dir-migration | 5 | 3 | 2/2/0 | 16 | 14 | 0 | 5 | 2 | 0 | 16.7m | 0 | 2 | 3/2 | 10 |
| backlog-op | 5 | 6 | 2/1/0 | 16 | 13 | 0 | 5 | 2 | 0 | 0.9m | 0 | 4 | 5/— | 21 |
| loop-law-hardening | 5 | 7 | 5/3/0 | 28 | 17 | 0 | 6 | 2 | 0 | 0.6m | 0 | 1 | —/— | 23 |
| backlog-revalidate | 4 | 5 | 0/3/0 | 29 | 16 | 0 | 4 | 2 | 0 | 0.1m | 0 | 2 | 2/2 | 11 |
| comments-are-shape-only | 4 | 4 | 4/1/0 | 11 | 16 | 0 | 4 | 2 | 0 | 0.1m | 0 | 2 | 2/3 | 12 |
| design-docs | 3 | 4 | 2/2/0 | 15 | 12 | 0 | 3 | 2 | 0 | 0.3m | 0 | 2 | 4/2 | 10 |
| gitlab-ci-parity | 3 | 5 | 1/0/0 | 2 | 10 | 0 | 3 | 2 | 0 | 0.1m | 0 | 0 | 1/2 | 5 |
| guard-glob-fix | 5 | 3 | 2/8/0 | 47 | 18 | 0 | 5 | 2 | 0 | 2.2m | 0 | 2 | 3/4 | 17 |
| hook-wiring | 5 | 3 | 1/0/0 | 2 | 13 | 0 | 5 | 2 | 0 | 3.3m | 0 | 2 | —/1 | 7 |
| law-guard-fixes | 4 | 4 | 2/0/0 | 4 | 14 | 0 | 4 | 2 | 0 | 23.3m | 0 | 1 | 3/3 | 10 |
| r3-findings | 5 | 3 | 1/3/0 | 21 | 16 | 0 | 5 | 2 | 0 | 1.3m | 0 | 2 | 2/3 | 9 |
| skill-layout | 3 | 5 | 1/2/0 | 10 | 11 | 0 | 3 | 2 | 0 | 1.9m | 0 | 4 | 1/2 | 8 |
| triage-skill | 3 | 5 | 1/0/0 | 2 | 11 | 0 | 3 | 2 | 0 | 0.1m | 0 | 1 | 2/2 | 8 |
| scaffold-honesty | 3 | 4 | 2/0/0 | 5 | 12 | 0 | 4 | 2 | 0 | 0.6m | 0 | 1 | 1/3 | 5 |
| spec-size-signal | 6 | 4 | 1/0/0 | 6 | 12 | 0 | 5 | 2 | 0 | 0.3m | 0 | 3 | 2/1 | 10 |
| adr-ops | 5 | 5 | 5/1/0 | 40 | 16 | 0 | 5 | 2 | 0 | 2.1m | 0 | 1 | 6/3 | 19 |
| claim-map | 5 | 6 | 0/5/0 | 36 | 15 | 0 | 5 | 2 | 0 | 2.1m | 0 | 1 | 8/5 | 29 |
| decision-scan-unify | 4 | 3 | 0/1/0 | 8 | 13 | 0 | 4 | 2 | 0 | 1.0m | 0 | 2 | 6/3 | 19 |
| director-skill | 4 | 5 | 1/0/0 | 3 | 12 | 0 | 4 | 2 | 0 | 1.7m | 0 | 2 | 13/6 | 26 |
| guard-pure-checks | 4 | 5 | 1/0/0 | 2 | 15 | 0 | 4 | 2 | 0 | 1.3m | 0 | 2 | 3/3 | 18 |
| ops-registry | 4 | 6 | 1/1/0 | 8 | 11 | 0 | 5 | 2 | 0 | 1.8m | 0 | 5 | 7/8 | 34 |
| spec-model | 4 | 4 | 1/0/0 | 4 | 14 | 0 | 4 | 2 | 0 | 0.3m | 0 | 1 | 1/3 | 10 |

R2 "—" = no R2 findings file for that change (5 changes: gherkin-feature-blocks, gherkin-specs, deepen-fence-law, one-pass-one-close, test-the-scaffold — the 2026-10-19/20 era that predates the reviews/ directory entirely; their findings column is 0 by artifact absence, not review quality). decision-scan-unify additionally carries a voided R2 (r2-voided-run1.md, 8 findings, excluded from R2 totals).

## Era and shape inconsistencies found (recorded, not fixed)

1. **R2 artifact coverage is 30/35.** The 5 changes of the 2026-10-19/20 era have no `reviews/` directory at all (they predate review artifacts entirely — no review file of any kind in those folders). decision-scan-unify carries a voided R2 (`r2-voided-run1.md`, 8 findings, excluded from R2 totals) alongside its live R2.
2. **Seven+ layout formats for the same findings table** evolved across the corpus (documented in Method). Era-2 files declare `## Counts` and all 24 declared counts match this derivation; era-1 files do not.
3. **Two changes share a double-date prefix** (`20261024-20261024-scaffold-honesty`, `20261024-20261024-spec-size-signal`) — an archive-date collision artifact of the same-day rename convention.
4. **Verdict vocabulary (era-1)**: exactly 1 combined R3 file (green-start-warning) grades HARD/SMELL/ADVISORY/MINOR instead of blocker/should/note; the mapping above is interpretive. Three other combined r3-code-review.md files (single-source-law, backlog-op, loop-law-hardening, 14 findings) use native vocabulary but carry no spec/standards split — counted as R3-unsplit.
5. **Dispositions are author-recorded, unevenly**: 114 of 465 findings carry no mechanically extractable disposition (mostly era-1 and brief-era files).
6. **red-records.md exists in only 4 changes** (spec-size-signal, scaffold-honesty, adr-ops, ops-registry — all 2026-10-24); earlier changes predate the artifact.
7. **Traceability tables exist from the first archive onward** (no era seam): rows-per-change range 1–6 and broadly track Done-When count, so the column adds little independent signal beyond DW. The real seams are caveats 1, 2, 4, and 6.

## Appendix — what phase 1 could stamp: metrics.md at `cdd archive`

Everything above is derivable mechanically from the archive folder + `git log` at Close time. A stamped `metrics.md` per archive needs only the four derivable blocks (session-token cost deliberately absent — phase 2):

~~~
# metrics — <change>            (stamped by `cdd archive`, never hand-edited)
derived: <archive-commit-sha> <iso-date>
# spec strength
done-whens: <grep -c '^Done-When:' proposal.md>
non-goals: <bullets under ## Non-Goals>
delta-requirements: added <n> / modified <n> / removed <n>   # ### Requirement: per op section
delta-scenarios: <n>                                          # Scenario: lines in op sections
subtasks: <checkbox lines in tasks.md>
traceability-rows: <rows in Done When Traceability>
# convergence
commits: <git log --oneline -- cdd/changes/<name> ∪ cdd/archive/<name> | wc -l>
beyond-2-norm: <max(0, commits-2)>
elapsed-incl-director-waits: <last-commit − first-commit, ISO interval>
re-ticks-commit-visible: <x→[ ] transitions across those commits>   # lower bound by construction
# review yield (from reviews/*.md, filenames + declared ## Counts)
r2-findings: blocker <n> / should <n> / note <n> — fixed <n> / open <n> / won't-fix <n>
r3-spec-findings: <…>        r3-standards-findings: <…>
adr-findings: <…>            red-records: <present|absent>
# honest gaps (stamped verbatim)
not-derivable: agent-only time; sub-commit re-tick cycles; session-token cost (phase 2)
~~~

Stamping rule: every field is computed by the same commands as this doc's Method section; a field whose derivation fails is stamped `not-derivable: <reason>`, never estimated. The stamp should also record the layout-format version of the findings files it parsed, so later format drift cannot silently zero a count (this derivation's zero-finding audit exists precisely because formats drifted seven times).

*PF-33 phase 0. Descriptive only; no law change proposed here. Correlations name N and carry no causal claim.*
