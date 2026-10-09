import { test, expect } from "@playwright/test";
import { electrolysisJourney as j } from "../src/content/journeys/electrolysis";
import { tasks } from "../src/content/journeys/helpers";
test("67 individually authored demands reserve full explanations, changed cold forms and delayed retrieval", () => {
  const all = tasks(j);
  expect(all).toHaveLength(67);
  expect(new Set(all.map((q) => q.id)).size).toBe(67);
  expect(j.practice).toHaveLength(22);
  expect(j.guided).toHaveLength(7);
  expect(j.guided[0].openingHint).toBe(true);
  expect(j.guided.slice(1).every((q) => !q.openingHint)).toBe(true);
  expect(j.refresher).toHaveLength(8);
  expect(all.filter((q) => q.rubric)).toHaveLength(20);
  expect(j.checkForms.map((f) => f.length)).toEqual([5, 5, 3, 3]);
  for (const f of j.reviewForms) expect(f).toHaveLength(3);
  for (const q of j.practice)
    expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
});
test("eight numeric values independently recompute charge balance, diatomic grouping and supplied mass conservation", () => {
  const values: Record<string, number> = {
    "w-charge": 2,
    "r-pairs": 8 / 2,
    "p-pairs": 14 / 2,
    "p-mass": 3 + 8,
    "a-pairs": 18 / 2,
    "b-mass": 6 + 16,
    "ra-pairs": 10 / 2,
    "rb-mass": 1.5 + 4,
  };
  const numeric = tasks(j).filter((q) => !q.options && !q.rubric);
  expect(numeric).toHaveLength(8);
  for (const q of numeric) {
    const v = values[q.id.replace("el-v1-", "")];
    expect(v, q.id).toBeDefined();
    expect(Number(q.answer), q.id).toBeCloseTo(v, 12);
  }
});
test("Foundation scope keeps half equations separate and preserves distinct molten, aqueous and industrial assumptions", () => {
  for (const phrase of [
    "not their defining property",
    "not microscopic straight paths",
    "not a ZnCl2 molecule",
    "Higher",
    "visibly bold Pearson",
    "water is absent",
    "heating remain needed",
    "exclusively CO2",
    "self-reviewed",
  ])
    expect(j.scopeNote).toContain(phrase);
  for (const q of j.checkForms.flat())
    expect(q.prompt).not.toMatch(/write.*half.equation/i);
  expect(j.checkForms[0][0].prompt).not.toBe(j.checkForms[1][0].prompt);
  expect(j.practice.find((q) => q.id === "el-v1-p-carbon")!.answer).toContain(
    "consumed",
  );
});
