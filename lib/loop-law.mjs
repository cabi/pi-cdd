// loop-law.mjs — the loop law's facts, stated once. Every statement surface
// — the rules text (templates.mjs), the scaffold instructions, the ambient
// block, and /cdd-help — renders these facts from this module. The law
// prose (lawRule2/lawRule2a/2b/2c and lawRule3) is canonical text kept
// to the store copy of the rules; REVIEW_POINTS carries each trigger twice —
// normative (law + instructions) and compact (token-budgeted ambient + help),
// pinned to each other by tests — and FINDINGS_GRAMMAR is the machine-
// readable grammar. LOOP_CHAIN is the operational chain the ambient block
// renders; rule 2's loop is the law's own prose. Zero dependencies.

// The operational chain the ambient block renders. Rule 2's loop (lawRule2
// below) is the law's own prose at law granularity — byte-pinned, not derived.
export const LOOP_CHAIN = [
  "design gate",
  "proposal",
  'spec delta (every scenario ends with "Verified by: tests/acceptance/<path>")',
  "tasks",
  "acceptance tests first",
  "cdd validate strict green",
  "guard green (node cdd/scripts/spec-drift.mjs)",
  "cdd archive",
];

export function ambientLoopLine() {
  return `New change: ${LOOP_CHAIN.join(" → ")}.`;
}

export const REVIEW_POINTS = [
  {
    id: "R1",
    trigger: "after the proposal, if the design gate answered T1 or T2 YES",
    triggerCompact: "after the proposal, if T1 or T2 YES",
    placement: "after the proposal",
    skill: "cdd-spec-review",
    mode: "proposal",
    findings: "reviews/r1-proposal-review.md",
  },
  {
    id: "R2",
    trigger: "always, at draft-green, before the first implementation task",
    triggerCompact: "always, at draft-green",
    placement: "at draft-green",
    skill: "cdd-spec-review",
    mode: "package",
    findings: "reviews/r2-change-review.md",
  },
  {
    id: "R3",
    trigger: "at Close before archive",
    triggerCompact: "at Close before archive",
    placement: "before archive",
    skill: "cdd-code-review",
    mode: null,
    findingsStandards: "reviews/r3-standards-code-review.md",
    findingsSpec: "reviews/r3-spec-code-review.md",
  },
  {
    id: "ADR",
    trigger: "if the change drafted an ADR or amended one's decision content — a Reconfirmed-by paragraph or a typo fix does not count",
    triggerCompact: "if ADR decision content was drafted or amended",
    placement: null,
    skill: "cdd-adr-review",
    mode: null,
    findings: "reviews/adr-review.md",
  },
];

export const FINDINGS_GRAMMAR = {
  severities: ["blocker", "should", "note"],
  dispositions: ["fixed:", "open", "won't-fix:"],
  neverVerdicts: "never red or green verdicts",
  reviewerForms: ["cold sub-agent", "same-session re-read"],
};

export function reviewPoint(id) {
  const p = REVIEW_POINTS.find((p) => p.id === id);
  if (!p) throw new Error(`no review point ${id}`);
  return p;
}


export function lawRule2() {
  return `2. **The change loop** — design gate (its T1–T5 answers are written into
   tasks §2 as the gate runs, before the proposal is drafted) → proposal →
   delta → tasks → implement with acceptance tests → archive. One change
   folder per change, with the review points of rule 2a wired in: R1 after
   the proposal, R2 ${reviewPoint("R2").placement}, R3 ${reviewPoint("R3").placement}.`;
}

export function lawRule2a() {
  return `2a. **Review points are advisory findings, never verdicts** — R1: after the
    proposal, if the design gate answered T1 or T2 YES (T1 cross-cutting,
    T2 architecture bet), skill \`${reviewPoint("R1").skill}\` runs in ${reviewPoint("R1").mode} mode
    (findings: \`cdd/changes/<name>/${reviewPoint("R1").findings}\`). R2:
    always, at draft-green (the package is drafted — proposal, delta, tasks
    on disk — and \`cdd validate\` draft mode passes), before the first
    implementation task, skill \`${reviewPoint("R2").skill}\` runs in ${reviewPoint("R2").mode} mode
    (findings: \`${reviewPoint("R2").findings}\`). R3: at Close before
    archive, skill \`${reviewPoint("R3").skill}\` runs as two separate cold
    sessions — rule 2b governs both axes — with findings at
    \`${reviewPoint("R3").findingsStandards}\` for the standards axis and
    \`${reviewPoint("R3").findingsSpec}\` for the spec axis, and
    ${reviewPoint("ADR").trigger},
    skill \`${reviewPoint("ADR").skill}\` runs on them (findings:
    \`${reviewPoint("ADR").findings}\`). Every ADR lives in \`cdd/decisions/\` —
    0001–0007 the product decisions, 0008 and later the loop decisions —
    there is no second decisions directory. A review reports findings with severity
    ${FINDINGS_GRAMMAR.severities.join("/")} and disposition ${FINDINGS_GRAMMAR.dispositions.join("/")}, never red
    or green verdicts; gate authority stays with the deterministic
    validators and the human. An open blocker stops the loop at that step
    until disposed.`;
}

