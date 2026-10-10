import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { materialsJourney as j } from "../src/content/journeys/materials-and-corrosion";
import {
  emptyProgress,
  emptyWork,
  STORAGE_KEY,
  REVIEW_DELAY,
} from "../src/lib/progress";
const slug = "materials-and-corrosion",
  route = `/lessons/${slug}`,
  prefix = "materials-v1-rust-design-";
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
    (document.activeElement as HTMLElement)?.blur();
    scrollTo({ top: 0, left: 0, behavior: "instant" });
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );
  });
  const box = (await p.locator(selector).first().boundingBox())!;
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(box.y + box.height).toBeLessThanOrEqual(664);
  expect(
    await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true);
  expect((await new AxeBuilder({ page: p }).analyze()).violations).toEqual([]);
}
for (const width of [320, 390, 1280])
  test(`fonts-ready ${width}: every new rust-design response fits and retains raw writing`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width, height: 664 });
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
          ? j.checkForms.find((f) => f[0].id.startsWith(prefix))!
          : stage === "review"
            ? j.reviewForms.find((f) => f[0].id.startsWith(prefix))!
            : j[stage];
      for (let i = 0; i < form.length; i++) {
        const q = form[i];
        if (!q.id.startsWith(prefix)) continue;
        const p = emptyProgress(),
          w = emptyWork();
        p.preferences.course = "separate";
        if (stage === "check" || stage === "review") {
          w.section = stage;
          w.run = {
            kind: stage,
            ids: form.map((t) => t.id),
            index: i,
            started: Date.now(),
            responses: {},
          };
        } else {
          w.section = stage === "practice" ? "practice" : "explore";
          w.learning = { version: 1, stage, index: i };
        }
        const raw = "Oil alone removes oxygen.\nUse different nails.  ";
        if (q.rubric) w.drafts[q.id] = raw;
        p.work[slug] = w;
        await settled(page);
        await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
          key: STORAGE_KEY,
          raw: JSON.stringify(p),
        });
        await page.reload();
        await page
          .getByRole("heading", {
            name:
              (stage === "check" || stage === "review") && !q.conciseHeading
                ? q.prompt
                : q.title,
            exact: true,
          })
          .waitFor();
        await layout(
          page,
          q.rubric
            ? ".written-answer textarea"
            : ".materials-workbench [data-field]",
        );
        if (q.rubric) {
          await expect(page.locator(".written-answer textarea")).toHaveValue(
            raw,
          );
          if (q.shortWritten)
            await expect(
              page.getByRole("textbox", {
                name: "Your explanation",
                exact: true,
              }),
            ).toBeVisible();
        }
        if (stage === "check" || stage === "review")
          await expect(
            page.locator(".assessment-review-criteria,.sample-reference"),
          ).toHaveCount(0);
      }
    }
  });

