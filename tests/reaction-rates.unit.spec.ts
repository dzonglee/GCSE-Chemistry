import { test, expect } from "@playwright/test";
import {
  ratesRecords,
  ratesOptions,
  rateNumbers,
  initialRatesBoard,
  validRatesBoard,
  validRatesNumber,
  ratesHistoryStep,
  ratesPrediction,
  rateCurveSamples,
  type RatesMode,
} from "../src/lib/rate-measurement";
import { ratesJourney as journey } from "../src/content/journeys/reaction-rates";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import { initialBoard, validHistory, checkBoard } from "../src/lib/workbench";
import {
  emptyRateDrawing,
  readRateDrawing,
} from "../src/components/RateDrawingInput";
import { lessons } from "../src/content/curriculum";
function complete(mode: RatesMode, key: string) {
  const b = initialRatesBoard(mode, key),
    r = (
      ratesRecords[mode] as unknown as Record<string, Record<string, unknown>>
    )[key];
  if (mode === "plot") {
    const p = ratesRecords.plot[key as keyof typeof ratesRecords.plot];
    for (let i = 0; i < 7; i++) {
      b["p" + i + "x"] = String(p.data.times[i]);
      b["p" + i + "y"] = String(p.data.values[i]);
      b["c" + i] = String(p.curve[i]);
    }
    b.reason = p.reason;
  } else for (const k of Object.keys(b)) if (k in r) b[k] = String(r[k]);
  return b;
}
for (const mode of Object.keys(ratesRecords) as RatesMode[])
  test(`${mode}: every supplied case preserves wrong entries and every required prediction is independently necessary`, () => {
    for (const key of Object.keys(ratesRecords[mode])) {
      const initial = initialRatesBoard(mode, key),
        right = complete(mode, key);
      expect(validRatesBoard(mode, initial)).toBe(true);
      expect(ratesPrediction(mode, initial).correct).toBe(false);
      expect(ratesPrediction(mode, right).correct).toBe(true);
      for (const field of Object.keys(right).filter((k) => k !== "record")) {
        const wrong = {
          ...right,
          [field]: ratesOptions[mode][field]
            ? "unset"
            : String(Number(right[field]) + 10),
        };
        expect(validRatesBoard(mode, wrong)).toBe(true);
        expect(ratesPrediction(mode, wrong).correct).toBe(false);
        expect(ratesHistoryStep(mode, right, wrong)).toBe(true);
      }
      const model = {
          kind: "rate-measurement" as const,
          mode,
          instruction: "Use supplied measurement",
        },
        history = [initialBoard(model)];
      if (key !== "initial") history.push(initial);
      for (const field of Object.keys(right))
        if (history.at(-1)![field] !== right[field])
          history.push({ ...history.at(-1)!, [field]: right[field] });
      expect(validHistory(model, history)).toBe(true);
      expect(checkBoard(model, right).correct).toBe(true);
      expect(validHistory(model, [right])).toBe(false);
      expect(validRatesBoard(mode, { ...right, extra: "0" })).toBe(false);
    }
  });
