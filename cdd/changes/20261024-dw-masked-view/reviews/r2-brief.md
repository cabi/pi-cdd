# R2 brief — package-mode review of 20261024-dw-masked-view

You are a cold reviewer in a contract-driven (cdd) project. You did not author
these artifacts. Read everything you need from disk; do not run tests or builds.

Independence record: the author ran as zai/glm-5.3 (family zai); any reviewer
outside the zai family satisfies the family-difference requirement — record
your own actual model + family in the cold header from your runtime metadata.

Skill: run `cdd-spec-review` in **package mode** (its SKILL.md lives at
/home/carsten/Projects/pi-extensions/pi-cdd/skills/cdd-spec-review/SKILL.md —
read it first; package mode is the mode that fires at draft-green, before the
first implementation task ticks).

Repo root: /home/carsten/Projects/pi-extensions/pi-cdd
Change: cdd/changes/20261024-dw-masked-view/ — read proposal.md (note: the
scaffold instruction comment at its top is KEPT deliberately — it is the
self-application fixture), tasks.md (gate record + design note in §2), and
specs/gherkin/spec.md (the delta: pure MODIFIED of the living requirement
"cdd archive stamps a derived metrics file"). No design.md exists — the gate
answered T2 and T4 NO, so the design note above the 2.1 tick is the chosen
shape (rule 2c). No R1 ran — the gate answered T1 and T2 NO, so R1 does not
fire; that skip is lawful, not an omission.
Living spec under review: cdd/specs/gherkin/spec.md — the MODIFIED requirement
sits at line ~1666; the delta must restate it complete (all scenarios).
Pinned HEAD: c766f0fd7269bc0d52935c4802a4570226e98d1d (the change folder itself
is uncommitted work on top of it; that is normal mid-change state).
No acceptance pin edits exist yet — task 3.2 (RED pins) is unticked; R2 fires
before it. Defect under fix (verified on disk by the director and the runner):
lib/metrics.mjs line ~108 counts `/^Done-When:/gm` over RAW proposal text while
lib/validate.mjs validateProposal (line ~33) counts `/^Done-When:\s*\S/gm` over
maskHtmlComments-masked text — the scaffold comment's "Done-When:" line makes
the stamp say 6 where the validator counts 5 (backlog PF-37, cdd/backlog.md
line 43; the minted wrong stamp: cdd/archive/20261024-20261024-metrics-stamp/metrics.md).
Validation state: `cdd validate` draft mode PASSes. Three warnings are the known
Tier A size signals (living spec 52 requirements; 8-scenario requirements list;
this delta requirement now holds 8 scenarios after the mission-mandated
addition) — the director ruled KEEP at M1; the split deferral rides the
requirement's own split-considered line (PF-6 store-ops split).

Trade you must weigh, chosen at M0 and recorded in the gate design note (tasks
§2 item 1), not an oversight: the fix exports maskHtmlComments from
lib/validate.mjs and imports it in lib/metrics.mjs (masking single-sourced),
but the count-pattern literal `/^Done-When:\s*\S/gm` will then exist in BOTH
modules; equality with validator semantics is enforced by the acceptance pin
(task 3.2), not by shared code. The rejected alternative — an exported
count-done-whens helper in validate.mjs — was rejected because it either
touches validateProposal (out of scope) or duplicates the count inside
validate.mjs itself.

Write your findings to cdd/changes/20261024-dw-masked-view/reviews/r2-change-review.md
with the cold header (model, family, pinned commit, scope, date) and a findings
table (|severity|finding|evidence|disposition|) per the skill's grammar, plus a
## Counts line. Severity blocker/should/note. Advisory findings, never verdicts:
report, do not edit the artifacts.

End with one line: VERDICT: PROCEED or VERDICT: HOLD (HOLD only if an open
blocker exists).
