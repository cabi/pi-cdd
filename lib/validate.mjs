// validate.mjs — the artifact-shape validator (door 1's mirror in the tool).
// Red/green only; the model reads a verdict, it never negotiates one (ADR-0002).
// Grammar matches the guard exactly: comment pins / codeRe are copied semantics.

import * as fs from "node:fs";
import * as path from "node:path";
import { storeDir, listChanges, parseDelta, parseLivingSpec, parseTasks } from "./store.mjs";
import { TASK_LIMIT, SPLIT_SIGNAL } from "../scripts/law.mjs";
import { extractFences, checkFence } from "./gherkin.mjs";


const err = (errors, msg) => errors.push(msg);

function validateProposal(text, name, errors) {
  if (!/^## Why/m.test(text)) err(errors, `${name}/proposal.md: missing "## Why" section`);
  if (!/^## What Changes/m.test(text)) err(errors, `${name}/proposal.md: missing "## What Changes" section`);
  if (!/^## Solutions Considered/m.test(text)) err(errors, `${name}/proposal.md: missing "## Solutions Considered" section (reuse-first)`);
  if (!/^## Non-Goals/m.test(text)) err(errors, `${name}/proposal.md: missing "## Non-Goals" section (scope fence)`);
  const doneWhen = [...text.matchAll(/^Done-When:\s*\S/gm)];
  if (doneWhen.length === 0) err(errors, `${name}/proposal.md: missing "Done-When:" line`);
  else if (doneWhen.length > 5) err(errors, `${name}/proposal.md: ${doneWhen.length} Done-When criteria (max 5 — split the change)`);
  if (!/^\s*(?:-\s+)?Code:\s*\S/m.test(text)) err(errors, `${name}/proposal.md: missing "Code: <globs>" line`);
  if (/^Done-When:\s*</m.test(text) || /^- <What the system/m.test(text) || /<One paragraph/.test(text) || /solution evaluated|scope fence/.test(text)) {
    err(errors, `${name}/proposal.md: template placeholders still unfilled`);
  }
}

/** Blank out fence bodies so outside-the-fence checks (the pin) see only markdown. */
function maskFences(sliceLines, fences, sliceStartLine) {
  const out = sliceLines.slice();
  for (const f of fences) {
    const rel = f.line - sliceStartLine;
    const n = f.body.split("\n").length;
    for (let k = 0; k < n && rel + k < out.length; k++) out[rel + k] = "";
  }
  return out;
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
        err(errors, `${file}: scenario "${sc.name}" pins "${sc.pin}" but that file does not exist`);
      }
    }
    for (const fe of fenceErrs) {
      err(errors, `${file}: requirement "${req}" line ${f.line + fe.line - 1}: ${fe.message}`);
    }
  }
  if (/<scenario>/.test(text) || /<name>/.test(text)) {
    err(errors, `${file}: template placeholders still unfilled`);
  }

  // C2 anti-ambiguity rule: comparatives without a number/unit warn
  const vague = text.match(/\b(fast|slow|large|small|quick|user-friendly|efficient|regularly|bi-?weekly|several)\b/i);
  if (vague && !/\d/.test(text)) {
    warnings.push(`${file}: requirement "${req}" says "${vague[0]}" with no number/unit — quantify it (C2 rule)`);
  }
  // strictness-dial rule (run-6 lesson): an unqualified count is ambiguous
  // between a floor ("at least N") and drift detection ("exactly N"); check
  // each scenario's steps so the warning names the offending scenario
  for (const sc of scenarioTexts) {
    const count = sc.text.match(/\b(?:contains|shows|lists|displays)\s+(?!(?:exactly|at least|at most|no more than|up to|mindestens|genau)\s)(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/i);
    if (count) {
      warnings.push(`${file}: requirement "${req}" scenario "${sc.name}" counts with "${count[0]}" but no exactness qualifier — "contains exactly N" detects drift, "at least N" sets a floor; choose deliberately`);
    }
  }
}

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
  if (mode === "strict") {
    const livingPath = path.join(storeDir(root), "specs", cap, "spec.md");
    const livingText = fs.existsSync(livingPath) ? fs.readFileSync(livingPath, "utf8") : "";
    const livingNames = new Set(parseLivingSpec(livingText).map((l) => l.requirement));
    for (const e of entries) {
      if (e.op === "ADDED" && livingNames.has(e.requirement)) {
        err(errors, `${name}/specs/${cap}/spec.md: ADDED "${e.requirement}" already lives in the spec — use MODIFIED`);
      }
      if ((e.op === "MODIFIED" || e.op === "REMOVED") && !livingNames.has(e.requirement)) {
        err(errors, `${name}/specs/${cap}/spec.md: ${e.op} "${e.requirement}" not in the living spec`);
      }
    }
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
    err(errors, `${name}/tasks.md: ${items.length} implementation subtasks (> ${TASK_LIMIT}) — split the change or record "split-considered:"`);
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
        err(errors, `${name}/tasks.md: unchecked task "${it.text.slice(0, 50)}…" — finish it before archiving (Close-section boxes are auto-ticked by the archive)`);
      }
    }
  }
}

/** Validate one change (or the whole store). mode: "draft" | "strict". */
export function validateChange(root, name, mode = "draft") {
  const errors = [];
  const warnings = [];
  const changeDir = path.join(storeDir(root), "changes", name);
  if (!fs.existsSync(changeDir)) return { ok: false, errors: [`change "${name}" not found`], warnings };

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
  return { ok: errors.length === 0, errors, warnings };
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
