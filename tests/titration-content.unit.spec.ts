import { test, expect } from "@playwright/test";
import { titrationCalculationsJourney as j } from "../src/content/journeys/titration-calculations";
import { tasks } from "../src/content/journeys/helpers";
test("all original numeric calculations are independently recomputed with named reaction factors", () => {
  const expected: Record<string, number | Record<string, number>> = {
    "w-volume": 25 / 1000,
    "w-ratio": 2,
    "r-amount": (0.1 * 20) / 1000,
    "r-titre": 22.7 - 3.2,
    "r-mass": 0.15 * 40,
    "g-titre": { titre: 21.4 - 1.4, amount: (0.1 * (21.4 - 1.4)) / 1000 },
    "g-concentration": { amount: 0.1 * 0.02, c: (0.1 * 0.02) / 0.025 },
    "g-ratio": { amount: (0.1 * 0.024) / 2, c: (0.1 * 0.024) / 2 / 0.025 },
    "g-mass": { c: (0.2 * 0.02) / 0.025, mass: ((0.2 * 0.02) / 0.025) * 40 },
    "g-volume": {
      amount: 0.05 * 0.025 * 2,
      volume: ((0.05 * 0.025 * 2) / 0.1) * 1000,
    },
    "p-reading": 24.85 - 2.35,
    "p-mean": (19.95 + 20 + 20.05) / 3,
    "p-known": 0.15 * 0.018,
    "p-one": 0.0027,
    "p-half": 0.006 / 2,
    "p-double": 0.0018 * 2,
    "p-barium": 0.0022 * 2,
    "p-hcl": (0.12 * 0.0225) / 0.025,
    "p-sulfuric": (0.15 * 0.016) / 2 / 0.02,
    "p-base": (0.1 * 0.015 * 2) / 0.025,
    "p-nitric": 4.41 / 63,
    "p-naoh-mass": 0.12 * 40,
    "p-acid-mass": 0.06 * 98,
    "p-reverse-one": ((0.16 * 0.025) / 0.2) * 1000,
    "p-reverse-two": ((0.08 * 0.02 * 2) / 0.1) * 1000,
    "ca-first": { base: 0.15 * 0.028, acid: (0.15 * 0.028) / 2 },
    "ca-c": (0.15 * 0.028) / 2 / 0.025,
    "ca-mass": ((0.15 * 0.028) / 2 / 0.025) * 98,
    "ca-volume": ((0.18 * 0.02) / 0.12) * 1000,
    "cb-first": { base: 0.125 * 0.016, acid: 0.125 * 0.016 * 2 },
    "cb-c": (0.125 * 0.016 * 2) / 0.02,
    "cb-mass": ((0.125 * 0.016 * 2) / 0.02) * 36.5,
    "cb-volume": ((0.08 * 0.015 * 2) / 0.2) * 1000,
    "ra-titre": 22.15 - 3.65,
    "ra-concentration": (0.075 * 0.024) / 0.02,
    "ra-volume": ((0.12 * 0.01 * 2) / 0.15) * 1000,
    "rb-titre": 17.05 - 0.8,
    "rb-concentration": (0.08 * 0.03) / 2 / 0.025,
    "rb-mass": 0.09 * 40,
  };
  for (const task of tasks(j)) {
    const value = expected[task.id.replace("tc-v1-", "")];
    if (task.parts) {
      expect(typeof value).toBe("object");
      for (const part of task.parts!)
        expect(Number(part.answer), task.id + "/" + part.id).toBeCloseTo(
          (value as Record<string, number>)[part.id],
          10,
        );
    } else if (!task.options && !task.rubric) {
      expect(value, task.id).toBeDefined();
      expect(Number(task.answer), task.id).toBeCloseTo(value as number, 10);
    }
  }
});
test("one lesson has unique identities distinct reserved and delayed forms and meaningful recovery", () => {
  const all = tasks(j);
  expect(all).toHaveLength(49);
  expect(new Set(all.map((t) => t.id)).size).toBe(49);
  expect(j.practice).toHaveLength(21);
  expect(j.guided).toHaveLength(5);
  for (const form of j.checkForms) expect(form).toHaveLength(5);
  for (const form of j.reviewForms) expect(form).toHaveLength(3);
  for (const q of j.practice.filter((t) => t.followUp)) {
    expect(j.refresher.some((t) => t.id === q.followUp)).toBe(true);
  }
  expect(j.practice.filter((t) => t.followUp)).toHaveLength(4);
  expect(j.checkForms[0][0].prompt).not.toBe(j.checkForms[1][0].prompt);
});
test("self review and practical/exam limits remain explicit", () => {
  expect(tasks(j).filter((t) => t.rubric)).toHaveLength(6);
  expect(j.scopeNote).toContain("self-reviewed");
  expect(j.scopeNote?.toLowerCase()).toContain("original");
  expect(j.scopeNote).toContain("Titration technique");
  expect(j.scopeNote).toContain("matching cm³");
  expect(j.scopeNote).toContain("endpoint");
});
