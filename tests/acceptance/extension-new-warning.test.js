#!/usr/bin/env node
// The `new` op and the /cdd-new command render a scaffold result's
// preexistingRed as a pre-existing-red warning block (findings listed, the
// change marked as not their cause, a fix-or-accept hint); both surfaces stay
// silent when the list is empty, and the warning never blocks the scaffold.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
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

// --- fixture: a git store whose door 3 scan prints n issue lines --------------

const sandboxes = [];
function redStore(n) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-e-"));
  sandboxes.push(root);
  fs.mkdirSync(path.join(root, "tests", "acceptance"), { recursive: true });
  const git = (...a) => execFileSync("git", a, { cwd: root, encoding: "utf8" });
  git("init", "-q");
  git("config", "user.email", "t@t");
  git("config", "user.name", "t");
  lib.initStore(root, REPO, {});
  git("add", ".");
  git("commit", "-qm", "init");
  fs.symlinkSync(path.join(REPO, "node_modules"), path.join(root, "node_modules"), "dir");
  const scenarios = Array.from(
    { length: n },
    (_, i) =>
      `Scenario: Probe ${String.fromCharCode(97 + i)}\n  Given a fixture living spec\n  When the door 3 full scan runs\n  Then the probe pin is judged\n  # Verified by: tests/acceptance/missing-${String.fromCharCode(97 + i)}.test.js`,
  ).join("\n\n");
  fs.mkdirSync(path.join(root, "cdd", "specs", "cap"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "cdd", "specs", "cap", "spec.md"),
    `### Requirement: Probe\n\n\`\`\`gherkin\nFeature: Probe\n\n${scenarios}\n\`\`\`\n`,
  );
  return root;
}
function greenStore() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-e-"));
  sandboxes.push(root);
  fs.mkdirSync(path.join(root, "tests", "acceptance"), { recursive: true });
  const git = (...a) => execFileSync("git", a, { cwd: root, encoding: "utf8" });
  git("init", "-q");
  git("config", "user.email", "t@t");
  git("config", "user.name", "t");
  lib.initStore(root, REPO, {});
  git("add", ".");
  git("commit", "-qm", "init");
  fs.symlinkSync(path.join(REPO, "node_modules"), path.join(root, "node_modules"), "dir");
  return root;
}

// --- the extension under test (same load path as tests/tools.mjs) -------------

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
const blocks = (text) => text.split("\n").filter((l) => l.includes("pre-existing red"));

// --- E1: the new op renders findings as a pre-existing-red block --------------

await check("E1", "the new op renders findings as a pre-existing-red block", async () => {
  const root = redStore(2);
  const r = await call({ op: "new", name: "t-e1", options: '{"capabilities":["cap"]}' }, root);
  assert(!r.isError, "the warning must never block the scaffold");
  const text = textOf(r);
  assert(text.includes("change scaffolded"), `summary missing: ${text.slice(0, 200)}`);
  assert(blocks(text).length === 1, `expected exactly 1 pre-existing-red block, got ${blocks(text).length}`);
  assert(text.includes("did not cause"), `the block must state the change did not cause the findings: ${text.slice(0, 200)}`);
  assert(text.includes("missing-a.test.js") && text.includes("missing-b.test.js"), "the block must list both findings");
});

// --- E2: the new op stays silent on a green start ------------------------------

await check("E2", "the new op stays silent on a green start", async () => {
  const root = greenStore();
  const r = await call({ op: "new", name: "t-e2", options: '{"capabilities":["cap"]}' }, root);
  assert(!r.isError, `scaffold failed: ${textOf(r).slice(0, 200)}`);
  const text = textOf(r);
  assert(blocks(text).length === 0, "a green start must print no pre-existing-red block");
});

// --- E3: the cdd-new command renders the same block ----------------------------

await check("E3", "the cdd-new command renders the same block", async () => {
  const root = redStore(1);
  const entry = api.commands.find(([n]) => n === "cdd-new");
  assert(entry, "/cdd-new must stay registered");
  const logs = [];
  const orig = console.log;
  console.log = (s) => logs.push(String(s));
  try {
    await entry[1].handler("t-e3 cap", { cwd: root, hasUI: false });
  } finally {
    console.log = orig;
  }
  const text = logs.join("\n");
  assert(text.length > 0, "the command must render its result when no UI is present");
  assert(blocks(text).length === 1, `expected exactly 1 pre-existing-red block, got ${blocks(text).length}`);
  assert(text.includes("did not cause"), "the block must state the change did not cause the findings");
  assert(text.includes("missing-a.test.js"), "the block must list the finding");
  const notes = [];
  await entry[1].handler("t-e3-ui cap", { cwd: root, hasUI: true, ui: { notify: (m, level) => notes.push(`${level}: ${m}`) } });
  const warned = notes.join("\n");
  assert(warned.includes("did not cause"), "the UI notify must state the change did not cause the findings");
  assert(warned.includes("missing-a.test.js"), "the UI notify must list the finding itself, not only a count");
});

// --- teardown -----------------------------------------------------------------

for (const d of sandboxes) fs.rmSync(d, { recursive: true, force: true });
console.log(`\n${pass} passed, ${fail} failed`);
if (failures.length) console.log(failures.join("\n"));
process.exit(fail ? 1 : 0);
