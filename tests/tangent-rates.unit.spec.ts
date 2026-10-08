import { test, expect } from "@playwright/test";
import {
  tangentRecords,
  tangentOptions,
  initialTangentBoard,
  validTangentBoard,
  validTangentNumber,
  tangentHistoryStep,
  tangentPrediction,
  tangentDiagnostic,
  curveValue,
  curveSlope,
  type TangentMode,
} from "../src/lib/tangent-rates";
import { tangentJourney as journey } from "../src/content/journeys/tangent-rates";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import { initialBoard, validHistory, checkBoard } from "../src/lib/workbench";
import {
  emptyTangentDrawing,
  readTangentDrawing,
} from "../src/components/TangentDrawingInput";
import { lessons } from "../src/content/curriculum";
const endpoints: Record<string, readonly number[]> = {
  initial: [10, 25, 30, 55],
  early: [0, 2.5, 20, 42.5],
  late: [20, 42.5, 35, 57.5],
  mass: [10, 1.2, 30, 2.8],
  consumption: [10, 4, 30, 2],
  flat: [20, 40, 40, 40],
};
function complete(mode: TangentMode, key: string) {
  const b = initialTangentBoard(mode, key),
    r = (
      tangentRecords[mode] as unknown as Record<string, Record<string, unknown>>
    )[key];
  if (mode === "construct") {
    const [x0, y0, x1, y1] = endpoints[key];
    Object.assign(b, {
      tx0: String(x0),
      ty0: String(y0),
      tx1: String(x1),
      ty1: String(y1),
      slope: String(Number(((y1 - y0) / (x1 - x0)).toFixed(10))),
      kind: r.kind,
    });
  } else
    for (const k of Object.keys(b))
      if (k !== "record")
        b[k] = mode === "moles" && k === "unit" ? "mol/s" : String(r[k]);
  return b;
}
for (const mode of Object.keys(tangentRecords) as TangentMode[])
  test(`${mode}: native supplied cases preserve wrong scientific predictions and canonical histories`, () => {
    for (const key of Object.keys(tangentRecords[mode])) {
      const initial = initialTangentBoard(mode, key),
        right = complete(mode, key),
        model = {
          kind: "tangent-rates" as const,
          mode,
          record: key,
          instruction: "Predict each rate step.",
        };
      expect(tangentPrediction(mode, initial)).toBe(false);
      expect(tangentPrediction(mode, right)).toBe(true);
      expect(checkBoard(model, right).correct).toBe(true);
      let last = initial;
      const history = [initial];
      for (const field of Object.keys(right)) {
        if (last[field] === right[field]) continue;
        const next = { ...last, [field]: right[field] };
        expect(tangentHistoryStep(mode, last, next)).toBe(true);
        history.push(next);
        last = next;
      }
      expect(validHistory(model, history)).toBe(true);
      for (const field of Object.keys(right).filter((k) => k !== "record")) {
        const wrong = {
          ...right,
          [field]: tangentOptions[mode][field]
            ? "unset"
            : String(Number(right[field]) + 1000),
        };
        expect(validTangentBoard(mode, wrong)).toBe(true);
        expect(
          tangentPrediction(mode, wrong),
          mode + "/" + key + "/" + field,
        ).toBe(false);
        expect(tangentDiagnostic(mode, wrong).length).toBeGreaterThan(35);
      }
    }
  });
