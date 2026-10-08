import { test, expect } from "@playwright/test";
import type { WorkbenchState } from "../src/content/types";
import { atomicScaleJourney as journey } from "../src/content/journeys/atomic-scale";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import {
  checkBoard,
  initialBoard,
  validHistory,
  validBoard,
} from "../src/lib/workbench";
import {
  nanoToMetres,
  enlargedNucleusRadius,
  standardForm,
} from "../src/lib/atomic-scale";
import { decode, emptyProgress, emptyWork } from "../src/lib/progress";
test("tiny positive lengths reject zero and wrong magnitudes while accepting equivalent exact notation", () => {
  const q = journey.guided[0];
  for (const value of ["1e-10", "0.0000000001", "1/10000000000"])
    expect(mark(q, value).correct, value).toBe(true);
  for (const value of ["0", "1e-9", "1e-11", "-1e-10"])
    expect(mark(q, value).correct, value).toBe(false);
  for (const q of tasks(journey).filter((q) => q.tolerance === 0))
    expect(mark(q, "0").correct, q.id).toBe(false);
});
test("supplied radii, nano conversion and enlargement preserve independent dimensional relationships", () => {
  expect(nanoToMetres(0.1)).toBeCloseTo(0.0000000001, 20);
  expect(nanoToMetres(0.15)).toBeCloseTo(0.00000000015, 20);
  expect(enlargedNucleusRadius(100)).toBe(0.005);
  expect(enlargedNucleusRadius(10)).toBe(0.0005);
  expect(100 / enlargedNucleusRadius(100)).toBe(1e-10 / 5e-15);
  expect(standardForm(0.00000000025)).toEqual(["2.5", -10]);
  const reference: Record<string, number> = {
    "as-v1-p-ratio": 3e-8 / 1.5e-10,
    "as-v1-p-analogy": (50 / 25000) * 1000,
    "as-v1-ca-ratio": 2e-10 / 4e-15,
    "as-v1-cb-analogy": (60 / 30000) * 1000,
    "as-v1-ra-ratio": 6e-8 / 2e-10,
  };
  for (const [id, value] of Object.entries(reference))
    expect(Number(tasks(journey).find((q) => q.id === id)!.answer)).toBeCloseTo(
      value,
      8,
    );
});
test("standard form requires both the coefficient and exponent, and written correction stays self-reviewed", () => {
  const q = journey.practice[1];
  expect(
    mark(q, JSON.stringify({ coefficient: "2.5", power: "-10" })).correct,
  ).toBe(true);
  expect(
    mark(q, JSON.stringify({ coefficient: "25", power: "-11" })).correct,
  ).toBe(false);
  expect(mark(q, JSON.stringify({ coefficient: "2.5" })).invalid).toBe(true);
  expect(mark(journey.practice[7], "tiny nucleus mass")).toMatchObject({
    correct: false,
    selfReview: true,
  });
});
test("all 34 original scale tasks have reviewed alternatives and reserved forms", () => {
  expect(tasks(journey)).toHaveLength(34);
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
});
test("conversion and enlargement histories resume but invalid exponents and unsupplied scales are rejected", () => {
  for (const q of journey.guided) {
    const model = q.model!,
      start = initialBoard(model);
    const next: WorkbenchState =
      model.kind === "nano-convert"
        ? { exponent: -9 }
        : { radius: model.kind === "atomic-scale" ? model.targetRadius : 0 };
    expect(checkBoard(model, start).correct).toBe(false);
    expect(checkBoard(model, next).correct).toBe(true);
    expect(validHistory(model, [start, next])).toBe(true);
    const data = emptyProgress();
    data.work["atomic-scale"] = {
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
  expect(validBoard(journey.guided[0].model!, { exponent: -9.5 })).toBe(false);
  expect(validBoard(journey.guided[1].model!, { radius: 0 })).toBe(false);
});
