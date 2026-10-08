import { questionById } from "../src/content/curriculum";
import { test, expect } from "@playwright/test";
import { nanotubeJourney as journey } from "../src/content/journeys/nanotubes";
import { nanotubeWritingAdditions as added } from "../src/content/journeys/nanotube-writing";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import {
  exposureIds,
  decode,
  emptyProgress,
  emptyWork,
} from "../src/lib/progress";
test("nanotube corrections preserve original identities, forms and saved positions while reserving full causal writing", () => {
  expect(journey.version).toBe(1);
  expect(tasks(journey)).toHaveLength(49);
  expect(journey.practice[13].id).toBe("nt-v1-p-explain");
  expect(journey.checkForms.map((f) => f.length)).toEqual([5, 5, 3]);
  expect(journey.reviewForms.map((f) => f.length)).toEqual([3, 3, 3]);
  expect(journey.checkForms[0][0].id).toBe("nt-v1-ca-shape");
  expect(journey.reviewForms[1][0].id).toBe("nt-v1-rb-strength");
  expect(new Set(journey.practiceGroups!.flatMap((g) => g.taskIds))).toEqual(
    new Set(journey.practice.map((q) => q.id)),
  );
  const p = emptyProgress();
  p.work["carbon-nanotubes"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "practice", index: 13 },
    drafts: { [added.check[0].id]: "Nanotube nuclei flow. 1..2" },
  };
  expect(decode(JSON.stringify(p))).toEqual(p);
});
test("nanotube writing separates carriers, reinforcement and supplied design evidence", () => {
  for (const q of [...added.practice, ...added.check, ...added.review])
    expect(mark(q, q.answer).correct).toBe(false);
  expect(added.check[0].rubric).toHaveLength(2);
  expect(added.check[2].nanotubeMaterialData).toEqual(
    expect.objectContaining({
      maxDensity: 1.7,
      minStrength: 35,
      minStiffness: 30,
    }),
  );
  expect(added.review[2].nanotubeMaterialData).toEqual(
    expect.objectContaining({ maxDensity: 1.6 }),
  );
  expect(added.review[1].answer).toContain("dimensionless");
});
test("helped nanotube equivalents retain reciprocal exposure", () => {
  expect(exposureIds(["nt-v1-p-explain"])).toContain(added.check[0].id);
  expect(exposureIds(["nt-v1-p-evaluate"])).toContain(added.check[2].id);
  expect(exposureIds(["nt-v1-p-scale"])).toContain(added.review[1].id);
  for (const q of tasks(journey))
    for (const id of q.exposureAliases ?? [])
      expect(questionById(id)?.exposureAliases).toContain(q.id);
});
