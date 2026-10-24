// store.mjs — the cdd/ tree: scaffold, list, create, archive.
// Plain fs writes only: the store outlives the tool. The one non-fs act
// is a read-only guard subprocess for the pre-existing-red verdict
// (green-start-warning): it reports, it never writes the store.

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  RULES_MD,
  PRE_COMMIT,
  COMMIT_MSG,
  CI_GITHUB,
  CI_GITLAB,
  proposalTemplate,
  deltaTemplate,
  tasksTemplate,
  writeDoorScripts,
} from "./templates.mjs";
import { REQ_HEADER, parseSpecModel, splitTaskSections, TASK_ITEM, ISSUE_LINE } from "../scripts/grammar-law.mjs";

export { REQ_HEADER };
import { validateChange } from "./validate.mjs";
import { deriveStamp } from "./metrics.mjs";

export const storeDir = (root) => path.join(root, "cdd");
export const hasStore = (root) => fs.existsSync(path.join(storeDir(root), "rules.md"));

/**
 * Scaffold the store. opts: { ci: "github"|"gitlab"|"both"|"none", hooks: bool }
 * Door scripts are copied from the extension tree (extDir = this repo's root).
 */
export function initStore(root, extDir, opts = {}) {
  const { ci = "both", hooks = true } = opts;
  if (hasStore(root)) {
    // An existing store keeps its contract (rules, specs, changes, records);
    // only the door scripts refresh — they carry the law, and a refresh
    // must never silently drop a guard.
    const refreshed = writeDoorScripts(root, extDir);
    const written = [];
    if (hooks) {
      for (const [name, body] of [
        ["pre-commit", PRE_COMMIT],
        ["commit-msg", COMMIT_MSG],
      ]) {
        const hookPath = path.join(root, ".githooks", name);
        if (!fs.existsSync(hookPath)) {
          fs.mkdirSync(path.join(root, ".githooks"), { recursive: true });
          fs.writeFileSync(hookPath, body, { mode: 0o755 });
          written.push(`.githooks/${name}`);
        }
      }
    }
    return { ok: true, refreshed, written };
  }

  const dirs = ["changes", "specs", "decisions"];
  for (const d of dirs) fs.mkdirSync(path.join(storeDir(root), d), { recursive: true });
  fs.writeFileSync(path.join(storeDir(root), "rules.md"), RULES_MD);
  for (const d of dirs) fs.writeFileSync(path.join(storeDir(root), d, ".gitkeep"), "");

  fs.mkdirSync(path.join(root, "tests", "acceptance"), { recursive: true });

  writeDoorScripts(root, extDir);

  if (hooks) {
    fs.mkdirSync(path.join(root, ".githooks"), { recursive: true });
    fs.writeFileSync(path.join(root, ".githooks", "pre-commit"), PRE_COMMIT, { mode: 0o755 });
    fs.writeFileSync(path.join(root, ".githooks", "commit-msg"), COMMIT_MSG, { mode: 0o755 });
  }
  if (ci === "github" || ci === "both") {
    fs.mkdirSync(path.join(root, ".github", "workflows"), { recursive: true });
    fs.writeFileSync(path.join(root, ".github", "workflows", "cdd.yml"), CI_GITHUB);
  }
  if (ci === "gitlab" || ci === "both") {
    fs.writeFileSync(path.join(root, ".gitlab-ci.yml"), CI_GITLAB);
  }
  return { ok: true, written: ["cdd/rules.md", "cdd/scripts/*", ...(hooks ? [".githooks/pre-commit", ".githooks/commit-msg"] : [])] };
}

