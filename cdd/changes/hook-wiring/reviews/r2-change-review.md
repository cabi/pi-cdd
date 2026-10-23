# R2 change review — hook-wiring

## Reviewer form

- **Form:** cold sub-agent session (loop law rule 2b) — a fresh session briefed only from paths on disk, not the author's session.
- **Reviewer model family:** `opencode-zen` (model `deepseek-v4-pro`), read from `PI_PROVIDER`/`PI_MODEL` at runtime.
- **Author model family:** `zai` (glm-5.3), per the brief. Families differ (different providers) — the rule 2b family-separation requirement is met.
- **Pinned state:** repository at commit `51fb3b2` (branch `hook-wiring`); the change folder `cdd/changes/hook-wiring/` is untracked (`?? cdd/changes/hook-wiring/` in `git status`). `tests/acceptance/hook-wiring.test.js` does not yet exist (expected — test-first, task 3.2 writes it); `package.json` has no `prepare` script yet.
- **Scope:** package review at draft-green — proposal, tasks, delta, living spec, rules. Advisory findings only; no verdicts, no edits beyond this file.

## Findings

### F1 — Orphan task 3.4: MAINTENANCE.md note has no sponsor — `should` — open

Task 3.4 edits `MAINTENANCE.md`, but nothing sponsors it: no Done-When line names it, no delta requirement covers it, and neither Code: glob includes it.

- `cdd/changes/hook-wiring/tasks.md:72` — task 3.4 "Contributor-setup note — MAINTENANCE.md carries the fresh-clone wiring note …".
- `cdd/changes/hook-wiring/proposal.md:11` — "What Changes" mentions MAINTENANCE.md, but the proposal's Done-When lines (`proposal.md:28-31`) never name it.
- `cdd/changes/hook-wiring/proposal.md:32` and `cdd/changes/hook-wiring/specs/gherkin/spec.md:23` — both Code: globs are `package.json, tests/acceptance/hook-wiring.test.js`; MAINTENANCE.md is absent.
- The tasks template's anti-scope-creep rule (`cdd/changes/hook-wiring/tasks.md:53`) states "no task may exist without a spec requirement or Done-When criterion that needs it." Task 3.4 violates this.
- The design-gate note (`cdd/changes/hook-wiring/tasks.md:65`) acknowledges "MAINTENANCE.md rides along outside spec ownership by its own header" — which is precisely why the task is unsponsored.

Either a Done-When line / requirement must sponsor the note, or the task (and the proposal's MAINTENANCE.md bullet) should be dropped.

Disposition: fixed — the proposal gains Done-When line 4 ("MAINTENANCE.md carries the contributor-setup note — fresh clones wire via `npm install`'s prepare step, the manual equivalent is named, PF-16 referenced") and the traceability table gains the row `| MAINTENANCE.md carries the contributor-setup note | 3.4 |`, so task 3.4 is sponsored by an observable criterion. Requirement-level coverage stays deliberately out: MAINTENANCE.md is outside spec ownership by its own header (same stance as `cdd/backlog.md`) — see F3's disposition.
### F2 — Proposal carries four Done-When lines; rule 3 prescribes one — `should` — open

Rule 3 states the proposal shape as "one `Done-When:` line" (`cdd/rules.md:61`), but the proposal carries four (`cdd/changes/hook-wiring/proposal.md:28-31`). The tasks template instruction itself refers to "Done-When lines" (plural) and "a table row per proposal criterion" (`cdd/changes/hook-wiring/tasks.md:21-22`), so the law text and the template disagree. The author should reconcile rule 3's wording with the multi-criterion practice (or collapse the proposal to one criterion).

Disposition: won't-fix (this change) — the operative contract is the door: `validateProposal` accepts 1–5 Done-When lines and the scaffold instruction itself prescribes "1-5 completion criteria, each on its own 'Done-When:' line"; every archived change carries multiple lines. Reconciling rule 3's wording is a loop-law text edit, outside this change's Code globs and scope fence — minted as PF-17 in `cdd/backlog.md` for its own tiny law-text pass.

### F3 — Done-When lines DW3 and DW4 have no delta requirement — `note` — open

The single ADDED requirement ("Contributor clones self-wire the doors") covers only the prepare-script wiring (DW1/DW2). DW3 (`cdd validate` strict green + guard, `proposal.md:30`) and DW4 (PF-16 done, `proposal.md:31`) are process/backlog criteria with no corresponding delta requirement. Under the charter's coverage rule ("a Done-When with no requirement … is a finding"), these two are uncovered; they are standard loop gates, so this is noted rather than blocking.

Disposition: won't-fix — DW3 and DW4 are Close-phase process gates, not product behavior: the loop itself pins them (rules 11 and 13), and the delta instruction forbids requirements the proposal's Done-When does not need. Same class as r3-findings' backlog Done-When line. The F1-added MAINTENANCE Done-When rides the same rationale: a doc artifact outside spec ownership by its own header.

### F4 — Traceability table rows carry spurious task ids — `note` — open

- `cdd/changes/hook-wiring/tasks.md:82` — "cdd validate strict green and guard exits 0 | 3.5, 4.4" includes 3.5 (full `npm test` sweep), which does not verify validate/guard; only 4.4 does.
- `cdd/changes/hook-wiring/tasks.md:81` — "npm test exits 0 … | 3.2, 3.3, 3.4, 3.5" includes 3.4 (MAINTENANCE.md note), which does not affect `npm test`.

Disposition: fixed — the validate/guard row now maps to 4.4 only, the npm-test row drops 3.4, and a new row maps the MAINTENANCE.md criterion to 3.4 (the F1 fix's sponsor line).

### F5 — Task 3.2's verify-by names the green state, not the red state the task establishes — `note` — open

`cdd/changes/hook-wiring/tasks.md:70` — task 3.2 is "written and run red before any implementation ticks", but its verify-by is "node --test tests/acceptance/hook-wiring.test.js exiting 0 once tasks 3.3–3.4 land". The verify-by does not verify the red state the task itself produces; it defers to a future green state. The red assertion (test fails before implementation) is unverified by the task's own check.

Disposition: fixed — task 3.2's verify-by now reads "…failing on the missing prepare script (red run recorded in this tick) and exiting 0 once tasks 3.3–3.4 land", so the red state the task establishes is verified and its evidence cited at tick time.

### F6 — `|| true` swallows genuine `git config` failures in the .git-present case — `note` — open

The prepare script `[ -d .git ] && git config core.hooksPath .githooks || true` (`cdd/changes/hook-wiring/tasks.md:71`, `cdd/changes/hook-wiring/specs/gherkin/spec.md` requirement prose) exits 0 even when `.git` exists but `git config` fails (corrupt `.git`, missing git), so a contributor clone could silently fail to wire. The requirement's "MUST wire" guarantee is not reflected in the script's exit code. The acceptance test checks the config value, so the test would catch it, but the script itself is silent — the proposal's "silent success where wiring is meaningless" (`proposal.md` What Changes) also makes it silent failure where wiring is meaningful.

Disposition: won't-fix — deliberate, sponsor-approved trade-off: prepare must never fail `npm install`/`npm ci`, and a broken install for every contributor outweighs a silent no-op in the rare `.git`-present-but-git-config-failing regime (corrupt `.git`, missing git binary). The normal regime's wiring outcome is pinned by `tests/acceptance/hook-wiring.test.js` against the real script text, and the manual recovery command is documented in the MAINTENANCE.md note (task 3.4).
