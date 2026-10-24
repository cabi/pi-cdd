#!/usr/bin/env node
// spec-model — pins the spec-model parse of scripts/grammar-law.mjs and the
// three readers that consume it (guard, extractor, store): one parse answers
// ops/requirements/pins/globs; a pin lookalike quoted inside a documentation
// fence is not a pin; a star glob claims the files it names.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const law = await import(path.join(REPO, "scripts", "grammar-law.mjs"));
const lib = await import(path.join(REPO, "lib", "store.mjs"));

let pass = 0;
let fail = 0;
const failures = [];
function check(id, name, fn) {
  try {
    fn();
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

const sandboxes = [];
function gitRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-sm-"));
  sandboxes.push(root);
  execFileSync("git", ["-C", root, "init", "-q"]);
  execFileSync("git", ["-C", root, "config", "user.email", "t@t"]);
  execFileSync("git", ["-C", root, "config", "user.name", "t"]);
  lib.initStore(root, REPO, {});
  fs.mkdirSync(path.join(root, "tests", "acceptance"), { recursive: true });
  fs.writeFileSync(path.join(root, "tests", "acceptance", "spec-model.test.js"), "// fixture pin target\n");
  execFileSync("git", ["-C", root, "add", "."]);
  execFileSync("git", ["-C", root, "commit", "-qm", "init"]);
  fs.symlinkSync(path.join(REPO, "node_modules"), path.join(root, "node_modules"), "dir");
  return root;
}
const runScan = (root, script, args = []) => {
  try {
    const out = execFileSync("node", [script, ...args], { encoding: "utf8", cwd: root, stdio: ["ignore", "pipe", "pipe"] });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout ?? "") + (e.stderr ?? "") };
  }
};

// --- SM1: the model is one parse with every part ----------------------------------

const DELTA_TEXT = [
  "# cap — delta",
  "",
  "## MODIFIED Requirements",
  "",
  "### Requirement: Pinned requirement",
  "",
  "Prose outside the fence.",
  "",
  "```gherkin",
  "Feature: Pinned requirement",
  "",
  "Scenario: One parse answers every part",
  "Given a spec file",
  "When the law module parses it once",
  "Then every door reads the same model",
  "  # Verified by: tests/acceptance/one.test.js",
  "```",
  "",
  "Code: src/*.mjs, docs/*.md",
  "",
  "A quoted lookalike is documentation, not a pin:",
  "",
  "```text",
  "# Verified by: tests/acceptance/lookalike.test.js",
  "```",
  "",
  "### Requirement: Second requirement",
  "",
  "Tail prose.",
  "",
].join("\n");

check("SM1", "one parse yields ops, requirements, fence-interior pins, and compiled globs", () => {
  const model = law.parseSpecModel(DELTA_TEXT);
  assert(model.ops.length === 2, `delta semantics: both requirements under the op, got ${model.ops.length}`);
  const [op, second] = model.ops;
  assert(op.op === "MODIFIED" && second.op === "MODIFIED", `expected MODIFIED, got ${op.op}/${second.op}`);
  assert(op.requirement === "Pinned requirement", `wrong requirement name: ${op.requirement}`);
  assert(second.requirement === "Second requirement", `wrong second requirement name: ${second.requirement}`);
  assert(op.startLine === 5, `expected startLine 5, got ${op.startLine}`);
  assert(op.block[0] === "### Requirement: Pinned requirement", "the block carries its heading line");
  assert(
    JSON.stringify(op.codeGlobs) === JSON.stringify(["src/*.mjs", "docs/*.md"]),
    `wrong per-block globs: ${JSON.stringify(op.codeGlobs)}`
  );
  assert(model.requirements.length === 2, `living semantics: every requirement heading, got ${model.requirements.length}`);
  assert(model.requirements[0].startLine === 5 && model.requirements[1].requirement === "Second requirement", "requirement blocks follow living semantics");
  assert(
    model.pins.length === 1 && model.pins[0] === "tests/acceptance/one.test.js",
    `only the fence-interior pin survives: ${JSON.stringify(model.pins)}`
  );
  const star = model.codeGlobs.find((c) => c.glob === "src/*.mjs");
  assert(star, "the file-level globs carry the star glob");
  assert(star.re.test("src/a.mjs"), "a single-star glob claims a file it names");
  assert(!star.re.test("src/sub/a.mjs"), "a single-star glob stops at the directory boundary");
  assert(model.codeGlobs.some((c) => c.glob === "docs/*.md" && c.re.test("docs/x.md")), "every Code-line glob compiles");
  assert(model.fences.length === 1 && model.fences[0].closed === true, "the gherkin fence is part of the model");
  // grammar-law.mjs and adr-index.mjs import each other; the cycle must load
  // in both orders (pinned here, not left to a one-shot probe).
  for (const first of ["grammar-law", "adr-index"]) {
    const second = first === "grammar-law" ? "adr-index" : "grammar-law";
    const out = execFileSync(
      "node",
      [
        "--input-type=module",
        "-e",
        `await import(${JSON.stringify(pathToFileURL(path.join(REPO, "scripts", first + ".mjs")).href)});` +
          `await import(${JSON.stringify(pathToFileURL(path.join(REPO, "scripts", second + ".mjs")).href)});` +
          `console.log("ok");`,
      ],
      { encoding: "utf8" }
    );
    assert(out.trim() === "ok", `import order ${first}-first must load clean`);
  }
});

