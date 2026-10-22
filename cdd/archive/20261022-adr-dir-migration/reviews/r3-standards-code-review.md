# R3 standards-axis review — adr-dir-migration

## Standards axis

## Reviewer form

- **Reviewer form:** cold sub-agent session (fresh session, briefed only from
  `cdd/changes/adr-dir-migration/reviews/r3-standards-brief.md` and the paths it names).
- **Reviewer model family:** deepseek (`PI_PROVIDER=opencode-zen`,
  `PI_MODEL=deepseek-v4-pro`). The author's family is **zai** (GLM lineage).
  Families differ — the rule 2b family-separation requirement is met.
- **Pinned state:** diff `6ce22d1...HEAD` (merge-base `6ce22d1f80413daa41f7ba0e071f8b7aefa23553`),
  two commits: `0877cd5` (move commit M) and `4938f5c` (feature commit F).
  Working tree additionally holds uncommitted `cdd/backlog.md` and
  `cdd/changes/adr-dir-migration/tasks.md` modifications plus the two untracked
  R3 briefs.

## Findings

### 1. The deterministic doors are red at R3 — strict validation and `npm test` both fail, and the fix is deferred to the archive commit — `blocker`

The change is at Close (R3, before archive), but two of the three deterministic
doors are red:

- `cdd validate` strict fails with 7 unchecked tasks before the Close section:
  `1.1`, `3.3`, `3.4`, `3.5`, `3.6`, `3.7`, `3.8` (the implementation work is
  committed in `0877cd5`/`4938f5c`, but the boxes are unticked).
- `npm test` fails: the change's own acceptance pin `DH5` in
  `tests/acceptance/decisions-home.test.js` reports
  `live root-path references remain: cdd/specs/gherkin/spec.md:149: Code: … decisions/0007-the-law-behind-every-door.md, …`.
- Only the guard (`node cdd/scripts/spec-drift.mjs`) is green.

The feature commit message (`4938f5c`) acknowledges the red pin and defers the
fix: "the decisions-home DH5 pin stays red until the archive commit rewrites the
living gherkin spec's root-path Code: entry … the designed pair-commit window."

This deferral is circular and leaves the doors red at the review point. Task
`3.6` (reference sweep) and `3.8` (feature commit F) both carry `verify by …
npm test green`, but `npm test` only turns green after the archive commit
(`4.4`) merges the delta and rewrites the living spec's `Code:` line — while
archive (rule 11) requires strict validation green, which requires every
non-Close task ticked, including `3.6`/`3.8`. The reference sweep should have
swept the living spec's root-path `Code:` entry in the feature commit, not
deferred it to archive. A red door is a fact, not an obstacle (rule 9a); the
"designed transient" framing does not resolve the circularity.

- Evidence: `cdd/specs/gherkin/spec.md:149` (root-path `decisions/0007-the-law-behind-every-door.md`
  in the `Code:` line); `tests/acceptance/decisions-home.test.js:78-92` (DH5);
  `cdd/changes/adr-dir-migration/tasks.md:80` (task 3.6), `:82` (task 3.8);
  commit `4938f5c` message ("designed pair-commit window").
- Disposition: fixed — decomposed. (a) The strict red was unticked 1.1/3.3–3.8 — a tick pass that under-applied; all are now ticked and strict is rerun green at 4.3 before archive. (b) The npm test DH5 red is the archive-gated pin: sweeping `cdd/specs/` in F is precisely what the archive lock forbids (living specs change only in the archive commit — the same law that makes L2 red between pair-commits), so the deferral is law, not preference. (c) The verify-by circularity is real and is killed at the root: 3.6/3.8 verify-bys now read "npm test green modulo the archive-gated DH5 living-spec pin (green verified at 4.4)". Full green is the archive gate's own verify, run before the Close report.

### 2. The living spec's `Code:` line names a dead path — silent divergence the guard cannot see — `should`

The move commit `0877cd5` relocated `decisions/0007-the-law-behind-every-door.md`
to `cdd/decisions/0007-the-law-behind-every-door.md`, but the living spec
`cdd/specs/gherkin/spec.md:149` still names the old root path in its
"Declarative style is door-1 law" `Code:` glob. The guard's O-check (single
owner) and A1/A2 checks map files to capabilities/decisions via `Code:` globs;
a glob naming a path that no longer exists matches no tracked file, so the
guard silently drops 0007 from the gherkin capability's ownership and fires no
finding. This is exactly the "silent divergence" the standards axis is asked to
flag: the spec's `Code:` line no longer matches the file's actual location, and
no deterministic door reports it (the guard is green; only the change's own DH5
pin catches it, and that pin is red).

- Evidence: `cdd/specs/gherkin/spec.md:149` vs the file's actual location
  `cdd/decisions/0007-the-law-behind-every-door.md` (moved in `0877cd5`);
  `cdd/scripts/spec-drift.mjs:552-592` (A1/A2 use `Code:` globs via `filesOf`).
- Disposition: fixed — the dead entry is dropped by the delta's MODIFIED `Code:` and lands at archive (4.4); the guard gap itself (a `Code:` glob naming a nonexistent path matches nothing and fires no finding) is recorded as PF-12 in cdd/backlog.md — a guard enhancement for its own loop pass, not this change.

## Notes (no action demanded)

- **ADR-governed files respected.** Every ADR whose `code:` globs the diff
  touches — 0006, 0007, 0009, 0010, 0011 — carries a `Reconfirmed-by` paragraph
  in the same commit (`4938f5c`) that touches the governed file, so the A2
  staleness check stays green. ADR-0005's frontmatter status normalization
  (`status: superseded`, annotation moved verbatim to the body) satisfies the
  A0 enum check. No violation found.
- **Smell baseline.** The diff is markdown/docs plus one new acceptance test and
  two trivial string edits (`lib/loop-law.mjs`, `lib/gherkin.mjs`). No new
  instance of any baseline smell; the `check`/`assert`/`run` helper pattern in
  `tests/acceptance/decisions-home.test.js` matches the pre-existing convention
  in `tests/acceptance/single-source-law.test.js`.
- **Real-door pins.** `DH6` invokes the real guard via child-process
  (`spawnSync(["node", "cdd/scripts/spec-drift.mjs"])`) and `DH4` runs the real
  `git log --follow` — neither is a copied fragment, so rule 7's real-door pin
  requirement is met.
