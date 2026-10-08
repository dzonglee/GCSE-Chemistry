import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import baseline from "./fixtures/energy-equation-baseline.json";
import { practicalJourney as j } from "../src/content/journeys/energy-practical";
import {
  energyEquationGuided as g,
  energyEquationRecovery as r,
  energyEquationPractice as p,
} from "../src/content/journeys/energy-linear-equation";
import { practicalRecords } from "../src/lib/energy-practical";
import { mark } from "../src/lib/marking";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
} from "../src/lib/progress";

test("all 59 original energy tasks, positions and both reserved pairs remain unchanged", () => {
  const all = [
    ...j.warmup,
    ...j.refresher,
    ...j.guided,
    ...j.practice,
    ...j.checkForms.flat(),
    ...j.reviewForms.flat(),
  ];
  expect(Object.keys(baseline.tasks)).toHaveLength(59);
  for (const [id, hash] of Object.entries(baseline.tasks))
    expect(
      createHash("sha256")
        .update(JSON.stringify(all.find((q) => q.id === id)))
        .digest("hex"),
      id,
    ).toBe(hash);
  for (const stage of ["warmup", "refresher", "guided", "practice"] as const)
    expect(
      j[stage].slice(0, baseline.stages[stage].length).map((q) => q.id),
    ).toEqual(baseline.stages[stage]);
  expect(j.checkForms.map((form) => form.map((q) => q.id))).toEqual(
    baseline.checkForms,
  );
  expect(j.reviewForms.map((form) => form.map((q) => q.id))).toEqual(
    baseline.reviewForms,
  );
  expect(j.version).toBe(1);
});

test("the equation bridge agrees with every supplied point of the existing decimal fit", () => {
  const record = practicalRecords.graph.decimal;
  expect(record.slope).toBe(1.5);
  expect(record.intercept).toBe(21.2);
  for (const [x, y] of record.points) expect(1.5 * x + 21.2).toBeCloseTo(y, 10);
  expect(g.explanation).toContain("constant gradient");
  expect(g.explanation).toContain("m means gradient, not mass");
  expect(mark(g, g.answer).correct).toBe(true);
  for (const wrong of g.options!.filter((value) => value !== g.answer))
    expect(mark(g, wrong).correct).toBe(false);
});

test("negative linear coefficients require both values and retain malformed numeric strings", () => {
  expect(p.parts!.map((part) => part.answer)).toEqual([-0.4, 23.8]);
  expect(mark(p, p.answer).correct).toBe(true);
  for (const raw of [
    '{"m":"0.4","c":"23.8"}',
    '{"m":"1..2","c":"23.8"}',
    '{"m":"-0.4","c":""}',
  ])
    expect(mark(p, raw).correct).toBe(false);
  const data = emptyProgress(),
    w = emptyWork();
  w.drafts[p.id] = '{"m":"1..2","c":"23.8"}';
  w.learning = { version: 1, stage: "practice", index: 24 };
  data.work["energy-practical"] = w;
  expect(decode(JSON.stringify(data))!.work["energy-practical"]).toEqual(w);
  expect(23.8 + -0.4 * 5).toBe(21.8);
});

test("helped equivalent teaching shares exposure without exposing the new coefficient values", () => {
  expect(exposureIds([g.id])).toContain(r.id);
  expect(exposureIds([r.id])).toContain(g.id);
  expect(exposureIds([g.id])).not.toContain(p.id);
  expect(p.followUp).toBe(r.id);
  expect(p.model).toBeUndefined();
  expect(p.rubric).toBeUndefined(); // Only the short numeric coefficient response is checked; graph/written work stays manual.
});
