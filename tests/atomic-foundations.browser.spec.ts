import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { lessons } from "../src/content/curriculum";
import { atomicFoundations as a } from "../src/content/journeys/atomic-foundations";
import type { Question } from "../src/content/types";
import { STORAGE_KEY, REVIEW_DELAY } from "../src/lib/progress";
const journey = lessons.find((l) => l.slug === "inside-an-atom")!.journey!;
const path = "/lessons/inside-an-atom";
const shots = "test-results/qa/atomic-foundations";
async function opening(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    window.scrollTo(0, 0);
  });
  const target = page
    .locator(
      ".question-panel .answer-option, .question-panel input, .question-panel textarea",
    )
    .first();
  const box = (await target.boundingBox())!;
  expect.soft(box.height).toBeGreaterThanOrEqual(44);
  expect.soft(box.y + box.height).toBeLessThanOrEqual(664);
  expect
    .soft(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    )
    .toBe(true);
}
async function answer(page: Page, q: Question) {
  if (q.parts)
    for (const part of q.parts)
      await page
        .getByLabel(part.label, { exact: true })
        .fill(String(part.answer));
  else if (q.rubric)
    await page
      .getByLabel("Your explanation", { exact: true })
      .fill("The physical change splits the compound into its elements.");
  else if (q.options)
    await page.getByRole("radio", { name: q.answer, exact: true }).check();
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
async function screenshot(page: Page, name: string) {
  await mkdir(shots, { recursive: true });
  await page.evaluate(async () => {
    await document.fonts.ready;
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({
    path: `${shots}/${name}.png`,
    fullPage: !name.endsWith("-opening"),
  });
}

test("new guided activities manipulate a sodium atom and inspect actual water/carbon dioxide models", async ({
  page,
}, info) => {
  await page.goto(path);
  await page.getByRole("button", { name: "Task 4", exact: true }).click();
  const host = page.getByRole("group", {
    name: "Rotate the 3D atom",
    exact: true,
  });
  await expect(page.locator(".atom-scene")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await expect(host).toHaveAttribute("data-particles", "10,10,10");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(page.locator(".task-workbench [role=status]")).toContainText(
    "proton",
  );
  await page.getByRole("button", { name: "Add proton", exact: true }).click();
  await page.getByRole("button", { name: "Add neutron", exact: true }).click();
  await page.getByRole("button", { name: "Add neutron", exact: true }).click();
  await page.getByRole("button", { name: "Add electron", exact: true }).click();
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await expect(host).toHaveAttribute("data-particles", "11,12,11");
  await page.getByText("First 20 elements reference", { exact: true }).click();
  const table = page.locator(".symbol-reference table");
  await expect(table.locator("tbody tr")).toHaveCount(20);
  await expect(table.locator("thead th")).toHaveCount(2);
  await expect(table.locator("tbody tr").nth(10)).toContainText("Sodium (Na)");
  expect(
    await table
      .locator("td")
      .first()
      .evaluate((e) => parseFloat(getComputedStyle(e).fontSize)),
  ).toBeGreaterThanOrEqual(14);
  await page.getByText("First 20 elements reference", { exact: true }).click();
  await answer(page, a.guided[0]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "not a real chemical conversion",
  );
  await page.reload();
  await expect(host).toHaveAttribute("data-particles", "11,12,11");
  await screenshot(page, `${info.project.name}-sodium`);
  await page.getByRole("button", { name: "Task 5", exact: true }).click();
  const molecule = page.getByRole("group", {
    name: "Rotate covalent molecule",
    exact: true,
  });
  await expect(molecule).toHaveAttribute("data-ready", "true");
  await page
    .getByLabel("Inspect a formula", { exact: true })
    .selectOption("CO2");
  await page.getByLabel("Your C count", { exact: true }).selectOption("1");
  await page.getByLabel("Your O count", { exact: true }).selectOption("2");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await page
    .getByLabel("Inspect a formula", { exact: true })
    .selectOption("H2O");
  await page.getByLabel("Your H count", { exact: true }).selectOption("2");
  await page.getByLabel("Your O count", { exact: true }).selectOption("1");
  await page.getByRole("button", { name: "Check model", exact: true }).click();
  await answer(page, a.guided[1]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "fixed proportions",
  );
  await screenshot(page, `${info.project.name}-water`);
  await page.getByRole("button", { name: "Task 6", exact: true }).click();
  await answer(page, a.guided[2]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "chemical reaction",
  );
});

test("new practice retains malformed counts and gives targeted recovery and honest manual comparison", async ({
  page,
}, info) => {
  await page.goto(path);
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await page.getByRole("button", { name: "Task 7", exact: true }).click();
  await page.getByRole("radio", { name: "A compound", exact: true }).check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .locator(".question-panel")
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByText(a.refresher[2].prompt, { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(
    page.getByRole("radio", { name: "A compound", exact: true }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Task 8", exact: true }).click();
  await page.getByRole("radio", { name: "SI", exact: true }).check();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .locator(".question-panel")
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByText(a.refresher[0].prompt, { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(
    page.getByRole("radio", { name: "SI", exact: true }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Task 9", exact: true }).click();
  await page.getByLabel("Nitrogen atoms", { exact: true }).fill("1..2");
  await page.getByLabel("Oxygen atoms", { exact: true }).fill("2");
  await page.getByLabel("Different element types", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page.reload();
  await expect(page.getByLabel("Nitrogen atoms", { exact: true })).toHaveValue(
    "1..2",
  );
  await answer(page, a.practice[2]);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "That’s right",
  );
  await page.getByLabel("Different element types", { exact: true }).fill("3");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .locator(".question-panel")
    .getByRole("button", { name: "Revisit the key idea", exact: true })
    .click();
  await expect(
    page.getByText(a.refresher[3].prompt, { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to your task →", exact: true })
    .click();
  await expect(
    page.getByLabel("Different element types", { exact: true }),
  ).toHaveValue("3");
  await page.getByRole("button", { name: "Task 11", exact: true }).click();
  await expect(
    page.getByText(a.practice[4].rubric![0], { exact: true }),
  ).toHaveCount(0);
  await answer(page, a.practice[4]);
  await page
    .getByRole("button", { name: "Save and review explanation", exact: true })
    .click();
  await expect(page.locator(".question-panel .feedback")).toContainText(
    "not an automatic mark",
  );
  await screenshot(page, `${info.project.name}-boiling-review`);
});

test("the appended sealed check retains original forms and raw mistakes without revealing answers early", async ({
  page,
}, info) => {
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(path);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  for (const form of journey.checkForms.slice(0, 2)) {
    await complete(page, form);
    await expect(
      page.getByRole("heading", { name: "3 of 3 correct", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Try the next form", exact: true })
      .click();
  }
  for (let i = 0; i < a.check.length; i++) {
    const q = a.check[i];
    await opening(page);
    await expect(page.getByText(q.explanation, { exact: true })).toHaveCount(0);
    await expect(
      page.getByRole("region", { name: "Task model", exact: true }),
    ).toHaveCount(0);
    if (i === 1) {
      await page
        .getByText("First 20 elements reference", { exact: true })
        .click();
      await expect(page.locator(".symbol-reference tbody tr")).toHaveCount(20);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await page
        .getByText("First 20 elements reference", { exact: true })
        .click();
    }
    if (i === 2) {
      await page.getByLabel("Nitrogen atoms", { exact: true }).fill("1..2");
      await page.getByLabel("Hydrogen atoms", { exact: true }).fill("2");
      await page
        .getByLabel("Different element types", { exact: true })
        .fill("2");
      await page
        .getByRole("button", { name: "Record answer", exact: true })
        .click();
      await page.reload();
      await expect(
        page.getByLabel("Nitrogen atoms", { exact: true }),
      ).toHaveValue("1..2");
      await page.getByLabel("Nitrogen atoms", { exact: true }).fill("1");
    } else await answer(page, q);
    await page
      .getByRole("button", { name: "Record answer", exact: true })
      .click();
    if (i < a.check.length - 1)
      await page
        .getByRole("button", { name: "Next question →", exact: true })
        .click();
  }
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "3 of 4 correct", exact: true }),
  ).toBeVisible();
  await screenshot(page, `${info.project.name}-sealed-check`);
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key)!).work["inside-an-atom"].history
            .length,
        STORAGE_KEY,
      ),
    )
    .toBe(3);
});

test("all added teaching responses fit narrow openings and their stages remain accessible", async ({
  page,
}, info) => {
  test.setTimeout(90000);
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 720 });
    for (const [stage, start, tasks] of [
      ["Warm-up", 2, a.warmup],
      ["Revisit the key idea", 3, a.refresher],
      ["Learn", 3, a.guided],
      ["Practise", 6, a.practice],
    ] as const) {
      await page.goto(path);
      if (stage === "Revisit the key idea")
        await page.getByRole("button", { name: "Check", exact: true }).click();
      await page.getByRole("button", { name: stage, exact: true }).click();
      for (let i = 0; i < tasks.length; i++) {
        await page
          .getByRole("button", { name: `Task ${start + i + 1}`, exact: true })
          .click();
        await page.evaluate(async () => {
          await document.fonts.ready;
          window.scrollTo(0, 0);
        });
        const target = tasks[i].model
          ? page
              .locator(".task-workbench button, .task-workbench select")
              .first()
          : page
              .locator(
                ".question-panel .answer-option, .question-panel input, .question-panel textarea",
              )
              .first();
        await expect(target).toBeVisible();
        const box = (await target.boundingBox())!;
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.y + box.height).toBeLessThanOrEqual(664);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
      }
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    }
    await screenshot(page, `${info.project.name}-${width}-opening`);
  }
});

test("the third delayed form remains separate and waits seven days between review submissions", async ({
  page,
}, info) => {
  if (info.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(path);
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await complete(page, journey.checkForms[0]);
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Review", exact: true }).click();
    await expect
      .poll(() =>
        page.evaluate(() =>
          sessionStorage.getItem("gcse-chemistry.pending.v1"),
        ),
      )
      .toBeNull();
    await page.evaluate(
      ({ key, delay }) => {
        const p = JSON.parse(localStorage.getItem(key)!);
        for (const run of p.work["inside-an-atom"].history)
          run.submitted = Date.now() - delay - 1000;
        p.work["inside-an-atom"].run.submitted = Date.now() - delay - 1000;
        localStorage.setItem(key, JSON.stringify(p));
      },
      { key: STORAGE_KEY, delay: REVIEW_DELAY },
    );
    await page.reload();
    await page
      .getByRole("button", {
        name: i === 0 ? "Start review →" : "Try the next form",
        exact: true,
      })
      .click();
    if (i < 2) await complete(page, journey.reviewForms[i]);
    else {
      for (let k = 0; k < a.review.length; k++) {
        await opening(page);
        await answer(page, a.review[k]);
        await page
          .getByRole("button", { name: "Record answer", exact: true })
          .click();
        if (k < a.review.length - 1)
          await page
            .getByRole("button", { name: "Next question →", exact: true })
            .click();
      }
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await page
        .getByRole("button", { name: "Submit whole set", exact: true })
        .click();
    }
    await expect(
      page.getByRole("heading", {
        name: `${i === 2 ? 3 : 2} of ${i === 2 ? 3 : 2} correct`,
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Try the next form", exact: true }),
    ).toBeDisabled();
  }
});
