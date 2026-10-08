import { test, expect } from "@playwright/test";
import { molarConcentrationJourney as j } from "../src/content/journeys/molar-concentration";
import { tasks } from "../src/content/journeys/helpers";
const all = tasks(j);
test("49 deliberately separate tasks have distinct identities and conservative written responses", () => {
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
  expect(j.guided.every((q) => q.model?.kind === "molar-concentration")).toBe(
    true,
  );
  expect(
    j.checkForms.every(
      (f) => f.length === 5 && f.filter((q) => q.rubric).length === 1,
    ),
  ).toBe(true);
  expect(all.filter((q) => q.rubric)).toHaveLength(4);
  for (const q of all.filter((q) => q.rubric))
    expect(q.options).toBeUndefined();
  expect(j.checkForms.flat().some((q) => q.model)).toBe(false);
  expect(j.reviewForms.flat().some((q) => q.model || q.rubric)).toBe(false);
});
test("every numeric response has an independently recomputed chemical reference", () => {
  const refs: Record<string, number | Record<string, number>> = {
    "w-volume": 400 / 1000,
    "w-moles": 11.7 / 58.5,
    "r-c": 0.12 / (600 / 1000),
    "r-n": 0.3 * (100 / 1000),
    "r-mass": 0.1 * 40,
    "g-c": { volume: 250 / 1000, c: 0.05 / (250 / 1000) },
    "g-n": { volume: 75 / 1000, n: 0.4 * (75 / 1000) },
    "g-mass": { n: 0.2 * (250 / 1000), mass: 0.2 * (250 / 1000) * 58.5 },
    "g-units": 11.7 / 58.5,
    "g-sampling": { n: 0.4 * (125 / 1000), c: (0.4 * 125) / 250 },
    "p-c1": 0.15 / (300 / 1000),
    "p-c2": 0.08 / (800 / 1000),
    "p-n1": 0.75 * (20 / 1000),
    "p-n2": 0.25 * 1.2,
    "p-volume": (0.09 / 0.6) * 1000,
    "p-volume2": 0.036 / 0.24,
    "p-mass1": 0.3 * (100 / 1000) * 40,
    "p-mass2": 0.15 * (200 / 1000) * 74.5,
    "p-mass-to-c": 5.85 / 58.5 / (500 / 1000),
    "p-mass-to-c2": 4 / 40 / (250 / 1000),
    "p-g-to-mol": 8 / 40,
    "p-mol-to-g": 0.4 * 74.5,
    "p-portion": 0.6 * (50 / 1000),
    "p-dilution": (0.6 * 50) / 200,
    "p-added": (0.5 * 100) / 250,
    "p-round": Number((6.23 / 58.5 / (375 / 1000)).toPrecision(3)),
    "ca-c": { v: 180 / 1000, c: 0.063 / (180 / 1000) },
    "ca-mass": 0.25 * (80 / 1000) * 119,
    "ca-units": 19 / 95,
    "ca-volume": (0.028 / 0.8) * 1000,
    "cb-c": { v: 270 / 1000, c: 0.081 / (270 / 1000) },
    "cb-mass": 0.4 * (60 / 1000) * 95,
    "cb-units": 0.15 * 119,
    "cb-volume": (0.018 / 0.45) * 1000,
    "ra-c": 0.042 / (140 / 1000),
    "ra-mass": 0.2 * (90 / 1000) * 40,
    "ra-units": 17.55 / 58.5,
    "rb-c": 0.096 / (160 / 1000),
    "rb-mass": 0.25 * (120 / 1000) * 74.5,
    "rb-units": 0.35 * 40,
  };
  const numeric = all.filter((q) => q.unit || q.parts);
  expect(numeric).toHaveLength(Object.keys(refs).length);
  for (const q of numeric) {
    const reference = refs[q.id.replace("mc-v1-", "")];
    expect(reference).toBeDefined();
    if (q.parts) {
      const values = reference as Record<string, number>;
      expect(q.parts.map((p) => p.id).sort()).toEqual(
        Object.keys(values).sort(),
      );
      for (const part of q.parts)
        expect(part.answer).toBeCloseTo(values[part.id], 12);
    } else expect(Number(q.answer)).toBeCloseTo(reference as number, 12);
  }
});

import { lessons } from "../src/content/curriculum";
import { assessments } from "../src/content/assessments";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { emptyProgress, emptyWork, decode } from "../src/lib/progress";
test("Higher separate route retains original identities and strict canonical histories for all five solution models", () => {
  const lesson = lessons.find((l) => l.slug === "molar-concentration")!;
  expect(lesson.tier).toBe("higher");
  expect(lesson.course).toBe("separate");
  expect(lesson.prerequisite).toBe("moles-and-reacting-masses");
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
  w.taskModels["mc-v1-g-sampling"] = [
    { ...initialBoard(j.guided[4].model!), record: 1 },
  ];
  expect(decode(JSON.stringify(p))).toBeNull();
});