test("constructed curves and tangents share actual contact and direction; alternative same-line endpoints remain valid", () => {
  const targets = {
    initial: [40, 1.5],
    early: [22.5, 2],
    late: [52.5, 1],
    mass: [2, 0.08],
    consumption: [3, -0.1],
    flat: [40, 0],
  };
  for (const [key, r] of Object.entries(tangentRecords.construct)) {
    expect(curveValue(r.curve, r.curve.at)).toBeCloseTo(
      targets[key as keyof typeof targets][0],
      10,
    );
    expect(curveSlope(r.curve, r.curve.at)).toBeCloseTo(
      targets[key as keyof typeof targets][1],
      10,
    );
  }
  const flat = { ...complete("construct", "flat"), tx0: "21" };
  expect(tangentPrediction("construct", flat)).toBe(true);
  const reversed = {
    ...complete("construct", "initial"),
    tx0: "30",
    ty0: "55",
    tx1: "10",
    ty1: "25",
  };
  expect(tangentPrediction("construct", reversed)).toBe(true);
  const chord = {
    ...complete("construct", "initial"),
    tx0: "0",
    ty0: "0",
    tx1: "40",
    ty1: "60",
  };
  expect(tangentPrediction("construct", chord)).toBe(false);
  expect(tangentDiagnostic("construct", chord)).toContain("misses");
});
test("gradient triangles consistently subtract both coordinates and convert minute intervals only once", () => {
  for (const r of Object.values(tangentRecords.gradient)) {
    const earlier = r.x0 <= r.x1 ? 1 : -1;
    expect(r.dx).toBeCloseTo((r.x1 - r.x0) * earlier * r.timeFactor, 12);
    expect(r.dy).toBeCloseTo((r.y1 - r.y0) * earlier, 12);
    expect(r.slope).toBeCloseTo(r.dy / r.dx, 12);
    expect(r.rate).toBe(Math.abs(r.slope));
  }
  expect(tangentRecords.gradient.minutes.rate).toBe(
    (42 - 12) / ((1.5 - 0.5) * 60),
  );
  expect(tangentRecords.gradient.falling.slope).toBe(-0.2);
  expect(tangentRecords.gradient.falling.rate).toBe(0.2);
});
test("amount conversions and percentage-point calibrations use actual specified quantities and dimensions", () => {
  const molRates = {
    initial: 0.006 / 30,
    consumed: 0.012 / 40,
    mmol: 9 / 1000 / (1.5 * 60),
    mass: 0.44 / 44 / 20,
    gas: 240 / 24000 / 50,
    offset: (0.015 - 0.003) / (80 - 20),
  };
  for (const [key, r] of Object.entries(tangentRecords.moles))
    expect(r.rate).toBeCloseTo(molRates[key as keyof typeof molRates], 12);
  for (const r of Object.values(tangentRecords.calibration)) {
    expect(r.slope).toBeCloseTo((r.y1 - r.y0) / (r.x1 - r.x0), 12);
    expect(r.rate).toBeCloseTo(
      Math.abs((r.y1 - r.y0) / (r.x1 - r.x0)) * r.calibration,
      12,
    );
  }
  expect(tangentRecords.calibration.shallow.rate).toBe((10 / 40) * 0.000071);
  expect(tangentRecords.calibration.wider.rate).toBe(
    tangentRecords.calibration.initial.rate,
  );
});
test("strict saved schemas keep small signed decimals, reject invalid history and serialize pointer coordinates as adjacent field steps", () => {
  for (const bad of [
    "",
    "1/2",
    "1e-5",
    "-0",
    "01",
    "0.12345678901",
    "NaN",
    "Infinity",
    1,
    null,
  ])
    expect(validTangentNumber(bad)).toBe(false);
  for (const good of ["0", "-0.2", "0.00001775", "0.0000000001"])
    expect(validTangentNumber(good)).toBe(true);
  const model = {
      kind: "tangent-rates" as const,
      mode: "construct" as const,
      instruction: "Move endpoints.",
    },
    a = initialBoard(model),
    b = { ...a, tx0: "10" },
    c = { ...b, ty0: "20" };
  expect(validHistory(model, [a, b, c])).toBe(true);
  expect(validHistory(model, [a, c])).toBe(false);
  expect(validHistory(model, [a, { ...a, extra: "0" }])).toBe(false);
  expect(validHistory(model, [a, a])).toBe(false);
});
test("native drawing records preserve invalid strings for explicit correction and never acquire automatic marks", () => {
  const b = { ...emptyTangentDrawing(), tx0: "1/2" };
  expect(readTangentDrawing(JSON.stringify(b))).toEqual(b);
  expect(readTangentDrawing(JSON.stringify({ ...b, extra: "0" }))).toBeNull();
  expect(readTangentDrawing("{broken")).toBeNull();
  for (const q of tasks(journey).filter((q) => q.tangentDrawing)) {
    const result = mark(q, JSON.stringify(b));
    expect(result.selfReview).toBe(true);
    expect(result.correct).toBe(false);
  }
});
test("69 original tasks have honest assessment, targeted recovery and small-rate tolerances without modifying legacy bank identities", () => {
  const all = tasks(journey);
  expect(all).toHaveLength(69);
  expect(new Set(all.map((q) => q.id)).size).toBe(69);
  expect(all.filter((q) => q.rubric)).toHaveLength(10);
  expect(all.filter((q) => q.tangentDrawing)).toHaveLength(3);
  expect(all.filter((q) => !q.options && !q.rubric)).toHaveLength(47);
  expect(journey.checkForms.map((f) => f.length)).toEqual([5, 5]);
  expect(journey.reviewForms.map((f) => f.length)).toEqual([3, 3]);
  for (const q of all) {
    const result = mark(
      q,
      q.tangentDrawing
        ? JSON.stringify({ tx0: "10", ty0: "20", tx1: "30", ty1: "44" })
        : q.answer,
    );
    if (q.tangentDrawing)
      expect(
        mark(q, JSON.stringify({ tx0: "", ty0: "", tx1: "", ty1: "" })),
      ).toMatchObject({ correct: false, empty: true });
    expect(q.rubric ? result.selfReview : result.correct, q.id).toBe(true);
    if (!q.options && !q.rubric) {
      expect(q.tolerance).toBeLessThan(1e-8);
      expect(
        mark(
          q,
          String(
            Number(q.answer) +
              (Number(q.answer) === 0 ? 0.0001 : Number(q.answer)),
          ),
        ).correct,
        q.id,
      ).toBe(false);
    }
    if (q.followUp)
      expect(journey.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  expect(
    lessons.find((l) => l.slug === "rates-from-tangents")?.prerequisite,
  ).toBe("measuring-rates");
  expect(lessons.find((l) => l.slug === "rates-from-tangents")?.tier).toBe(
    "higher",
  );
  expect(
    (() => {
      const l = lessons.find((l) => l.slug === "measuring-rates")!;
      return [...l.questions, ...l.checks].map((q) => q.id);
    })(),
  ).toEqual(Array.from({ length: 6 }, (_, i) => `measuring-rates-${i}`));
});
test("prior tangent and uncalibrated-signal work directly expose matching Higher procedures across lessons", async () => {
  const { exposureIds } = await import("../src/lib/progress");
  expect(exposureIds(["rr-v1-p-draw-tangent"])).toContain("tr-v1-A-draw");
  expect(exposureIds(["measuring-rates-5"])).toContain("tr-v1-A-tangent");
  expect(exposureIds(["rr-v1-r-signal"])).toContain("tr-v1-B-uncalibrated");
  expect(exposureIds(["tr-v1-p-uncalibrated"])).toContain("rr-v1-A-signal");
});
