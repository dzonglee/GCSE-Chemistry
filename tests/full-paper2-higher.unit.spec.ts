import { test, expect } from "@playwright/test";
import { paper2HigherFull as paper } from "../src/content/paper2-higher-full";
import { fullPapers } from "../src/content/full-assessments";
import { lessons, questionById, topics } from "../src/content/curriculum";
import { tasks } from "../src/content/journeys/helpers";
import { reviewPart, paperReviewKey } from "../src/lib/exam-paper-review";
import { exposureIds, type Response } from "../src/lib/progress";
import { readFuelDrawing } from "../src/lib/fuel-drawing";
import { curveValue, curveSlope } from "../src/lib/tangent-rates";
import { readPolymerisationDrawing } from "../src/lib/polymerisation-board";

const by = (number: string) => paper.parts.find((p) => p.number === number)!;
const response = (answer: string, working = ""): Response => ({
  answer,
  working,
  correct: false,
  fresh: true,
  helped: false,
  at: 20,
});

test("Higher Paper 2 has complete, separate Higher allocation and reserved question identities", () => {
  const assessment = fullPapers.find((a) => a.slug === paper.id)!;
  expect([assessment.course, assessment.tier, assessment.structure]).toEqual([
    "separate",
    "higher",
    "full",
  ]);
  expect(paper.minutes).toBe(105);
  expect(paper.parts).toHaveLength(49);
  expect(paper.parts.reduce((s, p) => s + p.marks, 0)).toBe(100);
  expect(
    paper.parts.reduce((a, p) => a.map((v, i) => v + p.ao[i]), [0, 0, 0]),
  ).toEqual([38, 43, 19]);
  expect(
    paper.parts.filter((p) => p.mathematics).reduce((s, p) => s + p.marks, 0),
  ).toBe(30);
  expect(
    paper.parts.filter((p) => p.practical).reduce((s, p) => s + p.marks, 0),
  ).toBe(27);
  const native = lessons.flatMap((l) => tasks(l.journey!));
  expect(native).toHaveLength(5916);
  for (const p of paper.parts) {
    expect(native.some((q) => q.id === p.question.id)).toBe(false);
    expect(questionById(p.question.id)).toBe(p.question);
    expect(topics.some((t) => t.slug === p.topic)).toBe(true);
    expect(p.ao.reduce((a, b) => a + b, 0)).toBe(p.marks);
    if (!p.levels)
      expect(p.criteria.reduce((a, c) => a + c.marks, p.automaticMarks)).toBe(
        p.marks,
      );
    for (const id of p.question.exposureAliases ?? [])
      expect(questionById(id), id).toBeDefined();
  }
});

test("independent numeric calculations agree, including mean-time rate rather than mean of rates", () => {
  const expected: Record<string, number> = {
    "1(b)": Number((0.0025 / ((36 + 37.2 + 36.8) / 3)).toPrecision(3)),
    "2(a)": Number(((2.4 * 32.8) / 26).toPrecision(3)),
    "4(b)": 100000 * 0.75 - 120000 * 0.42,
    "5(b)": Number(((127 / (127 + 12 + 48 + 34)) * 100).toPrecision(3)),
    "6(b)": 0.625 * 120,
    "7(c)": (1.6 - 0.8) / (75 - 25),
    "8(e)": 89 - (14 + 2 + 12 + 32 + 1),
    "9(a)": ((5 - 3.2) * 9) / 5,
    "9(b)": (2.2 * 8) / 3.2,
  };
  for (const [n, v] of Object.entries(expected))
    expect(Number(by(n).question.answer), n).toBeCloseTo(v, 10);
  expect(by("1(b)").question.explanation).toContain("using the mean time");
});

test("correct final numbers cannot automatically award method or raw-precision marks", () => {
  for (const n of ["1(b)", "5(b)", "7(c)", "8(e)", "9(a)", "9(b)"]) {
    const p = by(n),
      r = reviewPart(p, response(p.question.answer), {}, 100);
    expect(p.automaticMarks).toBe(0);
    expect(r.marks).toBe(0);
    expect(r.pending).toBe(true);
  }
  for (const [n, a] of [
    ["1(b)", "6.820e-5"],
    ["7(c)", "0.0160"],
  ]) {
    const p = by(n);
    const decisions = Object.fromEntries(
      p.criteria.map((c, i) => [
        paperReviewKey(100, p.question.id, c.id),
        String(i === p.criteria.length - 1 ? 0 : c.marks),
      ]),
    );
    expect(reviewPart(p, response(a), decisions, 100).marks).toBe(p.marks - 1);
  }
});