test("actual experiment-design check seals references, retains wrong plans and requires seven real days", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  const p = emptyProgress(),
    w = emptyWork();
  p.preferences.course = "separate";
  p.seen["materials-v1-p-rust"] = Date.now();
  w.section = "check";
  // Completed original forms are fixture history, not replacement content.
  w.history = [];
  for (const [i, form] of j.checkForms.slice(0, 3).entries()) {
    const at = Date.now() - (60 - i * 14) * 24 * 60 * 60 * 1000;
    w.history.push({
      kind: "check",
      ids: form.map((q) => q.id),
      index: form.length - 1,
      started: at - 1000,
      submitted: at,
      responses: Object.fromEntries(
        form.map((q) => [
          q.id,
          {
            answer: q.answer,
            correct: !q.rubric,
            helped: false,
            fresh: false,
            at,
          },
        ]),
      ),
    });
    const review = j.reviewForms[i],
      ra = at + REVIEW_DELAY;
    w.history.push({
      kind: "review",
      ids: review.map((q) => q.id),
      index: review.length - 1,
      started: ra - 1000,
      submitted: ra,
      responses: Object.fromEntries(
        review.map((q) => [
          q.id,
          {
            answer: q.answer,
            correct: !q.rubric,
            helped: false,
            fresh: false,
            at: ra,
          },
        ]),
      ),
    });
  }
  const original = JSON.stringify(w.history);
  p.work[slug] = w;
  await page.goto(route);
  await page.locator(".sample-task-panel").waitFor();
  await settled(page);
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
    key: STORAGE_KEY,
    raw: JSON.stringify(p),
  });
  await page.reload();
  const tap = async (name: string) => {
    const b = page.getByRole("button", { name, exact: true });
    if (info.project.name === "mobile") await b.tap();
    else await b.click();
  };
  await tap("Start understanding check →");
  const form = j.checkForms.find((f) => f[0].id.startsWith(prefix))!;
  const work = () =>
    page.evaluate(
      ({ key, slug }) => JSON.parse(localStorage.getItem(key)!).work[slug],
      { key: STORAGE_KEY, slug },
    );
  expect((await work()).run.ids).toEqual(form.map((q) => q.id));
  for (const q of form)
    expect((await work()).drafts["fresh:" + q.id]).toBe("false");
  await tap("Record answer");
  await settled(page);
  expect((await work()).run.responses[form[0].id]).toBeUndefined();
  const wrong = "Oil alone removes oxygen.\nUse different nails.  ",
    answers: Record<string, string> = {};
  for (const [i, q] of form.entries()) {
    await page.getByRole("heading", { name: q.title, exact: true }).waitFor();
    const raw = i === 0 ? wrong : q.answer;
    answers[q.id] = raw;
    await page
      .getByRole("textbox", { name: "Your explanation", exact: true })
      .fill(raw);
    await settled(page);
    if (i === 0) {
      await page.reload();
      await expect(
        page.getByRole("textbox", { name: "Your explanation", exact: true }),
      ).toHaveValue(wrong);
    }
    await expect(
      page.locator(".assessment-review-criteria,.sample-reference"),
    ).toHaveCount(0);
    await tap("Record answer");
    await settled(page);
    expect((await work()).run.responses[q.id]).toMatchObject({
      answer: raw,
      correct: false,
      fresh: false,
    });
    if (i < form.length - 1) await tap("Next question →");
  }
  await expect(
    page.locator(".assessment-review-criteria,.sample-reference"),
  ).toHaveCount(0);
  await tap("Submit whole set");
  await settled(page);
  const row = page.locator(".results-list > details").first();
  await row.locator(":scope > summary").click();
  await expect(row).toContainText("wet-air positive comparison");
  await expect(row).toContainText("Scientifically valid alternative");
  const history = (await work()).history;
  expect(JSON.stringify(history.slice(0, 6))).toBe(original);
  for (const q of form)
    expect(history.at(-1).responses[q.id]).toMatchObject({
      answer: answers[q.id],
      correct: false,
      fresh: false,
    });
  await page.reload();
  expect((await work()).history.at(-1).responses[form[0].id].answer).toBe(
    wrong,
  );
  await tap("Review");
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toHaveCount(0);
  await page.clock.install({ time: Date.now() + REVIEW_DELAY + 1000 });
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Start review →", exact: true }),
  ).toBeEnabled();
  await tap("Start review →");
  const delayed = j.reviewForms.find((f) => f[0].id.startsWith(prefix))!;
  expect((await work()).run.ids).toEqual(delayed.map((q) => q.id));
  await expect(
    page.locator(".assessment-review-criteria,.sample-reference"),
  ).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "Your explanation", exact: true })
    .fill("Keep suitable oxygen-free water under an oxygen-free atmosphere.");
  await settled(page);
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Your explanation", exact: true }),
  ).toHaveValue(
    "Keep suitable oxygen-free water under an oxygen-free atmosphere.",
  );
  for (const [i, q] of delayed.entries()) {
    await page.getByRole("heading", { name: q.title, exact: true }).waitFor();
    const raw =
      i === 0
        ? "Keep suitable oxygen-free water under an oxygen-free atmosphere."
        : q.answer;
    await page
      .getByRole("textbox", { name: "Your explanation", exact: true })
      .fill(raw);
    await expect(
      page.locator(".assessment-review-criteria,.sample-reference"),
    ).toHaveCount(0);
    await tap("Record answer");
    await settled(page);
    expect((await work()).run.responses[q.id]).toMatchObject({
      answer: raw,
      correct: false,
      fresh: false,
    });
    if (i < delayed.length - 1) await tap("Next question →");
  }
  await tap("Submit whole set");
  await settled(page);
  const delayedRow = page.locator(".results-list > details").first();
  await delayedRow.locator(":scope > summary").click();
  await expect(delayedRow).toContainText("genuinely dry air");
  expect((await work()).history.at(-1).responses[delayed[0].id].answer).toBe(
    "Keep suitable oxygen-free water under an oxygen-free atmosphere.",
  );
  expect(JSON.stringify((await work()).history.slice(0, 6))).toBe(original);
});
