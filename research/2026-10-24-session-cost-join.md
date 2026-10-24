# Session-Token Cost Join for the Archive Corpus — PF-33 Phase 2

**Date:** 2026-10-24 (data snapshot 22:59:19Z) · **Backlog line:** PF-33 phase 2 · **Mode:** read-only evidence; no store, lib, or spec changes.
**Companion doc:** `research/2026-10-24-archive-metrics.md` (phase 0 — spec-strength/convergence columns imported from there as-is, single source, not re-derived).
**All times UTC.** Git archive-commit timestamps were converted from `+02:00` local. Costs are harness-recorded per-message `usage.cost.total` dollars — as recorded, no repricing, no smoothing.

---

## 1. Executive summary

- **36/36 archived changes joined to session cost.** Total attributed: **$175.42** (502.7M tokens) across 36 changes.
- **Conservation is exact** against a frozen universe: attributed rows $175.4235 + seat-window residual $11.5693 + residual $3.5635 = **$190.5563** = the entire project session dir at snapshot; delta **0.0000** (§2).
- **Cost tracks work structure, not spec size.** Pearson r(cost, subtasks) = **+0.72** (runner-session-only **+0.79**) vs r(cost, Δreqs) = +0.47, r(cost, Δscen) = +0.63 (§7).
- **Review yield is not bought with dollars.** r(cost, R2 s+b) = **−0.14**, r(cost, R2 s+b per Δreq) = **−0.28** (N=31) — the phase-0 "yield uncorrelated with delta size" result extends to cost (§7).
- **Era split:** 33 seat-era changes $162.48 (92.6% of attributed spend) vs 3 director-era missions $12.95. Model mix per era in §6.
- **Headline gap closed post-gate:** $3.12 of what the interim gate reported as "residual" turned out to be 13 identifiable reviewer sessions bound by spawn-brief file names (`fence-law-review-spec` etc.) — folded in §5. Two reviewer invocations remain structurally invisible (`--no-session`, §8).
- **Advisory (§9):** deriveStamp should NOT join session cost at Close by itself — env-dependence and retention break the stamp's repo-only reproducibility; a director-side cost appendix is the viable shape.

---

## 2. Universe and conservation (stated explicitly)

**Universe = every session transcript under `~/.pi/agent/sessions/--home-carsten-Projects-pi-extensions-pi-cdd--/`** (the project cwd dir — 190 `*.jsonl` files), **frozen at the last message recorded before the interim gate: 2026-10-24T22:59:19.456Z.** Universe total: **$190.5563, 541,971,987 tokens.**

This is *not* the whole session store. The store holds 73 project-dirs; all-projects grand total at 2026-10-24T23:45Z was **$350.76**. Other projects' dirs are out of scope for this join — a change in this repo cannot have cost anything in them.

**Conservation equation (delta 0.0000 USD, 0 tokens):**

| component | $ | tokens | content |
|---|---|---|---|
| attributed rows (36 changes) | 175.4235 | 502,705,633 | §5 table |
| seat-window residual | 11.5693 | 30,184,432 | messages of the 2 seat sessions + director session that fall outside every change window: `01a15f22` $7.34, `01a16f41` $2.12, `01a15ae9` $1.42, `01a1513a` $0.68 — non-mission chat, planning, backlog work |
| residual sessions | 3.5635 | 9,081,922 | 10 named sessions, §8 |
| **universe** | **190.5563** | **541,971,987** | |

**Post-snapshot growth (outside the universe, named not counted):** the director session's gate deliberation (~$0.07 by 23:15Z) and this phase-2 session itself ($1.05 by 23:45Z). Both kept out so the gate-passed attribution stays frozen.

Derivation: `/tmp/pf33b/msgs2.json` (per-message index built by `scan2.py`: one pass over the 190 files, extracting `ts/model/cost/tok` from every assistant `message` record); totals summed from it. Snapshot cutoff = max `ts` in that index.

---

## 3. Attribution method

The 5-line version (as sent to the interim gate):

