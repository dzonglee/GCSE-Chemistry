import { lessons } from "../src/content/curriculum";
import { initialBoard, validHistory } from "../src/lib/workbench";
import {
  emptyProgress,
  emptyWork,
  decode,
  exposureIds,
} from "../src/lib/progress";
import { test, expect } from "@playwright/test";
import {
  smallestWholeRatio,
  coefficientsFromMasses,
  massBalanceSamples,
  initialMassBalanceBoard,
  validMassBalanceBoard,
  massBalancePrediction,
  type MassBalanceMode,
} from "../src/lib/balancing-masses";
import { balancingMassesJourney as journey } from "../src/content/journeys/balancing-masses";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import { balanceLedger } from "../src/lib/equation-balancing";
test("masses must become mol and fractional ratios are scaled throughout without rounding", () => {
  expect(
    coefficientsFromMasses([4.8, 3.2, 8], [24, 32, 40]).coefficients,
  ).toEqual([2, 1, 2]);
  const r = coefficientsFromMasses([3, 11.2, 8.8, 5.4], [30, 32, 44, 18]);
  expect(r.coefficients).toEqual([2, 7, 4, 6]);
  expect(r.relative[1]).toBeCloseTo(3.5, 12);
  expect(r.multiplier).toBe(2);
  expect(smallestWholeRatio([0.04, 0.02]).coefficients).toEqual([2, 1]);
  expect(smallestWholeRatio([0.03, 0.105, 0.06, 0.09]).coefficients).toEqual([
    2, 7, 4, 6,
  ]);
  expect(() => smallestWholeRatio([1, 1.43])).toThrow();
  expect(() => smallestWholeRatio([0, 1])).toThrow();
  expect(() => coefficientsFromMasses([1, 2], [1])).toThrow();
  expect(() => coefficientsFromMasses([1, 2], [0, 1])).toThrow();
});
test("native histories require all correct intermediate quantities and preserve mass-ratio errors", () => {
  for (const mode of [
    "amounts",
    "candidates",
    "fraction",
    "consumed",
  ] as MassBalanceMode[]) {
    const b = initialMassBalanceBoard(mode);
    expect(validMassBalanceBoard(mode, b)).toBe(true);
    expect(massBalancePrediction(mode, b).correct).toBe(false);
    expect(validMassBalanceBoard(mode, { ...b, extra: 1 })).toBe(false);
  }
  for (const [sample, d] of Object.entries(massBalanceSamples)) {
    const b = {
      sample,
      mgAmount: String(d.amounts[0]),
      oxygenAmount: String(d.amounts[1]),
      oxideAmount: String(d.amounts[2]),
      divisor: String(d.amounts[1]),
      ratio: "2:1:2",
    };
    expect(validMassBalanceBoard("amounts", b)).toBe(true);
    expect(massBalancePrediction("amounts", b).correct).toBe(true);
    expect(
      massBalancePrediction("amounts", { ...b, ratio: "3:2:5" }).correct,
    ).toBe(false);
    expect(
      massBalancePrediction("amounts", { ...b, ratio: "4:2:4" }).correct,
    ).toBe(false);
  }
  const fractional = {
    oxygenRatio: "3.5",
    multiplier: "2",
    ethane: 2,
    oxygen: 7,
    carbonDioxide: 4,
    water: 6,
  };
  expect(validMassBalanceBoard("fraction", fractional)).toBe(true);
  expect(massBalancePrediction("fraction", fractional).correct).toBe(true);
  expect(
    validMassBalanceBoard("fraction", { ...fractional, oxygen: "7" }),
  ).toBe(false);
  expect(
    massBalancePrediction("fraction", { ...fractional, oxygen: 4 }).correct,
  ).toBe(false);
});
test("two atom-balanced copper equations predict different measured product mol ratios", () => {
  for (const [sample, copperAmount, waterAmount, equation] of [
    ["one", "0.04", "0.04", "CuO"],
    ["two", "0.08", "0.04", "Cu2O"],
  ]) {
    const b = { sample, copperAmount, waterAmount, equation };
    expect(validMassBalanceBoard("candidates", b)).toBe(true);
    expect(massBalancePrediction("candidates", b).correct).toBe(true);
    expect(
      massBalancePrediction("candidates", {
        ...b,
        equation: equation === "CuO" ? "Cu2O" : "CuO",
      }).correct,
    ).toBe(false);
  }
  expect(
    balanceLedger(["CuO", "H2"], ["Cu", "H2O"], [1, 1, 1, 1]).balanced,
  ).toBe(true);
  expect(
    balanceLedger(["Cu2O", "H2"], ["Cu", "H2O"], [1, 1, 2, 1]).balanced,
  ).toBe(true);
  const b = {
    oxygenMass: "4",
    mgAmount: "0.25",
    oxygenAmount: "0.125",
    oxideAmount: "0.25",
    ratio: "2:1:2",
  };
  expect(validMassBalanceBoard("consumed", b)).toBe(true);
  expect(massBalancePrediction("consumed", b).correct).toBe(true);
  expect(
    massBalancePrediction("consumed", {
      ...b,
      oxygenMass: "10",
      oxygenAmount: "0.3125",
    }).correct,
  ).toBe(false);
  expect(6 + 10).toBe(10 + 6);
});
test("48 task references preserve constructed working and false written correctness", () => {
  expect(tasks(journey)).toHaveLength(48);
  expect(journey.practice).toHaveLength(21);
  for (const q of tasks(journey)) {
    expect(mark(q, q.answer).correct, q.id).toBe(!q.rubric);
    for (const w of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, w).correct, q.id).toBe(false);
  }
  const q = journey.practice.find((q) => q.id === "bm-v1-p-ethane")!;
  expect(
    mark(
      q,
      JSON.stringify({ ethane: "1", oxygen: "4", carbon: "2", water: "3" }),
    ).correct,
  ).toBe(false);
  const consumed = journey.practice.find(
    (q) => q.id === "bm-v1-p-consumed-amount",
  )!;
  expect(
    mark(consumed, JSON.stringify({ mass: "9.6", amount: "0.2" })).correct,
  ).toBe(false);
});

test("Higher route validates strict saved histories and repeated coefficient evidence stays exposed", () => {
  const l = lessons.find((l) => l.slug === "balancing-from-masses")!;
  expect(l.tier).toBe("higher");
  expect(l.prerequisite).toBe("reacting-masses");
  expect(l.questions).toHaveLength(0);
  const p = emptyProgress(),
    w = emptyWork();
  w.taskModels = {};
  for (const q of journey.guided) {
    const b = initialBoard(q.model!);
    expect(validHistory(q.model!, [b])).toBe(true);
    expect(validHistory(q.model!, [b, b])).toBe(false);
    w.taskModels[q.id] = [b];
  }
  p.work[l.slug] = w;
  expect(decode(JSON.stringify(p))).toEqual(p);
  w.taskModels["bm-v1-g-fraction"] = [
    { ...initialMassBalanceBoard("fraction"), oxygen: "3" },
  ];
  expect(decode(JSON.stringify(p))).toBeNull();
  expect(exposureIds(["bm-v1-ca-fraction"])).toContain("be-v1-p-ethane");
  expect(exposureIds(["bm-v1-ca-amounts"])).toEqual(["bm-v1-ca-amounts"]);
  const q = journey.practice.find((q) => q.id === "bm-v1-p-apparatus")!;
  expect(q.massReadings?.map((row) => row.grams)).toEqual([40, 46, 50]);
  expect(
    mark(q, JSON.stringify({ metal: "46", oxide: "50", oxygen: "4" })).correct,
  ).toBe(false);
});
