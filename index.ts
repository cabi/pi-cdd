/**
 * pi-cdd — contract-driven development as a pi extension.
 *
 * The harness itself is the door-1 counterparty: ambient context carries
 * the method, deterministic tools return verdicts, and doors 2/3 are the
 * standalone zero-dependency scripts that /cdd-init copies into the
 * adopting project.
 *
 * Load:  pi --extension <this repo>
 * Dev:   pi --extension ~/Projects/pi-cdd
 */

import { fileURLToPath, pathToFileURL } from "node:url";
import * as path from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { initStore, createChange, archiveChange } from "./lib/store.mjs";
import { validateChange, validateStore, formatVerdict } from "./lib/validate.mjs";
import { listBacklog, addBacklogItem, resolveBacklogItem } from "./lib/backlog.mjs";
import { buildAmbientBlock } from "./lib/context.mjs";
import { status, statusTable } from "./lib/status.mjs";
import { CddStatusView } from "./lib/status-ui.ts";
import { helpText, renderHelp } from "./lib/help.mjs";

// Refuse silent direct execution: run as a command, this module prints
// nothing and exits 0. It prints one stderr line and exits 2 instead.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.error(
    "index.ts is the pi extension entry, not a command — load it with pi: pi --extension <this repo>; the cdd tool's ops run inside pi; the door commands are node cdd/scripts/spec-drift.mjs (guard), spec-extract, and arch-extract"
  );
  process.exit(2);
}

const EXT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

const json = (v) => JSON.stringify(v, null, 2);
/** Pre-existing-red warning block: a scaffold result's preexistingRed findings,
 * marked as not the change's cause, with a fix-or-accept hint. Empty → silent. */
