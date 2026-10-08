import { test, expect } from "@playwright/test";
import { isotopeJourney as journey } from "../src/content/journeys/isotopes";
import { tasks } from "../src/content/journeys/helpers";
import {
  initialBoard,
  validBoard,
  validHistory,
  checkBoard,
} from "../src/lib/workbench";
import { mark } from "../src/lib/marking";
import { decode, emptyProgress, emptyWork } from "../src/lib/progress";

test("the authored lesson reserves independent and delayed tasks and gives each a purpose", () => {
  expect(tasks(journey)).toHaveLength(32);
  expect(journey.guided.filter((q) => q.openingHint).map((q) => q.id)).toEqual([
    "iso-v1-g-carbon",
    "iso-v1-g-sodium",
  ]);
  expect(journey.practice).toHaveLength(8);
  expect(journey.checkForms.map((form) => form.length)).toEqual([4, 4]);
  expect(journey.reviewForms.map((form) => form.length)).toEqual([3, 3]);
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
    expect(
      q.rubric ? mark(q, q.answer).selfReview : mark(q, q.answer).correct,
      q.id,
    ).toBe(true);
    for (const error of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, error).correct, q.id).toBe(false);
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
    expect(q.model, q.id).toBeUndefined();
    expect(teaching.has(q.prompt), q.id).toBe(false);
  }
});
test("isotope operations change only neutrons; ion operations change only electrons", () => {
  for (const task of tasks(journey).filter((q) => q.model)) {
    const model = task.model!;
    if (model.kind !== "atom-transform")
      throw new Error("Unexpected workbench family");
    const start = initialBoard(model),
      target = { p: model.target[0], n: model.target[1], e: model.target[2] };
    expect(validBoard(model, start), task.id).toBe(true);
    expect(validBoard(model, target), task.id).toBe(true);
    expect(model.target[0], task.id).toBe(model.initial[0]);
    expect(
      model.operation === "isotope" ? model.target[2] : model.target[1],
      task.id,
    ).toBe(model.operation === "isotope" ? model.initial[2] : model.initial[1]);
    expect(
      validBoard(model, { ...start, p: Number(start.p) + 1 }),
      task.id,
    ).toBe(false);
    const fixed = model.operation === "isotope" ? "e" : "n";
    expect(
      validBoard(model, { ...start, [fixed]: Number(start[fixed]) + 1 }),
      task.id,
    ).toBe(false);
    expect(checkBoard(model, target).correct, task.id).toBe(true);
  }
});
test("inverse charge and nuclear-symbol answers agree with signed particle arithmetic", () => {
  const all = tasks(journey);
  for (const [id, result] of [
    ["iso-v1-g-chlorine", 37 - 17],
    ["iso-v1-g-sodium", 11 - 10],
    ["iso-v1-g-chloride", 17 - 18],
    ["iso-v1-p-magnesium", 12 - 10],
    ["iso-v1-p-sulfide", 16 - 18],
    ["iso-v1-p-inverse", 11 - 1],
    ["iso-v1-ca-electrons", 20 - 2],
    ["iso-v1-rb-electrons", 8 - -2],
  ] as const)
    expect(Number(all.find((q) => q.id === id)!.answer), id).toBe(result);
  for (const q of all.filter((q) => q.parts)) {
    const symbol = q.notation!;
    expect(q.parts!.map((part) => part.answer)).toEqual([
      symbol.atomicNumber,
      symbol.massNumber - symbol.atomicNumber,
      symbol.atomicNumber - (symbol.charge ?? 0),
    ]);
    expect(
      mark(
        q,
        JSON.stringify({
          p: String(symbol.atomicNumber),
          n: String(symbol.massNumber - symbol.atomicNumber),
          e: String(symbol.atomicNumber),
        }),
      ).correct,
    ).toBe(false);
  }
  expect(mark(journey.practice[7], "protons electrons positive")).toMatchObject(
    { correct: false, selfReview: true },
  );
});
test("fixed-quantity transformation histories survive decoding while tampered nuclei are rejected", () => {
  const q = journey.guided[2],
    model = q.model!;
  const start = initialBoard(model),
    history = [start, { ...start, e: 10 }];
  expect(validHistory(model, history)).toBe(true);
  const data = emptyProgress();
  data.work["isotopes-and-ions"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "guided", index: 2 },
    taskModels: { [q.id]: history },
  };
  expect(decode(JSON.stringify(data))).toEqual(data);
  data.work["isotopes-and-ions"].taskModels![q.id] = [
    start,
    { ...start, n: 13 },
  ];
  expect(decode(JSON.stringify(data))).toBeNull();
});
