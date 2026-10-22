# R2 package review — adr-dir-migration

## Reviewer form

- **Reviewer form:** cold sub-agent session (fresh session, briefed only from
  `cdd/changes/adr-dir-migration/reviews/r2-brief.md` and the paths it names).
- **Reviewer model family:** deepseek (`PI_PROVIDER=opencode-zen`,
  `PI_MODEL=deepseek-v4-pro`). The author's family is **zai** (zai/glm-5.3).
  Families differ — the rule 2b family-separation requirement is met.
- **Pinned state:** branch `adr-migration`, HEAD `6ce22d1f80413daa41f7ba0e071f8b7aefa23553`,
  the change folder `cdd/changes/adr-dir-migration/` uncommitted (plus an
  unrelated `cdd/backlog.md` modification). ADRs 0001–0007 still sit at the
  repository root; the move commit M has not run. Package judged as drafted,
  not as applied.

## Findings

### 1. Reference sweep has no sponsoring requirement — `should`

The reference sweep — dropping the README.md Layout `decisions/` line and
rewriting the root-vs-cdd note in `skills/cdd-adr-review/brief-adr.md`, the
example paths in `skills/cdd-adr-review/SKILL.md`, and the `lib/gherkin.mjs`
comment — is sponsored only by Done-When 5 and task 3.6, with no delta
requirement behind it. None of the three requirements covers "no live
reference to the old split remains": the adr ADDED requirement covers the
move/history/statuses/guard, the gherkin "Loop law names three review points"
MODIFIED covers the rule-2a sentence, and the gherkin "Declarative style"
MODIFIED covers only the Code: line drop. Two of the swept files —
`skills/cdd-adr-review/brief-adr.md` and `skills/cdd-adr-review/SKILL.md` —
are not claimed by any delta `Code:` glob, so the change edits files its spec
does not claim (and the guard's A1/L2 checks will not see the touch).

- Evidence: `cdd/changes/adr-dir-migration/proposal.md:12` (reference-sweep
  bullet), `proposal.md:32` (Done-When 5), `tasks.md:80` (task 3.6);
  delta `Code:` lines at `specs/adr/spec.md:35`, `specs/gherkin/spec.md:58`,
  `specs/gherkin/spec.md:86` — none names `skills/cdd-adr-review/*`.
- Disposition: fixed: ADDED gherkin requirement "One decisions home across the corpus" (specs/gherkin/spec.md) sponsors the sweep; its Code: claims brief-adr.md, SKILL.md, README.md, lib/gherkin.mjs

### 2. Proposal `Code:` line understates the implementation surface — `should`

The proposal's single `Code:` line names only `cdd/decisions/000[1-7]-*.md`,
but "What Changes" describes editing `lib/loop-law.mjs`, `README.md`,
`skills/cdd-adr-review/*`, `lib/gherkin.mjs`, and `tests/acceptance/*`. The
proposal `Code:` therefore does not name the implementation surface the change
actually touches, unlike the delta `Code:` globs (and unlike the
loop-law-hardening change, whose proposal `Code:` was the union of its delta
globs). This understates the surface and is inconsistent with the delta.

- Evidence: `cdd/changes/adr-dir-migration/proposal.md:33` (`Code: cdd/decisions/000[1-7]-*.md`)
  vs `proposal.md:12` (reference sweep) and `specs/gherkin/spec.md:58`, `:86`.
- Disposition: fixed: proposal Code: line is now the union of the delta Code: surfaces (cdd/decisions/000[1-7]-*.md, lib/loop-law.mjs, cdd/rules.md, README.md, lib/gherkin.mjs, skills/cdd-adr-review/brief-adr.md, skills/cdd-adr-review/SKILL.md, tests/acceptance/single-source-law.test.js, tests/acceptance/decisions-home.test.js)

### 3. A1 citation names a file the delta `Code:` does not claim — `note`

The proposal's A1-citations line lists `ADR-0010 (lib/loop-law.mjs,
cdd/rules.md, skills/cdd-adr-review/SKILL.md)` as a delta-`Code:` intersection,
but `skills/cdd-adr-review/SKILL.md` is not in any delta `Code:` glob. The
citation is harmless (ADR-0010 is cited and reconfirmed), but the premise that
the delta `Code:` intersects ADR-0010's globs at that file is false — a
consequence of finding 1.

- Evidence: `cdd/changes/adr-dir-migration/proposal.md:35` vs
  `specs/gherkin/spec.md:58`, `:86`; ADR-0010 globs at
  `cdd/decisions/0010-reviewer-independence-is-loop-law.md:3`.
- Disposition: fixed: the new ADDED requirement's Code: now claims skills/cdd-adr-review/SKILL.md, so the ADR-0010 intersection — and its citation — is real

### 4. History scenario's pin and its creating task are misaligned — `note`

The adr scenario "A relocated ADR keeps its history through the move" pins
`tests/acceptance/decisions-home.test.js`, but task 3.3's description of that
test asserts only the directory layout, the guard-enum statuses, and the guard
full scan — it does not mention the `git log --follow` history assertion the
scenario requires. The history is instead verified by task 3.4's `git log
--follow` verify-by. As drafted, the scenario's pin may not actually verify the
history it claims.

- Evidence: `cdd/changes/adr-dir-migration/specs/adr/spec.md` (scenario "A
  relocated ADR keeps its history through the move") vs `tasks.md:77` (task 3.3)
  and `tasks.md:78` (task 3.4 verify-by).
- Disposition: fixed: task 3.3 now includes the git log --follow ≥2-commits history assertion and the root-path reference scan, so the scenarios' pins verify what they claim

### 5. Traceability table omits task 3.3 from the single-home-pins criterion — `note`

Done-When 4 names two pins — SSL2b and `decisions-home.test.js` — but the
traceability row maps it to `3.2, 3.5, 3.6`, omitting task 3.3, which creates
`decisions-home.test.js` (one of the two named pins).

- Evidence: `cdd/changes/adr-dir-migration/proposal.md:31` (Done-When 4) vs
  `tasks.md:92` (traceability row) and `tasks.md:77` (task 3.3).
- Disposition: fixed: the traceability row for the single-home pins now cites 3.2, 3.3, 3.5, 3.6
