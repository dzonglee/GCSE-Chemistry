import { test, expect } from "@playwright/test";
import {
  atomLedger,
  changeTransfer,
  initialLab,
  newRun,
  readLab,
  recordable,
  reviewDue,
  submitRun,
  validTransfers,
  SEVEN_DAYS,
  latticeSites,
  isNeighbour,
  projectSite,
  type Compound,
} from "../src/lib/experiments/ionic-lab";
import {
  magnesiumFeedback,
  sodiumFeedback,
  experimentExposure,
} from "../src/content/experiments/ionic-lab";
import { ionicBondingJourney } from "../src/content/journeys/ionic-bonding";
import { tasks } from "../src/content/journeys/helpers";

test("the four usual ion arrangements retain nuclei, every electron and its origin", () => {
  const examples: [
    Compound,
    number[],
    number,
    number[],
    number[][],
    number[][],
  ][] = [
    [
      "NaCl",
      [1],
      28,
      [1, -1],
      [
        [2, 8],
        [2, 8, 8],
      ],
      [
        [2, 8],
        [0, 0, 1],
      ],
    ],
    [
      "MgCl2",
      [1, 1],
      46,
      [2, -1, -1],
      [
        [2, 8],
        [2, 8, 8],
        [2, 8, 8],
      ],
      [
        [2, 8],
        [0, 0, 1],
        [0, 0, 1],
      ],
    ],
    [
      "MgO",
      [2],
      20,
      [2, -2],
      [
        [2, 8],
        [2, 8],
      ],
      [
        [2, 8],
        [0, 2],
      ],
    ],
    [
      "Na2O",
      [1, 1],
      30,
      [1, 1, -2],
      [
        [2, 8],
        [2, 8],
        [2, 8],
      ],
      [
        [2, 8],
        [2, 8],
        [0, 2],
      ],
    ],
  ];
  for (const [
    compound,
    transfers,
    total,
    charges,
    shells,
    crosses,
  ] of examples) {
    const atoms = atomLedger(compound, transfers);
    expect(atoms.reduce((sum, a) => sum + a.electrons, 0)).toBe(total);
    expect(atoms.reduce((sum, a) => sum + a.protons, 0)).toBe(total);
    expect(atoms.map((a) => a.charge)).toEqual(charges);
    expect(atoms.map((a) => a.shells)).toEqual(shells);
    expect(atoms.map((a) => a.crosses)).toEqual(crosses);
  }
});

test("every permitted proposal conserves particles, including the chemically wrong two-to-one-chlorine distribution", () => {
  for (const compound of ["NaCl", "MgCl2", "MgO", "Na2O"] as const) {
    const edges = compound === "MgCl2" || compound === "Na2O" ? 2 : 1;
    const baseline = atomLedger(compound, Array(edges).fill(0));
    for (let a = 0; a <= 2; a++)
      for (let b = 0; b <= 2; b++) {
        const transfers = edges === 1 ? [a] : [a, b];
        if (!validTransfers(compound, transfers)) continue;
        const atoms = atomLedger(compound, transfers);
        expect(atoms.map((a) => a.protons)).toEqual(
          baseline.map((a) => a.protons),
        );
        expect(atoms.reduce((s, a) => s + a.electrons, 0)).toBe(
          baseline.reduce((s, a) => s + a.electrons, 0),
        );
        expect(atoms.reduce((s, a) => s + a.charge, 0)).toBe(0);
        for (const atom of atoms) {
          expect(atom.shells.reduce((s, n) => s + n, 0)).toBe(atom.electrons);
          expect(
            atom.crosses.every((n, i) => n >= 0 && n <= atom.shells[i]),
          ).toBe(true);
        }
      }
  }
  expect(validTransfers("MgCl2", [2, 0])).toBe(true);
  expect(
    atomLedger("MgCl2", [2, 0])
      .slice(1)
      .map((a) => a.shells.at(-1)),
  ).toEqual([9, 7]);
  expect(
    magnesiumFeedback({ transfers: [2, 0], ratio: "2", checked: true }),
  ).toMatchObject({ good: false });
  expect(
    magnesiumFeedback({ transfers: [1, 1], ratio: "2", checked: true }),
  ).toMatchObject({ good: true });
});

test("transfer controls can undo wrong distributions without overdrawing either donor", () => {
  const wrong = [2, 0];
  expect(changeTransfer("MgCl2", wrong, 1, 1)).toBe(wrong);
  const returned = changeTransfer("MgCl2", wrong, 0, -1);
  expect(returned).toEqual([1, 0]);
  expect(changeTransfer("MgCl2", returned, 1, 1)).toEqual([1, 1]);
  const zero = [0];
  expect(changeTransfer("NaCl", zero, 0, -1)).toBe(zero);
  expect(changeTransfer("NaCl", [1], 0, 1)).toEqual([1]);
  expect(changeTransfer("Na2O", [1, 0], 1, 1)).toEqual([1, 1]);
  expect(validTransfers("NaCl", [2])).toBe(false);
  expect(validTransfers("MgCl2", [2, 1])).toBe(false);
  for (const value of [[-1], [0.5], [NaN], [1, 0], "1", ["1"]])
    expect(validTransfers("NaCl", value)).toBe(false);
});

