import { test, expect } from "@playwright/test";
import { periodicTableJourney as journey } from "../src/content/journeys/periodic-table";
import { tasks } from "../src/content/journeys/helpers";
import { periodicPosition } from "../src/lib/periodic-position";
import { mark } from "../src/lib/marking";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import { decode, emptyProgress, emptyWork } from "../src/lib/progress";
test("first-20 main-group positions follow independently known rows, including helium and the fourth period", () => {
  const reference = [
    [1, 1],
    [0, 1],
    [1, 2],
    [2, 2],
    [3, 2],
    [4, 2],
    [5, 2],
    [6, 2],
    [7, 2],
    [0, 2],
    [1, 3],
    [2, 3],
    [3, 3],
    [4, 3],
    [5, 3],
    [6, 3],
    [7, 3],
    [0, 3],
    [1, 4],
    [2, 4],
  ];
  reference.forEach(([group, period], i) =>
    expect(periodicPosition(i + 1)).toEqual({ group, period }),
  );
  for (const n of [0, 21, 2.5, NaN])
    expect(() => periodicPosition(n)).toThrow();
});
test("proposed placement distinguishes outer count from shell count and keeps wrong choices unchanged", () => {
  const model = journey.guided[0].model!;
  expect(initialBoard(model)).toEqual({ group: 3, period: 1 });
  expect(checkBoard(model, initialBoard(model)).correct).toBe(false);
  expect(checkBoard(model, { group: 1, period: 1 }).feedback).toContain(
    "group is right",
  );
  expect(checkBoard(model, { group: 1, period: 3 }).correct).toBe(true);
  expect(validBoard(model, { group: 18, period: 3 })).toBe(false);
  const helium = {
    kind: "periodic-place" as const,
    atomicNumber: 2,
    initial: [2, 1] as [number, number],
    instruction: "Test helium",
  };
  expect(checkBoard(helium, { group: 2, period: 1 }).correct).toBe(false);
  expect(checkBoard(helium, { group: 0, period: 1 }).correct).toBe(true);
});
test("all 48 reviewed tasks preserve their alternatives, reserved forms and written self-review", () => {
  expect(tasks(journey)).toHaveLength(48);
  const teaching = new Set(
    [
      ...journey.warmup,
      ...journey.refresher,
      ...journey.guided,
      ...journey.practice,
    ].map((q) => q.prompt),
  );
  for (const q of tasks(journey)) {
    const result = mark(q, q.answer);
    expect(q.rubric ? result.selfReview : result.correct, q.id).toBe(true);
    for (const wrong of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, wrong).correct, q.id).toBe(false);
    if (q.followUp)
      expect(
        journey.refresher.some((r) => r.id === q.followUp),
        q.id,
      ).toBe(true);
  }
  for (const q of [
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ]) {
    expect(q.model).toBeUndefined();
    expect(teaching.has(q.prompt)).toBe(false);
  }
  expect(mark(journey.practice[7], "outer electrons group")).toMatchObject({
    correct: false,
    selfReview: true,
  });
  expect(Number(journey.practice[9].answer)).toBe(20 - 2);
});
test("placement and main-group ion formation resume while simultaneous placement changes are rejected", () => {
  const q = journey.guided[0],
    model = q.model!,
    start = initialBoard(model),
    next = { ...start, group: 1 };
  expect(validHistory(model, [start, next])).toBe(true);
  expect(validHistory(model, [start, { group: 1, period: 3 }])).toBe(false);
  const data = emptyProgress();
  data.work["periodic-patterns"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "guided", index: 0 },
    taskModels: { [q.id]: [start, next] },
  };
  expect(decode(JSON.stringify(data))).toEqual(data);
  const ion = journey.guided[2].model!;
  expect(checkBoard(ion, { p: 12, n: 12, e: 10 }).correct).toBe(true);
  expect(validBoard(ion, { p: 10, n: 12, e: 10 })).toBe(false);
});
