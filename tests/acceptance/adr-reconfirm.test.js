#!/usr/bin/env node
// adr-reconfirm — the reconfirm op end to end through the real tool: the
// pinned append for open and archived changes, every refusal, the --check
// pre-flight on both branches (reconfirmed and never-reconfirmed baselines)
// over a synthetic git history with controlled commit dates, and the store
// sweep holding every reconfirmation line to the pinned grammar.
// Pins: ADDED "The reconfirm op records decision reconfirmation" scenarios and
// the extension delta's unknown-option scenario.

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

const PINNED = /^- Reconfirmed by .+ on \d{4}-\d{2}-\d{2}: .+$/;
const today = () => new Date().toISOString().slice(0, 10);

// a sandbox store holding exactly 1 ADR (accepted by default)
function adrRoot({ status = "accepted", extraBody = "" } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-rc-"));
  lib.initStore(root, REPO, {});
  fs.mkdirSync(path.join(root, "cdd", "decisions"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "cdd", "decisions", "0001-one.md"),
    `---\nstatus: ${status}\ncode: lib/one.mjs\n---\n# One decision\n\n${extraBody}`.replace(/\n$/, "") + "\n"
  );
  return root;
}
const adrFile = (root) => path.join(root, "cdd", "decisions", "0001-one.md");
const openChange = (root, name = "t-change") => {
  fs.mkdirSync(path.join(root, "cdd", "changes", name), { recursive: true });
  fs.writeFileSync(path.join(root, "cdd", "changes", name, "proposal.md"), `# ${name}\n\nWhy: fixture.\n`);
};
const archivedChange = (root, name = "old-change") => {
  fs.mkdirSync(path.join(root, "cdd", "archive", `20261023-${name}`), { recursive: true });
};
const reconfirmLines = (root) =>
  fs.readFileSync(adrFile(root), "utf8").split("\n").filter((l) => /reconfirm/i.test(l));

// --- the pinned append --------------------------------------------------------------

await check("RC1", "reconfirm appends the pinned line for the open change with today's date", async () => {
  const root = adrRoot();
  openChange(root);
  const r = await call({ op: "reconfirm", options: JSON.stringify({ id: "ADR-0001", evidence: "still holds" }) }, root);
  assert(!r.isError, `reconfirm must succeed: ${r.content[0].text}`);
  const lines = reconfirmLines(root);
  assert(lines.length === 1, `exactly 1 reconfirmation line, got ${lines.length}: ${JSON.stringify(lines)}`);
  assert(lines[0] === `- Reconfirmed by t-change on ${today()}: still holds`, `pinned format: ${lines[0]}`);
  assert(PINNED.test(lines[0]), `grammar: ${lines[0]}`);
  fs.rmSync(root, { recursive: true, force: true });
});

await check("RC2", "an archived change name works post-Close", async () => {
  const root = adrRoot();
  archivedChange(root);
  const r = await call(
    { op: "reconfirm", options: JSON.stringify({ id: "ADR-0001", change: "old-change", evidence: "post-close debt" }) },
    root
  );
  assert(!r.isError, `reconfirm must succeed post-archive: ${r.content[0].text}`);
  const lines = reconfirmLines(root);
  assert(lines.length === 1 && lines[0] === `- Reconfirmed by old-change on ${today()}: post-close debt`, `pinned format: ${lines[0]}`);
  fs.rmSync(root, { recursive: true, force: true });
});

// --- every refusal is exactly one error result and leaves the file unchanged --------

const REFUSALS = [
  ["RC3", "an unknown ADR id refuses", { id: "ADR-0099", evidence: "x" }, (root) => true, /unknown|no ADR/],
  [
    "RC4",
    "a superseded ADR refuses naming the supersede path",
    { id: "ADR-0001", evidence: "x" },
    (root) => true,
    /supersede/,
  ],
  ["RC5", "no open change and none given refuses", { id: "ADR-0001", evidence: "x" }, (root) => false, /change/],
  ["RC6", "missing evidence refuses", { id: "ADR-0001" }, (root) => true, /evidence/],
];
for (const [id, name, options, withOpen, pattern] of REFUSALS) {
  await check(id, name, async () => {
    const root = adrRoot(id === "RC4" ? { status: "superseded" } : {});
    if (withOpen(root)) openChange(root);
    const before = fs.readFileSync(adrFile(root), "utf8");
    const r = await call({ op: "reconfirm", options: JSON.stringify(options) }, root);
    assert(r.isError === true, `expected an error result, got: ${JSON.stringify(r.content[0].text)}`);
    assert(r.content.length === 1 && r.content[0].type === "text", "exactly one text result");
    assert(!/unknown op/.test(r.content[0].text), `refusal from the reconfirm op, not the dispatcher: ${r.content[0].text}`);
    assert(pattern.test(r.content[0].text), `refusal names the reason: ${r.content[0].text}`);
    assert(fs.readFileSync(adrFile(root), "utf8") === before, "the ADR file is unchanged by a refusal");
    fs.rmSync(root, { recursive: true, force: true });
  });
}

