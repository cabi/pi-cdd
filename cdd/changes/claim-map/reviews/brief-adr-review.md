# ADR review brief — ADR-0013 (change `claim-map`)

You are a cold reviewer. You did not author this decision. Judge only what is on disk in /home/carsten/Projects/pi-extensions/pi-cdd.

## What to review

The newly drafted decision record `cdd/decisions/0013-one-claim-map-for-guard-and-ops.md` (status: accepted). It records: the file-claim derivation (which spec requirement's `Code:` globs claim which files, across living specs and open deltas, and which accepted ADR governs which file) is stated exactly once — `buildClaimMap` in `scripts/adr-index.mjs`, pure over parsed spec models + ADR index + tracked file list — consumed by the drift guard's gather pass (`scripts/spec-drift.mjs`) and by `lib/adr-ops.mjs` (adrs `--code`, reconfirm `--check`); no consumer re-derives.

## Your charter (the four-criterion test, both directions)

Apply the ADR test to this draft:

1. **Hard to reverse** — would walking it back cost more than a comment?
2. **Surprising without context** — would a competent reader of the code ask "why is this here?" and find no local answer?
3. **A real trade-off** — was a genuinely viable alternative rejected, and does the record name it and say why it lost?
4. **Crosses capability boundaries** — does the decision bind more than one capability's living spec?

Direction A (over-drafted): if the draft fails these criteria (a note-to-self dressed as an ADR), say so — an ADR that documents the obvious is debt.

Direction B (under-drafted): scan the change that produced it (`cdd/changes/claim-map/` — proposal.md, specs/ deltas, tasks.md) and the code it touched (`scripts/adr-index.mjs`, `scripts/spec-drift.mjs`, `lib/adr-ops.mjs`) for OTHER decisions that meet the four criteria but have no ADR — e.g. the byte-identity proof recipe, the per-path governing query's semantics for untracked paths, the choice to keep `spec-extract.mjs`'s union-only derivation out of scope.

Also check the record's hygiene against its siblings (`cdd/decisions/0007-*.md` is its closest kin): frontmatter shape (status, code globs), prose sections, no restatement of another ADR's decision, correct naming of what it amends vs supersedes.

## Output

Write your findings to `cdd/changes/claim-map/reviews/adr-review.md` (this file only; you write NO other files, you run NO builds, you commit nothing). Format:

```
# ADR review findings — ADR-0013
Reviewer: cold session, model <provider/model you run as>, family <family>
Verdict shape: keep as-is / keep with edits / demote to prose / plus any missing-ADR findings.

| id | severity (blocker/should/note) | finding | evidence (path:line) | disposition |
|---|---|---|---|---|
| A1 | ... | ... | ... | open |
```

Then reply to your parent with: counts (blocker/should/note), the verdict shape, the model you ran as, and your family. Findings are advisory; dispositions belong to the author.
