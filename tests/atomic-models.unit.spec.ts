import { test, expect } from "@playwright/test";
import { atomicModelJourney as journey } from "../src/content/journeys/atomic-models";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import {
  checkBoard,
  initialBoard,
  validBoard,
  validHistory,
} from "../src/lib/workbench";
import { decode, emptyProgress, emptyWork } from "../src/lib/progress";

test("historical tasks reserve independent forms and explanations cannot earn automatic marks", () => {
  expect(tasks(journey)).toHaveLength(43);
  expect(journey.checkForms.map((f) => f.length)).toEqual([4, 4, 2]);
  expect(journey.reviewForms.map((f) => f.length)).toEqual([3, 3, 2]);
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
    expect(q.purpose.length, q.id).toBeGreaterThan(15);
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
  for (const q of journey.practice.filter((q) => q.rubric))
    expect(mark(q, "nucleus electrons charge")).toMatchObject({
      correct: false,
      selfReview: true,
    });
});
test("scattering distinguishes diffuse charge, common straight paths and rare close approaches", () => {
  for (const q of journey.guided) {
    const model = q.model!;
    expect(model.kind).toBe("scattering");
    if (model.kind !== "scattering") throw Error("wrong model");
    expect(
      checkBoard(model, {
        distribution: "spread",
        approach: model.targetApproach,
      }).correct,
    ).toBe(false);
    expect(
      checkBoard(model, {
        distribution: "central",
        approach: model.targetApproach,
      }).correct,
    ).toBe(true);
    for (const approach of ["far", "near", "head-on"])
      if (approach !== model.targetApproach)
        expect(
          checkBoard(model, { distribution: "central", approach }).correct,
        ).toBe(false);
  }
  expect(
    checkBoard(journey.guided[0].model!, {
      distribution: "central",
      approach: "head-on",
    }).feedback,
  ).toContain("positive");
  expect(
    checkBoard(journey.guided[1].model!, {
      distribution: "central",
      approach: "far",
    }).feedback,
  ).toContain("empty");
  expect(
    checkBoard(journey.guided[2].model!, {
      distribution: "central",
      approach: "near",
    }).feedback,
  ).toContain("repel");
});
test("illustrative percentages are arithmetic data rather than invented historical measurements", () => {
  const q = journey.practice.find((q) => q.id === "am-v1-p-data")!;
  expect(Number(q.answer)).toBe((9890 / (9890 + 100 + 10)) * 100);
  expect(mark(q, "0.989").correct).toBe(false);
  expect(mark(q, "98.9%").invalid).toBe(true);
  const r = journey.refresher.find((q) => q.id === "am-v1-r-percentage")!;
  expect(Number(r.answer)).toBe((190 / 200) * 100);
});
test("categorical operations resume without accepting impossible saved model transitions", () => {
  const q = journey.guided[0],
    model = q.model!,
    start = initialBoard(model);
  const changed = { ...start, distribution: "central" };
  expect(validHistory(model, [start, changed])).toBe(true);
  expect(
    validBoard(model, { distribution: "negative", approach: "head-on" }),
  ).toBe(false);
  expect(
    validHistory(model, [start, { distribution: "central", approach: "far" }]),
  ).toBe(false);
  const data = emptyProgress();
  data.work["atomic-models"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "guided", index: 0 },
    taskModels: { [q.id]: [start, changed] },
  };
  expect(decode(JSON.stringify(data))).toEqual(data);
  data.work["atomic-models"].taskModels![q.id] = [
    start,
    { distribution: "central", approach: "far" },
  ];
  expect(decode(JSON.stringify(data))).toBeNull();
});