await check("RC7", "the same change reconfirming twice refuses naming the existing line", async () => {
  const root = adrRoot({ extraBody: "- Reconfirmed by t-change on 2026-01-02: prior evidence\n" });
  openChange(root);
  const before = fs.readFileSync(adrFile(root), "utf8");
  const r = await call({ op: "reconfirm", options: JSON.stringify({ id: "ADR-0001", evidence: "again" }) }, root);
  assert(r.isError === true, `expected an error result, got: ${JSON.stringify(r.content[0].text)}`);
  assert(/t-change/.test(r.content[0].text) && /already|existing|twice/.test(r.content[0].text), `names the existing reconfirmation: ${r.content[0].text}`);
  assert(fs.readFileSync(adrFile(root), "utf8") === before, "the ADR file is unchanged");
  fs.rmSync(root, { recursive: true, force: true });
});

await check("RC8", "the reconfirm op refuses unknown options naming the allowed ones", async () => {
  const root = adrRoot();
  openChange(root);
  const before = fs.readFileSync(adrFile(root), "utf8");
  const r = await call({ op: "reconfirm", options: JSON.stringify({ id: "ADR-0001", force: true }) }, root);
  assert(r.isError === true, `expected an error result, got: ${JSON.stringify(r.content[0].text)}`);
  assert(/allowed/.test(r.content[0].text), `error names the allowed options: ${r.content[0].text}`);
  assert(/change/.test(r.content[0].text) && /evidence/.test(r.content[0].text) && /check/.test(r.content[0].text), `allowed list names change, evidence, check: ${r.content[0].text}`);
  assert(fs.readFileSync(adrFile(root), "utf8") === before, "the ADR file is unchanged");
  fs.rmSync(root, { recursive: true, force: true });
});

// --- --check over a synthetic git history with controlled dates ----------------------

function gitRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-rcg-"));
  const git = (args, date = "2026-10-19T12:00:00") =>
    execFileSync("git", ["-C", root, ...args], {
      stdio: "pipe",
      env: { ...process.env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date },
    });
  git(["init", "-q"]);
  git(["config", "user.email", "t@t"]);
  git(["config", "user.name", "t"]);
  lib.initStore(root, REPO, {});
  return { root, git };
}
const writeAdr = (root, num, code, reconfirm = null) => {
  const body = reconfirm ? `\n${reconfirm}\n` : "\n";
  fs.writeFileSync(
    path.join(root, "cdd", "decisions", `${num}-dec.md`),
    `---\nstatus: accepted\ncode: ${code}\n---\n# Decision ${num}\n${body}`
  );
};
const openChangeClaiming = (root, name, codeLine) => {
  const dir = path.join(root, "cdd", "changes", name, "specs", "cap");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "spec.md"),
    `## ADDED Requirements\n\n### Requirement: Probe\n\n\`\`\`gherkin\nFeature: Probe\n\nScenario: Probe\n  Given a fixture delta\n  When it runs\n  Then it works\n  # Verified by: tests/acceptance/cap.test.js\n\`\`\`\n\nCode: ${codeLine}\n`
  );
  fs.writeFileSync(path.join(root, "cdd", "changes", name, "proposal.md"), `# ${name}\n\nWhy: fixture.\n`);
};

