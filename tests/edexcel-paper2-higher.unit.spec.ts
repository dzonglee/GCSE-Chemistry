import { test, expect } from "@playwright/test";
import { edexcelPaper2HigherFull as paper } from "../src/content/edexcel-paper2-higher-full";
import { fullPapers } from "../src/content/full-assessments";
import { questionById } from "../src/content/curriculum";
import { exposureIds, type Response } from "../src/lib/progress";
import { mark, displayResponse } from "../src/lib/marking";
import { curveSlope, curveValue } from "../src/lib/tangent-rates";
import { readTangentDrawing } from "../src/lib/tangent-drawing";
import { drawingLevels } from "../src/lib/reaction-profiles";
import { drawingOrganicCounts } from "../src/lib/organic-drawing";
import {
  polyesterRepeatAtoms,
  readPolyesterDrawing,
} from "../src/lib/polyester";
import { readPolymerisationDrawing } from "../src/lib/polymerisation-board";
import { reviewPart, paperReviewKey } from "../src/lib/exam-paper-review";

const part = (number: string) => paper.parts.find((p) => p.number === number)!;
const response = (answer: string, working?: string): Response => ({
  answer,
  working,
  correct: false,
  fresh: true,
  helped: false,
  at: 2,
});

test("Pearson2H has one complete independently authored component with valid scope and identity", () => {
  expect(paper.basis).toMatchObject({
    board: "Edexcel",
    qualification: "1CH0",
    component: "1CH0/2H",
  });
  expect(paper.totalMarks).toBe(100);
  expect(paper.minutes).toBe(105);
  expect(paper.parts).toHaveLength(39);
  expect(paper.parts.reduce((s, p) => s + p.marks, 0)).toBe(100);
  expect(
    [0, 1, 2].map((i) => paper.parts.reduce((s, p) => s + p.ao[i], 0)),
  ).toEqual([41, 35, 24]);
  expect(
    paper.parts.filter((p) => p.mathematics).reduce((s, p) => s + p.marks, 0),
  ).toBe(29);
  expect(paper.parts.reduce((s, p) => s + (p.practical ?? 0), 0)).toBe(24);
  expect(paper.parts.reduce((s, p) => s + p.automaticMarks, 0)).toBe(1);
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
    for (const clause of p.specification)
      expect(/^[16789]\./.test(clause), clause).toBe(true);
  }
  expect(part("1(b)").specification).toContain("6.12");
  expect(part("3(a)").specification).toContain("7.14");
  expect(part("6(b)").specification).toContain("9.22C");
});

test("independent arithmetic uses counts, coordinate differences, reaction stoichiometry and measured deltas", () => {
  const expected: Record<string, number> = {
    "1(e)": (210 * 35 + 140 * 37) / (210 + 140),
    "2(b)": (58 - 18) / (55 - 15),
    "2(e)": 1 / 50 / (1 / 75),
    "3(a)": 612 + 4 * 412 + 436 - (348 + 6 * 412),
    "8(a)": 42 * 10 ** -9,
    "10(a)": (152.84 - 151.59) / (43.6 - 18.6),
  };
  for (const [number, value] of Object.entries(expected)) {
    expect(Number(part(number).question.answer) / value, number).toBeCloseTo(
      1,
      10,
    );
    expect(part(number).automaticMarks).toBe(0);
  }
  const multiplier = 98 / (12 + 2);
  expect(multiplier).toBe(7);
  expect([10 + multiplier, 22 + 2 * multiplier]).toEqual([17, 36]);
  expect((22.5 - 5) / ((33 - 5) / 4)).toBe(2.5);
  expect((22.5 / 33) * 4).not.toBe(2.5);
  expect(part("7(c)").question.answer).toContain("2.5 mg/dm³");
  expect(part("10(a)").question.answer).toBe("0.050");
});

test("the tangent contacts the actual new curve and the independent profile obeys the supplied amounts", () => {
  const p = part("2(a)"),
    c = p.question.tangentDrawing!.curve;
  const r = readTangentDrawing(p.referenceConstruction!)!;
  const slope =
    (Number(r.ty1) - Number(r.ty0)) / (Number(r.tx1) - Number(r.tx0));
  expect(curveValue(c, c.at)).toBe(45);
  expect(slope).toBeCloseTo(curveSlope(c, c.at), 12);
  expect(Number(r.ty0) + slope * (c.at - Number(r.tx0))).toBe(
    curveValue(c, c.at),
  );
  for (let t = c.start; t <= c.end; t++) {
    expect(curveValue(c, t)).toBeGreaterThanOrEqual(0);
    expect(curveValue(c, t)).toBeLessThanOrEqual(c.max);
    expect(curveSlope(c, t)).toBeGreaterThan(0);
  }
  const d = drawingLevels(JSON.parse(part("3(b)").referenceConstruction!))!;
  expect(d.product - d.reactant).toBe(-30);
  expect(d.peak - d.reactant).toBe(40);
  expect(part("3(b)").question.prompt).toContain("reaction progress");
});

