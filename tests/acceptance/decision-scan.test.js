#!/usr/bin/env node
// decision-scan — the decision scan is defined exactly once behind explicit
// ingest flags: the walk-and-parse pin over the sources, the flag semantics
// over a synthetic tree (defaults, index flags, legacy extractor flags, the
// missing-directory tolerance, the heading-less file's empty index title),
// and the extractor-surface equivalence (live-tree baseline rows plus the
// and the extractor-surface equivalence (live-tree baseline rows, the real
// extractor run over the synthetic tree, and the exotic-heading files whose
// documented answer is the filename fallback).
// Pins: ADDED "The ADR claims index is single-sourced" scenarios.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
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

const adrIdx = await import(path.join(REPO, "scripts", "adr-index.mjs")).then(
  (m) => m,
  () => null
);
const INDEX_FLAGS = { dirs: ["cdd/decisions"], numberedOnly: true, defaultStatus: "accepted" };
const LEGACY_FLAGS = { dirs: ["cdd/decisions", "docs/adr"], numberedOnly: false, defaultStatus: "unknown" };

// --- DS1: the walk and the parse appear exactly once -----------------------

await check("DS1a", "scanDecisionFiles is exported from scripts/adr-index.mjs", async () => {
  assert(adrIdx !== null, "scripts/adr-index.mjs must load");
  assert(typeof adrIdx.scanDecisionFiles === "function", "scanDecisionFiles must be an exported function");
});

await check("DS1b", "scripts/adr-index.mjs holds exactly one decision-directory readdir", async () => {
  const src = fs.readFileSync(path.join(REPO, "scripts", "adr-index.mjs"), "utf8");
  const count = (src.match(/readdirSync/g) ?? []).length;
  assert(count === 1, `one decision-directory readdir in adr-index, got ${count}`);
});

await check("DS1c", "the decision-frontmatter parse appears exactly once in adr-index (import + sole call)", async () => {
  const src = fs.readFileSync(path.join(REPO, "scripts", "adr-index.mjs"), "utf8");
  const count = (src.match(/parseDecisionFrontmatter/g) ?? []).length;
  assert(count === 2, `import plus one call in adr-index, got ${count}`);
});

await check("DS1d", "scripts/arch-extract.mjs holds no decision-frontmatter import or use", async () => {
  const src = fs.readFileSync(path.join(REPO, "scripts", "arch-extract.mjs"), "utf8");
  assert(!src.includes("parseDecisionFrontmatter"), "arch-extract must not name parseDecisionFrontmatter");
});

await check("DS1e", "scripts/arch-extract.mjs holds no private decision-directory walk", async () => {
  const src = fs.readFileSync(path.join(REPO, "scripts", "arch-extract.mjs"), "utf8");
  const walk = /for \(const \w+ of \[[^\]]*(?:cdd\/decisions|docs\/adr)/;
  assert(!walk.test(src), "arch-extract must not loop a decision-directory list");
});

await check("DS1f", "arch-extract calls the shared scan with its legacy preference", async () => {
  const src = fs.readFileSync(path.join(REPO, "scripts", "arch-extract.mjs"), "utf8");
  assert(src.includes("scanDecisionFiles("), "arch-extract must call scanDecisionFiles");
  assert(src.includes("numberedOnly: false"), "legacy preference: numberedOnly false");
  assert(src.includes("defaultStatus: 'unknown'"), "legacy preference: defaultStatus unknown");
});

// --- DS2: the flag semantics over a synthetic tree --------------------------

function syntheticTree() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "dsu-"));
  const mk = (rel, text) => {
    const p = path.join(root, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, text, "utf8");
  };
  mk("cdd/decisions/0001-alpha.md", "---\nstatus: accepted\ncode: lib/alpha.mjs\n---\n\n# Alpha Title\n");
  mk("cdd/decisions/0002-beta.md", "---\ncode: src/beta.mjs\n---\n\n# Beta Title\n");
  mk("cdd/decisions/0003-gamma.md", "---\nstatus: proposed\n---\n\nbody without a heading\n");
  mk("cdd/decisions/notes.md", "# Notes\n");
  mk("docs/adr/legacy.md", "---\nstatus: accepted\ncode: docs/**\n---\n\n# Legacy Title\n");
  return root;
}

