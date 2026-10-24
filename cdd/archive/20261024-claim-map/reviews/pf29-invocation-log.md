# PF-29 — reviewer invocation log (claim-map)

Exact invocation shapes used for every model-run review in this change,
including failures (the recipe stops being word-of-mouth).

## R1 — attempt 1 (FAILED, provider auth)

- Tool call shape (pi subagent tool, fire-and-forget):
  `subagent({ name: "claim-map-review-r1", task: "You are the R1 proposal
  reviewer ... only briefing material is
  cdd/changes/claim-map/reviews/brief-r1.md ...", model: "task:review",
  thinking: "max", agent: "reviewer", cwd: repo })`
- model "task:review" expanded (host, from
  ~/.pi/agent/herdr-agents/config.json models.tasks.review):
  1. opencode/claude-haiku-5-5 — 401 api_key_expired
  2. opencode/gpt-6-luna — 401 api_key_expired
  3. opencode/deepseek-v4.1-flash — 401 api_key_expired (fell through,
     still failed)
- Family check: MOOT — no model launched; nothing ran. Whole shortlist
  unavailable → stop-and-ask fired (director protocol, m00048).
- Failure record: completion metadata "Model used:
  opencode/deepseek-v4.1-flash", raw 401
  `{"type":"authentication_error","code":"api_key_expired"}` for all three.

## Provider ceiling trap (director ruling, intercom m00105)

While the opencode provider key is expired, the review standard is the
opencode-zen provider: model `opencode-zen/deepseek-v4.1-flash`, thinking
`high`. opencode-zen models have NO thinkingLevelMap — their ceiling is
`high`; `xhigh`/`max` are unsupported there. `max` works ONLY on the
opencode provider. So the invocation pairs are:

- opencode provider (task:review shortlist): thinking `max`
- opencode-zen fallback: thinking `high` (max would be a provider
  rejection, not more reasoning)

Fallback chain: opencode-zen/deepseek-v4.1-flash → opencode-zen/deepseek-v4-pro
(both thinking high) → stop-and-ask. Family check from completion metadata
every time (deepseek ≠ zai proceeds).

## R1 — attempt 2 (authorized fallback (b))

- Tool call shape (pi subagent tool, fire-and-forget):
  `subagent({ name: "claim-map-review-r1b", task: "You are the R1 proposal
  reviewer ... only briefing material is
  cdd/changes/claim-map/reviews/brief-r1.md ...", model:
  "opencode-zen/deepseek-v4.1-flash", thinking: "high", agent: "reviewer",
  cwd: repo })`
- Result: COMPLETED 3m40s. Completion metadata: requested model = used
  model = `opencode-zen/deepseek-v4.1-flash`; family deepseek ≠ zai
  (author) → independence confirmed, review accepted. Findings:
  cdd/changes/claim-map/reviews/r1-proposal-review.md — 0 blocker,
  7 should, 3 note; all 10 disposed `fixed:` by the author (see the
  findings table).

## R2 package review — invocation

- Tool: subagent (direct, per role) — name: claim-map-review-r2,
  agent: reviewer, model: opencode-zen/deepseek-v4.1-flash,
  thinking: high (standing fallback standard; opencode-zen has no
  thinkingLevelMap, ceiling high), cwd: the repo root.
- Brief: cdd/changes/claim-map/reviews/brief-r2.md (paths-only brief;
  reviewer reads the brief and the paths it pins, writes only
  r2-change-review.md).
- Result: COMPLETED 5m4s — model used: opencode-zen/deepseek-v4.1-flash (requested
  deepseek-v4.1-flash, same), thinking high, family DeepSeek (≠ author zai/glm-5.3,
  family check from completion metadata holds); form: cold sub-agent session, brief
  = reviews/brief-r2.md only. Findings: 1 blocker / 3 should / 2 note — all advisory,
  all disposed by the author (5 fixed, 1 won't-fix) in r2-change-review.md.

## R3 + ADR review spawns (M4, standing fallback per director m00105)

| review | session name | invocation | result |
|---|---|---|---|
| R3 standards axis | claim-map-review-r3-standards | subagent tool: agent "reviewer", model opencode-zen/deepseek-v4.1-flash, thinking high, brief reviews/brief-r3-standards.md | completed 3m 27s; model used opencode-zen/deepseek-v4.1-flash, family DeepSeek (author glm-5.3); 0 blocker / 1 should / 4 note, all disposed (S1 fixed, S2 fixed, S3 fixed, S4 won't-fix, S5 fixed) |
| R3 spec axis | claim-map-review-r3-spec | subagent tool: agent "reviewer", model opencode-zen/deepseek-v4.1-flash, thinking high, brief reviews/brief-r3-spec.md | completed 5m 39s; model used opencode-zen/deepseek-v4.1-flash, family DeepSeek (author glm-5.3); 0 blocker / 1 should / 3 note, all disposed (SPEC-01 fixed, SPEC-02 half-fixed half-won't-fix, SPEC-03 won't-fix, SPEC-04 fixed) |
| ADR-0013 review | claim-map-review-adr | subagent tool: agent "reviewer", model opencode-zen/deepseek-v4.1-flash, thinking high, brief reviews/brief-adr-review.md | completed 3m 12s; model used opencode-zen/deepseek-v4.1-flash, family DeepSeek (author glm-5.3); 0 blocker / 2 should / 3 note, verdict keep-with-edits, all disposed (A1/A2/A3 fixed, A4/A5 won't-fix) |
