import { test, expect } from "@playwright/test";
import { periodicDevelopmentJourney as journey } from "../src/content/journeys/periodic-development";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import {
  initialBoard,
  checkBoard,
  validBoard,
  validHistory,
} from "../src/lib/workbench";
import { decode, emptyProgress, emptyWork } from "../src/lib/progress";
test("a property conflict is preserved until the student leaves a gap, with validated resumable evidence", () => {
  const model = journey.guided[0].model!;
  const start = initialBoard(model),
    repaired = { arrangement: "gap" };
  expect(checkBoard(model, start)).toMatchObject({ correct: false });
  expect(checkBoard(model, repaired)).toMatchObject({ correct: true });
  expect(start).toEqual({ arrangement: "force" });
  expect(validBoard(model, { arrangement: "auto" })).toBe(false);
  expect(validBoard(model, { arrangement: "gap", invented: "element" })).toBe(
    false,
  );
  expect(validHistory(model, [start, repaired])).toBe(true);
  expect(validHistory(model, [repaired])).toBe(false);
  const data = emptyProgress();
  data.work["periodic-development"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "guided", index: 0 },
    taskModels: { [journey.guided[0].id]: [start, repaired] },
  };
  expect(decode(JSON.stringify(data))).toEqual(data);
});
test("38 individually authored historical tasks distinguish weight, properties, predictions and isotope averages", () => {
  expect(tasks(journey)).toHaveLength(38);
  expect(journey.guided[2].answer).toBe("Argon, because 18 is less than 19");
  expect(journey.guided[2].explanation).toContain(
    "not a claim that Mendeleev knew undiscovered argon",
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
  expect(
    mark(journey.practice[8], "gaps properties predictions"),
  ).toMatchObject({ correct: false, selfReview: true });
  expect(journey.practice[8].options).toBeUndefined();
  const teaching = new Set(
    [
      ...journey.warmup,
      ...journey.refresher,
      ...journey.guided,
      ...journey.practice,
    ].map((q) => q.prompt),
  );
  for (const q of [
    ...journey.checkForms.flat(),
    ...journey.reviewForms.flat(),
  ]) {
    expect(q.model).toBeUndefined();
    expect(teaching.has(q.prompt)).toBe(false);
  }
});
