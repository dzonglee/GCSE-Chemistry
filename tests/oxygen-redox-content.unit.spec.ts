import { test, expect } from "@playwright/test";
import { oxygenRedoxJourney as j } from "../src/content/journeys/oxygen-redox";
import { tasks } from "../src/content/journeys/helpers";
test("one authored lesson has47 unique tasks, cold forms and conservative written responses", () => {
  const all = tasks(j);
  expect(all).toHaveLength(47);
  expect(new Set(all.map((q) => q.id)).size).toBe(47);
  expect(j.practice).toHaveLength(20);
  expect(j.guided).toHaveLength(5);
  expect(j.refresher).toHaveLength(4);
  for (const f of j.checkForms) expect(f).toHaveLength(5);
  for (const f of j.reviewForms) expect(f).toHaveLength(3);
  expect(all.filter((q) => q.rubric)).toHaveLength(6);
  for (const q of j.practice.filter((q) => q.followUp))
    expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
});
test("numerical atoms and boundary quantities independently recompute", () => {
  const expected: Record<string, number> = {
    "w-oxygen": 2,
    "r-mass": 1 - 0.6,
    "g-oxidation": 2,
    "g-mass": 0.8 - 0.48,
    "p-aluminium": 3 * 2,
    "p-nickel-count": 1,
    "p-extra-oxygen": 3,
    "p-open-gain": 2 - 1.2,
    "p-open-loss": 4 - 3.2,
    "p-apparatus": 42.5,
    "ca-count": 3,
    "ca-mass": 4 - 2.4,
    "cb-count": 2,
    "cb-mass": 5.6 - 4.8,
    "ra-mass": 1.5 - 0.9,
    "rb-count": 2,
  };
  for (const q of tasks(j).filter((q) => !q.options && !q.rubric)) {
    const value = expected[q.id.replace("or-v1-", "")];
    expect(value, q.id).toBeDefined();
    expect(Number(q.answer), q.id).toBeCloseTo(value, 12);
  }
});
test("scope keeps boundary, ionic solid, agent, model limits and electron teaching explicit", () => {
  for (const phrase of [
    "self-reviewed",
    "ionic-solid crop",
    "carbon reduction",
    "separate",
    "oxygen transferred internally",
    "acid",
    "linear molecule",
  ])
    expect(j.scopeNote?.toLowerCase()).toContain(phrase);
  expect(j.checkForms[0][0].prompt).not.toBe(j.checkForms[1][0].prompt);
  expect(j.practice.find((q) => q.id === "or-v1-p-acid")!.answer).toContain(
    "salt",
  );
});
