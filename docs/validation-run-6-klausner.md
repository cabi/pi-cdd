# Validation run 6 — pi-cdd driven by a human PO (klausner-holzspielzeug)

**Question:** does pi-cdd deliver the OpenSpec-cdd method end-to-end when a *human product owner* drives with minimal prompts and a cold agent builds everything?

**Setup:** fresh repo `klausner-holzspielzeug` (static German wooden-toy shop site, zero dependencies). One `cdd-worker` agent definition (run-6 config: full toolset, strict gates). PO = supervisor session over intercom. Three features, each spawned with a single verbatim customer sentence; the agent had to ask for everything else.

| # | Feature (PO prompt essence) | Change | Commits |
|---|---|---|---|
| 1 | "homepage + Impressum, real address known" | `initial-homepage-impressum` | `1ad98c0` + `afc6089` |
| 2 | "show what we make, with prices, photos missing" | `sortiment-catalog` | `d6ced9a` + `b3dd583` |
| 3 | "inquiry form, email or phone" + piggyback cleanup | `kontakt-inquiry-form` | `37d619b` (mechanical) + `4a776a1` + `604eb8d` |

## Verdicts (independently re-run by the supervisor after each feature)

- `cdd_validate` strict: **PASS** before every archive, whole-store PASS after
- `node cdd/scripts/spec-drift.mjs`: **clean** after each feature (final: 1 spec, 5 acceptance tests, full scan)
- Acceptance suite: 10 → 16 → **23 pass / 0 fail**
- `cdd/changes/` empty at rest; all three changes frozen in `cdd/archive/20261018-*/`

## Design-gate behavior (the actual test)

- **F1:** gate satisfied by the PO's pre-answers; no authoring before them.
- **F2:** 4 option-backed decisions (seed prices, text-first cards, page/nav, card content) — PO answered `1a 2a ok` **plus a conversational addition** (material + age lines on cards). The addition reached the proposal, scenarios, and markup — dialogue-driven scope survives the gate.
- **F3:** 4 option-backed decisions incl. **the `Mechanical-Change:` trailer for the stray-tag fix, chosen uncoached** — the M-lane selected purely from the ambient method block. PO overrode one recommendation (DSGVO checkbox against "keep it minimal"); override absorbed, test pinned. The mechanical sweep also caught a second same-class defect (duplicate `}` in style.css) and stayed inside the trailer lane.
- **Out-of-scope discipline:** F2 spotted a pre-existing defect in F1's page and *asked* instead of fixing. Never touched a line outside its `Code:` globs without a door.

## Session-transcript analysis (the three .jsonl files)

Tool results are not persisted in this transcript format, so transcripts prove **order and timing**; outcomes are proven by the repo (re-run verdicts above). Per feature: exactly **1 `cdd_new_change`, 3 `cdd_validate` (draft → strict → whole-store), 1 `cdd_archive`**, plus `cdd_status` at start — the designed tool rhythm, unprompted.

- **Gate order holds 3/3.** First repo write always follows the design-gate ask: F1 ask at event 9 → `cdd_new_change` at 17; F2 ask at 15 → 21; F3 PO reply lands at transcript line 27, the mechanical fix at line 49 and `cdd_new_change` after — even the piggyback cleanup waited for the owner's `4a yes`.
- **F2's ask needed retries and survived them:** `ask → send → pending → list → ask` — the child worked a busy supervisor for ~80 s without human help, then proceeded only on the answer.
- **Discipline signals:** `todo` lists used in F1/F3 (9/16 calls) for multi-phase work; F2 skipped todos, read instead (14 `read` — studied the living spec + pages before asking); no repo writes outside a change, ever.
- **Effort per feature:** ~20–31 k output tokens, 6.3–8.1 min wall clock, cost dominated by cache reads (ambient corpus amortizes well: ~1.2 k-token method block cached across every request).

## Screenshot analysis (Chrome headless, file:// , 1280 px)

Objective CDP audit (structure + computed styles, re-verified live):

| page | height | h1 | h2 | links | form fields | overflow-x |
|---|---|---|---|---|---|---|
| index.html | 1369 | 1 | 2 | 4 | 0 | no |
| katalog.html | 2600 | 1 | 3 | 3 | 0 | no |
| kontakt.html | 1526 | 1 | 1 | 2 | 7 | no |
| impressum.html | 1120 | 1 | 1 | 1 | 0 | no |

Palette and typography are uniform across all four pages (`system-ui` on `rgb(250,245,236)` cream, text `rgb(53,41,29)`). The catalog is the tall page (9 cards) and stays inside the viewport width.

**Vision pass (vision-capable reviewer on true full-page shots): PASS on all four pages.**

- kontakt: complete inquiry form — Name, E-Mail, optional Telefon, E-Mail/Telefon radios, unchecked DSGVO checkbox, "Anfrage senden" submit, Platzhalter note; one consistent input column. Only nit: two-line phone label wrap (below noticeability).
- impressum: "Vertretungsberechtigt" + value fully rendered, footer intact; German legal typography correct throughout.
- katalog: all 9 cards painted; per-row grid stretching absorbs the DOM height variance (`300×5, 250, 276×2, 300`) — aligned baselines, no orphan rows.
- Price contrast, computed (not eyeballed): `rgb(122,79,43)` on `rgb(255,253,248)` at 19.2 px = **6.93:1** — WCAG-AA comfortable, near-AAA. The reviewer's "~3.5:1" from a scaled crop was wrong; the math settled it.
- Best detail called out by the reviewer: correct German typographic quotes „…" and em-dashes in the product cards.

