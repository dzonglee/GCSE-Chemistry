import { test, expect } from "@playwright/test";
import {
  GCSE_AVOGADRO,
  molesFromMass,
  massFromMoles,
  numberOfEntities,
  amountFromEntities,
  standardCount,
  moleSpecies,
  massSamples,
  moleChoices,
  populations,
  initialMoleBoard,
  validMoleBoard,
  molePrediction,
  type MoleMode,
} from "../src/lib/mole-amounts";
import { molesJourney as journey } from "../src/content/journeys/moles";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
import { initialBoard, validHistory } from "../src/lib/workbench";
import {
  emptyProgress,
  emptyWork,
  decode,
  exposureIds,
} from "../src/lib/progress";
test("units and molar mass connect mass amount and stated population", () => {
  expect(GCSE_AVOGADRO).toBe(6.02e23);
  expect(molesFromMass(9, 18)).toBe(0.5);
  expect(massFromMoles(0.25, 44)).toBe(11);
  expect(molesFromMass(0.45, 18)).toBe(0.025);
  expect(numberOfEntities(0.5)).toBe(3.01e23);
  expect(amountFromEntities(1.204e24)).toBe(2);
  expect(standardCount(1.204e24)).toEqual({ coefficient: 1.204, power: 24 });
  expect(standardCount((2 / 70) * GCSE_AVOGADRO)).toEqual({
    coefficient: 1.72,
    power: 22,
  });
  expect(() => molesFromMass(9, 0)).toThrow();
  expect(() => massFromMoles(Infinity, 18)).toThrow();
  expect(() => numberOfEntities(1e300)).toThrow();
  expect(() => standardCount(0)).toThrow();
});
test("all selectable sample conversions preserve mass unit and require both correct molar mass and amount", () => {
  for (const mode of ["mass", "reverse", "entities", "inverse"] as MoleMode[]) {
    const b = initialMoleBoard(mode);
    expect(validMoleBoard(mode, b)).toBe(true);
    expect(molePrediction(mode, b).correct).toBe(false);
    expect(validMoleBoard(mode, { ...b, extra: 1 })).toBe(false);
  }
  for (const [sample, d] of Object.entries(massSamples))
    for (const unit of ["g", "mg", "kg"]) {
      const b = {
        sample,
        unit,
        grams: String(d.grams),
        molarMass: String(d.molarMass),
        amount: String(d.grams / d.molarMass),
      };
      expect(validMoleBoard("mass", b)).toBe(true);
      expect(molePrediction("mass", b).correct).toBe(true);
    }
  for (const [species, d] of Object.entries(moleSpecies))
    for (const amount of moleChoices.reverse.amount) {
      const b = {
        species,
        amount,
        molarMass: String(d.molarMass),
        mass: String(amount * d.molarMass),
      };
      expect(validMoleBoard("reverse", b)).toBe(true);
      expect(molePrediction("reverse", b).correct).toBe(true);
    }
  expect(
    molePrediction("mass", {
      sample: "water",
      unit: "mg",
      grams: "9000",
      molarMass: "18",
      amount: "500",
    }).correct,
  ).toBe(false);
  expect(
    molePrediction("reverse", {
      species: "CO2",
      amount: 0.25,
      molarMass: "12",
      mass: "3",
    }).correct,
  ).toBe(false);
});
test("entity labels standard-form normalization and constituent counts remain scientifically distinct", () => {
  for (const [species, d] of Object.entries(moleSpecies))
    for (const amount of moleChoices.entities.amount) {
      const s = standardCount(amount * GCSE_AVOGADRO),
        b = {
          species,
          amount,
          entity: d.entity,
          coefficient: String(s.coefficient),
          power: String(s.power),
          constituentAmount: String(amount * d.constituents),
        };
      expect(validMoleBoard("entities", b)).toBe(true);
      expect(molePrediction("entities", b).correct).toBe(true);
      expect(
        molePrediction("entities", { ...b, entity: "atoms" }).correct,
      ).toBe(false);
    }
  expect(
    molePrediction("entities", {
      species: "O2",
      amount: 0.5,
      entity: "molecules",
      coefficient: "3.01",
      power: "23",
      constituentAmount: "0.5",
    }).correct,
  ).toBe(false);
  expect(
    molePrediction("entities", {
      species: "NaCl",
      amount: 2,
      entity: "molecules",
      coefficient: "1.204",
      power: "24",
      constituentAmount: "4",
    }).correct,
  ).toBe(false);
  expect(
    molePrediction("entities", {
      species: "O2",
      amount: 2,
      entity: "molecules",
      coefficient: "12.04",
      power: "23",
      constituentAmount: "4",
    }).correct,
  ).toBe(false);
  for (const [species, d] of Object.entries(moleSpecies))
    for (const [population, count] of Object.entries(populations)) {
      const amount = count / GCSE_AVOGADRO,
        b = {
          species,
          population,
          amount: String(amount),
          mass: String(amount * d.molarMass),
        };
      expect(validMoleBoard("inverse", b)).toBe(true);
      expect(molePrediction("inverse", b).correct).toBe(true);
    }
});
test("49 individual task references preserve named entity working and written responses stay self-reviewed", () => {
  expect(tasks(journey)).toHaveLength(49);
  expect(journey.practice).toHaveLength(22);
  expect(new Set(tasks(journey).map((q) => q.id)).size).toBe(49);
  for (const q of tasks(journey)) {
    expect(mark(q, q.answer).correct, q.id).toBe(!q.rubric);
    if (q.rubric) expect(mark(q, q.answer).selfReview).toBe(true);
    for (const wrong of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, wrong).correct, q.id).toBe(false);
  }
  const q = journey.practice.find((q) => q.id === "mo-v1-p-total-ions")!;
  expect(
    mark(q, JSON.stringify({ coefficient: "12.04", power: "23" })).correct,
  ).toBe(false);
  expect(
    mark(
      journey.practice.find((q) => q.id === "mo-v1-p-cage-amount")!,
      "1/35",
    ).correct,
  ).toBe(true);
  expect(
    mark(
      journey.practice.find((q) => q.id === "mo-v1-p-cage-amount")!,
      "0.0286",
    ).correct,
  ).toBe(true);
  const atomCount = journey.practice.find(
    (q) => q.id === "mo-v1-p-total-atoms",
  )!;
  expect(mark(atomCount, "9.030000000000001e23").correct).toBe(true);
  expect(mark(atomCount, "9.03e22").correct).toBe(false);
  expect(mark(atomCount, "3.01e23").correct).toBe(false);
});
test("refocused Higher route retains all six legacy identities and strict saved predictions", () => {
  const l = lessons.find((l) => l.slug === "moles-and-reacting-masses")!;
  expect(l.tier).toBe("higher");
  expect(l.course).toBe("combined");
  expect(l.prerequisite).toBe("formulae-and-mass");
  expect([...l.questions, ...l.checks].map((q) => q.id)).toEqual(
    Array.from({ length: 6 }, (_, i) => `moles-and-reacting-masses-${i}`),
  );
  const p = emptyProgress(),
    w = emptyWork();
  w.taskModels = {};
  for (const q of journey.guided) {
    const b = initialBoard(q.model!);
    expect(validHistory(q.model!, [b])).toBe(true);
    expect(validHistory(q.model!, [])).toBe(false);
    expect(validHistory(q.model!, [b, b])).toBe(false);
    w.taskModels[q.id] = [b];
  }
  p.work[l.slug] = w;
  expect(decode(JSON.stringify(p))).toEqual(p);
  w.taskModels["mo-v1-g-reverse"] = [
    { ...initialMoleBoard("reverse"), amount: "0.25" },
  ];
  expect(decode(JSON.stringify(p))).toBeNull();
  expect(exposureIds(["mo-v1-ca-unit"])).toContain("mo-v1-r-unit");
  expect(exposureIds(["mo-v1-g-mass"])).toContain(
    "moles-and-reacting-masses-1",
  );
  expect(exposureIds(["mo-v1-ca-amount"])).toEqual(["mo-v1-ca-amount"]);
});

test("fractional transfer retains sensible three-significant-figure approximation without accepting a shifted result", () => {
  const q = journey.practice.find((q) => q.id === "mo-v1-p-cage-amount")!;
  expect(mark(q, "0.0286").correct).toBe(true);
  expect(mark(q, "0.0285").correct).toBe(false);
  expect(mark(q, "0.02862").correct).toBe(false);
});
