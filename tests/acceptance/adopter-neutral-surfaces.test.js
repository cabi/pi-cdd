#!/usr/bin/env node
// Acceptance pin for adopter-neutral surfaces: the corpus rule 4 texts, the
// door-finding message sources (extension copies and store twins alike), and
// a fresh scaffolded store all scan clean of four-digit decision-id literals.

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { initStore } from "../../lib/store.mjs";
import { DELTA_INSTRUCTION } from "../../lib/instructions.mjs";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const ID = /ADR-\d{4}/g;

const read = (rel) => fs.readFileSync(path.join(REPO, rel), "utf8");

/** Every four-digit decision-id literal in a text, as label:line:id rows. */
function scanText(text, label) {
  return text
    .split("\n")
    .flatMap((line, i) => [...line.matchAll(ID)].map((m) => `${label}:${i + 1}: ${m[0]}`));
}

const scan = (rel) => scanText(read(rel), rel);

describe("adopter-neutral-surfaces.test.js — no decision-id literal on adopter-visible surfaces", () => {
  test("corpus text cites no decision id", () => {
    // The rules template rule 4, the store copy rule 4, and the delta
    // authoring instruction source and its exported string.
    const surfaces = ["lib/templates.mjs", "cdd/rules.md", "lib/instructions.mjs"];
    const hits = surfaces.flatMap(scan);
    assert.deepEqual(hits, []);

    // The exported delta instruction scans clean as a rendered value, not
    // just as source text — interpolation cannot reintroduce an id.
    assert.deepEqual(scanText(DELTA_INSTRUCTION, "DELTA_INSTRUCTION"), []);

    // Rule 4 still names the fenced Feature document with the pin comment inside.
    for (const rel of ["lib/templates.mjs", "cdd/rules.md"]) {
      const src = read(rel);
      assert.match(src, /gherkin fence/, `${rel}: rule 4 names the fence`);
      assert.match(src, /complete Gherkin document/, `${rel}: rule 4 names the document`);
      assert.match(src, /Feature: <name>/, `${rel}: rule 4 names the Feature document`);
      assert.match(src, /pin comment/, `${rel}: rule 4 names the pin comment`);
    }
    const instr = read("lib/instructions.mjs");
    assert.match(instr, /complete Gherkin document/, "instructions keep the document law");
    assert.match(instr, /# Verified by: tests\/acceptance\//, "instructions keep the pin law");
  });

  test("door findings cite no decision id", () => {
    // The finding message sources of the validator, the drift guard, and the
    // grammar law — extension copies and store twins alike.
    const surfaces = [
      "lib/validate.mjs",
      "scripts/spec-drift.mjs",
      "scripts/grammar-law.mjs",
      "cdd/scripts/spec-drift.mjs",
      "cdd/scripts/grammar-law.mjs",
    ];
    assert.deepEqual(surfaces.flatMap(scan), []);

    // Each message keeps its law phrase, extension copy and store twin alike.
    const lawPhrases = {
      "lib/validate.mjs": [
        "scenarios live inside the Feature fence",
        'inside the fence as a "# Verified by:" comment',
      ],
      "scripts/spec-drift.mjs": ["comment on the scenario"],
      "cdd/scripts/spec-drift.mjs": ["comment on the scenario"],
      "scripts/grammar-law.mjs": [
        "write each example as its own Scenario",
        "steps stay single-line prose",
      ],
      "cdd/scripts/grammar-law.mjs": [
        "write each example as its own Scenario",
        "steps stay single-line prose",
      ],
    };
    for (const [rel, phrases] of Object.entries(lawPhrases)) {
      const src = read(rel);
      for (const phrase of phrases) {
        assert.ok(src.includes(phrase), `${rel} keeps its law phrase: ${phrase}`);
      }
    }
  });

  test("a fresh adopter store is id-clean", () => {
    // An empty directory outside this repository, scaffolded with the
    // defaults: CI templates for both forges and the git hooks.
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cdd-id-clean-"));
    try {
      initStore(dir, REPO);

      const written = [];
      const walk = (p) => {
        for (const e of fs.readdirSync(p, { withFileTypes: true })) {
          const q = path.join(p, e.name);
          if (e.isDirectory()) walk(q);
          else written.push(q);
        }
      };
      walk(dir);
      assert.ok(
        written.some((p) => p.endsWith(path.join("cdd", "rules.md"))),
        "store scaffolded"
      );
      assert.ok(
        written.some((p) => p.endsWith(path.join("cdd", "scripts", "spec-drift.mjs"))),
        "door scripts written"
      );
      assert.ok(
        written.some((p) => p.endsWith(path.join(".githooks", "pre-commit"))),
        "pre-commit hook written"
      );
      assert.ok(
        written.some((p) => p.endsWith(path.join(".githooks", "commit-msg"))),
        "commit-msg hook written"
      );

      const hits = [];
      for (const abs of written) {
        const rel = path.relative(dir, abs);
        hits.push(...scanText(fs.readFileSync(abs, "utf8"), rel));
      }
      assert.deepEqual(hits, []);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
