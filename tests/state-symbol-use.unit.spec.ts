import { test, expect } from "@playwright/test";
import before from "./fixtures/states-v1-before-state-symbol-use.json";
import { statesJourney } from "../src/content/journeys/states-of-matter";
import { stateSymbolUseAdditions as added } from "../src/content/journeys/state-symbol-use";
import { statesForTier } from "../src/content/journeys/states-writing";
import { tasks } from "../src/content/journeys/helpers";
import { lessons } from "../src/content/curriculum";
import { mark } from "../src/lib/marking";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
  dueReview,
  REVIEW_DELAY,
} from "../src/lib/progress";

test("all57 original state records and form sequences retain exact metadata; only five appended tasks", () => {
  const current = lessons.find((l) => l.slug === "states-of-matter")!.journey!;
  expect(current.version).toBe(before.version);
  for (const stage of [
    "warmup",
    "refresher",
    "guided",
    "practice",
    "checkForms",
    "reviewForms",
    "practiceGroups",
  ] as const)
    expect(current[stage]?.slice(0, before[stage].length), stage).toEqual(
      before[stage],
    );
  expect(tasks(current)).toHaveLength(62);
  expect(new Set(tasks(current).map((q) => q.id)).size).toBe(62);
  expect(current.checkForms.at(-1)).toEqual([added.check]);
  expect(current.reviewForms.at(-1)).toEqual([added.review]);
});
test("state-symbol use is available in both tier pathways and complete equations remain manually reviewed", () => {
  for (const tier of ["foundation", "higher"] as const) {
    const j = statesForTier(statesJourney, tier);
    expect(j.checkForms.at(-1)).toEqual([added.check]);
    expect(j.reviewForms.at(-1)).toEqual([added.review]);
  }
  for (const q of [added.guided, added.practice, added.check, added.review]) {
    expect(q.tier).toBeUndefined();
    expect(q.stateSymbolUse).toBe(true);
    expect(mark(q, q.answer)).toMatchObject({
      correct: false,
      selfReview: true,
      empty: false,
    });
    expect(mark(q, "Zn(aq) + H2SO4(l) -> ZnSO4(s) + H2(l)")).toMatchObject({
      correct: false,
      selfReview: true,
    });
    expect(mark(q, "").empty).toBe(true);
  }
  expect(mark(added.recovery, "H2O(g)").correct).toBe(true);
  for (const raw of ["H2O(l)", "H2O(aq)", "H2O(s)"])
    expect(mark(added.recovery, raw).correct).toBe(false);
});
test("different supplied reactions remain transfer while repeated identical tasks retain exposure", () => {
  for (const q of Object.values(added)) {
    expect(exposureIds([q.id])).toContain(q.id);
    for (const other of [
      added.guided,
      added.practice,
      added.check,
      added.review,
    ])
      if (q.id !== other.id)
        expect(exposureIds([q.id])).not.toContain(other.id);
  }
  expect(added.review.prompt).toContain("vapour");
  expect(added.review.answer).toContain("H2O(g)");
});
test("old saved assessment identity and wrong multiline answer survive; latest submission still gates seven days", () => {
  const p = emptyProgress(),
    w = emptyWork(),
    started = 1000000,
    submitted = started + 1000;
  const oldIds = before.checkForms[0].map((q) => q.id);
  w.run = {
    kind: "check",
    ids: oldIds,
    index: oldIds.length - 1,
    started,
    submitted,
    responses: Object.fromEntries(
      before.checkForms[0].map((q, i) => [
        q.id,
        {
          answer: q.answer,
          correct: mark(statesJourney.checkForms[0][i], q.answer).correct,
          helped: false,
          fresh: true,
          at: started + 1,
        },
      ]),
    ),
  };
  w.history = [{ ...w.run }];
  w.drafts[added.practice.id] =
    "Na2CO3(aq) + 2HNO3(l)\n-> 2NaNO3(s) + CO2(l) + H2O(g)";
  p.work["states-of-matter"] = w;
  expect(decode(JSON.stringify(p))).toEqual(p);
  expect(dueReview(w, submitted + REVIEW_DELAY - 1)).toBe(false);
  expect(dueReview(w, submitted + REVIEW_DELAY)).toBe(true);
});
