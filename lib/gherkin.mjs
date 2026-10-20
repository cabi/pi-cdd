// gherkin — door 1's fence arbiter. The law — scanner, pin dialect, subset
// predicates, error shaping — lives in scripts/law.mjs; this adapter injects
// the official parser so the law stays dependency-free and every door
// renders the same verdict (ADR-0001, ADR-0002). Parse validity and grammar
// are machine law here; declarative phrasing is door-1 judgment
// (decisions/0006-feature-block-consolidation.md).

// Vendored @cucumber/gherkin 42.0.1 (see vendor/@cucumber): pi installs
// extensions as bare git clones without npm install, so a bare specifier
// would break the installed extension. Door scripts stay bare-import +
// loud failure (their contract is the adopting repo's own dependency).
import { Parser, AstBuilder, GherkinClassicTokenMatcher } from "../vendor/@cucumber/gherkin/dist/index.js";
import { checkFenceBody, extractFences } from "../scripts/law.mjs";

export { extractFences };

let nextId = 0;
function makeParser() {
  return new Parser(new AstBuilder(() => `cdd-${++nextId}`), new GherkinClassicTokenMatcher());
}

/** Check one fence body with the vendored parser — see law.mjs checkFenceBody. */
export function checkFence(body) {
  return checkFenceBody(body, (b) => makeParser().parse(b));
}
