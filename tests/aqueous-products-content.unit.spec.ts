import { test, expect } from "@playwright/test";
import { aqueousProductsJourney as j } from "../src/content/journeys/aqueous-products";
import { tasks } from "../src/content/journeys/helpers";
test("51 authored tasks separate assisted practice, changed cold forms, delayed retrieval and six self-reviewed responses", () => {
  const all = tasks(j);
  expect(all).toHaveLength(51);
  expect(new Set(all.map((q) => q.id)).size).toBe(51);
  expect(j.practice).toHaveLength(21);
  expect(j.refresher).toHaveLength(6);
  expect(j.guided).toHaveLength(6);
  expect(j.guided[0].openingHint).toBe(true);
  expect(j.guided.slice(1).every((q) => !q.openingHint)).toBe(true);
  expect(all.filter((q) => q.rubric)).toHaveLength(6);
  for (const form of j.checkForms) expect(form).toHaveLength(5);
  for (const form of j.reviewForms) expect(form).toHaveLength(3);
  for (const q of j.practice)
    expect(
      j.refresher.some((r) => r.id === q.followUp),
      q.id,
    ).toBe(true);
});
test("eleven numeric tasks independently recompute qualified gas ratios, graph readings and electrode mass differences", () => {
  const values: Record<string, number> = {
    "w-ratio": 2 * 5,
    "r-mass": 8 - 7.85,
    "g-graph": (8 / 16) * 8,
    "p-mass": 15 - 14.7,
    "p-graph": (8 / 16) * 12,
    "p-gas-ratio": 24 / 2,
    "a-reading": 5 + 0.2,
    "b-graph": (5 / 10) * 6,
    "ra-reading": 3 + 0.2,
    "g-reading": 4 + 2 * 0.2,
    "p-reading": 6 + 4 * 0.2,
  };
  const numeric = tasks(j).filter((q) => !q.options && !q.rubric);
  expect(numeric).toHaveLength(11);
  for (const q of numeric) {
    const v = values[q.id.replace("aqp-v1-", "")];
    expect(v, q.id).toBeDefined();
    expect(Number(q.answer)).toBeCloseTo(v, 12);
  }
});
test("Foundation board distinctions, active electrode assumptions and practical limits are explicit", () => {
  for (const phrase of [
    "Half equations",
    "separate Higher",
    "not a universal rule",
    "concentration",
    "fixed volume",
    "impure anode mass",
    "twelve atomic IDs",
    "Water, hydration shells",
    "not a CuSO4 molecule",
    "straight line through the origin",
    "qualified school supervision",
    "self-reviewed",
  ])
    expect(j.scopeNote).toContain(phrase);
  for (const q of j.checkForms.flat())
    expect(q.prompt).not.toMatch(/write.*half.equation/i);
  expect(j.checkForms[0][0].prompt).not.toBe(j.checkForms[1][0].prompt);
  expect(j.practice.find((q) => q.id === "aqp-v1-p-limits")!.answer).toContain(
    "additional evidence",
  );
});
