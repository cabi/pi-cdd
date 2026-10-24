/**
 * Derives the archive stamp (metrics.md) for a closing change folder.
 *
 * Pure derivation: reads the change folder, never writes. Every number is
 * mechanically counted from disk; every git fact is labeled as-of-stamp
 * because the archive commit does not exist at stamp time; every
 * underivable field states its reason, never an estimate.
 *
 * Spec-strength counts ride the shared grammar model
 * (scripts/grammar-law.mjs — the same model the archive merge trusts).
 * Findings rows use the loop-law FINDINGS_GRAMMAR vocabulary; rows outside
 * the counted layouts count 0, and a declared Counts line that contradicts
 * parsed rows is stamped as a mismatch line — parsed numbers win.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { parseSpecModel, splitTaskSections, TASK_ITEM } from "../scripts/grammar-law.mjs";
import { FINDINGS_GRAMMAR } from "./loop-law.mjs";

const SEVERITIES = FINDINGS_GRAMMAR.severities; // ["blocker", "should", "note"]
const FORMAT_VERSION = "findings-1";

const zeroCounts = () => {
  const c = { fixed: 0, open: 0, "won't-fix": 0 };
  for (const s of SEVERITIES) c[s] = 0;
  return c;
};

const sevRe = SEVERITIES.join("|");

// --- findings-row grammar: the counted row shapes --------------------------

const ROW_LAYOUTS = [
  // |severity|finding|evidence|disposition| tables
  {
    match: (line) => line.startsWith("|")
      && SEVERITIES.includes(line.split("|")[1]?.trim() ?? ""),
    sev: (line) => line.split("|")[1].trim(),
  },
  // ### F1 — should — title   /   ### [blocker] F1 — title
  { match: (l) => new RegExp(`^### F\\d+ — (${sevRe}) — `).test(l), sev: (l) => l.match(/^### F\d+ — (\w+)/)[1] },
  { match: (l) => new RegExp(`^### \\[(${sevRe})\\]`).test(l), sev: (l) => l.match(/^### \[(\w+)/)[1] },
  // ### 2. Stale comment — note   (severity at end of heading)
  { match: (l) => new RegExp(`^### \\d+\\. .* — (${sevRe})\\s*$`).test(l), sev: (l) => l.match(/— (\w+)\s*$/)[1] },
  // ### should — Title — DISPOSED fixed
  { match: (l) => new RegExp(`^### (${sevRe}) — .* — DISPOSED `).test(l), sev: (l) => l.match(/^### (\w+)/)[1] },
  // - **note** — finding — Disposition: won't-fix: x.   /   1. **Severity: should** — finding
  { match: (l) => new RegExp(`^- \\*\\*(${sevRe})\\*\\*`).test(l), sev: (l) => l.match(/^- \*\*(\w+)/)[1] },
  { match: (l) => new RegExp(`^\\d+\\. \\*\\*Severity: (${sevRe})\\*\\*`).test(l), sev: (l) => l.match(/\*\*Severity: (\w+)/)[1] },
];

function dispositionOn(line) {
  const m = line.match(/Disposition: (fixed:|won't-fix:|open)/)
    || line.match(/(?:^|\|) *(fixed:|won't-fix:|open)(?=[\s|]|$)/);
  if (!m) return null;
  return m[1].replace(/:$/, "");
}

function parseFindingsFile(text) {
  const counts = zeroCounts();
  for (const line of text.split("\n")) {
    const layout = ROW_LAYOUTS.find((r) => {
      try {
        return r.match(line);
      } catch {
        return false;
      }
    });
    if (layout) counts[layout.sev(line)]++;
    if (layout) {
      const d = dispositionOn(line) ?? (/— DISPOSED (fixed|open|won't-fix)/.exec(line)?.[1] ?? null);
      if (d) counts[d]++;
    }
  }
  return counts;
}

function declaredCounts(text) {
  let source = null;
  const bold = text.match(/\*\*Counts:\*\*\s*(.+)/);
  if (bold) source = bold[1];
  else {
    const inline = text.match(/^##\s+Counts:?\s*(.+)$/m);
    if (inline) source = inline[1];
    else {
      const section = text.split(/^## Counts$/m)[1];
      if (section) source = section.split(/^## /m)[0];
    }
  }
  if (source === null) return null;
  const declared = {};
  for (const s of SEVERITIES) {
    const m = new RegExp(`(\\d+) ${s}|${s} (\\d+)`).exec(source);
    declared[s] = Number(m?.[1] ?? m?.[2] ?? 0);
  }
  return declared;
}

const countsTail = (c) => `${c.blocker} blocker, ${c.should} should, ${c.note} note`;

// --- spec strength: everything from the change folder's own artifacts -------

function specStrength(changeDir) {
  const lines = ["# spec strength", ""];

  const proposalPath = path.join(changeDir, "proposal.md");
  const proposal = fs.existsSync(proposalPath) ? fs.readFileSync(proposalPath, "utf8") : "";
  const doneWhens = (proposal.match(/^Done-When:/gm) ?? []).length;
  const nonGoalsSection = proposal.split("## Non-Goals")[1]?.split("\n## ")[0] ?? "";
  const nonGoals = (nonGoalsSection.match(/^- /gm) ?? []).length;

  const specsDir = path.join(changeDir, "specs");
  const ops = { ADDED: 0, MODIFIED: 0, REMOVED: 0 };
  let scenarios = 0;
  if (fs.existsSync(specsDir)) {
    for (const cap of fs.readdirSync(specsDir, { withFileTypes: true }).filter((e) => e.isDirectory())) {
      const deltaPath = path.join(specsDir, cap.name, "spec.md");
      if (!fs.existsSync(deltaPath)) continue;
      const model = parseSpecModel(fs.readFileSync(deltaPath, "utf8"));
      for (const entry of model.ops) {
        ops[entry.op] = (ops[entry.op] ?? 0) + 1;
        scenarios += entry.block.filter((l) => /^Scenario:/.test(l)).length;
      }
    }
  }

  const tasksPath = path.join(changeDir, "tasks.md");
  const tasks = fs.existsSync(tasksPath) ? fs.readFileSync(tasksPath, "utf8") : "";
  const subtasks = [...tasks.matchAll(new RegExp(TASK_ITEM.source, "gm"))].length;

  lines.push(
    `done-whens: ${doneWhens}`,
    `non-goals: ${nonGoals}`,
    `delta-requirements: added ${ops.ADDED} / modified ${ops.MODIFIED} / removed ${ops.REMOVED}`,
    `delta-scenarios: ${scenarios}`,
    `subtasks: ${subtasks}`,
    "",
  );
  return lines;
}

// --- convergence: git facts frozen as-of-stamp -------------------------------

const NO_GIT = "not-derivable: no git store";

function humanize(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

function convergence(changeDir, git) {
  const lines = ["# convergence", ""];
  const beyond = "beyond-2-norm: omitted-with-reason: the archive commit does not exist at stamp time; the stamp freezes the pre-archive state (as-of-stamp)";

  if (!git || git(["rev-parse", "--is-inside-work-tree"]) == null) {
    lines.push(
      `commits-before-archive: ${NO_GIT}`,
      `elapsed-so-far: ${NO_GIT}`,
      `re-ticks-commit-visible: ${NO_GIT}`,
      beyond,
      "",
    );
    return lines;
  }

  const rel = `cdd/changes/${path.basename(changeDir)}`;
  const log = git(["log", "--format=%H %ct", "--", rel]) ?? "";
  const commits = log.trim().split("\n").filter(Boolean).map((l) => {
    const [sha, ct] = l.split(" ");
    return { sha, at: Number(ct) };
  });

  lines.push(`commits-before-archive: ${commits.length} (as-of-stamp)`);

  // git log is newest-first: commits[0] is the newest path commit.
  const newest = commits[0];
  const oldest = commits[commits.length - 1];
  if (commits.length >= 2) {
    lines.push(`elapsed-so-far: ${humanize(newest.at - oldest.at)} (as-of-stamp)`);
  } else {
    lines.push("elapsed-so-far: not-derivable: fewer than 2 commits-before-archive (interval undefined)");
  }

  let reTicks = 0;
  const tickedAt = (sha) => {
    const text = git(["show", `${sha}:${rel}/tasks.md`]) ?? "";
    const sections = splitTaskSections(text);
    return new Set(
      sections.flatMap((s) => s.items).filter((i) => i.box !== " ").map((i) => i.text.split(/\s+/)[0]),
    );
  };
  // Chronological pairs: a re-tick is a task ticked in the older commit and
  // unticked in the next one (git log order is newest-first).
  for (let i = commits.length - 1; i >= 1; i--) {
    const before = tickedAt(commits[i].sha);
    const after = tickedAt(commits[i - 1].sha);
    for (const id of before) if (!after.has(id)) reTicks++;
  }
  lines.push(`re-ticks-commit-visible: ${reTicks} (as-of-stamp)`, beyond, "");
  return lines;
}

// --- review yield: findings per file, cross-checked against declared counts --

function reviewYield(changeDir) {
  const lines = ["# review yield", ""];
  lines.push(
    `findings-format-version: ${FORMAT_VERSION} — rows counted: findings tables, "### F# — sev — title", "### [sev] …", "### #. title — sev", "### sev — … — DISPOSED", "- **sev** bullets, "N. **Severity: sev**" lists; declared counts read from ## Counts sections or **Counts:** lines; rows outside this grammar count 0`,
  );

  const reviewsDir = path.join(changeDir, "reviews");
  if (!fs.existsSync(reviewsDir)) {
    lines.push("reviews: absent", "red-records: absent", "");
    return lines;
  }
  const files = fs.readdirSync(reviewsDir)
    .filter((f) => f.endsWith(".md") && f !== "red-records.md" && !f.includes("brief"))
    .sort();
  const mismatches = [];
  for (const file of files) {
    const text = fs.readFileSync(path.join(reviewsDir, file), "utf8");
    const parsed = parseFindingsFile(text);
    lines.push(
      `${file}: blocker ${parsed.blocker} / should ${parsed.should} / note ${parsed.note} — fixed ${parsed.fixed} / open ${parsed.open} / won't-fix ${parsed["won't-fix"]}`,
    );
    const declared = declaredCounts(text);
    if (declared && countsTail(declared) !== countsTail(parsed)) {
      mismatches.push(
        `declared-counts-mismatch: ${file} — declared ${countsTail(declared)} vs parsed ${countsTail(parsed)} — parsed numbers win`,
      );
    }
  }
  lines.push(...mismatches);
  lines.push(`red-records: ${fs.existsSync(path.join(reviewsDir, "red-records.md")) ? "present" : "absent"}`, "");
  return lines;
}

// --- the stamp ---------------------------------------------------------------

export function deriveStamp(changeDir, { git = null, now = () => new Date() } = {}) {
  const headSha = git ? (git(["rev-parse", "HEAD"]) ?? "").trim() : "";
  const parts = [
    `# metrics — ${path.basename(changeDir)}`,
    "",
    `derived: ${headSha ? `${headSha.slice(0, 10)} ` : ""}${now().toISOString()} (as-of-stamp)`,
    "",
    ...specStrength(changeDir),
    ...convergence(changeDir, git),
    ...reviewYield(changeDir),
    "# honest gaps",
    "",
    "- feature→archive gap: the archive pair-commit lands after this stamp; every git fact covers cdd/changes/<name> only (as-of-stamp)",
    "- agent-only time: elapsed-so-far is wall-clock between the first and last path commit; it includes director waits and idle time, not agent effort",
    "- session-token cost: not derivable until phase 2 (session-token join held by PF-33)",
    "",
  ];
  return { text: parts.join("\n"), stamped: true };
}
