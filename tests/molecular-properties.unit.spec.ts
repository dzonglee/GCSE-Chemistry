import { test, expect } from "@playwright/test";
import {
  molecularLedger,
  boilingPrediction,
  unbranchedAlkaneBoilingData,
} from "../src/lib/molecular-properties";
import { smallMoleculesPropertiesJourney as journey } from "../src/content/journeys/small-molecules-properties";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
test("physical separation preserves four neutral diatomic molecules and their bonds, without charge carriers", () => {
  for (const phase of ["liquid", "gas"] as const) {
    const result = molecularLedger(phase);
    expect(result.molecules).toBe(4);
    expect(result.atoms).toBe(8);
    expect(result.covalentBonds).toBe(4);
    expect(result.molecularCharge).toBe(0);
    expect(result.mobileChargedCarriers).toBe(0);
    expect(result.conducts).toBe(false);
  }
  expect(boilingPrediction("within").correct).toBe(false);
  expect(boilingPrediction("between").correct).toBe(true);
});
test("similar-family supplied boiling temperatures preserve signed ordering and differences", () => {
  expect(unbranchedAlkaneBoilingData.map((d) => d.boiling)).toEqual([
    -89, -42, -1,
  ]);
  expect(
    unbranchedAlkaneBoilingData[1].boiling -
      unbranchedAlkaneBoilingData[0].boiling,
  ).toBe(47);
});
test("each authored molecular property task has a correct reference or explicitly self-reviewed written demand", () => {
  const all = tasks(journey);
  expect(all).toHaveLength(42);
  expect(new Set(all.map((t) => t.id)).size).toBe(all.length);
  for (const task of all) {
    expect(mark(task, task.answer).correct).toBe(!task.rubric);
    if (task.misconceptions)
      for (const wrong of Object.keys(task.misconceptions))
        expect(mark(task, wrong).correct).toBe(false);
    if (task.followUp)
      expect(journey.refresher.some((t) => t.id === task.followUp)).toBe(true);
  }
});

test("saved molecular predictions reject malformed fields and preserve wrong single operations", async () => {
  const { initialBoard, validBoard, validHistory, checkBoard } =
    await import("../src/lib/workbench");
  for (const task of journey.guided) {
    const model = task.model!;
    if (model.kind !== "molecular-properties")
      throw Error("Expected molecular model");
    const start = initialBoard(model);
    expect(validBoard(model, start)).toBe(true);
    expect(checkBoard(model, start).correct).toBe(false);
    expect(validBoard(model, { ...start, phase: ["gas"] })).toBe(false);
    expect(validBoard(model, { ...start, extra: "injected" })).toBe(false);
    expect(validHistory(model, [start, { ...start }])).toBe(false);
    const steps =
      model.mode === "boiling"
        ? [
            start,
            { ...start, force: "within" },
            { ...start, force: "within", phase: "gas" },
            { ...start, force: "between", phase: "gas" },
          ]
        : model.mode === "conduction"
          ? [
              start,
              { ...start, conducts: "no" },
              { ...start, conducts: "no", carrier: "neutral" },
            ]
          : [
              start,
              { ...start, strength: "stronger" },
              { ...start, strength: "stronger", energy: "more" },
            ];
    expect(validHistory(model, steps)).toBe(true);
    expect(checkBoard(model, steps.at(-1)!).correct).toBe(true);
  }
});
