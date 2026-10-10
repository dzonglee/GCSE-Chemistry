import { test, expect } from "@playwright/test";
import { alkaneEquationWriting as added } from "../src/content/journeys/alkane-equation-writing";
import { alkanesJourney as journey } from "../src/content/journeys/alkanes";
import { tasks } from "../src/content/journeys/helpers";
import { exposureIds } from "../src/lib/progress";
import { mark, displayResponse } from "../src/lib/marking";

function atomTotals(side: string) {
  const totals: Record<string, number> = {};
  for (const term of side.split("+")) {
    const match = term.trim().match(/^(\d+)?([CHO\d]+)$/)!;
    const coefficient = Number(match[1] ?? 1);
    for (const atom of match[2].matchAll(/([CHO])(\d*)/g))
      totals[atom[1]] =
        (totals[atom[1]] ?? 0) + coefficient * Number(atom[2] || 1);
  }
  return totals;
}
test("each individual reference conserves all atoms with the supplied fuel unchanged", () => {
  const expected = {
    "g-ethane": { C: 4, H: 12, O: 14 },
    "p-propane": { C: 3, H: 8, O: 10 },
    "p-butane": { C: 8, H: 20, O: 26 },
    "ca-six": { C: 12, H: 28, O: 38 },
    "cb-seven": { C: 7, H: 16, O: 22 },
    "ra-five": { C: 5, H: 12, O: 16 },
    "rb-eight": { C: 16, H: 36, O: 50 },
  };
  const questions = tasks(journey).filter(
    (q) => q.id.startsWith("alk-write-v1-") && q.writtenEquations,
  );
  expect(questions).toHaveLength(7);
  for (const q of questions) {
    const equation = q.answer.replace(/[₀-₉]/g, (n) =>
      String("₀₁₂₃₄₅₆₇₈₉".indexOf(n)),
    );
    const [left, right] = equation.split("→");
    const inventory =
      expected[q.id.slice("alk-write-v1-".length) as keyof typeof expected];
    expect(atomTotals(left), q.id).toEqual(inventory);
    expect(atomTotals(right), q.id).toEqual(inventory);
  }
});
test("independent writing has no equation skeleton or model and never receives invented automatic marks", () => {
  for (const q of [...added.practice, ...added.check, ...added.review]) {
    expect(q.model).toBeUndefined();
    expect(q.options).toBeUndefined();
    expect(q.parts).toBeUndefined();
    expect(q.prompt).not.toContain("→");
    expect(q.writtenEquations).toBe(true);
    for (const raw of [q.answer, "C4H10 + O2 -> CO2", "2:13:8:10"]) {
      expect(mark(q, raw)).toMatchObject({ correct: false, selfReview: true });
      expect(displayResponse(q, raw)).toBe(raw);
    }
    expect(mark(q, "").empty).toBe(true);
  }
});
test("new forms preserve the two original forms, support recovery and track exposure across full equation tasks", () => {
  expect(journey.checkForms.slice(0, 2).map((form) => form.length)).toEqual([
    8, 8,
  ]);
  expect(journey.reviewForms.slice(0, 2).map((form) => form.length)).toEqual([
    3, 3,
  ]);
  expect(journey.checkForms[2]).toEqual(added.check);
  expect(journey.reviewForms[2]).toEqual(added.review);
  for (const q of added.practice)
    expect(journey.refresher.some((r) => r.id === q.followUp)).toBe(true);
  for (const q of [...added.check, ...added.review])
    expect(q.exposureAliases).toContain(added.guided[0].id);
  expect(added.guided[0].model).toMatchObject({
    kind: "alkanes",
    mode: "equation",
    record: "ethane",
  });
});

test("previously disclosed complete combustion balances cannot become fresh writing evidence", () => {
  for (const prior of [
    "alk-v1-a-balance",
    "alk-v1-b-balance",
    "alk-v1-g-equation",
  ]) {
    expect(exposureIds([prior])).toEqual(
      expect.arrayContaining(added.check.map((q) => q.id)),
    );
  }
  expect(exposureIds(["alk-v1-p-ethane-name"])).not.toContain(
    added.check[0].id,
  );
});
