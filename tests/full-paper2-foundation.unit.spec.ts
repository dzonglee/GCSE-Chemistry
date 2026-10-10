import { test, expect } from "@playwright/test";
import { paper2FoundationFull as paper } from "../src/content/paper2-foundation-full";
import { fullPapers } from "../src/content/full-assessments";
import { lessons, questionById, topics } from "../src/content/curriculum";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import { exposureIds, type Response } from "../src/lib/progress";
import { paperReviewKey, reviewPart } from "../src/lib/exam-paper-review";
import { emptyFuelDrawing } from "../src/lib/fuel-drawing";
import {
  emptyOrganicDrawing,
  readOrganicDrawing,
  drawingOrganicCounts,
} from "../src/lib/organic-drawing";
import {
  blankPolymerisationDrawing,
  readPolymerisationDrawing,
} from "../src/lib/polymerisation-board";
import { readFuelDrawing } from "../src/lib/fuel-drawing";
import { chromaGivenSources } from "../src/lib/chromatography-givens";

const by = (number: string) => paper.parts.find((p) => p.number === number)!;
const response = (answer: string, working?: string): Response => ({
  answer,
  working,
  correct: false,
  fresh: true,
  helped: false,
  at: 20,
});

test("worked visual references are readable native constructions with full ethanol valences, polymer notation and six independent plotted points", () => {
  const ethanol = readOrganicDrawing(by("5(a)").referenceConstruction!)!;
  expect(drawingOrganicCounts(ethanol)).toEqual({ C: 2, H: 6, O: 1 });
  expect(ethanol.hydroxyl).toBe("yes");
  expect(ethanol.oxygenH).toBe("yes");
  expect(ethanol.carbonyl).toBe("0");
  for (const [carbon, externalBonds] of [
    [0, 1],
    [1, 2],
  ]) {
    const h = Array.from({ length: 4 }, (_, slot) =>
      ethanol[`h${carbon * 4 + slot}`] === "yes" ? 1 : 0,
    ).reduce<number>((a, b) => a + b, 0);
    expect(h + externalBonds).toBe(4);
  }
  const polymer = readPolymerisationDrawing(by("4(a)").referenceConstruction!)!;
  expect([polymer.s0, polymer.s1, polymer.s2, polymer.s3]).toEqual([
    "H",
    "H",
    "H",
    "C2H5",
  ]);
  expect([
    polymer.bond,
    polymer.left,
    polymer.right,
    polymer.brackets,
    polymer.countMark,
  ]).toEqual(["1", "1", "1", "1", "n"]);
  const data = by("5(e)").question.fuelDrawing!.data;
  const graph = readFuelDrawing(by("5(e)").referenceConstruction!, data)!;
  for (const [i, [x, y]] of [
    [2, 29.2],
    [3, 33.8],
    [4, 36],
    [5, 37.6],
    [6, 38.7],
    [7, 39.5],
  ].entries()) {
    expect(Number(graph[`p${i}x`])).toBe(x);
    expect(Number(graph[`p${i}y`])).toBe(y);
    expect(Number(graph[`c${i}`])).toBe(y);
  }
  expect(graph.estimate).toBe("");
  for (const number of ["4(a)", "5(a)", "5(e)"])
    expect(
      mark(by(number).question, by(number).referenceConstruction!).correct,
    ).toBe(false);
});

test("individually authored Foundation Paper2 allocates100 marks with valid qualification, AO and reserved references", () => {
  expect(fullPapers).toHaveLength(2);
  expect(fullPapers[1].examPaper).toBe(paper);
  expect(fullPapers[1].course).toBe("separate");
  expect(fullPapers[1].tier).toBe("foundation");
  expect(paper.minutes).toBe(105);
  expect(paper.parts).toHaveLength(49);
  expect(paper.parts.reduce((sum, p) => sum + p.marks, 0)).toBe(100);
  expect(
    paper.parts.reduce((a, p) => a.map((v, i) => v + p.ao[i]), [0, 0, 0]),
  ).toEqual([40, 40, 20]);
  expect(
    paper.parts
      .filter((p) => p.mathematics)
      .reduce((sum, p) => sum + p.marks, 0),
  ).toBe(25);
  expect(
    paper.parts.filter((p) => p.practical).reduce((sum, p) => sum + p.marks, 0),
  ).toBe(24);
  const native = lessons.flatMap((l) => tasks(l.journey!));
  expect(native).toHaveLength(5882);
  expect(new Set(paper.parts.map((p) => p.question.id)).size).toBe(49);
  for (let group = 1; group <= 10; group++)
    expect(
      paper.parts
        .filter((p) => p.number.startsWith(`${group}(`))
        .reduce((s, p) => s + p.marks, 0),
    ).toBe(10);
  for (const p of paper.parts) {
    expect(
      p.ao.reduce((a, b) => a + b, 0),
      p.number,
    ).toBe(p.marks);
    expect(p.question.tier, p.number).not.toBe("higher");
    expect(p.specification.length, p.number).toBeGreaterThan(0);
    expect(
      topics.some((t) => t.slug === p.topic),
      p.number,
    ).toBe(true);
    expect(questionById(p.question.id), p.number).toBe(p.question);
    expect(
      native.some((q) => q.id === p.question.id),
      p.number,
    ).toBe(false);
    if (!p.levels)
      expect(
        p.criteria.reduce((sum, c) => sum + c.marks, p.automaticMarks),
        p.number,
      ).toBe(p.marks);
    for (const alias of p.question.exposureAliases ?? []) {
      expect(questionById(alias), `${p.number}: ${alias}`).toBeDefined();
      expect(exposureIds([alias]), `${p.number}: prior cue`).toContain(
        p.question.id,
      );
      expect(
        exposureIds([p.question.id]),
        `${p.number}: outgoing cue`,
      ).toContain(alias);
    }
  }
  expect(exposureIds(["haber-v1-p-compromise"])).toContain(
    by("10(a)").question.id,
  );
});

