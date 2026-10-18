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

// The full per-op documentation, kept exactly as the five original tools
// declared it (only the two stale cross-references were updated). op "help"
// serves this verbatim, so the lean declaration below repeats none of it.
const OPS_DOC = {
  init: {
    was: "cdd_init",
    description:
      "Scaffold the cdd store in the project root: cdd/rules.md, cdd/scripts (drift guard), .githooks/pre-commit + commit-msg, CI workflows, tests/acceptance/. Run once per project, before any other cdd op.",
    parameters: {
      type: "object",
      properties: {
        ci: { type: "string", enum: ["github", "gitlab", "both", "none"], description: "CI templates to write (default both)" },
        hooks: { type: "boolean", description: "install .githooks/pre-commit + commit-msg (default true)" },
      },
    },
  },
  new: {
    was: "cdd_new_change",
    description:
      "Scaffold one change folder cdd/changes/<name>/ with proposal.md, specs/<capability>/spec.md (delta template), tasks.md. Fill the placeholders, then validate with the validate op.",
    parameters: {
      type: "object",
      properties: { name: nameParam, capabilities: capsParam },
      required: ["name"],
    },
  },
  validate: {
    was: "cdd_validate",
    description:
      "Validate artifact shape. Draft mode checks structure (placeholders count as red); strict mode additionally requires every Verified-by pin to exist as a file and MODIFIED/REMOVED requirements to live in the spec. Returns PASS or FAIL with exact errors.",
    parameters: {
      type: "object",
      properties: {
        change: { type: "string", description: "change name; omit to validate the whole store" },
        mode: { type: "string", enum: ["draft", "strict"], description: "default draft" },
      },
    },
  },
  status: {
    was: "cdd_status",
    description: "Report the store: open changes, capabilities, per-change draft and strict verdicts.",
    parameters: { type: "object", properties: {} },
  },
  archive: {
    was: "cdd_archive",
    description:
      "Close a change: strict validation must pass, then deltas merge into the living specs (ADDED appends, MODIFIED replaces, REMOVED deletes) and the folder moves to cdd/archive/<date>-<name>/.",
    parameters: { type: "object", properties: { name: nameParam }, required: ["name"] },
  },
};

// Legacy tool names the model may still use as op (history, older prompts).
const OP_ALIASES: Record<string, string> = {
  cdd_init: "init",
  cdd_new_change: "new",
  cdd_new: "new",
  new_change: "new",
  cdd_validate: "validate",
  cdd_status: "status",
  cdd_archive: "archive",
};

// Fill-ins for call shapes the model sends often. Every rewrite is
// unambiguous: a legacy tool name as op, legacy top-level parameters folded
// into options, an options object instead of its JSON string, a single
// capability string instead of an array. Anything ambiguous is left alone
// and fails validation or execute with a clear error.
function fillArgs(raw: any) {
  if (typeof raw !== "object" || raw === null) return raw;
  const args = { ...raw };
  if (typeof args.op === "string" && OP_ALIASES[args.op]) args.op = OP_ALIASES[args.op];
  if (args.change !== undefined && args.name === undefined) args.name = args.change;
  delete args.change;
  let opts: any = args.options;
  if (typeof opts === "string") {
    if (opts.trim() === "") opts = {};
    else {
      try {
        opts = JSON.parse(opts);
      } catch {
        /* not fixable — execute reports the parse error */
      }
    }
  }
  if (opts === undefined || opts === null) opts = {};
  if (typeof opts !== "object" || Array.isArray(opts)) return args;
  for (const k of ["ci", "hooks", "capabilities", "mode"]) {
    if (args[k] !== undefined && opts[k] === undefined) opts[k] = args[k];
    delete args[k];
  }
  if (typeof opts.capabilities === "string") opts.capabilities = [opts.capabilities];
  args.options = JSON.stringify(opts);
  return args;
}

type OptParse = { ok: true; value: Record<string, any> } | { ok: false; error: string };
type NamePick = { ok: true; value: any } | { ok: false; error: string };

function parseOptions(raw: unknown, allowed: string[]): OptParse {
  if (raw === undefined || raw === null) return { ok: true, value: {} };
  if (typeof raw !== "string") return { ok: false, error: `options must be a JSON string, got ${typeof raw}` };
  let v: any;
  try {
    v = JSON.parse(raw);
  } catch (e) {
    return { ok: false, error: `options is not valid JSON: ${raw} (${String(e)})` };
  }
  if (typeof v !== "object" || v === null || Array.isArray(v)) return { ok: false, error: "options must be a JSON object" };
  const unknown = Object.keys(v).filter((k) => !allowed.includes(k));
  if (unknown.length)
    return { ok: false, error: `unknown option${unknown.length > 1 ? "s" : ""} ${unknown.join(", ")} (allowed: ${allowed.join(", ")})` };
  return { ok: true, value: v };
}

