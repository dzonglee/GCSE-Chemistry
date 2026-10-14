import { test, expect } from "@playwright/test";
import { edexcelPaper1FoundationFull as paper } from "../src/content/edexcel-paper1-foundation-full";
import { fullPapers } from "../src/content/full-assessments";
import { questionById } from "../src/content/curriculum";
import { exposureIds, type Response } from "../src/lib/progress";
import { reviewPart } from "../src/lib/exam-paper-review";
import { mark } from "../src/lib/marking";
import { emptyFuelDrawing, readFuelDrawing } from "../src/lib/fuel-drawing";

const part = (number: string) => paper.parts.find((p) => p.number === number)!;
const response = (answer: string, working?: string): Response => ({
  answer,
  working,
  at: 2,
  correct: false,
  fresh: true,
  helped: false,
});

test("Pearson Foundation Paper 1 has its own complete tier/component allocation and registered reserved identities", () => {
  expect(paper.basis).toMatchObject({
    board: "Edexcel",
    qualification: "1CH0",
    component: "1CH0/1F",
  });
  expect(paper.totalMarks).toBe(100);
  expect(paper.minutes).toBe(105);
  expect(paper.parts).toHaveLength(40);
  expect(paper.parts.reduce((s, p) => s + p.marks, 0)).toBe(100);
  expect(
    paper.parts.reduce((s, p) => s.map((n, i) => n + p.ao[i]), [0, 0, 0]),
  ).toEqual([39, 40, 21]);
  expect(
    paper.parts.filter((p) => p.mathematics).reduce((s, p) => s + p.marks, 0),
  ).toBe(24);
  expect(
    fullPapers.filter((p) => p.examPaper?.basis?.board === "AQA"),
  ).toHaveLength(4);
  const allIds = fullPapers.flatMap((p) => p.questions.map((q) => q.id));
  expect(new Set(allIds).size).toBe(allIds.length);
  for (const p of paper.parts) {
    expect(p.question.tier).toBe("foundation");
    expect(questionById(p.question.id)).toBe(p.question);
    expect(p.ao.reduce((s, n) => s + n, 0)).toBe(p.marks);
    if (!p.levels)
      expect(p.criteria.reduce((s, c) => s + c.marks, p.automaticMarks)).toBe(
        p.marks,
      );
    for (const alias of p.question.exposureAliases ?? [])
      expect(questionById(alias), alias).toBeDefined();
    expect(p.specification.length).toBeGreaterThan(0);
  }
  // These actual Pearson Foundation demands must not be filtered by AQA's tier boundaries.
  expect(part("7(b)").specification).toContain("1.44");
  expect(part("4(a)").specification).toContain("3.30");
  expect(part("10(a)").specification).toContain("4.16");
  const forbidden = [
    "1.12",
    "1.50",
    "1.51",
    "1.52",
    "1.53",
    "3.27",
    "3.28",
    "3.29",
    "4.2",
    "4.8",
    "4.17",
    "5.8C",
    "5.10C",
    "5.15C",
    "5.16C",
    "5.17C",
    "5.18C",
    "5.20C",
    "5.21C",
  ];
  expect(
    paper.parts
      .flatMap((p) => p.specification)
      .filter((clause) => forbidden.includes(clause)),
  ).toEqual([]);
});

