// context.mjs — ambient injection (ADR-0004): the method rides along on
// every request; the agent cannot skip or forget it. Small constant cost,
// kept lean by pointing at cdd/rules.md instead of inlining the rules.

import { hasStore, listChanges } from "./store.mjs";

export function buildAmbientBlock(root) {
  if (!hasStore(root)) return null;
  const changes = listChanges(root);
  const openChanges = changes.length
    ? changes.map((c) => `- cdd/changes/${c}/`).join("\n")
    : "- (none open — start the loop with cdd_new_change)";
  return `

## cdd — contract-driven development

This project runs the cdd method: code is the truth, the spec is the index.
Read cdd/rules.md before authoring or modifying any artifact.

Open changes:
${openChanges}

Workflow for a new change: design gate → proposal → spec delta (every
scenario ends with "Verified by: tests/acceptance/<path>") → tasks →
implement with acceptance tests first → cdd_validate strict green →
guard green (node cdd/scripts/spec-drift.mjs) → cdd_archive.
Tools: cdd_init, cdd_new_change, cdd_validate, cdd_status, cdd_archive.
Mechanical sweeps (format, codemods, dependency bumps) commit with a
"Mechanical-Change: <reason>" trailer and never touch cdd/specs/ or
acceptance tests. Source code carries no spec markers — traceability
lives in the cdd/ tree only.
`;
}
