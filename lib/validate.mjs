// validate.mjs — the artifact-shape validator (door 1's mirror in the tool).
// Red/green only; the model reads a verdict, it never negotiates one (ADR-0002).
// Grammar matches the guard exactly: pinRe / codeRe are copied semantics.

import * as fs from "node:fs";
import * as path from "node:path";
import { storeDir, listChanges, parseDelta, parseLivingSpec } from "./store.mjs";
import { extractFences, checkFence } from "./gherkin.mjs";

const pinRe = /Verified by[*:]*\s*`?([^\s`]+)`?/;
const SPLIT_LIMIT = 8; // implementation subtasks (design-gate signal, rule 6)

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

/** Check one scenario slice: fence presence, parse validity, cdd subset, pin. */
function checkOneScenario(root, file, heading, sliceLines, sliceStartLine, mode, errors, warnings) {
  const sliceText = sliceLines.join("\n");
  const fences = extractFences(sliceText, sliceStartLine);

  // Pin law: inside the fence is markdown pollution; outside is the only home.
  if (fences.length >= 1 && /^Verified by:/m.test(fences[0].body)) {
    err(errors, `${file}: scenario "${heading}": the Verified by pin must stay markdown outside the fence`);
    return;
  }
  const outside = maskFences(sliceLines, fences, sliceStartLine).join("\n");
  if (!pinRe.test(outside)) {
    err(errors, `${file}: scenario "${heading}" does not end with a "Verified by: <path>" pin`);
  } else if (mode === "strict") {
    const pin = outside.match(pinRe)[1];
    if (!fs.existsSync(path.join(root, pin))) {
      err(errors, `${file}: scenario "${heading}" pins "${pin}" but that file does not exist`);
    }
  }

  if (fences.length === 0) {
    err(errors, `${file}: scenario "${heading}" has no fenced gherkin block — wrap the scenario body in a \`\`\`gherkin fence`);
    return;
  }
  if (fences.length > 1) {
    err(errors, `${file}: scenario "${heading}" holds ${fences.length} gherkin fences — exactly one`);
  }
  const f = fences[0];
  if (!f.closed) err(errors, `${file}: scenario "${heading}" line ${f.line}: unterminated gherkin fence`);

  const { name, errors: fenceErrs } = checkFence(f.body);
  if (name != null && name !== heading) {
    err(errors, `${file}: scenario "${heading}": fence scenario name "${name}" must equal the heading`);
  }
  for (const fe of fenceErrs) {
    err(errors, `${file}: scenario "${heading}" line ${f.line + fe.line - 1}: ${fe.message}`);
  }

  // C2 anti-ambiguity rule: comparatives without a number/unit warn
  const vague = sliceText.match(/\b(fast|slow|large|small|quick|user-friendly|efficient|regularly|bi-?weekly|several)\b/i);
  if (vague && !/\d/.test(sliceText)) {
    warnings.push(`${file}: scenario "${heading}" says "${vague[0]}" with no number/unit — quantify it (C2 rule)`);
  }
  // strictness-dial rule (run-6 lesson): an unqualified count is ambiguous
  // between a floor ("at least N") and drift detection ("exactly N")
  const count = sliceText.match(/\b(?:contains|shows|lists|displays)\s+(?!(?:exactly|at least|at most|no more than|up to|mindestens|genau)\s)(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/i);
  if (count) {
    warnings.push(`${file}: scenario "${heading}" counts with "${count[0]}" but no exactness qualifier — "contains exactly N" detects drift, "at least N" sets a floor; choose deliberately`);
  }
}

function checkScenarios(root, name, cap, e, mode, errors, warnings = []) {
  const file = `${name}/specs/${cap}/spec.md`;
  const lines = e.block; // block[0] is the "### Requirement:" line
  const base = e.startLine ?? 1;
  const seen = new Set();
  let found = 0;
  let i = 0;
  while (i < lines.length) {
    if (/^#### Scenario: /.test(lines[i])) {
      const heading = lines[i].replace(/^#### Scenario: /, "").trim();
      if (seen.has(heading)) err(errors, `${file}: scenario name "${heading}" must be unique within the requirement`);
      seen.add(heading);
      const sliceStart = i;
      i++;
      while (i < lines.length && !/^(#### |### |## )/.test(lines[i])) i++;
      found++;
      checkOneScenario(root, file, heading, lines.slice(sliceStart, i), base + sliceStart, mode, errors, warnings);
    } else {
      i++;
    }
  }
  if (found === 0) {
    err(errors, `${file}: requirement "${e.requirement}" has no "#### Scenario:"`);
  }
  if (/<scenario>/.test(e.text) || /<name>/.test(e.text)) {
    err(errors, `${file}: template placeholders still unfilled`);
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
    if (e.op !== "REMOVED") checkScenarios(root, name, cap, e, mode, errors, warnings);
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
  if (!/^## 1\. Context/m.test(text) || !/^## 3\. Implementation/m.test(text) || !/^## 4\. Close/m.test(text)) {
    err(errors, `${name}/tasks.md: missing the four-step skeleton (1 Context / 2 Design / 3 Implementation / 4 Close)`);
  }
  const impl = text.split(/^## 3\. Implementation/m)[1]?.split(/^## /m)[0] ?? "";
  const items = [...impl.matchAll(/^- \[([ x])\] (\d+\.\d+ .+)$/gm)];
  if (items.length === 0) {
    err(errors, `${name}/tasks.md: no implementation subtasks ("- [ ] 3.1 …")`);
  }
  for (const [, box, item] of items) {
    if (!/verify by \S+/.test(item)) {
      err(errors, `${name}/tasks.md: implementation task "${item.slice(0, 50)}…" carries no "verify by <test>"`);
    }
    if (/<task>|<pin>/.test(item)) {
      err(errors, `${name}/tasks.md: template placeholders still unfilled`);
    }
  }
  if (items.length > SPLIT_LIMIT && !/split-considered:/i.test(text)) {
    warnings.push(`${name}/tasks.md: ${items.length} implementation subtasks (> ${SPLIT_LIMIT}) — split signal: design-gate decision needed, or record "split-considered:"`);
  }
  if (mode === "strict" && items.length > 12 && !/split-considered:/i.test(text)) {
    err(errors, `${name}/tasks.md: ${items.length} implementation subtasks (> 12) — split the change or record "split-considered:"`);
  }
  if (!/^## Done When Traceability/m.test(text)) {
    err(errors, `${name}/tasks.md: missing "## Done When Traceability" section (criterion → task ids)`);
  }
  // strict = ready to archive: all work outside the Close section must be done.
  // Close-section boxes are self-referential (they ARE the archive) — the
  // archive act ticks them itself.
  if (mode === "strict") {
    const beforeClose = text.split(/^## 4\. Close/m)[0];
    for (const [, box, item] of [...beforeClose.matchAll(/^- \[([ x])\] (.+)$/gm)]) {
      if (box !== "x") {
        err(errors, `${name}/tasks.md: unchecked task "${item.slice(0, 50)}…" — finish it before archiving (Close-section boxes are auto-ticked by the archive)`);
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
