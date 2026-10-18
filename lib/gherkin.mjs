// gherkin — the fence arbiter. Scenario bodies live in fenced `gherkin` blocks
// inside delta/spec markdown; this module extracts them, parses them with the
// official @cucumber/gherkin parser, and enforces the cdd subset rules.
// Parse validity and grammar are machine law here; declarative phrasing
// is door-1 judgment (decisions/0005-gherkin-scenario-language.md).

// Vendored @cucumber/gherkin 42.0.1 (see vendor/@cucumber): pi installs
// extensions as bare git clones without npm install, so a bare specifier
// would break the installed extension. Door scripts stay bare-import +
// loud failure (their contract is the adopting repo's own dependency).
import { Parser, AstBuilder, GherkinClassicTokenMatcher } from "../vendor/@cucumber/gherkin/dist/index.js";

const OPEN_FENCE = /^\s*```\s*gherkin\s*$/;
const CLOSE_FENCE = /^\s*```\s*$/;

/**
 * Extract every `gherkin` fence from markdown text.
 * Returns [{ body, line, closed }] where `line` is the 1-based absolute line
 * of the first body line and `body` excludes the fence markers.
 */
export function extractFences(text, startLine = 1) {
  const lines = String(text).split("\n");
  const fences = [];
  let i = 0;
  while (i < lines.length) {
    if (OPEN_FENCE.test(lines[i])) {
      const first = i + 1;
      const body = [];
      i++;
      let closed = false;
      while (i < lines.length) {
        if (CLOSE_FENCE.test(lines[i])) {
          closed = true;
          i++;
          break;
        }
        body.push(lines[i]);
        i++;
      }
      fences.push({ body: body.join("\n"), line: startLine + first, closed });
    } else {
      i++;
    }
  }
  return fences;
}

let nextId = 0;
function makeParser() {
  return new Parser(new AstBuilder(() => `cdd-${++nextId}`), new GherkinClassicTokenMatcher());
}

function parse(body) {
  // The fence holds scenarios, not a feature; wrap so the parser accepts it
  // and subtract the synthetic line when reporting errors back.
  const doc = makeParser().parse(`Feature: cdd\n${body}`);
  return doc;
}

const ENGLISH_STEPS = new Set(["given", "when", "then", "and", "but"]);

/**
 * Check one fence body against the cdd subset.
 * Returns { name, errors: [{ line, message }] } — `line` is 1-based within
 * the body; callers add the fence's absolute offset. A parse failure yields
 * the parser's own message(s), still body-relative.
 */
export function checkFence(body) {
  const errors = [];
  let doc;
  try {
    doc = parse(body);
  } catch (e) {
    const items = Array.isArray(e.errors) && e.errors.length ? e.errors : [{ location: { line: 1 }, message: String(e.message).split("\n")[0] }];
    for (const it of items) {
      const line = Math.max(1, (it.location?.line ?? 1) - 1); // drop the synthetic Feature line
      errors.push({ line, message: `invalid gherkin: ${it.message.split("\n")[0]}` });
    }
    return { name: null, errors };
  }

  const children = doc.feature?.children ?? [];
  const scenarios = [];
  for (const child of children) {
    if (child.background) errors.push({ line: child.background.location.line - 1, message: `Background is outside the cdd subset — move shared context into each scenario's Given steps` });
    else if (child.rule) errors.push({ line: child.rule.location.line - 1, message: `Rule is outside the cdd subset — one requirement per delta entry, no Rule blocks` });
    else if (child.scenario) scenarios.push(child.scenario);
  }

  if (scenarios.length > 1) {
    errors.push({ line: scenarios[0].location.line - 1, message: `a fence holds exactly one scenario — found ${scenarios.length}` });
  }

  let name = null;
  for (const sc of scenarios) {
    name = sc.name;
    const scLine = sc.location.line - 1;
    if (sc.tags?.length) {
      errors.push({ line: scLine, message: `tag "${sc.tags[0].name}" is outside the cdd subset — no @tags` });
    }
    if (sc.description && sc.description.trim()) {
      const first = sc.description.trim().split("\n")[0];
      errors.push({ line: scLine + 1, message: `prose outside steps ("${first}") — every line inside the fence must be a step, Examples, or data table` });
    }
    const steps = sc.steps ?? [];
    if (steps.length === 0) {
      errors.push({ line: scLine, message: `the scenario holds no steps` });
    }
    if (steps[0]?.keywordType === "Conjunction") {
      errors.push({ line: steps[0].location.line - 1, message: `a scenario cannot start with ${steps[0].keyword.trim()} — And/But continue a prior step` });
    }
    for (const st of steps) {
      if (!ENGLISH_STEPS.has(st.keyword.trim().toLowerCase())) {
        errors.push({ line: st.location.line - 1, message: `keyword "${st.keyword.trim()}" is outside the cdd subset — English Given/When/Then/And/But only` });
      }
    }
    const whens = steps.filter((st) => st.keyword.trim().toLowerCase() === "when");
    if (whens.length !== 1) {
      errors.push({ line: scLine, message: `the scenario must hold exactly one When step — found ${whens.length}` });
    }
    const thens = steps.filter((st) => st.keyword.trim().toLowerCase() === "then");
    if (thens.length < 1) {
      errors.push({ line: scLine, message: `the scenario must hold at least 1 Then step` });
    }
  }
  return { name, errors };
}
