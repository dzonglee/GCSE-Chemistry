import { test, expect } from "@playwright/test";
import {
  saltRecords,
  saltChoices,
  saltExpected,
  saltPrediction,
  initialSaltBoard,
  validSaltBoard,
  type SaltMode,
} from "../src/lib/soluble-salts";
test("all18 supplied records keep distinct physical fractions and reject every selectable wrong prediction", () => {
  let count = 0;
  for (const mode of Object.keys(saltRecords) as SaltMode[])
    for (const record of Object.keys(saltRecords[mode])) {
      const b = { ...initialSaltBoard(mode), record },
        e = saltExpected(mode, b),
        right = { ...b, ...e };
      expect(validSaltBoard(mode, right)).toBe(true);
      expect(saltPrediction(mode, right)).toEqual({
        complete: true,
        correct: true,
      });
      expect(saltPrediction(mode, b).correct).toBe(false);
      for (const [field, v] of Object.entries(e))
        for (const wrong of saltChoices[mode][field].filter(
          (x) => x !== v && x !== "unset",
        ))
          expect(
            saltPrediction(mode, { ...right, [field]: wrong }).correct,
          ).toBe(false);
      count++;
    }
  expect(count).toBe(18);
});
test("solubility controls route and dissolved impurities remain in the filtrate", () => {
  expect(saltExpected("method", { record: "initial" })).toEqual({
    method: "excess-insoluble",
    acid: "sulfuric",
  });
  expect(saltExpected("method", { record: "sodium" }).method).toBe("titration");
  expect(saltExpected("method", { record: "insoluble" }).method).toBe(
    "precipitation",
  );
  expect(saltExpected("filter", { record: "early" })).toEqual({
    residue: "none-of-these-solids",
    filtrate: "salt-and-acid",
  });
  expect(saltExpected("filter", { record: "alkali" }).filtrate).toBe(
    "salt-and-alkali",
  );
  expect(saltExpected("filter", { record: "crystals" })).toEqual({
    residue: "salt-crystals",
    filtrate: "mother-liquor",
  });
});
test("cold capacities scale with retained water without creating crystals or solute", () => {
  for (const [record, dissolved, crystals] of [
    ["initial", 16, 24],
    ["smaller", 8, 12],
    ["unsaturated", 10, 0],
    ["larger", 24, 36],
  ] as const) {
    const e = saltExpected("cooling", { record });
    expect(e).toEqual({
      dissolved: String(dissolved),
      crystals: String(crystals),
    });
    expect(dissolved + crystals).toBe(saltRecords.cooling[record].solute);
  }
});
test("sequence stages identify next action and malformed states never enter saved work", () => {
  const expected = [
    "filter-excess",
    "concentrate",
    "cool",
    "recover-dry",
    "complete",
  ];
  expected.forEach((next, stage) =>
    expect(
      saltExpected("sequence", { record: "initial", stage: String(stage) }),
    ).toEqual({ next }),
  );
  for (const invalid of [
    null,
    [],
    {},
    { ...initialSaltBoard("sequence"), stage: "5" },
    { ...initialSaltBoard("cooling"), crystals: "-2" },
    { ...initialSaltBoard("method"), extra: "ignored" },
  ])
    expect(validSaltBoard("sequence", invalid)).toBe(false);
  expect(
    validSaltBoard("sequence", { ...initialSaltBoard("sequence"), stage: 1 }),
  ).toBe(false);
});
