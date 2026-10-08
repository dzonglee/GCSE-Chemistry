import { test, expect } from "@playwright/test";
import {
  inverseAtomicMass,
  initialInverseEconomyBoard,
  validInverseEconomyBoard,
  inverseEconomyPrediction,
} from "../src/lib/inverse-atom-economy";
import { atomEconomyJourney as j } from "../src/content/journeys/atom-economy";
import { mark } from "../src/lib/marking";
import { initialBoard, validHistory } from "../src/lib/workbench";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
} from "../src/lib/progress";

test("inverse equation references agree with independent complementary percentages and weighted atomic contributions", () => {
  // Literal independently calculated references; original metal coefficients differ.
  expect(inverseAtomicMass(45.9, 132, 2)).toBeCloseTo(55.99630314232902, 11);
  expect(inverseAtomicMass(70.3, 88, 1)).toBeCloseTo(208.29629629629628, 11);
  expect(inverseAtomicMass(77.3, 54, 1)).toBeCloseTo(183.88546255506606, 11);
  expect((132 / 0.541 - 132) / 2).toBeCloseTo(
    inverseAtomicMass(45.9, 132, 2),
    11,
  );
  for (const args of [
    [100, 132, 2],
    [0, 132, 2],
    [45.9, 0, 2],
    [45.9, 132, 0],
    [45.9, 132, 1.5],
    [NaN, 132, 2],
  ])
    expect(() =>
      inverseAtomicMass(...(args as [number, number, number])),
    ).toThrow();
});
test("coefficient, wrong numerator, omitted unknown, complement and final precision errors remain distinct", () => {
  expect(
    inverseEconomyPrediction("allocation", {
      ...initialInverseEconomyBoard("allocation"),
      contribution: "44",
    }).correct,
  ).toBe(false);
  expect(
    inverseEconomyPrediction("allocation", {
      ...initialInverseEconomyBoard("allocation"),
      contribution: "132",
    }).correct,
  ).toBe(true);
  for (const ratio of ["unset", "unweighted", "other", "omitted"])
    expect(
      inverseEconomyPrediction("equation", {
        ...initialInverseEconomyBoard("equation"),
        ratio,
      }).correct,
    ).toBe(false);
  expect(
    inverseEconomyPrediction("equation", {
      ...initialInverseEconomyBoard("equation"),
      ratio: "weighted",
    }).correct,
  ).toBe(true);
  expect(
    inverseEconomyPrediction("complement", {
      ...initialInverseEconomyBoard("complement"),
      otherPercent: "54.1",
    }).correct,
  ).toBe(true);
  for (const atomicMass of ["1..2", "56 g", "", "0", "-56", "112", "30.294"])
    expect(
      inverseEconomyPrediction("solve", {
        ...initialInverseEconomyBoard("solve"),
        atomicMass,
      }).correct,
    ).toBe(false);
  expect(
    inverseEconomyPrediction("solve", {
      ...initialInverseEconomyBoard("solve"),
      atomicMass: "56.0",
    }).correct,
  ).toBe(true);
  const q = j.practice.find((q) => q.id === "ae-v1-p-inverse-metal")!;
  expect(mark(q, "56").correct).toBe(false);
  expect(mark(q, "55.996303").correct).toBe(false);
  expect(mark(q, "56.0").correct).toBe(true);
  expect(
    mark(
      j.practice.find((q) => q.id === "ae-v1-p-inverse-transfer")!,
      "208",
    ).correct,
  ).toBe(true);
});
test("append-only native histories retain raw wrong work and original sealed form identities", () => {
  const q = j.guided.find((q) => q.id === "ae-v1-g-inverse-solve")!;
  const initial = initialBoard(q.model!);
  const wrong = { ...initial, atomicMass: "1..2" };
  expect(validHistory(q.model!, [initial, wrong])).toBe(true);
  expect(validInverseEconomyBoard("solve", { ...wrong, atomicMass: 56 })).toBe(
    false,
  );
  expect(validInverseEconomyBoard("solve", { ...wrong, extra: "x" })).toBe(
    false,
  );
  const data = emptyProgress(),
    work = emptyWork();
  work.taskModels = { [q.id]: [initial, wrong] };
  data.work["atom-economy"] = work;
  expect(decode(JSON.stringify(data))).toEqual(data);
  expect(j.guided.slice(-4).every((q) => q.tier === "higher")).toBe(true);
  expect(
    j.practice.slice(-2).every((q) => q.tier === "higher" && !q.model),
  ).toBe(true);
  expect(j.checkForms.map((f) => f.map((q) => q.id))).toEqual([
    [
      "ae-v1-ca-copper",
      "ae-v1-ca-percentage",
      "ae-v1-ca-product",
      "ae-v1-ca-measures",
      "ae-v1-ca-proof",
    ],
    [
      "ae-v1-cb-aluminium",
      "ae-v1-cb-percentage",
      "ae-v1-cb-product",
      "ae-v1-cb-measures",
      "ae-v1-cb-proof",
    ],
  ]);
  expect(exposureIds([q.id])).toContain("ae-v1-p-inverse-metal");
  expect(exposureIds(["ae-v1-p-inverse-metal"])).not.toContain(
    "ae-v1-p-inverse-transfer",
  );
});
