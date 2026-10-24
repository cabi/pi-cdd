// validate.mjs — the artifact-shape validator (door 1's mirror in the tool).
// Red/green only; the model reads a verdict, it never negotiates one.
// The fence and tasks grammar come from ../scripts/grammar-law.mjs — one law
// behind every door; this module is the shape the verdicts travel in.
// One evaluation can answer both dials: strict-only checks tag their errors, and
// validateBoth projects the same run into draft and strict verdicts.

import * as fs from "node:fs";
import * as path from "node:path";
import { storeDir, listChanges, parseDelta, parseLivingSpec, parseTasks } from "./store.mjs";
import { maskFences, PLACEHOLDER_PIN, TASK_LIMIT, SPLIT_SIGNAL } from "../scripts/grammar-law.mjs";
import { extractFences, checkFence } from "./gherkin.mjs";
import { pathToFileURL } from "node:url";

// Refuse silent direct execution: run as a command, this module prints
// nothing and exits 0. It prints one stderr line and exits 2 instead.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.error(
    "validate.mjs is a library, not a command — validation runs through the cdd tool's validate operation; the door commands are node cdd/scripts/spec-drift.mjs (guard), spec-extract, and arch-extract"
  );
  process.exit(2);
}


const err = (errors, msg, strictOnly = false) => errors.push({ message: msg, strictOnly });

