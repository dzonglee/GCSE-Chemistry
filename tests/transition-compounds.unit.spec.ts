import { test, expect } from "@playwright/test";
import { transitionMetalsJourney as journey } from "../src/content/journeys/transition-metals";
import { transitionCompounds as added } from "../src/content/journeys/transition-compounds";
import {
  initialBoard,
  checkBoard,
  validBoard,
  validHistory,
} from "../src/lib/workbench";
import { mark } from "../src/lib/marking";
test("paper prediction keeps the blank and wrong observations, conditions and compound identity distinct", () => {
  const model = added.guided[1].model!;
  const blank = initialBoard(model);
  expect(blank).toEqual({ condition: "dry", colour: "unset" });
  expect(checkBoard(model, blank).correct).toBe(false);
  expect(checkBoard(model, { condition: "dry", colour: "blue" }).correct).toBe(
    false,
  );
  expect(checkBoard(model, { condition: "wet", colour: "blue" }).correct).toBe(
    false,
  );
  expect(checkBoard(model, { condition: "wet", colour: "pink" }).correct).toBe(
    true,
  );
  expect(validBoard(model, { condition: "wet", colour: "purple" })).toBe(false);
  expect(
    validBoard(model, { condition: "wet", colour: "pink", metal: "Co" }),
  ).toBe(false);
  expect(
    validHistory(model, [
      blank,
      { ...blank, condition: "wet" },
      { condition: "wet", colour: "blue" },
      { condition: "wet", colour: "pink" },
    ]),
  ).toBe(true);
  expect(
    validHistory(model, [blank, { condition: "wet", colour: "pink" }]),
  ).toBe(false);
});
test("chemical extension preserves original positions and forms and resolves actual recovery tasks", () => {
  expect(journey.guided.slice(0, 4).map((q) => q.id)).toEqual([
    "tm-v1-g-compare",
    "tm-v1-g-fe2",
    "tm-v1-g-fe3",
    "tm-v1-g-catalyst",
  ]);
  expect(journey.checkForms).toHaveLength(3);
  expect(journey.reviewForms).toHaveLength(3);
  expect(journey.checkForms[2]).toEqual(added.check);
  expect(journey.reviewForms[2]).toEqual(added.review);
  const grouped = journey.practiceGroups!.flatMap((group) => group.taskIds);
  expect(grouped).toHaveLength(13);
  expect(new Set(grouped)).toEqual(new Set(journey.practice.map((q) => q.id)));
  const refreshers = new Set(journey.refresher.map((q) => q.id));
  for (const q of [
    ...added.guided,
    ...added.practice,
    ...added.check,
    ...added.review,
  ]) {
    for (const alias of q.exposureAliases ?? []) {
      const other = [
        ...journey.refresher,
        ...journey.guided,
        ...journey.practice,
        ...journey.checkForms.flat(),
        ...journey.reviewForms.flat(),
      ].find((t) => t.id === alias)!;
      expect(other.exposureAliases).toContain(q.id);
    }
  }
  for (const q of [
    ...added.refresher,
    ...added.guided,
    ...added.practice,
    ...added.check,
    ...added.review,
  ])
    expect(refreshers.has(q.followUp!)).toBe(true);
});
test("complete chemical explanations remain manual even when a reference is supplied exactly", () => {
  for (const q of [...added.practice, ...added.check, ...added.review].filter(
    (q) => q.rubric,
  )) {
    expect(mark(q, q.answer).correct).toBe(false);
    expect(mark(q, "Cobalt metal is always pink. 1..2").correct).toBe(false);
    expect(mark(q, "").correct).toBe(false);
  }
  const chromium = added.practice[0];
  expect(mark(chromium, chromium.answer).correct).toBe(true);
  expect(
    mark(
      chromium,
      chromium.options!.find((o) => o.includes("charges"))!,
    ).correct,
  ).toBe(false);
});
