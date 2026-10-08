import { test, expect } from "@playwright/test";
import { solubleSaltsJourney as j } from "../src/content/journeys/making-soluble-salts";
import { tasks } from "../src/content/journeys/helpers";
test("49 authored demands reserve both independent forms, genuine retrieval and six written self-reviews", () => {
  const all = tasks(j);
  expect(all).toHaveLength(49);
  expect(new Set(all.map((q) => q.id)).size).toBe(49);
  expect(j.refresher).toHaveLength(6);
  expect(j.guided).toHaveLength(5);
  expect(j.practice).toHaveLength(20);
  expect(all.filter((q) => q.rubric)).toHaveLength(6);
  for (const f of j.checkForms) expect(f).toHaveLength(5);
  for (const f of j.reviewForms) expect(f).toHaveLength(3);
  for (const q of j.practice)
    expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
});
test("ten numeric answers independently scale supplied capacities and subtract only available salt", () => {
  const values: Record<string, number> = {
    "r-cooling": (32 * 50) / 100,
    "g-cooling": 40 - (32 * 50) / 100,
    "p-capacity": (32 * 25) / 100,
    "p-crystals": 20 - 8,
    "p-unsaturated": Math.max(0, 10 - (32 * 50) / 100),
    "p-larger": 60 - (32 * 75) / 100,
    "a-crystals": 48 - (30 * 60) / 100,
    "b-crystals": 35 - (25 * 40) / 100,
    "ra-mass": 27 - (20 * 30) / 100,
    "rb-mass": 44 - (30 * 80) / 100,
  };
  const numeric = tasks(j).filter((q) => !q.options && !q.rubric);
  expect(numeric).toHaveLength(10);
  for (const q of numeric) {
    const value = values[q.id.replace("ss-v1-", "")];
    expect(value, q.id).toBeDefined();
    expect(Number(q.answer), q.id).toBeCloseTo(value, 12);
  }
});

test("method explanations preserve logical sequence, named reagents and distinct impurity removal", () => {
  const method = j.practice.find((q) => q.id === "ss-v1-p-method-write")!;
  for (const phrase of [
    "magnesium oxide",
    "sulfuric acid",
    "in excess",
    "Filter",
    "evaporating basin",
    "water bath or electric heater",
    "cooling",
    "pat dry",
  ])
    expect(method.answer).toContain(phrase);
  expect(method.answer.indexOf("Filter")).toBeLessThan(
    method.answer.indexOf("Concentrate"),
  );
  expect(method.answer.indexOf("cooling")).toBeLessThan(
    method.answer.indexOf("pat dry"),
  );
  expect(
    j.practice.find((q) => q.id === "ss-v1-p-dry")!.misconceptions,
  ).toHaveProperty("Strongly heat to drive off every water molecule");
  for (const phrase of [
    "anhydrous KNO3",
    "equilibrium crystallisation",
    "macroscopic",
    "not copper sulfate hydrate",
    "Pearson",
    "separate lesson",
    "self-reviewed",
  ])
    expect(j.scopeNote).toContain(phrase);
});
