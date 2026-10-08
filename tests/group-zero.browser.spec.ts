import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { groupZeroJourney as journey } from "../src/content/journeys/group-zero";
import type { Question } from "../src/content/types";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
async function answer(page: Page, q: Question) {
  if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
  else
    await page
      .getByLabel(q.rubric ? "Your explanation" : "Your answer", {
        exact: true,
      })
      .fill(q.answer);
}
async function capture(page: Page, name: string) {
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0);
  });
  await mkdir("test-results/qa/group-zero", { recursive: true });
  await page.screenshot({ path: name, fullPage: true });
}
async function audit(page: Page) {
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
test("helium construction diagnoses wrong shells and renders the actual two-electron 3D asset", async ({
  page,
}, info) => {
  await page.goto("/lessons/group-zero");
  const add = page.getByRole("button", {
    name: "Add electron to shell 1",
    exact: true,
  });
  const box = await add.boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await page
    .getByRole("button", { name: "Add electron to shell 2", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add electron to shell 2", exact: true })
    .click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".shell-workbench [role=status]")).not.toHaveClass(
    /correct/,
  );
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await add.click();
  await add.click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".shell-workbench [role=status]")).toHaveClass(
    /correct/,
  );
  await answer(page, journey.guided[0]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Inspect your arrangement in 3D",
      exact: true,
    })
    .click();
  await expect(page.locator(".atom-scene")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await audit(page);
  await capture(
    page,
    `test-results/qa/group-zero/group-zero-${info.project.name}-helium.png`,
  );
  await page.reload();
  await expect(
    page.getByLabel("Shell 1 electron count", { exact: true }),
  ).toHaveText("2");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByLabel("Shell 1 electron count", { exact: true }),
  ).toHaveText("1");
});
test("balloon and filament proposals need an appropriate gas and causal justification; reload and reset retain deliberate choices", async ({
  page,
}, info) => {
  await page.goto("/lessons/group-zero");
  await page.getByRole("button", { name: "Task 3", exact: true }).click();
  const gas = page.getByLabel("Proposed gas", { exact: true }),
    reason = page.getByLabel("Reason for this use", { exact: true }),
    status = page.locator(".noble-use-workbench [role=status]");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(status).toContainText("flammable");
  await gas.selectOption("argon");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(status).toContainText("denser");
  await gas.selectOption("helium");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(status).toContainText("BOTH");
  await reason.selectOption("both");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(status).toHaveClass(/correct/);
  await answer(page, journey.guided[2]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await audit(page);
  await capture(
    page,
    `test-results/qa/group-zero/group-zero-${info.project.name}-balloon.png`,
  );
  await page.reload();
  await expect(gas).toHaveValue("helium");
  await expect(reason).toHaveValue("both");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(reason).toHaveValue("density");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(gas).toHaveValue("hydrogen");
  await page.getByRole("button", { name: "Task 4", exact: true }).click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(status).not.toHaveClass(/correct/);
  await reason.selectOption("inert");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(status).toHaveClass(/correct/);
  await answer(page, journey.guided[3]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await audit(page);
  await capture(
    page,
    `test-results/qa/group-zero/group-zero-${info.project.name}-filament.png`,
  );
});
test("all independent practice works, a non-example triggers recovery, prediction intervals and written review remain honest", async ({
  page,
}, info) => {
  await page.goto("/lessons/group-zero");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    if (i) {
      if (await page.locator(".practice-task-picker select").isVisible())
        await page
          .locator(".practice-task-picker select")
          .selectOption(String(i));
      else
        await page
          .getByRole("button", { name: `Task ${i + 1}`, exact: true })
          .click();
    }
    await expect(
      page.locator(".shell-workbench,.noble-use-workbench"),
    ).toHaveCount(0);
    if (i === 1) {
      await page
        .getByRole("radio", {
          name: journey.practice[i].options!.find(
            (o) => o !== journey.practice[i].answer,
          )!,
          exact: true,
        })
        .check();
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Revisit the key idea", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Return to your task →", exact: true })
        .click();
    }
    await answer(page, journey.practice[i]);
    await page
      .getByRole("button", {
        name: journey.practice[i].rubric
          ? "Save and review explanation"
          : "Check answer",
        exact: true,
      })
      .click();
    if (i === 5) {
      await audit(page);
      await capture(
        page,
        `test-results/qa/group-zero/group-zero-${info.project.name}-prediction.png`,
      );
    }
    if (journey.practice[i].rubric) {
      await audit(page);
      await capture(
        page,
        `test-results/qa/group-zero/group-zero-${info.project.name}-explanation.png`,
      );
      const attempts = await page.evaluate(
        ({ key, id }) =>
          JSON.parse(localStorage.getItem(key)!).work["group-zero"].attempts[
            id
          ],
        { key: STORAGE_KEY, id: journey.practice[i].id },
      );
      expect(attempts.at(-1).correct).toBe(false);
    }
  }
});
test("independent four-item checks defer feedback, save drafts and require a real seven-day delay before the separate review", async ({
  page,
}) => {
  await page.goto("/lessons/group-zero");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (let i = 0; i < journey.checkForms[0].length; i++) {
    if (i)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
    await answer(page, journey.checkForms[0][i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    await expect(page.getByText("That's right.", { exact: true })).toHaveCount(
      0,
    );
    if (i === 0) {
      await page.reload();
      await expect(
        page.getByRole("button", { name: "Next question →", exact: true }),
      ).toBeVisible();
    }
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /4 of 4 correct/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Record answer", exact: true }),
  ).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
  await page.evaluate(
    ({ key, delay }) => {
      const data = JSON.parse(localStorage.getItem(key)!);
      data.work["group-zero"].history[0].submitted = Date.now() - delay - 1000;
      data.work["group-zero"].run.submitted = Date.now() - delay - 1000;
      localStorage.setItem(key, JSON.stringify(data));
    },
    { key: STORAGE_KEY, delay: REVIEW_DELAY },
  );
  await page.reload();
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await page
    .getByRole("button", { name: "Start review →", exact: true })
    .click();
  for (let i = 0; i < journey.reviewForms[0].length; i++) {
    if (i)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
    await answer(page, journey.reviewForms[0][i]);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /2 of 2 correct/ }),
  ).toBeVisible();
});
