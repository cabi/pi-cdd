#!/usr/bin/env node
// comment-law — source comments on the harness surface (index.ts, lib/,
// scripts/, .githooks) are shape-of-code documentation only: the scanner
// isolates comment text — strings, template literals, and regex literals are
// not comments — and reports every corpus-routing pattern it finds, naming
// file, line, and pattern class; any hit fails the suite. The synthetic
// fixtures prove the scanner can fail and that it stays string-aware.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

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

// --- the banned pattern classes ---------------------------------------------
const BANNED = [
  { id: "decision-id", re: /\bADR-\d{1,4}\b/g },
  { id: "process-finding-id", re: /\bPF-\d+\b/g },
  { id: "corpus-path", re: /\bcdd\/(?:specs|changes|decisions|archive)(?![\w.-])|cdd\/(?:backlog|rules)\.md/g },
  { id: "spec-heading", re: /\b(?:Requirement|Scenario)\s*:/g },
  {
    // a commit id: a 7–40 char hex run that is not a plain number
    id: "commit-id",
    re: /\b[0-9a-fA-F]{7,40}\b/g,
    keep: (m) => /[a-fA-F]/.test(m),
  },
];

// --- scanners ----------------------------------------------------------------
// JS/TS: a mode stack walks code, strings, template literals (with ${ … }
// nestings), and regex literals; only //… and /*…*/ text is comment text.
export function scanJsComments(src) {
  const comments = [];
  const stack = [{ t: "root", d: 0 }];
  let line = 1;
  let lastCh = "";
  let word = "";
  const REGEX_HEAD = new Set(["(", ",", "=", ":", "[", "!", "&", "|", "?", ";", "{", "}", "<", ">", "+", "-", "*", "%", "~", "^", ""]);
  const REGEX_WORDS = new Set(["return", "typeof", "case", "in", "of", "new", "delete", "void", "instanceof", "do", "else", "yield", "await"]);
  const take = () => {
    if (src[i] === "\n") line++;
    i++;
  };
  let i = 0;
  while (i < src.length) {
    const m = stack[stack.length - 1];
    const c = src[i];
    const n = i + 1 < src.length ? src[i + 1] : "";
    if (m.t === "root" || m.t === "code") {
      if (c === "/" && n === "/") {
        const start = line;
        let text = "";
        take();
        take();
        while (i < src.length && src[i] !== "\n") text += src[i++];
        comments.push({ line: start, text });
      } else if (c === "/" && n === "*") {
        const start = line;
        let text = "";
        take();
        take();
        while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) {
          text += src[i];
          take();
        }
        take();
        take();
        comments.push({ line: start, text });
      } else if (c === "'") {
        stack.push({ t: "sq" });
        take();
      } else if (c === '"') {
        stack.push({ t: "dq" });
        take();
      } else if (c === "`") {
        stack.push({ t: "tpl" });
        take();
      } else if (c === "/") {
        if (REGEX_HEAD.has(lastCh) || REGEX_WORDS.has(word)) stack.push({ t: "re", cls: false });
        take();
      } else if (c === "{" && m.t === "code") {
        m.d++;
        take();
      } else if (c === "}" && m.t === "code") {
        m.d--;
        if (m.d === 0) stack.pop();
        take();
      } else {
        if (/\S/.test(c)) {
          lastCh = c;
          if (/[\w$]/.test(c)) word += c;
          else word = "";
        }
        take();
      }
    } else if (m.t === "sq") {
      if (c === "\\") take();
      else if (c === "'" || c === "\n") stack.pop();
      take();
    } else if (m.t === "dq") {
      if (c === "\\") take();
      else if (c === '"' || c === "\n") stack.pop();
      take();
    } else if (m.t === "tpl") {
      if (c === "\\") take();
      else if (c === "`") {
        stack.pop();
        take();
      } else if (c === "$" && n === "{") {
        stack.push({ t: "code", d: 1 });
        take();
        take();
      } else take();
    } else if (m.t === "re") {
      if (c === "\\") take();
      else if (c === "[") m.cls = true;
      else if (c === "]") m.cls = false;
      else if ((c === "/" && !m.cls) || c === "\n") stack.pop();
      take();
    }
  }
  return comments;
}

// POSIX sh (the hook scripts): '#' at a word boundary starts a comment;
// '…' and "…" are strings.
export function scanShComments(src) {
  const comments = [];
  let line = 1;
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === "'" || c === '"') {
      const q = c;
      i++;
      while (i < src.length && src[i] !== q && src[i] !== "\n") i++;
      continue;
    }
    if (c === "#" && (i === 0 || /[\s;(&|]/.test(src[i - 1]))) {
      const start = line;
      let text = "";
      while (i < src.length && src[i] !== "\n") text += src[i++];
      comments.push({ line: start, text });
      continue;
    }
    if (c === "\n") line++;
    i++;
  }
  return comments;
}

