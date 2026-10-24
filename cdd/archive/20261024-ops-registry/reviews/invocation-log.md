# Reviewer invocation log — ops-registry

Standing recipe: `cdd/archive/20261024-claim-map/reviews/pf29-invocation-log.md`
(opencode-zen/deepseek-v4.1-flash @ thinking high first, then
opencode-zen/deepseek-v4-pro @ high; both dead → STOP and ask the director).
The author's family is zai/glm-5.3; every reviewer must differ.

## R1 — proposal mode

- Date: 2026-10-24 (this change's run)
- Reviewer session: one-shot `pi -p --no-session --model
  opencode-zen/deepseek-v4.1-flash --thinking high`, cwd = repo root, brief
  `cdd/changes/ops-registry/reviews/brief-r1.md` (paths-only charter; the
  session was told to read the brief first and seek no context beyond its
  paths — rule 2b cold).
- Output: `cdd/changes/ops-registry/reviews/r1-proposal-review.md` —
  0 blocker · 5 should · 4 note. Dispositions recorded in that file's
  Dispositions section (4 fixed, 1 fixed, 4 fixed at note level, 1
  won't-fix: P5 no-ADR).
- Family anomaly, recorded for honesty: the findings header self-reports
  "anthropic/claude" though the invocation named opencode-zen/
  deepseek-v4.1-flash; a one-shot `pi -p` session's self-identification is
  unreliable (it sees neither its own model id nor the router's routing).
  Either way the reviewer family (DeepSeek or Anthropic) differs from the
  author's zai/glm-5.3, so the 2b family constraint holds.

## R2 — package mode

- Date: 2026-10-24 (this change's run)
- Reviewer session: one-shot `pi -p --no-session --model
  opencode-zen/deepseek-v4.1-flash --thinking high`, cwd = repo root, brief
  `cdd/changes/ops-registry/reviews/brief-r2.md` (paths-only charter,
  rule 2b cold; PI_PROVIDER=opencode-zen, PI_MODEL=deepseek-v4.1-flash
  self-reported in the findings header — family DeepSeek ≠ author zai/
  glm-5.3).
- Output: `cdd/changes/ops-registry/reviews/r2-change-review.md` —
  0 blocker · 5 should · 5 note. Dispositions recorded in that file's
  Dispositions section: F1–F4, F6–F9 fixed (artifact edits), F5 fixed
  (scenario scoped to option-owning ops + structural assertion for
  status/help), F10 won't-fix: (single acceptance file, one owner per
  checkO; extension owns the registry it centers on).

## R3 — Close code review, two cold sessions (rule 2b: axes never share a session)

- Date: 2026-10-24 (this change's run)
- Standards axis: one-shot `pi -p --no-session --model
  opencode-zen/deepseek-v4.1-flash --thinking high`, cwd = repo root, brief
  `cdd/changes/ops-registry/reviews/brief-r3-standards.md`. Output
  `reviews/r3-standards-code-review.md` — 0 blocker · 3 should · 5 note.
  Header self-reports `PI_PROVIDER=opencode-zen`,
  `PI_MODEL=deepseek-v4.1-flash`, `PI_REASONING_LEVEL=high` (family DeepSeek
  ≠ author zai/glm-5.3).
- Spec axis: one-shot `pi -p --no-session --model
  opencode-zen/deepseek-v4.1-flash --thinking high`, cwd = repo root, brief
  `cdd/changes/ops-registry/reviews/brief-r3-spec.md`. Output
  `reviews/r3-spec-code-review.md` — 0 blocker · 3 should · 4 note. Header
  self-reports the same DeepSeek family evidence plus its subagent/session
  ids; it also ran scratch-tree mutation controls (/tmp copies) proving the
  additive-drift and ghost-entry holes it reported.
- Dispositions: both files carry a Dispositions section — standards F1–F5
  fixed (MAINTENANCE.md pointers, honest header, WHAT-only comments,
  scaffold removal, dangling comment), F6/F7 won't-fix:, F8 tracked at
  Close (reconfirmations ride the archive commit); spec F1–F4 fixed (OR10
  source pins, OR7 line equality, OR8 set equality, OR9 details equality —
  each negative-controlled red in /tmp copies), F5/F7 won't-fix: (recorded
  non-goals), F6 fixed with standards-F5.
