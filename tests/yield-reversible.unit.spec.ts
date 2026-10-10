import { test, expect } from "@playwright/test";
import baseline from "./fixtures/yield-reversible-baseline.json";
import { lessons } from "../src/content/curriculum";
import { mark } from "../src/lib/marking";
import { execFileSync } from "node:child_process";
import {
  turnoverRecords,
  tokenSnapshot,
} from "../src/lib/reversible-equilibrium";

const j = lessons.find((l) => l.slug === "yield-and-atom-economy")!.journey!;
const all = [
  ...j.warmup,
  ...j.refresher,
  ...j.guided,
  ...j.practice,
  ...j.checkForms.flat(),
  ...j.reviewForms.flat(),
];
test("the yield view retains conserved product counts without unrelated rate-answer fields; the original model remains complete", () => {
  // Render real React in Node: Playwright's JSX transform uses test descriptors.
  const { original, focused, alternate, bytes, after } = JSON.parse(
    execFileSync(
      process.execPath,
      [
        "-e",
        String.raw`
    const fs = require('node:fs'), path = require('node:path');
    const ts = require('typescript'), Module = require('node:module');
    const root = process.cwd(), resolve = Module._resolveFilename;
    Module._resolveFilename = function(request, ...args) {
      return resolve.call(this, request.startsWith('@/') ? path.join(root, 'src', request.slice(2)) : request, ...args);
    };
    for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX }
    }).outputText, f);
    const React = require('react'), { renderToStaticMarkup } = require('react-dom/server');
    const { ReversibleWorkbench } = require('./src/components/ReversibleWorkbench.tsx');
    const { initialReversibleBoard } = require('./src/lib/reversible-board.ts');
    const props = { mode: 'turnover', history: [initialReversibleBoard('turnover')], onChange: () => {} };
    const original = renderToStaticMarkup(React.createElement(ReversibleWorkbench, props));
    const focused = renderToStaticMarkup(React.createElement(ReversibleWorkbench, { ...props, yieldComparison: true }));
    const saved = initialReversibleBoard('turnover', 'products'), bytes = JSON.stringify(saved);
    const alternate = renderToStaticMarkup(React.createElement(ReversibleWorkbench, { ...props, yieldComparison: true, history: [saved] }));
    process.stdout.write(JSON.stringify({original, focused, alternate, bytes, after: JSON.stringify(saved)}));
  `,
      ],
      { encoding: "utf8" },
    ),
  );
  expect(original).toContain("Your cumulative forward events");
  expect(original).toContain("Check model");
  expect(original).toContain("Amounts and gross reaction events");
  expect(focused).toContain("Advance one interval");
  expect(focused).toContain("Remaining A units</dt><dd>14</dd>");
  expect(focused).toContain("Desired B units</dt><dd>6</dd>");
  expect(focused).toContain("Complete-conversion B maximum</dt><dd>20</dd>");
  expect(focused).not.toContain("Your cumulative forward events");
  expect(focused).not.toContain("Check model");
  expect(focused).not.toContain("Change the supplied teaching case");
  expect(focused).toContain("Reset model");
  expect(focused).toContain("About this model");
  expect(alternate).toContain("You are exploring another supplied comparison");
  expect(alternate).toContain("Your cumulative forward events");
  expect(after).toBe(bytes);
});
test("original 48 yield definitions, v1 and stage/form positions remain exact", () => {
  expect(j.version).toBe(1);
  expect(all).toHaveLength(60);
  expect(new Set(all.map((q) => q.id)).size).toBe(60);
  // The archived definitions remain exact except these explicit editorial fixes.
  const editorialFixes = [
    ["Shortfall5", "Shortfall 5"],
    ["product13.7", "product 13.7"],
    ["theoretical18.4", "theoretical 18.4"],
    ["to3 significant", "to 3 significant"],
    ["to74.5%", "to 74.5%"],
    ["forms .24 g", "forms; 24 g"],
    ["forms .20 g", "forms; 20 g"],
  ];
  for (const q of baseline.tasks) {
    let expected = JSON.stringify(q);
    for (const [before, after] of editorialFixes)
      expected = expected.replace(before, after);
    expect(JSON.parse(JSON.stringify(all.find((t) => t.id === q.id)))).toEqual(
      JSON.parse(expected),
    );
  }
  for (const stage of ["warmup", "refresher", "guided", "practice"] as const)
    expect(
      j[stage].slice(0, baseline.stageIds[stage].length).map((q) => q.id),
    ).toEqual(baseline.stageIds[stage]);
  expect(j.checkForms.slice(0, 2).map((f) => f.map((q) => q.id))).toEqual(
    baseline.checkForms,
  );
  expect(j.reviewForms.slice(0, 2).map((f) => f.map((q) => q.id))).toEqual(
    baseline.reviewForms,
  );
});
test("literal product fractions and continuing equal turnovers preserve the product inventory", () => {
  for (const [suffix, correct, wrong] of [
    ["g-inventory", "30", "42.857"],
    ["ca-yield", "65", "35"],
    ["cb-yield", "64", "36"],
    ["ra-yield", "60", "40"],
    ["rb-yield", "60", "40"],
  ]) {
    const q = all.find((t) => t.id === `py-v1-reversible-${suffix}`)!;
    expect(mark(q, correct).correct, q.id).toBe(true);
    expect(mark(q, wrong).correct, q.id).toBe(false);
    expect(mark(q, "unreadable").invalid, q.id).toBe(true);
  }
  const record = turnoverRecords.initial;
  expect(record.a).toBe(14);
  expect(record.b).toBe(6);
  expect(record.forward).toBe(2);
  expect(record.reverse).toBe(2);
  expect(record.closed).toBe(true);
  for (const step of [0, 1, 2]) {
    const tokens = tokenSnapshot(record, step);
    expect(tokens.filter((t) => t.state === "B")).toHaveLength(6);
    expect(tokens).toHaveLength(20);
  }
});
test("all complete causal responses remain manual and have conservative direct exposure families", () => {
  const added = all.filter((q) => q.id.startsWith("py-v1-reversible-"));
  expect(added.filter((q) => q.rubric)).toHaveLength(7);
  for (const q of added) {
    expect(q.tier).toBeUndefined();
    expect(q.exposureAliases?.sort()).toEqual(
      added
        .filter((t) => t.id !== q.id)
        .map((t) => t.id)
        .sort(),
    );
    if (q.rubric) {
      expect(q.options).toBeUndefined();
      expect(q.rubric.length).toBe(3);
      expect(mark(q, q.answer).correct).toBe(false);
      expect(mark(q, "The atoms were destroyed").correct).toBe(false);
      expect(mark(q, "   ").empty).toBe(true);
      expect(q.referenceResponse).toBe(q.answer);
    }
  }
});
