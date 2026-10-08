import { test, expect } from "@playwright/test";
import {
  metallicLedger,
  metalCorePositions,
  metallicCarrierPrediction,
  alloyLayerPrediction,
} from "../src/lib/metallic-properties";
import { metallicBondingJourney as journey } from "../src/content/journeys/metallic-bonding";
import { tasks } from "../src/content/journeys/helpers";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import { mark } from "../src/lib/marking";
import { lessons, questionById } from "../src/content/curriculum";
test("illustrative metallic fragment balances positive cores and negative delocalised electrons across three projected layers", () => {
  expect(metallicLedger()).toEqual({
    cores: 12,
    coreCharge: 12,
    delocalisedElectrons: 12,
    electronCharge: -12,
    netCharge: 0,
  });
  expect(metalCorePositions).toHaveLength(12);
  expect(new Set(metalCorePositions.map((c) => c.row)).size).toBe(3);
  for (const row of [0, 1, 2])
    expect(metalCorePositions.filter((c) => c.row === row)).toHaveLength(4);
  expect(metallicCarrierPrediction("cores").correct).toBe(false);
  expect(metallicCarrierPrediction("neutral").correct).toBe(false);
  expect(metallicCarrierPrediction("electrons").correct).toBe(true);
  expect(alloyLayerPrediction("different", "easier").correct).toBe(false);
  expect(alloyLayerPrediction("same", "harder").correct).toBe(false);
  expect(alloyLayerPrediction("different", "harder").correct).toBe(true);
});
test("metallic model histories retain wrong hypotheses and reject injected values, fields and multiple changes", () => {
  for (const task of journey.guided) {
    const model = task.model!;
    if (model.kind !== "metallic-properties") throw Error("Wrong model");
    const start = initialBoard(model);
    expect(validBoard(model, start)).toBe(true);
    expect(checkBoard(model, start).correct).toBe(false);
    expect(validBoard(model, { ...start, injected: 1 })).toBe(false);
    expect(validHistory(model, [start, start])).toBe(false);
    const steps =
      model.mode === "attraction"
        ? [start, { attraction: "core-core" }, { attraction: "core-electron" }]
        : model.mode === "conduction"
          ? [
              start,
              { carrier: "cores", drift: 0 },
              { carrier: "cores", drift: 1 },
              { carrier: "electrons", drift: 1 },
            ]
          : model.mode === "layers"
            ? [
                start,
                { shift: 1, bonding: "unset" },
                { shift: 1, bonding: "vanishes" },
                { shift: 1, bonding: "remains" },
              ]
            : [
                start,
                { sample: "alloy", size: "unset", sliding: "unset" },
                { sample: "alloy", size: "different", sliding: "unset" },
                { sample: "alloy", size: "different", sliding: "harder" },
              ];
    expect(validHistory(model, steps)).toBe(true);
    expect(checkBoard(model, steps.at(-1)!).correct).toBe(true);
    if (model.mode === "conduction") {
      expect(validBoard(model, { carrier: ["electrons"], drift: 0 })).toBe(
        false,
      );
      expect(validHistory(model, [start, { ...start, drift: 2 }])).toBe(false);
      expect(validBoard(model, { ...start, drift: 0.5 })).toBe(false);
    }
    if (model.mode === "layers")
      expect(validHistory(model, [start, { ...start, shift: 3 }])).toBe(false);
  }
});
test("all 51 authored demands have unique references, causal misconceptions and honest written self-review", () => {
  const all = tasks(journey);
  expect(all).toHaveLength(51);
  expect(new Set(all.map((q) => q.id)).size).toBe(51);
  for (const q of all) {
    expect(mark(q, q.answer).correct).toBe(!q.rubric);
    if (q.misconceptions)
      for (const wrong of Object.keys(q.misconceptions))
        expect(mark(q, wrong).correct).toBe(false);
    if (q.followUp)
      expect(journey.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  expect(
    mark(
      all.find((q) => q.id === "mb-v1-p-percent")!,
      "16.6667",
    ).correct,
  ).toBe(false);
  expect(
    mark(
      all.find((q) => q.id === "mb-v1-p-percent")!,
      "16.7",
    ).correct,
  ).toBe(true);
});
test("refocused route preserves legacy bank identities alongside separate reserved metallic tasks", () => {
  const lesson = lessons.find((l) => l.slug === "structure-and-properties")!;
  expect(lesson.title).toBe("Metallic bonding and properties");
  expect(lesson.questions).toHaveLength(4);
  expect(lesson.checks).toHaveLength(2);
  expect(lesson.journey).toBe(journey);
  for (const q of [...lesson.questions, ...lesson.checks, ...tasks(journey)])
    expect(questionById(q.id)).toBe(q);
  const practice = new Set(
    [...journey.practice, ...journey.guided].map((q) => q.id),
  );
  expect(
    [...journey.checkForms.flat(), ...journey.reviewForms.flat()].every(
      (q) => !practice.has(q.id),
    ),
  ).toBe(true);
});
