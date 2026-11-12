
## 2026-11-12 — tests/acceptance/adopter-neutral-surfaces.test.js (task 3.2)

    node --test tests/acceptance/adopter-neutral-surfaces.test.js
    exit=1  pass 0  fail 3

All three scenarios red on the id citations; the failing assertions enumerate
exactly the proposal's leak inventory:

- lib/templates.mjs:23, cdd/rules.md:66, lib/instructions.mjs:69 (corpus)
- lib/validate.mjs:66, lib/validate.mjs:71, scripts/spec-drift.mjs:622,
  scripts/grammar-law.mjs:206, scripts/grammar-law.mjs:227 and their
  cdd/scripts twins (door findings)
- fresh scratch store: scaffolded cdd/rules.md inherits the template leak
  (plus the grammar-law/spec-drift twins via writeDoorScripts)

Note: two harness bugs were fixed before the run counted (REPO resolved one
directory short without path.dirname; matchAll needed /g). The recorded run is
after those fixes — the red is the law's red, not the harness's.

Post-run note: after the strip (3.3) the suite file was restructured into a
file-named describe block — the house pattern that puts the filename into the
TAP stream (RA2 in run-acceptance.test.js greps for it). The three scenarios,
surfaces, and assertions are unchanged; the recorded red run predates the strip
and the wrapper, both no-ops for the law's semantics.