await check("RC9", "--check lists exactly the ADRs whose claimed files moved past their latest reconfirmation", async () => {
  const { root, git } = gitRepo();
  writeAdr(root, "0001", "lib/a.mjs", "- Reconfirmed by old-change on 2026-10-23: prior evidence");
  writeAdr(root, "0002", "lib/b.mjs", "- Reconfirmed by old-change on 2026-10-22: prior evidence");
  fs.mkdirSync(path.join(root, "lib"), { recursive: true });
  fs.writeFileSync(path.join(root, "lib", "a.mjs"), "export const a = 1;\n");
  fs.writeFileSync(path.join(root, "lib", "b.mjs"), "export const b = 1;\n");
  openChangeClaiming(root, "t-check", "lib/a.mjs, lib/b.mjs");
  fs.mkdirSync(path.join(root, "tests", "acceptance"), { recursive: true });
  fs.writeFileSync(path.join(root, "tests", "acceptance", "cap.test.js"), "// pin target\n");
  git(["add", "."]);
  git(["commit", "-qm", "init"]);
  // lib/a.mjs moves 2026-10-24 — past ADR-0001's reconfirmation (2026-10-23)
  fs.writeFileSync(path.join(root, "lib", "a.mjs"), "export const a = 2;\n");
  git(["add", "lib/a.mjs"], "2026-10-24T12:00:00");
  git(["commit", "-qm", "a moves"], "2026-10-24T12:00:00");
  // lib/b.mjs last moved at init (2026-10-19) — before ADR-0002's reconfirmation (2026-10-22)
  const r = await call({ op: "reconfirm", options: JSON.stringify({ check: true }) }, root);
  assert(!r.isError, `--check must succeed: ${r.content[0].text}`);
  const text = r.content[0].text;
  assert(text.includes("ADR-0001"), `lists ADR-0001: ${text}`);
  assert(text.includes("lib/a.mjs"), `names the moved file: ${text}`);
  assert(!text.includes("ADR-0002"), `ADR-0002's claims did not move past its reconfirmation: ${text}`);
  fs.rmSync(root, { recursive: true, force: true });
});

await check("RC10", "--check falls back to the ADR file's own commits when never reconfirmed", async () => {
  const { root, git } = gitRepo();
  writeAdr(root, "0001", "lib/c.mjs"); // never reconfirmed
  writeAdr(root, "0002", "lib/d.mjs"); // never reconfirmed
  fs.mkdirSync(path.join(root, "lib"), { recursive: true });
  fs.writeFileSync(path.join(root, "lib", "c.mjs"), "export const c = 1;\n");
  fs.writeFileSync(path.join(root, "lib", "d.mjs"), "export const d = 1;\n");
  openChangeClaiming(root, "t-check", "lib/c.mjs, lib/d.mjs");
  fs.mkdirSync(path.join(root, "tests", "acceptance"), { recursive: true });
  fs.writeFileSync(path.join(root, "tests", "acceptance", "cap.test.js"), "// pin target\n");
  git(["add", "."]);
  git(["commit", "-qm", "init"]);
  // lib/c.mjs moves 2026-10-21 — past the ADR file's init commit (2026-10-19)
  fs.writeFileSync(path.join(root, "lib", "c.mjs"), "export const c = 2;\n");
  git(["add", "lib/c.mjs"], "2026-10-21T12:00:00");
  git(["commit", "-qm", "c moves"], "2026-10-21T12:00:00");
  // ADR-0002's own file moves 2026-10-22 — after its code (2026-10-19): not listed
  writeAdr(root, "0002", "lib/d.mjs");
  fs.appendFileSync(path.join(root, "cdd", "decisions", "0002-dec.md"), "\nTouched after init — moves this ADR file's own commit date.\n");
  git(["add", "cdd/decisions/0002-dec.md"], "2026-10-22T12:00:00");
  git(["commit", "-qm", "adr 2 touched"], "2026-10-22T12:00:00");
  const r = await call({ op: "reconfirm", options: JSON.stringify({ check: true }) }, root);
  assert(!r.isError, `--check must succeed: ${r.content[0].text}`);
  const text = r.content[0].text;
  assert(text.includes("ADR-0001"), `lists the never-reconfirmed ADR-0001: ${text}`);
  assert(!text.includes("ADR-0002"), `ADR-0002 was touched after its code — not listed: ${text}`);
  fs.rmSync(root, { recursive: true, force: true });
});

// --- the store sweep over the live corpus -------------------------------------------

