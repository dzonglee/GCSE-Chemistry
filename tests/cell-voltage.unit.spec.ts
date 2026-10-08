import { test, expect } from "@playwright/test";
import {
  voltageRecords,
  voltageOptions,
  initialVoltageBoard,
  validVoltageBoard,
  voltagePrediction,
  voltageHistoryStep,
  observedVoltage,
  leadReading,
  validVoltageNumber,
  type VoltageMode,
} from "../src/lib/cell-voltage";
import { initialBoard, validHistory, checkBoard } from "../src/lib/workbench";
import { voltageJourney as journey } from "../src/content/journeys/cell-voltage";
import { mark } from "../src/lib/marking";
import { tasks } from "../src/content/journeys/helpers";
function complete(mode: VoltageMode, key: string) {
  const b = initialVoltageBoard(mode, key),
    r = voltageRecords[mode][key as never] as Record<string, unknown>;
  for (const k of Object.keys(b)) if (k in r) b[k] = String(r[k]);
  return b;
}
for (const mode of Object.keys(voltageRecords) as VoltageMode[])
  test(`${mode}: all supplied cases require every independent prediction and retain valid wrong steps`, () => {
    for (const key of Object.keys(voltageRecords[mode])) {
      const b = initialVoltageBoard(mode, key),
        right = complete(mode, key);
      expect(validVoltageBoard(mode, b)).toBe(true);
      expect(voltagePrediction(mode, b).correct).toBe(false);
      expect(voltagePrediction(mode, right).correct).toBe(true);
      for (const field of Object.keys(right).filter((k) => k !== "record")) {
        const wrong = {
          ...right,
          [field]: voltageOptions[mode][field]
            ? "unset"
            : (Number(right[field]) + 1).toFixed(3),
        };
        expect(validVoltageBoard(mode, wrong)).toBe(true);
        expect(voltagePrediction(mode, wrong).correct).toBe(false);
        expect(voltageHistoryStep(mode, right, wrong)).toBe(true);
      }
      const model = {
          kind: "cell-voltage" as const,
          mode,
          instruction: "Use supplied comparisons",
        },
        history = [initialBoard(model)];
      if (key !== "initial") history.push(b);
      for (const field of Object.keys(right))
        if (history.at(-1)![field] !== right[field])
          history.push({ ...history.at(-1)!, [field]: right[field] });
      expect(validHistory(model, history)).toBe(true);
      expect(checkBoard(model, right).correct).toBe(true);
      expect(validHistory(model, [right])).toBe(false);
      expect(validVoltageBoard(mode, { ...right, extra: "0" })).toBe(false);
    }
  });
test("independent signed comparisons and terminal topology distinguish reversal, same plate, missing and observed zero", () => {
  expect(observedVoltage("copper", "chromium")).toBe(1.2);
  expect(observedVoltage("tin", "copper")).toBe(-0.4);
  expect(observedVoltage("iron", "copper")).toBe("not-measured");
  expect(observedVoltage("chromium", "copper")).toBeUndefined();
  expect(observedVoltage("zinc", "zinc")).toBe(0);
  expect(leadReading(-0.7, "metal2", "metal1")).toBe(0.7);
  expect(leadReading(-0.7, "metal1", "metal1")).toBe(0);
  expect(leadReading(0, "metal2", "metal1")).toBe(0);
  expect(leadReading(-0.7, "unset", "metal1")).toBeUndefined();
});
test("independent subtraction and role-oriented ordering cover every reference case", () => {
  for (const r of Object.values(voltageRecords.infer)) {
    expect(r.volts).toBeCloseTo(r.firstLevel - r.secondLevel, 9);
    expect(r.magnitude).toBe(Math.abs(r.volts));
    expect(r.moreActive).toBe(
      r.firstLevel < r.secondLevel
        ? "first"
        : r.firstLevel > r.secondLevel
          ? "second"
          : "equal",
    );
  }
  for (const r of Object.values(voltageRecords.rank)) {
    const order = r.metals
      .map((metal, i) => ({
        metal,
        level: r.readings[i] * (r.referenceRole === "second" ? 1 : -1),
      }))
      .sort((a, b) => a.level - b.level)
      .map((v) => v.metal);
    expect([r.rank1, r.rank2, r.rank3, r.rank4, r.rank5]).toEqual(order);
  }
});
test("strict decimal and record resets preserve malformed or scientifically wrong distinctions", () => {
  for (const v of [
    "",
    "NaN",
    "Infinity",
    "1/2",
    "1e2",
    "01",
    "-0",
    "0.0001",
    "10001",
  ])
    expect(validVoltageNumber(v)).toBe(false);
  for (const v of ["0", "-0.7", "1.2", "-10000", "0.001"])
    expect(validVoltageNumber(v)).toBe(true);
  expect(
    voltageHistoryStep("read", initialVoltageBoard("read"), {
      ...initialVoltageBoard("read", "negative"),
      volts: "1",
    }),
  ).toBe(false);
  expect(
    voltageHistoryStep(
      "read",
      initialVoltageBoard("read"),
      initialVoltageBoard("read", "negative"),
    ),
  ).toBe(true);
});
test("all individually authored tasks have correct marking, recovery and written self-review", () => {
  const all = tasks(journey);
  expect(all).toHaveLength(66);
  expect(new Set(all.map((q) => q.id)).size).toBe(66);
  expect(all.filter((q) => q.rubric)).toHaveLength(7);
  for (const q of all) {
    const result = mark(q, q.answer);
    expect(result.correct, q.id).toBe(!q.rubric);
    if (q.rubric) expect(result.selfReview).toBe(true);
  }
  for (const q of journey.practice)
    expect(
      journey.refresher.some((r) => r.id === q.followUp),
      q.id,
    ).toBe(true);
  expect(journey.checkForms.map((f) => f.length)).toEqual([5, 5]);
  expect(journey.reviewForms.map((f) => f.length)).toEqual([3, 3]);
});
test("numerical answers are independently recomputed from the actual given pairs and magnitudes", () => {
  const expected: Record<string, number> = {
    "warm-magnitude": 0.6,
    "warm-subtract": -0.5,
    "r-magnitude": 0.4,
    "r-reverse": -1.2,
    "r-subtract": -0.7,
    "r-negative": 0.8,
    "r-zero": 0,
    "g-read": 1.2,
    "g-leads": 0.7,
    "g-infer": -0.7,
    "p-negative": -0.4,
    "p-small": -0.3,
    "p-zero": 0,
    "p-positive": 0.3,
    "p-magnitude": 0.4,
    "p-reverse": -0.7,
    "p-wide": -1.2,
    "p-normal": -0.4,
    "p-identical-swap": 0,
    "p-same-plate": 0,
    "p-infer-reverse": 0.7,
    "p-mixed": -1.1,
    "p-double-negative": 0.8,
    "p-alternate": -0.7,
    "p-new-reference": -0.7,
    "p-equal-reference": 0,
    "A-table": -0.4,
    "A-swap": 0.85,
    "A-reference": -1.2,
    "B-reference": -1.4,
    "B-negative": -0.9,
    "B-magnitude": 1.05,
    "R-reference": -0.9,
    "R-reverse": -1.05,
    "S-negative": 0.4,
    "S-magnitude": 0.95,
  };
  const numerical = tasks(journey).filter((q) => q.unit);
  expect(numerical).toHaveLength(Object.keys(expected).length);
  for (const q of numerical)
    expect(Number(q.answer), q.id).toBeCloseTo(expected[q.id.slice(6)], 9);
});
