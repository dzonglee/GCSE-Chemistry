import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { fullPapers } from "../src/content/full-assessments";
import { diagnostics, papers } from "../src/content/assessments";
import { extendedPapers } from "../src/content/extended-assessments";
import { emptyProgress, emptyWork, STORAGE_KEY } from "../src/lib/progress";
const boards = [
  { id: "AQA", label: "AQA · 8462", marks: 100 },
  { id: "Edexcel", label: "Pearson Edexcel · 1CH0", marks: 100 },
  { id: "OCR", label: "OCR Gateway Science A · J248", marks: 90 },
];
async function settled(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => sessionStorage.getItem("gcse-chemistry.pending.v1")),
    )
    .toBeNull();
  await page.evaluate(async () => {
    await document.fonts.ready;
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    scrollTo(0, 0);
    await new Promise<void>((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r())),
    );
  });
}
async function noOverflow(page: Page) {
  const width = page.viewportSize()!.width;
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
    `${page.url()} at ${width}px`,
  ).toBeLessThanOrEqual(width);
}

test("twelve original components are grouped by actual specification and tier at320,390,1280", async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/exams");
    await settled(page);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Practice papers",
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.locator(".paper-board-section")).toHaveCount(3);
    await expect(
      page.locator(".paper-board-section .assessment-card"),
    ).toHaveCount(12);
    await expect(page.locator(".paper-catalogue-scope")).toContainText(
      "two Foundation components and two Higher components",
    );
    for (const board of boards) {
      const region = page.getByRole("region", {
        name: board.label,
        exact: true,
      });
      await expect(
        region.getByRole("heading", {
          level: 2,
          name: board.label,
          exact: true,
        }),
      ).toBeVisible();
      await expect(region.locator(":scope > p")).toHaveText(
        `${board.marks} marks per paper · 105 minutes · Calculator allowed`,
      );
      for (const tier of ["foundation", "higher"] as const) {
        const group = region.getByRole("region", {
          name: `${board.label} ${tier === "higher" ? "Higher" : "Foundation"}`,
          exact: true,
        });
        await expect(group.locator(".assessment-card")).toHaveCount(2);
        for (const item of fullPapers.filter(
          (p) => p.examPaper?.basis?.board === board.id && p.tier === tier,
        )) {
          const card = group.locator(
            `a.assessment-card[href="/exams/${item.slug}"]`,
          );
          await expect(
            card.getByRole("heading", {
              level: 4,
              name: item.title,
              exact: true,
            }),
          ).toBeVisible();
          await expect(card.locator(".topic-card-foot")).toContainText(
            `${item.questions.length} parts`,
          );
          await expect(card.locator(".eyebrow")).toContainText(
            `${item.minutes} minutes · ${item.examPaper!.totalMarks} marks`,
          );
          const box = (await card.boundingBox())!;
          expect(box.width).toBeGreaterThan(200);
        }
      }
    }
    for (const item of [...extendedPapers, ...papers])
      await expect(
        page.locator(`a.assessment-card[href="/exams/${item.slug}"]`),
      ).toHaveCount(1);
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Cumulative sets",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Short topic mixes",
        exact: true,
      }),
    ).toBeVisible();
    await noOverflow(page);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
});
test("each of the12 components opens its own cold paper with the correct marks and sealed answers", async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const item of fullPapers) {
    await page.goto(`/exams/${item.slug}`);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: item.shortTitle,
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText(
        `${item.examPaper!.totalMarks} marks · ${item.minutes} minutes · Calculator allowed · Original practice paper`,
        { exact: true },
      ),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Start without a timer →", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: item.questions[0].title, exact: true }),
    ).toBeVisible();
    await expect(
      page.locator(".paper-reference,.assessment-results"),
    ).toHaveCount(0);
    await settled(page);
    await noOverflow(page);
    const run = await page.evaluate(
      ({ key, id }) => JSON.parse(localStorage.getItem(key)!).work[id].run,
      { key: STORAGE_KEY, id: `assessment-${item.slug}` },
    );
    expect(run.ids).toEqual(item.questions.map((q) => q.id));
    expect(run.index).toBe(0);
    expect(run.responses).toEqual({});
  }
});
test("catalogue navigation preserves exact drafts and component identity for every board at each width", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto("/exams");
  await settled(page);
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    for (const board of boards) {
      const item = fullPapers.find(
        (p) => p.examPaper?.basis?.board === board.id && p.tier === "higher",
      )!;
      const state = emptyProgress(),
        work = emptyWork(),
        at = 1700000000000;
      state.preferences = {
        board: board.id as "AQA" | "Edexcel" | "OCR",
        course: "separate",
        tier: "higher",
      };
      work.run = {
        kind: "paper",
        ids: item.questions.map((q) => q.id),
        index: 1,
        started: at,
        responses: {
          [item.questions[0].id]: {
            answer: "Retained raw draft 12.40",
            working: "My own unfinished working",
            correct: false,
            fresh: false,
            helped: false,
            at,
          },
        },
      };
      state.work[`assessment-${item.slug}`] = work;
      await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
        key: STORAGE_KEY,
        raw: JSON.stringify(state),
      });
      await page.goto("/exams");
      await settled(page);
      const card = page.locator(
        `a.assessment-card[href="/exams/${item.slug}"]`,
      );
      await expect(card.locator(".topic-card-foot")).toContainText(
        "Resume your paper",
      );
      await card.click();
      await expect(
        page.getByRole("heading", {
          name: item.questions[1].title,
          exact: true,
        }),
      ).toBeVisible();
      await settled(page);
      const retained = await page.evaluate(
        ({ key, id }) => JSON.parse(localStorage.getItem(key)!).work[id].run,
        { key: STORAGE_KEY, id: `assessment-${item.slug}` },
      );
      expect(retained).toEqual(work.run);
      await noOverflow(page);
    }
  }
});
test("keyboard opens a real full component and diagnostics keep their separate format", async ({
  page,
}) => {
  const originalViewport = page.viewportSize()!;
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/exams");
    await settled(page);
    for (const [label, id] of [
      ["OCR Gateway J248", "full-board-OCR"],
      ["Cumulative sets", "cumulative-sets"],
      ["Short topic mixes", "short-topic-mixes"],
    ]) {
      await page.getByRole("link", { name: label, exact: true }).focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      const heading = page.locator(`#${id}`);
      await expect(heading).toBeInViewport();
      await page.evaluate(
        () =>
          new Promise<void>((r) =>
            requestAnimationFrame(() => requestAnimationFrame(() => r())),
          ),
      );
      const target = (await heading.boundingBox())!,
        bar = await page.locator(".mobile-bar").boundingBox();
      expect(target.y, `${label} at${width}px`).toBeGreaterThanOrEqual(
        (bar ? bar.y + bar.height : 0) + 8,
      );
      await noOverflow(page);
    }
  }
  await page.setViewportSize(originalViewport);
  await page.goto("/exams");
  await settled(page);
  const link = page.locator(
    `a.assessment-card[href="/exams/${fullPapers[0].slug}"]`,
  );
  await link.focus();
  await expect(link).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Start without a timer →", exact: true }),
  ).toBeVisible();
  await page.goto("/diagnostics");
  await settled(page);
  await expect(page.locator(".paper-board-section")).toHaveCount(0);
  for (const item of diagnostics)
    await expect(
      page.getByRole("heading", { level: 2, name: item.title, exact: true }),
    ).toBeVisible();
  await expect(page.locator(".assessment-card")).toHaveCount(
    diagnostics.length,
  );
  await noOverflow(page);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