export function listChanges(root) {
  const dir = path.join(storeDir(root), "changes");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

/** Archived changes, newest first: [{ name, date }] from the archive's <yyyymmdd>-<name>/ folders. */
export function listArchived(root) {
  const dir = path.join(storeDir(root), "archive");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((n) => /^\d{8}-.+/.test(n))
    .sort()
    .reverse()
    .map((n) => ({ date: n.slice(0, 8), name: n.slice(9) }));
}

export function listCapabilities(root) {
  const dir = path.join(storeDir(root), "specs");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

/** Scaffold one change folder with its three artifacts. */
/**
 * The store's door 3 verdict at scaffold time, captured before the scaffold
 * lands (the new change must not pollute its own starting verdict): the
 * guard's stderr issue lines verbatim when red, [] when green, a single
 * could-not-complete entry when it aborted (issue-less non-zero exit), a
 * single could-not-run entry when it never started. A warning, never a gate.
 */
function preExistingRed(root) {
  const script = path.join(storeDir(root), "scripts", "spec-drift.mjs");
  if (!fs.existsSync(script)) return [`guard could not run: ${path.relative(root, script)} not found — run cdd init to refresh the door scripts`];
  let stderr = "";
  let status = 0;
  try {
    execFileSync("node", [script], { cwd: root, encoding: "utf8", stdio: ["ignore", "ignore", "pipe"], timeout: 60_000 });
  } catch (e) {
    status = e.status ?? null;
    stderr = typeof e.stderr === "string" ? e.stderr : "";
    if (status === null) return [`guard could not run: ${e.message}`]; // no node, timeout, spawn failure
  }
  if (status === 0) return [];
  const issueLines = stderr.split("\n").filter((l) => ISSUE_LINE.test(l));
  if (issueLines.length) return issueLines;
  const abort = stderr.split("\n").filter(Boolean).join(" ");
  return [`guard could not complete: ${abort || `exit ${status} with no output`}`];
}

export function createChange(root, name, capabilities) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    return { ok: false, error: `change name must be kebab-case: "${name}"` };
  }
  const caps = capabilities?.length ? capabilities : [name.split("-")[0]];
  const changeDir = path.join(storeDir(root), "changes", name);
  if (fs.existsSync(changeDir)) return { ok: false, error: `change "${name}" already exists` };

  const preexistingRed = preExistingRed(root);

  fs.mkdirSync(path.join(changeDir, "specs"), { recursive: true });
  fs.writeFileSync(path.join(changeDir, "proposal.md"), proposalTemplate(name));
  for (const c of caps) {
    const capDir = path.join(changeDir, "specs", c);
    fs.mkdirSync(capDir, { recursive: true });
    fs.writeFileSync(path.join(capDir, "spec.md"), deltaTemplate(c));
  }
  fs.writeFileSync(path.join(changeDir, "tasks.md"), tasksTemplate(name));
  return { ok: true, change: name, capabilities: caps, files: ["proposal.md", "tasks.md", ...caps.map((c) => `specs/${c}/spec.md`)], preexistingRed };
}

// --- delta parsing (shared with validate.mjs semantics) ------------------------


/** Split a delta into [{op, requirement, block}] where block includes the header. */
export function parseDelta(text) {
  // The block grammar is the law module's; the store keeps only the shaping
  // that archiveChange and validate.mjs consume ({op, requirement, block,
  // startLine, text} per operation).
  return parseSpecModel(text).ops.map((o) => ({
    op: o.op,
    requirement: o.requirement,
    block: o.block,
    startLine: o.startLine,
    text: o.block.join("\n").trimEnd() + "\n",
  }));
}

/** Parse a living spec into requirement blocks. */
export function parseLivingSpec(text) {
  // Same law module parse, living semantics (every requirement heading
  // starts a block; a `## ` heading ends it).
  return parseSpecModel(text).requirements.map((r) => ({
    requirement: r.requirement,
    block: r.block,
    startLine: r.startLine,
    text: r.block.join("\n").trimEnd() + "\n",
  }));
}

// --- tasks parsing ---------------------------------------------------------------

/**
 * Parse tasks.md into its skeleton sections. Returns { sections, close,
 * implementation, itemsBeforeClose } — close is the `## 4. Close` section (or
 * null); itemsBeforeClose lists every checkbox item above it, numbered or not.
 */
export function parseTasks(text) {
  const sections = splitTaskSections(text);
  const close = sections.find((s) => s.num === 4) ?? null;
  const before = close ? text.slice(0, close.startIndex) : text;
  return {
    sections,
    close,
    implementation: sections.find((s) => s.num === 3) ?? null,
    itemsBeforeClose: before
      .split("\n")
      .map((l) => l.match(TASK_ITEM))
      .filter(Boolean)
      .map((m) => ({ box: m[1], text: m[2] })),
  };
}

