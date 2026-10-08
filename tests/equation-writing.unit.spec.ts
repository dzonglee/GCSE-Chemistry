import { test, expect } from "@playwright/test";
import { equationWriting as a } from "../src/content/journeys/equation-writing";
import { balancingJourney as journey } from "../src/content/journeys/balancing-equations";
import { questionById } from "../src/content/curriculum";
import { balanceLedger } from "../src/lib/equation-balancing";
import { mark } from "../src/lib/marking";

test("the extension preserves old forms and original task positions", () => {
  expect(journey.version).toBe(1);
  expect(journey.guided.slice(0, 4).map((q) => q.id)).toEqual(
    ["ledger", "molecules", "identity", "words"].map((id) => "be-v1-g-" + id),
  );
  expect(journey.checkForms.map((f) => f.length)).toEqual([5, 5, 3]);
  expect(journey.reviewForms.map((f) => f.length)).toEqual([3, 3, 2]);
  const grouped = journey.practiceGroups!.flatMap((g) => g.taskIds);
  expect(grouped).toHaveLength(25);
  expect(new Set(grouped)).toEqual(new Set(journey.practice.map((q) => q.id)));
  expect(journey.checkForms[0].map((q) => q.id)).toEqual(
    ["iron", "neutralisation", "count", "multiple", "state"].map(
      (id) => "be-v1-ca-" + id,
    ),
  );
  expect(journey.reviewForms[0].map((q) => q.id)).toEqual(
    ["hcl", "count", "ratio"].map((id) => "be-v1-ra-" + id),
  );
});

test("complete symbol references independently conserve every element and fixed formula", () => {
  const references = [
    [
      a.guided[0],
      "2K + 2H₂O → 2KOH + H₂",
      ["K", "H2O"],
      ["KOH", "H2"],
      [2, 2, 2, 1],
    ],
    [a.practice[1], "2Mg + O₂ → 2MgO", ["Mg", "O2"], ["MgO"], [2, 1, 2]],
    [a.practice[2], "2Na + Cl₂ → 2NaCl", ["Na", "Cl2"], ["NaCl"], [2, 1, 2]],
    [a.check[1], "H₂ + Br₂ → 2HBr", ["H2", "Br2"], ["HBr"], [1, 1, 2]],
    [a.check[2], "CaCO₃ → CaO + CO₂", ["CaCO3"], ["CaO", "CO2"], [1, 1, 1]],
    [a.review[0], "2Li + Cl₂ → 2LiCl", ["Li", "Cl2"], ["LiCl"], [2, 1, 2]],
    [
      a.review[1],
      "Mg(OH)₂ → MgO + H₂O",
      ["Mg(OH)2"],
      ["MgO", "H2O"],
      [1, 1, 1],
    ],
  ] as const;
  for (const [q, equation, left, right, coefficients] of references) {
    expect(q.answer.split("\n").at(-1)).toBe(equation);
    expect(
      balanceLedger([...left], [...right], [...coefficients]),
    ).toMatchObject({ balanced: true, smallest: true });
  }
  expect(balanceLedger(["Mg", "O2"], ["MgO"], [1, 1, 1]).balanced).toBe(false);
  expect(balanceLedger(["Mg", "O2"], ["MgO2"], [1, 1, 1]).balanced).toBe(true);
  expect(a.practice[1].rubric!.join(" ")).toContain("MgO₂");
});

test("full writing never receives automatic marks, including the exact reference", () => {
  const tasks = Object.values(a).flat();
  expect(tasks).toHaveLength(11);
  expect(tasks.filter((q) => q.rubric)).toHaveLength(9);
  for (const q of tasks.filter((q) => q.rubric)) {
    for (const response of [
      q.answer,
      "oxygen → metal; change the subscripts",
      "1..2",
    ])
      expect(mark(q, response)).toMatchObject({
        correct: false,
        selfReview: true,
        empty: false,
      });
    expect(mark(q, "").empty).toBe(true);
  }
  expect(mark(a.refresher[0], "2Mg + O₂ → 2MgO").correct).toBe(false);
  expect(mark(a.refresher[1], "2O").correct).toBe(false);
});

test("new exposure equivalents are symmetric and recoveries resolve to actual refresher tasks", () => {
  for (const q of Object.values(a).flat()) {
    for (const id of q.exposureAliases ?? [])
      expect(questionById(id)?.exposureAliases).toContain(q.id);
    if (q.followUp)
      expect(journey.refresher.some((r) => r.id === q.followUp)).toBe(true);
  }
  expect(a.guided[0].exposureAliases).toContain("be-v1-p-potassium");
  expect(a.check[0].exposureAliases).toBeUndefined();
  expect(a.check[1].exposureAliases).toBeUndefined();
});
