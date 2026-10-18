// instructions.mjs — THE AUTHORING CORPUS, ported from openspec-cdd's
// lean-verified schema.yaml `instruction:` fields. That corpus was the
// distillation of the critics (C2 ambiguity, C3 reinvention, C4/C5 no done);
// dropping it in the P1 port was a silent-contract change. It is never
// dropped again: templates embed it (the agent reads it while filling),
// rules.md summarizes it, the validator enforces its machine-checkable parts.

export const PROPOSAL_INSTRUCTION = `<!--
PROPOSAL — how to fill this file (the decision document, not a design document)

Sections (all required):

Why: 1-2 sentences on the user-visible problem or opportunity. State the
problem, not a solution. If you cannot name who hurts and how, the change
is not ready.

What Changes: bullet list of behavior changes. Be specific about new
capabilities, modifications, removals. Mark breaking changes with BREAKING.

Solutions Considered (reuse-first): for EVERY capability below, name the
existing solutions you evaluated before deciding to build: libraries,
platform/framework features, tools already in the dependency tree, and
existing specs under cdd/specs/. Record for each: what it covers, and why
you adopt it or reject it. "None found" is only acceptable if you name what
you searched. Do not specify new behavior in an area where a maintained
solution already fits — adopt it and note the trade-off instead.

Non-Goals: what this change explicitly will NOT do. This is the scope fence
against feature creep: every tempting adjacent feature goes here, not into
the spec. At least one entry is required; if the scope is truly minimal,
name the closest feature you are rejecting.

Done-When: 1-5 completion criteria, each on its own "Done-When:" line,
each phrased as an observable check (a command that exits 0, an artifact
that exists, a behavior a user can observe), never as an activity
("implement", "add"). tasks.md must trace back to every one of them.

Capabilities: which specs are created or modified. Before filling this in,
read cdd/specs/ for the capability inventory and cdd/changes/ for work
already in flight: if an open change already claims this behavior or these
files, extend that change instead of opening a twin — parallel changes on
one capability collide at archive. Genuinely sequential follow-ups open as
their own change and record "Depends on: <change>" here.

Keep the whole document under one page. If a section does not change a
decision someone makes, delete it.
-->`;

export const DELTA_INSTRUCTION = `<!--
SPEC DELTA — how to fill this file (behavior contracts, not implementation)

Precision lives in scenarios, not prose: a spec that chases precision
through ever-more-detailed English either stays ambiguous or turns into
pseudo-code. State each behavior once as a requirement, then pin it down
with quantified WHEN/THEN scenarios that read like test cases.

Format (cdd_validate enforces):
- "### Requirement: <name>" plus a description of at most 500 characters
  stating exactly one behavior. Use SHALL/MUST for normative statements,
  never should/may.
- Every requirement has at least one "#### Scenario: <name>" (exactly 4
  hashtags) with WHEN/THEN bullet lines.
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
- Spec observable behavior: inputs, outputs, error conditions, external
  constraints. No internal class/function names, no library choices, no
  step-by-step internals — those belong in tasks.md design notes.
- Quick test: if the implementation can change without changing externally
  visible behavior, it does not belong in this file.
- Do not add requirements the proposal's Done-When does not need. Anything
  else is scope creep.
-->`;

export const TASKS_INSTRUCTION = `<!--
TASKS — how to fill and work this file (verified checklist traced to Done-When)

Before writing tasks, re-read the proposal's Done-When lines. If any
criterion is not observable as written, resolve it with the user first.

Format:
- Group tracked tasks under ## numbered headings; every tracked task is a
  checkbox "- [ ] X.Y Task" and MUST end with its verification:
  "verify by <command, test, or observable check>". A task without a
  verification is a wish, not a task.
- Phrase each task as the interface it establishes ("Reporter emits a CSV
  header row"), never as an activity ("implement reporting"). Work each
  task red-green-refactor: write the failing unit test that names that
  interface, implement the smallest code that turns it green, refactor
  freely. Unit tests are engineering artifacts born during apply — they
  churn with the design and are never pinned in the spec.
- Order by dependency. Keep each task small enough to finish in one session.
- Turn the design gate's open questions into early tasks. Keep a
  "## Design Notes" section only for decisions the design gate did not cover.
- End with "## Done When Traceability": a table row per proposal criterion —
  "| <criterion> | <task ids that verify it> |". If a criterion has no task,
  add the task or fix the criterion.

Scale rule: more than 8 implementation subtasks is the split signal — run
the split procedure at the design gate; more than 12 fails strict validation.
The split: read the traceability table (it is the split map), cut into N
proposals each with its own Done-When subset and its own delta, record
"Depends on:", supersede the original (never delete it). A genuinely atomic
change that must exceed 12 records a "split-considered: kept whole because
<reason>" line in this file instead.

Apply protocol: work strictly top-to-bottom, one task at a time. Tick a box
only after its verification passes ("checked" means "its verification
passed", never "I am done looking at it"); re-read this file after each
tick. If a verification fails, uncheck and fix — never continue on a red
check. Group-local testing: each group lands the unit tests its own work
calls for; a final group runs the scenarios' acceptance tests end to end.

Anti-scope-creep: no task may exist without a spec requirement or Done-When
criterion that needs it. Improvements no criterion demands go back to the
proposal as Non-Goals or a future change.
-->`;
