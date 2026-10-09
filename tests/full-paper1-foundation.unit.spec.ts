import { test, expect } from "@playwright/test";
import { paper1FoundationFull as paper } from "../src/content/paper1-foundation-full";
import { fullPapers } from "../src/content/full-assessments";
import { lessons, questionById, topics } from "../src/content/curriculum";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
  type Response,
} from "../src/lib/progress";
import {
  paperReviewKey,
  readReviewMark,
  reviewPart,
} from "../src/lib/exam-paper-review";
import { emptyFuelDrawing } from "../src/lib/fuel-drawing";
import { extendedPapers } from "../src/content/extended-assessments";

const by = (number: string) => paper.parts.find((p) => p.number === number)!;
const response = (answer: string, working?: string): Response => ({
  answer,
  working,
  correct: false,
  fresh: true,
  helped: false,
  at: 20,
});

test("one full Foundation paper has 100 allocated marks, 105 minutes and explicit original AO/maths/practical demands", () => {
  expect(fullPapers).toHaveLength(1);
  expect(paper.parts).toHaveLength(50);
  expect(paper.minutes).toBe(105);
  expect(paper.parts.reduce((sum, p) => sum + p.marks, 0)).toBe(100);
  expect(
    paper.parts.reduce((a, p) => a.map((v, i) => v + p.ao[i]), [0, 0, 0]),
  ).toEqual([40, 40, 20]);
  expect(
    paper.parts
      .filter((p) => p.mathematics)
      .reduce((sum, p) => sum + p.marks, 0),
  ).toBe(26);
  expect(
    paper.parts.filter((p) => p.practical).reduce((sum, p) => sum + p.marks, 0),
  ).toBe(23);
  for (let group = 1; group <= 10; group++)
    expect(
      paper.parts
        .filter((p) => p.number.startsWith(`${group}(`))
        .reduce((sum, p) => sum + p.marks, 0),
    ).toBe(10);
  const native = lessons.flatMap((l) => tasks(l.journey!));
  // Original5,824 tasks plus individually appended5air and30alloy tasks.
  expect(native).toHaveLength(5859);
  expect(new Set(paper.parts.map((p) => p.question.id)).size).toBe(50);
  expect(
    paper.parts.every((p) => !native.some((q) => q.id === p.question.id)),
  ).toBe(true);
  expect(extendedPapers.map((p) => p.questions.length)).toEqual([
    30, 30, 30, 30,
  ]);
  for (const p of paper.parts) {
    expect(
      p.ao.reduce((a, b) => a + b, 0),
      p.number,
    ).toBe(p.marks);
    expect(p.question.tier).not.toBe("higher");
    expect(questionById(p.question.id)).toBe(p.question);
    for (const alias of p.question.exposureAliases ?? [])
      expect(
        questionById(alias),
        `${p.number} exposure alias ${alias}`,
      ).toBeDefined();
    expect(p.specification.length).toBeGreaterThan(0);
    expect(
      topics.some(
        (t) => t.slug === (p.topic === "energy-changes" ? "energy" : p.topic),
      ),
      p.number,
    ).toBe(true);
    if (!p.levels)
      expect(
        p.criteria.reduce((sum, c) => sum + c.marks, p.automaticMarks),
        p.number,
      ).toBe(p.marks);
  }
});

test("particle, isotope, formula, yield, crystallisation and voltage references agree with independent calculations", () => {
  const values: Record<string, string> = {
    "1(b)": JSON.stringify({ neutrons: String(22 - 10), electrons: "10" }),
    "1(c)": "2,8",
    "1(e)": String((80 * 20 + 20 * 22) / 100),
    "5(b)": String(24 + 2 * 14 + 6 * 16),
    "6(a)": JSON.stringify({ mean: "24.20", halfRange: "0.10" }),
    "6(c)": String((9.6 / 12) * 100),
    "7(c)": String(20 - 12),
    "10(d)": String(1.2 + 1.4),
  };
  for (const [number, value] of Object.entries(values))
    expect(mark(by(number).question, value).correct, number).toBe(true);
  expect(mark(by("5(b)").question, "24+28+96").invalid).toBe(true);
  expect(mark(by("5(b)").question, "147").correct).toBe(false);
  expect(mark(by("5(b)").question, "1..2").invalid).toBe(true);
});

test("native dot-cross and energy profile references conserve electrons and use an activation difference", () => {
  expect(
    mark(
      by("3(a)").question,
      JSON.stringify({ dots: "7", crosses: "1", charge: "-1", brackets: "1" }),
    ).correct,
  ).toBe(true);
  expect(
    mark(
      by("4(a)").question,
      JSON.stringify({
        unsharedCentre: "4",
        centre0: "1",
        partner0: "1",
        unsharedPartner0: "0",
        centre1: "1",
        partner1: "1",
        unsharedPartner1: "0",
      }),
    ).correct,
  ).toBe(true);
  const profile = {
    reactant: "75",
    product: String(75 - 30),
    peak: String(75 + 55),
    activationArrow: "reactants-peak",
    overallArrow: "reactants-products",
  };
  expect(mark(by("9(b)").question, JSON.stringify(profile)).correct).toBe(true);
  expect(
    mark(by("9(b)").question, JSON.stringify({ ...profile, peak: "55" }))
      .correct,
  ).toBe(false);
  for (const number of ["3(a)", "4(a)", "9(b)"])
    expect(
      reviewPart(by(number), response(by(number).question.answer), {}, 1)
        .automatic,
    ).toBe(0);
});

