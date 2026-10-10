import { test, expect } from "@playwright/test";
import before from "./fixtures/moles-total-atoms-before-standard-form.json";
import { lessons } from "../src/content/curriculum";
import { mark, readNumber } from "../src/lib/marking";
import { emptyProgress, emptyWork, decode } from "../src/lib/progress";

const journey = lessons.find(
  (l) => l.slug === "moles-and-reacting-masses",
)!.journey!;
const question = journey.practice.find((q) => q.id === "mo-v1-p-total-atoms")!;

test("only the requested format metadata changes; original single-box identity remains", () => {
  const { standardForm, inputMode, followUp, ...retained } = question;
  expect(standardForm).toBe("e");
  expect(inputMode).toBe("text");
  expect(followUp).toBe("mo-v1-r-standard");
  expect(retained).toEqual(before);
  expect(journey.version).toBe(1);
  expect(question.parts).toBeUndefined();
});

test("normalized e notation accepts value, signs and case without inventing precision", () => {
  for (const raw of ["9.03e23", " +9.030E+023 ", "9.030000000000001e23"])
    expect(mark(question, raw), raw).toMatchObject({
      correct: true,
      empty: false,
    });
  for (const raw of [
    "90.3e22",
    ".903e24",
    "903000000000000000000000",
    "9.03e23/1",
  ]) {
    expect(readNumber(raw), raw).toBe(readNumber(question.answer));
    const result = mark(question, raw);
    expect(result).toMatchObject({ correct: false, empty: false });
    expect(result.invalid).not.toBe(true);
    expect(result.feedback).toContain("Your numerical value is right.");
    expect(result.feedback).toContain("at least 1 and less than 10");
  }
});

test("malformed and nonfinite notation stays invalid; incorrect normalized values stay wrong", () => {
  for (const raw of ["9.03e", "9.03e23.0", "9.03e99999", "Infinity"])
    expect(mark(question, raw), raw).toMatchObject({
      correct: false,
      invalid: true,
      empty: false,
    });
  for (const raw of ["8.03e23", "9.03e22", "3.01e23"])
    expect(mark(question, raw), raw).toMatchObject({
      correct: false,
      invalid: false,
    });
  expect(mark(question, "").empty).toBe(true);
});

test("normalization is scoped; ordinary fractions and existing paired fields remain supported", () => {
  const ordinary = journey.practice.find(
    (q) => q.id === "mo-v1-p-cage-amount",
  )!;
  expect(mark(ordinary, "1/35").correct).toBe(true);
  expect(mark(ordinary, "0.0286").correct).toBe(true);
  const adjacent = journey.practice.find((q) => q.id === "mo-v1-p-chloride")!;
  expect(adjacent.standardForm).toBeUndefined();
  expect(mark(adjacent, "60.2e22").correct).toBe(true);
  const paired = journey.practice.find((q) => q.id === "mo-v1-p-total-ions")!;
  expect(
    mark(paired, JSON.stringify({ coefficient: "12.04", power: "23" })).correct,
  ).toBe(false);
  const progress = emptyProgress(),
    work = emptyWork();
  work.drafts[question.id] = "90.3e22";
  work.attempts[question.id] = [
    { answer: "90.3e22", correct: true, helped: false, fresh: false, at: 1 },
  ];
  progress.seen[question.id] = 1;
  progress.work["moles-and-reacting-masses"] = work;
  expect(decode(JSON.stringify(progress))).toEqual(progress);
});
