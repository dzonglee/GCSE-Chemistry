import { test, expect } from "@playwright/test";
import { statesJourney } from "../src/content/journeys/states-of-matter";
import {
  statesForTier,
  statesWritingAdditions as added,
} from "../src/content/journeys/states-writing";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import {
  exposureIds,
  decode,
  emptyProgress,
  emptyWork,
} from "../src/lib/progress";
test("Foundation excludes new Higher assessment demands without changing original learning positions or Higher forms", () => {
  const foundation = statesForTier(statesJourney, "foundation");
  expect(statesJourney.version).toBe(1);
  expect(tasks(statesJourney)).toHaveLength(57);
  expect(foundation.practice).toBe(statesJourney.practice);
  expect(foundation.guided).toBe(statesJourney.guided);
  expect(foundation.checkForms.slice(0, 2)).toEqual(
    statesJourney.checkForms.slice(0, 2),
  );
  expect(foundation.reviewForms.slice(0, 2)).toEqual(
    statesJourney.reviewForms.slice(0, 2),
  );
  expect(foundation.checkForms[2]).toEqual(added.check.slice(0, 3));
  expect(foundation.reviewForms[2]).toEqual(added.review.slice(0, 3));
  expect(statesForTier(statesJourney, "higher")).toBe(statesJourney);
  for (const q of [
    ...foundation.checkForms.flat(),
    ...foundation.reviewForms.flat(),
  ])
    expect(q.tier).not.toBe("higher");
});
test("saved original and Higher responses remain raw and manually reviewed", () => {
  const p = emptyProgress();
  p.work["states-of-matter"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "practice", index: 17 },
    drafts: { [added.check[3].id]: "Real forces do not exist. 1..2" },
  };
  expect(decode(JSON.stringify(p))).toEqual(p);
  for (const q of [...added.practice, ...added.check, ...added.review]) {
    expect(q.rubric!.length).toBeGreaterThanOrEqual(3);
    expect(mark(q, q.answer).correct).toBe(false);
    expect(mark(q, "Particles expand into new molecules. 1..2").correct).toBe(
      false,
    );
    expect(mark(q, "").correct).toBe(false);
  }
});
test("helped sphere-model equivalents retain exposure while different energy and bulk demands remain authored", () => {
  const all = tasks(statesJourney);
  const higher = added.check[3];
  for (const id of [
    "st-v1-p-higher-limits",
    added.practice[0].id,
    added.review[3].id,
  ]) {
    expect(exposureIds([higher.id])).toContain(id);
    expect(exposureIds([all.find((q) => q.id === id)!.id])).toContain(
      higher.id,
    );
  }
  expect(added.check[0].prompt).toContain("melts");
  expect(added.check[1].prompt).toContain("intermolecular");
  expect(added.review[2].prompt).toContain("−20");
});