// --- SM2: no door re-states the parse ----------------------------------------------

check("SM2", "one definition in the law, three readers, no private re-statement", () => {
  const read = (p) => fs.readFileSync(path.join(REPO, p), "utf8");
  const lawSrc = read("scripts/grammar-law.mjs");
  const guardSrc = read("scripts/spec-drift.mjs");
  const extractorSrc = read("scripts/spec-extract.mjs");
  const storeSrc = read("lib/store.mjs");
  const doorSources = [
    "scripts/grammar-law.mjs",
    "scripts/spec-drift.mjs",
    "scripts/spec-extract.mjs",
    "scripts/arch-extract.mjs",
    "scripts/adr-index.mjs",
    "lib/store.mjs",
    "lib/validate.mjs",
    "lib/gherkin.mjs",
    "lib/templates.mjs",
    "lib/instructions.mjs",
  ].map(read);
  const definitions = doorSources.filter((src) => /function parseSpecModel/.test(src));
  assert(
    definitions.length === 1 && /function parseSpecModel/.test(lawSrc),
    `parseSpecModel must be defined exactly once, in scripts/grammar-law.mjs — found ${definitions.length}`
  );
  assert(!/PIN_COMMENT/.test(extractorSrc), "spec-extract runs no private pin scan — it reads the model");
  assert(
    !/function globToRe/.test(extractorSrc) && !/\[\^\/\]\*/.test(extractorSrc),
    "spec-extract re-states no glob translation — the shared matcher lives in adr-index.mjs"
  );
  assert(/parseSpecModel/.test(extractorSrc), "spec-extract reads the spec model");
  assert(
    !/function globToRe/.test(guardSrc) && !/\[\^\/\]\*/.test(guardSrc),
    "the guard keeps the shared matcher, never a private translation"
  );
  assert(
    !/### Requirement/.test(guardSrc) && !/(ADDED|MODIFIED|REMOVED) Requirements/.test(guardSrc),
    "the guard re-states no block grammar — it reads the model"
  );
  assert(/parseSpecModel/.test(guardSrc), "the guard reads the spec model");
  assert(
    !/### Requirement/.test(storeSrc) && !/(ADDED|MODIFIED|REMOVED) Requirements/.test(storeSrc),
    "the store re-states no block grammar — its adapters delegate to the model"
  );
  assert(/parseSpecModel/.test(storeSrc), "the store adapters read the spec model");
});

// --- SM3: a fence-quoted pin lookalike pins nothing at the extractor ---------------

