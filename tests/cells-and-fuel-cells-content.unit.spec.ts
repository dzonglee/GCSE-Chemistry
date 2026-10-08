import { test, expect } from "@playwright/test";
import { cellsJourney as j } from "../src/content/journeys/cells-and-fuel-cells";
import { lessons } from "../src/content/curriculum";
import { mark } from "../src/lib/marking";
import {
  emptyProgress,
  emptyWork,
  decode,
  exposureIds,
} from "../src/lib/progress";
import { initialBoard } from "../src/lib/workbench";
const all = [
  ...j.warmup,
  ...j.refresher,
  ...j.guided,
  ...j.practice,
  ...j.checkForms.flat(),
  ...j.reviewForms.flat(),
];
test("the individual63-task Foundation/separate journey retains six original IDs and valid targeted recovery", () => {
  const l = lessons.find((l) => l.slug === "cells-and-fuel-cells")!;
  expect(l).toMatchObject({
    tier: "foundation",
    course: "separate",
    prerequisite: "metal-reactivity",
    journey: j,
  });
  expect([...l.questions, ...l.checks].map((q) => q.id)).toEqual(
    Array.from({ length: 6 }, (_, i) => "cells-and-fuel-cells-" + i),
  );
  expect(all).toHaveLength(63);
  expect(new Set(all.map((q) => q.id)).size).toBe(63);
  expect(j.practice).toHaveLength(25);
  for (const q of j.practice)
    expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
});
test("all23 numerical answers match independently supplied arithmetic references", () => {
  const refs: Record<string, number> = {
    "warm-series": 6,
    "warm-oxygen": 2,
    "r-series": 6,
    "r-equation": 1,
    "r-opposing": 3,
    "g-cell": 1.1,
    "g-series": 8,
    "g-reaction": 2,
    "p-identical": 0,
    "p-mg": 2.71,
    "p-co": 0.62,
    "p-six": 4,
    "p-decimal": 7.2,
    "p-reversed": 3,
    "p-cancel": 0,
    "p-double": 4,
    "p-triple": 3,
    "A-series": 6,
    "A-water": 4,
    "B-series": 8,
    "B-oxygen": 5,
    "R-series": 5,
    "S-balance": 6,
  };
  const numeric = all.filter((q) => !q.options && !q.rubric);
  expect(numeric).toHaveLength(23);
  for (const q of numeric) {
    expect(Number(q.answer), q.id).toBe(refs[q.id.replace("cf-v1-", "")]);
    expect(mark(q, q.answer).correct).toBe(true);
    expect(mark(q, String(Number(q.answer) + 1)).correct).toBe(false);
  }
});
test("seven written explanations remain self-reviewed even when they exactly match the model answer", () => {
  const written = all.filter((q) => q.rubric);
  expect(written).toHaveLength(7);
  for (const q of written) {
    expect(q.rubric!.length).toBeGreaterThanOrEqual(2);
    expect(mark(q, q.answer)).toMatchObject({
      correct: false,
      selfReview: true,
    });
    expect(mark(q, "An unsupported short statement.")).toMatchObject({
      correct: false,
      selfReview: true,
    });
  }
});
test("reserved forms have distinct IDs, no learning model and no opening hint", () => {
  expect(j.checkForms.map((f) => f.length)).toEqual([5, 5]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([3, 3]);
  const reserved = [...j.checkForms.flat(), ...j.reviewForms.flat()];
  expect(new Set(reserved.map((q) => q.id)).size).toBe(16);
  for (const q of reserved) {
    expect(q.model).toBeUndefined();
    expect(q.openingHint).not.toBe(true);
  }
  expect(j.checkForms[0][2].cellsComparison?.sources).toEqual([
    {
      label: "Source F",
      rangeKm: 380,
      restorationMinutes: 6,
      tripCostPounds: 44,
    },
    {
      label: "Source B",
      rangeKm: 260,
      restorationMinutes: 35,
      tripCostPounds: 8,
    },
  ]);
  expect(j.checkForms[0][2].answer).toBe("Source B");
  expect(j.checkForms[1][2].cellsComparison?.sources).toEqual([
    { label: "Source F", rangeKm: 420, restorationMinutes: 4 },
    { label: "Source B", rangeKm: 280, restorationMinutes: 30 },
  ]);
  expect(j.checkForms[1][2].answer).toBe("Neither");
});
test("direct global exposure covers legacy, every switchable assisted demand and repeated independent series calculations", () => {
  const pairs = [
    ["cells-and-fuel-cells-0", "cf-v1-p-energy"],
    ["cells-and-fuel-cells-1", "cf-v1-A-charge"],
    ["cells-and-fuel-cells-2", "cf-v1-A-impact"],
    ["cells-and-fuel-cells-3", "cf-v1-S-lifecycle"],
    ["cells-and-fuel-cells-4", "cf-v1-B-feed"],
    ["cells-and-fuel-cells-5", "cf-v1-A-use"],
    ["cf-v1-g-cell", "cf-v1-p-reactivity"],
    ["cf-v1-g-series", "cf-v1-B-series"],
    ["cf-v1-g-restore", "cf-v1-B-feed"],
    ["cf-v1-g-evidence", "cf-v1-B-method"],
    ["cf-v1-A-series", "cf-v1-B-series"],
  ];
  for (const [seen, protectedId] of pairs)
    expect(exposureIds([seen])).toContain(protectedId);
});
test("saved wrong models decode, reload and atomically switch records while rejecting multiple simultaneous field edits", () => {
  const p = emptyProgress(),
    w = emptyWork();
  w.taskModels = {};
  p.work["cells-and-fuel-cells"] = w;
  const q = j.guided[0],
    a = initialBoard(q.model!);
  w.taskModels[q.id] = [a, { ...a, left: "zinc" }];
  expect(decode(JSON.stringify(p))).toEqual(p);
  w.taskModels[q.id].push(
    initialBoard({
      kind: "cells-workbench",
      mode: "setup",
      record: "magnesium",
      instruction: "",
    }),
  );
  expect(decode(JSON.stringify(p))).toEqual(p);
  w.taskModels[q.id] = [a, { ...a, left: "copper", right: "zinc" }];
  expect(decode(JSON.stringify(p))).toBeNull();
});