await check("DS2a", "defaults equal the index preference over the synthetic tree", async () => {
  const root = syntheticTree();
  const rows = adrIdx.scanDecisionFiles(root);
  assert(JSON.stringify(rows.map((r) => [r.location, r.status, r.num])) === JSON.stringify([
    ["cdd/decisions/0001-alpha.md", "accepted", "0001"],
    ["cdd/decisions/0002-beta.md", "accepted", "0002"],
    ["cdd/decisions/0003-gamma.md", "proposed", "0003"],
  ]), `defaults answer the three numbered rows: ${JSON.stringify(rows.map((r) => [r.location, r.status, r.num]))}`);
  fs.rmSync(root, { recursive: true, force: true });
});

await check("DS2b", "explicit index flags answer the same as the defaults", async () => {
  const root = syntheticTree();
  const a = adrIdx.scanDecisionFiles(root);
  const b = adrIdx.scanDecisionFiles(root, INDEX_FLAGS);
  assert(JSON.stringify(a) === JSON.stringify(b), "index flags and defaults must agree");
  fs.rmSync(root, { recursive: true, force: true });
});

await check("DS2c", "legacy flags walk both directories, every .md, statuses from frontmatter alone", async () => {
  const root = syntheticTree();
  const rows = adrIdx.scanDecisionFiles(root, LEGACY_FLAGS);
  assert(JSON.stringify(rows.map((r) => [r.location, r.status, r.num])) === JSON.stringify([
    ["cdd/decisions/0001-alpha.md", "accepted", "0001"],
    ["cdd/decisions/0002-beta.md", "unknown", "0002"],
    ["cdd/decisions/0003-gamma.md", "proposed", "0003"],
    ["cdd/decisions/notes.md", "unknown", null],
    ["docs/adr/legacy.md", "accepted", null],
  ]), `legacy rows: ${JSON.stringify(rows.map((r) => [r.location, r.status, r.num]))}`);
  fs.rmSync(root, { recursive: true, force: true });
});

await check("DS2d", "the index projection maps the heading-less row's title to the empty string", async () => {
  const root = syntheticTree();
  const entries = adrIdx.buildAdrIndex(root);
  assert(JSON.stringify(entries.map((e) => [e.id, e.title, e.status])) === JSON.stringify([
    ["ADR-0001", "Alpha Title", "accepted"],
    ["ADR-0002", "Beta Title", "accepted"],
    ["ADR-0003", "", "proposed"],
  ]), `index entries: ${JSON.stringify(entries.map((e) => [e.id, e.title, e.status]))}`);
  fs.rmSync(root, { recursive: true, force: true });
});

await check("DS2e", "a directory that does not exist is skipped, on both flag sets", async () => {
  const root = syntheticTree();
  fs.rmSync(path.join(root, "docs", "adr"), { recursive: true, force: true });
  const legacy = adrIdx.scanDecisionFiles(root, LEGACY_FLAGS);
  assert(legacy.every((r) => !r.location.startsWith("docs/adr/")), "legacy flags skip the absent docs/adr");
  assert(legacy.length === 4, `four rows without docs/adr, got ${legacy.length}`);
  fs.rmSync(path.join(root, "cdd", "decisions"), { recursive: true, force: true });
  const index = adrIdx.scanDecisionFiles(root, INDEX_FLAGS);
  assert(index.length === 0, `index flags answer no rows with cdd/decisions absent, got ${index.length}`);
  fs.rmSync(root, { recursive: true, force: true });
});

// --- DS3: the extractor surface is preserved -------------------------------

