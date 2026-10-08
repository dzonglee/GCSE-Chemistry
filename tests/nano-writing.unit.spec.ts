import { test, expect } from "@playwright/test";
import { nanoparticlesJourney as journey } from "../src/content/journeys/nanoparticles";
import { nanoWritingAdditions as added } from "../src/content/journeys/nano-writing";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
import { questionById } from "../src/content/curriculum";
import {
  decode,
  emptyProgress,
  emptyWork,
  exposureIds,
} from "../src/lib/progress";
test("nanoparticle additions preserve original forms, task positions and raw drafts", () => {
  expect(journey.version).toBe(1);
  expect(tasks(journey)).toHaveLength(63);
  expect(journey.practice[19].id).toBe("np-v1-p-explain");
  expect(journey.practice[20].id).toBe("np-v1-p-evaluate");
  expect(journey.checkForms.map((f) => f.length)).toEqual([5, 5, 4]);
  expect(journey.reviewForms.map((f) => f.length)).toEqual([3, 3, 3]);
  expect(new Set(journey.practiceGroups!.flatMap((g) => g.taskIds))).toEqual(
    new Set(journey.practice.map((q) => q.id)),
  );
  const p = emptyProgress();
  p.work["particles-and-nanoparticles"] = {
    ...emptyWork(),
    learning: { version: 1, stage: "practice", index: 20 },
    drafts: {
      [added.practice[0].id]: JSON.stringify({
        rectangle: "1..2",
        triangle: "252",
      }),
      [added.check[2].id]: "No data proves all are harmless.",
    },
  };
  expect(decode(JSON.stringify(p))).toEqual(p);
});
test("independent footprint areas use squared units and reject incomplete or malformed constructions", () => {
  for (const q of [added.practice[0], added.check[0], added.review[0]]) {
    expect(mark(q, q.answer).correct).toBe(true);
    expect(
      mark(
        q,
        JSON.stringify({
          rectangle: "1..2",
          triangle: String(q.parts![1].answer),
        }),
      ).correct,
    ).toBe(false);
    expect(
      mark(q, JSON.stringify({ rectangle: String(q.parts![0].answer) }))
        .correct,
    ).toBe(false);
    expect(q.parts!.every((p) => p.unit === "nm²")).toBe(true);
    expect(q.parts![0].answer).toBe(2 * q.parts![1].answer);
  }
  expect(added.guided.nanoFootprintDiagram).toEqual({
    base: 32,
    height: 24,
    interactive: true,
  });
});
test("ethical judgements and perceived-risk writing never receive an automatic examiner mark; equivalent help remains exposed", () => {
  for (const q of [...added.practice, ...added.check, ...added.review].filter(
    (q) => q.rubric,
  ))
    expect(mark(q, q.answer).correct).toBe(false);
  expect(added.check[2].answer).toContain("Fairness");
  expect(added.check[3].answer).toContain("perceived risk");
  expect(added.check[3].answer).toContain("cannot establish");
  expect(exposureIds([added.practice[0].id])).toContain(added.check[0].id);
  expect(exposureIds([added.practice[2].id])).toContain(added.check[3].id);
  expect(exposureIds(["np-v1-p-risk"])).toContain(added.check[1].id);
  expect(exposureIds(["particles-and-nanoparticles-4"])).toContain(
    added.review[1].id,
  );
  for (const q of tasks(journey))
    for (const id of q.exposureAliases ?? [])
      expect(questionById(id)?.exposureAliases).toContain(q.id);
});
