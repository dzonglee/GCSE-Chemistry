import { test, expect } from "@playwright/test";
import { acidStrengthJourney as j } from "../src/content/journeys/acid-strength";
import { tasks } from "../src/content/journeys/helpers";
import { mark } from "../src/lib/marking";
test("49 individual tasks preserve changed reserved forms honest written work and meaningful recovery", () => {
  const all = tasks(j);
  expect(all).toHaveLength(49);
  expect(new Set(all.map((q) => q.id)).size).toBe(49);
  expect(j.practice).toHaveLength(20);
  expect(j.guided).toHaveLength(5);
  expect(j.refresher).toHaveLength(6);
  expect(all.filter((q) => q.rubric)).toHaveLength(6);
  expect(j.guided[0].openingHint).toBe(true);
  expect(j.guided.slice(1).some((q) => q.openingHint)).toBe(false);
  for (const q of all) {
    expect(mark(q, q.answer).correct, q.id).toBe(!q.rubric);
    if (q.rubric) expect(mark(q, q.answer).selfReview).toBe(true);
  }
  for (const q of j.practice)
    expect(
      j.refresher.some((r) => r.id === q.followUp),
      q.id,
    ).toBe(true);
  for (const f of j.checkForms) {
    expect(f).toHaveLength(5);
    for (const q of f) expect(q.model).toBeUndefined();
  }
  for (const f of j.reviewForms) expect(f).toHaveLength(3);
  expect(j.checkForms[1][0].answer).toBe("Nitric acid");
});
test("fourteen numeric references independently compute powers of ten conserved dilution volume and stated HCl pH", () => {
  const values: Record<string, number> = {
    "w-scale": 10 * 10 * 10,
    "r-dilution": 3 + 1,
    "g-factor": 10 ** -2 / 10 ** -4,
    "g-dilution": 2 + 1,
    "p-fall-three": 10 ** -3 / 10 ** -6,
    "p-rise-two": 10 ** -2 / 10 ** -4,
    "p-hcl-two": -Math.log10(1e-5),
    "p-volume": 20 * 100,
    "a-factor": 10 ** -1 / 10 ** -5,
    "a-dilution": 4 + 2,
    "b-factor": 10 ** -1 / 10 ** -4,
    "b-dilution": 35 * 10,
    "ra-factor": 10 ** -2 / 10 ** -5,
    "rb-dilution": 1 + 3,
  };
  const qs = tasks(j).filter((q) => !q.options && !q.rubric);
  expect(qs).toHaveLength(14);
  for (const q of qs)
    expect(Number(q.answer), q.id).toBeCloseTo(
      values[q.id.replace("acid-v1-", "")],
      7,
    );
});
test("actual source limitations and conservative aliases prevent unsupported strength, weak dilution and legacy freshness claims", () => {
  expect(j.scopeNote).toContain("second proton dissociation");
  expect(j.scopeNote).toContain("ionised fraction changes with concentration");
  expect(j.scopeNote).toContain("no universal numerical");
  expect(j.scopeNote).toContain("pH alone at unknown concentrations cannot");
  const all = tasks(j);
  expect(
    all.find((q) => q.id === "acid-v1-g-factor")!.exposureAliases,
  ).toContain("ph-and-strong-acids-4");
  expect(
    all.find((q) => q.id === "acid-v1-p-complete")!.exposureAliases,
  ).toContain("ph-and-strong-acids-0");
  expect(
    all.find((q) => q.id === "acid-v1-b-equal")!.exposureAliases,
  ).toContain("acid-v1-p-equal-ph");
});
