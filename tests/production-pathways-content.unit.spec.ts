import { test, expect } from "@playwright/test";
import { productionPathwaysJourney as j } from "../src/content/journeys/production-pathways";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
test("49 individually authored tasks cover distinct comparisons and never machine-mark written justification", () => {
  expect([
    j.warmup.length,
    j.refresher.length,
    j.guided.length,
    j.practice.length,
    j.checkForms.flat().length,
    j.reviewForms.flat().length,
  ]).toEqual([2, 5, 5, 21, 10, 6]);
  const all = tasks(j);
  expect(new Set(all.map((q) => q.id)).size).toBe(49);
  for (const q of all) {
    if (q.rubric) {
      expect(q.options).toBeUndefined();
      expect(mark(q, q.answer).correct).toBe(false);
      expect(q.rubric.length).toBeGreaterThanOrEqual(3);
    } else {
      expect(mark(q, q.answer).correct, q.id).toBe(true);
      expect(
        mark(
          q,
          q.parts ? "{}" : (q.options?.find((v) => v !== q.answer) ?? "-912"),
        ).correct,
        q.id,
      ).toBe(false);
    }
  }
  expect(j.checkForms.map((f) => f.filter((q) => !q.rubric).length)).toEqual([
    4, 4,
  ]);
  expect(j.guided.map((q) => q.model?.kind)).toEqual(
    Array(5).fill("production-pathways"),
  );
  expect(j.guided[0].openingHint).toBe(true);
  expect(j.guided.slice(1).some((q) => q.openingHint)).toBe(false);
});
test("every numeric and multipart answer has an independently calculated quantity reference", () => {
  const find = (id: string) => tasks(j).find((q) => q.id === `pp-v1-${id}`)!;
  const numbers: Record<string, number> = {
    "w-yield": 50 * 0.8,
    "w-rate": 36 / 3,
    "r-fraction": 80 * 0.5,
    "r-rate": 90 / 3,
    "r-cost": 100 + (12 - 5) * 2 - 5 * 4,
    "p-scaled": 54 / 2,
    "p-minute-rate": 27 / (45 / 60),
    "p-unit-cost": (160 + (20 - 8) * 2 - 8 * 4) / 100,
    "ca-throughput": 32 / (40 / 60),
    "ca-cost": (172 + (24 - 6) * 3 - 6 * 5) / 100,
    "cb-throughput": 81 / 1.5,
    "cb-cost": 210 + (30 - 12) * 3 - 12 * 5,
    "ra-output": 70 * 0.6,
    "ra-rate": 72 / 2.25,
    "ra-cost": 90 + (16 - 4) * 1 - 4 * 3,
    "rb-output": 85 * 0.8,
    "rb-rate": 20 / (25 / 60),
  };
  for (const [id, ref] of Object.entries(numbers))
    expect(Number(find(id).answer), id).toBeCloseTo(ref, 10);
  const parts: Record<string, Record<string, number>> = {
    "g-output": { a: 80 * 0.5, b: 60 * 0.9 },
    "g-throughput": { a: 90 / 3, b: 64 / 1 },
    "g-byproducts": { a: 120 + 10 * 2, b: 130 - 25 * 3 },
    "g-conditions": { equilibrium: 45, rate: 45 / 1 },
    "p-output": { a: 70 * 0.8, b: 90 * 0.6 },
    "p-rates": { a: 84 / 2, b: 120 / 4 },
    "p-supply-conditions": { cool: 30 / 3, warm: 42 / 1 },
    "p-sale": { waste: 20 - 8, cost: 160 + (20 - 8) * 2 - 8 * 4 },
    "ca-output": { a: 75 * 0.64, b: 90 * 0.5 },
    "cb-output": { a: 120 * 0.55, b: 100 * 0.72 },
  };
  for (const [id, refs] of Object.entries(parts)) {
    const q = find(id);
    const a = JSON.parse(q.answer);
    expect(q.parts!.map((v) => v.id).sort()).toEqual(Object.keys(refs).sort());
    for (const [key, ref] of Object.entries(refs))
      expect(Number(a[key]), `${id}:${key}`).toBeCloseTo(ref, 10);
  }
  for (const q of tasks(j).filter((q) => !q.options && !q.rubric))
    expect(
      q.parts ? parts[q.id.slice(6)] : numbers[q.id.slice(6)],
      q.id,
    ).toBeDefined();
});
import { lessons } from "../src/content/curriculum";
import { assessments } from "../src/content/assessments";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { emptyProgress, emptyWork, decode } from "../src/lib/progress";
test("Higher separate route retains original identities and strict canonical histories for all five comparisons", () => {
  const lesson = lessons.find((l) => l.slug === "production-pathways")!;
  expect(lesson.tier).toBe("higher");
  expect(lesson.course).toBe("separate");
  expect(lesson.prerequisite).toBe("atom-economy");
  expect(lesson.questions).toHaveLength(0);
  expect(lesson.checks).toHaveLength(0);
  const original = [
    ...lessons.flatMap((l) => [...l.questions, ...l.checks]),
    ...assessments.flatMap((a) => a.questions),
  ].map((q) => q.id);
  expect(original).toHaveLength(532);
  expect(new Set(original).size).toBe(532);
  const p = emptyProgress(),
    w = emptyWork();
  w.taskModels = {};
  for (const q of j.guided) {
    const b = initialBoard(q.model!);
    expect(validHistory(q.model!, [b])).toBe(true);
    expect(validHistory(q.model!, [])).toBe(false);
    expect(validHistory(q.model!, [b, b])).toBe(false);
    w.taskModels[q.id] = [b];
  }
  p.work[lesson.slug] = w;
  expect(decode(JSON.stringify(p))).toEqual(p);
  w.taskModels["pp-v1-g-decision"] = [
    { ...initialBoard(j.guided[4].model!), energy: 11 },
  ];
  expect(decode(JSON.stringify(p))).toBeNull();
});
