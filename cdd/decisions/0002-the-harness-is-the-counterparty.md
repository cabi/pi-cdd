---
status: accepted
code: index.ts
---
# The harness is the counterparty

The factory needed the OpenSpec CLI as an external counterparty that forced the agent through scaffold → instructions → validate → archive. In pi-cdd the extension runs inside the agent's own harness, so that discipline cannot come from an external process — it must come from structure:

1. **Ambient, not fetched:** method rules are injected into every session (`before_agent_start`), so there is no `instructions` call a lazy agent could skip (ADR-0004).
2. **Hard gates stay external to the model:** `cdd_validate` is a deterministic tool returning red/green, and doors 2/3 are the standalone guard scripts — the model can read a verdict, never negotiate one.
3. **The human keeps the close button:** `/cdd-init` and `/cdd-archive` are commands first; the agent tools mirror them for flow, but the git pair-commit rhythm (feature commit + archive commit) stays visible in history.

Consequence: trust in pi-cdd is trust in *deterministic checks plus injected context*, not in an external vendor tool. That is a different trust model than the factory's — and the reason the validation run (P4) must falsify it before any packaging.

Reconfirmed-by: comments-are-shape-only — index.ts banner comments swept; the harness-counterparty contract unchanged.
