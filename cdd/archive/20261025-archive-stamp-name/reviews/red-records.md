# red-records — 20261025-archive-stamp-name

RED-first evidence for tasks 3.2/3.3, captured 2026-10-25 before any
implementation edit landed (lib/store.mjs and lib/adr-ops.mjs untouched at
capture time; the doubled-date compose was still the code under test).

## 3.2 — tests/acceptance/archive-folder-name.test.js

Command: `node tests/acceptance/archive-folder-name.test.js` → exit 1
(`archive-folder-name: 2 passed, 2 failed`)

```
  FAIL AF1  a dated change name strips exactly one leading date segment
       folder must be <stamp>-legacy-thing, got ["20261025-20200101-legacy-thing"]
  ok   AF2  a bare change name appends unchanged
  FAIL AF3  the archived folder never carries a doubled date prefix (name date = stamp date)
       one date prefix total, got ["20261025-20261025-same-day-thing"]
  ok   AF4  the reported archive path locates the stamped metrics file

archive-folder-name: 2 passed, 2 failed
  AF1: folder must be <stamp>-legacy-thing, got ["20261025-20200101-legacy-thing"]
  AF3: one date prefix total, got ["20261025-20261025-same-day-thing"]
```

AF1/AF3 are the RED pins of the new law (the compose still prepends the
stamp to the full dated name — the exact PF-39 defect). AF2 and AF4 are
green-before by design: bare-name append and archivedTo/folder agreement
already hold and the checks pin them as regression guards. The interleaved
`fatal: not a git repository` stderr lines are the sandbox stores' benign
non-git deriveStamp path (the stamp still lands — AF4 proves it).

## 3.3 — tests/acceptance/adr-reconfirm.test.js

Command: `node tests/acceptance/adr-reconfirm.test.js` → exit 1
(`adr-reconfirm: 16 passed, 1 failed`)

```
  ok   RC15  a new reconfirmation lands below the existing ones
  FAIL RC16  a dated change query resolves to its bare archived name
       a dated query must resolve post-archive: unknown change "20261022-dated-thing" — no open change; archived changes live under cdd/archive/<date>-<name>
  ok   RC17  an unknown change name still refuses after normalized matching

adr-reconfirm: 16 passed, 1 failed
  RC16: a dated query must resolve post-archive: unknown change "20261022-dated-thing" — no open change; archived changes live under cdd/archive/<date>-<name>
```

RC16 is the RED pin of the recovery law (no query normalization exists —
the functional half of PF-39). RC17 is green-before by design: the refusal
already holds verbatim; the check pins that normalization must not weaken
it. All 15 pre-existing RC checks stay green (the restated requirement's
existing scenarios).
