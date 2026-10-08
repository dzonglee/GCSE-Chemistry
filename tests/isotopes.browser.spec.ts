import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { isotopeJourney as journey } from "../src/content/journeys/isotopes";
import type { Question } from "../src/content/types";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";

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
        "A proton gain changes atomic number and the element. A positive ion forms by losing electrons, leaving more protons than electrons while the nucleus remains unchanged.",
      );
  else await page.getByLabel("Your answer", { exact: true }).fill(q.answer);
}
async function capture(page: Page, path: string) {
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path, fullPage: true });
}
async function form(page: Page, questions: Question[]) {
  for (let i = 0; i < questions.length; i++) {
    await answer(page, questions[i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    if (i < questions.length - 1)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
}

test("isotope comparison holds element and electrons fixed, explains mass changes and resumes undo", async ({
  page,
}, info) => {
  await page.goto("/lessons/isotopes-and-ions");
  await expect(
    page.getByRole("button", { name: "Add proton", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Add electron", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".transformation-fixed")).toContainText(
    "6 protons and 6 electrons",
  );
  await page.getByRole("button", { name: "Add neutron", exact: true }).click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".task-workbench [role=status]")).toContainText(
    "Neutrons changed from 6 to 7",
  );
  await expect(page.locator(".atom-scene")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await expect(page.locator(".atom-scene-canvas")).toHaveAttribute(
    "data-particles",
    "6,7,6",
  );
  await answer(page, journey.guided[0]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await capture(
    page,
    `docs/qa/isotopes-and-ions-${info.project.name}-isotopes.png`,
  );
  await page.getByRole("button", { name: "Task 2", exact: true }).click();
  await expect(page.locator(".sample-hint")).toHaveCount(0);
  await page.getByRole("button", { name: "Add neutron", exact: true }).click();
  await page.getByRole("button", { name: "Add neutron", exact: true }).click();
  await page.reload();
  await expect(page.getByLabel("Neutron count", { exact: true })).toHaveText(
    "20",
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByLabel("Neutron count", { exact: true })).toHaveText(
    "19",
  );
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".task-workbench [role=status]")).toContainText(
    "mass number is 36",
  );
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(page.getByLabel("Neutron count", { exact: true })).toHaveText(
    "18",
  );
});
test("ion operations diagnose charge direction, preserve the nucleus, recover and display signed notation", async ({
  page,
}, info) => {
  await page.goto("/lessons/isotopes-and-ions");
  await page.getByRole("button", { name: "Task 3", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Add neutron", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".transformation-fixed")).toContainText(
    "11 protons and 12 neutrons",
  );
  await page.getByRole("button", { name: "Add electron", exact: true }).click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".task-workbench [role=status]")).toContainText(
    "target charge is +1",
  );
  await page.getByLabel("Your answer", { exact: true }).fill("-1");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(page.locator(".bench-instruction")).toContainText("lithium-7");
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "-1",
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page
    .getByRole("button", { name: "Remove electron", exact: true })
    .click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".task-workbench [role=status]")).toContainText(
    "mass number 23 are unchanged",
  );
  await answer(page, journey.guided[2]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".atom-scene")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await capture(
    page,
    `docs/qa/isotopes-and-ions-${info.project.name}-positive-ion.png`,
  );
  await page.getByRole("button", { name: "Task 4", exact: true }).click();
  await page.getByRole("button", { name: "Add electron", exact: true }).click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".task-workbench [role=status]")).toContainText(
    "charge −1",
  );
  await expect(page.locator(".atom-comparison")).toContainText(
    "17 p · 18 n · 18 e",
  );
  await answer(page, journey.guided[3]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".atom-scene")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await capture(
    page,
    `docs/qa/isotopes-and-ions-${info.project.name}-negative-ion.png`,
  );
});
test("all eight practice formats work without default models and written correction stays self-reviewed", async ({
  page,
}, info) => {
  await page.goto("/lessons/isotopes-and-ions");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    if (i)
      await page
        .getByRole("button", { name: `Task ${i + 1}`, exact: true })
        .click();
    await expect(
      page.getByRole("region", { name: "Task model", exact: true }),
    ).toHaveCount(0);
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
    if (i === 5)
      await capture(
        page,
        `docs/qa/isotopes-and-ions-${info.project.name}-charged-symbol.png`,
      );
  }
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key)!).work[
            "isotopes-and-ions"
          ].attempts["iso-v1-p-explanation"].at(-1).correct,
        STORAGE_KEY,
      ),
    )
    .toBe(false);
  await page.reload();
  await expect(
    page.getByLabel("Your explanation", { exact: true }),
  ).toHaveValue(/losing electrons/);
});
test("reserved check forms lock answers, defer correctness and never refresh repeated exposure", async ({
  page,
}) => {
  await page.goto("/lessons/isotopes-and-ions");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Task model", exact: true }),
  ).toHaveCount(0);
  await answer(page, journey.checkForms[0][0]);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await expect(page.getByRole("radio").first()).toBeDisabled();
  await expect(page.getByText("That’s right.", { exact: true })).toHaveCount(0);
  for (let i = 1; i < 4; i++) {
    await page
      .getByRole("button", { name: "Next question →", exact: true })
      .click();
    await answer(page, journey.checkForms[0][i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "4 of 4 correct", exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/^4 correct on a fresh/)).toBeVisible();
  await page
    .getByRole("button", { name: "Try the next form", exact: true })
    .click();
  await form(page, journey.checkForms[1]);
  await expect(page.getByText(/^4 correct on a fresh/)).toBeVisible();
  await page
    .getByRole("button", { name: "Try the next form", exact: true })
    .click();
  await form(page, journey.checkForms[0]);
  await expect(page.getByText(/^0 correct on a fresh/)).toBeVisible();
});
test("the delayed review reserves separate questions and resumes the selected form", async ({
  page,
}) => {
  await page.goto("/lessons/isotopes-and-ions");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await form(page, journey.checkForms[0]);
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key)!).work["isotopes-and-ions"]
            .section,
        STORAGE_KEY,
      ),
    )
    .toBe("review");
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
  await page.evaluate(
    ({ key, delay }) => {
      const p = JSON.parse(localStorage.getItem(key)!);
      p.work["isotopes-and-ions"].history[0].submitted =
        Date.now() - delay - 1000;
      p.work["isotopes-and-ions"].run.submitted = Date.now() - delay - 1000;
      localStorage.setItem(key, JSON.stringify(p));
    },
    { key: STORAGE_KEY, delay: REVIEW_DELAY },
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Start review →", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key)!).work["isotopes-and-ions"].run
            .kind,
        STORAGE_KEY,
      ),
    )
    .toBe("review");
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
  await page.reload();
  await form(page, journey.reviewForms[0]);
  await expect(
    page.getByRole("heading", { name: "3 of 3 correct", exact: true }),
  ).toBeVisible();
});
test("both transformation types, charged-symbol practice and written tasks are accessible and reflow", async ({
  page,
}) => {
  for (const [stage, index] of [
    ["Learn", 0],
    ["Learn", 2],
    ["Practise", 5],
    ["Practise", 7],
    ["Check", 0],
  ] as const) {
    await page.goto("/lessons/isotopes-and-ions");
    await page.getByRole("button", { name: stage, exact: true }).click();
    if (index)
      await page
        .getByRole("button", { name: `Task ${index + 1}`, exact: true })
        .click();
    if (stage === "Learn")
      await expect(page.locator(".atom-scene")).toHaveAttribute(
        "data-ready",
        "true",
      );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
});
