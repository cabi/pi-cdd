// status-ui.ts — the /cdd-status TUI window (door 1 for the human): two tabs
// (open changes first, archived second), each a keyboard-sortable table with
// the newest change on top; in-process rows are highlighted. Rendering uses
// ONLY theme tokens pi provides and pi-tui width utilities — no hardcoded
// colors, no second renderer (see docs/tui.md).

import type { Theme } from "@earendil-works/pi-coding-agent";
import { matchesKey, truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

/** The slice of status() output this view consumes (lib/status.mjs is the owner). */
export type StatusData = {
  store: boolean;
  hint?: string;
  openChanges?: {
    name: string;
    state: "authoring" | "in-process" | "ready";
    updated: number;
    progress: { done: number; total: number } | null;
    verdicts: { draft: boolean; strict: boolean };
    next: string;
  }[];
  archived?: { name: string; date: string; caps: number }[];
};


/** Options object of theme.style() — keeps cell styling fully token-typed. */
type StyleOpts = Parameters<Theme["style"]>[1];
type Row = {
  cells: string[]; // display text per column
  keys: (string | number)[]; // sort key per column
  inProcess?: boolean; // highlighted (bg selectedBg)
  dim?: boolean; // frozen history (archived)
};

type Table = {
  tab: string; // tab label
  empty: string; // hint when there are no rows
  columns: string[];
  defaultDir: (1 | -1)[]; // initial sort direction per column
  rows: Row[];
};

const STATE_RANK: Record<string, number> = { authoring: 0, "in-process": 1, ready: 2 };

function relTime(ms: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  return new Date(ms).toISOString().slice(0, 10);
}

function isoDate(yyyymmdd: string): string {
  return yyyymmdd.length === 8 ? `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}` : yyyymmdd;
}

function openTable(s: StatusData): Table {
  const rows = (s.openChanges ?? []).map((c) => ({
    cells: [
      c.name,
      relTime(c.updated),
      c.state,
      c.progress ? `${c.progress.done}/${c.progress.total}` : "—",
      c.verdicts.draft ? "✓" : "✗",
      c.verdicts.strict ? "✓" : "✗",
      c.next,
    ],
    keys: [
      c.name,
      c.updated,
      STATE_RANK[c.state] ?? 0,
      c.progress ? c.progress.done / Math.max(1, c.progress.total) : -1,
      c.verdicts.draft ? 1 : 0,
      c.verdicts.strict ? 1 : 0,
      c.next,
    ],
    inProcess: c.state === "in-process",
  }));
  return {
    tab: "Open",
    empty: "no open changes — /cdd-new <name>",
    columns: ["Change", "Updated", "State", "Tasks", "Draft", "Strict", "Next"],
    defaultDir: [1, -1, 1, 1, 1, 1, 1],
    rows,
  };
}

function archivedTable(s: StatusData): Table {
  const rows = (s.archived ?? []).map((a) => ({
    cells: [a.name, isoDate(a.date), String(a.caps)],
    keys: [a.name, a.date, a.caps],
    dim: true,
  }));
  return {
    tab: "Archived",
    empty: "archive is empty — archived changes land here",
    columns: ["Change", "Archived", "Caps"],
    defaultDir: [1, -1, 1],
    rows,
  };
}

/** One /cdd-status interaction: owns input until done() closes it. */
export class CddStatusView {
  private readonly theme: Theme;
  private readonly requestRender: () => void;
  private readonly onClose: () => void;
  private readonly store: boolean;
  private readonly hint: string;
  private readonly tables: [Table, Table];
  private tab = 0;
  private rowCursor = 0;
  private colCursor = 0;
  private sortCol: [number, number];
  private sortDir: [1 | -1, 1 | -1];
  private cachedWidth?: number;
  private cachedLines?: string[];

  constructor(data: StatusData, tui: { requestRender(): void }, theme: Theme, onClose: () => void) {
    this.theme = theme;
    this.requestRender = () => tui.requestRender();
    this.onClose = onClose;
    this.store = data.store;
    this.hint = data.hint ?? "no store";
    this.tables = [openTable(data), archivedTable(data)];
    // newest on top: open sorts by Updated desc, archived by Archived desc
    this.sortCol = [1, 1];
    this.sortDir = [-1, -1];
  }

  handleInput(data: string): void {
    if (matchesKey(data, "escape") || matchesKey(data, "ctrl+c") || data === "q" || data === "Q") {
      this.onClose();
      return;
    }
    const t = this.tables[this.tab];
    if (matchesKey(data, "tab") || matchesKey(data, "shift+tab")) {
      this.tab = 1 - this.tab;
      this.rowCursor = 0;
      this.colCursor = this.sortCol[this.tab];
    } else if (matchesKey(data, "up") || data === "k" || data === "K") {
      this.rowCursor = Math.max(0, this.rowCursor - 1);
    } else if (matchesKey(data, "down") || data === "j" || data === "J") {
      this.rowCursor = Math.min(Math.max(0, t.rows.length - 1), this.rowCursor + 1);
    } else if (matchesKey(data, "left") || data === "h" || data === "H") {
      this.colCursor = Math.max(0, this.colCursor - 1);
    } else if (matchesKey(data, "right") || data === "l" || data === "L") {
      this.colCursor = Math.min(t.columns.length - 1, this.colCursor + 1);
    } else if (data === "s" || data === "S" || matchesKey(data, "enter") || matchesKey(data, "return")) {
      if (this.sortCol[this.tab] === this.colCursor) {
        this.sortDir[this.tab] = this.sortDir[this.tab] === 1 ? -1 : 1;
      } else {
        this.sortCol[this.tab] = this.colCursor;
        this.sortDir[this.tab] = this.tables[this.tab].defaultDir[this.colCursor];
      }
      this.rowCursor = 0;
    } else {
      return; // unhandled key — no state change, no re-render
    }
    this.invalidate();
    this.requestRender();
  }

  invalidate(): void {
    this.cachedWidth = undefined;
    this.cachedLines = undefined;
  }

  private sorted(): Row[] {
    const t = this.tables[this.tab];
    const col = this.sortCol[this.tab];
    const dir = this.sortDir[this.tab];
    return [...t.rows].sort((a, b) => {
      const ka = a.keys[col];
      const kb = b.keys[col];
      const c =
        typeof ka === "number" && typeof kb === "number" ? ka - kb : String(ka).localeCompare(String(kb));
      if (c !== 0) return c * dir;
      return String(a.keys[0]).localeCompare(String(b.keys[0])); // stable tiebreak: name asc
    });
  }

  render(width: number): string[] {
    if (this.cachedLines && this.cachedWidth === width) return this.cachedLines;
    const th = this.theme;
    const lines: string[] = [];

    // title (same shape as the /cdd-help screen)
    lines.push("");
    const title = th.style(" cdd status ", { fg: "accent", bold: true });
    lines.push(
      truncateToWidth(th.fg("borderMuted", "─".repeat(3)) + title + th.fg("borderMuted", "─".repeat(Math.max(0, width - 15))), width),
    );
    lines.push("");

    if (!this.store) {
      lines.push(truncateToWidth(`  ${th.fg("warning", this.hint)}`, width));
      lines.push("");
      lines.push(truncateToWidth(`  ${th.fg("dim", "esc close")}`, width));
      lines.push("");
      this.cachedWidth = width;
      this.cachedLines = lines;
      return lines;
    }

    // tab bar — active tab sits on the selection background
    const [open, archived] = this.tables;
    const tabs = [
      th.style(` ${open.tab} (${open.rows.length}) `, this.tab === 0 ? { fg: "accent", bg: "selectedBg", bold: true } : { fg: "muted" }),
      th.style(` ${archived.tab} (${archived.rows.length}) `, this.tab === 1 ? { fg: "accent", bg: "selectedBg", bold: true } : { fg: "muted" }),
    ];
    lines.push(truncateToWidth(`  ${tabs[0]}${tabs[1]}`, width));
    lines.push("");

    const t = this.tables[this.tab];
    const rows = this.sorted();
    if (rows.length === 0) {
      lines.push(truncateToWidth(`  ${th.fg("dim", t.empty)}`, width));
    } else {
      const col = this.sortCol[this.tab];
      const dir = this.sortDir[this.tab];
      const header = t.columns.map((c, i) => c + (i === col ? (dir === -1 ? " ↓" : " ↑") : ""));
      const widths = t.columns.map((_, i) => Math.max(header[i].length, ...rows.map((r) => visibleWidth(r.cells[i]))));
      const pad = (s: string, w: number) => s + " ".repeat(Math.max(0, w - visibleWidth(s)));

      // header: the sort column carries the direction arrow, the column
      // cursor (what enter/s will sort) is underlined
      lines.push(
        truncateToWidth(
          "  " + header.map((h, i) => th.style(pad(h, widths[i]), { fg: "accent", bold: true, underline: i === this.colCursor })).join("  "),
          width,
        ),
      );
      lines.push(truncateToWidth(th.fg("borderMuted", "  " + "─".repeat(widths.reduce((a, w) => a + w, 0) + 2 * (widths.length - 1))), width));

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const bg = r.inProcess ? "selectedBg" : undefined;
        const cells = r.cells.map((cell, j) => {
          const opts: StyleOpts = {};
          if (bg) opts.bg = bg;
          if (j === 0 && i === this.rowCursor) {
            opts.fg = "accent";
            opts.bold = true;
          } else if (j === 2 && t.tab === "Open") {
            opts.fg = cell === "in-process" ? "warning" : cell === "ready" ? "success" : "muted";
            if (cell === "in-process") opts.bold = true;
          } else if ((j === 4 || j === 5) && t.tab === "Open") {
            opts.fg = cell === "✓" ? "success" : "error";
          } else if (r.dim && j !== 0) {
            opts.fg = "dim";
          } else if (r.dim && j === 0) {
            opts.fg = "muted";
          } else if (j === 1 && t.tab === "Open") {
            opts.fg = "dim";
          }
          return Object.keys(opts).length ? th.style(pad(cell, widths[j]), opts) : pad(cell, widths[j]);
        });
        const arrow = i === this.rowCursor ? th.fg("accent", "▸ ") : "  ";
        lines.push(truncateToWidth(arrow + cells.join("  "), width));
      }
    }

    lines.push("");
    lines.push(
      truncateToWidth(
        `  ${th.fg("dim", "tab switch · ↑↓ row · ←→ column · enter/s sort · in-process highlighted · esc close")}`,
        width,
      ),
    );
    lines.push("");

    this.cachedWidth = width;
    this.cachedLines = lines;
    return lines;
  }
}
