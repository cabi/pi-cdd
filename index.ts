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
import { ACTIONS, listBacklog, addBacklogItem, resolveBacklogItem, revalidateBacklog } from "./lib/backlog.mjs";
import { adrsOp, reconfirmOp } from "./lib/adr-ops.mjs";
import { OP_NAMES, OPS_DOC, OP_ALIASES, optionKeys } from "./lib/ops.mjs";
import { snapshotSources, staleEntries, gradeOp, refusalFor, warningFor } from "./lib/stale.mjs";
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
const LOAD_SNAPSHOT = snapshotSources(EXT_DIR);

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

// Staleness guard plumbing: one snapshot at load, one diff per dispatch
// (membership plus per-file digest). Mutating ops refuse with the fresh-node
// command that runs the same op; verdict and read ops answer with exactly
// one staleness warning. Ops the grader does not recognize grade mutating.
function backlogActionOf(params: any): string {
  const raw = params?.options;
  let v: any;
  if (typeof raw === "string") {
    if (raw.trim() === "") return "list";
    try {
      v = JSON.parse(raw);
    } catch {
      return "unknown";
    }
  } else v = raw;
  return v && typeof v === "object" && typeof v.action === "string" ? v.action : "list";
}

const staleNow = () => staleEntries(EXT_DIR, LOAD_SNAPSHOT);

function refuseIfStale(opKey: string, cwd: string) {
  const stale = staleNow();
  return stale.length ? refusalFor(opKey, stale, EXT_DIR, cwd) : null;
}

const doorRefusal = (opKey: string, ctx: any) => {
  const r = refuseIfStale(opKey, ctx.cwd);
  if (!r) return false;
  if (ctx.hasUI) ctx.ui.notify(r.text, "error");
  else console.log(r.text);
  return true;
};
export default function cddExtension(pi: ExtensionAPI) {
  // ---- door 1 mirror: commands for the human --------------------------------

  pi.registerCommand("cdd-init", {
    description: "Scaffold the cdd store (cdd/, door scripts, hooks, CI) in this project",
    handler: async (args: string, ctx) => {
      if (doorRefusal("init", ctx)) return;
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
      if (doorRefusal("new", ctx)) return;
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
      if (doorRefusal("archive", ctx)) return;
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
      "Contract-driven development. init scaffolds the store per project. new scaffolds change artifacts to fill. validate: draft checks structure; strict adds Verified-by pin checks; no name → whole store. status lists open changes. archive merges deltas into the living spec, moves it to the archive; strict green first. backlog triages process findings in cdd/backlog.md. adrs lists ADRs and their code claims (status filter, --code reverse lookup). reconfirm records ADR reconfirmation lines; --check pre-flights moved claims. help lists per-op params.",
    parameters: {
      type: "object",
      properties: {
        op: { type: "string", enum: OP_NAMES },
        name: { type: "string", description: "change name, kebab-case" },
        options: { type: "string", description: 'extra params as JSON, e.g. {"mode":"strict"}' },
      },
      required: ["op"],
    },
    prepareArguments: fillArgs,
    async execute(_id, params, _signal, _onUpdate, ctx) {
      // staleness guard: refuse mutation from a process that outlived source
      // edits; warn on verdict and read ops
      const stale = staleNow();
      if (stale.length && gradeOp(params.op, backlogActionOf(params)) === "mutating") {
        const opKey = params.op === "backlog" ? `backlog ${backlogActionOf(params)}` : String(params.op);
        const rf = refusalFor(opKey, stale, EXT_DIR, ctx.cwd);
        return { ...result(rf.text, rf.data), isError: true };
      }
      const base = async () => {
      switch (params.op) {
        case "init": {
          const o = parseOptions(params.options, optionKeys("init"));
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
          const o = parseOptions(params.options, optionKeys("new"));
          if (!o.ok) return fail(o.error);
          const name = pickName(params.name, o.value.name);
          if (!name.ok) return fail(name.error);
          if (!name.value) return fail('op "new" requires "name"');
          const r = createChange(ctx.cwd, name.value, o.value.capabilities);
          return { ...result(r.ok ? `change scaffolded:\n${json(r)}${redBlock(r)}` : json(r), r), isError: !r.ok };
        }
        case "validate": {
          const o = parseOptions(params.options, optionKeys("validate"));
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
          const o = parseOptions(params.options, optionKeys("archive"));
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
          const o = parseOptions(params.options, optionKeys("backlog"));
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
          if (action === "revalidate") {
            const r = revalidateBacklog(ctx.cwd);
            return r.ok ? result(r.text, { ok: true, items: r.items }) : fail(r.error);
          }
          return fail(`unknown action ${JSON.stringify(action)} (allowed: ${ACTIONS.join(", ")})`);
        }
        case "adrs": {
          const o = parseOptions(params.options, optionKeys("adrs"));
          if (!o.ok) return fail(o.error);
          const r = adrsOp(ctx.cwd, o.value);
          return r.ok ? result(r.text, { ok: true }) : fail(r.error);
        }
        case "reconfirm": {
          const o = parseOptions(params.options, optionKeys("reconfirm"));
          if (!o.ok) return fail(o.error);
          const id = o.value.id !== undefined ? o.value.id : params.name;
          const r = reconfirmOp(ctx.cwd, { ...o.value, id });
          return r.ok ? result(r.text, { ok: true }) : fail(r.error);
        }
        case "help":
          return result(
            `Pass these per-op parameters inside the options JSON string, e.g. {"mode":"strict"}:\n${json(OPS_DOC)}`,
            OPS_DOC,
          );
        default:
          return fail(`unknown op: ${params.op}`);
      }
      };
      const r = await base();
      if (!stale.length) return r;
      const w = warningFor(stale);
      return {
        ...r,
        content: [{ type: "text", text: `${r.content[0].text}\n\n${w.text}` }],
        details: { ...(r.details ?? {}), stale: w.data.stale, staleWarning: w.text },
      };
    },
  });
  // ---- ambient context --------------------------------------------------------

  pi.on("before_agent_start", async (event) => {
    const block = buildAmbientBlock(process.cwd());
    if (!block) return;
    return { systemPrompt: event.systemPrompt + block };
  });
}

