import { questionById } from "../src/content/curriculum";
import { test, expect } from "@playwright/test";
import { fullereneJourney as journey } from "../src/content/journeys/fullerenes";
import { fullereneWritingAdditions as added } from "../src/content/journeys/fullerene-writing";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import {
  exposureIds,
  decode,
  emptyProgress,
  emptyWork,
} from "../src/lib/progress";
test("diamond corrections preserve original identities, forms and saved positions while reserving full causal writing", () => {
  expect(journey.version).toBe(1);
  expect(tasks(journey)).toHaveLength(44);
  expect(journey.practice[11].id).toBe("fu-v1-p-explain");
  expect(journey.checkForms.map((f) => f.length)).toEqual([5, 5, 2]);
  expect(journey.reviewForms.map((f) => f.length)).toEqual([3, 3, 2]);
  expect(journey.checkForms[0][0].id).toBe("fu-v1-ca-count");
  expect(journey.reviewForms[1][0].id).toBe("fu-v1-rb-type");
  expect(new Set(journey.practiceGroups!.flatMap((g) => g.taskIds))).toEqual(
    new Set(journey.practice.map((q) => q.id)),
  );
  const p = emptyProgress();
  p.work["fullerenes"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "practice", index: 11 },
    drafts: { [added.check[0].id]: "Graphite has no electrons. 1..2" },
  };
  expect(decode(JSON.stringify(p))).toEqual(p);
});
test("fullerene description and brief recall retain distinct response demands", () => {
  for (const q of [...added.practice, ...added.check, ...added.review])
    expect(mark(q, q.answer).correct).toBe(false);
  expect(added.check[0].rubric).toHaveLength(3);
  expect(added.check[1].rubric).toHaveLength(1);
  expect(added.review[0].rubric).toHaveLength(1);
  expect(added.check[1].answer).toContain("hollow cage");
  expect(added.review[1].answer).toContain("drawing inventory");
});
test("helped fullerene recall and description retain reciprocal exposure", () => {
  expect(exposureIds(["fu-v1-p-explain"])).toContain(added.check[0].id);
  expect(exposureIds(["fu-v1-p-compare"])).toContain(added.review[1].id);
  expect(exposureIds([added.practice[0].id])).toContain(added.check[1].id);
  for (const q of tasks(journey))
    for (const id of q.exposureAliases ?? [])
      expect(questionById(id)?.exposureAliases).toContain(q.id);
});
