import { test, expect } from "@playwright/test";
import { changingConcentrationJourney as journey } from "../src/content/journeys/changing-concentration";
import { changingWritingAdditions as added } from "../src/content/journeys/changing-writing";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
} from "../src/lib/progress";
import {
  concentrationChange,
  retainedPortion,
  dilutedSolution,
} from "../src/lib/changing-concentration";
test("changing concentration extends independent writing while preserving original task positions and raw records", () => {
  expect(journey.version).toBe(1);
  expect(tasks(journey)).toHaveLength(56);
  expect(journey.practice[18].id).toBe("cc-v1-p-explain");
  expect(journey.practice[19].id).toBe("cc-v1-p-justify");
  expect(journey.checkForms.map((f) => f.length)).toEqual([5, 5, 3]);
  expect(journey.reviewForms.map((f) => f.length)).toEqual([3, 3, 3]);
  expect(new Set(journey.practiceGroups!.flatMap((g) => g.taskIds))).toEqual(
    new Set(journey.practice.map((q) => q.id)),
  );
  const p = emptyProgress();
  p.work["changing-concentration"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "practice", index: 19 },
    drafts: {
      [added.check[0].id]: "More mass always means more concentrated. 1..2",
    },
  };
  expect(decode(JSON.stringify(p))).toEqual(p);
});
test("independent inventories and competing factors agree with literal mass-volume calculations", () => {
  expect(concentrationChange(3, 6)).toBe(0.5);
  expect(concentrationChange(3, 2)).toBe(1.5);
  expect(retainedPortion(18, 600, 200)).toMatchObject({
    mass: 6,
    removedMass: 12,
    concentration: 30,
  });
  expect(dilutedSolution(18, 1200).concentration).toBe(15);
  expect(retainedPortion(8, 400, 100)).toMatchObject({
    mass: 2,
    removedMass: 6,
    concentration: 20,
  });
  expect(dilutedSolution(8, 100).concentration).toBe(80);
  expect(added.check[0].answer).toContain("C_B < C_A");
  expect(added.review[0].answer).toContain("C_B > C_A");
  expect(added.check[1].answer).toContain("volume-additivity assumption");
  expect(added.review[1].answer).toContain("precipitation");
});
test("writing remains manual and all seven symbols separate approximation and conditional proportionality with reciprocal exposure", () => {
  const manual = [...added.check, ...added.review].filter((q) => q.rubric);
  expect(manual).toHaveLength(4);
  for (const q of manual) {
    expect(mark(q, q.answer).correct).toBe(false);
    expect(mark(q, q.answer).selfReview).toBe(true);
  }
  expect(added.practice[1].answer).toBe("31.96 ~ 32.0");
  expect(added.guided[0].answer).toBe("C ∝ 1/V");
  expect(exposureIds(["cc-v1-p-justify"])).toContain(added.check[0].id);
  expect(exposureIds([added.review[1].id])).toContain("cc-v1-p-explain");
  expect(exposureIds([added.practice[1].id])).toContain(added.check[2].id);
  for (const q of tasks(journey))
    for (const wrong of Object.keys(q.misconceptions ?? {}))
      expect(mark(q, wrong).correct, q.id).toBe(false);
});
