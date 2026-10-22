---
name: cdd-adr-review
description: "Model-run review of drafted architecture decision records under cdd/decisions/ — typically the drafts an arch-extract run produced — before the human resolves them. Checks each draft against the four-criterion test (hard to reverse, surprising without context, a real trade-off, crosses capability boundaries) in both directions: drafted ADRs that don't merit one, and decisions that merit one but are missing. Use in projects with a cdd/ store after arch-extract, when drafting ADRs, or when the user asks to review decisions."
---

Advisory review of drafted ADRs. It produces **findings, never verdicts**: recorded decisions under `cdd/decisions/` are ground truth once accepted, and only the human accepts. The review runs at the moment drafts exist and are cheapest to fix — after `cdd/scripts/arch-extract.mjs` prints its draft skeleton and the agent (or a person) fills it in, **before** the human resolves the batch.
Reviewer briefs live next to this skill: `brief-adr.md` — instantiate it for the cold reviewer session (rule 2b).

The failure mode this skill exists for: ADR bloat and ADR blindness. A decision recorded that fails the four-criterion test is noise — it belongs in the spec, the rules, or a code comment. A decision that passes all four but is never recorded is the expensive one: the next change unknowingly reverses it.

## Process

1. **Collect from disk**: every draft under `cdd/decisions/` whose frontmatter `status` is not `accepted` (or the files the caller named), plus every already-accepted ADR for context. Never review from a summary of the drafts.
2. **Run cold — loop law rule 2b.** The reviewer-independence requirement is the law's; this skill carries only the procedure. Spawn a cold sub-agent: a fresh session whose prompt contains only the charter, the file paths, and the instruction to read them — briefed from paths on disk, never curated content. The same-session re-read is the lawful but weaker fallback, for when no sub-agent mechanism exists: run a separate pass re-reading the drafts from disk and deliberately ignoring everything remembered about writing them, and record the fallback and its justification in the findings file header.
3. **Read the surrounding evidence**: the arch-extract report if it exists (interpreted section, derived decision candidates), the living specs the decision touches, and the `code:` globs each ADR claims.
4. **Report findings** with the shared grammar (severity `blocker` / `should` / `note`, finding, evidence, disposition). When the drafts belong to an open change, write them to `cdd/changes/<name>/reviews/adr-review.md`; otherwise `cdd/decisions/reviews/<date>-adr-review.md`.
5. **Proceed rule**: before the human resolves the batch, every `blocker` carries a disposition other than `open`.

## Charter

Each draft, against the four-criterion test — a decision is ADR-worthy only if it is **hard to reverse**, **surprising without context**, a **real trade-off**, and **crosses capability boundaries**:

- Fails one or more criteria → `should`: demote to where it belongs (single-capability behavior → the spec; project convention → `cdd/rules.md` or `CONTRIBUTING`; a local choice → code or commit message). Name the destination.
- A decision visible in the evidence (report, specs, code) that passes all four but has no ADR → `blocker`: the record is missing; draft it or name the owner who must.

Form of each draft:

- Frontmatter carries `status:` and `code:` globs; the globs match paths that exist. A decision guarding nothing guards nothing — the drift guard matches tracked files against these globs.
- The title states the decision, not the topic ("The law lives in one module", not "About modules").
- The body names the context, the options weighed, and why this one won — an ADR that only describes the choice without the rejected alternatives fails its own purpose (`should`).
- Consequences say what becomes harder, not only what improves (`should`).
- `supersedes:` / `amends:` references resolve to real ADRs, and the counterpart ADR is marked accordingly. A dangling or one-sided supersede is a blocker.
- The `induced:` marker is honest: `derived` only if a scanner suggested it, `interpreted` if a person concluded it from the report (`note` when wrong).

Consistency with accepted ADRs:

- No draft silently contradicts an accepted decision. Contradiction without a supersede is a blocker.
- No accepted ADR is re-litigated by a draft unless it supersedes/amends explicitly.

## Findings grammar

```markdown
# adr-review — <date> — reviewer: cold sub-agent | same-session re-read — <justification if fallback>

| severity | finding | evidence | disposition |
|---|---|---|---|
| blocker | "use vendored parser" not recorded though all four criteria pass | arch-extract report §interpreted; vendor/ layout | fixed: draft 0008 added |
| should | 0003 records a single-capability behavior | cdd/decisions/0003, criterion 4 | open |
| note | title states topic, not decision | cdd/decisions/0005 | won't-fix: <reason> |
```

Severity: `blocker` (unsound to resolve the batch), `should` (dispose or consciously carry), `note` (recorded, no action demanded). Evidence cites file and section. Dispositions live in this file; later resolutions edit the row, not the report.