check("SM3", "a # Verified-by lookalike inside a documentation fence is not a pin", () => {
  const root = gitRepo();
  const specDir = path.join(root, "cdd", "specs", "cap");
  fs.mkdirSync(specDir, { recursive: true });
  fs.writeFileSync(
    path.join(specDir, "spec.md"),
    [
      "### Requirement: Living requirement",
      "",
      "```gherkin",
      "Feature: Living requirement",
      "",
      "Scenario: Strictly pinned scenario",
      "Given a living spec",
      "When the extractor runs",
      "Then only the gherkin-fence pin counts",
      "  # Verified by: tests/acceptance/pin-strict.test.js",
      "```",
      "",
      "Documentation quotes the pin dialect:",
      "",
      "```text",
      "# Verified by: tests/acceptance/pin-loose.test.js",
      "```",
      "",
      "",
    ].join("\n")
  );
  fs.writeFileSync(path.join(root, "tests", "acceptance", "pin-strict.test.js"), "// strict-pinned\n");
  fs.writeFileSync(path.join(root, "tests", "acceptance", "pin-loose.test.js"), "// lookalike inside a documentation fence\n");
  execFileSync("git", ["-C", root, "add", "."]);
  execFileSync("git", ["-C", root, "commit", "-qm", "spec + tests"]);
  const r = runScan(root, path.join(root, "cdd", "scripts", "spec-extract.mjs"), ["--json"]);
  assert(r.code === 0, `expected exit 0, got ${r.code}:\n${r.out}`);
  const report = JSON.parse(r.out);
  assert(
    report.extractionCandidates.includes("tests/acceptance/pin-loose.test.js"),
    `a lookalike quoted in a documentation fence must pin nothing:\n${r.out}`
  );
  assert(
    !report.extractionCandidates.includes("tests/acceptance/pin-strict.test.js"),
    `the strict fence pin must pin its test:\n${r.out}`
  );
});

// --- SM4: a star glob claims the files it names ------------------------------------

check("SM4", "a star glob claims the files it names", () => {
  const root = gitRepo();
  const specDir = path.join(root, "cdd", "specs", "cap");
  fs.mkdirSync(specDir, { recursive: true });
  fs.writeFileSync(
    path.join(specDir, "spec.md"),
    [
      "### Requirement: Claimed surface",
      "",
      "Code: src/thing-*.mjs",
      "",
      "```gherkin",
      "Feature: Claimed surface",
      "",
      "Scenario: A star glob claims its files",
      "Given a spec whose Code line names src/thing-*.mjs",
      "When the extractor maps the territory",
      "Then src/thing-a.mjs and src/thing-b.mjs are owned",
      "  # Verified by: tests/acceptance/spec-model.test.js",
      "```",
      "",
      "",
    ].join("\n")
  );
  fs.mkdirSync(path.join(root, "src"), { recursive: true });
  fs.writeFileSync(path.join(root, "src", "thing-a.mjs"), "export const a = 1;\n");
  fs.writeFileSync(path.join(root, "src", "thing-b.mjs"), "export const b = 2;\n");
  fs.writeFileSync(path.join(root, "src", "other.js"), "export const c = 3;\n");
  execFileSync("git", ["-C", root, "add", "."]);
  execFileSync("git", ["-C", root, "commit", "-qm", "spec + files"]);
  const r = runScan(root, path.join(root, "cdd", "scripts", "spec-extract.mjs"), ["--json"]);
  assert(r.code === 0, `expected exit 0, got ${r.code}:\n${r.out}`);
  const report = JSON.parse(r.out);
  assert(
    !report.unowned.includes("src/thing-a.mjs") && !report.unowned.includes("src/thing-b.mjs"),
    `the star glob must claim the files it names:\n${r.out}`
  );
  assert(report.unowned.includes("src/other.js"), `an unmatched file stays unowned:\n${r.out}`);
  assert(report.burnDown > 0, `a claiming spec burns down the map:\n${r.out}`);
});

// --- report ------------------------------------------------------------------------

console.log(`\nspec-model: ${pass} ok, ${fail} FAIL`);
for (const root of sandboxes) fs.rmSync(root, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
