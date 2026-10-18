/**
 * pi-cdd — contract-driven development as a pi extension.
 *
 * The factory (openspec-cdd) used the OpenSpec CLI as the door-1
 * counterparty. Here the harness itself is the counterparty (ADR-0002):
 * ambient context carries the method, deterministic tools return
 * verdicts, and doors 2/3 are the standalone zero-dependency scripts
 * that /cdd-init copies into the adopting project.
 *
 * Load:  pi --extension <this repo>
 * Dev:   pi --extension ~/Projects/pi-cdd
 */

import { fileURLToPath } from "node:url";
import * as path from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { initStore, createChange, archiveChange } from "./lib/store.mjs";
import { validateChange, validateStore, formatVerdict } from "./lib/validate.mjs";
import { buildAmbientBlock } from "./lib/context.mjs";
import { status, statusTable } from "./lib/status.mjs";
import { helpText, renderHelp } from "./lib/help.mjs";

const EXT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

const json = (v) => JSON.stringify(v, null, 2);
const result = (text, data) => ({
  content: [{ type: "text", text }],
  details: data,
});

// plain JSON-schema parameters — no typebox import, zero resolution risk
const nameParam = { type: "string", description: "change name, kebab-case" };
const capsParam = {
  type: "array",
  items: { type: "string" },
  description: "capabilities the change touches (defaults to the first word of the name)",
};

