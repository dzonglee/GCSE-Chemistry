import { test, expect } from "@playwright/test";
import {
  balance,
  coefficientBalance,
  halfEquationRecords,
  halfPrediction,
  initialHalfBoard,
  markHalfEquation,
  totals,
  validHalfBoard,
  type HalfEquationKey,
} from "../src/lib/half-equations";
test("charged notation, optional appropriate states, reordered terms and positive multiples preserve conservation", () => {
  const cases: [HalfEquationKey, string][] = [
    ["copper", "Cu²⁺ + 2e⁻ → Cu"],
    ["copper", "2e- + Cu^2+ -> Cu"],
    ["copper", "2Cu2+ + 4e- => 2Cu"],
    ["copper", "Cu2+(aq)+2e- -> Cu(s)"],
    ["hydroxide", "4OH- -> 4e- + 2H2O + O2"],
    ["hydroxide", "4OH⁻ − 4e⁻ → O₂ + 2H₂O"],
    ["sodiumOxidation", "Na - e- ⟶ Na+"],
    ["hydroxide", "8OH⁻ → 2O₂ + 4H₂O + 8e⁻"],
    ["oxide", "2O^2-(l) -> O2(g) + 4e-"],
    ["zincReduction", "Zn2+(l) +2e- -> Zn(s)"],
    ["netMagnesium", "Mg(s) + 2H+(aq) -> Mg2+(aq) + H2(g)"],
    ["netSilver", "2Ag+ + Cu -> 2Ag + Cu2+"],
  ];
  for (const [key, text] of cases)
    expect(markHalfEquation(key, text).correct, text).toBe(true);
  expect(markHalfEquation("copper", "2Cu2+ +4e- ->2Cu", true).correct).toBe(
    false,
  );
  expect(markHalfEquation("copper", "Cu2++2e- ->Cu", true).correct).toBe(true);
});
test("incorrect charge, atoms, identity, side, syntax, states and uncharged electrons are rejected", () => {
  for (const raw of [
    "Cu2+ +e- ->Cu",
    "Cu2+ +2e ->Cu",
    "Cu2+ -> Cu+2e-",
    "Cu2+ +2e- ->2Cu",
    "Cu2+ +2e-(aq) ->Cu",
    "Cu2+(s)+2e- ->Cu",
    "Cu2+ +2e- ->Cu(g)",
    "Cu2+ +0e- ->Cu",
    "Cu2++2e- ->Cu ->Cu",
    "cu2++2e- ->Cu",
    "Cu2+ +2e- -> Cu + H2O",
    "Cu2+ + e- + e- ->Cu",
    "Cu2+ + 2.0e- ->Cu",
  ])
    expect(markHalfEquation("copper", raw).correct, raw).toBe(false);
  for (const raw of [
    "4OH- ->O2+4e-",
    "OH- ->O2+2H2O+e-",
    "4OH- ->O2+2H2O+2e-",
    "4OH- ->O2+2H2O+4e",
    "4OH- -4e- ->O2+2H2O+4e-",
    "4OH- -4e ->O2+2H2O",
  ])
    expect(markHalfEquation("hydroxide", raw).correct, raw).toBe(false);
});
test("all supplied equations independently retain atoms and total charge including electron terms", () => {
  for (const r of Object.values(halfEquationRecords)) {
    const left = r.left.map((species, i) => ({
      species,
      coefficient: r.coefficients[i],
    }));
    const right = r.right.map((species, i) => ({
      species,
      coefficient: r.coefficients[r.left.length + i],
    }));
    const b = balance(left, right);
    expect(b.atoms, r.label).toBe(true);
    expect(b.charge, r.label).toBe(true);
  }
  expect(totals([{ species: "electron", coefficient: 4 }])).toEqual({
    atoms: {},
    charge: -4,
  });
});
test("coefficient models accept balanced multiples but never a zero reaction or negative/uncanonical board", () => {
  expect(halfPrediction("cation", initialHalfBoard("cation")).correct).toBe(
    false,
  );
  const cu = {
    ...initialHalfBoard("cation"),
    a: "2",
    b: "4",
    c: "2",
    electronSide: "left",
  };
  expect(coefficientBalance("cation", cu).correct).toBe(true);
  expect(halfPrediction("cation", { ...cu, b: "3" }).correct).toBe(false);
  const oh = {
    ...initialHalfBoard("anion"),
    a: "4",
    b: "1",
    c: "2",
    d: "4",
    electronSide: "right",
  };
  expect(coefficientBalance("anion", oh).correct).toBe(true);
  expect(coefficientBalance("anion", { ...oh, c: "0" }).atoms).toBe(false);
  expect(coefficientBalance("anion", { ...oh, d: "2" }).charge).toBe(false);
  for (const bad of [
    { ...cu, a: "02" },
    { ...cu, b: 4 },
    { ...cu, a: "-1" },
    { ...cu, extra: "0" },
  ])
    expect(validHalfBoard("cation", bad)).toBe(false);
});
test("electron gain decreases charge, loss increases it and positive ions can oxidise", () => {
  expect(
    halfPrediction("electrons", {
      record: "initial",
      delta: "-2",
      redox: "reduction",
    }).correct,
  ).toBe(true);
  expect(
    halfPrediction("electrons", {
      record: "initial",
      delta: "2",
      redox: "reduction",
    }).correct,
  ).toBe(false);
  expect(
    halfPrediction("electrons", {
      record: "iron",
      delta: "1",
      redox: "oxidation",
    }).correct,
  ).toBe(true);
});
test("diagnosis separates atom-only, charge-only, both and neither", () => {
  for (const [record, claim] of [
    ["initial", "atoms-only"],
    ["chargeOnly", "charge-only"],
    ["chloride", "both"],
    ["neither", "neither"],
    ["missingWater", "charge-only"],
    ["wrongWater", "charge-only"],
  ])
    expect(halfPrediction("diagnose", { record, claim }).correct).toBe(true);
});

test("supplied molten state symbols cannot silently become aqueous product claims", () => {
  expect(markHalfEquation("sodium", "Na+(aq)+e- ->Na(s)").correct).toBe(false);
  expect(markHalfEquation("sodium", "Na+(l)+e- ->Na(l)").correct).toBe(true);
  expect(
    markHalfEquation("zincReduction", "Zn2+(aq)+2e- ->Zn(s)").correct,
  ).toBe(false);
  expect(markHalfEquation("zincReduction", "Zn2+(l)+2e- ->Zn(s)").correct).toBe(
    true,
  );
});
