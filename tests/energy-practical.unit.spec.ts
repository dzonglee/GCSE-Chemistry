import { test, expect } from "@playwright/test";
import {
  practicalRecords,
  practicalOptions,
  initialPracticalBoard,
  validPracticalBoard,
  validPracticalNumber,
  practicalPrediction,
  practicalHistoryStep,
  type PracticalMode,
} from "../src/lib/energy-practical";
import { initialBoard, validHistory } from "../src/lib/workbench";
test("thirty-two scenarios have strict canonical string boards and preserve task-specific initial records", () => {
  let count = 0;
  for (const mode of Object.keys(practicalRecords) as PracticalMode[])
    for (const record of Object.keys(practicalRecords[mode])) {
      const b = initialPracticalBoard(mode, record);
      expect(validPracticalBoard(mode, b)).toBe(true);
      expect(practicalPrediction(mode, b).correct).toBe(false);
      expect(validPracticalBoard(mode, { ...b, extra: "0" })).toBe(false);
      expect(validPracticalBoard(mode, { ...b, record: "missing" })).toBe(
        false,
      );
      count++;
    }
  expect(count).toBe(32);
  expect(
    initialBoard({
      kind: "energy-practical",
      mode: "observe",
      record: "decimal",
      instruction: "",
    }),
  ).toEqual(initialPracticalBoard("observe", "decimal"));
});
test("plans match the stated variable, response, apparatus, controls and logical measurement order", () => {
  for (const [record, r] of Object.entries(practicalRecords.plan)) {
    const b = {
      ...initialPracticalBoard("plan", record),
      independent: r.independent,
      dependent: r.dependent,
      instrument: r.instrument,
      controls: r.controls,
      sequence: r.sequence,
    };
    expect(practicalPrediction("plan", b).correct).toBe(true);
    for (const field of [
      "independent",
      "dependent",
      "instrument",
      "controls",
      "sequence",
    ]) {
      const wrong = practicalOptions.plan[field].find(
        (v) => v !== b[field as keyof typeof b],
      )!;
      const altered = { ...b, [field]: wrong };
      expect(validPracticalBoard("plan", altered)).toBe(true);
      expect(practicalPrediction("plan", altered).correct).toBe(false);
    }
  }
});
test("trace selection uses the last pre-mixing baseline and reaction-stage extremum including signed cooling and negative readings", () => {
  const references: Record<string, number> = {
    initial: 8.5,
    cooling: -6.5,
    decimal: 8.2,
    late: 7.5,
    negative: 6,
  };
  for (const [record, r] of Object.entries(practicalRecords.observe)) {
    const b = {
      ...initialPracticalBoard("observe", record),
      baseline: String(r.baseline),
      extreme: String(r.extreme),
      change: String(references[record]),
    };
    expect(practicalPrediction("observe", b).correct).toBe(true);
    expect(practicalPrediction("observe", { ...b, extreme: "6" }).correct).toBe(
      false,
    );
    expect(
      practicalPrediction("observe", {
        ...b,
        change: String(-references[record]),
      }).correct,
    ).toBe(false);
  }
});
test("repeat means retain ordinary spread, justify documented failure and compare changes across differing baselines", () => {
  const refs: Record<string, number> = {
    initial: 8.4,
    failed: 7.85,
    low: 3.6,
    spread: 7,
    baseline: 8,
  };
  for (const [record, r] of Object.entries(practicalRecords.repeat)) {
    const b = {
      ...initialPracticalBoard("repeat", record),
      retained: r.retained,
      reason: r.reason,
      mean: String(refs[record]),
    };
    expect(practicalPrediction("repeat", b).correct).toBe(true);
    expect(
      practicalPrediction("repeat", { ...b, reason: "delete-highest" }).correct,
    ).toBe(false);
    expect(
      validPracticalBoard("repeat", { ...b, reason: "delete-highest" }),
    ).toBe(true);
  }
  expect(
    practicalPrediction("repeat", {
      ...initialPracticalBoard("repeat", "baseline"),
      retained: "all",
      reason: "compare-changes-not-peaks",
      mean: "29",
    }).correct,
  ).toBe(false);
});
test("all valid gradient triangles use corresponding coordinate differences and the supplied axis unit", () => {
  for (const [record, r] of Object.entries(practicalRecords.graph))
    for (let i = 0; i < r.points.length - 1; i++)
      for (let j = i + 1; j < r.points.length; j++) {
        const b = {
          ...initialPracticalBoard("graph", record),
          first: String(i),
          second: String(j),
          rise: String(Number((r.points[j][1] - r.points[i][1]).toFixed(3))),
          run: String(r.points[j][0] - r.points[i][0]),
          gradient: String(r.slope),
          intercept: String(r.intercept),
          unit: r.unit,
        };
        expect(
          practicalPrediction("graph", b).correct,
          record + ":" + i + ":" + j,
        ).toBe(true);
        expect(
          practicalPrediction("graph", { ...b, unit: "gram-per-degree" })
            .correct,
        ).toBe(false);
        expect(
          practicalPrediction("graph", { ...b, rise: String(r.points[j][1]) })
            .correct,
        ).toBe(false);
      }
});
test("same-point, reversed and unset triangles are retained but never accepted as a valid quotient", () => {
  const good = {
    ...initialPracticalBoard("graph"),
    first: "0",
    second: "4",
    rise: "8",
    run: "4",
    gradient: "2",
    intercept: "21",
    unit: "degree-per-gram",
  };
  for (const [first, second] of [
    ["0", "0"],
    ["4", "0"],
    ["unset", "4"],
    ["0", "unset"],
  ]) {
    const b = { ...good, first, second };
    expect(validPracticalBoard("graph", b)).toBe(true);
    expect(practicalPrediction("graph", b).correct).toBe(false);
  }
});
test("both fit intersections are independently computed from endpoint lines and accepted only within the stated reading precision", () => {
  const refs: Record<string, [number, number]> = {
    initial: [80 / 3, 92 / 3],
    second: [50 / 3, 31],
  };
  for (const [record, r] of Object.entries(practicalRecords.fit)) {
    const line = (p: readonly (readonly [number, number])[]) => {
      const [a, b] = p,
        s = (b[1] - a[1]) / (b[0] - a[0]);
      return [s, a[1] - s * a[0]];
    };
    const [a, c] = line(r.rising),
      [d, e] = line(r.falling),
      x = (e - c) / (a - d),
      y = a * x + c;
    expect(x).toBeCloseTo(refs[record][0], 10);
    expect(y).toBeCloseTo(refs[record][1], 10);
    const b = {
      ...initialPracticalBoard("fit", record),
      volume: x.toFixed(2),
      temperature: y.toFixed(2),
    };
    expect(practicalPrediction("fit", b).correct).toBe(true);
    expect(
      practicalPrediction("fit", { ...b, volume: (x + 0.3).toFixed(2) })
        .correct,
    ).toBe(false);
    expect(
      practicalPrediction("fit", { ...b, temperature: (y + 0.3).toFixed(2) })
        .correct,
    ).toBe(false);
  }
});
test("each evidence claim requires its own reason and preserves plausible wrong claims", () => {
  for (const [record, r] of Object.entries(practicalRecords.evaluate)) {
    const b = {
      ...initialPracticalBoard("evaluate", record),
      claim: r.claim,
      reason: r.reason,
    };
    expect(practicalPrediction("evaluate", b).correct).toBe(true);
    for (const field of ["claim", "reason"] as const) {
      const altered = {
        ...b,
        [field]: practicalOptions.evaluate[field].find((v) => v !== b[field])!,
      };
      expect(validPracticalBoard("evaluate", altered)).toBe(true);
      expect(practicalPrediction("evaluate", altered).correct).toBe(false);
    }
  }
});
test("strict numbers reject malformed, exponent, fraction and nonfinite strings without replacing scientific wrong values", () => {
  for (const v of [
    "",
    "NaN",
    "Infinity",
    "1e3",
    " 1",
    "1 ",
    "01",
    "1/2",
    "10001",
    "-0",
    "2.0001",
  ])
    expect(validPracticalNumber(v)).toBe(false);
  for (const v of ["0", "-4", "8.4", "7.85", "26.667"])
    expect(validPracticalNumber(v)).toBe(true);
  const wrong = {
    ...initialPracticalBoard("observe"),
    baseline: "2",
    extreme: "4",
    change: "-8.5",
  };
  expect(validPracticalBoard("observe", wrong)).toBe(true);
  expect(practicalPrediction("observe", wrong).correct).toBe(false);
  expect(
    practicalPrediction("observe", { ...wrong, change: NaN }).correct,
  ).toBe(false);
});
test("record changes atomically reset all predictions while direct single-field errors remain legitimate history steps", () => {
  const a = initialPracticalBoard("graph"),
    wrong = { ...a, gradient: "999" },
    next = initialPracticalBoard("graph", "volume");
  expect(practicalHistoryStep("graph", a, wrong)).toBe(true);
  expect(practicalHistoryStep("graph", wrong, next)).toBe(true);
  expect(
    practicalHistoryStep("graph", wrong, { ...next, gradient: "999" }),
  ).toBe(false);
  expect(
    practicalHistoryStep("graph", a, { ...a, gradient: "2", intercept: "21" }),
  ).toBe(false);
  expect(practicalHistoryStep("graph", a, a)).toBe(false);
});
test("shared histories retain task defaults, reject a substituted first record and permit record changes with stable keys", () => {
  const model = {
      kind: "energy-practical",
      mode: "graph",
      record: "decimal",
      instruction: "",
    } as const,
    a = initialBoard(model),
    b = { ...a, first: "4" },
    next = initialPracticalBoard("graph", "volume");
  expect(validHistory(model, [a, b, next])).toBe(true);
  expect(validHistory(model, [initialPracticalBoard("graph")])).toBe(false);
  expect(validHistory(model, [])).toBe(false);
  expect(validHistory(model, [a, a])).toBe(false);
  expect(validHistory(model, [a, { ...next, gradient: "2" }])).toBe(false);
});
test("fit observations have a tied sampled maximum distinct from the estimated fitted maximum", () => {
  const r = practicalRecords.fit.initial,
    max = Math.max(...r.points.map((p) => p[1]));
  expect(max).toBe(30);
  expect(r.points.filter((p) => p[1] === max).map((p) => p[0])).toEqual([
    25, 30,
  ]);
  expect(r.temperature).toBeGreaterThan(max);
  expect(r.volume).toBeGreaterThan(25);
  expect(r.volume).toBeLessThan(30);
});