**Capture-pipeline lesson (why this section took three passes):** two plausible screenshot methods were silently wrong — the helper's default shot is a 493 px viewport crop (which made a below-the-fold form look "missing"), and CDP `clip` beyond the viewport paints only the first screenful onto a tall blank canvas (`captureBeyondViewport` nulls outright in this Chromium build). The working recipe: launch the browser taller than the tallest page (`--window-size=765,2700`), plain `Page.captureScreenshot`, then `magick -trim`. Structural facts came from DOM audits, not pixels — the right division of labor for a visual door.

Full-page screenshots archived in `docs/run-6-shots/` (index, katalog, kontakt, impressum).

## Artifact-vs-result comparison (the run-5 style audit)

All nine archived artifacts (`cdd/archive/2026-10-{initial-homepage-impressum,sortiment-catalog,kontakt-inquiry-form}/` — proposal, spec delta, tasks each) audited against the verified delivered site: tests re-run **23/23 green**, spec-pinned facts re-grepped from the pages, DOM audits + vision pass as ground truth.

| feature | promised (spec) | delivered | delta |
|---|---|---|---|
| F1 homepage+Impressum | 1 h1, Allgäu + "seit 1962", "Die Werkstatt" section, 3 categories ≥40 chars, 1 footer link; GmbH identity, 4 Platzhalter fields, back link; hygiene + 0 external refs | all exact | **0** |
| F2 catalog | 3 h2 in order (Bausteine/Fahrzeuge/Klangspielzeug), ≥9 cards, `00,00 €` regex, wood+finish enum, age line, MwSt note, nav counts | all exact (h2 greps confirm; vision3's "Klangezeug" was model OCR noise, objective grep wins) | **0** |
| F3 kontakt form | mailto prefix + Platzhalter note, method/enctype, field set incl. radios + consent, textarea ≥5 rows (got 6), nav counts incl. "sprechen Sie uns an" link | all exact | **0** |

**Ledger: zero promised-but-missing, zero contract-relevant delivered-but-unspecified, zero wording drift.** Unspecified-but-delivered polish (palette tokens, hero-compact shell, per-row grid stretch, single-column form) stays inside "no new visual language" — legitimate designer freedom, not drift.

**Falsifiability (mutation test, scratch copy):** price `12,50 €` → `12.50 EUR` + stripping `required` attributes → suite fails **exactly 2 targeted tests** (21/23). The pins bite where the spec promises, nowhere else.

**Traceability of the human amendment:** the PO's DSGVO-checkbox pushback (against the agent's "keep minimal") flowed verbatim through the chain — design-gate note in `tasks.md` → proposal Solutions Considered ("amended by the product owner") → spec scenario ("ausschließlich zur Beantwortung") → acceptance test → rendered checked-less checkbox on the page. Disagreement absorbed without drift.

**Ratings** (same scale as run 5):

| artifact | rating | evidence |
|---|---|---|
| Proposals (3) | 9.5 | every Done-When objectively checkable; non-goals held across all three (no JS, no photos, no backend, no English); solutions-considered with rejections and reasons |
| Spec deltas (3) | 9.5 | every scenario pinned + countable; one honest looseness: "material line *containing* 1 finish" is a floor — delivered lines sometimes name two finishes ("geschliffen und geölt"), which "containing" allows and the test enforces correctly |
| Tasks (3) | 9.5 | Done-When traceability tables complete; verify-by pin per task; context step records store state; design-gate answers transcribed |
| Acceptance tests (5 files, 23 tests) | 10 | 23/23 green; mutation-kill exact; zero flake; counts written as *exact* (`exactly 1`), not ≥ — drift-detecting, not presence-detecting |
| M-lane (37d619b) | — | `Mechanical-Change:` trailer, behavior-preserving cleanup, guard green, no spec aged — the uncoached correct lane |

**Method lesson (engraved in the product):** scenario verb choice is the strictness dial — "contains exactly N" makes drift detectable, "contains N" is ambiguous between that and a floor. Engraved in pi-cdd itself (`lib/validate.mjs` strictness-dial warning + delta-template rule + smoke check S26), not upstream: openspec-cdd is the forge that built the method against the real CLI counterparty and will be retired; pi-cdd is the surviving product and carries the whole corpus.

## What this validates about pi-cdd

1. **Ambient injection** — agents followed the full method (phases, gates, trailer lanes, archive pairing) without ever being handed the corpus; it arrived via `before_agent_start` context.
2. **Operations-both-ways** — `/cdd-init` at bootstrap; `cdd_new`/`cdd_validate`/guard/`cdd_archive` invoked by the model at the right moments, unprompted.
3. **Auto-archive at green** — every feature closed itself: strict PASS → guard clean → suite green → archive commit. The PO never had to ask for closure.
4. **The human stays the counterparty** — three one-sentence prompts and three gate answers were the entire PO effort; all judgment calls were surfaced as option-backed asks, all remaining unknowns flagged as seed data/Platzhalter instead of guessed silently.

**Result: run 6 = green.** The method survived its third adversarial environment (after todo-app-api-v2 and holzborste) and the first one where the enforcing counterparty was the workflow itself, not an external CLI.