test("independent calculations agree with supplied data, units and requested raw precision", () => {
  const expected: Record<string, string> = {
    "2(e)": String(12 + 2 * 16),
    "3(b)": ((48 - 12) / (102 - 12)).toFixed(2),
    "4(d)": ((18858 - 18642) / 1000).toFixed(3),
    "6(c)": String(15 * 0.8 * (64 / (64 + 16)) * 1000),
    "8(b)": ((23.6 + 23.7 + 23.6) / 3).toFixed(2),
    "8(c)": String((6.15 / 7.5) * 100),
  };
  for (const [number, value] of Object.entries(expected)) {
    expect(Number(part(number).question.answer), number).toBeCloseTo(
      Number(value),
      8,
    );
    expect(part(number).automaticMarks, number).toBe(0);
  }
  expect(part("3(b)").question.answer).toBe("0.40");
  expect(part("1(d)").specification).toEqual(["1.11"]);
  expect(part("1(d)").question.rubric).toHaveLength(2);
  expect(part("1(d)").mathematics).toBeUndefined();
  expect(part("1(d)").question.prompt).toContain("No calculation is required");
  expect(part("8(b)").question.answer).toBe("23.63");
  expect(1.8 / 24).toBeCloseTo(1.2 / 16, 12);
  expect(part("7(b)").criteria[0].text).toContain(
    "formula alone earns no credit",
  );
  expect(reviewPart(part("7(b)"), response("MgO"), {}, 1)).toMatchObject({
    automatic: 0,
    marks: 0,
    pending: true,
  });
});

test("new mass graph retains milligram-scale coordinates, separate fit anchors and an optional unmarked estimate", () => {
  const graph = part("4(c)").question.fuelDrawing!;
  expect(graph.data.context).toBe("measurement");
  expect(graph.data.yUnit).toBe("g");
  expect(graph.data.points).toEqual([
    [2, 0.036],
    [4, 0.073],
    [6, 0.108],
    [8, 0.145],
    [10, 0.179],
    [12, 0.216],
  ]);
  for (const [x, y] of graph.data.points)
    expect(Math.abs(y - 0.018 * x)).toBeLessThanOrEqual(0.001001);
  const proposal = emptyFuelDrawing(graph.data);
  proposal.p0x = "2";
  proposal.p0y = "0.004";
  proposal.c0 = "0.036";
  proposal.c5 = "0.216";
  expect(readFuelDrawing(JSON.stringify(proposal), graph.data)).toEqual(
    proposal,
  );
  expect(proposal.estimate).toBe("");
  expect(part("4(c)").criteria.map((c) => c.marks)).toEqual([2, 1]);
  expect(part("4(c)").automaticMarks).toBe(0);
});

test("drawing references preserve electron origins and exact conceptual repeats remain exposed across boards", () => {
  const q = part("2(a)").question;
  expect(JSON.parse(part("2(a)").referenceConstruction!)).toEqual({
    dots: "6",
    crosses: "2",
    charge: "-2",
    brackets: "1",
  });
  expect(mark(q, q.answer).correct).toBe(true);
  for (const [number, alias] of [
    ["1(d)", "ram-v1-r-meaning"],
    ["1(d)", "ram-v1-r-weight"],
    ["1(d)", "ram-v1-g-heavy"],
    ["1(d)", "ram-v1-g-transfer"],
    ["1(b)", "sh-v1-w-read"],
    ["1(b)", "sh-v1-p-explanation"],
    ["2(d)", "chem-p1f-full-v1-03e"],
    ["2(e)", "fm-v1-p-co2"],
    ["2(e)", "pc-v1-w-mass"],
    ["5(e)", "an-v1-p-litmus"],
    ["8(d)", "tech-v1-p-meniscus"],
    ["9(b)", "materials-v1-cB-barrier"],
    ["10(a)", "haber-v1-p-conditions"],
    ["10(c)", "cf-v1-R-primary"],
    ["2(a)", "ib-v1-p-draw-oxide"],
    ["7(a)", "chem-p1f-full-v1-05d"],
    ["6(a)", "chem-p1f-full-v1-08b"],
    ["10(b)", "chem-p2h-full-v1-09f"],
  ]) {
    const id = part(number).question.id;
    expect(exposureIds([id])).toContain(alias);
    expect(exposureIds([alias])).toContain(id);
  }
  expect(part("3(a)").levels?.map((level) => [level.min, level.max])).toEqual([
    [5, 6],
    [3, 4],
    [1, 2],
    [0, 0],
  ]);
  expect(part("3(a)").criteria).toEqual([]);
  expect(part("3(a)").automaticMarks).toBe(0);
});
