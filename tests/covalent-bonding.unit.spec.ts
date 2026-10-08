import { test, expect } from "@playwright/test";
import {
  covalentLedger,
  covalentKeys,
  covalentMolecules,
  moleculePositions,
  type CovalentMolecule,
} from "../src/lib/covalent";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import { covalentBondingJourney } from "../src/content/journeys/covalent-bonding";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
const references: Record<
  CovalentMolecule,
  { orders: number[]; unshared: number; partners: number[]; total: number }
> = {
  H2: { orders: [1], unshared: 0, partners: [0], total: 2 },
  Cl2: { orders: [1], unshared: 6, partners: [6], total: 14 },
  HCl: { orders: [1], unshared: 6, partners: [0], total: 8 },
  O2: { orders: [2], unshared: 4, partners: [4], total: 12 },
  N2: { orders: [3], unshared: 2, partners: [2], total: 10 },
  H2O: { orders: [1, 1], unshared: 4, partners: [0, 0], total: 8 },
  NH3: { orders: [1, 1, 1], unshared: 2, partners: [0, 0, 0], total: 8 },
  CH4: { orders: [1, 1, 1, 1], unshared: 0, partners: [0, 0, 0, 0], total: 8 },
  CO2: { orders: [2, 2], unshared: 0, partners: [4, 4], total: 16 },
};
test("all nine selected molecule targets independently match shared pairs, lone electrons and conserved inventories", () => {
  for (const [name, ref] of Object.entries(references)) {
    const molecule = name as CovalentMolecule,
      model = {
        kind: "covalent-share" as const,
        molecule,
        instruction: "Check all electrons.",
      },
      board = Object.fromEntries(
        ref.orders.flatMap((order, i) => [
          [`centre${i}`, order],
          [`partner${i}`, order],
        ]),
      ),
      ledger = covalentLedger(molecule, board);
    expect(validBoard(model, board), name).toBe(true);
    expect(checkBoard(model, board).correct, name).toBe(true);
    expect(ledger).toMatchObject({
      centreRemaining: ref.unshared,
      partnerRemaining: ref.partners,
      total: ref.total,
      displayedTotal: ref.total,
      shared: ref.orders.map((n) => 2 * n),
    });
    expect(ledger.centreAround).toBe(covalentMolecules[molecule].centre.full);
    expect(ledger.partnerAround).toEqual(
      covalentMolecules[molecule].partners.map((atom) => atom.full),
    );
    const task = covalentBondingJourney.practice.find(
      (q) => q.drawCovalent?.molecule === molecule,
    )!;
    const answers = JSON.parse(task.answer);
    expect(Number(answers.unsharedCentre)).toBe(ref.unshared);
    ref.orders.forEach((order, i) => {
      expect(Number(answers[`centre${i}`])).toBe(order);
      expect(Number(answers[`partner${i}`])).toBe(order);
      expect(Number(answers[`unsharedPartner${i}`])).toBe(ref.partners[i]);
    });
  }
});
test("a conserved same-origin chlorine pair and incomplete single-electron overlap remain wrong", () => {
  const chlorine = {
      kind: "covalent-share" as const,
      molecule: "Cl2" as const,
      instruction: "Cl2",
    },
    wrong = { centre0: 2, partner0: 0 };
  expect(validBoard(chlorine, wrong)).toBe(true);
  expect(covalentLedger("Cl2", wrong)).toMatchObject({
    displayedTotal: 14,
    centreAround: 7,
    partnerAround: [9],
  });
  expect(checkBoard(chlorine, wrong).correct).toBe(false);
  const h = {
    kind: "covalent-share" as const,
    molecule: "H2" as const,
    instruction: "H2",
  };
  expect(checkBoard(h, { centre0: 1, partner0: 0 }).correct).toBe(false);
  expect(validBoard(h, { centre0: 2, partner0: 0 })).toBe(false);
});
test("single-electron history and total atom budgets reject jumps tampered particles and oversharing", () => {
  const model = covalentBondingJourney.guided[7].model!,
    initial = initialBoard(model);
  expect(validHistory(model, [initial, { ...initial, centre0: 1 }])).toBe(true);
  expect(validHistory(model, [initial, { ...initial, centre0: 2 }])).toBe(
    false,
  );
  expect(validBoard(model, { ...initial, centre0: 3, centre1: 2 })).toBe(false);
  expect(validBoard(model, { ...initial, partner0: 2 })).toBe(false);
  expect(validBoard(model, { ...initial, protons: 6 })).toBe(false);
  expect(validBoard(model, { ...initial, centre0: 0.5 })).toBe(false);
  for (const molecule of Object.keys(references) as CovalentMolecule[]) {
    const spec = covalentMolecules[molecule];
    const board = Object.fromEntries(
      covalentKeys(molecule).map((key) => [key, 0]),
    );
    for (let i = 0; i < spec.partners.length; i++)
      for (let n = 1; n <= spec.orders[i]; n++) {
        board[`centre${i}`] = n;
        expect(covalentLedger(molecule, board).displayedTotal).toBe(
          references[molecule].total,
        );
        board[`partner${i}`] = n;
        expect(covalentLedger(molecule, board).displayedTotal).toBe(
          references[molecule].total,
        );
      }
  }
});
test("molecular positions retain actual tetrahedral and pyramidal depth while water is bent and carbon dioxide linear", () => {
  const methane = moleculePositions("CH4"),
    ammonia = moleculePositions("NH3"),
    water = moleculePositions("H2O"),
    dioxide = moleculePositions("CO2");
  expect(new Set(methane.map((p) => p[2])).size).toBe(3);
  expect(new Set(ammonia.map((p) => p[2])).size).toBe(3);
  const vectors = methane.slice(1, 4),
    [a, b, c] = vectors;
  const volume =
    a[0] * (b[1] * c[2] - b[2] * c[1]) -
    a[1] * (b[0] * c[2] - b[2] * c[0]) +
    a[2] * (b[0] * c[1] - b[1] * c[0]);
  expect(Math.abs(volume)).toBeGreaterThan(1);
  expect(ammonia[0][1]).toBeGreaterThan(ammonia[1][1]);
  expect(water[1][1]).toBeLessThan(water[0][1]);
  expect(water[1][0]).toBe(-water[2][0]);
  expect(dioxide.every((p) => p[1] === 0 && p[2] === 0)).toBe(true);
});
test("49 authored tasks reserve complete drawings, retain static errors and require honest written self-review", () => {
  const all = tasks(covalentBondingJourney);
  expect(all).toHaveLength(61);
  expect(new Set(all.map((q) => q.id)).size).toBe(61);
  expect(covalentBondingJourney.guided).toHaveLength(9);
  expect(covalentBondingJourney.checkForms.map((f) => f.length)).toEqual([
    5, 5, 5,
  ]);
  expect(covalentBondingJourney.reviewForms.map((f) => f.length)).toEqual([
    3, 3, 5,
  ]);
  for (const q of all) {
    expect(mark(q, q.answer).correct, q.id).toBe(!q.rubric);
    for (const wrong of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, wrong).correct, q.id).toBe(false);
  }
  const water = covalentBondingJourney.practice.find(
      (q) => q.drawCovalent?.molecule === "H2O",
    )!,
    answer = JSON.parse(water.answer);
  expect(
    mark(water, JSON.stringify({ ...answer, unsharedCentre: "2" })).correct,
  ).toBe(false);
  expect(
    mark(water, JSON.stringify({ ...answer, unsharedPartner0: "2" })).correct,
  ).toBe(false);
  expect(
    mark(water, JSON.stringify({ ...answer, centre0: "0.99999999" })).correct,
  ).toBe(false);
  expect(
    covalentBondingJourney.practice.find((q) => q.id === "cb-v1-p-lone")
      ?.covalentDiagram?.unshared,
  ).toBe(2);
});
