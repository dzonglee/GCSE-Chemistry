import { test, expect } from "@playwright/test";
import { acidNeutralisationJourney as j } from "../src/content/journeys/acids-and-neutralisation";
import { tasks } from "../src/content/journeys/helpers";
test("50 unique authored demands reserve fresh checks, true delayed retrieval and six self-reviewed explanations", () => {
  const all = tasks(j).filter((q) => q.id.startsWith("an-v1-"));
  expect(all).toHaveLength(50);
  expect(new Set(all.map((q) => q.id)).size).toBe(50);
  expect(j.refresher.filter((q) => q.id.startsWith("an-v1-"))).toHaveLength(7);
  expect(j.guided.filter((q) => q.id.startsWith("an-v1-"))).toHaveLength(5);
  expect(j.practice.filter((q) => q.id.startsWith("an-v1-"))).toHaveLength(20);
  expect(all.filter((q) => q.rubric)).toHaveLength(6);
  for (const f of j.checkForms.slice(0, 2)) expect(f).toHaveLength(5);
  for (const f of j.reviewForms.slice(0, 2)) expect(f).toHaveLength(3);
  for (const q of j.practice)
    expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
  expect(j.practice.find((q) => q.id === "an-v1-p-litmus")?.followUp).toBe(
    "an-v1-r-indicator",
  );
});
test("all12 numerical values recompute ionic balance, consumed pairs and unused reactive units", () => {
  const values: Record<string, number> = {
    "w-charge": 2,
    "r-excess": 6 - 4,
    "g-pairs": Math.min(4, 4),
    "p-sodium": 2,
    "p-pairs": Math.min(7, 5),
    "p-oh-left": 8 - 3,
    "a-water": Math.min(9, 6),
    "a-left": 9 - 6,
    "b-water": Math.min(8, 11),
    "b-left": 11 - 8,
    "v-a-left": 10 - 7,
    "v-b-water": Math.min(6, 9),
  };
  const numeric = tasks(j).filter((q) => !q.options && !q.rubric);
  expect(numeric).toHaveLength(12);
  for (const q of numeric) {
    const v = values[q.id.replace("an-v1-", "")];
    expect(v, q.id).toBeDefined();
    expect(Number(q.answer), q.id).toBeCloseTo(v, 12);
  }
});
test("scientific representation and scope do not equate charge with pH or assume nitric acid gives metal hydrogen", () => {
  for (const text of [
    "electrically neutral",
    "not universally predict H2 for nitric acid",
    "one initial water",
    "water background",
    "Equal volume",
    "exact pH",
    "self-reviewed",
    "separate lessons",
  ])
    expect(j.scopeNote).toContain(text);
  expect(j.checkForms[0][0].answer).toContain("and water");
  expect(j.checkForms[0][0].prompt).not.toBe(j.checkForms[1][0].prompt);
});
