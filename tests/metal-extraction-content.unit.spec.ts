import { test, expect } from "@playwright/test";
import { metalExtractionJourney as j } from "../src/content/journeys/metal-extraction";
import { tasks } from "../src/content/journeys/helpers";
test("48 individually authored tasks keep practice, cold checks and delayed review distinct", () => {
  const all = tasks(j);
  expect(all).toHaveLength(48);
  expect(new Set(all.map((q) => q.id)).size).toBe(48);
  expect(j.practice).toHaveLength(20);
  expect(j.refresher).toHaveLength(5);
  expect(j.guided).toHaveLength(5);
  expect(all.filter((q) => q.rubric)).toHaveLength(6);
  for (const f of j.checkForms) expect(f).toHaveLength(5);
  for (const f of j.reviewForms) expect(f).toHaveLength(3);
  for (const q of j.practice)
    expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
});
test("all twenty numerical demands independently recompute ore, oxide, metal and actual output", () => {
  const values: Record<string, number> = {
    "w-percent": 50 * 0.2,
    "r-fraction": (64 / 80) * 100,
    "r-unit": 90 / 30,
    "g-grade": (100 * 0.25 * 64) / 80,
    "p-cuo": 3,
    "p-oxide": 150 * 0.2,
    "p-metal": (30 * 56) / 80,
    "p-aloxide": 40 * 0.38,
    "p-iron": (200 * 0.3 * 112) / 160,
    "p-cost": 120 / 24,
    "p-emission": 18 / 30,
    "a-oxide": 80 * 0.35,
    "a-metal": (28 * 3) / 4,
    "a-cost": 81 / 18,
    "b-oxide": 120 * 0.15,
    "b-metal": (18 * 5) / 6,
    "b-cost": 72 / 16,
    "v-a-grade": 60 * 0.5 * 0.8,
    "v-b-grade": (90 * 0.2 * 2) / 3,
    "v-b-cost": 84 / 21,
  };
  const numeric = tasks(j).filter((q) => !q.options && !q.rubric);
  expect(numeric).toHaveLength(20);
  for (const q of numeric) {
    const v = values[q.id.replace("me-v1-", "")];
    expect(v, q.id).toBeDefined();
    expect(Number(q.answer), q.id).toBeCloseTo(v, 12);
  }
});
test("chemical and qualification limits are explicit without certifying broad extraction coverage", () => {
  for (const phrase of [
    "not necessarily pure",
    "not a universal claim",
    "actual recovered mass",
    "Higher",
    "separate lessons",
    "self-reviewed",
    "not particles",
    "cryolite",
  ])
    expect(j.scopeNote).toContain(phrase);
  expect(j.practice.find((q) => q.id === "me-v1-p-prepare")!.answer).toContain(
    "ZnO",
  );
  expect(j.practice.find((q) => q.id === "me-v1-p-neither")!.answer).toBe(
    "Neither route",
  );
  expect(j.checkForms[0][0].prompt).not.toBe(j.checkForms[1][0].prompt);
});
