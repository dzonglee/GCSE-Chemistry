import { test, expect } from "@playwright/test";
import {
  purityJourney as j,
  purityRecovery,
} from "../src/content/journeys/purity-journey";
import { mark } from "../src/lib/marking";
import { exposureIds } from "../src/lib/progress";
const additions = [
  ...j.practice,
  ...j.checkForms.flat(),
  ...j.reviewForms.flat(),
].filter((q) => q.id.startsWith("formulation-write-v1-"));
test("formulation explanations retain wrong and reference writing without automatic examiner marks", () => {
  expect(additions).toHaveLength(5);
  for (const q of additions) {
    expect(q.model).toBeUndefined();
    expect(q.options).toBeUndefined();
    expect(q.rubric!.length).toBe(3);
    expect(
      mark(q, "It is a pure compound because the amounts are known."),
    ).toMatchObject({ correct: false, selfReview: true });
    expect(mark(q, q.answer)).toMatchObject({
      correct: false,
      selfReview: true,
    });
  }
  expect(purityRecovery[additions[0].id]).toEqual(["purity-v1-r-formulation"]);
});
test("earlier disclosed formulation design prevents fresh reserved writing without exposing temperature comparisons", () => {
  for (const q of additions)
    expect(exposureIds(["purity-v1-p-accidental"])).toContain(q.id);
  expect(exposureIds(["formulation-write-v1-ca-cleaner"])).toContain(
    "purity-v1-r-formulation",
  );
  expect(exposureIds(["purity-v1-p-melt-match"])).not.toContain(
    "formulation-write-v1-ca-cleaner",
  );
  expect(j.checkForms.map((f) => f.length)).toEqual([8, 8, 2]);
  expect(j.reviewForms.map((f) => f.length)).toEqual([3, 3, 2]);
});
