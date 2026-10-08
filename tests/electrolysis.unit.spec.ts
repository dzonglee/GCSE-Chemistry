import { test, expect } from "@playwright/test";
import {
  electrolysisRecords,
  electrolysisChoices,
  electrolysisExpected,
  electrolysisPrediction,
  initialElectrolysisBoard,
  validElectrolysisBoard,
  type ElectrolysisMode,
} from "../src/lib/electrolysis";
test("all20 supplied records admit correct predictions and reject every selectable wrong result", () => {
  let count = 0;
  for (const mode of Object.keys(electrolysisRecords) as ElectrolysisMode[])
    for (const record of Object.keys(electrolysisRecords[mode])) {
      const b = { ...initialElectrolysisBoard(mode), record },
        e = electrolysisExpected(mode, b),
        right = { ...b, ...e };
      expect(validElectrolysisBoard(mode, right)).toBe(true);
      expect(electrolysisPrediction(mode, right)).toEqual({
        complete: true,
        correct: true,
      });
      expect(electrolysisPrediction(mode, b).correct).toBe(false);
      for (const [field, v] of Object.entries(e))
        for (const wrong of electrolysisChoices[mode][field].filter(
          (x) => x !== v && x !== "unset",
        ))
          expect(
            electrolysisPrediction(mode, { ...right, [field]: wrong }).correct,
          ).toBe(false);
      count++;
    }
  expect(count).toBe(20);
});
test("electrode polarity rather than page position defines each ion destination", () => {
  expect(electrolysisExpected("movement", { record: "initial" })).toEqual({
    position: "-3",
    electrode: "cathode",
  });
  expect(electrolysisExpected("movement", { record: "reversed" })).toEqual({
    position: "3",
    electrode: "cathode",
  });
  expect(electrolysisExpected("movement", { record: "chloride" })).toEqual({
    position: "3",
    electrode: "anode",
  });
  expect(electrolysisExpected("movement", { record: "bromide" })).toEqual({
    position: "-3",
    electrode: "anode",
  });
});
test("solid and metallic carriers remain distinct from molten or dissolved ionic conduction", () => {
  expect(electrolysisExpected("conductivity", { record: "initial" })).toEqual({
    conduction: "not-mobile-ionic",
    carrier: "fixed-ions",
  });
  expect(electrolysisExpected("conductivity", { record: "molten" })).toEqual({
    conduction: "ionic-electrolyte",
    carrier: "mobile-ions",
  });
  expect(
    electrolysisExpected("conductivity", { record: "solution" }).carrier,
  ).toBe("mobile-ions");
  expect(electrolysisExpected("conductivity", { record: "copper" })).toEqual({
    conduction: "metallic-conductor",
    carrier: "mobile-electrons",
  });
});
test("binary molten products are neutral elements and cryolite does not remove energy or change reactivity", () => {
  expect(electrolysisExpected("products", { record: "initial" })).toEqual({
    cathode: "Zn",
    anode: "Cl2",
  });
  expect(electrolysisExpected("products", { record: "sodium" })).toEqual({
    cathode: "Na",
    anode: "Cl2",
  });
  expect(electrolysisExpected("products", { record: "lead" })).toEqual({
    cathode: "Pb",
    anode: "Br2",
  });
  expect(electrolysisExpected("mixture", { record: "initial" })).toEqual({
    reason: "lower-operating-temperature",
    energy: "heating-and-current-still-needed",
  });
  expect(electrolysisExpected("mixture", { record: "carbon" }).reason).toBe(
    "carbon-cannot-reduce-oxide",
  );
  expect(electrolysisExpected("anode", { record: "inert" }).change).toBe(
    "not-consumed-in-this-record",
  );
});
test("malformed ion positions, unknown fields and noncanonical values never enter a native state", () => {
  const b = initialElectrolysisBoard("movement");
  for (const bad of [
    null,
    [],
    {},
    { ...b, position: "4" },
    { ...b, position: 1 },
    { ...b, position: "01" },
    { ...b, extra: "ignored" },
    { ...b, electrode: "positive-cathode" },
  ])
    expect(validElectrolysisBoard("movement", bad)).toBe(false);
});
