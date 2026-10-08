import { test, expect } from "@playwright/test";
import {
  limitingInventory,
  limitingFromMasses,
  carbonateCapacity,
} from "../src/lib/limiting-reactants";
test("coefficient-normalized capacities distinguish both limiting directions and exact supply", () => {
  const r = limitingInventory([3, 4], [1, 2], [1, 2]);
  expect(r.capacities).toEqual([3, 2]);
  expect(r.limiting).toEqual([1]);
  expect(r.products).toEqual([2, 4]);
  expect(r.remaining).toEqual([1, 0]);
  const reverse = limitingInventory([2, 5], [1, 2], [1, 2]);
  expect(reverse.limiting).toEqual([0]);
  expect(reverse.remaining).toEqual([0, 1]);
  const exact = limitingInventory([2, 4], [1, 2], [1, 2]);
  expect(exact.limiting).toEqual([0, 1]);
  expect(exact.remaining).toEqual([0, 0]);
});
test("fractional mol stay continuous and tiny positive quantities are retained", () => {
  const r = limitingInventory([0.3, 0.4], [1, 2], [1, 2]);
  expect(r.extent).toBeCloseTo(0.2, 12);
  expect(r.products[1]).toBeCloseTo(0.4, 12);
  expect(r.remaining[0]).toBeCloseTo(0.1, 12);
  expect(limitingInventory([1e-15, 2e-15], [1, 2], [1]).products[0]).toBe(
    1e-15,
  );
  expect(limitingInventory([0, 2], [1, 2], [1]).products).toEqual([0]);
  expect(() => limitingInventory([1, -1], [1, 2], [1])).toThrow();
  expect(() => limitingInventory([1, 2], [1], [1])).toThrow();
  expect(() => limitingInventory([1, 2], [1, 0.5], [1])).toThrow();
  expect(() => limitingInventory([1, 2], [1, 2], [])).toThrow();
});
test("smaller gram mass need not limit; product plus leftover mass conserves the complete inventory", () => {
  const r = limitingFromMasses([12, 14.6], [24, 36.5], [1, 2], [1, 1]);
  expect(r.limiting).toEqual([1]);
  expect(r.extent).toBeCloseTo(0.2, 12);
  expect(r.remaining[0] * 24).toBeCloseTo(7.2, 12);
  expect(r.products[1] * 2).toBeCloseTo(0.4, 12);
  expect(
    r.products[0] * 95 +
      r.products[1] * 2 +
      r.remaining[0] * 24 +
      r.remaining[1] * 36.5,
  ).toBeCloseTo(26.6, 12);
  const official = limitingFromMasses(
    [40000, 20000],
    [190, 23],
    [1, 4],
    [1, 4],
  );
  expect(official.limiting).toEqual([0]);
  expect(official.consumed[1] * 23).toBeCloseTo(19368.42105263158, 8);
});
test("adding excess alone leaves maximum product fixed; supply graphs plateau when acid is exhausted", () => {
  expect(limitingInventory([3, 4], [1, 2], [1]).products).toEqual(
    limitingInventory([8, 4], [1, 2], [1]).products,
  );
  expect(limitingInventory([3, 8], [1, 2], [1]).products).toEqual([3]);
  expect(carbonateCapacity(0.005).products).toEqual([0.005]);
  expect(carbonateCapacity(0.01).products).toEqual([0.01]);
  expect(carbonateCapacity(0.015).products).toEqual([0.01]);
  expect(carbonateCapacity(0.015).remaining[0]).toBeCloseTo(0.005, 12);
});
import {
  initialLimitingBoard,
  validLimitingBoard,
  limitingPrediction,
  type LimitingMode,
} from "../src/lib/limiting-reactants";
test("native predictions require both capacities and all leftovers, with strict persisted boards", () => {
  for (const mode of [
    "capacities",
    "masses",
    "change",
    "plateau",
  ] as LimitingMode[]) {
    const b = initialLimitingBoard(mode);
    expect(validLimitingBoard(mode, b)).toBe(true);
    expect(limitingPrediction(mode, b).correct).toBe(false);
    expect(validLimitingBoard(mode, { ...b, extra: 1 })).toBe(false);
  }
  const b = {
    sample: "methaneExcess",
    methaneCapacity: "3",
    oxygenCapacity: "2",
    limiting: "oxygen",
    carbonDioxide: "2",
    methaneLeft: "1",
    oxygenLeft: "0",
  };
  expect(validLimitingBoard("capacities", b)).toBe(true);
  expect(limitingPrediction("capacities", b).correct).toBe(true);
  expect(
    limitingPrediction("capacities", { ...b, oxygenCapacity: "4" }).correct,
  ).toBe(false);
  const m = {
    sample: "acidLimits",
    mgAmount: "0.5",
    acidAmount: "0.4",
    limiting: "HCl",
    hydrogenMass: "0.4",
    mgLeft: "7.2",
  };
  expect(limitingPrediction("masses", m).correct).toBe(true);
  expect(limitingPrediction("masses", m).feedback).toContain(
    "14.6/36.5=0.4 mol",
  );
  expect(limitingPrediction("masses", m).feedback).not.toContain("999999");
  expect(limitingPrediction("masses", { ...m, limiting: "Mg" }).correct).toBe(
    false,
  );
  const p = {
    carbonate: "0.015",
    product: "0.01",
    left: "0.005",
    limiting: "acid",
  };
  expect(limitingPrediction("plateau", p).correct).toBe(true);
  expect(
    limitingPrediction("plateau", { ...p, product: "0.015" }).correct,
  ).toBe(false);
});

import { limitingReactantsJourney as journey } from "../src/content/journeys/limiting-reactants";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
import { initialBoard, validHistory } from "../src/lib/workbench";
import { emptyProgress, emptyWork, decode } from "../src/lib/progress";
test("48 individually authored references retain complete multipart work and false written correctness", () => {
  expect(tasks(journey)).toHaveLength(48);
  expect(journey.practice).toHaveLength(21);
  for (const q of tasks(journey)) {
    expect(mark(q, q.answer).correct, q.id).toBe(!q.rubric);
    for (const w of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, w).correct, q.id).toBe(false);
  }
  const q = journey.practice.find((q) => q.id === "lr-v1-p-capacities")!;
  expect(mark(q, JSON.stringify({ methane: "4", oxygen: "6" })).correct).toBe(
    false,
  );
  const kg = journey.practice.find((q) => q.id === "lr-v1-p-kilograms")!;
  expect(
    mark(kg, JSON.stringify({ product: "4800", left: "9200" })).correct,
  ).toBe(false);
});
test("strict native histories survive decode, reject surplus keys and retain correct initial states", () => {
  const l = lessons.find((l) => l.slug === "limiting-reactants")!;
  expect(l.tier).toBe("higher");
  expect(l.course).toBe("combined");
  expect(l.questions).toHaveLength(0);
  const progress = emptyProgress(),
    work = emptyWork();
  work.taskModels = {};
  for (const q of journey.guided) {
    const b = initialBoard(q.model!);
    expect(validHistory(q.model!, [b])).toBe(true);
    expect(validHistory(q.model!, [b, b])).toBe(false);
    work.taskModels[q.id] = [b];
  }
  progress.work[l.slug] = work;
  expect(decode(JSON.stringify(progress))).toEqual(progress);
  work.taskModels["lr-v1-g-capacities"] = [
    { ...initialLimitingBoard("capacities"), oxygenCapacity: 2 },
  ];
  expect(decode(JSON.stringify(progress))).toBeNull();
});