1. **Runner sessions** are herdr subagent transcripts whose content names exactly one change ≥5 times and writes `cdd/changes/<slug>/` — wholly attributable (per-mission sessions).
2. **Reviewer sessions** are identified by their spawn brief path in the parent transcript (`context/<axis-token>-<ts>.md`); axis read from the brief token (r1/r2/r3-standards/r3-spec/adr-review) and model from the session's own records.
3. **Seat/director sessions** (long-lived, span many missions) are attributed **per message**: each assistant message joins to the change whose slug was last mentioned at or before its timestamp, capped at that change's archive commit (UTC).
4. **Windows** therefore start at a change's *first mention* in the seat session (not dispatch — seat-era changes have no dispatch event; this is the only corpus-wide derivable start) and end at the archive commit.
5. Every dollar lands in exactly one bucket — rows, seat-window residual, or named residual — which is why conservation is exact.

**Post-gate amendment (join4):** the gate reported 23 residual sessions ($6.68). Inspecting their spawn-brief file names showed 13 were reviewer missions the axis-token classifier missed (the 2026-10-20 era spawned reviewers with brief names like `fence-law-review-spec`, `opc-review-standards`, `review3-spec` instead of the later `r2-*`/`r3-*` tokens). Bound by **brief file name + slug mentions in transcript** (11 sessions, "brief+slug" binding) and by era window alone for 2 (`arch-review-core`/`arch-review-scripts`, $0.4470 total, labelled **inferred**) — folded into the rows in §5. Strict total excluding the inferred binding: $174.98.

---

## 4. Director-era missions — window splits (required by gate reply)

Director windows include **pre-dispatch deliberation**; the split below separates it. Dispatch timestamp = the `subagent_result`-preceding launch record in the director transcript.

| mission | window (first→last attributed msg) | dispatch | archive commit | pre-dispatch $ (tok) | dispatch→commit $ (tok) | runner $ | reviewers $ | TOTAL $ |
|---|---|---|---|---|---|---|---|---|
| M1 scaffold-honesty | 19:34:18→20:05:47 | 19:36:14 | 20:14:44 | 0.12 (185k) | 0.56 (1,335k) | 2.51 | 0.08 (3) | **3.17** |
| M2 spec-size-signal | 19:06:44→20:52:53 | 20:19:34 | 21:01:16 | **1.32** (2,976k) | 0.78 (2,282k) | 2.83 | 0.12 (3) | **4.47** |
| M3 metrics-stamp | 21:52:16→22:24:29 | 21:52:37 | 22:39:33 | 0.06 (156k) | 0.55 (1,413k) | 4.60 | 0.10 (4) | **5.31** |

- M2's window opens **73 minutes pre-dispatch** ($1.32 = 30% of its total): queue deliberation while M1's runner still held the slot. Director-era totals are therefore *mission-inclusive*, not pure execution cost — carried into §7 as a caveat.
- M1/M3 pre-dispatch shares are negligible ($0.12/$0.06 — dispatch prep only).
- Reviewer fleets: M1 all gpt-6-luna (R2/R3-std/R3-spec $0.028/$0.024/$0.029); M2 deepseek-v4.1-flash R2 + gpt-6-luna R3 pair; M3 all gpt-6-luna (R1/R2/R3-std/R3-spec).

---

## 5. Per-change cost table (36 rows)

Columns: runner session $ (tokens) · reviewers n·$ (axis/model detail in §5.1 where interesting) · seat-window $ (bounds = first→last attributed message, UTC) · TOTAL $ (tokens in millions). "seat" era = pre-director interactive seat; "dir" era = missions dispatched by the director session.

