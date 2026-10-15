import { test, expect } from "@playwright/test";
import { ocrPaper4HigherFull as paper } from "../src/content/ocr-paper4-higher-full";
import { ocrPaper3HigherFull } from "../src/content/ocr-paper3-higher-full";
import { fullPapers } from "../src/content/full-assessments";
import { questionById } from "../src/content/curriculum";
import { reviewPart, paperReviewKey } from "../src/lib/exam-paper-review";
import { mark } from "../src/lib/marking";
import { exposureIds, type Response } from "../src/lib/progress";
import { curveValue, curveSlope } from "../src/lib/tangent-rates";
import { readTangentDrawing } from "../src/lib/tangent-drawing";
import { readPolymerisationDrawing } from "../src/lib/polymerisation-board";
import { repeatInventory } from "../src/lib/polymerisation";
import {
  readPolyesterDrawing,
  polyesterRepeatAtoms,
} from "../src/lib/polyester";
const part = (n: string) => paper.parts.find((p) => p.number === n)!;
const response = (answer: string, working?: string): Response => ({
  answer,
  working,
  correct: false,
  fresh: true,
  helped: false,
  at: 2,
});

test("Gateway04 owns48 parts and90 marks; the Higher pair balances72/72/36", () => {
  expect(paper.basis).toMatchObject({
    board: "OCR",
    qualification: "Gateway Science A J248",
    component: "J248/04",
  });
  expect([paper.parts.length, paper.totalMarks, paper.minutes]).toEqual([
    48, 90, 105,
  ]);
  expect(paper.parts.slice(0, 15).reduce((s, p) => s + p.marks, 0)).toBe(15);
  expect(paper.parts.slice(15).reduce((s, p) => s + p.marks, 0)).toBe(75);
  expect(
    [0, 1, 2].map((i) => paper.parts.reduce((s, p) => s + p.ao[i], 0)),
  ).toEqual([40, 31, 19]);
  expect(
    [0, 1, 2].map((i) =>
      [...paper.parts, ...ocrPaper3HigherFull.parts].reduce(
        (s, p) => s + p.ao[i],
        0,
      ),
    ),
  ).toEqual([72, 72, 36]);
  expect(
    paper.parts.filter((p) => p.mathematics).reduce((s, p) => s + p.marks, 0),
  ).toBe(26);
  expect(paper.parts.reduce((s, p) => s + (p.practical ?? 0), 0)).toBe(32);
  expect(fullPapers).toHaveLength(12);
  expect(fullPapers.reduce((s, p) => s + p.examPaper!.totalMarks, 0)).toBe(
    1160,
  );
  expect(fullPapers.reduce((s, p) => s + p.questions.length, 0)).toBe(549);
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
      expect(/^(C[34567]|CM[456]|WS)/.test(clause), clause).toBe(true);
  }
});
test("only15 choices earn automatic credit; all75 structured marks await explicit review", () => {
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
test("the tangent is genuinely local and a retained wrong direction can receive consistent later calculation credit", () => {
  const p = part("16(a)"),
    graph = p.question.tangentDrawing!,
    curve = graph.curve,
    r = readTangentDrawing(p.referenceConstruction!)!;
  expect(graph.line).toBeUndefined();
  expect(curveValue(curve, 20)).toBe(24);
  expect(curveSlope(curve, 20)).toBe(0.8);
  expect([
    curveValue(curve, 0),
    curveValue(curve, 40),
    curveSlope(curve, 40),
  ]).toEqual([0, 32, 0]);
  const gradient =
    (Number(r.ty1) - Number(r.ty0)) / (Number(r.tx1) - Number(r.tx0));
  expect(gradient).toBe(0.8);
  expect(Number(r.tx1) - Number(r.tx0)).toBe(30);
  for (const t of [0, 5, 10, 20, 30, 35, 40])
    expect(0.8 * t + 8 - curveValue(curve, t)).toBeCloseTo(
      0.02 * (t - 20) ** 2,
      10,
    );
  const wrong = { ...r, ty0: "9", ty1: "39" };
  expect((Number(wrong.ty0) + Number(wrong.ty1)) / 2).toBe(24);
  const raw = response(
    "1.0",
    "(39−9)/(35−5)=1.0cm³/s using my retained endpoints.",
  );
  expect(reviewPart(part("16(b)"), raw, {}, 1).marks).toBe(0);
  const decisions = Object.fromEntries(
    part("16(b)").criteria.map((c) => [
      paperReviewKey(1, part("16(b)").question.id, c.id),
      String(c.marks),
    ]),
  );
  expect(reviewPart(part("16(b)"), raw, decisions, 1)).toMatchObject({
    marks: 2,
    pending: false,
    finalCorrect: false,
  });
  expect(raw.working).toContain("39−9");
  expect(mark(p.question, JSON.stringify(wrong)).selfReview).toBe(true);
});
test("titration uses the actual scale, excludes the rough result and applies the diprotic ratio", () => {
  const b = part("17(b)").question.buretteScale!;
  expect(b).toMatchObject({ top: 18, reading: 18.45 });
  expect(b.reading).toBeGreaterThan(b.top);
  expect(b.reading).toBeLessThan(b.top + 0.8);
  expect(30 + (b.reading - b.top) * 350).toBeCloseTo(187.5, 9);
  expect(Number(part("17(b)").question.answer)).toBeCloseTo(18.45 - 2.1, 12);
  const mean = (14.15 + 14.2 + 14.25) / 3;
  expect(mean).toBeCloseTo(14.2, 12);
  expect(Number(part("17(c)").question.answer)).toBeCloseTo(mean, 12);
  const base = 0.15 * 0.02,
    acid = base / 2,
    concentration = acid / (mean / 1000);
  expect(base).toBe(0.003);
  expect(acid).toBe(0.0015);
  expect(Number(concentration.toPrecision(3))).toBe(
    Number(part("17(d)").question.answer),
  );
  expect(mark(part("17(b)").question, "16.35").correct).toBe(true);
  expect(mark(part("17(b)").question, "16.3").correct).toBe(false);
  expect(mark(part("17(d)").question, "0.106").correct).toBe(true);
  expect(mark(part("17(d)").question, "0.1060").correct).toBe(false);
  expect(part("17(c)").question.prompt).not.toContain("16.35");
  expect(part("17(d)").question.prompt).not.toContain("14.20");
  expect(part("16(b)").question.prompt).not.toContain("0.8");
});
test("both polymer references preserve atoms and valid optional notation; finite chain ends are counted separately", () => {
  const repeat = readPolymerisationDrawing(
    part("19(b)").referenceConstruction!,
  )!;
  expect(repeatInventory(["H", "Cl", "F", "CH3"])).toEqual([3, 4, 1, 1]);
  expect([repeat.s0, repeat.s1, repeat.s2, repeat.s3]).toEqual([
    "H",
    "Cl",
    "F",
    "CH3",
  ]);
  expect([repeat.bond, repeat.left, repeat.right, repeat.brackets]).toEqual([
    "1",
    "1",
    "1",
    "1",
  ]);
  const polyester = readPolyesterDrawing(part("19(c)").referenceConstruction!)!;
  expect(polyesterRepeatAtoms(polyester)).toEqual({ C: 10, H: 16, O: 4 });
  expect([
    polyester.diolC,
    polyester.acidSpacerC,
    polyester.carbonyl1,
    polyester.carbonyl2,
  ]).toEqual(["4", "4", "2", "2"]);
  for (const n of ["19(b)", "19(c)"]) {
    const p = part(n),
      noN = { ...JSON.parse(p.referenceConstruction!), countMark: "none" };
    expect(p.criteria[2].text).toContain("optional");
    expect(reviewPart(p, response(JSON.stringify(noN)), {}, 1).pending).toBe(
      true,
    );
    const wrong = {
      ...noN,
      ...(n === "19(b)" ? { s1: "F" } : { acidSpacerC: "3" }),
    };
    expect(mark(p.question, JSON.stringify(wrong)).selfReview).toBe(true);
  }
  // Two C4H10O2 diols + two C6H10O4 diacids, minus three real water losses.
  expect({
    C: 2 * 4 + 2 * 6,
    H: 2 * 10 + 2 * 10 - 3 * 2,
    O: 2 * 2 + 2 * 4 - 3,
  }).toEqual({ C: 20, H: 34, O: 9 });
  expect(part("19(d)").question.answer).toContain("three water");
});
test("raw industrial/service givens and independent mass calculations support only their stated conclusions", () => {
  const rows = part("18(a)").question.haberGiven!.table!.rows;
  expect(
    rows.filter((r) => Number(r[2]) >= 3 && Number(r[3]) <= 3).map((r) => r[0]),
  ).toEqual(["B"]);
  expect(Number(rows[0][1])).toBeGreaterThan(Number(rows[1][1]));
  expect(Number(rows[2][1])).toBeGreaterThan(Number(rows[1][1]));
  const s = part("22(b)").question.lcaGiven!.service!;
  expect((s.fixed + s.wash * s.uses) / 1000).toBe(6.6);
  expect((s.single * s.uses) / 1000).toBe(10);
  expect(Number(part("21(c)").question.answer)).toBeCloseTo(
    (15.3 / 18) * 100,
    12,
  );
  expect(Number(part("23(c)").question.answer)).toBe(
    ((2.64 * 1000) / (12 + 2 * 16)) * 24,
  );
  expect(part("23(e)").question.prompt).toContain("process that releases CO₂");
  expect(part("20(b)").question.prompt).toContain("Only Zn²⁺ or Ca²⁺");
});
test("31 earlier disclosures are linked while original numeric and native demands stay distinct", () => {
  expect(
    paper.parts.filter((p) => p.question.exposureAliases?.length),
  ).toHaveLength(31);
  for (const [n, id] of [
    ["1", "early-atmosphere-v1-g-photo"],
    ["5", "mr-v1-r-evidence"],
    ["16(c)", "chem-p2h-full-v1-01c"],
    ["19(d)", "natural-v1-r-links"],
    ["23(e)", "cf-v1-p-environment"],
  ])
    expect(exposureIds([part(n).question.id])).toContain(id);
  for (const n of [
    "6",
    "9",
    "13",
    "15",
    "16(a)",
    "16(b)",
    "17(b)",
    "17(c)",
    "17(d)",
    "18(a)",
    "19(b)",
    "19(c)",
    "19(e)",
    "20(c)",
    "21(c)",
    "22(b)",
    "23(c)",
  ])
    expect(part(n).question.exposureAliases, n).toBeUndefined();
  for (const p of paper.parts)
    for (const id of p.question.exposureAliases ?? [])
      expect(questionById(id), id).toBeDefined();
});
