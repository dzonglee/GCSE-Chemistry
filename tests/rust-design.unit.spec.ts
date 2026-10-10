import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import original from "./fixtures/materials-rust-design-original.json";
import {
  materialsJourney as j,
  materialsRecoveryRoutes,
} from "../src/content/journeys/materials-and-corrosion";
import { exposureIds } from "../src/lib/progress";
import { mark } from "../src/lib/marking";
const prefix = "materials-v1-rust-design-";
const all = [
  ...j.warmup,
  ...j.refresher,
  ...j.guided,
  ...j.practice,
  ...j.checkForms.flat(),
  ...j.reviewForms.flat(),
];

test("all123 previously published Materials definitions/order and original assessment forms stay exact", () => {
  expect(j.version).toBe(1);
  for (const stage of [
    "warmup",
    "refresher",
    "guided",
    "practice",
    "checkForms",
    "reviewForms",
  ] as const) {
    const records = stage.endsWith("Forms")
      ? (j[stage] as typeof j.checkForms).flat()
      : (j[stage] as typeof j.practice);
    const previous = records.filter(
      (q) =>
        !q.id.startsWith(prefix) &&
        !q.id.startsWith("materials-v1-composite-recall-"),
    );
    const fixture = original.filter((q) => q.stage === stage);
    expect(previous.map((q) => q.id)).toEqual(fixture.map((q) => q.id));
    previous.forEach((q, index) =>
      expect(
        createHash("sha256").update(JSON.stringify(q)).digest("hex"),
        q.id,
      ).toBe(fixture[index].sha256),
    );
  }
  expect(j.checkForms.map((f) => f.length)).toEqual([8, 8, 7, 2, 1]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([4, 4, 7, 2, 1]);
});

test("planning responses preserve wrong/alternative words for manual review and expose old rust work conservatively both ways", () => {
  const additions = all.filter((q) => q.id.startsWith(prefix));
  expect(additions).toHaveLength(10);
  const writing = additions.filter((q) => q.rubric);
  expect(writing).toHaveLength(7);
  for (const q of writing) {
    expect(q.options).toBeUndefined();
    expect(q.model).toBeUndefined();
    expect(mark(q, "")).toMatchObject({ empty: true, correct: false });
    for (const raw of [
      q.answer,
      "Just oil over ordinary water.\nDifferent nails.",
      "Use suitable validated oxygen-free water and maintain exclusion.",
    ]) {
      expect(mark(q, raw)).toMatchObject({ correct: false, selfReview: true });
    }
  }
  const old = all.find((q) => q.id === "materials-v1-p-rust")!;
  for (const q of additions) {
    expect(exposureIds([q.id])).toContain(old.id);
    expect(exposureIds([old.id])).toContain(q.id);
  }
  for (const q of j.practice.filter((q) => q.id.startsWith(prefix))) {
    expect(q.followUp).toBe(materialsRecoveryRoutes[q.id]);
    expect(j.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  expect(j.checkForms.at(-1)!.every((q) => q.rubric && !q.model)).toBe(true);
  expect(j.reviewForms.at(-1)!.every((q) => q.rubric && !q.model)).toBe(true);
});
