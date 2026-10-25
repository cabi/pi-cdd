# r3-spec-code-review — 20261025-stale-lib-guard — 2026-10-25 — reviewer: cold subagent (fresh session)

Model: gpt-6-luna (opencode-zen); thinking: high; axis: spec; form: cold subagent, fresh session.

| severity | finding | evidence | disposition |
|---|---|---|---|
| blocker | The Done-When requiring `npm test` to exit 0 is not met in the reviewed tree. The full test command exits 1: `comment-shape-adr.test.js` reports CSA2 for `index.ts` moving after ADR-0012, and `decisions-home.test.js` reports DH6/A2 for `index.ts` moving after ADR-0002, ADR-0007, and ADR-0012. | `proposal.md:52`; `tasks.md:3.6` records the earlier green run; current `npm test` output. | fixed — see Author dispositions below |
| blocker | Scenario 8's acceptance pin is already stale before the same-length rewrite, so it would refuse even if dispatch-time digest detection regressed to metadata-only detection. The shared process is made stale at lines 160–162; scenarios 3–4 restore that stale edit at lines 228 and 246. Scenario 8 then restores the mtime only to the already-stale file's pre-rewrite metadata, not its load-time metadata. The unit pin T5a tests the digest helper, but does not make this dispatcher scenario honest. | Delta scenario 8 (`spec.md:112–116`); `tests/acceptance/stale-lib-guard.test.js:160–162, 281–298`; `tests/tools.mjs:380–391`. | fixed — see Author dispositions below |
| blocker | Scenario 7 does not assert that each door command's fresh-node command runs its own operation. It checks only that each captured refusal contains `node -e`; all three could emit the same operation's command and this pin would stay green. | Delta scenario 7 (`spec.md:106–110`); `tests/acceptance/stale-lib-guard.test.js:261–279`. | fixed — see Author dispositions below |
| blocker | Scenario 9 does not prove the revalidate command revalidates anything: it resolves PF-1 before revalidation, leaving no active premise-bearing item, then checks only `rReval.ok`. A wrong read/no-op command returning `ok: true` could pass. | Delta scenario 9 (`spec.md:118–122`); `tests/acceptance/stale-lib-guard.test.js:350–360`. | fixed — see Author dispositions below |
| note | The declared surface names `lib/*.mjs` and `lib/*.ts`, but the implementation recursively includes every file under `lib/`. A non-source asset there will stale an otherwise-current process; no such asset exists in the current tree. Narrow the filter or deliberately clarify the broader scope. | `proposal.md:9`; `lib/stale.mjs:36–42`; `tests/tools.mjs:375–378` demonstrates extension filtering for `scripts/`. | fixed — see Author dispositions below |

No should findings. Acceptance evidence: `node --test tests/acceptance/stale-lib-guard.test.js` passed 9/9; `npm test` exited 1 as noted above. The diff's current dispatch and door handlers otherwise implement the refusal/warning behavior, and no fresh-spawn mutation, cdd-store tracking, or unrelated validate/archive semantic change was found.

## Author dispositions — 2026-10-25 (fix commit 0f7e3dc)

- blocker B1 (`npm test` exit 1: ADR-freshness A2 on ADR-0002/0007/0012) — **fixed:**
  the feature commit legitimately moved `index.ts`/lib after those ADRs were last
  touched; each ADR reconfirmed through the fresh-node `reconfirmOp` path (the
  exact command shape the guard's refusals name), evidence lines in
  `cdd/decisions/0002-*.md`, `0007-*.md`, `0012-*.md`, riding commit 0f7e3dc.
  `npm test` exit 0 and `node cdd/scripts/spec-drift.mjs` exit 0 (full scan) after
  the commit.
- blocker B2 (scenario 8 ran on an already-stale process) — **fixed:** scenario 8
  now spins an isolated clean process (`C = scratch()`), asserts the clean pre-state
  (exactly one stale entry, `lib/ops.mjs` kind `changed`), then proves the digest
  catches the same-length/same-mtime rewrite on top of a matching snapshot.
- blocker B3 (scenario 7 could emit the same op's command) — **fixed:** each
  captured refusal must contain its own op's call (`m.initStore(`, `m.createChange(`,
  `m.archiveChange(`).
- blocker B4 (scenario 9 revalidated a resolved item) — **fixed:** the add command
  now carries a premise; revalidate runs while the item is open and its verdict
  line (`PF-1 [open] hold — premise holds`) is asserted before resolve; delta
  scenario amended to the same honest order (added, revalidated while open,
  resolved).
- note (declared surface vs recursive implementation) — **fixed by aligning the
  declaration:** every file under `lib/` is deliberately on the surface (recursive,
  fail-safe like `vendor/`); `proposal.md` What-Changes and tasks 3.3 updated;
  pinned in `tests/tools.mjs` T5c (a non-`.mjs` file under `lib/` is on the surface).

All blockers disposed; acceptance suite 9/9, `npm test` 0, guard 0.
