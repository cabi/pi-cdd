// grammar-law.mjs — the one law behind every door. Zero dependencies, plain
// Node >= 20: lib (door 1) imports it from the extension tree,
// the copied door scripts (cdd/scripts/) import their own copy. A grammar
// defined here is defined exactly once — doors adapt it, they never restate
// it.
//
// Chapter: tasks.md — the four-step skeleton and its checkboxes.

/** Law grammar version — bump when the grammar changes; cdd init refreshes adopting copies.
 * v2: placeholder pins in open deltas are skip-reported, not L1 failures (isPlaceholderPin). */
import { pathToFileURL } from "node:url";
// The glob matcher for Code: lines lives in adr-index.mjs; the law module
// re-exports it next to the model that consumes it.
import { globToRe } from "./adr-index.mjs";
export { globToRe };

// Refuse silent direct execution: run as a command, this module prints
// nothing and exits 0. It prints one stderr line and exits 2 instead. The
// verbatim cdd/scripts/ copy behaves identically because the check compares
// its own URL with argv[1], never a hardcoded path.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.error(
    "grammar-law.mjs is the law library behind the doors, not a command — run the door commands instead: node cdd/scripts/spec-drift.mjs (guard), spec-extract, arch-extract; validation runs through the cdd tool's validate operation"
  );
  process.exit(2);
}

export const LAW_VERSION = 2;

/** Implementation subtasks above this warn — the design-gate split signal (rule 6). */
export const SPLIT_SIGNAL = 8;

/** Implementation subtasks above this fail strict validation (rule 6). */
export const TASK_LIMIT = 12;

/** The four-step skeleton headings: `## 1. Context` … `## 4. Close`. */
export const TASK_SECTION = /^## ([1-4])\. (Context|Design|Implementation|Close)\s*$/;

/** A tracked checkbox line, numbered or not: `- [x] 3.1 text`. */
export const TASK_ITEM = /^- \[([ xX])\] (.+)$/;

/**
 * Split a tasks body into its skeleton sections: [{num, name, startLine,
 * startIndex, items: [{box, text, id, line}]}]. startIndex is the char offset
 * of the header line — text.slice(startIndex) runs from the header to the end
 * of the file. Any other ## heading (## Done When Traceability, ## Design
 * Notes) ends the section above it; checkboxes under it belong to no section.
 */
export function splitTaskSections(text) {
  const lines = text.split("\n");
  const sections = [];
  let current = null;
  let offset = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^## /.test(line)) {
      const header = line.match(TASK_SECTION);
      if (header) {
        current = { num: Number(header[1]), name: header[2], startLine: i + 1, startIndex: offset, items: [] };
        sections.push(current);
      } else {
        current = null;
      }
    } else if (current) {
      const item = line.match(TASK_ITEM);
      if (item) current.items.push({ box: item[1], text: item[2], line: i + 1 });
    }
    offset += line.length + 1;
  }
  return sections;
}

//
// Chapter: the gherkin fence — scanning, the pin dialect, the subset laws.
// The parser is injected: door 1 passes the vendored @cucumber/gherkin
// (lib/gherkin.mjs), door 3 passes the adopting repo's own dependency
// (cdd/scripts/spec-drift.mjs). The law stays zero-dependency and every
// door renders the same verdict.

const OPEN_FENCE = /^\s*```\s*gherkin\s*$/;
const CLOSE_FENCE = /^\s*```\s*$/;

/**
 * The one pin dialect: a `# Verified by: <path>` comment —
 * indent-tolerant (it sits at step depth inside the fence), never markdown,
 * never backticked. Every door builds its line scanner from this source.
 */
export const PIN_COMMENT = /^\s*#\s*Verified by[*:]*\s*(\S+)\s*$/;

/**
 * A scaffold placeholder pin: a `# Verified by:` pin whose path carries the
 * scaffold's placeholder marker — the angle-bracket form of the words
 * `scenario` or `name` (lib/templates.mjs), the same token family the draft
 * door treats as unfilled (lib/validate.mjs). The guard skips such pins in
 * OPEN deltas (template text, not a claim) and never skips them in living
 * specs. Any other angle-bracket shape is not a placeholder: it fails L1
 * everywhere, so the guard cannot silently green an unrecognized token.
 */
