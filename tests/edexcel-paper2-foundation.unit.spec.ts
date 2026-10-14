import { test, expect } from "@playwright/test";
import { edexcelPaper2FoundationFull as paper } from "../src/content/edexcel-paper2-foundation-full";
import { fullPapers } from "../src/content/full-assessments";
import { questionById } from "../src/content/curriculum";
import { exposureIds, type Response } from "../src/lib/progress";
import { reviewPart, paperReviewKey } from "../src/lib/exam-paper-review";
import { emptyFuelDrawing, readFuelDrawing } from "../src/lib/fuel-drawing";
import {
  readOrganicDrawing,
  drawingOrganicCounts,
} from "../src/lib/organic-drawing";
import { readPolymerisationDrawing } from "../src/lib/polymerisation-board";
import { repeatInventory } from "../src/lib/polymerisation";
import { mark } from "../src/lib/marking";
import { measurementCurveSegments } from "../src/lib/measurement-curve";

const part = (number: string) => paper.parts.find((p) => p.number === number)!;
const response = (answer: string, working?: string): Response => ({
  answer,
  working,
  at: 2,
  correct: false,
  fresh: true,
  helped: false,
});

test("Pearson 2F has its own complete component ledger, registered reserved identities and actual Foundation boundaries", () => {
  expect(paper.basis).toMatchObject({
    board: "Edexcel",
    qualification: "1CH0",
    component: "1CH0/2F",
  });
  expect(paper.totalMarks).toBe(100);
  expect(paper.minutes).toBe(105);
  expect(paper.parts).toHaveLength(48);
  expect(paper.parts.reduce((s, p) => s + p.marks, 0)).toBe(100);
  expect(
    paper.parts.reduce((s, p) => s.map((n, i) => n + p.ao[i]), [0, 0, 0]),
  ).toEqual([40, 40, 20]);
  expect(
    paper.parts.filter((p) => p.mathematics).reduce((s, p) => s + p.marks, 0),
  ).toBe(24);
  expect(paper.parts.reduce((s, p) => s + (p.practical ?? 0), 0)).toBe(29);
  expect(paper.parts.reduce((s, p) => s + p.automaticMarks, 0)).toBe(2);
  expect(
    fullPapers.filter((p) => p.examPaper?.basis?.board === "AQA"),
  ).toHaveLength(4);
  const ids = fullPapers.flatMap((p) => p.questions.map((q) => q.id));
  expect(new Set(ids).size).toBe(ids.length);
  for (const p of paper.parts) {
    expect(questionById(p.question.id)).toBe(p.question);
    expect(p.question.tier).toBe("foundation");
    expect(p.ao.reduce((s, n) => s + n, 0)).toBe(p.marks);
    if (!p.levels)
      expect(p.criteria.reduce((s, c) => s + c.marks, p.automaticMarks)).toBe(
        p.marks,
      );
    for (const id of p.question.exposureAliases ?? [])
      expect(questionById(id), id).toBeDefined();
  }
  expect(
    paper.parts
      .flatMap((p) => p.specification)
      .filter((s) =>
        [
          "1.12",
          "6.12",
          "7.14",
          "9.22C",
          "1.50",
          "1.51",
          "1.52",
          "1.53",
          "4.17",
        ].includes(s),
      ),
  ).toEqual([]);
  expect(part("8(d)").specification).toContain("1.49");
});

test("independent arithmetic preserves signed cooling, time differences, volume conversion and photometer blank", () => {
  const values: Record<string, number> = {
    "3(b)": (66 - 50) / (80 - 40),
    "4(a)": 17.4 - 22.6,
    "6(c)": 425 - 377.5,
    "7(b)": (34 - 4) / ((44 - 24) / (4 - 2)),
    "8(d)": 54 / (360 / 1000),
    "9(f)": 2 * 12 + 2 * 1 + 19 + 35.5,
    "10(a)": 75 * 1e-9,
  };
  for (const [number, value] of Object.entries(values)) {
    expect(Number(part(number).question.answer), number).toBeCloseTo(value, 10);
    expect(part(number).automaticMarks, number).toBe(0);
  }
  expect(part("3(b)").question.answer).toBe("0.40");
  expect(171.32 - 170.67).toBeCloseTo(0.65, 10);
  expect(161.5 - 161.02).toBeCloseTo(0.48, 10);
  expect(6 * 36 ** 2).toBe(7776);
  expect(36 ** 3).toBe(46656);
  expect(36 ** 3 / (6 * 36 ** 2)).toBe(6);
  expect(part("7(b)").criteria[0].text).toContain("blank");
});

