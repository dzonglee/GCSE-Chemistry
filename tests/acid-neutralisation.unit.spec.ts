import { test, expect } from "@playwright/test";
import {
  acidRecords,
  acidChoices,
  acidExpected,
  acidPrediction,
  initialAcidBoard,
  validAcidBoard,
  type AcidMode,
} from "../src/lib/acid-neutralisation";
test("all25 supplied records admit correct predictions and retain wrong selections as incorrect", () => {
  let count = 0;
  for (const mode of Object.keys(acidRecords) as AcidMode[])
    for (const record of Object.keys(acidRecords[mode])) {
      const b = { ...initialAcidBoard(mode), record },
        e = acidExpected(mode, b),
        right = { ...b, ...e };
      expect(validAcidBoard(mode, right)).toBe(true);
      expect(acidPrediction(mode, right)).toEqual({
        complete: true,
        correct: true,
      });
      expect(acidPrediction(mode, b).correct).toBe(false);
      for (const [field, v] of Object.entries(e))
        for (const wrong of acidChoices[mode][field].filter(
          (x) => x !== v && x !== "unset",
        ))
          expect(
            acidPrediction(mode, { ...right, [field]: wrong }).correct,
          ).toBe(false);
      count++;
    }
  expect(count).toBe(25);
});
test("pairs consume only available supplies, keep excess and do not infer exact pH or net charge", () => {
  expect(acidExpected("pairs", { record: "initial" })).toEqual({
    steps: "4",
    acidRemaining: "0",
    alkaliRemaining: "0",
    classification: "neutral",
  });
  expect(acidExpected("pairs", { record: "acidExcess" })).toEqual({
    steps: "4",
    acidRemaining: "2",
    alkaliRemaining: "0",
    classification: "acidic",
  });
  expect(acidExpected("pairs", { record: "equalVolumes" }).classification).toBe(
    "alkaline",
  );
  expect(
    validAcidBoard("pairs", {
      ...initialAcidBoard("pairs"),
      record: "equalVolumes",
      steps: "3",
    }),
  ).toBe(false);
});
test("ordinary acid reaction families and acid-derived salt formulas stay chemically distinct", () => {
  expect(acidExpected("products", { record: "magnesium" })).toEqual({
    family: "metal",
    gas: "H2",
    water: "no",
  });
  expect(acidExpected("products", { record: "carbonate" })).toEqual({
    family: "carbonate",
    gas: "CO2",
    water: "yes",
  });
  expect(acidExpected("products", { record: "oxide" }).gas).toBe("none");
  expect(acidExpected("salts", { record: "nitrate" }).formula).toBe("Mg(NO3)2");
  expect(acidExpected("salts", { record: "sulfate" }).formula).toBe(
    "Al2(SO4)3",
  );
  expect(acidExpected("salts", { record: "iron" }).formula).toBe("FeCl2");
});
test("insoluble base need not be alkali and observation precision does not overclaim pH or gas", () => {
  expect(acidExpected("identity", { record: "oxide" }).kind).toBe(
    "insoluble-base",
  );
  expect(acidExpected("evidence", { record: "litmus" }).ph).toBe(
    "not-exactly-determined",
  );
  expect(acidExpected("evidence", { record: "bubbles" }).conclusion).toBe(
    "gas-identity-not-established",
  );
  expect(acidExpected("evidence", { record: "warming" }).conclusion).toBe(
    "heat-release-not-complete-neutrality",
  );
});
test("saved native boards reject coercion, invented records, missing fields and impossible reaction counts", () => {
  const b = initialAcidBoard("pairs");
  for (const bad of [
    { ...b, steps: 1 },
    { ...b, steps: "5" },
    { ...b, record: "invented" },
    { ...b, extra: "x" },
    { record: "initial" },
    [],
    null,
  ])
    expect(validAcidBoard("pairs", bad)).toBe(false);
});
