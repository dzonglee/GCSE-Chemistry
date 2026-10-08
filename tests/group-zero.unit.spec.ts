import { test, expect } from "@playwright/test";
import { groupZeroJourney as journey } from "../src/content/journeys/group-zero";
import { tasks } from "../src/content/journeys/helpers";
import {
  initialBoard,
  checkBoard,
  validBoard,
  validHistory,
} from "../src/lib/workbench";
import { mark } from "../src/lib/marking";
test("helium and argon full shells preserve the first-shell exception and distinguish missing electrons", () => {
  const he = journey.guided[0].model!,
    ar = journey.guided[1].model!;
  expect(checkBoard(he, { s1: 2, s2: 0, s3: 0, s4: 0 }).correct).toBe(true);
  expect(checkBoard(he, { s1: 0, s2: 2, s3: 0, s4: 0 }).correct).toBe(false);
  expect(checkBoard(ar, initialBoard(ar)).correct).toBe(false);
  expect(checkBoard(ar, { s1: 2, s2: 8, s3: 8, s4: 0 }).correct).toBe(true);
});
test("gas and justification must both meet the specified requirements, with explicit counterexamples", () => {
  const balloon = journey.guided[2].model!,
    filament = journey.guided[3].model!;
  expect(checkBoard(balloon, { gas: "hydrogen", reason: "both" }).correct).toBe(
    false,
  );
  expect(checkBoard(balloon, { gas: "argon", reason: "both" }).correct).toBe(
    false,
  );
  expect(
    checkBoard(balloon, { gas: "helium", reason: "density" }).correct,
  ).toBe(false);
  expect(checkBoard(balloon, { gas: "helium", reason: "both" }).correct).toBe(
    true,
  );
  expect(
    checkBoard(filament, { gas: "argon", reason: "density" }).correct,
  ).toBe(false);
  expect(checkBoard(filament, { gas: "argon", reason: "inert" }).correct).toBe(
    true,
  );
  expect(
    checkBoard(filament, { gas: "helium", reason: "inert" }).feedback,
  ).toContain("Other inert gases");
});
test("property histories validate exact states and one operation while rejecting tampering", () => {
  const model = journey.guided[2].model!,
    first = initialBoard(model);
  expect(
    validHistory(model, [
      first,
      { ...first, gas: "helium" },
      { gas: "helium", reason: "both" },
    ]),
  ).toBe(true);
  expect(validHistory(model, [first, { gas: "helium", reason: "both" }])).toBe(
    false,
  );
  expect(validBoard(model, { ...first, gas: "oxygen" })).toBe(false);
  expect(validBoard(model, { ...first, answer: true })).toBe(false);
});
test("cold tasks are distinct, predictions accept justified intervals, and written answers never earn automatic marks", () => {
  expect(tasks(journey)).toHaveLength(45);
  expect(new Set(tasks(journey).map((t) => t.id)).size).toBe(45);
  const prediction = journey.practice.find((t) => t.id.endsWith("p-predict"))!;
  for (const value of ["-185", "-153", "-109", "-150.5"])
    expect(mark(prediction, value).correct).toBe(true);
  for (const value of ["-186", "-108", "150", "0", "NaN"])
    expect(mark(prediction, value).correct).toBe(false);
  const written = journey.practice.find((t) => t.rubric)!;
  expect(written.options).toBeUndefined();
  expect(mark(written, written.answer).correct).toBe(false);
  const reserve = new Set(
    [...journey.checkForms.flat(), ...journey.reviewForms.flat()].map(
      (t) => t.id,
    ),
  );
  for (const t of [...journey.guided, ...journey.practice])
    expect(reserve.has(t.id)).toBe(false);
  for (const t of [...journey.checkForms.flat(), ...journey.reviewForms.flat()])
    expect(t.model).toBeUndefined();
});
