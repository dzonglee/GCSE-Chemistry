import { test, expect } from "@playwright/test";
import { ocrPaper2FoundationFull as paper } from "../src/content/ocr-paper2-foundation-full";
import { fullPapers } from "../src/content/full-assessments";
import { questionById } from "../src/content/curriculum";
import { reviewPart } from "../src/lib/exam-paper-review";
import { mark } from "../src/lib/marking";
import { exposureIds, type Response } from "../src/lib/progress";
import { readFuelDrawing } from "../src/lib/fuel-drawing";
import {
  readOrganicDrawing,
  drawingOrganicCounts,
} from "../src/lib/organic-drawing";
import { readPolymerisationDrawing } from "../src/lib/polymerisation-board";
const part = (n: string) => paper.parts.find((p) => p.number === n)!;
const response = (answer: string): Response => ({
  answer,
  correct: false,
  fresh: true,
  helped: false,
  at: 2,
});

test("Gateway02 owns its complete90mark component and Foundation scope", () => {
  expect(paper.basis).toMatchObject({
    board: "OCR",
    qualification: "Gateway Science A J248",
    component: "J248/02",
  });
  expect([paper.totalMarks, paper.minutes, paper.parts.length]).toEqual([
    90, 105, 48,
  ]);
  expect(paper.parts.slice(0, 15).reduce((s, p) => s + p.marks, 0)).toBe(15);
  expect(paper.parts.slice(15).reduce((s, p) => s + p.marks, 0)).toBe(75);
  expect(
    [0, 1, 2].map((i) => paper.parts.reduce((s, p) => s + p.ao[i], 0)),
  ).toEqual([37, 35, 18]);
  expect(
    paper.parts.filter((p) => p.mathematics).reduce((s, p) => s + p.marks, 0),
  ).toBe(23);
  expect(paper.parts.reduce((s, p) => s + (p.practical ?? 0), 0)).toBe(24);
  const ids = fullPapers.flatMap((p) => p.questions.map((q) => q.id));
  expect(new Set(ids).size).toBe(ids.length);
  const excluded = [
    "C5.1a",
    "C5.1c",
    "C5.1d",
    "C5.1e",
    "C5.1f",
    "C5.1k",
    "C5.3c",
    "C6.1c",
    "C6.1d",
    "C6.1e",
    "C6.1f",
    "C6.2e",
    "C6.2f",
  ];
  for (const p of paper.parts) {
    expect(p.question.tier).toBe("foundation");
    expect(questionById(p.question.id)).toBe(p.question);
    expect(
      p.ao.reduce((a, b) => a + b, 0),
      p.number,
    ).toBe(p.marks);
    if (!p.levels)
      expect(
        p.criteria.reduce((s, c) => s + c.marks, p.automaticMarks),
        p.number,
      ).toBe(p.marks);
    for (const clause of p.specification)
      expect(excluded).not.toContain(clause);
  }
});
test("only15 discrete choices are automatically credited; structured methods stay manual", () => {
  for (const p of paper.parts.slice(0, 15)) {
    expect(p.question.options).toHaveLength(4);
    expect(new Set(p.question.options).size).toBe(4);
    expect(
      p.question.options!.filter((o) => o === p.question.answer),
    ).toHaveLength(1);
    expect(reviewPart(p, response(p.question.answer), {}, 1).marks).toBe(1);
    for (const wrong of p.question.options!.filter(
      (o) => o !== p.question.answer,
    ))
      expect(reviewPart(p, response(wrong), {}, 1).marks).toBe(0);
  }
  for (const p of paper.parts.slice(15)) {
    expect(p.automaticMarks).toBe(0);
    expect(p.question.referenceResponse ?? p.question.explanation).not.toMatch(
      /^\s*\{/,
    );
    expect(reviewPart(p, response(p.question.answer), {}, 1).pending).toBe(
      true,
    );
  }
  expect(part("20(a)").criteria).toHaveLength(0);
  expect(part("20(a)").levels?.map((l) => [l.min, l.max])).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
  ]);
});
test("independent arithmetic distinguishes coefficients, offsets, rough titres and functional units", () => {
  const calculations: Record<string, number> = {
    "3": 2 * 9 + 2,
    "7": 40 * 0.15,
    "17(b)": (250 * 112) / 160,
    "17(c)": (144 / 180) * 100,
    "17(d)": Number(((112 / (112 + 3 * (12 + 2 * 16))) * 100).toPrecision(3)),
    "18(b)": Number((22.6 - 2.3).toFixed(2)),
    "18(c)": Number(((22.1 + 22.2 + 22.1) / 3).toFixed(2)),
  };
  for (const [n, value] of Object.entries(calculations))
    expect(Number.parseFloat(part(n).question.answer), n).toBe(value);
  expect(0.012 * 50).toBeCloseTo(0.6);
  expect(0.03 * 30).toBeCloseTo(0.9);
  expect(24 / 15).toBe(1.6);
  expect(part("18(b)").question.answer).toBe("20.30");
  const scale = part("18(b)").question.buretteScale!;
  expect(scale.top).toBe(22);
  expect(scale.reading).toBe(22.6);
  expect(scale.reading).toBeGreaterThan(scale.top);
  expect(scale.reading).toBeLessThan(scale.top + 0.8);
  expect(30 + (scale.reading - scale.top) * 350).toBeCloseTo(240);
  expect(part("18(c)").question.answer).toBe("22.13");
  expect(part("17(d)").question.answer).toBe("45.9");
});
test("new native references retain all atoms, graph fields and repeat attachments", () => {
  const graph = part("19(a)"),
    data = graph.question.fuelDrawing!.data,
    g = readFuelDrawing(graph.referenceConstruction!, data)!;
  expect(data.showEstimate).toBe(false);
  expect(data.points).toEqual([
    [0, 0],
    [15, 24],
    [30, 38],
    [45, 46],
    [60, 48],
    [75, 48],
  ]);
  expect(g.estimate).toBe("");
  data.points.forEach(([x, y], i) => {
    expect(g[`p${i}x`]).toBe(String(x));
    expect(g[`p${i}y`]).toBe(String(y));
    expect(g[`c${i}`]).toBe(String(y));
  });
  const acid = readOrganicDrawing(part("21(a)").referenceConstruction!)!;
  expect(drawingOrganicCounts(acid)).toEqual({ C: 2, H: 4, O: 2 });
  expect([acid.carbonyl, acid.hydroxyl, acid.oxygenH]).toEqual([
    "2",
    "yes",
    "yes",
  ]);
  const repeat = readPolymerisationDrawing(
    part("21(c)").referenceConstruction!,
  )!;
  expect([repeat.s0, repeat.s1, repeat.s2, repeat.s3]).toEqual([
    "H",
    "CH3",
    "H",
    "CH3",
  ]);
  expect([
    repeat.bond,
    repeat.left,
    repeat.right,
    repeat.brackets,
    repeat.countMark,
  ]).toEqual(["1", "1", "1", "1", "n"]);
});
test("valid wrong native proposals and complete references both remain manually reviewed", () => {
  for (const n of ["19(a)", "21(a)", "21(c)"]) {
    const p = part(n),
      wrong = JSON.parse(p.referenceConstruction!);
    if (n === "19(a)") wrong.p2y = "55";
    if (n === "21(a)") wrong.oxygenH = "no";
    if (n === "21(c)") wrong.countMark = "N";
    expect(mark(p.question, JSON.stringify(wrong)).selfReview).toBe(true);
    expect(mark(p.question, p.referenceConstruction!).selfReview).toBe(true);
    expect(reviewPart(p, response(JSON.stringify(wrong)), {}, 1).pending).toBe(
      true,
    );
  }
});
test("previously disclosed recall and construction answers are linked; new numeric demands stay distinct", () => {
  expect(
    paper.parts.filter((p) => p.question.exposureAliases?.length),
  ).toHaveLength(25);
  for (const [n, id] of [
    ["6", "tc-v1-r-enzyme"],
    ["2", "ion-tests-v1-r-fe2"],
    ["13", "gas-tests-v1-r-oxygen"],
    ["19(d)", "chem-p2h-full-v1-01c"],
    ["23(c)", "water-v1-cB-source"],
    ["16(d)", "chem-edx-p2f-full-v1-1d"],
    ["21(a)", "alc-v1-b-draw"],
    ["22(e)", "chem-edx-p1f-full-v1-10b"],
    ["23(b)", "chem-edx-p2h-full-v1-9b"],
  ])
    expect(exposureIds([part(n).question.id])).toContain(id);
  for (const n of [
    "17(b)",
    "17(c)",
    "17(d)",
    "18(b)",
    "18(c)",
    "19(a)",
    "21(c)",
    "22(c)",
  ])
    expect(part(n).question.exposureAliases).toBeUndefined();
  for (const p of paper.parts)
    for (const id of p.question.exposureAliases ?? [])
      expect(questionById(id), id).toBeDefined();
});
