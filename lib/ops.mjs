// The op registry — one ordered table behind every op surface. The tool
// declaration's enum, the help op's per-op documentation payload, the legacy
// op alias fold, each dispatch case's option whitelist, and the help
// screen's Commands-and-tools rows all derive from this module.

import { ACTIONS } from "./backlog.mjs";
import { ADR_STATUSES } from "../scripts/adr-index.mjs";

const nameParam = { type: "string", description: "change name, kebab-case" };
const capsParam = {
  type: "array",
  items: { type: "string" },
  description: "capabilities the change touches (defaults to the first word of the name)",
};

// One row per op, in registry order. `was` carries the five-tool original's
// name where one exists (provenance for MAINTENANCE.md); `aliases` lists the
// legacy op strings that still fold to this op.
export const OPS = [
  {
    name: "init",
    was: "cdd_init",
    aliases: ["cdd_init"],
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
  {
    name: "new",
    was: "cdd_new_change",
    aliases: ["cdd_new_change", "cdd_new", "new_change"],
    description:
      "Scaffold one change folder cdd/changes/<name>/ with proposal.md, specs/<capability>/spec.md (delta template), tasks.md. Fill the placeholders, then validate with the validate op.",
    parameters: {
      type: "object",
      properties: { name: nameParam, capabilities: capsParam },
      required: ["name"],
    },
  },
  {
    name: "validate",
    was: "cdd_validate",
    aliases: ["cdd_validate"],
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
  {
    name: "status",
    was: "cdd_status",
    aliases: ["cdd_status"],
    description: "Report the store: open changes, capabilities, per-change draft and strict verdicts.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "archive",
    was: "cdd_archive",
    aliases: ["cdd_archive"],
    description:
      "Close a change: strict validation must pass, then deltas merge into the living specs (ADDED appends, MODIFIED replaces, REMOVED deletes) and the folder moves to cdd/archive/<date>-<name>/.",
    parameters: { type: "object", properties: { name: nameParam }, required: ["name"] },
  },
  {
    name: "backlog",
    aliases: [],
    description:
      "Maintain cdd/backlog.md, the process-finding backlog. Item grammar: - PF-n [status] summary | source: ref [| change: name] [| note: text] [| premise: micro-form] [| verified: dates]; status: open, watch, done, won't-do, seeded-into-change. premise micro-form: exists:<path> | absent:<path> | grep:<literal>@<path>=<count> — revalidate checks premises in-process and stamps one verified date per run-day; list annotates staleness. Milestone and Close reports cite PF-n ids, never prose.",
    parameters: {
      type: "object",
      properties: {
        action: { type: "string", enum: [...ACTIONS], description: "default list" },
        id: { type: "string", description: "item id for resolve, e.g. PF-1" },
        summary: { type: "string", description: "one-line finding (add)" },
        source: { type: "string", description: "the run, review, or archived change that raised it (add)" },
        status: { type: "string", enum: ["open", "watch", "done", "won't-do", "seeded-into-change"], description: "default open (add); required (resolve)" },
        change: { type: "string", description: "adopting change name (required for seeded-into-change)" },
        note: { type: "string", description: "free-form context" },
        premise: { type: "string", description: "revalidation premise (add): exists:<path> | absent:<path> | grep:<literal>@<path>=<count>" },
      },
    },
  },
  {
    name: "adrs",
    aliases: [],
    description: `adrs discovers the store's decisions in cdd/decisions/: a table of every ADR (id, title, status, code globs), a status filter, and a --code reverse lookup. Statuses: ${ADR_STATUSES.join(", ")} — an unknown value refuses with a nearest-match hint. --code <path> returns every governing ADR (accepted, id order) for a file or directory; paths normalize (./, absolute) and paths outside the store root refuse.`,
    parameters: {
      type: "object",
      properties: {
        status: { type: "string", enum: [...ADR_STATUSES], description: "filter the table by status" },
        code: { type: "string", description: "reverse lookup: a file or directory path inside the store root" },
      },
    },
  },
  {
    name: "reconfirm",
    aliases: [],
    description: 'reconfirm records decision reconfirmation: appends "- Reconfirmed by <change> on <date>: <evidence>" to an ADR. Defaults to the open change; --change <name> works post-archive (the lawful path for reconfirmations that cannot ride an archive commit). Refuses superseded ADRs (suggests the supersede path), unknown ids, missing evidence, and a change that already reconfirmed the ADR. --check pre-flights: ADRs whose claimed files moved since their latest reconfirmation, for the open change.',
    parameters: {
      type: "object",
      properties: {
        id: { type: "string", description: 'ADR id, e.g. "ADR-0008"' },
        change: { type: "string", description: "change name; defaults to the open change, required post-archive" },
        evidence: { type: "string", description: "one line: why the decision still holds" },
        check: { type: "boolean", description: "pre-flight moved claims instead of appending" },
      },
    },
  },
  {
    name: "help",
    aliases: [],
    description: "List every op's parameters and usage — the per-op documentation the lean tool declaration deliberately omits.",
    parameters: { type: "object", properties: {} },
  },
];

// The five door-1 slash commands, in registration order.
export const COMMANDS = ["cdd-init", "cdd-new", "cdd-status", "cdd-help", "cdd-archive"];

export const OP_NAMES = OPS.map((row) => row.name);

export const OPS_DOC = Object.fromEntries(
  OPS.map((row) => [row.name, { ...(row.was ? { was: row.was } : {}), description: row.description, parameters: row.parameters }]),
);

// Legacy tool names the model may still use as op (history, older prompts).
export const OP_ALIASES = Object.fromEntries(OPS.flatMap((row) => row.aliases.map((alias) => [alias, row.name])));

// A dispatch case's option whitelist: the row's parameter keys, in row order.
export const optionKeys = (name) => Object.keys(OPS_DOC[name].parameters.properties);
