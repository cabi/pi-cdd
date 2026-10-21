#!/usr/bin/env node
// ci-node-matrix.test.js — pins the CI Node-matrix wiring of the guard job
// (delta: acceptance capability, change acceptance-wiring): the job fans out
// to exactly the 2 supported Node majors (20 = CI floor, 24 = local-dev
// major), each leg provisions its Node from its matrix entry, fail-fast is
// false so one red leg never cancels the other, and the step chain
// (npm ci → guard scan → npm test) is unchanged.
//
// MX0 parses the workflow structurally (a fail-closed YAML-subset parser —
// duplicate keys, orphaned blocks, and unsupported syntax are errors, not
// skips), so a textually-plausible but structurally broken workflow cannot
// pass. Red until the workflow carries the matrix.

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const WF = fs.readFileSync(path.join(REPO, ".github", "workflows", "cdd.yml"), "utf8");

// --- YAML-subset parser: mappings, block lists of maps/scalars, inline
// [a, b] lists, scalars; comments stripped. Anything else is an error.
const parseWorkflow = (text) => {
  const lines = [];
  for (const raw of text.split(/\r?\n/)) {
    const noComment = raw.replace(/(^|\s)#.*$/, "");
    if (!noComment.trim()) continue;
    lines.push({ indent: noComment.match(/^ */)[0].length, body: noComment.trim() });
  }
  let i = 0;
  const scalar = (s) =>
    /^-?\d+$/.test(s) ? Number(s) : s === "true" ? true : s === "false" ? false : s.replace(/^['"]|['"]$/g, "");

  const mapInto = (map, indent) => {
    while (i < lines.length && lines[i].indent === indent) {
      const m = lines[i].body.match(/^([^:-][^:]*):\s*(.*)$/);
      if (!m) throw new Error(`unsupported mapping line: "${lines[i].body}"`);
      const key = m[1].trim();
      if (Object.hasOwn(map, key)) throw new Error(`duplicate mapping key "${key}:" at indent ${indent}`);
      const val = m[2].trim();
      i++;
      if (val) {
        map[key] =
          val.startsWith("[") && val.endsWith("]")
            ? val.slice(1, -1).split(",").map((s) => scalar(s.trim()))
            : scalar(val);
      } else {
        map[key] = i < lines.length && lines[i].indent > indent ? block(lines[i].indent) : null;
      }
    }
  };

  const block = (indent) => {
    const first = lines[i];
    if (!first || first.indent < indent) throw new Error("empty block");
    if (!first.body.startsWith("- ")) return ((m) => (mapInto(m, indent), m))({});
    const arr = [];
    while (i < lines.length && lines[i].indent === indent && lines[i].body.startsWith("- ")) {
      const item = lines[i].body.slice(2);
      const km = item.match(/^([^:]+):\s*(.*)$/);
      if (km) {
        // "- key: value" opens an inline map whose keys sit at indent + 2
        const m = {};
        if (km[2].trim()) m[km[1].trim()] = scalar(km[2].trim());
        i++;
        mapInto(m, indent + 2);
        arr.push(m);
      } else {
        arr.push(scalar(item));
        i++;
      }
    }
    return arr;
  };

  const doc = block(0);
  if (i < lines.length) throw new Error(`unconsumed line at ${i + 1}: "${lines[i].body}"`);
  return doc;
};

let failed = 0;
const check = (id, name, ok, detail = "") => {
  console.log(`${ok ? "ok  " : "FAIL"} ${id} ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failed++;
};

// MX0: the workflow parses structurally (no duplicate keys, no orphans)
let doc = null;
let parseError = "";
try {
  doc = parseWorkflow(WF);
} catch (e) {
  parseError = e.message;
}
check("MX0", "workflow parses with no duplicate or orphaned keys", doc !== null, parseError);

const job = doc?.jobs?.guard ?? null;
const strategy = job?.strategy ?? null;

// MX1: fail-fast false — one leg's failure never cancels the other leg
check("MX1", "guard job strategy sets fail-fast: false", strategy?.["fail-fast"] === false, "strategy.fail-fast is not false");

// MX2: the matrix lists exactly the 2 Node versions 20 and 24 on the guard job
const legs = strategy?.matrix?.["node-version"];
check(
  "MX2",
  "guard job matrix legs are exactly [20, 24]",
  Array.isArray(legs) && legs.length === 2 && legs[0] === 20 && legs[1] === 24,
  `legs found: ${JSON.stringify(legs ?? "(none)")}`
);

// MX3: setup-node provisions its Node from the matrix entry, and the job pins
// no literal node-version anywhere else (exactly the 2 occurrences: matrix + setup-node)
const setup = job?.steps?.find((s) => typeof s.uses === "string" && s.uses.startsWith("actions/setup-node")) ?? null;
const nodeKeys = [];
const walk = (v) => {
  if (Array.isArray(v)) v.forEach(walk);
  else if (v && typeof v === "object")
    for (const [k, val] of Object.entries(v)) {
      if (k === "node-version") nodeKeys.push(JSON.stringify(val));
      walk(val);
    }
};
walk(job);
check(
  "MX3",
  "setup-node consumes the matrix entry — no literal Node pin left",
  setup !== null &&
    setup.with?.["node-version"] === "${{ matrix.node-version }}" &&
    nodeKeys.length === 2 &&
    nodeKeys.every((v) => v === "[20,24]" || v === '"${{ matrix.node-version }}"'),
  `node-version keys: ${nodeKeys.join(", ") || "(none)"}`
);

// MX4: the step chain is unchanged — npm ci, guard scan, npm test, in order
const runs = (job?.steps ?? []).filter((s) => typeof s.run === "string").map((s) => s.run);
const expected = ["npm ci", "node cdd/scripts/spec-drift.mjs", "npm test --if-present"];
const inOrder = expected.every((cmd, n) => runs[n] === cmd);
check("MX4", `step chain still runs ${expected.join(" → ")}`, inOrder, `runs: ${JSON.stringify(runs)}`);

process.exit(failed ? 1 : 0);
