---
status: accepted
code: lib/context.ts
---
# Ambient injection over fetch

The factory's agent had to *call* `openspec instructions <artifact> --change` to receive the rules for the current phase. A cold-start or lazy agent could skip, truncate, or paraphrase that fetch — the counterparty could only react at validate time.

pi-cdd injects instead: on `before_agent_start`, when the project has a `cdd/` store, the extension appends a compact method block — the loop, the current open changes, the rules-file pointer — to the system prompt (the `claude-rules.ts` pattern: list the files, let the agent read depth on demand).

Trade-offs accepted:

- **Cost:** every request carries a small constant context block. Kept lean by pointing at `cdd/rules.md` rather than inlining the full rules.
- **Prompt drift:** the injected text is code, versioned with the extension — same discipline as the factory's config-rules, but delivered structurally.

A fetch round-trip still exists where depth is phase-specific: artifact templates under `cdd/schemas/` are read by the agent when authoring that artifact. Ambient carries the *method*; fetched files carry the *form*.