test("blank charge is distinct from neutral and a wrong ion label remains a recordable proposal", () => {
  const run = newRun("check", 1000);
  expect(recordable(run)).toBe(false);
  run.drawing = {
    transfers: [0],
    metalCharge: "-2",
    nonmetalCharge: "2",
    brackets: "no",
  };
  expect(recordable(run)).toBe(true);
  const state = initialLab();
  state.run = run;
  expect(readLab(JSON.stringify(state))).toEqual(state);
  expect(sodiumFeedback({ sent: 1, charge: "0", checked: true }).good).toBe(
    false,
  );
  expect(sodiumFeedback({ sent: 1, charge: "1", checked: true }).good).toBe(
    true,
  );
});

test("strict render decoding retains complete wrong and partial work and rejects malformed bytes without normalising them", () => {
  const state = initialLab();
  state.mgcl = { transfers: [2, 0], ratio: "3", checked: true };
  state.run = newRun("check", 1000);
  state.run.writing = "protons move? 1..2 ";
  const raw = JSON.stringify(state);
  expect(readLab(raw)).toEqual(state);
  expect(raw).toContain("protons move? 1..2 ");
  expect(readLab(undefined)).toEqual(initialLab());
  for (const broken of [
    "{",
    "null",
    JSON.stringify({ ...state, version: 2 }),
    JSON.stringify({ ...state, extra: true }),
    JSON.stringify({ ...state, nacl: { ...state.nacl, charge: 1 } }),
    JSON.stringify({ ...state, mgcl: { ...state.mgcl, transfers: [2, 1] } }),
    JSON.stringify({
      ...state,
      run: { ...state.run, recorded: [true, false, false] },
    }),
  ]) {
    const copy = broken;
    expect(readLab(broken)).toBeNull();
    expect(broken).toBe(copy);
  }
});

test("whole submission keeps earlier work, seals all three answers and never awards examiner marks or freshness", () => {
  const state = initialLab();
  state.run = newRun("check", 1000);
  expect(submitRun(state, 2000)).toBe(state);
  state.run.drawing = {
    transfers: [0],
    metalCharge: "-2",
    nonmetalCharge: "2",
    brackets: "no",
  };
  state.run.force = "shared";
  state.run.writing = "They share electrons.";
  state.run.recorded = [true, true, true];
  const submitted = submitRun(state, 2000);
  expect(submitted.run).toBeNull();
  expect(submitted.runs[0]).toMatchObject({
    drawing: state.run.drawing,
    writing: "They share electrons.",
    submitted: 2000,
    helped: true,
    fresh: false,
  });
  expect(Object.keys(submitted.runs[0])).not.toContain("marks");
  expect(readLab(JSON.stringify(submitted))).toEqual(submitted);
  const next = { ...submitted, run: newRun("review", 2000 + SEVEN_DAYS) };
  next.run.drawing = {
    transfers: [0, 0],
    metalCharge: "0",
    nonmetalCharge: "0",
    brackets: "no",
  };
  next.run.force = "protons";
  next.run.writing = "Not sure.";
  next.run.recorded = [true, true, true];
  const twice = submitRun(next, 2001 + SEVEN_DAYS);
  expect(twice.runs).toHaveLength(2);
  expect(twice.runs[0]).toEqual(submitted.runs[0]);
});

test("delayed review opens at exactly seven days and a new submission resets the timer without deleting history", () => {
  const state = initialLab();
  expect(reviewDue(state, Number.MAX_SAFE_INTEGER)).toBe(false);
  state.run = newRun("check", 1000);
  state.run.drawing = {
    transfers: [2],
    metalCharge: "2",
    nonmetalCharge: "-2",
    brackets: "yes",
  };
  state.run.force = "attraction";
  state.run.writing = "Two electrons transfer.";
  state.run.recorded = [true, true, true];
  const done = submitRun(state, 2000);
  expect(reviewDue(done, 2000 + SEVEN_DAYS - 1)).toBe(false);
  expect(reviewDue(done, 2000 + SEVEN_DAYS)).toBe(true);
  expect(
    reviewDue(
      { ...done, runs: [...done.runs, { ...done.runs[0], submitted: 3000 }] },
      2000 + SEVEN_DAYS,
    ),
  ).toBe(false);
});

test("sodium chloride cutaway has six opposite nearest neighbours, a plane has four, and the cube has equal charge counts", () => {
  const neighbours = latticeSites.filter(isNeighbour);
  expect(latticeSites).toHaveLength(64);
  expect(latticeSites.filter((s) => s.charge === 1)).toHaveLength(32);
  expect(neighbours).toHaveLength(6);
  expect(neighbours.every((s) => s.charge === -1)).toBe(true);
  expect(neighbours.filter((s) => s.z === 2)).toHaveLength(4);
  expect(
    new Set(neighbours.map((s) => JSON.stringify(projectSite(s, true)))).size,
  ).toBe(6);
});

test("the model-rich experiment conservatively exposes all existing equivalents rather than making them fresh", () => {
  expect(experimentExposure).toEqual(
    tasks(ionicBondingJourney).map((t) => t.id),
  );
  expect(new Set(experimentExposure).size).toBe(52);
});
