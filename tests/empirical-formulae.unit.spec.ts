import { test, expect } from "@playwright/test";
import {
  elementAmounts,
  normaliseAmounts,
  wholeNumberRatio,
  formulaFromCounts,
  molecularScale,
  crucibleAmounts,
  empiricalChoices,
  empiricalExpected,
  empiricalPrediction,
  validEmpiricalBoard,
  initialEmpiricalBoard,
  type EmpiricalMode,
} from "../src/lib/empirical-formulae";
test("mass ratios convert each element using its own atomic mass", () => {
  expect(elementAmounts([4.8, 3.2], [24, 16])).toEqual([
    0.19999999999999998, 0.2,
  ]);
  expect(wholeNumberRatio(elementAmounts([4.8, 3.2], [24, 16])).counts).toEqual(
    [1, 1],
  );
  expect(wholeNumberRatio(elementAmounts([5.4, 4.8], [27, 16])).counts).toEqual(
    [2, 3],
  );
});
test("all parts scale together through halves and thirds, then simplify", () => {
  expect(wholeNumberRatio([0.4, 0.6]).counts).toEqual([2, 3]);
  expect(wholeNumberRatio([0.3, 0.75]).counts).toEqual([2, 5]);
  expect(wholeNumberRatio([0.6, 0.8])).toMatchObject({
    multiplier: 3,
    counts: [3, 4],
  });
  expect(wholeNumberRatio([2, 4, 2]).counts).toEqual([1, 2, 1]);
  expect(formulaFromCounts(["C", "H", "O"], [1, 2, 1])).toBe("CH2O");
});
test("rounded measured composition supports near integers but not rounding 1.5 away", () => {
  const ratio = wholeNumberRatio(
    elementAmounts([40, 6.7, 53.3], [12, 1, 16]),
    0.025,
  );
  expect(ratio.counts).toEqual([1, 2, 1]);
  expect(wholeNumberRatio([1, 1.5], 0.025).counts).toEqual([2, 3]);
  expect(wholeNumberRatio([1, Math.PI]).counts).toBeNull();
});
test("molecular counts require a positive integer multiple of the entire empirical formula", () => {
  expect(molecularScale(15, 30)).toEqual({
    factor: 2,
    consistent: true,
    multiplier: 2,
  });
  expect(molecularScale(14, 56).multiplier).toBe(4);
  expect(molecularScale(14, 35)).toEqual({
    factor: 2.5,
    consistent: false,
    multiplier: null,
  });
  expect(molecularScale(14, 7).consistent).toBe(false);
});
test("crucible mass gains belong to oxygen, with tare excluded", () => {
  const r = crucibleAmounts(20, 20.48, 20.8);
  expect(r.metalMass).toBeCloseTo(0.48, 12);
  expect(r.oxygenMass).toBeCloseTo(0.32, 12);
  expect(
    wholeNumberRatio(elementAmounts([r.metalMass, r.oxygenMass], [24, 16]))
      .counts,
  ).toEqual([1, 1]);
});
test("every authored native record has reachable predictions and strict canonical domains", () => {
  for (const mode of Object.keys(empiricalChoices) as EmpiricalMode[]) {
    const b = initialEmpiricalBoard(mode);
    expect(validEmpiricalBoard(mode, b)).toBe(true);
    expect(empiricalPrediction(mode, b)).toEqual({
      correct: false,
      complete: false,
    });
    for (const record of empiricalChoices[mode].record) {
      const current = { ...b, record },
        e = empiricalExpected(mode, current),
        selected = Object.fromEntries(
          Object.entries(e).map(([key, value]) => [
            key,
            empiricalChoices[mode][key].find(
              (v) =>
                v === value ||
                (!["reason", "first", "second", "third"].includes(key) &&
                  Number.isFinite(Number(v)) &&
                  Math.abs(Number(v) - Number(value)) < 1e-7),
            ),
          ]),
        );
      expect(
        Object.values(selected).every((v) => v !== undefined),
        mode + record,
      ).toBe(true);
      expect(
        empiricalPrediction(mode, { ...current, ...selected } as Record<
          string,
          string
        >),
      ).toEqual({ correct: true, complete: true });
    }
    expect(validEmpiricalBoard(mode, { ...b, first: 1 })).toBe(false);
    expect(validEmpiricalBoard(mode, { ...b, record: "unknown" })).toBe(false);
    expect(validEmpiricalBoard(mode, { ...b, extra: "initial" })).toBe(false);
  }
});
test("missing elements, invalid atomic masses, impossible weighing and fractional subscripts reject", () => {
  for (const bad of [0, -1, NaN, Infinity]) {
    expect(() => elementAmounts([1, bad], [12, 16])).toThrow();
    expect(() => molecularScale(bad, 30)).toThrow();
  }
  expect(() => normaliseAmounts([1])).toThrow();
  expect(() => elementAmounts([1, 2], [12])).toThrow();
  expect(() => wholeNumberRatio([1, 2], 0.5)).toThrow();
  expect(() => formulaFromCounts(["Al", "O"], [1, 1.5])).toThrow();
  expect(() => crucibleAmounts(20, 19, 21)).toThrow();
});
