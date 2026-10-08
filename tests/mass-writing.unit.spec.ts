import { test, expect } from "@playwright/test";
import { massConservationJourney as journey } from "../src/content/journeys/conservation-of-mass";
import { massWritingAdditions as added } from "../src/content/journeys/mass-writing";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import { questionById } from "../src/content/curriculum";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
} from "../src/lib/progress";
test("mass additions preserve original identities, forms, positions and retained wrong accounts", () => {
  expect(journey.version).toBe(1);
  expect(tasks(journey)).toHaveLength(57);
  expect(journey.practice[20].id).toBe("mc-v1-p-explain");
  expect(journey.practice[21].id).toBe("mc-v1-p-evaluate");
  expect(journey.checkForms.map((f) => f.length)).toEqual([5, 5, 3]);
  expect(journey.reviewForms.map((f) => f.length)).toEqual([3, 3, 3]);
  expect(new Set(journey.practiceGroups!.flatMap((g) => g.taskIds))).toEqual(
    new Set(journey.practice.map((q) => q.id)),
  );
  const p = emptyProgress();
  p.work["conservation-of-mass"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "practice", index: 21 },
    drafts: {
      [added.check[0].id]: "Carbon atoms vanish. 1..2",
      [added.check[2].id]: JSON.stringify({ products: "1..2", contents: "16" }),
    },
  };
  expect(decode(JSON.stringify(p))).toEqual(p);
});
test("complete inventories independently retain unused material and escaped gas with consistent apparatus boundaries", () => {
  const cold = added.check[2],
    delayed = added.review[2];
  expect(JSON.parse(cold.answer)).toEqual({
    products: "12",
    contents: "16",
    reading: "56",
    wider: "58",
  });
  expect(JSON.parse(delayed.answer)).toEqual({
    products: "15",
    contents: "20",
    reading: "45",
    wider: "48",
  });
  for (const q of [cold, delayed]) {
    expect(mark(q, q.answer).correct).toBe(true);
    const values = JSON.parse(q.answer);
    expect(
      mark(q, JSON.stringify({ ...values, products: "1..2" })).invalid,
    ).toBe(true);
    delete values.wider;
    expect(mark(q, JSON.stringify(values)).correct).toBe(false);
  }
  expect(
    mark(
      cold,
      JSON.stringify({
        products: "14",
        contents: "16",
        reading: "56",
        wider: "58",
      }),
    ).correct,
  ).toBe(false);
  expect(
    mark(
      cold,
      JSON.stringify({
        products: "12",
        contents: "12",
        reading: "52",
        wider: "54",
      }),
    ).correct,
  ).toBe(false);
});
test("independent chemical accounts retain atoms and oxygen source while equivalent help stays exposed and manually marked", () => {
  for (const q of [...added.practice, ...added.check, ...added.review].filter(
    (q) => q.rubric,
  ))
    expect(mark(q, q.answer).correct).toBe(false);
  expect(added.check[0].rubric).toHaveLength(2);
  expect(added.check[1].answer).toContain("2.4 g oxygen");
  expect(added.review[0].answer).toContain("one Cu, one C and three O");
  expect(added.review[1].answer).toContain("76.2 g");
  expect(exposureIds(["mc-v1-p-explain"])).toContain(added.check[0].id);
  expect(exposureIds(["conservation-and-concentration-1"])).toContain(
    added.review[0].id,
  );
  expect(exposureIds(["mc-v1-p-ledger"])).toContain(added.check[2].id);
  for (const q of tasks(journey))
    for (const id of q.exposureAliases ?? [])
      expect(questionById(id)?.exposureAliases).toContain(q.id);
});
