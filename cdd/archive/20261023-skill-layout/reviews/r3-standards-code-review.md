# R3 standards-axis code review — skill-layout

- **Reviewer form:** cold sub-agent session (rule 2b), briefed only from paths on disk.
- **Model family check:** reviewer `opencode-zen` / `deepseek-v4-pro` vs author `zai` / `glm-5.3` — families differ, rule 2b satisfied.
- **Axis:** Standards only (the Spec axis runs in its own cold session).
- **Reviewed range:** `git diff 1750767` (staged renames + unstaged edits) plus the untracked change folder `cdd/changes/skill-layout/`. Base `main` @ `1750767`, working tree on branch `skill-layout`, change uncommitted.
- **Standards sources read:** `cdd/rules.md` (loop law), `README.md` (Layout/Validation), `skills/cdd-code-review/SKILL.md` (smell baseline charter), `cdd/decisions/` ADRs whose `code:` globs the diff touches (0010, 0011).
- **Mechanical evidence consumed:** `node tests/smoke.mjs` → 36/36 passed; `node --test 'tests/acceptance/*.test.js'` → 25 passed, 0 failed; `node cdd/scripts/spec-drift.mjs` → clean (5 specs, 25 acceptance test files, full scan).

## Findings

### [note] F001 — S33 check title no longer matches its scope

- **Finding:** The S33 check title/description still reads "skills/ holds the three review skills, frontmatter valid, manifest registered", but the check now also asserts over every bundled skill directory (`skillDirs.length >= 4`, including `cdd-backlog-triage`) for the layout and routing-signal assertions. The title understates the check's actual surface.
- **Evidence:** `tests/smoke.mjs:799` (title) vs `tests/smoke.mjs:821` (`assert(skillDirs.length >= 4, ...)`).
- **Disposition:** open

### [note] F002 — Duplicated Code: brief-name matcher and frontmatter re-parse

- **Finding:** The brief-template name matcher (`/^brief-.*\.md$/i` or `/-brief\.md$/i`) is written twice in the same hunk — once for loose files beside SKILL.md and once for stray files in non-`assets/` subdirectories. A single `isBriefName(name)` helper would DRY the two branches. Separately, the new `skillDirs` loop re-reads and re-parses each SKILL.md frontmatter (`tests/smoke.mjs:824-828`) even though the original S33 loop already parsed it for the three review skills (`tests/smoke.mjs:803-813`); the re-parse is only genuinely new for `cdd-backlog-triage`.
- **Evidence:** `tests/smoke.mjs:831` and `tests/smoke.mjs:835` (duplicated regex); `tests/smoke.mjs:824-828` vs `tests/smoke.mjs:803-813` (re-parse).
- **Disposition:** open

## Coverage and verification

- **Conventions:** the diff is a pure rename (all five briefs `similarity index 100%`) plus pointer/path updates and two S33 assertions. Naming, structure, and test placement follow the repo's existing smoke/acceptance conventions; the S33-growth decision is documented in the proposal and tasks (S33 owns the loadable-skills surface contract).
- **ADR-governed files:** the three `SKILL.md` edits (ADR-0010 `code:` globs) change only the procedural pointer line ("next to this skill" → "under this skill's assets/ directory"); they do not restate rule 2b and still cite it — sanctioned by ADR-0010's "procedural text may evolve without an ADR" clause. The `tests/acceptance/loop-law-hardening.test.js` edit (ADR-0011 `code:` glob) is a path update to `readBrief`; the test still reads the real files from disk — no pin-realism regression.
- **Smell baseline:** no new instances of the twelve smells beyond the two note-level observations above (F002 is a minor Duplicated Code; F001 is a stale-name observation). No Feature Envy, Data Clumps, Primitive Obsession, Repeated Switches, Shotgun Surgery, Divergent Change, Speculative Generality, Message Chains, Middle Man, or Refused Bequest introduced.

## Dispositions (author, after review)

- F001 fixed: S33 title updated to "skills/ holds the bundled cdd skills, frontmatter valid, manifest registered, pi layout honored" (tests/smoke.mjs S33 title line) — the title now states the check's actual surface; nothing pins the old title.
- F002 won't-fix: note-level DRY suggestion inside a green smoke check; consolidating S33's two loops (frontmatter parse, brief-name matcher) would restructure a green check beyond this change's sponsorship (layout mechanics + pin moves). The duplicated matcher is two regex literals in one check function — the smallest honest state; recorded here for any future S33 owner.
- **Guard/validator alignment:** no guard, validator, or grammar-law file is touched by the diff (`cdd/scripts/`, `lib/`, `index.ts` unchanged); `cdd/rules.md` and `lib/loop-law.mjs` carry no brief paths (verified in task 1.1), so no law/mirror byte-identity divergence. The guard is clean and both test sweeps are green.
