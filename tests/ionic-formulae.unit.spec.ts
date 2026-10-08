import { test, expect } from "@playwright/test";
import {
  formulaLedger,
  formulaRatio,
  normaliseFormula,
} from "../src/lib/ionic-formulae";
import {
  checkBoard,
  initialBoard,
  validHistory,
  validBoard,
} from "../src/lib/workbench";
import { ionicFormulaeJourney } from "../src/content/journeys/ionic-formulae";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
test("independent charge ratios preserve whole polyatomic groups and their atom counts", () => {
  expect(formulaRatio("sodium", "sulfate")).toEqual([2, 1]);
  expect(formulaLedger("sodium", "sulfate", 2, 1)).toMatchObject({
    formula: "Na2SO4",
    atoms: { Na: 2, S: 1, O: 4 },
    charge: 0,
    simplest: true,
  });
  expect(formulaLedger("magnesium", "hydroxide", 1, 2)).toMatchObject({
    formula: "Mg(OH)2",
    atoms: { Mg: 1, O: 2, H: 2 },
    charge: 0,
  });
  expect(formulaLedger("calcium", "nitrate", 1, 2)).toMatchObject({
    formula: "Ca(NO3)2",
    atoms: { Ca: 1, N: 2, O: 6 },
    charge: 0,
  });
  expect(formulaLedger("aluminium", "sulfate", 2, 3)).toMatchObject({
    formula: "Al2(SO4)3",
    atoms: { Al: 2, S: 3, O: 12 },
    charge: 0,
  });
  expect(formulaLedger("ammonium", "sulfate", 2, 1)).toMatchObject({
    formula: "(NH4)2SO4",
    atoms: { N: 2, H: 8, S: 1, O: 4 },
    charge: 0,
  });
  expect(() => formulaRatio("chloride", "sodium")).toThrow();
});
test("neutral but non-simplest counts and non-neutral ratios remain distinct errors", () => {
  const model = ionicFormulaeJourney.guided[3].model!;
  expect(checkBoard(model, { cations: 2, anions: 3 }).correct).toBe(true);
  expect(checkBoard(model, { cations: 4, anions: 6 }).feedback).toContain(
    "not the simplest",
  );
  expect(checkBoard(model, { cations: 3, anions: 2 }).feedback).toContain(
    "net charge 5",
  );
  for (let c = 1; c <= 6; c++)
    for (let a = 1; a <= 6; a++) {
      expect(checkBoard(model, { cations: c, anions: a }).correct).toBe(
        c === 2 && a === 3,
      );
      expect(formulaLedger("aluminium", "sulfate", c, a).atoms.O).toBe(4 * a);
    }
});
test("strict single whole-ion operations reject fractions jumps and altered-ion fields", () => {
  const model = ionicFormulaeJourney.guided[0].model!,
    start = initialBoard(model);
  expect(validHistory(model, [start, { ...start, cations: 2 }])).toBe(true);
  expect(validHistory(model, [start, { ...start, cations: 3 }])).toBe(false);
  expect(validBoard(model, { ...start, cations: 1.5 })).toBe(false);
  expect(validBoard(model, { ...start, anions: 0 })).toBe(false);
  expect(validBoard(model, { ...start, sulfateOxygen: 2 })).toBe(false);
});
test("formula marking accepts presentation subscripts while preserving capitals parentheses and simplest ratio", () => {
  const q = ionicFormulaeJourney.guided[2];
  expect(normaliseFormula(" Ca(NO₃)₂ ")).toBe("Ca(NO3)2");
  expect(mark(q, "Ca(NO₃)₂").correct).toBe(true);
  for (const wrong of [
    "ca(no3)2",
    "CA(NO3)2",
    "CaNO32",
    "Ca(NO3)3",
    "Ca2(NO3)4",
    "CaN2O6",
  ])
    expect(mark(q, wrong).correct, wrong).toBe(false);
  expect(mark(q, "Ca(NO3)2 +").invalid).toBe(true);
  expect(mark(q, "").empty).toBe(true);
  const hydroxide = ionicFormulaeJourney.guided[1];
  expect(mark(hydroxide, "MgOH2").correct).toBe(false);
  expect(mark(hydroxide, "Mg(OH)2").correct).toBe(true);
  const single = ionicFormulaeJourney.practice.find(
    (q) => q.id === "if-v1-p-single-group",
  )!;
  expect(mark(single, "Na(OH)").correct).toBe(true);
});
test("all forty individually authored tasks reserve assessments and avoid automatic written correctness", () => {
  const all = tasks(ionicFormulaeJourney);
  expect(all).toHaveLength(40);
  expect(new Set(all.map((q) => q.id)).size).toBe(40);
  expect(ionicFormulaeJourney.checkForms.map((f) => f.length)).toEqual([5, 5]);
  expect(ionicFormulaeJourney.reviewForms.map((f) => f.length)).toEqual([2, 2]);
  for (const q of all) {
    expect(mark(q, q.answer).correct, q.id).toBe(!q.rubric);
    for (const error of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, error).correct, q.id).toBe(false);
  }
});