test("independent interval arithmetic includes positive consumption and final requested rounding", () => {
  for (const [key, r] of Object.entries(ratesRecords.interval)) {
    expect(r.seconds).toBe(r.endTime - r.startTime);
    expect(r.quantity).toBeCloseTo(
      Math.abs(r.endQuantity - r.startQuantity),
      9,
    );
    expect(r.rate).toBeCloseTo(
      key === "minutes"
        ? Number((r.quantity / r.seconds).toFixed(2))
        : r.quantity / r.seconds,
      9,
    );
  }
  for (const r of Object.values(ratesRecords.mass)) {
    expect(r.quantity).toBeCloseTo(r.startMass - r.endMass, 9);
    expect(r.seconds).toBe(r.endTime - r.startTime);
    expect(r.rate).toBeCloseTo(r.quantity / r.seconds, 9);
  }
  for (const r of Object.values(ratesRecords.compare)) {
    expect(r.aRate).toBe(r.aQuantity / r.aSeconds);
    expect(r.bRate).toBe(r.bQuantity / r.bSeconds);
    expect(r.faster).toBe(
      r.aRate > r.bRate ? "A" : r.aRate < r.bRate ? "B" : "equal",
    );
    expect(r.yield).toBe(
      r.aFinal > r.bFinal
        ? "A-more-final-product"
        : r.aFinal < r.bFinal
          ? "B-more-final-product"
          : "equal-final-amounts",
    );
  }
});
test("smooth preview preserves entered knots without overshoot or silently replacing anomalous observations", () => {
  for (const p of Object.values(ratesRecords.plot)) {
    const samples = rateCurveSamples(p.data.times, p.curve);
    expect(samples.at(-1)!.q).toBe(p.curve.at(-1));
    for (let i = 0; i < samples.length - 1; i++) {
      const segment = Math.min(5, Math.floor(i / 16)),
        v = samples[i];
      expect(Number.isFinite(v.q)).toBe(true);
      expect(v.q).toBeGreaterThanOrEqual(
        Math.min(p.curve[segment], p.curve[segment + 1]) - 1e-9,
      );
      expect(v.q).toBeLessThanOrEqual(
        Math.max(p.curve[segment], p.curve[segment + 1]) + 1e-9,
      );
    }
  }
  expect(ratesRecords.plot.initial.data.values[3]).toBe(2.9);
  expect(ratesRecords.plot.initial.curve[3]).toBe(3.25);
  expect(ratesRecords.plot.anomaly.data.values[3]).toBe(60);
  expect(ratesRecords.plot.anomaly.curve[3]).toBe(45);
  expect(rateCurveSamples([0, 0], [0, 1])).toEqual([]);
});
test("graph pointer edits serialize as two valid adjacent field steps, and saved drawing preserves invalid raw coordinates", () => {
  const model = {
      kind: "rate-measurement" as const,
      mode: "plot" as const,
      instruction: "Plot supplied points",
    },
    b = initialBoard(model),
    x = { ...b, p1x: "20" },
    y = { ...x, p1y: "1.6" };
  expect(validHistory(model, [b, x, y])).toBe(true);
  expect(validHistory(model, [b, y])).toBe(false);
  const raw = JSON.stringify({ ...emptyRateDrawing("plot-fit"), p1y: "1/2" });
  expect(readRateDrawing(raw, "plot-fit")!.p1y).toBe("1/2");
  expect(readRateDrawing("{broken", "plot-fit")).toBeNull();
  expect(
    readRateDrawing(
      JSON.stringify({ ...emptyRateDrawing("tangent"), extra: "1" }),
      "tangent",
    ),
  ).toBeNull();
  expect(Object.keys(emptyRateDrawing("tangent"))).toEqual([
    "tx0",
    "ty0",
    "tx1",
    "ty1",
  ]);
});
test("74 individual tasks mark coherently, preserve all recovery targets and keep every construction self-reviewed", () => {
  const all = tasks(journey);
  expect(all).toHaveLength(74);
  expect(new Set(all.map((q) => q.id)).size).toBe(74);
  expect(all.filter((q) => q.unit)).toHaveLength(33);
  expect(all.filter((q) => q.rubric)).toHaveLength(9);
  expect(all.filter((q) => q.rateDrawing)).toHaveLength(3);
  for (const q of all) {
    expect(mark(q, q.answer).correct, q.id).toBe(!q.rubric);
    if (q.rubric) expect(mark(q, q.answer).selfReview).toBe(true);
  }
  for (const q of journey.practice)
    expect(
      journey.refresher.some((r) => r.id === q.followUp),
      q.id,
    ).toBe(true);
  expect(journey.checkForms.map((f) => f.length)).toEqual([5, 5]);
  expect(journey.reviewForms.map((f) => f.length)).toEqual([3, 3]);
  const l = lessons.find((l) => l.slug === "measuring-rates")!;
  expect(lessons.some((other) => other.slug === l.prerequisite)).toBe(true);
  expect([...l.questions, ...l.checks].map((q) => q.id)).toEqual(
    Array.from({ length: 6 }, (_, i) => "measuring-rates-" + i),
  );
});
test("strict schema rejects malformed decimals, changed record working and duplicate steps", () => {
  for (const v of [
    "",
    "1/2",
    "1e2",
    "01",
    "-0",
    "NaN",
    "Infinity",
    "0.000001",
    "100001",
  ])
    expect(validRatesNumber(v)).toBe(false);
  for (const v of ["0", "1.6", "-2", "0.035", "0.00001"])
    expect(validRatesNumber(v)).toBe(true);
  const b = initialRatesBoard("interval");
  expect(ratesHistoryStep("interval", b, b)).toBe(false);
  expect(
    ratesHistoryStep("interval", b, initialRatesBoard("interval", "late")),
  ).toBe(true);
  expect(
    ratesHistoryStep("interval", b, {
      ...initialRatesBoard("interval", "late"),
      rate: "1",
    }),
  ).toBe(false);
  expect(rateNumbers.plot).toHaveLength(21);
});

