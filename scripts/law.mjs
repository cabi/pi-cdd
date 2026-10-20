// law.mjs — the one law behind every door. Zero dependencies, plain
// Node >= 20 (ADR-0001): lib (door 1) imports it from the extension tree,
// the copied door scripts (cdd/scripts/) import their own copy. A grammar
// defined here is defined exactly once — doors adapt it, they never restate
// it.
//
// Chapter: tasks.md — the four-step skeleton and its checkboxes.

/** Implementation subtasks above this warn — the design-gate split signal (rule 6). */
export const SPLIT_SIGNAL = 8;

/** Implementation subtasks above this fail strict validation (rule 6). */
export const TASK_LIMIT = 12;

/** The four-step skeleton headings: `## 1. Context` … `## 4. Close`. */
export const TASK_SECTION = /^## ([1-4])\. (Context|Design|Implementation|Close)\s*$/;

/** A tracked checkbox line, numbered or not: `- [x] 3.1 text`. */
export const TASK_ITEM = /^- \[([ xX])\] (.+)$/;

/**
 * Split a tasks body into its skeleton sections: [{num, name, startLine,
 * startIndex, items: [{box, text, id, line}]}]. startIndex is the char offset
 * of the header line — text.slice(startIndex) runs from the header to the end
 * of the file. Any other ## heading (## Done When Traceability, ## Design
 * Notes) ends the section above it; checkboxes under it belong to no section.
 */
export function splitTaskSections(text) {
  const lines = text.split("\n");
  const sections = [];
  let current = null;
  let offset = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^## /.test(line)) {
      const header = line.match(TASK_SECTION);
      if (header) {
        current = { num: Number(header[1]), name: header[2], startLine: i + 1, startIndex: offset, items: [] };
        sections.push(current);
      } else {
        current = null;
      }
    } else if (current) {
      const item = line.match(TASK_ITEM);
      if (item) current.items.push({ box: item[1], text: item[2], line: i + 1 });
    }
    offset += line.length + 1;
  }
  for (const s of sections) {
    for (const it of s.items) {
      const id = it.text.match(/^(\d+)\.(\d+)\s/);
      it.id = id ? `${id[1]}.${id[2]}` : null;
    }
  }
  return sections;
}
