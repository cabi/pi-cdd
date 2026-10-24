#!/usr/bin/env node
// adr-index-agreement — the shared ADR claims index: the index builds one
// entry per ADR in the live store with the full field shape, the glob
// matcher is defined exactly once across its consumers, and the op's
// governing set and the guard's A1 citations answer the same question on a
// synthetic repo state.
// Pins: ADDED "The ADR claims index is single-sourced" scenarios.

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

// the shared module loads (null until scripts/adr-index.mjs exists)
const adrIdx = await import(path.join(REPO, "scripts", "adr-index.mjs")).then(
  (m) => m,
  () => null
);

// --- AG1: the index builds one entry per ADR in the live store ----------------------

await check("AG1", "the index holds 12 entries with the full field shape", async () => {
  assert(adrIdx !== null, "scripts/adr-index.mjs must exist and export the shared index");
  const entries = adrIdx.buildAdrIndex(REPO);
  assert(Array.isArray(entries) && entries.length === 12, `12 entries, got ${entries?.length}`);
  assert(entries[0].id === "ADR-0001" && entries[11].id === "ADR-0012", `ids in order: ${entries.map((e) => e.id).join(",")}`);
  // fields computed independently from the raw files (cross-validation, not tautology)
  for (const e of entries) {
    const raw = fs.readFileSync(path.join(REPO, e.fileRel), "utf8");
    const heading = raw.split("\n").find((l) => l.startsWith("# "));
    assert(e.title === heading.slice(2), `title of ${e.id} is the first heading: ${JSON.stringify(e.title)}`);
    assert(e.supersedes === null, `supersedes is null in this corpus (${e.id})`);
    assert(typeof e.status === "string" && e.status.length > 0, `status parsed for ${e.id}`);
    assert(Array.isArray(e.globs), `globs parsed for ${e.id}`);
  }
  const a5 = entries.find((e) => e.id === "ADR-0005");
  assert(a5.status === "superseded", `ADR-0005 is superseded: ${a5.status}`);
  const a8 = entries.find((e) => e.id === "ADR-0008");
  assert(
    JSON.stringify(a8.globs) === JSON.stringify(["lib/templates.mjs", "lib/instructions.mjs", "lib/context.mjs", "lib/help.mjs"]),
    `ADR-0008 globs: ${JSON.stringify(a8.globs)}`
  );
});

// --- AG2: no consumer re-states the matcher -----------------------------------------

await check("AG2", "the glob-to-regex translation is defined exactly once, in the shared module", async () => {
  const targets = ["scripts/adr-index.mjs", "scripts/spec-drift.mjs", "lib/adr-ops.mjs"];
  for (const t of targets) {
    assert(fs.existsSync(path.join(REPO, t)), `${t} exists`);
  }
  const texts = Object.fromEntries(targets.map((t) => [t, fs.readFileSync(path.join(REPO, t), "utf8")]));
  // the definition (a function/const named globToRe, or the star-translation body) lives only in the shared module
  for (const [t, text] of Object.entries(texts)) {
    const defines = /(?:function\s+globToRe|const\s+globToRe\s*=|globToRe\s*\()/.test(text) && /\[\^\/\]\*/.test(text);
    if (t === "scripts/adr-index.mjs") {
      assert(defines, `the shared module defines the matcher (globToRe + the star translation)`);
    } else {
      assert(!/\[\^\/\]\*/.test(text), `${t} must not re-state the star translation — import it instead`);
    }
  }
});

// --- AG3: the op and the guard answer the same governing set -------------------------

await check("AG3", "the op's governing set equals the guard's A1 citations on a synthetic repo", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-ag-"));
  const git = (...a) => execFileSync("git", ["-C", root, ...a], { stdio: "pipe", encoding: "utf8" });
  git("init", "-q");
  git("config", "user.email", "t@t");
  git("config", "user.name", "t");
  lib.initStore(root, REPO, {});
  fs.mkdirSync(path.join(root, "cdd", "decisions"), { recursive: true });
  fs.writeFileSync(path.join(root, "cdd", "decisions", "0001-alpha.md"), "---\nstatus: accepted\ncode: src/thing.mjs\n---\n# Alpha\n\nBody.\n");
  fs.writeFileSync(path.join(root, "cdd", "decisions", "0002-beta.md"), "---\nstatus: accepted\ncode: src/*.mjs\n---\n# Beta\n\nBody.\n");
  const dir = path.join(root, "cdd", "changes", "fix-thing", "specs", "cap");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "spec.md"),
    "## ADDED Requirements\n\n### Requirement: Probe\n\n```gherkin\nFeature: Probe\n\nScenario: Probe\n  Given a fixture delta\n  When it runs\n  Then it works\n  # Verified by: tests/acceptance/cap.test.js\n```\n\nCode: src/thing.mjs\n"
  );
  fs.writeFileSync(path.join(root, "cdd", "changes", "fix-thing", "proposal.md"), "# fix-thing\n\nWhy: fixture. No ADR citations.\n");
  fs.mkdirSync(path.join(root, "src"), { recursive: true });
  fs.writeFileSync(path.join(root, "src", "thing.mjs"), "export const thing = 1;\n");
  fs.mkdirSync(path.join(root, "tests", "acceptance"), { recursive: true });
  fs.writeFileSync(path.join(root, "tests", "acceptance", "cap.test.js"), "// pin target\n");
  git("add", ".");
  git("commit", "-qm", "init");
  fs.symlinkSync(path.join(REPO, "node_modules"), path.join(root, "node_modules"), "dir");

  // the guard side: A1 citations
  let scan;
  try {
    scan = { code: 0, out: execFileSync("node", [path.join(root, "cdd", "scripts", "spec-drift.mjs")], { encoding: "utf8", cwd: root, stdio: ["ignore", "pipe", "pipe"] }) };
  } catch (e) {
    scan = { code: e.status ?? 1, out: (e.stdout ?? "") + (e.stderr ?? "") };
  }
  const a1 = scan.out.split("\n").filter((l) => l.includes("[A1]"));
  assert(scan.code !== 0, `the uncited overlap must keep the scan red: ${scan.out}`);
  assert(a1.length === 2, `exactly 2 A1 findings (one per governing ADR), got ${a1.length}: ${JSON.stringify(a1)}`);
  const guardIds = a1.map((l) => (l.match(/ADR-\d{4}/) ?? [])[0]).sort();

  // the op side: the reverse lookup over the same store
  const r = await call({ op: "adrs", options: JSON.stringify({ code: "src/thing.mjs" }) }, root);
  assert(!r.isError, `adrs must answer on the synthetic store: ${r.content[0].text}`);
  const opIds = (r.content[0].text.match(/ADR-\d{4}/g) ?? []).sort();
  assert(JSON.stringify(opIds) === JSON.stringify(guardIds), `op ${JSON.stringify(opIds)} == guard ${JSON.stringify(guardIds)}`);
  fs.rmSync(root, { recursive: true, force: true });
});

console.log(`\nadr-index-agreement: ${pass} passed, ${fail} failed`);
if (failures.length) {
  for (const f of failures) console.error(`  ${f}`);
  process.exitCode = 1;
}
