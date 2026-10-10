import { test, expect } from "@playwright/test";
import { gasVolumesJourney as j } from "../src/content/journeys/gas-volumes";
import { tasks } from "../src/content/journeys/helpers";
import { lessons } from "../src/content/curriculum";
import { assessments } from "../src/content/assessments";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { emptyProgress, emptyWork, decode } from "../src/lib/progress";
const all = tasks(j);
import { mark } from "../src/lib/marking";
test("RTP gas volume enforces the requested three significant figures", () => {
  const q = all.find((task) => task.id === "gv-v1-p-round")!;
  expect(mark(q, "15.2").correct).toBe(true);
  expect(mark(q, "15.20")).toMatchObject({ correct: false, empty: false });
  expect(mark(q, "15").correct).toBe(false);
  expect(mark(q, "15.234545").correct).toBe(false);
});
test("individually authored gas tasks separate assistance, checks and phase reasoning", () => {
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
  expect(j.guided.map((q) => q.model?.kind)).toEqual(
    Array(5).fill("gas-volumes"),
  );
  expect(all.filter((q) => q.rubric)).toHaveLength(4);
  expect(
    j.checkForms.every(
      (f) => f.length === 5 && f.filter((q) => q.rubric).length === 1,
    ),
  ).toBe(true);
  expect(j.checkForms.flat().some((q) => q.model)).toBe(false);
  expect(j.reviewForms.flat().some((q) => q.model || q.rubric)).toBe(false);
  expect(j.scopeNote).toContain("do not assume RTP");
});
test("every numeric gas answer is independently reconstructed from the stated amounts and coefficients", () => {
  const refs: Record<string, number | Record<string, number>> = {
    "w-unit": 800 / 1000,
    "w-amount": 2.8 / 28,
    "r-volume": 0.18 * 24 * 1000,
    "r-mass": 4.4 / 44,
    "g-molar": { dm3: 0.3 * 24, cm3: 0.3 * 24000 },
    "g-mass": { n: 8.8 / 32, volume: (8.8 / 32) * 24 },
    "g-ratio": { h2: 15 * 3, nh3: 15 * 2 },
    "g-remaining": { co2: 40 / 2, total: 40 / 2 + (30 - 40 / 2) },
    "g-phases": {
      steam: (20 / 2) * 6,
      total: (20 / 2) * 6 + 100 - (20 / 2) * 7,
    },
    "p-molar": 0.4 * 24,
    "p-inverse": 1.8 / 24,
    "p-cubic": 900 / 1000 / 24,
    "p-formula": (0.64 / 32) * 24,
    "p-kg": ((0.142 * 1000) / 71) * 24,
    "p-reverse-mass": (1200 / 1000 / 24) * 44,
    "p-reacting-mass": (2.4 / 24) * 24,
    "p-round": Number(((27.93 / 44) * 24).toPrecision(3)),
    "p-titanium": ((5 * 1000) / 80) * 2 * 24,
    "p-nitrogen": 5 * 2,
    "p-hydrogen": 60 / 3,
    "p-fractional": 22.5 / 2,
    "p-backwards": 18 / 2,
    "p-oxygen-excess": 12 + 40 - 12 * 2,
    "p-methane-excess": 30 / 2 + 20 - 30 / 2,
    "p-stoichiometric": 5,
    "p-steam": (12 / 2) * 6 + 60 - (12 / 2) * 7,
    "p-unit-ratio": 0.018 * 1000 * 3,
    "ca-mass": { n: 2.56 / 64, v: (2.56 / 64) * 24 },
    "ca-inverse": 720 / 1000 / 24,
    "ca-ratio": (32 / 4) * 5,
    "ca-dry": 8 + 22 - 8 * 2,
    "cb-mass": { n: 0.84 / 28, v: (0.84 / 28) * 24 },
    "cb-inverse": 1680 / 1000 / 24,
    "cb-ratio": 20 / 2,
    "cb-steam": (16 / 2) * 6 + 70 - (16 / 2) * 7,
    "ra-molar": 0.35 * 24,
    "ra-mass": (4.48 / 64) * 24,
    "ra-dry": 40 / 2 + 25 - 40 / 2,
    "rb-molar": 2640 / 1000 / 24,
    "rb-mass": (3.25 / 65) * 24,
    "rb-ratio": 8 * 2,
  };
  const numeric = all.filter((q) => q.parts || q.unit);
  expect(numeric).toHaveLength(Object.keys(refs).length);
  for (const q of numeric) {
    const ref = refs[q.id.replace("gv-v1-", "")];
    expect(ref).toBeDefined();
    if (q.parts) {
      expect(q.parts.map((p) => p.id).sort()).toEqual(Object.keys(ref).sort());
      for (const p of q.parts)
        expect(p.answer).toBeCloseTo((ref as Record<string, number>)[p.id], 12);
    } else expect(Number(q.answer)).toBeCloseTo(ref as number, 12);
  }
});
test("old route retains all six legacy questions and strict saved histories for five new gas models", () => {
  const l = lessons.find((l) => l.slug === "gas-volumes-and-solutions")!;
  expect(l.title).toBe("Gas volumes");
  expect(l.course).toBe("separate");
  expect(l.tier).toBe("higher");
  expect(l.prerequisite).toBe("limiting-reactants");
  expect(l.questions).toHaveLength(4);
  expect(l.checks).toHaveLength(2);
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
  p.work[l.slug] = w;
  expect(decode(JSON.stringify(p))).toEqual(p);
  w.taskModels[j.guided[0].id] = [
    { ...initialBoard(j.guided[0].model!), answer: 7.2 },
  ];
  expect(decode(JSON.stringify(p))).toBeNull();
});
