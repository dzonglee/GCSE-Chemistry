import { test, expect } from "@playwright/test";
import { smallMoleculesPropertiesJourney as journey } from "../src/content/journeys/small-molecules-properties";
import { molecularWritingAdditions as added } from "../src/content/journeys/molecular-writing";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import {
  exposureIds,
  decode,
  emptyProgress,
  emptyWork,
} from "../src/lib/progress";
test("molecular corrections preserve original identities, forms and saved positions while reserving full causal writing", () => {
  expect(journey.version).toBe(1);
  expect(tasks(journey)).toHaveLength(42);
  expect(journey.practice[12].id).toBe("mp-v1-p-explain");
  expect(journey.checkForms.map((f) => f.length)).toEqual([4, 4, 3]);
  expect(journey.reviewForms.map((f) => f.length)).toEqual([2, 2, 3]);
  expect(journey.checkForms[0][0].id).toBe("mp-v1-ca-force");
  expect(journey.reviewForms[1][0].id).toBe("mp-v1-rb-energy");
  expect(new Set(journey.practiceGroups!.flatMap((g) => g.taskIds))).toEqual(
    new Set(journey.practice.map((q) => q.id)),
  );
  const p = emptyProgress();
  p.work["small-molecules-properties"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "practice", index: 12 },
    drafts: { [added.check[0].id]: "Covalent bonds break. 1..2" },
  };
  expect(decode(JSON.stringify(p))).toEqual(p);
});
test("full molecular explanations are manual, preserve force distinctions and qualify the supplied comparisons", () => {
  for (const q of [...added.practice, ...added.check, ...added.review]) {
    expect(q.rubric!.length).toBeGreaterThanOrEqual(3);
    expect(mark(q, q.answer).correct).toBe(false);
    expect(mark(q, "Neutral motion must conduct. 1..2").correct).toBe(false);
  }
  expect(added.check[0].answer).toContain("does not break");
  expect(added.check[2].answer).toContain("+15 °C exceeds −25 °C");
  expect(added.review[1].answer).toContain("mobile charged ions");
});
test("helped equivalent property reasoning remains exposed with direct symmetric links", () => {
  expect(exposureIds(["mp-v1-p-explain"])).toContain(added.check[0].id);
  expect(exposureIds(["mp-v1-r-neutral"])).toContain(added.review[1].id);
  expect(exposureIds(["mp-v1-p-explain"])).toContain(added.check[1].id);
  expect(exposureIds([added.practice[0].id])).toContain(added.check[2].id);
  for (const q of tasks(journey))
    for (const alias of q.exposureAliases ?? [])
      expect(
        tasks(journey).find((t) => t.id === alias)?.exposureAliases,
      ).toContain(q.id);
});
