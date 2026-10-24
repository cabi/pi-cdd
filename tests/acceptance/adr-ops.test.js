#!/usr/bin/env node
// adr-ops — the adrs discovery op end to end through the real tool: the
// unfiltered table over the live store, the status filter and its
// nearest-match refusal hints, the reverse lookup with its normalization
// and overlap semantics, and the op-library execution guard.
// Pins: ADDED "The adrs op discovers governing decisions" scenarios and the
// extension delta's help/unknown-option/direct-execution scenarios.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
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

const idsIn = (text) => (text.match(/ADR-\d{4}/g) ?? []);
const OVERLAP = ["ADR-0006", "ADR-0007", "ADR-0008", "ADR-0009", "ADR-0011", "ADR-0012"];
const DIR_LIB = ["ADR-0003", "ADR-0006", "ADR-0007", "ADR-0008", "ADR-0009", "ADR-0010", "ADR-0011", "ADR-0012", "ADR-0013"];

// --- the table, the filter, and the hints over the live store --------------------

await check("AO1", "the unfiltered table lists every ADR in id order with title and status", async () => {
  const r = await call({ op: "adrs" }, REPO);
  assert(!r.isError, `adrs must succeed over the live store: ${r.content[0].text}`);
  const text = r.content[0].text;
  const ids = idsIn(text);
  const want = Array.from({ length: 13 }, (_, i) => `ADR-${String(i + 1).padStart(4, "0")}`);
  assert(JSON.stringify(ids) === JSON.stringify(want), `13 ids in order, got: ${JSON.stringify(ids)}`);
  assert(text.includes("[superseded]"), `statuses render: ${text}`);
  assert(text.includes("Gherkin is the scenario language"), `titles render (ADR-0005's title): ${text}`);
});

await check("AO2", "the status filter narrows to the matching ADRs", async () => {
  const r = await call({ op: "adrs", options: JSON.stringify({ status: "superseded" }) }, REPO);
  assert(!r.isError, `filter must succeed: ${r.content[0].text}`);
  const ids = idsIn(r.content[0].text);
  assert(JSON.stringify(ids) === JSON.stringify(["ADR-0005"]), `exactly the superseded one, got: ${JSON.stringify(ids)}`);
});

const hintRefusal = async (id, name, value, hint) => {
  await check(id, name, async () => {
    const r = await call({ op: "adrs", options: JSON.stringify({ status: value }) }, REPO);
    assert(r.isError === true, `expected an error result, got: ${JSON.stringify(r.content[0].text)}`);
    assert(r.content.length === 1 && r.content[0].type === "text", "exactly one text result");
    assert(!/unknown op/.test(r.content[0].text), `refusal from the adrs op, not the dispatcher: ${r.content[0].text}`);
    const text = r.content[0].text;
    for (const st of ["accepted", "superseded", "draft", "proposed"]) {
      assert(text.includes(st), `refusal lists ${st}: ${text}`);
    }
    assert(text.includes(hint), `refusal hints "${hint}": ${text}`);
  });
};

await hintRefusal("AO3", "an unknown status by edit distance refuses with a hint", "drafed", "did you mean: --status draft");
await hintRefusal("AO4", "an unambiguous prefix refuses with a hint", "prop", "did you mean: --status proposed");

// --- the reverse lookup over the live store ---------------------------------------

const codeQuery = async (id, name, code, expected) => {
  await check(id, name, async () => {
    const r = await call({ op: "adrs", options: JSON.stringify({ code }) }, REPO);
    assert(!r.isError, `${code} must answer, got: ${r.content[0].text}`);
    const ids = idsIn(r.content[0].text);
    assert(JSON.stringify(ids) === JSON.stringify(expected), `expected ${JSON.stringify(expected)}, got: ${JSON.stringify(ids)}`);
  });
};

await codeQuery("AO5", "overlapping claims list every governing accepted ADR in id order", "lib/templates.mjs", OVERLAP);
await codeQuery("AO6", "a dot-slash path normalizes to the relative form", "./lib/templates.mjs", OVERLAP);
await codeQuery("AO7", "an absolute path relativizes against the store root", path.join(REPO, "lib/templates.mjs"), OVERLAP);
await codeQuery("AO9", "a directory answers any claimed file under it, stating the semantics", "lib", DIR_LIB);

