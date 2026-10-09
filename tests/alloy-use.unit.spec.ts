import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import original from "./fixtures/materials-alloy-use-original.json";
import {
  materialsJourney as j,
  allMaterialsTasks,
  materialsRecoveryRoutes,
} from "../src/content/journeys/materials-and-corrosion";
import { lessons } from "../src/content/curriculum";
import { mark } from "../src/lib/marking";

test("all93 original material definitions and positions, v1 and legacy identities remain exact", () => {
  expect(j.version).toBe(original.version);
  for (const row of original.tasks) {
    const stage = row.stage as
      | "warmup"
      | "refresher"
      | "guided"
      | "practice"
      | "checkForms"
      | "reviewForms";
    const forms = stage.endsWith("Forms")
      ? (j[stage] as typeof j.checkForms)
      : [j[stage] as typeof j.practice];
    const q = forms[row.form][row.index];
    expect(q.id).toBe(row.id);
    expect(
      createHash("sha256").update(JSON.stringify(q)).digest("hex"),
      q.id,
    ).toBe(row.sha256);
  }
  const l = lessons.find((l) => l.slug === "materials-and-corrosion")!;
  expect(l.course).toBe("separate");
  expect(l.tier).toBe("foundation");
  expect([...l.questions, ...l.checks].map((q) => q.id)).toEqual(
    original.legacy,
  );
  expect(j.checkForms.map((f) => f.length)).toEqual([8, 8, 7]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([4, 4, 7]);
});

test("all seven named alloy uses require actual short recall with valid alternatives reviewed manually", () => {
  const suffixes = [
    "bronze",
    "brass",
    "gold",
    "high",
    "low",
    "stainless",
    "aluminium",
  ];
  const additions = allMaterialsTasks.filter((q) =>
    q.id.startsWith("materials-v1-alloy-use-"),
  );
  expect(additions).toHaveLength(30);
  for (const stage of ["p", "c", "v"]) {
    for (const suffix of suffixes) {
      const q = additions.find(
        (q) => q.id === `materials-v1-alloy-use-${stage}-${suffix}`,
      )!;
      expect(q).toBeDefined();
      expect(q.options).toBeUndefined();
      expect(q.shortWritten).toBe(true);
      expect(q.referenceResponse).toBe(q.answer);
      expect(q.answer).toMatch(/valid|suitable/);
      expect(mark(q, "a paper bag")).toMatchObject({
        correct: false,
        selfReview: true,
      });
      expect(mark(q, q.answer)).toMatchObject({
        correct: false,
        selfReview: true,
      });
      expect(mark(q, "   ")).toMatchObject({
        correct: false,
        empty: true,
      });
      expect(q.exposureAliases).toContain("materials-v1-p-brass");
      expect(q.exposureAliases).toContain("materials-v1-p-jewellery");
      if (stage === "p") {
        expect(q.followUp).toBe(materialsRecoveryRoutes[q.id]);
        const recovery = j.refresher.find((r) => r.id === q.followUp)!;
        expect(mark(recovery, recovery.answer).correct).toBe(true);
        for (const wrong of Object.keys(recovery.misconceptions!))
          expect(mark(recovery, wrong).correct).toBe(false);
      }
    }
  }
  expect(j.practiceGroups!.flatMap((g) => g.taskIds)).toEqual(
    j.practice.map((q) => q.id),
  );
  const steel = additions.find((q) => q.id.endsWith("g-steels"))!;
  expect(steel.answer).toContain("brittle");
  expect(steel.answer).toContain("easily shaped");
  expect(steel.answer).toContain("resists corrosion");
});
