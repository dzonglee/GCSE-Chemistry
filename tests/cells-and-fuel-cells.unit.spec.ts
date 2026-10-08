import { test, expect } from "@playwright/test";
import {
  cellsRecords,
  cellsOptions,
  initialCellsBoard,
  validCellsBoard,
  cellsPrediction,
  cellsHistoryStep,
  type CellsMode,
} from "../src/lib/cells-and-fuel-cells";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import { simpleCellAsset } from "../src/lib/simple-cell-asset";
import * as T from "three";
const modes = Object.keys(cellsRecords) as CellsMode[];
function correctBoard(mode: CellsMode, key: string) {
  const b = initialCellsBoard(mode, key),
    r = (cellsRecords[mode] as Record<string, Record<string, unknown>>)[key];
  for (const field of Object.keys(b))
    if (field in r) b[field] = String(r[field]);
  if (mode === "series") b.connection = "series";
  return b;
}
for (const mode of modes)
  test(`${mode}: every supplied record preserves independently required predictions and rejects unset alternatives`, () => {
    for (const key of Object.keys(cellsRecords[mode])) {
      const initial = initialCellsBoard(mode, key),
        b = correctBoard(mode, key);
      expect(validCellsBoard(mode, initial)).toBe(true);
      expect(cellsPrediction(mode, initial).correct).toBe(false);
      expect(cellsPrediction(mode, b).correct).toBe(true);
      for (const field of Object.keys(b).filter((k) => k !== "record")) {
        const wrong = {
          ...b,
          [field]: cellsOptions[mode][field]
            ? "unset"
            : String(Number(b[field]) + 1),
        };
        expect(validCellsBoard(mode, wrong)).toBe(true);
        expect(cellsPrediction(mode, wrong).correct).toBe(false);
        expect(cellsHistoryStep(mode, b, wrong)).toBe(true);
      }
    }
  });
test("series arithmetic uses exact supplied integer hundredths with count and reversal bounds", () => {
  const refs = {
    initial: [150, 8, 0, 1200],
    six: [150, 4, 0, 600],
    decimal: [120, 6, 0, 720],
    oppose: [150, 4, 1, 300],
    cancel: [150, 4, 2, 0],
  };
  for (const [key, [unit, count, reversed, total]] of Object.entries(refs)) {
    const r = cellsRecords.series[key as keyof typeof cellsRecords.series];
    expect(Math.round(r.cell * 100)).toBe(unit);
    expect(r.count).toBe(count);
    expect(r.reversed).toBe(reversed);
    expect(Math.round(r.volts * 100)).toBe(total);
    expect((count - 2 * reversed) * unit).toBe(total);
  }
  expect(
    cellsPrediction("series", {
      ...correctBoard("series", "initial"),
      connection: "parallel",
    }).correct,
  ).toBe(false);
});
test("overall reaction conserves separate H/O inventories at specified coefficient scales", () => {
  const refs = { initial: [2, 1, 2], doubled: [4, 2, 4], tripled: [6, 3, 6] };
  for (const [key, [h, o, w]] of Object.entries(refs)) {
    const r = cellsRecords.reaction[key as keyof typeof cellsRecords.reaction];
    expect([r.hydrogen, r.oxygen, r.water]).toEqual([h, o, w]);
    expect(2 * h).toBe(2 * w);
    expect(2 * o).toBe(w);
  }
  expect(
    cellsPrediction("reaction", {
      ...initialCellsBoard("reaction"),
      hydrogen: "0",
      oxygen: "0",
      water: "0",
    }).correct,
  ).toBe(false);
});
test("strict model decoding rejects missing, extra, coerced and unfinished numbers while retaining scientific errors", () => {
  const b = correctBoard("setup", "initial");
  for (const bad of [
    "",
    "-0",
    "1e2",
    "1/2",
    "NaN",
    "01",
    "1.0000",
    "10001",
    1.1,
    null,
  ])
    expect(validCellsBoard("setup", { ...b, volts: bad })).toBe(false);
  expect(validCellsBoard("setup", { ...b, extra: "0" })).toBe(false);
  const missing = { ...b };
  delete missing.left;
  expect(validCellsBoard("setup", missing)).toBe(false);
  expect(validCellsBoard("setup", { ...b, volts: "-2" })).toBe(true);
  expect(cellsPrediction("setup", { ...b, volts: "-2" }).correct).toBe(false);
});
test("shared dispatch and history require canonical starts, single edits and atomic record switches", () => {
  for (const mode of modes) {
    const model = { kind: "cells-workbench" as const, mode, instruction: "" },
      a = initialBoard(model);
    expect(validBoard(model, a)).toBe(true);
    expect(checkBoard(model, a).correct).toBe(false);
    expect(validHistory(model, [a])).toBe(true);
    expect(validHistory(model, [])).toBe(false);
    expect(validHistory(model, [a, a])).toBe(false);
    const other = Object.keys(cellsRecords[mode])[1],
      switched = initialCellsBoard(mode, other);
    expect(validHistory(model, [a, switched])).toBe(true);
    const correct = correctBoard(mode, "initial");
    expect(validHistory(model, [a, correct])).toBe(false);
  }
});
test("actual macroscopic cell geometry keeps two separate immersed plates above the floor for all48 constituents", () => {
  let total = 0;
  for (const left of ["copper", "zinc", "magnesium", "cobalt"] as const)
    for (const right of ["copper", "zinc", "magnesium", "cobalt"] as const)
      for (const liquid of [
        "sodium-chloride",
        "copper-sulfate",
        "distilled-water",
      ]) {
        const root = simpleCellAsset(left, right, liquid);
        root.updateMatrixWorld(true);
        const plates: T.Box3[] = [],
          coordinates: number[] = [];
        root.traverse((n) => {
          if (!(n instanceof T.Mesh)) return;
          const position = n.geometry.getAttribute("position");
          coordinates.push(...position.array);
          if (n.userData.kind === "metal-electrode")
            plates.push(new T.Box3().setFromObject(n));
        });
        expect(coordinates.every(Number.isFinite)).toBe(true);
        expect(coordinates.length).toBeGreaterThan(3000);
        expect(plates).toHaveLength(2);
        expect(plates[0].intersectsBox(plates[1])).toBe(false);
        for (const plate of plates) {
          expect(plate.min.y).toBeLessThan(0.15);
          expect(plate.max.y).toBeGreaterThan(0.15);
          expect(plate.min.y).toBeGreaterThan(-0.95);
        }
        expect(root.userData).toMatchObject({
          leftElectrode: left,
          rightElectrode: right,
          electrolyte: liquid,
        });
        total++;
      }
  expect(total).toBe(48);
});
