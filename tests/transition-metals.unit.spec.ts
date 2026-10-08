import { test, expect } from "@playwright/test";
import { transitionMetalsJourney as journey } from "../src/content/journeys/transition-metals";
import { tasks } from "../src/content/journeys/helpers";
import {
  initialBoard,
  checkBoard,
  validBoard,
  validHistory,
} from "../src/lib/workbench";
import { catalystData, transitionExamples } from "../src/lib/transition-metals";
import { mark } from "../src/lib/marking";
test("physical comparisons require distinct properties and reject unrelated compound or ion chemistry", () => {
  const model = journey.guided[0].model!;
  const eligible = ["melting", "density", "hardness", "strength"];
  for (const first of [
    "melting",
    "density",
    "hardness",
    "strength",
    "reactivity",
    "colour",
    "charge",
  ])
    for (const second of [
      "melting",
      "density",
      "hardness",
      "strength",
      "reactivity",
      "colour",
      "charge",
    ])
      expect(
        checkBoard(model, { first, second }).correct,
        `${first}/${second}`,
      ).toBe(
        first !== second &&
          eligible.includes(first) &&
          eligible.includes(second),
      );
  expect(checkBoard(model, initialBoard(model)).correct).toBe(false);
  expect(transitionExamples.map((e) => e.symbol)).toEqual([
    "Cr",
    "Mn",
    "Fe",
    "Co",
    "Ni",
    "Cu",
  ]);
  expect(
    transitionExamples.every((e) => e.melting > 98 && e.density > 0.968),
  ).toBe(true);
});
test("Fe2+ and Fe3+ preserve 26 protons with different electron counts rather than using the first-20 shell rule", () => {
  const fe2 = journey.guided[1].model!,
    fe3 = journey.guided[2].model!;
  expect(checkBoard(fe2, { electrons: 24 }).correct).toBe(true);
  expect(checkBoard(fe2, { electrons: 26 }).correct).toBe(false);
  expect(checkBoard(fe3, { electrons: 23 }).correct).toBe(true);
  expect(checkBoard(fe3, { electrons: 24 }).correct).toBe(false);
  expect(validBoard(fe2, { electrons: 28 })).toBe(false);
  expect(validBoard(fe2, { electrons: 24, protons: 24 })).toBe(false);
});
test("illustrative catalyst data support an early rate difference and an equal completed amount without inventing a rate law", () => {
  expect(catalystData.find((d) => d.time === 20)).toEqual({
    time: 20,
    without: 14,
    with: 22,
  });
  expect(catalystData.at(-1)).toEqual({ time: 60, without: 24, with: 24 });
  const model = journey.guided[3].model!;
  expect(checkBoard(model, { early: "greater", final: "same" }).correct).toBe(
    true,
  );
  expect(
    checkBoard(model, { early: "greater", final: "greater" }).correct,
  ).toBe(false);
  expect(checkBoard(model, { early: "same", final: "same" }).correct).toBe(
    false,
  );
});
test("model histories preserve wrong proposals and enforce one operation with strict known fields", () => {
  const model = journey.guided[0].model!,
    first = initialBoard(model);
  expect(
    validHistory(model, [
      first,
      { ...first, first: "density" },
      { first: "density", second: "hardness" },
    ]),
  ).toBe(true);
  expect(
    validHistory(model, [first, { first: "density", second: "hardness" }]),
  ).toBe(false);
  expect(validBoard(model, { ...first, first: "softness" })).toBe(false);
  const ion = journey.guided[2].model!;
  expect(validHistory(ion, [initialBoard(ion), { electrons: 23 }])).toBe(true);
});
test("the 47 tasks reserve cold forms, preserve scientific answers and keep constructed explanations self-reviewed", () => {
  expect(tasks(journey)).toHaveLength(47);
  expect(new Set(tasks(journey).map((t) => t.id)).size).toBe(47);
  for (const t of tasks(journey)) {
    if (!t.rubric) expect(mark(t, t.answer).correct, t.id).toBe(true);
    if (t.options)
      expect(t.options.filter((o) => o === t.answer)).toHaveLength(1);
  }
  const written = journey.practice.find((t) => t.rubric)!;
  expect(written.options).toBeUndefined();
  expect(mark(written, written.answer).correct).toBe(false);
  for (const t of [...journey.checkForms.flat(), ...journey.reviewForms.flat()])
    expect(t.model).toBeUndefined();
  const before = new Set(
    [
      ...journey.warmup,
      ...journey.refresher,
      ...journey.guided,
      ...journey.practice,
    ].map((t) => t.id),
  );
  for (const t of [...journey.checkForms.flat(), ...journey.reviewForms.flat()])
    expect(before.has(t.id)).toBe(false);
});
