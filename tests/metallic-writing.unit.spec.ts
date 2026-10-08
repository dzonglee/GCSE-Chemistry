import { questionById } from "../src/content/curriculum";
import { test, expect } from "@playwright/test";
import { metallicBondingJourney as journey } from "../src/content/journeys/metallic-bonding";
import { metallicWritingAdditions as added } from "../src/content/journeys/metallic-writing";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import {
  exposureIds,
  decode,
  emptyProgress,
  emptyWork,
} from "../src/lib/progress";
test("metallic corrections preserve original identities, forms and saved positions while reserving full causal writing", () => {
  expect(journey.version).toBe(1);
  expect(tasks(journey)).toHaveLength(51);
  expect(journey.practice[13].id).toBe("mb-v1-p-explain");
  expect(journey.checkForms.map((f) => f.length)).toEqual([5, 5, 3]);
  expect(journey.reviewForms.map((f) => f.length)).toEqual([3, 3, 3]);
  expect(journey.checkForms[0][0].id).toBe("mb-v1-ca-carrier");
  expect(journey.reviewForms[1][0].id).toBe("mb-v1-rb-bond");
  expect(new Set(journey.practiceGroups!.flatMap((g) => g.taskIds))).toEqual(
    new Set(journey.practice.map((q) => q.id)),
  );
  const p = emptyProgress();
  p.work["structure-and-properties"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "practice", index: 12 },
    drafts: { [added.check[0].id]: "Covalent bonds break. 1..2" },
  };
  expect(decode(JSON.stringify(p))).toEqual(p);
});
test("full metallic explanations are manual, preserve force distinctions and qualify the supplied comparisons", () => {
  for (const q of [...added.practice, ...added.check, ...added.review]) {
    expect(q.rubric!.length).toBeGreaterThanOrEqual(3);
    expect(mark(q, q.answer).correct).toBe(false);
    expect(mark(q, "Neutral motion must conduct. 1..2").correct).toBe(false);
  }
  expect(added.check[0].answer).toContain("electrostatic attraction");
  expect(added.check[1].answer).toContain("electrical charge");
  expect(added.review[2].answer).toContain("restrict the movement");
});
test("helped metallic mechanisms have direct symmetric exposure links", () => {
  expect(exposureIds(["mb-v1-p-explain"])).toContain(added.check[1].id);
  expect(exposureIds(["mb-v1-p-alloy-explain"])).toContain(added.review[2].id);
  expect(exposureIds([added.practice[0].id])).toContain(added.check[0].id);
  for (const q of tasks(journey))
    for (const alias of q.exposureAliases ?? [])
      expect(questionById(alias)?.exposureAliases).toContain(q.id);
});
