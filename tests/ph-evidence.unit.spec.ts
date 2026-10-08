import { test, expect } from "@playwright/test";
import {
  initialPhBoard,
  phChoices,
  phClass,
  phExpected,
  phPrediction,
  phRecords,
  validPhBoard,
  type PhMode,
} from "../src/lib/ph-evidence";
test("all31 individually selected records have reachable correct predictions without accepting wrong claims", () => {
  for (const mode of Object.keys(phChoices) as PhMode[])
    for (const record of Object.keys(phRecords[mode])) {
      const b = { ...initialPhBoard(mode), record },
        expected = phExpected(mode, b),
        correct: Record<string, string> = { ...b, ...expected };
      if (mode === "colour")
        correct.guess = String(
          phRecords.colour[record as keyof typeof phRecords.colour].min,
        );
      expect(phPrediction(mode, correct).correct, mode + record).toBe(true);
      expect(phPrediction(mode, b).correct, mode + record).toBe(false);
      for (const [field, value] of Object.entries(expected))
        for (const wrong of phChoices[mode][field].filter(
          (v) => v !== "unset" && v !== value,
        ))
          expect(
            phPrediction(mode, { ...correct, [field]: wrong }).correct,
            mode + record + field + wrong,
          ).toBe(false);
    }
});
test("decimal boundaries, usual endpoints and neutral ions remain distinct", () => {
  expect(phClass(6.8)).toBe("acidic");
  expect(phClass(7)).toBe("neutral");
  expect(phClass(7.2)).toBe("alkaline");
  expect(phClass(0)).toBe("acidic");
  expect(phClass(14)).toBe("alkaline");
  expect(
    phPrediction("classification", {
      record: "neutral",
      classification: "neutral",
      ions: "none",
    }).correct,
  ).toBe(false);
  expect(
    phPrediction("classification", {
      record: "neutral",
      classification: "neutral",
      ions: "balanced",
    }).correct,
  ).toBe(true);
});
test("universal colour estimates accept each supplied band without implying exact numerical precision", () => {
  for (const [record, r] of Object.entries(phRecords.colour))
    for (let guess = 0; guess <= 14; guess++) {
      const b = {
        record,
        guess: String(guess),
        classification: r.classification,
        certainty: "approximate",
      };
      expect(phPrediction("colour", b).correct).toBe(
        guess >= r.min && guess <= r.max,
      );
      expect(
        phPrediction("colour", { ...b, certainty: "exact-every-time" }).correct,
      ).toBe(false);
    }
});
test("named indicators do not all turn green or change at neutrality", () => {
  expect(phExpected("indicator", { record: "phenolNeutral" })).toEqual({
    colour: "colourless",
    neutrality: "yes",
  });
  expect(phExpected("indicator", { record: "methylMildAcid" })).toEqual({
    colour: "yellow",
    neutrality: "no",
  });
  expect(phExpected("indicator", { record: "unknown" })).toEqual({
    colour: "colourless",
    neutrality: "not-established",
  });
  expect(
    phPrediction("indicator", {
      record: "unknown",
      colour: "colourless",
      neutrality: "yes",
    }).correct,
  ).toBe(false);
});
test("original solution and powder observations agree with independent one-decimal chemical references", () => {
  const molarMass = 40 + 2 * (16 + 1);
  for (const [record, r] of Object.entries(phRecords.neutralisation))
    for (let i = 0; i < r.amounts.length; i++) {
      const amount = r.amounts[i],
        hydrogen = record === "initial" ? 0.1 * 0.025 : 2 * (0.1 / molarMass),
        hydroxide =
          record === "initial"
            ? (0.1 * amount) / 1000
            : (2 * amount) / molarMass,
        volume = record === "initial" ? 0.025 + amount / 1000 : 0.2;
      const ph =
        Math.abs(hydrogen - hydroxide) < 1e-12
          ? 7
          : hydrogen > hydroxide
            ? -Math.log10((hydrogen - hydroxide) / volume)
            : 14 + Math.log10((hydroxide - hydrogen) / volume);
      expect(r.ph[i]).toBe(Number(ph.toFixed(1)));
      const b = {
        record,
        point: String(i),
        classification: phClass(r.ph[i]),
        excess: r.ph[i] < 7 ? "H+" : r.ph[i] > 7 ? "OH−" : "matched",
      };
      expect(phPrediction("neutralisation", b).correct).toBe(true);
    }
});
test("canonical boards reject coercion, unknown fields, invalid markers and unsupported choices", () => {
  const b = initialPhBoard("colour");
  for (const bad of [
    { ...b, guess: 3 },
    { ...b, guess: "03" },
    { ...b, guess: "15" },
    { ...b, guess: "-1" },
    { ...b, extra: "0" },
    { ...b, record: "missing" },
  ])
    expect(validPhBoard("colour", bad)).toBe(false);
  expect(
    validPhBoard("neutralisation", {
      ...initialPhBoard("neutralisation"),
      point: "7",
    }),
  ).toBe(false);
});
