import { lessons } from "../src/content/curriculum";
import { initialBoard, validHistory } from "../src/lib/workbench";
import {
  emptyProgress,
  emptyWork,
  decode,
  exposureIds,
} from "../src/lib/progress";
import { test, expect } from "@playwright/test";
import {
  repeatStats,
  selectedReadings,
  biasedReadings,
  investigatorReadings,
  initialMeasurementBoard,
  validMeasurementBoard,
  measurementPrediction,
  type MeasurementMode,
} from "../src/lib/measurement-uncertainty";
import { measurementJourney as journey } from "../src/content/journeys/measurement-uncertainty";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
test("repeat summaries preserve specified sets, mean denominators and common-offset invariant spread", () => {
  expect(repeatStats([10.2, 10, 10.1, 14])).toEqual({
    count: 4,
    mean: 11.075,
    minimum: 10,
    maximum: 14,
    width: 4,
    halfRange: 2,
  });
  expect(repeatStats(selectedReadings("fault", 4))).toMatchObject({
    count: 3,
    mean: 10.1,
    width: 0.2,
  });
  expect(repeatStats(selectedReadings("valid", 0)).mean).toBe(10.15);
  expect(repeatStats([18.2, 18.6, 18.8, 18.4])).toEqual({
    count: 4,
    mean: 18.5,
    minimum: 18.2,
    maximum: 18.8,
    width: 0.6,
    halfRange: 0.3,
  });
  expect(repeatStats([17.9, 18.7, 19.1, 18.3])).toMatchObject({
    mean: 18.5,
    width: 1.2,
    halfRange: 0.6,
  });
  expect(repeatStats(biasedReadings(0))).toMatchObject({
    mean: 10,
    width: 0.2,
  });
  expect(repeatStats(biasedReadings(0.4))).toMatchObject({
    mean: 10.4,
    width: 0.2,
  });
  const comparison = investigatorReadings("differ");
  expect(repeatStats(comparison.first)).toMatchObject({ mean: 10, width: 0.2 });
  expect(repeatStats(comparison.second)).toMatchObject({
    mean: 10.8,
    width: 0.2,
  });
  expect(() => repeatStats([])).toThrow();
  expect(() => selectedReadings("fault", 1.5)).toThrow();
  expect(() => biasedReadings(1)).toThrow();
});
test("model predictions require justified selection and reference evidence as well as numerical answers", () => {
  for (const mode of [
    "selection",
    "spread",
    "bias",
    "reproduce",
  ] as MeasurementMode[]) {
    const b = initialMeasurementBoard(mode);
    expect(validMeasurementBoard(mode, b)).toBe(true);
    expect(measurementPrediction(mode, b).correct).toBe(false);
    expect(validMeasurementBoard(mode, { ...b, extra: 1 })).toBe(false);
  }
  const selection = {
    ...initialMeasurementBoard("selection"),
    excluded: 4,
    reason: "fault",
    count: "3",
    mean: "10.1",
  };
  expect(measurementPrediction("selection", selection).correct).toBe(true);
  expect(
    measurementPrediction("selection", { ...selection, reason: "target" })
      .correct,
  ).toBe(false);
  expect(
    measurementPrediction("selection", { ...selection, count: "4" }).correct,
  ).toBe(false);
  expect(
    validMeasurementBoard("selection", { ...selection, excluded: "4" }),
  ).toBe(false);
  expect(
    measurementPrediction("selection", {
      case: "valid",
      excluded: 0,
      reason: "keep",
      count: "4",
      mean: "10.15",
    }).correct,
  ).toBe(true);
  expect(
    measurementPrediction("spread", {
      case: "narrow",
      minimum: "18.2",
      maximum: "18.8",
      width: "0.6",
      uncertainty: "0.3",
    }).correct,
  ).toBe(true);
  const bias = {
    offset: 0.4,
    reference: "hidden",
    mean: "10.4",
    width: "0.2",
    accuracy: "unknown",
  };
  expect(measurementPrediction("bias", bias).correct).toBe(true);
  expect(
    measurementPrediction("bias", { ...bias, accuracy: "aligned" }).correct,
  ).toBe(false);
  expect(
    measurementPrediction("bias", {
      ...bias,
      reference: "known",
      accuracy: "biased",
    }).correct,
  ).toBe(true);
  expect(
    measurementPrediction("reproduce", {
      case: "differ",
      difference: "0.8",
      repeatable: "yes",
      reproducible: "no",
    }).correct,
  ).toBe(true);
  expect(
    measurementPrediction("reproduce", {
      case: "agree",
      difference: "0",
      repeatable: "yes",
      reproducible: "yes",
    }).correct,
  ).toBe(true);
});
test("half-range estimates are distinct from observed endpoints and do not remove a repeated bias", () => {
  const skewed = repeatStats([1, 1, 4]);
  expect(skewed).toMatchObject({
    mean: 2,
    minimum: 1,
    maximum: 4,
    width: 3,
    halfRange: 1.5,
  });
  expect(skewed.mean + skewed.halfRange).toBe(3.5);
  expect(skewed.maximum).toBeGreaterThan(skewed.mean + skewed.halfRange);
  expect(
    repeatStats([...biasedReadings(0.4), ...biasedReadings(0.4)]).mean,
  ).toBe(10.4);
  expect(repeatStats([0.62, 0.65, 0.61, 0.31]).width).toBe(0.34);
  expect(repeatStats([0.62, 0.65, 0.61]).width).toBe(0.04);
});
test("forty-eight individually authored tasks separate ranges, justified means and honestly ungraded explanations", () => {
  const all = tasks(journey).filter((q) => q.id.startsWith("mu-v1-"));
  expect(all).toHaveLength(48);
  expect(
    journey.practice.filter((q) => q.id.startsWith("mu-v1-")),
  ).toHaveLength(21);
  expect(new Set(all.map((q) => q.id)).size).toBe(all.length);
  for (const q of all) {
    expect(mark(q, q.answer).correct, q.id).toBe(!q.rubric);
    if (q.rubric) expect(mark(q, q.answer).selfReview).toBe(true);
    for (const wrong of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, wrong).correct, q.id).toBe(false);
    if (q.followUp)
      expect(journey.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  const q = journey.practice.find((q) => q.id === "mu-v1-p-range")!;
  expect(
    mark(q, JSON.stringify({ minimum: "0.61", maximum: "0.65", width: "0.04" }))
      .correct,
  ).toBe(false);
  expect(
    mark(q, JSON.stringify({ minimum: "0.31", maximum: "0.65" })).correct,
  ).toBe(false);
});

test("registered measurement models preserve valid histories while repeated conclusions cannot become fresh evidence", () => {
  const l = lessons.find((l) => l.slug === "measurement-uncertainty")!;
  expect(l.prerequisite).toBe("conservation-of-mass");
  expect(l.course).toBe("combined");
  expect(l.questions).toEqual([]);
  expect(l.checks).toEqual([]);
  const p = emptyProgress(),
    w = emptyWork();
  w.taskModels = {};
  for (const q of journey.guided.filter((q) => q.model)) {
    const b = initialBoard(q.model!);
    expect(validHistory(q.model!, [b])).toBe(true);
    expect(validHistory(q.model!, [])).toBe(false);
    expect(validHistory(q.model!, [b, b])).toBe(false);
    w.taskModels[q.id] = [b];
  }
  p.work[l.slug] = w;
  expect(decode(JSON.stringify(p))).toEqual(p);
  w.taskModels["mu-v1-g-selection"] = [
    { ...initialMeasurementBoard("selection"), excluded: "4" },
  ];
  expect(decode(JSON.stringify(p))).toBeNull();
  expect(exposureIds(["mu-v1-ca-accuracy"])).toContain("mu-v1-g-bias");
  expect(exposureIds(["mu-v1-cb-systematic"])).toContain("mu-v1-p-averaging");
  expect(exposureIds(["mu-v1-ca-mean"])).toEqual(["mu-v1-ca-mean"]);
});
