import { test, expect } from "@playwright/test";
import { titrationTechniqueJourney as j } from "../src/content/journeys/titration-technique";
import { tasks } from "../src/content/journeys/helpers";
test("49 authored technique tasks retain separate practice cold forms delayed retrieval and six self-reviewed explanations", () => {
  const all = tasks(j);
  expect(all).toHaveLength(49);
  expect(new Set(all.map((q) => q.id)).size).toBe(49);
  expect(j.warmup).toHaveLength(2);
  expect(j.refresher).toHaveLength(6);
  expect(j.guided).toHaveLength(5);
  expect(j.practice).toHaveLength(20);
  expect(all.filter((q) => q.rubric)).toHaveLength(6);
  for (const form of [...j.checkForms, ...j.reviewForms])
    expect(form.every((q) => !q.model)).toBe(true);
  expect(j.checkForms.map((f) => f.length)).toEqual([5, 5]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([3, 3]);
  for (const q of j.practice)
    expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
});
test("all15 numerical references independently match supplied subtraction means and final-only rounding", () => {
  const answers: Record<string, number> = {
    "w-difference": 18 - 3,
    "r-reading": 24.75 - 2.35,
    "r-mean": (19.4 + 19.5) / 2,
    "g-reading": 23.6 - 1.2,
    "g-repeats": Number(((24.1 + 24.15 + 24.1) / 3).toFixed(2)),
    "p-shift": 29.4 - 4.35,
    "p-fine": 6 + 3.5 * 0.1,
    "p-wider": (15.25 + 15.45) / 2,
    "p-selected": (22.1 + 22.15) / 2,
    "a-titre": 28.9 - 3.65,
    "a-mean": (21.3 + 21.35 + 21.4) / 3,
    "b-scale": 12.2 + 5 * 0.1,
    "b-mean": (17.25 + 17.3 + 17.35) / 3,
    "d-scale": 8 + 2.5 * 0.1,
    "e-mean": (26.45 + 26.55) / 2,
  };
  const all = tasks(j);
  expect(Object.keys(answers)).toHaveLength(15);
  for (const [id, answer] of Object.entries(answers))
    expect(
      Number(all.find((q) => q.id === "tech-v1-" + id)!.answer),
    ).toBeCloseTo(answer, 9);
});
test("Foundation practical scope does not certify boards or award written marks and original exposure remains conservative", () => {
  expect(j.scopeNote).toContain("Pearson Combined");
  expect(j.scopeNote).toContain("no universal 0.10");
  const all = tasks(j);
  expect(
    all.find((q) => q.id === "tech-v1-g-reading")!.exposureAliases,
  ).toContain("titration-practical-2");
  expect(
    all.find((q) => q.id === "tech-v1-p-rough-match")!.exposureAliases,
  ).toContain("titration-practical-5");
  expect(
    all.find((q) => q.id === "tech-v1-a-endpoint")!.exposureAliases,
  ).toContain("tech-v1-g-endpoint");
  for (const q of all.filter((q) => q.rubric))
    expect(q.options).toBeUndefined();
});

test("static fine-scale stimuli use separate practice cold and delayed readings without becoming learning models", () => {
  const demands = [
    [j.practice.find((q) => q.id === "tech-v1-p-fine")!, 6, 6.35],
    [j.checkForms[1][0], 12.2, 12.7],
    [j.reviewForms[0][0], 8, 8.25],
  ] as const;
  for (const [q, top, reading] of demands) {
    expect(q.buretteScale).toMatchObject({ top, reading });
    expect(q.model).toBeUndefined();
    expect(Number(q.answer)).toBeCloseTo(reading, 9);
    expect(reading - top).toBeGreaterThan(0);
    expect(reading - top).toBeLessThan(0.8);
    expect((reading - top) / 0.05).toBeCloseTo(
      Math.round((reading - top) / 0.05),
      8,
    );
    expect(q.buretteScale!.boundaryDescription).not.toContain(
      reading.toFixed(2),
    );
  }
});
