import { questionById } from "../src/content/curriculum";
import { test, expect } from "@playwright/test";
import { diamondStructuresJourney as journey } from "../src/content/journeys/diamond-structures";
import { diamondWritingAdditions as added } from "../src/content/journeys/diamond-writing";
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
  expect(tasks(journey)).toHaveLength(46);
  expect(journey.practice[10].id).toBe("dn-v1-p-explain");
  expect(journey.checkForms.map((f) => f.length)).toEqual([5, 5, 3]);
  expect(journey.reviewForms.map((f) => f.length)).toEqual([3, 3, 3]);
  expect(journey.checkForms[0][0].id).toBe("dn-v1-ca-neighbours");
  expect(journey.reviewForms[1][0].id).toBe("dn-v1-rb-extent");
  expect(new Set(journey.practiceGroups!.flatMap((g) => g.taskIds))).toEqual(
    new Set(journey.practice.map((q) => q.id)),
  );
  const p = emptyProgress();
  p.work["carbon-structures"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "practice", index: 10 },
    drafts: { [added.check[0].id]: "Diamond has no electrons. 1..2" },
  };
  expect(decode(JSON.stringify(p))).toEqual(p);
});
test("full diamond explanations are manual, preserve force distinctions and qualify the supplied comparisons", () => {
  for (const q of [...added.practice, ...added.check, ...added.review]) {
    expect(q.rubric!.length).toBeGreaterThanOrEqual(3);
    expect(mark(q, q.answer).correct).toBe(false);
    expect(mark(q, "Neutral motion must conduct. 1..2").correct).toBe(false);
  }
  expect(added.check[0].answer).toContain("Many strong covalent bonds");
  expect(added.check[1].answer).toContain("mobile ions");
  expect(added.review[2].answer).toContain("remain intact");
});
test("helped network mechanisms have direct symmetric exposure links", () => {
  expect(exposureIds(["dn-v1-p-explain"])).toContain(added.check[0].id);
  expect(exposureIds(["dn-v1-p-compare"])).toContain(added.review[2].id);
  expect(exposureIds([added.practice[0].id])).toContain(added.check[2].id);
  for (const q of tasks(journey))
    for (const alias of q.exposureAliases ?? [])
      expect(questionById(alias)?.exposureAliases).toContain(q.id);
});
