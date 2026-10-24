#!/usr/bin/env node
// ops-registry — pins the single derivation of the op surface: the op table
// lives exactly once, in lib/ops.mjs, and every consumer answers from it —
// the tool declaration's enum, the help op's per-op documentation, the
// dispatch case labels, each case's option whitelist, and the two
// "Commands and tools" rows the help screen renders. The pin holds the real
// extension entry (loaded the way pi loads it) and the real help renderer
// to the registry, so a hand-edited surface drifts red here by construction.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

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

function sandbox() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "pi-cdd-ops-reg-"));
  return { root: d, dispose: () => fs.rmSync(d, { recursive: true, force: true }) };
}

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

const ops = await import(path.join(REPO, "lib", "ops.mjs"));
const { helpText } = await import(path.join(REPO, "lib", "help.mjs"));
const indexSrc = fs.readFileSync(path.join(REPO, "index.ts"), "utf8");

// --- OR1: the registry itself ---------------------------------------------------

await check("OR1", "lib/ops.mjs holds one ordered table: 9 ops, 5 commands, 7 legacy aliases", () => {
  const r = ops;
  assert(Array.isArray(r.OP_NAMES) && r.OP_NAMES.length === 9, `OP_NAMES must hold all nine ops, got ${r.OP_NAMES?.length}`);
  assert(Array.isArray(r.COMMANDS) && r.COMMANDS.length === 5, `COMMANDS must hold the five slash commands, got ${r.COMMANDS?.length}`);
  assert(Object.keys(r.OP_ALIASES).length === 7, `OP_ALIASES must hold the seven legacy aliases, got ${Object.keys(r.OP_ALIASES ?? {}).length}`);
  assert(JSON.stringify(Object.keys(r.OPS_DOC)) === JSON.stringify(r.OP_NAMES), "OPS_DOC keys must equal OP_NAMES in registry order");
  for (const row of r.OPS) {
    assert(typeof row.description === "string" && row.description.length > 0, `${row.name} row needs a description`);
    assert(row.parameters && typeof row.parameters === "object", `${row.name} row needs a parameters fragment`);
  }
});

// --- OR2: the declaration and the command surface answer from the registry ------

await check("OR2", "declaration enum equals OP_NAMES; the 5 registered commands equal COMMANDS in order", () => {
  const r = ops;
  const t = api.tools[0];
  assert(t.name === "cdd", `tool name: ${t.name}`);
  const declared = t.parameters.properties.op.enum;
  assert(JSON.stringify(declared) === JSON.stringify(r.OP_NAMES), `declaration enum ${JSON.stringify(declared)} != OP_NAMES ${JSON.stringify(r.OP_NAMES)}`);
  const registered = api.commands.map(([name]) => name);
  assert(JSON.stringify(registered) === JSON.stringify(r.COMMANDS), `registered commands ${JSON.stringify(registered)} != COMMANDS ${JSON.stringify(r.COMMANDS)}`);
});

// --- OR3: dispatch case labels agree with the registry, one each, none extra -----

await check("OR3", "index.ts holds exactly one `case \"<op>\":` per registry op and no other case label", () => {
  const r = ops;
  const labels = [...indexSrc.matchAll(/case "([a-z]+)":/g)].map((m) => m[1]);
  const expected = [...r.OP_NAMES].sort();
  const got = [...labels].sort();
  assert(JSON.stringify(got) === JSON.stringify(expected), `case labels ${JSON.stringify(got)} != registry ops ${JSON.stringify(expected)}`);
});

// --- OR4: every case's option whitelist is the registry row's parameter keys -----

await check("OR4", "option whitelists equal the registry rows' parameter keys — probed through real execute", async () => {
  const r = ops;
  const sb = sandbox();
  try {
    for (const row of r.OPS) {
      const keys = Object.keys(row.parameters.properties ?? {});
      if (keys.length === 0) continue; // status and help: asserted structurally in OR5
      const res = await call({ op: row.name, options: JSON.stringify({ zz_registry_probe: 1 }) }, sb.root);
      assert(res.isError, `${row.name}: an unknown option must be refused, got ${textOf(res).slice(0, 80)}`);
      const text = textOf(res);
      assert(text.includes("zz_registry_probe"), `${row.name}: error must name the unknown option: ${text}`);
      assert(
        text.includes(`(allowed: ${keys.join(", ")})`),
        `${row.name}: allowed list must equal the row's parameter keys "${keys.join(", ")}": ${text}`,
      );
    }
  } finally {
    sb.dispose();
  }
});

await check("OR5", "status and help declare no options and their cases call no parseOptions", () => {
  const r = ops;
  for (const name of ["status", "help"]) {
    const row = r.OPS.find((o) => o.name === name);
    assert(row, `registry has no ${name} row`);
    assert(Object.keys(row.parameters.properties ?? {}).length === 0, `${name} row must declare no options`);
    const body = indexSrc.split(`case "${name}":`)[1]?.split('case "')[0] ?? "";
    assert(!body.includes("parseOptions("), `${name} case must not whitelist options`);
  }
});