| change | era | runner $ | rev n·$ | seat $ | bounds | TOTAL $ | tok |
|---|---|---|---|---|---|---|---|
| gherkin-specs | seat | — | 0·0.00 | 2.66 | 23:37→00:00 | 2.66 | 8.1M |
| gherkin-feature-blocks | seat | — | 0·0.00 | 2.98 | 00:22→00:49 | 2.98 | 9.3M |
| deepen-fence-law | seat | — | 4·2.00 | 3.00 | 20:31→21:02 | 5.00 | 10.3M |
| one-pass-one-close | seat | — | 4·0.80 | 1.33 | 21:49→22:12 | 2.13 | 4.0M |
| test-the-scaffold | seat | — | 2·0.32 | 2.79 | 20:36→22:52 | 3.12 | 7.8M |
| wire-review-points | seat | 2.54 | 6·1.22 | 0.53 | 17:45→18:28 | 4.29 | 11.4M |
| run-acceptance-suites | seat | — | 8·0.35 | 1.13 | 18:45→18:57 | 1.47 | 4.4M |
| single-source-law | seat | 4.13 | 6·0.73 | 0.20 | 19:14→19:51 | 5.06 | 14.5M |
| reviewer-not-author | seat | 2.72 | 5·0.37 | 0.33 | 20:12→20:39 | 3.42 | 10.5M |
| green-start-warning | seat | 3.65 | 8·0.69 | 0.38 | 20:49→21:29 | 4.72 | 13.8M |
| acceptance-wiring | seat | 2.45 | 4·0.63 | 0.33 | 21:38→22:01 | 3.42 | 8.9M |
| pin-law-rename | seat | 2.56 | 5·1.22 | 0.37 | 22:09→22:31 | 4.15 | 10.6M |
| runner-ergonomics | seat | 3.99 | 3·0.56 | 0.37 | 22:46→23:18 | 4.92 | 13.3M |
| loop-law-hardening | seat | 5.37 | 7·1.60 | 0.75 | 00:52→03:05 | 7.72 | 20.7M |
| backlog-op | seat | 4.42 | 4·1.33 | 0.36 | 03:10→03:58 | 6.12 | 17.8M |
| adr-dir-migration | seat | 2.71 | 3·1.17 | 0.37 | 04:26→05:13 | 4.24 | 10.6M |
| design-docs | seat | 3.60 | 4·0.96 | 0.35 | 15:37→16:21 | 4.91 | 13.4M |
| r3-findings | seat | 3.33 | 3·0.59 | 0.35 | 16:32→17:03 | 4.27 | 13.4M |
| hook-wiring | seat | 1.84 | 3·0.31 | 0.55 | 17:30→18:00 | 2.70 | 7.6M |
| law-guard-fixes | seat | 4.62 | 6·0.80 | 0.77 | 18:08→18:56 | 6.20 | 18.1M |
| guard-glob-fix | seat | 6.02 | 5·0.82 | 0.50 | 19:17→20:06 | 7.34 | 22.4M |
| triage-skill | seat | 2.39 | 3·0.57 | 1.04 | 18:19→20:34 | 3.99 | 11.9M |
| skill-layout | seat | 3.13 | 3·0.63 | 0.95 | 20:55→21:24 | 4.71 | 13.7M |
| comments-are-shape-only | seat | 4.69 | 4·1.21 | 0.61 | 21:29→22:03 | 6.51 | 18.3M |
| backlog-revalidate | seat | 4.78 | 4·1.10 | 0.52 | 22:28→22:59 | 6.40 | 17.4M |
| gitlab-ci-parity | seat | 2.61 | 4·0.42 | 0.66 | 23:21→23:47 | 3.70 | 10.1M |
| director-skill | seat | 3.46 | 6·0.41 | 1.13 | 23:37→00:28 | 5.00 | 16.2M |
| adr-ops | seat | 8.61 | 4·1.23 | 1.25 | 09:39→11:24 | **11.09** | 31.7M |
| spec-model | seat | 3.96 | 5·1.57 | 1.31 | 11:38→12:49 | 6.85 | 18.5M |
| guard-pure-checks | seat | 3.42 | 5·1.29 | 1.07 | 13:02→13:56 | 5.77 | 15.8M |
| claim-map | seat | 4.45 | 8·0.18 | 2.17 | 13:00→15:28 | 6.80 | 23.7M |
| ops-registry | seat | 3.84 | 0·0.00 ⚠ | 0.41 | 15:48→16:43 | 4.25 | 11.6M |
| decision-scan-unify | seat | 3.89 | 0·0.00 ⚠ | 2.69 | 17:17→18:38 | 6.58 | 19.2M |
| scaffold-honesty | dir | 2.51 | 3·0.08 | 0.58 | 19:34→20:05 | 3.17 | 10.5M |
| spec-size-signal | dir | 2.83 | 3·0.12 | 1.52 | 19:06→20:52 | 4.47 | 15.7M |
| metrics-stamp | dir | 4.60 | 4·0.10 | 0.61 | 21:52→22:24 | 5.31 | 17.8M |

- **6 changes have no runner session** (rows with "—" and 0 reviewers up to run-acceptance-suites): the 2026-10-19/20 era predates runner dispatch — work happened in the seat session itself. Their seat windows are the nearest-preceding-mention approximation (method line 3-4), not session-boundary attribution. run-acceptance-suites (10-21) is the transition case: seat-run but reviewer fleet already dispatched.
- ⚠ **ops-registry / decision-scan-unify reviewer invocations produced no transcripts** (PF-29-era `pi -p --no-session` recipe — §8).
- All 29 runner sessions are **glm-5.3** (verified: no runner session carries another model). Reviewer fleets vary by axis/model — see next subsection.