test("acid and both polymer references conserve attachments, valence and monomer contributions", () => {
  const acid = JSON.parse(part("5(a)").referenceConstruction!);
  expect(drawingOrganicCounts(acid)).toEqual({ C: 4, H: 8, O: 2 });
  const hydrogenCounts = [0, 1, 2, 3].map(
    (c) =>
      [0, 1, 2, 3].filter((slot) => acid[`h${4 * c + slot}`] === "yes").length,
  );
  const carbonBondOrders = hydrogenCounts.map(
    (h, c) => h + (c === 0 || c === 3 ? 1 : 2) + (c === 3 ? 3 : 0),
  );
  expect(carbonBondOrders).toEqual([4, 4, 4, 4]);
  const monomer = readPolymerisationDrawing(
    part("6(a)").referenceConstruction!,
  )!;
  expect([monomer.s0, monomer.s1, monomer.s2, monomer.s3]).toEqual(
    part("6(a)").question.polymerisationGiven!.groups,
  );
  expect(monomer).toMatchObject({
    bond: "2",
    left: "0",
    right: "0",
    brackets: "0",
    countMark: "none",
  });
  const polyester = readPolyesterDrawing(part("6(b)").referenceConstruction!)!;
  expect(polyesterRepeatAtoms(polyester)).toEqual({ C: 7, H: 10, O: 4 });
  // Diol C4H10O2 + diacid C3H4O4, minus two waters per repeat contribution.
  expect({ C: 4 + 3, H: 10 + 4 - 2 * 2, O: 2 + 4 - 2 }).toEqual(
    polyesterRepeatAtoms(polyester),
  );
  const openChainLinks = 3 + 3 - 1;
  expect(openChainLinks).toBe(5);
  expect(part("6(d)").question.answer).toContain("five water");
});

test("separated nanoparticle cubes preserve material and expose five times the original area", () => {
  const big = 210,
    small = 42,
    count = (big / small) ** 3;
  expect(count * small ** 3).toBe(big ** 3);
  const original = 6 * big ** 2,
    total = count * 6 * small ** 2;
  expect(original).toBe(264600);
  expect(total).toBe(1323000);
  expect(total / original).toBe(5);
  expect(part("8(b)").question.prompt).toContain("every face is exposed");
  expect(part("8(c)").ao).toEqual([0, 1, 2]);
});

test("all five drawings retain wrong readable constructions for manual review rather than correcting them", () => {
  const errors: Record<string, object> = {
    "2(a)": { ...JSON.parse(part("2(a)").referenceConstruction!), ty1: "29" },
    "3(b)": {
      ...JSON.parse(part("3(b)").referenceConstruction!),
      product: "90",
    },
    "5(a)": { ...JSON.parse(part("5(a)").referenceConstruction!), h12: "yes" },
    "6(a)": { ...JSON.parse(part("6(a)").referenceConstruction!), bond: "1" },
    "6(b)": {
      ...JSON.parse(part("6(b)").referenceConstruction!),
      carbonyl1: "1",
    },
  };
  for (const [number, error] of Object.entries(errors)) {
    const p = part(number),
      raw = JSON.stringify(error);
    expect(p.question.referenceResponse, number).toBeTruthy();
    expect(p.question.referenceResponse, number).not.toMatch(/^\s*\{/);
    expect(mark(p.question, raw), number).toMatchObject(
      number === "3(b)"
        ? { correct: false, empty: false, invalid: false }
        : { selfReview: true, empty: false },
    );
    expect(reviewPart(p, response(raw), {}, 1), number).toMatchObject({
      automatic: 0,
      pending: true,
      marks: 0,
    });
    expect(mark(p.question, "{broken").invalid, number).toBe(true);
    if (number === "3(b)") {
      expect(displayResponse(p.question, raw)).toContain("products: 90 kJ");
      expect(displayResponse(p.question, raw)).not.toMatch(/^\{/);
      expect(
        displayResponse(
          p.question,
          JSON.stringify({ ...error, product: "1/2" }),
        ),
      ).toContain("products: 1/2 kJ");
      expect(displayResponse(p.question, "{broken")).toBe(
        "Unreadable energy diagram; original response retained.",
      );
    }
  }
  const p = part("3(a)"),
    work = "1048 broken;1172 formed; wrong sign gives+124";
  const drafts = Object.fromEntries(
    p.criteria.map((c, i) => [
      paperReviewKey(1, p.question.id, c.id),
      i === 3 ? "0" : "1",
    ]),
  );
  expect(reviewPart(p, response("124", work), drafts, 1)).toMatchObject({
    marks: 3,
    automatic: 0,
    pending: false,
  });
});

test("actual prior disclosures link both directions while new numerical cases remain independent", () => {
  const linked = paper.parts.filter((p) => p.question.exposureAliases?.length);
  expect(linked).toHaveLength(20);
  for (const p of linked)
    for (const id of p.question.exposureAliases!) {
      expect(exposureIds([p.question.id]), p.number).toContain(id);
      expect(exposureIds([id]), p.number).toContain(p.question.id);
    }
  const disclosed = exposureIds(
    linked.flatMap((p) => p.question.exposureAliases!),
  );
  for (const number of [
    "1(e)",
    "2(a)",
    "2(b)",
    "2(e)",
    "3(a)",
    "3(b)",
    "4(b)",
    "6(a)",
    "6(b)",
    "6(d)",
    "7(b)",
    "7(c)",
    "8(a)",
    "8(b)",
    "10(a)",
  ])
    expect(disclosed, number).not.toContain(part(number).question.id);
  for (const p of paper.parts.filter((p) => p.levels)) {
    expect(p.levels!.map((l) => [l.min, l.max])).toEqual([
      [5, 6],
      [3, 4],
      [1, 2],
      [0, 0],
    ]);
    expect(reviewPart(p, response(p.question.answer), {}, 1).pending).toBe(
      true,
    );
  }
});
