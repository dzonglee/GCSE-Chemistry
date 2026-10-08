import { questionById } from "../src/content/curriculum";
import { test, expect } from "@playwright/test";
import { polymerStructureJourney as journey } from "../src/content/journeys/polymer-structures";
import { polymerWritingAdditions as added } from "../src/content/journeys/polymer-writing";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import {
  exposureIds,
  decode,
  emptyProgress,
  emptyWork,
} from "../src/lib/progress";
test("polymer corrections preserve original identities, forms and saved positions while reserving full causal writing", () => {
  expect(journey.version).toBe(1);
  expect(tasks(journey)).toHaveLength(50);
  expect(journey.practice[14].id).toBe("ps-v1-p-explain");
  expect(journey.checkForms.map((f) => f.length)).toEqual([5, 5, 3]);
  expect(journey.reviewForms.map((f) => f.length)).toEqual([3, 3, 3]);
  expect(journey.checkForms[0][0].id).toBe("ps-v1-ca-type");
  expect(journey.reviewForms[1][0].id).toBe("ps-v1-rb-carbon");
  expect(new Set(journey.practiceGroups!.flatMap((g) => g.taskIds))).toEqual(
    new Set(journey.practice.map((q) => q.id)),
  );
  const p = emptyProgress();
  p.work["polymer-structures"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "practice", index: 14 },
    drafts: { [added.check[0].id]: "Polymer covalent bonds all break. 1..2" },
  };
  expect(decode(JSON.stringify(p))).toEqual(p);
});
test("polymer writing retains physical-change and representation distinctions", () => {
  for (const q of [...added.practice, ...added.check, ...added.review])
    expect(mark(q, q.answer).correct).toBe(false);
  expect(added.check[0].rubric).toHaveLength(4);
  expect(added.check[1].rubric).toHaveLength(2);
  expect(added.check[2].polymerRepeatDiagram).toBe(true);
  expect(added.review[0].polymerChainDiagram).toBe(4);
  expect(added.review[2].answer).toContain("do not directly measure");
});
test("helped polymer physical and representation equivalents retain reciprocal exposure", () => {
  expect(exposureIds(["ps-v1-p-explain"])).toContain(added.check[0].id);
  expect(exposureIds(["ps-v1-p-physical"])).toContain(added.check[1].id);
  expect(exposureIds(["ps-v1-p-draw"])).toContain(added.check[2].id);
  for (const q of tasks(journey))
    for (const id of q.exposureAliases ?? [])
      expect(questionById(id)?.exposureAliases).toContain(q.id);
});
