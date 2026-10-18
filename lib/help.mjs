// help.mjs — the /cdd-help screen. Content lives here (plain, testable);
// index.ts renders it with the session theme. Styling uses ONLY the theme
// helpers and semantic tokens pi provides (accent/success/warning/muted/dim).

export const HELP_LINES = [
  ["title", "cdd — how you drive the loop"],
  ["muted", "Your prompts are the triggers; the gates decide when it's enough."],
  ["blank", ""],
  ["h", "Phases and your prompts"],
  ["step", ["1", '"New change: <what and why>"', "design gate → proposal → deltas (pinned) → tasks"]],
  ["step", ["2", '"implement <change>"', "test-first: acceptance test exists before the task ticks"]],
  ["step", ["3", "(automatic at green)", "cdd_archive runs itself — or you: /cdd-archive <name>"]],
  ["tip", ["any time", "/cdd-status", "table of open + archived changes with verdicts and next step"]],
  ["blank", ""],
  ["h", '"Enough" is mechanical, never a feeling'],
  ["ok", 'authoring done  = cdd_validate draft green — placeholders replaced, every scenario ends with "Verified by: tests/acceptance/…"'],
  ["ok", "change done     = your Done-When line is true → strict green + guard green → archived"],
  ["blank", ""],
  ["h", "Commands and tools"],
  ["row", "/cdd-init · /cdd-new · /cdd-validate · /cdd-status · /cdd-archive · /cdd-help"],
  ["row", "agent tools: cdd_init · cdd_new_change · cdd_validate · cdd_status · cdd_archive"],
  ["blank", ""],
  ["h", "Rules that bite"],
  ["row", 'mechanical sweeps commit with "Mechanical-Change: <reason>" and never touch specs or acceptance tests'],
  ["row", "source code carries no spec markers — traceability lives in cdd/ only"],
  ["muted", "No store yet? /cdd-init first."],
];

/** Plain text (no ANSI) — used by smoke tests and non-themed contexts. */
export function helpText() {
  return HELP_LINES.map((l) => {
    if (l[0] === "blank") return "";
    if (l[0] === "step") return `  ${l[1][0]}. ${l[1][1]}  →  ${l[1][2]}`;
    if (l[0] === "tip") return `  ${l[1][0]}: ${l[1][1]}  →  ${l[1][2]}`;
    return l[0] === "title" || l[0] === "h" ? String(l[1]) : `  ${l[1]}`;
  }).join("\n");
}

/** Themed rendering for the TUI: theme.style()/theme.fg() with real pi tokens only. */
export function renderHelp(theme) {
  return HELP_LINES.map((l) => {
    const [kind, a] = l;
    switch (kind) {
      case "blank":
        return "";
      case "title":
        return theme.style(String(a), { fg: "accent", bold: true });
      case "h":
        return theme.style(String(a), { fg: "accent" });
      case "muted":
        return theme.style(`  ${a}`, { fg: "muted" });
      case "ok":
        return theme.fg("success", `  ${a}`);
      case "step":
        return `  ${theme.fg("accent", `${a[0]}.`)} ${a[1]}  ${theme.fg("muted", `→  ${a[2]}`)}`;
      case "tip":
        return `  ${theme.fg("dim", `${a[0]}`)}: ${a[1]}  ${theme.fg("muted", `→  ${a[2]}`)}`;
      default:
        return theme.fg("text", `  ${a}`);
    }
  }).join("\n");
}
