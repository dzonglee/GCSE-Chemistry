import { test, expect } from "@playwright/test";
import { measurementJourney as journey } from "../src/content/journeys/measurement-uncertainty";
import { uncertaintyWritingAdditions as added } from "../src/content/journeys/uncertainty-writing";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import { classFrequencies } from "../src/lib/frequency-display";
import { questionById } from "../src/content/curriculum";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
} from "../src/lib/progress";
test("measurement additions preserve original records and positions while constructing actual frequency displays", () => {
  expect(journey.version).toBe(1);
  expect(tasks(journey)).toHaveLength(60);
  expect(journey.practice[19].id).toBe("mu-v1-p-explain");
  expect(journey.practice[20].id).toBe("mu-v1-p-evaluate");
  expect(journey.checkForms.map((f) => f.length)).toEqual([5, 5, 4]);
  expect(journey.reviewForms.map((f) => f.length)).toEqual([3, 3, 4]);
  expect(new Set(journey.practiceGroups!.flatMap((g) => g.taskIds))).toEqual(
    new Set(journey.practice.map((q) => q.id)),
  );
  const p = emptyProgress();
  p.work["measurement-uncertainty"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "practice", index: 20 },
    drafts: {
      [added.check[0].id]: "Precise means true. 1..2",
      [added.check[2].id]: JSON.stringify({ f0: "1..2", f1: "7" }),
    },
  };
  expect(decode(JSON.stringify(p))).toEqual(p);
});
test("class edges count every trial exactly once and independent table and histogram frequencies are literal verified counts", () => {
  expect(classFrequencies([0, 1, 1, 2, 2, 3], [0, 1, 2, 4])).toEqual([1, 2, 3]);
  expect(() => classFrequencies([4], [0, 1, 4])).toThrow();
  expect(() => classFrequencies([1], [0, 2, 1])).toThrow();
  const questions = [
    added.guided[0],
    ...added.practice,
    ...added.check.slice(2),
    ...added.review.slice(2),
  ];
  const expected = [
    [1, 3, 3, 1],
    [1, 3, 2, 2],
    [2, 4, 2],
    [2, 1, 4, 1],
    [2, 2, 4],
    [3, 2, 1, 2],
    [3, 3, 2],
  ];
  questions.forEach((q, i) => {
    expect(Object.values(JSON.parse(q.answer))).toEqual(
      expected[i].map(String),
    );
    expect(expected[i].reduce((a, b) => a + b, 0)).toBe(8);
    expect(mark(q, q.answer).correct).toBe(true);
    const values = JSON.parse(q.answer);
    values.f0 = "1..2";
    expect(mark(q, JSON.stringify(values)).invalid).toBe(true);
    values.f0 = "-1";
    expect(mark(q, JSON.stringify(values)).correct).toBe(false);
    delete values.f1;
    expect(mark(q, JSON.stringify(values)).correct).toBe(false);
    if (q.frequencyDisplay!.kind === "histogram") {
      const edges = q.frequencyDisplay!.ticks;
      const width = edges[1] - edges[0];
      edges
        .slice(1)
        .forEach((v, n) => expect(v - edges[n]).toBeCloseTo(width, 8));
    }
  });
});
test("independent uncertainty and method accounts are manually reviewed with reciprocal exposure rather than invented examiner marks", () => {
  const manual = [...added.check, ...added.review].filter((q) => q.rubric);
  expect(manual).toHaveLength(4);
  for (const q of manual) {
    expect(mark(q, q.answer).correct).toBe(false);
    expect(mark(q, q.answer).selfReview).toBe(true);
  }
  expect(added.check[0].answer).toContain("0.6 °C");
  expect(added.check[0].answer).toContain("systematic offset");
  expect(added.check[1].answer).toContain("0.50 g");
  expect(added.review[0].answer).toContain("4.9 g");
  expect(added.review[1].answer).toContain("not a universal");
  expect(added.review[1].prompt).toContain("Same quantity and conditions");
  expect(exposureIds(["mu-v1-p-explain"])).toContain(added.check[1].id);
  expect(exposureIds([added.practice[0].id])).toContain(added.check[2].id);
  for (const q of tasks(journey))
    for (const id of q.exposureAliases ?? [])
      expect(questionById(id)?.exposureAliases).toContain(q.id);
});
