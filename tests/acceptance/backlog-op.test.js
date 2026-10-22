#!/usr/bin/env node
// backlog-op — the backlog convention end to end: the op writes and reads
// cdd/backlog.md through the real tool with a strict item grammar and
// refusal-only edges, the live store's seed findings are grammar-conforming,
// the loop law names the destination and the PF-n citation duty in both
// single sources, and the backlog's prose never gates (strict validation
// ignores it; no living Code: glob claims the file).
// Pins: ADDED "The backlog op triages findings on disk" and "Process findings
// land in the backlog" scenarios in the backlog-op change delta.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const lib = await import(path.join(REPO, "lib", "store.mjs"));
const val = await import(path.join(REPO, "lib", "validate.mjs"));
const tpl = await import(path.join(REPO, "lib", "templates.mjs"));

let pass = 0;
let fail = 0;
const failures = [];
async function check(id, name, fn) {
  try {
    await fn();
    pass++;
    console.log(`  ok   ${id}  ${name}`);
  } catch (e) {
    fail++;
    failures.push(`${id}: ${e.message}`);
    console.log(`  FAIL ${id}  ${name}\n       ${e.message}`);
  }
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

// the real extension, loaded the way pi loads it (tests/pi-jiti.mjs)
function fakeApi() {
  const api = {
    tools: [],
    commands: [],
    events: {},
    setActiveToolsCalls: 0,
    registerTool: (def) => api.tools.push(def),
    registerCommand: (name, def) => api.commands.push([name, def]),
    on: (ev, fn) => {
      api.events[ev] = fn;
    },
    setActiveTools: () => {
      api.setActiveToolsCalls++;
    },
  };
  return api;
}
const { loadViaPi } = await import(path.join(REPO, "tests", "pi-jiti.mjs"));
const mod = (await loadViaPi(path.join(REPO, "index.ts"))) ?? (await import(path.join(REPO, "index.ts")));
const api = fakeApi();
mod.default(api);
const call = async (args, cwd) => api.tools[0].execute(1, args, undefined, undefined, { cwd });

const GRAMMAR = /^- PF-(\d+) \[(open|watch|done|won't-do|seeded-into-change)\] .+ \| source: .+(?: \| change: .+)?(?: \| note: .+)?$/;
const itemsOf = (text) => text.split("\n").filter((l) => l.startsWith("- PF-"));

// a store whose cdd/backlog.md holds exactly these item lines under the
// default header
function storeWith(lines) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-bo-"));
  lib.initStore(root, REPO, {});
  if (lines !== null) {
    fs.writeFileSync(path.join(root, "cdd", "backlog.md"), `# backlog — process findings\n\n${lines.join("\n")}\n`);
  }
  return root;
}

// --- the op writes and reads through the real tool -------------------------------

await check("BO1", "add appends the first item when the file is absent", async () => {
  const root = storeWith(null);
  const r = await call({ op: "backlog", options: JSON.stringify({ action: "add", summary: "scaffold phantom-count", source: "run 2026-10-22" }) }, root);
  assert(!r.isError, `add must succeed: ${r.content[0].text}`);
  const file = fs.readFileSync(path.join(root, "cdd", "backlog.md"), "utf8");
  const items = itemsOf(file);
  assert(items.length === 1, `expected exactly 1 item line, got ${items.length}: ${JSON.stringify(items)}`);
  assert(items[0] === "- PF-1 [open] scaffold phantom-count | source: run 2026-10-22", `item line shape: ${items[0]}`);
  fs.rmSync(root, { recursive: true, force: true });
});

await check("BO2", "list is the default action and renders every item", async () => {
  const root = storeWith(["- PF-1 [open] alpha | source: run-a", "- PF-2 [watch] beta | source: run-b"]);
  const r = await call({ op: "backlog" }, root);
  assert(!r.isError, `list must succeed: ${r.content[0].text}`);
  const text = r.content[0].text;
  assert(text.includes("PF-1") && text.includes("[open]"), `render PF-1 with status: ${text}`);
  assert(text.includes("PF-2") && text.includes("[watch]"), `render PF-2 with status: ${text}`);
  fs.rmSync(root, { recursive: true, force: true });
});

await check("BO3", "resolve rewrites one item's status and leaves the rest byte-identical", async () => {
  const root = storeWith(["- PF-1 [open] alpha | source: run-a", "- PF-2 [watch] beta | source: run-b"]);
  const r = await call({ op: "backlog", options: JSON.stringify({ action: "resolve", id: "PF-1", status: "done" }) }, root);
  assert(!r.isError, `resolve must succeed: ${r.content[0].text}`);
  const items = itemsOf(fs.readFileSync(path.join(root, "cdd", "backlog.md"), "utf8"));
  assert(items[0] === "- PF-1 [done] alpha | source: run-a", `rewritten line: ${items[0]}`);
  assert(items[1] === "- PF-2 [watch] beta | source: run-b", `untouched line: ${items[1]}`);
  fs.rmSync(root, { recursive: true, force: true });
});

// --- every refusal is exactly one error result and leaves the file unchanged -----

const REFUSALS = [
  ["BO4", "seeded-into-change without a change name refuses", { action: "resolve", id: "PF-1", status: "seeded-into-change" }],
  ["BO5", "an unknown action refuses naming the allowed actions", { action: "purge" }],
  ["BO6", "an unknown option refuses naming the allowed options", { color: "red" }],
  ["BO7", "an unknown id refuses", { action: "resolve", id: "PF-9", status: "done" }],
  ["BO8", "resolving to open refuses", { action: "resolve", id: "PF-1", status: "open" }],
];
for (const [id, name, options] of REFUSALS) {
  await check(id, name, async () => {
    const root = storeWith(["- PF-1 [open] alpha | source: run-a"]);
    const before = fs.readFileSync(path.join(root, "cdd", "backlog.md"), "utf8");
    const r = await call({ op: "backlog", options: JSON.stringify(options) }, root);
    assert(r.isError === true, `expected an error result, got: ${JSON.stringify(r.content[0].text)}`);
    assert(!/unknown op: /.test(r.content[0].text), `the refusal must come from the backlog op itself, not the dispatcher: ${r.content[0].text}`);
    assert(r.content.length === 1 && r.content[0].type === "text", "exactly one text result");
    if (id === "BO5") assert(/allowed/.test(r.content[0].text) && /list/.test(r.content[0].text), `error names allowed actions: ${r.content[0].text}`);
    if (id === "BO6") assert(/allowed/.test(r.content[0].text) && /action/.test(r.content[0].text), `error names allowed options: ${r.content[0].text}`);
    const after = fs.readFileSync(path.join(root, "cdd", "backlog.md"), "utf8");
    assert(after === before, "the file must be unchanged by a refusal");
    fs.rmSync(root, { recursive: true, force: true });
  });
}

await check("BO9", "an off-grammar item line refuses every action", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-bo-"));
  lib.initStore(root, REPO, {});
  fs.writeFileSync(path.join(root, "cdd", "backlog.md"), "# backlog\n\n- PF-1 fix the thing | source: run\n");
  // the refusal is structural: list (the default), add, and resolve must all name the line
  const calls = [
    { op: "backlog" },
    { op: "backlog", options: JSON.stringify({ action: "add", summary: "x", source: "run-x" }) },
    { op: "backlog", options: JSON.stringify({ action: "resolve", id: "PF-1", status: "done" }) },
  ];
  for (const args of calls) {
    const r = await call(args, root);
    assert(r.isError === true, `expected an error result for ${args.options ?? "list"}, got: ${JSON.stringify(r.content[0].text)}`);
    assert(r.content[0].text.includes("- PF-1 fix the thing"), `error names the malformed line: ${r.content[0].text}`);
  }
  fs.rmSync(root, { recursive: true, force: true });
});

// --- the law names the destination in both single sources ------------------------

await check("BO10", "rule 13 names cdd/backlog.md and PF-n citations in RULES_MD and the rules.md mirror", async () => {
  const store = fs.readFileSync(path.join(REPO, "cdd", "rules.md"), "utf8");
  for (const [label, text] of [["RULES_MD", tpl.RULES_MD], ["cdd/rules.md", store]]) {
    assert(/13\. \*\*The backlog\*\*/.test(text), `${label} carries rule 13`);
    assert(text.includes("cdd/backlog.md"), `${label} names the destination file`);
    assert(/PF-n/.test(text), `${label} carries the PF-n citation duty`);
    assert(/never check its content/.test(text), `${label} pins the not-gated boundary`);
  }
});

// --- the backlog's prose never gates ----------------------------------------------

await check("BO11", "free-form note prose keeps strict validation and the drift guard green; no Code: glob claims the file", async () => {
  // a real guard run needs a git repo with a spec, a pin file, and node_modules
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-bo-"));
  const git = (...a) => execFileSync("git", ["-C", root, ...a], { stdio: "pipe" });
  git("init", "-q"); git("config", "user.email", "t@t"); git("config", "user.name", "t");
  lib.initStore(root, REPO, {});
  fs.mkdirSync(path.join(root, "cdd", "specs", "cap"), { recursive: true });
  fs.writeFileSync(path.join(root, "cdd", "specs", "cap", "spec.md"), "## Requirements\n\n### Requirement: cap-r\n\ncap prose\n\n```gherkin\nFeature: cap-r\n\nScenario: cap-s\nGiven a fixture\nWhen it runs\nThen it works\n  # Verified by: tests/acceptance/cap.test.js\n```\n");
  fs.mkdirSync(path.join(root, "tests", "acceptance"), { recursive: true });
  fs.writeFileSync(path.join(root, "tests", "acceptance", "cap.test.js"), "// fixture pin target\n");
  git("add", "."); git("commit", "-qm", "init");
  fs.symlinkSync(path.join(REPO, "node_modules"), path.join(root, "node_modules"), "dir");
  const add = await call({ op: "backlog", options: JSON.stringify({ action: "add", summary: "prose tolerance", source: "run-x", note: "free-form: 'anything goes'; even (parens) and — dashes" }) }, root);
  assert(!add.isError, `add must succeed: ${add.content[0].text}`);
  const v = val.validateStore(root, "strict");
  assert(v.ok, `strict must stay green with backlog prose: ${JSON.stringify(v.errors)}`);
  // the drift guard runs over the sandbox store with the junk prose in place
  let scan;
  try {
    scan = { code: 0, out: execFileSync("node", [path.join(root, "cdd", "scripts", "spec-drift.mjs")], { encoding: "utf8", cwd: root, stdio: ["ignore", "pipe", "pipe"] }) };
  } catch (e) {
    scan = { code: e.status ?? 1, out: (e.stdout ?? "") + (e.stderr ?? "") };
  }
  assert(scan.code === 0, `guard must stay green over backlog prose: ${scan.out}`);
  assert(/spec-drift: clean/.test(scan.out), `guard scanned a real store (not vacuous): ${scan.out}`);
  for (const ent of fs.readdirSync(path.join(REPO, "cdd", "specs"), { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const spec = fs.readFileSync(path.join(REPO, "cdd", "specs", ent.name, "spec.md"), "utf8");
    assert(!/^Code:.*backlog\.md/m.test(spec), `no living Code: glob may claim cdd/backlog.md (${ent.name})`);
  }
});

// --- the live store's seeds --------------------------------------------------------

await check("BO12", "the live backlog holds the 7 grammar-conforming seeds and the header conventions line", async () => {
  const file = fs.readFileSync(path.join(REPO, "cdd", "backlog.md"), "utf8");
  const items = itemsOf(file);
  assert(items.length >= 7, `expected at least the 7 seeded item lines (the backlog is living data and may grow), got ${items.length}: ${JSON.stringify(items)}`);
  items.forEach((line, i) => {
    assert(GRAMMAR.test(line), `item ${i + 1} must match the grammar: ${line}`);
    assert(line.startsWith(`- PF-${i + 1} `), `ids must run PF-1..PF-7 in order: ${line}`);
  });
  const lines = file.split("\n");
  const firstItem = lines.findIndex((l) => l.startsWith("- PF-"));
  const header = lines.slice(0, firstItem === -1 ? lines.length : firstItem);
  assert(header.some((l) => /believed only when an on-disk artifact/.test(l)), `header carries the conventions line: ${JSON.stringify(header)}`);
});

console.log(`\nbacklog-op: ${pass} passed, ${fail} failed`);
if (failures.length) {
  for (const f of failures) console.error(`  ${f}`);
  process.exitCode = 1;
}
