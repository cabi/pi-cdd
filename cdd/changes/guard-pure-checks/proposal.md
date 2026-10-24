# guard-pure-checks

## Why

The drift guard still re-derives its context per law: every check walks the file tree and runs its own git calls (10 `git()` call sites and 23 `issues.push` sites interleaved with I/O across 630 lines), so each new law re-implements gathering, and tests must build a full git-sandbox repo per scenario precisely because no check is directly callable (tests/smoke.mjs builds one sandbox per guard scenario). Run 1 centralized the parse; the guard's structure is the remaining divergence: the same question — which files, which specs, which git state — is answered independently inside every law.

## What Changes

- scripts/spec-drift.mjs is restructured into one gather pass plus pure checks: a single `gatherFacts()` collects every law input exactly once (disk listings, per-spec models via the run-1 single parse, resolved pins, git state including the staged/pre-commit distinction, open-change claim maps, ADR index, change docs); every law (A0/A1/A2, G, H, L1, L2, L3, L4, M, O) becomes a pure function over that snapshot returning findings and note side-channels; a runner calls them in the unchanged check order and maps findings to the unchanged report and exit codes.
- The guard module becomes importable side-effect free (`main()` behind a run-as-script guard), so pure checks are directly callable from tests without a git sandbox.
- New acceptance pin tests/acceptance/guard-pure-checks.test.js: a source scan confining all filesystem/git/console access to the gather pass and runner, and a direct pure-check call on synthetic in-memory facts.
- tests/smoke.mjs: redundant sandbox builders whose law family already holds a real-door acceptance pin convert to direct pure-check calls — every law family keeps at least one real-door end-to-end pin (coverage discipline; each deletion names the retained pin in the tasks record).
- The door's observable behavior is byte-identical: stdout, stderr, and exit code, proven once via the PF-27 worktree recipe (baseline 3f484a5 vs the branch's changed files, full-corpus run, cmp of all three streams). The proof rides the task tick as migration evidence; it is not a delta scenario.

## Solutions Considered

- gherkin capability / guard structure: the run-1 spec model (parseSpecModel in scripts/grammar-law.mjs) — adopted as the gather pass's parse source; the guard already consumes it, this change moves the consumption into one seam. No new parse, no new grammar.
- Gather seam placement: a new scripts/spec-drift-facts.mjs module — rejected; the fence pins DOOR_SCRIPTS at five and adopting stores copy exactly that set, so the gather pass lives inside the guard file as a function. Moving laws to lib/ — rejected for the same self-containment reason (the copied door cannot import host-side lib/).
- Behavior lock: memoizing git/fs calls inside the current interleaved structure — rejected; it removes duplicate subprocesses but leaves checks uncallable and the I/O seam smeared, so sandbox tests remain the only entry point.
- Test strategy: the house self-rolled `check(id, name, fn)` runner (spec-model.test.js precedent) — adopted for the new pin; node:test — rejected as a style switch mid-sequence (35 existing suites use the house runner).
- Byte-identity verification: the PF-27 worktree recipe already proven by adr-ops and spec-model — adopted unchanged (baseline capture before copying branch files, changed files only, full corpus, three-stream cmp).

## Non-Goals

- No new door script, no store-format change: DOOR_SCRIPTS stays 5, LAW_VERSION stays 2, the parse home stays grammar-law.mjs (run 1's law).
- No new laws, no changed verdicts, no changed check order, tags, report text, or exit semantics — those are pinned byte-identical by the proof.
- No restructuring of the extractor, store adapters, or any other door script — runs 3/4 of the sequence own their shape.
- No migration of real-door end-to-end tests: every law family keeps at least one acceptance pin exercising the real door in a sandbox repo; only redundant sandboxes convert.
- No spec delta for byte-identity: it is a one-shot migration proof riding the tick, not a durable promise.

## Decisions followed

- ADR-0001 (zero-dependency node tooling): the guard keeps its zero-dependency doors — doors 1-2 never import the parser; the door-3 dynamic import of @cucumber/gherkin stays where it was, inside the gather pass, gated on the full-scan scope.
- ADR-0006 (feature-block consolidation): pins stay `# Verified by:` comments inside the gherkin fence; the restructure moves no pin and changes no fence grammar.
- ADR-0007 (the law behind every door): one law, one door script — the restructure stays inside scripts/spec-drift.mjs (and its store copy), adding no door and splitting no law out.
- ADR-0012 (comments are shape only): the new region comments (gather/pure/report markers) describe module shape, not contract; no comment carries normative weight.

## Capabilities

- gherkin: cdd/specs/gherkin/spec.md gains one ADDED requirement (the gather-once/pure-check structure with its scan and direct-call scenarios).

Done-When: node tests/acceptance/guard-pure-checks.test.js exits 0 with the I/O-seam scan and the direct pure-check scenarios passing
Done-When: the PF-27 worktree byte-identity proof records cmp-identical stdout, stderr, and exit code for the guard's full-corpus run (baseline 3f484a5 vs the branch's changed files)
Done-When: npm test exits 0 with all 36 acceptance suites green and node tests/smoke.mjs exits 0
Done-When: cdd validate strict reports zero errors for guard-pure-checks and node scripts/spec-drift.mjs exits 0 printing a `spec-drift: clean (` line
Code: scripts/spec-drift.mjs, cdd/scripts/**, tests/acceptance/guard-pure-checks.test.js
