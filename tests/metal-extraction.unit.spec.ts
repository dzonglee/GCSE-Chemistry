import { test, expect } from "@playwright/test";
import {
  extractionRecords,
  extractionChoices,
  extractionExpected,
  extractionPrediction,
  initialExtractionBoard,
  validExtractionBoard,
  type ExtractionMode,
} from "../src/lib/metal-extraction";
test("every supplied record admits its prediction and rejects every alternative field value", () => {
  for (const mode of Object.keys(extractionRecords) as ExtractionMode[])
    for (const record of Object.keys(extractionRecords[mode])) {
      const b = { ...initialExtractionBoard(mode), record },
        expected = extractionExpected(mode, b),
        right = { ...b, ...expected };
      expect(validExtractionBoard(mode, right)).toBe(true);
      expect(extractionPrediction(mode, right)).toEqual({
        complete: true,
        correct: true,
      });
      expect(extractionPrediction(mode, b)).toEqual({
        complete: false,
        correct: false,
      });
      for (const [field, value] of Object.entries(expected))
        for (const wrong of extractionChoices[mode][field].filter(
          (v) => v !== value && v !== "unset",
        ))
          expect(
            extractionPrediction(mode, { ...right, [field]: wrong }).correct,
          ).toBe(false);
    }
});
test("ore grade and compound composition retain different numerical denominators", () => {
  expect(extractionExpected("grade", { record: "initial" })).toEqual({
    oxide: "25",
    metal: "20",
  });
  expect(extractionExpected("grade", { record: "iron" })).toEqual({
    oxide: "60",
    metal: "42",
  });
  const al = extractionExpected("grade", { record: "aluminium" });
  expect(Number(al.oxide)).toBeCloseTo(40 * 0.38, 12);
  expect(Number(al.metal)).toBeCloseTo((40 * 0.38 * 54) / 102, 12);
});
test("suitability cannot be overridden by cost or native purity assumptions", () => {
  expect(extractionExpected("route", { record: "aluminium" })).toEqual({
    route: "electrolysis",
    reason: "carbon-cannot-reduce",
  });
  expect(extractionExpected("route", { record: "carbide" }).route).toBe(
    "supplied-noncarbon-process",
  );
  expect(extractionExpected("source", { record: "gold" }).identity).toBe(
    "uncombined-metal-in-mixture",
  );
  expect(extractionExpected("source", { record: "crushed" }).change).toBe(
    "not-yet-reduced-to-metal",
  );
  expect(extractionExpected("source", { record: "carbonate" }).change).toBe(
    "oxide-preparation-not-metal-extraction",
  );
});
test("carbon products are given specifically rather than imposed universally", () => {
  expect(extractionExpected("oxygen", { record: "initial" })).toEqual({
    reduced: "CuO",
    carbonProduct: "CO2",
    oxygen: "2",
  });
  for (const record of ["nickel", "zinc"])
    expect(extractionExpected("oxygen", { record }).carbonProduct).toBe("CO");
});
test("actual-output cost and simultaneous constraints support neither route", () => {
  expect(80 / 20).toBe(4);
  expect(112.5 / 25).toBe(4.5);
  expect(22 / 20).toBe(1.1);
  expect(16 / 25).toBe(0.64);
  expect(extractionExpected("decision", { record: "initial" }).route).toBe("A");
  expect(extractionExpected("decision", { record: "emissions" }).route).toBe(
    "B",
  );
  expect(extractionExpected("decision", { record: "both" }).route).toBe(
    "neither",
  );
});
test("saved prediction domains reject coercion, extra fields, missing fields and unknown records", () => {
  const b = initialExtractionBoard("grade");
  for (const bad of [
    { ...b, oxide: 25 },
    { ...b, record: "invented" },
    { ...b, extra: "x" },
    { record: "initial" },
    null,
    [],
  ])
    expect(validExtractionBoard("grade", bad)).toBe(false);
});
