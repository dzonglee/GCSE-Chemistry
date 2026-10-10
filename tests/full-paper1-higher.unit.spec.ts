import { test, expect } from "@playwright/test";
import { paper1HigherFull as paper } from "../src/content/paper1-higher-full";
import { fullPapers } from "../src/content/full-assessments";
import { higherPapers } from "../src/content/assessments";
import { emptyFuelDrawing, readFuelDrawing } from "../src/lib/fuel-drawing";
import { paper1FoundationFull } from "../src/content/paper1-foundation-full";
import { lessons, questionById, topics } from "../src/content/curriculum";
import { tasks } from "../src/content/journeys/helpers";
import { reviewPart, paperReviewKey } from "../src/lib/exam-paper-review";
import { exposureIds, type Response } from "../src/lib/progress";

const by = (number: string) => paper.parts.find((p) => p.number === number)!;
const response = (answer: string, working = ""): Response => ({
  answer,
  working,
  correct: false,
  fresh: true,
  helped: false,
  at: 20,
});

test("Higher full paper has independent reserved questions, appropriate qualification and complete mark allocation", () => {
  const assessment = fullPapers.find((a) => a.slug === paper.id)!;
  expect([assessment.course, assessment.tier, assessment.structure]).toEqual([
    "separate",
    "higher",
    "full",
  ]);
  expect(paper.minutes).toBe(105);
  expect(paper.parts).toHaveLength(43);
  expect(paper.parts.reduce((sum, p) => sum + p.marks, 0)).toBe(100);
  const ao = paper.parts.reduce(
    (a, p) => a.map((v, i) => v + p.ao[i]),
    [0, 0, 0],
  );
  expect(ao).toEqual([39, 42, 19]);
  expect(ao[0]).toBeGreaterThanOrEqual(37);
  expect(ao[0]).toBeLessThanOrEqual(43);
  expect(ao[1]).toBeGreaterThanOrEqual(37);
  expect(ao[1]).toBeLessThanOrEqual(43);
  expect(ao[2]).toBeGreaterThanOrEqual(17);
  expect(ao[2]).toBeLessThanOrEqual(23);
  const native = lessons.flatMap((l) => tasks(l.journey!));
  expect(native).toHaveLength(5906);
  for (const p of paper.parts) {
    expect(native.some((q) => q.id === p.question.id)).toBe(false);
    expect(questionById(p.question.id)).toBe(p.question);
    expect(
      topics.some(
        (t) => t.slug === (p.topic === "energy-changes" ? "energy" : p.topic),
      ),
    ).toBe(true);
    expect(p.ao.reduce((a, b) => a + b, 0)).toBe(p.marks);
    if (!p.levels)
      expect(p.criteria.reduce((s, c) => s + c.marks, p.automaticMarks)).toBe(
        p.marks,
      );
    for (const id of p.question.exposureAliases ?? [])
      expect(
        questionById(id) ??
          higherPapers.flatMap((a) => a.questions).find((q) => q.id === id),
        `${p.number}: ${id}`,
      ).toBeDefined();
  }
});

test("independently calculated isotope, titration, particles, limiting gas, industrial gas, bond change and reverse atom economy agree", () => {
  const expected: Record<string, number> = {
    "1(b)": Math.round(((63 * 68 + 65 * 32) / 100) * 10) / 10,
    "5(b)": Number((((25 / 1000) * 0.16) / 2 / (18.6 / 1000)).toPrecision(3)),
    "5(d)": 1e-4 * 10 ** (4 - 2),
    "6(e)": 42 / 2,
    "7(b)": Number((0.75 * 6.02e23).toPrecision(3)),
    "7(c)": Math.min(2.4 / 24, 0.15 / 2) * 24,
    "8(b)": ((72 * 1000) / (2 * 64 + 16) / 2) * 24,
    "9(a)": 436 + 242 - 2 * 432,
    "10(c)": Number(
      ((67.5 * (3 * (2 * 1 + 16))) / (200 - 2 * 67.5)).toPrecision(3),
    ),
    "10(d)": (8.4 / 10.5) * 100,
  };
  for (const [n, v] of Object.entries(expected))
    expect(Number(by(n).question.answer), n).toBeCloseTo(v, 10);
});

test("equivalent numeric answers cannot silently earn precision, standard-form or method credit", () => {
  for (const [number, answer] of [
    ["1(b)", "63.60"],
    ["5(b)", "0.1080"],
    ["7(b)", "45.2e22"],
    ["10(c)", "56.10"],
  ]) {
    const p = by(number);
    const r = reviewPart(p, response(answer), {}, 100);
    expect(p.automaticMarks).toBe(0);
    expect(r.pending).toBe(true);
    expect(r.marks).toBe(0);
    const decisions = Object.fromEntries(
      p.criteria.map((c, i) => [
        paperReviewKey(100, p.question.id, c.id),
        String(i === p.criteria.length - 1 ? 0 : c.marks),
      ]),
    );
    const reviewed = reviewPart(p, response(answer), decisions, 100);
    expect(reviewed.pending).toBe(false);
    expect(reviewed.marks).toBe(p.marks - 1);
  }
});

