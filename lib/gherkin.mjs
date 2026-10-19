// gherkin — the fence arbiter. Each requirement carries one fenced `gherkin`
// block holding one complete Gherkin document: `Feature:` plus every
// scenario, each scenario ending with a `# Verified by:` pin comment.
// This module extracts fences, parses them with the official
// @cucumber/gherkin parser, and enforces the cdd subset rules.
// Parse validity and grammar are machine law here; declarative phrasing
// is door-1 judgment (decisions/0006-feature-block-consolidation.md).

// Vendored @cucumber/gherkin 42.0.1 (see vendor/@cucumber): pi installs
// extensions as bare git clones without npm install, so a bare specifier
// would break the installed extension. Door scripts stay bare-import +
// loud failure (their contract is the adopting repo's own dependency).
import { Parser, AstBuilder, GherkinClassicTokenMatcher } from "../vendor/@cucumber/gherkin/dist/index.js";

const OPEN_FENCE = /^\s*```\s*gherkin\s*$/;
const CLOSE_FENCE = /^\s*```\s*$/;
const PIN_COMMENT = /^#\s*Verified by[*:]*\s*(\S+)\s*$/;

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

const ENGLISH_STEPS = new Set(["given", "when", "then", "and", "but"]);

/**
 * Check one fence body: a complete Gherkin document whose Feature echoes the
 * requirement heading. Returns { name, scenarios: [{ name, pin, line }],
 * errors: [{ line, message }] } — `line` values are 1-based within the body;
 * callers add the fence's absolute offset. A parse failure yields the
 * parser's own message(s), still body-relative.
 */
export function checkFence(body) {
  const errors = [];
  let doc;
  try {
    doc = makeParser().parse(body);
  } catch (e) {
    const items = Array.isArray(e.errors) && e.errors.length ? e.errors : [{ location: { line: 1 }, message: String(e.message).split("\n")[0] }];
    for (const it of items) {
      const line = Math.max(1, it.location?.line ?? 1);
      errors.push({ line, message: `invalid gherkin: ${it.message.split("\n")[0]}` });
    }
    return { name: null, scenarios: [], errors };
  }

  const feature = doc.feature;
  const scenarios = [];
  if (feature.tags?.length) {
    errors.push({ line: feature.location.line, message: `tag "${feature.tags[0].name}" is outside the cdd subset — no @tags` });
  }
  if (feature.description && feature.description.trim()) {
    const first = feature.description.trim().split("\n")[0];
    errors.push({ line: feature.location.line + 1, message: `prose between Feature and the first Scenario ("${first}") — the fence holds an executable document; prose stays markdown outside` });
  }
  for (const child of feature.children ?? []) {
    if (child.background) errors.push({ line: child.background.location.line, message: `Background is outside the cdd subset — move shared context into each scenario's Given steps` });
    else if (child.rule) errors.push({ line: child.rule.location.line, message: `Rule is outside the cdd subset — one Feature per requirement, no Rule blocks` });
    else if (child.scenario) scenarios.push(child.scenario);
  }
  if (scenarios.length === 0) {
    errors.push({ line: feature.location.line, message: `the Feature holds no Scenario` });
  }

  for (const sc of scenarios) {
    const scLine = sc.location.line;
    if (sc.keyword === "Scenario Outline") {
      errors.push({ line: scLine, message: `Scenario Outline/Examples are outside the cdd subset (ADR-0006) — write each example as its own Scenario` });
    }
    if (sc.tags?.length) {
      errors.push({ line: scLine, message: `tag "${sc.tags[0].name}" is outside the cdd subset — no @tags` });
    }
    if (sc.description && sc.description.trim()) {
      const first = sc.description.trim().split("\n")[0];
      errors.push({ line: scLine + 1, message: `prose between Scenario and its steps ("${first}") — every line inside a scenario is a step or the pin comment` });
    }
    const steps = sc.steps ?? [];
    if (steps.length === 0) {
      errors.push({ line: scLine, message: `the scenario holds no steps` });
    }
    if (steps[0]?.keywordType === "Conjunction") {
      errors.push({ line: steps[0].location.line, message: `a scenario cannot start with ${steps[0].keyword.trim()} — And/But continue a prior step` });
    }
    for (const st of steps) {
      if (!ENGLISH_STEPS.has(st.keyword.trim().toLowerCase())) {
        errors.push({ line: st.location.line, message: `keyword "${st.keyword.trim()}" is outside the cdd subset — English Given/When/Then/And/But only` });
      }
      if (st.docString || st.dataTable) {
        errors.push({ line: st.location.line, message: `doc strings and data tables are outside the cdd subset (ADR-0006) — steps stay single-line prose` });
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

  // Strict comment law: the only legal comment is a scenario's trailing
  // "# Verified by: <path>" pin (ADR-0006). Anything else can silently
  // comment out a step, so it is an error, not a style note.
  const pins = [];
  const comments = [...(doc.comments ?? [])].sort((a, b) => a.location.line - b.location.line);
  for (const c of comments) {
    const m = c.text.trim().match(PIN_COMMENT);
    if (m) pins.push({ path: m[1], line: c.location.line });
    else {
      errors.push({ line: c.location.line, message: `comment "${c.text.trim().slice(0, 40)}" is outside the cdd subset — the only legal comment is the scenario's "# Verified by: <path>" pin` });
    }
  }

  // Associate pins with scenarios by position: a scenario's pin sits after
  // its last step and before the next Scenario (or EOF). Orphan pins —
  // before the first Scenario — belong to no scenario.
  const out = [];
  const sorted = [...scenarios].sort((a, b) => a.location.line - b.location.line);
  const featureEnd = feature.location.line;
  sorted.forEach((sc, i) => {
    const lastStep = sc.steps?.length ? sc.steps[sc.steps.length - 1].location.line : sc.location.line;
    const next = sorted[i + 1]?.location.line ?? Number.MAX_SAFE_INTEGER;
    const mine = pins.filter((p) => p.line > lastStep && p.line < next);
    const before = i === 0 ? pins.filter((p) => p.line > featureEnd && p.line < sc.location.line) : [];
    if (i === 0 && before.length) {
      errors.push({ line: before[0].line, message: `a "# Verified by:" pin before the first Scenario belongs to no scenario` });
    }
    if (mine.length === 0) {
      errors.push({ line: lastStep, message: `scenario "${sc.name}" does not end with a "# Verified by: <path>" pin comment` });
    } else {
      if (mine.length > 1) {
        errors.push({ line: mine[1].line, message: `scenario "${sc.name}" carries ${mine.length} pin comments — exactly one` });
      }
      out.push({ name: sc.name, pin: mine[0].path, line: sc.location.line, text: (sc.steps ?? []).map((s) => s.text).join(" ") });
    }
  });

  return { name: feature.name, scenarios: out, errors };
}
