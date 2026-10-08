import { questionById } from "../src/content/curriculum";
import { test, expect } from "@playwright/test";
import { graphiteJourney as journey } from "../src/content/journeys/graphite";
import { graphiteWritingAdditions as added } from "../src/content/journeys/graphite-writing";
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
  expect(journey.practice[10].id).toBe("gr-v1-p-explain");
  expect(journey.checkForms.map((f) => f.length)).toEqual([5, 5, 3]);
  expect(journey.reviewForms.map((f) => f.length)).toEqual([3, 3, 3]);
  expect(journey.checkForms[0][0].id).toBe("gr-v1-ca-neighbours");
  expect(journey.reviewForms[1][0].id).toBe("gr-v1-rb-melting");
  expect(new Set(journey.practiceGroups!.flatMap((g) => g.taskIds))).toEqual(
    new Set(journey.practice.map((q) => q.id)),
  );
  const p = emptyProgress();
  p.work["graphite"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "practice", index: 10 },
    drafts: { [added.check[0].id]: "Graphite has no electrons. 1..2" },
  };
  expect(decode(JSON.stringify(p))).toEqual(p);
});
test("graphite writing separates carrier motion, sliding and strong-bond energy", () => {
  for (const q of [...added.practice, ...added.check, ...added.review]) {
    expect(q.rubric!.length).toBeGreaterThanOrEqual(3);
    expect(mark(q, q.answer).correct).toBe(false);
    expect(mark(q, "Nuclei carry charge. 1..2").correct).toBe(false);
  }
  expect(added.check[0].answer).toContain("One electron per carbon");
  expect(added.check[1].answer).toContain("remain strong and intact");
  expect(added.check[2].answer).toContain("Much energy");
  expect(added.practice[0].answer).toContain("consumed");
});
test("helped graphite mechanisms have direct symmetric exposure links", () => {
  expect(exposureIds(["gr-v1-p-explain"])).toContain(added.check[0].id);
  expect(exposureIds(["gr-v1-p-compare"])).toContain(added.review[0].id);
  expect(exposureIds([added.practice[0].id])).toContain(added.check[0].id);
  for (const q of tasks(journey))
    for (const alias of q.exposureAliases ?? [])
      expect(questionById(alias)?.exposureAliases).toContain(q.id);
});