/**
 * Merge a change's deltas into the living specs and move the folder to
 * the dated archive folder. The strict validation lives here: a red or missing
 * change refuses with { ok: false, stage: "strict-validation", validation }
 * and nothing moves — callers only render the verdict (one pass, one close).
 */
export function archiveChange(root, name) {
  const changeDir = path.join(storeDir(root), "changes", name);

  const strict = validateChange(root, name, "strict");
  if (!strict.ok) return { ok: false, stage: "strict-validation", validation: strict };

  const merged = [];
  const specsDir = path.join(changeDir, "specs");
  for (const cap of fs.readdirSync(specsDir, { withFileTypes: true }).filter((e) => e.isDirectory())) {
    const deltaPath = path.join(specsDir, cap.name, "spec.md");
    const delta = fs.readFileSync(deltaPath, "utf8");
    const entries = parseDelta(delta);
    const livingPath = path.join(storeDir(root), "specs", cap.name, "spec.md");
    let livingText = fs.existsSync(livingPath)
      ? fs.readFileSync(livingPath, "utf8")
      : `# ${cap.name} — living spec\n\n## Purpose\n\n<One paragraph: what this capability promises.>\n\n## Requirements\n`;
    const living = parseLivingSpec(livingText);

    for (const e of entries) {
      const idx = living.findIndex((l) => l.requirement === e.requirement);
      if (e.op === "ADDED") {
        if (idx >= 0) return { ok: false, error: `ADDED "${e.requirement}" already exists in ${cap.name} — use MODIFIED` };
        living.push(e);
      } else if (e.op === "MODIFIED") {
        if (idx < 0) return { ok: false, error: `MODIFIED "${e.requirement}" not in living spec ${cap.name}` };
        living[idx] = e;
      } else if (e.op === "REMOVED") {
        if (idx < 0) return { ok: false, error: `REMOVED "${e.requirement}" not in living spec ${cap.name}` };
        living.splice(idx, 1);
      }
      merged.push(`${e.op} ${cap.name} :: ${e.requirement}`);
    }

    const body = living.map((l) => l.text).join("\n");
    fs.mkdirSync(path.dirname(livingPath), { recursive: true });
    fs.writeFileSync(livingPath, `# ${cap.name} — living spec\n\n## Requirements\n\n${body}`);
  }

  // Tick the Close-section boxes here: archive is reached only with them
  // true, so frozen history never lies about its own last step.
  let autoTicked = 0;
  const tasksPath = path.join(changeDir, "tasks.md");
  if (fs.existsSync(tasksPath)) {
    const raw = fs.readFileSync(tasksPath, "utf8");
    const { close } = parseTasks(raw);
    if (close) {
      const ticked = raw.slice(close.startIndex).replace(/^- \[ \]/gm, () => {
        autoTicked++;
        return "- [x]";
      });
      fs.writeFileSync(tasksPath, raw.slice(0, close.startIndex) + ticked);
    }
  }

  // Derive and write metrics.md between the Close auto-tick and the rename:
  // a stamp failure never gates the archive; the result reports the outcome.
  let metrics = { stamped: false, reason: "stamp not attempted" };
  try {
    const git = (args) => {
      try {
        return execFileSync("git", args, { cwd: root, encoding: "utf8" });
      } catch {
        return null;
      }
    };
    const derived = deriveStamp(changeDir, { git });
    fs.writeFileSync(path.join(changeDir, "metrics.md"), derived.text);
    metrics = { stamped: true };
  } catch (e) {
    metrics = { stamped: false, reason: e && e.message ? String(e.message) : String(e) };
  }

  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const archiveDir = path.join(storeDir(root), "archive", `${stamp}-${name}`);
  fs.mkdirSync(path.dirname(archiveDir), { recursive: true });
  fs.renameSync(changeDir, archiveDir);
  return { ok: true, merged, autoTicked, metrics, archivedTo: `cdd/archive/${stamp}-${name}/` };
}
