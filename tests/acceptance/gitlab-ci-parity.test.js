#!/usr/bin/env node
// gitlab-ci-parity.test.js — pins the GitLab CI scaffold parity
// (delta: gherkin capability, change gitlab-ci-parity): the CI_GITLAB
// template inherits the guard pipeline discipline the dogfood workflow
// (.github/workflows/cdd.yml) learned — a parallel:matrix fanning the guard
// job out to exactly the 2 supported Node majors (20 = CI floor, 24 =
// local-dev major), each leg's image provisioned from its matrix entry,
// GIT_DEPTH "0" so the guard can walk commit history, and npm ci before the
// guard scan (the suites import @cucumber/gherkin from node_modules). The
// dogfood .gitlab-ci.yml at the repo root stays byte-identical to the render.
//
// GL0 parses the render structurally (a fail-closed YAML-subset parser —
// duplicate keys, orphaned blocks, and unsupported syntax are errors, not
// skips), so a textually-plausible but structurally broken scaffold cannot
// pass. Red until the template carries the parity shape.

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const { CI_GITLAB } = await import(path.join(REPO, "lib", "templates.mjs"));

// --- YAML-subset parser: mappings, block lists of maps/scalars, inline
// [a, b] lists, scalars; comments stripped. Anything else is an error.
// Same fail-closed subset as ci-node-matrix.test.js, with one GitLab
// adaptation: mapping keys may contain colons (job names like "cdd:guard:"),
// so a key runs to the last colon and a value counts only when whitespace
// follows that colon.
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
  const value = (val) =>
    val.startsWith("[") && val.endsWith("]")
      ? val.slice(1, -1).split(",").map((s) => scalar(s.trim()))
      : scalar(val);

  const mapInto = (map, indent) => {
    while (i < lines.length && lines[i].indent === indent) {
      const m = lines[i].body.match(/^(.*):\s+(.*)$/) ?? lines[i].body.match(/^(.*):$/);
      if (!m) throw new Error(`unsupported mapping line: "${lines[i].body}"`);
      const key = m[1].trim();
      if (Object.hasOwn(map, key)) throw new Error(`duplicate mapping key "${key}:" at indent ${indent}`);
      const val = (m[2] ?? "").trim();
      i++;
      if (val) {
        map[key] = value(val);
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
        if (km[2].trim()) m[km[1].trim()] = value(km[2].trim());
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

// GL0: the render parses structurally (no duplicate keys, no orphans)
let doc = null;
let parseError = "";
try {
  doc = parseWorkflow(CI_GITLAB);
} catch (e) {
  parseError = e.message;
}
check("GL0", "CI_GITLAB render parses with no duplicate or orphaned keys", doc !== null, parseError);

const job = doc?.["cdd:guard"] ?? null;

// GL1: the matrix fans the guard job out to exactly the 2 Node majors —
// the two-leg discipline that catches floor-only breakage (PF-15 lesson)
const legs = job?.parallel?.matrix?.[0]?.NODE_VERSION;
check(
  "GL1",
  "guard job parallel matrix legs are exactly ['20', '24']",
  Array.isArray(legs) && legs.length === 2 && legs[0] === "20" && legs[1] === "24",
  `legs found: ${JSON.stringify(legs ?? "(none)")}`
);

// GL2: each leg's image comes from its matrix entry — no literal Node pin left
check(
  "GL2",
  "job image provisions from the matrix entry — no literal Node pin",
  job?.image === "node:$NODE_VERSION",
  `image: ${JSON.stringify(job?.image ?? "(none)")}`
);

// GL3: full clone — the guard walks commit history (lastCommit and L2
// topology comparisons), so GitLab's default shallow fetch would starve it;
// same reason the dogfood workflow sets fetch-depth: 0
check(
  "GL3",
  "job variables pin GIT_DEPTH '0' (full clone)",
  job?.variables?.GIT_DEPTH === "0",
  `variables.GIT_DEPTH: ${JSON.stringify(job?.variables?.GIT_DEPTH ?? "(none)")}`
);

// GL4: npm ci lands before the guard scan — the suites import
// @cucumber/gherkin from node_modules, so without install the pipeline is
// red by construction
const script = job?.script ?? [];
check(
  "GL4",
  "script chain runs npm ci → guard scan → npm test, in order",
  script[0] === "npm ci" &&
    script[1] === "node cdd/scripts/spec-drift.mjs" &&
    script[2] === "npm test --if-present",
  `script: ${JSON.stringify(script)}`
);

// GL5: the adopter-facing scaffold comments survive the parity growth
check(
  "GL5",
  "door-3 and adjust-to-runner scaffold comments survive",
  CI_GITLAB.includes("# door 3 — full scan: the same guard the pre-commit hook runs") &&
    CI_GITLAB.includes("# the project's own tests (adjust to your runner)")
);

// GL6: the dogfood copy at the repo root is byte-identical to the render —
// initStore wrote it, we never hand-customize it (SSL3 style)
const repoCopy = fs.readFileSync(path.join(REPO, ".gitlab-ci.yml"), "utf8");
check(
  "GL6",
  "root .gitlab-ci.yml is byte-identical to the CI_GITLAB render",
  repoCopy === CI_GITLAB,
  repoCopy === CI_GITLAB ? "" : "repo copy diverged from the template"
);

process.exit(failed ? 1 : 0);