export const REVIEWER_INDEPENDENCE = {
  principle: "the reviewer is not the author of the artifacts under review",
  coldForm: "cold sub-agent",
  fallbackForm: "same-session re-read",
  recording: "records its form and justification in the findings file header",
  recordingCompact: "fallback recorded with justification",
  familySeparation:
    "The reviewer's model family differs from the author's — family meaning the same provider or model lineage",
  familyEscape: "stops and asks the human sponsor rather than silently degrading the review",
  twoAxes: "two separate cold sessions, each with its own brief",
};

export function lawRule2b() {
  return `2b. **Reviews run cold** — the reviewer is not the author of the
    artifacts under review; every model-run review runs as a cold
    sub-agent session: a fresh session, briefed only from paths on
    disk (charter plus artifact paths, never curated content). A
    same-session re-read is the lawful but weaker fallback, used
    only with recorded justification, and it records its form and
    justification in the findings file header.
    ${REVIEWER_INDEPENDENCE.familySeparation}; when no reviewer of
    another family exists, the author
    ${REVIEWER_INDEPENDENCE.familyEscape}. R3's standards and spec
    axes run as ${REVIEWER_INDEPENDENCE.twoAxes}.`;
}

export function lawRule2c() {
  return `2c. **Design documents** — a design gate that answers T2 (architecture bet) or
    T4 (invariant risk) YES carries a design document (design.md, sibling of
    the proposal) for that change: exactly 4 mandatory sections — Level,
    Diagram, Boundaries, Alternatives — and exactly 1 mermaid flowchart drawn
    with C4 conventions in flowchart syntax (node labels carry the element
    kind), never a native C4 diagram type. Level states which C4 level —
    Context, Container, or Component — and why the risk lives there; the
    Code level is banned (too fine, it rots fastest). Boundaries hold 1 line
    per diagram box: what it is, what it must not know about. Alternatives
    name the obvious other shape and why not. Every other gate outcome keeps
    the short design note above the tick in the tasks file; the gate record
    names the chosen shape and, for a design document, the C4 level and why.
    When the T2 bet also mints an ADR, the ADR records the decision; the
    design document stays the shape and is archived with the change — an
    ADR may cite the archived design document's path but carries no diagram
    copy.`;
}

export function lawRule3() {
  return `3. **Proposal** — ## Why, ## What Changes, \`Done-When:\` lines carrying
   1-5 completion criteria (each an observable check), one \`Code: <globs>\`
   line naming the implementation surface.`;
}

export function ambientReviewPoints() {
  const r1 = reviewPoint("R1"), r2 = reviewPoint("R2"), r3 = reviewPoint("R3"), adr = reviewPoint("ADR");
  return `Review points (rule 2a): R1 ${r1.triggerCompact} (skill ${r1.skill}, ${r1.mode} mode), R2 ${r2.triggerCompact} (skill ${r2.skill}, ${r2.mode} mode), R3 ${r3.triggerCompact} (skill ${r3.skill}, plus ${adr.skill} ${adr.triggerCompact}) — advisory findings, never verdicts`;
}

export function helpReviewTip() {
  const r1 = reviewPoint("R1"), r2 = reviewPoint("R2"), r3 = reviewPoint("R3"), adr = reviewPoint("ADR");
  return [
    "reviews",
    `R1 ${r1.triggerCompact} · R2 ${r2.triggerCompact} · R3 ${r3.triggerCompact}`,
    `skills ${r1.skill} / ${r3.skill} / ${adr.skill} — advisory findings, never verdicts; ${helpIndependenceLine()}`,
  ];
}

export function proposalIndependence() {
  const ri = REVIEWER_INDEPENDENCE;
  return `Reviews run cold (rule 2b): ${ri.principle} — spawn the R1 reviewer as a fresh ${ri.coldForm} session, briefed from paths on disk, never curated content.`;
}

export function tasksIndependence() {
  const ri = REVIEWER_INDEPENDENCE;
  return `Reviews run cold (rule 2b): ${ri.principle} — every model-run review (R2, R3, ADR) is a fresh ${ri.coldForm} session briefed from paths on disk; a ${ri.fallbackForm} is the weaker fallback and ${ri.recording}.`;
}

export function ambientIndependence() {
  const ri = REVIEWER_INDEPENDENCE;
  return `Reviews run cold (rule 2b): ${ri.principle}; ${ri.coldForm} reviews are the norm, a ${ri.fallbackForm} is the weaker fallback and ${ri.recording}.`;
}

export function helpIndependenceLine() {
  const ri = REVIEWER_INDEPENDENCE;
  return `rule 2b: reviews run cold — ${ri.principle}; ${ri.recordingCompact}`;
}
