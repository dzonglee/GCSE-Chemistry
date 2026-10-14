import { test, expect } from "@playwright/test";
import { edexcelPaper1HigherFull as paper } from "../src/content/edexcel-paper1-higher-full";
import { fullPapers } from "../src/content/full-assessments";
import { questionById } from "../src/content/curriculum";
import { exposureIds, type Response } from "../src/lib/progress";
import { reviewPart, paperReviewKey } from "../src/lib/exam-paper-review";
import { mark } from "../src/lib/marking";
import { readFuelDrawing } from "../src/lib/fuel-drawing";

const part = (number: string) => paper.parts.find((p) => p.number === number)!;
const response = (answer: string, working?: string): Response => ({
  answer,
  working,
  correct: false,
  fresh: true,
  helped: false,
  at: 2,
});

test("Pearson1H has its own complete component ledger, reserved identities and Higher demands", () => {
  expect(paper.basis).toMatchObject({
    board: "Edexcel",
    qualification: "1CH0",
    component: "1CH0/1H",
  });
  expect(paper.totalMarks).toBe(100);
  expect(paper.minutes).toBe(105);
  expect(paper.parts).toHaveLength(43);
  expect(paper.parts.reduce((s, p) => s + p.marks, 0)).toBe(100);
  expect(
    paper.parts.reduce((s, p) => s.map((n, i) => n + p.ao[i]), [0, 0, 0]),
  ).toEqual([37, 41, 22]);
  expect(
    paper.parts.filter((p) => p.mathematics).reduce((s, p) => s + p.marks, 0),
  ).toBe(31);
  expect(paper.parts.reduce((s, p) => s + (p.practical ?? 0), 0)).toBe(34);
  expect(paper.parts.reduce((s, p) => s + p.automaticMarks, 0)).toBe(3);
  expect(
    fullPapers.filter((p) => p.examPaper?.basis?.board === "AQA"),
  ).toHaveLength(4);
  const ids = fullPapers.flatMap((p) => p.questions.map((q) => q.id));
  expect(new Set(ids).size).toBe(ids.length);
  for (const p of paper.parts) {
    expect(p.question.tier).toBe("higher");
    expect(questionById(p.question.id)).toBe(p.question);
    expect(p.ao.reduce((s, n) => s + n, 0)).toBe(p.marks);
    if (!p.levels)
      expect(p.criteria.reduce((s, c) => s + c.marks, p.automaticMarks)).toBe(
        p.marks,
      );
    for (const id of p.question.exposureAliases ?? [])
      expect(questionById(id), id).toBeDefined();
    for (const s of p.specification) expect(/^[0-5]\./.test(s), s).toBe(true);
  }
  expect(part("1(b)").specification).toContain("1.12");
  expect(part("5(c)").specification).toContain("5.10C");
  expect(part("6(c)").specification).toContain("1.51c");
  expect(part("7(c)").specification).toContain("4.8");
  expect(part("8(a)").specification).toContain("1.52");
  expect(part("9(b)").specification).toContain("4.17b");
});

test("independent calculations preserve baseline, molar ratio, limiting reactant, units and raw precision", () => {
  const nMg = 3.72 / 24,
    nHydrogen = Math.min(nMg, 0.26 / 2);
  expect(nHydrogen).toBeLessThan(nMg);
  const expected: Record<string, number> = {
    "1(b)": (28 * 91 + 29 * 5 + 30 * 4) / 100,
    "3(b)": (3.9 - 1.2) / (6.6 - 1.2),
    "4(a)": 10 ** (3.4 - 1.4),
    "5(a)": 23.75 - 3.15,
    "5(c)": Number(((0.12 * (20.4 / 1000) * 2) / (25.0 / 1000)).toPrecision(3)),
    "5(d)": Number((((2 * 0.05) / 18.7) * 100).toPrecision(2)),
    "6(c)": (95.25 / 1000 / 63.5) * 6.02e23,
    "8(a)": nHydrogen * 24 * 1000,
    "8(b)": (2520 / 3000) * 100,
    "8(c)": Number(((106 / (2 * 84)) * 100).toPrecision(3)),
  };
  for (const [number, value] of Object.entries(expected)) {
    expect(Number(part(number).question.answer) / value, number).toBeCloseTo(
      1,
      10,
    );
    expect(part(number).automaticMarks, number).toBe(0);
  }
  expect(part("3(b)").question.answer).toBe("0.50");
  expect(part("5(a)").question.answer).toBe("20.60");
  expect(part("9(b)").question.prompt).toContain("compressed");
  expect(part("7(d)").question.prompt).toContain("per kg recovered copper");
});

test("particle and oxygen references independently conserve nucleus, charge and outer electrons", () => {
  expect(JSON.parse(part("1(a)").question.answer)).toEqual({
    protons: "16",
    neutrons: String(34 - 16),
    electrons: String(16 - -2),
  });
  const oxygen = JSON.parse(part("2(a)").referenceConstruction!);
  expect(Number(oxygen.unsharedCentre) + Number(oxygen.centre0)).toBe(6);
  expect(Number(oxygen.unsharedPartner0) + Number(oxygen.partner0)).toBe(6);
  expect(Number(oxygen.centre0) + Number(oxygen.partner0)).toBe(4);
  const wrong = mark(
    part("2(a)").question,
    JSON.stringify({ ...oxygen, centre0: "3" }),
  );
  expect(wrong.correct).toBe(false);
  expect(wrong.invalid).not.toBe(true);
});