await check("RC11", "every reconfirmation line in every live ADR matches the pinned grammar", async () => {
  const dir = path.join(REPO, "cdd", "decisions");
  const bad = [];
  let total = 0;
  for (const f of fs.readdirSync(dir).sort()) {
    const lines = fs.readFileSync(path.join(dir, f), "utf8").split("\n");
    lines.forEach((l, i) => {
      if (!/reconfirmed.?by/i.test(l)) return;
      total++;
      if (!PINNED.test(l)) bad.push(`${f}:${i + 1}: ${l}`);
    });
  }
  assert(total > 20, `the corpus holds a real reconfirmation history (expected > 20 lines, found ${total})`);
  assert(bad.length === 0, `legacy/off-grammar lines remain:\n${bad.join("\n")}`);
});

await check("RC12", "an unknown change name refuses naming the namespaces", async () => {
  const root = adrRoot();
  openChange(root);
  const before = fs.readFileSync(adrFile(root), "utf8");
  const r = await call(
    { op: "reconfirm", options: JSON.stringify({ id: "ADR-0001", change: "no-such-change", evidence: "x" }) },
    root
  );
  assert(r.isError, "unknown change must refuse");
  const t = r.content[0].text;
  assert(/unknown change "no-such-change"/.test(t), t);
  assert(/t-change/.test(t), `must name the open change: ${t}`);
  assert(/cdd\/archive/.test(t), `must name the archive namespace: ${t}`);
  assert(fs.readFileSync(adrFile(root), "utf8") === before, "refusal must not touch the ADR file");
  fs.rmSync(root, { recursive: true, force: true });
});

await check("RC13", "multi-line evidence refuses naming the one-line rule", async () => {
  const root = adrRoot();
  openChange(root);
  const before = fs.readFileSync(adrFile(root), "utf8");
  const r = await call(
    { op: "reconfirm", options: JSON.stringify({ id: "ADR-0001", evidence: "line one\nline two" }) },
    root
  );
  assert(r.isError, "multi-line evidence must refuse");
  assert(/one line/.test(r.content[0].text), r.content[0].text);
  assert(fs.readFileSync(adrFile(root), "utf8") === before, "refusal must not touch the ADR file");
  fs.rmSync(root, { recursive: true, force: true });
});

await check("RC14", "--check refuses ambiguity and narrows to an explicit change", async () => {
  const root = adrRoot();
  openChange(root, "a-change");
  openChange(root, "b-change");
  let r = await call({ op: "reconfirm", options: '{"check":true}' }, root);
  assert(r.isError, "ambiguous --check must refuse");
  const t = r.content[0].text;
  assert(/a-change, b-change/.test(t) && /--change/.test(t), t);
  r = await call({ op: "reconfirm", options: '{"check":true,"change":"a-change"}' }, root);
  assert(!r.isError, `explicit --check must run: ${r.isError ? r.content[0].text : ""}`);
  assert(/a-change/.test(r.content[0].text) && !/b-change/.test(r.content[0].text), r.content[0].text);
  fs.rmSync(root, { recursive: true, force: true });
});

await check("RC15", "a new reconfirmation lands below the existing ones", async () => {
  const root = adrRoot({
    extraBody:
      "- Reconfirmed by first-change on 2026-10-01: first\n- Reconfirmed by second-change on 2026-10-02: second\n\n## Trailing\n\nBody after.\n",
  });
  openChange(root);
  const r = await call(
    { op: "reconfirm", options: JSON.stringify({ id: "ADR-0001", evidence: "third ride" }) },
    root
  );
  assert(!r.isError, r.isError ? r.content[0].text : "");
  const lines = fs.readFileSync(adrFile(root), "utf8").split("\n");
  const at = lines.findIndex((l) => l === "- Reconfirmed by second-change on 2026-10-02: second");
  assert(at > 0, "fixture must hold the second reconfirmation line");
  assert(lines[at + 1] === `- Reconfirmed by t-change on ${today()}: third ride`, `new line must sit below the last existing one: ${lines[at + 1]}`);
  assert(lines.slice(at + 2).some((l) => l === "## Trailing"), "trailing sections stay below the new line");
  fs.rmSync(root, { recursive: true, force: true });
});

console.log(`\nadr-reconfirm: ${pass} passed, ${fail} failed`);
if (failures.length) {
  for (const f of failures) console.error(`  ${f}`);
  process.exitCode = 1;
}
