import { test, expect } from "@playwright/test";
import {
  oxygenRecords,
  oxygenChoices,
  initialOxygenBoard,
  validOxygenBoard,
  oxygenExpected,
  oxygenPrediction,
  type OxygenMode,
} from "../src/lib/oxygen-redox";
test("all given chemical records have reachable answers, with every wrong prediction retained as wrong", () => {
  for (const mode of Object.keys(oxygenRecords) as OxygenMode[])
    for (const record of Object.keys(oxygenRecords[mode])) {
      const initial = { ...initialOxygenBoard(mode), record },
        expected = oxygenExpected(mode, initial),
        right = { ...initial, ...expected };
      expect(validOxygenBoard(mode, right)).toBe(true);
      expect(oxygenPrediction(mode, right)).toEqual({
        complete: true,
        correct: true,
      });
      for (const [field, value] of Object.entries(expected))
        for (const wrong of oxygenChoices[mode][field].filter(
          (v) => v !== value && v !== "unset",
        ))
          expect(
            oxygenPrediction(mode, { ...right, [field]: wrong }).correct,
          ).toBe(false);
    }
});
test("oxygen moves between substances, carbon products and complete equation counts remain specific", () => {
  expect(oxygenExpected("transfer", { record: "initial" })).toEqual({
    reduced: "CuO",
    oxidised: "C",
    oxygen: "2",
  });
  expect(oxygenExpected("transfer", { record: "nickel" })).toEqual({
    reduced: "NiO",
    oxidised: "C",
    oxygen: "1",
  });
  expect(oxygenExpected("transfer", { record: "iron" })).toEqual({
    reduced: "Fe2O3",
    oxidised: "CO",
    oxygen: "3",
  });
  expect(oxygenExpected("oxidation", { record: "aluminium" })).toEqual({
    oxygen: "6",
    change: "oxidation",
  });
});
test("sample mass change and sealed total mass are different quantities", () => {
  for (const key of ["initial", "copper", "reduction"] as const) {
    const r = oxygenRecords.mass[key];
    expect(Math.abs(r.after - r.before)).toBeCloseTo(r.oxygen, 12);
  }
  const r = oxygenRecords.mass.enclosed;
  expect(r.after - r.before).toBe(0);
  expect(r.direction).toBe("internal-transfer-no-total-change");
  expect(oxygenExpected("mass", { record: "reduction" }).direction).toBe(
    "oxygen-left-this-sample",
  );
});
test("oxygen-only criteria do not confuse neutralisation, identification, and broader electron-redox", () => {
  expect(oxygenExpected("evidence", { record: "acid" }).conclusion).toBe(
    "neutralisation-not-metal-reduction",
  );
  expect(oxygenExpected("evidence", { record: "noOxygen" }).conclusion).toBe(
    "oxygen-model-insufficient",
  );
  expect(oxygenExpected("evidence", { record: "colourOnly" }).conclusion).toBe(
    "not-enough-evidence",
  );
});
test("strict saved boards reject coercion, extra keys, missing predictions and invented records", () => {
  const b = initialOxygenBoard("oxidation");
  expect(validOxygenBoard("oxidation", b)).toBe(true);
  for (const bad of [
    { ...b, oxygen: 2 },
    { ...b, record: "other" },
    { ...b, extra: "x" },
    { record: "initial" },
    null,
    [],
  ])
    expect(validOxygenBoard("oxidation", bad)).toBe(false);
});
