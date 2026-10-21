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
New change: design gate → proposal → spec delta (every scenario ends with "Verified by: tests/acceptance/<path>") → tasks → acceptance tests first → cdd validate strict green → guard green (node cdd/scripts/spec-drift.mjs) → cdd archive. Review points (rule 2a): R1 after the proposal when the design gate answered T1 or T2 YES (skill cdd-spec-review, proposal mode), R2 at draft-green before the first implementation task (skill cdd-spec-review, package mode), R3 at Close before archive (skill cdd-code-review, plus cdd-adr-review when ADRs were drafted) — advisory findings, never verdicts.
Mechanical sweeps (format, codemods, dependency bumps) commit with a "Mechanical-Change: <reason>" trailer and leave cdd/specs/ and acceptance tests untouched. Source code carries no spec markers.
`;
}
