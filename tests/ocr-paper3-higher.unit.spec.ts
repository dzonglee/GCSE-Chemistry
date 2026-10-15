import { test, expect } from "@playwright/test";
import { ocrPaper3HigherFull as paper } from "../src/content/ocr-paper3-higher-full";
import { fullPapers } from "../src/content/full-assessments";
import { questionById } from "../src/content/curriculum";
import { reviewPart } from "../src/lib/exam-paper-review";
import { mark } from "../src/lib/marking";
import { exposureIds, type Response } from "../src/lib/progress";
import { chromaGivenSources } from "../src/lib/chromatography-givens";
import { readFuelDrawing } from "../src/lib/fuel-drawing";
import { drawingLevels } from "../src/lib/reaction-profiles";
const part = (n: string) => paper.parts.find((p) => p.number === n)!;
const response = (answer: string): Response => ({
  answer,
  correct: false,
  fresh: true,
  helped: false,
  at: 2,
});
test("Gateway03 owns45 parts and90 marks within C1–C3 plus practical skills", () => {
  expect(paper.basis).toMatchObject({
    board: "OCR",
    qualification: "Gateway Science A J248",
    component: "J248/03",
  });
  expect([paper.parts.length, paper.totalMarks, paper.minutes]).toEqual([
    45, 90, 105,
  ]);
  expect(paper.parts.slice(0, 15).reduce((s, p) => s + p.marks, 0)).toBe(15);
  expect(paper.parts.slice(15).reduce((s, p) => s + p.marks, 0)).toBe(75);
  expect(
    [0, 1, 2].map((i) => paper.parts.reduce((s, p) => s + p.ao[i], 0)),
  ).toEqual([32, 41, 17]);
  expect(
    paper.parts.filter((p) => p.mathematics).reduce((s, p) => s + p.marks, 0),
  ).toBe(35);
  expect(paper.parts.reduce((s, p) => s + (p.practical ?? 0), 0)).toBe(21);
  const ids = fullPapers.flatMap((p) => p.questions.map((q) => q.id));
  expect(new Set(ids).size).toBe(ids.length);
  for (const p of paper.parts) {
    expect(p.question.tier).toBe("higher");
    expect(questionById(p.question.id)).toBe(p.question);
    expect(
      p.ao.reduce((s, n) => s + n, 0),
      p.number,
    ).toBe(p.marks);
    if (!p.levels)
      expect(
        p.criteria.reduce((s, c) => s + c.marks, p.automaticMarks),
        p.number,
      ).toBe(p.marks);
    for (const clause of p.specification)
      expect(/^(C[1237]|CM[123]|WS)/.test(clause), clause).toBe(true);
  }
});
test("only15 choices are automatic and the six-mark critique uses whole-response levels", () => {
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
  expect(part("18(a)").criteria).toHaveLength(0);
  expect(part("18(a)").levels?.map((l) => [l.min, l.max])).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
  ]);
});
test("independent calculations retain offsets, stoichiometry and extremely small masses", () => {
  expect(Number(part("6").question.answer)).toBe(2 * 56 + 3 * (32 + 4 * 16));
  expect(Number.parseFloat(part("14").question.answer.replace("−", "-"))).toBe(
    1450 - 1590,
  );
  expect(Number(part("16(b)").question.answer)).toBe((6 * 15 ** 2) / 15 ** 3);
  const c = chromaGivenSources.ocr3hOffset;
  expect(Number(part("19(a)").question.answer)).toBe(
    (c.lanes[0].centres[0] - c.origin) / (c.front! - c.origin),
  );
  expect(Number(part("20(c)").question.answer)).toBeCloseTo(32.2 - 20.4, 10);
  expect(Number(part("20(f)").question.answer)).toBe(2 * 436 + 498 - 4 * 464);
  const nAl = 5.4 / 27,
    nO2 = 3.2 / 32,
    oxide = Math.min(nAl / 4, nO2 / 3) * 2 * (2 * 27 + 3 * 16);
  expect(oxide).toBeCloseTo(6.8, 12);
  expect(nAl / 4).toBeGreaterThan(nO2 / 3);
  expect(part("21(b)").question.answer).toContain("6.80 g");
  const atom = 58.7 / 6.02e23,
    given = Number(part("21(c)").question.answer);
  expect(Math.abs(given / atom - 1)).toBeLessThan(0.0001);
  expect(given).toBeGreaterThan(0);
  expect(given).toBeLessThan(1e-22);
  expect(mark(part("21(c)").question, "0").correct).toBe(false);
  expect(mark(part("21(c)").question, "9.75e23").correct).toBe(false);
  expect(0.096 / 2e-10).toBe(4.8e8);
  expect(3 + Math.log10(1000)).toBe(6);
});
test("graph construction retains independent observations, fit ends and extrapolation without later answer cues", () => {
  const p = part("20(a)"),
    data = p.question.fuelDrawing!.data,
    g = readFuelDrawing(p.referenceConstruction!, data)!;
  expect(data.fitKind).toBe("straight");
  expect(data.independentExtrapolation).toBe(true);
  expect([data.yMin, data.yMax, data.targetX]).toEqual([18, 36, 0]);
  expect(p.question.fuelDrawing!.referenceLine).toBeUndefined();
  data.points.forEach(([x, y], i) => {
    expect(y).toBeCloseTo(32.2 - 0.02 * x, 10);
    expect([g[`p${i}x`], g[`p${i}y`], g[`c${i}`]]).toEqual([
      String(x),
      String(y),
      String(y),
    ]);
  });
  expect([g.extensionX, g.estimate]).toEqual(["0", "32.2"]);
  expect(part("20(c)").question.prompt).not.toContain("32.2");
  expect(part("19(b)").question.prompt).not.toContain("0.625");
  expect(p.criteria.map((c) => c.marks)).toEqual([2, 1, 1, 1]);
});
test("ion conventions and relative energy levels are manually judged without inferred marks", () => {
  const ion = JSON.parse(part("18(b)").referenceConstruction!);
  expect(Number(ion.dots) + Number(ion.crosses)).toBe(8);
  expect(ion.charge).toBe("-2");
  expect(part("18(b)").criteria[0].text).toContain("all-dot/all-cross");
  expect(part("18(b)").criteria[2].text).toContain("2,8");
  const energy = drawingLevels(
    JSON.parse(part("20(e)").referenceConstruction!),
  )!;
  expect(energy.product - energy.reactant).toBe(-35);
  expect(energy.peak - energy.reactant).toBe(95);
  for (const n of ["18(b)", "20(a)", "20(e)"]) {
    const p = part(n),
      wrong = JSON.parse(p.referenceConstruction!);
    if (n === "18(b)") {
      wrong.charge = "-1";
      wrong.brackets = "0";
    }
    if (n === "20(a)") wrong.p2y = "34";
    if (n === "20(e)") wrong.peak = "185";
    expect(reviewPart(p, response(JSON.stringify(wrong)), {}, 1).pending).toBe(
      true,
    );
    expect(
      reviewPart(p, response(p.referenceConstruction!), {}, 1).pending,
    ).toBe(true);
  }
  const alternative = { ...ion, dots: "8", crosses: "0" };
  expect(
    reviewPart(part("18(b)"), response(JSON.stringify(alternative)), {}, 1)
      .pending,
  ).toBe(true);
});
test("nineteen disclosures are tracked while original numerical demands remain fresh", () => {
  expect(
    paper.parts.filter((p) => p.question.exposureAliases?.length),
  ).toHaveLength(19);
  for (const [n, id] of [
    ["1", "atom-v2-p-explain"],
    ["18(b)", "iso-v1-p-sulfide"],
    ["19(b)", "chromatography-v1-r-reference-conditions"],
    ["22(a)", "chem-edx-p1h-full-v1-4c"],
    ["23(d)", "aqp-v1-b-electrodes"],
  ])
    expect(exposureIds([part(n).question.id])).toContain(id);
  for (const n of [
    "6",
    "14",
    "16(b)",
    "17(b)",
    "17(c)",
    "19(a)",
    "20(a)",
    "20(c)",
    "20(e)",
    "20(f)",
    "21(b)",
    "21(c)",
    "22(b)",
    "23(a)",
    "23(b)",
  ])
    expect(part(n).question.exposureAliases).toBeUndefined();
  for (const p of paper.parts)
    for (const id of p.question.exposureAliases ?? [])
      expect(questionById(id), id).toBeDefined();
});