await check("AO5b", "the superseded ADR is listed nowhere in the overlap answer", async () => {
  const r = await call({ op: "adrs", options: JSON.stringify({ code: "lib/templates.mjs" }) }, REPO);
  assert(!r.isError, `query must succeed: ${r.content[0].text}`);
  assert(!r.content[0].text.includes("ADR-0005"), `superseded ADR-0005 must not appear: ${r.content[0].text}`);
});

await check("AO9b", "the directory answer states that a directory matches any claimed file under it", async () => {
  const r = await call({ op: "adrs", options: JSON.stringify({ code: "lib" }) }, REPO);
  assert(!r.isError, `query must succeed: ${r.content[0].text}`);
  assert(/any claimed file under/.test(r.content[0].text), `semantics stated: ${r.content[0].text}`);
});

await check("AO8", "a path outside the store root refuses", async () => {
  const r = await call({ op: "adrs", options: JSON.stringify({ code: "/etc/passwd" }) }, REPO);
  assert(r.isError === true, `expected an error result, got: ${JSON.stringify(r.content[0].text)}`);
  assert(/outside the store root/.test(r.content[0].text), `refusal names the outside-root rule: ${r.content[0].text}`);
});

await check("AO10", "no governing ADR answers empty with the remedy hint", async () => {
  const r = await call({ op: "adrs", options: JSON.stringify({ code: "no/such/file.mjs" }) }, REPO);
  assert(!r.isError, `an empty answer is a result, not an error: ${JSON.stringify(r.content[0].text)}`);
  assert(idsIn(r.content[0].text).length === 0, `no ADR may be listed: ${r.content[0].text}`);
  assert(/run `cdd adrs`/.test(r.content[0].text), `answer carries the remedy hint: ${r.content[0].text}`);
});

// --- a sandbox store with exactly 1 ADR --------------------------------------------

function adrStore() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-aop-"));
  lib.initStore(root, REPO, {});
  fs.mkdirSync(path.join(root, "cdd", "decisions"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "cdd", "decisions", "0001-one.md"),
    "---\nstatus: accepted\ncode: lib/one.mjs\n---\n# One decision\n\nBody.\n"
  );
  return root;
}

await check("AO11", "the adrs op refuses unknown options naming the allowed ones", async () => {
  const root = adrStore();
  const r = await call({ op: "adrs", options: JSON.stringify({ sort: "alpha" }) }, root);
  assert(r.isError === true, `expected an error result, got: ${JSON.stringify(r.content[0].text)}`);
  const text = r.content[0].text;
  assert(/allowed/.test(text), `error names the allowed options: ${text}`);
  assert(text.includes("status") && text.includes("code"), `allowed list names status and code: ${text}`);
  assert(fs.readFileSync(path.join(root, "cdd", "decisions", "0001-one.md"), "utf8") === "---\nstatus: accepted\ncode: lib/one.mjs\n---\n# One decision\n\nBody.\n", "nothing is written by a refusal");
  fs.rmSync(root, { recursive: true, force: true });
});

// --- the tool declaration and the library's execution guard ------------------------

await check("AO12", "help documents both ops and the adrs entry renders the shared vocabulary in order", async () => {
  const r = await call({ op: "help" }, REPO);
  assert(!r.isError, `help must succeed: ${r.content[0].text}`);
  const text = r.content[0].text;
  const firstAdrs = text.search(/\badrs\b/);
  assert(firstAdrs >= 0, `help documents adrs: ${text}`);
  assert(text.search(/\breconfirm\b/) >= 0, `help documents reconfirm: ${text}`);
  const vocabAt = text.indexOf("accepted, superseded, draft, proposed");
  assert(vocabAt > firstAdrs, `the adrs entry renders the 4 shared statuses in constant order after the adrs mention: ${text}`);
});

await check("AO13", "the ADR op library refuses silent direct execution", async () => {
  const r = spawnSync("node", [path.join(REPO, "lib", "adr-ops.mjs")], { encoding: "utf8" });
  assert(r.status === 2, `direct execution must exit 2, got ${r.status} (stderr: ${r.stderr})`);
  const lines = (r.stderr ?? "").split("\n").filter((l) => l.trim());
  assert(lines.length === 1, `exactly 1 stderr line, got ${lines.length}: ${JSON.stringify(lines)}`);
  assert(/adrs/.test(lines[0]), `the line names the adrs op: ${lines[0]}`);
});

console.log(`\nadr-ops: ${pass} passed, ${fail} failed`);
if (failures.length) {
  for (const f of failures) console.error(`  ${f}`);
  process.exitCode = 1;
}
