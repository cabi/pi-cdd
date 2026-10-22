# R3 spec-axis code review — adr-dir-migration

- Reviewer form: cold sub-agent session (fresh session, not the author's; brief read from `reviews/r3-spec-brief.md` on disk).
- Model family: **deepseek** (`PI_PROVIDER=opencode-zen`, `PI_MODEL=deepseek-v4-pro`) vs. author's **zai** (GLM lineage) — families differ, as the brief requires.
- Artifact under review: `git diff 6ce22d1...HEAD` plus the uncommitted working-tree changes (`cdd/backlog.md`, `cdd/changes/adr-dir-migration/tasks.md`).
- Axis: Spec only. Standards conformance is out of scope (separate session).

## Spec axis

### Finding 1 — blocker — the "Root-path references survive only as history" scenario is not implemented; the acceptance pin is RED

The gherkin delta's scenario "Root-path references survive only as history" (`cdd/changes/adr-dir-migration/specs/gherkin/spec.md`) requires that, scanning every tracked file outside the archive and the open change folders, root-path `decisions/` references remain only in `PRODUCT.md` and the 0001 body. The living spec was not swept: `cdd/specs/gherkin/spec.md:149` still carries the root-path entry in the "Declarative style is door-1 law" `Code:` line:

```
Code: … lib/instructions.mjs, decisions/0007-the-law-behind-every-door.md, tests/smoke.mjs, …
```

The delta's own MODIFIED "Declarative style is door-1 law" requirement drops exactly this `decisions/0007-the-law-behind-every-door.md` entry (the proposal's "What Changes" promises "gherkin's 'Declarative style' Code: drops the root 0007 entry"), but the living spec `cdd/specs/gherkin/spec.md` was never edited to match.

Evidence: the pin `tests/acceptance/decisions-home.test.js` DH5 fails on exactly this line:

```
FAIL DH5  root-path ADR references survive only as history
  live root-path references remain:
  cdd/specs/gherkin/spec.md:149: Code: … decisions/0007-the-law-behind-every-door.md …
```

`npm test` is therefore not green (17 pass, 1 fail — the failing suite is `decisions-home.test.js`), so the Done-When criterion "npm test is green with the single-home pins (SSL2b, decisions-home.test.js)" is unmet. The pin is doing its job (it correctly turns red on the regression); the delta is simply not fully landed.


**Disposition — fixed:** the living spec's root-path `Code:` entry is archive-gated by law, not unswept: the archive lock (guard L2/M-check class) rejects any `cdd/specs/` edit outside the archive commit, so the delta's MODIFIED requirement — which drops exactly that entry — can only land via `cdd archive` (task 4.4). DH5 red between F and A is the designed pair-commit transient (documented in `4938f5c`'s message and the milestone-3 report; L2 precedent). Verified: DH5 green immediately after the archive commit, recorded in the Close report.
### Finding 2 — should — implementation tasks 3.3–3.8 are unticked while their work is committed

`cdd/changes/adr-dir-migration/tasks.md` shows only 3.1 and 3.2 ticked; 3.3 (migration pin), 3.4 (move commit M), 3.5 (law sentence), 3.6 (reference sweep), 3.7 (Reconfirmed-by paragraphs), and 3.8 (feature commit F) are all `- [ ]`, yet the corresponding work is present in the diff (the ADRs are moved, the law sentence is rewritten, the Reconfirmed-by paragraphs exist, and commits `0877cd5` and `4938f5c` landed). This is corroborating evidence that the change is not formally complete — consistent with Finding 1's missing living-spec sweep. (Tick state is process-adjacent, but it bears directly on whether the delta is fully implemented, so it is reported here rather than left to the Standards axis.)


**Disposition — fixed:** ticks 1.1 and 3.3–3.8 applied with the Close disposal — the earlier tick pass had converted only 3.2, so the reviewer's read was correct and the author's "stale" first reaction was wrong. The ticked tasks.md rides the archive commit.
### Finding 3 — note — DH5 exempts its own test file and never asserts the positive "survive as history" half

`tests/acceptance/decisions-home.test.js` DH5 exempts `tests/acceptance/decisions-home.test.js` itself from the root-reference scan, but that file contains no bare `decisions/` reference (verified by grep), so the exemption is dead. Separately, the check asserts only the negative half of the scenario — that no live file outside the exemptions names a root `decisions/` path — and never asserts the positive half, that `PRODUCT.md` and the 0001 body actually *do* contain the historical references. The pin would stay green if those historical references were deleted outright. Neither is a correctness problem today; both are pin-completeness gaps worth tightening.


**Disposition — won't-fix:** verified independently — the file holds no bare `decisions/` reference today (grep agrees with the reviewer), so the self-exemption is currently dead; it is kept as defense-in-depth because the suite's subject matter is root `decisions/` paths — any future needle or fixture line naming one bare would self-flag the pin without the exemption. The positive "survive as history" half is consciously carried: the sanctioned survivors are exactly DH5's exemption list, and pinning their prose would couple the suite to factory-note wording this change does not govern.
## Summary

One blocker: the living spec `cdd/specs/gherkin/spec.md:149` still names `decisions/0007-the-law-behind-every-door.md`, so the "Root-path references survive only as history" scenario is unimplemented and `npm test` is red. The remaining findings are a should (unticked tasks 3.3–3.8) and a note (DH5 pin-completeness gaps). All findings are advisory; disposition is the author's.
