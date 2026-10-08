import { test, expect } from "@playwright/test";
import {
  interiorIon,
  nearestNeighbours,
  sodiumChlorideFragment,
  ionicPhaseEvidence,
} from "../src/lib/ionic-structures";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import { ionicStructuresJourney } from "../src/content/journeys/ionic-structures";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import { lessons } from "../src/content/curriculum";
import { emptyProgress, emptyWork, decode } from "../src/lib/progress";
test("finite rock-salt fragment has balanced species, genuine depth and opposite nearest neighbours", () => {
  expect(sodiumChlorideFragment).toHaveLength(64);
  expect(sodiumChlorideFragment.filter((i) => i.charge === 1)).toHaveLength(32);
  expect(sodiumChlorideFragment.reduce((n, i) => n + i.charge, 0)).toBe(0);
  expect(new Set(sodiumChlorideFragment.map((i) => i.position[2])).size).toBe(
    4,
  );
  for (const ion of sodiumChlorideFragment) {
    const neighbours = nearestNeighbours(ion);
    expect(neighbours.every((n) => n.charge === -ion.charge)).toBe(true);
    if (ion.index.every((n) => n === 1 || n === 2))
      expect(neighbours).toHaveLength(6);
  }
  for (const species of ["Na+", "Cl-"] as const) {
    const centre = interiorIon(species);
    expect(centre.species).toBe(species);
    expect(
      nearestNeighbours(centre)
        .map((n) => n.index.map((v, axis) => v - centre.index[axis]).join(","))
        .sort(),
    ).toEqual(["-1,0,0", "0,-1,0", "0,0,-1", "0,0,1", "0,1,0", "1,0,0"].sort());
  }
});
test("lattice history preserves wrong predictions, rejects injected counts and fields, and requires one operation", () => {
  const model = ionicStructuresJourney.guided[0].model!;
  const start = initialBoard(model),
    wrong = { ...start, neighbours: 4 },
    correct = { ...wrong, neighbours: 6 };
  expect(validHistory(model, [start, wrong, correct])).toBe(true);
  expect(checkBoard(model, wrong).correct).toBe(false);
  expect(checkBoard(model, correct).correct).toBe(true);
  expect(validBoard(model, { ...start, neighbours: 5 })).toBe(false);
  expect(validBoard(model, { ...start, hidden: 1 })).toBe(false);
  expect(validHistory(model, [start, { focus: "Cl-", neighbours: 6 }])).toBe(
    false,
  );
});
test("conductivity depends on phase and ion mobility, with electron explanations rejected in every phase", () => {
  for (const task of ionicStructuresJourney.guided.slice(1)) {
    const model = task.model!;
    if (model.kind !== "ionic-conduction") throw Error("Wrong phase model");
    const expected = ionicPhaseEvidence[model.phase];
    const correct = { conducts: expected.conducts, carrier: expected.carrier };
    expect(checkBoard(model, correct).correct).toBe(true);
    for (const conducts of ["yes", "no"])
      expect(
        checkBoard(model, { conducts, carrier: "electrons" }).correct,
      ).toBe(false);
    expect(
      checkBoard(model, {
        ...correct,
        conducts: expected.conducts === "yes" ? "no" : "yes",
      }).correct,
    ).toBe(false);
    expect(validBoard(model, { ...correct, carrier: "neutral" })).toBe(false);
  }
});
test("individual journey contains distinct reserved demands, honest written review and correct route scope", () => {
  const all = tasks(ionicStructuresJourney);
  expect(all).toHaveLength(41);
  expect(new Set(all.map((q) => q.id)).size).toBe(41);
  expect(ionicStructuresJourney.checkForms.map((f) => f.length)).toEqual([
    4, 4, 3,
  ]);
  expect(ionicStructuresJourney.reviewForms.map((f) => f.length)).toEqual([
    2, 2, 3,
  ]);
  for (const q of all) {
    expect(mark(q, q.answer).correct).toBe(!q.rubric);
    for (const wrong of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, wrong).correct, q.id).toBe(false);
  }
  const lesson = lessons.find((l) => l.slug === "ionic-structures")!;
  expect([lesson.tier, lesson.course, lesson.prerequisite]).toEqual([
    "foundation",
    "combined",
    "ionic-bonding",
  ]);
  const progress = emptyProgress();
  progress.work[lesson.slug] = emptyWork();
  expect(decode(JSON.stringify(progress))?.work[lesson.slug]).toBeDefined();
});
