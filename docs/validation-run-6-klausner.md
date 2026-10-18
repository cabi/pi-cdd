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

## What this validates about pi-cdd

1. **Ambient injection** — agents followed the full method (phases, gates, trailer lanes, archive pairing) without ever being handed the corpus; it arrived via `before_agent_start` context.
2. **Operations-both-ways** — `/cdd-init` at bootstrap; `cdd_new`/`cdd_validate`/guard/`cdd_archive` invoked by the model at the right moments, unprompted.
3. **Auto-archive at green** — every feature closed itself: strict PASS → guard clean → suite green → archive commit. The PO never had to ask for closure.
4. **The human stays the counterparty** — three one-sentence prompts and three gate answers were the entire PO effort; all judgment calls were surfaced as option-backed asks, all remaining unknowns flagged as seed data/Platzhalter instead of guessed silently.

**Result: run 6 = green.** The method survived its third adversarial environment (after todo-app-api-v2 and holzborste) and the first one where the enforcing counterparty was the workflow itself, not an external CLI.
