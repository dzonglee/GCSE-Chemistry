import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { atmosphereJourney as j } from "../src/content/journeys/early-atmosphere";
import {
  emptyProgress,
  emptyWork,
  STORAGE_KEY,
  REVIEW_DELAY,
} from "../src/lib/progress";
const slug = "early-atmosphere",
  route = `/lessons/${slug}`;
async function settled(p: Page) {
  await expect
    .poll(() =>
      p.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
}
async function layout(p: Page, selector: string) {
  await p.evaluate(async () => {
    await document.fonts.ready;
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    scrollTo({ top: 0, left: 0, behavior: "instant" });
    await new Promise<void>((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r())),
    );
  });
  const box = (await p.locator(selector).first().boundingBox())!;
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(box.y + box.height).toBeLessThanOrEqual(664);
  expect(
    await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true);
  for (const size of await p.locator("svg text").evaluateAll((nodes) =>
    nodes.flatMap((n) => {
      const t = n as SVGTextElement,
        box = t.getBoundingClientRect(),
        matrix = t.getScreenCTM();
      if (
        !matrix ||
        !box.width ||
        !box.height ||
        getComputedStyle(t).visibility === "hidden"
      )
        return [];
      return [
        parseFloat(getComputedStyle(t).fontSize) *
          Math.hypot(matrix.a, matrix.b),
      ];
    }),
  ))
    expect(size).toBeGreaterThanOrEqual(12);
  expect((await new AxeBuilder({ page: p }).analyze()).violations).toEqual([]);
}

for (const width of [320, 390, 1280])
  test(`fonts-ready ${width} every new minor-air response is readable and retains its raw draft`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      ...(width < 600 ? devices["iPhone 13"] : {}),
      viewport: { width, height: 720 },
    });
    try {
      const page = await context.newPage();
      await page.goto(route);
      await page.locator(".sample-task-panel").waitFor();
      await settled(page);
      for (const stage of [
        "refresher",
        "guided",
        "practice",
        "check",
        "review",
      ] as const) {
        const form =
          stage === "check"
            ? j.checkForms.at(-1)!
            : stage === "review"
              ? j.reviewForms.at(-1)!
              : j[stage];
        const q = form.at(-1)!;
        const p = emptyProgress(),
          w = emptyWork();
        if (stage === "check" || stage === "review") {
          w.section = stage;
          w.run = {
            kind: stage,
            ids: form.map((t) => t.id),
            index: 0,
            started: Date.now(),
            responses: {},
          };
        } else {
          w.section = stage === "practice" ? "practice" : "explore";
          w.learning = { version: 1, stage, index: form.length - 1 };
        }
        if (q.rubric)
          w.drafts[q.id] =
            "Nitrogen and oxygen only. Retained unfinished answer.";
        p.work[slug] = w;
        await settled(page);
        await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
          key: STORAGE_KEY,
          raw: JSON.stringify(p),
        });
        await page.reload();
        await page
          .getByRole("heading", {
            name: stage === "check" || stage === "review" ? q.prompt : q.title,
            exact: true,
          })
          .waitFor();
        await layout(
          page,
          q.rubric ? ".written-answer textarea" : ".answer-option",
        );
        if (q.rubric)
          await expect(page.locator(".written-answer textarea")).toHaveValue(
            "Nitrogen and oxygen only. Retained unfinished answer.",
          );
        if (stage === "check" || stage === "review")
          await expect(
            page.locator(".assessment-review-criteria,.sample-reference"),
          ).toHaveCount(0);
      }
    } finally {
      await context.close();
    }
  });

test("new minor-air check preserves wrong work, seals criteria and waits seven real days", async ({
  page,
}) => {
  const p = emptyProgress(),
    w = emptyWork(),
    q = j.checkForms.at(-1)![0];
  p.seen["early-atmosphere-v1-g-composition"] = Date.now();
  w.section = "check";
  w.history = j.checkForms.slice(0, 2).map((form, i) => ({
    kind: "check" as const,
    ids: form.map((t) => t.id),
    index: form.length - 1,
    started: Date.now() - 8000 + i * 1000,
    submitted: Date.now() - 6000 + i * 1000,
    responses: Object.fromEntries(
      form.map((t) => [
        t.id,
        {
          answer: t.answer,
          correct: !t.rubric,
          helped: false,
          fresh: false,
          at: Date.now() - 7000 + i * 1000,
        },
      ]),
    ),
  }));
  p.work[slug] = w;
  await page.goto(route);
  await page.locator(".sample-task-panel").waitFor();
  await settled(page);
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
    key: STORAGE_KEY,
    raw: JSON.stringify(p),
  });
  await page.reload();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  const wrong =
    "Air is nitrogen and oxygen only; the remaining dry gas is all carbon dioxide.";
  await page.locator(".written-answer textarea").fill(wrong);
  await settled(page);
  await page.reload();
  await expect(page.locator(".written-answer textarea")).toHaveValue(wrong);
  await expect(
    page.locator(".assessment-review-criteria,.sample-reference"),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Record answer", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Submit whole set", exact: true })
    .click();
  const row = page.locator(".results-list > details").first();
  await row.locator(":scope > summary").click();
  await expect(row).toContainText(wrong);
  await expect(row).toContainText("noble gases");
  await expect(row).toContainText("excluded from dry-air tables");
  await settled(page);
  const saved = await page.evaluate(
    ({ key, slug, id }) =>
      JSON.parse(localStorage.getItem(key)!).work[slug].history.at(-1)
        .responses[id],
    { key: STORAGE_KEY, slug, id: q.id },
  );
  expect(saved.answer).toBe(wrong);
  expect(saved.correct).toBe(false);
  expect(saved.fresh).toBe(false);
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  await page.clock.install({ time: Date.now() + REVIEW_DELAY + 1000 });
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toBeEnabled();
});
