import { test, expect } from "@playwright/test";
import { energyJourney as j } from "../src/content/journeys/energy-transfer";
import { lessons } from "../src/content/curriculum";
import {
  emptyProgress,
  emptyWork,
  decode,
  exposureIds,
} from "../src/lib/progress";
import { initialBoard } from "../src/lib/workbench";
import { mark } from "../src/lib/marking";
const all = [
  ...j.warmup,
  ...j.refresher,
  ...j.guided,
  ...j.practice,
  ...j.checkForms.flat(),
  ...j.reviewForms.flat(),
];
test("49 authored tasks preserve Foundation shared scope, six legacy IDs and distinct reserved and delayed forms", () => {
  const l = lessons.find((l) => l.slug === "exothermic-and-endothermic")!;
  expect(l.tier).toBe("foundation");
  expect(l.course).toBe("combined");
  expect(l.prerequisite).toBe("states-of-matter");
  expect(l.journey).toBe(j);
  expect([...l.questions, ...l.checks].map((q) => q.id)).toEqual(
    Array.from({ length: 6 }, (_, i) => "exothermic-and-endothermic-" + i),
  );
  expect(all).toHaveLength(49);
  expect(new Set(all.map((q) => q.id)).size).toBe(49);
  expect(j.checkForms.map((f) => f.length)).toEqual([5, 5]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([3, 3]);
  for (const q of all) {
    expect(q.purpose).toBeTruthy();
    if (q.followUp)
      expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
});
test("13 numeric answers independently match signed, magnitude and graph references; seven explanations never auto-pass", () => {
  const expected: Record<string, number> = {
    "w-change": 5,
    "r-signed": -6.5,
    "g-temperature": 12,
    "g-trace": 12,
    "p-rise": 8.3,
    "p-fall-signed": -5.5,
    "p-fall-size": 5.5,
    "p-negative": 4,
    "p-trace-fall": -7,
    "a-graph": -6,
    "b-drop": 7.5,
    "d-a-rise": 7.5,
    "d-b-graph": 8,
  };
  const numeric = all.filter((q) => !q.options && !q.rubric);
  expect(numeric).toHaveLength(13);
  for (const q of numeric) {
    expect(Number(q.answer), q.id).toBe(expected[q.id.replace("heat-v1-", "")]);
    expect(mark(q, q.answer).correct).toBe(true);
  }
  const written = all.filter((q) => q.rubric);
  expect(written).toHaveLength(7);
  for (const q of written) expect(mark(q, q.answer).correct).toBe(false);
});
test("five supplied graph stimuli independently conserve actual time ordering and match the requested reaction-stage quantity", () => {
  const charts = all.filter((q) => q.temperatureTrace);
  expect(charts).toHaveLength(5);
  for (const q of charts) {
    const g = q.temperatureTrace!,
      points = g.points,
      baseline = points.findIndex((p) => p.time === g.mixedAfter),
      values = points.slice(baseline).map((p) => p.temperature);
    expect(baseline).toBeGreaterThanOrEqual(0);
    for (let i = 1; i < points.length; i++)
      expect(points[i].time).toBeGreaterThan(points[i - 1].time);
    if (!q.options) {
      const initial = points[baseline].temperature,
        min = Math.min(...values),
        max = Math.max(...values),
        expected = q.prompt.includes("positive SIZE")
          ? initial - min
          : q.prompt.includes("SIGNED")
            ? min - initial
            : max - initial;
      expect(Number(q.answer)).toBeCloseTo(expected, 10);
    }
  }
});
test("task-matched canonical histories decode while invented moves and noncanonical numeric states are rejected", () => {
  const p = emptyProgress(),
    w = emptyWork();
  w.taskModels = {};
  for (const q of j.guided) w.taskModels[q.id] = [initialBoard(q.model!)];
  p.work["exothermic-and-endothermic"] = w;
  expect(decode(JSON.stringify(p))).toEqual(p);
  w.taskModels[j.guided[0].id] = [
    initialBoard(j.guided[0].model!),
    { ...initialBoard(j.guided[0].model!), transfer: "3" },
  ];
  expect(decode(JSON.stringify(p))).toBeNull();
});
test("legacy and repeated demands share exposure globally rather than become fresh independent evidence", () => {
  expect(exposureIds(["exothermic-and-endothermic-3"])).toContain(
    "heat-v1-g-temperature",
  );
  expect(exposureIds(["heat-v1-r-transfer"])).toContain("heat-v1-a-direction");
  expect(exposureIds(["heat-v1-r-evidence"])).toContain("heat-v1-a-input");
  expect(exposureIds(["heat-v1-p-late"])).toContain("heat-v1-b-late");
});