### 5.1 Reviewer detail where it matters

| change | reviewer fleet (axis $ · model · binding) |
|---|---|
| deepen-fence-law | R2-spec $1.4016 kimi-k3 (brief+slug) · R2-standards $0.1468 deepseek-v4-pro (brief+slug) · arch-core $0.4147 glm-5.3 (**inferred**) · arch-scripts $0.0323 glm-5.3-flash (**inferred**) |
| one-pass-one-close | R2-spec $0.3223 + $0.2221 kimi-k3 · R2-standards $0.1482 + $0.1094 deepseek-v4-pro (all brief+slug) |
| test-the-scaffold | R3-spec $0.2304 kimi-k3 · R3-standards $0.0931 deepseek-v4-pro (brief+slug) |
| spec-model | R1 $0.28 + R2 $0.18 + R3-spec $0.42 + R3-std $0.35 all deepseek-v4-pro + 1 era glm-5.3 $0.35 — 5 sessions, $1.57 total |
| claim-map | 3 free-model R1 runs ($0.00) + R1/R2/R3-std/R3-spec/ADR deepseek-v4.1-flash ~$0.04 each |
| green-start-warning | R1 $0.35 deepseek-v4-pro + free R2/R3 runs + 3 era sessions $0.34 |
| single-source-law | R1 $0.11 deepseek-v4-pro + free R2 + 2 R3 runs (glm-5.3 $0.06, deepseek-v4-pro $0.38) |

Notable: the 2026-10-20 reviewer era used **kimi-k3 for R2-spec** (expensive: $1.40 on deepen-fence-law — the single costliest review in the corpus) before the fleet standardized on deepseek/gpt-6-luna.

### 5.2 Findings-file vs review-session cross-check

Phase 0 recorded deepen-fence-law / one-pass-one-close / test-the-scaffold as "no R2 findings file" (pre-`reviews/` era). The join shows **review sessions existed for all three** ($2.00/$0.80/$0.32). The findings were not kept as artifacts — "0 findings by artifact absence" in phase 0 is confirmed as *artifact* absence, not review absence. (These sessions start 1–6 min *after* the archive commit of their change — the early era ran reviews against the archived state.)

---

## 6. Corpus and era totals; model mix

| bucket | $ | tokens |
|---|---|---|
| seat-era changes (33) | 162.48 | 470.3M |
| director-era changes (3) | 12.95 | 32.4M |
| **all attributed rows** | **175.42** | **502.7M** |
| seat-window residual | 11.57 | 30.2M |
| residual sessions | 3.56 | 9.1M |
| **universe** | **190.56** | **542.0M** |

Most expensive changes: adr-ops $11.09, loop-law-hardening $7.72, guard-glob-fix $7.34, spec-model $6.85, claim-map $6.80, decision-scan-unify $6.58. Cheapest: run-acceptance-suites $1.47, one-pass-one-close $2.13, gherkin-specs $2.66.

**Model mix by era** (cost share within attributed rows):

| era | glm-5.3 | deepseek-v4-pro | kimi-k3 | gpt-6-luna | other |
|---|---|---|---|---|---|
| seat (33 changes, $162.48) | **85.3%** ($138.58) | 13.0% ($21.11) | 1.3% ($2.18) | ~0% | 0.4% (flash models, free models $0.00) |
| director (3 missions, $12.95) | **97.7%** ($12.65) | — | — | 1.7% ($0.23) | 0.6% (deepseek-v4.1-flash) |

The mix shift is real but modest: seat-era spend is ~13% cheap-model reviewer dollars, director-era nearly all glm-5.3. The bigger price-regime confound is temporal (see §7 limitations).

---

## 7. Probe: cost vs phase-0 columns

Phase-0 columns imported verbatim (Δreqs = ΔA+ΔM, Δscen, subtasks, findings; R2 s+b and per-req yield for the 31 changes with R2 files). Y = TOTAL $ per change (join4).

