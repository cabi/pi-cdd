# R3 spec review — claim-map implementation diff

**Review point:** R3 (Close), spec axis only. Findings are advisory, never verdicts; gate authority stays with `cdd validate`, the drift guard, and the human.

## Reviewer form and model family

- **Reviewer form:** cold sub-agent session. It read the change only from disk at the pinned state and authored none of the artifacts under review (loop law rule 2b).
- **Author family:** `zai` / `glm-5.3` (per the brief).
- **Reviewer model actually run:** `deepseek-v4.1-flash` (provider `opencode-zen`). **Family: DeepSeek.** The families differ, so the R3 cold-session family requirement is met.
- **Assignment:** `cdd/changes/claim-map/reviews/brief-r3-spec.md`.
- **Charter:** spec axis only — does the diff implement the delta (every requirement, every scenario, nothing unsponsored)?
- **Effects:** no build, no `npm test`, no `cdd validate`, no guard run, no commits. Only reads, greps, `git rev-parse`, `git status`, `git ls-files`, and `cmp -s` were executed. This findings file is the only write.
- **Severity vocabulary:** the brief's `blocker` / `should` / `note`; on the harness scale that is blocker ≈ P1, should ≈ P2, note ≈ P3. All findings below are `candidate`→`confirmed` by trace unless stated otherwise.

## Pinned state

- **Repository:** `/home/carsten/Projects/pi-extensions/pi-cdd`, branch `claim-map`.
- **Base = HEAD:** `0bd33cdc81521e6e299a8c8eeafe0dc6eacb0583` — confirmed by `git rev-parse HEAD`; identical to the SHA pinned in the brief. No drift.
- **Head:** the working tree. Nothing is committed for this change, so the reviewed diff is `0bd33cd → worktree` (238 insertions, 96 deletions across tracked files, plus three untracked paths).
- **Working-tree scope, all three classes included:**
  - staged: none (`git status --porcelain` reports no index entries).
  - unstaged (8): `cdd/scripts/adr-index.mjs`, `cdd/scripts/spec-drift.mjs`, `lib/adr-ops.mjs`, `scripts/adr-index.mjs`, `scripts/spec-drift.mjs`, `tests/acceptance/adr-index-agreement.test.js`, `tests/acceptance/adr-ops.test.js`, `tests/acceptance/decisions-home.test.js`.
  - untracked (3): `cdd/changes/claim-map/`, `cdd/decisions/0013-one-claim-map-for-guard-and-ops.md`, `tests/acceptance/claim-map.test.js`.
- **Delta under review:** `cdd/changes/claim-map/specs/gherkin/spec.md` (1 ADDED requirement, 7 scenarios) and `cdd/changes/claim-map/specs/adr/spec.md` (3 MODIFIED requirements, 29 scenarios). Implementation targets: `scripts/adr-index.mjs`, `scripts/spec-drift.mjs`, `lib/adr-ops.mjs` and the five `cdd/scripts/*` door copies (byte-identity confirmed by `cmp -s`: all identical).

## Sponsorship judgment