const LIVE_ROWS = [
  { location: "cdd/decisions/0001-zero-dependency-node-tooling.md", status: "accepted", code: "scripts/**", title: "Zero-dependency Node tooling at the doors" },
  { location: "cdd/decisions/0002-the-harness-is-the-counterparty.md", status: "accepted", code: "index.ts", title: "The harness is the counterparty" },
  { location: "cdd/decisions/0003-plain-markdown-store.md", status: "accepted", code: "lib/store.mjs", title: "The store is plain markdown, owned by the method" },
  { location: "cdd/decisions/0004-ambient-injection-over-fetch.md", status: "accepted", code: "lib/context.ts", title: "Ambient injection over fetch" },
  { location: "cdd/decisions/0005-gherkin-scenario-language.md", status: "superseded", code: "lib/gherkin.mjs, lib/validate.mjs, lib/templates.mjs, lib/instructions.mjs, scripts/spec-drift.mjs", title: "Gherkin is the scenario language; the official parser is the arbiter" },
  { location: "cdd/decisions/0006-feature-block-consolidation.md", status: "accepted", code: "lib/gherkin.mjs, lib/validate.mjs, lib/templates.mjs, lib/instructions.mjs, scripts/spec-drift.mjs", title: "One Feature document per requirement; pins are comments inside the fence" },
  { location: "cdd/decisions/0007-the-law-behind-every-door.md", status: "accepted", code: "scripts/grammar-law.mjs, scripts/spec-drift.mjs, scripts/spec-extract.mjs, scripts/arch-extract.mjs, lib/gherkin.mjs, lib/validate.mjs, lib/store.mjs, lib/templates.mjs, index.ts", title: "The law: one grammar module behind every door" },
  { location: "cdd/decisions/0008-model-run-reviews-are-advisory-findings.md", status: "accepted", code: "lib/templates.mjs, lib/instructions.mjs, lib/context.mjs, lib/help.mjs", title: "Model-run artifact reviews are advisory findings, never verdicts" },
  { location: "cdd/decisions/0009-single-source-the-loop-law.md", status: "accepted", code: "lib/loop-law.mjs, lib/templates.mjs, lib/instructions.mjs, lib/context.mjs, lib/help.mjs, README.md", title: "Single-source the loop law in lib/loop-law.mjs" },
  { location: "cdd/decisions/0010-reviewer-independence-is-loop-law.md", status: "accepted", code: "lib/loop-law.mjs, cdd/rules.md, skills/cdd-spec-review/SKILL.md, skills/cdd-code-review/SKILL.md, skills/cdd-adr-review/SKILL.md", title: "Make reviewer independence loop law (rule 2b)" },
  { location: "cdd/decisions/0011-ticks-are-claims-and-pins-hit-real-doors.md", status: "accepted", code: "lib/templates.mjs, cdd/rules.md, tests/acceptance/loop-law-hardening.test.js", title: "Make tick re-verification and real-door pins loop law (rules 11a, 7)" },
  { location: "cdd/decisions/0012-comments-are-shape-only.md", status: "accepted", code: "index.ts, lib/*.mjs, lib/*.ts, scripts/*.mjs, .githooks/*", title: "Comments are shape-of-code documentation only" },
  { location: "cdd/decisions/0013-one-claim-map-for-guard-and-ops.md", status: "accepted", code: "scripts/adr-index.mjs, scripts/spec-drift.mjs, lib/adr-ops.mjs, tests/acceptance/claim-map.test.js", title: "One claim map behind guard and ops" },
];

await check("DS3a", "the live-tree extractor rows equal the pre-change baseline (report and --json alike)", async () => {
  const json = JSON.parse(execFileSync(process.execPath, [path.join(REPO, "scripts", "arch-extract.mjs"), "--json"], { cwd: REPO, encoding: "utf8" }));
  assert(JSON.stringify(json.derived.decisions) === JSON.stringify(LIVE_ROWS), "derived.decisions rows, location/status/code/title and order, equal the baseline");
  const report = execFileSync(process.execPath, [path.join(REPO, "scripts", "arch-extract.mjs")], { cwd: REPO, encoding: "utf8" });
  const lines = report.split("\n").filter((l) => /^- (?:cdd\/decisions|docs\/adr)\/.*\.md — /.test(l));
  const expected = LIVE_ROWS.map((r) => `- ${r.location} — ${r.status}${r.code ? `, code: ${r.code}` : ""} — ${r.title}`);
  assert(JSON.stringify(lines) === JSON.stringify(expected), `report decisions lines equal the baseline: ${JSON.stringify(lines)}`);
});