export default function cddExtension(pi: ExtensionAPI) {
  // ---- door 1 mirror: commands for the human --------------------------------

  pi.registerCommand("cdd-init", {
    description: "Scaffold the cdd store (cdd/, door scripts, hooks, CI) in this project",
    handler: async (args: string, ctx) => {
      const r = initStore(ctx.cwd, EXT_DIR, { ci: "both", hooks: true });
      const text = r.ok
        ? `cdd store initialized.\n${json(r)}\nNext: git config core.hooksPath .githooks && start a change with /cdd-new <name>`
        : json(r);
      if (ctx.hasUI) ctx.ui.notify(r.ok ? "cdd store initialized" : `cdd-init failed: ${r.error}`, r.ok ? "info" : "error");
      else console.log(text);
    },
  });

  pi.registerCommand("cdd-new", {
    description: "Scaffold a change folder: /cdd-new <name> [capability...]",
    handler: async (args: string, ctx) => {
      const [name, ...caps] = args.trim().split(/\s+/).filter(Boolean);
      if (!name) {
        const t = "usage: /cdd-new <name> [capability...]";
        if (ctx.hasUI) ctx.ui.notify(t, "error");
        else console.log(t);
        return;
      }
      const r = createChange(ctx.cwd, name, caps);
      const text = r.ok ? `change scaffolded.\n${json(r)}\nFill proposal.md, specs/*/spec.md, tasks.md — then cdd_validate.` : json(r);
      if (ctx.hasUI) ctx.ui.notify(r.ok ? `change ${name} scaffolded` : `cdd-new failed: ${r.error}`, r.ok ? "info" : "error");
      else console.log(text);
    },
  });

  pi.registerCommand("cdd-status", {
    description: "All changes — open with progress/verdicts/next step, plus archived — as a table",
    handler: async (_args: string, ctx) => {
      console.log(statusTable(status(ctx.cwd)));
    },
  });

  pi.registerCommand("cdd-help", {
    description: "How to drive the cdd loop — your prompts, the gates, the commands",
    handler: async (_args: string, ctx) => {
      // themed rendering with the session's own theme (accent/success/muted tokens)
      const themed = ctx.hasUI && ctx.ui?.theme ? renderHelp(ctx.ui.theme) : helpText();
      if (ctx.hasUI) ctx.ui.notify(themed, "info");
      else console.log(themed);
    },
  });

  pi.registerCommand("cdd-archive", {
    description: "Validate strict, merge deltas into living specs, move to archive: /cdd-archive <name>",
    handler: async (args: string, ctx) => {
      const name = args.trim();
      if (!name) {
        console.log("usage: /cdd-archive <name>");
        return;
      }
      const v = validateChange(ctx.cwd, name, "strict");
      if (!v.ok) {
        console.log(`archive refused — strict validation failed:\n${formatVerdict(v)}`);
        if (ctx.hasUI) ctx.ui.notify("archive refused: strict validation failed", "error");
        return;
      }
      const r = archiveChange(ctx.cwd, name);
      const text = r.ok
        ? `archived.\n${json(r)}\nPair-commit: feature commit, then this archive commit.`
        : json(r);
      if (ctx.hasUI) ctx.ui.notify(r.ok ? `archived ${name}` : `cdd-archive failed: ${r.error}`, r.ok ? "info" : "error");
      else console.log(text);
    },
  });

  // ---- door 1 mirror: tools for the model (every operation twice, ADR-0005) --

  pi.registerTool({
    name: "cdd_init",
    label: "cdd init",
    description:
      "Scaffold the cdd store in the project root: cdd/rules.md, cdd/scripts (drift guard), .githooks/pre-commit, CI workflows, tests/acceptance/. Run once per project, before any other cdd tool.",
    parameters: {
      type: "object",
      properties: {
        ci: { type: "string", enum: ["github", "gitlab", "both", "none"], description: "CI templates to write (default both)" },
        hooks: { type: "boolean", description: "install .githooks/pre-commit (default true)" },
      },
    },
    async execute(_id, params, _signal, _onUpdate, ctx) {
      const r = initStore(ctx.cwd, EXT_DIR, { ci: params.ci ?? "both", hooks: params.hooks ?? true });
      return result(r.ok ? `cdd store initialized:\n${json(r)}\nTell the user to run: git config core.hooksPath .githooks` : json(r), r);
    },
  });

  pi.registerTool({
    name: "cdd_new_change",
    label: "cdd new change",
    description:
      "Scaffold one change folder cdd/changes/<name>/ with proposal.md, specs/<capability>/spec.md (delta template), tasks.md. Fill the placeholders, then validate with cdd_validate.",
    parameters: {
      type: "object",
      properties: { name: nameParam, capabilities: capsParam },
      required: ["name"],
    },
    async execute(_id, params, _signal, _onUpdate, ctx) {
      const r = createChange(ctx.cwd, params.name, params.capabilities);
      return { ...result(r.ok ? `change scaffolded:\n${json(r)}` : json(r), r), isError: !r.ok };
    },
  });

  pi.registerTool({
    name: "cdd_validate",
    label: "cdd validate",
    description:
      "Validate artifact shape. Draft mode checks structure (placeholders count as red); strict mode additionally requires every Verified-by pin to exist as a file and MODIFIED/REMOVED requirements to live in the spec. Returns PASS or FAIL with exact errors.",
    parameters: {
      type: "object",
      properties: {
        change: { type: "string", description: "change name; omit to validate the whole store" },
        mode: { type: "string", enum: ["draft", "strict"], description: "default draft" },
      },
    },
    async execute(_id, params, _signal, _onUpdate, ctx) {
      const v = params.change
        ? validateChange(ctx.cwd, params.change, params.mode ?? "draft")
        : validateStore(ctx.cwd, params.mode ?? "draft");
      return { ...result(formatVerdict(v), v), isError: !v.ok };
    },
  });

  pi.registerTool({
    name: "cdd_status",
    label: "cdd status",
    description: "Report the store: open changes, capabilities, per-change draft and strict verdicts.",
    parameters: { type: "object", properties: {} },
    async execute(_id, _params, _signal, _onUpdate, ctx) {
      return result(json(status(ctx.cwd)), status(ctx.cwd));
    },
  });

  pi.registerTool({
    name: "cdd_archive",
    label: "cdd archive",
    description:
      "Close a change: strict validation must pass, then deltas merge into the living specs (ADDED appends, MODIFIED replaces, REMOVED deletes) and the folder moves to cdd/archive/<date>-<name>/.",
    parameters: { type: "object", properties: { name: nameParam }, required: ["name"] },
    async execute(_id, params, _signal, _onUpdate, ctx) {
      const v = validateChange(ctx.cwd, params.name, "strict");
      if (!v.ok) {
        return {
          ...result(`archive refused — strict validation failed:\n${formatVerdict(v)}`, { ok: false, validation: v }),
          isError: true,
        };
      }
      const r = archiveChange(ctx.cwd, params.name);
      return { ...result(r.ok ? `archived:\n${json(r)}\nPair-commit: feature commit, then this archive commit.` : json(r), r), isError: !r.ok };
    },
  });

  // ---- ambient context (ADR-0004) -------------------------------------------

  pi.on("before_agent_start", async (event) => {
    const block = buildAmbientBlock(process.cwd());
    if (!block) return;
    return { systemPrompt: event.systemPrompt + block };
  });
}

