import { test, expect } from "@playwright/test";
import {
  yieldFromReactant,
  collectedFromReactant,
  reactantForCollected,
  yieldFromLimitedReactants,
  initialTheoryBoard,
  validTheoryBoard,
  theoryPrediction,
  type TheoryMode,
} from "../src/lib/theoretical-yield";
import { theoreticalYieldJourney as j } from "../src/content/journeys/theoretical-yield";
import { mark } from "../src/lib/marking";
test("construct same-product theoretical maximum before yield and preserve excess-value warnings", () => {
  const iron = yieldFromReactant(16, 160, 1, 56, 2, 9.8);
  expect(iron.givenAmount).toBe(0.1);
  expect(iron.requestedAmount).toBe(0.2);
  expect(iron.mass).toBeCloseTo(11.2, 12);
  expect(iron.percentage).toBeCloseTo(87.5, 12);
  expect(iron.apparentExcess).toBe(false);
  const suspect = yieldFromReactant(16, 160, 1, 56, 2, 13.44);
  expect(suspect.percentage).toBeCloseTo(120, 12);
  expect(suspect.apparentExcess).toBe(true);
  expect(yieldFromReactant(16, 160, 1, 56, 2, 0).percentage).toBe(0);
  const publisher = yieldFromReactant(1.274, 159.62, 1, 63.55, 1, 0.392);
  expect(publisher.mass).toBeCloseTo(8096270 / 15962000, 12);
  expect(publisher.percentage).toBeCloseTo(625710400 / 8096270, 10);
});
test("forward yield follows mol ratio and product molar mass rather than starting mass", () => {
  const r = collectedFromReactant(25, 100, 1, 56, 1, 80);
  expect(r.mass).toBe(14);
  expect(r.actual).toBeCloseTo(11.2, 12);
  expect(r.actual).not.toBe(25 * 0.8);
  expect(collectedFromReactant(25, 100, 1, 56, 1, 0).actual).toBe(0);
  const oxygen = collectedFromReactant(40, 32, 1, 18, 2, 84);
  expect(oxygen.mass).toBe(45);
  expect(oxygen.actual).toBeCloseTo(37.8, 12);
});
test("reverse starting requirement recovers maximum before reversing coefficients", () => {
  const salt = reactantForCollected(19, 80, 24, 1, 95, 1);
  expect(salt).toEqual({
    theoreticalProduct: 23.75,
    productAmount: 0.25,
    reactantAmount: 0.25,
    reactantGrams: 6,
  });
  const ethane = reactantForCollected(35.2, 80, 30, 2, 44, 4);
  expect(ethane.theoreticalProduct).toBe(44);
  expect(ethane.productAmount).toBe(1);
  expect(ethane.reactantAmount).toBe(0.5);
  expect(ethane.reactantGrams).toBe(15);
  for (const [actual, pct] of [
    [19, 0],
    [0, 80],
    [19, 101],
    [-1, 80],
    [19, Infinity],
  ])
    expect(() => reactantForCollected(actual, pct, 24, 1, 95, 1)).toThrow();
});
test("compare possible products from both supplies without flooring fractional mol", () => {
  const al = yieldFromLimitedReactants(
    [270, 1000],
    [27, 160],
    [2, 1],
    56,
    2,
    420,
  );
  expect(al.limiting).toEqual([0]);
  expect(al.theoreticalMass).toBe(560);
  expect(al.percentage).toBe(75);
  expect(al.remaining[1]).toBe(1.25);
  const oxide = yieldFromLimitedReactants(
    [540, 800],
    [27, 160],
    [2, 1],
    56,
    2,
    448,
  );
  expect(oxide.limiting).toEqual([1]);
  expect(oxide.theoreticalMass).toBe(560);
  expect(oxide.percentage).toBe(80);
  const reference = yieldFromLimitedReactants(
    [1000, 3000],
    [27, 160],
    [2, 1],
    56,
    2,
    1800,
  );
  expect(reference.limiting).toEqual([0]);
  expect(reference.theoreticalMass).toBeCloseTo(2074.074074074074, 10);
  expect(reference.percentage).toBeCloseTo(86.78571428571429, 10);
  expect(yieldFromReactant(8, 32, 1, 18, 2, 8).mass).toBe(9);
  expect(() =>
    yieldFromLimitedReactants([0, 10], [27, 160], [2, 1], 56, 2, 0),
  ).toThrow();
});
test("invalid masses and yield factors cannot create a comparable theoretical result", () => {
  for (const mass of [0, -1, Infinity, NaN])
    expect(() => yieldFromReactant(mass, 160, 1, 56, 2, 9.8)).toThrow();
  for (const actual of [-1, NaN, Infinity])
    expect(() => yieldFromReactant(16, 160, 1, 56, 2, actual)).toThrow();
  for (const pct of [-1, 101, NaN, Infinity])
    expect(() => collectedFromReactant(25, 100, 1, 56, 1, pct)).toThrow();
  expect(() =>
    yieldFromLimitedReactants([270, 1000], [27, 160], [2, 1], 0, 2, 420),
  ).toThrow();
});
test("every native step requires explicit matching quantities and strict persisted choices", () => {
  for (const mode of [
    "maximum",
    "percentage",
    "collected",
    "required",
    "limited",
  ] as TheoryMode[]) {
    const b = initialTheoryBoard(mode);
    expect(validTheoryBoard(mode, b)).toBe(true);
    expect(theoryPrediction(mode, b).correct).toBe(false);
    expect(validTheoryBoard(mode, { ...b, extra: "x" })).toBe(false);
    const key = Object.keys(b)[0];
    expect(validTheoryBoard(mode, { ...b, [key]: null })).toBe(false);
  }
  const max = {
    sample: "standard",
    grams: "14",
    reactantAmount: "0.5",
    productAmount: "1",
    theoretical: "17",
  };
  expect(theoryPrediction("maximum", max).correct).toBe(true);
  expect(
    theoryPrediction("maximum", { ...max, productAmount: "0.5" }).correct,
  ).toBe(false);
  expect(validTheoryBoard("maximum", { ...max, grams: 14 })).toBe(false);
  expect(
    theoryPrediction("percentage", {
      sample: "standard",
      reactantAmount: "0.1",
      productAmount: "0.2",
      theoretical: "11.2",
      percentage: "87.5",
    }).correct,
  ).toBe(true);
  expect(
    theoryPrediction("collected", {
      sample: "standard",
      reactantAmount: "0.25",
      theoretical: "14",
      factor: "0.8",
      actual: "11.2",
    }).correct,
  ).toBe(true);
  expect(
    theoryPrediction("required", {
      sample: "standard",
      factor: "0.8",
      theoretical: "23.75",
      productAmount: "0.25",
      reactantMass: "6",
    }).correct,
  ).toBe(true);
  expect(
    theoryPrediction("limited", {
      sample: "aluminium",
      fromAl: "10",
      fromOxide: "12.5",
      limiting: "Al",
      theoretical: "560",
      percentage: "75",
    }).correct,
  ).toBe(true);
});
test("49 authored tasks use independent numerical references, final precision and honest written review", () => {
  expect([
    j.warmup.length,
    j.refresher.length,
    j.guided.length,
    j.practice.length,
    j.checkForms.flat().length,
    j.reviewForms.flat().length,
  ]).toEqual([2, 5, 5, 21, 10, 6]);
  const all = [
    ...j.warmup,
    ...j.refresher,
    ...j.guided,
    ...j.practice,
    ...j.checkForms.flat(),
    ...j.reviewForms.flat(),
  ];
  expect(new Set(all.map((q) => q.id)).size).toBe(49);
  const find = (id: string) => all.find((q) => q.id === `ty-v1-${id}`)!;
  const refs: Record<string, number> = {
    "p-percentage": (8.96 / ((20 / 100) * 56)) * 100,
    "p-precision": Number(((2.37 / ((0.75 / 24) * 95)) * 100).toPrecision(3)),
    "p-oxygen": (((51 / 102) * 3) / 2) * 32,
    "ca-percentage": (12.936 / ((30 / 100) * 56)) * 100,
    "ca-collected": (40 / 32) * 2 * 18 * 0.84,
    "ca-required": (3.81 / 0.6 / 63.5) * 79.5,
    "cb-percentage": (5.6 / ((10 / 160) * 2 * 56)) * 100,
    "cb-collected": (2.4 / 24) * 95 * 0.86,
    "cb-required": (((35.2 / 0.8 / 44) * 2) / 4) * 30,
    "ra-maximum": (7 / 28) * 2 * 17,
    "ra-percentage": (4.48 / ((10 / 100) * 56)) * 100,
    "ra-collected": (1.2 / 24) * 95 * 0.8,
    "rb-maximum": (((68 / 102) * 3) / 2) * 32,
    "rb-percentage": (2.52 / ((4 / 160) * 2 * 56)) * 100,
    "rb-required": (22.4 / 0.8 / 56) * 100,
  };
  for (const [id, value] of Object.entries(refs)) {
    expect(Number(find(id).answer), id).toBeCloseTo(value, 10);
    expect(mark(find(id), find(id).answer).correct).toBe(true);
  }
  const structured: Record<string, Record<string, number>> = {
    "ca-maximum": { amount: 3 / 24, mass: (3 / 24) * 95 },
    "cb-maximum": { amount: 6.5 / 65, mass: (6.5 / 65) * 136 },
    "p-active": {
      active: 20 * 0.8,
      theoretical: ((20 * 0.8) / 100) * 56,
      percentage: (8.064 / (((20 * 0.8) / 100) * 56)) * 100,
    },
    "p-inventory": {
      iron: (5.4 / 27) * 56,
      alumina: (5.4 / 27 / 2) * 102,
      unused: 32 - (5.4 / 27 / 2) * 160,
      total: 5.4 + 32,
    },
    "p-suspect": {
      theoretical: (16 / 160) * 2 * 56,
      apparent: (14.56 / ((16 / 160) * 2 * 56)) * 100,
      dry: (10.08 / ((16 / 160) * 2 * 56)) * 100,
    },
  };
  for (const [id, fields] of Object.entries(structured))
    for (const [key, value] of Object.entries(fields))
      expect(
        Number(JSON.parse(find(id).answer)[key]),
        `${id}:${key}`,
      ).toBeCloseTo(value, 10);
  expect(mark(find("p-precision"), "79.8315789").correct).toBe(false);
  expect(mark(find("p-precision"), "79.0").correct).toBe(false);
  expect(all.filter((q) => q.rubric)).toHaveLength(4);
  for (const q of all.filter((q) => q.rubric))
    expect(mark(q, q.answer).correct).toBe(false);
});
import { lessons } from "../src/content/curriculum";
import { assessments } from "../src/content/assessments";
import { initialBoard, validHistory } from "../src/lib/workbench";
import {
  emptyProgress,
  emptyWork,
  decode,
  exposureIds,
} from "../src/lib/progress";
test("new Higher separate route preserves legacy identities, conservative prior facts and valid saved model histories", () => {
  const lesson = lessons.find((l) => l.slug === "theoretical-yield")!;
  expect(lesson.tier).toBe("higher");
  expect(lesson.course).toBe("separate");
  expect(lesson.prerequisite).toBe("limiting-reactants");
  const original = [
    ...lessons.flatMap((l) => [...l.questions, ...l.checks]),
    ...assessments.flatMap((a) => a.questions),
  ].map((q) => q.id);
  expect(original).toHaveLength(532);
  expect(new Set(original).size).toBe(532);
  const p = emptyProgress(),
    w = emptyWork();
  w.taskModels = {};
  for (const q of j.guided) {
    const b = initialBoard(q.model!);
    expect(validHistory(q.model!, [b])).toBe(true);
    expect(validHistory(q.model!, [])).toBe(false);
    expect(validHistory(q.model!, [b, b])).toBe(false);
    w.taskModels[q.id] = [b];
  }
  p.work[lesson.slug] = w;
  expect(decode(JSON.stringify(p))).toEqual(p);
  w.taskModels["ty-v1-g-maximum"] = [
    { ...initialTheoryBoard("maximum"), grams: 14 },
  ];
  expect(decode(JSON.stringify(p))).toBeNull();
  expect(exposureIds(["rm-v1-g-forward"])).toContain("ty-v1-g-maximum");
  expect(exposureIds(["rm-v1-p-ammonia"])).toContain("ty-v1-ra-maximum");
  expect(exposureIds(["rm-v1-g-forward"])).not.toContain("ty-v1-ca-maximum");
});