export const PLACEHOLDER_PIN = /<(?:scenario|name)>/;
export const isPlaceholderPin = (pin) => PLACEHOLDER_PIN.test(pin);


/** An indented, bracket-tagged guard issue line (`  [L1] …`): the stderr
 * shape the pre-existing-red verdict collects (lib/store.mjs imports it;
 * doors and tools never restate the shape). */
export const ISSUE_LINE = /^\s*\[/;

/** The Code-glob line: `Code: <globs>` (optionally a list item). Global — use with matchAll. */
export const CODE_LINE = /^\s*(?:-\s+)?Code:\s*(.+)$/gm;

/** The mechanical-commit marker: commits whose message matches never advance
 * either side of a staleness clock (guard and ops agree on it via import). */
export const MECH_GREP = '^Mechanical-Change:|^\\[mechanical\\]';

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

/** Blank out fence bodies so outside-the-fence checks (the pin) see only markdown. */
export function maskFences(sliceLines, fences, sliceStartLine) {
  const out = sliceLines.slice();
  for (const f of fences) {
    const rel = f.line - sliceStartLine;
    const n = f.body.split("\n").length;
    for (let k = 0; k < n && rel + k < out.length; k++) out[rel + k] = "";
  }
  return out;
}

/** Shape a @cucumber/gherkin parse failure into [{ line, message }] rows. */
export function shapeParseErrors(e) {
  const items = Array.isArray(e.errors) && e.errors.length ? e.errors : [{ location: { line: 1 }, message: String(e.message).split("\n")[0] }];
  return items.map((it) => ({ line: Math.max(1, it.location?.line ?? 1), message: `invalid gherkin: ${it.message.split("\n")[0]}` }));
}

const ENGLISH_STEPS = new Set(["given", "when", "then", "and", "but"]);

/**
 * Check one fence body: a complete Gherkin document whose Feature echoes the
 * requirement heading. `parse` takes the body, returns the AST, or throws a
 * @cucumber/gherkin-shaped error. Returns { name, scenarios: [{ name, pin,
 * line, text }], errors: [{ line, message }] } — `line` values are 1-based
 * within the body; callers add the fence's absolute offset. Parse validity,
 * the cdd subset, and the strict comment law are machine law here;
 * declarative phrasing is door-1 judgment.
 */
export function checkFenceBody(body, parse) {
  const errors = [];
  let doc;
  try {
    doc = parse(body);
  } catch (e) {
    errors.push(...shapeParseErrors(e));
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
  // "# Verified by: <path>" pin. Anything else can silently
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

//
// Chapter: the spec model — one parse of a spec file, living or delta:
// requirements are REQ_HEADER heading lines, delta operations live under
// `## ADDED|MODIFIED|REMOVED Requirements` headings, pins are the one
// dialect inside gherkin fences, Code lines are glob claims. The model never
// touches the filesystem: resolving a pin, matching a file, and shaping
// requirement text for the store are door work.
//

/** A delta operation heading: `## ADDED|MODIFIED|REMOVED Requirements`. */
export const OP_HEADER = /^## (ADDED|MODIFIED|REMOVED) Requirements\s*$/;

/** A requirement heading line; the capture group is the requirement's name. */
export const REQ_HEADER = /^### Requirement: (.+)$/;

const PIN_SCAN = new RegExp(PIN_COMMENT.source, "gm");

/** Split one Code-line capture into its glob claims, backticks stripped. */
const splitGlobs = (line) => line.split(/[,\s]+/).filter(Boolean).map((g) => g.replace(/`/g, ""));

/**
 * Keep only gherkin-fence interiors (the closing marker stays): everything
 * else is markdown, and markdown cannot pose as a pin.
 */
function maskToGherkinInteriors(lines) {
  let inFence = false;
  return lines.map((line) => {
    if (!inFence && OPEN_FENCE.test(line)) {
      inFence = true;
      return "";
    }
    if (inFence) {
      if (CLOSE_FENCE.test(line)) inFence = false;
      return line;
    }
    return "";
  });
}

/**
 * Parse a spec file once into its parts:
 *
 * - `ops` — delta-semantics operation blocks: an `## ADDED|MODIFIED|REMOVED
 *   Requirements` heading sets the operation; each REQ_HEADER line under
 *   it opens a block that ends at the next `##` heading or
 *   EOF. `[{ op, requirement, startLine, block, codeGlobs }]`.
 * - `requirements` — living-semantics blocks: every REQ_HEADER line opens one; any other `##` heading or EOF ends it. Same shape
 *   minus `op`.
 * - `pins` — the pin paths found by the one dialect inside gherkin fences.
 * - `codeGlobs` — every Code-line glob claim in the file, compiled with the
 *   shared matcher: `[{ glob, re }]`.
 * - `fences` — extractFences(text).
 *
 * Blocks carry their heading line as `block[0]`; the store adapters shape
 * `text` from the block. `startLine` is 1-based. Per-block `codeGlobs` are
 * the glob strings; the file-level list is the compiled claims.
 */
export function parseSpecModel(text) {
  const lines = String(text).split("\n");

  const requirements = [];
  const ops = [];
  let op = null;
  let living = null;
  let deltaBlock = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opMark = line.match(OP_HEADER);
    if (opMark) {
      if (deltaBlock) ops.push(deltaBlock);
      deltaBlock = null;
      op = opMark[1];
      if (living) {
        requirements.push(living);
        living = null;
      }
      continue;
    }
    const r = line.match(REQ_HEADER);
    if (r) {
      if (living) requirements.push(living);
      living = { requirement: r[1].trim(), block: [line], startLine: i + 1 };
      if (op) {
        if (deltaBlock) ops.push(deltaBlock);
        deltaBlock = { op, requirement: r[1].trim(), block: [line], startLine: i + 1 };
      }
      continue;
    }
    if (/^## /.test(line) && !/^### /.test(line)) {
      if (living) {
        requirements.push(living);
        living = null;
      }
      if (deltaBlock) ops.push(deltaBlock);
      deltaBlock = null; // `op` survives a section end — delta semantics
      continue;
    }
    if (living) living.block.push(line);
    if (deltaBlock) deltaBlock.block.push(line);
  }
  if (living) requirements.push(living);
  if (deltaBlock) ops.push(deltaBlock);

  for (const e of [...requirements, ...ops]) {
    e.codeGlobs = [...e.block.join("\n").matchAll(CODE_LINE)].flatMap((m) => splitGlobs(m[1]));
  }

  const fenceText = maskToGherkinInteriors(lines).join("\n");
  return {
    ops,
    requirements,
    pins: [...fenceText.matchAll(PIN_SCAN)].map((m) => m[1]),
    codeGlobs: [...String(text).matchAll(CODE_LINE)]
      .flatMap((m) => splitGlobs(m[1]))
      .map((glob) => ({ glob, re: globToRe(glob) })),
    fences: extractFences(text),
  };
}

//
// Chapter: decision frontmatter — the strict dialect for decision records.
// status and code live in the --- block, nowhere else; a key outside the
// block is not a decision header.

export const ADR_STATUSES = ["accepted", "superseded", "draft", "proposed"];

/**
 * Parse the --- frontmatter block of a decision file: { header, status }.
 * `status` falls back to defaultStatus when the block is missing or silent —
 * the caller decides what silence means ('accepted' for the guard's
 * lifecycle checks, 'unknown' for report-only extractors).
 */
export function parseDecisionFrontmatter(text, defaultStatus = "accepted") {
  const fm = String(text).match(/^---\n([\s\S]*?)\n---/);
  const header = {};
  for (const line of (fm ? fm[1] : "").split("\n")) {
    const kv = line.match(/^([\w-]+):\s*(.+)$/);
    if (kv) header[kv[1]] = kv[2].trim();
  }
  return { header, status: (header.status ?? defaultStatus).toLowerCase() };
}