test("six-mark gas working preserves independent carried-error method credit and the crystal method is holistic", () => {
  const p = by("8(b)");
  const wrong = response(
    "12000",
    "Mr=72; mass=72000g; n=1000mol; n(CO2)=500mol; V=500×24=12000dm³",
  );
  const decisions = Object.fromEntries(
    p.criteria.map((c, i) => [
      paperReviewKey(100, p.question.id, c.id),
      String(i === 0 ? 0 : 1),
    ]),
  );
  const result = reviewPart(p, wrong, decisions, 100);
  expect(result.pending).toBe(false);
  expect(result.marks).toBe(5);
  const salt = by("4(a)");
  expect(salt.criteria).toHaveLength(0);
  expect(salt.levels).toBeDefined();
  expect(
    reviewPart(salt, response("filter crystals acid heat"), {}, 100).pending,
  ).toBe(true);
  const reviewed = reviewPart(
    salt,
    response("filter crystals acid heat"),
    { [paperReviewKey(100, salt.question.id, "whole-response")]: "2" },
    100,
  );
  expect(reviewed.marks).toBe(2);
});

test("alternative exothermic energy levels retain manual judgement and HCl reference conserves outer electrons", () => {
  const p = by("9(b)");
  const alternative = JSON.stringify({
    reactant: "100",
    product: "20",
    peak: "180",
    activationArrow: "reactants-peak",
    overallArrow: "reactants-products",
  });
  const decisions = Object.fromEntries(
    p.criteria.map((c) => [paperReviewKey(100, p.question.id, c.id), "1"]),
  );
  expect(reviewPart(p, response(alternative), decisions, 100).marks).toBe(3);
  const electrons = JSON.parse(by("2(a)").question.answer);
  expect(
    Number(electrons.unsharedCentre) +
      Number(electrons.centre0) +
      Number(electrons.partner0),
  ).toBe(8);
  expect(
    Number(electrons.centre0) +
      Number(electrons.partner0) +
      Number(electrons.unsharedPartner0),
  ).toBe(2);
});

test("previously disclosed exact constructions and recalled answers stay exposed in both directions while new numeric data stay independent", () => {
  for (const [number, ids] of Object.entries({
    "2(a)": ["cb-v1-p-hcl", "cb-v1-ca-hcl"],
    "2(b)": ["ps-write-v1-ca-state"],
    "2(e)": ["np-v1-p-amount", "np-v1-ra-risk"],
    "4(a)": ["ss-v1-p-method-write", "ss-v1-b-write"],
    "4(c)": ["ss-v1-p-filter-write"],
    "7(e)": ["rm-v1-ca-quantity"],
    "6(a)": ["he-v1-p-aluminium", "higher-paper-2-5"],
    "6(b)": ["he-v1-r-water", "he-v1-g-anode", "he-v1-p-hydroxide"],
    "10(a)": ["ae-v1-r-definition"],
  }))
    for (const id of ids) {
      expect(exposureIds([id])).toContain(by(number).question.id);
      expect(exposureIds([by(number).question.id])).toContain(id);
    }
  expect(by("1(b)").question.exposureAliases ?? []).toEqual([]);
  expect(by("5(b)").question.exposureAliases ?? []).toEqual([]);
  expect(by("8(b)").question.exposureAliases ?? []).toEqual([]);
});

test("independent extension endpoint is opt-in and preserves previous saved graph schemas", () => {
  const data = by("3(b)").question.fuelDrawing!.data;
  const board = emptyFuelDrawing(data);
  expect(board.extensionX).toBe("");
  board.c0 = "22.085";
  board.c5 = "25.51";
  board.extensionX = "0";
  expect(readFuelDrawing(JSON.stringify(board), data)?.extensionX).toBe("0");
  const missing = { ...board };
  delete missing.extensionX;
  expect(readFuelDrawing(JSON.stringify(missing), data)).toBeNull();
  const old = paper1FoundationFull.parts.find((p) => p.question.fuelDrawing)!
    .question.fuelDrawing!.data;
  expect(Object.hasOwn(emptyFuelDrawing(old), "extensionX")).toBe(false);
  expect(
    readFuelDrawing(JSON.stringify(emptyFuelDrawing(old)), old),
  ).not.toBeNull();
});
