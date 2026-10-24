<!--
SPEC DELTA — how to fill this file (behavior contracts, not implementation)

Precision lives in scenarios, not prose: a spec that chases precision
through ever-more-detailed English either stays ambiguous or turns into
pseudo-code. State each behavior once as a requirement, then pin it down
with quantified WHEN/THEN scenarios that read like test cases.

Format (cdd validate enforces):
- "### Requirement: <name>" plus a description of at most 500 characters
  stating exactly one behavior. Use SHALL/MUST for normative statements,
  never should/may.
- Every requirement carries exactly one ```gherkin fence holding one
  complete Gherkin document (ADR-0006): "Feature: <name>" equal to the
  requirement heading, then one or more "Scenario: <name>" blocks — Given/
  When/Then steps with exactly one When, at least one Then, And/But only
  continuing the step above — and each scenario ends with its last line
  "# Verified by: tests/acceptance/<path>". No markdown "#### Scenario:"
  headings, no prose inside the fence, no other comments, no Background,
  Rule, tags, Scenario Outline, Examples, data tables, doc strings, or
  non-English keywords.
- Delta operations: ## ADDED / MODIFIED / REMOVED Requirements. A MODIFIED
  block must restate the requirement with EVERY scenario the living spec
  already has, plus the new or changed ones — silently dropping an existing
  scenario fails validation. A REMOVED requirement carries a "Reason:" line
  and, if users are affected, a migration note.
- End with "Code: <glob>" lines naming the files this capability owns; the
  drift guard matches tracked files against these globs for staleness and
  single-owner checks. A capability without a Code line guards nothing.
- Test-contract migration: when this change legitimately breaks an existing
  acceptance test, the delta MUST carry a MODIFIED requirement covering it
  AND the tasks must track the test rewrite as its own task.

Quantification (the anti-"bi-weekly" rules):
- Every interval, amount, limit, and threshold carries a number and a unit:
  "every 14 days", not "bi-weekly" or "regularly"; "p95 under 200 ms", not
  "fast"; "3 retries", not "several".
- Comparatives ("fast", "large", "user-friendly") are banned unless a number
  follows them. If it cannot be measured, it is a Non-Goal, not a requirement.
- Each scenario is a potential automated test: WHEN states the exact input or
  trigger, THEN the exactly observable outcome. A scenario that depends on
  geometry, quotas, or timing states its measured budget — a scenario that
  cannot hold on the target environment is a spec bug; reject it at propose
  time, not as a red acceptance test at apply time.

Content rules:
- Write scenarios declaratively: Given/When/Then state observable outcomes
  and the value delivered — never interaction mechanics such as keystrokes,
  widgets, or selectors. Declarative phrasing is door-1 review law; the
  validator checks parse and grammar, never phrasing.
- Spec observable behavior: inputs, outputs, error conditions, external
  constraints. No internal class/function names, no library choices, no
  step-by-step internals — those belong in tasks.md design notes.
- Quick test: if the implementation can change without changing externally
  visible behavior, it does not belong in this file.
- Do not add requirements the proposal's Done-When does not need. Anything
  else is scope creep.
-->

## ADDED Requirements

### Requirement: The director skill is bundled

The extension SHALL bundle a `cdd-director` skill — the director law for
review-loop directors: seven law points, a milestone gate table for the
4 milestone asks, the evidence protocol, findings harvest, pi delivery
mechanics, and anti-patterns — plus an instantiable mission-brief template
under its assets. The skill advises; it never enforces (gate authority
stays with the deterministic validators and the human, rule 2a), and its
loop-law citations stay consistent with `cdd/rules.md` without restating
rule text.

```gherkin
Feature: The director skill is bundled

Scenario: The director skill is a loadable pi skill
  Given the bundled skill skills/cdd-director/SKILL.md
  When its frontmatter and body are read
  Then its frontmatter name matches its directory and its quoted description stays within the 20 to 1024 character bounds and carries a when or whenever routing clause to cdd projects
  And every loop-law rule it cites by number names that obligation in cdd/rules.md, covering at least rules 2a, 2b, 9a, 11, and 13
  And its body restates no fragment of the law text in cdd/rules.md under a whitespace-normalized comparison
  # Verified by: tests/smoke.mjs

Scenario: The skill carries the director law
  Given the bundled director skill on disk
  When its charter is read
  Then it teaches exactly the 7 points of the director law: the verifier never authors, milestones are the only control points, the doors teach, lawful shape comes before bypass, the ledger is the only memory, spawn briefs carry the protocol, and the human is the escalation point
  And it carries a milestone gate table covering exactly the 4 asks M1, M2, M3, and M4
  And it carries the evidence protocol: green claims cite the exact command and tail excerpt, the director re-runs gates before blessing, merges are ff-only on held branches, and only the director pushes
  And it carries the findings harvest: mint process findings in flight through the backlog op, revalidate the ledger before every dispatch, and name the cdd-backlog-triage skill as the rubric's home for dispositions and statuses instead of restating them
  And it carries the pi delivery mechanics: idled-pane asks fail with No pending ask so follow with a send, crashed runner panes are benign exits verified by work landed, reviewer leaves relay through the director, re-list the roster before re-addressing, and nudges are answered
  And it carries an anti-patterns section naming pre-narrowing door checks, trusting green claims without tails, dispatching from session memory, direct edits on contract files, 2 writers on one repo, and letting a runner merge or push
  # Verified by: tests/smoke.mjs

Scenario: The mission-brief template is bundled under assets
  Given the bundled director skill's assets/mission-brief.md on disk
  When the template is read
  Then it carries the anatomy of a runner mission brief: 1 bounded outcome as the mission, an out-of-scope boundary of what is explicitly out, context files to read first, the protocol skeleton from design gate to archive pair-commit, reviewer constraints covering the family rule, the floor model as the least capable model a reviewer may fall back to, free rungs taken only when available and never relied on, and floor-down halting the run for a human decision, and milestone asks that each end in a WAIT
  And it orders the first action as verify the premise on disk then a handshake ask
  And it names the branch rule and the never-push rule for the runner
  # Verified by: tests/smoke.mjs
```

Code: skills/cdd-director/SKILL.md, skills/cdd-director/assets/mission-brief.md, tests/smoke.mjs
