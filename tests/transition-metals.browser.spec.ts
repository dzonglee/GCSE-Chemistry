import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { transitionMetalsJourney as journey } from "../src/content/journeys/transition-metals";
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
async function chooseTask(page: Page, n: number) {
  const picker = page.getByLabel("Choose a practice task", { exact: true });
  if (await picker.isVisible()) await picker.selectOption(String(n - 1));
  else
    await page.getByRole("button", { name: `Task ${n}`, exact: true }).click();
}
async function audit(page: Page) {
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
async function capture(page: Page, name: string) {
  await mkdir("test-results/qa/transition-metals", { recursive: true });
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path: name, fullPage: true });
}
test("physical comparisons remain wrong until the property type and distinctness are repaired, with usable mobile controls", async ({
  page,
}, info) => {
  await page.goto("/lessons/transition-metals");
  const first = page.getByLabel("Physical comparison 1", { exact: true }),
    second = page.getByLabel("Physical comparison 2", { exact: true }),
    status = page.locator(".transition-workbench [role=status]");
  const box = await first.boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(status).toContainText("physical");
  await first.selectOption("density");
  await second.selectOption("density");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(status).toContainText("DIFFERENT");
  await second.selectOption("hardness");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(status).toHaveClass(/correct/);
  await answer(page, journey.guided[0]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".transition-workbench tbody tr")).toHaveCount(7);
  await audit(page);
  await capture(
    page,
    `test-results/qa/transition-metals/transition-metals-${info.project.name}-comparison.png`,
  );
  await page.reload();
  await expect(first).toHaveValue("density");
  await expect(second).toHaveValue("hardness");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(second).toHaveValue("density");
  await page.getByRole("button", { name: "Reset model", exact: true }).click();
  await expect(first).toHaveValue("colour");
  await expect(second).toHaveValue("charge");
});
test("iron ion charge models fix protons and retain electron loss, including the extra loss from Fe2+ to Fe3+", async ({
  page,
}, info) => {
  await page.goto("/lessons/transition-metals");
  await page.getByRole("button", { name: "Task 2", exact: true }).click();
  const electrons = page.getByLabel("Electrons in the iron particle", {
      exact: true,
    }),
    status = page.locator(".transition-workbench [role=status]");
  await expect(electrons).toHaveValue("26");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(status).not.toHaveClass(/correct/);
  await electrons.selectOption("24");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(status).toHaveClass(/correct/);
  await expect(page.locator(".transition-ledger")).toContainText("26 protons");
  await answer(page, journey.guided[1]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await audit(page);
  await capture(
    page,
    `test-results/qa/transition-metals/transition-metals-${info.project.name}-iron-two.png`,
  );
  await page.getByRole("button", { name: "Task 3", exact: true }).click();
  await expect(electrons).toHaveValue("24");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(status).not.toHaveClass(/correct/);
  await electrons.selectOption("23");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(status).toHaveClass(/correct/);
  await answer(page, journey.guided[2]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await audit(page);
  await capture(
    page,
    `test-results/qa/transition-metals/transition-metals-${info.project.name}-iron-three.png`,
  );
  await page.reload();
  await expect(electrons).toHaveValue("23");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(electrons).toHaveValue("24");
});
test("catalyst graph and supplied table distinguish early amounts from completed identical-reactant amounts", async ({
  page,
}, info) => {
  await page.goto("/lessons/transition-metals");
  await page.getByRole("button", { name: "Task 4", exact: true }).click();
  const early = page.getByLabel("Catalysed amount at 20 s", { exact: true }),
    final = page.getByLabel("Catalysed final amount", { exact: true }),
    status = page.locator(".transition-workbench [role=status]");
  await early.selectOption("greater");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(status).not.toHaveClass(/correct/);
  await final.selectOption("same");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(status).toHaveClass(/correct/);
  await expect(status).toContainText("22 cm³ versus 14 cm³");
  await page
    .getByText("Read the supplied data as a table", { exact: true })
    .click();
  await expect(page.locator(".transition-workbench tbody tr")).toHaveCount(7);
  await expect(
    page.locator(".transition-workbench tbody tr").last(),
  ).toHaveText("602424");
  await answer(page, journey.guided[3]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  const renderedLabels = await page
    .locator(".transition-workbench svg text")
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const el = node as SVGGraphicsElement;
        return (
          parseFloat(getComputedStyle(el).fontSize) *
          Math.abs(el.getScreenCTM()!.a)
        );
      }),
    );
  expect(Math.min(...renderedLabels)).toBeGreaterThanOrEqual(12);
  await audit(page);
  await capture(
    page,
    `test-results/qa/transition-metals/transition-metals-${info.project.name}-catalyst.png`,
  );
  await page.reload();
  await expect(early).toHaveValue("greater");
  await expect(final).toHaveValue("same");
});
test("all thirteen practice tasks work, physical-property recovery returns to the draft and written work remains self-reviewed", async ({
  page,
}, info) => {
  await page.goto("/lessons/transition-metals");
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  for (let i = 0; i < journey.practice.length; i++) {
    if (i) await chooseTask(page, i + 1);
    await expect(page.locator(".transition-workbench")).toHaveCount(0);
    if (i === 0) {
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
    await expect(page.getByRole("status")).toContainText(
      journey.practice[i].rubric ? "Compare your explanation" : "That’s right",
    );
    if (journey.practice[i].rubric) {
      await audit(page);
      await capture(
        page,
        `test-results/qa/transition-metals/transition-metals-${info.project.name}-explanation.png`,
      );
      const attempts = await page.evaluate(
        ({ key, id }) =>
          JSON.parse(localStorage.getItem(key)!).work["transition-metals"]
            .attempts[id],
        { key: STORAGE_KEY, id: journey.practice[i].id },
      );
      expect(attempts.at(-1).correct).toBe(false);
    }
  }
});
test("five-item reserved checks lock drafts and defer results, and distinct two-item review forms require seven days", async ({
  page,
}) => {
  await page.goto("/lessons/transition-metals");
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
    await expect(page.getByText("That’s right.", { exact: true })).toHaveCount(
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
    page.getByRole("heading", { name: "5 of 5 correct", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
  await page.evaluate(
    ({ key, delay }) => {
      const data = JSON.parse(localStorage.getItem(key)!);
      data.work["transition-metals"].history[0].submitted =
        Date.now() - delay - 1000;
      data.work["transition-metals"].run.submitted = Date.now() - delay - 1000;
      localStorage.setItem(key, JSON.stringify(data));
    },
    { key: STORAGE_KEY, delay: REVIEW_DELAY },
  );
  await page.reload();
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
    page.getByRole("heading", { name: "2 of 2 correct", exact: true }),
  ).toBeVisible();
});
