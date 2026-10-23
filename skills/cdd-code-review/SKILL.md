---
name: cdd-code-review
description: "Two-axis review of implementation work in a contract-driven (cdd) project: Standards (does the code follow this repo's documented standards?) and Spec (does the diff implement the change's spec delta — every requirement, every scenario, nothing unsponsored?). Runs both axes as parallel sub-agents and reports them side by side. Use in projects with a cdd/ store, when a change's tasks are done, before archive, or whenever the user asks to review a diff against its cdd change."
---

Two-axis review of the diff between `HEAD` and a fixed point:
Reviewer briefs live under this skill's assets/ directory: `assets/brief-r3-standards.md` and `assets/brief-r3-spec.md` — one per axis; the two axes run as two separate cold sessions (rule 2b), each briefed from its own template.

- **Standards**: does the code conform to this repo's documented coding standards?
- **Spec**: does the diff faithfully implement the originating cdd change — its proposal Done-When, its spec delta, and nothing the delta does not sponsor?

Both axes run as **parallel sub-agents** so they don't pollute each other's context, then this skill aggregates their findings.

## Process

### 1. Pin the fixed point

In a cdd project the natural fixed point is the commit before the change's feature commit (feature and archive commits travel as a pair). Find it via `git log --oneline -- cdd/changes/<name>/` or ask the user. Whatever the user said wins: a commit SHA, branch name, tag, `main`, `HEAD~5`.

Capture the diff command once: `git diff <fixed-point>...HEAD` (three-dot, so the comparison is against the merge-base). Also note the list of commits via `git log <fixed-point>..HEAD --oneline`.

Before going further, confirm the fixed point resolves (`git rev-parse <fixed-point>`) and the diff is non-empty. A bad ref or empty diff should fail here, not inside two parallel sub-agents.

### 2. Identify the spec source

In a cdd project the spec source is the change folder — no issue tracker is consulted:

1. The change name the user passed, or the change the diff's commits reference (`cdd/changes/<name>/` paths in the commit list).
2. If the change is ambiguous, ask. If there is no change folder, this is mechanical work or an untracked edit — review the Standards axis only and say so.

The Spec axis reads, from disk:

- `cdd/changes/<name>/proposal.md` — the `Done-When:` criteria (scope)
- `cdd/changes/<name>/specs/*/spec.md` — the delta: requirements, Gherkin scenarios, `# Verified by:` pins
- `cdd/specs/<capability>/spec.md` — the living spec for surrounding context
- `cdd/changes/<name>/tasks.md` — what was planned, what the `verify by` lines promised

### 3. Identify the standards sources

Search the repo for every file that documents how code should be written. When `CODING_STANDARDS.md` or `CONTRIBUTING.md` exists, it must be on the list.

On top of whatever the repo documents, the Standards axis always carries the **smell baseline** below: a fixed set of Fowler code smells (_Refactoring_, ch.3) that applies even when a repo documents nothing. Two rules bind it:

- **The repo overrides.** A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation. Like any standard here, skip anything tooling already enforces.

Each smell reads *what it is* → *how to fix*; match it against the diff:

- **Mysterious Name**: a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code**: the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Feature Envy**: a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps**: the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession**: a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches**: the same `switch`/`if`-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery**: one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change**: one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality**: abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains**: long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man**: a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest**: a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.

### 4. Spawn both sub-agents in parallel

Per loop law rule 2b, both axis sub-agents run cold: each is a fresh cold sub-agent session, and the reviewer-independence requirement is the law's — this skill carries only the procedure. Issue both sub-agent calls together, in the foreground, and aggregate the reports they return. Both sub-agents read files from disk themselves — never curated content, never the author's pasted summary of the artifacts. If no sub-agent mechanism is available, the fallback is the same-session re-read: run each axis as a separate pass over the diff, re-read from disk, deliberately ignoring everything remembered about writing it, and record the fallback and its justification in the findings file header.

**Standards sub-agent prompt** should include:

- The full diff command and commit list.
- The list of standards-source files you found in step 3, **plus the smell baseline from step 3** pasted in full (the sub-agent has no other access to it).
- The brief: "Report, per file/hunk where relevant, (a) every place the diff violates a documented standard: cite the standard (file + the rule); and (b) any baseline smell you spot: name it and quote the hunk. Distinguish hard violations from judgement calls: documented-standard breaches can be hard, but baseline smells are always judgement calls, and a documented repo standard overrides the baseline. Skip anything tooling enforces. Under 400 words."

**Spec sub-agent prompt** should include:

- The diff command and commit list.
- The change folder paths from step 2 (proposal, delta, tasks, living spec) — as paths to read, not pasted content.
- The brief: "Report: (a) requirements or scenarios in the delta that are missing or partial in the diff; (b) behaviour in the diff that no requirement sponsors (scope creep — check against the proposal's Non-Goals too); (c) requirements that look implemented but wrong. For each finding quote the requirement or scenario. Additionally check pin honesty: for every scenario, open its `# Verified by:` test file and report whether that test actually exercises that scenario — a pin that would stay green if the scenario regressed is a blocker. Quote the spec line for each finding. Under 400 words."

If there is no change folder, skip the Spec sub-agent and note this in the final report.

### 5. Aggregate

Present the two reports under `## Standards` and `## Spec` headings, verbatim or lightly cleaned. Do **not** merge or rerank findings, because the two axes are deliberately separate (see _Why two axes_).

End with a one-line summary: total findings per axis, and the worst issue _within each axis_ (if any). Don't pick a single winner across axes: that's the reranking the separation exists to prevent.

When this review belongs to an open change (the Close-section code-review task), write per axis: the standards-axis session's findings go to `cdd/changes/<name>/reviews/r3-standards-code-review.md` and the spec-axis session's to `cdd/changes/<name>/reviews/r3-spec-code-review.md` (paths per `reviewPoint("R3").findingsStandards`/`findingsSpec` in `lib/loop-law.mjs`), each using the shared findings grammar — severity (`blocker` / `should` / `note`), finding, evidence (file + line or quoted spec), disposition (`fixed: <where>` / `open` / `won't-fix: <reason>`). Blockers must carry a disposition other than `open` before the change archives. The review is advisory: it never flips a deterministic door's verdict, and the human keeps the close button.

## Why two axes

A change can pass one axis and fail the other:

- Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Code that does exactly what the delta asked but breaks the project's conventions → **Spec pass, Standards fail.**

Reporting them separately stops one axis from masking the other.