// name may arrive top-level or inside options; differing duplicates are ambiguous.
function pickName(top: unknown, inOpts: unknown): NamePick {
  if (top !== undefined && inOpts !== undefined && top !== inOpts)
    return { ok: false, error: 'got "name" both top-level and in options with different values — pass one' };
  return { ok: true, value: top ?? inOpts };
}

const fail = (text: string) => ({ ...result(text, { ok: false, error: text }), isError: true });
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
      const text = r.ok ? `change scaffolded.\n${json(r)}\nFill proposal.md, specs/*/spec.md, tasks.md — then validate via the cdd tool.` : json(r);
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

  // ---- door 1 mirror: the model's tool (one dispatcher, every op, ADR-0005) -

  pi.registerTool({
    name: "cdd",
    label: "cdd",
    description:
      "Contract-driven development. init scaffolds the store once per project. new scaffolds cdd/changes/<name>/ artifacts to fill. validate: draft checks structure; strict adds Verified-by pin checks; no name → whole store. status lists open changes. archive merges deltas into the living spec, moves the change to cdd/archive/; strict green first. help lists per-op parameters.",
    parameters: {
      type: "object",
      properties: {
        op: { type: "string", enum: ["init", "new", "validate", "status", "archive", "help"] },
        name: { type: "string", description: "change name, kebab-case" },
        options: { type: "string", description: 'extra params as JSON, e.g. {"mode":"strict"}' },
      },
      required: ["op"],
    },
    prepareArguments: fillArgs,
    async execute(_id, params, _signal, _onUpdate, ctx) {
      switch (params.op) {
        case "init": {
          const o = parseOptions(params.options, ["ci", "hooks"]);
          if (!o.ok) return fail(o.error);
          const r = initStore(ctx.cwd, EXT_DIR, { ci: o.value.ci ?? "both", hooks: o.value.hooks ?? true });
          return result(
            r.ok ? `cdd store initialized:\n${json(r)}\nTell the user to run: git config core.hooksPath .githooks` : json(r),
            r,
          );
        }
        case "new": {
          const o = parseOptions(params.options, ["name", "capabilities"]);
          if (!o.ok) return fail(o.error);
          const name = pickName(params.name, o.value.name);
          if (!name.ok) return fail(name.error);
          if (!name.value) return fail('op "new" requires "name"');
          const r = createChange(ctx.cwd, name.value, o.value.capabilities);
          return { ...result(r.ok ? `change scaffolded:\n${json(r)}` : json(r), r), isError: !r.ok };
        }
        case "validate": {
          const o = parseOptions(params.options, ["change", "mode"]);
          if (!o.ok) return fail(o.error);
          if (o.value.change !== undefined && params.name !== undefined && o.value.change !== params.name)
            return fail('got both "name" and options "change" with different values — pass one');
          const target = o.value.change ?? params.name;
          const v = target ? validateChange(ctx.cwd, target, o.value.mode ?? "draft") : validateStore(ctx.cwd, o.value.mode ?? "draft");
          return { ...result(formatVerdict(v), v), isError: !v.ok };
        }
        case "status":
          return result(json(status(ctx.cwd)), status(ctx.cwd));
        case "archive": {
          const o = parseOptions(params.options, ["name"]);
          if (!o.ok) return fail(o.error);
          const name = pickName(params.name, o.value.name);
          if (!name.ok) return fail(name.error);
          if (!name.value) return fail('op "archive" requires "name"');
          const v = validateChange(ctx.cwd, name.value, "strict");
          if (!v.ok) {
            return {
              ...result(`archive refused — strict validation failed:\n${formatVerdict(v)}`, { ok: false, validation: v }),
              isError: true,
            };
          }
          const r = archiveChange(ctx.cwd, name.value);
          return { ...result(r.ok ? `archived:\n${json(r)}\nPair-commit: feature commit, then this archive commit.` : json(r), r), isError: !r.ok };
        }
        case "help":
          return result(
            `Pass these per-op parameters inside the options JSON string, e.g. {"mode":"strict"}:\n${json(OPS_DOC)}`,
            OPS_DOC,
          );
        default:
          return fail(`unknown op: ${params.op}`);
      }
    },
  });
  // ---- ambient context (ADR-0004) -------------------------------------------

  pi.on("before_agent_start", async (event) => {
    const block = buildAmbientBlock(process.cwd());
    if (!block) return;
    return { systemPrompt: event.systemPrompt + block };
  });
}

