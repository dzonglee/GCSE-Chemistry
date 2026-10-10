import { test, expect } from "@playwright/test";
import { titrationCalculationsJourney } from "../src/content/journeys/titration-calculations";
import { mark } from "../src/lib/marking";
import {
  deliveredTitre,
  titrationAmounts,
  titrationConcentration,
  reactingVolume,
  titratedMassConcentration,
  titrationChoices,
  titrationRecords,
  initialTitrationBoard,
  validTitrationBoard,
  titrationExpected,
  titrationPrediction,
  type TitrationMode,
} from "../src/lib/titration-calculations";
test("historical combined-volume choice retains its incorrect scientific feedback", () => {
  const q = titrationCalculationsJourney.refresher.find(
    (q) => q.id === "tc-v1-r-volume",
  )!;
  const historical = mark(q, "The combined43.0 cm³ mixture");
  expect(historical).toEqual(mark(q, "The combined 43.0 cm³ mixture"));
  expect(historical.correct).toBe(false);
  expect(historical.feedback).toContain("original acid concentration");
  expect(mark(q, "The original 25.0 cm³ HCl sample").correct).toBe(true);
});
test("nonzero starting readings are subtracted; a scale reading is not a delivered volume", () => {
  expect(deliveredTitre(1.4, 21.4)).toBeCloseTo(20, 12);
  expect(deliveredTitre(4.8, 24.8)).toBeCloseTo(20, 12);
  expect(deliveredTitre(2.1, 27.1)).toBeCloseTo(25, 12);
  for (const readings of [
    [-1, 20],
    [20, 20],
    [20, 19],
    [0, 51],
    [0, NaN],
  ])
    expect(() => deliveredTitre(...(readings as [number, number]))).toThrow();
});
test("real 2022 exam requires acid moles twice barium hydroxide moles", () => {
  const a = titrationConcentration(0.1, 23.5, 1, 2, 25.0);
  expect(a.knownMoles).toBeCloseTo(0.00235, 12);
  expect(a.unknownMoles).toBeCloseTo(0.0047, 12);
  expect(a.concentration).toBeCloseTo(0.188, 12);
  expect(a.unknownDm3).toBe(0.025);
});
test("sulfuric acid amount is half sodium hydroxide and equal volumes do not mean equal concentrations", () => {
  expect(titrationConcentration(0.1, 24, 2, 1, 25).concentration).toBeCloseTo(
    0.048,
    12,
  );
  expect(titrationConcentration(0.1, 25, 2, 1, 25).concentration).toBeCloseTo(
    0.05,
    12,
  );
  expect(titrationConcentration(0.1, 20, 1, 1, 12.5).concentration).toBeCloseTo(
    0.16,
    12,
  );
});
test("mass concentration uses named solute and reverse required volume keeps reaction ratio", () => {
  expect(titratedMassConcentration(0.08, 98)).toBeCloseTo(7.84, 12);
  expect(titratedMassConcentration(0.16, 40)).toBeCloseTo(6.4, 12);
  expect(reactingVolume(0.05, 25, 1, 2, 0.1).requiredCm3).toBeCloseTo(25, 12);
  expect(reactingVolume(0.05, 25, 1, 2, 0.2).requiredCm3).toBeCloseTo(12.5, 12);
  expect(reactingVolume(0.05, 25, 1, 1, 0.1).requiredCm3).toBeCloseTo(12.5, 12);
});
test("invalid physical inputs and fractional equation coefficients reject rather than silently compute", () => {
  for (const values of [
    [0, 20, 1, 1],
    [-0.1, 20, 1, 1],
    [0.1, 0, 1, 1],
    [0.1, 20, 1.5, 1],
    [0.1, 20, 1, Infinity],
  ])
    expect(() =>
      titrationAmounts(...(values as [number, number, number, number])),
    ).toThrow();
  expect(() => reactingVolume(0.1, 20, 1, 1, 0)).toThrow();
  expect(() => titratedMassConcentration(0.1, -40)).toThrow();
  expect(() => titrationConcentration(0.1, 20, 1, 1, NaN)).toThrow();
});
test("every authored selectable record has a reachable correct prediction; every wrong field remains wrong", () => {
  for (const mode of Object.keys(titrationRecords) as TitrationMode[])
    for (const record of Object.keys(titrationRecords[mode])) {
      const initial = { ...initialTitrationBoard(mode), record };
      expect(validTitrationBoard(mode, initial)).toBe(true);
      expect(titrationPrediction(mode, initial)).toEqual({
        correct: false,
        complete: false,
      });
      const expected = titrationExpected(mode, initial),
        correct: Record<string, string> = { ...initial };
      for (const [key, value] of Object.entries(expected)) {
        const canonical = titrationChoices[mode][key].find((candidate) =>
          key === "reason"
            ? candidate === value
            : candidate !== "unset" &&
              Math.abs(Number(candidate) - Number(value)) < 1e-9,
        );
        expect(canonical, `${mode}/${record}/${key}/${value}`).toBeDefined();
        correct[key] = canonical!;
      }
      expect(titrationPrediction(mode, correct)).toEqual({
        correct: true,
        complete: true,
      });
      for (const key of Object.keys(expected)) {
        const wrong = titrationChoices[mode][key].find(
          (candidate) =>
            candidate !== "unset" &&
            (key === "reason"
              ? candidate !== expected[key]
              : Math.abs(Number(candidate) - Number(expected[key])) > 1e-8),
        );
        expect(wrong).toBeDefined();
        expect(
          titrationPrediction(mode, { ...correct, [key]: wrong! }).correct,
        ).toBe(false);
      }
    }
});
test("saved native state rejects extra keys numeric coercion missing fields and unrecognised records", () => {
  const b = initialTitrationBoard("titre");
  expect(validTitrationBoard("titre", b)).toBe(true);
  for (const bad of [
    { ...b, titre: 20 },
    { ...b, extra: "1" },
    { ...b, record: "other" },
    [],
    null,
    { record: "initial" },
  ])
    expect(validTitrationBoard("titre", bad)).toBe(false);
});
