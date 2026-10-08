import { test, expect } from "@playwright/test";
import { nextStep } from "../src/lib/overview";
import { observedResults, lessonStatus } from "../src/lib/progress";
import { manualProgress } from "./fixtures/manual-progress";

test("saved written responses need review without being classified as incorrect", () => {
  const now = Date.now();
  const { progress, lesson } = manualProgress(now);
  const results = observedResults(lesson.slug, progress)!;
  expect(results.filter((r) => r.question.rubric).length).toBeGreaterThan(0);
  expect(
    results
      .filter((r) => r.question.rubric)
      .every((r) => !r.correct && r.response.answer.length > 0),
  ).toBe(true);
  expect(
    results.filter((r) => !r.question.rubric).every((r) => r.correct),
  ).toBe(true);
  expect(lessonStatus(lesson.slug, progress)).toBe("Check completed");
  expect(nextStep(progress, now).title).toBe("Explore your next idea");
});

test("an actual incorrect automatic response still recommends revision", () => {
  const now = Date.now();
  const { progress, lesson } = manualProgress(now, true);
  expect(nextStep(progress, now)).toMatchObject({
    title: "Give an idea another look",
    href: `/lessons/${lesson.slug}`,
  });
});
