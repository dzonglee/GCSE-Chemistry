import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import original from "./fixtures/materials-composite-recall-original.json";
import {
  materialsJourney as j,
  materialsRecoveryRoutes,
} from "../src/content/journeys/materials-and-corrosion";
import { mark } from "../src/lib/marking";
import { exposureIds } from "../src/lib/progress";
const prefix = "materials-v1-composite-recall-";
const stages = [
  "warmup",
  "refresher",
  "guided",
  "practice",
  "checkForms",
  "reviewForms",
] as const;
const all = stages.flatMap((stage) =>
  stage.endsWith("Forms")
    ? (j[stage] as typeof j.checkForms).flat()
    : (j[stage] as typeof j.practice),
);

test("all133 published Materials definitions, positions and version remain exact", () => {
  expect(j.version).toBe(1);
  for (const stage of stages) {
    const records = stage.endsWith("Forms")
      ? (j[stage] as typeof j.checkForms).flat()
      : (j[stage] as typeof j.practice);
    const previous = records.filter((q) => !q.id.startsWith(prefix));
    const baseline = original.filter((r) => r.stage === stage);
    expect(previous.map((q) => q.id)).toEqual(baseline.map((r) => r.id));
    previous.forEach((q, i) =>
      expect(
        createHash("sha256").update(JSON.stringify(q)).digest("hex"),
        q.id,
      ).toBe(baseline[i].sha256),
    );
  }
  expect(j.checkForms.map((f) => f.length)).toEqual([8, 8, 7, 2, 1]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([4, 4, 7, 2, 1]);
});

test("generated examples have no supplied names or automatic keyword marks and preserve prior composite exposure", () => {
  const added = all.filter((q) => q.id.startsWith(prefix));
  expect(added).toHaveLength(5);
  const written = added.filter((q) => q.rubric);
  expect(written).toHaveLength(4);
  for (const q of written) {
    expect(q.prompt).not.toMatch(/concrete|glass.fibre|carbon.fibre|brass/i);
    expect(q.options).toBeUndefined();
    expect(q.model).toBeUndefined();
    expect(q.explanation).toContain("Other scientifically valid examples");
    expect(mark(q, "   ")).toMatchObject({ empty: true, correct: false });
    for (const raw of [
      q.answer,
      "Brass.\nPure aluminium.",
      "Carbon-fibre reinforced polymer has resin matrix and carbon-fibre reinforcement.",
    ])
      expect(mark(q, raw)).toMatchObject({ correct: false, selfReview: true });
  }
  for (const q of added) {
    expect(exposureIds([q.id])).toContain("materials-v1-p-composite");
    expect(exposureIds(["materials-v1-p-composite"])).toContain(q.id);
  }
  const practice = j.practice.find((q) => q.id === `${prefix}p-examples`)!;
  expect(practice.followUp).toBe(`${prefix}r-example`);
  expect(materialsRecoveryRoutes[practice.id]).toBe(practice.followUp);
});
