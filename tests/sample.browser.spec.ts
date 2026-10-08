import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { lessons } from "../src/content/curriculum";
import type { Question } from "../src/content/types";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
const lesson = lessons.find((l) => l.slug === "inside-an-atom")!,
  journey = lesson.journey!;
async function answer(page: Page, q: Question) {
  if (q.parts)
    for (const part of q.parts)
      await page
        .getByLabel(part.label, { exact: true })
        .fill(String(part.answer));
  else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else if (q.rubric)
    await page
      .getByLabel("Your explanation", { exact: true })
      .fill(
        "Protons and neutrons are in the nucleus and are much heavier than electrons. Electrons are outside the nucleus, so the nucleus contains almost all the mass.",
      );
  else await page.getByLabel("Your answer", { exact: true }).fill(q.answer);
}
async function complete(page: Page, form: Question[]) {
  for (let i = 0; i < form.length; i++) {
    await answer(page, form[i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    if (i < form.length - 1)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
}
test("the particle task connects placement, relative mass and an explanation", async ({
  page,
}, info) => {
  await page.goto(`/lessons/${lesson.slug}`);
  await page
    .getByRole("button", { name: "Place proton in shells", exact: true })
    .click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".task-workbench [role=status]")).toContainText(
    "Protons belong in the nucleus",
  );
  await page
    .getByRole("button", { name: "Place proton in nucleus", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Choose neutron", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Place neutron in nucleus", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Choose electron", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Place electron in shells", exact: true })
    .click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".task-workbench [role=status]")).toContainText(
    "relative mass about 1/1836",
  );
  await page.getByRole("radio", { name: /The nucleus$/ }).check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "That’s right",
  );
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({
    path: `docs/qa/inside-an-atom-${info.project.name}-particles.png`,
    fullPage: true,
  });
  await page.reload();
  await expect(page.locator(".region-ledger")).toContainText("Electron");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".region-ledger")).not.toContainText("Electron");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(page.locator(".region-ledger")).not.toContainText("Proton");
});
test("all guided atoms diagnose identity, mass and neutrality and resume the model history", async ({
  page,
}, info) => {
  await page.goto(`/lessons/${lesson.slug}`);
  await page.getByRole("button", { name: "Task 2", exact: true }).click();
  await page.getByRole("button", { name: "Add proton", exact: true }).click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".task-workbench [role=status]")).toContainText(
    "changes the element",
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".task-workbench [role=status]")).toContainText(
    "Charge is protons minus electrons",
  );
  const electrons = page.getByLabel("Electron count", { exact: true });
  for (let i = 0; i < 6; i++)
    await page
      .getByRole("button", { name: "Add electron", exact: true })
      .click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".task-workbench [role=status]")).toContainText(
    "6 protons, 6 neutrons and 6 electrons",
  );
  await answer(page, journey.guided[1]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page.reload();
  await expect(electrons).toHaveText("6");
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "That’s right",
  );
  await page.getByRole("button", { name: "Task 3", exact: true }).click();
  await expect(page.locator(".atom-scene")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await expect(page.locator(".sample-hint")).toHaveCount(0);
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".task-workbench [role=status]")).toContainText(
    "target is 27",
  );
  await page.getByRole("button", { name: "Add neutron", exact: true }).click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await answer(page, journey.guided[2]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({
    path: `docs/qa/inside-an-atom-${info.project.name}-build.png`,
    fullPage: true,
  });
});
test("practice exposes purposeful support, error recovery, nuclear notation and honest written self-review", async ({
  page,
}, info) => {
  await page.goto(`/lessons/${lesson.slug}`);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await expect(page.getByRole("region", { name: "Task model" })).toHaveCount(0);
  await page.getByLabel("Your answer", { exact: true }).fill("10");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "proton number",
  );
  await page
    .getByRole("button", { name: "Use the model for support", exact: true })
    .click();
  await expect(page.getByRole("region", { name: "Task model" })).toBeVisible();
  await answer(page, journey.practice[0]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key)!).work[
            "inside-an-atom"
          ].attempts["atom-v2-p-neon"].at(-1).helped,
        STORAGE_KEY,
      ),
    )
    .toBe(true);
  await page.getByRole("button", { name: "Task 5", exact: true }).click();
  await page.getByLabel("Protons", { exact: true }).fill("18");
  await page.getByLabel("Neutrons", { exact: true }).fill("40");
  await page.getByLabel("Electrons", { exact: true }).fill("18");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "Revisit neutrons",
  );
  await answer(page, journey.practice[4]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({
    path: `docs/qa/inside-an-atom-${info.project.name}-exam-practice.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Task 6", exact: true }).click();
  await expect(
    page.getByText(journey.practice[5].rubric![0], { exact: true }),
  ).toHaveCount(0);
  await answer(page, journey.practice[5]);
  await page
    .getByRole("button", { name: "Save and review explanation", exact: true })
    .click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "Compare your explanation",
  );
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "not an automatic mark",
  );
  await page.reload();
  await expect(
    page.getByLabel("Your explanation", { exact: true }),
  ).toHaveValue(/much heavier/);
});
test("reserved checks hide help, validate multi-part input, rotate forms and keep finite exposure", async ({
  page,
}) => {
  await page.goto(`/lessons/${lesson.slug}`);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await expect(page.getByRole("region", { name: "Task model" })).toHaveCount(0);
  await page.getByLabel("Protons", { exact: true }).fill("5");
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(page.locator(".question-panel [role=status]")).toContainText(
    "Complete every part",
  );
  await answer(page, journey.checkForms[0][0]);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(
    page.getByText(journey.checkForms[0][0].explanation, { exact: true }),
  ).toHaveCount(0);
  await page.reload();
  await expect(page.getByLabel("Protons", { exact: true })).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Give me a hint", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Next question →", exact: true })
    .click();
  for (let i = 1; i < 3; i++) {
    await answer(page, journey.checkForms[0][i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    if (i < 2)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "3 of 3 correct", exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/^3 correct on a fresh/)).toBeVisible();
  await page
    .getByRole("button", { name: "Try the next form", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: journey.checkForms[1][0].prompt,
      exact: true,
    }),
  ).toBeVisible();
  await complete(page, journey.checkForms[1]);
  await expect(page.getByText(/^3 correct on a fresh/)).toBeVisible();
  await page
    .getByRole("button", { name: "Try the next form", exact: true })
    .click();
  await complete(page, journey.checkForms[2]);
  await page
    .getByRole("button", { name: "Try the next form", exact: true })
    .click();
  await complete(page, journey.checkForms[0]);
  await expect(page.getByText(/^0 correct on a fresh/)).toBeVisible();
});
test("review waits for seven days and uses separate questions", async ({
  page,
}) => {
  await page.goto(`/lessons/${lesson.slug}`);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await complete(page, journey.checkForms[0]);
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  // Changing the test clock's saved timestamp must follow the app's pending commit.
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
  await page.evaluate(
    ({ key, delay }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      p.work["inside-an-atom"].history[0].submitted = Date.now() - delay - 1000;
      p.work["inside-an-atom"].run.submitted = Date.now() - delay - 1000;
      localStorage.setItem(key, JSON.stringify(p));
    },
    { key: STORAGE_KEY, delay: REVIEW_DELAY },
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Start review →", exact: true })
    .click();
  await complete(page, journey.reviewForms[0]);
  await expect(
    page.getByRole("heading", { name: "2 of 2 correct", exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/^2 correct on a fresh/)).toBeVisible();
});
test("the complete sample reflows and is accessible at guided, practice, written and assessment stages", async ({
  page,
}) => {
  for (const [stage, index] of [
    ["Learn", 0],
    ["Learn", 1],
    ["Practise", 4],
    ["Practise", 5],
    ["Check", 0],
  ] as const) {
    await page.goto(`/lessons/${lesson.slug}`);
    await page.getByRole("button", { name: stage, exact: true }).click();
    if (stage !== "Check" && index)
      await page
        .getByRole("button", { name: `Task ${index + 1}`, exact: true })
        .click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
});
test("a neutron mistake opens the mass refresher and returns to the saved task; all practice representations work", async ({
  page,
}) => {
  await page.goto(`/lessons/${lesson.slug}`);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await page.getByLabel("Your answer", { exact: true }).fill("10");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .locator(".question-panel")
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /Build neutral lithium-7/ }),
  ).toBeVisible();
  await page.getByLabel("Your answer", { exact: true }).fill("4");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "10",
  );
  for (let i = 0; i < journey.practice.length; i++) {
    await page
      .getByRole("button", { name: `Task ${i + 1}`, exact: true })
      .click();
    await answer(page, journey.practice[i]);
    await page
      .getByRole("button", {
        name: journey.practice[i].rubric
          ? "Save and review explanation"
          : "Check answer",
        exact: true,
      })
      .click();
    await expect(page.locator(".question-panel .feedback")).toContainText(
      journey.practice[i].rubric ? "Compare your explanation" : "That’s right",
    );
  }
});
