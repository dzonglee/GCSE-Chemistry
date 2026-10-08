import { test, expect } from "@playwright/test";
import { groupOneJourney as journey } from "../src/content/journeys/group-one";
import { tasks } from "../src/content/journeys/helpers";
import {
  alkaliMetals,
  alkaliEvidence,
  waterEquationCounts,
} from "../src/lib/alkali";
import {
  checkBoard,
  initialBoard,
  validBoard,
  validHistory,
} from "../src/lib/workbench";
import { mark, canonicalAnswer } from "../src/lib/marking";
import { decode, emptyProgress, emptyWork } from "../src/lib/progress";
test("reaction partners determine products and first-three evidence is bounded, with one outer electron", () => {
  for (const metal of ["lithium", "sodium", "potassium"] as const) {
    expect(alkaliMetals[metal].shells.at(-1)).toBe(1);
    expect(alkaliMetals[metal].shells.reduce((a, b) => a + b, 0)).toBe(
      alkaliMetals[metal].z,
    );
    expect(alkaliEvidence(metal, "water").products).toBe(
      `${metal} hydroxide + hydrogen`,
    );
    expect(alkaliEvidence(metal, "chlorine").products).toBe(
      `${metal} chloride`,
    );
    expect(alkaliEvidence(metal, "oxygen").interpretation).toContain(
      "not assert a universal M₂O",
    );
  }
  expect(alkaliMetals.lithium.observation).toContain("does not melt");
  expect(alkaliMetals.potassium.observation).toContain("depends on conditions");
  expect([
    alkaliMetals.lithium.meltingPoint,
    alkaliMetals.sodium.meltingPoint,
    alkaliMetals.potassium.meltingPoint,
  ]).toEqual([181, 98, 63]);
});
test("water ledger counts hydroxide and hydrogen separately, rejects zeros and accepts balanced multiples", () => {
  expect(waterEquationCounts([1, 1, 1, 1])).toEqual({
    left: { metal: 1, oxygen: 1, hydrogen: 2 },
    right: { metal: 1, oxygen: 1, hydrogen: 3 },
  });
  expect(waterEquationCounts([2, 2, 2, 1])).toEqual({
    left: { metal: 2, oxygen: 2, hydrogen: 4 },
    right: { metal: 2, oxygen: 2, hydrogen: 4 },
  });
  for (const cs of [
    [1, 1, 1],
    [2, 2, 2, 1.5],
    [7, 2, 2, 1],
    [NaN, 2, 2, 1],
  ])
    expect(() => waterEquationCounts(cs)).toThrow();
  const model = journey.guided[2].model!;
  expect(checkBoard(model, initialBoard(model)).correct).toBe(false);
  expect(
    checkBoard(model, { metal: 0, water: 0, hydroxide: 0, hydrogen: 0 })
      .correct,
  ).toBe(false);
  expect(
    checkBoard(model, { metal: 2, water: 2, hydroxide: 2, hydrogen: 1 })
      .correct,
  ).toBe(true);
  expect(
    checkBoard(model, { metal: 4, water: 4, hydroxide: 4, hydrogen: 2 }),
  ).toMatchObject({
    correct: true,
    feedback: expect.stringContaining("simplest"),
  });
  expect(
    validBoard(model, { metal: 2, water: 2, hydroxide: 2, hydrogen: -1 }),
  ).toBe(false);
});
test("reaction evidence selection and ion transformations resume with strict scientific invariants", () => {
  const q = journey.guided[0],
    model = q.model!,
    start = initialBoard(model),
    next = { ...start, metal: "potassium" };
  expect(checkBoard(model, start).correct).toBe(false);
  expect(checkBoard(model, next).correct).toBe(true);
  expect(validBoard(model, { metal: "rubidium", partner: "water" })).toBe(
    false,
  );
  expect(validHistory(model, [start, next])).toBe(true);
  expect(
    validHistory(model, [start, { metal: "potassium", partner: "oxygen" }]),
  ).toBe(false);
  const data = emptyProgress();
  data.work["group-reactions"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "guided", index: 0 },
    taskModels: { [q.id]: [start, next] },
  };
  expect(decode(JSON.stringify(data))).toEqual(data);
  const ion = journey.guided[3].model!;
  expect(checkBoard(ion, { p: 3, n: 4, e: 2 }).correct).toBe(true);
  expect(validBoard(ion, { p: 2, n: 4, e: 2 })).toBe(false);
});
test("all 46 tasks retain distinct reserved forms, targeted feedback and honest written review", () => {
  expect(tasks(journey)).toHaveLength(46);
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
  expect(journey.practice.at(-1)!.options).toBeUndefined();
  const teaching = new Set(
    [
      ...journey.warmup,
      ...journey.refresher,
      ...journey.guided,
      ...journey.practice,
    ].map((q) => q.prompt),
  );
  for (const q of [
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ]) {
    expect(q.model).toBeUndefined();
    expect(teaching.has(q.prompt)).toBe(false);
  }
  expect(
    mark(journey.practice.at(-1)!, "shielding distance lost"),
  ).toMatchObject({ correct: false, selfReview: true });
});

test("trend prediction accepts a justified interval and never represents one example as the only expected answer", () => {
  const q = journey.practice.find((q) => q.id === "g1-v1-p-melting")!;
  for (const value of ["29.1", "40", "52.5", "62.9"])
    expect(mark(q, value).correct, value).toBe(true);
  for (const value of ["29", "63", "15", "110"])
    expect(mark(q, value).correct, value).toBe(false);
  for (const value of ["NaN", "Infinity", "40°C"])
    expect(mark(q, value).invalid, value).toBe(true);
  expect(canonicalAnswer(q)).toContain("strictly between 29 and 63");
  expect(canonicalAnswer(q)).toContain("for example");
  const cold = journey.checkForms[1][2];
  expect(mark(cold, "85").correct).toBe(true);
  expect(mark(cold, "150").correct).toBe(false);
});