test("the current fit balances measured scatter without correcting a wrong observed point", () => {
  const p = part("6(a)"),
    d = p.question.fuelDrawing!.data;
  expect(d.context).toBe("measurement");
  expect(d.fitKind).toBe("straight");
  expect(d.showEstimate).toBe(false);
  expect(d.points[0]).toEqual([0, 0]);
  const board = readFuelDrawing(p.referenceConstruction!, d)!;
  const xMean = d.points.reduce((s, [x]) => s + x, 0) / d.points.length;
  const yMean = d.points.reduce((s, [, y]) => s + y, 0) / d.points.length;
  const slope =
    d.points.reduce((s, [x, y]) => s + (x - xMean) * (y - yMean), 0) /
    d.points.reduce((s, [x]) => s + (x - xMean) ** 2, 0);
  const intercept = yMean - slope * xMean;
  expect(slope).toBeCloseTo(0.1088, 12);
  expect(intercept).toBeCloseTo(0, 12);
  expect(Number(board.c5)).toBeCloseTo(intercept + slope * 1.25, 12);
  const residuals = d.points.map(([x, y]) => y - (intercept + slope * x));
  expect(residuals.some((r) => r > 0.0001)).toBe(true);
  expect(residuals.some((r) => r < -0.0001)).toBe(true);
  const wrong = { ...board, p2y: "0.090" };
  expect(readFuelDrawing(JSON.stringify(wrong), d)).toEqual(wrong);
  expect(mark(p.question, JSON.stringify(wrong))).toMatchObject({
    selfReview: true,
    empty: false,
  });
  expect(mark(p.question, "{broken").invalid).toBe(true);
});

test("wrong chemical writing and result-only formulas remain manual, with explicit partial method credit", () => {
  const half = part("6(b)");
  expect(mark(half.question, "Cu2+ -> Cu +2e-")).toMatchObject({
    selfReview: true,
    empty: false,
  });
  expect(reviewPart(half, response("Cu2+ -> Cu +2e-"), {}, 1)).toMatchObject({
    automatic: 0,
    marks: 0,
    pending: true,
  });
  expect(
    reviewPart(
      half,
      response("Cu2+ -> Cu +2e-"),
      {
        [paperReviewKey(1, half.question.id, "point-1")]: "1",
        [paperReviewKey(1, half.question.id, "point-2")]: "0",
      },
      1,
    ),
  ).toMatchObject({ marks: 1, pending: false });
  const gas = part("8(a)");
  expect(
    reviewPart(
      gas,
      response(
        "3720",
        "Mg=0.155mol; incorrectly choose Mg limiting; H2=0.155mol; volume=0.155×24×1000=3720cm³",
      ),
      {
        [paperReviewKey(1, gas.question.id, "point-1")]: "1",
        [paperReviewKey(1, gas.question.id, "point-2")]: "0",
        [paperReviewKey(1, gas.question.id, "point-3")]: "1",
        [paperReviewKey(1, gas.question.id, "point-4")]: "1",
      },
      1,
    ),
  ).toMatchObject({ automatic: 0, marks: 3, pending: false });
  const formula = part("3(a)");
  expect(reviewPart(formula, response("C4H8O2"), {}, 1)).toMatchObject({
    automatic: 0,
    marks: 0,
    pending: true,
  });
});

test("both extended responses use whole-response levels rather than keyword point totals", () => {
  for (const number of ["2(b)", "5(b)"]) {
    const p = part(number);
    expect(p.marks).toBe(6);
    expect(p.criteria).toEqual([]);
    expect(p.levels?.map((l) => [l.min, l.max])).toEqual([
      [5, 6],
      [3, 4],
      [1, 2],
      [0, 0],
    ]);
    expect(reviewPart(p, response("apparatus and carbon"), {}, 1).pending).toBe(
      true,
    );
    expect(
      reviewPart(
        p,
        response(p.question.answer),
        { [paperReviewKey(1, p.question.id, "whole-response")]: "6" },
        1,
      ),
    ).toMatchObject({ marks: 6, pending: false, automatic: 0 });
  }
});

test("actual earlier disclosures link in both directions while new numerical and order data stay independent", () => {
  for (const [number, id] of [
    ["1(a)", "iso-v1-rb-neutrons"],
    ["2(a)", "cb-v1-p-o2"],
    ["4(c)", "acid-v1-rb-two"],
    ["5(b)", "tech-v1-p-salt"],
    ["6(b)", "he-v1-g-cation"],
    ["7(b)", "chem-edx-p1f-full-v1-6b"],
    ["9(c)", "haber-v1-r-catalyst"],
    ["10(b)", "cf-v1-g-evidence"],
  ]) {
    const qid = part(number).question.id;
    expect(exposureIds([qid])).toContain(id);
    expect(exposureIds([id])).toContain(qid);
  }
  expect(part("7(b)").question.exposureAliases).not.toContain(
    "chem-edx-p1f-full-v1-6a",
  );
  expect(part("7(b)").question.exposureAliases).not.toContain(
    "chem-p1f-full-v1-08b",
  );
  for (const number of [
    "1(b)",
    "3(a)",
    "3(b)",
    "5(a)",
    "5(c)",
    "5(d)",
    "5(e)",
    "6(a)",
    "6(c)",
    "7(d)",
    "7(e)",
    "8(a)",
    "8(b)",
    "8(c)",
    "9(d)",
    "10(d)",
  ])
    expect(part(number).question.exposureAliases, number).toBeUndefined();
});
