#!/usr/bin/env node
// backlog-revalidate — the premise law end to end: item lines may carry a
// premise micro-form and a machine-written verified date history, malformed
// segments refuse every action, revalidate answers one verdict per active
// item and stamps verified dates without touching dispositions, and list
// annotates staleness for active items.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const lib = await import(path.join(REPO, "lib", "store.mjs"));

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
const textOf = (r) => r.content[0].text;

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
const verdictLines = (text) => text.split("\n").filter((l) => /^PF-\d+ \[/.test(l) && !l.startsWith("- "));

// a store whose cdd/backlog.md holds exactly these item lines under the
// default header
function storeWith(lines) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-br-"));
  lib.initStore(root, REPO, {});
  fs.writeFileSync(path.join(root, "cdd", "backlog.md"), `# backlog — process findings\n\n${lines.join("\n")}\n`);
  return root;
}
const fileOf = (root) => fs.readFileSync(path.join(root, "cdd", "backlog.md"), "utf8");
const itemsOf = (text) => text.split("\n").filter((l) => l.startsWith("- PF-"));

// --- the grammar carries premise and verified segments -----------------------------

await check("RV1", "premise and verified segments parse and round-trip", async () => {
  const line = "- PF-1 [open] alpha | source: run-a | note: ctx | premise: exists:lib/backlog.mjs | verified: 2026-10-23";
  const root = storeWith([line]);
  const r = await call({ op: "backlog" }, root);
  assert(!r.isError, `list must succeed: ${textOf(r)}`);
  assert(textOf(r).includes(line), `rendered byte-identical: ${textOf(r)}`);
  fs.rmSync(root, { recursive: true, force: true });
});

await check("RV2", "a malformed premise refuses every action, naming the line", async () => {
  const line = "- PF-1 [open] alpha | source: run-a | premise: rm -rf /";
  const root = storeWith([line]);
  for (const options of [undefined, { action: "add", summary: "s", source: "r" }, { action: "resolve", id: "PF-1", status: "done" }]) {
    const r = await call({ op: "backlog", options: options ? JSON.stringify(options) : undefined }, root);
    assert(r.isError && textOf(r).includes(line), `must refuse with the line named: ${textOf(r)}`);
  }
  fs.rmSync(root, { recursive: true, force: true });
});

await check("RV3", "a malformed verified segment refuses every action, naming the line", async () => {
  const line = "- PF-1 [open] alpha | source: run-a | premise: exists:lib/backlog.mjs | verified: 23-10-2026";
  const root = storeWith([line]);
  const r = await call({ op: "backlog" }, root);
  assert(r.isError && textOf(r).includes(line), `must refuse with the line named: ${textOf(r)}`);
  fs.rmSync(root, { recursive: true, force: true });
});

await check("RV4", "out-of-order verified dates refuse every action, naming the line", async () => {
  const line = "- PF-1 [open] alpha | source: run-a | premise: exists:lib/backlog.mjs | verified: 2026-10-24 2026-10-23";
  const root = storeWith([line]);
  const r = await call({ op: "backlog" }, root);
  assert(r.isError && textOf(r).includes(line), `must refuse with the line named: ${textOf(r)}`);
  fs.rmSync(root, { recursive: true, force: true });
});

await check("RV5", "add carries a valid premise", async () => {
  const root = storeWith(["- PF-1 [open] alpha | source: run-a"]);
  const r = await call({ op: "backlog", options: JSON.stringify({ action: "add", summary: "beta", source: "run-b", premise: "absent:cdd/archive/20261001-x" }) }, root);
  assert(!r.isError, `add must succeed: ${textOf(r)}`);
  const items = itemsOf(fileOf(root));
  assert(items[1].endsWith(" | premise: absent:cdd/archive/20261001-x"), `line carries premise: ${items[1]}`);
  fs.rmSync(root, { recursive: true, force: true });
});

await check("RV6", "add refuses a malformed premise and writes nothing", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-rv6-"));
  const r = await call({ op: "backlog", options: JSON.stringify({ action: "add", summary: "beta", source: "run-b", premise: "grep:x" }) }, root);
  assert(r.isError, `must refuse: ${textOf(r)}`);
  assert(!fs.existsSync(path.join(root, "cdd", "backlog.md")), "file must stay absent");
  fs.rmSync(root, { recursive: true, force: true });
});

// --- revalidate answers one verdict per active item ---------------------------------

