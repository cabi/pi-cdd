// validate.mjs — the artifact-shape validator (door 1's mirror in the tool).
// Red/green only; the model reads a verdict, it never negotiates one (ADR-0002).
// Grammar matches the guard exactly: pinRe / codeRe are copied semantics.

import * as fs from "node:fs";
import * as path from "node:path";
import { storeDir, listChanges, parseDelta, parseLivingSpec } from "./store.mjs";

const pinRe = /Verified by[*:]*\s*`?([^\s`]+)`?/;
const SPLIT_LIMIT = 8; // implementation subtasks (design-gate signal, rule 6)

const err = (errors, msg) => errors.push(msg);

function validateProposal(text, name, errors) {
  if (!/^## Why/m.test(text)) err(errors, `${name}/proposal.md: missing "## Why" section`);
  if (!/^## What Changes/m.test(text)) err(errors, `${name}/proposal.md: missing "## What Changes" section`);
  if (!/^Done-When:\s*\S/m.test(text)) err(errors, `${name}/proposal.md: missing "Done-When:" line`);
  if (!/^\s*(?:-\s+)?Code:\s*\S/m.test(text)) err(errors, `${name}/proposal.md: missing "Code: <globs>" line`);
  if (/^Done-When:\s*</m.test(text) || /^- <What the system/m.test(text) || /<One paragraph/.test(text)) {
    err(errors, `${name}/proposal.md: template placeholders still unfilled`);
  }
}

function checkScenarios(root, name, cap, e, mode, errors) {
  const parts = e.text.split(/^#### Scenario: /m).slice(1);
  if (parts.length === 0) {
    err(errors, `${name}/specs/${cap}/spec.md: requirement "${e.requirement}" has no "#### Scenario:"`);
    return;
  }
  for (const part of parts) {
    const slice = part.split(/\n(?=#### |### |## )/)[0];
    const sname = slice.split("\n")[0].trim();
    if (!pinRe.test(slice)) {
      err(errors, `${name}/specs/${cap}/spec.md: scenario "${sname}" does not end with a "Verified by: <path>" pin`);
    } else if (mode === "strict") {
      const pin = slice.match(pinRe)[1];
      if (!fs.existsSync(path.join(root, pin))) {
        err(errors, `${name}/specs/${cap}/spec.md: scenario "${sname}" pins "${pin}" but that file does not exist`);
      }
    }
  }
  if (/<scenario>/.test(e.text) || /<name>/.test(e.text)) {
    err(errors, `${name}/specs/${cap}/spec.md: template placeholders still unfilled`);
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
    if (e.op !== "REMOVED") checkScenarios(root, name, cap, e, mode, errors);
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

function validateTasks(text, name, errors, warnings) {
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
  }
  if (items.length > SPLIT_LIMIT && !/split-considered:/i.test(text)) {
    warnings.push(`${name}/tasks.md: ${items.length} implementation subtasks (> ${SPLIT_LIMIT}) — split signal: design-gate decision needed, or record "split-considered:"`);
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
  else validateTasks(fs.readFileSync(tasksPath, "utf8"), name, errors, warnings);
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
    return { ok: false, errors: ["no cdd store (cdd/rules.md missing) — run cdd_init first"], warnings };
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
