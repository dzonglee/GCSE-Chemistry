import { test, expect } from "@playwright/test";
import { metalReactivityJourney as j } from "../src/content/journeys/metal-reactivity";
import { tasks } from "../src/content/journeys/helpers";
test("individual metal lesson has distinct reserved forms, recoveries and honest written review", () => {
  const all = tasks(j);
  expect(all).toHaveLength(49);
  expect(new Set(all.map((q) => q.id)).size).toBe(49);
  expect(j.guided).toHaveLength(5);
  expect(j.practice).toHaveLength(21);
  for (const f of j.checkForms) expect(f).toHaveLength(5);
  for (const f of j.reviewForms) expect(f).toHaveLength(3);
  expect(all.filter((q) => q.rubric)).toHaveLength(6);
  for (const q of j.practice.filter((q) => q.followUp))
    expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
  expect(j.checkForms[0][0].prompt).not.toBe(j.checkForms[1][0].prompt);
  const expected: Record<string, number> = {
    "w-charge": 10 - 9,
    "g-series": 2,
    "p-ion": 12 - 10,
    "p-rise": 36 - 20,
    "ca-ion": 26 - 24,
    "cb-ion": 30 - 28,
    "ra-ion": 20 - 18,
    "rb-rise": 35 - 22,
  };
  for (const q of all.filter((q) => !q.options && !q.rubric)) {
    expect(expected[q.id.replace("mr-v1-", "")], q.id).toBeDefined();
    expect(Number(q.answer)).toBe(expected[q.id.replace("mr-v1-", "")]);
  }
  expect(j.scopeNote).toContain("room temperature");
  expect(j.scopeNote).toContain("partial order");
  expect(j.scopeNote).toContain("self-reviewed");
});
