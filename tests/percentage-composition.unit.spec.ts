import { test, expect } from "@playwright/test";
import {
  compositionCases,
  compositionData,
  roundOne,
  initialCompositionBoard,
  validCompositionBoard,
  compositionPrediction,
} from "../src/lib/percentage-composition";
import { compositionJourney as journey } from "../src/content/journeys/percentage-composition";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { exposureIds } from "../src/lib/progress";
test("complete chemical contributions differ from atom fractions and preserve unrounded composition totals", () => {
  const mg = compositionData("MgO", { Mg: 24, O: 16 }, "Mg");
  expect(mg.percent).toBe(60);
  expect(mg.atomPercent).toBe(50);
  const co = compositionData("CO2", { C: 12, O: 16 }, "O");
  expect(co.contribution).toBe(32);
  expect(co.total).toBe(44);
  expect(co.percent).toBeCloseTo(72.7272727273);
  expect(co.atomPercent).toBeCloseTo(66.6666666667);
  expect(roundOne(co.percent)).toBe(72.7);
  for (const spec of Object.values(compositionCases)) {
    const sample = compositionData(
      spec.formula,
      spec.ar,
      Object.keys(spec.ar)[0],
    );
    expect(
      sample.rows.reduce(
        (s, r) => s + (r.contribution / sample.total) * 100,
        0,
      ),
    ).toBeCloseTo(100, 10);
    expect(sample.rows.every((r) => r.contribution > 0)).toBe(true);
  }
  const n = compositionData("NH4NO3", { N: 14, H: 1, O: 16 }, "N");
  expect(n.count).toBe(2);
  expect(n.percent).toBe(35);
  expect(() => compositionData("MgO", { Mg: 24, O: 16 }, "N")).toThrow();
  expect(() => roundOne(NaN)).toThrow();
});
test("strict complete predictions reject atom-count bases missing named atoms and changing pure composition", () => {
  for (const mode of [
    "contribution",
    "count-mass",
    "sample",
    "compare",
  ] as const) {
    const b = initialCompositionBoard(mode);
    expect(validCompositionBoard(mode, b)).toBe(true);
    expect(validCompositionBoard(mode, { ...b, extra: 1 })).toBe(false);
    expect(compositionPrediction(mode, b).correct).toBe(false);
  }
  for (const compound of ["CaCO3", "MgO", "CO2"] as const) {
    const spec = compositionCases[compound],
      d = compositionData(spec.formula, spec.ar, spec.element);
    const b = {
      compound,
      numerator: String(d.contribution),
      denominator: String(d.total),
      percent: String(roundOne(d.percent)),
    };
    expect(compositionPrediction("contribution", b).correct).toBe(true);
    expect(
      compositionPrediction("contribution", { ...b, numerator: "1" }).correct,
    ).toBe(false);
  }
  for (const compound of ["MgO", "CO2"] as const) {
    const spec = compositionCases[compound],
      d = compositionData(spec.formula, spec.ar, spec.element);
    expect(
      compositionPrediction("count-mass", {
        compound,
        basis: "mass",
        percent: String(roundOne(d.percent)),
      }).correct,
    ).toBe(true);
    expect(
      compositionPrediction("count-mass", {
        compound,
        basis: "count",
        percent: String(roundOne(d.atomPercent)),
      }).correct,
    ).toBe(false);
  }
  for (const sample of [10, 25, 50]) {
    expect(
      compositionPrediction("sample", {
        sample,
        elementMass: String(sample * 0.4),
        percent: "40",
      }).correct,
    ).toBe(true);
    expect(
      compositionPrediction("sample", {
        sample,
        elementMass: String(sample * 0.4),
        percent: String(sample * 0.4),
      }).correct,
    ).toBe(false);
  }
  expect(
    compositionPrediction("compare", {
      element: "N",
      winner: "urea",
      basis: "mass",
    }).correct,
  ).toBe(true);
  expect(
    compositionPrediction("compare", {
      element: "O",
      winner: "nitrate",
      basis: "mass",
    }).correct,
  ).toBe(true);
  expect(
    compositionPrediction("compare", {
      element: "O",
      winner: "nitrate",
      basis: "count",
    }).correct,
  ).toBe(false);
  expect(
    validCompositionBoard("sample", {
      sample: "25",
      elementMass: "10",
      percent: "40",
    }),
  ).toBe(false);
});
test("forty-nine original tasks separate chemical working rounding scaling and ungraded explanations", () => {
  const all = tasks(journey);
  expect(all).toHaveLength(49);
  expect(journey.practice).toHaveLength(22);
  expect(new Set(all.map((q) => q.id)).size).toBe(49);
  for (const q of all) {
    expect(mark(q, q.answer).correct).toBe(!q.rubric);
    if (q.rubric) expect(mark(q, q.answer).selfReview).toBe(true);
    for (const wrong of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, wrong).correct).toBe(false);
  }
  for (const q of [
    ...journey.warmup,
    ...journey.refresher,
    ...journey.guided,
    ...journey.practice,
  ])
    expect(journey.refresher.some((r) => r.id === q.followUp)).toBe(true);
  const l = lessons.find((l) => l.slug === "percentage-composition")!;
  expect(l.prerequisite).toBe("formulae-and-mass");
  expect(l.course).toBe("combined");
  expect(l.questions).toEqual([]);
  expect(l.checks).toEqual([]);
  expect(exposureIds(["pc-v1-ca-whole"])).toContain("pc-v1-g-contribution");
  for (const q of journey.guided) {
    const b = initialBoard(q.model!);
    expect(validHistory(q.model!, [b])).toBe(true);
    expect(validHistory(q.model!, [b, b])).toBe(false);
  }
});
test("independent working rejects omitted oxygen while final percentage checks actual requested precision", () => {
  const working = journey.practice.find((q) => q.parts)!;
  expect(
    mark(working, JSON.stringify({ count: "1", part: "16", whole: "44" }))
      .correct,
  ).toBe(false);
  const q = journey.practice.find((q) => q.id === "pc-v1-p-rounded-oxygen")!;
  expect(mark(q, "72.7").correct).toBe(true);
  for (const raw of ["72.7272727", "72.70", "0.727", "66.7", "73"])
    expect(mark(q, raw).correct).toBe(false);
  expect(
    mark(
      journey.practice.find((q) => q.id === "pc-v1-p-kg")!,
      "0.13",
    ).correct,
  ).toBe(false);
});
