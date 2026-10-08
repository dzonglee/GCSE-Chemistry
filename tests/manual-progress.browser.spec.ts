import { test, expect } from "@playwright/test";
import { STORAGE_KEY, emptyWork } from "../src/lib/progress";
import { lessons } from "../src/content/curriculum";
import { manualProgress } from "./fixtures/manual-progress";

for (const automaticWrong of [false, true]) {
  test(`progress recommendations distinguish saved manual work from automatic error: ${automaticWrong}`, async ({
    page,
  }) => {
    const { progress, lesson, form } = manualProgress(
      Date.now(),
      automaticWrong,
    );
    await page.addInitScript(
      ({ key, progress }) =>
        localStorage.setItem(key, JSON.stringify(progress)),
      { key: STORAGE_KEY, progress },
    );
    await page.goto("/learn");
    await expect(
      page.getByRole("heading", { name: "My progress", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Topics to revisit", exact: true }),
    ).toHaveCount(automaticWrong ? 1 : 0);
    await expect(page.locator(".next-step h2")).toHaveText(
      automaticWrong ? "Give an idea another look" : "Explore your next idea",
    );
    const stored = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      STORAGE_KEY,
    );
    for (const q of form.filter((q) => q.rubric)) {
      expect(stored.work[lesson.slug].run.responses[q.id]).toMatchObject({
        answer: q.answer,
        correct: false,
      });
    }
    await expect(
      page.getByText(/unreadable|cannot be read|another tab/i),
    ).toHaveCount(0);
  });
}

test("mixed practice prioritises a genuine automatic error over multiple saved written responses", async ({
  page,
}) => {
  const now = Date.now();
  const { progress, lesson, form } = manualProgress(now);
  const manualQuestions = [...lesson.journey!.practice, ...form].filter(
    (q) => q.rubric,
  );
  expect(manualQuestions.length).toBeGreaterThan(1);
  progress.work[lesson.slug].attempts = Object.fromEntries(
    manualQuestions.map((q) => [
      q.id,
      [
        {
          answer: q.answer,
          correct: false,
          helped: false,
          fresh: false,
          at: now,
        },
      ],
    ]),
  );
  const ionic = lessons.find((l) => l.slug === "ionic-bonding")!;
  const target = ionic.journey!.practice.find((q) => !q.rubric)!;
  progress.work[ionic.slug] = {
    ...emptyWork(),
    updated: now,
    attempts: {
      [target.id]: [
        {
          answer: "wrong",
          correct: false,
          helped: false,
          fresh: false,
          at: now,
        },
      ],
    },
  };
  await page.addInitScript(
    ({ key, progress }) => localStorage.setItem(key, JSON.stringify(progress)),
    { key: STORAGE_KEY, progress },
  );
  await page.goto("/practice");
  await page
    .getByRole("button", { name: "Prepare my set →", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await expect(page.locator(".question-panel h2")).toHaveText(target.prompt);
});