test("all33 numerical answers are independently recomputed from the actually given quantities and intervals", () => {
  const expected: Record<string, number> = {
    "warm-seconds": 2 * 60 + 30,
    "warm-change": 40 - 10,
    "r-quantity": 44 - 20,
    "r-time": 30 - 10,
    "r-rate": 24 / 20,
    "r-consumed": (6 - 2) / 20,
    "r-round": Number((9.85 / 150).toFixed(2)),
    "r-balance": 98.4 - 97.8,
    "g-interval": (44 - 20) / (30 - 10),
    "g-mass": (182.4 - 178.4) / 100,
    "p-whole": 50 / 40,
    "p-late": (50 - 44) / (40 - 30),
    "p-stopped": 0,
    "p-consumption": (6 - 2) / (30 - 10),
    "p-minutes": Number((9.85 / (2 * 60 + 30)).toFixed(2)),
    "p-offset": (42 - 12) / (2 * 60 + 20 - (60 + 20)),
    "p-mass-later": (180.8 - 178.7) / (80 - 20),
    "p-sealed": 0,
    "p-evaporation": 0.6 / 60,
    "p-spray": 0.5 / 50,
    "p-total": (95.6 - 94.7) / 30,
    "p-uniform": 5 / 10,
    "p-trend-plateau": 0,
    "p-equal-rates": 40 / 20,
    "p-different-intervals": 36 / 6,
    "p-reversed-yield": 20 / 5,
    "A-interval": (48 - 12) / (40 - 20),
    "A-round": Number((7.26 / (3 * 60 + 10)).toFixed(3)),
    "B-consumption": (8 - 3) / (70 - 20),
    "B-plateau": 0,
    "B-graph": (31 - 18) / (20 - 10),
    "R-interval": (48 - 12) / (80 - 20),
    "S-time": (38 - 8) / (2 * 60 + 30 - (60 + 30)),
  };
  const numeric = tasks(journey).filter((q) => q.unit);
  expect(numeric).toHaveLength(Object.keys(expected).length);
  for (const q of numeric)
    expect(Number(q.answer), q.id).toBeCloseTo(expected[q.id.slice(6)], 9);
});

for (const [id, right, wrong] of [
  ["rr-v1-r-round", "0.07", ["0.070", "0.1", "0.06567", "7e-2"]],
  ["rr-v1-p-minutes", "0.07", ["0.070", "0.1", "0.06567", "7e-2"]],
  ["rr-v1-A-round", "0.038", ["0.0380", "0.04", "0.03821", "3.8e-2"]],
] as const) {
  test(`${id}: the requested final decimal precision matters`, () => {
    const question = tasks(journey).find((task) => task.id === id)!;
    expect(mark(question, right).correct).toBe(true);
    for (const answer of wrong)
      expect(mark(question, answer).correct, answer).toBe(false);
  });
}
test("the specimen calculator preserves and rejects extra final decimal places", () => {
  const board = complete("interval", "minutes");
  expect(ratesPrediction("interval", board).correct).toBe(true);
  board.rate = "0.070";
  expect(validRatesBoard("interval", board)).toBe(true);
  expect(ratesPrediction("interval", board).correct).toBe(false);
  expect(board.rate).toBe("0.070");
  const ordinary = complete("interval", "initial");
  ordinary.rate = Number(ordinary.rate).toFixed(3);
  expect(ratesPrediction("interval", ordinary).correct).toBe(true);
});