await check("RV7", "revalidate reports a verdict per active item and stamps verified dates", async () => {
  const root = storeWith([
    "- PF-1 [open] holds-item | source: run-a | premise: exists:cdd/rules.md",
    "- PF-2 [open] rotted-item | source: run-a | premise: absent:cdd/rules.md",
    "- PF-3 [open] judgment-item | source: run-a",
    "- PF-4 [watch] watch-holds | source: run-a | premise: exists:cdd/rules.md",
    "- PF-5 [seeded-into-change] seeded-rotted | source: run-a | change: some-change | premise: absent:cdd/rules.md",
    "- PF-6 [done] done-item | source: run-a",
  ]);
  const r = await call({ op: "backlog", options: JSON.stringify({ action: "revalidate" }) }, root);
  assert(!r.isError, `revalidate must succeed: ${textOf(r)}`);
  const verdicts = verdictLines(textOf(r));
  assert(verdicts.length === 5, `exactly 5 verdict lines, got ${verdicts.length}: ${JSON.stringify(verdicts)}`);
  assert(/PF-1 \[open\] hold\b/.test(textOf(r)), `PF-1 hold: ${textOf(r)}`);
  assert(/PF-2 \[open\] ROTTED/.test(textOf(r)), `PF-2 ROTTED: ${textOf(r)}`);
  assert(/PF-3 \[open\] NOT-MECHANICAL/.test(textOf(r)), `PF-3 NOT-MECHANICAL: ${textOf(r)}`);
  assert(/PF-4 \[watch\] hold\b/.test(textOf(r)), `PF-4 hold: ${textOf(r)}`);
  assert(/PF-5 \[seeded-into-change\] ROTTED/.test(textOf(r)), `PF-5 ROTTED: ${textOf(r)}`);
  assert(!/PF-6/.test(textOf(r)), `done item gets no line: ${textOf(r)}`);
  const items = itemsOf(fileOf(root));
  assert(items[0].endsWith(`| verified: ${today()}`), `PF-1 stamped: ${items[0]}`);
  assert(items[1].endsWith(`| verified: ${today()}`), `PF-2 stamped: ${items[1]}`);
  assert(!items[2].includes("verified:"), `PF-3 not stamped: ${items[2]}`);
  assert(items[3].endsWith(`| verified: ${today()}`), `PF-4 stamped: ${items[3]}`);
  assert(items[4].endsWith(`| verified: ${today()}`), `PF-5 stamped: ${items[4]}`);
  assert(items[5] === "- PF-6 [done] done-item | source: run-a", `PF-6 untouched: ${items[5]}`);
  fs.rmSync(root, { recursive: true, force: true });
});

await check("RV8", "a vanished grep anchor reports ANCHOR-GONE", async () => {
  const root = storeWith(["- PF-1 [open] anchor-item | source: run-a | premise: grep:needle@lib/gone.mjs=1"]);
  const r = await call({ op: "backlog", options: JSON.stringify({ action: "revalidate" }) }, root);
  assert(!r.isError, `revalidate must succeed: ${textOf(r)}`);
  assert(/PF-1 \[open\] ANCHOR-GONE/.test(textOf(r)), `ANCHOR-GONE verdict: ${textOf(r)}`);
  fs.rmSync(root, { recursive: true, force: true });
});

await check("RV9", "grep premises evaluate by exact line count", async () => {
  const root = storeWith([
    "- PF-1 [open] exact-count | source: run-a | premise: grep:needle@lib/sample.mjs=1",
    "- PF-2 [open] over-count | source: run-a | premise: grep:needle@lib/sample.mjs=2",
  ]);
  fs.mkdirSync(path.join(root, "lib"), { recursive: true });
  fs.writeFileSync(path.join(root, "lib", "sample.mjs"), "export const needle = 1;\nexport const other = 2;\n");
  const r = await call({ op: "backlog", options: JSON.stringify({ action: "revalidate" }) }, root);
  assert(!r.isError, `revalidate must succeed: ${textOf(r)}`);
  assert(/PF-1 \[open\] hold\b/.test(textOf(r)), `count 1 holds: ${textOf(r)}`);
  assert(/PF-2 \[open\] ROTTED/.test(textOf(r)), `count 2 against 1 matching line rots: ${textOf(r)}`);
  fs.rmSync(root, { recursive: true, force: true });
});