test("six-mark ion method and four-mark fertiliser evaluation use whole-response levels", () => {
  for (const [n, max, selected] of [
    ["3(a)", 6, 4],
    ["10(a)", 4, 2],
  ] as const) {
    const p = by(n);
    expect(p.criteria).toEqual([]);
    expect(Math.max(...p.levels!.map((l) => l.max))).toBe(max);
    expect(
      reviewPart(p, response("some incomplete relevant reasoning"), {}, 100)
        .pending,
    ).toBe(true);
    const decisions = {
      [paperReviewKey(100, p.question.id, "whole-response")]: String(selected),
    };
    expect(
      reviewPart(
        p,
        response("some incomplete relevant reasoning"),
        decisions,
        100,
      ).marks,
    ).toBe(selected);
  }
});

test("carried-error rate method remains creditable without crediting its anomaly decision", () => {
  const p = by("1(b)");
  const incorrectMean = (36 + 37.2 + 36.8 + 56) / 4;
  const raw = Number((0.0025 / incorrectMean).toPrecision(3)).toExponential(2);
  const decisions = Object.fromEntries(
    p.criteria.map((c, i) => [
      paperReviewKey(100, p.question.id, c.id),
      String(i === 0 ? 0 : 1),
    ]),
  );
  expect(
    reviewPart(
      p,
      response(
        raw,
        `Mean of all four times=${incorrectMean}s; rate=0.00250/${incorrectMean}`,
      ),
      decisions,
      100,
    ).marks,
  ).toBe(4);
});

test("the supplied tangent genuinely touches the curved trace with its exact instantaneous slope", () => {
  const g = by("7(c)").question.tangentGraph!;
  const [a, b] = g.line!;
  const gradient = (b.q - a.q) / (b.t - a.t);
  expect(gradient).toBeCloseTo(curveSlope(g.curve, g.curve.at), 12);
  const tangentAt = a.q + gradient * (g.curve.at - a.t);
  expect(tangentAt).toBeCloseTo(curveValue(g.curve, g.curve.at), 12);
  expect(curveSlope(g.curve, 100)).toBeCloseTo(0, 12);
  expect(curveValue(g.curve, 100)).toBeCloseTo(1.6, 12);
});

test("native references preserve the curved graph and original unfamiliar substituent attachments", () => {
  const graph = by("2(b)"),
    data = graph.question.fuelDrawing!.data;
  expect(data.fitKind).toBeUndefined();
  const reference = readFuelDrawing(graph.referenceConstruction!, data)!;
  expect(reference.estimate).toBe("37.0");
  const increments = data.points
    .slice(1)
    .map((p, i) => p[1] - data.points[i][1]);
  for (let i = 1; i < increments.length; i++)
    expect(increments[i]).toBeLessThan(increments[i - 1]);
  const repeat = readPolymerisationDrawing(by("8(b)").referenceConstruction!)!;
  expect([repeat.s0, repeat.s1, repeat.s2, repeat.s3]).toEqual([
    "H",
    "F",
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

test("actual reviewed recalls stay exposed bidirectionally while different numerical data remain independent", () => {
  for (const [n, id] of [
    ["1(c)", "ct-v1-p-frequency-explain"],
    ["2(e)", "alc-v1-p-ester"],
    ["8(h)", "natural-v1-p-dna-shape"],
    ["9(d)", "es-v1-p-equal"],
    ["10(e)", "haber-v1-source-recall-p-products"],
  ]) {
    expect(exposureIds([id])).toContain(by(n).question.id);
    expect(exposureIds([by(n).question.id])).toContain(id);
  }
  for (const n of [
    "1(b)",
    "2(a)",
    "4(b)",
    "5(b)",
    "6(b)",
    "7(c)",
    "8(b)",
    "8(e)",
    "9(a)",
    "9(b)",
  ])
    expect(by(n).question.exposureAliases ?? []).toEqual([]);
});
