import { test, expect } from "@playwright/test";
import { shellJourney as journey } from "../src/content/journeys/shells";
import { tasks } from "../src/content/journeys/helpers";
import { firstTwentyArrangement, readArrangement } from "../src/lib/shells";
import { mark } from "../src/lib/marking";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
} from "../src/lib/progress";

test("the first-20 ground states match independent tabulated arrangements, not universal capacities", () => {
  const reference = [
    [1],
    [2],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
    [2, 5],
    [2, 6],
    [2, 7],
    [2, 8],
    [2, 8, 1],
    [2, 8, 2],
    [2, 8, 3],
    [2, 8, 4],
    [2, 8, 5],
    [2, 8, 6],
    [2, 8, 7],
    [2, 8, 8],
    [2, 8, 8, 1],
    [2, 8, 8, 2],
  ];
  reference.forEach((arrangement, index) =>
    expect(firstTwentyArrangement(index + 1)).toEqual(arrangement),
  );
  for (const invalid of [0, 21, 2.5, NaN, Infinity])
    expect(() => firstTwentyArrangement(invalid)).toThrow();
});
test("arrangements accept comma/dot notation and empty outer guides while preserving order", () => {
  const q = journey.guided[1];
  for (const answer of ["2,8,1", " 2.8.1 ", "2, 8, 1", "2,8,1,0"])
    expect(mark(q, answer).correct, answer).toBe(true);
  for (const answer of ["2,7,2", "1,8,2", "0,2,8,1"])
    expect(mark(q, answer).correct, answer).toBe(false);
  for (const invalid of [
    "2,,8,1",
    "2,8,1,0,0",
    "2e1",
    "2,8,-1",
    "2,8,1 electrons",
    "2/1,8,1",
    "0,0",
    "99",
  ])
    expect(readArrangement(invalid), invalid).toBeNull();
  expect(mark(q, " ").empty).toBe(true);
  expect(mark(q, "2,9").feedback).toContain("second shell holds eight");
});
test("placement diagnoses missing electrons separately from correct totals in wrong shells", () => {
  const model = journey.guided[2].model!;
  expect(checkBoard(model, initialBoard(model))).toMatchObject({
    correct: false,
  });
  expect(checkBoard(model, initialBoard(model)).feedback).toContain(
    "total is right",
  );
  expect(checkBoard(model, { s1: 1, s2: 7, s3: 0, s4: 0 }).feedback).toContain(
    "1 remain",
  );
  expect(checkBoard(model, { s1: 2, s2: 7, s3: 0, s4: 0 }).correct).toBe(true);
  expect(validBoard(model, { s1: 3, s2: 6, s3: 0, s4: 0 })).toBe(false);
  expect(validBoard(model, { s1: 2, s2: 8, s3: 0, s4: 0 })).toBe(false);
  const history = [
    initialBoard(model),
    { s1: 1, s2: 7, s3: 0, s4: 0 },
    { s1: 2, s2: 7, s3: 0, s4: 0 },
  ];
  expect(validHistory(model, history)).toBe(true);
  expect(validHistory(model, [history[0], history[2]])).toBe(false);
  expect(
    validHistory(model, [
      initialBoard(journey.guided[0].model!),
      { s1: 2, s2: 2, s3: 0, s4: 0 },
    ]),
  ).toBe(false);
});
test("the 34 individual tasks reserve forms, distinguish diagram demands and avoid false written marks", () => {
  expect(tasks(journey)).toHaveLength(34);
  expect(journey.checkForms.map((f) => f.length)).toEqual([4, 4]);
  expect(journey.reviewForms.map((f) => f.length)).toEqual([3, 3]);
  const teaching = new Set(
    [
      ...journey.warmup,
      ...journey.refresher,
      ...journey.guided,
      ...journey.practice,
    ].map((q) => q.prompt),
  );
  for (const q of tasks(journey)) {
    expect(q.purpose.length, q.id).toBeGreaterThan(15);
    const result = mark(q, q.answer);
    expect(q.rubric ? result.selfReview : result.correct, q.id).toBe(true);
    for (const error of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, error).correct, q.id).toBe(false);
    if (q.model)
      expect(validHistory(q.model, [initialBoard(q.model)]), q.id).toBe(true);
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
    expect(teaching.has(q.prompt), q.id).toBe(false);
    expect(q.model, q.id).toBeUndefined();
  }
  expect(exposureIds(["sh-v1-ca-beryllium"])).toContain("sh-v1-r-count");
  expect(exposureIds(["sh-v1-r-count"])).toContain("sh-v1-ca-beryllium");
  expect(mark(journey.practice[9], "shells group period")).toMatchObject({
    correct: false,
    selfReview: true,
  });
});
test("shell-placement work survives decoding and tampered budgets or jumps are preserved as unreadable", () => {
  const q = journey.guided[1],
    model = q.model!,
    initial = initialBoard(model);
  const data = emptyProgress();
  data.work["electron-shells"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "guided", index: 1 },
    taskModels: { [q.id]: [initial, { ...initial, s3: 1 }] },
  };
  expect(decode(JSON.stringify(data))).toEqual(data);
  data.work["electron-shells"].taskModels![q.id] = [
    initial,
    { ...initial, s3: 2 },
  ];
  expect(decode(JSON.stringify(data))).toBeNull();
});