// --- the scan ----------------------------------------------------------------
export function scanFile(abs) {
  const src = fs.readFileSync(abs, "utf8");
  const rel = path.relative(REPO, abs);
  const scanner = path.basename(path.dirname(abs)) === ".githooks" ? scanShComments : scanJsComments;
  const hits = [];
  for (const cmt of scanner(src)) {
    for (const b of BANNED) {
      b.re.lastIndex = 0;
      let m;
      while ((m = b.re.exec(cmt.text))) {
        if (b.keep && !b.keep(m[0])) continue;
        const at = Math.max(0, m.index - 12);
        hits.push(`${rel}:${cmt.line} [${b.id}] …${cmt.text.slice(at, at + m[0].length + 16).trim()}…`);
      }
    }
  }
  return hits;
}

export function surfaceFiles() {
  const files = [path.join(REPO, "index.ts")];
  for (const dir of ["lib", "scripts"]) {
    for (const f of fs.readdirSync(path.join(REPO, dir))) {
      if (/\.(mjs|ts)$/.test(f)) files.push(path.join(REPO, dir, f));
    }
  }
  const hooksDir = path.join(REPO, ".githooks");
  for (const f of fs.readdirSync(hooksDir)) {
    const abs = path.join(hooksDir, f);
    if (fs.statSync(abs).isFile()) files.push(abs);
  }
  return files.sort();
}

export const exitCode = (hits) => (hits.length ? 1 : 0);

// --- checks ------------------------------------------------------------------
check("CL1", "the scanned surface reports zero banned patterns in comments", () => {
  const hits = surfaceFiles().flatMap(scanFile);
  assert(hits.length === 0, `expected 0 corpus-routing comment hits, found ${hits.length}:\n  ${hits.join("\n  ")}`);
  assert(exitCode(hits) === 0, "hits present but exit code not failing");
});

check("CL2", "a corpus-id comment is named file, line, and pattern, and fails", () => {
  const tmp = path.join(os.tmpdir(), `comment-law-fixture-${process.pid}.mjs`);
  const src = [
    "const a = 1;",
    "// pointer to ADR-0006 for the fence law",
    'const s = "PF-3 stays legal inside a string";',
    "/* (bd4358b) once did this */",
    "// Scenario: synthetic heading citation",
    "// see cdd/rules.md for the law",
    "",
  ].join("\n");
  fs.writeFileSync(tmp, src);
  try {
    const hits = scanFile(tmp).sort();
    const lines = hits.map((h) => Number(/^[^:]+:(\d+) /.exec(h)?.[1]));
    assert(hits.length === 4, `expected 4 hits (decision-id, commit-id, spec-heading, corpus-path), got:\n  ${hits.join("\n  ")}`);
    assert(lines.every((l) => l > 0), "a hit carries no line number");
    assert(hits.some((h) => h.includes("[decision-id]") && h.includes("0006")), "no decision-id hit names the id");
    assert(hits.some((h) => h.includes("[commit-id]") && h.includes("bd4358b")), "no commit-id hit names the id");
    assert(hits.some((h) => h.includes("[corpus-path]") && h.includes("rules.md")), "no corpus-path hit names the path");
    assert(hits.some((h) => h.includes("[spec-heading]") && h.includes("Scenario")), "no spec-heading hit names the pattern");
    assert(!hits.some((h) => h.includes("PF-3")), "string content was scanned as a comment");
    assert(exitCode(hits) === 1, "violations present but exit code not failing");
  } finally {
    fs.rmSync(tmp, { force: true });
  }
});

check("CL3", "hook-script comments are scanned with the same law", () => {
  const tmp = path.join(os.tmpdir(), `comment-law-hook-${process.pid}`);
  fs.mkdirSync(tmp, { recursive: true });
  const hookDir = path.join(tmp, ".githooks");
  fs.mkdirSync(hookDir);
  const hook = path.join(hookDir, "pre-commit");
  fs.writeFileSync(hook, '#!/bin/sh\ncd "$(dirname "$0")"\n# cite ADR-0009 here\necho "PF-4 in a string is fine"\n');
  try {
    const hits = scanFile(hook);
    assert(hits.length === 1, `expected 1 hit in the hook comment, got:\n  ${hits.join("\n  ")}`);
    assert(hits[0].includes("[decision-id]") && hits[0].includes(":3 "), `hit does not name file, line, pattern: ${hits[0]}`);
    assert(!hits[0].includes("PF-4"), "hook string content was scanned as a comment");
    assert(exitCode(hits) === 1, "hook violation present but exit code not failing");
    fs.rmSync(tmp, { recursive: true, force: true });
  } finally {
  }
});

check("CL4", "strings, template nestings, and regex literals are not comments", () => {
  const tmp = path.join(os.tmpdir(), `comment-law-aware-${process.pid}.mjs`);
  const src = [
    'const r = /["\'`]/g;',
    'const law = `see ${"ADR-0001 as data"} and ${"`nested`"}`;',
    'const msg = "PF-22 and cdd/specs/x.md inside a string stay legal";',
    "const re2 = /cdd\\/changes\\//;",
    "",
  ].join("\n");
  fs.writeFileSync(tmp, src);
  try {
    const hits = scanFile(tmp);
    assert(hits.length === 0, `string/template/regex content leaked into comment hits:\n  ${hits.join("\n  ")}`);
  } finally {
    fs.rmSync(tmp, { force: true });
  }
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) {
  process.exit(1);
}