test("rate construction starts blank and keeps wrong observations separate from an independently entered plateau curve", () => {
  const data = part("3(a)").question.fuelDrawing!.data;
  expect(data.points).toEqual([
    [0, 0],
    [20, 32],
    [40, 50],
    [60, 61],
    [80, 66],
    [100, 66],
  ]);
  expect(data.fitKind).toBeUndefined();
  expect(data.context).toBe("measurement");
  expect(Object.values(emptyFuelDrawing(data)).every((v) => v === "")).toBe(
    true,
  );
  const reference = readFuelDrawing(part("3(a)").referenceConstruction!, data)!;
  expect(reference.estimate).toBe("");
  expect(reference.c4).toBe("66");
  expect(reference.c5).toBe("66");
  expect(
    mark(part("3(a)").question, part("3(a)").referenceConstruction!).selfReview,
  ).toBe(true);
  const wrong: Record<string, string> = { ...reference, p2y: "70" };
  expect(readFuelDrawing(JSON.stringify(wrong), data)).toEqual(wrong);
  expect(wrong.c2).toBe("50");
  expect(
    reviewPart(part("3(a)"), response(JSON.stringify(wrong)), {}, 1),
  ).toMatchObject({ automatic: 0, marks: 0, pending: true });
});

test("propanol and the unfamiliar fluorochloro repeat have chemically complete references without duplicated O-H penalties", () => {
  const drawn = readOrganicDrawing(part("8(a)").referenceConstruction!)!;
  expect(drawingOrganicCounts(drawn)).toEqual({ C: 3, H: 8, O: 1 });
  expect(drawn).toMatchObject({
    n: "3",
    hydroxyl: "yes",
    oxygenH: "yes",
    carbonyl: "0",
  });
  expect(drawingOrganicCounts({ ...drawn, oxygenH: "no" })).toEqual({
    C: 3,
    H: 7,
    O: 1,
  });
  expect(part("8(a)").criteria[2].text).toContain("not penalised twice");
  const repeat = readPolymerisationDrawing(
    part("9(a)").referenceConstruction!,
  )!;
  expect(repeat).toMatchObject({
    s0: "H",
    s1: "H",
    s2: "F",
    s3: "Cl",
    bond: "1",
    left: "1",
    right: "1",
    brackets: "1",
    countMark: "n",
  });
  expect(repeatInventory(["H", "H", "F", "Cl"])).toEqual([2, 2, 1, 1]);
  expect(
    readPolymerisationDrawing(JSON.stringify({ ...repeat, countMark: "N" }))
      ?.countMark,
  ).toBe("N");
});

test("manual criteria keep the positive cooling magnitude and missing O-H draft as partial work; methods use one whole-response level", () => {
  const cooling = part("4(a)"),
    positive = response("5.2", "22.6−17.4=5.2");
  const keys = {
    [paperReviewKey(1, cooling.question.id, "point-1")]: "1",
    [paperReviewKey(1, cooling.question.id, "point-2")]: "0",
  };
  expect(reviewPart(cooling, positive, keys, 1)).toMatchObject({
    automatic: 0,
    marks: 1,
    pending: false,
  });
  const p = part("8(a)"),
    wrong = JSON.stringify({
      ...readOrganicDrawing(p.referenceConstruction!)!,
      oxygenH: "no",
    });
  expect(
    reviewPart(
      p,
      response(wrong),
      {
        [paperReviewKey(1, p.question.id, "point-1")]: "1",
        [paperReviewKey(1, p.question.id, "point-2")]: "0",
        [paperReviewKey(1, p.question.id, "point-3")]: "1",
      },
      1,
    ),
  ).toMatchObject({ automatic: 0, marks: 2, pending: false });
  const method = part("7(a)");
  expect(method.criteria).toEqual([]);
  expect(method.levels?.map((l) => [l.min, l.max])).toEqual([
    [5, 6],
    [3, 4],
    [1, 2],
    [0, 0],
  ]);
  expect(
    reviewPart(method, response("NaOH and silver nitrate"), {}, 1).pending,
  ).toBe(true);
});