function validateProposal(text, name, errors) {
  if (!/^## Why/m.test(text)) err(errors, `${name}/proposal.md: missing "## Why" section`);
  if (!/^## What Changes/m.test(text)) err(errors, `${name}/proposal.md: missing "## What Changes" section`);
  if (!/^## Solutions Considered/m.test(text)) err(errors, `${name}/proposal.md: missing "## Solutions Considered" section (reuse-first)`);
  if (!/^## Non-Goals/m.test(text)) err(errors, `${name}/proposal.md: missing "## Non-Goals" section (scope fence)`);
  // masked text feeds the Done-When count and the placeholder pin; sections and Code: read raw text
  const content = maskHtmlComments(text);
  const doneWhen = [...content.matchAll(/^Done-When:\s*\S/gm)];
  if (doneWhen.length === 0) err(errors, `${name}/proposal.md: missing "Done-When:" line`);
  else if (doneWhen.length > 5) err(errors, `${name}/proposal.md: ${doneWhen.length} Done-When criteria (max 5 — split the change)`);
  if (!/^\s*(?:-\s+)?Code:\s*\S/m.test(text)) err(errors, `${name}/proposal.md: missing "Code: <globs>" line`);
  if (/^Done-When:\s*</m.test(content) || /^- <What the system/m.test(content) || /<One paragraph/.test(content) || /solution evaluated|scope fence|spec paths created or modified/.test(content)) {
    err(errors, `${name}/proposal.md: template placeholders still unfilled`);
  }
}


/** Blank inline-code spans so template tokens quoted as examples (`<scenario>` in
 *  backticks) pass the placeholder pin: the pin hunts template placeholders left
 *  to fill, and an author quoting one inside a code span is citing it, not
 *  leaving it unfilled. Whole-span masking over the full block text (fences
 *  included) keeps the rule uniform; scaffold pin-template lines carry no code
 *  span, so they stay flagged. Single-line spans — the grammar has no
 *  multi-line inline code. */
function maskCodeSpans(text) {
  return text.replace(/`[^`\n]*`/g, (m) => " ".repeat(m.length));
}

/** Blank closed comment blocks (space-filled, length-preserving); unclosed
 *  openers stay live text. */
function maskHtmlComments(text) {
  return text.replace(/<!--[\s\S]*?-->/g, (m) => " ".repeat(m.length));
}

/** Check one requirement block: one Feature fence, subset laws, pin comments. */
function checkRequirement(root, file, req, blockLines, base, mode, errors, warnings) {
  const text = blockLines.join("\n");
  if (/^#### Scenario: /m.test(text)) {
    err(errors, `${file}: requirement "${req}": "#### Scenario:" markdown headings are gone (ADR-0006) — scenarios live inside the Feature fence`);
  }
  const fences = extractFences(text, base);
  const outside = maskFences(blockLines, fences, base).join("\n");
  if (/^\s*Verified by[*:]/m.test(outside)) {
    err(errors, `${file}: requirement "${req}": the Verified by pin now lives inside the fence as a "# Verified by:" comment (ADR-0006)`);
  }
  if (fences.length === 0) {
    err(errors, `${file}: requirement "${req}" has no fenced gherkin Feature block — wrap one Feature document in a \`\`\`gherkin fence`);
  }
  if (fences.length > 1) {
    err(errors, `${file}: requirement "${req}" holds ${fences.length} gherkin fences — exactly one Feature document per requirement`);
  }
  const f = fences[0];
  let scenarioTexts = [];
  if (f) {
    if (!f.closed) err(errors, `${file}: requirement "${req}" line ${f.line}: unterminated gherkin fence`);
    const { name, scenarios, errors: fenceErrs } = checkFence(f.body);
    scenarioTexts = scenarios.map((s) => ({ name: s.name, text: s.text ?? "" }));
    if (name != null && name !== req) {
      err(errors, `${file}: requirement "${req}": Feature name "${name}" must equal the requirement heading`);
    }
    const seen = new Set();
    for (const sc of scenarios) {
      if (seen.has(sc.name)) err(errors, `${file}: scenario name "${sc.name}" must be unique within the requirement`);
      seen.add(sc.name);
      if (mode === "strict" && !fs.existsSync(path.join(root, sc.pin))) {
        err(errors, `${file}: scenario "${sc.name}" pins "${sc.pin}" but that file does not exist`, true);
      }
    }
    for (const fe of fenceErrs) {
      err(errors, `${file}: requirement "${req}" line ${f.line + fe.line - 1}: ${fe.message}`);
    }
  }
  if (PLACEHOLDER_PIN.test(maskCodeSpans(text))) {
    err(errors, `${file}: template placeholders still unfilled`);
  }

  // C2 anti-ambiguity rule: comparatives without a number/unit warn
  const vague = text.match(/\b(fast|slow|large|small|quick|user-friendly|efficient|regularly|bi-?weekly|several)\b/i);
  if (vague && !/\d/.test(text)) {
    warnings.push(`${file}: requirement "${req}" says "${vague[0]}" with no number/unit — quantify it (C2 rule)`);
  }
  // An unqualified count is ambiguous between a floor ("at least N") and
  // drift detection ("exactly N"); check each scenario's steps so the
  // warning names the offending scenario
  for (const sc of scenarioTexts) {
    const count = sc.text.match(/\b(?:contains|shows|lists|displays)\s+(?!(?:exactly|at least|at most|no more than|up to|mindestens|genau)\s)(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/i);
    if (count) {
      warnings.push(`${file}: requirement "${req}" scenario "${sc.name}" counts with "${count[0]}" but no exactness qualifier — "contains exactly N" detects drift, "at least N" sets a floor; choose deliberately`);
    }
  }
}

// Spec-size signal thresholds: warn at the signal thresholds, never error
// (escalation is a later decision). Local to this module: no door consumes
// them; a change that puts the signal behind a door moves the constants to
// the shared law module beside the other door-consumed limits.
const SPEC_REQ_SIGNAL = 12; // requirements per living capability spec
const SCENARIO_SIGNAL = 8; // scenarios per requirement

const countScenarios = (lines) => (lines.join("\n").match(/^\s*Scenario:/gm) ?? []).length;

function validateDelta(root, name, cap, text, mode, errors, warnings) {
  const entries = parseDelta(text);
  if (entries.length === 0) {
    err(errors, `${name}/specs/${cap}/spec.md: no "### Requirement:" under an ADDED/MODIFIED/REMOVED section`);
    return;
  }
  // ADDED/MODIFIED carry scenarios with pins; REMOVED entries are name-only
  for (const e of entries) {
    if (e.op !== "REMOVED") checkRequirement(root, `${name}/specs/${cap}/spec.md`, e.requirement, e.block, e.startLine ?? 1, mode, errors, warnings);
    if (e.op === "REMOVED" && !/^\s*Reason:/m.test(e.block.join("\n"))) {
      err(errors, `${name}/specs/${cap}/spec.md: REMOVED "${e.requirement}" carries no "Reason:" line`);
    }
  }
  // The living spec is read in both modes: strict gates ADDED/MODIFIED/REMOVED
  // names against it, and the spec-size signal measures it in draft too.
  const livingPath = path.join(storeDir(root), "specs", cap, "spec.md");
  const livingText = fs.existsSync(livingPath) ? fs.readFileSync(livingPath, "utf8") : "";
  const livingBlocks = parseLivingSpec(livingText);
  const livingNames = new Set(livingBlocks.map((l) => l.requirement));
  if (mode === "strict") {
    for (const e of entries) {
      if (e.op === "ADDED" && livingNames.has(e.requirement)) {
        err(errors, `${name}/specs/${cap}/spec.md: ADDED "${e.requirement}" already lives in the spec — use MODIFIED`, true);
      }
      if ((e.op === "MODIFIED" || e.op === "REMOVED") && !livingNames.has(e.requirement)) {
        err(errors, `${name}/specs/${cap}/spec.md: ${e.op} "${e.requirement}" not in the living spec`, true);
      }
    }
  }
  // Spec-size signal — warnings only, both modes. Tier A existence:
  // one count line and one aggregated fat-requirement line per touched
  // over-threshold spec (never one line per requirement — the warning
  // budget), one line per grown delta block. Tier B growth-act: an ADDED
  // into an over-threshold spec demands a split-considered decision line —
  // one demand per delta, scanned as a substring over the delta's raw text,
  // so a prose mention of the line-kind must be colon-free.
  if (livingBlocks.length >= SPEC_REQ_SIGNAL) {
    warnings.push(`spec-size: living spec "${cap}" holds ${livingBlocks.length} requirements (>= ${SPEC_REQ_SIGNAL}) — split signal: consider splitting the spec`);
  }
  const fat = livingBlocks.filter((l) => countScenarios(l.block) >= SCENARIO_SIGNAL);
  if (fat.length > 0) {
    warnings.push(`spec-size: living spec "${cap}" requirements at or over ${SCENARIO_SIGNAL} scenarios: ${fat.map((l) => l.requirement).join(", ")} — split signal: consider splitting these requirements`);
  }
  for (const e of entries) {
    const blockScenarios = e.op === "REMOVED" ? 0 : countScenarios(e.block);
    if (blockScenarios >= SCENARIO_SIGNAL) {
      warnings.push(`spec-size: delta requirement "${e.requirement}" holds ${blockScenarios} scenarios (>= ${SCENARIO_SIGNAL}) — split signal: consider splitting the requirement`);
    }
  }
  const addedEntries = entries.filter((e) => e.op === "ADDED");
  if (addedEntries.length > 0 && livingBlocks.length >= SPEC_REQ_SIGNAL && !/split-considered:/i.test(text)) {
    const what = addedEntries.length === 1 ? `ADDED "${addedEntries[0].requirement}" grows` : `${addedEntries.length} ADDED requirements grow`;
    warnings.push(`spec-size: ${what} "${cap}" past ${SPEC_REQ_SIGNAL} requirements — record a split-considered decision line in the delta or split the change`);
  }
}

function validateTasks(text, name, mode, errors, warnings) {
  const t = parseTasks(text);
  const skeletonOk = t.sections.length === 4 && t.sections.every((s, i) => s.num === i + 1);
  if (!skeletonOk) {
    err(errors, `${name}/tasks.md: the four-step skeleton (1 Context / 2 Design / 3 Implementation / 4 Close) must appear exactly once, in order`);
  }
  const items = t.implementation?.items ?? [];
  if (items.length === 0) {
    err(errors, `${name}/tasks.md: no implementation subtasks ("- [ ] 3.1 …")`);
  }
  for (const it of items) {
    if (!/verify by \S+/.test(it.text)) {
      err(errors, `${name}/tasks.md: implementation task "${it.text.slice(0, 50)}…" carries no "verify by <test>"`);
    }
    if (/<task>|<pin>/.test(it.text)) {
      err(errors, `${name}/tasks.md: template placeholders still unfilled`);
    }
  }
  if (items.length > SPLIT_SIGNAL && !/split-considered:/i.test(text)) {
    warnings.push(`${name}/tasks.md: ${items.length} implementation subtasks (> ${SPLIT_SIGNAL}) — split signal: design-gate decision needed, or record "split-considered:"`);
  }
  if (mode === "strict" && items.length > TASK_LIMIT && !/split-considered:/i.test(text)) {
    err(errors, `${name}/tasks.md: ${items.length} implementation subtasks (> ${TASK_LIMIT}) — split the change or record "split-considered:"`, true);
  }
  if (!/^## Done When Traceability/m.test(text)) {
    err(errors, `${name}/tasks.md: missing "## Done When Traceability" section (criterion → task ids)`);
  }
  // strict = ready to archive: all work outside the Close section must be done.
  // Close-section boxes are self-referential (they ARE the archive) — the
  // archive act ticks them itself.
  if (mode === "strict") {
    for (const it of t.itemsBeforeClose) {
      if (it.box === " ") {
        err(errors, `${name}/tasks.md: unchecked task "${it.text.slice(0, 50)}…" — finish it before archiving (Close-section boxes are auto-ticked by the archive)`, true);
      }
    }
  }
}

/** Validate one change (or the whole store). mode: "draft" | "strict".
 *  Internally one run collects tagged errors; `project` filters the
 *  strict-only gates out of the draft verdict, so draft ⊆ strict holds by
 *  construction. */
function runValidation(root, name, mode) {
  const errors = [];
  const warnings = [];
  const changeDir = path.join(storeDir(root), "changes", name);
  if (!fs.existsSync(changeDir)) return { errors: [{ message: `change "${name}" not found`, strictOnly: false }], warnings };

  const proposalPath = path.join(changeDir, "proposal.md");
  const tasksPath = path.join(changeDir, "tasks.md");
  const specsDir = path.join(changeDir, "specs");
  if (!fs.existsSync(proposalPath)) err(errors, `${name}/proposal.md: missing`);
  else validateProposal(fs.readFileSync(proposalPath, "utf8"), name, errors);
  if (!fs.existsSync(tasksPath)) err(errors, `${name}/tasks.md: missing`);
  else validateTasks(fs.readFileSync(tasksPath, "utf8"), name, mode, errors, warnings);
  const capDirs = fs.existsSync(specsDir)
    ? fs.readdirSync(specsDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
    : [];
  if (capDirs.length === 0) err(errors, `${name}/specs/<capability>/spec.md: no capability delta`);
  for (const c of capDirs) {
    const p = path.join(specsDir, c, "spec.md");
    if (!fs.existsSync(p)) err(errors, `${name}/specs/${c}/spec.md: missing`);
    else validateDelta(root, name, c, fs.readFileSync(p, "utf8"), mode, errors, warnings);
  }
  return { errors, warnings };
}

const project = (run, mode) => {
  const errors = run.errors.filter((e) => mode === "strict" || !e.strictOnly).map((e) => e.message);
  return { ok: errors.length === 0, errors, warnings: [...run.warnings] };
};

export function validateChange(root, name, mode = "draft") {
  return project(runValidation(root, name, mode), mode);
}

/** One evaluation, both verdicts: the strict run, plus the draft projection
 *  of the same run. draft ⊆ strict holds by construction — `project` filters
 *  the strict-only gates out of the draft verdict — so the pair is consistent
 *  by design; S31 and E2 pin the property from the outside. */
export function validateBoth(root, name) {
  const run = runValidation(root, name, "strict");
  return { draft: project(run, "draft"), strict: project(run, "strict") };
}

export function validateStore(root, mode = "draft") {
  const errors = [];
  const warnings = [];
  if (!fs.existsSync(path.join(storeDir(root), "rules.md"))) {
    return { ok: false, errors: ["no cdd store (cdd/rules.md missing) — run the cdd tool, op init"], warnings };
  }
  const changes = listChanges(root);
  const perChange = {};
  for (const c of changes) {
    const v = validateChange(root, c, mode);
    perChange[c] = v;
    errors.push(...v.errors.map((e) => e));
    warnings.push(...v.warnings);
  }
  return { ok: errors.length === 0, changes, perChange, errors, warnings };
}

export function formatVerdict(v) {
  const lines = [];
  lines.push(v.ok ? "PASS" : "FAIL");
  for (const e of v.errors ?? []) lines.push(`  error: ${e}`);
  for (const w of v.warnings ?? []) lines.push(`  warning: ${w}`);
  return lines.join("\n");
}
