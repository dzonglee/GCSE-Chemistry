import { test, expect } from "@playwright/test";
import { ionicLedger, ionicCompounds } from "../src/lib/ionic";
import { ionicBondingJourney as journey } from "../src/content/journeys/ionic-bonding";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import { tasks } from "../src/content/journeys/helpers";
import { mark, canonicalAnswer, displayResponse } from "../src/lib/marking";
test("reserved ion explanations retain their changed donor contexts rather than inheriting the practice donor", () => {
  const chloride = journey.checkForms[0].find((q) => q.id === "ib-v1-ca-draw")!;
  const oxide = journey.checkForms[1].find((q) => q.id === "ib-v1-cb-draw")!;
  expect(chloride.explanation).toContain("magnesium electron");
  expect(chloride.explanation).not.toContain("sodium");
  expect(oxide.explanation).toContain("each sodium atom");
  expect(oxide.explanation).not.toContain("magnesium");
  expect(
    mark(chloride, '{"dots":"7","crosses":"1","charge":"-1","brackets":"1"}')
      .correct,
  ).toBe(true);
  expect(
    mark(oxide, '{"dots":"6","crosses":"2","charge":"-2","brackets":"1"}')
      .correct,
  ).toBe(true);
});
test("all four transfer examples independently conserve nuclei, electrons and net charge and give the required ions", () => {
  const reference = [
    ["NaCl", { t00: 1 }, 28, [10], [18], [1], [-1]],
    ["MgCl2", { t00: 1, t01: 1 }, 46, [10], [18, 18], [2], [-1, -1]],
    ["MgO", { t00: 2 }, 20, [10], [10], [2], [-2]],
    ["Na2O", { t00: 1, t10: 1 }, 30, [10, 10], [10], [1, 1], [-2]],
  ] as const;
  for (const [compound, board, total, de, ae, dc, ac] of reference) {
    const ledger = ionicLedger(compound, board);
    expect(ledger.totalElectrons).toBe(total);
    expect(ledger.totalProtons).toBe(total);
    expect(ledger.charge).toBe(0);
    expect(ledger.donors.map((p) => p.electrons)).toEqual([...de]);
    expect(ledger.acceptors.map((p) => p.electrons)).toEqual([...ae]);
    expect(ledger.donors.map((p) => p.charge)).toEqual([...dc]);
    expect(ledger.acceptors.map((p) => p.charge)).toEqual([...ac]);
    expect(ledger.correct).toBe(true);
    expect(ledger.donors.every((p) => p.outer === 8)).toBe(true);
    expect(ledger.acceptors.every((p) => p.outer === 8)).toBe(true);
  }
  expect(ionicCompounds.NaCl.metal.protons).toBe(11);
  expect(ionicCompounds.NaCl.nonmetal.protons).toBe(17);
});
test("a conserved wrong magnesium distribution does not prove formation of the required chloride ions", () => {
  const model = journey.guided[1].model!,
    wrong = { t00: 2, t01: 0 },
    ledger = ionicLedger("MgCl2", wrong);
  expect(ledger.totalElectrons).toBe(46);
  expect(ledger.charge).toBe(0);
  expect(ledger.acceptors.map((p) => p.outer)).toEqual([9, 7]);
  expect(checkBoard(model, wrong).correct).toBe(false);
  expect(checkBoard(model, wrong).feedback).toContain("distribution");
  expect(validBoard(model, wrong)).toBe(true);
  expect(checkBoard(model, { t00: 1, t01: 1 }).correct).toBe(true);
});
test("every legal transfer state conserves all particles and respects the donor budget without changing nuclei", () => {
  for (const task of journey.guided) {
    const model = task.model!;
    expect(model.kind).toBe("ionic-transfer");
    if (model.kind !== "ionic-transfer") throw Error("Wrong model");
    const first = initialBoard(model),
      keys = Object.keys(first);
    for (let a = 0; a <= 2; a++)
      for (let b = 0; b <= 2; b++) {
        const state =
          keys.length === 1 ? { [keys[0]]: a } : { [keys[0]]: a, [keys[1]]: b };
        if (validBoard(model, state)) {
          const ledger = ionicLedger(model.compound, state),
            baseline = ionicLedger(model.compound, first);
          expect(ledger.totalElectrons).toBe(baseline.totalElectrons);
          expect(ledger.totalProtons).toBe(baseline.totalProtons);
          expect(ledger.charge).toBe(0);
        }
      }
  }
});
test("strict transfer histories reject jumps, overdrawn donor electrons, added nuclei and two operations at once", () => {
  const mgo = journey.guided[2].model!,
    mgcl = journey.guided[1].model!,
    nacl = journey.guided[0].model!;
  expect(validHistory(mgo, [{ t00: 0 }, { t00: 1 }, { t00: 2 }])).toBe(true);
  expect(validHistory(mgo, [{ t00: 0 }, { t00: 2 }])).toBe(false);
  expect(validBoard(nacl, { t00: 2 })).toBe(false);
  expect(validBoard(mgcl, { t00: 2, t01: 1 })).toBe(false);
  expect(validBoard(mgo, { t00: 1, protons: 12 })).toBe(false);
  expect(
    validHistory(mgcl, [
      { t00: 0, t01: 0 },
      { t00: 1, t01: 1 },
    ]),
  ).toBe(false);
});
test("all 52 reviewed tasks reserve cold forms and preserve deliberately wrong origin counts and written honesty", () => {
  expect(tasks(journey)).toHaveLength(52);
  expect(new Set(tasks(journey).map((t) => t.id)).size).toBe(52);
  for (const task of tasks(journey)) {
    if (!task.rubric)
      expect(mark(task, task.answer).correct, task.id).toBe(true);
    if (task.options)
      expect(task.options.filter((o) => o === task.answer)).toHaveLength(1);
  }
  const origin = journey.practice.find((t) => t.id.endsWith("p-origin"))!;
  expect(origin.ionDotCross).toMatchObject({
    dots: 6,
    crosses: 2,
    proposed: true,
  });
  const cold = journey.checkForms[0][2];
  expect(cold.ionDotCross).toMatchObject({ dots: 6, crosses: 1, charge: -2 });
  expect(cold.answer).toBe("1");
  expect(mark(cold, "0.9999999").correct).toBe(false);
  const written = journey.practice.find((t) => t.rubric)!;
  expect(written.options).toBeUndefined();
  expect(mark(written, written.answer).correct).toBe(false);
  for (const task of [
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ])
    expect(task.model).toBeUndefined();
});

test("independent diagram construction marks origins, charge and brackets separately without exposing storage encodings", () => {
  const q = journey.practice.find((t) => t.drawDotCross)!;
  expect(mark(q, q.answer).correct).toBe(true);
  for (const [key, wrong] of [
    ["dots", "6"],
    ["crosses", "2"],
    ["charge", "1"],
    ["brackets", "0"],
  ]) {
    const answer = JSON.parse(q.answer);
    answer[key] = wrong;
    expect(mark(q, JSON.stringify(answer)).correct, key).toBe(false);
  }
  expect(canonicalAnswer(q)).toContain("Ion charge: 1−");
  expect(canonicalAnswer(q)).toContain("Draw square brackets: included");
  const proposed = JSON.parse(q.answer);
  proposed.brackets = "0";
  expect(displayResponse(q, JSON.stringify(proposed))).toContain(
    "Draw square brackets: omitted",
  );
});