test("independent calculations use the supplied units, offset origin, weighted blend and complete reuse boundary", () => {
  const values: Record<string, string> = {
    "1(b)": String(31 / ((0.6 + 0.62 + 0.64) / 3)),
    "2(d)": String(2.5 - 1.6),
    "2(e)": "6.40",
    "5(d)": ((1.2 * 33.8) / 29.2).toFixed(2),
    "6(b)": String((51 - 15) / (95 - 15)),
    "7(c)": String((4.8 + 5.0 + 4.9) / 3),
    "8(d)": String((0.06 / 100) * 240 * 1000),
    "9(c)": String((8 + 20 * 0.12) / 20),
    "10(c)": String(((12 * 0.15 + 8 * 0.05) / (12 + 8)) * 100),
  };
  for (const [number, raw] of Object.entries(values))
    expect(mark(by(number).question, raw).correct, number).toBe(true);
  expect(mark(by("6(b)").question, String(51 / 95)).correct).toBe(false);
  expect(mark(by("9(c)").question, "0.12").correct).toBe(false);
  expect(mark(by("10(c)").question, "10").correct).toBe(false);
  expect(mark(by("8(d)").question, "0.144").correct).toBe(false);
  expect(mark(by("1(b)").question, "31 / 0.62").correct).toBe(true);
  expect(mark(by("1(b)").question, "31 ÷ 0.62").invalid).toBe(true);
  expect(mark(by("5(d)").question, "1.389041").correct).toBe(false);
  expect(chromaGivenSources.paper2Foundation.origin).toBe(15);
  expect(chromaGivenSources.paper2Foundation.lanes[1].centres).toEqual([51]);
});

test("constructed molecules, polymer notation and raw observations stay manually reviewed including wrong valid structures", () => {
  const organic = {
    ...emptyOrganicDrawing(),
    n: "2",
    hydroxyl: "yes",
    oxygenH: "yes",
    h0: "yes",
  };
  const polymer = { ...blankPolymerisationDrawing(), s0: "Cl", bond: "2" };
  const q = by("5(e)").question;
  const graph = {
    ...emptyFuelDrawing(q.fuelDrawing!.data),
    p0x: "2",
    p0y: "40",
    c0: "29.2",
  };
  for (const [number, raw] of [
    ["5(a)", JSON.stringify(organic)],
    ["4(a)", JSON.stringify(polymer)],
    ["5(e)", JSON.stringify(graph)],
  ])
    expect(mark(by(number).question, raw), number).toMatchObject({
      correct: false,
      selfReview: true,
    });
  expect(
    mark(by("5(a)").question, JSON.stringify(emptyOrganicDrawing())).empty,
  ).toBe(true);
  expect(
    mark(by("4(a)").question, JSON.stringify(blankPolymerisationDrawing()))
      .empty,
  ).toBe(true);
  expect(
    mark(q, JSON.stringify(emptyFuelDrawing(q.fuelDrawing!.data))).empty,
  ).toBe(true);
  expect(mark(by("5(a)").question, "broken structure").invalid).toBe(true);
  expect(q.fuelDrawing!.data.points).toEqual([
    [2, 29.2],
    [3, 33.8],
    [4, 36],
    [5, 37.6],
    [6, 38.7],
    [7, 39.5],
  ]);
  for (const number of [
    "10(a)",
    "10(b)",
    "9(b)",
    "8(c)",
    "6(d)",
    "5(c)",
    "3(b)",
  ])
    expect(
      mark(by(number).question, by(number).question.answer),
      number,
    ).toMatchObject({ correct: false, selfReview: true });
  expect(by("9(b)").question.answer).toContain("Ordinary water plus oil");
  expect(by("10(a)").question.answer).toContain("water/steam");
});

test("method credit and whole six-mark judgement remain pending; correct numbers with contradictory working are never full automatic credit", () => {
  const p = by("1(b)");
  const saved = response("50", "I included the anomaly and divided31 by0.54.");
  expect(reviewPart(p, saved, {}, 10)).toMatchObject({
    automatic: null,
    pending: true,
    marks: 0,
  });
  const drafts = {
    [paperReviewKey(10, p.question.id, "answer-with-working")]: "0",
    [paperReviewKey(10, p.question.id, "point-1")]: "0",
    [paperReviewKey(10, p.question.id, "point-2")]: "1",
    [paperReviewKey(10, p.question.id, "point-3")]: "1",
  };
  expect(reviewPart(p, saved, drafts, 10)).toMatchObject({
    automatic: 0,
    pending: false,
    marks: 2,
  });
  const method = by("7(a)");
  expect(method.criteria).toEqual([]);
  expect(method.levels!.map((l) => [l.min, l.max])).toEqual([
    [5, 6],
    [3, 4],
    [1, 2],
    [0, 0],
  ]);
  expect(
    reviewPart(method, response(method.question.answer), {}, 10),
  ).toMatchObject({ pending: true, marks: 0 });
  const key = paperReviewKey(10, method.question.id, "whole-response");
  expect(
    reviewPart(method, response(method.question.answer), { [key]: "4" }, 10),
  ).toMatchObject({ pending: false, marks: 4 });
  expect(
    reviewPart(method, response(method.question.answer), { [key]: "7" }, 10),
  ).toMatchObject({ pending: true, marks: 0 });
});
