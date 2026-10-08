import { test, expect } from "@playwright/test";
import { practicalJourney as j } from "../src/content/journeys/energy-practical";
import { lessons } from "../src/content/curriculum";
import { mark } from "../src/lib/marking";
import {
  emptyProgress,
  emptyWork,
  decode,
  exposureIds,
} from "../src/lib/progress";
import { initialBoard } from "../src/lib/workbench";
const all = [
  ...j.warmup,
  ...j.refresher,
  ...j.guided,
  ...j.practice,
  ...j.checkForms.flat(),
  ...j.reviewForms.flat(),
];
test("the individual Foundation/shared journey has59 tasks, valid recovery targets and six preserved original IDs", () => {
  const l = lessons.find((l) => l.slug === "energy-practical")!;
  expect(l.tier).toBe("foundation");
  expect(l.course).toBe("combined");
  expect(l.prerequisite).toBe("exothermic-and-endothermic");
  expect(l.journey).toBe(j);
  expect([...l.questions, ...l.checks].map((q) => q.id)).toEqual(
    Array.from({ length: 6 }, (_, i) => "energy-practical-" + i),
  );
  expect(all).toHaveLength(59);
  expect(new Set(all.map((q) => q.id)).size).toBe(59);
  expect(j.guided).toHaveLength(7);
  expect(j.practice).toHaveLength(24);
  for (const q of all) {
    expect(q.purpose).toBeTruthy();
    if (q.followUp)
      expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
});
test("all25 numerical answers match independent temperature, mean and graph references", () => {
  const refs: Record<string, number> = {
    "warm-difference": 8.5,
    "warm-mean": 9,
    "r-reading": 8.5,
    "r-mean": 8.4,
    "r-gradient": 2,
    "g-observe": 8.2,
    "g-repeat": 7.85,
    "g-graph": 1.5,
    "p-rise": 7.7,
    "p-cooling": -6.5,
    "p-mean": 5.4,
    "p-failure": 6.3,
    "p-baselines": 8,
    "p-gradient": 1.2,
    "p-intercept": 22.6,
    "a-rise": 8.8,
    "a-mean": 4.5,
    "a-gradient": 1.4,
    "b-change": -6.8,
    "b-validmean": 9.2,
    "b-intercept": 21.4,
    "d-a-rise": 9.2,
    "d-a-gradient": 1.25,
    "d-b-mean": 6.3,
    "d-b-intercept": 22.2,
  };
  const numeric = all.filter((q) => !q.options && !q.rubric);
  expect(numeric).toHaveLength(25);
  for (const q of numeric) {
    expect(Number(q.answer), q.id).toBe(refs[q.id.replace("ep-v1-", "")]);
    expect(mark(q, q.answer).correct).toBe(true);
    expect(mark(q, String(Number(q.answer) + 1)).correct).toBe(false);
    if (q.practicalGraph) {
      expect(mark(q, String(Number(q.answer) + q.tolerance! / 2)).correct).toBe(
        true,
      );
      expect(
        mark(q, String(Number(q.answer) + q.tolerance! + 0.01)).correct,
      ).toBe(false);
    }
  }
});
test("ten method, graph and explanation responses remain self-reviewed even when they match the model answer", () => {
  const written = all.filter((q) => q.rubric);
  expect(written).toHaveLength(10);
  for (const q of written) {
    if (q.fuelDrawing) continue; // Full graph schema and honest marking covered separately.
    expect(q.rubric!.length).toBeGreaterThanOrEqual(2);
    expect(mark(q, q.answer)).toMatchObject({
      correct: false,
      selfReview: true,
    });
    expect(mark(q, "A short unsupported claim.")).toMatchObject({
      correct: false,
      selfReview: true,
    });
  }
});
test("cold and delayed checks have distinct IDs, static graph stimuli and no learning model or premature hint", () => {
  expect(j.checkForms.map((f) => f.length)).toEqual([5, 5]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([3, 3]);
  const reserved = [...j.checkForms.flat(), ...j.reviewForms.flat()];
  expect(new Set(reserved.map((q) => q.id)).size).toBe(16);
  for (const q of reserved) {
    expect(q.model).toBeUndefined();
    expect(q.openingHint).not.toBe(true);
  }
  expect(
    j.checkForms[0].find((q) => q.id === "ep-v1-a-gradient")!.practicalGraph,
  ).toBeTruthy();
  expect(
    j.checkForms[1].find((q) => q.id === "ep-v1-b-intercept")!.practicalGraph,
  ).toBeTruthy();
  for (const q of all.filter((q) => q.practicalGraph)) {
    const g = q.practicalGraph!;
    expect(g.yMin).toBe(20);
    expect(g.xLabel).toBe("Mass / g");
    expect(g.points).toHaveLength(5);
  }
});
test("native method drafts decode, preserve wrong choices and atomically switch scenarios with matching fields", () => {
  const p = emptyProgress(),
    w = emptyWork();
  w.taskModels = {};
  p.work["energy-practical"] = w;
  const q = j.guided[0],
    a = initialBoard(q.model!);
  w.taskModels[q.id] = [a, { ...a, independent: "highest-temperature" }];
  expect(decode(JSON.stringify(p))).toEqual(p);
  const next = initialBoard({
    kind: "energy-practical",
    mode: "plan",
    record: "volume",
    instruction: "",
  });
  w.taskModels[q.id] = [a, { ...a, independent: "highest-temperature" }, next];
  expect(decode(JSON.stringify(p))).toEqual(p);
  w.taskModels[q.id] = [
    a,
    { ...a, independent: "carbonate-mass", dependent: "highest-temperature" },
  ];
  expect(decode(JSON.stringify(p))).toBeNull();
});
test("legacy, model-assisted and repeated fitted-line reasoning share global exposure", () => {
  expect(exposureIds(["energy-practical-4"])).toContain("ep-v1-r-reading");
  expect(exposureIds(["ep-v1-g-plan"])).toContain("ep-v1-a-control");
  expect(exposureIds(["ep-v1-g-evidence"])).toContain("ep-v1-b-written");
  expect(exposureIds(["ep-v1-p-gradient"])).toContain("ep-v1-p-intercept");
});