| question | verdict | evidence |
| --- | --- | --- |
| twelve→thirteen inventory pins (`decisions-home.test.js` DH2/DH6, `adr-ops.test.js` AO1, `adr-index-agreement.test.js` AG1) | **Sponsored.** Each pin traces to a delta Then-clause that states thirteen (DH2 ↔ "holds exactly the 13 ADRs numbered 0001 through 0013"; DH6 ↔ "governs all thirteen ADRs"; AO1 ↔ "lists all 13 ADRs in id order"; AG1 ↔ "one entry per ADR"). | `cdd/changes/claim-map/specs/adr/spec.md:13` (AO1), `:183` (DH2), `:201` (DH6); `cdd/changes/claim-map/specs/gherkin/spec.md:10` (AG1's scenario); `tests/acceptance/decisions-home.test.js:43,93`; `tests/acceptance/adr-ops.test.js:71`; `tests/acceptance/adr-index-agreement.test.js:67` |
| `DIR_LIB` gaining `ADR-0013` (`tests/acceptance/adr-ops.test.js:62`) | **Sponsored, one step removed.** The delta pins the *rule* ("every accepted ADR governing at least 1 claimed file under `lib/`, ordered by id"), not the literal list; ADR-0013's `code:` glob `lib/adr-ops.mjs` makes its membership the rule's consequence, not a hand-edit. | `cdd/changes/claim-map/specs/adr/spec.md:61` (directory Then) + `tests/acceptance/adr-ops.test.js:62,115` |
| two byte-identity contracts (tasks 3.6 evidence) | **Sponsored.** DW2 pins guard output identity in two stages and DW3 pins op-answer identity incl. the untracked probe; the `--code` probe set in the delta (tracked path, untracked path, directory, no-match, out-of-root) is the same set DW3 names. | `cdd/changes/claim-map/proposal.md:101` (DW2), `:102` (DW3), `cdd/changes/claim-map/tasks.md` task 3.6 |
| ADR-0013's existence and code globs | **Sponsored for existence**, by the "Product ADRs" delta block ("0008 and later the loop decisions") plus DW5 (`cdd/decisions/0013-*.md` exists and `decisions-home.test.js` greens). The specific glob choice is ADR *decision content*, covered by the separate ADR review (task 4.3), not by a delta scenario — correctly out of this axis. | `cdd/decisions/0013-one-claim-map-for-guard-and-ops.md:1-45`; `cdd/changes/claim-map/specs/adr/spec.md:175`; `cdd/changes/claim-map/proposal.md:104` (DW5) |

**Delta scenarios with no implementation change: none found.** Every ADDED/MODIFIED requirement has a corresponding code delta (claim-map builder + 9 guard read sites, op `--code`/`--check` rewiring, ADR-0013 + inventory pins). Item (4) of the brief is satisfied.

## Findings

| id | severity | finding | evidence (path:line) | disposition |
| --- | --- | --- | --- | --- |
| SPEC-01 | should | CM1's scan corpus omits `scripts/grammar-law.mjs`, which the delta scenario's When-clause and DW1 both name as a scanned source — the pin cannot fail if a claiming loop or glob translation reappears there | `tests/acceptance/claim-map.test.js:66-70,98-104`; `cdd/changes/claim-map/specs/gherkin/spec.md:30`; `cdd/changes/claim-map/proposal.md:100` | fixed: grammar-law added to the corpus with a dedicated no-claiming-loop assertion; the exactly-once predicate narrowed to the claim signature `re.test(` (compile via `globToRe(` stays legal in grammar-law); delta scenario Then extended — "scripts/grammar-law.mjs holds no claiming loop, its shared parse compiling the Code: globs it reads without claiming files" — so text and pin now agree |
| SPEC-02 | note | CM1 pins the "no restated `Code:`-line scan" rule by banning the literal text `Code:`/`CODE_LINE` anywhere in `lib/adr-ops.mjs` (a comment mentioning it would fail) while re-derivation spelled `new RegExp(...)` / `re.exec(` escapes both bans; "answers come from the shared claim map" is pinned only by the identifier `buildClaimMap` appearing | `tests/acceptance/claim-map.test.js:84-97,105-106` | fixed: escape spellings closed — `\.re\.test\(` strengthened to `re\.test\(` (catches `res.some((re) => re.test(f))` and `c.re.test(` alike; verified zero false positives in guard/ops/grammar-law). Identifier-only half won't-fix: a data-flow pin needs AST tooling the zero-dep law (ADR-0001) forbids; re-derivation is covered jointly by CM1 (spellings), CM2 (routing), AO5/AO10 (answers), AG3 (cross-surface agreement) |
| SPEC-03 | note | CM2's op-vs-map equality is a *routing* pin, not a semantics pin: the op and the assertion now call the same function, so its only independent content is non-emptiness on one untracked probe; the scenario's semantic Then-clause rests on AO5/AO10's exact-id sets, not on CM2 | `tests/acceptance/claim-map.test.js:131-139`; `tests/acceptance/adr-ops.test.js:112-138` | won't-fix: division of labor by design — CM2 pins routing through the shared map, AO5/AO10 pin the exact-id answers over the real corpus, AG3 pins guard A1 == op governing set on a synthetic repo |
| SPEC-04 | note | AO1's failure message still reads "12 ids in order" beside a 13-id assertion — misleading text on a red run | `tests/acceptance/adr-ops.test.js:71-72` | fixed: message reads "13 ids in order" |

### SPEC-01 — `should` — CM1 scans three of the four sources the scenario names

- **Claimed severity:** should (P2). **Resolution:** confirmed, trace-backed. **Preconditions:** none.
- **Location:** `tests/acceptance/claim-map.test.js:66-70` (corpus literal), `:98-104` (exclusivity assertion); scenario `cdd/changes/claim-map/specs/gherkin/spec.md:30-31`; Done-When `cdd/changes/claim-map/proposal.md:100`.
- **Trace.** S4's When clause names four sources — "`scripts/spec-drift.mjs`, `lib/adr-ops.mjs`, `scripts/adr-index.mjs`, and `scripts/grammar-law.mjs`" — and DW1 repeats all four. The pin reads only `indexSrc`, `guardSrc`, `opsSrc` into `corpus`, then computes `claiming = Object.entries(corpus).filter(src => /\.re\.test\(|globToRe\s*\(/.test(src))` and asserts it equals `["scripts/adr-index.mjs"]`. `scripts/grammar-law.mjs` is never read, so nothing in the scenario's named surface is checked there.
- **Why it is not a one-line add.** `scripts/grammar-law.mjs:395` contains `.map((glob) => ({ glob, re: globToRe(glob) }))` — it compiles per-requirement `Code:` globs without claiming files. Adding it to the corpus unchanged would make `claiming` = `["scripts/adr-index.mjs","scripts/grammar-law.mjs"]` and fail CM1, because the predicate cannot distinguish *compile-only* from *compile-and-claim*. So the scenario text and the pin currently disagree, and the pin's narrow corpus hides it.
- **Expected/actual.** Expected: the scenario's declared scan list is the pin's scan list, and the "claiming loop exactly once" assertion holds over it. Actual: the pin narrows the list silently; the fourth source is unverified.
- **Impact.** A future glob translation or claiming loop in `grammar-law.mjs` (the module that now owns the shared compiler export) would pass CM1 and S4 would still read as green.
- **Smallest safe fix.** Either (a) add `scripts/grammar-law.mjs` to `corpus` and narrow the claiming predicate to a compile-and-test shape (`/\.re\.test\(/`, which grammar-law.mjs does not contain, or `globToRe(...).test(`), keeping the exclusivity assertion self-testing; or (b) narrow S4's When list and DW1 to the three consumers and record why grammar-law is out of scope (it compiles per-requirement globs; it never walks a file list). Pick one and make text and pin agree.

### SPEC-02 — `note` — the deleted-scan and shared-source assertions are textual proxies

- **Claimed severity:** note (P3). **Resolution:** confirmed, trace-backed.
- **Location:** `tests/acceptance/claim-map.test.js:84-97` (`!/CODE_LINE/ && !/Code:/`, `!/globToRe/`, `!/.re.test(/`), `:105-106` (`/function buildClaimMap/`, `/buildClaimMap/` in guard+ops).
- **Expected/actual.** Expected: the pin fails if `lib/adr-ops.mjs` re-derives governing answers or restates the `Code:` scan. Actual: it fails on the literal characters. A doc-comment containing the words `Code:` (permitted shape under ADR-0012, comments only) would trip it, while `new RegExp(partToReBody).test(p)` or `re.exec(p)` passes both glob bans, and "comes from the shared claim map" is satisfied by the identifier appearing anywhere in the file.
- **Impact.** Low: the assert is a guard rail, and the behavioural contracts (AO5/AO10 exact sets, `--check` byte-identity in task 3.6) carry the real load.
- **Smallest safe fix.** Assert the call sites instead of the identifier — e.g. `map.governingFor(`, `buildClaimMap({`, `filesOfAdr.get(` in `lib/adr-ops.mjs` — and replace the `Code:` literal ban with a ban on the deleted-scan *shape* (`CODE_LINE` + `matchAll`).

### SPEC-03 — `note` — CM2 verifies routing, not the governing semantics

- **Claimed severity:** note (P3). **Resolution:** confirmed, trace-backed.
- **Location:** `tests/acceptance/claim-map.test.js:131-139`; scenario `cdd/changes/claim-map/specs/gherkin/spec.md:38`.
- **Trace.** CM2 builds one `buildClaimMap`, asks the live `adrs --code` op, and asserts `fromOp === fromMap` per probe. Since `lib/adr-ops.mjs:120,131` answers *from that map's* `governingFor`, the equality is structural; the only independent assertions are `typeof map.governingFor === "function"` and `map.governingFor("lib/zz-untracked.mjs").length > 0`. A partial semantic regression inside `governingFor` (say, dropping star-glob matches while keeping literal ones) keeps CM2 green because the untracked probe is governed by `lib/*.mjs` (ADR-0012) and stays non-empty.
- **Impact.** Low: the exact six-id set and the empty-answer remedy are pinned by AO5/AO5b/AO10, so the semantics are covered — just not by the scenario's named pin.
- **Smallest safe fix.** Add the expected id set for the tracked probe (`["ADR-0006","ADR-0007","ADR-0008","ADR-0009","ADR-0011","ADR-0012"]`, ADR-0005 absent) inside CM2, or state in the coverage note which pin carries the semantics.

### SPEC-04 — `note` — stale failure text in AO1

- **Claimed severity:** note (P3). **Resolution:** confirmed, trace-backed.
- **Location:** `tests/acceptance/adr-ops.test.js:71-72`.
- **Expected/actual.** The assertion builds 13 expected ids and compares, but its message says `` `12 ids in order, got: ...` ``.
- **Impact.** A red run would report a count the assertion does not check.
- **Smallest safe fix.** Reword to "13 ids in order (0001 through 0013)".

## Scenario coverage table

| delta scenario | verified-by path | real check? |
| --- | --- | --- |
| gherkin: the index builds one entry per ADR in the decisions home | `tests/acceptance/adr-index-agreement.test.js` | Yes — AG1 pins 13 exact ids and the full field shape against the raw files |
| gherkin: the op and the guard answer the same governing set | `tests/acceptance/adr-index-agreement.test.js` | Yes — AG3 compares the op's governing set with the guard's A1 citations on a synthetic repo |
| gherkin: no consumer re-states the matcher | `tests/acceptance/adr-index-agreement.test.js` | Yes — AG2 pins the star translation definition to `scripts/adr-index.mjs` |
| gherkin: the claim map is derived exactly once | `tests/acceptance/claim-map.test.js` | Partly — CM1 pins three of the four named sources (SPEC-01) |
| gherkin: the op answers from the shared claim map | `tests/acceptance/claim-map.test.js` | Yes for routing + untracked non-emptiness; semantics live in AO5/AO10 (SPEC-03) |
| gherkin: gathering is the only I/O seam | `tests/acceptance/guard-pure-checks.test.js` | Yes — GPC1 scans the pure-check region for fs/git/console/exit and requires all 11 law functions inside it; file pre-existing and unmodified, still matches the delta |
| gherkin: a pure check runs on facts alone | `tests/acceptance/guard-pure-checks.test.js` | Yes — GPC2 runs `checkL1` on an in-memory snapshot in a repo-less temp dir |
| adr: the unfiltered table lists every ADR | `tests/acceptance/adr-ops.test.js` | Yes — AO1; stale message text only (SPEC-04) |
| adr: the status filter narrows to matching ADRs | `tests/acceptance/adr-ops.test.js` | Yes — AO2 pins exactly `["ADR-0005"]` |
| adr: an unknown status by edit distance refuses with a hint | `tests/acceptance/adr-ops.test.js` | Yes — AO3 pins one error, the 4 statuses, the exact hint |
| adr: an unambiguous prefix refuses with a hint | `tests/acceptance/adr-ops.test.js` | Yes — AO4, same shape |
| adr: overlapping claims list every governing ADR in id order | `tests/acceptance/adr-ops.test.js` | Yes — AO5 exact 6 ids, AO5b 0005 absent |
| adr: a dot-slash path normalizes | `tests/acceptance/adr-ops.test.js` | Yes — AO6 compares against the overlap set |
| adr: an absolute path relativizes | `tests/acceptance/adr-ops.test.js` | Yes — AO7 |
| adr: a path outside the store root refuses | `tests/acceptance/adr-ops.test.js` | Yes — AO8 pins the error and the outside-root rule |
| adr: a directory answers any claimed file under it | `tests/acceptance/adr-ops.test.js` | Yes — AO9 correct set (incl. ADR-0013), AO9b states the semantics |
| adr: no governing ADR answers empty with the remedy hint | `tests/acceptance/adr-ops.test.js` | Yes — AO10 pins empty set + `run \`cdd adrs\`` hint |
| adr/reconfirm: append the pinned line for the open change | `tests/acceptance/adr-reconfirm.test.js` | Yes — RC1 compares the full appended line |
| adr/reconfirm: an archived change name works post-Close | `tests/acceptance/adr-reconfirm.test.js` | Yes — RC2 |
| adr/reconfirm: an unknown ADR id refuses | `tests/acceptance/adr-reconfirm.test.js` | Yes — RC3 in the refusal loop (1 text error, file unchanged) |
| adr/reconfirm: a superseded ADR refuses naming the supersede path | `tests/acceptance/adr-reconfirm.test.js` | Yes — RC4, matches `/supersede/` |
| adr/reconfirm: no open change and none given refuses | `tests/acceptance/adr-reconfirm.test.js` | Yes — RC5 |
| adr/reconfirm: missing evidence refuses | `tests/acceptance/adr-reconfirm.test.js` | Yes — RC6 |
| adr/reconfirm: the same change reconfirming twice refuses | `tests/acceptance/adr-reconfirm.test.js` | Yes — RC7 names the existing line, file unchanged |
| adr/reconfirm: an unknown change name refuses | `tests/acceptance/adr-reconfirm.test.js` | Yes — RC12 names both namespaces |
| adr/reconfirm: multi-line evidence refuses | `tests/acceptance/adr-reconfirm.test.js` | Yes — RC13 names the one-line rule |
| adr/reconfirm: a new reconfirmation lands below the existing ones | `tests/acceptance/adr-reconfirm.test.js` | Yes — RC15 pins placement above trailing sections |
| adr/reconfirm: check lists exactly the ADRs whose claims moved | `tests/acceptance/adr-reconfirm.test.js` | Yes — RC9 builds a synthetic git repo with pinned commit dates |
| adr/reconfirm: check on a never-reconfirmed ADR | `tests/acceptance/adr-reconfirm.test.js` | Yes — RC10 pins the ADR-file-commit fallback |
| adr/reconfirm: the store sweep holds every line to the grammar | `tests/acceptance/adr-reconfirm.test.js` | Yes — RC11 sweeps all live ADRs, full-line match |
| adr/reconfirm: check with multiple open changes refuses until narrowed | `tests/acceptance/adr-reconfirm.test.js` | Yes — RC14 first half names both changes and demands `--change` |
| adr/reconfirm: check with an explicit change narrows the pre-flight | `tests/acceptance/adr-reconfirm.test.js` | Yes — RC14 second half scopes to the named change |
| adr/decisions-home: the store holds exactly the thirteen ADRs | `tests/acceptance/decisions-home.test.js` | Yes — DH2 exact 0001–0013 + no root decisions dir (DH1) |
| adr/decisions-home: a relocated ADR keeps its history | `tests/acceptance/decisions-home.test.js` | Yes — DH4 `git log --follow` ≥ 2 commits on 0001 |
| adr/decisions-home: relocated ADR statuses sit in the guard's enum | `tests/acceptance/decisions-home.test.js` | Yes — DH3 checks each status against `ADR_STATUSES` |
| adr/decisions-home: the door 3 full scan governs all thirteen | `tests/acceptance/decisions-home.test.js` | Yes — DH6 asserts exit 0 and no A-check finding naming any of the 13 |

## Coverage and verification

- **Consumed:** both delta specs, the proposal's Done-When/Non-Goals, `tasks.md` (3.1–3.8 evidence, 4.x unticked), all five acceptance files named by the delta, the full working-tree diff of `scripts/adr-index.mjs`, `scripts/spec-drift.mjs`, `lib/adr-ops.mjs`, the byte-identity of all five `cdd/scripts/*` door copies (`cmp -s`), ADR-0013, and the prior R1/R2 findings for context.
- **Commands run (all read-only):** `git rev-parse HEAD`, `git status --porcelain`, `git ls-files`, `cmp -s` over the door copies, and `grep`/`sed`/`read` over the sources and tests.
- **Not reproduced:** every green result quoted above (CM1/CM2 2 ok, AG 3, adr-ops 15, reconfirm 15, decisions-home 6, guard-pure-checks 2, `npm test` 37/37, `cdd validate` strict) is consumed from `tasks.md` evidence, not re-run — the brief forbids builds and this checkout is the working tree under review. No mechanical claim in this file depends on a re-run; each finding is trace-backed from source text.
- **Residual risk:** SPEC-01 is a coverage gap in a pin, not a behaviour defect; nothing in the diff reverses a delta clause. The guard/op byte-identity (the change's behavioural contract) was verified in the author's worktree `/tmp/claim-map-proof` per task 3.6, and the code-level equivalence traces (tracked-order iteration, `splitGlobs` semantics, `allSpecs` ordering) were re-derived here rather than trusted.
