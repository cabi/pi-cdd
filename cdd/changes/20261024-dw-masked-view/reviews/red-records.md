# Red records — 20261024-dw-masked-view

## M-red 1 — task 3.2: the PF-37 pins fail on unfixed code (2026-10-25)

Command (fresh node, PF-35 discipline):

    node tests/acceptance/archive-metrics-stamp.test.js

Output tail (exit 1; M1–M7 all `ok` — pre-existing pins hold; the three new
PF-37 pins are red):

      ok   M1  archive writes metrics.md with the spec-strength block
      ok   M2  stamped counts equal direct counts and ride the single parse
      ok   M3  all 7 findings layouts counted, one format-version line, zero-row file is 0
      ok   M4  lying declared counts (bold line and inline heading) yield exactly 2 mismatch lines; parsed numbers win
      ok   M5  3 labeled derivable git facts, beyond-2-norm omitted-with-reason, honest gaps named
      ok   M6  non-git store stamps git fields not-derivable, never estimated
      ok   M7  total stamp failure archives anyway with stamped:false + reason
      FAIL M8  done-whens counts the validator's masked view, not raw lines (comment fixture: 5 raw -> 4)
           done-whens not 4 (the masked view; raw would say 5):
      # metrics — stamp-me
      done-whens: 5
      FAIL M9  bare Done-When: line yields the validator's own count (its \s* spans newlines; agreement by construction)
           M9: lib/validate.mjs does not export maskHtmlComments
      FAIL M10  metrics.mjs imports maskHtmlComments from validate.mjs and holds no masking regex of its own
           M10: lib/validate.mjs does not export maskHtmlComments

    M9: lib/validate.mjs does not export maskHtmlComments
    M10: lib/validate.mjs does not export maskHtmlComments
    (summary line: `8 passed, 3 failed`; process exit 1)

M8's failure body is the defect itself: the fixture proposal holds 4 real
Done-When lines plus the scaffold instruction comment (5 raw `^Done-When:`
matches); the unfixed stamp mints `done-whens: 5` (raw count) where the
validator's masked view — and the contract — say 4.

## M-red 2 — B1: the same pins on a pristine pinned-parent worktree (2026-10-25)

Command sequence (worktree cleaned up after):

    git worktree add --detach /tmp/dwmv-parent c766f0f
    cp tests/acceptance/archive-metrics-stamp.test.js /tmp/dwmv-parent/tests/acceptance/
    (cd /tmp/dwmv-parent && node tests/acceptance/archive-metrics-stamp.test.js)

Result: `7 passed, 3 failed`, process exit 1 — identical FAIL set (M8/M9/M10)
with M8's body again minting `done-whens: 5`. The red is attributable to the
pinned parent's code alone, not to any uncommitted intermediate state.

## Ground-truth note — recorded at authoring, before the pins were written (node, 2026-10-25)

Ground-truth note recorded at authoring (node, 2026-10-25): the validator's
`/^Done-When:\s*\S/gm` spans newlines (`\s` matches `\n`), so a bare
`Done-When:` line counts by absorbing the next line's first character; raw
`/^Done-When:/gm` counts the line itself. Both views count a bare line, so
agreement holds by construction once the stamp runs the validator's exact
pattern over the validator's exact masked view — this corrected the tasks.md
§2 design note 2 wording ("counts 0 in both views" was wrong) before
implementation.
