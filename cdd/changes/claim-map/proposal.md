# claim-map

## Why

lib/adr-ops.mjs re-derives the file-claim map privately — its own readdir
walks, its own claiming loop, even a restated Code-line scan — while
scripts/spec-drift.mjs derives the same map its own way at 9 globToRe call
sites across 7 groups (gather topology ×2, filesClaimedByChange,
globClaimsMemory, checkL2 ×2, checkO, checkA1, checkA2). Two laws for one
truth: agreement between the surfaces is already pinned (adr-index-
agreement AG3 checks the op's --code set against the guard's A1 citations
on a synthetic repo), but a checksum on two derivations is not one law —
a glob-semantics or exemption fix can still land on one surface and not
the other, and AG2's scan covers the matcher translation only, not the
claiming loops. spec-model's Non-Goals already named this run ("future
run 3").

## What Changes

- One claim-map builder `buildClaimMap` in scripts/adr-index.mjs — a pure
  function over parsed spec models + ADR index + tracked files, yielding
  per-file claim sets, per-ADR governing sets, and open-delta claims.
- The guard's gatherFacts calls the builder once; all 9 re-derivation
  call sites read `facts.claims` (pure checks stay pure, gather stays the
  only I/O seam).
- lib/adr-ops.mjs drops governs(), its claiming loop, and its CODE_LINE
  scan (the CODE_LINE import and the matchAll restatement both go); it
  parses open-delta specs with parseSpecModel and consumes the builder.
- ADR-0013 records the law-home decision (claim law lives in adr-index.mjs).
- Behavior is byte-identical on three surfaces: guard stdout/stderr/exit,
  the adrs op's table and --code answers, and the reconfirm op's --check
  answers (checkOp is the third consumer of the same derivations and the
  riskiest parser swap).

## Solutions Considered

- gherkin: parseSpecModel (adopted — the single parse already emits
  per-requirement codeGlobs, pre-compiled; the builder consumes, never
  re-parses); the guard-pure-checks gather/pure structure (adopted — the
  builder call rides gather, checks read the map); the PF-27 worktree
  recipe (adopted — it is the byte-identity proof harness); spec-model's
  SM2 scan-pin pattern (adopted for the exactly-once pin).
- adr: buildAdrIndex + globToRe in scripts/adr-index.mjs (adopted — the
  matcher and ADR index are already single-sourced there by the living
  spec; the builder joins its own primitives); the adrs-ops real-door
  recipe in tests/acceptance/adr-ops.test.js — extension loaded via
  tests/pi-jiti.mjs fakeApi + spawnSync (adopted for the --code pin);
  tests/acceptance/adr-index-agreement.test.js AG2/AG3 (adopted as the
  existing territory holders, left untouched per H1 — claim-map.test.js
  EXTENDS, not re-pins: AG2 keeps the matcher-translation scan, AG3 keeps
  the cross-surface agreement check on a synthetic repo; the new file adds
  what neither covers: the claiming-loop exactly-once scan and the
  real-door --code run over the live store).
- extension: no fit — lib/templates.mjs DOOR_SCRIPTS is pinned at 5; a new
  traveling module is fence-dead (rejected). Zero new dependencies
  (rejected by ADR-0007's zero-dep law anyway).

## Non-Goals

- No change to glob semantics, exemption lists, or any guard verdict —
  byte-identity is the contract.
- No ops-registry or index.ts dispatch work (spec-model future run 4).
- No new store format, no new ops, no DOOR_SCRIPTS change, no new store
  copy.
- No restructuring of the guard's other gathers (pins, models, topology)
  beyond what reading the claim map requires.
- No deduplication of the two consumers' store walks — a walk is not the
  claim map; gather-once stays the guard's law and the op keeps its own
  walk.
- No change to scripts/spec-extract.mjs: its owned-territory derivation
  (compiled-glob union over git ls-files, spec-extract.mjs:132/136) is a
  set-level union for burn-down extraction, not the per-requirement claim
  map; adopting the builder there is a third surface beyond this change's
  contracts — future change candidate, named here so it is not lost.

## Decisions followed

- ADR-0001 (zero-dependency Node tooling at the doors): buildClaimMap lands
  in a door module and stays plain Node — pure computation over passed-in
  models, no runtime dependency, no fs/git inside the builder.
- ADR-0006 (one Feature document per requirement; pins are comments inside
  the fence): the new scenario rides the existing single gherkin fence of
  "The ADR claims index is single-sourced" with its pin inside the fence;
  no new fence or heading shape.
- ADR-0012 (comments are shape-of-code documentation only): the builder's
  code carries shape-only comments — no corpus routing, no WHY-prose; the
  exactly-once law lives in the spec and the acceptance pin, not in
  comments.

## Capabilities

- gherkin: cdd/specs/gherkin/spec.md MODIFIED — "The ADR claims index is
  single-sourced" (the claim map itself becomes single-sourced; new
  acceptance file tests/acceptance/claim-map.test.js) and "The drift guard
  gathers once, then checks purely" (the snapshot carries the claim map).
- adr: cdd/specs/adr/spec.md MODIFIED — "The adrs op discovers governing
  decisions" and "The reconfirm op records decision reconfirmation"
  (both consume the shared builder; no private derivation).

Done-When: tests/acceptance/claim-map.test.js exits 0 scanning scripts/spec-drift.mjs, lib/adr-ops.mjs, scripts/adr-index.mjs and scripts/grammar-law.mjs and finding the per-file claiming loop exactly once — in scripts/adr-index.mjs — with lib/adr-ops.mjs holding zero globToRe uses and zero private Code-line scan restatement (no CODE_LINE import, no matchAll(CODE_LINE)), the pin body naming the deleted sites
Done-When: the drift guard's full-corpus stdout, stderr, and exit code are cmp-identical before/after on a clean 0bd33cd worktree, compared twice — stage 1 with only this change's implementation files copied in (scripts/, lib/, and the regenerated cdd/scripts/ copies; the new acceptance test file and the change directory stay out), stage 2 with the change directory and the new acceptance test file added to BOTH sides so the open-delta claim surfaces (filesClaimedByChange, checkA1 citations, checkO's delta half, checkL2's hint) compare over real delta claims — the cmp outputs recorded in the tasks tick
Done-When: the adrs op's table, its --code reverse-lookup answers over a probe set (a tracked claimed path, an untracked path matching a governing glob, and a non-matching path), and the reconfirm op's --check answers over the live store are byte-identical before/after, all three surfaces captured in the tasks tick
Done-When: cdd/scripts/*.mjs are byte-identical to scripts/*.mjs (cmp), the full test sweep (`npm test`) exits 0, and cdd validate strict is green
Done-When: cdd/decisions/0013-*.md exists recording the claim-law home decision and tests/acceptance/decisions-home.test.js exits 0
Code: scripts/adr-index.mjs, scripts/spec-drift.mjs, lib/adr-ops.mjs, tests/acceptance/claim-map.test.js, cdd/scripts/**
