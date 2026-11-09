import { expect, test } from "@playwright/test";
import { lessons } from "../src/content/curriculum";
import { mark } from "../src/lib/marking";

for (const item of [
  {
    slug: "relative-atomic-mass",
    id: "ram-v1-g-light",
    answer: "35.5",
    equivalent: "71/2",
    wrong: "36",
    malformed: "35.5 atoms",
  },
  {
    slug: "inside-an-atom",
    id: "atom-v2-g-neutral",
    answer: "6",
    equivalent: "12/2",
    wrong: "12",
    malformed: "6 electrons",
  },
  {
    slug: "inside-an-atom",
    id: "atom-v2-g-mass",
    answer: "14",
    equivalent: "28/2",
    wrong: "13",
    malformed: "14 neutrons",
  },
]) {
  test(`${item.id}: original marker keeps correct, equivalent, wrong, blank and malformed demands`, () => {
    const question = lessons
      .find((lesson) => lesson.slug === item.slug)!
      .journey!.guided.find((question) => question.id === item.id)!;
    expect(mark(question, item.answer).correct).toBe(true);
    expect(mark(question, item.equivalent).correct).toBe(true);
    expect(mark(question, item.wrong).correct).toBe(false);
    expect(mark(question, "")).toMatchObject({ correct: false, empty: true });
    expect(mark(question, item.malformed)).toMatchObject({
      correct: false,
      invalid: true,
    });
  });
}

test("both pilots retain manual judgement of written causal explanations", () => {
  for (const slug of ["relative-atomic-mass", "inside-an-atom"]) {
    const questions = lessons
      .find((lesson) => lesson.slug === slug)!
      .journey!.practice.filter((question) => question.rubric);
    expect(questions.length).toBeGreaterThan(0);
    for (const question of questions) {
      expect(mark(question, question.answer)).toMatchObject({
        correct: false,
        selfReview: true,
      });
      expect(mark(question, "My unfinished explanation.")).toMatchObject({
        correct: false,
        selfReview: true,
      });
    }
  }
});
