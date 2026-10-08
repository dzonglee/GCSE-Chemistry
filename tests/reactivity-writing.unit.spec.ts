import { test, expect } from "@playwright/test";
import { metalReactivityJourney as journey } from "../src/content/journeys/metal-reactivity";
import { reactivityWritingAdditions as added } from "../src/content/journeys/reactivity-writing";
import { metalReactionReference as reference } from "../src/lib/metal-reaction-reference";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
} from "../src/lib/progress";
test("metal additions preserve original forms positions and raw written drafts", () => {
  expect(journey.version).toBe(1);
  expect(tasks(journey)).toHaveLength(60);
  expect(journey.practice).toHaveLength(23);
  expect(journey.practice[2].id).toBe("mr-v1-p-full-order");
  expect(journey.practice[20].id).toBe("mr-v1-p-final-gas");
  expect(journey.checkForms.map((f) => f.length)).toEqual([5, 5, 3]);
  expect(journey.reviewForms.map((f) => f.length)).toEqual([3, 3, 3]);
  expect(new Set(journey.practiceGroups!.flatMap((g) => g.taskIds))).toEqual(
    new Set(journey.practice.map((q) => q.id)),
  );
  const p = emptyProgress();
  p.work["metal-reactivity"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "practice", index: 20 },
    drafts: {
      [added.check[1].id]: "Every2+ ion proves equal reactivity. 1..2",
    },
  };
  expect(decode(JSON.stringify(p))).toEqual(p);
});
test("reaction reference covers the actual eight metals and supplied independent placements are literal comparisons", () => {
  expect(reference.map((m) => m.symbol)).toEqual([
    "K",
    "Na",
    "Li",
    "Ca",
    "Mg",
    "Zn",
    "Fe",
    "Cu",
  ]);
  expect(reference[0].water).toContain("lilac");
  expect(reference[3].water).toContain("cloudy");
  expect(reference[4].water).toContain("Very slow");
  expect(reference[7].acid).toContain("non-oxidising");
  expect(35 > 26 && 26 > 17).toBe(true);
  expect(32 > 22 && 22 > 16).toBe(true);
  expect(added.check[2].answer).toContain("Mg > P > Zn");
  expect(added.review[2].answer).toContain("Mg > X > Zn");
  for (const q of [added.check[2], added.review[2]])
    expect(q.rubric).toHaveLength(4);
});
test("full reaction and investigation writing stays manual and corresponding help remains exposed", () => {
  const manual = [...added.check, ...added.review];
  expect(manual.every((q) => q.rubric)).toBe(true);
  for (const q of manual) {
    expect(mark(q, q.answer).selfReview).toBe(true);
    expect(mark(q, q.answer).correct).toBe(false);
  }
  expect(added.check[1].answer).toContain("same 2+ charge");
  expect(added.review[1].answer).toContain("Element identities");
  expect(exposureIds(["mr-v1-p-full-order"])).toContain(added.check[0].id);
  expect(exposureIds(["mr-write-v1-r-plan"])).toContain(added.review[2].id);
  for (const q of tasks(journey))
    for (const wrong of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, wrong).correct, q.id).toBe(false);
});