| pair | N | Pearson r | Spearman ρ |
|---|---|---|---|
| cost vs **subtasks** | 36 | **+0.72** | +0.74 |
| **runner-session cost** vs subtasks | 36 | **+0.79** | +0.78 |
| cost vs Δ scenarios | 36 | +0.63 | +0.46 |
| cost vs Δ requirements | 36 | +0.47 | +0.31 |
| cost vs reviewer $ | 36 | +0.46 | — |
| cost vs total findings | 36 | +0.42 | +0.54 |
| cost vs **R2 s+b** | 31 | **−0.14** | −0.07 |
| cost vs **R2 s+b per Δreq** | 31 | **−0.28** | −0.26 |
| *controls:* findings vs subtasks | 36 | +0.43 | — |
| *controls:* Δreqs vs subtasks | 36 | +0.60 | — |

Seat-era-only variants (N=33) differ by ≤0.01 from the all-36 figures except where noted: reqs +0.48, scen +0.63, subtasks +0.73, findings +0.42.

**Reading:**

1. **Subtask count is the best cheap predictor of what a change will cost** (r = +0.72; runner-only +0.79 — runner sessions are single-model so that figure is free of reviewer-price noise). Spec-delta size is a strictly worse predictor (reqs +0.47, scen +0.63). If cost prediction is ever wanted, count tasks, not requirements.
2. **Review yield does not track cost.** R2 s+b vs cost: −0.14; per-Δreq yield vs cost: −0.28. Combined with phase 0 (yield uncorrelated with delta size), review findings look driven by what reviewers *find*, not by what the change *cost* — spending more (or writing more spec) does not buy more R2 signal.
3. **cost↔findings (+0.42) is a size echo**, not a quality signal: findings themselves correlate with subtasks (+0.43); both rise with change scale.
4. **Outlier worth knowing:** spec-model — 6th most expensive ($6.85) on the smallest possible delta (1 req, 4 scenarios). Its cost came from a 5-session reviewer fleet ($1.57, all deepseek-v4-pro) plus a $1.31 seat window. Delta size would have predicted ~$3.

**Limitations (named, not buried):**

- **Model mix varies across the corpus** (§6): seat era 85% glm-5.3 + 13% deepseek reviewers; director era 98% glm-5.3. Reviewer dollars are priced differently across eras (kimi-k3 R2-spec in the 10-20 era, free-model runs elsewhere, gpt-6-luna in the director era). Pearson on TOTAL $ therefore mixes effort with price regime. Mitigants: runner-only r (+0.79, single model) and Spearman shown for rank robustness — both tell the same story.
- **N=36 (31 for R2 pairs)** — correlations this size have wide CIs; treat as directional.
- **Director windows include pre-dispatch deliberation** (§4): M2's total carries $1.32 of queue deliberation. Three data points cannot move r much, but reader beware: window totals are mission-inclusive, not pure execution.
- **Seat windows for the 6 seat-run changes** are nearest-preceding-mention approximations (§5 note); their seat$ carries ±small misattribution risk against adjacent changes in the same session.
- **Two changes understate review cost** (no-transcript reviewers, §8); their findings counts (from phase 0) prove reviews ran.
- Costs are as-recorded harness dollars; no per-message re-pricing was applied anywhere.

---

## 8. Honest gaps

Every gap is named; none is estimated.

