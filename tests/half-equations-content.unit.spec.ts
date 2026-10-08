import { test, expect } from "@playwright/test";
import { halfEquationsJourney as j } from "../src/content/journeys/half-equations";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
test("49 individually authored tasks retain reserved forms, exposure aliases and six self-reviewed written answers", () => {
  const all = tasks(j);
  expect(all).toHaveLength(49);
  expect(new Set(all.map((q) => q.id)).size).toBe(49);
  expect(j.guided).toHaveLength(5);
  expect(j.practice).toHaveLength(20);
  expect(j.refresher).toHaveLength(6);
  expect(all.filter((q) => q.electronEquation)).toHaveLength(24);
  const written = all.filter((q) => q.rubric);
  expect(written).toHaveLength(6);
  for (const q of written)
    expect(mark(q, q.answer)).toMatchObject({
      correct: false,
      selfReview: true,
      empty: false,
    });
  for (const q of all.filter((q) => !q.rubric))
    expect(mark(q, q.answer).correct, q.id).toBe(true);
  for (const q of j.practice)
    expect(
      j.refresher.some((r) => r.id === q.followUp),
      q.id,
    ).toBe(true);
  const practiceKeys = j.practice
    .filter((q) => q.electronEquation)
    .map((q) => q.electronEquation!.reaction);
  for (const q of j.checkForms.flat()) {
    expect(q.model).toBeUndefined();
    if (q.electronEquation)
      expect(practiceKeys).not.toContain(q.electronEquation.reaction);
  }
  for (const form of j.checkForms) expect(form).toHaveLength(5);
  for (const form of j.reviewForms) expect(form).toHaveLength(3);
  const oh = all.filter((q) => q.electronEquation?.reaction === "hydroxide");
  for (const q of oh)
    expect(q.exposureAliases).toEqual(
      oh.filter((o) => o !== q).map((o) => o.id),
    );
});
test("seven numeric answers are independently recomputed from charges and constituent counts", () => {
  const values: Record<string, number> = {
    "w-charge": 2 + 2 * -1,
    "w-atoms": 2,
    "r-count": (2 - 0) / 1,
    "r-diatomic": 2 / 1,
    "g-electrons": 2 / 1,
    "p-count": 3 * 2,
    "b-hydroxide-count": 8 / 1,
  };
  const qs = tasks(j).filter(
    (q) => !q.options && !q.rubric && !q.electronEquation,
  );
  expect(qs).toHaveLength(7);
  for (const q of qs)
    expect(Number(q.answer), q.id).toBe(values[q.id.replace("he-v1-", "")]);
});
