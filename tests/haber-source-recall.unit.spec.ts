import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import original from "./fixtures/haber-source-recall-original.json";
import {
  haberJourney as j,
  haberForTier,
} from "../src/content/journeys/haber-and-fertilisers";
import { mark } from "../src/lib/marking";
import { exposureIds } from "../src/lib/progress";
const prefix = "haber-v1-source-recall-";
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

test("all106 published Haber definitions, positions and version remain exact", () => {
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
  expect(j.checkForms.map((f) => f.length)).toEqual([11, 11, 2]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([4, 4, 2]);
});

test("both-tier generated feed and product recall accepts accurate alternatives manually", () => {
  const added = all.filter((q) => q.id.startsWith(prefix));
  expect(added).toHaveLength(8);
  for (const tier of ["foundation", "higher"] as const) {
    const view = haberForTier(tier);
    for (const stage of ["guided", "practice"] as const)
      expect(view[stage].filter((q) => q.id.startsWith(prefix))).toHaveLength(
        2,
      );
    expect(view.checkForms.at(-1)!.map((q) => q.id)).toEqual(
      j.checkForms.at(-1)!.map((q) => q.id),
    );
  }
  for (const q of added) {
    expect(q.tier).toBeUndefined();
    expect(q.options).toBeUndefined();
    expect(q.model).toBeUndefined();
    expect(q.prompt).not.toMatch(
      /natural gas|methane|steam|calcium nitrate|superphosphate/i,
    );
    expect(mark(q, "   ")).toMatchObject({ empty: true, correct: false });
    for (const raw of [
      q.answer,
      "Nitrogen: natural gas. Hydrogen: air.",
      "Nitrogen: atmosphere. Hydrogen: steam.",
      "Nitric: calcium nitrate. Sulfuric: single superphosphate. Phosphoric: calcium dihydrogenphosphate.",
    ])
      expect(mark(q, raw)).toMatchObject({ correct: false, selfReview: true });
    const old = q.id.endsWith("sources")
      ? "haber-v1-p-sources"
      : "haber-v1-p-nitricRock";
    expect(exposureIds([q.id])).toContain(old);
    expect(exposureIds([old])).toContain(q.id);
    if (q.id.endsWith("sources")) {
      expect(exposureIds(["haber-v1-p-compromise"])).toContain(q.id);
      expect(exposureIds([q.id])).toContain("haber-v1-p-compromise");
    }
  }
  expect(j.practice.at(-2)!.followUp).toBe("haber-v1-r-feed2");
  expect(j.practice.at(-1)!.followUp).toBe("haber-v1-r-nitricRock");
});