1. **`--no-session` reviewers (2 changes):** ops-registry and decision-scan-unify reviewer invocations left no transcripts (PF-29-era one-shot `pi -p` recipe). Their review cost is structurally invisible — reviewer$ shows $0.00 and TOTAL understates by an unknown small amount. (Phase-0 findings 34/19 prove the reviews ran.) *Derivation: reviewer count expected from phase-0 R2/R3 rows vs transcripts found = 0.*
2. **Inferred bindings ($0.4470):** deepen-fence-law's `arch-review-core`/`arch-review-scripts` sessions carry no change-slug mention; bound by era window only. Strict corpus total excluding them: $174.98.
3. **Ambiguous gherkin-era sessions ($0.6329):** `01a151a7` ($0.397) and `01a151af` ($0.236) mention both gherkin changes post-archive; not bound.
4. **Residual, fully named ($3.5635 / 9.08M tok):** the two gherkin sessions above · `01a15f92` $0.018 (no brief) · `sweep-runner` $0.475 (corpus-wide mechanical sweep, 10-22, touches many changes — corpus-level by nature) · 3 READY model-probe sessions $0.067 · `subagent-tool-test` $0.003 · **PF-33 phase-0 researcher $1.974** (this backlog line's own cost — meta, excluded from every change) · this phase-2 session $0.394 (snapshot-capped; full cost lands post-snapshot, §2).
5. **Seat-window residual ($11.57)** is non-mission interactive work, deliberate and named, not a gap in the join.
6. **Phase-0 finding re-confirmed:** the 3 "no R2 file" changes did have review sessions (§5.2) — phase-0's findings-by-artifact-absence column understates review activity for that era, though the findings *files* genuinely do not exist.

---

## 9. Advisory — should `deriveStamp` join session cost at Close?

*Advisory only, argued from evidence; no law follows from this doc.*

The metrics-stamp change (M3) stamps repo-derivable metrics at archive time. Session cost is a different animal:

1. **Env-dependence breaks the stamp's contract.** The stamp's value is `git clone` + one command reproducibility. Session cost lives in `~/.pi/agent/sessions/` keyed by *cwd path* — an environment-local store outside the repo. An archive op that reads it produces a stamp that (a) fails or silently zero-fills on any other machine, (b) changes if the same archive is run from a worktree path (different cwd dir → empty join). Evidence from this run: even the *universe* is machine-state (the store grew $1.12 while this analysis ran).
2. **Retention risk makes stamps non-re-derivable.** The store has no retention guarantee this doc could find; if sessions are pruned, a cost-stamped archive cannot be re-derived, unlike every other stamped metric. The join key itself (slug mentions) also depends on transcript text that tools may legitimately redact or compress (this very session had 78.6K→12.4K compressed mid-run).
3. **Attribution needs the window method, which is not Close-time-derivable.** Per-change cost required post-hoc per-message attribution (nearest-preceding mention capped at archive commit) plus a residual classifier, and still needed a human gate to sanity-check bindings (the join4 fold came from gate feedback). At Close time the mission is *over* — a Close-time join would work for runner/reviewer sessions (dispatch-bound) but the seat/director share needs the full later history to bound windows.
4. **PF-35 stale-tool class.** PF-35 already records the failure mode of a tool hard-coding assumptions about a moving environment (here: the sessions dir layout — already seen evolving: policy sidecars, `.acp.json` files, flat files vs documented "nested subagent directories"). Baking the join into `deriveStamp` couples the stamp to harness internals it does not control.

**Recommendation:** keep session cost out of `deriveStamp`. If per-change cost is wanted in the archive record, the viable shape is **director-side**: at Close/archive time the director (which owns the session store path and the dispatch timestamps) computes the join for *that one change* using the runner/reviewer session ids it dispatched (exact, dispatch-bound, no window inference needed for the runner+reviewer share) and appends it to the archive commit message or a `cost.md` note — never a spec-side, re-derivable artifact. Corpus-wide economics (this doc's probe) stay a research-doc activity.

---

## Appendix: derivation pipeline

Scratch scripts live in `/tmp/pf33b/` (ephemeral; constants reproduced below so the numbers stay checkable).

| step | script | what it does |
|---|---|---|
| scan | `scan2.py` | indexes all 190 project-dir sessions → `msgs2.json` (per-message ts/model/cost/tok), `index2.json` (per-session spans/models/hits) |
| events | `scan3.py` | extracts subagent launches + intercom records from seat/director transcripts → `spawn_prompts.json`, `events.json` |
| join | `join1.py`→`join3.py` | runner pick (max pre-commit slug-mention volume among writing sessions), reviewer axis from spawn-brief tokens, seat per-message nearest-preceding-mention windows capped at archive commit (UTC) |
| fold | `join4.py` | folds 13 brief-named reviewer sessions (binding table in §3/§5.1) → `join4.json` |
| probe | `probe.py` | phase-0 columns × join4 totals; Pearson + Spearman |

Load-bearing constants: archive-commit times from `git log --format="%cI|%s" -- cdd/archive`; dispatch times = `subagent_result` launch records in `01a16f41` (M1 19:36:14.307Z, M2 20:19:34.336Z, M3 21:52:37.556Z); universe cutoff 2026-10-24T22:59:19.456Z; all 29 runner sessions glm-5.3.

Corpus conservation re-check (one command, any machine with the store):
`python3 -c "import json,glob; print(round(sum(json.loads(l)['message']['usage']['cost']['total'] for f in glob.glob('$HOME/.pi/agent/sessions/--home-carsten-Projects-pi-extensions-pi-cdd--/*.jsonl') for l in open(f) if '\"role\": \"assistant\"' in l and json.loads(l).get('type')=='message'),4))"` → $190.56 at snapshot (live value drifts up as sessions append; see §2).