test("actual previously disclosed recalls and propanol construction stay exposed across boards", () => {
  for (const [number, id] of [
    ["1(b)", "g7-v1-p-none"],
    ["2(b)", "g1-write-v1-ca-trend"],
    ["4(c)", "profile-v1-b-draw"],
    ["6(e)", "chem-p2f-full-v1-08a"],
    ["8(a)", "alc-v1-p-propanol"],
    ["9(e)", "natural-v1-r-protein"],
  ]) {
    const qid = part(number).question.id;
    expect(exposureIds([qid])).toContain(id);
    expect(exposureIds([id])).toContain(qid);
  }
  for (const number of [
    "3(a)",
    "3(b)",
    "4(a)",
    "6(c)",
    "7(b)",
    "8(d)",
    "9(a)",
    "9(f)",
    "10(a)",
    "10(b)",
  ])
    expect(part(number).question.exposureAliases, number).toBeUndefined();
});

test("valid and chemically wrong complex drawings are recordable manual responses, while unreadable raw structures are rejected", () => {
  for (const number of ["3(a)", "8(a)", "9(a)"]) {
    const p = part(number);
    const correct = p.referenceConstruction!;
    expect(mark(p.question, correct), number).toMatchObject({
      empty: false,
      selfReview: true,
    });
    expect(mark(p.question, correct).invalid, number).not.toBe(true);
    const parsed = JSON.parse(correct);
    const wrong =
      number === "3(a)"
        ? { ...parsed, p2y: "70" }
        : number === "8(a)"
          ? { ...parsed, oxygenH: "no" }
          : { ...parsed, countMark: "N" };
    expect(mark(p.question, JSON.stringify(wrong)), number).toMatchObject({
      empty: false,
      selfReview: true,
    });
    expect(mark(p.question, "{broken").invalid, number).toBe(true);
    expect(p.automaticMarks, number).toBe(0);
  }
});

test("measurement interpolation keeps a plateau exactly flat and preserves entered wrong extrema without overshooting between anchors", () => {
  const datasets = [
    [
      [0, 0],
      [20, 32],
      [40, 50],
      [60, 61],
      [80, 66],
      [100, 66],
    ],
    [
      [0, 70],
      [10, 50],
      [30, 20],
      [40, 20],
    ],
    [
      [0, 0],
      [20, 32],
      [40, 70],
      [60, 61],
      [80, 66],
      [100, 66],
    ],
  ];
  for (const data of datasets) {
    const points = data.map(([x, y]) => ({ x, y }));
    const segments = measurementCurveSegments(points);
    for (const [i, s] of segments.entries()) {
      expect(s.from).toEqual(points[i]);
      expect(s.to).toEqual(points[i + 1]);
      for (let step = 0; step <= 100; step++) {
        const t = step / 100,
          u = 1 - t;
        const y =
          u ** 3 * s.from.y +
          3 * u * u * t * s.first.y +
          3 * u * t * t * s.second.y +
          t ** 3 * s.to.y;
        expect(y).toBeGreaterThanOrEqual(Math.min(s.from.y, s.to.y) - 1e-8);
        expect(y).toBeLessThanOrEqual(Math.max(s.from.y, s.to.y) + 1e-8);
      }
      if (s.from.y === s.to.y) {
        expect(s.first.y).toBe(s.from.y);
        expect(s.second.y).toBe(s.to.y);
      }
    }
  }
});
