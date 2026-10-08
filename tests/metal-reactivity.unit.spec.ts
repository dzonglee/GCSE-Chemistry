import { test, expect } from "@playwright/test";
import {
  reactivityReference,
  moreReactive,
  metalDisplacement,
  evidenceOrder,
  metalRecords,
  metalChoices,
  initialMetalBoard,
  validMetalBoard,
  metalExpected,
  metalPrediction,
  type MetalMode,
} from "../src/lib/metal-reactivity";
test("ordinal reference preserves AQA core order and identifies hydrogen/carbon as thresholds", () => {
  expect(
    reactivityReference.filter((x) =>
      ["K", "Na", "Li", "Ca", "Mg", "Zn", "Fe", "Cu"].includes(x),
    ),
  ).toEqual(["K", "Na", "Li", "Ca", "Mg", "Zn", "Fe", "Cu"]);
  expect(moreReactive("Zn", "H")).toBe(true);
  expect(moreReactive("Cu", "H")).toBe(false);
  expect(moreReactive("Al", "C")).toBe(true);
  expect(moreReactive("Zn", "C")).toBe(false);
  expect(moreReactive("Cu", "Cu")).toBe(false);
});
test("only an added more reactive metal forms the displaced metal; no transmutation", () => {
  for (const added of ["Zn", "Mg", "Fe"] as const) {
    expect(metalDisplacement(added, "Cu")).toMatchObject({
      reacts: true,
      solid: "Cu",
      cation: added,
      charge: 2,
    });
    expect(metalDisplacement("Cu", added)).toMatchObject({
      reacts: false,
      solid: "unchanged",
      cation: added,
    });
  }
  expect(metalDisplacement("Cu", "Cu").reacts).toBe(false);
  expect(() => metalDisplacement("H" as "Cu", "Zn")).toThrow();
});
test("transitive evidence establishes order while missing comparison cannot force one", () => {
  expect(
    evidenceOrder(
      ["A", "B", "C"],
      [
        ["A", "B"],
        ["B", "C"],
      ],
    ),
  ).toEqual({ consistent: true, complete: true, order: ["A", "B", "C"] });
  expect(
    evidenceOrder(
      ["A", "B", "C"],
      [
        ["A", "C"],
        ["B", "C"],
      ],
    ),
  ).toEqual({ consistent: true, complete: false, order: null });
  expect(
    evidenceOrder(
      ["A", "B", "C"],
      [
        ["A", "B"],
        ["B", "C"],
        ["C", "A"],
      ],
    ),
  ).toEqual({ consistent: false, complete: false, order: null });
  expect(() => evidenceOrder(["A", "A"], [])).toThrow();
  expect(() => evidenceOrder(["A", "B"], [["A", "X"]])).toThrow();
});
test("every record has reachable correct predictions and wrong fields remain incorrect", () => {
  for (const mode of Object.keys(metalRecords) as MetalMode[])
    for (const record of Object.keys(metalRecords[mode])) {
      const b = { ...initialMetalBoard(mode), record } as Record<
        string,
        string
      >;
      if (mode === "series")
        b.order =
          metalRecords.series[
            record as keyof typeof metalRecords.series
          ].metals.join(",");
      expect(validMetalBoard(mode, b), `${mode}/${record}`).toBe(true);
      const expected = metalExpected(mode, b),
        right = { ...b, ...expected };
      expect(validMetalBoard(mode, right)).toBe(true);
      expect(metalPrediction(mode, right)).toEqual({
        complete: true,
        correct: true,
      });
      for (const field of Object.keys(expected)) {
        const wrong = metalChoices[mode][field].find(
          (v) =>
            v !== "unset" &&
            v !== expected[field] &&
            (mode !== "series" ||
              v
                .split(",")
                .every((n) =>
                  (
                    metalRecords.series[
                      record as keyof typeof metalRecords.series
                    ].metals as readonly string[]
                  ).includes(n),
                )),
        );
        expect(wrong).toBeDefined();
        expect(
          metalPrediction(mode, { ...right, [field]: wrong! }).correct,
        ).toBe(false);
      }
    }
});
test("strict saved series rejects a changed record with old tiles and numeric coercion", () => {
  const b = initialMetalBoard("series");
  expect(validMetalBoard("series", b)).toBe(true);
  expect(validMetalBoard("series", { ...b, record: "alkali" })).toBe(false);
  for (const bad of [
    { ...b, order: "Cu,Cu,Zn" },
    { ...b, order: 123 },
    { ...b, extra: "x" },
    [],
  ])
    expect(validMetalBoard("series", bad)).toBe(false);
  expect(
    validMetalBoard("observations", {
      ...initialMetalBoard("observations"),
      gas: "CO2",
    }),
  ).toBe(false);
});
test("room-temperature magnesium observation is not a claim of zero reaction; copper acid and calcium water remain distinct", () => {
  expect(metalRecords.observations.slow.interpretation).toBe(
    "short-observation-not-no-reaction",
  );
  expect(metalRecords.observations.slow.gas).toBe("not-detected");
  expect(metalRecords.observations.copper.gas).toBe("none");
  expect(metalRecords.observations.calcium.equation).toBe(
    "Ca + 2H2O → Ca(OH)2 + H2",
  );
  expect(metalRecords.fair.finalOnly.conclusion).toBe(
    "cannot-rank-final-yield",
  );
});
