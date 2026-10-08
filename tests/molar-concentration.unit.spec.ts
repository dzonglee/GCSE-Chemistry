import { test, expect } from "@playwright/test";
import {
  solutionDm3,
  molarConcentration,
  solutionMoles,
  solutionMass,
  concentrationFromMass,
  massConcentration,
  volumeForMoles,
  sampleAndDilution,
} from "../src/lib/molar-concentration";
test("final cubic solution volume converts exactly and keeps named concentration units", () => {
  expect(solutionDm3(250, "cm3")).toBe(0.25);
  expect(solutionDm3(0.25, "dm3")).toBe(0.25);
  expect(molarConcentration(0.05, 250, "cm3")).toBe(0.2);
  expect(molarConcentration(0.05, 0.25, "dm3")).toBe(0.2);
  expect(molarConcentration(0.1, 250, "cm3")).toBe(0.4);
  expect(molarConcentration(0.05, 500, "cm3")).toBe(0.1);
  expect(molarConcentration(0, 250, "cm3")).toBe(0);
});
test("amount, mass and required volume retain full precision through both operations", () => {
  expect(solutionMoles(0.4, 75, "cm3")).toBeCloseTo(0.03, 14);
  expect(solutionMass(0.4, 75, "cm3", 58.5)).toBeCloseTo(1.755, 14);
  expect(concentrationFromMass(5.85, 500, "cm3", 58.5)).toBeCloseTo(0.2, 14);
  expect(volumeForMoles(0.03, 0.4)).toBeCloseTo(0.075, 14);
  expect(massConcentration(0.2, 58.5)).toBeCloseTo(11.7, 14);
  expect(massConcentration(0.2, 40)).toBe(8);
});
test("publisher examples independently check unrounded chemistry with its supplied constants", () => {
  expect(molarConcentration(0.133, 355, "cm3")).toBeCloseTo(133 / 355, 14);
  expect(concentrationFromMass(25.2, 0.5, "dm3", 60.052)).toBeCloseTo(
    12600 / 15013,
    14,
  );
  expect(solutionMass(5.3, 0.25, "dm3", 58.44)).toBeCloseTo(77.433, 12);
  expect(solutionMass(0.2, 250, "cm3", 110.98)).toBeCloseTo(5.549, 13);
});
test("homogeneous sampling retains concentration whereas dilution retains amount", () => {
  const record = sampleAndDilution(0.4, 500, 125, 250);
  expect(record).toEqual({
    initialMoles: 0.2,
    sampleMoles: 0.05,
    remainingMoles: 0.15000000000000002,
    sampleConcentration: 0.4,
    dilutedConcentration: 0.2,
  });
  expect(sampleAndDilution(0.4, 500, 500, 1000).dilutedConcentration).toBe(0.2);
  expect(() => sampleAndDilution(0.4, 500, 501, 600)).toThrow();
  expect(() => sampleAndDilution(0.4, 500, 125, 124)).toThrow();
});
test("invalid units, undefined divisions and nonfinite input reject rather than giving plausible answers", () => {
  for (const n of [0, -1, NaN, Infinity]) {
    expect(() => solutionDm3(n, "cm3")).toThrow();
    expect(() => solutionMass(0.2, 250, "cm3", n)).toThrow();
    expect(() => volumeForMoles(0.03, n)).toThrow();
  }
  for (const n of [-1, NaN, Infinity])
    expect(() => solutionMoles(n, 250, "cm3")).toThrow();
  expect(() => solutionDm3(250, "litres" as "dm3")).toThrow();
});
import {
  molarChoices,
  molarExpected,
  molarPrediction,
  initialMolarBoard,
  validMolarBoard,
  type MolarMode,
} from "../src/lib/molar-concentration";
test("every selectable record has reachable correct predictions and exact saved-board domains", () => {
  for (const mode of Object.keys(molarChoices) as MolarMode[]) {
    const initial = initialMolarBoard(mode);
    expect(validMolarBoard(mode, initial)).toBe(true);
    expect(molarPrediction(mode, initial)).toMatchObject({
      correct: false,
      complete: false,
    });
    for (const record of molarChoices[mode].record) {
      const expected = molarExpected(mode, record);
      for (const [key, value] of Object.entries(expected))
        expect(
          molarChoices[mode][key].some(
            (v) =>
              v === value ||
              (key !== "reason" && Math.abs(Number(v) - Number(value)) < 1e-12),
          ),
        ).toBe(true);
      const selected = Object.fromEntries(
        Object.entries(expected).map(([key, value]) => [
          key,
          molarChoices[mode][key].find(
            (v) =>
              v === value ||
              (key !== "reason" && Math.abs(Number(v) - Number(value)) < 1e-12),
          )!,
        ]),
      );
      expect(molarPrediction(mode, { record, ...selected })).toMatchObject({
        correct: true,
        complete: true,
      });
    }
    expect(validMolarBoard(mode, { ...initial, extra: "initial" })).toBe(false);
    expect(validMolarBoard(mode, { ...initial, record: 1 })).toBe(false);
  }
  expect(
    molarPrediction("concentration", {
      record: "initial",
      volume: "250",
      answer: "0.0002",
      reason: "amount-over-final-volume",
    }).correct,
  ).toBe(false);
  expect(
    molarPrediction("sampling", {
      record: "initial",
      moles: "0.05",
      sample: "0.1",
      answer: "0.2",
      reason: "sampling-lowers-c",
    }).correct,
  ).toBe(false);
});
