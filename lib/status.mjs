import * as fs from "node:fs";
import * as path from "node:path";
import { hasStore, listChanges, listCapabilities, listArchived } from "./store.mjs";
import { validateChange } from "./validate.mjs";

/** Structured status for tools (JSON): open changes with progress/verdicts/next, archived, capabilities. */
export function status(root) {
  if (!hasStore(root)) return { store: false, hint: "no cdd/ store — run cdd_init" };
  const taskProgress = (c) => {
    const f = path.join(root, "cdd", "changes", c, "tasks.md");
    if (!fs.existsSync(f)) return null;
    const beforeClose = fs.readFileSync(f, "utf8").split(/^## 4\. Close/m)[0];
    const boxes = [...beforeClose.matchAll(/^- \[([ x])\] /gm)];
    return { done: boxes.filter((b) => b[1] === "x").length, total: boxes.length };
  };
  const openChanges = listChanges(root).map((c) => {
    const strict = validateChange(root, c, "strict");
    const draft = validateChange(root, c, "draft");
    const firstNonTasks = draft.errors.find((e) => !/tasks\.md/.test(e));
    const next = strict.ok
      ? "ready to archive"
      : firstNonTasks
        ? `author: ${firstNonTasks.slice(0, 60)}`
        : draft.errors.length
          ? "implement: tick tasks (verify-by pins)"
          : "strict gap — run cdd_validate";
    return { name: c, progress: taskProgress(c), verdicts: { draft: draft.ok, strict: strict.ok }, next };
  });
  return {
    store: true,
    openChanges,
    capabilities: listCapabilities(root),
    archived: listArchived(root),
  };
}

/** Human table for the TUI transcript (and print mode): open + archived changes. */
export function statusTable(s) {
  if (!s.store) return s.hint;
  const rows = [["Change", "State", "Tasks", "Draft", "Strict", "Next"]];
  for (const c of s.openChanges) {
    rows.push([
      c.name,
      "open",
      c.progress ? `${c.progress.done}/${c.progress.total}` : "—",
      c.verdicts.draft ? "✓" : "✗",
      c.verdicts.strict ? "✓" : "✗",
      c.next,
    ]);
  }
  for (const a of s.archived) {
    rows.push([a.name, `archived ${a.date}`, "done", "—", "—", "frozen history"]);
  }
  if (rows.length === 1) return "no changes yet — /cdd-new <name>";
  const widths = rows[0].map((_, i) => Math.max(...rows.map((r) => r[i].length)));
  const line = (r, sep) => r.map((cell, i) => cell.padEnd(widths[i])).join(` ${sep} `);
  return [line(rows[0], "│"), widths.map((w) => "─".repeat(w)).join("─┼─"), ...rows.slice(1).map((r) => line(r, "│"))].join("\n");
}
