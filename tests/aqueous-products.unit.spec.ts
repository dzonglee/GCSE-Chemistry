import { test, expect } from "@playwright/test";
import {
  aqueousRecords,
  aqueousChoices,
  aqueousExpected,
  aqueousPrediction,
  initialAqueousBoard,
  validAqueousBoard,
  type AqueousMode,
} from "../src/lib/aqueous-products";
test("all26 individually specified records reject every offered wrong product, reason and evidence claim", () => {
  let count = 0;
  for (const mode of Object.keys(aqueousRecords) as AqueousMode[])
    for (const record of Object.keys(aqueousRecords[mode])) {
      const b = { ...initialAqueousBoard(mode), record },
        e = aqueousExpected(mode, b),
        right = { ...b, ...e };
      expect(validAqueousBoard(mode, right)).toBe(true);
      expect(aqueousPrediction(mode, right)).toEqual({
        complete: true,
        correct: true,
      });
      expect(aqueousPrediction(mode, b).correct).toBe(false);
      for (const [field, value] of Object.entries(e))
        for (const wrong of aqueousChoices[mode][field].filter(
          (v) => v !== value && v !== "unset",
        ))
          expect(
            aqueousPrediction(mode, { ...right, [field]: wrong }).correct,
          ).toBe(false);
      count++;
    }
  expect(count).toBe(26);
});
test("water competition depends on phase and the supplied metal reactivity", () => {
  expect(aqueousExpected("cathode", { record: "initial" })).toEqual({
    product: "Cu",
    reason: "metal-below-hydrogen",
  });
  expect(aqueousExpected("cathode", { record: "silver" })).toEqual({
    product: "Ag",
    reason: "metal-below-hydrogen",
  });
  expect(aqueousExpected("cathode", { record: "sodium" })).toEqual({
    product: "H2",
    reason: "water-competes",
  });
  expect(aqueousExpected("cathode", { record: "magnesium" })).toEqual({
    product: "H2",
    reason: "water-competes",
  });
  expect(aqueousExpected("cathode", { record: "molten" })).toEqual({
    product: "Na",
    reason: "no-water",
  });
});
test("standard halide and non-halide predictions name neutral products without sulfate discharge", () => {
  const expected = {
    initial: ["H2", "Cl2"],
    copper: ["Cu", "O2"],
    bromide: ["H2", "Br2"],
    copperChloride: ["Cu", "Cl2"],
    sulfate: ["H2", "O2"],
    acid: ["H2", "O2"],
    silver: ["Ag", "O2"],
  };
  for (const [record, [cathode, anode]] of Object.entries(expected))
    expect(aqueousExpected("products", { record })).toEqual({ cathode, anode });
});
test("copper electrode replenishment and inert oxygen cases remain distinct at fixed volume", () => {
  expect(aqueousExpected("transfer", { record: "initial" })).toEqual({
    anode: "copper-dissolves",
    solution: "copper-ions-replenished",
  });
  expect(aqueousExpected("transfer", { record: "inert" })).toEqual({
    anode: "oxygen-forms",
    solution: "copper-ions-decrease",
  });
  expect(aqueousExpected("investigation", { record: "bubbles" }).decision).toBe(
    "identity-not-established",
  );
  expect(
    aqueousExpected("investigation", { record: "confounded" }).decision,
  ).toBe("material-effect-not-isolated");
});
test("positive correlation, through-origin proportion and original graph readings are independent", () => {
  expect(aqueousExpected("graph", { record: "initial" })).toEqual({
    volume: "4",
    direct: "hydrogen-only",
    positive: "both",
  });
  expect(aqueousExpected("graph", { record: "later" }).volume).toBe(
    String(16 * 0.5),
  );
  expect(aqueousExpected("graph", { record: "offset" })).toEqual({
    volume: String(2 + 8 * 0.5),
    direct: "neither",
    positive: "both",
  });
  for (const bad of [
    null,
    [],
    { ...initialAqueousBoard("graph"), volume: "11" },
    { ...initialAqueousBoard("graph"), volume: 4 },
    { ...initialAqueousBoard("graph"), volume: "04" },
    { ...initialAqueousBoard("graph"), extra: "ignored" },
  ])
    expect(validAqueousBoard("graph", bad)).toBe(false);
});

test("inverted gas readings use canonical 0.2 cm³ divisions and reject malformed scale positions", () => {
  expect(aqueousExpected("reading", { record: "initial" })).toEqual({
    ticks: String((4 + 0.4) / 0.2),
  });
  expect(aqueousExpected("reading", { record: "low" }).ticks).toBe("14");
  expect(aqueousExpected("reading", { record: "high" }).ticks).toBe("31");
  const b = initialAqueousBoard("reading");
  expect(b.ticks).toBe("0");
  for (const bad of [
    { ...b, ticks: "41" },
    { ...b, ticks: 22 },
    { ...b, ticks: "022" },
    { ...b, ticks: "4.4" },
  ])
    expect(validAqueousBoard("reading", bad)).toBe(false);
});
