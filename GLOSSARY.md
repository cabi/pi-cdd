# Language

One canonical term per concept. The `_Avoid_` list marks the graves of the
synonyms we rejected — use the term, not its ghosts. Terms here are language
only, never implementation detail: if a definition starts describing code, it
belongs in a spec delta or an ADR instead.

Ported from the factory (`openspec-cdd/openspec/GLOSSARY.md`) and extended
with pi-runtime terms. Store paths say `cdd/` here; where the factory said
`openspec/`, the concept is unchanged.

**capability** — a named area of contract the system promises; the unit of
ownership under `cdd/specs/<capability>/`. _Avoid_: module, feature,
domain-area.

**change loop** — the four-phase authoring flow (design gate → proposal →
deltas → tasks) that produces one change folder under
`cdd/changes/<name>/`. _Avoid_: workflow, ticket.

**delta** — the spec excerpt inside a change folder that will merge into the
capability spec on archive. _Avoid_: diff, patch.

**gherkin fence** — the fenced ```gherkin block holding a scenario body;
the official parser is the arbiter of what is valid inside it, while the
`Verified by:` pin stays markdown outside the fence (ADR-0005).

**acceptance test** — the committed test that pins a scenario, named under
`tests/acceptance/`; the reason a spec line can be trusted. _Avoid_: e2e
test, integration test (those are kinds of tests, not the pin itself).

**door** — a checkpoint the change must pass: door 1 authoring (human and
agent judgment), door 2 commit (drift guard), door 3 CI (machine verdicts).
_Avoid_: gate (reserved for the design gate specifically).

**design gate** — the first phase of the change loop where the model of the
change is designed and challenged before any artifact is written; emits the
split signal at more than 8 tasks (T5). _Avoid_: review, planning phase.

**mechanical change** — a behavior-preserving sweep (formatting, codemod,
dependency or framework bump) that ages no spec and may never touch specs or
acceptance tests; declared with the `Mechanical-Change:` trailer.
_Avoid_: chore, cleanup.

**ADR (architectural decision record)** — a decision that is hard to reverse,
surprising without context, a real trade-off, and crosses capability
boundaries; lives in `cdd/decisions/`, guarded by A0/A1/A2.
_Avoid_: design doc, RFC.

**store** — the plain-markdown tree `cdd/` holding rules, glossary,
decisions, schemas, changes, specs, and archive; owned by the method, not by
any tool (ADR-0003). _Avoid_: database, workspace.

**pi-tool** — the door-1 authoring counterparty in this product: the pi-cdd
extension itself. The role the OpenSpec CLI played in the factory.
_Avoid_: openspec (that name belongs to the factory's counterparty).

**extension** — a TypeScript module running inside the pi process that
registers commands, tools, and event handlers; pi-cdd is one.
_Avoid_: plugin, add-on.

**ambient context** — method rules injected into every session's context by
the extension (`before_agent_start`), so the agent cannot skip or forget
them; replaces the factory's `instructions --change` fetch round-trip
(ADR-0004). _Avoid_: system prompt (that is pi's, not ours).

**slash command** — a human-invoked `/cdd-…` operation registered by the
extension. **agent tool** — a model-callable operation (`cdd_…`) with typed
parameters and a red/green result. _Avoid_ (both): API, endpoint.