const redBlock = (r) =>
  r.preexistingRed?.length
    ? `\npre-existing red — this change did not cause it:\n${r.preexistingRed.join("\n")}\nFix the store first, or knowingly accept the red (record it in proposal.md).`
    : "";
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
  backlog: {
    description:
      "Maintain cdd/backlog.md, the process-finding backlog. Item grammar: - PF-n [status] summary | source: ref [| change: name] [| note: text]; status: open, watch, done, won't-do, seeded-into-change. Milestone and Close reports cite PF-n ids, never prose.",
    parameters: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["list", "add", "resolve"], description: "default list" },
        id: { type: "string", description: "item id for resolve, e.g. PF-1" },
        summary: { type: "string", description: "one-line finding (add)" },
        source: { type: "string", description: "the run, review, or archived change that raised it (add)" },
        status: { type: "string", enum: ["open", "watch", "done", "won't-do", "seeded-into-change"], description: "default open (add); required (resolve)" },
        change: { type: "string", description: "adopting change name (required for seeded-into-change)" },
        note: { type: "string", description: "free-form context" },
      },
    },
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
      if (ctx.hasUI) ctx.ui.notify(r.ok ? (r.refreshed ? "cdd store refreshed" : "cdd store initialized") : `cdd-init failed: ${r.error}`, r.ok ? "info" : "error");
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
      const text = r.ok ? `change scaffolded.\n${json(r)}\nFill proposal.md, specs/*/spec.md, tasks.md — then validate via the cdd tool.${redBlock(r)}` : json(r);
      if (ctx.hasUI) {
        ctx.ui.notify(r.ok ? `change ${name} scaffolded` : `cdd-new failed: ${r.error}`, r.ok ? "info" : "error");
        if (r.ok && r.preexistingRed?.length) ctx.ui.notify(`pre-existing red — this change did not cause it:\n${r.preexistingRed.join("\n")}\nFix the store first, or knowingly accept the red (record it in proposal.md).`, "error");
      } else console.log(text);
    },
  });

  pi.registerCommand("cdd-status", {
    description: "All changes as two tabs (open with progress/verdicts/next, archived) — sortable tables, keyboard navigation",
    handler: async (_args: string, ctx) => {
      const s = status(ctx.cwd);
      if (ctx.mode === "tui") {
        // door-1 window: tabs + sortable tables, ESC closes
        await ctx.ui.custom<void>((tui, theme, _kb, done) => new CddStatusView(s, tui, theme, () => done()));
      } else {
        console.log(statusTable(s));
      }
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
      const r = archiveChange(ctx.cwd, name);
      if (!r.ok && r.stage) {
        console.log(`archive refused — strict validation failed:\n${formatVerdict(r.validation)}`);
        if (ctx.hasUI) ctx.ui.notify("archive refused: strict validation failed", "error");
        return;
      }
      const text = r.ok
        ? `archived.\n${json(r)}\nPair-commit: feature commit, then this archive commit.`
        : json(r);
      if (ctx.hasUI) ctx.ui.notify(r.ok ? `archived ${name}` : `cdd-archive failed: ${r.error}`, r.ok ? "info" : "error");
      else console.log(text);
    },
  });

  // ---- door 1 mirror: the model's tool (one dispatcher, every op) ---------

  pi.registerTool({
    name: "cdd",
    label: "cdd",
    description:
      "Contract-driven development. init scaffolds the store per project. new scaffolds change artifacts to fill. validate: draft checks structure; strict adds Verified-by pin checks; no name → whole store. status lists open changes. archive merges deltas into the living spec, moves it to the archive; strict green first. backlog triages process findings in cdd/backlog.md. help lists per-op params.",
    parameters: {
      type: "object",
      properties: {
        op: { type: "string", enum: ["init", "new", "validate", "status", "archive", "backlog", "help"] },
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
            r.ok
              ? r.refreshed
                ? `cdd store refreshed — door scripts re-copied:\n${json(r)}`
                : `cdd store initialized:\n${json(r)}\nTell the user to run: git config core.hooksPath .githooks`
              : json(r),
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
          return { ...result(r.ok ? `change scaffolded:\n${json(r)}${redBlock(r)}` : json(r), r), isError: !r.ok };
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
          const s = status(ctx.cwd);
          return result(json(s), s);
        case "archive": {
          const o = parseOptions(params.options, ["name"]);
          if (!o.ok) return fail(o.error);
          const name = pickName(params.name, o.value.name);
          if (!name.ok) return fail(name.error);
          if (!name.value) return fail('op "archive" requires "name"');
          const r = archiveChange(ctx.cwd, name.value);
          if (!r.ok && r.stage) {
            return {
              ...result(`archive refused — strict validation failed:\n${formatVerdict(r.validation)}`, {
                ok: false,
                stage: r.stage,
                validation: r.validation,
              }),
              isError: true,
            };
          }
          return { ...result(r.ok ? `archived:\n${json(r)}\nPair-commit: feature commit, then this archive commit.` : json(r), r), isError: !r.ok };
        }
        case "backlog": {
          const o = parseOptions(params.options, ["action", "id", "summary", "source", "status", "change", "note"]);
          if (!o.ok) return fail(o.error);
          const action = o.value.action ?? "list";
          if (action === "list") {
            const r = listBacklog(ctx.cwd);
            return r.ok ? result(r.text, { ok: true, items: r.items }) : fail(r.error);
          }
          if (action === "add") {
            const r = addBacklogItem(ctx.cwd, o.value);
            return r.ok ? { ...result(r.text, r), isError: false } : fail(r.error);
          }
          if (action === "resolve") {
            const r = resolveBacklogItem(ctx.cwd, o.value);
            return r.ok ? { ...result(r.text, r), isError: false } : fail(r.error);
          }
          return fail(`unknown action ${JSON.stringify(action)} (allowed: list, add, resolve)`);
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
  // ---- ambient context --------------------------------------------------------

  pi.on("before_agent_start", async (event) => {
    const block = buildAmbientBlock(process.cwd());
    if (!block) return;
    return { systemPrompt: event.systemPrompt + block };
  });
}

