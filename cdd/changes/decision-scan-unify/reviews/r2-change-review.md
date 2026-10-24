# R2 package review — decision-scan-unify

- Reviewer form: cold sub-agent session.
- Model family: opencode-zen / gpt-6-luna; author family: zai / glm-5.3. The families differ.
- Reviewed state: uncommitted working tree on branch `decision-scan-unify`, HEAD `f76f12f72fe205462d077cf79d7a71e1faccad3e` (= main).
- R1 skip: lawful; tasks §2.1 records T1 NO and T2 NO.

## Findings

### 1. blocker — The delta does not contract full extractor-row equivalence

The legacy-flags scenario promises only the same location-and-status set as the private scan. It does not require `code` and `title` (or row order) to remain unchanged, although the proposal's Done-When requires before/after equality for location, status, code, title, and order, and task 3.4 compares the extractor outputs. A runner could satisfy the delta scenario while changing the extractor's code/title projection and still violate the stated behavior-preservation contract. The full row equivalence needs to be part of the requirement scenario, not only the proposal/task proof.

Evidence: `cdd/changes/decision-scan-unify/specs/gherkin/spec.md:52-56`; `cdd/changes/decision-scan-unify/proposal.md:97`; `cdd/changes/decision-scan-unify/tasks.md:72-73`.

Disposition: fixed — the legacy-flags scenario's Then now contracts the full rows (location, status, code, title, in the same order) equal to the pre-change private scan's rows on the same tree (cdd/changes/decision-scan-unify/specs/gherkin/spec.md, "Legacy flags preserve the extractor surface"); DS3 in tasks 3.2 and proposal Done-When 1 pin the same full-row comparison on both the live-tree baseline and the synthetic tree.

### 2. should — Reconfirm preservation is promised but not compared before/after

What Changes promises unchanged guard/adrs/reconfirm answers, but the byte-identity Done-When and task 3.5 enumerate the guard and adrs table/`--code` probes without a `reconfirm --check` before/after comparison. The full test sweep may keep existing reconfirm tests green, but the stated package proof does not establish that this surface's answers are byte-identical across the scan refactor.

Evidence: `cdd/changes/decision-scan-unify/proposal.md:31-33,96`; `cdd/changes/decision-scan-unify/tasks.md:73`. The prior claim-map proof explicitly included reconfirm answers in its before/after probe: `cdd/archive/20261024-claim-map/tasks.md:80-81`.

Disposition: fixed — tasks 3.5's ops probe now reads "the adrs op's table, --code, and reconfirm --check probe answers before/after", and proposal Done-When 2 carries the same extension, mirroring the claim-map proof's reconfirm inclusion.
