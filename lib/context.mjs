// context.mjs — ambient injection (ADR-0004): the method rides along on
// every request; the agent cannot skip or forget it. Small constant cost,
// kept lean by pointing at cdd/rules.md instead of inlining the rules.

import { hasStore, listChanges } from "./store.mjs";

export function buildAmbientBlock(root) {
  if (!hasStore(root)) return null;
  const changes = listChanges(root);
  const openChanges = changes.length
    ? changes.map((c) => `- cdd/changes/${c}/`).join("\n")
    : "- (none open — start one with the cdd tool, op new)";
  return `

## cdd — contract-driven development
Code is the truth, the spec is the index. Read cdd/rules.md before authoring or modifying any artifact.
Open changes:
${openChanges}
New change: design gate → proposal → spec delta (every scenario ends with "Verified by: tests/acceptance/<path>") → tasks → acceptance tests first → cdd validate strict green → guard green (node cdd/scripts/spec-drift.mjs) → cdd archive.
Mechanical sweeps (format, codemods, dependency bumps) commit with a "Mechanical-Change: <reason>" trailer and leave cdd/specs/ and acceptance tests untouched. Source code carries no spec markers.
`;
}
