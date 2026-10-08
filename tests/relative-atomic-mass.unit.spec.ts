import { test, expect } from "@playwright/test";
import { relativeAtomicMassJourney as journey } from "../src/content/journeys/relative-atomic-mass";
import { tasks } from "../src/content/journeys/helpers";
import { weightedIsotopeMean } from "../src/lib/isotope-mixture";
import { mark } from "../src/lib/marking";
import {
  initialBoard,
  checkBoard,
  validHistory,
  validBoard,
} from "../src/lib/workbench";
import { decode, emptyProgress, emptyWork } from "../src/lib/progress";
test("weighted means preserve range, shift toward the abundant isotope and accept counts or percentages", () => {
  expect(weightedIsotopeMean([35, 37], [75, 25])).toBe(35.5);
  expect(weightedIsotopeMean([35, 37], [25, 75])).toBe(36.5);
  expect(weightedIsotopeMean([14, 15], [7, 3])).toBe(14.3);
  expect(weightedIsotopeMean([24, 25, 26], [70, 20, 10])).toBe(24.4);
  expect(weightedIsotopeMean([35, 37], [100, 0])).toBe(35);
  expect(weightedIsotopeMean([35, 37], [0, 100])).toBe(37);
  for (const weights of [
    [0, 0],
    [-1, 101],
    [NaN, 1],
  ])
    expect(() => weightedIsotopeMean([35, 37], weights)).toThrow();
});
test("all 37 original tasks and cold forms retain correct alternatives and honest written review", () => {
  expect(tasks(journey)).toHaveLength(37);
  const teaching = new Set(
    [
      ...journey.warmup,
      ...journey.refresher,
      ...journey.guided,
      ...journey.practice,
    ].map((q) => q.prompt),
  );
  for (const q of tasks(journey)) {
    const result = mark(q, q.answer);
    expect(q.rubric ? result.selfReview : result.correct, q.id).toBe(true);
    for (const wrong of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, wrong).correct, q.id).toBe(false);
    if (q.followUp)
      expect(
        journey.refresher.some((r) => r.id === q.followUp),
        q.id,
      ).toBe(true);
  }
  for (const q of [
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ]) {
    expect(q.model).toBeUndefined();
    expect(teaching.has(q.prompt)).toBe(false);
  }
  expect(
    mark(journey.practice[6], "half neutron average isotope"),
  ).toMatchObject({ correct: false, selfReview: true });
});
test("individually supplied tables agree with independent weighted calculations and rounding", () => {
  for (const q of tasks(journey).filter((q) => q.isotopeData)) {
    const rows = q.isotopeData!,
      total = rows.reduce((sum, row) => sum + row.abundance, 0),
      mean =
        rows.reduce((sum, row) => sum + row.mass * row.abundance, 0) / total;
    if (q.abundanceKind !== "count") expect(total, q.id).toBeCloseTo(100, 8);
    const expected =
      q.rounding?.kind === "decimal-places"
        ? Number(mean.toFixed(q.rounding.digits))
        : mean;
    expect(Number(q.answer), q.id).toBeCloseTo(expected, 8);
  }
  const working = journey.practice[8];
  expect(working.parts!.map((p) => p.answer)).toEqual([
    54 * 90,
    56 * 10,
    (54 * 90 + 56 * 10) / 100,
  ]);
});
test("rounding requires the specified precision and retains necessary zeros", () => {
  const dp = journey.practice[4],
    sf = journey.practice[5];
  expect(mark(dp, "63.6").correct).toBe(true);
  expect(mark(dp, "63.634").correct).toBe(false);
  expect(mark(dp, "63.60").correct).toBe(false);
  expect(mark(sf, "24.0").correct).toBe(true);
  expect(mark(sf, "24").correct).toBe(false);
  expect(mark(sf, "24").feedback).toContain("numerical value is right");
  expect(mark(sf, "240/10").correct).toBe(false);
  expect(mark(sf, "24.00").correct).toBe(false);
});
test("mixture histories alter only abundance and resume without changing isotope masses", () => {
  for (const q of journey.guided) {
    const model = q.model!;
    if (model.kind !== "isotope-mixture") throw Error("wrong model");
    const start = initialBoard(model),
      next = { lightPercent: model.targetPercent };
    expect(checkBoard(model, start).correct).toBe(false);
    expect(checkBoard(model, next).correct).toBe(true);
    expect(validHistory(model, [start, next])).toBe(true);
    expect(validBoard(model, { lightPercent: 76 })).toBe(false);
    expect(validBoard(model, { lightPercent: 75, mass: 35 })).toBe(false);
    const data = emptyProgress();
    data.work["relative-atomic-mass"] = {
      ...emptyWork(),
      learning: {
        version: 1,
        stage: "guided",
        index: journey.guided.indexOf(q),
      },
      taskModels: { [q.id]: [start, next] },
    };
    expect(decode(JSON.stringify(data))).toEqual(data);
  }
});