test("the original graph uses six retained measurements and a separate balanced straight fit", () => {
  const q = by("9(e)").question,
    drawing = q.fuelDrawing!,
    data = drawing.data;
  expect(data.points).toEqual([
    [2, 24.1],
    [4, 22.9],
    [6, 22.1],
    [8, 20.9],
    [10, 20.1],
    [12, 18.9],
  ]);
  expect(drawing.referenceLine).toEqual(
    data.points.filter((_, i) => i === 0 || i === 5).map(([x]) => 25 - 0.5 * x),
  );
  expect(
    data.points.map(([x, y]) => Math.round((y - (25 - 0.5 * x)) * 10)),
  ).toEqual([1, -1, 1, -1, 1, -1]);
  const board = emptyFuelDrawing(data);
  for (const [i, [x, y]] of data.points.entries())
    Object.assign(board, { [`p${i}x`]: String(x), [`p${i}y`]: String(y) });
  Object.assign(board, { c0: "24", c5: "19", estimate: "25" });
  expect(mark(q, JSON.stringify(board)).selfReview).toBe(true);
  expect(mark(q, JSON.stringify(board)).correct).toBe(false);
  expect(mark(q, JSON.stringify(board)).invalid).not.toBe(true);
});

test("extended crystallisation is reviewed as a whole response using levels, never six keyword ticks", () => {
  const p = by("7(b)");
  expect(p.marks).toBe(6);
  expect(p.criteria).toEqual([]);
  expect(p.levels!.map((l) => [l.min, l.max])).toEqual([
    [5, 6],
    [3, 4],
    [1, 2],
    [0, 0],
  ]);
  expect(mark(p.question, p.question.answer).correct).toBe(false);
  expect(reviewPart(p, response(p.question.answer), {}, 100).pending).toBe(
    true,
  );
  const key = paperReviewKey(100, p.question.id, "whole-response");
  expect(
    reviewPart(p, response(p.question.answer), { [key]: "4" }, 100),
  ).toMatchObject({ marks: 4, pending: false });
  expect(
    reviewPart(p, response(p.question.answer), { [key]: "4" }, 101).pending,
  ).toBe(true);
});

test("correct final values with working require contradiction review before counting that answer point", () => {
  const p = by("5(b)"),
    r = response("148", "24 + 14 + 3×16 = 148"),
    started = 100;
  const final = paperReviewKey(started, p.question.id, "answer-with-working"),
    method = paperReviewKey(started, p.question.id, "point-1");
  expect(reviewPart(p, r, {}, started)).toMatchObject({
    automatic: null,
    pending: true,
    marks: 0,
  });
  expect(
    reviewPart(p, r, { [final]: "0", [method]: "0" }, started),
  ).toMatchObject({ automatic: 0, pending: false, marks: 0 });
  expect(
    reviewPart(p, response("148"), { [method]: "0" }, started),
  ).toMatchObject({ automatic: 1, pending: false, marks: 1 });
  expect(
    reviewPart(
      p,
      response("149", "24 + 2×14 + 6×16, arithmetic slip"),
      { [method]: "1" },
      started,
    ),
  ).toMatchObject({ automatic: 0, pending: false, marks: 1 });
});

test("partial graph credit and malformed saved review decisions remain bounded and pending", () => {
  for (const raw of [
    undefined,
    "",
    "1..2",
    "-1",
    "0.5",
    "2",
    "01",
    "1e0",
    "NaN",
  ])
    expect(readReviewMark(raw, 1)).toBeNull();
  expect(readReviewMark("0", 1)).toBe(0);
  const p = by("9(e)");
  const drafts = {
    [paperReviewKey(10, p.question.id, "point-1")]: "1",
    [paperReviewKey(10, p.question.id, "point-2")]: "1",
  };
  expect(reviewPart(p, response(""), drafts, 10)).toMatchObject({
    marks: 2,
    pending: false,
  });
});

test("new reference equivalents retain original exposure and unchanged version-1 storage", () => {
  for (const number of ["3(a)", "4(a)"])
    for (const alias of by(number).question.exposureAliases!)
      expect(exposureIds([by(number).question.id])).toContain(alias);
  const progress = emptyProgress(),
    w = emptyWork();
  w.run = {
    kind: "paper",
    ids: paper.parts.map((p) => p.question.id),
    started: 100,
    index: 0,
    responses: {},
  };
  w.drafts = {
    "paper-timer:100": "105",
    [paperReviewKey(100, by("7(b)").question.id, "whole-response")]: "4",
    [by("5(b)").question.id]: "1..2",
  };
  progress.work["assessment-paper-1-foundation-full"] = w;
  const raw = JSON.stringify(progress);
  expect(decode(raw)).toEqual(progress);
  expect(JSON.stringify(progress)).toBe(raw);
});