await check("DS3b", "legacy-flag rows projected to the extractor shape equal the extractor's answers", async () => {
  const root = syntheticTree();
  const rows = adrIdx.scanDecisionFiles(root, LEGACY_FLAGS);
  const projected = rows.map((r) => ({
    location: r.location,
    status: r.status,
    code: r.header.code ?? "",
    title: (r.titleLine?.match(/^#\s+(.+)$/) ?? [])[1] ?? r.name,
  }));
  assert(JSON.stringify(projected) === JSON.stringify([
    { location: "cdd/decisions/0001-alpha.md", status: "accepted", code: "lib/alpha.mjs", title: "Alpha Title" },
    { location: "cdd/decisions/0002-beta.md", status: "unknown", code: "src/beta.mjs", title: "Beta Title" },
    { location: "cdd/decisions/0003-gamma.md", status: "proposed", code: "", title: "0003-gamma.md" },
    { location: "cdd/decisions/notes.md", status: "unknown", code: "", title: "Notes" },
    { location: "docs/adr/legacy.md", status: "accepted", code: "docs/**", title: "Legacy Title" },
  ]), `projected legacy rows: ${JSON.stringify(projected)}`);
  fs.rmSync(root, { recursive: true, force: true });
});

await check("DS3c", "the real extractor over the synthetic tree answers the legacy rows", async () => {
  const root = syntheticTree();
  const json = JSON.parse(execFileSync(process.execPath, [path.join(REPO, "scripts", "arch-extract.mjs"), "--json"], { cwd: root, encoding: "utf8" }));
  assert(JSON.stringify(json.derived.decisions) === JSON.stringify([
    { location: "cdd/decisions/0001-alpha.md", status: "accepted", code: "lib/alpha.mjs", title: "Alpha Title" },
    { location: "cdd/decisions/0002-beta.md", status: "unknown", code: "src/beta.mjs", title: "Beta Title" },
    { location: "cdd/decisions/0003-gamma.md", status: "proposed", code: "", title: "0003-gamma.md" },
    { location: "cdd/decisions/notes.md", status: "unknown", code: "", title: "Notes" },
    { location: "docs/adr/legacy.md", status: "accepted", code: "docs/**", title: "Legacy Title" },
  ]), `extractor rows over the synthetic tree: ${JSON.stringify(json.derived.decisions)}`);
  fs.rmSync(root, { recursive: true, force: true });
});

await check("DS3d", "exotic headings answer the documented filename fallback", async () => {
  const root = syntheticTree();
  fs.writeFileSync(path.join(root, "cdd/decisions/0004-tab.md"), "---\nstatus: accepted\n---\n\n#\tTabbed Heading\n", "utf8");
  fs.writeFileSync(path.join(root, "cdd/decisions/0005-empty.md"), "---\nstatus: accepted\n---\n\n# \n# Second Title\n", "utf8");
  const json = JSON.parse(execFileSync(process.execPath, [path.join(REPO, "scripts", "arch-extract.mjs"), "--json"], { cwd: root, encoding: "utf8" }));
  const rows = json.derived.decisions.map((r) => [r.location, r.status, r.title]);
  assert(JSON.stringify(rows) === JSON.stringify([
    ["cdd/decisions/0001-alpha.md", "accepted", "Alpha Title"],
    ["cdd/decisions/0002-beta.md", "unknown", "Beta Title"],
    ["cdd/decisions/0003-gamma.md", "proposed", "0003-gamma.md"],
    ["cdd/decisions/0004-tab.md", "accepted", "0004-tab.md"],
    ["cdd/decisions/0005-empty.md", "accepted", "0005-empty.md"],
    ["cdd/decisions/notes.md", "unknown", "Notes"],
    ["docs/adr/legacy.md", "accepted", "Legacy Title"],
  ]), `exotic-heading rows: ${JSON.stringify(rows)}`);
  fs.rmSync(root, { recursive: true, force: true });
});
console.log(`\ndecision-scan: ${pass} passed, ${fail} failed`);
if (failures.length) {
  for (const f of failures) console.error(`  ${f}`);
  process.exitCode = 1;
}
