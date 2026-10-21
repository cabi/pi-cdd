// context.mjs — ambient injection (ADR-0004): the method rides along on
// every request; the agent cannot skip or forget it. Small constant cost,
// kept lean by pointing at cdd/rules.md instead of inlining the rules.

import { hasStore, listChanges } from "./store.mjs";
import { ambientIndependence, ambientLoopLine, ambientReviewPoints } from "./loop-law.mjs";

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
${ambientLoopLine()} ${ambientReviewPoints()}
${ambientIndependence()}
Mechanical sweeps (format, codemods, dependency bumps) commit with a "Mechanical-Change: <reason>" trailer and leave cdd/specs/ and acceptance tests untouched. Source code carries no spec markers.
`;
}
