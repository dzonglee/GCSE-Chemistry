import { test, expect } from "@playwright/test";
import { empiricalFormulaeJourney as j } from "../src/content/journeys/empirical-formulae";
import { tasks } from "../src/content/journeys/helpers";
const all = tasks(j);
test("49 deliberate tasks reserve both check forms and delayed retrieval without grading written work", () => {
  expect(all).toHaveLength(49);
  expect(new Set(all.map((q) => q.id)).size).toBe(49);
  expect([
    j.warmup.length,
    j.refresher.length,
    j.guided.length,
    j.practice.length,
    j.checkForms.flat().length,
    j.reviewForms.flat().length,
  ]).toEqual([2, 5, 5, 21, 10, 6]);
  expect(j.guided.every((q) => q.model?.kind === "empirical-formulae")).toBe(
    true,
  );
  expect(all.filter((q) => q.rubric)).toHaveLength(4);
  expect(
    j.checkForms.every(
      (f) => f.length === 5 && f.filter((q) => q.rubric).length === 1,
    ),
  ).toBe(true);
  expect(j.checkForms.flat().some((q) => q.model)).toBe(false);
  expect(j.reviewForms.flat().some((q) => q.model || q.rubric)).toBe(false);
});
test("every numeric response agrees with independent mass, ratio and whole-subscript working", () => {
  const refs: Record<string, number | Record<string, number>> = {
    "w-ratio": 8 / 4,
    "w-mass": 6 / 12,
    "r-amount": 4.8 / 16,
    "g-masses": { mg: 4.8 / 24, o: 3.2 / 16 },
    "g-fraction": { al: 0.4 / 0.2, o: 0.6 / 0.2 },
    "g-percent": {
      c: 37.5 / 12 / 3.125,
      h: 12.5 / 1 / 3.125,
      o: 50 / 16 / 3.125,
    },
    "g-molecular": {
      k: 30 / (12 + 3),
      c: 30 / (12 + 3),
      h: (3 * 30) / (12 + 3),
    },
    "g-experiment": { mg: 20.48 - 20, o: 20.8 - 20.48 },
    "p-oxygen-gain": 1.2 - 0.72,
    "p-empirical-mass": 2 * 12 + 3 + 2 * 16,
    "p-multiplier": 150 / (12 + 2 + 16),
    "p-crucible": { mg: 19 - 18.4, o: 19.4 - 19 },
    "ca-masses": { fe: 14.56 / 56, o: 6.24 / 16 },
    "ca-molecular": 84 / (12 + 2),
    "cb-masses": { cr: 13 / 52, o: 6 / 16 },
    "cb-molecular": 132 / (2 * 12 + 4 + 16),
    "ra-gain": 1.8 - 1.08,
    "ra-molecular": (2 * 120) / (12 + 2 + 16),
    "rb-gain": 13.9 - 13.3,
    "rb-molecular": (2 * 118) / (2 * 12 + 3 + 2 * 16),
  };
  const numeric = all.filter((q) => q.unit || q.parts);
  expect(numeric).toHaveLength(Object.keys(refs).length);
  for (const q of numeric) {
    const ref = refs[q.id.replace("ef-v1-", "")];
    expect(ref).toBeDefined();
    if (q.parts) {
      expect(q.parts.map((p) => p.id).sort()).toEqual(Object.keys(ref).sort());
      for (const p of q.parts)
        expect(p.answer).toBeCloseTo((ref as Record<string, number>)[p.id], 12);
    } else expect(Number(q.answer)).toBeCloseTo(ref as number, 12);
  }
});
test("formula-choice answers preserve the actual supplied element proportions, not gram percentages", () => {
  const data: Record<
    string,
    { elements: string[]; amounts: number[]; tolerance?: number }
  > = {
    "p-ethane": { elements: ["C", "H"], amounts: [2, 6] },
    "p-glucose": { elements: ["C", "H", "O"], amounts: [6, 12, 6] },
    "p-peroxide": { elements: ["H", "O"], amounts: [2, 2] },
    "p-magnesium": { elements: ["Mg", "O"], amounts: [7.2 / 24, 4.8 / 16] },
    "p-aluminium": { elements: ["Al", "O"], amounts: [10.8 / 27, 9.6 / 16] },
    "p-iron": { elements: ["Fe", "O"], amounts: [16.8 / 56, 6.4 / 16] },
    "p-percent-two": { elements: ["C", "H"], amounts: [80 / 12, 20] },
    "p-percent-three": {
      elements: ["C", "H", "O"],
      amounts: [40 / 12, 6.7, 53.3 / 16],
      tolerance: 0.015,
    },
    "ca-counts": { elements: ["C", "H"], amounts: [3, 6] },
    "ca-fraction": { elements: ["N", "O"], amounts: [0.18, 0.45] },
    "cb-counts": { elements: ["C", "H", "O"], amounts: [4, 8, 2] },
    "cb-percent": {
      elements: ["N", "O"],
      amounts: [63.6 / 14, 36.4 / 16],
      tolerance: 0.005,
    },
    "ra-ratio": { elements: ["N", "O"], amounts: [2, 4] },
    "rb-ratio": { elements: ["C", "H", "O"], amounts: [2, 4, 2] },
  };
  for (const [id, r] of Object.entries(data)) {
    const q = all.find((q) => q.id === "ef-v1-" + id)!;
    const parsed = [...q.answer.matchAll(/([A-Z][a-z]?)(\d*)/g)];
    expect(parsed.map((v) => v[1])).toEqual(r.elements);
    const counts = parsed.map((v) => Number(v[2] || 1)),
      ratios = r.amounts.map((n, i) => n / counts[i]);
    for (const value of ratios)
      expect(Math.abs(value / ratios[0] - 1)).toBeLessThan(r.tolerance ?? 1e-9);
    const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
    expect(counts.reduce(gcd)).toBe(1);
  }
  for (const [id, mr] of [
    ["p-molecular-ch2", 70],
    ["p-molecular-cho", 90],
  ] as const) {
    const q = all.find((q) => q.id === "ef-v1-" + id)!;
    const mass = [...q.answer.matchAll(/([A-Z][a-z]?)(\d*)/g)].reduce(
      (sum, v) =>
        sum +
        { C: 12, H: 1, O: 16 }[v[1] as "C" | "H" | "O"] * Number(v[2] || 1),
      0,
    );
    expect(mass).toBe(mr);
  }
});
import { lessons } from "../src/content/curriculum";
import { assessments } from "../src/content/assessments";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { emptyProgress, emptyWork, decode } from "../src/lib/progress";
test("corrected Foundation/shared scope retains six original route questions and strict canonical histories", () => {
  const l = lessons.find((l) => l.slug === "empirical-formulae")!;
  expect(l.tier).toBe("foundation");
  expect(l.course).toBe("combined");
  expect(l.prerequisite).toBe("formulae-and-mass");
  expect(l.questions).toHaveLength(4);
  expect(l.checks).toHaveLength(2);
  const original = [
    ...lessons.flatMap((l) => [...l.questions, ...l.checks]),
    ...assessments.flatMap((a) => a.questions),
  ].map((q) => q.id);
  expect(original).toHaveLength(532);
  expect(new Set(original).size).toBe(532);
  const data = emptyProgress(),
    work = emptyWork();
  work.taskModels = {};
  for (const q of j.guided) {
    const b = initialBoard(q.model!);
    expect(validHistory(q.model!, [b])).toBe(true);
    expect(validHistory(q.model!, [])).toBe(false);
    expect(validHistory(q.model!, [b, b])).toBe(false);
    work.taskModels[q.id] = [b];
  }
  data.work[l.slug] = work;
  expect(decode(JSON.stringify(data))).toEqual(data);
  work.taskModels[j.guided[0].id] = [
    { ...initialBoard(j.guided[0].model!), firstAmount: 0.2 },
  ];
  expect(decode(JSON.stringify(data))).toBeNull();
});
