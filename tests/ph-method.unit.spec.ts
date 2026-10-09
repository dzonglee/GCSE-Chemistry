import { test, expect } from "@playwright/test";
import baseline from "./fixtures/ph-method-baseline.json";
import { lessons } from "../src/content/curriculum";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
const j = lessons.find((l) => l.slug === "ph-scale-and-indicators")!.journey!;
const all = tasks(j);
test("all49 original pH records, positions, supplied data and forms survive", () => {
  expect(j.version).toBe(1);
  for (const [stage, ids] of Object.entries(baseline.stageIds))
    expect(
      j[stage as "practice"].slice(0, ids.length).map((q) => q.id),
    ).toEqual(ids);
  expect(j.checkForms.slice(0, 2).map((f) => f.map((q) => q.id))).toEqual(
    baseline.checkForms,
  );
  expect(j.reviewForms.slice(0, 2).map((f) => f.map((q) => q.id))).toEqual(
    baseline.reviewForms,
  );
  for (const old of baseline.tasks) {
    const now = JSON.parse(JSON.stringify(all.find((q) => q.id === old.id)!));
    const { exposureAliases: oldAliases, ...before } = old;
    const { exposureAliases: nowAliases, ...after } = now;
    expect(after, old.id).toEqual(before);
    for (const id of oldAliases ?? []) expect(nowAliases).toContain(id);
  }
});
test("new method responses are complete manual constructions, with sealed references supplied for later comparison", () => {
  const additions = all.filter((q) => q.id.startsWith("ph-v1-method-"));
  expect(additions).toHaveLength(12);
  for (const q of additions) {
    expect(q.options).toBeUndefined();
    expect(q.model).toBeUndefined();
    expect(q.referenceResponse).toBe(q.answer);
    expect(q.rubric).toHaveLength(3);
    expect(mark(q, q.answer)).toMatchObject({
      correct: false,
      selfReview: true,
    });
    expect(q.exposureAliases).toContain(
      `ph-v1-method-${q.writtenEquations ? "p-equation" : "p-indicator"}` ===
        q.id
        ? `ph-v1-method-${q.writtenEquations ? "r-equation" : "r-indicator"}`
        : `ph-v1-method-${q.writtenEquations ? "p-equation" : "p-indicator"}`,
    );
  }
  expect(j.checkForms.slice(2).map((f) => f.length)).toEqual([2, 2]);
  expect(j.reviewForms.slice(2).map((f) => f.length)).toEqual([2, 2]);
});
