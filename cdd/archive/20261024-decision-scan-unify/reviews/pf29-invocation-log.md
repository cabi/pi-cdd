# PF-29 — reviewer invocation log (decision-scan-unify)

Exact invocation shapes used for every model-run review in this change,
following cdd/archive/20261024-claim-map/reviews/pf29-invocation-log.md.
Tool context: this runner session has no `subagent` tool — cold reviewers
run via the pi CLI: `pi -p --no-session --model <id> --thinking <level>`
with the brief at a file path, launched from the repo cwd.

## R2 package review — attempts 1–3 (FAILED, provider auth)

- `pi -p --no-session --model 'opencode/claude-haiku-5-5:max'` → hard fail,
  401 `{"type":"authentication_error","code":"api_key_expired"}` (the whole
  opencode shortlist was configured on the expired account key; director
  confirmed config error, m00156).
- `pi -p --no-session --model 'opencode/gpt-6-luna:max'` → same 401.
- `pi -p --no-session --model 'opencode/deepseek-v4.1-flash:max'` → same 401.

## R2 — attempt 4 (COMPLETED off-bench, voided)

- `pi -p --no-session --model 'opencode-zen/deepseek-v4.1-flash:high'`
  (the then-standing fallback standard) → completed; findings: 0 blocker,
  4 should, 4 note.
- Voided by director order (m00156): the corrected bench is the
  opencode-zen shortlist, and the aborted polling run was believed partial
  (it had in fact completed via nohup). Evidence kept at
  `reviews/r2-voided-run1.md`; its findings were still real defects and the
  author folded all of them into the package (dispositions recorded there).

## R2 — attempt 5 (FAILED, provider bug)

- `pi -p --no-session --model 'opencode-zen/claude-haiku-5-5' --thinking high`
  (first corrected-bench entry) → hard fail, provider 400
  `Invalid \`signature\` in \`thinking\` block. The block is bound to a
  different conversation.` — fell down the corrected list per protocol.

## R2 — attempt 6 (COMPLETED — the live R2)

- `pi -p --no-session --model 'opencode-zen/gpt-6-luna' --thinking high`
  (second corrected-bench entry) → completed. Model that actually ran:
  `opencode-zen/gpt-6-luna`, thinking `high`; family gpt ≠ zai (author
  glm-5.3) → independence confirmed.
- Findings: `reviews/r2-change-review.md` — 1 blocker, 1 should; both
  disposed `fixed` by the author (dispositions in that file).

## R3 standards axis — attempt 1 (COMPLETED — the live standards review)

- Director M3 order: bench `task:review` order gpt-6-luna first, then
  deepseek-v3.1-flash (haiku removed from the config after its
  thinking-signature 400).
- `pi -p --no-session --model 'opencode-zen/gpt-6-luna' --thinking high`
  → completed. Model that actually ran: `opencode-zen/gpt-6-luna`,
  thinking `high`; family gpt ≠ zai (author glm-5.3) → independence
  confirmed. Brief: `reviews/brief-r3-standards.md`.
- Findings: `reviews/r3-standards-code-review.md` — 0 blockers, 2 should,
  1 note; dispositions in that file (S2 fixed, S1/S3 kept with rationale).

## R3 spec axis — attempt 1 (FAILED, provider unavailable)

- `pi -p --no-session --model 'opencode-zen/deepseek-v3.1-flash' --thinking high`
  → hard fail, provider 400 `Upstream request failed: Model is
  unavailable.` / not found for provider — fell down the mission's
  fallback ladder.

## R3 spec axis — attempt 2 (COMPLETED — the live spec review)

- Mission fallback: `pi -p --no-session --model
  'opencode-zen/deepseek-v4.1-flash' --thinking high` → completed. Model
  that actually ran: `opencode-zen/deepseek-v4.1-flash`, thinking `high`;
  family deepseek ≠ zai (author glm-5.3) and ≠ gpt (standards reviewer) →
  independence confirmed. Brief: `reviews/brief-r3-spec.md`.
- Findings: `reviews/r3-spec-code-review.md` — 1 blocker, 1 should, 4
  notes; dispositions in that file (P1/P2/P5 fixed, P3/P4/P6 kept with
  rationale).