await check("RV10", "revalidate never edits dispositions and is same-day idempotent", async () => {
  const root = storeWith([
    "- PF-1 [open] alpha | source: run-a | change: keep-me | note: keep | premise: exists:cdd/rules.md",
    "- PF-2 [watch] beta | source: run-b | premise: exists:cdd/rules.md",
    "- PF-3 [done] gamma | source: run-c | premise: exists:cdd/rules.md",
  ]);
  const before = itemsOf(fileOf(root));
  for (let i = 0; i < 2; i++) {
    const r = await call({ op: "backlog", options: JSON.stringify({ action: "revalidate" }) }, root);
    assert(!r.isError, `revalidate ${i} must succeed: ${textOf(r)}`);
  }
  const after = itemsOf(fileOf(root));
  for (let i = 0; i < before.length; i++) {
    const stripped = after[i].replace(/ \| verified: [\d- ]+$/, "");
    assert(stripped === before[i], `segments untouched for item ${i}: ${before[i]} -> ${after[i]}`);
  }
  assert((after[0].match(/verified: ([\d- ]+)/)?.[1] ?? "").split(" ").filter(Boolean).join(" ") === today(), `PF-1 exactly 1 date: ${after[0]}`);
  assert((after[1].match(/verified: ([\d- ]+)/)?.[1] ?? "").split(" ").filter(Boolean).join(" ") === today(), `PF-2 exactly 1 date: ${after[1]}`);
  assert(after[2] === before[2], `done item untouched: ${after[2]}`);
  fs.rmSync(root, { recursive: true, force: true });
});

await check("RV11", "a third verified date forces a disposition", async () => {
  const root = storeWith([
    `- PF-1 [open] old-item | source: run-a | premise: exists:cdd/rules.md | verified: 2026-01-01 2026-02-02`,
  ]);
  const r = await call({ op: "backlog", options: JSON.stringify({ action: "revalidate" }) }, root);
  assert(!r.isError, `revalidate must succeed: ${textOf(r)}`);
  assert(/PF-1 \[open\] hold\b/.test(textOf(r)) && /force a disposition/.test(textOf(r)), `flag on third date: ${textOf(r)}`);
  const line = itemsOf(fileOf(root))[0];
  assert(line.endsWith(`| verified: 2026-01-01 2026-02-02 ${today()}`), `exactly 3 dates appended in order: ${line}`);
  fs.rmSync(root, { recursive: true, force: true });
});

// --- list annotates staleness -------------------------------------------------------

await check("RV12", "list annotates staleness for active items only", async () => {
  const root = storeWith([
    "- PF-1 [open] fresh-item | source: run-a | premise: exists:cdd/rules.md",
    `- PF-2 [open] stale-item | source: run-b | premise: exists:cdd/rules.md | verified: ${daysAgo(3)}`,
    "- PF-3 [done] done-item | source: run-c",
  ]);
  const r = await call({ op: "backlog" }, root);
  assert(!r.isError, `list must succeed: ${textOf(r)}`);
  const text = textOf(r);
  assert(text.includes("- PF-1 [open] fresh-item | source: run-a | premise: exists:cdd/rules.md"), `item lines verbatim: ${text}`);
  assert(text.includes(`- PF-2 [open] stale-item | source: run-b | premise: exists:cdd/rules.md | verified: ${daysAgo(3)}`), `item lines verbatim: ${text}`);
  assert(text.includes("staleness:"), `staleness block present: ${text}`);
  assert(/^PF-1 \[open\] never verified$/m.test(text), `PF-1 never verified: ${text}`);
  assert(new RegExp(`PF-2 \\[open\\] verified ${daysAgo(3)} \\(3 days ago\\)`, "m").test(text), `PF-2 age: ${text}`);
  const block = text.split("staleness:\n")[1] ?? "";
  assert(block.trim().split("\n").length === 2, `staleness lists exactly the 2 open items: ${block}`);
  assert(!/PF-3/.test(block), `no done item in staleness: ${block}`);
  fs.rmSync(root, { recursive: true, force: true });
});

await check("RV13", "list marks a vanished grep anchor", async () => {
  const root = storeWith(["- PF-1 [open] anchor-item | source: run-a | premise: grep:needle@lib/gone.mjs=1"]);
  const r = await call({ op: "backlog" }, root);
  assert(!r.isError, `list must succeed: ${textOf(r)}`);
  assert(/PF-1 \[open\] never verified; anchor gone: lib\/gone\.mjs/m.test(textOf(r)), `anchor marked gone: ${textOf(r)}`);
  fs.rmSync(root, { recursive: true, force: true });
});

await check("RV14", "an unknown action names every allowed action", async () => {
  const root = storeWith(["- PF-1 [open] alpha | source: run-a"]);
  const before = fileOf(root);
  const r = await call({ op: "backlog", options: JSON.stringify({ action: "purge" }) }, root);
  assert(r.isError && /purge/.test(textOf(r)) && /allowed: list, add, resolve, revalidate/.test(textOf(r)), `names all four actions: ${textOf(r)}`);
  assert(fileOf(root) === before, "file must be unchanged");
  fs.rmSync(root, { recursive: true, force: true });
});

console.log(`\n${pass} passed, ${fail} failed${fail ? `\n${failures.join("\n")}` : ""}`);
process.exit(fail ? 1 : 0);
