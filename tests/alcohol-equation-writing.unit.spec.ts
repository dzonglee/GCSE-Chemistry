import { test, expect } from "@playwright/test";
import { alcoholEquationWriting as additions } from "../src/content/journeys/alcohol-equation-writing";
import { alcoholJourney } from "../src/content/journeys/alcohols";
import { exposureIds } from "../src/lib/progress";
import { mark } from "../src/lib/marking";
const tasks = [
  ...additions.guided,
  ...additions.practice,
  ...additions.check,
  ...additions.review,
];
test("every reference independently conserves fuel oxygen as well as carbon and hydrogen", () => {
  const expected = [
    [1, 2, 3, 2, 4],
    [2, 1, 3, 2, 3],
    [3, 2, 9, 6, 8],
    [4, 1, 6, 4, 5],
    [1, 2, 3, 2, 4],
    [4, 1, 6, 4, 5],
    [2, 1, 3, 2, 3],
    [3, 2, 9, 6, 8],
  ];
  expect(tasks).toHaveLength(expected.length);
  for (const [i, [n, f, o, c, w]] of expected.entries()) {
    expect([n * f, (2 * n + 2) * f, f + 2 * o]).toEqual([c, 2 * w, 2 * c + w]);
    const equation = tasks[i].answer!.replace(/[₀-₉]/g, (s) =>
      String("₀₁₂₃₄₅₆₇₈₉".indexOf(s)),
    );
    const parts = equation.split(/\s*[+→]\s*/);
    expect(parts).toHaveLength(4);
    const coefficients = parts.map((p) =>
      Number(p.match(/^\d+(?=[A-Z])/)?.[0] ?? 1),
    );
    expect(coefficients).toEqual([f, o, c, w]);
    expect(parts[1]).toMatch(/O2$/);
    expect(parts[2]).toMatch(/CO2$/);
    expect(parts[3]).toMatch(/H2O$/);
  }
});
test("partial equations and correct references remain retained self-review without invented marks", () => {
  for (const task of tasks) {
    expect(task.writtenEquations).toBe(true);
    for (const response of ["3", "C2H5OH + O2 -> CO2", task.answer!]) {
      expect(mark(task, response).selfReview).toBe(true);
      expect(mark(task, response).correct).toBe(false);
    }
    expect(task.followUp).toBe("alc-v1-r-combustion");
    expect(alcoholJourney.refresher.some((t) => t.id === task.followUp)).toBe(
      true,
    );
  }
});
test("new reserved forms withhold models and respect old disclosed coefficient equations", () => {
  expect(alcoholJourney.checkForms.map((f) => f.length)).toEqual([8, 8, 2]);
  expect(alcoholJourney.reviewForms.map((f) => f.length)).toEqual([3, 3, 2]);
  for (const t of [...additions.check, ...additions.review]) {
    expect(t.model).toBeUndefined();
    expect(t.options).toBeUndefined();
    expect(t.exposureAliases).toContain("alc-v1-a-o");
    expect(t.exposureAliases).toContain("alc-v1-b-o");
    expect(t.exposureAliases).not.toContain("alc-v1-p-name-from-acid");
  }
});

test("a previously disclosed full-paper equation prevents fresh lesson writing without exposing unrelated naming", () => {
  expect(exposureIds(["chem-p2h-full-v1-02c"])).toContain(
    "alc-write-v1-rb-propanol",
  );
  expect(exposureIds(["alc-v1-b-o"])).toContain("alc-write-v1-ca-methanol");
  expect(exposureIds(["alc-v1-p-name-from-acid"])).not.toContain(
    "alc-write-v1-ca-methanol",
  );
});
