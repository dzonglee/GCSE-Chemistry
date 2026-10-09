import { test, expect, devices, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { solubleSaltsJourney as j } from "../src/content/journeys/making-soluble-salts";
import {
  emptyProgress,
  emptyWork,
  STORAGE_KEY,
  REVIEW_DELAY,
} from "../src/lib/progress";
const slug = "making-soluble-salts",
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
  for (const stage of [
    "warmup",
    "refresher",
    "guided",
    "practice",
    "check",
    "review",
  ] as const)
    test(`fonts-ready ${width} ${stage}: every salt task has a complete readable opening`, async ({
      browser,
    }) => {
      test.setTimeout(120000);
      const context = await browser.newContext({
        ...(width < 600 ? devices["iPhone 13"] : {}),
        viewport: { width, height: 720 },
      });
      try {
        const page = await context.newPage();
        await page.goto(route);
        await page.locator(".sample-task-panel").waitFor();
        await page.evaluate(async () => {
          await document.fonts.ready;
          await new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          );
        });
        await settled(page);
        const assessment = stage === "check" || stage === "review";
        const forms =
          stage === "check"
            ? j.checkForms
            : stage === "review"
              ? j.reviewForms
              : [j[stage]];
        for (const form of forms)
          for (const q of form) {
            const p = emptyProgress(),
              w = emptyWork();
            if (assessment) {
              w.section = stage;
              w.run = {
                kind: stage,
                ids: form.map((task) => task.id),
                index: form.indexOf(q),
                started: Date.now(),
                responses: {},
              };
            } else {
              w.section = stage === "practice" ? "practice" : "explore";
              w.learning = { version: 1, stage, index: j[stage].indexOf(q) };
            }
            if (q.rubric) w.drafts[q.id] = "Retained unfinished method 1/2";
            p.work[slug] = w;
            await settled(page);
            await page.evaluate(
              ({ key, raw }) => localStorage.setItem(key, raw),
              { key: STORAGE_KEY, raw: JSON.stringify(p) },
            );
            await page.reload();
            const nativeModel =
              !!q.model && (stage === "guided" || stage === "refresher");
            const selector = nativeModel
              ? ".salt-workbench select, .salt-workbench input, .salt-workbench button"
              : q.rubric
                ? ".written-answer textarea"
                : q.options
                  ? ".answer-option"
                  : ".question-panel input";
            await test.step(q.id, async () => {
              await layout(page, selector);
              await expect(
                page.getByText("A previous pending draft conflicted", {
                  exact: false,
                }),
              ).toHaveCount(0);
            });
            if (q.rubric)
              await expect(
                page.locator(".written-answer textarea"),
              ).toHaveValue("Retained unfinished method 1/2");
            if (assessment)
              await expect(
                page.locator(".assessment-review-criteria,.sample-reference"),
              ).toHaveCount(0);
          }
      } finally {
        await context.close();
      }
    });

test("new full-method transfer retains wrong work, seals references and respects the actual seven-day review", async ({
  page,
}) => {
  const p = emptyProgress(),
    w = emptyWork(),
    q = j.checkForms[2][0];
  p.seen["ss-v1-p-method-write"] = Date.now();
  w.section = "check";
  w.history = j.checkForms.slice(0, 2).map((form, i) => ({
    kind: "check" as const,
    ids: form.map((task) => task.id),
    index: form.length - 1,
    started: Date.now() - 8000 + i * 1000,
    submitted: Date.now() - 6000 + i * 1000,
    responses: Object.fromEntries(
      form.map((task) => [
        task.id,
        {
          answer: task.answer,
          correct: !task.rubric,
          helped: false,
          fresh: false,
          at: Date.now() - 7000 + i * 1000,
        },
      ]),
    ),
  }));
  p.work[slug] = w;
  await page.goto(route);
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
    key: STORAGE_KEY,
    raw: JSON.stringify(p),
  });
  await page.reload();
  await page
    .getByRole("button", { name: "Start understanding check →", exact: true })
    .click();
  const wrong =
    "Filter the acid away, boil every drop dry and heat the crystals strongly.";
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
  await expect(
    page.getByText(
      "Compare each written response with the criteria below; no automatic score is assigned.",
      { exact: true },
    ),
  ).toBeVisible();
  const row = page.locator(".results-list > details").first();
  await row.locator(":scope > summary").click();
  await expect(row).toContainText(wrong);
  await row.locator(".sample-reference > summary").click();
  await expect(row).toContainText("Bunsen burner");
  await expect(row).toContainText("water bath or electric heater");
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
  await page.clock.setSystemTime(Date.now() + REVIEW_DELAY + 3000);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toBeEnabled();
});
