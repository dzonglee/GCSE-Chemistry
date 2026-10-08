import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { STORAGE_KEY, emptyProgress } from "../src/lib/progress";
import { papers } from "../src/content/assessments";
import fs from "node:fs";
async function saved(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function start(page: Page, slug: string) {
  await page.goto(`/exams/${slug}`);
  await page
    .getByRole("button", { name: "Start paper →", exact: true })
    .click();
}
async function pick(page: Page, n: number) {
  await page
    .getByRole("button", { name: `Question ${n}`, exact: true })
    .click();
}
async function record(page: Page) {
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await saved(page);
}
async function responses(page: Page, id: string) {
  return page.evaluate(
    ({ key, id }) =>
      JSON.parse(localStorage.getItem(key)!).work[id].run.responses,
    { key: STORAGE_KEY, id },
  );
}
test("relabelled short theory is repeated evidence while changed numerical inputs remain fresh and old responses stay locked", async ({
  page,
}, info) => {
  await start(page, "paper-1");
  await page.getByLabel("Your answer", { exact: true }).fill("15");
  await record(page);
  await pick(page, 3);
  await page
    .getByRole("radio", { name: "Weak intermolecular forces", exact: true })
    .check();
  await record(page);
  const original = await responses(page, "assessment-paper-1");
  expect(original["paper-0-2"].fresh).toBe(true);
  await start(page, "paper-2");
  await page.getByLabel("Your answer", { exact: true }).fill("16");
  await record(page);
  await pick(page, 3);
  await page
    .getByRole("radio", { name: "Weak intermolecular forces", exact: true })
    .check();
  await record(page);
  const next = await responses(page, "assessment-paper-2");
  expect(next["paper-1-0"].fresh).toBe(true);
  expect(next["paper-1-2"].fresh).toBe(false);
  expect(await responses(page, "assessment-paper-1")).toEqual(original);
  await expect(
    page.locator(".assessment-results,.assessment-review-criteria"),
  ).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("radio", {
      name: "Weak intermolecular forces",
      exact: true,
    }),
  ).toBeDisabled();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  fs.mkdirSync("test-results/qa/assessment-exposure", { recursive: true });
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    scrollTo(0, 0);
  });
  await page.screenshot({
    path: `test-results/qa/assessment-exposure/${info.project.name}-repeated-theory.png`,
    fullPage: true,
  });
});
test("native graphene exposure prevents a short-paper conduction question becoming fresh", async ({
  page,
}) => {
  await page.goto("/lessons/graphene");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await saved(page);
  await start(page, "higher-paper-1");
  await pick(page, 2);
  const q = papers.find((p) => p.slug === "higher-paper-1")!.questions[1];
  await page.getByRole("radio", { name: q.answer, exact: true }).check();
  await record(page);
  expect(
    (await responses(page, "assessment-higher-paper-1"))["higher-paper-0-1"]
      .fresh,
  ).toBe(false);
});
test("a short paper carries its original conduction identity into a native independent check", async ({
  page,
}) => {
  await start(page, "higher-paper-1");
  await saved(page);
  await page.goto("/lessons/graphene");
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  await pick(page, 3);
  await page
    .getByRole("radio", {
      name: "Mobile delocalised electrons carry charge",
      exact: true,
    })
    .check();
  await record(page);
  expect((await responses(page, "graphene"))["ge-v1-ca-conduction"].fresh).toBe(
    false,
  );
});
test("an old original seen record preserves its timestamp and blocks false freshness in a later form", async ({
  page,
}) => {
  const p = emptyProgress();
  p.seen["paper-0-2"] = 1700000000000;
  const raw = JSON.stringify(p);
  await page.addInitScript(
    ({ key, raw }) => {
      if (localStorage.getItem(key) === null) localStorage.setItem(key, raw);
    },
    { key: STORAGE_KEY, raw },
  );
  await page.goto("/exams/paper-4");
  await expect(
    page.getByRole("button", { name: "Start paper →", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe(raw);
  await page
    .getByRole("button", { name: "Start paper →", exact: true })
    .click();
  await pick(page, 3);
  await page
    .getByRole("radio", { name: "Weak intermolecular forces", exact: true })
    .check();
  await record(page);
  expect((await responses(page, "assessment-paper-4"))["paper-3-2"].fresh).toBe(
    false,
  );
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).seen["paper-0-2"],
      STORAGE_KEY,
    ),
  ).toBe(1700000000000);
});
test("actual Chemistry-only short sets display scope while common sets retain their intended context", async ({
  page,
}) => {
  for (const [route, separate] of [
    ["/diagnostics/foundation", true],
    ["/diagnostics/higher", false],
    ["/exams/paper-1", false],
    ["/exams/higher-paper-1", true],
  ] as const) {
    await page.goto(route);
    await expect(page.locator(".sample-course-scope")).toHaveCount(
      separate ? 1 : 0,
    );
    if (separate)
      await expect(page.locator(".sample-course-scope")).toHaveText(
        "Chemistry only",
      );
  }
});