// --- OR6: the declaration description walks every registry op --------------------

await check("OR6", "the tool declaration's description names every registry op", () => {
  const r = ops;
  const description = api.tools[0].description;
  for (const name of r.OP_NAMES) {
    assert(new RegExp(`\\b${name}\\b`).test(description), `declaration description never names the op "${name}"`);
  }
});

// --- OR7: the help rows render from the registry ---------------------------------

await check("OR7", "the two Commands-and-tools rows equal the registry render", () => {
  const r = ops;
  const text = helpText();
  const lines = helpText().split("\n").map((l) => l.trim());
  const opsRow = `agent tool: cdd — ops: ${r.OP_NAMES.join(" · ")}`;
  const commandsRow = `/${r.COMMANDS.join(" · /")}`;
  assert(lines.includes(opsRow), `help text must render the ops row exactly "${opsRow}"`);
  assert(lines.includes(commandsRow), `help text must render the commands row exactly "${commandsRow}"`);
});

await check("OR8", "the rendered help names no command the extension does not register", () => {
  const text = helpText();
  const registered = new Set(api.commands.map(([name]) => name));
  assert(!text.includes("/cdd-validate"), "the ghost command /cdd-validate must appear nowhere in the help text");
  for (const token of text.match(/\/cdd-[a-z-]+/g) ?? []) {
    assert(registered.has(token.slice(1)), `help text names "${token}", which the extension does not register`);
  }
  // registry-independent half: the rendered ops row equals the declaration
  // enum as a set — an added or dropped op drifts red even without a registry
  const opsRowText = (text.match(/agent tool: cdd — ops: (.+)/) ?? [])[1] ?? "";
  const rendered = opsRowText.split("·").map((s) => s.trim()).filter(Boolean);
  const declared = api.tools[0].parameters.properties.op.enum;
  assert(
    JSON.stringify([...rendered].sort()) === JSON.stringify([...declared].sort()),
    `rendered ops row ${JSON.stringify(rendered)} != declaration enum ${JSON.stringify(declared)}`,
  );
});

// --- OR9: the help payload is the registry's own documentation -------------------

await check("OR9", "op help returns every registry op's docs, premise documented, was markers riding", async () => {
  const r = ops;
  const sb = sandbox();
  try {
    const res = await call({ op: "help" }, sb.root);
    assert(!res.isError, textOf(res));
    const text = textOf(res);
    for (const row of r.OPS) {
      assert(text.includes(`"${row.name}"`), `help payload must document the op "${row.name}"`);
    }
    const backlog = r.OPS_DOC.backlog;
    assert("premise" in backlog.parameters.properties, "the backlog row must document the premise option");
    const originals = ["cdd_init", "cdd_new_change", "cdd_validate", "cdd_status", "cdd_archive"];
    const carrying = r.OPS.filter((o) => o.was).map((o) => o.was);
    assert(JSON.stringify(carrying) === JSON.stringify(originals), `was markers must ride exactly the five originals, got ${JSON.stringify(carrying)}`);
    assert(
      res.details && JSON.stringify(res.details) === JSON.stringify(r.OPS_DOC),
      "the help payload must equal the registry's OPS_DOC exactly — no extra or missing op entry",
    );
  } finally {
    sb.dispose();
  }
});

// --- OR10: the smoke suite pins the rendered rows; the renderer derives ---

await check("OR10", "S21 needles the rendered rows, keeps the ghost assert, and help.mjs templates the registry", () => {
  const smokeSrc = fs.readFileSync(path.join(REPO, "tests", "smoke.mjs"), "utf8");
  const helpSrc = fs.readFileSync(path.join(REPO, "lib", "help.mjs"), "utf8");
  assert(smokeSrc.includes(`agent tool: cdd — ops: ${ops.OP_NAMES.join(" · ")}`), "tests/smoke.mjs must needle the rendered ops row");
  assert(smokeSrc.includes(`/${ops.COMMANDS.join(" · /")}`), "tests/smoke.mjs must needle the rendered commands row");
  assert(smokeSrc.includes('!txt.includes("/cdd-validate")'), "tests/smoke.mjs must keep the ghost-absence assertion");
  assert(helpSrc.includes("COMMANDS.join") && helpSrc.includes("OP_NAMES.join"), "lib/help.mjs must render both rows from the registry");
});

// --- report ------------------------------------------------------------------------

console.log(`\nops-registry: ${pass} ok, ${fail} FAIL`);
if (fail) for (const f of failures) console.error(f);
process.exit(fail ? 1 : 0);
