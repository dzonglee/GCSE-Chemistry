import { test, expect } from "@playwright/test";
import {
  compareOutput,
  outputPerHour,
  netCost,
  eligibleRoutes,
  bestRoutes,
  decisionRoutes,
  initialPathwayBoard,
  validPathwayBoard,
  pathwayPrediction,
  type PathwayMode,
} from "../src/lib/production-pathways";
test("same-charge actual collection compares constructed products rather than greatest atom economy", () => {
  expect(compareOutput(80, 50)).toBe(40);
  expect(compareOutput(60, 90)).toBe(54);
  expect(compareOutput(160, 50)).toBe(80);
  expect(compareOutput(120, 90)).toBe(108);
  expect(compareOutput(80, 0)).toBe(0);
  expect(
    pathwayPrediction("output", {
      record: "standard",
      a: "40",
      b: "54",
      best: "B",
    }).correct,
  ).toBe(true);
  expect(
    pathwayPrediction("output", {
      record: "standard",
      a: "80",
      b: "60",
      best: "A",
    }).correct,
  ).toBe(false);
  expect(
    pathwayPrediction("output", {
      record: "changed",
      a: "80",
      b: "30",
      best: "A",
    }).correct,
  ).toBe(true);
});
test("throughput uses full comparable batch time and scaling both quantities preserves rate", () => {
  expect(outputPerHour(90, 3)).toBe(30);
  expect(outputPerHour(64, 1)).toBe(64);
  expect(outputPerHour(64, 4)).toBe(16);
  expect(outputPerHour(128, 2)).toBe(64);
  expect(outputPerHour(0, 3)).toBe(0);
  expect(
    pathwayPrediction("throughput", {
      record: "standard",
      a: "30",
      b: "64",
      best: "B",
    }).correct,
  ).toBe(true);
  expect(
    pathwayPrediction("throughput", {
      record: "delayed",
      a: "30",
      b: "16",
      best: "A",
    }).correct,
  ).toBe(true);
});
test("buyer-limited co-product credit preserves disposal and does not redefine desired product atom economy", () => {
  const args = {
    product: 100,
    baseCost: 130,
    otherProduct: 25,
    price: 3,
    disposal: 2,
  };
  expect(netCost({ ...args, sold: 25 })).toEqual({
    waste: 0,
    credit: 75,
    disposalCost: 0,
    total: 55,
    perKg: 0.55,
  });
  expect(netCost({ ...args, sold: 0 })).toEqual({
    waste: 25,
    credit: 0,
    disposalCost: 50,
    total: 180,
    perKg: 1.8,
  });
  expect(netCost({ ...args, sold: 10 })).toEqual({
    waste: 15,
    credit: 30,
    disposalCost: 30,
    total: 130,
    perKg: 1.3,
  });
  expect(
    pathwayPrediction("byproducts", {
      record: "limitedBuyer",
      waste: "15",
      credit: "30",
      a: "140",
      b: "130",
      best: "B",
      economy: "unchanged",
    }).correct,
  ).toBe(true);
  expect(
    pathwayPrediction("byproducts", {
      record: "sold",
      waste: "0",
      credit: "75",
      a: "140",
      b: "55",
      best: "B",
      economy: "increased",
    }).correct,
  ).toBe(false);
});
test("equilibrium percentage and actual rate remain distinct and catalyst preserves stated equilibrium", () => {
  expect(
    pathwayPrediction("conditions", {
      record: "cool",
      equilibrium: "60",
      rate: "10",
      eligible: "yes",
      catalyst: "same",
    }).correct,
  ).toBe(true);
  expect(
    pathwayPrediction("conditions", {
      record: "hot",
      equilibrium: "30",
      rate: "60",
      eligible: "no",
      catalyst: "same",
    }).correct,
  ).toBe(true);
  expect(
    pathwayPrediction("conditions", {
      record: "catalysed",
      equilibrium: "45",
      rate: "90",
      eligible: "yes",
      catalyst: "same",
    }).correct,
  ).toBe(true);
  expect(
    pathwayPrediction("conditions", {
      record: "catalysed",
      equilibrium: "90",
      rate: "90",
      eligible: "yes",
      catalyst: "higher",
    }).correct,
  ).toBe(false);
});
test("constraints precede objective and ties remain explicit rather than an invented universal score", () => {
  expect(eligibleRoutes(decisionRoutes, 30, 9).map((r) => r.id)).toEqual(["B"]);
  const both = eligibleRoutes(decisionRoutes, 30, 11);
  expect(both.map((r) => r.id)).toEqual(["B", "C"]);
  expect(bestRoutes(both, "economy")).toEqual(["C"]);
  expect(bestRoutes(both, "rate")).toEqual(["B"]);
  expect(eligibleRoutes(decisionRoutes, 50, 9)).toEqual([]);
  expect(bestRoutes([], "rate")).toEqual([]);
  expect(
    bestRoutes(
      [
        { ...decisionRoutes[1], id: "B" },
        { ...decisionRoutes[1], id: "D" },
      ],
      "rate",
    ),
  ).toEqual(["B", "D"]);
  expect(
    pathwayPrediction("decision", {
      energy: "11",
      goal: "economy",
      eligible: "BC",
      best: "C",
      reason: "objective",
    }).correct,
  ).toBe(true);
  expect(
    pathwayPrediction("decision", {
      energy: "11",
      goal: "rate",
      eligible: "BC",
      best: "B",
      reason: "largestEconomy",
    }).correct,
  ).toBe(false);
});
test("invalid denominators, physical quantities and unsupported sales are rejected", () => {
  for (const n of [-1, NaN, Infinity]) {
    expect(() => compareOutput(n, 50)).toThrow();
    expect(() => outputPerHour(20, n)).toThrow();
    expect(() => eligibleRoutes(decisionRoutes, n, 10)).toThrow();
  }
  expect(() => outputPerHour(20, 0)).toThrow();
  expect(() => compareOutput(0, 50)).toThrow();
  expect(() => compareOutput(10, 101)).toThrow();
  expect(() =>
    netCost({
      product: 100,
      baseCost: 20,
      otherProduct: 5,
      sold: 6,
      price: 1,
      disposal: 2,
    }),
  ).toThrow();
  expect(() =>
    eligibleRoutes([decisionRoutes[0], decisionRoutes[0]], 0, 10),
  ).toThrow();
});
test("every prediction requires all meaningful fields and strict string histories", () => {
  for (const mode of [
    "output",
    "throughput",
    "byproducts",
    "conditions",
    "decision",
  ] as PathwayMode[]) {
    const b = initialPathwayBoard(mode);
    expect(validPathwayBoard(mode, b)).toBe(true);
    expect(pathwayPrediction(mode, b).correct).toBe(false);
    expect(validPathwayBoard(mode, { ...b, extra: "unknown" })).toBe(false);
    expect(validPathwayBoard(mode, { ...b, [Object.keys(b)[0]]: 0 })).toBe(
      false,
    );
  }
});
